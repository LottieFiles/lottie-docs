# Parsing AEP Files

AfterEffects Project files are the proprietary file format used by Adobe AfterEffects.

It's a binary format based on the RIFX container format.

The structure resembles that of a Lottie JSON exported from AE.


## RIFF

A RIFF is composed of "chunks" with the following format


|Field |Size|Description                                    |
|------|----|-----------------------------------------------|
|Header|  4 | ASCII name describing the type of the chunk   |
|Size  |  4 | `uint32` size of the data section             |
|Data  |Size| Data within the chunk                         |


`RIFX` is an extension of the `RIFF` format, the difference being `RIFX`
uses big-endian notation for integers.

A RIFF file will be structured in the same way as a chunk:

|Field |Size|Description                    |
|------|----|-------------------------------|
|Header|  4 | `RIFF` or `RIFX`              |
|Size  |  4 | `uint32` size of the chunk    |
|Format|  4 | Format Identifier             |
|Chunks|  * | Rest of the chunks            |


### AEP-Specific Parsing

It should always be `RIFX` format (big endian). The format identifier
for AEP is `Egg!`.

When parsing the RIFF structure, keep in mind the following chunks
will contain other chunks:

* {sl:`tdsn`}
* {sl:`fnam`}
* {sl:`pdnm`}

And that {sl:`LIST` `btdk`} contains data in a different format, and
it should not be parsed as a RIFF {sl:`LIST`}.

At the end of the RIFF data, the AEP file has some XML-encoded metadata.


### Basic Types

In the chunk data descriptions, the types described below will be used
to show how to interpret the raw binary data.

|Type     |Size|Description|
|---------|----|-----------|
|`id`     | 4  | ASCII-encoded chunk identifier  |
|`uint16` | 2  | Unsigned integer                |
|`uint32` | 4  | Unsigned integer                |
|`sint16` | 2  | Twos-complement signed integer  |
|`float32`| 4  | IEEE float                      |
|`float64`| 8  | IEEE float                      |
|`string` | *  | Text, usually utf-8 encoded     |
|`string0`| *  | NUL terminated string, note that you might find junk data after the NUL (This can be caused by renaming something to a shorter name) |
|`bytes`  | *  | Unformatted / unknown data      |


#### Time

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


#### Flags

Flags is byte data, that will be specified using two integers: byte and bit index.

You'll get the value of the flag you'll need to do the following:

```
flag = (flags[byte] & (1 << bit)) != 0
```

The index of the byte here is in file order so a `byte` of 0 is the most significant byte.

## AfterEffects Logic

This section assumes the file has already been parsed into RIFF chunks.

Objects described here will have a nested list showing which chunks are
used to represent them, you can click on the link pointing to the chunk
details to get the data layout within that chunk.

### File Structure

* {sl:`LIST` `EfdG`}: [Effect definitions](#effects)
* {sl:`LIST` `ExEn`}
    * {sl:`Utf8`}: Language used in expressions (eg: `javascript-1.0`)
* {sl:`LIST` `Fold`}: Root folder
    * {sl:`LIST` `Item`}: Folder item (repeated, see below)

#### Folder Item

* {sl:`LIST` `Item`}
    * {sl:`idta`}: Item data
    * {sl:`Utf8`}: Name
    * {sl:`cmta`}: (optional) Comment
* {sl:`fiac`} Whether the item is the active item

{sl:`idta`} will cointain the ID of the item (referenced by layers)
and the item type.

The following sections descript each type of item in detail

#### Folders

{sl:`idta`} type `1`. These contain additional items inside them.

* {sl:`LIST` `Item`}
    * {sl:`idta`}: Item data (type and ID).
    * {sl:`Utf8`}: Name
    * {sl:`LIST` `Sfdr`}: Folder items
        * {sl:`LIST` `Item`}: Child item (repeated)

#### Compositions

{sl:`idta`} has type of `4`. You need to know which composition to extract as
a lottie corresponds to a specific comp (with other compositions showing
as assets for precomps).

Structure:

* {sl:`LIST` `Item`}
    * {sl:`idta`}: Item data (type and ID).
    * {sl:`Utf8`}: Name
    * {sl:`cdta`}: Composition data
    * {sl:`LIST` `Layr`}: Layer (repeated)

Each layer will show as a {sl:`LIST` `Layr`} in the {sl:`LIST` `Item`}.

The composition will also have other type of layer `LIST`s:

* {sl:`LIST` `DLay`}: Default view
* {sl:`LIST` `CLay`}: Custom views
* {sl:`LIST` `SLay`}: Side views
* {sl:`LIST` `SecL`}: Composition markers layer

If the comp uses {sl:essential graphics}, it will have the appropriate `LIST`s as well.


#### Assets

{sl:`idta`} type `7`. These can have different kinds of contents.

Look for {sl:`sspc`} to get the size for visual assets.

The type of asset is defined in the first 4 bytes of {sl:`opti`}.

##### Solids

For some the `Item` has an `Utf8` but it seems to always be empty
need to find the name from {sl:`opti`}.

* {sl:`LIST` `Item`}
    * {sl:`idta`}: Item data (type and ID).
    * {sl:`Utf8`}: Name (not used for solids)
    * {sl:`LIST` `Pin `}
        * {sl:`sspc`}: Contains info like width / height)
        * {sl:`opti`}: Data

##### Files


