# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
from __future__ import annotations

import json
import datetime as dt
import typer
from typing import Any, Dict, List
from werkstatt.core.plugin import ToolPlugin


class BusinessFormPlugin(ToolPlugin):
    name = "businessform"
    version = "0.1.0"
    description = "Generiert ein Business-Formular (Dummy)"

    def on_load(self, ctx: Dict[str, Any]) -> None:
        return None

    def register(self, app: typer.Typer) -> None:
        bf_app = typer.Typer(help="Business Form Commands")

        @bf_app.command()
        def generate(title: str = typer.Option("Demo-Formular", "--title", help="Formulartitel")):
            """Dummy: generiert ein minimales Formular als JSON."""
            payload = {
                "title": title,
                "generated_at": dt.datetime.utcnow().isoformat() + "Z",
                "fields": [
                    {"name": "name", "label": "Name", "type": "string"},
                    {"name": "email", "label": "E-Mail", "type": "string"},
                ],
            }
            typer.echo(json.dumps(payload, ensure_ascii=False))

        app.add_typer(bf_app, name=self.name)

    def describe(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "generate",
                "description": "Erzeugt ein Beispiel-Formular (Dummy)",
                "params": [
                    {"name": "title", "type": "string", "required": False, "description": "Formulartitel", "default": "Demo-Formular"}
                ],
            }
        ]

    def execute(self, command: str, args: Dict[str, Any]) -> Any:
        if command == "generate":
            title = args.get("title") or "Demo-Formular"
            return {
                "title": title,
                "generated_at": dt.datetime.utcnow().isoformat() + "Z",
                "fields": [
                    {"name": "name", "label": "Name", "type": "string"},
                    {"name": "email", "label": "E-Mail", "type": "string"},
                ],
            }
        raise KeyError(command)


def get_plugin() -> ToolPlugin:
    return BusinessFormPlugin()
