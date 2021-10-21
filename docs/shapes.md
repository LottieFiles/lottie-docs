# Shape Elements

Lottie considers everything related to vector data as a "shape" but I think
it's worth distinguishing across a few categories:

* **Shapes** These provide only the shape information, but no styling
* **Style** These provide styling info (like fill and stroke)
* **Group** This is a shape that contains other shape
* **Modifier** These change other shapes
* **Transform** Special shape that defines the transforms in a group shape

All shapes have the following properties:

{schema_object:shapes/shape-element}
EXPAND:#/$defs/helpers/visual-object
ty:Shape type (see values below)


### Shape Types

|`ty`|Shape                                     |
|----|------------------------------------------|
|`rc`|[Rectangle](#rectangle)                   |
|`el`|[Ellipse](#ellipse)                       |
|`sr`|[PolyStar](#polystar)                     |
|`sh`|[Path](#path)                             |
|`fl`|[Fill](#fill)                             |
|`st`|[Stroke](#stroke)                         |
|`gf`|[Gradient Fill](#gradient-fill-stroke)    |
|`gs`|[Gradient Stroke](#gradient-fill-stroke)  |
|`gr`|[Group](#group)                           |
|`tr`|[Transform](transform-shape)              |
|`rp`|[Repeater](#repeater)                     |
|`tm`|[Trim](#trim-path)                        |
|`rd`|[Rounded Corners](#rounded-corners)       |
|`pb`|[Pucker / Bloat](#pucker-bloat)           |
|`mm`|Merge                                     |
|`tw`|Twist                                     |
|`op`|Offset Path                               |


## Shape

These shapes only define path data, to actually show something, they must be
followed by some [style shape](#style).

They have a `d` attribute which specifies the drawing direction, which
can be seen when using [Trim Path](#trim-path).

{schema_object:shapes/shape}
SKIP:#/$defs/shapes/shape-element


### Rectangle

A rectangle, defined by its center point and size.

|Attribute|Type                                          |Description {schema_link:shapes/rectangle}|
|----|---------------------------------------------------|----------------------|
|`p` |[Animated](concepts.md#animated-property) 2D Vector|Position              |
|`s` |[Animated](concepts.md#animated-property) 2D Vector|Size                  |
|`r` |[Animated](concepts.md#animated-property) `number` |Rounded corners radius|


{lottie_playground:rectangle.json:512:512}
Position x:slider:layers[0].shapes[0].it[0].p.k[0]:0:256:512
Position y:slider:layers[0].shapes[0].it[0].p.k[1]:0:256:512
Width:slider:layers[0].shapes[0].it[0].s.k[0]:0:256:512
Height:slider:layers[0].shapes[0].it[0].s.k[1]:0:256:512
Roundness:slider:layers[0].shapes[0].it[0].r.k:0:0:512
:json:layers[0].shapes[0].it[0]

### Ellipse

|Attribute|Type                                          |Description {schema_link:shapes/ellipse}|
|----|---------------------------------------------------|----------------------|
|`p` |[Animated](concepts.md#animated-property) 2D Vector|Position              |
|`s` |[Animated](concepts.md#animated-property) 2D Vector|Size                  |


{lottie_playground:ellipse.json:512:512}
Position x:slider:layers[0].shapes[0].it[0].p.k[0]:0:256:512
Position y:slider:layers[0].shapes[0].it[0].p.k[1]:0:256:512
Width:slider:layers[0].shapes[0].it[0].s.k[0]:0:256:512
Height:slider:layers[0].shapes[0].it[0].s.k[1]:0:256:512
:json:layers[0].shapes[0].it[0]

### PolyStar

Regular polygon or star.


|Attribute|Type                                             |Description {schema_link:shapes/star}      |
|----|------------------------------------------------------|-------------------------------------------|
|`p` |[Animated](concepts.md#animated-property) 2D Vector   |Position                                   |
|`or`|[Animated](concepts.md#animated-property) `number`    |Outer Radius                               |
|`os`|[Animated](concepts.md#animated-property) `number`    |Outer Roundness                            |
|`r` |[Animated](concepts.md#animated-property) `number`    |Rotation, clockwise in degrees             |
|`pt`|[Animated](concepts.md#animated-property) `integer`   |Number of points                           |
|`sy`| `integer`                                            |Star type, `1` for Star, `2` for Polygon   |

If `sy` is `1` (star) you also have attributes defining the inner ends of the star:

|Attribute|Type                                             |Description                                |
|----|------------------------------------------------------|-------------------------------------------|
|`ir`|[Animated](concepts.md#animated-property) `number`    |Inner Radius                               |
|`is`|[Animated](concepts.md#animated-property) `number`    |Inner Roundness                            |


{lottie_playground:star.json:512:512}
Points:slider:assets[0].layers[0].shapes[0].it[0].pt.k,assets[1].layers[0].shapes[0].it[0].pt.k:3:5:10
Rotation:slider:assets[0].layers[0].shapes[0].it[0].r.k,assets[1].layers[0].shapes[0].it[0].r.k:0:0:360
Outer Radius:slider:assets[0].layers[0].shapes[0].it[0].or.k,assets[1].layers[0].shapes[0].it[0].or.k:0:200:300
Inner Radius:slider:assets[0].layers[0].shapes[0].it[0].ir.k:0:100:300
Outer Roundness:slider:assets[0].layers[0].shapes[0].it[0].os.k,assets[1].layers[0].shapes[0].it[0].os.k:0:0:200
Inner Roundness:slider:assets[0].layers[0].shapes[0].it[0].is.k:0:0:200
Type:select:layers[0].refId:Star=star:Polygon=poly


### Path

Bezier path, note that it's a continuous shape, to have multiple shapes like
when you need holes or gaps you need to create multiple Path shapes and group them together.

|Attribute|Type                                       |Description {schema_link:shapes/path}|
|----|------------------------------------------------|-----------|
|`ks`|[Animated](concepts.md#animated-property) [Bezier](concepts.md#bezier)|Bezier Path|

## Style

These apply a style (such as fill stroke) to the paths defined by the [shapes](#shapes).

Each style is applied to all preceding shapes in the same group / layer.

In most formats the style is usually defined as a property of a shape, in lottie they
are separate and allows for more flexibility.

Some examples of the added flexibility would be a shape with multiple strokes,
or a gradient fading into a solid color.

### Fill

Defines a single color fill.

|Attribute|Type                                                                                 |Description {schema_link:shapes/fill}|
|----|------------------------------------------------------------------------------------------|-------------------------------|
|`o` |[Animated](concepts.md#animated-property) `number`                                        |Opacity, 100 means fully opaque|
|`c` |[Animated](concepts.md#animated-property) [Color](concepts.md#color)                      |Color                          |
|`r` |[Fill Rule](constants.md#FillRule)                                                        |                               |


{lottie_playground:fill.json:512:512}
Red:slider:layers[0].shapes[0].it[1].c.k[0]:0:1:1:0.01
Green:slider:layers[0].shapes[0].it[1].c.k[1]:0:0.98:1:0.01
Blue:slider:layers[0].shapes[0].it[1].c.k[2]:0:0.28:1:0.01
Opacity:slider:layers[0].shapes[0].it[1].o.k:0:100:100
Fill Rule:enum:layers[0].shapes[0].it[1].r:fill-rule
:json:layers[0].shapes[0].it[1]



### Stroke

Define a stroke.


|Attribute|Type                                                     |Description {schema_link:shapes/stroke}|
|----|--------------------------------------------------------------|-------------------------------|
|`lc`|[Line Cap](constants.md#linecap)                              |                               |
|`lj`|[Line Join](constants.md#linejoin)                            |                               |
|`ml`|`number`                                                      |Miter Limit                    |
|`o` |[Animated](concepts.md#animated-property) `number`            |Opacity, 100 means fully opaque|
|`w` |[Animated](concepts.md#animated-property) `number`            |Width                          |
|`d` |Array of [Dashes](#stroke-dashes)                             |Dashed line definition         |
|`c` |[Animated](concepts.md#animated-property) [Color](#color)     |Color                          |


#### Stroke Dashes

Defined as a sequence of alternating dashes and gaps.

|Attribute|Type                                             |Description {schema_link:shapes/stroke-dash}|
|----|------------------------------------------------------|-------------------------------|
|`n` |[Dash Type](constants.md#strokedashtype)              |Dash type                      |
|`v` |[Animated](concepts.md#animated-property) `number`    |Length of the dash             |

### Gradient Fill / Stroke

Gradient fill and gradient stroke have the same attributes as [fill](#fill) and [stroke](#stroke)
but remove color (`c`) and add the following:

|Attribute|Type                                          |Description {schema_link:shapes/gradient}|
|----|---------------------------------------------------|-----------------------------------|
|`s` |[Animated](concepts.md#animated-property) 2D Vector|Starting point for the gradient    |
|`e` |[Animated](concepts.md#animated-property) 2D Vector|End point for the gradient         |
|`t` |[Gradient Type](constants.md#gradienttype)         |Type of gradient (linear or radial)|
|`g` |[Gradient Colors](#gradient-colors)                |                                   |

If it's a radial gradient, `s` refers to the center of the gradient,
and the style object may have these additional properties:

|Attribute|Type                                         |Description                                          |
|----|--------------------------------------------------|-----------------------------------------------------|
|`h` |[Animated](concepts.md#animated-property) `number`|Highlight Length, as a percentage between `s` and `e`|
|`a` |[Animated](concepts.md#animated-property) `number`|Highlight Angle                                      |

Basically the radial highlight position is defined in polar coordinates relative to `s`.

#### Gradient Colors

|Attribute|Type                                                                  |Description {schema_link:animated-properties/gradient-colors}|
|----|---------------------------------------------------------------------------|------------------|
|`l` |[Animated](concepts.md#animated-property) [Gradient](concepts.md#gradients)|Gradient Colors   |
|`p` |`integer`                                                                  |Number of Colors  |

Since [gradient values](concepts.md#gradients) might have different representation based on whether
they have transparency or not, you need to check `p` to determine whether a keyframe value
has transparency.

#### Gradient Example


{lottie_playground:gradient.json:512:512}
Start X         :slider:layers[1].shapes[0].it[1].s.k[0],layers[0].shapes[1].it[2].p.k[0]:0:256:512
Start Y         :slider:layers[1].shapes[0].it[1].s.k[1],layers[0].shapes[1].it[2].p.k[1]:0:496:512
End X           :slider:layers[1].shapes[0].it[1].e.k[0],layers[0].shapes[0].it[1].p.k[0]:0:256:512
End Y           :slider:layers[1].shapes[0].it[1].e.k[1],layers[0].shapes[0].it[1].p.k[1]:0:16:512
Type            :enum:  layers[1].shapes[0].it[1].t,layers[0].shapes[1].it[1].it[1].o.k! * 100 - 100:gradient-type
Highlight       :slider:layers[1].shapes[0].it[1].h.k,layers[0].shapes[1].it[1].it[2].a.k[1]!*3:0:0:100
Highlight Angle :slider:layers[1].shapes[0].it[1].a.k,layers[0].shapes[1].it[1].it[2].r.k:0:0:360
                :json:  layers[1].shapes[0].it[1]:

## Group

A group is a shape that can contain other shapes (including other groups).

The usual contents of a group are:

* [Shapes](#shapes)
* [Style](#style)
* [Transform](#transform)

For example, if you want to have a red rectangle with a black outline, its group will contain

0. A [Rectangle](#rectangle) defining the actual shape of the rectangle
1. A [Fill](#fill) for the color red
2. A [Stroke](#stroke) for the black outline
3. A [Transform](#transform) for the group transform

While the contents may vary, a group must always end with a [Transform shape](#transform).

The attributes of a Group are:

|Attribute|Type                                                             |Description {schema_link:shapes/group}|
|----|----------------------------------------------------------------------|-----------------------|
|`np`|`number`                                                              |Number of properties   |
|`it`|[Array](concepts.md#lists-of-layers-and-shapes) of [shapes](#shape)   |Shapes                 |

### Transform Shape

Basically the same as [Transform](concepts.md#transform) but with the `ty` attribute.

## Modifiers

Modifiers process their siblings and alter the path defined by [shapes](#shapes).

### Repeater

This is a bit different compared from other modifiers, since it will take into
account style as well.

The effect of a Repeater is to duplicate the other shapes a number of times applying a transform for each copy.

|Attribute|Type                                             |Description {schema_link:shapes/repeater}|
|----|------------------------------------------------------|-------------------------------|
|`c` |[Animated](concepts.md#animated-property) `integer`   |Number of copies               |
|`o` |[Animated](concepts.md#animated-property) `number`    |Offset (see below)             |
|`m` |`integer`                                             |[Composite](constants.md#Composite) (How to stack copies)|
|`tr`|[Repeater Transform](#repeater-transform)             |Transform applied to each copy |


The transform is multiplied by `o + 1` (where `o` is the Offset property above).<br/>
So if `o` is `0`, the first instance shown by the Repeater is at its starting location.<br/>
If it's `1`, the first instance has the matrix applied to it.
Other values multiply the initial transform accordingly.

#### Repeater Transform

Same as a regular [Transform](concepts.md#transform) but instead of a single opacity value (`o`),
it has two:

|Attribute|Type                                         |Description            |
|----|--------------------------------------------------|-----------------------|
|`so`|[Animated](concepts.md#animated-property) `number`|Start Opacity          |
|`eo`|[Animated](concepts.md#animated-property) `number`|End Opacity            |

The first copy will use `so`, the last `eo`, and copies between them will have an interpolated value.

{lottie_playground:repeater.json:512:512}
Copies:slider:layers[0].shapes[0].it[3].c.k:0:4:20
Start Opacity:slider:layers[0].shapes[0].it[3].tr.so.k:0:100:100
End Opacity:slider:layers[0].shapes[0].it[3].tr.eo.k:0:50:100
Position x:slider:layers[0].shapes[0].it[3].tr.p.k[0]:0:130:200
Position y:slider:layers[0].shapes[0].it[3].tr.p.k[1]:0:0:200
Rotation:slider:layers[0].shapes[0].it[3].tr.r.k:0:137:360
Offset:slider:layers[0].shapes[0].it[3].o.k:-1:0:2:0.1
Conposite:enum:layers[0].shapes[0].it[3].m:composite
:json:layers[0].shapes[0].it[3]


### Trim Path

This is mostly useful for shapes with a stroke and not a fill.

It takes the path defined by [shapes](#shapes) and only shows a segment of the resulting bezier data.

|Attribute|Type                                         |Description {schema_link:shapes/trim}|
|----|--------------------------------------------------|-----------------------|
|`s` |[Animated](concepts.md#animated-property) `number`|Segment start          |
|`e` |[Animated](concepts.md#animated-property) `number`|Segment end            |
|`o` |[Animated](concepts.md#animated-property) `number`|Offset                 |
|`m` |`integer`                                         |[How to treat multiple shapes](constants.md#TrimMultipleShapes)


`s` and `e` go from `0` to `100`, `0` being at the beginning of the path and `100` at the end.
The displayed segment is what lays between the two.

`o` is an offset from the start, to allow values to wrap around.
Its value goes from `0` (start of the path) to `360` (end of the path).
It looks like an angle but it isn't really, the difference between `o` and `s` is
that with `o` you can go over `360` or below `0` to shift the whole segment along the path.


Here is an interactive example:


{lottie_playground:trim_path.json:512:512}
Start:slider:layers[0].shapes[4].s.k:0:0:100
End:slider:layers[0].shapes[4].e.k:0:50:100
Offset:slider:layers[0].shapes[4].o.k:0:0:360
Multiple Shapes:enum:layers[0].shapes[4].m:trim-multiple-shapes
:json:layers[0].shapes[4]



### Rounded Corners

Self explanatory

|Attribute|Type                                         |Description {schema_link:shapes/rounded-corners}|
|----|--------------------------------------------------|-----------------------|
|`r` |[Animated](concepts.md#animated-property) `number`|Radius                 |

{lottie_playground:rounded_corners.json:512:512}
Radius:slider:layers[0].shapes[0].it[1].r.k:0:50:100
:json:layers[0].shapes[0].it[1]

### Pucker / Bloat

|Attribute|Type                                         |Description {schema_link:shapes/pucker-bloat}|
|----|--------------------------------------------------|-----------------------|
|`a` |[Animated](concepts.md#animated-property) `number`|Amount as a percentage |

Interpolates bezier vertices towards the center of the shape, and tangent handles away from it (or vice-versa).

When `a` is `0`, nothing changes.<br/>
When `a` is positive, the vertices are pulled towards the center, with `100` being at the center. And the tangents are pushed away.<br/>
When `a` is negative the vertices are pushed away from the center with `100` being twice far away from the center. And the tangents are pulled towards the center.<br/>


{lottie_playground:pucker_bloat.json:512:512}
Amount:slider:layers[0].shapes[0].it[1].a.k:-100:50:100
:json:layers[0].shapes[0].it[1]
