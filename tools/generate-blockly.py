#!/usr/bin/env python3

import sys
import json
import inspect
import pathlib
import argparse
import dataclasses
from xml.etree import ElementTree


class BlockDef:
    _blocks = {}

    def __init__(self, type, values={}, fields={}):
        self.type = type
        self.values = dict(values)
        self.fields = dict(fields)

    def populate_element(self, element: ElementTree.Element):
        element.attrib["type"] = self.type

        for input_name, shadow_type in self.values.items():
            value = ElementTree.SubElement(element, "value", {"name": input_name})
            if isinstance(shadow_type, str):
                shadow = ElementTree.SubElement(value, "shadow", {"type": shadow_type})
                if shadow_type in BlockDef._blocks:
                    BlockDef._blocks[shadow_type].populate_element(shadow)
            else:
                shadow = ElementTree.SubElement(value, "shadow")
                shadow_type.populate_element(shadow)

        for field_name, field_value in self.fields.items():
            ElementTree.SubElement(element, "field", {"name": field_name}).text = str(field_value)

    def get_element(self):
        element = ElementTree.Element("block")
        self.populate_element(element)
        return element

    @staticmethod
    def block_definition(type, create=True):
        if type not in BlockDef._blocks:
            if not create:
                return None
            BlockDef._blocks[type] = BlockDef(type)
        return BlockDef._blocks[type]


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

        self.add_newline()

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

    def add_custom_attributes(self):
        self.add_label("Custom Attributes")
        self.add_newline()

        self.add_arg({
            "type": "input_statement",
            "name": "custom_attributes",
            "check": "object_member",
        })

        self.serialize.append(
            "...this.object_members_to_json(block, 'custom_attributes')"
        )

    def add_label(self, label):
        self.message += " " + label

    def add_input(self, label, name, split=False, **kwargs):
        self.add_label(label)

        self.add_arg({
            "type": "input_value",
            "name": name,
            **kwargs
        })

        if split:
            self.serialize.append(
                "...this.maybe_split_property(block, '{name}')".format(name=name)
            )
        else:
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
            "inputsInline": False,
            **self.kwargs,
        }

    def add_base_input(self, base):
        self.add_label(base.title)

        self.add_arg({
            "type": "input_value",
            "name": base.infix,
            "check": base.infix
        })

        BlockDef.block_definition(self.type).values[base.infix] = base.infix

        self.serialize.append(
            "...this.input_to_json(block, '{name}')".format(name=base.infix)
        )

    def add_dropdown(self, label, name, type, options):

        self.add_label(label)

        cast_pre = ""
        cast_post = ""

        if type == "integer" or type == "number":
            cast_pre = "Number("
            cast_post = ")"

        field = {
            "type": "field_dropdown",
            "name": name,
            "options": [['--', '']] + options
        }

        self.add_arg(field)

        self.serialize.append(
            "'{name}': block.getFieldValue('{name}') === '' ? undefined : {cast_pre}block.getFieldValue('{name}'){cast_post}"
            .format(name=name, cast_pre=cast_pre, cast_post=cast_post)
        )

        self.add_newline()


@dataclasses.dataclass
class Category:
    hue: int
    title: str
    infix: str = ""


