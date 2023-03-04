# Parsing AEP Files

AfterEffects Project files are the proprietary file format used by Adobe AfterEffects.

It's a binary format based on the RIFX container format.

The structure resembles that of a Lottie JSON exported from AE.

You can perform the parsing in 3 steps:

1. Parse the RIFX chunks into a tree structure
2. Unpac the chunk data into more useful representations
3. Traverse that tree to map find the relevant objects and properties

Step 1 is fairly straightforward, RIFX is fairly easy to parse. <br/>
Step 2 is the hard part as there's nor real documentation on how the data is laid out. <br/>
Step 3 should be rather easy as now you basically only need to do the
same as the bodymovin plugin to convert the strucured AE data into lottie.


RIFX
----

RIFX is an extension of the RIFF format, the difference being RIFX uses big-endian
notation for storing numbers.

A RIFF/RIFX is composed of "chunks" with the following format


|Field |Size|Description                                    |
|------|----|-----------------------------------------------|
|Header|  4 | ASCII name describing the type of the chunk   |
|Size  |  4 | `uint32` size of the data section             |
|Data  |Size| Data within the chunk                         |


Basic Types
-----------

|Type     |Size|Description|
|---------|----|-----------|
|`id`     | 4 | ASCII-encoded chunk identifier  |
|`uint32` | 4 | Unsigned integer                |
|`uint16` | 2 | Unsigned integer                |
|`float32`| 4 | IEEE float                      |
|`float64`| 8 | IEEE float                      |
|`string` | * | Text, usually utf-8 encoded     |
|`string0`| * | NUL terminated string           |
|`bytes`  | * | Unformatted / unknown data      |


### Time

Time values are stored as `uint16`. they are scaled by a factor you can find in `cdata`.

To get the actual value in frames you need to do the following:

```
frames = time_value / time_scale
```

### Flags

Flags is byte data, that will be specified using two integers: byte and bit index.

You'll get the value of the flag you'll need to do the following:

```
flag = (flags[byte] & (1 << bit)) != 0
```

Chunks
------

Note that chunks might have extra data after what is described here,
always parse exactly as many bytes as specified in the chunk header.

### Top Level

You can think of the file itself as a chunk containing sub-chunks
as it too starts with the same format.

The header is `RIFF` or `RIFX`. `RIFF` uses little-endian notation
and `RIFX` uses big-endian notation.

Note that AEP files should always be `RIFX`.

Note that how you interpret the size of chunks changes depending on the endianness.

Follows a `uint32` size as usual.

The data starts with an `id` specifying the file format. In the case of AEP
this has the value `Egg!`.

Then follows a list of chunks.

### `LIST`

This chunk is defined by the RIFF specs, its data has the following format:

Starts with an `id`, specifying the type of the list, then followed by sub-chunks.

The format of specific `LIST` types are described later in this document.

### `Utf8`

Contains utf-8 encoded text. Sometimes it contains the string `-_0_/-` which (I guess)
is used as a placeholder for objects lacking a name.

### `tdsn`

Contains a `Utf8` chunk, used for object names

### `tdmn`

