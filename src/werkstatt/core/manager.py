from __future__ import annotations

import importlib.util
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional
import typer

from .plugin import ToolPlugin


@dataclass
class PluginRecord:
    name: str
    path: Path
    version: Optional[str] = None
    description: Optional[str] = None
    instance: Optional[ToolPlugin] = None


class PluginManager:
    def __init__(self, project_root: Path, config: Dict[str, Any]):
        self.project_root = project_root
        self.config = config or {"plugins": {}}
        self.plugins_dir = self.project_root / "werkstatt_plugins"

    def is_enabled(self, name: str) -> bool:
        plugins_cfg = self.config.get("plugins", {})
        if name in plugins_cfg:
            return bool(plugins_cfg[name])
        return True  # default: enabled

    def discover_plugins(self) -> List[PluginRecord]:
        records: List[PluginRecord] = []
        if not self.plugins_dir.exists():
            return records
        for entry in sorted(self.plugins_dir.iterdir()):
            if not entry.is_dir():
                continue
            plugin_py = entry / "plugin.py"
            if not plugin_py.exists():
                continue
            name = entry.name
            record = self._load_metadata(name, plugin_py)
            if record:
                records.append(record)
        return records

    def _load_metadata(self, name: str, plugin_py: Path) -> Optional[PluginRecord]:
        mod_name = f"werkstatt_plugins.{name}.plugin"
        spec = importlib.util.spec_from_file_location(mod_name, plugin_py)
        if not spec or not spec.loader:
            return None
        module = importlib.util.module_from_spec(spec)
        try:
            spec.loader.exec_module(module)  # type: ignore[attr-defined]
        except Exception:
            # On metadata load failure, skip plugin
            return None
        if not hasattr(module, "get_plugin"):
            return None
        try:
            plugin = module.get_plugin()
        except Exception:
            return None
        if not isinstance(plugin, ToolPlugin):
            return None
        return PluginRecord(
            name=name,
            path=plugin_py.parent,
            version=getattr(plugin, "version", None),
            description=getattr(plugin, "description", None),
            instance=plugin,
        )

    def register_plugins(self, app: typer.Typer, records: List[PluginRecord]) -> None:
        ctx = {"project_root": str(self.project_root), "config": self.config}
        for rec in records:
            if not self.is_enabled(rec.name):
                continue
            plugin = rec.instance
            if not plugin:
                continue
            try:
                plugin.on_load(ctx)
            except Exception:
                # Continue without blocking others
                pass
            try:
                plugin.register(app)
            except Exception:
                # Continue without blocking others
                pass
