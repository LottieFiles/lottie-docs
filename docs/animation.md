# Animation

This is the top-level JSON object, describing the document, layers, assets, etc.

The most notable attributes are:

|Attribute|Type|Description|
|---------|----|-----------|
|`w`, `h`   |`number`|Width and height of the animation|
|`fr`       |`number`|Framerate (frames per second)|
|`ip`       |`number`|"In Point", which frame the animation starts at (usually 0)|
|`op`       |`number`|"Out Point", which frame the animation stops/loops at, which makes it the duration in frames|
|`assets`   |`array` |An array of [assets](assets.md)
|`layers`   |`array` |An array of [layers](layers.md) (See: [Lists of layers and shapes](concepts.md#lists-of-layers-and-shapes))
|`v`        |`string`|Lottie version, on very old versions some things might be different from what is explained here|
|`ddd`|[0-1 `int`](concepts.md#booleans)|Whether the animation has 3D layers. Lottie doesn't actually support 3D stuff so this should always be 0|

Also has attributes from [Visual Object](concepts.md#visual-object).

