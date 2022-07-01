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
from markdown.preprocessors import Preprocessor
from markdown.extensions import Extension
from markdown.util import HTML_PLACEHOLDER_RE, AtomicString
from schema_lib import Schema


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

    def __init__(self, *, parent: etree.Element = None, download_file=None, width=None, height=None):
        self.id = LottieRenderer._id
        LottieRenderer._id += 1

        element = etree.Element("div")

        if parent is not None:
            parent.append(element)

        animation = etree.SubElement(element, "div")
        animation.attrib["class"] = "alpha_checkered"
        animation.attrib["id"] = "lottie_target_%s" % self.id

        if width:
            animation.attrib["style"] = "width:%spx;height:%spx" % (width, height)

        play = etree.Element("button")
        element.append(play)
        play.attrib["id"] = "lottie_play_{id}".format(id=self.id)
        play.attrib["onclick"] = (
            "lottie_player_{id}.play(); " +
            "document.getElementById('lottie_pause_{id}').style.display = 'inline-block'; " +
            "this.style.display = 'none'"
        ).format(id=self.id)
        play.append(etree_fontawesome("play"))
        play.attrib["title"] = "Play"
        play.attrib["style"] = "display:none"

        pause = etree.Element("button")
        element.append(pause)
        pause.attrib["id"] = "lottie_pause_{id}".format(id=self.id)
        pause.attrib["onclick"] = (
            "lottie_player_{id}.pause(); " +
            "document.getElementById('lottie_play_{id}').style.display = 'inline-block'; " +
            "this.style.display = 'none'"
        ).format(id=self.id)
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

            absfile = download_file
            if "examples/" in download_file:
                absfile = "/lottie-docs/examples/" + download_file.split("examples/")[1]

            open_in_editor = etree.SubElement(element, "button")
            open_in_editor.attrib["onclick"] = inspect.cleandoc(r"""
                playground_set_url("{url}");
                window.location.href = "/lottie-docs/playground/json_editor/";
            """).format(url=absfile)
            open_in_editor.append(etree_fontawesome("edit"))
            open_in_editor.attrib["title"] = "Open in Editor"

        self.element = element
        self.variable_name = "lottie_player_{id}".format(id=self.id)
        self.target_id = "lottie_target_{id}".format(id=self.id)

    def populate_script(self, script_src):
        script = etree.Element("script")
        self.element.append(script)
        script.text = AtomicString(script_src)

    @staticmethod
    def render(*, parent: etree.Element = None, url=None, json_data=None, download_file=None, width=None, height=None, extra_options="{}"):
        obj = LottieRenderer(parent=parent, download_file=download_file, width=width, height=height)
        if json_data is None:
            script_src = """
                var lottie_player_{id} = new LottiePlayer(
                    'lottie_target_{id}',
                    '{file}',
                    true,
                    {extra_options}
                );
            """.format(id=obj.id, file=url, extra_options=extra_options)
        else:
            script_src = """
                var lottie_player_{id} = new LottiePlayer(
                    'lottie_target_{id}',
                    {json_data},
                    true,
                    {extra_options}
                );
            """.format(id=obj.id, json_data=json.dumps(json_data), extra_options=extra_options)

        obj.populate_script(script_src)
        return (obj.element, obj.id)


def get_url(md, path):
    # Mkdocs adds a tree processor to adjust urls, but it won't work with lottie js so we do the same here
    processor = next(proc for proc in md.treeprocessors if proc.__class__.__module__ == 'mkdocs.structure.pages')
    return processor.files.get_file_from_path(path).url_relative_to(processor.file)


class LottieInlineProcessor(InlineProcessor):
    def __init__(self, md):
        pattern = r'{lottie:([^:]+)(?::([0-9]+):([0-9]+))?(?::(\{[^}]+\}))?}'
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
            height=m.group(3),
            extra_options=m.group(4) or "{}",
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
        color.attrib["style"] = css_style(background_color=hex)
        color.attrib["class"] = "color-preview"

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


