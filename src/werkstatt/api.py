# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional

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
