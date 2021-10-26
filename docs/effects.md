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
|`5` |[Change to Color](#change-to-color-effect)|
|`20`|[Tint](#tint-effect)|
|`21`|[Fill](#fill-effect)|
|`22`|[Stroke](#stroke-effect)|
|`23`|[Tritone](#tritone-effect)|
|`24`|[Pro Levels](#pro-levles-effect)|
|`25`|[Drop Shadow](#drop-shadow-effect)|
|`28`|[Matte3](#matte3-effect)|
|`29`|[Gaussian Blur](#gaussian-blur-effect)|


All the examples will use this as their base:

{lottie:image.json:512:512}


### Fill Effect

Fill all opaque areas with a solid color

{schema_object:effects/fill-effect}
SKIP:#/$defs/effects/effect

{schema_effect:effects/fill-effect}


{lottie_playground:effects-fill.json:512:512}
//00.x:slider:layers[0].ef[0].ef[0].v.k[0]:0:0:512
//00.y:slider:layers[0].ef[0].ef[0].v.k[1]:0:0:512
//01:slider:layers[0].ef[0].ef[1].v.k:0:0:10
//03:slider:layers[0].ef[0].ef[3].v.k:0:0:10
//04:slider:layers[0].ef[0].ef[4].v.k:0:0:100
//05:slider:layers[0].ef[0].ef[5].v.k:0:0:100
Opacity:slider:layers[0].ef[0].ef[6].v.k:0:1:1:0.1
Color:label:
Red:slider:layers[0].ef[0].ef[2].v.k[0]:0:1:1:0.1
Green:slider:layers[0].ef[0].ef[2].v.k[1]:0:0.9:1:0.1
Blue:slider:layers[0].ef[0].ef[2].v.k[2]:0:0:1:0.1
:json:layers[0].ef[0]


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
Bright:label:
Red:slider:layers[0].ef[0].ef[0].v.k[0]:0:1:1:0.1
Green:slider:layers[0].ef[0].ef[0].v.k[1]:0:1:1:0.1
Blue:slider:layers[0].ef[0].ef[0].v.k[2]:0:0:1:0.1
Mid:label:
Red:slider:layers[0].ef[0].ef[1].v.k[0]:0:0.3:1:0.1
Green:slider:layers[0].ef[0].ef[1].v.k[1]:0:0.8:1:0.1
Blue:slider:layers[0].ef[0].ef[1].v.k[2]:0:0.3:1:0.1
Dark:label:
Red:slider:layers[0].ef[0].ef[1].v.k[0]:0:0:1:0.1
Green:slider:layers[0].ef[0].ef[1].v.k[1]:0:0:1:0.1
Blue:slider:layers[0].ef[0].ef[1].v.k[2]:0:0:1:0.1
:json:layers[0].ef[0]


### Pro Levels Effect

Color correction levels.
For more information refer to the [After Effects Documentation](https://helpx.adobe.com/after-effects/using/color-correction-effects.html#levels_effect).

{schema_object:effects/pro-levels-effect}
SKIP:#/$defs/effects/effect

{schema_effect:effects/pro-levels-effect}


{lottie_playground:effects-prolevels.json:512:512}
Composite:label:
In Black    :slider:layers[0].ef[0].ef[3].v.k:0:0:1:0.1
In White    :slider:layers[0].ef[0].ef[4].v.k:0:1:1:0.1
Gamma       :slider:layers[0].ef[0].ef[5].v.k:0:1:3:0.1
Out Black   :slider:layers[0].ef[0].ef[6].v.k:0:0:1:0.1
Out White   :slider:layers[0].ef[0].ef[7].v.k:0:1:1:0.1
Red:label:
In Black    :slider:layers[0].ef[0].ef[10].v.k:0:0:1:0.1
In White    :slider:layers[0].ef[0].ef[11].v.k:0:0:1:0.1
Gamma       :slider:layers[0].ef[0].ef[12].v.k:0:1:3:0.1
Out Black   :slider:layers[0].ef[0].ef[13].v.k:0:0:1:0.1
Out White   :slider:layers[0].ef[0].ef[14].v.k:0:1:1:0.1
Green:label:
In Black    :slider:layers[0].ef[0].ef[17].v.k:0:0:1:0.1
In White    :slider:layers[0].ef[0].ef[18].v.k:0:0:1:0.1
Gamma       :slider:layers[0].ef[0].ef[19].v.k:0:1:3:0.1
Out Black   :slider:layers[0].ef[0].ef[20].v.k:0:0:1:0.1
Out White   :slider:layers[0].ef[0].ef[21].v.k:0:1:1:0.1
Blue:label:
In Black    :slider:layers[0].ef[0].ef[24].v.k:0:0:1:0.1
In White    :slider:layers[0].ef[0].ef[25].v.k:0:0:1:0.1
Gamma       :slider:layers[0].ef[0].ef[26].v.k:0:1:3:0.1
Out Black   :slider:layers[0].ef[0].ef[27].v.k:0:0:1:0.1
Out White   :slider:layers[0].ef[0].ef[28].v.k:0:1:1:0.1
//Alpha:label:
//In Black    :slider:layers[0].ef[0].ef[30].v.k:0:0:1:0.1
//In White    :slider:layers[0].ef[0].ef[31].v.k:0:0:1:0.1
//Gamma       :slider:layers[0].ef[0].ef[32].v.k:0:1:3:0.1
//Out Black   :slider:layers[0].ef[0].ef[33].v.k:0:0:1:0.1
//Out White   :slider:layers[0].ef[0].ef[34].v.k:0:1:1:0.1
:json:layers[0].ef[0]

### Tint Effect

The layer is converted to grayscale, then black to white is mapped to
the given color.

The result is merged back with the original based on the intensity.

{schema_object:effects/tint-effect}
SKIP:#/$defs/effects/effect

{schema_effect:effects/tint-effect}

{lottie_playground:effects-tint.json:512:512}
Black:label:
Red:slider:layers[0].ef[0].ef[0].v.k[0]:0:0:1:0.1
Green:slider:layers[0].ef[0].ef[0].v.k[1]:0:0:1:0.1
Blue:slider:layers[0].ef[0].ef[0].v.k[2]:0:0:1:0.1
White:label:
Red:slider:layers[0].ef[0].ef[1].v.k[0]:0:0:1:0.1
Green:slider:layers[0].ef[0].ef[1].v.k[1]:0:1:1:0.1
Blue:slider:layers[0].ef[0].ef[1].v.k[2]:0:0:1:0.1
Intensity:label:
Effect Intensity:slider:layers[0].ef[0].ef[2].v.k:0:90:100
:json:layers[0].ef[0]


### Matte3 Effect

{schema_object:effects/matte3-effect}
SKIP:#/$defs/effects/effect

{schema_effect:effects/matte3-effect}

### Guassian Blur Effect

{schema_object:effects/gaussian-blur-effect}
SKIP:#/$defs/effects/effect

{schema_effect:effects/gaussian-blur-effect}


{lottie_playground:effects-blur.json:512:512}
Sigma:slider:layers[0].ef[0].ef[0].v.k:0:25:100
Dimensions:slider:layers[0].ef[0].ef[1].v.k:0:0:3
Wrap:slider:layers[0].ef[0].ef[2].v.k:0:0:1
:json:layers[0].ef[0]

### Change To Color Effect

{schema_object:effects/change-to-color-effect}
SKIP:#/$defs/effects/effect

{schema_effect:effects/change-to-color-effect}


### Drop Shadow Effect

{schema_object:effects/drop-shadow-effect}
SKIP:#/$defs/effects/effect

{schema_effect:effects/drop-shadow-effect}

{lottie_playground:effects-shadow.json:512:512}
Red:slider:layers[0].ef[0].ef[0].v.k[0]:0:0:1:0.1
Green:slider:layers[0].ef[0].ef[0].v.k[1]:0:0:1:0.1
Blue:slider:layers[0].ef[0].ef[0].v.k[2]:0:0:1:0.1
Opacity:slider:layers[0].ef[0].ef[1].v.k:0:128:256
Angle:slider:layers[0].ef[0].ef[2].v.k:0:135:360
Distance:slider:layers[0].ef[0].ef[3].v.k:0:10:512
Blur:slider:layers[0].ef[0].ef[4].v.k:0:7:512
:json:layers[0].ef[0]

## Effect Values

{schema_object:effects/effect-value}
EXPAND:#/$defs/helpers/visual-object


|`ty`| Control Type |
|----|--------------|
|`0` |[Slider](#slider)|
|`1` |[Angle](#angle)|
|`2` |[Color](#color)|
|`3` |[Point](#point)|
|`4` |[Checkbox](#checkbox)|
|`6` |[Ignored](#ignored)|
|`7` |[Dropdown](#dropdown)|
|`10`|[Layer](#layer)|



### No Value

{schema_object:effects/effect-no-value}
SKIP:#/$defs/effects/effect-value

### Slider

{schema_object:effects/effect-value-slider}
SKIP:#/$defs/effects/effect-value

### Angle

{schema_object:effects/effect-value-angle}
SKIP:#/$defs/effects/effect-value

### Color

{schema_object:effects/effect-value-color}
SKIP:#/$defs/effects/effect-value

### Point

{schema_object:effects/effect-value-point}
SKIP:#/$defs/effects/effect-value

### Checkbox

{schema_object:effects/effect-value-checkbox}
SKIP:#/$defs/effects/effect-value

### Ignored

{schema_object:effects/effect-value-ignored}
SKIP:#/$defs/effects/effect-value

### Drop Down

{schema_object:effects/effect-value-drop-down}
SKIP:#/$defs/effects/effect-value

### Layer

{schema_object:effects/effect-value-layer}
SKIP:#/$defs/effects/effect-value
