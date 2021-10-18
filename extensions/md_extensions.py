import re
import os
from pathlib import Path
import xml.etree.ElementTree as etree
from xml.etree.ElementTree import parse as parse_xml
from markdown.inlinepatterns import InlineProcessor
from markdown.blockprocessors import BlockProcessor
from markdown.extensions import Extension


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


class LottieInlineProcessor(InlineProcessor):
    def __init__(self, md):
        pattern = r'{lottie:([^:]+)(?::([0-9]+):([0-9]+))}'
        super().__init__(pattern, md)
        self._id = 0

    def handleMatch(self, m, data):
        el = etree.Element("div")
        el.attrib["class"] = "lottie-container"

        animation = etree.Element("div")
        el.append(animation)
        animation.attrib["class"] = "alpha_checkered"
        animation.attrib["id"] = "lottie_target_%s" % self._id

        filename = "examples/" + m.group(1)
        download_file = filename
        lottie_url = "../" + filename

        if m.group(2):
            animation.attrib["style"] = "width:%spx;height:%spx" % (m.group(2), m.group(3))

        play = etree.Element("button")
        el.append(play)
        play.attrib["id"] = "lottie_play_{id}".format(id=self._id)
        play.attrib["onclick"] = "anim_{id}.play(); document.getElementById('lottie_pause_{id}').style.display = 'inline-block'; this.style.display = 'none'".format(id=self._id)
        play.append(etree_fontawesome("play"))
        play.attrib["title"] = "Play"
        play.attrib["style"] = "display:none"

        pause = etree.Element("button")
        el.append(pause)
        pause.attrib["id"] = "lottie_pause_{id}".format(id=self._id)
        pause.attrib["onclick"] = "anim_{id}.pause(); document.getElementById('lottie_play_{id}').style.display = 'inline-block'; this.style.display = 'none'".format(id=self._id)
        pause.append(etree_fontawesome("pause"))
        pause.attrib["title"] = "Pause"

        if download_file:
            download = etree.Element("a")
            el.append(download)
            download.attrib["href"] = download_file
            download.attrib["title"] = "Download"
            download_button = etree.Element("button")
            download.append(download_button)
            download_button.append(etree_fontawesome("download"))

        script = etree.Element("script")
        el.append(script)
        script.text = """
            var anim_{id} = bodymovin.loadAnimation({{
                container: document.getElementById('lottie_target_{id}'),
                renderer: 'svg',
                loop: true,
                autoplay: true,
                path: '{file}'
            }});
        """.format(id=self._id, file=lottie_url)

        self._id += 1
        return el, m.start(0), m.end(0)


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
        table.attrib["style"] = "font-family: monospace; text-align: center; background-color: #fcfdff; border: 1px solid #ccc;"
        table.attrib["class"] = "table-plain"
        rows = blocks.pop(0)
        for row in rows.split("\n")[1:]:
            tr = etree.SubElement(table, "tr")
            for cell in row.split():
                td = etree.SubElement(tr, "td")
                td.text = cell
                td.attrib["style"] = "width: 25%;"
        return True


class GlaxnimateExtension(Extension):
    def extendMarkdown(self, md):
        md.inlinePatterns.register(LottieInlineProcessor(md), 'lottie', 175)
        md.inlinePatterns.register(LottieColor(r'{lottie_color:(([^,]+),\s*([^,]+),\s*([^,]+))}', md, 1), 'lottie_color', 175)
        md.inlinePatterns.register(LottieColor(r'{lottie_color_255:(([^,]+),\s*([^,]+),\s*([^,]+))}', md, 255), 'lottie_color_255', 175)
        md.parser.blockprocessors.register(Matrix(md.parser), 'matrix', 175)


def makeExtension(**kwargs):
    return GlaxnimateExtension(**kwargs)

