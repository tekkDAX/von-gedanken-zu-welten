# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional
import sqlite3
from datetime import datetime

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import FileResponse

from .core.manager import PluginManager
from .core.config import load_config


class CommandParam(BaseModel):
    name: str
    type: str = "string"
    required: bool = False
    description: str = ""
    default: Optional[Any] = None


class CommandDesc(BaseModel):
    name: str
    description: str = ""
    params: List[CommandParam] = []


class PluginDesc(BaseModel):
    name: str
    version: Optional[str] = None
    description: str = ""
    enabled: bool = True
    commands: List[CommandDesc] = []


def get_project_root() -> Path:
    here = Path(__file__).resolve()
    return here.parent.parent.parent


def create_app() -> FastAPI:
    project_root = get_project_root()
    config = load_config(project_root)
    manager = PluginManager(project_root=project_root, config=config)
    discovered = manager.discover_plugins()

    app = FastAPI(title="Werkstatt API", version="0.1.0")

    # CORS: adjust as needed
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/plugins", response_model=List[PluginDesc])
    def list_plugins() -> List[PluginDesc]:
        result: List[PluginDesc] = []
        for rec in discovered:
            enabled = manager.is_enabled(rec.name)
            plugin = rec.instance
            commands: List[CommandDesc] = []
            if enabled and plugin and hasattr(plugin, "describe") and callable(plugin.describe):
                try:
                    desc = plugin.describe()  # type: ignore[attr-defined]
                    # Expect desc as list of dicts or CommandDesc
                    for cmd in desc or []:
                        if isinstance(cmd, dict):
                            commands.append(CommandDesc(**cmd))
                        elif isinstance(cmd, CommandDesc):
                            commands.append(cmd)
                except Exception:
                    pass
            result.append(
                PluginDesc(
                    name=rec.name,
                    version=rec.version,
                    description=rec.description or "",
                    enabled=enabled,
                    commands=commands,
                )
            )
        return result

    # --- Minimal SQLite connectivity ---
    db_path = project_root / "data" / "app.db"
    db_path.parent.mkdir(parents=True, exist_ok=True)

    def _get_conn() -> sqlite3.Connection:
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        return conn

    # Create table if not exists
    with _get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT NOT NULL,
                value TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.commit()

    class ItemIn(BaseModel):
        key: str
        value: str

    class ItemOut(BaseModel):
        id: int
        key: str
        value: str
        created_at: str

    @app.post("/db/items", response_model=ItemOut)
    def create_item(item: ItemIn) -> ItemOut:
        now = datetime.utcnow().isoformat()
        with _get_conn() as conn:
            cur = conn.execute(
                "INSERT INTO items(key, value, created_at) VALUES (?, ?, ?)",
                (item.key, item.value, now),
            )
            conn.commit()
            new_id = int(cur.lastrowid)
            row = conn.execute(
                "SELECT id, key, value, created_at FROM items WHERE id = ?",
                (new_id,),
            ).fetchone()
        return ItemOut(**dict(row))

    @app.get("/db/items", response_model=List[ItemOut])
    def list_items(limit: int = 100, offset: int = 0) -> List[ItemOut]:
        if limit < 1:
            limit = 1
        if limit > 1000:
            limit = 1000
        with _get_conn() as conn:
            rows = conn.execute(
                "SELECT id, key, value, created_at FROM items ORDER BY id DESC LIMIT ? OFFSET ?",
                (limit, offset),
            ).fetchall()
        return [ItemOut(**dict(r)) for r in rows]

    # --- Simple search over items (LIKE) ---
    @app.get("/db/search", response_model=List[ItemOut])
    def search_items(q: str, limit: int = 50, offset: int = 0) -> List[ItemOut]:
        term = f"%{q}%"
        if limit < 1:
            limit = 1
        if limit > 500:
            limit = 500
        with _get_conn() as conn:
            rows = conn.execute(
                """
                SELECT id, key, value, created_at
                FROM items
                WHERE key LIKE ? OR value LIKE ?
                ORDER BY id DESC
                LIMIT ? OFFSET ?
                """,
                (term, term, limit, offset),
            ).fetchall()
        return [ItemOut(**dict(r)) for r in rows]

    # --- Heuristic keyword extraction (low-compute) ---
    class KeywordsIn(BaseModel):
        text: str
        top_n: int = 3

    class KeywordsOut(BaseModel):
        keywords: List[str]
        summary: str

    @app.post("/nlp/keywords", response_model=KeywordsOut)
    def extract_keywords(body: KeywordsIn) -> KeywordsOut:
        text = body.text.lower()
        # basic tokenization
        tokens = [t.strip(".,:;!?()[]{}\"'`“”„“”/\\") for t in text.split()]
        tokens = [t for t in tokens if t]
        stop = {
            "und","oder","der","die","das","ein","eine","ist","sind","im","in","am","an","zu","mit","auf","für","von","dass","wie","auch","es","den","dem","des","als","ich","du","er","sie","wir","ihr","man","nicht","nur","so","auch","einfach","mal"
        }
        words: Dict[str,int] = {}
        for t in tokens:
            if t.isdigit() or t in stop or len(t) <= 2:
                continue
            words[t] = words.get(t, 0) + 1
        # sort by frequency, then alphabetically
        top = sorted(words.items(), key=lambda kv: (-kv[1], kv[0]))[: max(1, body.top_n)]
        keywords = [w for w,_ in top]
        # Simple context sentence
        summary = "Wichtige Begriffe: " + ", ".join(keywords)
        return KeywordsOut(keywords=keywords, summary=summary)

    class RunRequest(BaseModel):
        args: Dict[str, Any] = {}

    @app.post("/run/{plugin_name}/{command}")
    def run_command(plugin_name: str, command: str, body: RunRequest):
        # Find plugin
        target = next((r for r in discovered if r.name == plugin_name), None)
        if not target or not manager.is_enabled(plugin_name) or not target.instance:
            raise HTTPException(status_code=404, detail="Plugin not found or disabled")
        plugin = target.instance
        if not hasattr(plugin, "execute") or not callable(plugin.execute):
            raise HTTPException(status_code=400, detail="Plugin does not support execution")
        try:
            output = plugin.execute(command, body.args)  # type: ignore[attr-defined]
            return {"ok": True, "output": output}
        except KeyError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    # --- File Upload/Download ---
    uploads_dir = project_root / "data" / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)

    @app.post("/files/upload")
    async def upload_file(file: UploadFile = File(...)):
        # Basic filename sanitizing: keep name only
        name = Path(file.filename).name
        dest = uploads_dir / name
        try:
            with dest.open("wb") as f:
                while True:
                    chunk = await file.read(1024 * 1024)
                    if not chunk:
                        break
                    f.write(chunk)
        finally:
            await file.close()
        return {"ok": True, "filename": name, "path": str(dest.relative_to(project_root))}

    @app.get("/files/download/{name}")
    def download_file(name: str):
        safe = Path(name).name
        path = uploads_dir / safe
        if not path.exists() or not path.is_file():
            raise HTTPException(status_code=404, detail="File not found")
        return FileResponse(path)

    return app


app = create_app()

# Run with: uvicorn werkstatt.api:app --reload --port 8000
