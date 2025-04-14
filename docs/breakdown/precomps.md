# Precompositions

This page will explain Precompositions (or precomps for short),
which are a defining feature of the Lottie format which allows for great
flexibility in effects and organization of animation files.

## What are Precompositions?

In short, a precomposition is an animation embedded inside another
animation, of which you can control playback.

Once you have a precomposition, you can use layers to reference it
in various parts of the animation to avoid repeating elements.


## How do Precompositions work in a Lottie?

The main object is the [Precomposition Asset](../assets.md#precomposition).
Its structure is very simple, just an asset identifier and a list of layers.

By itself a precomposition asset doesn't do much, it needs to be
referenced by a [Precomposition Layer](../layers.md#precomposition-layer).

You can think of the precomp asset to be similar to a video asset,
and the layer plays back the animation defined by that asset.


Follows a simple example:

First we start with a file without precomps:

{lottie src="static/examples/precomp/star-nocomp.json"}

And the same animation but using a precomp:

{lottie src="static/examples/precomp/star-comp.json"}

Now let's have a look at how the JSON changed:


This is the original animation, nothing special about it:
```js
{
    "nm": "Animation",
    "ip": 0,
    "op": 60,
    "fr": 60,
    "w": 512,
    "h": 512,
    "assets": [],
    "layers": [
        {
            "nm": "Shape Layer",
            "ty": 4,
            "ind": 0,
            "st": 0,
            "ip": 0,
            "op": 60,
            "ks": {},
            "shapes": [/* ... */]
        }
    ]
}
```

And this is the version using a precomposition:
```js
{
    "nm": "Animation",
    "ip": 0,
    "op": 60,
    "fr": 60,
    "w": 512,
    "h": 512,
    "assets": [
        {
            "id": "Star",
            "layers": [
                {
                    "nm": "Shape Layer",
                    "ty": 4,
                    "ind": 0,
                    "st": 0,
                    "ip": 0,
                    "op": 60,
                    "shapes": [/* ... */]
                }
            ]
        }
    ],
    "layers": [
        {
            "nm": "Precomp Layer",
            "refId": "Star"
            "ty": 0,
            "ind": 0,
            "st": 0,
            "ip": 0,
            "op": 60,
            "w": 512,
            "h": 512,
            "ks": {}
        }
    ],
}
```

As you can see, the layers in the original animation have been moved to
an asset (in this example there was only one layer but it works the same
when you have multiple layer).

And in `layers` of the outer animation there is a single layer
referencing the new asset.

The structure of the [asset](../assets.md#precomposition) is fairly
straightforward: a unique identifier (`Star` in the example) and the
list of layers in the precomposition.

The [layer](../layers.md#precomposition-layer) has the usual attributes
you can find on visual layers and a couple others:
`refId` is the identifier of the precomp the layer is referencing,
`w` and `h` define the clipping rectangle for the composition, in this
case they match the value in the outer animation.

### Important things to note

A precomp doesn't contain assets, but it can reference assets defined in
the main animation object. It can also reference other precomps.

Layer indexes are unique in each composition: you can have a layer with
index `0` in multiple precomps and in the main animation, references
to these (such as when parenting layers) are relative to the composition.

You need to always specify `w` and `h` in the precomp layer or nothing
will be displayed.

## What can you do with Precompositions?

In this section we'll describe some example use case including the
initial animations and the result to compare how a file needs to be
changed to obtain certain effects.

### Resizing

If you need to resize an animation, the best way of doing it is by
precomposing all its layers and then scale the precomp layer.

While for simple examples you'd might be able to get away with scaling
all the layers in the original animation, it gets complicated if you
have parented layers or transforms applied to some of the layers.

Note that in the example below `w` and `h` keep their initial value
and only the scale is changed.

<lottie-playground example="precomp/star-comp.json">
    <input title="Scale" type="range" min="10" value="50" max="200" />
<json>{...lottie, assets:["..."]}</json>
<script>
lottie.w = lottie.h = 512 * data["Scale"] / 100;
lottie.layers[0].ks.s = {
    a: 0,
    k: [
        data["Scale"], data["Scale"]
    ]
};
</script>


### Speeding up and Slowing down

Similarly, you can use time stretch to speed up and slow down an animation:


<lottie-playground example="precomp/star-comp.json">
    <input title="Speed" type="range" min="10" value="50" max="200" />
<json>{...lottie, assets:["..."]}</json>
<script>
var time_mult = 100 / data["Speed"];
lottie.op = 60 * time_mult;
lottie.layers[0].op = 60 * time_mult;
lottie.layers[0].sr = time_mult;
</script>

You can also change the start time to delay the start of the precomp playback:


<lottie-playground example="precomp/star-comp.json">
    <input title="Start" type="range" min="0" value="30" max="60" />
    <input title="Speed" type="range" min="10" value="50" max="200" />
<json>{...lottie, assets:["..."]}</json>
<script>
var time_mult = 100 / data["Speed"];
var start = data["Start"];
lottie.op = 60 * time_mult + start;
lottie.layers[0].op = 60 * time_mult + start;
lottie.layers[0].sr = time_mult;
lottie.layers[0].st = start;
</script>

### Reversing Playback

While `sr` only allows you to speed up and slow down time, with
[time remapping](../layers.md#time-remapping) You can have more
interesting effects, such as reversing playback:

<lottie-playground example="precomp/star-comp.json">
<json>{...lottie, assets:["..."]}</json>
<script>
lottie.layers[0].tm = {
    a: 1,
    "k": [
        {
            "t": 0,
            "s": [1],
            "o": { "x": 0, "y": 0},
            "i": { "x": 1, "y": 1}
        },
        {
            "t": 60,
            "s": [0],
            "o": { "x": 0, "y": 0},
            "i": { "x": 1, "y": 1}
        }
    ]
};
</script>

### Repeated Elements

Another important use for precomps is that they allow to have multiple
layers showing the same precomp.

In the following example the star is animated once but there are 8
precomp layers with different rotations:

{lottie src="static/examples/precomp/star-splosion.json"}

### Overlaying Animations

Precomps also make it easier to combine multiple files into ones.

One thing to keep in mind is if the two files already have assets,
you need to ensure their asset identifier are unique, this can be done
by overwriting asset `id` and layer `refId` properties to some kind of
incremental values.

In the following example we will overlay the animation from the last
example with a different animation.

First Animation:
{lottie src="static/examples/precomp/star-splosion.json"}

Second Animation:
{lottie src="static/examples/precomp/circle.json"}

Overlaid:

<lottie-playground example="precomp/star-circle.json">
<json>{...lottie, assets:["..."]}</json>


If you look at the JSON you'll notice that this is how the structure changed:

```js
// First Animation:
{
    "ip": 0,
    "op": 60,
    "fr": 60,
    "w": 512,
    "h": 512,
    "assets": [
        {
            "id": "Star",
            "layers": [ /* Star Precomp Layers */ ]
        }
    ],
    "layers": [ /* First Animation Layers */ ]
}

// Second Animation
{
    "ip": 0,
    "op": 60,
    "fr": 60,
    "w": 512,
    "h": 512,
    "assets": [],
    "layers": [ /* Second Animation Layers */ ]
}

// Overlaid
{
    "ip": 0,
    "op": 60,
    "fr": 60,
    "w": 512,
    "h": 512,
    "assets": [
        {
            "id": "Star",
            "layers": [ /* Star Precomp Layers */ ]
        },
        {
            "id": "Expanding Stars",
            "layers": [ /* First Animation Layers */ ]
        },
        {
            "id": "Circle",
            "layers": [ /* Second Animation Layers */ ]
        }
    ],
    "layers": [
        {
            "nm": "Expanding Stars Layer",
            "refId": "Expanding Stars",
            "ty": 0,
            "st": 0,
            "ip": 0,
            "op": 60,
            "w": 512,
            "h": 512,
            "ks": {}
        },
        {
            "nm": "Circle Layer",
            "refId": "Circle",
            "ty": 0,
            "st": 0,
            "ip": 0,
            "op": 60,
            "w": 512,
            "h": 512,
            "ks": {}
        }
    ]
}
```

In this example the two animations had the same duration and size,
you can use the techniques described earlier to resize or retime the
animations if you want to overlay animations with different sizes or
durations.

### Concatenating Animations

This works basically the same as overlaying them, just by changing
some timing properties in the precomp layers.

<lottie-playground example="precomp/star-circle.json">
<json>{...lottie, assets:["..."]}</json>
<script>
lottie.op = 120
lottie.layers[1].ip = 60;
lottie.layers[1].op = 120;
lottie.layers[1].st = 60;
</script>

### Masking Animations

Just like any other visual layer, precomp layers can be used for [mattes](../layers.md#mattes).


<lottie-playground example="precomp/star-circle.json">
<json>{...lottie, assets:["..."]}</json>
<script>
lottie.layers[0].td = 1;
lottie.layers[1].tt = 1;
</script>
