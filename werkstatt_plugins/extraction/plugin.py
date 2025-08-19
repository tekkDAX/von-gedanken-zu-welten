# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
from __future__ import annotations

from typing import Any, Dict, List
from pathlib import Path
import typer

# Lightweight deps for basic extraction
import requests
from bs4 import BeautifulSoup
from PyPDF2 import PdfReader

from werkstatt.core.plugin import ToolPlugin


def _read_pdf_text(path: Path) -> str:
    reader = PdfReader(str(path))
    parts: List[str] = []
    for page in reader.pages:
        try:
            txt = page.extract_text() or ""
        except Exception:
            txt = ""
        if txt:
            parts.append(txt)
    return "\n".join(parts).strip()


def _fetch_url_text(url: str) -> str:
    resp = requests.get(url, timeout=15)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    # remove script/style
    for tag in soup(["script", "style", "noscript"]):
        tag.extract()
    text = soup.get_text(" ")
    return " ".join(text.split())


class ExtractionPlugin(ToolPlugin):
    name = "extraction"
    version = "0.1.0"
    description = "Extrahiert Text aus PDF oder URL (minimal)"

    def on_load(self, ctx: Dict[str, Any]) -> None:
        return None

    def register(self, app: typer.Typer) -> None:
        ext_app = typer.Typer(help="Extraction commands")

        @ext_app.command()
        def extract_pdf(path: Path = typer.Argument(..., help="Pfad zur PDF-Datei")):
            text = _read_pdf_text(path)
            typer.echo(text)

        @ext_app.command()
        def extract_url(url: str = typer.Argument(..., help="HTTP/HTTPS URL")):
            text = _fetch_url_text(url)
            typer.echo(text)

        app.add_typer(ext_app, name=self.name)

    def describe(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "extract_pdf",
                "description": "Extrahiert Text aus einer PDF-Datei",
                "params": [
                    {"name": "path", "type": "string", "required": True, "description": "Pfad zur PDF-Datei"}
                ],
            },
            {
                "name": "extract_url",
                "description": "Extrahiert Text aus einer URL (HTML)",
                "params": [
                    {"name": "url", "type": "string", "required": True, "description": "HTTP/HTTPS URL"}
                ],
            },
        ]

    def execute(self, command: str, args: Dict[str, Any]) -> Any:
        if command == "extract_pdf":
            raw = args.get("path")
            if not raw:
                raise ValueError("'path' ist erforderlich")
            path = Path(str(raw))
            if not path.exists() or not path.is_file():
                raise FileNotFoundError(str(path))
            return {"text": _read_pdf_text(path), "meta": {"source": str(path)}}
        if command == "extract_url":
            url = args.get("url")
            if not url:
                raise ValueError("'url' ist erforderlich")
            return {"text": _fetch_url_text(str(url)), "meta": {"source": str(url)}}
        raise KeyError(command)


def get_plugin() -> ToolPlugin:
    return ExtractionPlugin()