class SchemaProperties:
    def __init__(self):
        self.properties = {}
        self.required = set()
        self.order = []

    def add_property(self, name, property, order=None):
        if name not in self.order:
            if order:
                self.order.insert(order, name)
            else:
                self.order.append(name)
        self.properties[name] = property

    def index_of(self, name):
        return self.order.index(name)

    def remove_property(self, name):
        if self.properties.pop(name, None) is not None:
            self.order.remove(name)

    def add_properties(self, schema_object, schema, only=None):
        if "properties" in schema_object:
            for name, property in schema_object["properties"].items():
                if not only or name in only:
                    self.add_property(name, property)

        if "required" in schema_object:
            self.required |= set(schema_object["required"])

        if "allOf" in schema_object:
            for base in schema_object["allOf"]:
                if "properties" in base:
                    self.add_properties(base, schema, only)
                elif "$ref" in base:
                    base_ref = base["$ref"]
                    if base_ref in split_bases:
                        self.add_property(base_ref, {"type": "base", "$ref": base_ref})
                    else:
                        self.add_properties(schema.get_ref(base_ref).value, schema, only)
        return self

    def to_blockly(self, blockly: BlocklyType, schema):
        for name in self.order:
            self.property_to_blockly(blockly, schema, name, dict(self.properties[name]))

    def property_to_blockly(self, blockly: BlocklyType, schema, name, property):
        ref = property.get("$ref", "")
        options = None

        if ref == "#/$defs/helpers/int-boolean":
            property["type"] = "int-boolean"
        elif ref and "/constants/" in ref:
            options = [
                [value["title"], str(value["const"])]
                for value in schema.get_ref(ref)["oneOf"]
            ]
        elif ref:
            original = property
            property = dict(schema.get_ref(ref).value)
            property.update(original)

        label = property.get("title", None)
        type = property.get("type", None)

        if options:
            blockly.add_dropdown(label, name, type, options)
        elif type in {"number", "integer", "boolean", "int-boolean", "string"}:
            kwargs = {}
            required = name in self.required
            if "const" in property:
                kwargs["const"] = property["const"]
                required = True
            elif type in {"boolean", "int-boolean"}:
                required = True

            if required:
                if "default" in property:
                    kwargs["value"] = property["default"]
                if "minimum" in property:
                    kwargs["min"] = property["minimum"]
                if "maximum" in property:
                    kwargs["max"] = property["maximum"]

                blockly.add_attribute(label, name, type, **kwargs)
            else:
                blockly.add_input(label, name, check="value")

        elif type == "object":
            kwargs = {}
            if "animated-properties" in ref:
                kwargs["check"] = "property"
            if name == "p":
                kwargs["split"] = True
            blockly.add_input(label, name, **kwargs)
        elif type == "array":
            kwargs = {}
            if "items" in property:
                if "oneOf" in property["items"] and "$ref" in property["items"]["oneOf"][0]:
                    kwargs["check"] = property["items"]["oneOf"][0]["$ref"].split("/")[-2]
                elif "$ref" in property["items"]:
                    chunks = property["items"]["$ref"].split("/")
                    group = chunks[-2]
                    if group in categories:
                        cat = categories[group]
                        cls = chunks[-1]
                        check = "lottie_" + cat.infix + cls.replace("-", "_")
                        kwargs["check"] = check
            blockly.add_list(label, name, **kwargs)
        elif type == "base":
            blockly.add_base_input(split_bases[property["$ref"]])


def convert_object(schema_object, schema):
    help_links = md_extensions.ref_links(str(schema_object.path), None)
    if not len(help_links):
        return

    link = help_links[0]

    help_url = "/lottie-docs/%s/#%s" % (link.page, link.anchor)

    cat = categories[link.group]
    label = schema_object["title"]
    path = str(schema_object.path)
    name = "lottie_" + cat.infix + link.cls.replace("-", "_")
    hue = custom_colors.get(path, cat.hue)
    if path == "#/$defs/shapes/transform":
        name += "_shape"

    if path in exclude:
        return

    blockly = BlocklyType(name, label, hue, help_url)
    blockly_types.setdefault(link.group, []).append(blockly)
    blockly.add_label(label)
    blockly.add_newline()

    if link.cls in ("stroke-dash",):
        blockly.kwargs["previousStatement"] = name
        blockly.kwargs["nextStatement"] = name
    elif link.group in ("layers", "shapes", "assets", "effects", "effect-values"):
        blockly.kwargs["previousStatement"] = link.group
        blockly.kwargs["nextStatement"] = link.group
    elif link.cls != "animation":
        blockly.kwargs["output"] = None

    if path in split_bases:
        base = split_bases[str(schema_object.path)]
        blockly.add_base_input(base)
        properties = SchemaProperties()
        properties.required = set("ty")
        properties.add_properties(schema_object.value, schema, ["ty"])
        properties.to_blockly(blockly, schema)
        blockly.add_custom_attributes()
        properties = SchemaProperties()
        base_blockly = BlocklyType(base.infix, base.title, base.hue, help_url)
        base_blockly.add_label(base.title)
        base_blockly.add_newline()
        base_blockly.kwargs["output"] = base.infix

        properties.add_properties(schema_object.value, schema)
        properties.remove_property("ty")
        properties.to_blockly(base_blockly, schema)
        blockly_types[link.group].insert(0, base_blockly)
    else:
        properties = SchemaProperties()
        properties.add_properties(schema_object.value, schema)
        if path == "#/$defs/shapes/transform":
            properties.add_property(
                "p",
                {"title": "Position", "$ref": "#/$defs/animated-properties/position"},
                properties.index_of("a") + 1
            )
        properties.to_blockly(blockly, schema)
        if path in other_bases:
            blockly.add_custom_attributes()


