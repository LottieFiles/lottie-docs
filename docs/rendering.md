# Tips for rendering

## Introduction

This page will give tips and pseudocode on how to render certain objects within lottie.

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

It uses some utility types liek `Point`, `Bezier`, etc. They should be fairly self-explanatory.

When adding points to a bezier, there are calls to `bezier.add_vertex()`.
Assume the in/out tangents are `[0, 0]` if not specified.
When they are specified they show as `add_out_tangent` immediately following
the corresponding `add_vertex`.

Bezier tangents are assumed to be relative to their vertex since that's how lottie works.
But it might be useful to keep them as absolute points when rendering.


## Rectangle

See [Rectangle](shapes.md#rectangle).

Note that unlike other shapes, on lottie web when the `d` attribute is missing,
the rectangle defaults as being reversed.


```typescript
function rect(
    // Properties from lottie:
    p: Point,
    s: Size
)
    let left = p.x - s.width / 2;
    let right = p.x + s.width / 2;
    let top = p.y - s.height / 2;
    let bottom = p.y + s.height / 2;

    let result = Bezier()

    bezier.add_vertex(Point(right, top))
    bezier.add_vertex(Point(right, bottom))
    bezier.add_vertex(Point(left, bottom))
    bezier.add_vertex(Point(left, top))

    return result


function rounded_rect(
    // Properties from lottie:
    p: Point,
    s: Size,
    r: number
)
    let left = p.x - s.width / 2;
    let right = p.x + s.width / 2;
    let top = p.y - s.height / 2;
    let bottom = p.y + s.height / 2;

    let rounded = min(s.width / 2, size.height / 2, rounded)

    let horizontal_handle = Point(rounded/2, 0)
    let vertical_handle = Point(0, rounded/2)
    let horizontal_delta = Point(rounded, 0)
    let vertical_delta = Point(rounded, 0)

    let result = Bezier()

    // top right, going down
    bezier.add_vertex(Point(right, top) + vertical_delta)
    bezier.add_out_tangent(-vertical_handle)

    // bottom right
    bezier.add_vertex(Point(right, bottom) - vertical_delta)
    bezier.add_out_tangent(vertical_handle)

    bezier.add_vertex(Point(right, bottom) - horizontal_delta)
    bezier.add_out_tangent(horizontal_handle)

    // bottom left
    bezier.add_vertex(Point(left, bottom) + horizontal_delta)
    bezier.add_out_tangent(-horizontal_handle)

    bezier.add_vertex(Point(left, bottom) - vertical_delta)
    bezier.add_out_tangent(vertical_handle)

    // top left
    bezier.add_vertex(Point(left, top) + horizontal_delta)
    bezier.add_out_tangent(-horizontal_handle)

    bezier.add_vertex(Point(left, top) + vertical_delta)
    bezier.add_out_tangent(-vertical_handle)


    // back to top right
    bezier.add_vertex(Point(right, top) - horizontal_delta)
    bezier.add_in_tangent(horizontal_handle)


    return result
```


## PolyStar

Pseudocode for rendering a [PolyStar](shapes.md#polystar) (without roundness).

```typescript
function polystar(
    // Properties from lottie:
    p: Point,
    sy: number,
    pt: number,
    r: number,
    or: number,
    it: number
)
{
    let result = Bezier()
    result.close()

    let half_angle = PI / pt
    let angle_radians = r / 180 * PI

    for i in 0 ... pt-1
        let main_angle = -PI / 2 + angle_radians + i * half_angle * 2
        let vertex = Point(
            or * cos(main_angle),
            or * sin(main_angle)
        )
        result.add_vertex(p + vertex)

        // Star inner radius
        if sy == 1
            let inner_vertex = Point(
                ir * cos(main_angle + half_angle),
                ir * sin(main_angle + half_angle)
            )
            result.add_vertex(p + inner_vertex)

    return result
}

```

## Pucker Bloat

See [Pucker / Bloat](shapes.md#pucker-bloat).


```typescript
function pucker_bloat(
    // Beziers as collected from the other shapes
    collected_shapes: array[Bezier],
    // `a` property from the Pucker/Bloat modifier
    a: number
)
{
    // Normalize to [0, 1]
    let amount = a / 100;

    // Find the mean of the bezier vertices
    let center = Point()
    let number_of_vertices = 0
    for input_bezier in collected_shapes
        for vertex in input_bezier
            center += vertex
            number_of_vertices += 1
    center /= number_of_vertices

    let result = array[Bezier]

    for input_bezier in collected_shapes
        let output_bezier = Bezier()
        // Assumes `in_tangent` and `out_tangent` are relative to `vertex`
        // (this is the case in Lottie)
        for in_tangent, out_tangent, vertex in Bezier
            let output_vertex = lerp(vertex, center, amount)
            let output_in_tangent = lerp(in_tangent + vertex, center, -amount) - output_vertex
            let output_out_tangent = lerp(out_tangent + vertex, center, -amount) - output_vertex
            output_bezier.add_vertex(output_vertex)
            output_bezier.add_in_tangent(output_in_tangent)
            output_bezier.add_out_tangent(output_out_tangent)

        if input_bezier.is_closed
            output_bezier.close()

        result.add(output_bezier)

    return result
}
```

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
