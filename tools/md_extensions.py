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
from mkdocs.structure.pages import _RelativePathTreeprocessor

from lottie_specs.schema import Schema
from lottie_specs.markdown.lottie_markdown import LottiePlayground, LottieColor, ReferenceLink, SchemaLink, LottiePlaygroundBase


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


def ref_links(ref: str, data: Schema):
    chunks = ref.strip("#/").split("/")
    if len(chunks) > 0 and chunks[0] == "$defs":
        chunks.pop(0)
    else:
        ref = "#/$defs/" + ref

    if len(chunks) != 2:
        return []

    item_schema = data.get_ref(ref)
    return [ReferenceLink.from_schema(item_schema)]


class EarlyHtmlProcessor(Preprocessor):
    def __init__(self, tags, *a, **kw):
        super().__init__(*a, **kw)
        self.start_re = re.compile("^<(%s)" % "|".join(tags))

    def run(self, lines):
        new_lines = []
        element_text = None
        end_tag = None
        comment = False

        for line in lines:
            if comment:
                new_lines.append(line)
                if "-->" in line:
                    comment = False
            elif element_text:
                element_text += line + "\n"
                if line == end_tag:
                    self.flush(element_text, new_lines)
                    element_text = None
            else:
                match = self.start_re.match(line)
                if match:
                    self.flush(element_text, new_lines)
                    element_text = line + "\n"
                    end_tag = "</%s>" % match.group(1)
                else:
                    new_lines.append(line)
                    if "<!--" in line:
                        comment = True

        self.flush(element_text, new_lines)

        return new_lines

    def flush(self, element_text, new_lines):
        if element_text:
            self.on_flush(element_text, new_lines)

    def on_flush(self, element_text, new_lines):
        new_lines.append(self.md.htmlStash.store(element_text))


class ComplexPlayground(EarlyHtmlProcessor, LottiePlaygroundBase):

    def __init__(self, md, schema_data):
        EarlyHtmlProcessor.__init__(self, [self.tag_name], md)
        LottiePlaygroundBase.__init__(self, schema_data)

    def on_flush(self, element_text, new_lines):
        parent = etree.Element("div")
        self.make_element(parent, element_text)
        new_lines.append(self.md.htmlStash.store(parent))


class ShapeBezierScript(ComplexPlayground):
    tag_name = "shape_bezier_script"

    def populate_script(self, md_element, builder, json_data, extra_options, json_viewer_id, json_viewer_path):
        bezier_view = etree.SubElement(builder.renderer.animation_container, "div")
        bezier_view.attrib["id"] = "lottie_target_%s_bezier" % builder.anim_id
        bezier_view.attrib["style"] = builder.renderer.animation.attrib["style"]

        func_script = ""
        non_func_script = ""
        func = ""
        varname = ""
        for script_element in md_element.findall("./script"):
            if script_element is not None:
                if "func" in script_element.attrib:
                    func = script_element.attrib["func"]
                    varname = script_element.attrib.get("varname", "shape")
                    func_script = script_element.text

                    pre = etree.SubElement(builder.element, "pre")
                    # We don't use `js` highlighting because it's a bit bugged
                    code = etree.SubElement(pre, "code", {"class": "language-typescript hljs"})
                    code.text = AtomicString(
                        func_script + "\n\n// Example invocation\n" + func + ";"
                    )
                else:
                    non_func_script = script_element.text

        ty = extra_options.pop("ty", None)
        set_conv = ""
        if ty:
            set_conv = "converter_map[%r] = %s => %s;" % (ty, varname, func)

        if json_viewer_path:
            builder.renderer.populate_script("""
                {func_script}
                {set_conv}
                var lottie_player_{id}_bezier = new LottiePlayer('lottie_target_{id}_bezier', {bezier_json});
                var lottie_player_{id} = new PlaygroundPlayer(
                    {id},
                    '{json_viewer_id}',
                    'lottie_target_{id}',
                    {json_data},
                    function (lottie, data)
                    {{
                        let bezier_lottie = lottie_player_{id}_bezier.lottie;
                        {non_func_script}
                        this.json_viewer_contents = {shape_path};
                        let {varname} = {shape_path};
                        let bez_result = {func};
                        if ( !Array.isArray(bez_result) )
                            bez_result = [bez_result];
                        let out_shapes = bez_result.map(b => ({{
                            ty: "sh", "ks": {{a: 0, k: b.to_lottie()}}
                        }}));
                        let bez_target = bezier_lottie.layers[0].shapes[0].it;
                        bez_target.splice(0, bez_target.length - 2, ...out_shapes);
                        lottie_player_{id}_bezier.reload();
                        this.set_json('{json_viewer_id}_bezier', out_shapes[0].ks.k);
                    }},
                    {extra_options}
                );
            """.format(
                id=builder.anim_id,
                set_conv=set_conv,
                json_viewer_id=json_viewer_id,
                non_func_script=non_func_script,
                func_script=func_script,
                json_data=json_data,
                bezier_json=self.example_json("bezier.json"),
                shape_path=json_viewer_path,
                extra_options=json.dumps(extra_options),
                func=func,
                varname=varname,
            ))

    def add_json_viewer(self, builder, parent):
        id = super().add_json_viewer(builder, parent)
        pre = etree.SubElement(parent, "pre")
        code = etree.SubElement(pre, "code", {"id": id + "_bezier", "class": "language-json hljs"})
        code.text = ""
        return id


