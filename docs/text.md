# Text

## Font List

Fonts are defined in the animation object, under `fonts`.

When `fonts` is present in the [Animation](animation.md) object,
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
array of character data objects in the `chars` attribute of the [animation](animation.md).

{schema_object:text/character-data}
data:Defines how the character is defined


#### Character Shapes

{schema_attribute:description:text/character-shapes}

{schema_object:text/character-shapes}

#### Character Precomp

{schema_attribute:description:text/character-precomp}

{schema_object:text/character-precomp}

## Text Layer

The [text layer](layers.md#text-layer) has an attribute called `t` containing a [Text Animator Data](#text-animator-data) object.

### Text Data

{schema_attribute:description:text/text-data}

{schema_object:text/text-data}

### Animated Text Document

This object is similar to an [animated property](concepts.md#animated-property) for text.

The main difference is that it's always treated as animated (ie: you _must_ use keyframes).

{schema_object:text/animated-text-document}
k: Array of [keyframes](#text-document-keyframe)


### Text Document Keyframe

This is similar to the [keyframe](concepts.md#keyframe) object used by animated properties,
but it doesn't have any attribute specifying interpolation as text is always animated in discrete steps.

{schema_object:text/text-document-keyframe}

### Text Document

This is where the actual text data is stored.

{schema_object:text/text-document}

{lottie_playground:text-document.json:300:100}
Text:<input type="text" value="Hello"/>
Color Red:<input type="range" min="0" value="0" max="1" step="0.01"/>
Color Green:<input type="range" min="0" value="0" max="1" step="0.01"/>
Color Blue:<input type="range" min="0" value="0" max="1" step="0.01"/>
Stroke Width:<input type="range" min="0" value="0" max="32" />
Stroke Red:<input type="range" min="0" value="0" max="1" step="0.01"/>
Stroke Green:<input type="range" min="0" value="0" max="1" step="0.01"/>
Stroke Blue:<input type="range" min="0" value="0" max="1" step="0.01"/>
Position X:<input type="range" min="0" value="5" max="300"/>
Position Y:<input type="range" min="0" value="80" max="100"/>
Font Size:<input type="range" min="0" value="100" max="150"/>
Justify:<enum>text-justify</enum>
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


### Text Alignment Options

{schema_object:text/text-alignment-options}


### Text Follow Path

{schema_attribute:description:text/text-follow-path}

{schema_object:text/text-follow-path}


### Text Range

{schema_attribute:description:text/text-range}

{schema_object:text/text-range}

{lottie_playground:text-selector.json:512:350}
Text:<textarea>
Hello World
the quick brown
fox jumps over
the lazy dog
</textarea>
Selector:
Start:<input type="range" min="0" value="60" max="100" step="1"/>
End:<input type="range" min="0" value="75" max="100" step="1"/>
Offset:<input type="range" min="-100" value="0" max="100" step="1"/>
Min Ease:<input type="range" min="-100" value="0" max="100" step="1"/>
Max Ease:<input type="range" min="-100" value="0" max="100" step="1"/>
Randomize:<input type="checkbox" />
Range Units:<enum>text-range-units</enum>
Based On:<enum>text-based</enum>
Shape:<enum>text-shape</enum>
Transform:
Position X:<input type="range" min="-100" value="0" max="100" step="1"/>
Position Y:<input type="range" min="-100" value="0" max="100" step="1"/>
Rotation:<input type="range" min="0" value="0" max="360" step="1"/>
Opacity:<input type="range" min="0" value="100" max="100" step="1"/>
Style:
Fill:<input type="color" lottie-color="1" value="#3250b0" />
Fill Hue:<input type="range" min="-360" value="0" max="360" step="1"/>
Fill Saturation:<input type="range" min="-100" value="0" max="100" step="1"/>
Fill Brightness:<input type="range" min="-100" value="0" max="100" step="1"/>
Stroke:<input type="color" lottie-color="1" value="#000000" />
Stroke Width:<input type="range" min="0" value="0" max="20" step="1"/>
Letter Spacing:<input type="range" min="-100" value="0" max="100" step="1"/>
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


#### Text Range Selector

Defines the range of characters to apply a property value only to
a specific subset of the text document.

`r` Defines whether the values are defined as a percentage or indices.

The range is defined by `s`, `e`, and `o`.

`ne` and `xe` define what happes to text that is only partly inside the selected range.

`b` changes whether selection is done on per character basis, per word, etc.
It also changes the meaning of an index when `r` is set to Indices.


{schema_object:text/text-range-selector}

{lottie_playground:text-selector.json:512:350}
Start:<input type="range" min="0" value="60" max="100" step="1"/>
End:<input type="range" min="0" value="75" max="100" step="1"/>
Offset:<input type="range" min="-100" value="0" max="100" step="1"/>
Min Ease:<input type="range" min="-100" value="0" max="100" step="1"/>
Max Ease:<input type="range" min="-100" value="0" max="100" step="1"/>
Randomize:<input type="checkbox" />
Range Units:<enum>text-range-units</enum>
Based On:<enum>text-based</enum>
Shape:<enum>text-shape</enum>
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

#### Text Style

Has the properties of a transform and the style options of a text document.

It applies such transform and style to the part of the text defined
by the text selector property

{schema_object:text/text-style}


{lottie_playground:text-selector.json:512:350}
Transform:
Position X:<input type="range" min="-100" value="0" max="100" step="1"/>
Position Y:<input type="range" min="-100" value="0" max="100" step="1"/>
Rotation:<input type="range" min="0" value="0" max="360" step="1"/>
Opacity:<input type="range" min="0" value="100" max="100" step="1"/>
Style:
Fill:<input type="color" lottie-color="1" value="#3250b0" />
Fill Hue:<input type="range" min="-360" value="0" max="360" step="1"/>
Fill Saturation:<input type="range" min="-100" value="0" max="100" step="1"/>
Fill Brightness:<input type="range" min="-100" value="0" max="100" step="1"/>
Stroke:<input type="color" lottie-color="1" value="#000000" />
Stroke Width:<input type="range" min="0" value="0" max="20" step="1"/>
Letter Spacing:<input type="range" min="-100" value="0" max="100" step="1"/>
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
