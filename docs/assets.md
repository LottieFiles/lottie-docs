## Assets

Assets are usually referenced by [layers](layers.md) of the appropriate type.

### Image

Represents a (static) image

{schema_object:assets/image}
EXPAND:#/$defs/assets/asset

If the image is embedded, `u` is empty and `p` contains a base64-encoded data url:

```json
{
    "id": "my image",
    "h": 512,
    "w": 512,
    "e": 1,
    "u": "",
    "p": "data:image/png;base64,..."
}
```

If the image is not embedded,
`u` will contain the path to the directory containing the image
and `p` will have the filename.

So for example if you want to store the image at `/path/to/images/image.png`,
the asset will look something like this:

```json
{
    "id": "my image",
    "h": 512,
    "w": 512,
    "e": 0,
    "u": "/path/to/images/",
    "p": "image.png"
}
```

It works similarly for external images.
If you want to store the image at `https://example.com/images/image.png`, you'd have:

```json
{
    "id": "my image",
    "h": 512,
    "w": 512,
    "e": 0,
    "u": "https://example.com/images/",
    "p": "image.png"
}
```

### Sound

Similar to [Image](#image) but for audio files.

{schema_object:assets/sound}
EXPAND:#/$defs/assets/asset


### Precomposition

You can think of precompositions as self-contained animation within the main animation file.

You can reference them using [precomp layers](layers.md#precomp-layer).

This has two main uses:

The first is to have multiple instances of an animated item in your animation.

The second is to organize the animation into separate components, each edited separately.

Within a precomposition you can have precomp layers showing other precompositions,
as long as you don't create a dependency cycle.

{schema_object:assets/precomposition}
EXPAND:#/$defs/animation/composition
EXPAND:#/$defs/assets/asset
layers:An array of [layers](layers.md) (See: [Lists of layers and shapes](concepts.md#lists-of-layers-and-shapes))


Follows a rather extreme example, that uses precompositions inside precompositions to generate a fractal:

{lottie:fractal.json:512:512}