* {sl:`LIST` `Item`}
    * {sl:`idta`}: Item data (type and ID).
    * {sl:`Utf8`}: Name
    * {sl:`LIST` `Pin `}
        * {sl:`sspc`}: Contains info like width / height)
        * {sl:`opti`}: Check this to tell files apart from solids
        * {sl:`LIST` `Als2`}
            * {sl:`alas`}: File info as JSON.
        * {sl:`LIST` `CLRS`}
            * {sl:`Utf8`}: JSON containing base64-encoded ICC color profiles.

The `Uft8` in `Item` only has a value if the user has set an explicit value for the name.

The file path is in {sl:`alas`}, parse it as JSON and get `fullpath`.

the first 4 bytes of {sl:`opti`} will change based on the file format.


### Layers

* {sl:`LIST` `Layr`}: Layer
    * {sl:`ldta`}: Common layer data, including layer type.
    * {sl:`Utf8`}: Name
    * {sl:`cmta`}: (optional) Comment
    * {sl:`LIST` `tdgp`}: [Property group](#property-groups)

When parsing layer transforms, keep in mind the default position is the center of the comp.
For shape layers, the default anchor is \[0, 0\];
for precomp layers the default anchor is the center of the comp (same as position).

#### Asset Layer

Layer type `0`.

(Also known as AVLayer in AE) They have a non-zero Source ID in {sl:`ldta`}.

Precomp, image, and similar layers will point to an appropriate asset.

Several layer types point to a solid asset, you need to check the layer
attributes to distinguish between them:

* Solid layers
* Null layers
* Adjustment layers

#### Light Layer

Layer type `1`.

For light settings look for the match name `ADBE Light Options Group`.

#### Camera Layer

Layer type `2`.

For camera settings look for the match name `ADBE Camera Options Group`.

#### Text Layer

Layer type `3`.

For text contents look for the match name `ADBE Text Properties`.


#### Shape Layer

Layer type `4`.

For shapes look for the match name `ADBE Root Vectors Group`.


### Property Groups

Most objects are described as a property groups.

These have the following structure:

* {sl:`LIST` `tdgp`}: Property group
    * {sl:`tdsb`}: Flags
    * {sl:`tdsn`} > {sl:`Utf8`}: Name
    * ... (properties)
    * {sl:`tdmn`}: `ADBE Group End` (marks the end of the group)

Then follows a list of properties, all introduced by their
[match name](#match-names) ({sl:`tdmn`}).

After a match name, you'll find the data for the property, which might
be an actual propert (see the section below), other groups, or layer effects.

This structure is used both for objects (that have a fixed set of properties)
and groups/collections whose contents might vary.

For objects with fixed properties you will not find duplicate match names
but you might find duplicates within collections.


### Properties

Properties, like objects are introduced by their match name, the chunks
following that depends on the type of property.

The core of a property is defined in {sl:`LIST` `tdbs`} with the following structure:

* {sl:`LIST` `tdbs`}: Property definition
    * {sl:`tdb4`}: Tells you the type, number of components, whether it's animated
    * {sl:`cdat`}: Value (if not animated)
    * {sl:`tdsn`}:
        * {sl:`Utf8`}: Human-readable Name
    * {sl:`Utf8`}: Optional expression
    * {sl:`LIST` `list`}: Keyframes (if animated)
        * {sl:`lhd3`}: Tells you the number of keyframes
        * {sl:`ldat`}: Keyframe data and values

For simple properties, with vector or scalar values, you get the structure above.

For more complex properties, you get an outer object that contains that data as well
as a list of values. You'll get the value for the keyframes (or the static value) from that list.

Color properties are laid out as ARGB floats in \[0, 255\].

Note that the keyframe structure in {sl:`ldat`} changes based on the info found in {sl:`tdb4`}.

#### Shape

* {sl:`LIST` `om-s`}
    * {sl:`LIST` `tdbs`}: Property definition
    * {sl:`LIST` `omks`}: Keyframe values
        * {sl:`LIST` `shap`}: Bezier Data (repeated)
            * {sl:`shph`}: Bezier metadata (whether it's closed and bounding box)
            * {sl:`LIST` `list`}
                * {sl:`lhd3`}: Bezier point list metadata
                * {sl:`ldat`}: Bezier points relative to {sl:`shph`}

#### Gradient Colors

* {sl:`LIST` `GCst`}
    * {sl:`LIST` `tdbs`}: Property definition
    * {sl:`LIST` `GCky`}: Keyframe values
        * {sl:`Utf8`} [Gradient XML](#gradient-xml) (repeated)

#### Orientation

* {sl:`LIST` `otst`}
    * {sl:`LIST` `tdbs`}: Property definition
    * {sl:`LIST` `otky`}: Keyframe values
        * {sl:`otda`} 3D vector (repeated)

#### Marker

* {sl:`LIST` `mrst`}
    * {sl:`LIST` `tdbs`}: Property definition
    * {sl:`LIST` `mrky`}: Keyframe values
        * {sl:`Nmrd`} Marker (repeated)
            * {sl:`NmHd`} Marker properties
            * {sl:`Utf8`} Name

#### Text Document

* {sl:`LIST` `btds`}
    * {sl:`LIST` `tdbs`}: Property definition
    * {sl:`LIST` `btdk`}: COS-encoded data

#### Layer

Follows the usual {sl:`LIST` `tdbs`}, check {sl:`tdb4`} for the "Integer" property type.

* {sl:`LIST` `tdbs`}
    * {sl:`tdb4`}
    * {sl:`cdat`}: Should always be `[0.0]`
    * {sl:`tdpi`}: Layer index
    * {sl:`tdps`}: Layer source


#### Mask Index

Follows the usual {sl:`LIST` `tdbs`}, check {sl:`tdb4`} for the "Integer" property type.

* {sl:`LIST` `tdbs`}
    * {sl:`tdb4`}
    * {sl:`cdat`}: Should always be `[0.0]`
    * {sl:`tdli`}: Mask index

#### Mask

* {sl:`mkif`}: Basic mask properties
* {sl:`LIST` `tdgp`}: Animated properties

#### Layer Overrides

* `LIST OvG2`
    * `CprC`: `uint32`?

#### Layer Source Alternate

* `blsv`: `uint32` Layer index?
* `blsi`: `uint32`

#### Chunk naming

Most of property related chunks seem to contain the prefix `td` in their name:

* `tdgp`: property group
* `tdsb`: property group flags
* `tdsn`: property group name
* `tdmn`: property match name
* `tdbs`: property definition
* `tdb4`: property details

I'm not sure what `td` stands for my best guess would be "Track Data".

For properties with external values, the naming convention generally is `XXst` for the parent chunk
and `XXky` for the values (where `XX` changes depending on the type and its meaning is fairly obvious).

I'm not sure what `st` stands for, `ky` most likely stands for "keyframes"

#### Expressions

Bodymovin [modifies expressions](https://github.com/bodymovin/bodymovin-extension/blob/master/src/helpers/expressions/expressions.js)
when converting into lottie, if you add expressions but fail to convert them, the animation
might not play properly.


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

Note that lottie-web wants a unique "name" for these, and the file doesn't provide this
but you can generate one based on the match name.

### Transforms

#### Split Position

When a position is split the Position attribute is removed and you can get the data from Position_0 and Position_1.

For some reason Position_0 and Position_1 are present (with value `0`) even when the position is not split.

Their `tdsb` seems to change from `1` (not split) to `3` (split).

### Effects

The effects used in by the file are defined in the top-level chunk {sl:`LIST` `EfdG`}, instanciations of these effects
are present in the layers that use them.

* {sl:`LIST` `EfdG`}: Effect definitions
    * {sl:`EfDC`}: Effect definition count (number of definitions)
    * {sl:`LIST` `EfDf`}: Effect definition (one per effect type used in the document)
        * {sl:`tdmn`}: Effect match name
        * {sl:`LIST` `sspc`}
            * {sl:`fnam`} > {sl:`Utf8`}: Effect name
            * {sl:`LIST` `parT`}: Effect parameters
                * {sl:`parn`}: Number of parameters
                * {sl:`tdmn`}: Parameter match name
                * {sl:`pard`}: Parameter definition
                * {sl:`pdnm`}: (optional) Parameter control strings
                * You get {sl:`tdmn`} and {sl:`pard`} (optionally followed by {sl:`pdnm`} for each parameter
            * {sl:`LIST` `tdgp`}: Contains the values of the first instance of this effect, can be ignored

Note that the first paramter in an effect should be ignored.

The effects in a later are listed under `ADBE Effect Parade`:

* {sl:`tdmn`}: Effect match name, you'll need to find the matching definition
* {sl:`LIST` `sspc`}
    * {sl:`fnam`} > {sl:`Utf8`}: Effect name
    * {sl:`LIST` `parT`}: You might find this here as well but it isn't consistent. Refer to {sl:`LIST` `EfdG`} for the definition
    * {sl:`LIST` `tdgp`}: Parameter values, works like any other property list


### Essential Graphics

#### Definition

Essential graphics are defined in the following chunks inside the comp's {sl:`LIST` `Item`}:

* {sl:`LIST` `CIF0`}
* {sl:`LIST` `CIF2`}
* {sl:`LIST` `CIF3`}

They seem to have the same structure and (almost) identical values. But only `CIF3`
has data about groups:

* {sl:`LIST` `CIF3`}
    * {sl:`LIST` `CpS2`}
        * `CsCt`: seems to always have the value `0x1000000`.
        * {sl:`Utf8`}: Name (Defaults to `Untitled`)
        * {sl:`Utf8`}: Locale? (`en_US`)
    * {sl:`CapS`}
        * `CsCt`: seems to always have the value `0x1000000`.
        * `CapL`: seems to always have the value `0`.
        * {sl:`Utf8`}: Name (again, same value as before)
    * {sl:`LIST` `CCtl`}: Item (repeated)

Items have the following common structure

* {sl:`LIST` `CCtl`}
    * {sl:`LIST` `CpS2`}
        * {sl:`Utf8`}: Name
    * {sl:`LIST` `CapS`}
        * {sl:`Utf8`}: Name (again)
    * {sl:`Utf8`}: UUID
    * {sl:`CTyp`}: item type
    * {sl:`CprC`}: Flags
    * Type-specific data

##### Comment

* {sl:`CTyp`}: `8`
* {sl:`Utf8`}: Comment string
* {sl:`Utf8`}: Comment string (again)
* {sl:`CprC`}: `0`

##### Group


* {sl:`CTyp`}: `8`
* {sl:`LIST` `StVc`}: Items
    * {sl:`StVS`}: Count
    * {sl:`Utf8`}: UUID of child items (repeated)
* {sl:`CprC`}: `0`

##### Property

* {sl:`CVal`}: Value
* {sl:`CDef`}: Default Value
* {sl:`Smin`}: Slider min value (only for scalar properties)
* {sl:`Smax`}: Slider max value (only for scalar properties)
* {sl:`CDim`}: Number of dimenstions (only for vector properties)
* {sl:`LIST` `StVc`}: Enum values (only for enum properties)
    * {sl:`StVS`}: Count
    * {sl:`Utf8`}: Value name (repeated)
* {sl:`CprC`}: `1`
* {sl:`LIST` `CPrp`}
    * {sl:`CCId`}: Composition ID (same as the one in {sl:`idta`}).
    * {sl:`CLId`}: Layer ID (same as the one in {sl:`ldta`}).
    * {sl:`Utf8`}: JSON-ecoded path.

The JSON is a dict where the key is a string containing a number and the values are dicts like this:

* `index`: Index for like shape groups and such, or the value `4294967295` (`0xffffffff`) is used when there is no index
* `matchName`: Match name as per usual

To find the property, something like this might work:

```python
CCId = 15
CLId = 18
json_data = {
    "0": {
        "index":4294967295,
        "matchName":"ADBE Root Vectors Group"
    },
    "1": {
        "index":0,
        "matchName":"ADBE Vector Group"
    },
    "2": {
        "index":4294967295,
        "matchName":"ADBE Vectors Group"
    },
    "3": {
        "index":2,
        "matchName":"ADBE Vector Graphic - Fill"
    },
    "4": {
        "index":4294967295,
        "matchName":"ADBE Vector Fill Opacity"
    }
}

property = get_layer(CCId, CLId)

for item in json_data.values():
    if item["index"] == 0xffffffff:
        property = property.property(item["matchName"])
    else:
        property = property.properties[item["index"]]
```


The values in `Smin`, `Smax`, `CVal`, `CDef` depends on the type, refer to {sl:`CTyp`} for their representation.


#### Overrides

Defined in the precomp layer under match name `ADBE Layer Overrides`

* {sl:`tdmn`}: `ADBE Layer Overrides`
* {sl:`LIST` `OvG2`}
    * {sl:`LIST` `CPrp`}: (repeated)
        * {sl:`Utf8`}: UUID of the essential property
* {sl:`LIST` `tdgp`}: Property groups with the matching properties defined as usual.


## Match Names

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
ADBE Marker : Markers
ADBE Mask Parade : prop=masksProperties
ADBE Plane Options Group :
ADBE Data Group :
ADBE Layer Overrides : Essential graphincs values
ADBE Source Options Group :

{aep_mn}
ADBE Camera Options Group : object=layers/camera-layer : Marks a layer as a camera layer
ADBE Camera Aperture : prop=pe
ADBE Camera Zoom :

{aep_mn}
ADBE Mask Atom : object=helpers/mask
ADBE Mask Shape : prop=pt
ADBE Mask Offset : prop=x : 0
ADBE Mask Feather : : \[0, 0\]
ADBE Mask Opacity : prop=0 : 100

{aep_mn}
ADBE Extrsn Options Group :
ADBE Bevel Direction :

{aep_mn}
ADBE Material Options Group :
ADBE Appears in Reflections :
ADBE Reflection Coefficient :
ADBE Glossiness Coefficient :
ADBE Fresnel Coefficient :
ADBE Transparency Coefficient :
ADBE Transp Rolloff :
ADBE Index of Refraction :

{aep_mn}
ADBE Source Options Group :
ADBE Layer Source Alternate

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
ADBE Vector Grad End Pt : prop=e : \[100, 0\]
ADBE Vector Grad HiLite Length : prop=h
ADBE Vector Grad HiLite Angle : prop=a
ADBE Vector Grad Colors : prop=g [^gradient]
ADBE Vector Fill Opacity : prop=o : 100
ADBE Vector Fill Rule : prop=r [^enum] : 1
ADBE Vector Composite Order : if 2, it should be drawn over the previous shape : 1

{aep_mn}
ADBE Vector Graphic - G-Stroke : object=shapes/gradient-stroke
ADBE Vector Blend Mode : prop=bm [^enum][^blend]
ADBE Vector Grad Type: prop=t
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
ADBE Orientation: prop=or
ADBE Rotate X: prop=rx
ADBE Rotate Y: prop=ry
ADBE Rotate Z: prop=rz or just normal rotation : 0
ADBE Opacity: prop=o [^100] : 1
ADBE Envir Appear in Reflect: Single float, probably a boolean?

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
ADBE Tint : object=effects/tint-effect : `ty`=`20`
ADBE Fill : object=effects/fill-effect : `ty`=`21`
ADBE Stroke : object=effects/stroke-effect : `ty`=`22`
ADBE Tritone : object=effects/tritone-effect : `ty`=`23`
ADBE Pro Levels2 : object=effects/pro-levels-effect : `ty`=`24`
ADBE Drop Shadow : object=effects/drop-shadow-effect : `ty`=`25`
ADBE Radial Wipe : object=effects/radial-wipe-effect : `ty`=`26`
ADBE Displacement Map : object=effects/displacement-map-effect : `ty`=`27`
ADBE Set Matte3 : object=effects/matte3-effect : `ty`=`28`
ADBE Gaussian Blur 2 : object=effects/gaussian-blur-effect : `ty`=`29`
ADBE Twirl : object=effects/twirl-effect : `ty`=`30`
ADBE MESH WARP : object=effects/mesh-warp-effect : `ty`=`31`
ADBE Ripple : object=effects/wavy-effect : `ty`=`32`
ADBE Spherize : object=effects/spherize-effect : `ty`=`33`
ADBE FreePin3 : object=effects/puppet-effect : `ty`=`34`

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

### Text

{aep_mn}
ADBE Text Properties : object=text/text-data
ADBE Text Document : prop=d
ADBE Text Path Options : prop=p
ADBE Text More Options : prop=m
ADBE Text Animators : prop=a

{aep_mn}
ADBE Text Animator : object=text/text-range
ADBE Text Selectors : prop=s (list)
ADBE Text Animator Properties : prop=a

{aep_mn}
ADBE Text Selector : object=text/text-range-selector
ADBE Text Percent Start : prop=s : 0
ADBE Text Percent End : prop=e : 100
ADBE Text Percent Offset : prop=o : 0
ADBE Text Index Start  : prop=s
ADBE Text Index End  : prop=e
ADBE Text Index Offset  : prop=o
ADBE Text Range Advanced :
ADBE Text Selector Mode
ADBE Text Selector Max Amount : prop=a
ADBE Text Selector Smoothness : prop=sm
ADBE Text Levels Max Ease : prop=xe
ADBE Text Levels Min Ease : prop=ne
ADBE Text Random Seed : prop=rn

{aep_mn}
ADBE Text Animator Properties : object=text/text-style
ADBE Text Anchor Point 3D : prop=a
ADBE Text Position 3D : prop=p
ADBE Text Scale 3D : prop=s
ADBE Text Skew : prop=sk
ADBE Text Skew Axis : prop=sa
ADBE Text Rotation X : prop=rx
ADBE Text Rotation Y : prop=ry
ADBE Text Rotation : prop=r
ADBE Text Opacity : prop=o
ADBE Text Fill Color : prop=fc
ADBE Text Fill Opacity : prop=fo
ADBE Text Fill Hue : prop=fh
ADBE Text Fill Saturation : prop=fs
ADBE Text Fill Brightness : prop=fb
ADBE Text Stroke Color : prop=sc
ADBE Text Stroke Opacity : prop=so
ADBE Text Stroke Hue : prop=sh
ADBE Text Stroke Saturation : prop=ss
ADBE Text Stroke Brightness : prop=sb
ADBE Text Stroke Width : prop=sw
ADBE Text Line Spacing : prop=ls
ADBE Text Line Anchor :
ADBE Text Track Type :
ADBE Text Tracking Amount :
ADBE Text Character Replace :
ADBE Text Character Offset :
ADBE Text Blur :

{aep_mn}
ADBE Text Path Options : object=text/text-follow-path
ADBE Text Path : prop=m
ADBE Text Reverse Path : prop=r
ADBE Text Perpendicular To Path : prop=p
ADBE Text Force Align Path : prop=a
ADBE Text First Margin : prop=f
ADBE Text Last Margin : prop=l

{aep_mn}
ADBE Text More Options : object=text/text-alignment-options
ADBE Text Anchor Point Option : prop=g : 1
ADBE Text Anchor Point Align : prop=a : \[0, 0\]
ADBE Text Render Order : : 1
ADBE Text Character Blend Mode : : 1


### Misc

{aep_mn}
ADBE Group End : Indicates the end of a {sl:`LIST` `tdgp`}

<!--
to verify:
ADBE Vector Offset Copies (offset path)
ADBE Vector Offset Copy Offset (offset path)
ADBE Vector Trim Type
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

Most enumerated values are the same in Lottie and AEP, this section lists the exceptions to this and enums not in lottie


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


<!--
I've seen these values but I cannot verify them:
|Linear Burn    | 6 |27 |
|Darker Color   | 7 |22 |
|Linear Dodge   | 12|28 |
|Lighter Color  | 13|26 |
|Linear Light   | 18|29 |
|Vivid Light    | 19|37 |
|Pin Light      | 20|31 |
-->

### Text Render Oder

1. Per character palette
2. Fills over strokes
3. Strokes over fills


Chunk Data
----------

Note that chunks might have extra data after what is described here,
always parse exactly as many bytes as specified in the chunk header.

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


### `cmta`

Comment, NUL-terminated string. The size seems to be variable but rounded to 4 bytes.


### `fdta`

Folder data.

### `cdta`

Composition data.

|Field Name             |Size|  Type  | Description             |
|-----------------------|----|--------|-------------------------|
| X Resolution          | 2  |`uint16`|                         |
| Y Resolution          | 2  |`uint16`|                         |
|                       | 1  |        |                         |
| Time Scale            | 2  |`uint16`| How much Time values are scaled by |
|                       | 14 |        |                         |
| Playhead              | 2  |  Time  | Playhead time           |
|                       | 6  |        |                         |
| In Time               | 2  |  Time  | Same as `ip` in Lottie  |
|                       | 6  |        |                         |
| Out Time              | 2  |  Time  | Same as `op` in Lottie  |
|                       | 6  |        |                         |
| Comp duration         | 2  |  Time  | Duration setting in AE  |
|                       | 5  |        |                         |
| Color                 | 3  |`bytes` | Color as 24 bit RGB     |
|                       | 84 |        |                         |
| Attributes            | 1  | Flags  |                         |
| Width                 | 2  |`uint16`| Same as `w` in Lottie   |
| Height                | 2  |`uint16`| Same as `h` in Lottie   |
| Pixel Ratio Width     | 4  |`uint32`|                         |
| Pixel Ratio Height    | 4  |`uint32`|                         |
|                       | 12 |        |                         |
| Framerate             | 2  |`uint16`| Same as `fr` in Lottie  |
|                       | 16 |        |                         |
| Shutter Angle         | 2  |`uint16`|                         |
| Shutter Phase         | 4  |`sint16`|                         |
|                       | 16 |        |                         |
| Samples Limit         | 4  |`sint16`|                         |
| Samples per frame     | 4  |`sint16`|                         |


Note that End Time might have a value of FFFF, if that's the case assume it to be the same as Comp Duration.

The X/Y resolution represent a divisor of the size in that direction used for rendering.
For example a X Resolution of 5, with a width of 500 will yield an output of 100px.

The pixel ratio is represented as a fraction of width/height, if both values are 1 you get square pixels.

Attributes:

* Shy: (0, 0): Hides Shy layers from the timeline
* Motion Blur: (0, 3): Allows layers to enable motion blur
* Frame Blending: (0, 4): Allows layers to enable frame blending
* Preserve Framerate: (0, 5): Something about nested render queues
* Preserve Resolution: (0, 7): Something about nested render queues

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
|                   | 17 |          | |
| Label Color Index | 1  | `uint8`  | Color on the timeline |
|                   | 2  |          | |
| Layer Name        | 32 | `string0`| It's repeated in the {sl:`Utf8`} chunk right after |
|                   | 11 |          | |
| Matte Mode        | 1  | `uint8`  | |
| Layer Type        |  1 | `uint8`  | |
| Parent ID         |  4 | `uint32` |ID of the parent layer, if any |
|                   | 24 |          | |
| Matte Layer ID    | 4  | `uint32` | Id of the layer masking the current layer, if any (only for AE >= 23) |


With the following Attributes:

* _Guide_: (0, 1) Guide layers aren't rendered
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

* 0: Asset Layer
* 1: Light Layer
* 2: Camera Layer
* 3: Text Layer
* 4: Shape Layer


Label Colors:

0. None (shows as grey)
1. Red
2. Yellow
3. Aqua
4. Pink
5. Lavender
6. Peach
7. Sea Foam
8. Blue
9. Green
10. Purple
11. Orange
12. Brown
13. Fuchsia
14. Cyan
15. Sandstone
16. Dark Green

Matte Modes:

0. No Matte
1. Alpha
2. Inverted Alpha
3. Luma
4. Inverted Luma

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
| Type?             | 4  | Flags    | See below     |
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

* _No Value_: (1, 0). Used for properties like shapes, gradients, etc, where the values are not in the keyframe.
* _Integer_: (3, 2).
* _Vector_?: (3, 3).
* _Color_: (3, 0). Set for color properties (they have a different keyframe format).

For _Integer_ type, you might have indexed values:
For layers, the value will be in {sl:`tdpi`} / {sl:`tdps`},
for masks it will be in {sl:`tdli`}.


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

|Field Name         |Size| Type         | Description                                           |
|-------------------|----|--------------|-------------------------------------------------------|
|                   | 1  |              |                                                       |
| Time              | 2  | Time         | Time of the keyframe, seems they always start from 0. |
|                   | 2  |              |                                                       |
| Ease Mode         | 1  | `uint8`      |                                                       |
| Label Color       | 1  | `uint8`      | Color index, see {sl:`ldta`} for values               |
| Attributes        | 1  | Flags        |                                                       |

Ease Mode:
1. Linear
2. Ease
3. Hold


Attributes:

Least significant 3 bits seems to always be on.

* Continuous Bezier (0, 3)
* Auto Bezier (0, 4)
* Roving across time (0, 5)


#### Keyframe - Multi-Dimensional

Given `n` as the number of dimensions found in {sl:`tdb4`} (eg: 3 for 3D positions):

|Field Name         |Size|   Type       | Description |
|-------------------|----|--------------|-------------|
| Value             |8* n|`float64[n]`  | Value       |
| In Speed          |8* n|`float64[n]`  | |
| In Influence      |8* n|`float64[n]`  | |
| Out Speed         |8* n|`float64[n]`  | |
| Out Influence     |8* n|`float64[n]`  | |

#### Keyframe - Position

If the property is an animated position, the keyframe is formatted like so:

|Field Name         |Size|   Type       | Description |
|-------------------|----|--------------|-------------|
|                   | 8  |              | |
|                   | 8  |`float64`     | |
| In Speed          | 8  |`float64`     | |
| In Influence      | 8  |`float64`     | |
| Out Speed         | 8  |`float64`     | |
| Out Influence     | 8  |`float64`     | |
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
|                   | 8  |              | |
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

### `fiac`

Folder item active, `uint8` if it's 1 the previous {sl:`List Item`} is the active item.

### `wsnm`

Worspace name.

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


|Field Name     |Size|Type      | Description   |
|---------------|----|----------|---------------|
|AE Version?    | 6  |          |               |
|               | 12 |          |               |
|File Revision? | 2  |`uint16`  | Increases by 2 every time you save |

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

|Field Name         |Size|Type      | Description   |
|-------------------|----|----------|---------------|
|                   | 15 |          |               |
| Type              |  1 |`uint8`   |Parameter type |
| Name              | 32 |`string0` |               |
|                   |  8 |          |               |

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
|3D         |`18`| `3`  |{ref-link:effect-values/point}     |

After the data above, there is more data that depends on the type

#### Layer

Doesn't seem to have much data


#### Scalar / Angle

|Field Name         |Size|Type      | Description   |
|-------------------|----|----------|---------------|
|Last value         |  4 |`sint32`  |               |
|                   |  4 |          |               |
|                   | 64 |          |               |
|                   |  4 |          |               |
|Min Value          |  2 |`sint16`  |               |
|                   |  2 |          |               |
|Max Value          |  2 |`sint16`  |               |

To get the last value, you need to divide the raw value by `0x10000`.

#### Boolean

|Field Name         |Size|Type      | Description   |
|-------------------|----|----------|---------------|
|Last used value    |  4 |`uint32`  |               |
|Default            |  1 |`uint8`   |               |
|                   |  3 |          |               |
|                   | 64 |          |               |
|                   |  4 |`float32` |               |
|                   |  4 |          |               |
|                   |  4 |`float32` |               |

#### Color

|Field Name         |Size|Type      | Description   |
|-------------------|----|----------|---------------|
|Last used value    |  4 |`uint8[4]`| ARGB          |
|Default            |  4 |`uint8[4]`| ARGB          |
|                   | 64 |          |               |
|Max Value          |  4 |`uint8[4]`| ARGB          |

#### 2D

|Field Name         |Size|Type      | Description   |
|-------------------|----|----------|---------------|
|Last value X       |  4 |`sint32`  |               |
|Last value Y       |  4 |`sint32`  |               |

Last value x/y are multiplied by 0x80, so divide them to get the right value.

#### Enum

|Field Name         |Size|Type      | Description   |
|-------------------|----|----------|---------------|
|Last used value    |  4 |`uint32`  |               |
|Option count       |  2 |`uint16`  |               |
|Default            |  2 |`uint16`  |               |

#### Slider

|Field Name         |Size|Type      | Description   |
|-------------------|----|----------|---------------|
|Last used value    |  8 |`float64` |               |
|                   | 44 |          |               |
|                   |  4 |`float32` |               |
|                   |  4 |          |               |
|Max Value          |  4 |`float32` |               |


#### 3D Point

|Field Name         |Size|Type      | Description   |
|-------------------|----|----------|---------------|
|Last value X       |  8 |`float64` |               |
|Last value Y       |  8 |`float64` |               |
|Last value Z       |  8 |`float64` |               |

You need to multiply the "Last value" components by 512 to get the actual values.

#### `pdnm`

Effect parameter definition name / strings.

This will contain strings used by the widget in the effect controls of the preceding {sl:`pard`}.

For example if the type in the {sl:`pard`} is `4` (Boolean) the name of the parameter might be
empty and it will be in `pdnm` as that's how AE displays it.

For Enum (type `7`), you get the drop down strings separated by `|`.


#### `tdpi`

Layer index for index properties (`uint32`).

#### `tdps`

Layer source for index properties (`sint32`).

* `0`: Layer
* `-1`: Effects & Masks
* `-2`: Masks

#### `tdli`

Mask index for index properties (`uint32`).

### `prin`

Seems to always have the same content:

4 `00` bytes, the string `ADBE Escher`, 37 `00`, the string `Classic 3D`,
41 `00`, and ends with `01`.

### `prda`

Seems to always have the same content: 3 `00`, a `01`, 8 `00`.

### `NmHd`

Marker attributes

|Name           |Size| Type     | Description                               |
|---------------|----|----------|-------------------------------------------|
|               | 3  |          |                                           |
| Attributes    | 1  | Flags    |                                           |
| Duration      | 4  | `uint32` | Duration in frames                        |
|               | 4  |          |                                           |
| Label Color   | 1  | `uint8`  | Color index, see {sl:`ldta`} for values   |

Flags:

* _Protected_: (0, 1) The marker signals a protected region
* _???_: (0, 2) This flags seems to always be on


### `tdsb`

4 bytes specifying flags for a `tdgp`.

the least significant bit marks if an object is visible.

### `mkif`

Mask properties.

|Name       |Size| Type     |
|-----------|----|----------|
| Inverted  | 1  | `uint8`  |
| Locked    | 1  | `uint8`  |
|           | 4  |          |
| Mode      | 2  | `uint16` |

Mask Modes:

* 0: None
* 1: Add
* 2: Subtract
* 3: Intersect
* 4: Darken
* 5: Lighten
* 6: Difference


### `CCId`

Composition ID for essential graphics properties (`uint32`)

### `CLId`

Layer ID for essential graphics properties (`uint32`)

### `Smin`

Essential graphics slider minimum value.

Representation depends on the value of the previous {sl:`CTyp`}.

### `Smax`

Essential graphics slider maximum value.

Representation depends on the value of the previous {sl:`CTyp`}.

### `CVal`

Essential graphics property current value.

Representation depends on the value of the previous {sl:`CTyp`}.

### `CDef`

Essential graphics property default value.

Representation depends on the value of the previous {sl:`CTyp`}.


### `CTyp`

`uint32` with the essential graphics item type


| Name      |Type | Value Format    |
|-----------|-----|-----------------|
| Scalar    | `2` | `float64`       |
| Color     | `4` | `float32[4]`    |
| Position  | `5` | `float64[2]`    |
| Comment   | `8` |                 |
| Vector    | `9` | `float64[4]`    |
| Group     |`10` |                 |
| Enum      |`13` | `uint32`        |


### `CprC`

Essential graphics flags (4bytes)

* Is property (3, 0)

### `StVS`

Essential graphics group item count


|Name       |Size| Type     |
|-----------|----|----------|
| Count     | 1  | `uint8`  |
|           | 3  |          |


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

Defines an object / property group.

Flags for the objects are in {sl:`tdsb`}.

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

Contains a {sl:`LIST` `tdbs`} and a {sl:`LIST` `omks`} to define a shape property.

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

`SLay` (Side views?) have names like "Top" and "Front", perhaps they define 3d views.

`CLay`: Custom views.

`DLay`: Default views.

### `LIST` `SecL`

Composition Markers Layer.

Contains `ldta` and like other layers.

in {sl:`LIST` `tbgp`} look for the match name `ADBE Marker`, the data is in
the {sl:`LIST` `mrst`}.

### `LIST` `mrst`

Marker property.

Contains a {sl:`LIST` `tdbs`} that defines the property, which should always be animated
when present.

Marker keyframe values are available in {sl:`LIST` `mrky`}.

### `LIST` `mrky`

Marker keyframes.

contains a {sl:`LIST` `Nmrd`} for each keyframe

### `LIST` `Nmrd`

Marker data

There's a {sl:`NmHd`} with the attributes.

The marker comment is in the first {sl:`Utf8`}

### `LIST` `otst`

Orientation property.

Contains a  {sl:`LIST` `tdbs`} and a {sl:`LIST` `otky`} to define a shape property.

### `LIST` `otky`

Contains a sequence of {sl:`otda`} with the orientation data for each keyframe.


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


### `LIST` `Pin `

Asset properties.

Contains:

* {sl:`sspc`} with some common properties
* {sl:`Utf8`} with the name (except for solids)
* {sl:`opti`} with asset data


### `LIST` `CIF0`

See {sl:`LIST` `CIF3`}.

### `LIST` `CIF2`

See {sl:`LIST` `CIF3`}.

### `LIST` `CIF3`

{sl:Essential Graphics} Definition.

### `LIST` `CCtl`

Essential graphics item.


### `LIST` `CpS2`

Essential graphics header.


### `LIST` `StVc`

Essential graphics group items

### `LIST` `CPrp`

Essential graphics property definition

### `LIST` `OvG2`

Essential graphics override property identifiers

### `LIST` `CPrp`

Essential graphics override property identifier


## Gradient XML

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
                            0.5, // midpoint
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
                        0.5, // midpoint
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

### Midpoint

You should use the "midpoint" values to add an additional color which is halfway between the other two.

For example given these stops:
```js
    "Stop-0":
    {
        "Stops Color":
        [
            0.0, // offset
            0.5, // midpoint
            0.1, // red
            0.2, // green
            0.3, // blue
            1.0  // alpha?
        ]
    },
    "Stop-0":
    {
        "Stops Color":
        [
            0.6, // offset
            0.5, // midpoint
            0.3, // red
            0.4, // green
            0.5, // blue
            1.0  // alpha?
        ]
    },
```

The final gradient will look like this:
```js
[
    // stop 0
    0.0, // offset_0
    0.1, // red_0
    0.2, // green_0
    0.3, // blue_0
    // midpoint stop
    0.3, // offset_0 * (1 - midpoint_0) + offset_1 * midpoint_0
    0.2, // (red_0 + red_1) / 2
    0.3, // (green_0 + green_1) / 2
    0.4, // (blue_0 + blue_1) / 2
    // stop 1
    0.6, // offset_1
    0.5, // midpoint_1
    0.3, // red_1
    0.4, // green_1
    0.5, // blue_1
]
```

### Opacity

For some reason in AE gradients alpha is independent from the color, so you have separate stops for
color and opacity.

You should treat the midpoint value for opacity stops in a similar way as to the color ones.

Once you have both the color and opacity values, the final lottie array is simply a concatenation of the two.

## XMP Metadata

After the RIFX data, an AEP file also contains some XML in the
[XMP](https://en.wikipedia.org/wiki/Extensible_Metadata_Platform) format.

This section contains the version of AfterEffects, when the file has been
created and modified, and related info.


## XML Project Format

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


## Resources

* [aftereffects-aep-parser](https://github.com/boltframe/aftereffects-aep-parser) A basic AEP parser written in Go.
* [Multimedia Programming Interface and Data Specifications 1.0](https://www-mmsp.ece.mcgill.ca/Documents/AudioFormats/WAVE/Docs/riffmci.pdf) RIFF specs PDF.
* [Floating Point to Hex Converter](https://gregstoll.com/~gregstoll/floattohex/) Float to hex converter.
* [bodymovin-extension](https://github.com/bodymovin/bodymovin-extension) AE extensions that exports to Lottie
* [After Effects Scripting Guide](https://ae-scripting.docsforadobe.dev/)
* [Shape Layer Match Names](https://ae-scripting.docsforadobe.dev/matchnames/layer/shapelayer.html)
* [Portable document format — Part 1: PDF 1.7](https://web.archive.org/web/20141020130815/http://wwwimages.adobe.com/content/dam/Adobe/en/devnet/pdf/pdfs/PDF32000_2008.pdf) The only COS reference I've found
