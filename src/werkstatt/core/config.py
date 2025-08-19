# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
from __future__ import annotations

from pathlib import Path
from typing import Any, Dict


def load_config(project_root: Path) -> Dict[str, Any]:
    cfg_path = project_root / "werkstatt.toml"
    if not cfg_path.exists():
        return {"plugins": {}}
    data = cfg_path.read_text(encoding="utf-8")
    # Python 3.11+ has tomllib
    try:
        import tomllib as toml  # type: ignore
    except Exception:  # pragma: no cover - fallback for <3.11
        import tomli as toml  # type: ignore
    return toml.loads(data)