class EffectShaderScript(ComplexPlayground):
    tag_name = "effect_shader_script"

    def populate_script(self, md_element, builder, json_data, extra_options, json_viewer_id, json_viewer_path):
        shader_view = etree.SubElement(builder.renderer.animation_container, "canvas")
        shader_view.attrib["class"] = "webgl-shader"
        shader_view.attrib["id"] = "lottie_target_%s_canvas" % builder.anim_id
        shader_view.attrib["style"] = builder.renderer.animation.attrib["style"]
        shader_view.attrib["width"] = builder.renderer.width
        shader_view.attrib["height"] = builder.renderer.height

        uniforms = {}
        script = ""
        shader_sources = []
        for script_element in md_element.findall("./script"):
            if script_element is not None:
                if script_element.attrib.get("type", "") == "x-shader/x-fragment":
                    shader_source = script_element.text.strip()

                    pre = etree.SubElement(builder.element, "pre")
                    # No glsl ;_;
                    code = etree.SubElement(pre, "code", {"class": "language-c hljs"})
                    code.text = AtomicString(shader_source)
                    shader_sources.append((shader_source, int(script_element.attrib.get("passes", "1"))))
                else:
                    script = script_element.text

        if json_viewer_path:
            script += "this.json_viewer_contents = %s;" % json_viewer_path

        shader_class = ""
        shader_load = ""

        if len(shader_sources) == 1 and shader_sources[0][1] == 1:
            shader_class = "SinglePassShader"
            shader_load = "lottie_shader_{id}.set_fragment({shader_source})".format(
                id=builder.anim_id,
                shader_source=repr(shader_sources[0][0])
            )
        else:
            shader_class = "MultiPassShader"
            pass_index = 0
            for shader_source, pass_count in shader_sources:
                if pass_count == 1:
                    shader_load += """
                        lottie_shader_{id}.add_pass_source({shader_source}, {{"pass": ["1i", {pass_index}]}})
                    """.format(
                        id=builder.anim_id,
                        shader_source=repr(shader_source),
                        pass_index=pass_index,
                    )
                    pass_index += 1
                else:
                    program = "program_{id}_{pass_index}".format(
                        id=builder.anim_id,
                        pass_index=pass_index,
                    )
                    shader_load += """
                    var {program} = new ShaderProgram(lottie_shader_{id}.gl);
                        {program}.set_fragment({shader_source})
                    """.format(
                        id=builder.anim_id,
                        shader_source=repr(shader_source),
                        program=program,
                    )
                    for i in range(pass_count):
                        shader_load += """
                            lottie_shader_{id}.add_pass({program}, {{"pass": ["1i", {pass_index}]}})
                        """.format(
                            id=builder.anim_id,
                            program=program,
                            pass_index=pass_index,
                        )
                        pass_index += 1

        builder.renderer.populate_script("""
        var lottie_shader_{id} = new {shader_class}(document.getElementById('{shader_view_id}'));
        {shader_load}
        var lottie_player_{id} = new PlaygroundPlayer(
            {id},
            '{json_viewer_id}',
            'lottie_target_{id}',
            {json_data},
            function (lottie, data)
            {{
                let shader = lottie_shader_{id};
                {on_load}
                shader.render();
            }},
            {extra_options}
        );
        """.format(
            id=builder.anim_id,
            json_viewer_id=json_viewer_id,
            on_load=script,
            json_data=json_data,
            extra_options=json.dumps(extra_options),
            shader_view_id=shader_view.attrib["id"],
            uniforms=json.dumps(uniforms),
            shader_class=shader_class,
            shader_load=shader_load,
        ))


