from __future__ import annotations

import sys
from pathlib import Path
import typer
from rich import print

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

    # Register enabled plugins
    manager.register_plugins(app, discovered)

    return app


# Expose Typer callable for `python -m werkstatt`
app = build_app()
