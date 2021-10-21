import re
import os
import json
import inspect
import dataclasses
from typing import Any
from pathlib import Path
import xml.etree.ElementTree as etree
from xml.etree.ElementTree import parse as parse_xml
from markdown.inlinepatterns import InlineProcessor
from markdown.blockprocessors import BlockProcessor
from markdown.extensions import Extension


docs_path = Path(__file__).parent.parent / "docs"


def etree_fontawesome(icon, group="fas"):
    el = etree.Element("i")
    el.attrib["class"] = "%s fa-%s" % (group, icon)
    return el


def clean_link(filename):
    if not filename.startswith("/") and not filename.startswith("."):
        filename = "../" + filename
    return filename


def css_style(**args):
    string = ""
    for k, v in args.items():
        string += "%s:%s;" % (k.replace("_", "-"), v)

    return string


class LottieRenderer:
    _id = 0

    @staticmethod
    def render(*, parent: etree.Element = None, url=None, json_data=None, download_file=None, width=None, height=None):
        element = etree.Element("div")

        if parent is not None:
            parent.append(element)

        animation = etree.SubElement(element, "div")
        animation.attrib["class"] = "alpha_checkered"
        animation.attrib["id"] = "lottie_target_%s" % LottieRenderer._id

        if width:
            animation.attrib["style"] = "width:%spx;height:%spx" % (width, height)

        play = etree.Element("button")
        element.append(play)
        play.attrib["id"] = "lottie_play_{id}".format(id=LottieRenderer._id)
        play.attrib["onclick"] = (
            "anim_{id}.play(); " +
            "document.getElementById('lottie_pause_{id}').style.display = 'inline-block'; " +
            "this.style.display = 'none'"
        ).format(id=LottieRenderer._id)
        play.append(etree_fontawesome("play"))
        play.attrib["title"] = "Play"
        play.attrib["style"] = "display:none"

        pause = etree.Element("button")
        element.append(pause)
        pause.attrib["id"] = "lottie_pause_{id}".format(id=LottieRenderer._id)
        pause.attrib["onclick"] = (
            "anim_{id}.pause(); " +
            "document.getElementById('lottie_play_{id}').style.display = 'inline-block'; " +
            "this.style.display = 'none'"
        ).format(id=LottieRenderer._id)
        pause.append(etree_fontawesome("pause"))
        pause.attrib["title"] = "Pause"

        if download_file:
            download = etree.Element("a")
            element.append(download)
            download.attrib["href"] = download_file
            if download_file.endswith("rawr"):
                download.attrib["download"] = ""
            download.attrib["title"] = "Download"
            download_button = etree.Element("button")
            download.append(download_button)
            download_button.append(etree_fontawesome("download"))

        script = etree.Element("script")
        element.append(script)

        if json_data is None:
            script.text = """
                var anim_{id} = bodymovin.loadAnimation({{
                    container: document.getElementById('lottie_target_{id}'),
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    path: '{file}'
                }});
            """.format(id=LottieRenderer._id, file=url)
        else:
            script.text = """
                var lottie_json_{id} = {json_data};

                var anim_{id} = null;

                function reload_lottie_{id}()
                {{
                    var animData = {{
                        container: document.getElementById('lottie_target_{id}'),
                        renderer: 'svg',
                        loop: true,
                        autoplay: true,
                        // parse/stringify because the player modifies the passed object
                        animationData: JSON.parse(JSON.stringify(lottie_json_{id}))
                    }};
                    if ( anim_{id} != null )
                        anim_{id} = anim_{id}.destroy();
                    anim_{id} = bodymovin.loadAnimation(animData);
                }}

                reload_lottie_{id}();
            """.format(id=LottieRenderer._id, json_data=json.dumps(json_data))

        id = LottieRenderer._id
        LottieRenderer._id += 1

        return (element, id)


def get_url(md, path):
    # Mkdocs adds a tree processor to adjust urls, but it won't work with lottie js so we do the same here
    processor = next(proc for proc in md.treeprocessors if proc.__class__.__module__ == 'mkdocs.structure.pages')
    return processor.files.get_file_from_path(path).url_relative_to(processor.file)


