# Parsing AEP Files

AfterEffects Project files are the proprietary file format used by Adobe AfterEffects.

It's a binary format based on the RIFX container format.

The structure resembles that of a Lottie JSON exported from AE.

You can perform the parsing in 3 steps:

1. Parse the RIFX chunks into a tree structure
2. Unpac the chunk data into more useful representations
3. Traverse that tree to map find the relevant objects and properties

Step 1 is fairly straightforward, RIFX is fairly easy to parse. <br/>
Step 2 is the hard part as there's no official documentation on how the data is laid out,
you can find the results of discovery on this in the [Chunks](#chunks) section. <br/>
Step 3 should be rather easy as now you basically only need to do the
same as the bodymovin plugin to convert the strucured AE data into lottie,
info on this is in the [AfterEffects Logic](#aftereffects-logic) section.


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
|`uint16` | 2 | Unsigned integer                |
|`uint32` | 4 | Unsigned integer                |
|`sint16` | 2 | Twos-complement signed integer  |
|`float32`| 4 | IEEE float                      |
|`float64`| 8 | IEEE float                      |
|`string` | * | Text, usually utf-8 encoded     |
|`string0`| * | NUL terminated string, note that you might find junk data after the NUL (This can be caused by renaming something to a shorter name) |
|`bytes`  | * | Unformatted / unknown data      |


### Time

Time values are stored as `uint16`. they are scaled by a factor you can find in {sl:`cdta`}.

To get the actual value in frames you need to do the following:

```
time_frames = time_value / cdta.time_scale
```

Additionally, layers specify a start time, which shifts all the time values by a fixed amount.

If you are within a layer the expression looks like this:

```
time_frames = (time_value + ldta.start_time) / (cdta.time_scale)
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

Note that the {sl:`LIST` `btdk`} doesn't conform to RIFF,
so take care to not read over the chunk length.

### `Utf8`

Contains utf-8 encoded text. Sometimes it contains the string `-_0_/-` which (I guess)
is used as a placeholder for objects lacking a name.

### `tdsn` / `fnam` / `pdnm`

Contains a {sl:`Utf8`} chunk, used for object names

### `tdmn`

Contains a NUL-terminated string (You'll need to strip excess `\0`) and defines a [Match Name](#match-names).

### `cdta`

Composition data.

|Field Name         |Size|  Type  | Description             |
|-------------------|----|--------|-------------------------|
|                   | 5  |        |                         |
| Time Scale        | 2  |`uint16`| How much Time values are scaled by |
|                   | 14 |        |                         |
| Playhead          | 2  |  Time  | Playhead time           |
|                   | 6  |        |                         |
| In Time           | 2  |  Time  | Same as `ip` in Lottie  |
|                   | 6  |        |                         |
| Out Time          | 2  |  Time  | Same as `op` in Lottie  |
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

Layer data, it seems that AE23 adds 4 extra `00` bytes at the end compared to older versions.

|Field Name         |Size|   Type   | Description |
|-------------------|----|----------|-------------|
| Layer ID          | 4  | `uint32` | |
| Quality           | 2  | `uint16` | `0`: Wireframe, `1`: Draft, `2`: Best     |
|                   | 7  |          | |
| Start Time        | 2  |`sint16`  | Time offset for times withing the layer |
|                   | 6  |          | |
| In Time           | 2  | Time     | Same as `ip` in Lottie |
|                   | 6  |          | |
| Out Time          | 2  | Time     | Same as `op` in Lottie |
|                   | 6  |          | |
| Attributes        | 3  | Flags    | |
| Source ID         | 4  | `uint32` | Item id for the used asset |
|                   | 20 |          | |
| Layer Name        | 32 | `string0`| It's repeated in the {sl:`Utf8`} chunk right after |
|                   | 35 |          | |
| Layer Type        |  1 | `uint8`  | |
| Parent ID         |  4 |`uint32`  |ID of the parent layer, if any |


With the following Attributes:

* _Bicubic Sampling_: (0, 6)
* _Auto Orient_: (1, 0)
* _Adjustment_: (1, 1) Whether it's an adjustment layer
* _Threedimensional_: (1, 2)
* _Solo_: (1, 3) (UI thing, only displays that layer)
* _Null_: (1, 7) Whether it's a null layer
* _Visible_: (2, 0)
* _Effects_: (2, 2)
* _Motion Blur_: (2, 3)
* _Locked_: (2, 5)
* _Shy_: (2, 6) (Used to hide some layers in the AE UI)
* _Conitnuosly Rasterize_ (vector) / _Collapse Transform_ (comps): (2, 7)

Layer Types:

* 0: Asset layer
* 1: Light Layer
* 2: Camera Layer
* 3: Text Layer
* 4: Shape Layer

### `idta`

Item data.


|Field Name         |Size|   Type   | Description |
|-------------------|----|----------|-------------|
| Type              | 2  | `uint16` | |
|                   | 14 |          | |
| ID                | 4  | `uint32` | ID used to reference this item |

The Type field above can have the following values:

* `1`: Folder
* `4`: Composition
* `7`: Footage

The last 2 bytes of this field seem to change every time you make a change.

### `tdb4`

Property metadata.

|Field Name         |Size|   Type   | Description |
|-------------------|----|----------|-------------|
|                   | 2  |          | Always `db 99`? |
| Components        | 2  | `uint16` | Number of values in a multi-dimensional |
| Attributes        | 2  | Flags    | |
|                   | 1  |          | |
|                   | 1  |          | Some sort of flag, it has value `03` for position properties |
|                   | 2  |          | |
|                   | 2  |          | |
|                   | 2  |          | Always `0000` ? |
|                   | 2  |          | 2nd most significant bit always on, perhaps some kind of flag |
|                   | 8  | `float64`| Most of the time `0.0001` |
|                   | 8  | `float64`| Most of the time `1.0`, sometimes `1.777` |
|                   | 8  | `float64`| Always `1.0`? |
|                   | 8  | `float64`| Always `1.0`? |
|                   | 8  | `float64`| Always `1.0`? |
| Type?             | 3  | Flags    | See below     |
|                   | 1  |          | Seems correlated with the previous byte, it's set for `04` for enum properties |
|                   | 7  |          | Bunch of `00` |
| Animated          | 1  |          | Set to `1` when animated, kinda the reverse of the _Static_ bit in _Attributes_ |
|                   | 7  |          | Bunch of `00` |
|                   | 4  |          | Usually 0, probs flags |
|                   | 4  |          | Mst likely flags, only last byte seems to contain data |
|                   | 8  | `float64`| Always `0.0`? |
|                   | 8  | `float64`| Mostly `0.0`, sometimes `0.333` |
|                   | 8  | `float64`| Always `0.0`? |
|                   | 8  | `float64`| Mostly `0.0`, sometimes `0.333` |
|                   | 4  |          | Probs some flags |
|                   | 4  |          | Probs some flags |

Attributes:

* _Position_: (1, 3). When `true`, this is a position property, which changes how animated values are parsed.
* _Static_: (1, 0). When `false`, the property is animated and it will have a {sl:`cdat`}.

Types:

* _Special_: (1, 0). Used for properties like shapes, gradients, etc, where the values are not in the keyframe.
* _Color_: (3, 0). Set for color properties (they have a different keyframe format).

124 bytes, most of which seems to be constant:


### `cdat`

Property static value.

For multi-dimensional properties, you look at the number of components in {sl:`tdb4`}
and parse that many `float64`, that's the value of the property.

### `shph`

Header for bezier shape data, contained within {sl:`LIST` `shap`}.

It's followed by a {sl:`LIST` `list`} with bezier data.

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

Inside a {sl:`LIST` `list`}, defines the data format, followed by {sl:`ldat`}.

|Field Name         |Size| Type     | Description                                                                   |
|-------------------|----|----------|-------------------------------------------------------------------------------|
|                   | 4  |          | Seems to always be `00 d0 0b ee`                                              |
|                   | 6  |          | All `00`                                                                      |
| Count             | 2  | `uint16` | Number of items                                                               |
|                   | 4  |          | The last byte is the only one that changes, greatest variation is on shapes   |
|                   | 2  |          | All `00`                                                                      |
| Item Size         | 2  | `uint16` | Size of an item in the list                                                   |
|                   | 3  |          | All `00`                                                                      |
| Type?             | 1  |          |                                                                               |
|                   | 4  |          | `00 00 00 01`                                                                 |
|                   | 2  |          | All `00`                                                                      |
|                   | 2  |          | Some kind of flags                                                            |
|                   |20  |          | All `00`                                                                      |


| Item Type     | Size  | Type  |
|---------------|-------|-------|
| {sl:`Gide`}   |`00 01`| `02`  |
| {sl:`LItm`}   |`00 80`| `01`  |
| {sl:`LRdr`}   |`08 c6`| `01`  |
| Color Kf      |`00 98`| `04`  |
| 1D Kf         |`00 30`| `04`  |
| 2D Kf         |`00 58`| `04`  |
| 2D pos Kf     |`00 68`| `04`  |
| 3D Kf         |`00 80`| `04`  |
| 3D pos Kf     |`00 80`| `04`  |
| Marker Kf     |`00 10`| `04`  |
| Orientation Kf|`00 50`| `04`  |
| No Value Kf   |`00 40`| `04`  |


The corresponding {sl:`ldat`} should have _Item Size_ * _Count_ bytes, and it's omitted if _Count_ is 0.


### `ldat`

Inside a {sl:`LIST` `list`}, contains the list data, preceded by {sl:`lhd3`}.

The number of element is the one defined in {sl:`lhd3`}.

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

Given `n` as the number of dimensions found in {sl:`tdb4`} (eg: 3 for 3D positions):

|Field Name         |Size|   Type       | Description |
|-------------------|----|--------------|-------------|
|                   |8* 2|`float64[2]`  | |
| In Speed          | 8  |`float64`     | |
| In Influence      | 8  |`float64`     | |
| Out Speed         | 8  |`float64`     | |
| Out Influence     | 8  |`float64`     | |
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

#### Keyframe - No Value


Used for shapes and gradients (_Special_ set in {sl:`tdb4`})

|Field Name         |Size|   Type       | Description |
|-------------------|----|--------------|-------------|
|                   | 8  |              | |
|                   | 8  |`float64`     | |
| In Speed          | 8  |`float64`     | |
| In Influence      | 8  |`float64`     | |
| Out Speed         | 8  |`float64`     | |
| Out Influence     | 8  |`float64`     | |
|                   | 8  |              | |

#### Keyframe - Color


|Field Name         |Size|   Type       | Description |
|-------------------|----|--------------|-------------|
|                   | 8  |`float64`     | |
|                   | 8  |`float64`     | |
| In Speed          | 8  |`float64`     | |
| In Influence      | 8  |`float64`     | |
| Out Speed         | 8  |`float64`     | |
| Out Influence     | 8  |`float64`     | |
| Value             | 8*4|`float64[4]`  | ARGB 255 |
|                   | 8*8|`float64[8]`  | |

#### Shape Data

Bezier data, positions are relative to the area defined by {sl:`shph`}.

The list is a sequence of points, appearing in this order:

* Vertex 0
* Out Tangent 0
* In Tangent 1
* Vertex 1
* Out Tangent 1
* ...

Note that all coordinates are relative to the area in {sl:`shph`} but not to each other.

A coordinate of \[0, 0\] will correspond to the top-left corner in {sl:`shph`},
and \[1, 1\] corresponds to the bottom-right.


|Field Name |Size| Type    | Description |
|-----------|----|---------|-------------|
| X         | 4  |`float32`| X Coordinate|
| XY        | 4  |`float32`| X Coordinate|


### `pprf`

Color profile information as ICC data.

### `wsnm`

Utf-16 encoded string, contains the name of the "workspace" (window layout in AE)

It's always followed by an {sl:`Utf8`} with the same content.

### `tdum` / `tduM`

`float64` values often found inside {sl:`LIST` `tdbs`}.

In some cases they seem to indicate minimum and maximum values for that
property but there are some cases in which they are both `0.0`.

### `ppSn`

Contains a `float64`, unknown meaning.

### `otda`

Orientation data

|Field Name         |Size|   Type       | Description |
|-------------------|----|--------------|-------------|
| X                 | 8  |`float64`     | X Coordinate|
| Y                 | 8  |`float64`     | Y Coordinate|
| Z                 | 8  |`float64`     | Z Coordinate|


### `opti`

Asset data, format depends on type


|Field Name |Size|Type      | Description   |
|-----------|----|----------|---------------|
| Type      | 4  | `string` | Asset type    |

### Solid

_Type_ `Soli`, data for solid layers.

|Field Name |Size|Type      | Description   |
|-----------|----|----------|---------------|
|           | 6  |          |               |
| Alpha     | 4  | `float32`|               |
| Red       | 4  | `float32`|               |
| Green     | 4  | `float32`|               |
| Blue      | 4  | `float32`|               |
| Name      |256 | `string0`|               |

Color components are in \[0, 1\].

### `sspc`

Footage / asset data.

|Field Name |Size|Type      | Description   |
|-----------|----|----------|---------------|
|           | 32 |          |               |
| Width     | 2  | `uint16` |               |
|           | 2  |          |               |
| Height    | 2  | `uint16` |               |

### `alas`

JSON string containing external asset info.

### `head`

Seems the first 6 bytes contain AE version information.

I haven't been able to decode it fully but here's a list of values
encountered in the wild:

|Version|Bytes              |
|-------|-------------------|
|15.0   |`5c 06 07 38 06 b4`|
|16.0   |`5d 04 0b 00 06 eb`|
|16.0.1 |`5d 04 0b 00 0e 30`|
|16.1.2 |`5d 05 0b 00 96 37`|
|16.1.3 |`5d 05 0b 00 9e 05`|
|17.0   |`5d 09 4b 08 06 2b`|
|17.0.4 |`5d 0b 0b 08 26 3b`|
|18.2.1 |`5d 1b 0b 11 0e 08`|
|18.4   |`5d 1d 0b 12 06 26`|
|22.0   |`5d 1d 0b 70 06 6f`|
|22.6   |`5d 2b 0b 33 06 3b`|
|23.2.1 |`5e 03 0b 39 0e 03`|

### `EfDC`

The first byte contains the number of {sl:`LIST` `EfDf`} in a {sl:`LIST` `EfdG`}

### `parn`

Contains a `uint64` with the number of parameters in a {sl:`LIST` `parT`}.

### `pard`

Effect parameter definition.

|Field Name |Size|Type      | Description   |
|-----------|----|----------|---------------|
|                   | 15 |          |               |
| Type              |  1 |`uint8`   |Parameter type |
| Name              | 32 |`string0` | |
|                   |  4 |          | |
|Default?           |  4 |          | |
|Last used value?

Types:

|Type Name  |AEP |Lottie| Lottie Object                     |
|-----------|----|------|-----------------------------------|
|Layer      |`0` | `10` |{ref-link:effect-values/layer}     |
|Scalar     |`2` | `0`  |{ref-link:effect-values/slider}    |
|Angle      |`3` | `1`  |{ref-link:effect-values/angle}     |
|Boolean    |`4` | `4`  |{ref-link:effect-values/checkbox}  |
|Color      |`5` | `2`  |{ref-link:effect-values/color}     |
|2D         |`6` | `3`  |{ref-link:effect-values/point}     |
|Enum       |`7` | `7`  |{ref-link:effect-values/drop-down} |
|Paint Group|`9` |      |                                   |
|Slider     |`10`| `0`  |{ref-link:effect-values/slider}    |
|Group      |`13`| `5`  |{ref-link:effects/custom-effect}   |
|Unknown    |`15`| `6`  |{ref-link:effect-values/no-value}  |
|3D         |`16`| `3`  |{ref-link:effect-values/point}     |


### `prin`

Seems to always have the same content:

4 `00` bytes, the string `ADBE Escher`, 37 `00`, the string `Classic 3D`,
41 `00`, and ends with `01`.

### `prda`

Seems to always have the same content: 3 `00`, a `01`, 8 `00`.

### `LIST` `Fold`

Top level item.

### `LIST` `Item`

Item, you can check its properties with {sl:`idta`} contained inside it.

### `LIST` `Layr`

Defines a layer.

Layer metadata is found in a {sl:`ldta`}, the layer name is in a {sl:`Utf8`}.

Go through its {sl:`LIST` `tdgp`} to get shapes and transforms.

You will find the following match names within it:

* `ADBE Root Vectors Group`: Contains shape data (shape layer in lottie)
* `ADBE Camera Options Group`: Lottie camera layer
* `ADBE Transform Group`: Layer transform
* `ADBE Layer Styles`: Layer styles

### `LIST` `tdgp`

Defines a list of an object. To know what type of object, you need to check
the {sl:`tdmn`} preceding this chunk.

The name of the object is in {sl:`tdsn`} > {sl:`Utf8`}.

Then follows a sequence of properties / objects defined as such:

{sl:`tdmn`} specifies the match name of the object, then it's followed by
chunks that describe said object (usually more {sl:`LIST`}s).

Usually the last chunk here is a {sl:`tdmn`} with value `ADBE Group End`.

### `LIST` `tdbs`

Defines an object's property. To know which property, you need to
check the {sl:`tdmn`} preceding this chunk.

It will contain a {sl:`tdb4`}, and usually {sl:`cdat`} (static) or a `List` `list` (animated).

For properties with expressions, it will have a {sl:`Utf8`} with the expression code.

### `LIST` `GCst`

Defines a gradient.

Contains a {sl:`LIST` `tdbs`} and a {sl:`LIST` `GCky`}.

### `LIST` `GCky`

Gradient color keyframes.

Contains a sequence of {sl:`Utf8`} formatted in XML with the gradient definition
for each keyframe.

### `LIST` `om-s`

Contains a {sl:`LIST` `tbds`} and a {sl:`LIST` `omks`} to define a shape property.

### `LIST` `omks`

Bezier shape data.

Contains a sequence of {sl:`LIST` `shap`} with the shape data for each keyframe.

### `LIST` `shap`

Contains a {sl:`shph`} and a {sl:`LIST` `list`} with the shape data.

### `LIST` `CPPl`

Contains a {sl:`pprf`}.

### `LIST` `list`

For animated properties it replaces {sl:`cdat`}.

The list header is defined in the chunk {sl:`lhd3`}, the list data in {sl:`ldat`}.

### `LIST` `SLay` / `LIST` `DLay` / `LIST` `CLay`

They seem to be camera layers used to store internal views, not exported to lottie.

`SLay` have names like "Top" and "Front", perhaps they define 3d views.

`CLay` seem to be custom views.

### `LIST` `SecL`

Markers Layer.

### `LIST` `otst`

Orientation property.

Contains a  {sl:`LIST` `tbds`} and a {sl:`LIST` `otky`} to define a shape property.

### `LIST` `otky`

Contains a sequence of {sl:`otda`} with the orientation data for each keyframe.

### `LIST` `CpS2`

They contain a {sl:`CsCt`} and two {sl:`Utf8`}, the last of which seems to
contain a locale name (eg: `en_US`)

### `LIST` `Als2`

Contains {sl:`alas`} for external assets.

### `LIST` `Sfdr`

Asset folder contents, contains several {sl:`LIST` `Item`}.


### `LIST` `btdk`

For some reason this doesn't conform to the RIFX specs, instead of a list
its data is encoded in [Carousel Object Structure](https://en.wikipedia.org/wiki/PDF#File_format) (COS).

The COS format is the same used in PDF but it's extremely difficult to
find detailed information on it, the best technical specs is this very old
[PDF 1.7 specification](https://web.archive.org/web/20141020130815/http://wwwimages.adobe.com/content/dam/Adobe/en/devnet/pdf/pdfs/PDF32000_2008.pdf).

Once you parse the COS, you can find the following data:

* `0.1.0`: Array of available fonts:
    * `0.99`: `CoolTypeFont`
    * `0.0.0`: Font family (seems to have bold/italic encoded in the name)
    * `0.0.2`: `0` or `1`?
* `1.1`: Array of text documents (one for each keyframe) in this format:
    * `0.0`: Text
    * `0.5.0`: Array of paragraph styles
        * `0.0.5` Paragraph Style:
            * `0`: Text align (`0`: left, `1`: right, `2`: center)
        * `1`: Length (in characters) the style applies to
    * `0.6.0`: Array of character styles:
        * `0.0.6`: Character Style:
            * `0`: Index of the font from the array of available fonts
            * `1`: Font size
            * `2`: Faux Bold
            * `3`: Faux Italic
            * `12`: `0`: Normal, `1`: Small caps, `2`: All caps
            * `13`: `0`: Normal, `1`: Superscript, `2`: Subscript
            * `53.0.1`: Fill color in ARGB \[0, 1\]
            * `54.0.1`: Stroke color in ARGB \[0, 1\]
            * `57`: Stroke enabled
            * `58`: Stroke over fill
            * `63`: Stroke width
        * `1`: Length (in characters) the style applies to


### `LIST` `sspc`

Effect Definiton.

The generic effect name is in {sl:`fnam`} > {sl:`Utf8`}.

The effect parameters are defined in {sl:`LIST` `parT`}.
If the effect type has already been encountered, you might not find the
{sl:`LIST` `parT`} here, you might need to match the name to an entry in {sl:`LIST` `EfdG`}.

It finally contains a {sl:`LIST` `tdgp`} where the effect properties are present
like any other animated property. You can also find the name
of the effect object in {sl:`fnam`} > {sl:`Utf8`}.

Inside there you can also find a match name with `ADBE Effect Built In Params`
which will contain values for built-in effect parameters.

### `LIST` `parT`

Effect parameters.

Contains a {sl:`parn`} with the number of parameters, then follows
a list of {sl:`tdmn`} with the match name of the parameter followed by
{sl:`pard`} with its definition.

Enum parameters have their values in a  {sl:`pdnm`} separated by `|` pipes.

The first property seems to be a dummy?

### `LIST` `EfdG`

Effect definitions.

This is where effect types used by the project are defined.

Basically it repeats the first instance of any effect found in the layers.

it contains a {sl:`EfDC`} with the number of effects, and that many {sl:`LIST` `EfDf`}.


### `LIST` `EfDf`

Effect type definition.

Contains a {sl:`tdmn`} with the match name of the effect and a {sl:`LIST` `sspc`}.

### `LIST` `ExEn`

Contains a {sl:`Utf8`} with the expression language (eg: `javascript-1.0`).

### `LIST` `PRin`

Contains a {sl:`prin`} and a `prda`.


AfterEffects Logic
------------------

### Project Structure

Assets and compositions are stored in a folder structure, on the `RIFX`,
looks like for a {sl:`LIST` `Fold`} chunk.

Inside here you'll find (among other things) {sl:`LIST` `Item`} chunks,
they all contain an {sl:`idta`} which tells you how to interpret the item and its ID.

#### Compositions

{sl:`idta`} has type of `4`. You need to know which composition to extract as
a lottie corresponds to a specific comp (with other compositions showing
as assets for precomps).

The name of the composition is in the first {sl:`Utf8`} chunk.

Its properties are in {sl:`cdta`}.

Then look for {sl:`LIST` `Layr`} to parse layers.

#### Folders

{sl:`idta`} type `1`. These contain additional items inside them.

The name of the folder is in the first {sl:`Utf8`} chunk.

Look for a {sl:`LIST` `Sfdr`} and iterate through it for the child items.

#### Assets

{sl:`idta`} type `7`. These can have different kinds of contents.

{sl:`LIST` `Pin `} will contain the asset data:

Look for {sl:`sspc`} to get the size for visual assets.

The type of asset is defined in the first 4 bytes of {sl:`opti`}.

##### Solids

For some the `Item` has an `Utf8` but it seems to always be empty
need to find the name from {sl:`opti`}.

##### Files

The `Uft8` in `Item` only has a value if the user has set an explicit value for the name.

The file path is in {sl:`LIST` `Pin `} > {sl:`LIST` `Als2`} > {sl:`alas`}.
Interpret it as JSON and get `fullpath`.

the first 4 bytes of {sl:`opti`} will change based on the file format.

There will also be a {sl:`LIST` `CLRS`} with some {sl:`Utf8`}, in there there's
some JSON with base64-encoded ICC color profiles.


### Layers

Layers are defined in {sl:`LIST` `Layr`}.

There are different types of layers:

#### Shape Layer

For shapes look for the match name `ADBE Root Vectors Group`.

#### Camera Layer

For camera settings look for the match name `ADBE Camera Options Group`.

#### Text Layer

For text contents look for the match name `ADBE Text Properties`.

#### Asset Layer

(Also known as AVLayer in AE) They have a non-zero Source ID in {sl:`ldta`}.

Image layers and similar will point to an appropriate asset.

Several layer types point to a solid asset, you need to check the layer
attributes to distinguish between them:

* Solid layers
* Null layers
* Adjustment layers

#### Light Layer

For light settings look for the match name `ADBE Light Options Group`.


### Objects

Most objects are introduced by their match name ({sl:`tdmn`}),
followed by a {sl:`LIST` `tdgp`} that defines the properties and sub-objects.

Inside the {sl:`LIST` `tdgp`} you can find more match names defining which
property or the type of sub-object you are defining.


### Properties

Properties, like objects are introduced by their match name, the chunks
following that depends on the type of property.

#### MultiDimensional

* {sl:`tdmn`}: Match Name
* {sl:`LIST` `tbds`}: Property definition
    * {sl:`tdb4`}: Tells you how many components the property has and whether it's animated
    * {sl:`cdat`}: Value (if not animated)
    * {sl:`LIST` `list`}: Keyframes (if animated)
        * {sl:`lhd3`}: Tells you the number of keyframes
        * {sl:`ldat`}: Keyframe data and values

#### Shape

* {sl:`tdmn`}: Match Name (`ADBE Vector Shape`)
* {sl:`LIST` `om-s`}
    * {sl:`LIST` `tbds`}: Property definition
        * {sl:`tdb4`}: Metadata
        * {sl:`LIST` `list`}: Present if the shape is animated
            * {sl:`lhd3`}: Keyframe list metadata
            * {sl:`ldat`}: Keyframe data without values
    * {sl:`LIST` `omks`}: Shape Values
        * {sl:`LIST` `shap`}: Bezier Data
            * {sl:`shph`}: Bezier metadata (whether it's closed and bounding box)
            * {sl:`LIST` `list`}
                * {sl:`lhd3`}: Bezier point list metadata
                * {sl:`ldat`}: Bezier points relative to {sl:`shph`}

If the property is animated, there will be multiple {sl:`LIST` `shap`}, one
per keyframe.


#### Gradient Colors

* {sl:`tdmn`}: Match Name (`ADBE Vector Grad Colors`)
* {sl:`LIST` `GCst`}
    * {sl:`LIST` `tbds`}: Property definition
        * {sl:`tdb4`}: Metadata
        * {sl:`LIST` `list`}: Present if the property is animated
            * {sl:`lhd3`}: Keyframe list metadata
            * {sl:`ldat`}: Keyframe data without values
    * {sl:`LIST` `GCky`}
        * {sl:`Utf8`} [Gradient XML](#gradient-xml)


If the property is animated, there will be multiple {sl:`Utf8`}, one
per keyframe.

### Assets

#### Image

Defined within {sl:`LIST` `Item`}, it will have {sl:`idta`} with type `7`.

Within that there's a {sl:`LIST` `Pin `}, containing the following:

{sl:`LIST` `Als2`} with {sl:`alas`}, which in turn has some JSON.
Inside the JSON you can get `fullpath`.

{sl:`opti`}: Contains the asset name.

{sl:`LIST` `CLRS`}, the last {sl:`Utf8`} here has some JSON with a base64-encoded color profile.

### Shapes

#### Stroke Dashes

Look for the match name `ADBE Vector Stroke Dashes`.

Inside of it you'll find a bunch of properties with match name
`ADBE Vector Stroke Dash n` or `ADBE Vector Stroke Gap n`, where `n` is
an ineger starting from 1.

You will also find a single `ADBE Vector Stroke Offset`.

They are all animatable lengths and fairly straighforward.

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
ADBE Time Remapping : prop=tm
ADBE Effect Parade : prop=ef

{aep_mn}
ADBE Camera Options Group : object=layers/camera-layer : Marks a layer as a camera layer
ADBE Camera Aperture : prop=pe
ADBE Camera Zoom :

{aep_mn}
ADBE Text Properties : object=text/text-data
ADBE Text Document : prop=d
ADBE Text Path Options : prop=p
ADBE Text More Options : prop=m


### Shapes

{aep_mn}
ADBE Vector Group : object=shapes/group
ADBE Vector Blend Mode : prop=bm [^enum][^blend]
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
ADBE Vector Blend Mode : prop=bm [^enum][^blend]
ADBE Vector Fill Color : prop=c [^color] : \[255, 255, 0, 0\]
ADBE Vector Fill Opacity : prop=o : 100
ADBE Vector Fill Rule : prop=r [^enum] : 1
ADBE Vector Composite Order : if 2, it should be drawn over the previous shape : 1

{aep_mn}
ADBE Vector Graphic - Stroke : object=shapes/stroke
ADBE Vector Blend Mode : prop=bm [^enum][^blend]
ADBE Vector Stroke Color : prop=c [^color] : \[255, 255, 255, 255, \]
ADBE Vector Stroke Opacity : prop=o : 100
ADBE Vector Stroke Width : prop=w : 2
ADBE Vector Stroke Line Cap : prop=lc [^enum] : 1
ADBE Vector Stroke Line Join : prop=lj [^enum] :  1
ADBE Vector Stroke Miter Limit : prop=ml2 : 4
ADBE Vector Stroke Dashes : prop=d
ADBE Vector Stroke Taper :
ADBE Vector Stroke Wave :
ADBE Vector Composite Order : if 2, it should be drawn over the previous shape : 1

{aep_mn}
ADBE Vector Stroke Taper : All properties are percentages in \[0, 100\]
ADBE Vector Taper Start Length :
ADBE Vector Taper End Length :
ADBE Vector Taper Start Width :
ADBE Vector Taper End Width :
ADBE Vector Taper Start Ease :
ADBE Vector Taper End Ease :

{aep_mn}
ADBE Vector Stroke Wave :
ADBE Vector Taper Wave Amount :
ADBE Vector Taper Wave Units : 1 for pixels, 2 for cycles
ADBE Vector Taper Wavelength :
ADBE Vector Taper Wave Phase :

{aep_mn}
ADBE Vector Graphic - G-Fill : object=shapes/gradient-fill
ADBE Vector Blend Mode : prop=bm [^enum][^blend]
ADBE Vector Grad Start Pt : prop=s
ADBE Vector Grad End Pt : prop=e
ADBE Vector Grad HiLite Length : prop=h
ADBE Vector Grad HiLite Angle : prop=a
ADBE Vector Grad Colors : prop=g [^gradient]
ADBE Vector Fill Opacity : prop=o : 100
ADBE Vector Fill Rule : prop=r [^enum] : 1
ADBE Vector Composite Order : if 2, it should be drawn over the previous shape : 1

{aep_mn}
ADBE Vector Graphic - G-Stroke : object=shapes/gradient-stroke
ADBE Vector Blend Mode : prop=bm [^enum][^blend]
ADBE Vector Grad Start Pt : prop=s
ADBE Vector Grad End Pt : prop=e
ADBE Vector Grad HiLite Length : prop=h
ADBE Vector Grad HiLite Angle : prop=a
ADBE Vector Grad Colors : prop=g [^gradient]
ADBE Vector Stroke Opacity : prop=o : 100
ADBE Vector Stroke Width : prop=w : 2
ADBE Vector Stroke Line Cap : prop=lc [^enum] : 1
ADBE Vector Stroke Line Join : prop=lj [^enum] : 1
ADBE Vector Stroke Miter Limit : prop=ml2
ADBE Vector Stroke Dashes : prop=d
ADBE Vector Stroke Taper :
ADBE Vector Stroke Wave :
ADBE Vector Composite Order : if 2, it should be drawn over the previous shape : 1

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
ADBE Vector Anchor: prop=a : probably an outdated name
ADBE Vector Position: prop=p
ADBE Vector Scale: prop=s
ADBE Vector Rotate X: prop=rx
ADBE Vector Rotate Y: prop=ry
ADBE Vector Rotate Z: prop=rz or just normal rotation
ADBE Vector Rotation: prop=r
ADBE Vector Group Opacity: prop=o : 1


{aep_mn}
ADBE Vector Repeater Transform: object=shapes/repeater-transform
ADBE Vector Repeater Anchor Point: prop=a
ADBE Vector Repeater Position: prop=p
ADBE Vector Repeater Scale: prop=s [^100]
ADBE Vector Repeater Rotation: prop=r
ADBE Vector Repeater Start Opacity: prop=so [^100] : 1
ADBE Vector Repeater End Opacity: prop=so [^100] : 1


### Effects

{aep_mn}
ADBE Tint : object=effects/tint-effect
ADBE Fill : object=effects/fill-effect
ADBE Stroke : object=effects/stroke-effect
ADBE Tritone : object=effects/tritone-effect
ADBE Pro Levels2 : object=effects/pro-levels-effect
ADBE Drop Shadow : object=effects/drop-shadow-effect
ADBE Radial Wipe : object=effects/radial-wipe-effect
ADBE Displacement Map : object=effects/displacement-map-effect
ADBE Set Matte3 : object=effects/matte3-effect
ADBE Gaussian Blur 2 : object=effects/gaussian-blur-effect
ADBE Twirl : object=effects/twirl-effect
ADBE MESH WARP : object=effects/mesh-warp-effect
ADBE Ripple : object=effects/wavy-effect
ADBE Spherize : object=effects/spherize-effect
ADBE FreePin3 : object=effects/puppet-effect

{aep_mn}
ADBE Effect Built In Params : Marks a {sl:`LIST` `tdgp`} with built-in effect properties
ADBE Effect Mask Opacity :

{aep_mn}
ADBE Paint Group : Data for the paint effect
ADBE Paint Atom : Contains the following properties
ADBE Paint Duration :
ADBE Paint Shape :
ADBE Paint Transform : Same as other transform but match names starting with `ADBE Paint`
ADBE Paint Properties : contains the following
ADBE Paint Clone Layer :


### Misc

{aep_mn}
ADBE Group End : Indicates the end of a {sl:`LIST` `tdgp`}


<!--
to verify:
ADBE Vector Grad Type
ADBE Vector Offset Copies (offset path)
ADBE Vector Offset Copy Offset (offset path)
ADBE Vector Trim Type
ADBE Vector Opacity (group transform)
-->

### Notes

[^enum]: Enumerations needs to be converted from floats, but the values match.
[^blend]: Blend mode has different values than Lottie, see the section below for details.
[^int]: Needs to be converted from `float` to `int`.
[^shape]: How to parse this?
[^color]: Colors are defined as 4 floats (ARGB) in \[0, 255\].
[^gradient]: Colors defined as [XML](#gradient-xml).
[^100]: You need to multiply by 100 to get the lottie value.

///Footnotes Go Here///


Enumerations
------------

Most enumerated values are the same in Lottie and AEP, this section lists the exceptions to this


### Blend Mode

| Name          |AEP|Lottie|
|---------------|---|---|
|Normal         | 1 | 0 |
|Darken         | 3 | 4 |
|Multiply       | 4 | 1 |
|Color Burn     | 5 | 7 |
|Linear Burn    | 6 |   |
|Darker Color   | 7 |   |
|Lighten        | 9 | 5 |
|Screen         | 10| 2 |
|Color Dodge    | 11| 6 |
|Linear Dodge   | 12|   |
|Lighter Color  | 13|   |
|Overlay        | 15| 3 |
|Soft Light     | 16| 9 |
|Hard Light     | 17| 8 |
|Linear Light   | 18|   |
|Vivid Light    | 19|   |
|Pin Light      | 20|   |
|Hard Mix       | 21|16 |
|Difference     | 23|10 |
|Exclusion      | 24|11 |
|Hue            | 26|12 |
|Saturation     | 27|13 |
|Color          | 28|14 |
|Luminosity     | 29|15 |

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


XML Project Format
------------------

Aftereffects allows you to save the project as XML.

This is basically as the RIFX but with a different container format and
binary data encoded as hex.

Conversion notes for elements are provided below

### AfterEffectsProject

Root element, same as `RIFX`.

### ProjectXMPMetadata

In the RIFX file this is dumped at the end without a chunk.

### string

Used instead of {sl:`Utf8`}.

### numS / ppSn

For some reason they have their value in a `<string>` but are not string in the RIFX.

### tdsn / fnam / pdnm

These elements contain children but they are not {sl:`LIST`} in RIFX, that's the only thing of note.

### Child elements

If an element has children. it's the same as the equivalent {sl:`LIST`} in RIFX.

### `bdata`

Elements with the {sl:`bdata`} attribute have their binary data hex encoded in said attribute.

You can parse their data the same way as you'd do in RIFX.


Resources
---------

* [aftereffects-aep-parser](https://github.com/boltframe/aftereffects-aep-parser) A basic AEP parser written in Go.
* [Multimedia Programming Interface and Data Specifications 1.0](https://www-mmsp.ece.mcgill.ca/Documents/AudioFormats/WAVE/Docs/riffmci.pdf) RIFF specs PDF.
* [Floating Point to Hex Converter](https://gregstoll.com/~gregstoll/floattohex/) Float to hex converter.
* [bodymovin-extension](https://github.com/bodymovin/bodymovin-extension) AE extensions that exports to Lottie
* [After Effects Scripting Guide](https://ae-scripting.docsforadobe.dev/)
* [Shape Layer Match Names](https://ae-scripting.docsforadobe.dev/matchnames/layer/shapelayer.html)
* [Portable document format — Part 1: PDF 1.7](https://web.archive.org/web/20141020130815/http://wwwimages.adobe.com/content/dam/Adobe/en/devnet/pdf/pdfs/PDF32000_2008.pdf) The only COS reference I've found
