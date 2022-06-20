#!/usr/bin/env python3
import sys
import json
import argparse
import pathlib


def gather_used(schema, used):
    if isinstance(schema, dict):
        if "caniuse" in schema:
            used.add(schema["caniuse"])

        for v in schema.values():
            gather_used(v, used)

    elif isinstance(schema, list):
        for v in schema:
            gather_used(v, used)


root = pathlib.Path(__file__).parent.parent

parser = argparse.ArgumentParser()
parser.add_argument(
    "caniuse",
    nargs="?",
    help="Caniuse Data",
    type=pathlib.Path,
    default=root.parent / "caniuse" / "data"
)
ns = parser.parse_args()


schema_filename = root / "docs" / "schema" / "lottie.schema.json"
with open(schema_filename, "r") as f:
    schema = json.load(f)

used = set()
gather_used(schema, used)
not_found = 0

for path in sorted(ns.caniuse.glob("*.json")):
    if path.stem not in used:
        not_found += 1
        print(path.stem)
        indent = " " * 4

        with open(path, "r") as f:
            data = json.load(f)
            if data.get("spec", ""):
                print(indent + data["spec"])
            else:
                print(indent + "https://github.com/lottie-animation-community/caniuse/blob/main/data/%s" % path.name)

            for link in data.get("links", []):
                print(indent + link["url"])

        print(indent + '"caniuse": "%s",' % path.stem)


sys.exit(not_found)
