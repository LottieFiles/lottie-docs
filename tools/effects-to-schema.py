#!/usr/bin/env python3

import sys
import csv
import json
import pathlib
import argparse
import urllib.request


def download_lottie(url):
    with urllib.request.urlopen(url) as response:
        return json.load(response)


def get_effects(data):
    effects = []
    for asset in data.get("assets", []):
        if "layers" in asset:
            for layer in asset["layers"]:
                effects += layer.get("ef", [])
    for layer in data["layers"]:
        effects += layer.get("ef", [])

    return effects


known_effects = {
    5,
    7,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    31,
    32,
    33,
    34,
}

controls = {
    0: "slider",
    1: "angle",
    2: "color",
    3: "point",
    4: "checkbox",
    #5: "",
    6: "ignored",
    7: "drop-down",
    #8: "",
    #9: "",
    10: "layer",
}


def get_control(value):
    ty = value.get("ty", None)
    if ty in controls:
        return controls[ty]
    sys.stderr.write("\x1b[1m")
    json.dump(value, sys.stderr, indent=4)
    sys.stderr.write("\x1b[m")
    return "no-value"


def process_file(path):
    if "://" in path:
        data = download_lottie(path)
    else:
        with open(path) as f:
            data = json.load(f)

    effects = get_effects(data)

    for effect in effects:
        if effect["ty"] not in known_effects:
            known_effects.add(effect["ty"])

            filename = effect["nm"].replace(" ", "-").lower() + "-effect.json"

            schema = {
                "$schema": "https://json-schema.org/draft/2020-12/schema",
                "type": "object",
                "title": effect["nm"] + " Effect",
                "description": "",
                "allOf": [
                    {
                        "$ref": "#/$defs/effects/effect"
                    },
                    {
                        "type": "object",
                        "properties": {
                            "ty": {
                                "title": "Type",
                                "type": "integer",
                                "const": effect["ty"]
                            },
                            "ef": {
                                "title": "Effect values",
                                "type": "array",
                                "prefixItems": [
                                    {
                                        "title": value["nm"] if "nm" in value else "%02d" % index,
                                        "$ref": "#/$defs/effect-values/" + get_control(value)
                                    }
                                    for index, value in enumerate(effect["ef"])

                                ]
                            }
                        },
                        "required": [
                            "ty", "ef"
                        ]
                    }
                ]
            }

            print("%s %s" % (effect["ty"], filename))

            with open(ns.output_path / filename, "w") as f:
                json.dump(schema, f, indent=4)




parser = argparse.ArgumentParser()
parser.add_argument("input")
parser.add_argument("--output-path", "-o", type=pathlib.Path, default=pathlib.Path("/tmp"))
parser.add_argument(
    "--input-list",
    action="store_true",
    help="The input file contains a CSV with a list of files/urls"
)

ns = parser.parse_args()

if ns.input_list:
    with open(ns.input) as f:
        reader = csv.reader(f)
        for row in reader:
            print(row[0])

            try:
                process_file(row[0])
            except Exception as e:
                sys.stderr.write(str(e) + "\n")
                continue
else:
    process_file(ns.input)