def enum_values(schema: Schema, name):
    enum = schema.get_ref(["$defs", "constants", name])
    data = []
    for item in enum["oneOf"]:
        data.append((item["const"], item["title"], item.get("description", "")))
    return data


class ReferenceLink:
    _link_mapping = None

    def __init__(self, page, anchor, name, group=None, cls=None):
        self.group = group
        self.cls = cls
        self.name = name
        self.page = page or group
        self.anchor = anchor or cls

    @classmethod
    def mapping_data(cls):
        if cls._link_mapping is None:
            with open(docs_path / "schema" / "docs_mapping.json") as file:
                cls._link_mapping = json.load(file)
        return cls._link_mapping


def ref_links(ref: str, data: Schema):
    chunks = ref.strip("#/").split("/")
    if len(chunks) > 0 and chunks[0] == "$defs":
        chunks.pop(0)

    if len(chunks) != 2:
        return []

    group = chunks[0]
    cls = chunks[1]

    values = {
        "extra": None,
        "page": group,
        "anchor": cls,
        "name": data.get_ref(ref).get("title", cls) if data else cls,
        "name_prefix": "",
    }

    if group == "constants":
        values["anchor"] = values["anchor"].replace("-", "")

    mapping_data = ReferenceLink.mapping_data().get(group, None)
    if mapping_data:
        values.update(mapping_data.get("_defaults", {}))
        values.update(mapping_data.get(cls, {}))

    links = []
    if values["page"]:
        links.append(ReferenceLink(
            values["page"], values["anchor"], values["name_prefix"] + values["name"], group, cls
        ))

    if values["extra"]:
        extra = values["extra"]
        links.append(ReferenceLink(
            extra["page"], extra["anchor"], extra["name"],
        ))

    return links


class SchemaEnum(BlockProcessor):
    re_fence_start = re.compile(r'^\s*\{schema_enum:([^}]+)\}\s*(?:\n|$)')
    re_row = re.compile(r'^\s*(\w+)\s*:\s*(.*)')

    def __init__(self, parser, schema_data: Schema):
        super().__init__(parser)
        self.schema_data = schema_data

    def test(self, parent, block):
        return self.re_fence_start.match(block)

    def run(self, parent, blocks):
        enum_name = self.test(parent, blocks[0]).group(1)

        enum_data = enum_values(self.schema_data, enum_name)

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
    def __init__(self, md, schema_data: Schema):
        super().__init__(r'\{schema_attribute:(?P<attribute>[^:]+):(?P<path>[^:]+)\}', md)
        self.schema_data = schema_data

    def handleMatch(self, match, data):
        span = etree.Element("span")
        span.text = self.schema_data.get_ref("$defs/" + match.group("path")).get(match.group("attribute"), "")
        return span, match.start(0), match.end(0)


