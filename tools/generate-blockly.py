#!/usr/bin/env python3

import sys
import json
import inspect
import pathlib
import argparse
import dataclasses


class BlocklyType:
    def __init__(self, type, name, colour, help_url, **kwargs):
        self.colour = colour
        self.help_url = help_url
        self.type = type
        self.args = []
        self.message = ""
        self.serialize = []
        self.name = name
        self.kwargs = kwargs
        self.properties = {}

    def add_arg(self, arg):
        self.args.append(arg)
        self.message += " %%%s" % len(self.args)

    def add_newline(self):
        self.add_arg({"type": "input_dummy"})

    def add_attribute(self, label, name, type, **kwargs):
        self.add_label(label)

        cast_pre = ""
        cast_post = ""

        if type == "integer" or type == "number":
            cast_pre = "Number("
            cast_post = ")"
            type = "number"
        elif type == "string":
            type = "input"
        elif type == "int-boolean":
            cast_pre = "'TRUE' =="
            cast_post = " ? 1 : 0"
            type = "checkbox"
        elif type == "boolean":
            type = "checkbox"
            cast_pre = "'TRUE' =="

        if type == "checkbox" and "value" in kwargs:
            kwargs["checked"] = bool(kwargs.pop("value"))

        if "const" in kwargs:
            type = "label_serializable"
            kwargs["text"] = str(kwargs.pop("const"))

        field = {
            "type": "field_" + type,
            "name": name,
            **kwargs
        }

        self.add_arg(field)

        self.serialize.append(
            "'{name}': {cast_pre}block.getFieldValue('{name}'){cast_post}".format(name=name, cast_pre=cast_pre, cast_post=cast_post)
        )

    def add_list(self, label, name, **kwargs):
        self.add_label(label)

        self.add_arg({
            "type": "input_statement",
            "name": name,
            **kwargs
        })

        self.serialize.append(
            "'{name}': this.statements_to_json(block, '{name}')".format(name=name)
        )

    def add_label(self, label):
        if self.message:
            self.add_newline()

        self.message += " " + label

    def add_input(self, label, name, **kwargs):
        self.add_label(label)

        self.add_arg({
            "type": "input_value",
            "name": name,
            **kwargs
        })

        self.serialize.append(
            "'{name}': this.input_to_json(block, '{name}')".format(name=name)
        )

    def to_serialize_function(self):
        indent = " " * 4 * 2
        return inspect.cleandoc(r"""
            {type}(block)
            {{
                return {{
                    {code}
                }};
            }}
        """).format(type=self.type, code=(",\n"+indent).join(self.serialize))

    def to_json_array(self):
        return {
            "type": self.type,
            "message0": self.message,
            "args0": self.args,
            "colour": self.colour,
            "helpUrl": self.help_url,
            "tooltip": self.name,
            **self.kwargs,
        }

    def compile(self):
        for name, property in self.properties.items():
            label = property.get("title", None)
            type = property.get("type", None)

            if name == "parent":
                self.add_input(label, name, check="value")
            elif type in {"number", "integer", "boolean", "int-boolean", "string"}:
                kwargs = {}
                if "minimum" in property:
                    kwargs["min"] = property["minimum"]
                if "maximum" in property:
                    kwargs["max"] = property["maximum"]
                if "default" in property:
                    kwargs["value"] = property["default"]
                if "const" in property:
                    kwargs["const"] = property["const"]
                self.add_attribute(label, name, type, **kwargs)
            elif type == "object":
                self.add_input(label, name)
            elif type == "array":
                kwargs = {}
                if "items" in property:
                    if "oneOf" in property["items"] and "$ref" in property["items"]["oneOf"][0]:
                        kwargs["check"] = property["items"]["oneOf"][0]["$ref"].split("/")[-2]
                self.add_list(label, name, **kwargs)


@dataclasses.dataclass
class Category:
    hue: int
    title: str
    infix: str = ""


def add_properties(schema_object, schema, blockly):
    if "properties" in schema_object:
        for name, property in schema_object["properties"].items():
            property = dict(property)
            ref = property.get("$ref", None)

            if ref == "#/$defs/helpers/int-boolean":
                property["type"] = "int-boolean"
            elif ref:
                original = property
                property = dict(schema.get_ref(ref).value)
                property.update(original)

            blockly.properties[name] = property

    if "allOf" in schema_object:
        for base in schema_object["allOf"]:
            if "properties" in base:
                add_properties(base, schema, blockly)
            elif "$ref" in base:
                add_properties(schema.get_ref(base["$ref"]).value, schema, blockly)


def convert_object(schema_object, schema):
    help_links = md_extensions.ref_links(str(schema_object.path), None)
    if not len(help_links):
        return

    link = help_links[0]

    if link.cls == "composition":
        return

    help_url = "/lottie-docs/%s/#%s" % (link.page, link.anchor)

    cat = categories[link.group]
    label = schema_object["title"]
    blockly = BlocklyType("lottie_" + cat.infix + link.cls.replace("-", "_"), label, cat.hue, help_url)
    blockly_types.setdefault(link.group, []).append(blockly)
    blockly.add_label(label)

    if link.group in ("layers", "shapes", "assets"):
        blockly.kwargs["previousStatement"] = link.group
        blockly.kwargs["nextStatement"] = link.group
    elif link.cls != "animation":
        blockly.kwargs["output"] = None

    add_properties(schema_object.value, schema, blockly)
    blockly.compile()


def write_js(file):
    toolbox_items = []
    file.write("Blockly.defineBlocksWithJsonArray([\n")

    for cat_name, object_list in blockly_types.items():
        cat_contents = []

        for obj in object_list:
            json.dump(obj.to_json_array(), file, indent=4)
            file.write(",\n")
            cat_contents.append({"kind": "block", "type": obj.type})

        toolbox_items.append({
            "kind": "category",
            "name": categories[cat_name].title,
            "colour": categories[cat_name].hue,
            "contents": cat_contents
        })
    file.write("]);\n\n")

    file.write("const generated_toolbox = ")
    toolbox = {
        "kind": "categoryToolbox",
        "contents": toolbox_items
    }
    json.dump(toolbox, file, indent=4)
    file.write(";\n\n")

    file.write("class GeneratedGenerator{\n")
    for cat_name, object_list in blockly_types.items():
        for obj in object_list:
            file.write(obj.to_serialize_function())
            file.write("\n")
    file.write("}\n")


def convert_group(schema_object, schema):
    for child in schema_object:
        convert_object(child, schema)


root = pathlib.Path(__file__).parent.parent
sys.path.append(str(root / "extensions"))
md_extensions = __import__("md_extensions")
schema_validate = __import__("schema-validate")

schema_filename = root / "docs" / "schema" / "lottie.schema.json"

categories = {
    "animation": Category(260, "Animation"),
    "layers": Category(60, "Layers"),
    "shapes": Category(120, "Shapes"),
    "assets": Category(30, "Assets"),
}
blockly_types = {}

with open(schema_filename) as file:
    data = json.load(file)

schema = schema_validate.Schema(data)

for cat in categories.keys():
    convert_group(schema.get_ref("#/$defs/" + cat), schema)

js_filename = root / "docs" / "scripts" / "blockly_generated.js"
with open(js_filename, "w") as file:
    write_js(file)