class LottieInlineProcessor(InlineProcessor):
    def __init__(self, md):
        pattern = r'{lottie:([^:]+)(?::([0-9]+):([0-9]+))}'
        super().__init__(pattern, md)

    def handleMatch(self, m, data):
        filename = "examples/" + m.group(1)
        lottie_url = get_url(self.md, filename)
        # mkdocs will perform something similar to get_url to all the href, so we counteract it...
        download_file = lottie_url[3:]

        element = LottieRenderer.render(
            url=lottie_url,
            download_file=download_file,
            width=m.group(2),
            height=m.group(3)
        )[0]

        return element, m.start(0), m.end(0)


class LottieColor(InlineProcessor):
    def __init__(self, pattern, md, mult):
        super().__init__(pattern, md)
        self.mult = mult

    def handleMatch(self, match, data):
        span = etree.Element("span")
        span.attrib["style"] = "font-family: right"

        comp = [float(match.group(i)) / self.mult for i in range(2, 5)]

        hex = "#" + "".join("%02x" % round(x * 255) for x in comp)
        color = etree.SubElement(span, "span")
        color.attrib["style"] = css_style(
            width="24px",
            height="24px",
            background_color=hex,
            border="1px solid black",
            display="inline-block",
            vertical_align="middle",
            margin_right="0.5ex"
        )

        etree.SubElement(span, "code").text = "[%s]" % ", ".join("%.3g" % x for x in comp)

        return span, match.start(0), match.end(0)


class Matrix(BlockProcessor):
    RE_FENCE_START = r'^\s*\{matrix\}\s*\n'

    def test(self, parent, block):
        return re.match(self.RE_FENCE_START, block)

    def run(self, parent, blocks):
        table = etree.SubElement(parent, "table")
        table.attrib["style"] = "font-family: monospace; text-align: center; "
        table.attrib["class"] = "table-plain matrix"
        rows = blocks.pop(0)
        for row in rows.split("\n")[1:]:
            tr = etree.SubElement(table, "tr")
            for cell in row.split():
                td = etree.SubElement(tr, "td")
                td.text = cell
                td.attrib["style"] = "width: 25%;"
        return True


class SchemaData:
    _data = None

    @classmethod
    def get_schema(cls):
        if cls._data is None:
            with open(docs_path / "schema" / "lottie.schema.json") as file:
                cls._data = json.load(file)
        return cls._data

    def get_ref(self, ref: str):
        if not ref.startswith("#/"):
            ref = "$defs/" + ref
        return self.get_path(ref.strip("#").strip("/").split("/"))

    def get_path(self, path):
        schema = self.get_schema()
        for chunk in path:
            schema = schema[chunk]
        return schema

    def get_enum_values(self, name):
        enum = self.get_path(["$defs", "constants", name])
        data = []
        for item in enum["oneOf"]:
            data.append((item["const"], item["title"], item.get("description", "")))
        return data


class SchemaEnum(BlockProcessor):
    re_fence_start = re.compile(r'^\s*\{schema_enum:([^}]+)\}\s*(?:\n|$)')
    re_row = re.compile(r'^\s*(\w+)\s*:\s*(.*)')

    def test(self, parent, block):
        return self.re_fence_start.match(block)

    def run(self, parent, blocks):
        enum_name = self.test(parent, blocks[0]).group(1)

        enum_data = SchemaData().get_enum_values(enum_name)

        table = etree.SubElement(parent, "table")
        descriptions = {}

        for value, name, description in enum_data:
            if description:
                descriptions[str(value)] = description

        # Override descriptions if specified from markdown
        rows = blocks.pop(0)
        for row in rows.split("\n")[1:]:
            match = self.re_row.match(row)
            if match:
                descriptions[match.group(0)] = match.group(1)

        thead = etree.SubElement(etree.SubElement(table, "thead"), "tr")
        etree.SubElement(thead, "th").text = "Value"
        etree.SubElement(thead, "th").text = "Name"
        if descriptions:
            etree.SubElement(thead, "th").text = "Description"

        thead[-1].append(SchemaLink.element("constants/" + enum_name))

        tbody = etree.SubElement(table, "tbody")

        for value, name, _ in enum_data:
            tr = etree.SubElement(tbody, "tr")
            etree.SubElement(etree.SubElement(tr, "td"), "code").text = repr(value)
            etree.SubElement(tr, "td").text = name
            if descriptions:
                etree.SubElement(tr, "td").text = descriptions.get(str(value), "")

        return True