def write_js(file):
    toolbox_items = []
    file.write("Blockly.defineBlocksWithJsonArray([\n")

    for cat_name, object_list in blockly_types.items():
        cat_contents = []

        for obj in object_list:
            json.dump(obj.to_json_array(), file, indent=4)
            file.write(",\n")
            toolbox_item = {"kind": "block", "type": obj.type}
            blockxml = BlockDef.block_definition(obj.type, False)
            if blockxml:
                toolbox_item["blockxml"] = ElementTree.tostring(blockxml.get_element()).decode("us-ascii")
            cat_contents.append(toolbox_item)

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
    for child in sorted(schema_object, key=lambda o: o.path.chunks[-1]):
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
    "effects": Category(330, "Effects"),
    "effect-values": Category(300, "Effect Values", "effect_value_"),
}
split_bases = {
    "#/$defs/layers/layer": Category(0, "Layer Properties", "lottie_layer_common")
}
other_bases = {
    "#/$defs/shapes/shape-element",
    "#/$defs/effects/effect",
    "#/$defs/effects/effect-value"
}
custom_colors = {
    "#/$defs/shapes/stroke-dash": 0,
    "#/$defs/shapes/repeater-transform": 330
}
exclude = {
    "#/$defs/animation/composition",
    "#/$defs/shapes/shape",
    "#/$defs/shapes/modifier",
    "#/$defs/shapes/shape-list",
    "#/$defs/shapes/gradient",
    "#/$defs/shapes/base-stroke",
    "#/$defs/shapes/twist",
    "#/$defs/shapes/merge",
    "#/$defs/shapes/offset-path",
    "#/$defs/effects/misc-effect",
}
blockly_types = {}

with open(schema_filename) as file:
    data = json.load(file)

schema = schema_validate.Schema(data)

for cat in categories.keys():
    convert_group(schema.get_ref("#/$defs/" + cat), schema)

BlockDef.block_definition("lottie_transform_shape").values = {
    "s": BlockDef("lottie_property_static", {
        "value": BlockDef("lottie_vector2d", {}, {
            "x": 100,
            "y": 100
        })
    }),
    "o": BlockDef("lottie_property_static", {
        "value": BlockDef("json_number", {}, {
            "value": 100,
        })
    })
}

BlockDef.block_definition("lottie_layer_common").values = {
    "ks": "lottie_transform"
}

BlockDef.block_definition("lottie_rectangle").values = {
    "p": BlockDef("lottie_property_static", {
        "value": BlockDef("lottie_vector2d", {}, {
            "x": 0,
            "y": 0
        })
    }),
    "s": BlockDef("lottie_property_static", {
        "value": BlockDef("lottie_vector2d", {}, {
            "x": 100,
            "y": 100
        })
    }),
    "r": BlockDef("lottie_property_static", {
        "value": BlockDef("json_number", {}, {
            "value": 0,
        })
    })
}

BlockDef.block_definition("lottie_ellipse").values = {
    "p": BlockDef("lottie_property_static", {
        "value": BlockDef("lottie_vector2d", {}, {
            "x": 0,
            "y": 0
        })
    }),
    "s": BlockDef("lottie_property_static", {
        "value": BlockDef("lottie_vector2d", {}, {
            "x": 100,
            "y": 100
        })
    })
}

BlockDef.block_definition("lottie_fill").values = {
    "c": BlockDef("lottie_property_static", {
        "value": BlockDef("lottie_color", {}, {
            "r": 0,
            "g": 0,
            "b": 0
        })
    }),
    "o": BlockDef("lottie_property_static", {
        "value": BlockDef("json_number", {}, {
            "value": 100,
        })
    })
}

BlockDef.block_definition("lottie_stroke").values = {
    "c": BlockDef("lottie_property_static", {
        "value": BlockDef("lottie_color", {}, {
            "r": 0,
            "g": 0,
            "b": 0
        })
    }),
    "o": BlockDef("lottie_property_static", {
        "value": BlockDef("json_number", {}, {
            "value": 100,
        })
    }),
    "w": BlockDef("lottie_property_static", {
        "value": BlockDef("json_number", {}, {
            "value": 1,
        })
    })
}

js_filename = root / "docs" / "scripts" / "blockly_generated.js"
with open(js_filename, "w") as file:
    write_js(file)
