# Konsolidiertes Datenintegrations-Protokoll & Systemanweisungen (v0.01 / v2.4)

Dieses Dokument beschreibt unser leichtgewichtiges Protokoll zur strukturierten Übergabe von Wissenspaketen in dieses Repository.

- Aktuelle Version dieses Dokuments: v0.01 (Prozess) / v2.4 (Spielregeln)
- JSON-Schema: `docs/transaktions_payload.schema.json`
- Beispiel-Payload: `docs/examples/transaktions_payload.example.json`

## Grundprinzipien
- Sparfuchsprinzip & Token-Effizienz: Strukturierte, knappe, eindeutige Datenübermittlung.
- Datenintegrität & Vollständigkeit: Jedes Paket besteht aus Laufzettel + JSON-Payload.
- Robustheit & Fehlertoleranz: Regeln werden iterativ verbessert; Rückfragen bei Unsicherheit.
- Redundanz-Eliminierung: Nur neueste Version ist kanonisch; ältere Einträge verweisen mittels Referenz-ID.

## Handshake-Prozess (v0.01)
1. Initiierung: Benutzer startet mit „go“ oder der KI bietet zum Projektstart einen Startlaufzettel an.
2. Abstimmung: Welche Kontexte aus dem Chatverlauf werden übernommen? (Kurz klären.)
3. Übergabe: Es werden zwei Artefakte erstellt/aktualisiert:
   - Laufzettel (freier Text, siehe unten)
   - JSON-Payload (`transaktions_payload`) gemäß Schema
4. Verarbeitung: KI prüft auf Vollständigkeit/Logik, meldet Status zurück; Rückfragen bei Unklarheit.

## Laufzettel (Text)
Pflichtinhalte im Laufzettel (als Abschnitt in einer geeigneten Datei, z. B. `LAUFZETTEL.md` oder dedizierter Laufzettel-Datei):
- Betreff
- Ziel
- Inhaltstyp (Text/Code/JSON/…)
- Haupt-Forschungsgebiet/Domäne
- Schlüssel-Erkenntnis
- Anweisungen zur Duplikat-Behandlung (z. B. wie auf kanonische Version verwiesen wird)
- Verweis auf die zugehörige JSON-Payload (Dateipfad + ggf. ID)

## JSON-Payload (`transaktions_payload`)
- Datei im Repo (z. B. unter `docs/examples/…` oder pro Übergabe unter projektbezogenem Pfad)
- Validierung gegen `docs/transaktions_payload.schema.json`
- Minimale Pflichtfelder:
  - `version`
  - `korrespondierender_laufzettel_betreff`
  - `art_des_inhalts`
  - `fokus_domaene`
  - `metadata_des_pakets` (mind. `datum_iso8601`, `projektname`)
  - `haupt_inhalt.sitzungs_zusammenfassung_text`
- Optionale Felder:
  - `kanonische_referenz_id`
  - `haupt_inhalt.detaillierte_struktur_json`
  - `haupt_inhalt.quellcode_artefakte[]`
  - `haupt_inhalt.referenzen[]`
  - `haupt_inhalt.zusatz_informationen`

Siehe Schema und Beispiel für Details.

## Redundanz-Eliminierung
- Wenn ein Paket eine frühere Version ersetzt, setze `kanonische_referenz_id` auf die ID der neuesten Version und verweise im Vorgänger auf die neue ID.
- Keine physische Löschung nötig; klare Verlinkung genügt.

## Humor & Kommunikation
- Sachlich-präzise, gelegentlich Entwicklerhumor. Token-Effizienz beachten.

## Changelog
- v0.01: Erste Repo-Integration (Doku + Schema + Beispiel)
- v2.4: Sprach-/Regelverfeinerungen (gültig inhaltlich, Nummer wird mit v0.01 geführt)