class SchemaAttribute(InlineProcessor):
    def __init__(self, md):
        super().__init__(r'\{schema_attribute:(?P<attribute>[^:]+):(?P<path>[^:]+)\}', md)

    def handleMatch(self, match, data):
        span = etree.Element("span")
        span.text = SchemaData().get_ref(match.group("path")).get(match.group("attribute"), "")
        return span, match.start(0), match.end(0)


class LottiePlayground(BlockProcessor):
    re_fence_start = re.compile(r'^\s*\{lottie_playground:([^:]+)(?::([0-9]+):([0-9]+))?\}')
    re_row = re.compile(r'^\s*(?P<label>[^:]*)\s*:\s*(?P<type>\w+)\s*:\s*(?P<path>[^:]*)\s*(?::\s*(?P<args>.*))?')

    def test(self, parent, block):
        return self.re_fence_start.match(block)

    def _json_viewer(self, element, anim_id, id_base, paths):
        json_viewer = id_base + "_json_viewer"
        json_viewer_parent = json_viewer + "_parent"

        toggle_json = etree.SubElement(element, "button")
        toggle_json.attrib["onclick"] = inspect.cleandoc(r"""
            var element = document.getElementById('{json_viewer_parent}');
            element.hidden = !element.hidden;
        """).format(json_viewer_parent=json_viewer_parent)
        icon = etree_fontawesome("file-code")
        icon.tail = " Show JSON"
        toggle_json.append(icon)
        toggle_json.attrib["title"] = "Toggle JSON"

        pre = etree.SubElement(element, "pre", {"id": json_viewer_parent, "hidden": "hidden"})
        etree.SubElement(pre, "code", {"id": json_viewer, "class": "language-json hljs"}).text = ""
        etree.SubElement(element, "script").text = inspect.cleandoc(r"""
            reload_lottie_{id} = (function(){{
                var old = reload_lottie_{id};
                return function(){{
                    old();
                    var raw_json = JSON.stringify(lottie_json_{id}.{path}, undefined, 4);
                    var pretty_json = hljs.highlight("json", raw_json).value;
                    var code = document.getElementById('{json_viewer}').innerHTML = pretty_json;
                }}
            }}
            )();
            document.getElementById('{json_viewer}').innerText = JSON.stringify(lottie_json_{id}.{path}, undefined, 4);
            """).format(id=anim_id, json_viewer=json_viewer, path=paths[0])

    def run(self, parent, blocks):
        block = blocks.pop(0)
        match = self.test(parent, block)

        with open(docs_path / "examples" / match.group(1)) as file:
            json_data = json.load(file)

        element, anim_id = LottieRenderer.render(
            parent=parent,
            json_data=json_data,
            width=match.group(2),
            height=match.group(3)
        )

        element.attrib["class"] = "playground"

        contols_container = etree.Element("table", {"class": "table-plain"})
        element.insert(0, contols_container)

        for index, line in enumerate(block.strip().split("\n")[1:]):
            row_match = self.re_row.match(line)
            if not row_match:
                raise Exception("Unexpected playground line %r" % line)

            type = row_match.group("type")
            paths = row_match.group("path").split(",")
            args = (row_match.group("args") or "").split(":")
            id_base = "playground_{id}_{index}".format(id=anim_id, index=index)

            if type == "json":
                self._json_viewer(element, anim_id, id_base, paths)
                continue

            tr = etree.SubElement(contols_container, "tr")

            label_cell = etree.SubElement(tr, "td")
            label_element = etree.SubElement(label_cell, "label")
            label_element.text = row_match.group("label")
            label_element.tail = " "

            td = etree.SubElement(tr, "td")

            setter = "lottie_setter({id}, {paths})".format(id=anim_id, paths=repr(paths))

            if type == "enum":
                input = self._select(td, setter, args, (
                    (title, value)
                    for value, title, _ in SchemaData().get_enum_values(args[0])
                ))

            elif type == "slider":
                input = etree.SubElement(td, "input", {
                    "type": "range",
                    "min": args[0],
                    "value": args[1],
                    "max": args[2],
                    "step": args[3] if len(args) > 3 else "1",
                    "oninput": inspect.cleandoc("""
                        {setter}(event.target.value);
                        document.getElementById('{span}').innerText = event.target.value;
                        reload_lottie_{id}();
                    """.format(id=anim_id, setter=setter, span=id_base + "_span"))
                })
                etree.SubElement(td, "span", {
                    "id": id_base + "_span"
                }).text = args[1]

            elif type == "select":
                input = self._select(td, setter, args, (item.split("=") for item in args))

            elif type == "text":
                input = etree.SubElement(td, "input", {
                    "type": "text",
                    "value": args[0],
                    "oninput": "{setter}(event.target.value)".format(setter=setter)
                })

            elif type == "label":
                label_cell.tag = "th"
                label_element.tag = "span"
                label_cell.attrib["colspan"] = "2"
                tr.remove(td)

            else:
                raise Exception("Unknown playground control %s" % type)

            if input is not None:
                input.attrib["autocomplete"] = "off"

    def _select(self, td, setter, args, items):
        input = etree.SubElement(td, "select")
        input.attrib["onchange"] = setter + "(event.target.value);"
        default_value = args[1] if len(args) > 1 else None

        for label, value in items:
            option = etree.SubElement(input, "option", {"value": str(value)})
            option.text = label
            if str(value) == default_value:
                option.attrib["selected"] = "selected"
        return input


