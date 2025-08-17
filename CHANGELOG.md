# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei festgehalten.
Dieses Projekt folgt (locker) Semantic Versioning.

## [0.1.0] - 2025-08-17
### Added
- Core: Plugin-Architektur mit `ToolPlugin`, `PluginManager`, Konfig via `werkstatt.toml`.
- CLI: Typer-basierte Auto-Registrierung der Plugin-Befehle.
- API (FastAPI):
  - `GET /plugins` – Plugin- und Command-Übersicht
  - `POST /run/{plugin}/{command}` – Befehlsausführung
  - `POST /files/upload` & `GET /files/download/{name}` – Datei Upload/Download
- Frontend (React + Vite + TS):
  - Plugin-Liste, dynamische Command-Formulare aus `describe()`
  - Mock-API-Modus (`VITE_USE_MOCK`) für Frontend-only Demo
  - Files-UI (Upload/Download), kompatibel mit Mock und echter API
- Dokumentation:
  - `README.md` mit Setup/Anleitung (Backend/Frontend, Mock-Modus)
  - `LAUFZETTEL.md` mit Plugin-Guidelines und Extraction-Skizze
  - `docs/INTEGRATION_PROTOCOL.md` (leichtgewichtiges Übergabeprotokoll)
  - `docs/transaktions_payload.schema.json` (Schema) und Beispiel-Payload

### Notes
- Status: Stable für Demos/Entwicklung, Beta bei API-Fehlerbehandlung/Sicherheit.
- Nächste Schritte: CI für Build/Typecheck und JSON-Schema-Validierung, minimaler Extraction-Plugin-Skeleton, robustere Validierung.

[0.1.0]: https://example.com/releases/v0.1.0
