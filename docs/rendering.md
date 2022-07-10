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


### Pseudocode

The pseudocode takes some shortcuts for readablility:

All animated properties are shown as static, of course you'd need to get the
correct values to render shapes at a given frame.

It uses some utility types like `Bezier`, `lerp`, etc. They should be fairly self-explanatory.

When adding points to a bezier, there are calls to `bezier.add_vertex()`.
Assume the in/out tangents are `[0, 0]` if not specified.
When they are specified they show as `set_out_tangent` immediately following
the corresponding `add_vertex`.

Bezier tangents are assumed to be relative to their vertex since that's how lottie works
but it might be useful to keep them as absolute points when rendering.


All the examples show the original on the left and the bezier on the right.

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
Amplitude:<input type="range" min="-100" value="10" max="100"/>
Frequency:<input type="range" min="1" value="10" max="30"/>
Stroke Width:<input type="range" min="1" value="3" max="30"/>
<json>lottie.layers[0].shapes[0].it[1]</json>
<script>
lottie.layers[0].shapes[0].it[1].s.k = data["Amplitude"];
lottie.layers[0].shapes[0].it[1].pt.k = data["Frequency"];
lottie.layers[0].shapes[0].it[2].w.k = data["Stroke Width"];

let star = lottie.layers[0].shapes[0].it[0];
bezier_lottie.layers[0].shapes[0].it[1].w.k = data["Stroke Width"];
</script>
<script func="zig_zag([convert_shape(star)], modifier.s.k, modifier.pt.k)" varname="modifier" suffix="[0].to_lottie()">
function zig_zag_segment(output_bezier, segment, amplitude, frequency, direction)
{
    output_bezier.add_vertex(segment.start);

    for ( let i = 0; i < frequency; i++ )
    {
        let t = (i+0.5) / frequency;
        let angle = segment.normal_angle(t);
        let point = segment.point(t);
        point.x += Math.cos(angle) * direction * amplitude;
        point.y -= Math.sin(angle) * direction * amplitude;
        output_bezier.add_vertex(point);

        direction *= -1;
    }

    output_bezier.add_vertex(segment.end);
    return direction;
}

function zig_zag(
    // Beziers as collected from the other shapes
    collected_shapes,
    amplitude,
    frequency
)
{
    // Ensure we have an integer number of segments
    frequency = Math.max(1, Math.round(frequency));

    let result = [];

    for ( let input_bezier of collected_shapes )
    {
        let output_bezier = new Bezier();

        let direction = 1;
        output_bezier.closed = input_bezier.closed;
        let count = input_bezier.segment_count();
        for ( let i = 0; i < count; i++ )
            direction = -zig_zag_segment(output_bezier, input_bezier.segment(i), amplitude, frequency, direction);

        result.push(output_bezier);
    }

    return result;
}
</script>


## Offset Path

See [Offset Path](shapes.md#offset-path).


{shape_bezier_script:offset-path.json:394:394}
Star Roundness:<input type="range" min="0" value="0" max="100"/>
Amount:<input type="range" min="-100" value="10" max="100"/>
Miter Limit:<input type="range" min="0" value="100" max="100"/>
Line Join:<enum value="2">line-join</enum>
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
<script func="offset_path([convert_shape(star)], modifier.a.k, modifier.lj, modifier.ml.k)" varname="modifier" suffix="[0].to_lottie()">
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
function offset_segment(output_bezier, segment, amount)
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
    let cur;
    for ( let i = 1; i < segments.length; i++ )
    {
        [segments[i-1], segments[i]] = prune_segment_intersection(segments[i - 1], segments[i]);
    }

    if ( segments.length > 1 )
        [segments[segments.length - 1], segments[0]] = prune_segment_intersection(segments[segments.length - 1], segments[0]);

    return segments;
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
        {
            let segment = input_bezier.segment(i);
            /*
                We split each bezier segment into smaller pieces based
                on inflection points, this ensures the control point
                polygon is convex.

                (A cubic bezier can have none, one, or two inflection points)
            */
            let flex = segment.inflection_points();

            if ( flex.length == 0 )
            {
                multi_segments.push([offset_segment(output_bezier, segment, amount)]);
            }
            else if ( flex.length == 1 || flex[1] == 1 )
            {
                let [left, right] = segment.split(flex[0]);

                multi_segments.push([
                    offset_segment(output_bezier, left, amount),
                    offset_segment(output_bezier, right, amount)
                ]);
            }
            else
            {
                let [left, mid_right] = segment.split(flex[0]);
                let t = (flex[1] - flex[0]) / (1 - flex[0]);
                let [mid, right] = mid_right.split(t);

                multi_segments.push([
                    offset_segment(output_bezier, left, amount),
                    offset_segment(output_bezier, mid, amount),
                    offset_segment(output_bezier, right, amount)
                ]);
            }
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

        if ( input_bezier.closed && multi_segments.length )
            join_lines(output_bezier, last_seg, multi_segments[0][0], line_join, miter_limit);

        result.push(output_bezier);
    }

    return result;
}
</script>

## Transform

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


Rotate by `sa` (can be skipped if not skewing)

{matrix}
cos(sa)     sin(sa) 0 0
-sin(sa)    cos(sa) 0 0
0           0       1 0
0           0       0 1

Skew by `sk` (can be skipped if not skewing)

{matrix}
1   tan(sk) 0   0
0   1       0   0
0   0       1   0
0   0       0   1

Rotate by `-sa` (can be skipped if not skewing)

{matrix}
cos(-sa)   sin(-sa) 0 0
-sin(-sa)  cos(-sa) 0 0
0          0        1 0
0          0        0 1

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
