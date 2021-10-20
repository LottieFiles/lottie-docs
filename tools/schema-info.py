#!/usr/bin/env python3
import json
import urllib
import pathlib
import argparse
import dataclasses


@dataclasses.dataclass
class ObjectSummary:
    type: str = ""
    title: str = ""
    required: set[str] = dataclasses.field(default_factory=set)
    properties: set[str] = dataclasses.field(default_factory=set)


class SchemaLocation:
    def __init__(self):
        self.cached = {}

    def _on_fetch(self, ref: str):
        raise NotImplemented()

    def fetch(self, ref: str):
        if ref in self.cached:
            return self.cached[ref]

        data = self._on_fetch(ref)
        self.cached[ref] = data
        return data

    def inspect_object(self, schema_object: dict, object_summary: ObjectSummary):
        if "properties" in schema_object:
            object_summary.properties |= set(schema_object["properties"].keys())

        if "required" in schema_object:
            object_summary.required |= set(schema_object["required"])

        for aggregate_type in ["allOf", "anyOf", "oneOf"]:
            if aggregate_type in schema_object:
                for aggregate in schema_object[aggregate_type]:
                    self.inspect_object(aggregate, object_summary)

        if "if" in schema_object:
            for condition in ["then", "else"]:
                if condition in schema_object:
                    self.inspect_object(schema_object[condition], object_summary)

        if "$ref" in schema_object:
            self.inspect_object(self.fetch(schema_object["$ref"]), object_summary)

    def get_summary(self, schema_object: dict):
        summary = ObjectSummary()
        self.inspect_object(schema_object, summary)
        summary.title = schema_object.get("title", "")
        summary.type = schema_object.get("type", "")
        return summary


class SchemaLocationPath(SchemaLocation):
    def __init__(self, root):
        super().__init__()
        self.root = pathlib.Path(root)

    def _on_fetch(self, ref: str):
        filename = ref.strip("#/") + ".json"
        if filename.startswith("$defs/"):
            filename = filename[6:]
        with open(self.root / filename) as f:
            return json.load(f)


def cmd_summary(ns):
    schema = SchemaLocationPath(ns.root)
    summary = schema.get_summary(schema.fetch(ns.object_ref))
    print(summary.title)
    print("type: %s" % summary.type)
    print("properties:")
    for prop in sorted(summary.properties):
        print(" * " + prop)
    print("required:")
    for prop in sorted(summary.required):
        print(" * " + prop)


def diff_sets(vals1, vals2):
    for item in vals1|vals2:
        if item in vals1 and item in vals2:
            op = " "
        elif item in vals1:
            op = "-"
        elif item in vals2:
            op = "+"
        print(" %s %s" % (op, item))


def cmd_diff(ns):
    schema_1 = SchemaLocationPath(ns.root_1)
    summary_1 = schema_1.get_summary(schema_1.fetch(ns.object_ref_1))
    schema_2 = SchemaLocationPath(ns.root_2)
    summary_2 = schema_2.get_summary(schema_2.fetch(ns.object_ref_2))
    print("properties:")
    diff_sets(summary_1.properties, summary_2.properties)
    print("required:")
    diff_sets(summary_1.required, summary_2.required)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers()

    summary = sub.add_parser("summary", aliases=["s"])
    summary.set_defaults(func=cmd_summary)
    summary.add_argument("root")
    summary.add_argument("object_ref")

    diff = sub.add_parser("diff", aliases=["d"])
    diff.set_defaults(func=cmd_diff)
    diff.add_argument("root_1")
    diff.add_argument("object_ref_1")
    diff.add_argument("root_2")
    diff.add_argument("object_ref_2")

    ns = parser.parse_args()
    ns.func(ns)
