#!/usr/bin/env python3

import json
import pathlib
from lottie_docs.schema import join_parts

root = pathlib.Path(__file__).parent.parent / "docs" / "schema"

json_data = join_parts(root)


with open(root / "lottie.schema.json", "w") as file:
    json.dump(json_data, file, indent=4)
