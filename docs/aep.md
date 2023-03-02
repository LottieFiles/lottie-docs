# Parsing AEP Files

AfterEffects Project files are the proprietary file format used by Adobe AfterEffects.

It's a binary format based on the RIFX container format.

The structure resembles that of a Lottie JSON exported from AE.

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
|`float64`| 8 | IEEE float                      |
|`string` | * | Text, usually utf-8 encoded     |
|`string0`| * | NUL terminated string           |
|`bytes`  | * | Unformatted / unknown data      |


### Time

Time values are stored as `uint16` in centiseconds.

To get the time in frames you need the following:

```
frames = time * fps / 100
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

|Field Name         |Size|  Type  | Description |
|-------------------|----|--------|-------------|
|                   | 13 |        | |
| Comp start        | 2  |  Time  | Time of the first keyframe (?) |
|                   | 6  |        | |
| Playhead          | 2  |  Time  | Position of the playhead in AE |
|                   | 6  |        | |
| Start Time        | 2  |  Time  | Same as `ip` in Lottie |
|                   | 6  |        | |
| End Time          | 2  |  Time  | Same as `op` in Lottie |
|                   | 6  |        | |
| Comp duration     | 2  |  Time  | Time of the last keyframe |
|                   | 5  |        | |
| Color             | 3  |`bytes` | Color as 24 bit RGB |
|                   | 85 |        | |
| Width             | 2  |`uint16`| Same as `w` in Lottie |
| Height            | 2  |`uint16`| Same as `h` in Lottie |
|                   | 12 |        | |
| Framerate         | 2  |`uint16`| Same as `fr` in Lottie |

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


### `cdat`

Property static value.

For multi-dimensional properties, you look at the number of components in `tbd4`
and parse that many `float64`, that's the value of the property.

### `shph`

Seems to specify bezier information of some kind.

### `lhd3`

Precedes `ldat` for shapes and animated properties.

### `ldat`

Property data.

It has a different format based on certain conditions.

For animated multi-dimensional properties, it contains a sequence of keyframes in this format:

|Field Name         |Size|   Type       | Description |
|-------------------|----|--------------|-------------|
| Attributes        | 1  | `bytes`      | If other than 0, ignore the keyframe (same size but different data) |
| Time              | 2  | Time         | Time of the keyframe, seems they always start from 0. |
| Value             | *  |`float64[*]`  |Value, the amount depends on the number of components from `tdb4`|
|                   |8*3 |`float64[3]`  | |
|`o.x`?             | 8  |`float64`     | |

If the property is an animated position, the keyframe is formatted like so:

|Field Name         |Size|   Type       | Description |
|-------------------|----|--------------|-------------|
| Attributes        | 1  | `bytes`      | If other than 0, ignore the keyframe (same size but different data) |
| Time              | 2  | Time         | Time of the keyframe, seems they always start from 0. |
|                   |8*6 |`float64[6]`  | |
| Value             | *  |`float64[*]`  |Value, the amount depends on the number of components from `tdb4`|
| Tan In            | *  |`float64[*]`  |Spatial tangents, the amount depends on the number of components from `tdb4`|
| Tan Out           | *  |`float64[*]`  |Spatial tangents, the amount depends on the number of components from `tdb4`|

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

### `LIST` `GCst`

Defines a gradient.

Contains a `LIST` `tdbs` and a `LIST` `GCky`.

### `LIST` `GCky`

Gradient data.

Contains a sequence of `Utf8` formatted in XML with the gradient definition
for each keyframe.

### `LIST` `CPPl`

Contains a `pprf`.

### `LIST` `list`

Always contains `lhd3`. For animated properties it replaces `cdat` and it also
contains `ldat`.

### `LIST` `SLay`

Some kind of layer not rendered to lottie.

They contain `ADBE Camera Options Group` with a property called `ADBE Camera Zoom`.



Main Composition
----------------

Search for `LIST` `Fold`, then iterate through it to look for a `LIST` `Item`
with `idta` type of `4`.

The name of the composition is in the first `Utf8` chunk.

Its properties are in `cdta`, which you must parse in order to find the framerate
and convert times into frames.

Then look for `LIST` `Layr` to parse layers.


Match Names
-----------

### Objects

Shape Group:

* `ADBE Vector Group`

Shapes:

* `ADBE Vector Shape - Group` (Path)
* `ADBE Vector Shape - Rect`
* `ADBE Vector Shape - Ellipse`

Shape Styles:

* `ADBE Vector Graphic - Stroke`
* `ADBE Vector Graphic - Fill`
* `ADBE Vector Graphic - G-Fill` (Gradient fill)

Shape Modifiers:

* `ADBE Vector Filter - Trim`

### Properties

Shape Properties:

* `ADBE Vector Position`
* `ADBE Vector Shape` (Bezier)
* `ADBE Vector Rect Size`
* `ADBE Vector Ellipse Size`


Shape Style Properties:

* `ADBE Vector Stroke Color`
* `ADBE Vector Fill Color`
* `ADBE Vector Stroke Width`
* `ADBE Vector Grad Start Pt`
* `ADBE Vector Grad End Pt`
* `ADBE Vector Grad Colors` (Colors are defined in XML)

For color properties, they have 4 components as ARGB floats in \[0, 255\].


Modifier Properties:

* `ADBE Vector Trim Start`


Transform Properties:

* `ADBE Anchor Point`
* `ADBE Position`
* `ADBE Rotate X`
* `ADBE Rotate Y`
* `ADBE Rotate Z` (Rotation in 2D)
* `ADBE Opacity` (In \[0, 1\])
* `ADBE Scale` (In \[0, 1\])


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
