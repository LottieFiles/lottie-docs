# General concepts

This page describes values and other objects used throughout the lottie format


## Booleans

In some places boolean values are shown as booleans in the JSON (`true`/`false`).
In other places they are shown as integers with `0` or `1` as values.

## Colors

Colors are represented as arrays with values between 0 and 1 for the RGB components.

for example:

* {lottie_color:1, 0, 0}
* {lottie_color:1, 0.5, 0}

Note sometimes you might find color values with 4 components (the 4th being alpha)
but most player ignore the last component.

## Gradients

Gradients are represented as a flat array, showing offsets and RGB components.

There are two possible representations, with alpha, and without.

### Gradients without transparency

The array is a sequence of `offset`, `red`, `green`, `blue` components for each
color. all values are between 0 and 1

So let's say you want these colors:

* {lottie_color_255:41, 47, 117}
* {lottie_color_255:50, 80, 176}
* {lottie_color_255:196, 217, 245}

the array will look like the following:

`[0, 0.161, 0.184, 0.459, 0.5, 0.196, 0.314, 0.69, 1, 0.769, 0.851, 0.961]`

| Value     | Description |
|-----------|---|
| `0`       | Offset of the 1st color (`0` means at the start) |
| `0.161`   | Red component for the 1st color |
| `0.184`   | Green component for the 1st color |
| `0.459`   | Blue component for the 1st color |
| `0.5`     | Offset of the 2nd color (`0.5` means half way) |
| `0.196`   | Red component for the 2nd color |
| `0.314`   | Green component for the 2nd color |
| `0.69`    | Blue component for the 2nd color |
| `1`       | Offset of the 3rd color (`1` means at the end) |
| `0.769`   | Red component for the 3rd color |
| `0.851`   | Green component for the 3rd color |
| `0.961`   | Blue component for the 3rd color |

### Gradients with transparency

Alpha is added at the end, repeating offsets and followed by alpha for each colors

So assume the same colors as before, but opacity of 80% for the first color and 100% for the other two.

The array will look like this:

`[0, 0.161, 0.184, 0.459, 0.5, 0.196, 0.314, 0.69, 1, 0.769, 0.851, 0.961, 0, 0.8, 0.5, 1, 1, 1]`

It's the same array as the case without transparency but with the following values added at the end:


| Value     | Description |
|-----------|---|
| `0`       | Offset of the 1st color (`0` means at the start) |
| `0.8`     | Alpha component for the 1st color |
| `0.5`     | Offset of the 2nd color (`0.5` means half way) |
| `1`       | Alpha component for the 2nd color |
| `1`       | Offset of the 3rd color (`1` means at the end) |
| `1`       | Alpha component for the 3rd color |


## Lists of layers and shapes

Such lists appear Precomposition, Animation, ShapeLayer, and Grop.

In such lists, items coming first will be rendered on top

So if you have for example: `[Ellipse, Rectangle]`

The ellipse will show on top of the rectangle:

{lottie:layer_order.json:512:512}

This means the render order goes from the last element to the first.


## Visual Object

Most visual objects share these attributes:


|Attribute|Type|Description|
|---------|----|-----------|
|`nm`   |`string`|Name, usually what you see in an editor for layer names, etc.|
|`mn`   |`string`|"Match Name", used in expressions|

## Animated Property

Animated properties have two attributes


