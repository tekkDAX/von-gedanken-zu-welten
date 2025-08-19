# Werkstatt

Ein modularer, plugin-fähiger CLI-Werkzeugkasten. Von Anfang an auf Erweiterbarkeit und dynamische Tool-Integration ausgelegt.

## Features
- Dynamisches Laden von Plugins aus `werkstatt_plugins/`
- Aktivieren/Deaktivieren von Plugins via `werkstatt.toml`
- Einheitliche Plugin-Schnittstelle (`ToolPlugin`)
- Automatische CLI-Registrierung pro Plugin (Typer-basiert)
- Beispiel-Plugin inklusive

## Schnellstart
```bash
# Optional: virtuelles Environment
python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

# Liste der geladenen Plugins
PYTHONPATH=src python -m werkstatt list-plugins

# Beispiel-Tool verwenden
PYTHONPATH=src python -m werkstatt example greet --name "Ada"
```

## Struktur
```
werkstatt/
├── requirements.txt
├── README.md
├── .gitignore
├── werkstatt.toml                # Konfiguration (Plugins aktivieren/deaktivieren)
├── src/
│   └── werkstatt/
│       ├── __init__.py
│       ├── cli.py
│       └── core/
│           ├── plugin.py        # ToolPlugin Basis-Interface
│           ├── manager.py       # PluginManager (Laden/Registrieren)
│           └── config.py        # Konfigurations-Lader
└── werkstatt_plugins/
    └── example_tool/
        ├── __init__.py
        └── plugin.py            # Beispiel-Plugin
├── web/                         # React (Vite + TS) Frontend
│   ├── package.json
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx
│       ├── routes/App.tsx
│       └── services/api.ts
```

## Plugins entwickeln
[Siehe auch: LAUFZETTEL.md](./LAUFZETTEL.md)
1. Neues Verzeichnis unter `werkstatt_plugins/<dein_plugin>/` anlegen.
2. Eine Datei `plugin.py` mit einer Funktion `get_plugin()` erstellen, die ein Objekt liefert, das `ToolPlugin` implementiert.
3. In `register(self, app: Typer)` deine Typer-Befehle registrieren.
4. Optional: `on_load(self, ctx)` verwenden, um Startlogik auszuführen.

### Minimalbeispiel
```python
# werkstatt_plugins/hello/plugin.py
from werkstatt.core.plugin import ToolPlugin
import typer

class HelloPlugin(ToolPlugin):
    name = "hello"
    version = "0.1.0"
    description = "Sagt Hallo"

    def register(self, app: typer.Typer) -> None:
        hello_app = typer.Typer(help="Hello commands")

        @hello_app.command()
        def say(name: str = "Welt"):
            typer.echo(f"Hallo {name}!")

        app.add_typer(hello_app, name=self.name)

def get_plugin():
    return HelloPlugin()
```

## Konfiguration
Datei: `werkstatt.toml`
```toml
[plugins]
# true = aktiv, false = deaktiv
example_tool = true
```

## API starten (FastAPI)
```bash
# Backend-Dependencies installieren
pip install -r requirements.txt

# API starten (Port 8000)
PYTHONPATH=src uvicorn werkstatt.api:app --reload --port 8000

# Test
curl http://localhost:8000/plugins
```

## Web App starten (React, Vite + TS)
```bash
cd web
npm install
npm run dev
# öffne http://localhost:5173
```

### Frontend-Only Demo (Mock API)
Die Web-App kann ohne laufenden Backend-Server betrieben werden. Dafür gibt es eine Mock-API im Frontend.

1. `.env` anlegen (auf Basis der Vorlage):
   ```bash
   cd web
   cp .env.example .env
   ```
   In `.env` ist `VITE_USE_MOCK=1` gesetzt. Damit werden Plugin-Liste, Command-Ausführung und Datei-Upload/Download direkt im Browser simuliert.

2. Dev-Server starten:
   ```bash
   npm run dev
   # öffne http://localhost:5173
   ```

3. Upload/Download im UI:
   - Im Bereich „Files“ lassen sich Dateien hochladen und über den Link wieder herunterladen.
   - Im Mock-Modus werden Dateien im Speicher (Blob-URLs) gehalten.

Backend später zuschalten:
- Mock ausschalten: in `web/.env` `VITE_USE_MOCK=0` (oder entfernen)
- API-Basis setzen (falls abweichend): `VITE_API_BASE=http://localhost:8000`
- Backend starten wie in Abschnitt „API starten (FastAPI)“ beschrieben.

## Dateien hoch-/runterladen (API)
```bash
# Upload (Beispiel: foo.txt)
curl -F "file=@foo.txt" http://localhost:8000/files/upload

# Download
curl -O http://localhost:8000/files/download/foo.txt
```

## Datenintegrations‑Protokoll
- Vollständige Beschreibung: `docs/INTEGRATION_PROTOCOL.md`
- JSON‑Schema zur Validierung: `docs/transaktions_payload.schema.json`
- Beispiel‑Payload: `docs/examples/transaktions_payload.example.json`

Hinweis: Für Übergaben bestehen zwei Artefakte: Laufzettel (Text) + JSON‑Payload (Schema‑konform). Mehr Details im Protokolldokument.

## GitHub-Setup (kurz für Profis)
```bash
# Git-Identität (global)
git config --global user.name "EvilDaX"
git config --global user.email "tekkdax@gmail.com"

# SSH-Key (falls noch keiner vorhanden)
ssh-keygen -t ed25519 -C "tekkdax@gmail.com" -f ~/.ssh/id_ed25519 -N ""
eval "$(ssh-agent -s)" && ssh-add ~/.ssh/id_ed25519
ssh -T git@github.com   # beim ersten Mal mit "yes" bestätigen

# Repo initialisieren und ersten Push (SSH)
git init
git add .
git commit -m "chore: initial commit"
git branch -M main
git remote add origin git@github.com:tekkDAX/werkstatt.git
git push -u origin main

# Feature-Branch (optional)
git checkout -b feat/start
git push -u origin feat/start
```

## Lizenz
- Nicht-kommerzielle Nutzung: PolyForm Noncommercial License 1.0.0 (siehe `LICENSE`)
- Kommerzielle Nutzung: Separate Lizenz erforderlich. Kontakt: renedax81@gmail.com (siehe `COMMERCIAL-LICENSE.md`)
