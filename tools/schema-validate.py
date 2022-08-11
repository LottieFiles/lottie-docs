#!/usr/bin/env python3

import sys
import json
import pathlib
import argparse

from lottie_docs.schema import SchemaPath, Schema


class Validator:
    def __init__(self):
        self.valid_refs = set()
        self.expected_refs = set()
        self.has_error = False
        self.root = None

    def validate(self, schema_root):
        self.root = Schema(schema_root, None)
        self.collect_defs(self.root / "$defs")
        self.validate_recursive(self.root)
        for unused in (self.expected_refs - self.valid_refs):
            self.show_error("Unused def: %s" % unused)

    def show_error(self, msg):
        self.has_error = True
        print(msg)

    def error(self, schema: Schema, message):
        self.show_error("%s: %s" % (schema.path, message))

    def validate_ref(self, schema: Schema):
        if schema.value in self.valid_refs:
            return

        if SchemaPath(schema.value).walk(self.root) is None:
            self.error(schema, "Invalid $ref: %s" % schema.value)
            return

        self.valid_refs.add(schema.value)

    def validate_schema(self, schema: Schema):
        if "type" in schema:
            type = schema["type"]
            if type not in ("object", "array", "number", "integer", "boolean", "string"):
                self.error(schema, "Unknown type: %s" % type)
        if "$ref" in schema:
            self.validate_ref(schema / "$ref")

    def validate_recursive(self, schema: Schema):
        self.validate_schema(schema)
        for child in schema:
            self.validate_recursive(child)

    def collect_defs(self, schema):
        for child in schema:
            if "type" in child:
                self.expected_refs.add(str(child.path))
            else:
                self.collect_defs(child)

    def check_links(self, html_path: pathlib.Path):
        checked = set()
        file_cache = {}

        for ref in self.expected_refs:
            links = md_extensions.ref_links(ref, None)
            for link in links:
                key = (link.page, link.anchor)
                if key in checked:
                    continue
                checked.add(key)

                if link.page not in file_cache:
                    file = html_path / link.page / "index.html"
                    if not file.exists():
                        self.show_error("%s: Missing page %s" % (ref, link.page))
                        continue
                    file_cache[link.page] = lxml.html.parse(str(file)).xpath(".//*[@id]/@id")

                if link.anchor not in file_cache[link.page]:
                    self.show_error("%s: Missing anchor %s.md %s" % (ref, link.page, link.anchor))


if __name__ == "__main__":
    root = pathlib.Path(__file__).parent.parent
    filename = root / "docs" / "schema" / "lottie.schema.json"

    parser = argparse.ArgumentParser()
    parser.add_argument("--html", help="Path to the html to check links", type=pathlib.Path)
    ns = parser.parse_args()

    with open(filename) as file:
        data = json.load(file)

    validator = Validator()
    validator.validate(data)

    if ns.html:
        sys.path.append(str(root / "extensions"))
        import md_extensions
        import lxml.html
        validator.check_links(ns.html)

    if validator.has_error:
        sys.exit(1)
