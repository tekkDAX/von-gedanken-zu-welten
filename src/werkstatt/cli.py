# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
from __future__ import annotations

import sys
from pathlib import Path
import typer
from rich import print
import requests
from typing import Optional

from .core.manager import PluginManager
from .core.config import load_config


def get_project_root() -> Path:
    # Assume package installed in development layout; find up from this file to repo root
    here = Path(__file__).resolve()
    # src/werkstatt/cli.py -> project root is 3 parents up
    return here.parent.parent.parent


def build_app() -> typer.Typer:
    app = typer.Typer(help="Werkstatt: modularer, plugin-fähiger Werkzeugkasten")

    project_root = get_project_root()
    config = load_config(project_root)
    manager = PluginManager(project_root=project_root, config=config)

    # Eager discovery to support list-plugins command
    discovered = manager.discover_plugins()

    @app.command("list-plugins")
    def list_plugins() -> None:
        from rich.table import Table
        table = Table(title="Werkstatt Plugins")
        table.add_column("Name")
        table.add_column("Enabled")
        table.add_column("Version")
        table.add_column("Description")
        for rec in discovered:
            enabled = manager.is_enabled(rec.name)
            ver = rec.version or "?"
            desc = rec.description or ""
            table.add_row(rec.name, "yes" if enabled else "no", ver, desc)
        print(table)

    # --- Plugins scaffolder ---
    plugins_app = typer.Typer(help="Plugin-Werkzeuge (Scaffolding)")

    @plugins_app.command("create")
    def create_plugin(name: str = typer.Argument(..., help="Plugin-Name, z.B. 'extraction'")) -> None:
        """Erzeugt ein neues Plugin unter werkstatt_plugins/<name> und aktiviert es in werkstatt.toml."""
        pkg = name.strip().lower()
        if not pkg.isidentifier():
            typer.echo("Ungültiger Name. Verwende nur Buchstaben, Ziffern und _.")
            raise typer.Exit(code=2)

        plugins_dir = project_root / "werkstatt_plugins" / pkg
        if plugins_dir.exists():
            typer.echo(f"Plugin-Verzeichnis existiert bereits: {plugins_dir}")
            raise typer.Exit(code=1)
        plugins_dir.mkdir(parents=True, exist_ok=True)

        init_py = plugins_dir / "__init__.py"
        init_py.write_text(
            """# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0\n# Plugin package\n""",
            encoding="utf-8",
        )

        template = f'''# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
from __future__ import annotations

from typing import Any, Dict, List
import typer
from werkstatt.core.plugin import ToolPlugin


class {pkg.capitalize()}Plugin(ToolPlugin):
    name = "{pkg}"
    version = "0.1.0"
    description = "{pkg} plugin"

    def on_load(self, ctx: Dict[str, Any]) -> None:
        return None

    def register(self, app: typer.Typer) -> None:
        _app = typer.Typer(help=f"{pkg} commands")
        app.add_typer(_app, name=self.name)

    def describe(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "hello",
                "description": "returns a greeting",
                "params": [
                    {"name": "name", "type": "string", "required": False, "description": "Name", "default": "World"}
                ],
            }
        ]

    def execute(self, command: str, args: Dict[str, Any]) -> Any:
        if command == "hello":
            return f"Hello, {args.get('name') or 'World'}!"
        raise KeyError(command)


def get_plugin() -> ToolPlugin:
    return {pkg.capitalize()}Plugin()
'''
        (plugins_dir / "plugin.py").write_text(template, encoding="utf-8")

        # Enable in werkstatt.toml
        toml_path = project_root / "werkstatt.toml"
        if toml_path.exists():
            content = toml_path.read_text(encoding="utf-8")
            if "[plugins]" not in content:
                content += "\n[plugins]\n"
            if f"\n{pkg} = true" not in content:
                content = content.rstrip() + f"\n{pkg} = true\n"
            toml_path.write_text(content, encoding="utf-8")
        typer.echo(f"Plugin '{pkg}' erstellt und in werkstatt.toml aktiviert.")

    app.add_typer(plugins_app, name="plugins")

    # --- Minimal HTTP bridge for DB endpoints ---
    @app.command("db-put")
    def db_put(
        key: str = typer.Argument(..., help="Item key"),
        value: str = typer.Argument(..., help="Item value"),
        type_: Optional[str] = typer.Option(None, "--type", help="Optional type"),
        tags: Optional[str] = typer.Option(None, "--tags", help="Optional tags (CSV)"),
        api_base: str = typer.Option("http://127.0.0.1:8000", help="Werkstatt API base URL"),
    ) -> None:
        """Create an item via FastAPI (/db/items)."""
        url = f"{api_base.rstrip('/')}/db/items"
        payload = {"key": key, "value": value}
        if type_ is not None:
            payload["type"] = type_
        if tags is not None:
            payload["tags"] = tags
        try:
            r = requests.post(url, json=payload, timeout=10)
            r.raise_for_status()
            print({"ok": True, "item": r.json()})
        except Exception as e:
            print({"ok": False, "error": str(e)})

    @app.command("db-list")
    def db_list(
        limit: int = typer.Option(10, help="Limit"),
        offset: int = typer.Option(0, help="Offset"),
        api_base: str = typer.Option("http://127.0.0.1:8000", help="Werkstatt API base URL"),
    ) -> None:
        """List items via FastAPI (/db/items)."""
        url = f"{api_base.rstrip('/')}/db/items"
        try:
            r = requests.get(url, params={"limit": limit, "offset": offset}, timeout=10)
            r.raise_for_status()
            print({"ok": True, "items": r.json()})
        except Exception as e:
            print({"ok": False, "error": str(e)})

    @app.command("db-search")
    def db_search(
        q: Optional[str] = typer.Option(None, "--q", help="Query string (LIKE on key/value)"),
        type_: Optional[str] = typer.Option(None, "--type", help="Filter by type"),
        tag: Optional[str] = typer.Option(None, "--tag", help="Filter by tag (substring match)"),
        limit: int = typer.Option(10, help="Limit"),
        offset: int = typer.Option(0, help="Offset"),
        api_base: str = typer.Option("http://127.0.0.1:8000", help="Werkstatt API base URL"),
    ) -> None:
        """Search items via FastAPI (/db/search)."""
        url = f"{api_base.rstrip('/')}/db/search"
        params = {"limit": limit, "offset": offset}
        if q is not None:
            params["q"] = q
        if type_ is not None:
            params["type"] = type_
        if tag is not None:
            params["tag"] = tag
        try:
            r = requests.get(url, params=params, timeout=10)
            r.raise_for_status()
            print({"ok": True, "items": r.json()})
        except Exception as e:
            print({"ok": False, "error": str(e)})

    # Register enabled plugins
    manager.register_plugins(app, discovered)

    return app


# Expose Typer callable for `python -m werkstatt`
app = build_app()
