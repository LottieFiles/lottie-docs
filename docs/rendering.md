# Tips for rendering

<script src="../scripts/lottie_bezier.js"></script>
<style>
.json-parent:not([hidden]) {
    display: flex;    
}

.json-parent > pre {
    width: 50%;
}
.json-parent > pre > code {
    height: 100%;
}
</style>
<script>
let converter_map = {};

function convert_shape(shape)
{
    return converter_map[shape.ty](shape);
}

</script>

## Introduction

This page will give tips and example code on how to render certain objects within lottie.

Lottie has several implementations and some things might vary from player to player,
this guide tries to follow the behaviour of [lottie web](https://github.com/airbnb/lottie-web/)
which is the reference implementation.

For shapes, it ensures the stroke order is the same as in lottie web, which is crucial
for [Trim Path](shapes.md#trim-path) to work correctly.

All shapes have the `d` attribute that if has the value `3` the path should be reversed.


### Code

The code examples take some shortcuts for readablility:
all animated properties are shown as static, of course you'd need to get the
correct values to render shapes at a given frame.

When adding points to a bezier, there are calls to `bezier.add_vertex()`.
Assume the in/out tangents are `[0, 0]` if not specified.
When they are specified they show as `set_out_tangent` immediately following
the corresponding `add_vertex`.

Bezier tangents are assumed to be relative to their vertex since that's how lottie works
but it might be useful to keep them as absolute points when rendering.

All the examples show the original on the left and the bezier on the right.

Explanation for bezier operations is outside the scope of this guide,
the code below use a simple bezier library for some operations,
you can [check its sources](/lottie-docs/scripts/lottie_bezier.js)
for some context on what the various functions do.


## Rectangle

See [Rectangle](shapes.md#rectangle).

Note that unlike other shapes, on lottie web when the `d` attribute is missing,
the rectangle defaults as being reversed.


Rectangle without rounded corners:

{shape_bezier_script:rectangle.json:394:394}
Position x:<input type="range" min="0" max="512" value="256"/>
Position y:<input type="range" min="0" max="512" value="256"/>
Width:<input type="range" min="0" max="512" value="256"/>
Height:<input type="range" min="0" max="512" value="256"/>
<json>lottie.layers[0].shapes[0].it[0]</json>
<script func="rect(shape.p.k, shape.s.k)" varname="shape">
function rect(position, size)
{
    let left = position[0] - size[0] / 2;
    let right = position[0] + size[0] / 2;
    let top = position[1] - size[1] / 2;
    let bottom = position[1] + size[1] / 2;

    let bezier = new Bezier();

    bezier.add_vertex(right, top);
    bezier.add_vertex(right, bottom);
    bezier.add_vertex(left, bottom);
    bezier.add_vertex(left, top);

    return bezier;
}
</script>
<script>
lottie.layers[0].shapes[0].it[0].p.k = [
    data["Position x"], data["Position y"]
];
lottie.layers[0].shapes[0].it[0].s.k = [
    data["Width"], data["Height"]
];
</script>

With rounded corners:

{shape_bezier_script:rectangle.json:rc:394:394}
Position x:<input type="range" min="0" max="512" value="256"/>
Position y:<input type="range" min="0" max="512" value="256"/>
Width:<input type="range" min="0" max="512" value="256"/>
Height:<input type="range" min="0" max="512" value="256"/>
Roundness:<input type="range" min="0" max="512" value="50"/>
<json>lottie.layers[0].shapes[0].it[0]</json>
<script func="rounded_rect(shape.p.k, shape.s.k, shape.r.k)" varname="shape">
function rounded_rect(position, size, roundness)
{
    let left = position[0] - size[0] / 2;
    let right = position[0] + size[0] / 2;
    let top = position[1] - size[1] / 2;
    let bottom = position[1] + size[1] / 2;

    let rounded = Math.min(size[0] / 2, size[1] / 2, roundness);

    let bezier = new Bezier();

    // top right, going down
    bezier.add_vertex(right, top + rounded)
        .set_in_tangent(0, -rounded/2);

    // bottom right
    bezier.add_vertex(right, bottom - rounded)
        .set_out_tangent(0, rounded/2);

    bezier.add_vertex(right - rounded, bottom)
        .set_in_tangent(rounded/2, 0);

    // bottom left
    bezier.add_vertex(left + rounded, bottom)
        .set_out_tangent(-rounded/2, 0);

    bezier.add_vertex(left, bottom - rounded)
        .set_in_tangent(0, rounded/2);

    // top left
    bezier.add_vertex(left, top + rounded)
        .set_out_tangent(0, -rounded/2);

    bezier.add_vertex(left + rounded, top)
        .set_in_tangent(-rounded/2, 0);


    // back to top right
    bezier.add_vertex(right - rounded, top)
        .set_out_tangent(rounded/2, 0);

    return bezier;
}
</script>
<script>
lottie.layers[0].shapes[0].it[0].p.k = [
    data["Position x"], data["Position y"]
];
lottie.layers[0].shapes[0].it[0].s.k = [
    data["Width"], data["Height"]
];
lottie.layers[0].shapes[0].it[0].r.k = data["Roundness"];
</script>


## Ellipse

See [Ellipse](shapes.md#ellipse).

The stroke direction should start at the top.
If you think of the ellipse as a clock, start at 12 go clockwise.


The magic number `0.5519` is what lottie uses for this, based on [this article](https://spencermortensen.com/articles/bezier-circle/).

{shape_bezier_script:ellipse.json:el:394:394}
Position x:<input type="range" min="0" max="512" value="256"/>
Position y:<input type="range" min="0" max="512" value="256"/>
Width:<input type="range" min="0" max="512" value="256"/>
Height:<input type="range" min="0" max="512" value="256"/>
<json>lottie.layers[0].shapes[0].it[0]</json>
<script func="ellipse(shape.p.k, shape.s.k)" varname="shape">
function ellipse(position, size)
{
    const ellipse_constant = 0.5519;

    let x = position[0];
    let y = position[1];
    let radius_x = size[0] / 2;
    let radius_y = size[1] / 2;
    let tangent_x = radius_x * ellipse_constant;
    let tangent_y = radius_y * ellipse_constant;

    let bezier = new Bezier();

    bezier.add_vertex(x, y - radius_y)
        .set_in_tangent(-tangent_x, 0)
        .set_out_tangent(tangent_x, 0);

    bezier.add_vertex(x + radius_x, y)
        .set_in_tangent(0, -tangent_y)
        .set_out_tangent(0, tangent_y);

    bezier.add_vertex(x, y + radius_y)
        .set_in_tangent(tangent_x, 0)
        .set_out_tangent(-tangent_x, 0);

    bezier.add_vertex(x - radius_x, y)
        .set_in_tangent(0, tangent_y)
        .set_out_tangent(0, -tangent_y);

    return bezier;
}
</script>
<script>
lottie.layers[0].shapes[0].it[0].p.k = [
    data["Position x"], data["Position y"]
];
lottie.layers[0].shapes[0].it[0].s.k = [
    data["Width"], data["Height"]
];
</script>


## PolyStar

Pseudocode for rendering a [PolyStar](shapes.md#polystar).


{shape_bezier_script:star.json:sr:394:394}
Points:<input type="range" min="3" max="10" value="5"/>
Rotation:<input type="range" min="0" max="360" value="0"/>
Outer Radius:<input type="range" min="0" max="300" value="200"/>
Inner Radius:<input type="range" min="0" max="300" value="100"/>
Outer Roundness:<input type="range" min="0" max="100" value="0"/>
Inner Roundness:<input type="range" min="0" max="100" value="0"/>
Type:<select><option value="1">Star</option><option value="2">Polygon</option></select>
<json>lottie.layers[0].shapes[0].it[0]</json>
<script func="polystar(new Point(shape.p.k), shape.sy, shape.pt.k, shape.r.k, shape.or.k, shape.os.k, shape.ir?.k, shape.is?.k)">
function polystar(
    position,
    type,
    points,
    rotation,
    outer_radius,
    outer_roundness,
    inner_radius,
    inner_roundness
)
{
    let result = new Bezier();

    let half_angle = Math.PI / points;
    let angle_radians = rotation / 180 * Math.PI

    // Tangents for rounded courners
    let tangent_len_outer = outer_roundness * outer_radius * 2 * Math.PI / (points * 4 * 100);
    let tangent_len_inner = inner_roundness * inner_radius * 2 * Math.PI / (points * 4 * 100);

    for ( let i = 0; i < points; i++ )
    {
        let main_angle = -Math.PI / 2 + angle_radians + i * half_angle * 2;

        let outer_vertex = new Point(
            outer_radius * Math.cos(main_angle),
            outer_radius * Math.sin(main_angle)
        );

        let outer_tangent = new Point(0, 0);
        if ( outer_radius != 0 )
            outer_tangent = new Point(
                outer_vertex.y / outer_radius * tangent_len_outer,
                -outer_vertex.x / outer_radius * tangent_len_outer
            );

        result.add_vertex(position.add(outer_vertex))
            .set_in_tangent(outer_tangent)
            .set_out_tangent(outer_tangent.neg());

        // Star inner radius
        if ( type == 1 )
        {
            let inner_vertex = new Point(
                inner_radius * Math.cos(main_angle + half_angle),
                inner_radius * Math.sin(main_angle + half_angle)
            );

            let inner_tangent = new Point(0, 0);
            if ( inner_radius != 0 )
                inner_tangent = new Point(
                    inner_vertex.y / inner_radius * tangent_len_inner,
                    -inner_vertex.x / inner_radius * tangent_len_inner
                );

            result.add_vertex(position.add(inner_vertex))
                .set_in_tangent(inner_tangent)
                .set_out_tangent(inner_tangent.neg());
        }
    }

    return result;
}
</script>
<script>
var star = {
    "ty": "sr",
    "nm": "PolyStar",
    "sy": Number(data["Type"]),
    "p": {
        "a": 0,
        "k": [
            256,
            256
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
    star.ir = {
        "a": 0,
        "k": data["Inner Radius"]
    };
    star.is = {
        "a": 0,
        "k": data["Inner Roundness"]
    };
}
lottie.layers[0].shapes[0].it[0] = star;
</script>


## Pucker Bloat

See [Pucker / Bloat](shapes.md#pucker-bloat).


{shape_bezier_script:pucker_bloat.json:394:394}
Amount:<input type="range" min="-100" value="50" max="100"/>
<json>lottie.layers[0].shapes[0].it[1]</json>
<script>
lottie.layers[0].shapes[0].it[1].a.k = data["Amount"];
let star = lottie.layers[0].shapes[0].it[0];
</script>
<script func="pucker_bloat([convert_shape(star)], modifier.a.k)" varname="modifier" suffix="[0].to_lottie()">
function pucker_bloat(
    // Beziers as collected from the other shapes
    collected_shapes,
    // "a" property from the Pucker/Bloat modifier
    amount
)
{
    // Normalize to [0, 1]
    amount /= 100;

    // Find the mean of the bezier vertices
    let center = new Point(0, 0);
    let number_of_vertices = 0;
    for ( let input_bezier of collected_shapes )
    {
        for ( let point of input_bezier.points )
        {
            center.x += point.pos.x;
            center.y += point.pos.y;
            number_of_vertices += 1;
        }
    }

    center.x /= number_of_vertices;
    center.y /= number_of_vertices;

    let result = [];

    for ( let input_bezier of collected_shapes )
    {
        let output_bezier = new Bezier();
        for ( let point of input_bezier.points )
        {
            // Here we convert tangents to global coordinates
            let vertex = lerp(point.pos, center, amount);
            let in_tangent = lerp(point.in_tangent.add(point.pos), center, -amount).sub(vertex);

            let out_tangent = lerp(point.out_tangent.add(point.pos), center, -amount).sub(vertex);
            output_bezier.add_vertex(vertex)
                .set_in_tangent(in_tangent)
                .set_out_tangent(out_tangent);
        }

        output_bezier.closed = input_bezier.closed;

        result.push(output_bezier);
    }

    return result;
}
</script>


## Rounded Corners


See [Rounded Corners](shapes.md#rounded-corners).

It approximates rounding using circular arcs.

The magic number `0.5519` is what lottie uses for this, based on [this article](https://spencermortensen.com/articles/bezier-circle/).

{shape_bezier_script:rounded_corners.json:394:394}
Radius:<input type="range" min="0" value="50" max="100"/>
<json>lottie.layers[0].shapes[0].it[1]</json>
<script>
lottie.layers[0].shapes[0].it[1].r.k = data["Radius"];
let star = lottie.layers[0].shapes[0].it[0];
</script>
<script func="round_corners([convert_shape(star)], modifier.r.k)" varname="modifier" suffix="[0].to_lottie()">
// Helper function to perform rounding on a single vertex
function get_vertex_tangent(
    // Bezier to round
    bezier,
    // Vertex in the bezier we are rounding
    current_vertex,
    // Index of the next point along the curve
    closest_index,
    // Rounding radius
    round_distance
)
{
    const tangent_length = 0.5519;

    // closest_index module bezier.length
    closest_index = closest_index % bezier.points.length;
    if ( closest_index < 0 )
        closest_index += bezier.points.length;


    let closest_vertex = bezier.points[closest_index].pos;
    let distance = current_vertex.distance(closest_vertex);
    let new_pos_perc = distance != 0 ? Math.min(distance/2, round_distance) / distance : 0;
    let vertex = closest_vertex.sub(current_vertex).mul(new_pos_perc).add(current_vertex);
    let tangent = vertex.sub(current_vertex).neg().mul(tangent_length);
    return [vertex, tangent];
}

// Rounding for a single continuos curve
function round_bezier_corners(
    // Bezier to round
    original,
    // Rounding radius
    round_distance
)
{
    let result = new Bezier()
    result.closed = original.closed;

    for ( let i = 0; i < original.points.length; i++ )
    {
        let point = original.points[i];

        // Start and end of a non-closed path don't get rounded
        if ( !original.closed && (i == 0 || i == original.points.length - 1) )
        {
            result.add_vertex(point.pos)
                .set_in_tangent(point.in_tangent)
                .set_out_tangent(point.out_tangent);
        }
        else
        {
            let [vert1, out_t] = get_vertex_tangent(original, point.pos, i - 1, round_distance);
            result.add_vertex(vert1)
                .set_out_tangent(out_t);

            let [vert2, in_t] = get_vertex_tangent(original, point.pos, i + 1, round_distance);
            result.add_vertex(vert2)
                .set_in_tangent(in_t);
        }
    }

    return result;
}

// Rounding on multiple bezier
function round_corners(
    // Beziers as collected from the other shapes
    collected_shapes,
    // "r" property from lottie
    r
)
{
    let result = []

    for ( let input_bezier of collected_shapes )
        result.push(round_bezier_corners(input_bezier, r));

    return result;
}
</script>


## Zig Zag

See [Zig Zag](shapes.md#zig-zag).


{shape_bezier_script:zig-zag.json:394:394}
Zig Zag:
Amplitude:<input type="range" min="-100" value="10" max="100"/>
Frequency:<input type="range" min="0" value="10" max="30"/>
Point Type:<select><option value="1">Point</option><option value="2">Smooth</option></select>
Star:
Roundness:<input type="range" min="0" value="0" max="100"/>
Rotation:<input type="range" min="0" value="0" max="360"/>
Points:<input type="range" min="3" value="5" max="10"/>
Stroke Width:<input type="range" min="1" value="3" max="30"/>
<json>lottie.layers[0].shapes[0].it[1]</json>
<script>
lottie.layers[0].shapes[0].it[1].s.k = data["Amplitude"];
lottie.layers[0].shapes[0].it[1].r.k = data["Frequency"];
lottie.layers[0].shapes[0].it[1].pt.k = Number(data["Point Type"]);

lottie.layers[0].shapes[0].it[0].pt.k = data["Points"];
lottie.layers[0].shapes[0].it[0].r.k = data["Rotation"];
lottie.layers[0].shapes[0].it[0].is.k = data["Roundness"];
lottie.layers[0].shapes[0].it[0].os.k = data["Roundness"];
lottie.layers[0].shapes[0].it[2].w.k = data["Stroke Width"];

let star = lottie.layers[0].shapes[0].it[0];
bezier_lottie.layers[0].shapes[0].it[1].w.k = data["Stroke Width"];
</script>
<script func="zig_zag([convert_shape(star)], modifier.s.k, modifier.r.k, modifier.pt.k)" varname="modifier" suffix="[0].to_lottie()">

function angle_mean(a, b)
{
    if ( Math.abs(a-b) > Math.PI )
        return (a + b) / 2 + Math.PI;

    return (a + b) / 2;
}

function zig_zag_corner(output_bezier, segment_before, segment_after, amplitude, direction, tangent_length)
{
    let point;
    let angle;
    let tan_angle;

    // We use 0.01 and 0.99 instead of 0 and 1 because they yield better results
    if ( !segment_before )
    {
        point = segment_after.points[0];
        angle = segment_after.normal_angle(0.01);
        tan_angle = segment_after.tangent_angle(0.01);
    }
    else if ( !segment_after )
    {
        point = segment_before.points[3];
        angle = segment_before.normal_angle(0.99);
        tan_angle = segment_before.tangent_angle(0.99);
    }
    else
    {
        point = segment_after.points[0];
        angle = angle_mean(segment_after.normal_angle(0.01), segment_before.normal_angle(0.99));
        tan_angle = angle_mean(segment_after.tangent_angle(0.01), segment_before.tangent_angle(0.99));
    }

    let vertex = output_bezier.add_vertex(point.add_polar(angle, direction * amplitude));
    if ( tangent_length !== 0 )
    {
        vertex.set_in_tangent(Point.polar(tan_angle, -tangent_length));
        vertex.set_out_tangent(Point.polar(tan_angle, tangent_length));
    }
}

function zig_zag_segment(output_bezier, segment, amplitude, frequency, direction, tangent_length)
{
    for ( let i = 0; i < frequency; i++ )
    {
        let f = (i + 1) / (frequency + 1);
        let t = segment.t_at_length_percent(f);
        let angle = segment.normal_angle(t);
        let point = segment.point(t);

        let vertex = output_bezier.add_vertex(point.add_polar(angle, direction * amplitude));
        if ( tangent_length !== 0 )
        {
            let tan_angle = segment.tangent_angle(t);
            vertex.set_in_tangent(Point.polar(tan_angle, -tangent_length));
            vertex.set_out_tangent(Point.polar(tan_angle, tangent_length));
        }

        direction = -direction;
    }

    return direction;
}

function zig_zag_bezier(input_bezier, amplitude, frequency, smooth)
{
    let output_bezier = new Bezier();

    output_bezier.closed = input_bezier.closed;
    let count = input_bezier.segment_count();

    if ( count == 0 )
        return output_bezier;

    let direction = -1;
    let segment = input_bezier.closed ? input_bezier.segment(count - 1) : null;
    let next_segment = input_bezier.segment(0);

    segment.calculate_length_data();
    let tangent_length = smooth ? segment.length / (frequency + 1) / 2 : 0;

    zig_zag_corner(output_bezier, segment, next_segment, amplitude, -1, tangent_length);

    for ( let i = 0; i < count; i++ )
    {
        segment = next_segment;

        direction = zig_zag_segment(output_bezier, segment, amplitude, frequency, -direction, tangent_length);

        if ( i == count - 1 && !input_bezier.closed )
            next_segment = null;
        else
            next_segment = input_bezier.segment((i + 1) % count);

        zig_zag_corner(output_bezier, segment, next_segment, amplitude, direction, tangent_length);
    }

    return output_bezier;
}

function zig_zag(
    // Beziers as collected from the other shapes
    collected_shapes,
    amplitude,
    frequency,
    point_type
)
{
    // Ensure we have an integer number of segments
    frequency = Math.max(0, Math.round(frequency));

    let result = [];

    for ( let input_bezier of collected_shapes )
        result.push(zig_zag_bezier(input_bezier, amplitude, frequency, point_type === 2));

    return result;
}
</script>


## Offset Path

See [Offset Path](shapes.md#offset-path).


{shape_bezier_script:offset-path.json:394:394}
Offset Path:
Amount:<input type="range" min="-100" value="10" max="100"/>
Miter Limit:<input type="range" min="0" value="100" max="100"/>
Line Join:<enum value="2">line-join</enum>
Star:
Star Roundness:<input type="range" min="0" value="0" max="100"/>
<json>lottie.layers[0].shapes[0].it[1]</json>
<script>
lottie.layers[0].shapes[0].it[0].is.k = data["Star Roundness"];
lottie.layers[0].shapes[0].it[0].os.k = data["Star Roundness"];
lottie.layers[0].shapes[0].it[1].a.k = data["Amount"];
lottie.layers[0].shapes[0].it[1].lj = Number(data["Line Join"]);
lottie.layers[0].shapes[0].it[1].ml.k = data["Miter Limit"];

let star = lottie.layers[0].shapes[0].it[0];
bezier_lottie.layers[0].shapes[0].it[1].w.k = 3;
</script>
<script func="offset_path([convert_shape(star)], modifier.a.k, modifier.lj, modifier.ml.k)" varname="modifier">
/*
    Simple offset of a linear segment
*/
function linear_offset(p1, p2, amount)
{
    let angle = Math.atan2(p2.x - p1.x, p2.y - p1.y);
    return [
        p1.add_polar(angle, amount),
        p2.add_polar(angle, amount)
    ];
}

/*
    Offset a bezier segment
    only works well if the segment is flat enough
*/
function offset_segment(segment, amount)
{
    let [p0, p1a] = linear_offset(segment.points[0], segment.points[1], amount);
    let [p1b, p2b] = linear_offset(segment.points[1], segment.points[2], amount);
    let [p2a, p3] = linear_offset(segment.points[2], segment.points[3], amount);
    let p1 = line_intersection(p0, p1a, p1b, p2b) ?? p1a;
    let p2 = line_intersection(p2a, p3, p1b, p2b) ?? p2a;

    return new BezierSegment(p0, p1, p2, p3);
}

/*
    Join two segments
*/
function join_lines(output_bezier, seg1, seg2, line_join, miter_limit)
{
    let p0 = seg1.points[3];
    let p1 = seg2.points[0];

    // Bevel
    if ( line_join == 3 )
        return p0;


    // Connected, they don't need a joint
    if ( p0.is_equal(p1) )
        return p0;

    let last_point = output_bezier.points[output_bezier.points.length - 1];

    // Round
    if ( line_join == 2 )
    {
        const ellipse_constant = 0.5519;
        let angle_out = seg1.tangent_angle(1);
        let angle_in = seg2.tangent_angle(0) + Math.PI;
        let center = line_intersection(
            p0, p0.add_polar(angle_out + Math.PI / 2, 100),
            p1, p1.add_polar(angle_out + Math.PI / 2, 100)
        );
        let radius = center ? center.distance(p0) : p0.distance(p1) / 2;
        last_point.set_out_tangent(Point.polar(angle_out, 2 * radius * ellipse_constant));

        output_bezier.add_vertex(p1)
            .set_in_tangent(Point.polar(angle_in, 2 * radius * ellipse_constant));

        return p1;
    }

    // Miter
    let t0 = p0.is_equal(seg1.points[2]) ? seg1.points[0] : seg1.points[2];
    let t1 = p1.is_equal(seg2.points[1]) ? seg2.points[3] : seg2.points[1];
    let intersection = line_intersection(t0, p0, p1, t1);
    if ( intersection && intersection.distance(p0) < miter_limit )
    {
        output_bezier.add_vertex(intersection);
        return intersection;
    }

    return p0;
}


function get_intersection(a, b)
{
    let intersect = a.intersections(b);

    if ( intersect.length && fuzzy_compare(intersect[0], 1) )
        intersect.shift();

    if ( intersect.length )
        return intersect[0];

    return null;
}

function prune_segment_intersection(a, b)
{
    let out_a = [...a];
    let out_b = [...b];

    let intersect = get_intersection(a[a.length-1], b[0]);

    if ( intersect )
    {
        out_a[a.length-1] = a[a.length-1].split(intersect[0])[0];
        out_b[0] = b[0].split(intersect[1])[1];
    }

    if ( a.length > 1 && b.length > 1 )
    {
        intersect = get_intersection(a[0], b[b.length - 1]);

        if ( intersect )
        {
            return [
                [a[0].split(intersect[0])[0]],
                [b[b.length-1].split(intersect[1])[1]],
            ];
        }
    }

    return [out_a, out_b];
}

function prune_intersections(segments)
{
    for ( let i = 1; i < segments.length; i++ )
    {
        [segments[i-1], segments[i]] = prune_segment_intersection(segments[i - 1], segments[i]);
    }

    if ( segments.length > 1 )
        [segments[segments.length - 1], segments[0]] = prune_segment_intersection(segments[segments.length - 1], segments[0]);

    return segments;
}

function offset_segment_split(segment, amount)
{
    /*
        We split each bezier segment into smaller pieces based
        on inflection points, this ensures the control point
        polygon is convex.

        (A cubic bezier can have none, one, or two inflection points)
    */
    let flex = segment.inflection_points();

    if ( flex.length == 0 )
    {
        return [offset_segment(segment, amount)];
    }
    else if ( flex.length == 1 || flex[1] == 1 )
    {
        let [left, right] = segment.split(flex[0]);

        return [
            offset_segment(left, amount),
            offset_segment(right, amount)
        ];
    }
    else
    {
        let [left, mid_right] = segment.split(flex[0]);
        let t = (flex[1] - flex[0]) / (1 - flex[0]);
        let [mid, right] = mid_right.split(t);

        return [
            offset_segment(left, amount),
            offset_segment(mid, amount),
            offset_segment(right, amount)
        ];
    }

}

function offset_path(
    // Beziers as collected from the other shapes
    collected_shapes,
    amount,
    line_join,
    miter_limit,
)
{
    let result = [];

    for ( let input_bezier of collected_shapes )
    {
        let output_bezier = new Bezier();

        output_bezier.closed = input_bezier.closed;
        let count = input_bezier.segment_count();

        let multi_segments = [];

        for ( let i = 0; i < count; i++ )
            multi_segments.push(offset_segment_split(input_bezier.segment(i), amount));

        // Open paths are stroked rather than being simply offset
        if ( !input_bezier.closed )
        {
            for ( let i = count - 1; i >= 0; i-- )
                multi_segments.push(offset_segment_split(input_bezier.inverted_segment(i), amount));
        }

        multi_segments = prune_intersections(multi_segments);

        // Add bezier segments to the output and apply line joints
        let last_point = null;
        let last_seg = null;

        for ( let multi_segment of multi_segments )
        {
            if ( last_seg )
                last_point = join_lines(output_bezier, last_seg, multi_segment[0], line_join, miter_limit);

            last_seg = multi_segment[multi_segment.length - 1];

            for ( let segment of multi_segment )
            {
                if ( segment.points[0].is_equal(last_point) )
                {
                    output_bezier.points[output_bezier.points.length - 1]
                        .set_out_tangent(segment.points[1].sub(segment.points[0]));
                }
                else
                {
                    output_bezier.add_vertex(segment.points[0])
                        .set_out_tangent(segment.points[1].sub(segment.points[0]));
                }


                output_bezier.add_vertex(segment.points[3])
                    .set_in_tangent(segment.points[2].sub(segment.points[3]));

                last_point = segment.points[3];
            }
        }

        if ( multi_segments.length )
            join_lines(output_bezier, last_seg, multi_segments[0][0], line_join, miter_limit);

        result.push(output_bezier);
    }

    return result;
}
</script>


## Trim Path

{shape_bezier_script:trim_path.json:394:394}
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

let siblings = bezier_lottie.layers[0].shapes[0].it;
siblings[siblings.length-2].w.k = 20;

let shapes = [];
for ( let i = 0; i < 4; i++ )
    shapes.push(convert_shape(lottie.layers[0].shapes[i]));
</script>
<script func="trim_path(shapes, modifier.s.k, modifier.e.k, modifier.o.k, modifier.m)" varname="modifier">

function trim_path_gather_chunks(collected_shapes, multiple)
{
    let chunks = [];

    // Shapes are handled as a single unit
    if ( multiple === 2 )
        chunks.push({segments: [], length: 0});

    for ( let input_bezier of collected_shapes )
    {
        // Shapes are all affected separately
        if ( multiple === 1 )
            chunks.push({segments: [], length: 0});

        let chunk = chunks[chunks.length-1];

        for ( let i = 0; i < input_bezier.segment_count(); i++ )
        {
            let segment = input_bezier.segment(i);
            let length = segment.get_length();
            chunk.segments.push(segment);
            chunk.length += length;
        }

        // Use null as a marker to start a new bezier
        if ( multiple == 2 )
            chunk.segments.push(null);
    }

    return chunks;
}

function trim_path_chunk(chunk, start, end, output_shapes)
{
    // Note: start and end have been normalized and have the offset applied
    // The offset itself was normalized into [0, 1] so this is always true:
    // 0 <= start < end <= 2

    // Some offsets require us to handle different "splits"
    // We want each split to be a pair [s, e] such that
    // 0 <= s < e <= 1
    var splits = [];

    if ( end <= 1 )
    {
        // Simplest case, the segment is in [0, 1]
        splits.push([start, end]);
    }
    else if ( start > 1 )
    {
        // The whole segment is outside [0, 1]
        splits.push([start-1, end-1]);
    }
    else
    {
        // The segment goes over the end point, so we need two splits
        splits.push([start, 1]);
        splits.push([0, end-1]);
    }

    // Each split is a separate bezier, all left to do is finding the
    // bezier segment to add to the output
    for ( let [s, e] of splits )
    {
        let start_length = s * chunk.length;
        let start_t;
        let end_length = e * chunk.length;
        let prev_length = 0;

        let output_bezier = new Bezier(false);
        output_shapes.push(output_bezier);

        for ( let i = 0; i < chunk.segments.length; i++ )
        {
            let segment = chunk.segments[i];

            // New bezier marker found
            if ( segment === null )
            {
                output_bezier = new Bezier(false);
                output_shapes.push(output_bezier);
                continue;
            }

            if ( segment.length >= end_length )
            {
                let end_t = segment.t_at_length(end_length);

                if ( segment.length >= start_length )
                {
                    start_t = segment.t_at_length(start_length);
                    segment = segment.split(start_t)[1];
                    end_t = (end_t - start_t) / (1 - start_t);
                }

                output_bezier.add_segment(segment.split(end_t)[0], false);
                break;
            }

            if ( start_t === undefined )
            {
                if ( segment.length >= start_length )
                {
                    start_t = segment.t_at_length(start_length);
                    output_bezier.add_segment(segment.split(start_t)[1], false);
                }
            }
            else
            {
                output_bezier.add_segment(segment, true);
            }

            start_length -= segment.length;
            end_length -= segment.length;
        }
    }
}

function trim_path(
    collected_shapes,
    start,
    end,
    offset,
    multiple
)
{
    // Normalize Inputs
    offset = offset / 360 % 1;
    if ( offset < 0 )
        offset += 1;

    start = Math.min(1, Math.max(0, start / 100));
    end = Math.min(1, Math.max(0, end / 100));

    if ( end < start )
        [start, end] = [end, start];

    // Apply offset
    start += offset;
    end += offset;

    // Handle the degenerate cases
    if ( fuzzy_compare(start, end) )
        return [new Bezier(false)];

    if ( fuzzy_zero(start) && fuzzy_compare(end, 1) )
        return collected_shapes;

    // Gather up the segments to trim
    let chunks = trim_path_gather_chunks(collected_shapes, multiple);

    let output_shapes = [];

    for ( let chunk of chunks )
        trim_path_chunk(chunk, start, end, output_shapes);

    return output_shapes;

}
</script>


## Transform


<script src="/lottie-docs/scripts/lottie_matrix.js"></script>

This is how to convert a [transform](concepts.md#transform) object into a matrix.

Assuming the matrix

{matrix}
a   c   0   0
b   d   0   0
0   0   1   0
tx  ty  0   1

The names `a`, `b`, etc are the ones commonly used for [CSS transforms](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix()).

4D matrix to allow for 3D transforms, even though currently lottie only supports 2D graphics.

Multiplications are right multiplications (`Next = Previous * StepOperation`).

If your transform is transposed (`tx`, `ty` are on the last column), perform left multiplication instead.

Perform the following operations on a matrix starting from the identity matrix (or the parent object's transform matrix):

Translate by `-a`:

{matrix}
1       0       0   0
0       1       0   0
0       0       1   0
-a[0]   -a[1]   0   1

Scale by `s/100`:

{matrix}
s[0]/100    0           0   0
0           s[1]/100    0   0
0           0           1   0
0           0           0   1

Rotate by `-sa` (can be skipped if not skewing)

{matrix}
cos(-sa)   sin(-sa) 0 0
-sin(-sa)  cos(-sa) 0 0
0          0        1 0
0          0        0 1

Skew by `sk` (can be skipped if not skewing)

{matrix}
1   tan(-sk) 0   0
0   1        0   0
0   0        1   0
0   0        0   1

Rotate by `sa` (can be skipped if not skewing)

{matrix}
cos(sa)     sin(sa) 0 0
-sin(sa)    cos(sa) 0 0
0           0       1 0
0           0       0 1

Rotate by `-r`

{matrix}
cos(-r)    sin(-r)  0 0
-sin(-r)   cos(-r)  0 0
0          0        1 0
0          0        0 1

If you are handling an [auto orient](layers.md#auto-orient) layer, evaluate and apply auto-orient rotation

Translate by `p`

{matrix}
1       0       0   0
0       1       0   0
0       0       1   0
p[0]    p[1]    0   1


{lottie_playground:transform.json:512:512}
Anchor X:<input type="range" min="0" value="256" max="512"/>
Anchor Y:<input type="range" min="0" value="256" max="512"/>
Position X:<input type="range" min="0" value="256" max="512"/>
Position Y:<input type="range" min="0" value="256" max="512"/>
Scale X:<input type="range" min="0" value="100" max="200"/>
Scale Y:<input type="range" min="0" value="100" max="200"/>
Rotation:<input type="range" min="0" value="0" max="360"/>
Skew:<input type="range" min="0" value="0" max="360"/>
Skew Angle:<input type="range" min="0" value="0" max="360"/>
Opacity:<input type="range" min="0" value="100" max="100"/>
<json>
[
    transform.elements.slice(0, 4),
    transform.elements.slice(4, 8),
    transform.elements.slice(8, 12),
    transform.elements.slice(12, 16)
].map(x => Array.from(x))
</json>
<script>

if ( lottie.layers.length == 3 )
{
    lottie.layers.splice(1, 0, {
        "ty": 4,
        "st": 0,
        "ip": 0,
        "op": 180,
        "ks": {},
        "shapes": [
            {
                "ty": "sh",
                "ks": {
                    "k": {
                        "c": true,
                        "v": [],
                        "i": [[0, 0], [0, 0], [0, 0], [0, 0]],
                        "o": [[0, 0], [0, 0], [0, 0], [0, 0]],
                    },
                    "a": 0
                }
            },
            {
                "ty": "st",
                "o": {
                    "a": 0,
                    "k": 100
                },
                "w": {
                    "a": 0,
                    "k": 2
                },
                "c": {
                    "a": 0,
                    "k": [
                        0.078,
                        0.741,
                        0.431
                    ]
                }
            }
        ]
    });
}

lottie.layers[0].ks.p.k[0] = data["Anchor X"];
lottie.layers[2].ks.a.k[0] = data["Anchor X"];
lottie.layers[0].ks.p.k[1] = data["Anchor Y"];
lottie.layers[2].ks.a.k[1] = data["Anchor Y"];
lottie.layers[2].ks.p.k[0] = data["Position X"];
lottie.layers[2].ks.p.k[1] = data["Position Y"];
lottie.layers[2].ks.s.k[0] = data["Scale X"];
lottie.layers[2].ks.s.k[1] = data["Scale Y"];
lottie.layers[2].ks.r.k = data["Rotation"];
lottie.layers[2].ks.sk.k = data["Skew"];
lottie.layers[2].ks.sa.k = data["Skew Angle"];
lottie.layers[2].ks.o.k = data["Opacity"];


var transform = new LottieMatrix();
transform.translate(-data["Anchor X"], -data["Anchor Y"]);
transform.scale(data["Scale X"] / 100, data["Scale Y"] / 100);
transform.skew(data["Skew"] * Math.PI / 180, data["Skew Angle"] * Math.PI / 180);
transform.rotate(-data["Rotation"] * Math.PI / 180);
transform.translate(data["Position X"], data["Position Y"]);

var cx = lottie.layers[2].shapes[0].p.k[0];
var cy = lottie.layers[2].shapes[0].p.k[1];
var rx = lottie.layers[2].shapes[0].s.k[0] / 2;
var ry = lottie.layers[2].shapes[0].s.k[1] / 2;

lottie.layers[1].shapes[0].ks.k.v = [
    transform.map(cx - rx, cy - ry).slice(0, 2),
    transform.map(cx + rx, cy - ry).slice(0, 2),
    transform.map(cx + rx, cy + ry).slice(0, 2),
    transform.map(cx - rx, cy + ry).slice(0, 2)
];

</script>


## Effects

<script src="/lottie-docs/scripts/simple_shader.js"></script>
<style>
.webgl-shader {
    transform: scaleY(-1);
}
</style>

### Fill Effect

{effect_shader_script:effects-fill.json:394:394}
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

shader.set_uniform("color", "4fv", [data["Red"], data["Green"], data["Blue"], data["Opacity"]]);
</script>
<script type="x-shader/x-fragment">
#version 100

uniform highp vec4 color;

uniform mediump vec2 canvas_size;
uniform sampler2D texture_sampler;

void main()
{
    highp vec2 uv = vec2(gl_FragCoord.x / canvas_size.x, gl_FragCoord.y / canvas_size.y);
    highp vec4 pixel = texture2D(texture_sampler, uv);

    gl_FragColor = color;
    gl_FragColor.a = 1.0;
    gl_FragColor *= pixel.a * color.a;
}
</script>


### Tritone Effect
{effect_shader_script:effects-tritone.json:394:394}
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

shader.set_uniform("bright", "4fv", [data["r1"], data["g1"], data["b1"], 1]);
shader.set_uniform("mid", "4fv", [data["r2"], data["g2"], data["b2"], 1]);
shader.set_uniform("dark", "4fv", [data["r3"], data["g3"], data["b3"], 1]);

</script>
<script type="x-shader/x-fragment">
#version 100

uniform highp vec4 bright;
uniform highp vec4 mid;
uniform highp vec4 dark;

uniform mediump vec2 canvas_size;
uniform sampler2D texture_sampler;

void main()
{
    highp vec2 uv = vec2(gl_FragCoord.x / canvas_size.x, gl_FragCoord.y / canvas_size.y);
    highp vec4 pixel = texture2D(texture_sampler, uv);

    highp float lightness = sqrt(pixel.r * pixel.r * 0.299 + pixel.g * pixel.g * 0.587 + pixel.b * pixel.b * 0.114);
    // If you want results more similar to lottie-web use the lightness below
    // (this shader has a more accurate lightness calculation)
    // lightness = sqrt((pixel.r * pixel.r + pixel.g * pixel.g + pixel.b * pixel.b) / 3.0);

    if ( lightness < 0.5 )
    {
        lightness *= 2.0;
        gl_FragColor = dark * (1.0 - lightness) + mid * lightness;
    }
    else
    {
        lightness = (lightness - 0.5) * 2.0;
        gl_FragColor = mid * (1.0 - lightness) + bright * lightness;
    }

    gl_FragColor *= pixel.a;
}
</script>


### Gaussian Blur

This is a two-pass shader, the uniform `pass` is has value `0`
on the first pass and value `1` on the second pass.

{effect_shader_script:effects-blur.json:394:394}
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


for ( let pass of [0, 1] )
{
    shader.set_uniform(pass, "sigma", "1f", data["Sigma"]);
    shader.set_uniform(pass, "direction", "1i", data["Direction"]);
    shader.set_uniform(pass, "wrap", "1i", data["Wrap"]);
}

</script>
<script type="x-shader/x-fragment" passes="2">
#version 300 es

#define PI 3.1415926538
precision highp float;

uniform float sigma;
uniform int direction;
uniform int kernel_size;
uniform bool wrap;

uniform mediump vec2 canvas_size;
uniform sampler2D texture_sampler;
uniform int pass;

out vec4 FragColor;


vec4 texture_value(vec2 uv)
{
    if ( wrap )
    {
        if ( uv.x < 0. ) uv.x = 1. - uv.x;
        if ( uv.x > 1. ) uv.x = uv.x - 1.;
        if ( uv.y < 0. ) uv.y = 1. - uv.y;
        if ( uv.y > 1. ) uv.y = uv.y - 1.;
    }
    else if ( uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1. )
    {
        return vec4(0.0);
    }

    return texture(texture_sampler, uv);
}


vec4 blur_pass(float sigma, int kernel_size, vec2 uv, bool horizontal)
{
    float side = float(kernel_size / 2);

    vec2 direction_vector = horizontal ?
        vec2(1.0, 0.0) / canvas_size.x :
        vec2(0.0, 1.0) / canvas_size.y;

    vec3 delta_gauss;
    delta_gauss.x = 1.0 / (sqrt(2.0 * PI) * sigma);
    delta_gauss.y = exp(-0.5 / (sigma * sigma));
    delta_gauss.z = delta_gauss.y * delta_gauss.y;

    vec4 avg = vec4(0.0, 0.0, 0.0, 0.0);
    float sum = 0.0;

    vec4 pixel = texture_value(uv);
    avg += pixel * delta_gauss.x;
    sum += delta_gauss.x;
    delta_gauss.xy *= delta_gauss.yz;

    for ( float i = 1.0; i <= side; i++)
    {
        for ( float s = -1.0; s <= 1.0; s += 2.0 )
        {
            vec2 pos = uv + s * i * direction_vector;
            pixel = texture_value(pos);
            avg += pixel * delta_gauss.x;
        }
        sum += 2.0 * delta_gauss.x;
        delta_gauss.xy *= delta_gauss.yz;
    }

    avg /= sum;

    return avg;
}


void main()
{
    highp vec2 uv = vec2(gl_FragCoord.x / canvas_size.x, gl_FragCoord.y / canvas_size.y);

    int actual_kernel_size = kernel_size == 0 ? int(0.5 + 6.0 * sigma) : kernel_size;

    const float multiplier = 0.25;

    if ( sigma == 0.0 )
    {
        FragColor = texture(texture_sampler, uv);
    }
    else if ( pass == 0 )
    {
        if ( direction != 3 )
            FragColor = blur_pass(sigma * multiplier, actual_kernel_size, uv, true);
        else
            FragColor = texture(texture_sampler, uv);
    }
    else if ( pass == 1 )
    {
        if ( direction != 2 )
            FragColor = blur_pass(sigma * multiplier, actual_kernel_size, uv, false);
        else
            FragColor = texture(texture_sampler, uv);
    }
}
</script>


### Drop Shadow Effect

The effect below is split into multiple shaders:

* First it generates the shadow
* Then it has a 2 pass gaussian blur (simplified from the example above)
* Finally, it composites the original image on top of the blurred shadow

{effect_shader_script:effects-shadow.json:394:394}
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

shader.set_uniform(0, "color", "4fv", [data["Red"], data["Green"], data["Blue"], data["Opacity"]]);
shader.set_uniform(0, "angle", "1f", data["Angle"]);
// 0.77 is just to take into account the canvas is 394 instead of 512
shader.set_uniform(0, "distance", "1f", data["Distance"] * 0.77);

shader.set_uniform(1, "sigma", "1f", data["Blur"]);
shader.set_uniform(2, "sigma", "1f", data["Blur"]);

shader.texture("/lottie-docs/examples/blep.png").set_uniform(shader.passes[3].program, "original");
</script>
<script type="x-shader/x-fragment">
#version 300 es
#define PI 3.1415926538

uniform highp vec4 color;
uniform mediump float angle;
uniform mediump float distance;

uniform mediump vec2 canvas_size;
uniform sampler2D texture_sampler;

out highp vec4 FragColor;

void main()
{
    // Base pixel value
    highp vec2 uv = vec2(gl_FragCoord.x / canvas_size.x, gl_FragCoord.y / canvas_size.y);
    highp vec4 pixel = texture(texture_sampler, uv);

    // Pixel value at the given offset
    mediump float radians = -angle * PI / 180.0 + PI / 2.0;
    highp vec2 shadow_uv = vec2(
        (gl_FragCoord.x - distance * cos(radians)) / canvas_size.x,
        1.0 - (gl_FragCoord.y - distance * sin(radians)) / canvas_size.y
    );
    highp vec4 shadow_pixel = texture(texture_sampler, shadow_uv);

    // Colorize shadow
    highp vec4 shadow_color;

    if ( shadow_uv.x >= 0.0 && shadow_uv.x <= 1.0 && shadow_uv.y >= 0.0 && shadow_uv.y <= 1.0 )
    {
        shadow_color = color;
        shadow_color.a = 1.0;
        shadow_color *= shadow_pixel.a * color.a / 255.0;
    }

    // Apply shadow below the base pixel
    FragColor = shadow_color; //pixel * pixel.a + shadow_color * (1.0 - pixel.a);
}
</script>
<script type="x-shader/x-fragment" passes="2">
#version 300 es

#define PI 3.1415926538
precision highp float;

uniform float sigma;

uniform mediump vec2 canvas_size;
uniform sampler2D texture_sampler;
uniform int pass;

out vec4 FragColor;

vec4 blur_pass(float sigma, int kernel_size, vec2 uv, bool horizontal)
{
    float side = float(kernel_size / 2);

    vec2 direction_vector = horizontal ?
        vec2(1.0, 0.0) / canvas_size.x :
        vec2(0.0, 1.0) / canvas_size.y;

    vec3 delta_gauss;
    delta_gauss.x = 1.0 / (sqrt(2.0 * PI) * sigma);
    delta_gauss.y = exp(-0.5 / (sigma * sigma));
    delta_gauss.z = delta_gauss.y * delta_gauss.y;

    vec4 avg = vec4(0.0, 0.0, 0.0, 0.0);
    float sum = 0.0;

    vec4 pixel = texture(texture_sampler, uv);
    avg += pixel * delta_gauss.x;
    sum += delta_gauss.x;
    delta_gauss.xy *= delta_gauss.yz;

    for ( float i = 1.0; i <= side; i++)
    {
        for ( float s = -1.0; s <= 1.0; s += 2.0 )
        {
            vec2 pos = uv + s * i * direction_vector;
            pixel = texture(texture_sampler, pos);
            avg += pixel * delta_gauss.x;
        }
        sum += 2.0 * delta_gauss.x;
        delta_gauss.xy *= delta_gauss.yz;
    }

    avg /= sum;

    return avg;
}


void main()
{
    highp vec2 uv = vec2(gl_FragCoord.x / canvas_size.x, gl_FragCoord.y / canvas_size.y);

    int kernel_size = int(0.5 + 6.0 * sigma);

    const float multiplier = 0.25;

    if ( sigma == 0.0 )
        FragColor = texture(texture_sampler, uv);
    else if ( pass == 1 )
        FragColor = blur_pass(sigma * multiplier, kernel_size, uv, true);
    else if ( pass == 2 )
        FragColor = blur_pass(sigma * multiplier, kernel_size, uv, false);
}
</script>
<script type="x-shader/x-fragment">
#version 300 es

precision highp float;

uniform sampler2D original;

uniform mediump vec2 canvas_size;
uniform sampler2D texture_sampler;

out vec4 FragColor;

vec4 alpha_blend(vec4 top, vec4 bottom)
{
    float comp_alpha = bottom.a * (1.0 - top.a);
    vec4 result;
    result.a = top.a + comp_alpha;
    result.rgb = (top.rgb * top.a + bottom.rgb * comp_alpha) / result.a;
    return result;
}

void main()
{
    highp vec2 uv = vec2(gl_FragCoord.x / canvas_size.x, gl_FragCoord.y / canvas_size.y);

    FragColor = alpha_blend(
        texture(original, uv),
        texture(texture_sampler, vec2(uv.x, 1.0 - uv.y))
    );
}
</script>


### Pro Levels Effect

{effect_shader_script:effects-prolevels.json:394:394}
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

shader.set_uniform("composite_in_black",  "1f", data["Composite In Black"]);
shader.set_uniform("composite_in_white",  "1f", data["Composite In White"]);
shader.set_uniform("composite_gamma",     "1f", data["Composite Gamma"]);
shader.set_uniform("composite_out_black", "1f", data["Composite Out Black"]);
shader.set_uniform("composite_out_white", "1f", data["Composite Out White"]);

shader.set_uniform("red_in_black",  "1f", data["Red In Black"]);
shader.set_uniform("red_in_white",  "1f", data["Red In White"]);
shader.set_uniform("red_gamma",     "1f", data["Red Gamma"]);
shader.set_uniform("red_out_black", "1f", data["Red Out Black"]);
shader.set_uniform("red_out_white", "1f", data["Red Out White"]);

shader.set_uniform("green_in_black",  "1f", data["Green In Black"]);
shader.set_uniform("green_in_white",  "1f", data["Green In White"]);
shader.set_uniform("green_gamma",     "1f", data["Green Gamma"]);
shader.set_uniform("green_out_black", "1f", data["Green Out Black"]);
shader.set_uniform("green_out_white", "1f", data["Green Out White"]);

shader.set_uniform("blue_in_black",  "1f", data["Blue In Black"]);
shader.set_uniform("blue_in_white",  "1f", data["Blue In White"]);
shader.set_uniform("blue_gamma",     "1f", data["Blue Gamma"]);
shader.set_uniform("blue_out_black", "1f", data["Blue Out Black"]);
shader.set_uniform("blue_out_white", "1f", data["Blue Out White"]);
</script>
<script type="x-shader/x-fragment">
#version 100
precision highp float;

uniform highp float composite_in_black;
uniform highp float composite_in_white;
uniform highp float composite_gamma;
uniform highp float composite_out_black;
uniform highp float composite_out_white;

uniform highp float red_in_black;
uniform highp float red_in_white;
uniform highp float red_gamma;
uniform highp float red_out_black;
uniform highp float red_out_white;

uniform highp float green_in_black;
uniform highp float green_in_white;
uniform highp float green_gamma;
uniform highp float green_out_black;
uniform highp float green_out_white;

uniform highp float blue_in_black;
uniform highp float blue_in_white;
uniform highp float blue_gamma;
uniform highp float blue_out_black;
uniform highp float blue_out_white;

uniform mediump vec2 canvas_size;
uniform sampler2D texture_sampler;


float adjust_channel(float value, float in_black, float in_white, float gamma, float out_black, float out_white)
{
    float in_delta = in_white - in_black;
    float out_delta = out_white - out_black;
    if ( in_delta == 0.0 )
        return out_black;

    // Clamp to input range
    if ( value <= in_black && value <= in_white )
        return out_black;

    if ( value >= in_black && value >= in_white )
        return out_white;

    // Apply adjustment
    return out_black + out_delta * pow((value - in_black) / in_delta, 1.0 / gamma);
}


void main()
{
    // Base pixel value
    highp vec2 uv = vec2(gl_FragCoord.x / canvas_size.x, gl_FragCoord.y / canvas_size.y);
    highp vec4 pixel = texture2D(texture_sampler, uv);

    // First Pass: composite
    pixel.rgb = vec3(
        adjust_channel(pixel.r, composite_in_black, composite_in_white, composite_gamma, composite_out_black, composite_out_white),
        adjust_channel(pixel.g, composite_in_black, composite_in_white, composite_gamma, composite_out_black, composite_out_white),
        adjust_channel(pixel.b, composite_in_black, composite_in_white, composite_gamma, composite_out_black, composite_out_white)
    );

    // Second Pass: individual Channels
    pixel.rgb = vec3(
        adjust_channel(pixel.r, red_in_black, red_in_white, red_gamma, red_out_black, red_out_white),
        adjust_channel(pixel.g, green_in_black, green_in_white, green_gamma, green_out_black, green_out_white),
        adjust_channel(pixel.b, blue_in_black, blue_in_white, blue_gamma, blue_out_black, blue_out_white)
    );

    gl_FragColor.rgb = pixel.rgb * pixel.a;
    gl_FragColor.a = pixel.a;
}
</script>


### Matte3

{effect_shader_script:effects-matte3-image.json:394:394}
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
Show Mask:<input type="checkbox"/>
Premultiply Mask:<input type="checkbox" checked="checked"/>
<json>lottie.layers[0].ef[0]</json>
<script>
lottie.layers[0].ef[0].ef[1].v.k = Number(data["Channel"]);
lottie.layers[0].ef[0].ef[2].v.k = Number(data["Invert"]);
lottie.layers[0].ef[0].ef[3].v.k = Number(data["Stretch To Fit"]);
lottie.layers[0].ef[0].ef[4].v.k = Number(data["Show Mask"]);
lottie.layers[0].ef[0].ef[5].v.k = Number(data["Premultiply Mask"]);

shader.set_uniform("channel", "1i", Number(data["Channel"]));
shader.set_uniform("invert", "1i", Number(data["Invert"]));
shader.set_uniform("show_mask", "1i", Number(data["Show Mask"]));
shader.set_uniform("premultiply_mask", "1i", Number(data["Premultiply Mask"]));
shader.texture("/lottie-docs/examples/thumbs-up.png").set_uniform(shader.program, "mask_layer");

</script>
<script type="x-shader/x-fragment">
#version 100
precision highp float;

uniform int channel;
uniform int invert;
uniform int premultiply_mask;
uniform int show_mask;
uniform sampler2D mask_layer;

uniform mediump vec2 canvas_size;
uniform sampler2D texture_sampler;

highp vec3 hsl(vec4 c)
{
    float maxc = max(c.r, max(c.g, c.b));
    float minc = min(c.r, min(c.g, c.b));
    float h = 0.0;
    float s = 0.0;
    float l = (maxc + minc) / 2.0;

    if ( maxc != minc)
    {
        float d = maxc - minc;
        s = l > 0.5 ? d / (2.0 - d) : d / (maxc + minc);
        if ( maxc == c.r )
            h = (c.g - c.b) / d + (c.g < c.b ? 6.0 : 0.0);
        else if ( maxc == c.g )
            h = (c.b - c.r) / d + 2.0;
        else if ( maxc == c.b )
            h = (c.r - c.g) / d + 4.0;

        h /= 6.0;
    }

    return vec3(h, s, l);
}

highp float opacity(vec4 pixel, int channel, int invert, int premultiply)
{
    if ( premultiply == 1 )
        pixel *= pixel.a;

    highp float opacity;

    if ( channel == 1 )
        opacity = pixel.r;
    else if ( channel == 2 )
        opacity = pixel.g;
    else if ( channel == 3 )
        opacity = pixel.b;
    else if ( channel == 4 )
        opacity = pixel.a;
    else if ( channel == 5 )
        opacity = sqrt(pixel.r * pixel.r * 0.299 + pixel.g * pixel.g * 0.587 + pixel.b * pixel.b * 0.114);
    else if ( channel == 6 )
        opacity = hsl(pixel).x;
    else if ( channel == 7 )
        opacity = hsl(pixel).z;
    else if ( channel == 8 )
        opacity = hsl(pixel).y;
    else if ( channel == 9 )
        opacity = 1.0;
    else if ( channel == 10 )
        opacity = 0.0;


    return invert == 1 ? 1.0 - opacity : opacity;
}

vec4 alpha_blend(vec4 top, vec4 bottom)
{
    float comp_alpha = bottom.a * (1.0 - top.a);
    vec4 result;
    result.a = top.a + comp_alpha;
    result.rgb = (top.rgb * top.a + bottom.rgb * comp_alpha) / result.a;
    return result;
}

void main()
{
    // Base pixel value
    highp vec2 uv = vec2(gl_FragCoord.x / canvas_size.x, gl_FragCoord.y / canvas_size.y);
    highp vec4 pixel = texture2D(texture_sampler, uv);

    highp vec4 mask = texture2D(mask_layer, uv);


    gl_FragColor.a = pixel.a * opacity(mask, channel, invert, premultiply_mask);
    gl_FragColor.rgb = pixel.rgb * gl_FragColor.a;

    if ( show_mask == 1 )
        gl_FragColor = alpha_blend(gl_FragColor, mask);
}
</script>


### Bulge

{effect_shader_script:effects-bulge.json:394:394}
Center X:<input type="range" min="0" max="512" value="286"/>
Center Y:<input type="range" min="0" max="512" value="277"/>
Radius X:<input type="range" min="0" max="512" value="197"/>
Radius Y:<input type="range" min="0" max="512" value="179"/>
Height:<input type="range" min="-4" max="4" step="0.1" value="1.9"/>
<json>lottie.layers[0].ef[0]</json>
<script>
lottie.layers[0].ef[0].ef[0].v.k = data["Radius X"];
lottie.layers[0].ef[0].ef[1].v.k = data["Radius Y"];
lottie.layers[0].ef[0].ef[2].v.k = [data["Center X"], data["Center Y"]];
lottie.layers[0].ef[0].ef[3].v.k = data["Height"];


shader.set_uniform("center", "2fv", [data["Center X"] * 0.77, data["Center Y"] * 0.77]);
shader.set_uniform("radius", "2fv", [data["Radius X"] * 0.77, data["Radius Y"] * 0.77]);
shader.set_uniform("height", "1f", data["Height"]);

</script>
<script type="x-shader/x-fragment">
#version 100

precision highp float;

uniform vec2 center;
uniform vec2 radius;
uniform float height;

uniform mediump vec2 canvas_size;
uniform sampler2D texture_sampler;

vec2 normalize_uv(vec2 coord)
{
    return vec2(coord.x / canvas_size.x, coord.y / canvas_size.y);
}

vec2 exponential_displacement(vec2 uv, float magnitude)
{
    return uv * pow(dot(uv, uv), magnitude) - uv;
}


vec2 spherical_displacement(vec2 uv, float magnitude)
{
    float radius = (1.0 + magnitude) / (2.0 * sqrt(magnitude));


    float arc_ratio = asin(length(uv) / radius) / asin(1.0 / radius);
    return normalize(uv) * arc_ratio - uv;
}

vec2 displace(vec2 owo)
{
    float t = dot(owo, owo);
    if (t >= 1.0)
        return owo;

    float magnitude = abs(height);
    // We modify the magniture to more closely match AE
    magnitude = (2.0/(1.0+exp(-3.0*magnitude))-1.0) * (0.23 * magnitude + 0.14);
    // If the above is too expensive, you can use this instead:
    // magnitude = magnitude * 0.275;
    // Both of the above were derived by interpolating sample points

    float sign = height > 0.0 ? 1.0 : -1.0;
    vec2 displacement =
        exponential_displacement(owo, magnitude) +
        spherical_displacement(owo, magnitude)
    ;
    return owo + displacement * magnitude * sign;

}

void main()
{
    highp vec2 uv = normalize_uv(gl_FragCoord.xy);
    vec2 norm_center = normalize_uv(center);
    vec2 norm_radius = normalize_uv(radius);

    // forward transform
    uv = (uv - norm_center) / norm_radius;
    //displace
    uv = displace(uv);
    // backward transform
    uv = uv * norm_radius + norm_center;

    gl_FragColor = texture2D(texture_sampler, uv);
}
</script>


### Wave Warp

This effect is animated by default, so it has a "time" slider (in seconds).

{effect_shader_script:effects-wave.json:394:394}
Shape:<select>
    <option value="1">Sine</option>
    <option value="2">Square</option>
    <option value="3">Triangle</option>
    <option value="4">Sawtooth</option>
    <option value="5">Circle</option>
    <option value="6">Semicircle</option>
    <option value="7">Uncircle</option>
    <option value="8">Noise</option>
    <option value="9">Smooth noise</option>
</select>
Amplitude:<input type="range" min="-100" max="100" value="10"/>
Wavelength:<input type="range" min="-100" max="100" value="40"/>
Direction:<input type="range" min="0" max="360" value="90"/>
Phase:<input type="range" min="0" max="360" value="0"/>
Speed:<input type="range" min="0" max="10" value="1" step="0.1"/>
Time:<input type="range" min="0" max="2" value="0" step="0.1"/>
<json>lottie.layers[0].ef[0]</json>
<script>
lottie.layers[0].ef[0].ef[0].v.k = Number(data["Shape"]);
lottie.layers[0].ef[0].ef[1].v.k = data["Amplitude"];
lottie.layers[0].ef[0].ef[2].v.k = data["Wavelength"];
lottie.layers[0].ef[0].ef[3].v.k = data["Direction"];
lottie.layers[0].ef[0].ef[5].v.k = data["Speed"];
// 5 "pinning" not implemented
lottie.layers[0].ef[0].ef[6].v.k = data["Phase"];
// & "antialiasing" unused


shader.set_uniform("shape", "1i", Number(data["Shape"]));
shader.set_uniform("amplitude", "1f", data["Amplitude"]);
shader.set_uniform("wavelength", "1f", data["Wavelength"]);
shader.set_uniform("angle", "1f", data["Direction"]);
shader.set_uniform("phase", "1f", data["Phase"]);
shader.set_uniform("speed", "1f", data["Speed"]);
shader.set_uniform("time", "1f", data["Time"]);

</script>
<script type="x-shader/x-fragment">
#version 100

#define PI 3.1415926538
#define TAU 6.283185307

precision highp float;

uniform int shape;
uniform float amplitude;
uniform float wavelength;
uniform float angle;
uniform float speed;
uniform float phase;
uniform float time;

uniform mediump vec2 canvas_size;
uniform sampler2D texture_sampler;


vec2 normalize_uv(vec2 coord)
{
    return vec2(coord.x / canvas_size.x, coord.y / canvas_size.y);
}

float clamp_angle(float angle)
{
    return mod(angle, TAU);
}

vec2 project(vec2 a , vec2 b)
{
    return dot(a, b) / dot(b, b) * b;
}

float semicircle(float x)
{
    return sqrt(1.0 - pow(clamp_angle(x) / PI - 1.0, 2.0));
}

// Adapted from http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
highp float noise(float x)
{
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt = x * a;
    highp float sn = mod(dt, PI);
    return fract(sin(sn) * c) * 2.0 - 1.0;
}

// Interpolate between two random points
float smooth_noise(float x)
{
    float x_fract = fract(x);
    float x_int = x - x_fract;
    float n1 = noise(x_int);
    float n2 = noise(x_int + 1.0);
    return (n1 * (1.0 - x_fract) + n2 * x_fract);
}

vec2 displace(vec2 uv)
{
    float rad = angle / 180.0 * PI;
    vec2 normal = vec2(cos(rad), sin(rad));
    rad -= PI /2.0;
    vec2 direction = vec2(cos(rad), sin(rad));
    float x = length(project(uv, direction));

    x = x / wavelength * PI - time * speed * TAU + phase / 180.0 * PI;


    float y;

    if ( shape == 1 ) // sine
        y = sin(x);
    else if ( shape == 2 ) // square
        y = clamp_angle(x) < PI ? 1.0 : -1.0;
    else if ( shape == 3 ) // triangle
        y = 1.0 - abs(clamp_angle(x) - PI) / PI * 2.0;
    else if ( shape == 4 ) // sawtooth
        y = 1.0 - clamp_angle(x) / PI;
    else if ( shape == 5 ) // circle
        y = sign(clamp_angle(x) -  PI) * semicircle(2.0 * x);
    else if ( shape == 6 ) // semi circle
        y = 2.0 * semicircle(x) - 1.0;
    else if ( shape == 7 ) // uncircle
        y = sign(clamp_angle(-x) -  PI) * (semicircle(2.0 * x) - 1.0);
    else if ( shape == 8 ) // noise
        y = noise(x);
    else if ( shape == 9 ) // smooth noise
        y = smooth_noise(x * 4.0) ;

    return uv + y * normal * amplitude;

}

void main()
{
    vec2 uv = displace(gl_FragCoord.xy);
    gl_FragColor = texture2D(texture_sampler, normalize_uv(uv));
}
</script>
