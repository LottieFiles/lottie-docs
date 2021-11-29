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

        if schema_object.get("type", None) != "object" and "oneOf" in schema_object:
            for enum in schema_object["oneOf"]:
                if "const" in enum:
                    object_summary.properties.add(enum["const"])

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


def diff_sets(vals1, vals2, show_same):
    for item in vals1|vals2:
        if item in vals1 and item in vals2:
            if not show_same:
                continue
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
    diff_sets(summary_1.properties, summary_2.properties, True)
    print("required:")
    diff_sets(summary_1.required, summary_2.required, True)


def cmd_compare(ns):
    mappings = [
        # Community / lottie-docs
        ("animation", "animation/animation"),
        ("effects/angle", "effect-values/angle"),
        ("effects/checkBox", "effect-values/checkbox"),
        ("effects/color", "effect-values/color"),
        #("effects/customValue", "effect-values/"),
        ("effects/dropDown", "effect-values/drop-down"),
        ("effects/fill", "effects/fill-effect"),
        ("effects/group", "effects/custom-effect"),
        #("effects/index", "effects/"),
        #("effects/layer", "effects/"),
        ("effects/noValue", "effect-values/no-value"),
        ("effects/point", "effect-values/point"),
        ("effects/proLevels", "effects/pro-levels-effect"),
        ("effects/slider", "effect-values/slider"),
        ("effects/stroke", "effects/stroke-effect"),
        ("effects/tint", "effects/tint-effect"),
        ("effects/tritone", "effects/tritone-effect"),
        ("helpers/blendMode", "constants/blend-mode"),
        ("helpers/boolean", "helpers/int-boolean"),
        ("helpers/composite", "constants/composite"),
        ("helpers/lineCap", "constants/line-cap"),
        ("helpers/lineJoin", "constants/line-join"),
        ("helpers/mask", "helpers/mask"),
        ("helpers/textBased", "constants/text-based"),
        ("helpers/textCaps", "constants/text-caps"),
        ("helpers/textGrouping", "constants/text-grouping"),
        ("helpers/textJustification", "constants/text-justify"),
        ("helpers/textShape", "constants/text-shape"),
        ("helpers/transform", "helpers/transform"),
        ("layers/image", "layers/image-layer"),
        ("layers/null", "layers/null-layer"),
        ("layers/preComp", "layers/precomposition-layer"),
        ("layers/shape", "layers/shape-layer"),
        ("layers/solid", "layers/solid-color-layer"),
        ("layers/text", "layers/text-layer"),
        #("properties/doubleKeyframe", "animated-properties/"),
        ("properties/gradient", "animated-properties/gradient-colors"),
        ("properties/multiDimensional", "animated-properties/multi-dimensional"),
        ("properties/multiDimensionalKeyframed", "animated-properties/multi-dimensional"),
        ("properties/multiDimensionalSpatialKeyframed", "animated-properties/position"),
        ("properties/offsetKeyframe", "animated-properties/keyframe"),
        ("properties/offsetSpatialKeyframe", "animated-properties/position-keyframe"),
        ("properties/shape", "animated-properties/shape-property"),
        ("properties/shapeKeyframed", "animated-properties/shape-property"),
        ("properties/shapeProp", "helpers/bezier"),
        ("properties/shapePropKeyframe", "animated-properties/shape-keyframe"),
        ("properties/value", "animated-properties/value"),
        #("properties/valueKeyframe", "animated-properties/keyframe"),
        ("properties/valueKeyframed", "animated-properties/value"),
        ("shapes/ellipse", "shapes/ellipse"),
        ("shapes/fill", "shapes/fill"),
        ("shapes/gFill", "shapes/gradient-fill"),
        ("shapes/gStroke", "shapes/gradient-stroke"),
        ("shapes/merge", "shapes/merge"),
        ("shapes/rect", "shapes/rectangle"),
        ("shapes/repeater", "shapes/repeater"),
        ("shapes/round", "shapes/rounded-corners"),
        ("shapes/shape", "shapes/path"),
        ("shapes/star", "shapes/polystar"),
        ("shapes/stroke", "shapes/stroke"),
        ("shapes/transform", "shapes/transform"),
        ("shapes/trim", "shapes/trim"),
        ("sources/image", "assets/image"),
        ("sources/precomp", "assets/precomposition"),
        ("sources/chars", "text/character-data"),

        (("layers/text", "properties", "t", "properties", "d", "properties", "k", "items", "properties", "s"), "text/text-document"),
        (("layers/text", "properties", "t", "properties", "d", "properties", "k", "items"), "text/text-data-keyframe"),
        (("layers/text", "properties", "t", "properties", "d"), "text/text-data"),
        (("layers/text", "properties", "t"), "text/text-animator-data"),
    ]
    here_ignored = {
        "effect-values/effect-value",
        "shapes/gradient",
        "helpers/visual-object",
        "layers/layer",
        "shapes/modifier",
        "shapes/shape-list",
        "animated-properties/animated-property",
        "text/font-list",
        "animated-properties/color-value",
        "shapes/shape",
        "assets/asset",
        "shapes/base-stroke",
        "effects/effect",
        "lottie.schema",
        "shapes/shape-element",
        "animation/composition",
        "helpers/color",
    }

    here = SchemaLocationPath(pathlib.Path(__file__).parent.parent / "docs" / "schema")
    there = SchemaLocationPath(ns.schema_root)
    here_unused = set(str(x.relative_to(here.root))[:-5] for x in here.root.glob("**/*.json"))
    there_unused = set(str(x.relative_to(there.root))[:-5] for x in there.root.glob("**/*.json"))

    here_unused -= here_ignored

    for there_file, here_file in mappings:
        there_sub = tuple()
        if isinstance(there_file, tuple):
            there_sub = there_file[1:]
            there_file = there_file[0]
        else:
            there_unused.discard(there_file)

        here_unused.discard(here_file)
        summary_here = here.get_summary(here.fetch(here_file))
        data_there = there.fetch(there_file)
        for attr in there_sub:
            data_there = data_there[attr]
        summary_there = there.get_summary(data_there)
        prop_diff = summary_here.properties != summary_there.properties
        req_diff = summary_here.required != summary_there.required

        if not prop_diff and not req_diff:
            continue

        print("%s %s" % (here_file, there_file))
        if prop_diff:
            print("properties:")
            diff_sets(summary_here.properties, summary_there.properties, False)

        if req_diff:
            print("required:")
            diff_sets(summary_here.required, summary_there.required, False)

        print("")

    print("Files")
    diff_sets(here_unused, there_unused, False)


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

    compare = sub.add_parser("compare-schemas", aliases=["c"])
    compare.set_defaults(func=cmd_compare)
    compare.add_argument("schema_root")

    ns = parser.parse_args()
    ns.func(ns)
