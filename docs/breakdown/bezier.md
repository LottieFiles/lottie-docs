# Bezier Curves

{lottie:bezier_expression.json:512:512}


## Introduction to Beziers

Bezier curves are a common way of approximating arbitrary shapes in computer graphics.

They represent an arc of a polynomial, and they can be of any degree, but usually you will mostly find quadratic and cubic beziers.

Lottie only deals in cubic beziers so we'll focus on those.

A bezier curve of degree _n_ is defined by _n_+1 points.

The first and the last of such points will lay on the curve, while the others define the shape of the segment.

So for the case of a cubic bezier (degree 3) you have 4 points.

To find a point on a bezier, you usually define it as the result of an interpolation
within the polynomial curve. The interpolation factor is usually referred to as _t_.

The easiest way of calculating the poition of a point in a bezier given a _t_ is to
perform linear interpolations between the bezier points, each step reducing the
curve to one with a degree less than the previous, until you end up with a final point.

For example in the cubic case, you interpolate each cubic point with the next,
resulting in 3 quadratic points.

You repeat the process on these 3 points, and you end up with 2 other points.

Finally you perform linear interpolation between the two to get the result.


In the example below you can control the _t_ value to see how this algorithm works.
The black dots are the ones that define the bezier, and the red dot is the position
along the bezier at the given _t_.

{lottie_playground:bezier_expression.json:512:512}
t:slider:layers[0].ef[0].ef[0].v.k:0:0.5:1:0.1
:exec:lottie.layers[0].ef[0].ef[0].v.a = 0
:exec:lottie.layers[0].ef[0].ef[0].v.k = 0.5

### Poly Beziers

Usually shapes are defined as a polybezier, which is the a concept equivalent to
polygons, but with bezier segments as their edges.

Each bezier segment has its last point in the same position as the first point in the following segment.


This results in a sequence of points, some of which are along the line and some of which
are not.

For polybeziers with cubic segments, there are two points outside the path between each pair of points along the path.

For this reason instead of viewing the polybezier as a sequence of bezier segments,
they are often seen as a sequence of vertices and tangents.

The vertices are the points along the path, which correspond to the end points of the segments.

Each point has two tangents associated with them, one "in" thangent, and one "out" tangent.

The "out" tangent is the second point defining the bezier segment following the vertex
and the "in" tangent is the third point defining the bezier segment coming into the vertex.

## Beziers in Lottie

An shape in Lotttie is represented as a cubic polybezier and it's represented in the JSON
as an object with the following attributes:

`v` is an array of vertices.

`i` is an array of "in" tangent points, relative to `v`.

`o` is an array of "out" tangent points, relative to `v`.

`c` is a boolean determining whether the polybezier is closed.
If it is, there's an additional bezier segment between the last point in `v` and the first.
