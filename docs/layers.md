# Layers

## Layer

There are several layer types, which is specified by the `ty` attribute:

|`ty`| Layer Type                       | Description                                                                                   |
|----|----------------------------------|-----------------------------------------------------------------------------------------------|
|`0` |[Precomposition](#precomposition-layer)|Renders a [Precomposition](assets.md#precomposition)                                      |
|`1` |[Solid Color](#solid-color-layer) |Static rectangle filling the canvas with a single color                                        |
|`2` |[Image](#image-layer)             |Renders an [Image](assets.md#image)                                                            |
|`3` |[Null (Empty)](#null-layer)       |No contents, only used for [parenting](#parenting)                                             |
|`4` |[Shape](#shape-layer)             |Has an [array](concepts.md#lists-of-layers-and-shapes) of [shapes](shapes.md#shape-element)    |
|`5` |[Text](#text-layer)               |Renders text                                                                                   |
|`6` |[Audio](#audio-layer)             |Plays some audio                                                                               |
|`7` |Video Placeholder                 |                                                                                               |
|`8` |Image Sequence                    |                                                                                               |
|`9` |Video                             |                                                                                               |
|`10`|Image Placeholder                 |                                                                                               |
|`11`|Guide                             |                                                                                               |
|`12`|Adjustment                        |                                                                                               |
|`13`|[Camera](#camera-layer)           |3D Camera                                                                                      |
|`14`|Light                             |                                                                                               |
|`15`|Data                              |                                                                                               |

Each layer type has its own properties but there are several common properties:

{schema_object:layers/visual-layer}
EXPAND:#/$defs/helpers/visual-object
EXPAND:#/$defs/layers/layer
ddd:Whether the layer is 3D. Lottie doesn't actually support 3D stuff so this should always be 0
ty:Layer type, must be one of the values seen above
ind:Layer index for [parenting](#parenting)
parent:Parent index for [parenting](#parenting)
tt:Matte mode (see [mattes](#mattes))
td:Matte target (see [mattes](#mattes))
masksProperties:[Masks](#masks) for the layer
ef:[Effects](effects.md) for the layer

Note that layers that don't have a visual component (Audio layers for example),
won't have a transform and similar.

The layer is only visible between its `ip` and `op`.
If they match the corresponding attributes in [Animation](animation.md), the layer
will be visible the whole time, otherwise it will become visible at the frame `ip`
and disappear at `op`.


### Parenting

Within a list of layers, the `ind` attribute (if present) must be unique.

Layers having a `parent` attribute matching another layer will inherit their
parent's transform (except for opacity).

Basically you need multiply the transform matrix by the parent's transform matrix
to get a child layer's final transform.

The flat layer structure and flexible parenting allows more flexibility but it's
different from the more traditional approach of nesting child layers inside the
parent layer (like a folder structure).

One of the advantages of flexible parenting is you can have children of the same
layer be intermixed with unrelated layers.

In the following example, the star and the ellipse are in separate layers,
but both have the same parent, which moves left and right.
Between the two there's an additional layer with the rectangle.

{lottie:parenting.json:512:512}

### Auto Orient

When true, if the transform position is animated, it rotates the layer along the
path the position follows.

In the following example there are two arrows animated along the same path,
with no rotation when the position moves towards the right.

The transparent one keeps its rotation the same (`ao` is 0), while the solid one
follows the path (`ao` is 1).

{lottie:auto_orient.json:512:512}

### Mattes

A matte allows using a layer as a mask for another layer.

The way it works is the layer defining the mask has a `tt` attribute with the
appropriate [value](constants.md#mattemode)
and it affects the layer on top (the layer before it in the layer list, which has the `td` attribute).

In this example there's a layer with a rectangle and a star being masked by an ellipse:

{lottie_playground:matte.json:512:512}
Matte Mode:<enum value="1">matte-mode</enum>
<script>
lottie.layers[2].tt = Number(data["Matte Mode"]);
</script>


### Masks

A layer can have an array of masks that clip the contents of the layer to a shape.

This is similar to [mattes](#mattes), but there are a few differences.

With mattes, you use a layer to define the clipping area, while with masks
you use an [animated](concepts.md#animated-property) [bezier curve](concepts.md#bezier).

{schema_object:helpers/mask}
EXPAND:#/$defs/helpers/visual-object


## Shape Layer

Renders vector data.

The only special property for this layer is **shapes**, an [array](concepts.md#lists-of-layers-and-shapes) of [shapes](shapes.md#shape-element).

{schema_object:layers/shape-layer}

## Precomposition Layer

This layer renders a [precomposition](assets.md#precomposition).

{schema_object:layers/precomposition-layer}

### Time remapping

The `tm` property maps the time in seconds of the precomposition to show.

Basically you get the value of `tm` at the current frame, then assume that's
a time in seconds since the start of the animation, and render the corresponding
frame of the precomposition.

Follows an example of this, here there are two layers showing the same
precomposition, the one at the top right keeps the original time while the bottom
one remaps time as follows:

* frame 0 (0s) maps to 0s (frame 0) in the precomp
* frame 30 (0.5s) maps to 3s (frame 180) in the precomp
* frame 60 (1s) maps to 1.5s (frame 90) in the precomp
* frame 180 (3s) maps to 3s (frame 180) in the precomp

Basically it makes the precomp play in the first half second, then rewind
to half way for the next half second, and plays back to the end for the remaining
2 seconds.

{lottie:remapping.json:512:512}


## Null Layer

This layer doesn't have any special properties.

It's often used by animators as a parent to multiple other layers (see [parenting](#parenting)).

{schema_object:layers/null-layer}

## Text Layer

For text data, please refer to the [section about text](text.md) for details.

{schema_object:layers/text-layer}

## Image Layer

This layer renders a static [image](assets.md#image).

{schema_object:layers/image-layer}

## Solid Color Layer

This layer represents a rectangle with a single color.

Anything you can do with solid layers, you can do better with a shape layer
and a rectangle shape since none of this layer's own properties can be animated.

{schema_object:layers/solid-color-layer}

## Audio Layer

This layer plays a [sound](assets.md#sound).

{schema_object:layers/audio-layer}

### Audio Settings

{schema_object:layers/audio-settings}

## 3D Layers

Layers can have 3D transforms as well:

{lottie:3d_layers_animation.json:512:512:{renderer: "html"}}

3D layers need to have the `ddd` set to `1` (and so does the top-level object).

Their transform will habe `a` and `p` specified as 3D components.

Rotation will be split into 3 properties: `rx`, `ry`, `rz`, and
you have and additional orientation property `or`.


{lottie_playground:3d_layers.json:512:512:{renderer: "html"}}
Anchor:
X:<input type="range" min="0" max="512" value="0" name="ax"/>
Y:<input type="range" min="0" max="512" value="0" name="ay"/>
Z:<input type="range" min="-100" max="100" value="0" name="az"/>
Position:
X:<input type="range" min="0" max="512" value="256" name="px"/>
Y:<input type="range" min="0" max="512" value="256" name="py"/>
Z:<input type="range" min="-100" max="100" value="0" name="pz"/>
Rotation:
X:<input type="range" min="0" max="360" value="0" name="rx"/>
Y:<input type="range" min="0" max="360" value="30" name="ry"/>
Z:<input type="range" min="0" max="360" value="0" name="rz"/>
Orientation:
X:<input type="range" min="0" max="360" value="0" name="orx"/>
Y:<input type="range" min="0" max="360" value="0" name="ory"/>
Z:<input type="range" min="0" max="360" value="0" name="orz"/>
Scale:
X:<input type="range" min="0" max="300" value="100" name="sx"/>
Y:<input type="range" min="0" max="300" value="100" name="sy"/>
Z:<input type="range" min="0" max="300" value="100" name="sz"/>
<json>lottie.layers[1].ks</json>
<script>
lottie.layers[1].ks.a.k = [
    data["ax"], data["ay"], data["az"]
];
lottie.layers[1].ks.p.k = [
    data["px"], data["py"], data["pz"]
];
lottie.layers[1].ks.or.k = [
    data["orx"], data["ory"], data["orz"]
];
lottie.layers[1].ks.s.k = [
    data["sx"], data["sy"], data["sz"]
];
lottie.layers[1].ks.rx.k = data["rx"];
lottie.layers[1].ks.ry.k = data["ry"];
lottie.layers[1].ks.rz.k = data["rz"];
</script>

### Camera Layer

Camera for 3D layers.

{schema_object:layers/camera-layer}


{lottie_playground:camera.json:512:512:{renderer: "html"}}
Perspective: <input type="range" min="0" max="512" value="256" />
Position:
X:<input type="range" min="-512" max="512" value="0" name="px"/>
Y:<input type="range" min="-512" max="512" value="0" name="py"/>
Z:<input type="range" min="-512" max="512" value="-10" name="pz"/>
Rotation:
X:<input type="range" min="-180" max="180" value="0" name="rx"/>
Y:<input type="range" min="-180" max="180" value="0" name="ry"/>
Z:<input type="range" min="-180" max="180" value="0" name="rz"/>
Orientation:
X:<input type="range" min="-180" max="180" value="0" name="orx"/>
Y:<input type="range" min="-180" max="180" value="0" name="ory"/>
Z:<input type="range" min="-180" max="180" value="0" name="orz"/>
<json>lottie.layers[0]</json>
<script>
var index = 0;
lottie.layers[index].ks.p.k = [
    data["px"], data["py"], data["pz"]
];
lottie.layers[index].ks.or.k = [
    data["orx"], data["ory"], data["orz"]
];
lottie.layers[index].ks.rx.k = data["rx"];
lottie.layers[index].ks.ry.k = data["ry"];
lottie.layers[index].ks.rz.k = data["rz"];
lottie.layers[index].pe.k = data["Perspective"];
</script>

### 3D Parenting

As with 2D layers, you can parent 3D layers.

{lottie_playground:3d_parenting.json:512:512:{renderer: "html"}}
Position:
X:<input type="range" min="-512" max="512" value="0" name="px"/>
Y:<input type="range" min="-512" max="512" value="0" name="py"/>
Z:<input type="range" min="-512" max="512" value="-10" name="pz"/>
Rotation:
X:<input type="range" min="-180" max="180" value="0" name="rx"/>
Y:<input type="range" min="-180" max="180" value="0" name="ry"/>
Z:<input type="range" min="-180" max="180" value="0" name="rz"/>
Orientation:
X:<input type="range" min="-180" max="180" value="0" name="orx"/>
Y:<input type="range" min="-180" max="180" value="0" name="ory"/>
Z:<input type="range" min="-180" max="180" value="0" name="orz"/>
<json>lottie.layers[1]</json>
<script>
var index = 1;
lottie.layers[index].ks.p.k = [
    data["px"], data["py"], data["pz"]
];
lottie.layers[index].ks.or.k = [
    data["orx"], data["ory"], data["orz"]
];
lottie.layers[index].ks.rx.k = data["rx"];
lottie.layers[index].ks.ry.k = data["ry"];
lottie.layers[index].ks.rz.k = data["rz"];
</script>