class SchemaEffect(BlockProcessor):
    re_fence_start = re.compile(r'^\s*\{schema_effect:([^}]+)\}\s*(?:\n|$)')

    def __init__(self, md, schema_data: Schema):
        super().__init__(md.parser)
        self.md = md
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

        thead[-1].append(SchemaLink.icon(self.md, "effects/" + effect_name))

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


class AepMatchNameTable(BlockProcessor):
    re_fence_start = re.compile(r"\{aep_mn\}")
    re_row = re.compile(r'^\s*(?P<mn>[^:]+)\s*:\s*(?:(?P<what>\w+)\s*=\s*(?P<lottie>[^: ]+))?\s*(?P<descr>([^:]|:\S)*)(?:\s*:\s*(?P<default>.*))?')

    def __init__(self, parser, schema_data: Schema):
        super().__init__(parser)
        self.schema_data = schema_data

    def test(self, parent, block):
        return self.re_fence_start.match(block)

    def th(self, thead, width, text):
        th = etree.SubElement(thead, "th")
        th.attrib["style"] = "width: %s%%" % width
        th.text = text

    def run(self, parent, blocks):
        table = etree.SubElement(parent, "table")

        thead = etree.SubElement(etree.SubElement(table, "thead"), "tr")
        self.th(thead, 50, "Match Name")
        self.th(thead, 25, "Description")
        self.th(thead, 25, "Default")

        tbody = etree.SubElement(table, "tbody")

        lottie_obj = None

        rows = blocks.pop(0)
        for row in rows.split("\n")[1:]:
            match = self.re_row.match(row)
            if not match:
                continue

            tr = etree.SubElement(tbody, "tr")
            etree.SubElement(etree.SubElement(tr, "td"), "code").text = match.group("mn")

            td = etree.SubElement(tr, "td")
            what = match.group("what")
            if what:
                if what == "object":
                    ref = "$defs/" + match.group("lottie")
                    lottie_obj = self.schema_data.get_ref(ref)
                    link = ref_links(ref, self.schema_data)[0]
                    a = etree.SubElement(td, "a")
                    a.text = link.name
                    a.attrib["href"] = "%s.md#%s" % (link.page, link.anchor)
                elif what == "prop":
                    etree.SubElement(td, "code").text = match.group("lottie")

                td[0].tail = match.group("descr")
            else:
                td.text = match.group("descr")

            etree.SubElement(tr, "td").text = match.group("default")

        return True


class SectionLinkInlineProcessor(InlineProcessor):
    pattern = r'{sl:([^}]+)}'

    def __init__(self, md):
        super().__init__(self.pattern, md)

    def handleMatch(self, m, data):

        text = m.group(1)
        id = self.unescape(text).replace(" ", "-").lower()
        element = etree.Element("a")
        element.attrib["href"] = "#" + id
        element.text = text

        return element, m.start(0), m.end(0)


class LottieDocsExtension(Extension):
    def extendMarkdown(self, md):
        with open(docs_path / "static" / "expressions.json") as file:
            expr_schema = json.load(file)
        md.inlinePatterns.register(LottieColor(r'{lottie_color_255:(([^,]+),\s*([^,]+),\s*([^,]+))}', md, 255), 'lottie_color_255', 175)
        md.parser.blockprocessors.register(Matrix(md.parser), 'matrix', 175)
        md.parser.blockprocessors.register(SchemaEffect(md, md.lottie_schema), 'schema_effect', 175)
        md.parser.blockprocessors.register(FunctionDocs(md.parser, expr_schema), 'function_docs', 175)
        md.parser.blockprocessors.register(VariableDocs(md.parser, expr_schema), 'variable_docs', 175)
        md.preprocessors.register(ScriptPlayground(md), 'script_playground', 29)
        md.preprocessors.register(EffectShaderScript(md, md.lottie_ts), "effect_shader_script", 29)
        md.preprocessors.register(ShapeBezierScript(md, md.lottie_ts), "shape_bezier_script", 29)
        md.parser.blockprocessors.register(AepMatchNameTable(md.parser, md.lottie_schema), "aep_mn", 175)
        md.inlinePatterns.register(SectionLinkInlineProcessor(md), "sl", 175)


def makeExtension(**kwargs):
    return LottieDocsExtension(**kwargs)
