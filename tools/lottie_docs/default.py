import json
from pathlib import Path

from .schema import Schema

__all__ = ["default_schema"]

found = None
package_root = Path(__file__).parent


def try_path(path):
    global found
    if path.exists():
        with open(path, "r") as f:
            found = Schema(json.load(f))
            return found


def default_schema():
    if found:
        return found

    return (
        try_path(package_root.parent.parent / "docs" / "schema" / "lottie.schema.json") or
        try_path(package_root.parent / "lottie.schema.json")
    )
