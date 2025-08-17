# Laufzettel – Module/Plugins und Extraction-Skizze

Kurzüberblick für das Einfügen neuer Module (Plugins) in die Werkstatt und eine Skizze für Dateiextraktion.

## Was ist vorbereitet
- Plugin-System: `src/werkstatt/core/plugin.py`, `src/werkstatt/core/manager.py`
- CLI: `src/werkstatt/cli.py` (Typer, auto-Registrierung der Plugins)
- REST API: `src/werkstatt/api.py` (`GET /plugins`, `POST /run/{plugin}/{command}`)
- Beispiel-Plugin: `werkstatt_plugins/example_tool/plugin.py`
- Frontend: `web/` (React + Vite + TS)

## Wie ein neues Plugin aussieht
- Ordner: `werkstatt_plugins/<name>/plugin.py`
- Klasse implementiert `ToolPlugin` mit:
  - `name`, optional `version`, `description`
  - `on_load(ctx)` – schnelle Initialisierung
  - `register(app)` – Typer-Commands anhängen
  - `describe()` – Command-/Parameter-Metadaten fürs UI
  - `execute(command, args)` – programmatische Ausführung
- Aktivierung: `werkstatt.toml` → `[plugins] <name> = true`

### describe()-Schema (vereinbart)
- Command: `{ name, description, params: [{ name, type, required, description, default? }] }`
- Types (UI): `string`, `number`, `boolean` (erweiterbar)

### execute()-Kontrakt
- Unbekanntes Kommando → `raise KeyError(command)`
- Validierungsfehler → `raise ValueError("...")`
- Rückgabe JSON-serialisierbar

## Konflikte vermeiden
- Name = Ordnername, eindeutig (z. B. `files`, `images`)
- Keine teuren Side-Effects beim Import; `on_load()` leichtgewichtig
- Parameternamen in CLI und `describe()` konsistent
- Keine `sys.exit()`; Exceptions klar formulieren

## Skizze: Extraction-Flow (Datei→Extraktion→Ergebnis)
- Upload-Ziel: `data/uploads/` (API: `POST /files/upload`)
- Download: `GET /files/download/{name}`
- Vorschlag „Extraction“-Plugin (`werkstatt_plugins/extraction/`):
  - Command `extract` mit Params:
    - `path` (string, required): relativer Pfad in `data/uploads/`
    - `kind` (string, optional): z. B. `text`, `pdf`, `image`
    - `options` (string, optional JSON): weitere Optionen
  - `execute("extract", args)` lädt Datei aus `data/uploads/`, extrahiert Inhalte/Metadata, liefert Ergebnis z. B. `{ text, metadata }` zurück.
- Minimal-`describe()` für `extract`:
```json
{
  "name": "extract",
  "description": "Extrahiert Inhalte/Metadaten aus einer Datei",
  "params": [
    { "name": "path", "type": "string", "required": true, "description": "Pfad relativ zu data/uploads" },
    { "name": "kind", "type": "string", "required": false, "description": "Typ-Hinweis (text|pdf|image)" },
    { "name": "options", "type": "string", "required": false, "description": "JSON-Optionen" }
  ]
}
```

## Quick-Checkliste beim Einfügen
- [ ] `werkstatt_plugins/<name>/plugin.py` erstellt mit `get_plugin()`
- [ ] `describe()` und CLI-Parameter sind konsistent
- [ ] `execute()` gibt JSON-Output; Fehler sauber
- [ ] `werkstatt.toml` aktiviert
- [ ] Test: CLI, API (`/plugins`, `/run/...`), Web-UI

## Referenzen
- Interface: `src/werkstatt/core/plugin.py`
- Manager: `src/werkstatt/core/manager.py`
- API: `src/werkstatt/api.py`
- Beispiel: `werkstatt_plugins/example_tool/plugin.py`
- Konfig: `werkstatt.toml`
- Frontend-Client: `web/src/services/api.ts`

## Bezug zum Datenintegrations‑Protokoll
- Protokolldoku: `docs/INTEGRATION_PROTOCOL.md`
- JSON‑Schema: `docs/transaktions_payload.schema.json`
- Beispiel‑Payload: `docs/examples/transaktions_payload.example.json`
