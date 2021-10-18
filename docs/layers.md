
## Layer

There are several layer types, which is specified by the `ty` attribute:

|`ty`| Layer Type                       | Description                                                                                   |
|----|----------------------------------|-----------------------------------------------------------------------------------------------|
|`0` |[Precomposition](#precomp-layer)  |Renders a [Precomposition](assets.md#precomposition)                                           |
|`1` |[Solid Color](#solid-color-layer) |Static rectangle filling the canvas with a single color                                        |
|`2` |[Image](#image-layer)             |Renders an [Image](assets.md#image)                                                            |
|`3` |[Null (Empty)](#null-layer)       |No contents, only used for [parenting](#parenting)                                             |
|`4` |[Shape](#shape-layer)             |Has an [array](concepts.md#lists-of-layers-and-shapes) of [shapes](shapes.md#shape-element)    |
|`5` |[Text](#text-layer)               |Renders text                                                                                   |
|`6` |Audio                             |                                                                                               |
|`7` |Video Placeholder                 |                                                                                               |
|`8` |Image Sequence                    |                                                                                               |
|`9` |Video                             |                                                                                               |
|`10`|Image Placeholder                 |                                                                                               |
|`11`|Guide                             |                                                                                               |
|`12`|Adjustment                        |                                                                                               |
|`13`|Camera                            |                                                                                               |
|`14`|Light                             |                                                                                               |

Each layer type has its own properties but there are several common properties:

They also have attributes from [Visual Object](#visual-object).

|Attribute|Type|Name|Description|
|---------|----|----|-----------|
|`ddd`              |[0-1 `int`](concepts.md#booleans)  |Threedimensional   |Whether the layer is 3D. Lottie doesn't actually support 3D stuff so this should always be 0||
|`hd`               |`boolean`                          |Hidden             |Whether the layer is hidden|
|`ty`               |`integer`                          |Type               |One of the values as seen before|
|`ind`              |`integer`                          |Index              |Layer index for [parenting](#parenting)|
|`parent`           |`integer`                          |Parent             |Parent index for [parenting](#parenting)|
|`sr`               |`number`                           |Time stretch       | |
|`ks`               |[Transform](concepts.md#transform) |Transform          |Layer transform|
|`ao`               |[0-1 `int`](concepts.md#booleans)  |Auto Orient        |[Auto orient](#auto-orient)|
|`ip`               |`number`                           |In Point           |Frame when the layers becomes visible|
|`op`               |`number`                           |Out Point          |Frame when the layers becomes invisible|
|`st`               |`number`                           |Start time         ||
|`bm`               |`integer`                          |[Blend Mode](constants.md#BlendMode)||
|`tt`               |`integer`                          |[Matte Mode](constants.md#MatteMode)|See [mattes](#mattes)|
|`td`               |`integer`                          |Matte Target       |See [mattes](#mattes)|
|`hasMask`          |`boolean`                          |Has Mask           |Whether the layer has masks applied|
|`masksProperties`  |`array`                            |Masks              |[Masks](#masks) for the layer|
|`ef`               |`array`                            |Effects            |[Effects](#effects) for the layer|

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
appropriate [value](constants.md#MatteMode)
and it affects the layer on top (the layer before it in the layer list).

In this example there's a layer with a rectangle and a star being masked by an ellipse:
{lottie:matte.json:512:512}


## Shape Layer

Renders vector data.

The only special property for this layer is **shapes**, an [array](concepts.md#lists-of-layers-and-shapes) of [shapes](shapes.md#shape-element).

## PreComp Layer

This layer renders a [precomposition](assets.md#precomposition).

|Attribute  |Type                                            |Description                                    |
|-----------|------------------------------------------------|-----------------------------------------------|
|`refId`    |`string`                                        |ID of the precomp as specified in the assets   |
|`w`        |`number`                                        |Width                                          |
|`h`        |`number`                                        |Height                                         |
|`tm`       |[Animated](concepts.md#animated-property) `number`|Time Remapping                                 |

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

It's often used by animators as a parent to multiple other layers.

## Text Layer

TODO

## Image Layer

This layer renders a static [image](assets.md#image).


|Attribute|Type|Name|Description|
|-----------|----|----|-----------|
|`refId`    |`string` |Reference ID|ID of the image as specified in the assets|

## Solid Color Layer

This layer represents a rectangle with a single color.

Anything you can do with solid layers, you can do better with a shape layer
and a rectangle shape since none of this layer's own properties can be animated.

|Attribute  |Type     |Name        |Description |
|-----------|---------|------------|------------|
|`sc`       |`string` |Solid Color |Color of the layer, unlike most other places, the color is a `#rrggbb` hex string |
|`sw`       |`number` |Solid Width |            |
|`sh`       |`number` |Solid Height|            |


## Masks

TODO

## Effects

TODO
