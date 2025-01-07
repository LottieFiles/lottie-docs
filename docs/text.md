# Text

## Font List

Fonts are defined in the animation object, under `fonts`.

When `fonts` is present in the {link:composition/animation} object,
it has a single attribute called `list`, which is an array of font objects:

{schema_object:text/font}


To understand how to load fonts it's better to look at some examples so here
follow various ways of adding a font into lottie. The tables show the JSON,
its resulting output, then an equivalent font definition using CSS.



<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap');


@font-face {
  font-family: 'Ubuntu';
  font-style: italic;
  font-weight: 300;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/ubuntu/v15/4iCp6KVjbNBYlgoKejZftWyI.ttf) format('truetype');
}
</style>


### Using a system font

Here we use `origin` 0 (and we can omit it).

`fFamily` needs to be an available font family.

<table markdown="block">
<tr><th>JSON</th><th>Lottie Output</th></tr>
<tr markdown="block"><td>

```json
{
    "fFamily": "monospace",
    "fName": "MyFont",
    "fStyle": "Regular"
}
```

</td><td markdown="block">

{lottie:font-local.json:300:100}

</td></tr>
<tr><th>CSS</th><th>Output</th></tr>
<tr><td>

```css
{
    font-family: monospace;
}
```

</td><td>
<div style="font-family: monospace; font-size:100px; color: black; background: white;">Hello</div>
</td></tr>
</table>


### Font from CSS URL

Here we use `origin` 1.

<table markdown="block">
<tr><th>JSON</th><th>Lottie Output</th></tr>
<tr markdown="block"><td>

```json
{
    "fPath": "https://fonts.googleapis.com/css2?family=Montserrat:wght@800&display=swap",
    "fFamily": "Poppins",
    "fStyle": "Bold",
    "fName": "Poppins Bold",
    "origin": 1
}
```

</td><td markdown="block">

{lottie:font-css.json:300:100}

</td></tr>
<tr><th>CSS</th><th>Output</th></tr>
<tr><td>

```css
 @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap');
```

or

```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700&amp;display=swap" rel="stylesheet">
```

</td><td>
<div style="font-family: Poppins; font-size:100px; color: black; background: white;">Hello</div>
</td></tr>
</table>


### Font from URL

Here we use `origin` 3.

<table markdown="block">
<tr><th>JSON</th><th>Lottie Output</th></tr>
<tr markdown="block"><td>

```json
{
    "fPath": "https://fonts.gstatic.com/s/ubuntu/v15/4iCp6KVjbNBYlgoKejZftWyI.ttf",
    "fFamily": "Ubuntu",
    "fStyle": "Light Italic",
    "fName": "Ubuntu Light Italic",
    "origin": 3
}
```

</td><td markdown="block">

{lottie:font-url.json:300:100}

</td></tr>
<tr><th>CSS</th><th>Output</th></tr>
<tr><td>

```css
@font-face {
  font-family: 'Ubuntu';
  font-style: italic;
  font-weight: 300;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/ubuntu/v15/4iCp6KVjbNBYlgoKejZftWyI.ttf) format('truetype');
}
```

</td><td>
<div style="font-family: ubuntu; font-weight: 300; font-style: italic; font-size:100px; color: black; background: white;">Hello</div>
</td></tr>
</table>

### Character Data

You can also have font data directly into the lottie, this is done by having an
array of character data objects in the `chars` attribute of the {link:composition/animation}.

{schema_object:text/character-data}
data:Defines how the character is defined


#### Character Shapes

{schema_string:text/character-shapes/description}

{schema_object:text/character-shapes}

#### Character Precomp

{schema_string:text/character-precomp/description}

{schema_object:text/character-precomp}

## Text Layer

