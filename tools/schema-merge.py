#!/usr/bin/env python3

import json
import pathlib

schema = "https://json-schema.org/draft/2020-12/schema"
id = "https://lottiefiles.github.io/lottie-docs/schema/lottie.schema.json"
json_data = {
    "$schema": schema,
    "$id": id,
    "$comment": "Do not use this file for editing, as it gets overwritten, edit the split files instead",
    "type": "object",
    "allOf": [{
        "$ref": "#/$defs/animation/animation"
    }]
}

root = pathlib.Path(__file__).parent.parent / "docs" / "schema"

defs = {}
for subdir in root.iterdir():
    dir_schema = {}
    if subdir.is_dir():
        for file_item in subdir.iterdir():
            if file_item.is_file() and file_item.suffix == ".json":
                with open(file_item, "r") as file:
                    file_schema = json.load(file)
                file_schema.pop("$schema", None)
                dir_schema[file_item.stem] = file_schema
        defs[subdir.name] = dir_schema

json_data["$defs"] = defs

with open(root / "lottie.schema.json", "w") as file:
    json.dump(json_data, file, indent=4)
