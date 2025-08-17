#!/usr/bin/env python3
"""
Validiert alle Beispiel-Payloads unter docs/examples/ gegen docs/transaktions_payload.schema.json
Nutzung lokal:
  python scripts/validate_payloads.py
"""
from __future__ import annotations
import json
import sys
from pathlib import Path

try:
    from jsonschema import validate
    from jsonschema.exceptions import ValidationError
except Exception as e:
    print("jsonschema ist nicht installiert. Bitte 'pip install jsonschema' ausführen.")
    raise

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = ROOT / "docs" / "transaktions_payload.schema.json"
EXAMPLES_DIR = ROOT / "docs" / "examples"


def main() -> int:
    if not SCHEMA_PATH.exists():
        print(f"Schema nicht gefunden: {SCHEMA_PATH}")
        return 1
    if not EXAMPLES_DIR.exists():
        print(f"Beispiel-Verzeichnis nicht gefunden: {EXAMPLES_DIR}")
        return 1

    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    json_files = sorted(EXAMPLES_DIR.glob("*.json"))
    if not json_files:
        print("Keine Beispiel-JSONs gefunden.")
        return 1

    ok = True
    for jf in json_files:
        try:
            payload = json.loads(jf.read_text(encoding="utf-8"))
            validate(instance=payload, schema=schema)
            print(f"OK: {jf.relative_to(ROOT)}")
        except ValidationError as ve:
            ok = False
            print(f"FEHLER: {jf.relative_to(ROOT)}")
            print(f"  Pfad: {'/'.join(str(p) for p in ve.absolute_path)}")
            print(f"  Nachricht: {ve.message}")
        except Exception as e:
            ok = False
            print(f"FEHLER: {jf.relative_to(ROOT)} -> {e}")

    return 0 if ok else 2


if __name__ == "__main__":
    sys.exit(main())
