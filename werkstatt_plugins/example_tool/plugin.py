from __future__ import annotations

import typer
from werkstatt.core.plugin import ToolPlugin


class ExamplePlugin(ToolPlugin):
    name = "example"
    version = "0.1.0"
    description = "Beispiel-Tool: Begrüßung und Echo"

    def on_load(self, ctx):
        # Could initialize resources here
        pass

    def register(self, app: typer.Typer) -> None:
        example_app = typer.Typer(help="Example commands")

        @example_app.command()
        def greet(name: str = typer.Option("Welt", "--name", "-n", help="Name zum Grüßen")):
            """Gibt eine Begrüßung aus."""
            typer.echo(f"Hallo, {name}!")

        @example_app.command()
        def echo(msg: str = typer.Argument(..., help="Nachricht")):
            """Gibt die Nachricht 1:1 zurück."""
            typer.echo(msg)

        app.add_typer(example_app, name=self.name)

    def describe(self):
        return [
            {
                "name": "greet",
                "description": "Gibt eine Begrüßung aus.",
                "params": [
                    {"name": "name", "type": "string", "required": False, "description": "Name zum Grüßen", "default": "Welt"}
                ],
            },
            {
                "name": "echo",
                "description": "Gibt die Nachricht 1:1 zurück.",
                "params": [
                    {"name": "msg", "type": "string", "required": True, "description": "Nachricht"}
                ],
            },
        ]

    def execute(self, command: str, args):
        if command == "greet":
            name = args.get("name", "Welt")
            return f"Hallo, {name}!"
        if command == "echo":
            if "msg" not in args:
                raise ValueError("'msg' ist erforderlich")
            return str(args["msg"])
        raise KeyError(command)


def get_plugin() -> ToolPlugin:
    return ExamplePlugin()