class LottiePlayground(BlockProcessor):
    re_fence_start = re.compile(r'^\s*\{lottie_playground:([^:]+)(?::([0-9]+):([0-9]+))?(?::(\{[^}]+\}))?\}')
    re_row = re.compile(r'^\s*(?:(?P<label>[^<:]*)\s*:)?\s*(?P<html><(?P<tag>[-a-zA-Z_]+).*>)?')

    def __init__(self, parser, schema_data: Schema):
        super().__init__(parser)
        self.schema_data = schema_data

    def test(self, parent, block):
        return self.re_fence_start.match(block)

    def _json_viewer(self, element, anim_id):
        json_viewer = "json_viewer_%s" % anim_id
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
        return json_viewer

    def add_control(self, anim_id, id_base, contols_container, label, input):
        tr = etree.SubElement(contols_container, "tr")

        label_cell = etree.SubElement(tr, "td", {"style": "white-space: pre"})
        label_element = etree.SubElement(label_cell, "label")
        label_element.text = label

        if input is None:
            label_cell.tag = "th"
            label_cell.attrib["colspan"] = "2"
            label_element.tag = "span"
            return

        label_element.tail = " "
        td = etree.SubElement(tr, "td", {"style": "width: 100%"})
        input_wrapper = input

        if input.tag == "enum":
            enum_id = input.text
            default_value = input.attrib.get("value", "")

            input = input_wrapper = etree.Element("select")
            for value, opt_label, _ in enum_values(self.schema_data, enum_id):
                option = etree.SubElement(input, "option", {"value": str(value)})
                option.text = opt_label
                if str(value) == default_value:
                    option.attrib["selected"] = "selected"
        elif input.tag == "highlight":
            input_wrapper = etree.Element("div", {"class": "highlighted-input"})
            lang = input.attrib.get("lang", "javascript")
            contents = input.text.strip()
            input = etree.SubElement(input_wrapper, "textarea", {
                "spellcheck": "false",
                "oninput": "syntax_edit_update(this, this.value); syntax_edit_scroll(this);",
                "onscroll": "syntax_edit_scroll(this);",
                "onkeydown": "syntax_edit_tab(this, event);",
                "data-lang": lang,
            })
            input.text = contents
            pre = etree.SubElement(input_wrapper, "pre", {"aria-hidden": "true"})
            code = etree.SubElement(pre, "code", {"class": "language-js hljs"})
            code.text = contents

        input.attrib.setdefault("oninput", "")
        input.attrib["oninput"] += "lottie_player_{id}.reload();".format(id=anim_id)
        input.attrib["data-lottie-input"] = str(anim_id)
        input.attrib["autocomplete"] = "off"
        if "name" not in input.attrib:
            input.attrib["name"] = label
        td.append(input_wrapper)

        if input.attrib.get("type", "") == "range":
            etree.SubElement(td, "span", {
                "id": id_base + "_span"
            }).text = input.attrib["value"]
            input.attrib["oninput"] += (
                "document.getElementById('{span}').innerText = event.target.value;"
                .format(span=id_base + "_span")
            )
        elif input.tag == "textarea":
            tr.remove(td)
            tr = etree.SubElement(contols_container, "tr")
            tr.append(td)
            td.attrib["colspan"] = "2"
            label_cell.attrib["colspan"] = "2"
            input.attrib["rows"] = str(max(3, input.text.count("\n")))
            input.attrib["class"] = "code-input"
            input.attrib["style"] = "width: 100%"

    def run(self, parent, blocks):
        block = blocks.pop(0)
        match = self.test(parent, block)

        with open(docs_path / "examples" / match.group(1)) as file:
            json_data = json.load(file)

        renderer = LottieRenderer(
            parent=parent,
            width=match.group(2),
            height=match.group(3),
        )

        element = renderer.element
        anim_id = renderer.id

        element.attrib["class"] = "playground"

        controls_container = etree.Element("table", {"class": "table-plain", "style": "width: 100%"})
        element.insert(0, controls_container)

        open_in_editor = etree.SubElement(element, "button")
        open_in_editor.attrib["onclick"] = inspect.cleandoc(r"""
            playground_set_data(lottie_player_{id}.lottie);
            window.location.href = "/lottie-docs/playground/json_editor/";
        """).format(id=anim_id)
        open_in_editor.append(etree_fontawesome("edit"))
        open_in_editor.attrib["title"] = "Open in Editor"

        json_viewer_id = None
        json_viewer_path = None
        html_append_until = None

        for index, line in enumerate(block.strip().split("\n")[1:]):
            if html_append_until:
                html_string += line + "\n"
                if html_append_until in line:
                    html_append_until = None
                    id_base = "playground_{id}_{index}".format(id=anim_id, index=index)
                    html = etree.fromstring(html_string)
                    self.add_control(anim_id, id_base, controls_container, label, html)
                continue

            row_match = self.re_row.match(line)
            if not row_match:
                raise Exception("Unexpected playground line %r" % line)

            id_base = "playground_{id}_{index}".format(id=anim_id, index=index)

            label = row_match.group("label")
            html_string = row_match.group("html")
            tag = row_match.group("tag")
            if not html_string:
                self.add_control(anim_id, id_base, controls_container, label, None)
                continue
            if "/>" not in html_string and "</" + tag not in html_string:
                html_append_until = "</" + tag + ">"
                continue

            id_base = "playground_{id}_{index}".format(id=anim_id, index=index)

            html = etree.fromstring(html_string)
            if html.tag == "json":
                json_viewer_id = self._json_viewer(element, anim_id)
                json_viewer_path = html.text
            else:
                self.add_control(anim_id, id_base, controls_container, label, html)

        # <script> are gobbled up by a preprocessor
        script = ""
        script_match = HTML_PLACEHOLDER_RE.match(blocks[0])
        if script_match:
            blocks.pop(0)
            index = int(script_match.group(1))
            raw_string = self.parser.md.htmlStash.rawHtmlBlocks[index]
            if "<script>" in raw_string:
                script_element = etree.fromstring(raw_string)
                script = script_element.text
                self.parser.md.htmlStash.rawHtmlBlocks.pop(index)
                self.parser.md.htmlStash.rawHtmlBlocks.insert(index, '')

        if json_viewer_id:
            script += "this.json_viewer_contents = %s;" % json_viewer_path

        renderer.populate_script("""
        var lottie_player_{id} = new PlaygroundPlayer(
            {id},
            'lottie_target_{id}',
            {json_data},
            function (lottie, data)
            {{
                {source}
            }},
            {extra_options}
        );
        """.format(
            id=anim_id,
            source=script,
            json_data=json.dumps(json_data),
            extra_options=match.group(4) or "{}"
        ))


