# Animation

This is the top-level JSON object, describing the document, layers, assets, etc.

The size of the canvas is determined by `w` and `h`. Duration is expressed in frames with `op`, and the framerate is in `fr`.

Most of the contents are in [`layers`](layers.md) and [`assets`](assets.md).

{schema_object:composition/animation}


<h2 id="composition">Composition</h2>

{schema_string:composition/composition/description}

{schema_object:composition/composition}


## Metadata

Some (but not all) lottie files will have a metadata object describing the
program used to create the file and other useful information:

### Document Metadata

{schema_object:composition/metadata}

### User Metadata

{schema_object:composition/user-metadata}

## Motion Blur

{schema_object:composition/motion-blur}
