import json
from pathlib import Path

from .schema import Schema, join_parts

__all__ = ["default_schema"]

found = None
package_root = Path(__file__).parent


def try_path(path):
    global found
    if path.exists():
        with open(path, "r") as f:
            found = Schema(json.load(f))
            return found


def default_schema(join=False):
    global found
    if found:
        return found

    src_path = package_root.parent.parent / "docs" / "schema"

    if join and src_path.exists():
        found = Schema(join_parts(src_path))
        return found

    return (
        try_path(src_path / "lottie.schema.json") or
        try_path(package_root.parent / "lottie.schema.json")
    )