@dataclasses.dataclass
class SchemaProperty:
    description: str = ""
    const: Any = None
    type: str = ""
    item_type: str = ""


class SchemaObject(BlockProcessor):
    re_fence_start = re.compile(r'^\s*\{schema_object:([^}]+)\}\s*(?:\n|$)')
    re_row = re.compile(r'^\s*(\w+)\s*:\s*(.*)')
    prop_fields = {f.name for f in dataclasses.fields(SchemaProperty)}

    def __init__(self, parser, schema_data: Schema):
        super().__init__(parser)
        self.schema_data = schema_data

    def test(self, parent, block):
        return self.re_fence_start.match(block)

    def _type(self, prop):
        if "$ref" in prop and "type" not in prop:
            return prop["$ref"]
        if "type" in prop:
            return prop["type"]
        if "oneOf" in prop:
            return [self._type(t) for t in prop["oneOf"]]
        return ""

    def _add_properties(self, schema_props, prop_dict):
        for name, prop in schema_props.items():
            data = dict((k, v) for k, v in prop.items() if k in self.prop_fields)
            data["type"] = self._type(prop)
            if "title" in prop and "description" not in prop:
                data["description"] = prop["title"]
            if "items" in prop:
                data["item_type"] = self._type(prop["items"])

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
        link = ref_links(ref, self.schema_data)[0]
        a = etree.SubElement(parent, "a")
        a.text = link.name
        a.attrib["href"] = "%s.md#%s" % (link.page, link.anchor)
        return a

    def _base_type(self, type, parent):
        if isinstance(type, list):
            type_text = etree.SubElement(parent, "span")
            for t in type:
                type_child = self._base_type(t, type_text)
                type_child.tail = " or "
            type_child.tail = ""
        elif type.startswith("#/$defs/"):
            links = ref_links(type, self.schema_data)
            for link in links:
                type_text = etree.SubElement(parent, "a")
                type_text.attrib["href"] = "%s.md#%s" % (link.page, link.anchor)
                type_text.text = link.name
                type_text.tail = " "
                if link.cls == "int-boolean":
                    type_text.text = "0-1 "
                    etree.SubElement(type_text, "code").text = "integer"
                elif link.anchor == "animated-property" and len(links) == 1:
                    type_text.text = "Animated"
                    type_text.tail = " "
                    if link.cls == "value":
                        type_text = etree.SubElement(parent, "code").text = "number"
                    else:
                        type_text.tail += link.name.split(" ", 1)[1]
        else:
            type_text = etree.SubElement(parent, "code")
            type_text.text = type

        return type_text

    def run(self, parent, blocks):
        object_name = self.test(parent, blocks[0]).group(1)

        schema_data = self.schema_data.get_ref("$defs/" + object_name)

        prop_dict = {}
        base_list = []
        self._object_properties(schema_data, prop_dict, base_list)

        # Override descriptions if specified from markdown
        rows = blocks.pop(0)
        for row in rows.split("\n")[1:]:
            match = self.re_row.match(row)
            if match:
                name = match.group(1)
                if name == "EXPAND":
                    prop_dict_base = {}
                    base = match.group(2)
                    self._object_properties(self.schema_data.get_ref(base), prop_dict_base, [])
                    try:
                        base_list.remove(base)
                    except ValueError:
                        pass
                    prop_dict_base.update(prop_dict)
                    prop_dict = prop_dict_base
                elif name == "SKIP":
                    what = match.group(2)
                    prop_dict.pop(what, None)
                    try:
                        base_list.remove(what)
                    except ValueError:
                        pass
                else:
                    prop_dict[name].description = match.group(2)

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
            desc.append(SchemaLink.icon(object_name))
            if "caniuse" in schema_data:
                desc.append(SchemaLink.caniuse_icon(schema_data["caniuse"]))

            tbody = etree.SubElement(table, "tbody")

            for name, prop in prop_dict.items():
                tr = etree.SubElement(tbody, "tr")
                etree.SubElement(etree.SubElement(tr, "td"), "code").text = name

                type_cell = etree.SubElement(tr, "td")

                type_text = self._base_type(prop.type, type_cell)
                if prop.type == "array" and prop.item_type:
                    type_text.tail = " of "
                    type_text = self._base_type(prop.item_type, type_cell)

                if prop.const is not None:
                    type_text.tail = " = "
                    etree.SubElement(type_cell, "code").text = repr(prop.const)

                description = etree.SubElement(tr, "td")
                self.parser.parseBlocks(description, [prop.description])

        return True


