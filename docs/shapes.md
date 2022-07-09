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
|`gf`|[Gradient Fill](#gradients)               |
|`gs`|[Gradient Stroke](#gradients)             |
|`no`|[No Style](#no-style)                     |
|`gr`|[Group](#group)                           |
|`tr`|[Transform](transform-shape)              |
|`rp`|[Repeater](#repeater)                     |
|`tm`|[Trim](#trim-path)                        |
|`rd`|[Rounded Corners](#rounded-corners)       |
|`pb`|[Pucker / Bloat](#pucker-bloat)           |
|`mm`|[Merge](#merge)                           |
|`tw`|[Twist](#twist)                           |
|`op`|[Offset Path](#offset-path)               |
|`zz`|[Zig Zag](#zig-zag)                       |


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
Position x:<input type="range" min="0" max="512" value="256"/>
Position y:<input type="range" min="0" max="512" value="256"/>
Width:<input type="range" min="0" max="512" value="256"/>
Height:<input type="range" min="0" max="512" value="256"/>
Roundness:<input type="range" min="0" max="512" value="0"/>
<json>lottie.layers[0].shapes[0].it[0]</json>
<script>
lottie.layers[0].shapes[0].it[0].p.k = [
    data["Position x"], data["Position y"]
];
lottie.layers[0].shapes[0].it[0].s.k = [
    data["Width"], data["Height"]
];
lottie.layers[0].shapes[0].it[0].r.k = data["Roundness"];
</script>

### Ellipse

|Attribute|Type                                          |Description {schema_link:shapes/ellipse}|
|----|---------------------------------------------------|----------------------|
|`p` |[Animated](concepts.md#animated-property) 2D Vector|Position              |
|`s` |[Animated](concepts.md#animated-property) 2D Vector|Size                  |


{lottie_playground:ellipse.json:512:512}
Position x:<input type="range" min="0" max="512" value="256"/>
Position y:<input type="range" min="0" max="512" value="256"/>
Width:<input type="range" min="0" max="512" value="256"/>
Height:<input type="range" min="0" max="512" value="256"/>
<json>lottie.layers[0].shapes[0].it[0]</json>
<script>
lottie.layers[0].shapes[0].it[0].p.k = [
    data["Position x"], data["Position y"]
];
lottie.layers[0].shapes[0].it[0].s.k = [
    data["Width"], data["Height"]
];
</script>

### PolyStar

Regular polygon or star.

{schema_object:shapes/polystar}
SKIP:#/$defs/shapes/shape
SKIP:ir
SKIP:is

If `sy` is `1` (star) you also have attributes defining the inner ends of the star:

|Attribute|Type                                             |Description                                |
|----|------------------------------------------------------|-------------------------------------------|
|`ir`|[Animated](concepts.md#animated-property) `number`    |Inner Radius                               |
|`is`|[Animated](concepts.md#animated-property) `number`    |Inner Roundness as a percentage            |


{lottie_playground:star.json:512:512}
Points:<input type="range" min="3" max="10" value="5"/>
Rotation:<input type="range" min="0" max="360" value="0"/>
Outer Radius:<input type="range" min="0" max="300" value="200"/>
Inner Radius:<input type="range" min="0" max="300" value="100"/>
Outer Roundness:<input type="range" min="0" max="100" value="0"/>
Inner Roundness:<input type="range" min="0" max="100" value="0"/>
Type:<select><option value="1">Star</option><option value="2">Polygon</option></select>
<json>lottie.layers[0].shapes[0].it[0]</json>
<script>
var star = {
    "ty": "sr",
    "nm": "PolyStar",
    "sy": Number(data["Type"]),
    "p": {
        "a": 0,
        "k": [
            249.3134328358209,
            254.47164179104476
        ]
    },
    "r": {
        "a": 0,
        "k": data["Rotation"]
    },
    "pt": {
        "a": 0,
        "k": data["Points"]
    },
    "or": {
        "a": 0,
        "k": data["Outer Radius"]
    },
    "os": {
        "a": 0,
        "k": data["Outer Roundness"]
    },
};
if ( data["Type"] == "1" )
{
    star = {
        ...star,
        "ir": {
            "a": 0,
            "k": data["Inner Radius"]
        },
        "is": {
            "a": 0,
            "k": data["Inner Roundness"]
        },
    };
}
lottie.layers[0].shapes[0].it[0] = star;
</script>


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
Red:<input type="range" min="0" max="1" step="0.01" value="1"/>
Green:<input type="range" min="0" max="1" step="0.01" value="0.98"/>
Blue:<input type="range" min="0" max="1" step="0.01" value="0.28"/>
Opacity:<input type="range" min="0" max="100" value="100"/>
Fill Rule:<enum>fill-rule</enum>
<json>lottie.layers[0].shapes[0].it[1]</json>
<script>
var shape = lottie.layers[0].shapes[0].it[1];
shape.c.k = [data["Red"], data["Green"], data["Blue"]];
shape.o.k = data["Opacity"];
shape.r = Number(data["Fill Rule"]);
</script>


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



{lottie_playground:stroke.json:512:512}
Red:<input type="range" min="0" max="1" step="0.01" value="1"/>
Green:<input type="range" min="0" max="1" step="0.01" value="0.98"/>
Blue:<input type="range" min="0" max="1" step="0.01" value="0.28"/>
Width:<input type="range" min="0" max="100" value="32"/>
Opacity:<input type="range" min="0" max="100" value="100"/>
Line Cap:<enum value="2">line-cap</enum>
Line Join:<enum value="2">line-join</enum>
Miter Limit:<input type="range" min="0" max="10" value="3"/>
Dash Offset:<input type="range" min="0" max="512" value="0"/>
Dash Length:<input type="range" min="0" max="512" value="100"/>
Dash Gap:<input type="range" min="0" max="512" value="0"/>
<json>lottie.layers[0].shapes[2]</json>
<script>
var shape = lottie.layers[0].shapes[2];
shape.c.k = [data["Red"], data["Green"], data["Blue"]];
shape.o.k = data["Opacity"];
shape.w.k = data["Width"];
shape.r = Number(data["Fill Rule"]);
shape.lc = Number(data["Line Cap"]);
shape.lj = Number(data["Line Join"]);
shape.ml = data["Miter Limit"];
shape.d[0].v.k = data["Dash Offset"];
shape.d[1].v.k = data["Dash Length"];
shape.d[2].v.k = data["Dash Gap"];
</script>


### Gradients

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

|Attribute|Type                                         |Description                                                |
|----|--------------------------------------------------|-----------------------------------------------------------|
|`h` |[Animated](concepts.md#animated-property) `number`|Highlight Length, as a percentage between `s` and `e`      |
|`a` |[Animated](concepts.md#animated-property) `number`|Highlight Angle, relative to the direction from `s` to `e` |

Basically the radial highlight position is defined in polar coordinates relative to `s`.

#### Gradient Colors

|Attribute|Type                                                                  |Description {schema_link:animated-properties/gradient-colors}|
|----|---------------------------------------------------------------------------|------------------|
|`k` |[Animated](concepts.md#animated-property) [Gradient](concepts.md#gradients)|Gradient Colors   |
|`p` |`integer`                                                                  |Number of Colors  |

Since [gradient values](concepts.md#gradients) might have different representation based on whether
they have transparency or not, you need to check `p` to determine whether a keyframe value
has transparency.

#### Gradient Example


{lottie_playground:gradient.json:512:512}
Start X:<input type="range" min="0" value="256" max="512"/>
Start Y:<input type="range" min="0" value="496" max="512"/>
End X:<input type="range" min="0" value="256" max="512"/>
End Y:<input type="range" min="0" value="16" max="512"/>
Type:<enum>gradient-type</enum>
Highlight:<input type="range" min="0" max="100" value="0"/>
Highlight Angle:<input type="range" min="0" max="360" value="0"/>
<json>lottie.layers[1].shapes[0].it[1]</json>
<script>
var gradient = lottie.layers[1].shapes[0].it[1];
var start_marker = lottie.layers[0].shapes[1].it[1];
var end_marker = lottie.layers[0].shapes[0].it[1];
gradient.s.k = start_marker.p.k = [data["Start X"], data["Start Y"]];
gradient.e.k = end_marker.p.k = [data["End X"], data["End Y"]];
gradient.t = Number(data["Type"]);
gradient.h.k = data["Highlight"];
gradient.a.k = data["Highlight Angle"];
</script>


### No Style

Represents a style for shapes without fill or stroke.


{schema_object:shapes/no-style}
SKIP:#/$defs/shapes/shape-element


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
Copies:<input type="range" min="0" value="4" max="20"/>
Start Opacity:<input type="range" min="0" value="100" max="100"/>
End Opacity:<input type="range" min="0" value="50" max="100"/>
Position x:<input type="range" min="0" value="130" max="200"/>
Position y:<input type="range" min="0" value="0" max="200"/>
Rotation:<input type="range" min="0" value="137" max="360"/>
Offset:<input type="range" min="-1" value="0" max="2" step="0.1"/>
Composite:<enum>composite</enum>
<json>lottie.layers[0].shapes[0].it[3]</json>
<script>
lottie.layers[0].shapes[0].it[3].c.k = data["Copies"];
lottie.layers[0].shapes[0].it[3].tr.so.k = data["Start Opacity"];
lottie.layers[0].shapes[0].it[3].tr.eo.k = data["End Opacity"];
lottie.layers[0].shapes[0].it[3].tr.p.k[0] = data["Position x"];
lottie.layers[0].shapes[0].it[3].tr.p.k[1] = data["Position y"];
lottie.layers[0].shapes[0].it[3].tr.r.k = data["Rotation"];
lottie.layers[0].shapes[0].it[3].o.k = data["Offset"];
lottie.layers[0].shapes[0].it[3].m = Number(data["Composite"]);
</script>


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
Start:<input type="range" min="0" value="0" max="100"/>
End:<input type="range" min="0" value="50" max="100"/>
Offset:<input type="range" min="0" value="0" max="360"/>
Multiple Shapes:<enum>trim-multiple-shapes</enum>
<json>lottie.layers[0].shapes[4]</json>
<script>
lottie.layers[0].shapes[4].s.k = data["Start"];
lottie.layers[0].shapes[4].e.k = data["End"];
lottie.layers[0].shapes[4].o.k = data["Offset"];
lottie.layers[0].shapes[4].m = Number(data["Multiple Shapes"]);
</script>


### Rounded Corners

Self explanatory

{schema_object:shapes/rounded-corners}
SKIP:#/$defs/shapes/shape

{lottie_playground:rounded_corners.json:512:512}
Radius:<input type="range" min="0" value="50" max="100"/>
<json>lottie.layers[0].shapes[0].it[1]</json>
<script>
lottie.layers[0].shapes[0].it[1].r.k = data["Radius"];
</script>


### Pucker / Bloat

{schema_object:shapes/pucker-bloat}
SKIP:#/$defs/shapes/shape

Interpolates bezier vertices towards the center of the shape, and tangent handles away from it (or vice-versa).

When `a` is `0`, nothing changes.<br/>
When `a` is positive, the vertices are pulled towards the center, with `100` being at the center. And the tangents are pushed away.<br/>
When `a` is negative the vertices are pushed away from the center with `100` being twice far away from the center. And the tangents are pulled towards the center.<br/>


{lottie_playground:pucker_bloat.json:512:512}
Amount:<input type="range" min="-100" value="50" max="100"/>
<json>lottie.layers[0].shapes[0].it[1]</json>
<script>
lottie.layers[0].shapes[0].it[1].a.k = data["Amount"];
</script>


### Twist

{schema_object:shapes/twist}
SKIP:#/$defs/shapes/twist

### Merge

{schema_object:shapes/merge}
SKIP:#/$defs/shapes/merge


### Offset Path

{schema_object:shapes/offset-path}
SKIP:#/$defs/shapes/offset-path


### Zig Zag

{schema_attribute:description:shapes/zig-zag}

{schema_object:shapes/zig-zag}
SKIP:#/$defs/shapes/shape
