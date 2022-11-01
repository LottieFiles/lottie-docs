# Layer Effects

Layers can have post-processing effects applied to them.

## Effects

{schema_object:effects/effect}
EXPAND:#/$defs/helpers/visual-object
ef:Array of [effect values](#effect-values). Each effect below shows a table with the values it expects.

Many effects have unused values which are labeled with a number.


Effect types:

|`ty`| Effect Type |
|----|-------------|
|`5` |[Misc Effect](#misc-effect)|
|`7` |[Paint Over Transparent](#paint-over-transparent-effect)|
|`20`|[Tint](#tint-effect)|
|`21`|[Fill](#fill-effect)|
|`22`|[Stroke](#stroke-effect)|
|`23`|[Tritone](#tritone-effect)|
|`24`|[Pro Levels](#pro-levles-effect)|
|`25`|[Drop Shadow](#drop-shadow-effect)|
|`26`|[Radial Wipe](#radial-wipe-effect)|
|`27`|[Displacement Map](#displacement-map-wipe)|
|`28`|[Matte3](#matte3-effect)|
|`29`|[Gaussian Blur](#gaussian-blur-effect)|
|`31`|[Mesh Warp](#mesh-warp-effect)|
|`32`|[Wavy](#wavy-effect)|
|`33`|[Spherize](#spherize-effect)|
|`34`|[Puppet](#puppet-effect)|


All the examples will use this as their base:

{lottie:image.json:512:512}


### Fill Effect

Fill all opaque areas with a solid color

{schema_object:effects/fill-effect}
SKIP:#/$defs/effects/effect

{schema_effect:effects/fill-effect}

{lottie_playground:effects-fill.json:512:512}
Opacity:<input type="range" min="0" value="1" max="1" step="0.1"/>
Color:
Red:<input type="range" min="0" value="1" max="1" step="0.1"/>
Green:<input type="range" min="0" value="0.9" max="1" step="0.1"/>
Blue:<input type="range" min="0" value="0" max="1" step="0.1"/>
<json>lottie.layers[0].ef[0]</json>
<script>
lottie.layers[0].ef[0].ef[6].v.k = data["Opacity"];
lottie.layers[0].ef[0].ef[2].v.k[0] = data["Red"];
lottie.layers[0].ef[0].ef[2].v.k[1] = data["Green"];
lottie.layers[0].ef[0].ef[2].v.k[2] = data["Blue"];
</script>

### Stroke Effect

{schema_object:effects/stroke-effect}
SKIP:#/$defs/effects/effect

{schema_effect:effects/stroke-effect}


### Tritone Effect

Converts the layer to greyscale, then applies the gradient based on bright/mid/dark.

{schema_object:effects/tritone-effect}
SKIP:#/$defs/effects/effect

{schema_effect:effects/tritone-effect}


{lottie_playground:effects-tritone.json:512:512}
Bright:
Red:<input type="range" min="0" value="1" max="1" step="0.1" name="r1"/>
Green:<input type="range" min="0" value="1" max="1" step="0.1" name="g1"/>
Blue:<input type="range" min="0" value="1" max="1" step="0.1" name="b1"/>
Mid:
Red:<input type="range" min="0" value="0.3" max="1" step="0.1" name="r2"/>
Green:<input type="range" min="0" value="0.8" max="1" step="0.1" name="g2"/>
Blue:<input type="range" min="0" value="0.3" max="1" step="0.1" name="b2"/>
Dark:
Red:<input type="range" min="0" value="0" max="1" step="0.1" name="r3"/>
Green:<input type="range" min="0" value="0" max="1" step="0.1" name="g3"/>
Blue:<input type="range" min="0" value="0" max="1" step="0.1" name="b3"/>
<json>lottie.layers[0].ef[0]</json>
<script>
lottie.layers[0].ef[0].ef[0].v.k[0] = data["r1"];
lottie.layers[0].ef[0].ef[0].v.k[1] = data["g1"];
lottie.layers[0].ef[0].ef[0].v.k[2] = data["b1"];
lottie.layers[0].ef[0].ef[1].v.k[0] = data["r2"];
lottie.layers[0].ef[0].ef[1].v.k[1] = data["g2"];
lottie.layers[0].ef[0].ef[1].v.k[2] = data["b2"];
lottie.layers[0].ef[0].ef[2].v.k[0] = data["r3"];
lottie.layers[0].ef[0].ef[2].v.k[1] = data["g3"];
lottie.layers[0].ef[0].ef[2].v.k[2] = data["b3"];
</script>



### Pro Levels Effect

Color correction levels.
For more information refer to the [After Effects Documentation](https://helpx.adobe.com/after-effects/using/color-correction-effects.html#levels_effect).

{schema_object:effects/pro-levels-effect}
SKIP:#/$defs/effects/effect

{schema_effect:effects/pro-levels-effect}

{lottie_playground:effects-prolevels.json:512:512}
Composite:
In Black:<input type="range" min="0" value="0" max="1" step="0.1" name="Composite In Black"/>
In White:<input type="range" min="0" value="1" max="1" step="0.1" name="Composite In White"/>
Gamma:<input type="range" min="0" value="1" max="3" step="0.1" name="Composite Gamma"/>
Out Black:<input type="range" min="0" value="0" max="1" step="0.1" name="Composite Out Black"/>
Out White:<input type="range" min="0" value="1" max="1" step="0.1" name="Composite Out White"/>
Red:
In Black:<input type="range" min="0" value="0" max="1" step="0.1" name="Red In Black"/>
In White:<input type="range" min="0" value="1" max="1" step="0.1" name="Red In White"/>
Gamma:<input type="range" min="0" value="1" max="3" step="0.1" name="Red Gamma"/>
Out Black:<input type="range" min="0" value="0" max="1" step="0.1" name="Red Out Black"/>
Out White:<input type="range" min="0" value="1" max="1" step="0.1" name="Red Out White"/>
Green:
In Black:<input type="range" min="0" value="0" max="1" step="0.1" name="Green In Black"/>
In White:<input type="range" min="0" value="1" max="1" step="0.1" name="Green In White"/>
Gamma:<input type="range" min="0" value="1" max="3" step="0.1" name="Green Gamma"/>
Out Black:<input type="range" min="0" value="0" max="1" step="0.1" name="Green Out Black"/>
Out White:<input type="range" min="0" value="1" max="1" step="0.1" name="Green Out White"/>
Blue:
In Black:<input type="range" min="0" value="0" max="1" step="0.1" name="Blue In Black"/>
In White:<input type="range" min="0" value="1" max="1" step="0.1" name="Blue In White"/>
Gamma:<input type="range" min="0" value="1" max="3" step="0.1" name="Blue Gamma"/>
Out Black:<input type="range" min="0" value="0" max="1" step="0.1" name="Blue Out Black"/>
Out White:<input type="range" min="0" value="1" max="1" step="0.1" name="Blue Out White"/>
<json>lottie.layers[0].ef[0]</json>
<script>
lottie.layers[0].ef[0].ef[3].v.k = data["Composite In Black"];
lottie.layers[0].ef[0].ef[4].v.k = data["Composite In White"];
lottie.layers[0].ef[0].ef[5].v.k = data["Composite Gamma"];
lottie.layers[0].ef[0].ef[6].v.k = data["Composite Out Black"];
lottie.layers[0].ef[0].ef[7].v.k = data["Composite Out White"];
lottie.layers[0].ef[0].ef[10].v.k = data["Red In Black"];
lottie.layers[0].ef[0].ef[11].v.k = data["Red In White"];
lottie.layers[0].ef[0].ef[12].v.k = data["Red Gamma"];
lottie.layers[0].ef[0].ef[13].v.k = data["Red Out Black"];
lottie.layers[0].ef[0].ef[14].v.k = data["Red Out White"];
lottie.layers[0].ef[0].ef[17].v.k = data["Green In Black"];
lottie.layers[0].ef[0].ef[18].v.k = data["Green In White"];
lottie.layers[0].ef[0].ef[19].v.k = data["Green Gamma"];
lottie.layers[0].ef[0].ef[20].v.k = data["Green Out Black"];
lottie.layers[0].ef[0].ef[21].v.k = data["Green Out White"];
lottie.layers[0].ef[0].ef[24].v.k = data["Blue In Black"];
lottie.layers[0].ef[0].ef[25].v.k = data["Blue In White"];
lottie.layers[0].ef[0].ef[26].v.k = data["Blue Gamma"];
lottie.layers[0].ef[0].ef[27].v.k = data["Blue Out Black"];
lottie.layers[0].ef[0].ef[28].v.k = data["Blue Out White"];
</script>


### Tint Effect

The layer is converted to grayscale, then black to white is mapped to
the given color.

The result is merged back with the original based on the intensity.

{schema_object:effects/tint-effect}
SKIP:#/$defs/effects/effect

{schema_effect:effects/tint-effect}

{lottie_playground:effects-tint.json:512:512}
Black:
Red:<input type="range" min="0" value="0" max="1" step="0.1" name="Black Red"/>
Green:<input type="range" min="0" value="0" max="1" step="0.1" name="Black Green"/>
Blue:<input type="range" min="0" value="0" max="1" step="0.1" name="Black Blue"/>
White:
Red:<input type="range" min="0" value="0" max="1" step="0.1" name="White Red"/>
Green:<input type="range" min="0" value="1" max="1" step="0.1" name="White Green"/>
Blue:<input type="range" min="0" value="0" max="1" step="0.1" name="White Blue"/>
Intensity:
Effect Intensity:<input type="range" min="0" value="90" max="100"/>
<json>lottie.layers[0].ef[0]</json>
<script>
lottie.layers[0].ef[0].ef[0].v.k[0] = data["Black Red"];
lottie.layers[0].ef[0].ef[0].v.k[1] = data["Black Green"];
lottie.layers[0].ef[0].ef[0].v.k[2] = data["Black Blue"];
lottie.layers[0].ef[0].ef[1].v.k[0] = data["White Red"];
lottie.layers[0].ef[0].ef[1].v.k[1] = data["White Green"];
lottie.layers[0].ef[0].ef[1].v.k[2] = data["White Blue"];
lottie.layers[0].ef[0].ef[2].v.k = data["Effect Intensity"];
</script>

### Matte3 Effect

{schema_attribute:description:effects/matte3-effect}

{schema_object:effects/matte3-effect}
SKIP:#/$defs/effects/effect

{schema_effect:effects/matte3-effect}

{lottie_playground:effects-matte3.json:512:512}
Layer: <select><option value="2">Circle</option><option value="3">Rectangle</option></select>
Channel:<select>
    <option value="1">Red</option>
    <option value="2">Green</option>
    <option value="3">Blue</option>
    <option value="4" selected="selected">Alpha</option>
    <option value="5">Luma</option>
    <option value="6">Hue</option>
    <option value="7">Lightness</option>
    <option value="8">Saturation</option>
    <option value="9">Full</option>
    <option value="10">Off</option>
</select>
Invert:<input type="checkbox" />
Stretch To Fit:<input type="checkbox" checked="checked"/>
Show Mask:<input type="checkbox" checked="checked"/>
Premultiply Mask:<input type="checkbox" checked="checked"/>
<json>lottie.layers[0].ef[0]</json>
<script>
lottie.layers[0].ef[0].ef[0].v.k = Number(data["Layer"]);
lottie.layers[0].ef[0].ef[1].v.k = Number(data["Channel"]);
lottie.layers[0].ef[0].ef[2].v.k = Number(data["Invert"]);
lottie.layers[0].ef[0].ef[3].v.k = Number(data["Stretch To Fit"]);
lottie.layers[0].ef[0].ef[4].v.k = Number(data["Show Mask"]);
lottie.layers[0].ef[0].ef[5].v.k = Number(data["Premultiply Mask"]);
</script>

### Gaussian Blur Effect

{schema_object:effects/gaussian-blur-effect}
SKIP:#/$defs/effects/effect

{schema_effect:effects/gaussian-blur-effect}


{lottie_playground:effects-blur.json:512:512}
Sigma:<input type="range" min="0" value="25" max="100"/>
Direction:<select>
    <option value="1">Both</option>
    <option value="2">Horizontal</option>
    <option value="3">Vertical</option>
</select>
Wrap:<input type="checkbox" />
<json>lottie.layers[0].ef[0]</json>
<script>
lottie.layers[0].ef[0].ef[0].v.k = data["Sigma"];
lottie.layers[0].ef[0].ef[1].v.k = Number(data["Direction"]);
lottie.layers[0].ef[0].ef[2].v.k = Number(data["Wrap"]);
</script>



### Drop Shadow Effect

{schema_object:effects/drop-shadow-effect}
SKIP:#/$defs/effects/effect

{schema_effect:effects/drop-shadow-effect}

{lottie_playground:effects-shadow.json:512:512}
Red:<input type="range" min="0" value="0" max="1" step="0.1"/>
Green:<input type="range" min="0" value="0" max="1" step="0.1"/>
Blue:<input type="range" min="0" value="0" max="1" step="0.1"/>
Opacity:<input type="range" min="0" value="128" max="256"/>
Angle:<input type="range" min="0" value="135" max="360"/>
Distance:<input type="range" min="0" value="10" max="512"/>
Blur:<input type="range" min="0" value="7" max="512"/>
<json>lottie.layers[0].ef[0]</json>
<script>
lottie.layers[0].ef[0].ef[0].v.k[0] = data["Red"];
lottie.layers[0].ef[0].ef[0].v.k[1] = data["Green"];
lottie.layers[0].ef[0].ef[0].v.k[2] = data["Blue"];
lottie.layers[0].ef[0].ef[1].v.k = data["Opacity"];
lottie.layers[0].ef[0].ef[2].v.k = data["Angle"];
lottie.layers[0].ef[0].ef[3].v.k = data["Distance"];
lottie.layers[0].ef[0].ef[4].v.k = data["Blur"];
</script>



### Radial Wipe Effect

{schema_object:effects/radial-wipe-effect}
SKIP:#/$defs/effects/effect

{schema_effect:effects/radial-wipe-effect}


### Displacement Map Effect

{schema_object:effects/displacement-map-effect}
SKIP:#/$defs/effects/effect

{schema_effect:effects/displacement-map-effect}


### Mesh Warp Effect

{schema_object:effects/mesh-warp-effect}
SKIP:#/$defs/effects/effect

{schema_effect:effects/mesh-warp-effect}


### Paint Over Transparent Effect

{schema_object:effects/paint-over-transparent-effect}
SKIP:#/$defs/effects/effect

{schema_effect:effects/paint-over-transparent-effect}


### Puppet Effect

{schema_object:effects/puppet-effect}
SKIP:#/$defs/effects/effect

{schema_effect:effects/puppet-effect}


### Spherize Effect

{schema_object:effects/spherize-effect}
SKIP:#/$defs/effects/effect

{schema_effect:effects/spherize-effect}


### Wavy Effect

{schema_object:effects/wavy-effect}
SKIP:#/$defs/effects/effect

{schema_effect:effects/wavy-effect}


### Custom Effect

You might find various different effects all with `ty` = 5.

Sometimes these are used together with expressions.

{schema_object:effects/custom-effect}
SKIP:#/$defs/effects/effect


## Effect Values

{schema_object:effect-values/effect-value}
EXPAND:#/$defs/helpers/visual-object


|`ty`| Control Type |
|----|--------------|
|`0` |[Slider](#slider)|
|`1` |[Angle](#angle)|
|`2` |[Color](#color)|
|`3` |[Point](#point)|
|`4` |[Checkbox](#checkbox)|
|`6` |[Ignored](#ignored)|
|`7` |[Dropdown](#drop-down)|
|`10`|[Layer](#layer)|



### No Value

{schema_object:effect-values/no-value}
SKIP:#/$defs/effect-values/effect-value

### Slider

{schema_object:effect-values/slider}
SKIP:#/$defs/effect-values/effect-value

### Angle

{schema_object:effect-values/angle}
SKIP:#/$defs/effect-values/effect-value

### Color

{schema_object:effect-values/color}
SKIP:#/$defs/effect-values/effect-value

### Point

{schema_object:effect-values/point}
SKIP:#/$defs/effect-values/effect-value

### Checkbox

{schema_object:effect-values/checkbox}
SKIP:#/$defs/effect-values/effect-value

### Ignored

{schema_object:effect-values/ignored}
SKIP:#/$defs/effect-values/effect-value

### Drop Down

{schema_object:effect-values/drop-down}
SKIP:#/$defs/effect-values/effect-value

### Layer

{schema_object:effect-values/layer}
SKIP:#/$defs/effect-values/effect-value

## Layer Style

A layer can also have a list of styles applied to it

{schema_object:styles/layer-style}
EXPAND:#/$defs/helpers/visual-object

Style types:

|`ty`| Style Type |
|----|-------------|
|`0` |[Stroke](#stroke-style)|
|`1` |[Drop Shadow](#drop-shadow-style)|
|`2` |[Inner Shadow](#inner-shadow-style)|
|`3` |[Outer Glow](#outer-glow-style)|
|`4` |[Inner Glow](#inner-glow-style)|
|`5` |[Bevel / Emboss](#bevel-emboss-style)|
|`6` |[Satin](#satin-style)|
|`7` |[Color Overlay](#color-overlay-style)|
|`8` |[Gradient Overlay](#gradient-overlay-style)|


### Stroke Style

{schema_object:styles/stroke-style}
SKIP:#/$defs/styles/layer-style

### Drop Shadow Style

{schema_object:styles/drop-shadow-style}
SKIP:#/$defs/styles/layer-style

### Inner Shadow Style

{schema_object:styles/inner-shadow-style}
SKIP:#/$defs/styles/layer-style

### Outer Glow Style

{schema_object:styles/outer-glow-style}
SKIP:#/$defs/styles/layer-style

### Inner Glow Style

{schema_object:styles/inner-glow-style}
SKIP:#/$defs/styles/layer-style

### Bevel / Emboss Style

{schema_object:styles/bevel-emboss-style}
SKIP:#/$defs/styles/layer-style

### Satin Style

{schema_object:styles/satin-style}
SKIP:#/$defs/styles/layer-style

### Color Overlay Style

{schema_object:styles/color-overlay-style}
SKIP:#/$defs/styles/layer-style

### Gradient Overlay Style

{schema_object:styles/gradient-overlay-style}
SKIP:#/$defs/styles/layer-style