class JsonHtmlSerializer:
    def __init__(self, parent, md, json_data):
        self.parent = parent
        self.tail = None
        self.encoder = json.JSONEncoder()
        self.parent.text = ""
        self.md = md
        self.schema = Schema(json_data)

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
        if child_id.count("/") == 3:
            for link in ref_links(child_id, self.schema):
                self.tail.tail += " "
                self.tail = etree.SubElement(self.parent, "a")
                self.tail.attrib["href"] = get_url(self.md, link.page + ".md") + "#" + link.anchor
                self.tail.attrib["title"] = link.name
                icon = etree.SubElement(self.tail, "i")
                icon.attrib["class"] = "fas fa-book-open"
                self.tail.tail = " "
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

        JsonHtmlSerializer(code, self.md, json_data).encode(json_data, 0, "")

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

    @staticmethod
    def icon(path):
        href = "schema.md#/$defs/" + path
        element = etree.Element("a", {"href": href, "class": "schema-link"})
        element.attrib["title"] = "View Schema"
        etree.SubElement(element, "i").attrib["class"] = "fas fa-file-code"
        return element

    @staticmethod
    def caniuse_icon(feature):
        href = "https://canilottie.com/" + feature
        element = etree.Element("a", {"href": href, "class": "schema-link"})
        element.attrib["title"] = "View Compatibility"
        etree.SubElement(element, "i").attrib["class"] = "fas fa-list-check"
        return element



    def handleMatch(self, m, data):
        return SchemaLink.element(m.group(1)), m.start(0), m.end(0)