The [text layer](layers.md#text-layer) has an attribute called `t` containing a [Text Animator Data](#text-animator-data) object.

### Text Data

{schema_string:text/text-data/description}

{schema_object:text/text-data}

### Animated Text Document

This object is similar to an [animated property](properties.md#animated-property) for text.

The main difference is that it's always treated as animated (ie: you _must_ use keyframes).

{schema_object:text/animated-text-document}
k: Array of [keyframes](#text-document-keyframe)


### Text Document Keyframe

This is similar to the {link:properties/base-keyframe:keyframe} object used by animated properties,
but it doesn't have any attribute specifying interpolation as text is always animated in discrete steps.

{schema_object:text/text-document-keyframe}

### Text Document

This is where the actual text data is stored.

{schema_object:text/text-document}

<lottie-playground example="text-document.json" width="300" height="100">
    <form>
        <input title="Text" type="text" value="Hello"/>
        <input title="Color Red" type="range" min="0" value="0" max="1" step="0.01"/>
        <input title="Color Green" type="range" min="0" value="0" max="1" step="0.01"/>
        <input title="Color Blue" type="range" min="0" value="0" max="1" step="0.01"/>
        <input title="Stroke Width" type="range" min="0" value="0" max="32" />
        <input title="Stroke Red" type="range" min="0" value="0" max="1" step="0.01"/>
        <input title="Stroke Green" type="range" min="0" value="0" max="1" step="0.01"/>
        <input title="Stroke Blue" type="range" min="0" value="0" max="1" step="0.01"/>
        <input title="Position X" type="range" min="0" value="5" max="300"/>
        <input title="Position Y" type="range" min="0" value="80" max="100"/>
        <input title="Font Size" type="range" min="0" value="100" max="150"/>
        <enum title="Justify">text-justify</enum>
    </form>
    <json>lottie.layers[0]</json>
    <script>
    lottie.layers[0].t.d.k[0].s.t = data["Text"];
    lottie.layers[0].t.d.k[0].s.fc[0] = data["Color Red"];
    lottie.layers[0].t.d.k[0].s.fc[1] = data["Color Green"];
    lottie.layers[0].t.d.k[0].s.fc[2] = data["Color Blue"];
    lottie.layers[0].t.d.k[0].s.sc = [
        data["Stroke Red"],
        data["Stroke Green"],
        data["Stroke Blue"]
    ];
    lottie.layers[0].t.d.k[0].s.sw = data["Stroke Width"];
    lottie.layers[0].ks.p.k[0] = data["Position X"];
    lottie.layers[0].ks.p.k[1] = data["Position Y"];
    lottie.layers[0].t.d.k[0].s.s = data["Font Size"];
    lottie.layers[0].t.d.k[0].s.j = Number(data["Justify"]);
    </script>
</lottie-playground>

### Text Alignment Options

Used to change the origin point for transformations, such as Rotation, that may be applied to the text string. The origin point for each character, word, or line can be changed.

{schema_object:text/text-alignment-options}


### Text Follow Path

{schema_string:text/text-follow-path/description}

{schema_object:text/text-follow-path}


### Text Range

{schema_string:text/text-range/description}

{schema_object:text/text-range}

<lottie-playground example="text-selector.json" width="512" height="350">
    <form>
        <textarea title="Text">
        Hello World
        the quick brown
        fox jumps over
        the lazy dog
        </textarea>
        <th>Selector</th>
        <input title="Start" type="range" min="0" value="60" max="100" step="1"/>
        <input title="End" type="range" min="0" value="75" max="100" step="1"/>
        <input title="Offset" type="range" min="-100" value="0" max="100" step="1"/>
        <input title="Min Ease" type="range" min="-100" value="0" max="100" step="1"/>
        <input title="Max Ease" type="range" min="-100" value="0" max="100" step="1"/>
        <input title="Randomize" type="checkbox" />
        <enum title="Range Units">text-range-units</enum>
        <enum title="Based On">text-based</enum>
        <enum title="Shape">text-shape</enum>
        <th>Transform</th>
        <input title="Position X" type="range" min="-100" value="0" max="100" step="1"/>
        <input title="Position Y" type="range" min="-100" value="0" max="100" step="1"/>
        <input title="Rotation" type="range" min="0" value="0" max="360" step="1"/>
        <input title="Opacity" type="range" min="0" value="100" max="100" step="1"/>
        <th>Style</th>
        <input title="Fill" type="color" lottie-color="1" value="#3250b0" />
        <input title="Fill Hue" type="range" min="-360" value="0" max="360" step="1"/>
        <input title="Fill Saturation" type="range" min="-100" value="0" max="100" step="1"/>
        <input title="Fill Brightness" type="range" min="-100" value="0" max="100" step="1"/>
        <input title="Stroke" type="color" lottie-color="1" value="#000000" />
        <input title="Stroke Width" type="range" min="0" value="0" max="20" step="1"/>
        <input title="Letter Spacing" type="range" min="-100" value="0" max="100" step="1"/>
    </form>
    <json>lottie.layers[0].t.a[0]</json>
    <script>
    var range = lottie.layers[0].t.a[0];
    lottie.fonts.list[0].fFamily = "monospace";
    lottie.layers[0].t.d.k[0].s.t = data["Text"].replace(/\n\r?/g, "\r")
    range.s.s.k = data["Start"];
    range.s.e.k = data["End"];
    range.s.o.k = data["Offset"];
    range.s.ne.k = data["Min Ease"];
    range.s.xe.k = data["Max Ease"];
    range.s.rn = Number(data["Randomize"]);
    range.s.b = Number(data["Based On"]);
    range.s.sh = Number(data["Shape"]);
    range.s.r = Number(data["Range Units"]);
    range.a.p.k = [data["Position X"], data["Position Y"]];
    range.a.o.k = data["Opacity"];
    range.a.r.k = data["Rotation"];
    range.a.fc.k = data["Fill"];
    range.a.sc.k = data["Stroke"];
    range.a.sw.k = data["Stroke Width"];
    range.a.t.k = data["Letter Spacing"];
    range.a.fh.k = data["Fill Hue"];
    range.a.fs.k = data["Fill Saturation"];
    range.a.fb.k = data["Fill Brightness"];
    </script>
</lottie-playground>

#### Text Range Selector

Defines the range of characters to apply a property value only to
a specific subset of the text document.

`r` Defines whether the values are defined as a percentage or indices.

The range is defined by `s`, `e`, and `o`.

`ne` and `xe` define what happes to text that is only partly inside the selected range.

`b` changes whether selection is done on per character basis, per word, etc.
It also changes the meaning of an index when `r` is set to Indices.


{schema_object:text/text-range-selector}

<lottie-playground example="text-selector.json" width="512" height="350">
    <form>
        <input title="Start" type="range" min="0" value="60" max="100" step="1"/>
        <input title="End" type="range" min="0" value="75" max="100" step="1"/>
        <input title="Offset" type="range" min="-100" value="0" max="100" step="1"/>
        <input title="Min Ease" type="range" min="-100" value="0" max="100" step="1"/>
        <input title="Max Ease" type="range" min="-100" value="0" max="100" step="1"/>
        <input title="Randomize" type="checkbox" />
        <enum title="Range Units">text-range-units</enum>
        <enum title="Based On">text-based</enum>
        <enum title="Shape">text-shape</enum>
    </form>
    <json>lottie.layers[0].t.a[0].s</json>
    <script>
    var selector = lottie.layers[0].t.a[0].s;
    selector.s.k = data["Start"];
    selector.e.k = data["End"];
    selector.o.k = data["Offset"];
    selector.ne.k = data["Min Ease"];
    selector.xe.k = data["Max Ease"];
    selector.rn = Number(data["Randomize"]);
    selector.b = Number(data["Based On"]);
    selector.sh = Number(data["Shape"]);
    selector.r = Number(data["Range Units"]);
    </script>
</lottie-playground>

#### Text Style

Has the properties of a transform and the style options of a text document.

It applies such transform and style to the part of the text defined
by the text selector property

{schema_object:text/text-style}

<lottie-playground example="text-selector.json" width="512" height="350">
    <form>
        <tr>Transform</tr>
        <input title="Position X" type="range" min="-100" value="0" max="100" step="1"/>
        <input title="Position Y" type="range" min="-100" value="0" max="100" step="1"/>
        <input title="Rotation" type="range" min="0" value="0" max="360" step="1"/>
        <input title="Opacity" type="range" min="0" value="100" max="100" step="1"/>
        <tr>Style</tr>
        <input title="Fill" type="color" lottie-color="1" value="#3250b0" />
        <input title="Fill Hue" type="range" min="-360" value="0" max="360" step="1"/>
        <input title="Fill Saturation" type="range" min="-100" value="0" max="100" step="1"/>
        <input title="Fill Brightness" type="range" min="-100" value="0" max="100" step="1"/>
        <input title="Stroke" type="color" lottie-color="1" value="#000000" />
        <input title="Stroke Width" type="range" min="0" value="0" max="20" step="1"/>
        <input title="Letter Spacing" type="range" min="-100" value="0" max="100" step="1"/>
    </form>
    <json>lottie.layers[0].t.a[0].a</json>
    <script>
    var range = lottie.layers[0].t.a[0];
    range.a.p.k = [data["Position X"], data["Position Y"]];
    range.a.o.k = data["Opacity"];
    range.a.r.k = data["Rotation"];
    range.a.fc.k = data["Fill"];
    range.a.sc.k = data["Stroke"];
    range.a.sw.k = data["Stroke Width"];
    range.a.t.k = data["Letter Spacing"];
    range.a.fh.k = data["Fill Hue"];
    range.a.fs.k = data["Fill Saturation"];
    range.a.fb.k = data["Fill Brightness"];
    </script>
</lottie-playground>