@dataclasses.dataclass
class SchemaProperty:
    description: str = ""
    const: Any = None
    type: str = ""


class SchemaObject(BlockProcessor):
    re_fence_start = re.compile(r'^\s*\{schema_object:([^}]+)\}\s*(?:\n|$)')
    re_row = re.compile(r'^\s*(\w+)\s*:\s*(.*)')
    prop_fields = {f.name for f in dataclasses.fields(SchemaProperty)}

    def test(self, parent, block):
        return self.re_fence_start.match(block)

    def _add_properties(self, schema_props, prop_dict):
        for name, prop in schema_props.items():
            data = dict((k, v) for k, v in prop.items() if k in self.prop_fields)
            if "$ref" in prop and "type" not in prop:
                data["type"] = prop["$ref"]
            if "title" in prop and "description" not in prop:
                data["description"] = prop["title"]

            prop_dict[name] = SchemaProperty(**data)

    def _object_properties(self, object, prop_dict, base_list):
        if "properties" in object:
            self._add_properties(object["properties"], prop_dict)

        if "allOf" in object:
            for chunk in object["allOf"]:
                if "properties" in chunk:
                    self._add_properties(chunk["properties"], prop_dict)
                elif "$ref" in chunk:
                    base_list.append(chunk["$ref"])

    def _base_link(self, parent, ref):
        a = etree.SubElement(parent, "a")
        a.text = SchemaData().get_ref(ref)["title"]
        path_chunks = ref.split("/")
        a.attrib["href"] = "%s.md#%s" % (path_chunks[-2], path_chunks[-1])
        return a

    def run(self, parent, blocks):
        name = self.test(parent, blocks[0]).group(1)

        schema_data = SchemaData().get_ref(name)

        prop_dict = {}
        base_list = []
        self._object_properties(schema_data, prop_dict, base_list)

        # Override descriptions if specified from markdown
        rows = blocks.pop(0)
        for row in rows.split("\n")[1:]:
            match = self.re_row.match(row)
            if match:
                if match.group(1) == "EXPAND":
                    prop_dict_base = {}
                    base = match.group(2)
                    self._object_properties(SchemaData().get_ref(base), prop_dict_base, [])
                    base_list.remove(base)
                    prop_dict_base.update(prop_dict)
                    prop_dict = prop_dict_base
                else:
                    prop_dict[match.group(1)].description = match.group(2)

        div = etree.SubElement(parent, "div")

        has_own_props = len(prop_dict)

        if len(base_list):
            p = etree.SubElement(div, "p")
            if not has_own_props:
                p.text = "Has the attributes from"
            else:
                p.text = "Also has the attributes from"

            if len(base_list) == 1:
                p.text += " "
                self._base_link(p, base_list[0]).tail = "."
            else:
                p.text += ":"
                ul = etree.SubElement(p, "ul")
                for base in base_list:
                    self._base_link(etree.SubElement(ul, "li"), base)

        if has_own_props:
            table = etree.SubElement(div, "table")
            thead = etree.SubElement(etree.SubElement(table, "thead"), "tr")
            etree.SubElement(thead, "th").text = "Attribute"
            etree.SubElement(thead, "th").text = "Type"
            desc = etree.SubElement(thead, "th")
            desc.text = "Description"
            desc.append(SchemaLink.element(name))

            tbody = etree.SubElement(table, "tbody")

            for name, prop in prop_dict.items():
                tr = etree.SubElement(tbody, "tr")
                etree.SubElement(etree.SubElement(tr, "td"), "code").text = name

                type_cell = etree.SubElement(tr, "td")
                if prop.type == "#/$defs/types/int-boolean":
                    type_text = etree.SubElement(type_cell, "a", {"href": "concepts.md#booleans"})
                    type_text.text = "0-1 "
                    etree.SubElement(type_text, "code").text = "integer"
                elif prop.type == "#/$defs/animated-properties/value":
                    type_text = etree.SubElement(type_cell, "a", {"href": "concepts.md#animated-property"})
                    type_text.text = "Animated"
                    type_text.tail = " "
                    etree.SubElement(type_text, "code").text = "number"
                elif prop.type == "#/$defs/animated-properties/multidimensional":
                    type_text = etree.SubElement(type_cell, "a", {"href": "concepts.md#animated-property"})
                    type_text.text = "Animated"
                    type_text.tail = " Vector"
                elif prop.type.startswith("#/$defs/"):
                    split = prop.type.split("/")
                    page = split[-2]
                    if page == "types":
                        page = "concepts"
                    title = SchemaData().get_ref(prop.type)["title"]
                    type_text = etree.SubElement(type_cell, "a")
                    type_text.attrib["href"] = "%s.md#%s" % (page, title.replace(" ", "-").lower())
                    type_text.text = title
                else:
                    type_text = etree.SubElement(type_cell, "code")
                    type_text.text = prop.type

                if prop.const is not None:
                    type_text.tail = " = "
                    etree.SubElement(type_cell, "code").text = repr(prop.const)

                description = etree.SubElement(tr, "td")
                self.parser.parseBlocks(description, [prop.description])

        return True