class SchemaEffect(BlockProcessor):
    re_fence_start = re.compile(r'^\s*\{schema_effect:([^}]+)\}\s*(?:\n|$)')

    def __init__(self, parser, schema_data: Schema):
        super().__init__(parser)
        self.schema_data = schema_data

    def test(self, parent, block):
        return self.re_fence_start.match(block)

    def run(self, parent, blocks):
        effect_name = self.test(parent, blocks[0]).group(1)
        blocks.pop(0)

        effect_schema = self.schema_data.get_ref("$defs/" + effect_name)
        effect_data = effect_schema["allOf"][-1]["properties"]["ef"]["prefixItems"]

        table = etree.SubElement(parent, "table")

        thead = etree.SubElement(etree.SubElement(table, "thead"), "tr")
        etree.SubElement(thead, "th").text = "Name"
        etree.SubElement(thead, "th").text = "Type"

        thead[-1].append(SchemaLink.icon("effects/" + effect_name))
        if "caniuse" in effect_schema:
            thead[-1].append(SchemaLink.caniuse_icon(effect_schema["caniuse"]))

        tbody = etree.SubElement(table, "tbody")

        for item in effect_data:
            tr = etree.SubElement(tbody, "tr")
            etree.SubElement(tr, "td").text = item["title"]
            href = item["$ref"].split("/")[-1]
            if href.startswith("effect-value-"):
                href = href[len("effect-value-"):]
            elif href.startswith("effect-"):
                href = href[len("effect-"):]
            value_name = self.schema_data.get_ref(item["$ref"])["title"]
            etree.SubElement(etree.SubElement(tr, "td"), "a", {"href": "#" + href}).text = value_name

        return True


class VariableDocInfo:
    def __init__(self, name, type, description="", default=None, notes=None):
        self.default = default
        self.description = description
        self.name = name
        self.type = type
        self.notes = notes

    @classmethod
    def from_chunks(cls, name, chunks):
        type = chunks[0]
        description = chunks[1] if len(chunks) > 1 else ""
        default = chunks[2] if len(chunks) > 2 else None
        return cls(name, type, description, default)

    def type_code(self):
        if " " in self.type:
            return "any"

        return self.type

    def type_html(self, parent):
        for subtype in self.type.split("|"):
            if " " in subtype:
                tail = etree.SubElement(parent, "span")
            elif subtype in ("array", "number", "boolean", "string", "object") or subtype.startswith("array"):
                tail = etree.SubElement(parent, "code")
            else:
                tail = etree.SubElement(parent, "a", {"href": "#" + subtype.lower()})

            tail.text = subtype
            tail.tail = "|"
        tail.tail = ""


class FunctionDocs(BlockProcessor):
    re_fence_start = re.compile(r'^\s*\{function_docs}\s*(?:\n|$)')

    def __init__(self, parser, expr_schema):
        super().__init__(parser)
        self.expr_schema = expr_schema

    def test(self, parent, block):
        return self.re_fence_start.match(block)

    def data_to_element(self, parent, name, description="", params=[], ret=None):
        etree.SubElement(etree.SubElement(parent, "p"), "strong").text = "Synopsis"
        signature = name
        if params:
            signature += " (\n"
            for param in params:
                signature += "    "
                signature += param.name
                signature += ": "
                signature += param.type_code()
                if param.default:
                    signature += " = "
                    signature += param.default
                signature += "\n"
        else:
            signature += " ("

        signature += ")"

        if ret:
            signature += ": "
            signature += ret.type_code()

        etree.SubElement(etree.SubElement(parent, "pre"), "code", {"class": "language-ts"}).text = signature

        if description:
            self.parser.parseBlocks(etree.SubElement(parent, "p"), [description])

        if params:
            etree.SubElement(etree.SubElement(parent, "p"), "strong").text = "Parameters"
            table = etree.SubElement(parent, "table")
            header_tr = etree.SubElement(table, "tr")
            etree.SubElement(header_tr, "th").text = "Name"
            etree.SubElement(header_tr, "th").text = "Type"
            etree.SubElement(header_tr, "th").text = "Default"
            etree.SubElement(header_tr, "th").text = "Description"

            for param in params:
                tr = etree.SubElement(table, "tr")
                etree.SubElement(etree.SubElement(tr, "td"), "code").text = param.name
                param.type_html(etree.SubElement(tr, "td"))
                td = etree.SubElement(tr, "td")
                if param.default:
                    etree.SubElement(td, "code").text = param.default
                self.parser.parseBlocks(etree.SubElement(tr, "td"), [param.description])

        if ret:
            etree.SubElement(etree.SubElement(parent, "p"), "strong").text = "Return"
            table = etree.SubElement(parent, "table")
            tr = etree.SubElement(table, "tr")
            etree.SubElement(tr, "th").text = "Type"
            ret.type_html(etree.SubElement(tr, "td"))

            if ret.description:
                tr = etree.SubElement(table, "tr")
                etree.SubElement(tr, "th").text = "Description"
                self.parser.parseBlocks(etree.SubElement(tr, "td"), [ret.description])

    def from_schema(self, parent, name):
        data = self.expr_schema["functions"][name]
        if not isinstance(data, list):
            data = [data]

        for schema in data:
            fdef = dict(schema)
            if "params" in fdef:
                fdef["params"] = [VariableDocInfo(**p) for p in fdef["params"]]
            if "return" in fdef:
                fdef["ret"] = VariableDocInfo("return", **fdef.pop("return"))
            self.data_to_element(parent, name, **fdef)

    def run(self, parent, blocks):
        block = blocks.pop(0)

        description = None
        name = None
        params = []
        ret = None

        for line in block.strip().split("\n")[1:]:
            chunks = [c.strip() for c in line.split(":")]
            if chunks[0] == "name":
                name = chunks[1]
            elif chunks[0] == "return":
                ret = VariableDocInfo.from_chunks("return", chunks[1:])
            elif chunks[0] == "param":
                params.append(VariableDocInfo.from_chunks(chunks[1], chunks[2:]))
            elif chunks[0] == "description":
                description = chunks[1]
            elif chunks[0] == "schema":
                self.from_schema(parent, chunks[1])
                return True

        self.data_to_element(parent, name, description, params, ret)

        return True


