# Shape Elements

Lottie considers everything related to vector data as a "shape" but I think
it's worth distinguishing across a few categories:

* **Shapes** These provide only the shape information, but no styling
* **Style** These provide styling info (like fill and stroke)
* **Group** This is a shape that contains other shape
* **Modifier** These change other shapes
* **Transform** Special shape that defines the transforms in a group shape


<h2 id="graphic-element">Graphic Element</h2>

{schema_string:shapes/graphic-element/description}

{schema_object:shapes/graphic-element}

The `ty` property defines the specific element type based on the following values:

{schema_subtype_table:shapes/all-graphic-elements:ty}


<h2 id="shape">Shapes</h2>

These shapes only define path data, to actually show something, they must be
followed by some [style shape](#shape-style).

They have a `d` attribute which specifies the drawing direction, which
can be seen when using [Trim Path](#trim-path).

{schema_object:shapes/shape}


<h3 id="ellipse">Ellipse</h3>

{schema_string:shapes/ellipse/description}

{schema_object:shapes/ellipse}

<lottie-playground example="ellipse.json">
    <title>Example</title>
    <form>
        <input title="Position x" type="range" min="0" max="512" value="256"/>
        <input title="Position y" type="range" min="0" max="512" value="256"/>
        <input title="Width" type="range" min="0" max="512" value="256"/>
        <input title="Height" type="range" min="0" max="512" value="256"/>
    </form>
    <json>lottie.layers[0].shapes[0].it[0]</json>
    <script>
    lottie.layers[0].shapes[0].it[0].p.k = [
        data["Position x"], data["Position y"]
    ];
    lottie.layers[0].shapes[0].it[0].s.k = [
        data["Width"], data["Height"]
    ];
    </script>
</lottie-playground>


<h3 id="rectangle">Rectangle</h3>

{schema_string:shapes/rectangle/description}

{schema_object:shapes/rectangle}

<lottie-playground example="rectangle.json">
    <title>Example</title>
    <form>
        <input title="Position x" type="range" min="0" max="512" value="256"/>
        <input title="Position y" type="range" min="0" max="512" value="256"/>
        <input title="Width" type="range" min="0" max="512" value="256"/>
        <input title="Height" type="range" min="0" max="512" value="256"/>
        <input title="Roundness" type="range" min="0" max="512" value="0"/>
    </form>
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
</lottie-playground>



### PolyStar


<h3 id="polystar">PolyStar</h3>

{schema_string:shapes/polystar/description}

{schema_object:shapes/polystar}

<lottie-playground example="star.json">
    <title>Example</title>
    <form>
        <input title="Position x" type="range" min="0" max="512" value="256"/>
        <input title="Position y" type="range" min="0" max="512" value="256"/>
        <input title="Points" type="range" min="3" max="10" value="5"/>
        <input title="Rotation" type="range" min="0" max="360" value="0"/>
        <input title="Outer Radius" type="range" min="0" max="300" value="200"/>
        <input title="Inner Radius" type="range" min="0" max="300" value="100"/>
        <input title="Outer Roundness" type="range" min="0" max="100" value="0"/>
        <input title="Inner Roundness" type="range" min="0" max="100" value="0"/>
        <enum title="Star Type">star-type</enum>
    </form>
    <json>lottie.layers[0].shapes[0].it[0]</json>
    <script>
        var star = {
            "ty": "sr",
            "nm": "PolyStar",
            "sy": Number(data["Star Type"]),
            "p": {
                "a": 0,
                "k": [data["Position x"], data["Position y"]]
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
        if ( data["Star Type"] == "1" )
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
</lottie-playground>

<h3 id="path">Path</h3>

{schema_string:shapes/path/description}

{schema_object:shapes/path}

<lottie-playground example="bezier.json">
    <title>Example</title>
    <form>
        <input title="Shape" type="bezier"/>
    </form>
    <json>lottie.layers[0].shapes[0].it[0]</json>
    <script>
        var shape = lottie.layers[0].shapes[0].it[0];
        if ( data["Shape"] )
            shape.ks.k = data["Shape"];
    </script>
</lottie-playground>


<h2 id="shape-style">Style</h2>


These apply a style (such as fill stroke) to the paths defined by the [shapes](#shape).

Each style is applied to all preceding shapes in the same group / layer.

In most formats the style is usually defined as a property of a shape, in lottie they
are separate and allows for more flexibility.

Some examples of the added flexibility would be a shape with multiple strokes,
or a gradient fading into a solid color.

{schema_object:shapes/shape-style}


<h3 id="fill">Fill</h3>

{schema_string:shapes/fill/description}

{schema_object:shapes/fill}

<lottie-playground example="fill.json">
    <title>Example</title>
    <form>
        <input title="Red" type="range" min="0" max="1" step="0.01" value="1"/>
        <input title="Green" type="range" min="0" max="1" step="0.01" value="0.98"/>
        <input title="Blue" type="range" min="0" max="1" step="0.01" value="0.28"/>
        <input title="Opacity" type="range" min="0" max="100" value="100"/>
        <enum title="Fill Rule">fill-rule</enum>
    </form>
    <json>lottie.layers[0].shapes[0].it[1]</json>
    <script>
        var shape = lottie.layers[0].shapes[0].it[1];
        shape.c.k = [data["Red"], data["Green"], data["Blue"]];
        shape.o.k = data["Opacity"];
        shape.r = Number(data["Fill Rule"]);
    </script>
</lottie-playground>


<h3 id="stroke"><span id="base-stroke">Stroke</span></h3>

{schema_string:shapes/stroke/description}

{schema_object:shapes/stroke}

<lottie-playground example="stroke.json">
    <title>Example</title>
    <form>
        <input title="Red" type="range" min="0" max="1" step="0.01" value="1"/>
        <input title="Green" type="range" min="0" max="1" step="0.01" value="0.98"/>
        <input title="Blue" type="range" min="0" max="1" step="0.01" value="0.28"/>
        <input type="range" min="0" max="100" value="32" title="Width"/>
        <input title="Opacity" type="range" min="0" max="100" value="100"/>
        <enum title="Line Cap" value="2">line-cap</enum>
        <enum title="Line Join" value="2">line-join</enum>
        <input type="range" min="0" max="10" value="3" title="Miter Limit"/>
    </form>
    <json>lottie.layers[0].shapes[2]</json>
    <script>
        var shape = lottie.layers[0].shapes[2];
        shape.c.k = [data["Red"], data["Green"], data["Blue"]];
        shape.o.k = data["Opacity"];
        shape.w.k = data["Width"];
        shape.lc = Number(data["Line Cap"]);
        shape.lj = Number(data["Line Join"]);
        shape.ml = data["Miter Limit"];
        shape.d = undefined;
    </script>
</lottie-playground>


<h4 id="stroke-dash">Stroke Dashes</h4>

{schema_string:shapes/stroke-dash/description}

A stroke dash array consists of `n` dash entries, `[n-1,n]` gap entries and `[0-1]` offset entries.

Dash and gap entries MUST all be in a continuous order and alternate between dash and gap, starting with dash. If there are an odd number of dashes + gaps, the sequence will repeat with dashes and gaps reversed. For example a sequence of `[4d, 8g, 16d]` MUST be rendered as `[4d, 8g, 16d, 4g, 8d, 16g]`.

Offset entry, if present, MUST be at the end of the array.

{schema_object:shapes/stroke-dash}

<lottie-playground example="stroke.json">
    <title>Example</title>
    <form>
        <input title="Red" type="range" min="0" max="1" step="0.01" value="1"/>
        <input title="Green" type="range" min="0" max="1" step="0.01" value="0.98"/>
        <input title="Blue" type="range" min="0" max="1" step="0.01" value="0.28"/>
        <input type="range" min="0" max="100" value="32" title="Width"/>
        <input title="Opacity" type="range" min="0" max="100" value="100"/>
        <enum title="Line Cap" value="2">line-cap</enum>
        <enum title="Line Join" value="2">line-join</enum>
        <input type="range" min="0" max="10" value="3" title="Miter Limit"/>
        <input type="range" min="0" max="512" value="0" title="Dash Offset"/>
        <input type="range" min="0" max="512" value="30" title="Dash Length"/>
        <input type="range" min="0" max="512" value="50" title="Dash Gap"/>
    </form>
    <json>lottie.layers[0].shapes[2]</json>
    <script>
        var shape = lottie.layers[0].shapes[2];
        shape.c.k = [data["Red"], data["Green"], data["Blue"]];
        shape.o.k = data["Opacity"];
        shape.w.k = data["Width"];
        shape.lc = Number(data["Line Cap"]);
        shape.lj = Number(data["Line Join"]);
        shape.ml = data["Miter Limit"];
        shape.d[0].v.k = data["Dash Offset"];
        shape.d[1].v.k = data["Dash Length"];
        shape.d[2].v.k = data["Dash Gap"];
        var trim = lottie.layers[0].shapes[1];
        trim.e.k = 100;
        trim.o.k = 0;
    </script>
</lottie-playground>

<h3 id="base-gradient">Base Gradient</h3>

{schema_string:shapes/base-gradient/description}

{schema_object:shapes/base-gradient}

<h3 id="gradient-fill">Gradient Fill</h3>

{schema_string:shapes/gradient-fill/description}

{schema_object:shapes/gradient-fill}

<lottie-playground example="gradient.json">
    <title>Example</title>
    <form>
        <input title="Start X" type="range" min="0" max="512"  value="256"/>
        <input title="Start Y" type="range" min="0" max="512"  value="496"/>
        <input title="End X" type="range" min="0" max="512"  value="256"/>
        <input title="End Y" type="range" min="0" max="512"  value="16"/>
        <enum title="Type" value="1">gradient-type</enum>
        <input title="Highlight" type="range" min="0" max="100"  value="0"/>
        <input title="Highlight Angle" type="range" min="0" max="360"  value="0"/>
    </form>
    <json>lottie.layers[1].shapes[0].it[1]</json>
    <script>
    var gradient = lottie.layers[1].shapes[0].it[1];
    var start_marker = lottie.layers[0].shapes[1].it[1];
    var end_marker = lottie.layers[0].shapes[0].it[1];
    gradient.s.k = start_marker.p.k = [data["Start X"], data["Start Y"]];
    gradient.e.k = end_marker.p.k = [data["End X"], data["End Y"]];
    gradient.t = Number(data["Type"]);
    if (gradient.t === 2) {
        gradient.h = {
            a: 0,
            k: data["Highlight"]
        };
        gradient.a = {
            a: 0,
            k: data["Highlight Angle"]
        };
    } else {
        delete gradient.h;
        delete gradient.a;
    }
    </script>
</lottie-playground>

<h3 id="gradient-stroke"><span id="gradient-stroke">Gradient Stroke</span></h3>

{schema_string:shapes/gradient-stroke/description}

{schema_object:shapes/gradient-stroke}

<lottie-playground example="gradient-stroke.json">
    <title>Example</title>
    <form>
        <input title="Start X" type="range" min="0" max="512"  value="256"/>
        <input title="Start Y" type="range" min="0" max="512"  value="496"/>
        <input title="End X" type="range" min="0" max="512"  value="256"/>
        <input title="End Y" type="range" min="0" max="512"  value="16"/>
        <enum title="Type" value="1">gradient-type</enum>
        <input title="Highlight" type="range" min="0" max="100"  value="0"/>
        <input title="Highlight Angle" type="range" min="0" max="360"  value="0"/>
    </form>
    <json>lottie.layers[1].shapes[1]</json>
    <script>
    var gradient = lottie.layers[1].shapes[1];
    var start_marker = lottie.layers[0].shapes[1].it[1];
    var end_marker = lottie.layers[0].shapes[0].it[1];
    gradient.s.k = start_marker.p.k = [data["Start X"], data["Start Y"]];
    gradient.e.k = end_marker.p.k = [data["End X"], data["End Y"]];
    gradient.t = Number(data["Type"]);
    if (gradient.t === 2) {
        gradient.h = {
            a: 0,
            k: data["Highlight"]
        };
        gradient.a = {
            a: 0,
            k: data["Highlight Angle"]
        };
    } else {
        delete gradient.h;
        delete gradient.a;
    }
    </script>
</lottie-playground>

<h3 id="no-style">No Style</h3>

Represents a style for shapes without fill or stroke.

{schema_object:shapes/no-style}


<h2 id="grouping">Grouping</h2>

<h3 id="group">Group</h3>

A group is a shape that can contain other shapes (including other groups).

The usual contents of a group are:

* [Shapes](#shape)
* [Style](#shape-style)
* [Transform](#transform)

For example, if you want to have a red rectangle with a black outline, its group will contain

0. A [Rectangle](#rectangle) defining the actual shape of the rectangle
1. A [Fill](#fill) for the color red
2. A [Stroke](#stroke) for the black outline
3. A [Transform](#transform) for the group transform

While the contents may vary, a group must always end with a [Transform shape](#transform).

The attributes of a Group are:

{schema_object:shapes/group}

<h3 id="transform">Transform</h3>

Basically the same as {link:helpers/transform} but with the `ty` attribute.

{schema_object:shapes/transform}

Transform shapes MUST always be present in the group and they MUST be
the last item in the `it` array.


<h2 id="modifier">Modifiers</h2>

Modifiers process their siblings and alter the path defined by [shapes](#shape).

<h3 id="repeater">Repeater</h3>

This is a bit different compared from other modifiers, since it will take into
account style as well.

The effect of a Repeater is to duplicate the other shapes a number of times applying a transform for each copy.

{schema_object:shapes/repeater}

The transform is multiplied by `o + 1` (where `o` is the Offset property above).<br/>
So if `o` is `0`, the first instance shown by the Repeater is at its starting location.<br/>
If it's `1`, the first instance has the matrix applied to it.
Other values multiply the initial transform accordingly.

#### Repeater Transform

Same as a regular {link:helpers/transform} but instead of a single opacity value (`o`),
it has two:

{schema_object:shapes/repeater-transform}

|Attribute|Type                                         |Description            |
|----|--------------------------------------------------|-----------------------|
|`so`|[Animated](properties.md#scalar-property) `number`|Start Opacity          |
|`eo`|[Animated](properties.md#scalar-property) `number`|End Opacity            |

The first copy will use `so`, the last `eo`, and copies between them will have an interpolated value.

<lottie-playground example="repeater.json">
    <form>
        <input title="Copies" type="range" min="0" value="4" max="20"/>
        <input title="Start Opacity" type="range" min="0" value="100" max="100"/>
        <input title="End Opacity" type="range" min="0" value="50" max="100"/>
        <input title="Position x" type="range" min="0" value="130" max="200"/>
        <input title="Position y" type="range" min="0" value="0" max="200"/>
        <input title="Rotation" type="range" min="0" value="137" max="360"/>
        <input title="Offset" type="range" min="-1" value="0" max="2" step="0.1"/>
        <enum title="Composite">composite</enum>
    </form>
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
</lottie-playground>

<h3 id="trim-path">Trim Path</h3>

This is mostly useful for shapes with a stroke and not a fill.

It takes the path defined by [shapes](#shape) and only shows a segment of the resulting bezier data.


{schema_object:shapes/trim-path}


`s` and `e` go from `0` to `100`, `0` being at the beginning of the path and `100` at the end.
The displayed segment is what lays between the two.

`o` is an offset from the start, to allow values to wrap around.
Its value goes from `0` (start of the path) to `360` (end of the path).
It looks like an angle but it isn't really, the difference between `o` and `s` is
that with `o` you can go over `360` or below `0` to shift the whole segment along the path.


Here is an interactive example:

<lottie-playground example="trim_path.json">
    <form>
        <input title="Start" type="range" min="0" value="0" max="100"/>
        <input title="End" type="range" min="0" value="50" max="100"/>
        <input title="Offset" type="range" min="0" value="0" max="360"/>
        <enum title="Multiple Shapes">trim-multiple-shapes</enum>
    </form>
    <json>lottie.layers[0].shapes[4]</json>
    <script>
        lottie.layers[0].shapes[4].s.k = data["Start"];
        lottie.layers[0].shapes[4].e.k = data["End"];
        lottie.layers[0].shapes[4].o.k = data["Offset"];
        lottie.layers[0].shapes[4].m = Number(data["Multiple Shapes"]);
    </script>
</lottie-playground>



<h3 id="rounded-corners">Rounded Corners</h3>

{schema_string:shapes/rounded-corners/description}

{schema_object:shapes/rounded-corners}

<lottie-playground example="rounded_corners.json">
    <form>
        <input title="Radius" type="range" min="0" value="50" max="100"/>
    </form>
    <json>lottie.layers[0].shapes[0].it[1]</json>
    <script>
    lottie.layers[0].shapes[0].it[1].r.k = data["Radius"];
    </script>
</lottie-playground>


<h3 id="pucker-bloat">Pucker / Bloat</h3>

{schema_string:shapes/pucker-bloat/description}

{schema_object:shapes/pucker-bloat}

When `a` is `0`, nothing changes.<br/>
When `a` is positive, the vertices are pulled towards the center, with `100` being at the center. And the tangents are pushed away.<br/>
When `a` is negative the vertices are pushed away from the center with `100` being twice far away from the center. And the tangents are pulled towards the center.<br/>

The center is defined as the mean of the bezier vertices.

<lottie-playground example="pucker_bloat.json">
    <form>
        <input title="Amount" type="range" min="-100" value="50" max="100"/>
    </form>
    <json>lottie.layers[0].shapes[0].it[1]</json>
    <script>
        lottie.layers[0].shapes[0].it[1].a.k = data["Amount"];
    </script>
</lottie-playground>

<h3 id="twist">Twist</h3>

{schema_string:shapes/twist/description}

{schema_object:shapes/twist}


<h3 id="merge">Merge</h3>

{schema_string:shapes/merge/description}

{schema_object:shapes/merge}


<h3 id="offset-path">Offset Path</h3>

{schema_string:shapes/offset-path/description}

{schema_object:shapes/offset-path}



<h3 id="zig-zag">Zig Zag</h3>

{schema_string:shapes/zig-zag/description}

{schema_object:shapes/zig-zag}

