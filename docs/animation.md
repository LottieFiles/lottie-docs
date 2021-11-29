# Animation

This is the top-level JSON object, describing the document, layers, assets, etc.

The size of the canvas is determined by `w` and `h`. Duration is expressed in frames with `op`, and the framerate is in `fr`.

Most of the contents are in [`layers`](layers.md) and [`assets`](assets.md).

{schema_object:animation/animation}
EXPAND:#/$defs/animation/composition
EXPAND:#/$defs/helpers/visual-object
assets: An array of [assets](assets.md)
layers: An array of [layers](layers.md) (See: [Lists of layers and shapes](concepts.md#lists-of-layers-and-shapes))
v: Lottie version, on very old versions some things might be slightly different from what is explained here
ddd: Whether the animation has 3D layers. Lottie doesn't actually support 3D stuff so this should always be 0

## Metadata

Some (but not all) lottie files will have a metadata object describing the
program used to create the file and other useful information:

{schema_object:animation/metadata}

## Motion Blur

{schema_object:animation/motion-blur}


## Marker

{schema_object:helpers/marker}

