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

### Text Animator Data

{schema_object:text/text-animator-data}

### Text Data

This object is similar to an [animated property](concepts.md#animated-property) for text.

The main difference is that it's always treated as animated (ie: you _must_ use keyframes).

{schema_object:text/text-data}
k: Array of [keyframes](#text-data-keyframe)


### Text Data Keyframe

This is similar to the [keyframe](concepts.md#keyframe) object used by animated properties,
but it doesn't have any attribute specifying interpolation as text is always animated in discrete steps.

{schema_object:text/text-data-keyframe}

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


### Text More Options

{schema_object:text/text-more-options}


### Masked Path

{schema_attribute:description:text/masked-path}

{schema_object:text/masked-path}


### Text Selector

{schema_object:text/text-selector}

### Text Selector Property

{schema_object:text/text-selector-property}


### Text Animator Data Property

{schema_object:text/text-animator-data-property}

