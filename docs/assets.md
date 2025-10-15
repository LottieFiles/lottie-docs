# Assets

Assets are usually referenced by [layers](layers.md) of the appropriate type.

<h2 id="asset">Asset</h2>

{schema_string:assets/asset/description}

{schema_object:assets/asset}


<h2 id="file-asset">File Asset</h2>

{schema_string:assets/file-asset/description}

{schema_object:assets/file-asset}

### Image

Represents a (static) image

{schema_object:assets/image}

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


### Precomposition

You can think of precompositions as self-contained animation within the
main animation file that can be referenced using [precomp layers](layers.md#precomposition-layer).

Within a precomposition you can have precomp layers showing other precompositions,
as long as you don't create a dependency cycle.

You can find more details in the [Precompositions](breakdown/precomps.md) page.

{schema_object:assets/precomposition}

Follows a rather extreme example, that uses precompositions inside precompositions to generate a fractal:

{lottie src="static/examples/fractal.json"}


### Data Source

Points to a JSON file for data.

{schema_object:assets/data-source}
