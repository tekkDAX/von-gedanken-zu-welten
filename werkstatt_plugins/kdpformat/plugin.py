# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
from __future__ import annotations

import json
import typer
from typing import Any, Dict, List
from werkstatt.core.plugin import ToolPlugin


class KDPFormatPlugin(ToolPlugin):
    name = "kdpformat"
    version = "0.1.0"
    description = "Bereitet extrahierte Inhalte für KDP auf (Dummy)"

    def on_load(self, ctx: Dict[str, Any]) -> None:
        return None

    def register(self, app: typer.Typer) -> None:
        kdp_app = typer.Typer(help="KDP Format Commands")

        @kdp_app.command()
        def extract(data: str = typer.Option("{}", "--data", help="JSON-String eingabedaten")):
            """Dummy: formatiert Daten in ein KDP-ähnliches JSON."""
            try:
                obj = json.loads(data)
            except Exception:
                obj = {"raw": data}
            typer.echo(json.dumps({"kdp": obj}, ensure_ascii=False))

        app.add_typer(kdp_app, name=self.name)

    def describe(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "extract",
                "description": "Bereitet Daten für KDP auf (Dummy)",
                "params": [
                    {"name": "data", "type": "string", "required": True, "description": "JSON-String der Eingabedaten"}
                ],
            }
        ]

    def execute(self, command: str, args: Dict[str, Any]) -> Any:
        if command == "extract":
            data = args.get("data")
            # Akzeptiere bereits geparstes Objekt oder String
            if isinstance(data, str):
                try:
                    data = json.loads(data)
                except Exception:
                    data = {"raw": data}
            if data is None:
                data = {}
            return {"kdp": data}
        raise KeyError(command)


def get_plugin() -> ToolPlugin:
    return KDPFormatPlugin()