class JsonHtmlSerializer:
    def __init__(self, parent):
        self.parent = parent
        self.tail = None
        self.encoder = json.JSONEncoder()
        self.parent.text = ""

    def encode(self, json_object, indent, id=None):
        if isinstance(json_object, dict):
            self.encode_dict(json_object, indent, id)
        elif isinstance(json_object, list):
            self.encode_list(json_object, indent)
        elif isinstance(json_object, str):
            self.encode_item(json_object, "string", json_object if json_object.startswith("https://") else None)
        elif isinstance(json_object, (int, float)):
            self.encode_item(json_object, "number")
        elif isinstance(json_object, bool) or json_object is None:
            self.encode_item(json_object, "literal")
        else:
            raise TypeError(json_object)

    def encode_item(self, json_object, hljs_type, href=None):
        span = etree.Element("span", {"class": "hljs-"+hljs_type})
        span.text = self.encoder.encode(json_object)

        if href:
            link = etree.SubElement(self.parent, "a", {"href": href})
            link.append(span)
            self.tail = link
        else:
            self.tail = span
            self.parent.append(span)

        self.tail.tail = ""

    def encode_dict_key(self, key, id):
        if id is None:
            self.encode_item(key, "attr")
            return None

        child_id = id + "/" + key
        self.encode_item(key, "attr", "#" + child_id)
        self.tail.attrib["id"] = child_id
        return child_id

    def encode_dict(self, json_object, indent, id):
        if len(json_object) == 0:
            self.write("{}")
            return

        self.write("{\n")

        child_indent = indent + 1
        for index, (key, value) in enumerate(json_object.items()):

            self.indent(child_indent)
            child_id = self.encode_dict_key(key, id if isinstance(value, dict) else None)
            self.write(": ")

            if key == "$ref" and isinstance(value, str):
                self.encode_item(value, "string", value)
            else:
                self.encode(value, child_indent, child_id)

            if index == len(json_object) - 1:
                self.write("\n")
            else:
                self.write(",\n")
        self.indent(indent)
        self.write("}")

    def encode_list(self, json_object, indent):
        if len(json_object) == 0:
            self.write("[]")
            return

        self.write("[\n")
        child_indent = indent + 1
        for index, value in enumerate(json_object):
            self.indent(child_indent)
            self.encode(value, child_indent)
            if index == len(json_object) - 1:
                self.write("\n")
            else:
                self.write(",\n")
        self.indent(indent)
        self.write("]")

    def indent(self, amount):
        self.write("    " * amount)

    def write(self, text):
        if self.tail is None:
            self.parent.text += text
        else:
            self.tail.tail += text


