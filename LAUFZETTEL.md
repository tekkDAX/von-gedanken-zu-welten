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

## GitHub-Setup – Verlauf (für mich)
- Datum/Zeit: 2025-08-17
- Ziel: Projekt erstmals auf GitHub bringen (SSH)

Schritte (ausgeführt):
1. Git-User gesetzt
  - `git config --global user.name "EvilDaX"`
  - `git config --global user.email "tekkdax@gmail.com"`
2. SSH-Key erstellt und Agent geladen
  - `ssh-keygen -t ed25519 -C "tekkdax@gmail.com" -f ~/.ssh/id_ed25519 -N ""`
  - `eval "$(ssh-agent -s)" && ssh-add ~/.ssh/id_ed25519`
  - Public-Key bei GitHub hinterlegt (Settings → SSH and GPG keys)
  - Host verifiziert: `ssh -T git@github.com` → „Hi tekkDAX! ...“
3. Repo initialisiert und initialer Commit
  - `git init && git add .`
  - `git commit -m "chore: initial commit"`
  - `git branch -M main`
4. GitHub-Repo erstellt (privat) und Remote gesetzt
  - Remote: `git@github.com:tekkDAX/werkstatt.git`
  - `git remote add origin git@github.com:tekkDAX/werkstatt.git`
  - `git push -u origin main`
5. Feature-Branch angelegt und gepusht
  - `git checkout -b feat/start`
  - `git push -u origin feat/start`
  - PR-Link: https://github.com/tekkDAX/werkstatt/pull/new/feat/start

Hinweise:
- Repo ist aktuell privat; Sichtbarkeit kann in GitHub → Settings → General → Visibility geändert werden.
- Vor „Public“ prüfen, dass keine Secrets im Verlauf liegen.

## Nachtrag – 2025-08-17: Lizenz/SPDX & Dev-Setup

Durchgeführt:
- SPDX-Lizenz-Header in alle Python-Dateien eingefügt (`src/werkstatt/**`, `werkstatt_plugins/**`).
- Commit & Push auf Feature-Branch `feat/start`:
  - Commit: `chore(license): add SPDX headers to Python files`
  - Push: `feat/start → origin`

Dev-Start (lokal):
- Backend (FastAPI + Uvicorn):
  ```bash
  python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
  PYTHONPATH=src .venv/bin/uvicorn werkstatt.api:app --reload --port 8000
  ```
  - API Base: http://localhost:8000
  - Endpunkte: `GET /plugins`, `POST /run/{plugin}/{command}`

- Frontend (Vite/React):
  ```bash
  cd web
  npm install
  npm run dev
  ```
  - Dev-Server: http://localhost:5173

Hinweis: Für Python < 3.11 stellt `requirements.txt` `tomli` bereit; sonst wird `tomllib` der Stdlib verwendet.

## Bezug zum Datenintegrations‑Protokoll
- Protokolldoku: `docs/INTEGRATION_PROTOCOL.md`
- JSON‑Schema: `docs/transaktions_payload.schema.json`
- Beispiel‑Payload: `docs/examples/transaktions_payload.example.json`

## Nachtrag – 2025-08-18: Datenfragmente verwertet & Quickstart‑UI

Durchgeführt:

- Archivierung: Inhalt aus `datenfragmente/1.txt` nach
  `docs/examples/legacy_frontend_sample.jsx` verschoben (nur Referenz, kein Build‑Pfad).
- Quickstart‑UI: In `web/src/routes/App.tsx` eine „Schnellstart“-Sektion ergänzt
  (URL extrahieren via `extraction.extract_url`, PDF hochladen/auswählen und extrahieren via
  `extraction.extract_pdf`).
- Plugin aktiviert: `werkstatt.toml` → `extraction = true`.
- Dependencies: `requests`, `beautifulsoup4`, `PyPDF2` in `requirements.txt` gepinnt und installiert.

Aufräumplan:

- Ordner `datenfragmente/` wird gelöscht, da Inhalte verwertet/archiviert sind.
  Befehl (aus Projektwurzel):
  ```bash
  rm -rf datenfragmente
  git add -A
  git commit -m "chore(cleanup): remove datenfragmente after archiving sample"
  git push
  ```
  Hinweis: Der obige Schritt wird bewusst separat bestätigt/ausgeführt.