class VariableDocs(BlockProcessor):
    re_fence_start = re.compile(r'^\s*\{variable_docs}\s*(?:\n|$)')

    def __init__(self, parser, expr_schema):
        super().__init__(parser)
        self.expr_schema = expr_schema

    def test(self, parent, block):
        return self.re_fence_start.match(block)

    def run(self, parent, blocks):
        block = blocks.pop(0)
        var = VariableDocInfo("", "", "")

        for line in block.strip().split("\n")[1:]:
            chunks = [c.strip() for c in line.split(":")]
            setattr(var, chunks[0], chunks[1])
            if chunks[0] == "schema":
                var = VariableDocInfo(chunks[1], **self.expr_schema["variables"][chunks[1]])
                break

        table = etree.SubElement(parent, "table")

        tr = etree.SubElement(table, "tr")
        etree.SubElement(tr, "th").text = "Name"
        etree.SubElement(etree.SubElement(tr, "td"), "code").text = var.name

        tr = etree.SubElement(table, "tr")
        etree.SubElement(tr, "th").text = "Type"
        var.type_html(etree.SubElement(tr, "td"))

        tr = etree.SubElement(table, "tr")
        etree.SubElement(tr, "th").text = "Description"
        self.parser.parseBlocks(etree.SubElement(tr, "td"), [var.description])

        if var.notes:
            tr = etree.SubElement(table, "tr")
            etree.SubElement(tr, "th").text = "Notes"
            self.parser.parseBlocks(etree.SubElement(tr, "td"), [var.notes])

        return True


