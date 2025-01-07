# Values

This pages describes basic types and values throughout the lottie format.


<h2 id="int-boolean">Integer Boolean</h2>

In some places boolean values are shown as booleans in the JSON (`true`/`false`).
In other places they are shown as integers with `0` or `1` as values.

<h2 id="vector">Vector</h2>

Vector data is represented by an array of numbers.
This is used any time a property with multiple components is needed.

An example would be a position, which would be represented as an array
with two numbers, the first corresponding to the _X_ coordinate and the
second corresponding to the _Y_.

<h2 id="color">Color</h2>

Colors are [Vectors](#vector) with values between 0 and 1 for the RGB components.

For example:

* {lottie_color:1, 0, 0}
* {lottie_color:1, 0.5, 0}

Note: sometimes you might find color values with 4 components (the 4th being alpha)
but most players ignore the last component.

<h2 id="hexcolor">Hex Color</h2>
Colors represented as a "#"-prefixed string, with two hexadecimal digits per
RGB component.

* {lottie_hexcolor: #FF8000}


<h2 id="gradient">Gradient</h2>

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

{lottie_gradient:0, 0.16, 0.18, 0.46, 0.5, 0.2, 0.31, 0.69, 1, 0.77, 0.85, 0.96}

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

{lottie_gradient_alpha:0, 0.16, 0.18, 0.46, 0.5, 0.2, 0.31, 0.69, 1, 0.77, 0.85, 0.96, 0, 0.8, 0.5, 0.2, 1, 1}

It's the same array as the case without transparency but with the following values added at the end:


| Value     | Description |
|-----------|---|
| `0`       | Offset of the 1st color (`0` means at the start) |
| `0.8`     | Alpha component for the 1st color |
| `0.5`     | Offset of the 2nd color (`0.5` means half way) |
| `1`       | Alpha component for the 2nd color |
| `1`       | Offset of the 3rd color (`1` means at the end) |
| `1`       | Alpha component for the 3rd color |

### Gradient Example

{editor_example:gradient}


<h2 id="bezier">Bezier Shape</h2>

This represents a cubic bezier path.

Note that for interpolation to work correctly all bezier values in a property's keyframe must have the same number of points.

{schema_object:values/bezier}

`i` and `o` are relative to `v`.

The <em>n</em>th bezier segment is defined as:

```
v[n], v[n]+o[n], v[n+1]+i[n+1], v[n+1]
```

If the bezier is closed, you need an extra segment going from the last point to the first, still following `i` and `o` appropriately.

If you want linear bezier, you can have `i` and `o` for a segment to be `[0, 0]`.
If you want it quadratic, set them to 2/3rd of what the quadratic control point would be.

If you want a point to be smooth you need to make sure that `i = -o`.

{editor_example:bezier}

<h2 id="data-url">Data URL</h2>

Data URLs are embedded files (such as images) as defined in [RFC2397].
