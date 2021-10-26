#!/usr/bin/env python3

import sys
import json
import pathlib


class SchemaPath:
    def __init__(self, path=None):
        if isinstance(path, str):
            self.chunks = path.strip("#/").split("/")
        elif path is None:
            self.chunks = []
        elif isinstance(path, SchemaPath):
            self.chunks = list(path.chunks)
        else:
            self.chunks = list(path)

    def __itruediv__(self, chunk):
        self.chunks.append(chunk)

    def __truediv__(self, chunk):
        return SchemaPath(self.chunks + [chunk])

    def walk(self, schema):
        for chunk in self.chunks:
            if not self.valid_step(schema, chunk):
                return None
            schema = self.step(schema, chunk)
        return schema

    @classmethod
    def step(cls, schema, chunk):
        return schema[chunk]

    @classmethod
    def valid_step(cls, schema, chunk):
        if isinstance(chunk, int) and (not isinstance(schema, list) or len(schema) <= chunk):
            return False
        elif chunk not in schema:
            return False
        return True

    def __str__(self):
        return "#/" + "/".join(map(str, self.chunks))


class Schema:
    def __init__(self, schema, path):
        self.schema = schema
        self.path = SchemaPath(path)

    def __getitem__(self, key):
        return Schema(SchemaPath.step(self.schema, key), self.path / key).value

    def __truediv__(self, key):
        return Schema(SchemaPath.step(self.schema, key), self.path / key)

    def __contains__(self, item):
        return isinstance(self.schema, dict) and item in self.schema

    @property
    def value(self):
        return self.schema

    def __iter__(self):
        if isinstance(self.schema, list):
            iter = enumerate(self.schema)
        elif isinstance(self.schema, dict):
            iter = self.schema.items()
        else:
            return

        for key, value in iter:
            if isinstance(value, (object, list)):
                yield self / key


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
        for unused in self.expected_refs:
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

        self.expected_refs.discard(schema.value)
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


filename = pathlib.Path(__file__).parent.parent / "docs" / "schema" / "lottie.schema.json"

with open(filename) as file:
    data = json.load(file)

validator = Validator()
validator.validate(data)
if validator.has_error:
    sys.exit(1)
