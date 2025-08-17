from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
import typer


class ToolPlugin(ABC):
    """Basis-Interface für Werkstatt-Plugins."""

    # Eindeutiger Plugin-Name; üblicherweise das Verzeichnis unter werkstatt_plugins/
    name: str
    # Optional
    version: str = "0.1.0"
    description: str = ""

    def on_load(self, ctx: Dict[str, Any]) -> None:
        """Wird nach dem Laden aufgerufen (vor CLI-Registrierung)."""
        return None

    @abstractmethod
    def register(self, app: typer.Typer) -> None:
        """CLI-Kommandos an die gegebene Typer-App anhängen."""
        raise NotImplementedError

    # Optional, aber empfohlen für API/Frontend-Integration
    def describe(self) -> List[Dict[str, Any]]:
        """Beschreibt verfügbare Kommandos und Parameter.

        Rückgabeformat (Vorschlag):
        [
          {"name": str, "description": str, "params": [
             {"name": str, "type": str, "required": bool, "description": str, "default": Any}
          ]}
        ]
        """
        return []

    def execute(self, command: str, args: Dict[str, Any]) -> Any:
        """Führt ein Kommando programmatisch aus. Sollte zu `register` korrespondieren.

        Wirft `KeyError` bei unbekanntem Kommando.
        """
        raise NotImplementedError("execute() nicht implementiert")