|Attribute|Type|Description|
|---------|----|-----------|
|`a`|[0-1 `int`](#booleans)|Whether the property is animated. Note some old animations might not have this|
|`k`||Value or keyframes, this changes based on the value of `a`|

If `a` is `0`, then `k` just has the value of the property.

If `a` is `1`, `k` will be an array of keyframes.

### Keyframe


|Attribute|Type|Description|
|---------|----|-----------|
|`t`    |`number`|Keyframe time (in frames)|
|`s`    |Depends on the property|Value, note that sometimes properties for scalar values have the value is wrapped in an array|
|`i`,`o`|[Easing Handle](#easing-handles)|
|`h`    |[0-1 `int`](#booleans)|Whether it's a hold frame|

If `h` is present and it's 1, you don't need `i` and `o`, as the property will keep the same value
until the next keyframe.


#### Easing Handles

They are objects with `x` and `y` attributes, which are numbers within 0 and 1.
You might see these values wrapped around arrays.

They represent a cubic bezier, starting at `[0,0]` and ending at `[1,1]` where
the value determines the easing function.

The `x` axis represents time, a value of 0 is the time of the current keyframe,
a value of 1 is the time of the next keyframe.

The `y` axis represents the value interpolation factor, a value of 0
represents the value at the current keyframe, a value of 1 represents the
value at the next keyframe.

When you use easing you have two easing handles for the keyframe:

`o` is the "out" handle, and is the first one in the bezier, determines the curve
as it exits the current keyframe.


`i` is the "in" handle, and it's the second one in the bezier, determines the curve
as it enters the next keyframe.


For linear interpolation you'd have

```json
{
    "o": {"x": [0], "y": [0]},
    "i": {"x": [1], "y": [1]}
}
```

For easing in and out, you move the `x` towards the center, this makes the animation more fluid:

```json
{
    "o": {"x": [0.333], "y": [0]},
    "i": {"x": [0.667], "y": [1]}
}
```

#### Old Lottie Keyframes

Old lotties have an additional attribute for keyframes, `e` which works
similarly to `s` but represents the value at the end of the keyframe.

They also have a final keyframe with only the `t` attribute and you
need to determine its value based on the `s` value of the previous keyframe.

#### Easing example

In the following example, the ball moves left and right, on the background
you can see a representation of its easing function.


{lottie_playground:easing.json:512:512}
Out tangent x:slider:assets[0].layers[1].shapes[0].ks.k.o[1][0]   ,assets[0].layers[1].shapes[0].ks.k.v[0][0],assets[0].layers[0].shapes[0].p.k[0],layers[0].ks.p.k[0].o.x[0],layers[0].ks.p.k[1].o.x[0]:0:0.33:1:0.01
Out tangent y:slider:assets[0].layers[1].shapes[0].ks.k.o[1][1]   ,assets[0].layers[1].shapes[0].ks.k.v[0][1],assets[0].layers[0].shapes[0].p.k[1],layers[0].ks.p.k[0].o.y[0],layers[0].ks.p.k[1].o.y[0]:0:0:1:0.01
In tangent x :slider:assets[0].layers[1].shapes[0].ks.k.i[2][0]!-1,assets[0].layers[1].shapes[0].ks.k.v[3][0],assets[0].layers[0].shapes[1].p.k[0],layers[0].ks.p.k[0].i.x[0],layers[0].ks.p.k[1].i.x[0]:0:0.67:1:0.01
In tangent y :slider:assets[0].layers[1].shapes[0].ks.k.i[2][1]!-1,assets[0].layers[1].shapes[0].ks.k.v[3][1],assets[0].layers[0].shapes[1].p.k[1],layers[0].ks.p.k[0].i.y[0],layers[0].ks.p.k[1].i.y[0]:0:1:1:0.01
Hold:select:layers[0].ks.p.k[0].h,layers[0].ks.p.k[1].h:No=0:Yes=1
:json:layers[0].ks.p

## Transform

This represents a layer or shape transform.

It has the properties from [Visual Object](#visual-object) and its own properties are all [animated](#animated-property):


|Attribute|Type|Name|Description|
|---------|----|----|-----------|
|`a`    |2D Vector|Anchor point |Position (relative to its parent) around which transformations are applied (ie: center for rotation / scale)|
|`p`    |2D Vector|Position     |Position / Translation|
|`s`    |2D Vector|Scale        |Scale factor, `100` for no scaling|
|`r`    |`number` |Rotation     |Rotation in degrees, clockwise|
|`sk`   |`number` |Skew         |Skew amount as an angle in degrees|
|`sa`   |`number` |Skew Axis    |Direction at which skew is applied, in degrees (`0` skews along the X axis, `90` along the Y axis)|
|`o`    |`number` |Opacity      |Opacity, `100` for fully opaque|

Sometimes `p` might be replaced by its individual components (`px` and `py`) animated independently.

To make the anchor point properly line up with the center of location, `p` and `a` should have the same value.


This example allows you to tweak transform attributes and see how the shape changes.

The anchor point is highlighted with an orange dot.

{lottie_playground:transform.json:512:512}
Anchor X:slider:layers[0].ks.p.k[0],layers[1].ks.a.k[0]:0:256:512
Anchor Y:slider:layers[0].ks.p.k[1],layers[1].ks.a.k[1]:0:256:512
Position X:slider:layers[1].ks.p.k[0]:0:256:512
Position Y:slider:layers[1].ks.p.k[1]:0:256:512
Scale X:slider:layers[1].ks.s.k[0]:0:100:200
Scale Y:slider:layers[1].ks.s.k[1]:0:100:200
Rotation:slider:layers[1].ks.r.k:0:0:360
Skew:slider:layers[1].ks.sk.k:0:0:360
Skew Angle:slider:layers[1].ks.sa.k:0:0:360
Opacity:slider:layers[1].ks.o.k:0:100:100
:json:layers[1].ks


### Converting to matrix

Assuming the matrix

{matrix}
a   c   0   0
b   d   0   0
0   0   1   0
tx  ty  0   1

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

## Bezier

This represents a cubic bezier path.

Note that for interpolation to work correctly all bezier values in a property's keyframe must have the same number of points.


|Attribute|Type|Name|Description|
|---------|----|----|-----------|
|`c`    |[0-1 `int`](#booleans)|Closed|Whether the bezier forms a closed loop|
|`v`    |array of 2D Vector|Vertices|Points along the curve|
|`i`    |array of 2D Vector|In Tangents|Cubic control points, incoming tangent|
|`o`    |array of 2D Vector|Out Tangents|Cubic control points, outgoing tangent|

`i` and `o` are relative to `v`.

The <em>n</em>th bezier segment is defined as:

```
v[n], v[n]+o[n], v[n+1]+i[n+1], v[n+1]
```

If the bezier is closed, you need an extra segment going from the last point to the first, still following `i` and `o` appropriately.

If you want linear bezier, you can have `i` and `o` for a segment to be `[0, 0]`.
If you want it quadratic, set them to 2/3rd of what the quadratic control point would be.

If you want a point to be smooth you need to make sure that `i = -o`.


{lottie_playground:bezier.json:512:512}
Closed:select:layers[0].shapes[0].ks.k.c:Open=false:Closed=true
Point 0:label:
Vertex X     :slider:layers[0].shapes[0].ks.k.v[0][0],assets[0].layers[0].ks.p.k[0]:0:53:512
Vertex Y     :slider:layers[0].shapes[0].ks.k.v[0][1],assets[0].layers[0].ks.p.k[1]:0:325:512
In Tangent X :slider:layers[0].shapes[0].ks.k.i[0][0],assets[0].layers[0].shapes[0].ks.k.v[0][0]:-512:0:512
In Tangent Y :slider:layers[0].shapes[0].ks.k.i[0][1],assets[0].layers[0].shapes[0].ks.k.v[0][1]:-512:0:512
Out Tangent X:slider:layers[0].shapes[0].ks.k.o[0][0],assets[0].layers[0].shapes[0].ks.k.v[2][0]:-512:89:512
Out Tangent Y:slider:layers[0].shapes[0].ks.k.o[0][1],assets[0].layers[0].shapes[0].ks.k.v[2][1]:-512:-189:512
Point 1:label:
Vertex X     :slider:layers[0].shapes[0].ks.k.v[1][0],assets[1].layers[0].ks.p.k[0]:0:429:512
Vertex Y     :slider:layers[0].shapes[0].ks.k.v[1][1],assets[1].layers[0].ks.p.k[1]:0:147:512
In Tangent X :slider:layers[0].shapes[0].ks.k.i[1][0],assets[1].layers[0].shapes[0].ks.k.v[0][0]:-512:-147:512
In Tangent Y :slider:layers[0].shapes[0].ks.k.i[1][1],assets[1].layers[0].shapes[0].ks.k.v[0][1]:-512:186:512
Out Tangent X:slider:layers[0].shapes[0].ks.k.o[1][0],assets[1].layers[0].shapes[0].ks.k.v[2][0]:-512:40:512
Out Tangent Y:slider:layers[0].shapes[0].ks.k.o[1][1],assets[1].layers[0].shapes[0].ks.k.v[2][1]:-512:189:512
Point 2:label:
Vertex X     :slider:layers[0].shapes[0].ks.k.v[2][0],assets[2].layers[0].ks.p.k[0]:0:215:512
Vertex Y     :slider:layers[0].shapes[0].ks.k.v[2][1],assets[2].layers[0].ks.p.k[1]:0:430:512
In Tangent X :slider:layers[0].shapes[0].ks.k.i[2][0],assets[2].layers[0].shapes[0].ks.k.v[0][0]:-512:114:512
In Tangent Y :slider:layers[0].shapes[0].ks.k.i[2][1],assets[2].layers[0].shapes[0].ks.k.v[0][1]:-512:36:512
Out Tangent X:slider:layers[0].shapes[0].ks.k.o[2][0],assets[2].layers[0].shapes[0].ks.k.v[2][0]:-512:-114:512
Out Tangent Y:slider:layers[0].shapes[0].ks.k.o[2][1],assets[2].layers[0].shapes[0].ks.k.v[2][1]:-512:-16:512
:json:layers[0].shapes[0].ks.k