Contains a NUL-terminated string (You'll need to strip excess `\0`) and defines a Match Name.

### `cdta`

Composition data.

|Field Name         |Size|  Type  | Description             |
|-------------------|----|--------|-------------------------|
|                   | 5  |        |                         |
| Time Scale        | 2  |`uint16`| How much Time values are scaled by |
|                   | 14 |        |                         |
| Playhead          | 2  |  Time  | Playhead time           |
|                   | 6  |        |                         |
| Start Time        | 2  |  Time  | Same as `ip` in Lottie  |
|                   | 6  |        |                         |
| End Time          | 2  |  Time  | Same as `op` in Lottie  |
|                   | 6  |        |                         |
| Comp duration     | 2  |  Time  | Duration setting in AE  |
|                   | 5  |        |                         |
| Color             | 3  |`bytes` | Color as 24 bit RGB     |
|                   | 85 |        |                         |
| Width             | 2  |`uint16`| Same as `w` in Lottie   |
| Height            | 2  |`uint16`| Same as `h` in Lottie   |
|                   | 12 |        |                         |
| Framerate         | 2  |`uint16`| Same as `fr` in Lottie  |


Note that End Time might have a value of FFFF, if that's the case assume it to be the same as Comp Duration.

### `ldta`

Layer data.

|Field Name         |Size|   Type   | Description |
|-------------------|----|----------|-------------|
|                   | 5  |          | |
| Quality           | 2  | `uint16` | |
|                   | 15 |          | |
| Start Time        | 2  | Time     | Same as `ip` in Lottie |
|                   | 6  |          | |
| End Time          | 2  | Time     | Same as `op` in Lottie |
|                   | 6  |          | |
| Attributes        | 3  | Flags    | |
| Source ID         | 4  | `uint32` | |
|                   | 20 |          | |
| Layer Name        | *  | `string0`| It's repeated in the `Utf8` chunk right after |

With the following Attributes:

* _Threedimensional_: (1, 2)
* _Effects_: (2, 2)
* _Motion Blur_: (2, 3)
* _Locked_: (2, 5)

### `idta`

Item data.


|Field Name         |Size|   Type   | Description |
|-------------------|----|----------|-------------|
| Type              | 2  | `uint16` | |
|                   | 14 |          | |
| ID                | 4  | `uint32` | |

The Type field above can have the following values:

* `1`: Folder
* `4`: Composition
* `7`: Footage

### `tbd4`

Property metadata.

|Field Name         |Size|   Type   | Description |
|-------------------|----|----------|-------------|
|                   | 3  |          | |
| Components        | 1  | `uint8`  |Number of values in a multi-dimensional|
| Attributes        | 2  | Flags    | |

Flags:

* _Position_: (1, 3). When `true`, this is a position property, which changes how animated values are parsed.
* _Static_: (1, 0). When `false`, the property is animated and it will have a `cdat`.

### `cdat`

Property static value.

For multi-dimensional properties, you look at the number of components in `tbd4`
and parse that many `float64`, that's the value of the property.

### `shph`

Header for bezier shape data, contained within `LIST` `shap`.

It's followed by a `LIST` `list` with bezier data.

|Field Name         |Size| Type     | Description       |
|-------------------|----|----------|-------------------|
|                   | 3  |          |                   |
| Attributes        | 1  | Flags    |                   |
| Top Left          | 2  | `float32`| Top-left corner of the shape area, relative to the layer position     |
| Bottom Right      | 2  | `float32`| Bottom-right corner of the shape area, relative to the layer position |
|                   | 4  |          |                   |

Flags:

* _Open_: (0, 3). When `true`, the shape is open (it's missing the segment connecting the last point to the first)


### `lhd3`

Inside a `LIST` `list`, defines the data format, followed by `ldat`.

|Field Name         |Size| Type     | Description       |
|-------------------|----|----------|-------------------|
|                   | 10 |          |                   |
| Count             | 2  | `uint16` | Number of items   |


### `ldat`

Inside a `LIST` `list`, contains the list data, preceded by `lhd3`.

The number of element is the one defined in `lhd3`.

It has a different format based on certain conditions, follow some of the possible element formats.

The size of an item is found like so:

```
item_size = ldat_chunk_length / lhd3_count
```

#### Keyframe (common)

All keyframe items start like this:

|Field Name         |Size|   Type       | Description |
|-------------------|----|--------------|-------------|
|                   | 1  |              | |
| Time              | 2  | Time         | Time of the keyframe, seems they always start from 0. |
|                   | 5  |              | |

#### Keyframe - Multi-Dimensional

Given `n` as the number of dimensions found in `tdb4` (eg: 3 for 3D positions):

|Field Name         |Size|   Type       | Description |
|-------------------|----|--------------|-------------|
| Value             |8* n|`float64[n]`  | Value |
|                   |8* n|`float64[n]`  | |
|                   |8* n|`float64[n]`  | |
|                   |8* n|`float64[n]`  | |

#### Keyframe - Position

If the property is an animated position, the keyframe is formatted like so:

|Field Name         |Size|   Type       | Description |
|-------------------|----|--------------|-------------|
|                   |8*6 |`float64[6]`  | |
| Value             |8* n|`float64[n]`  |Value |
| Tan In            |8* n|`float64[n]`  |Spatial tangents|
| Tan Out           |8* n|`float64[n]`  |Spatial tangents|

#### Keyframe - Gradient


|Field Name         |Size|   Type       | Description |
|-------------------|----|--------------|-------------|
|                   |8*6 |`float64[6]`  | |
|                   | 8  |              | |

#### Shape Data

Bezier data, positions are relative to the area defined by `shph`.

Note that `lhd3` will specify the number of coordinates, so you need to group them by 3.

Note that the items here are defines as bezier segments, all coordinates are relative
to the area in `shph` but not to each other.

A coordinate of \[0, 0\] will correspond to the top-left corner in `shph`,
and \[1, 1\] corresponds to the bottom-right.

Take care that the in tangent is the tangent entering the next point in
the curve, not the vertex defined by this item.


|Field Name         |Size|   Type       | Description |
|-------------------|----|--------------|-------------|
| Vertex            |2*4 |`float32[2]`  | Coordinates of the vertex                             |
| Out Tangent       |2*4 |`float32[2]`  | Coordinates of the tangent leaving the vertex         |
| In Tangent        |2*4 |`float32[2]`  | Coordinates of the tangent entering the next vertex   |


### `tdsb`

|Field Name         |Size|   Type   | Description |
|-------------------|----|----------|-------------|
| Attributes        | 4  | Flags    | |

Attributes:

* _Hidden_: (3, 0)

### `pprf`

Color profile information as ICC data.

### `wsnm`

Utf-16 encoded string, referring to the screen layout?

It's always followed by an `Utf8` with the same content.

### `tdum` / `tduM`

`float64` values often found inside `LIST` `tdbs`.

In some cases they seem to indicate minimum and maximum values for that
property but there are some cases in which they are both `0.0`.

### `LIST` `Fold`

Top level item.

### `LIST` `Item`

Item, you can check its properties with `idta` contained inside it.

### `LIST` `Layr`

Defines a shape layer.

Layer metadata is found in a `ldta`, the layer name is in a `Utf8`.

Go through its `LIST` `tdgp` to get shapes and transforms.

You will find the following match names within it:

* `ADBE Root Vectors Group`: Contains shape data
* `ADBE Transform Group`: Layer transform
* `ADBE Layer Styles`: Layer styles

### `LIST` `tdgp`

Defines a list of an object. To know what type of object, you need to check
the `tdmn` preceding this chunk.

The name of the object is in `tdsn` > `Utf8`.

Then follows a sequence of properties / objects defined as such:

`tdmn` specifies the match name of the object, then it's followed by
chunks that describe said object (usually more `LIST`s).

Usually the last chunk here is a `tdmn` with value `ADBE Group End`.

### `LIST` `tdbs`

Defines an object's property. To know which property, you need to
check the `tdmn` preceding this chunk.

It will contain a `tbd4`, and usually `cdat` (static) or a `List` `list` (animated).

For properties with expressions, it will have a `Utf8` with the expression code.

### `LIST` `GCst`

Defines a gradient.

Contains a `LIST` `tdbs` and a `LIST` `GCky`.

### `LIST` `GCky`

Gradient data.

Contains a sequence of `Utf8` formatted in XML with the gradient definition
for each keyframe.

### `LIST` `om-s`

Contains a `LIST` `tbds` and a `LIST` `omks` to define a shape property.

### `LIST` `omks`

Bezier shape data.

Contains a sequence of `LIST` `shap` with the shape data for each keyframe.

### `LIST` `shap`

Contains a `shph` and a `LIST` `list` with the shape data.

### `LIST` `CPPl`

Contains a `pprf`.

### `LIST` `list`

For animated properties it replaces `cdat`.

The list header is defined in the chunk `lhd3`, the list data in `ldat`.

### `LIST` `SLay`

Some kind of layer not rendered to lottie.

They contain `ADBE Camera Options Group` with a property called `ADBE Camera Zoom`.


AfterEffects Logic
------------------

### Main Composition

Search for `LIST` `Fold`, then iterate through it to look for a `LIST` `Item`
with `idta` type of `4`.

The name of the composition is in the first `Utf8` chunk.

Its properties are in `cdta`.

Then look for `LIST` `Layr` to parse layers.

### Objects

Most objects are introduced by their match name (`tdmn`),
followed by a `LIST` `tdgp` that defines the properties and sub-objects.

Inside the `LIST` `tdgp` you can find more match names defining which
property or the type of sub-object you are defining.


### Properties

Properties, like objects are introduced by their match name, the chunks
following that depends on the type of property.

#### MultiDimensional

* `tdmn`: Match Name
* `LIST` `tbds`: Property definition
    * `tdb4`: Tells you how many components the property has and whether it's animated
    * `cdat`: Value (if not animated)
    * `LIST` `list`: Keyframes (if animated)
        * `lhd3`: Tells you the number of keyframes
        * `ldat`: Keyframe data and values

#### Shape

* `tdmn`: Match Name (`ADBE Vector Shape`)
* `LIST` `om-s`
    * `LIST` `tbds`: Property definition
        * `tbd4`: Metadata
        * `LIST` `list`: Present if the shape is animated
            * `lhd3`: Keyframe list metadata
            * `ldat`: Keyframe data without values
    * `LIST` `omks`: Shape Values
        * `LIST` `shap`: Bezier Data
            * `shph`: Bezier metadata (whether it's closed and bounding box)
            * `LIST` `list`
                * `lhd3`: Bezier point list metadata
                * `ldat`: Bezier points relative to `shph`

If the property is animated, there will be multiple `LIST` `shap`, one
per keyframe.


#### Gradient Colors

* `tdmn`: Match Name (`ADBE Vector Grad Colors`)
* `LIST` `GCst`
    * `LIST` `tbds`: Property definition
        * `tbd4`: Metadata
        * `LIST` `list`: Present if the shape is animated
            * `lhd3`: Keyframe list metadata
            * `ldat`: Keyframe data without values
    * `LIST` `GCky`
        * `Utf8` [Gradient XML](#gradient-xml)


If the property is animated, there will be multiple `Utf8`, one
per keyframe.


Match Names
-----------

Follows a list of known match names grouped by object type.

For properties that specify a default value, you should assume they have the specified value if they are not present in the
AEP file.

### Layers

{aep_mn}
ADBE Root Vectors Group : `shapes`
ADBE Layer Styles : `styles`
ADBE Transform Group : `ks`
ADBE Layer Styles : `sy`
ADBE Extrsn Options Group :
ADBE Material Options Group :
ADBE Audio Group :
ADBE Layer Sets :


### Shapes

{aep_mn}
ADBE Vector Group : object=shapes/group
ADBE Vectors Group : prop=it
ADBE Vector Transform Group : Transform
ADBE Vector Materials Group :

{aep_mn}
ADBE Vector Shape - Rect : object=shapes/rectangle
ADBE Vector Shape Direction : prop=d [^enum]
ADBE Vector Rect Position : prop=p
ADBE Vector Rect Size : prop=s
ADBE Vector Rect Roundness : prop=r

{aep_mn}
ADBE Vector Shape - Ellipse : object=shapes/ellipse
ADBE Vector Shape Direction : prop=d [^enum]
ADBE Vector Ellipse Position : prop=p
ADBE Vector Ellipse Size : prop=s

{aep_mn}
ADBE Vector Shape - Ellipse : object=shapes/ellipse
ADBE Vector Shape Direction : prop=d [^enum]
ADBE Vector Ellipse Position : prop=p
ADBE Vector Ellipse Size : prop=s

{aep_mn}
ADBE Vector Shape - Star : object=shapes/polystar
ADBE Vector Shape Direction : prop=d [^enum]
ADBE Vector Star Type : prop=sy [^enum]
ADBE Vector Star Points : prop=pt [^int]
ADBE Vector Star Position : prop=p
ADBE Vector Star Rotation : prop=r
ADBE Vector Star Inner Radius : prop=ir
ADBE Vector Star Outer Radius : prop=or
ADBE Vector Star Inner Roundess : prop=is
ADBE Vector Star Outer Roundess : prop=os

{aep_mn}
ADBE Vector Shape - Group : object=shapes/path
ADBE Vector Shape Direction : prop=d [^enum]
ADBE Vector Shape : prop=ks [^shape]

### Shape Styles

{aep_mn}
ADBE Vector Graphic - Fill : object=shapes/fill
ADBE Vector Fill Color : prop=c [^color] : \[255, 255, 0, 0\]

{aep_mn}
ADBE Vector Graphic - Stroke : object=shapes/stroke
ADBE Vector Stroke Color : prop=c [^color] : \[255, 0, 0, \]
ADBE Vector Stroke Width : prop=w : 2
ADBE Vector Stroke Line Cap : prop=lc [^enum]
ADBE Vector Stroke Line Join : prop=lj [^enum]
ADBE Vector Stroke Miter Limit : prop=ml2
ADBE Vector Stroke Dashes : prop=d
ADBE Vector Stroke Taper :
ADBE Vector Stroke Wave :

{aep_mn}
ADBE Vector Graphic - G-Fill : object=shapes/gradient-fill
ADBE Vector Grad Start Pt : prop=s
ADBE Vector Grad End Pt : prop=e
ADBE Vector Grad HiLite Length : prop=h
ADBE Vector Grad HiLite Angle : prop=a
ADBE Vector Grad Colors : prop=g [^gradient]

{aep_mn}
ADBE Vector Graphic - G-Stroke : object=shapes/gradient-stroke
ADBE Vector Grad Start Pt : prop=s
ADBE Vector Grad End Pt : prop=e
ADBE Vector Grad HiLite Length : prop=h
ADBE Vector Grad HiLite Angle : prop=a
ADBE Vector Grad Colors : prop=g [^gradient]
ADBE Vector Stroke Width : prop=w
ADBE Vector Stroke Line Cap : prop=lc [^enum]
ADBE Vector Stroke Line Join : prop=lj [^enum]
ADBE Vector Stroke Miter Limit : prop=ml2
ADBE Vector Stroke Dashes : prop=d
ADBE Vector Stroke Taper :
ADBE Vector Stroke Wave :

### Shape Modifiers

{aep_mn}
ADBE Vector Filter - Merge : object=shapes/merge
ADBE Vector Merge Type : prop=mm

{aep_mn}
ADBE Vector Filter - Offset : object=shapes/offset-path
ADBE Vector Offset Amount : prop=a
ADBE Vector Offset Line Join : prop=lj [^enum]
ADBE Vector Offset Miter Limit : prop=ml

{aep_mn}
ADBE Vector Filter - PB : object=shapes/pucker-bloat
ADBE Vector PuckerBloat Amount : prop=a

{aep_mn}
ADBE Vector Filter - Repeater : object=shapes/repeater
ADBE Vector Repeater Transform : prop=tr
ADBE Vector Repeater Copies : prop=c [^int]
ADBE Vector Repeater Offset : prop=o
ADBE Vector Repeater Order : prop=m [^enum]

{aep_mn}
ADBE Vector Filter - RC : object=shapes/rounded-corners
ADBE Vector RoundCorner Radius : prop=r

{aep_mn}
ADBE Vector Filter - Trim : object=shapes/trim
ADBE Vector Trim Start : prop=s
ADBE Vector Trim End : prop=e
ADBE Vector Trim Offset : prop=o

{aep_mn}
ADBE Vector Filter - Twist : object=shapes/twist
ADBE Vector Twist Angle : prop=a
ADBE Vector Twist Center : prop=c

{aep_mn}
ADBE Vector Filter - Roughen :
ADBE Vector Roughen Size :
ADBE Vector Roughen Detail :
ADBE Vector Roughen Points :
ADBE Vector Temporal Freq :
ADBE Vector Correlation :
ADBE Vector Temporal Phase :
ADBE Vector Spatial Phase :
ADBE Vector Random Seed :

{aep_mn}
ADBE Vector Filter - Wiggler :
ADBE Vector Xform Temporal Freq :
ADBE Vector Correlation :
ADBE Vector Temporal Phase :
ADBE Vector Spatial Phase :
ADBE Vector Random Seed :
ADBE Vector Wiggler Transform :

{aep_mn}
ADBE Vector Filter - Zigzag : object=shapes/zig-zag
ADBE Vector Zigzag Size : prop=s
ADBE Vector Zigzag Detail : prop=r
ADBE Vector Zigzag Points : prop=pt [^int]

### Transforms

{aep_mn}
ADBE Transform Group : object=helpers/transform
ADBE Anchor Point: prop=a : \[0, 0\]
ADBE Position: prop=p : Half of the comp size
ADBE Position_0: Split position X
ADBE Position_1: Split position Y
ADBE Position_2: Split position Z
ADBE Scale: prop=s [^100] : \[1, 1\]
ADBE Orientation: Single float
ADBE Rotate X: prop=rx
ADBE Rotate Y: prop=ry
ADBE Rotate Z: prop=rz or just normal rotation : 0
ADBE Opacity: prop=o [^100] : 1

{aep_mn}
ADBE Vector Transform Group : object=shapes/transform
ADBE Vector Anchor Point: prop=a
ADBE Vector Position: prop=p
ADBE Vector Scale: prop=s [^100]
ADBE Vector Rotate X: prop=rx
ADBE Vector Rotate Y: prop=ry
ADBE Vector Rotate Z: prop=rz or just normal rotation

### Misc

{aep_mn}
ADBE Group End : Indicates the end of a `LIST` `tdgp`

<!--
to verify:
ADBE Vector Blend Mode (group, fill, stroke)
ADBE Vector Composite Order (fill, stroke)
ADBE Vector Fill Rule
ADBE Vector Fill Opacity
ADBE Vector Stroke Opacity
ADBE Vector Grad Type
ADBE Vector Offset Copies (offset path)
ADBE Vector Offset Copy Offset (offset path)
ADBE Vector Trim Type
ADBE Vector Opacity (group transform)
-->

### Notes

[^enum]: Enumerations needs to be converted from floats, but the values match
[^int]: Needs to be converted from `float` to `int`.
[^shape]: How to parse this?
[^color]: Colors are defined as 4 floats (ARGB) in \[0, 255\].
[^gradient]: Colors defined as [XML](#gradient-xml).
[^100]: You need to multiply by 100 to get the lottie value.

///Footnotes Go Here///


Gradient XML
------------

Gradient data seems to be stored in a convoluted XML structure.

The easiest way to describe it is as a mapping, the elements can be parsed like so:

|Tag Name   |Logical Type   |Description|
|-----------|---------------|-----------|
|`prop.map` |               |Top-level, just get its first child|
|`prop.list`|`dict`         |Mapping of key-value pairs|
|`prop.pair`|               |Item in `prop.list`|
|`key`      |`str`          |Property key|
|`array`    |`list`         |Array of values, the first item is `array.type` which specifies the type|
|`int`      |`int`          | |
|`float`    |`float`        | |
|`string`   |`str`          | |

If you interpret the XML as a mapping, you can gather the following info:

```js
{
    "Gradient Color Data":
    {
        "Alpha Stops":
        {
            "Stops List":
            {
                "Stop-0":
                {
                    "Stops Alpha":
                        [
                            0.0, // offset
                            0.5, // ???
                            1.0  // alpha
                        ]
                },
                // More stops defined the same way...
            }
            "Stops Size": 2 // Number of stops
        },
        "Color Stops":
        {
            "Stops List":
            {
                "Stop-0":
                {
                    "Stops Color":
                    [
                        0.0, // offset
                        0.5, // ???
                        0.0, // red
                        0.0, // green
                        0.5, // blue
                        1.0  // alpha?
                    ]
                },
                // More stops defined the same way...
            }
            "Stops Size": 2 // Number of stops
        }
    },
    "Gradient Colors": "1.0" // Version?
}
```

XMP Metadata
------------

After the RIFX data, an AEP file also contains some XML in the
[XMP](https://en.wikipedia.org/wiki/Extensible_Metadata_Platform) format.

This section contains the version of AfterEffects, when the file has been
created and modified, and related info.


Resources
---------

* [aftereffects-aep-parser](https://github.com/boltframe/aftereffects-aep-parser) A basic AEP parser written in Go.
* [Multimedia Programming Interface and Data Specifications 1.0](https://www-mmsp.ece.mcgill.ca/Documents/AudioFormats/WAVE/Docs/riffmci.pdf) RIFF specs PDF.
* [IEEE-754 Floating-Point Conversion](https://babbage.cs.qc.cuny.edu/IEEE-754.old/Decimal.html) Float to hex converter.
* [Shape Layer Match Names](https://ae-scripting.docsforadobe.dev/matchnames/layer/shapelayer.html)
* [bodymovin-extension](https://github.com/bodymovin/bodymovin-extension) AE extensions that exports to Lottie