class ScriptPlayground(Preprocessor):
    fence_start = "<script_playground"
    fence_end = "</script_playground>"
    tabs = {
        "json": ("javascript", "Lottie"),
        "css": ("css", "CSS"),
        "html": ("html", "HTML"),
        "js": ("javascript", "Script"),
    }

    def run(self, lines):
        new_lines = []
        data = None
        current = None
        id = 0
        found = False
        options = {}

        for line in lines:
            if data is not None:
                if current is None and line.startswith("```"):
                    current = line[3:]
                    data[current] = ""
                elif line == "```":
                    current = None
                elif line == self.fence_end:
                    element = etree.Element("div")

                    tab_content = etree.Element("div")

                    if len(data) > 1:
                        tab_nav = etree.SubElement(element, "ul", {"class": "nav nav-tabs"})
                        tab_content.attrib = {"class": "tab-content"}

                    element.append(tab_content)

                    for k, v in data.items():
                        div = etree.SubElement(tab_content, "div")
                        etree.SubElement(etree.SubElement(div, "pre"), "code", {"class": self.tabs[k][0]}).text = v

                        if len(data) > 1:
                            tab_id = "script_playground_%s_%s" % (id, k)
                            etree.SubElement(etree.SubElement(tab_nav, "li"), "a", {"href": "#" + tab_id}).text = self.tabs[k][1]
                            div.attrib = {"id": tab_id, "class": "tab-pane fade in"}

                    if "css" in data:
                        etree.SubElement(element, "style").text = data["css"]

                    if "html" in data:
                        div = etree.SubElement(tab_content, "div")
                        div.append(etree.fromstring("<div class='playground_html'>" + data["html"] + "</div>"))

                        if len(data) > 1:
                            tab_id = "script_playground_%s_preview" % (id)
                            li = etree.SubElement(tab_nav, "li", {"class": "active"})
                            etree.SubElement(li, "a", {"href": "#" + tab_id}).text = "Result"
                            div.attrib = {"id": tab_id, "class": "tab-pane fade in active"}

                    html = etree.tostring(element, "unicode", method="html")

                    script = ""
                    if "json" in data:
                        script += "var json = %s;\n" % data["json"]
                    if "js" in data:
                        script += data["js"]
                    if script:
                        if options.get("global-script", "") != "1":
                            script = "(function(){%s})();" % script
                        html += "<script>%s</script>" % script

                    placeholder = self.md.htmlStash.store(html)
                    new_lines.append(placeholder)
                    data = None
                    id += 1
                else:
                    data[current] += line + "\n"
            elif line.startswith(self.fence_start):
                data = {}
                current = None
                found = True
                options = etree.fromstring(line + self.fence_end).attrib
            else:
                new_lines.append(line)

        if found:
            script = """<script>
            document.querySelectorAll(".nav-tabs a").forEach( link =>
                link.addEventListener("click", e => jQuery(e.target).tab("show"))
            );
            </script>"""
            placeholder = self.md.htmlStash.store(script)
            new_lines.append(placeholder)

        return new_lines


class LottieExtension(Extension):
    def extendMarkdown(self, md):
        with open(docs_path / "schema" / "lottie.schema.json") as file:
            schema_data = Schema(json.load(file))
        with open(docs_path / "schema" / "expressions.json") as file:
            expr_schema = json.load(file)
        md.inlinePatterns.register(LottieInlineProcessor(md), 'lottie', 175)
        md.inlinePatterns.register(LottieColor(r'{lottie_color:(([^,]+),\s*([^,]+),\s*([^,]+))}', md, 1), 'lottie_color', 175)
        md.inlinePatterns.register(LottieColor(r'{lottie_color_255:(([^,]+),\s*([^,]+),\s*([^,]+))}', md, 255), 'lottie_color_255', 175)
        md.parser.blockprocessors.register(Matrix(md.parser), 'matrix', 175)
        md.parser.blockprocessors.register(SchemaEnum(md.parser, schema_data), 'schema_enum', 175)
        md.inlinePatterns.register(SchemaAttribute(md, schema_data), 'schema_attribute', 175)
        md.parser.blockprocessors.register(LottiePlayground(md.parser, schema_data), 'lottie_playground', 175)
        md.parser.blockprocessors.register(SchemaObject(md.parser, schema_data), 'schema_object', 175)
        md.inlinePatterns.register(JsonFile(md), 'json_file', 175)
        md.inlinePatterns.register(SchemaLink(md), 'schema_link', 175)
        md.parser.blockprocessors.register(SchemaEffect(md.parser, schema_data), 'schema_effect', 175)
        md.parser.blockprocessors.register(FunctionDocs(md.parser, expr_schema), 'function_docs', 175)
        md.parser.blockprocessors.register(VariableDocs(md.parser, expr_schema), 'variable_docs', 175)
        md.preprocessors.register(ScriptPlayground(md), 'script_playground', 29)


def makeExtension(**kwargs):
    return LottieExtension(**kwargs)