class JsonFile(InlineProcessor):
    def __init__(self, md):
        super().__init__(r'\{json_file:(?P<path>[^:]+)\}', md)

    def handleMatch(self, match, data):
        pre = etree.Element("pre")

        with open(docs_path / match.group("path")) as file:
            json_data = json.load(file)

        # Hack to prevent PrettifyTreeprocessor from messing up indentation
        etree.SubElement(pre, "span")

        code = etree.SubElement(pre, "code")

        JsonHtmlSerializer(code).encode(json_data, 0, "")

        return pre, match.start(0), match.end(0)


class SchemaLink(InlineProcessor):
    def __init__(self, md):
        pattern = r'{schema_link:([^:}]+)}'
        super().__init__(pattern, md)

    @staticmethod
    def element(path):
        href = "schema.md#/$defs/" + path
        element = etree.Element("a", {"href": href, "class": "schema-link"})
        element.text = "View Schema"
        return element

    def handleMatch(self, m, data):

        return SchemaLink.element(m.group(1)), m.start(0), m.end(0)


class LottieExtension(Extension):
    def extendMarkdown(self, md):
        md.inlinePatterns.register(LottieInlineProcessor(md), 'lottie', 175)
        md.inlinePatterns.register(LottieColor(r'{lottie_color:(([^,]+),\s*([^,]+),\s*([^,]+))}', md, 1), 'lottie_color', 175)
        md.inlinePatterns.register(LottieColor(r'{lottie_color_255:(([^,]+),\s*([^,]+),\s*([^,]+))}', md, 255), 'lottie_color_255', 175)
        md.parser.blockprocessors.register(Matrix(md.parser), 'matrix', 175)
        md.parser.blockprocessors.register(SchemaEnum(md.parser), 'schema_enum', 175)
        md.inlinePatterns.register(SchemaAttribute(md), 'schema_attribute', 175)
        md.parser.blockprocessors.register(LottiePlayground(md.parser), 'lottie_playground', 175)
        md.parser.blockprocessors.register(SchemaObject(md.parser), 'schema_object', 175)
        md.inlinePatterns.register(JsonFile(md), 'json_file', 175)
        md.inlinePatterns.register(SchemaLink(md), 'schema_link', 175)


def makeExtension(**kwargs):
    return LottieExtension(**kwargs)

