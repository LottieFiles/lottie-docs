# Bouncy Ball

This page will show the basics of Lottie by inspecting this simple animation:

{lottie:bouncy_ball.json:512:512}

Note that Lottie files usually have their JSON minified, but the example files
here have been expanded for ease of inspection.

This dissection is not meant to be a complete description, so certain attributes
will not be described but each section will have links to the relevant reference
pages where you can find a description for those.

## Top level

The top level object, describes the [animation](../animation.md) as a whole.

```json
{
    "nm": "Bouncy Ball",
    "v": "5.5.2",
    "ip": 0,
    "op": 120,
    "fr": 60,
    "w": 512,
    "h": 512,
    "layers": [
        ...
    ]
}
```

Here we see the basic properties:

`nm` is the name of the document, it's not actually used by players.

`v` shows the Lottie format version, some older files might have a slightly different structure.

`fr` is the framerate in frames per second.
Note that most timing information is described in frames within Lottie,
so changing the framerate means the duration of the animation will also change.

`op` is the last frame of the animation, after which the animation will loop or stop,
depending on how the player is set up.
In this case 120 frames at 60 fps will result in 2 seconds of animation

`w` and `h` describe the width and height of the animation,
any content outside the box starting at `(0, 0)` and ending at `(w, h)` will not be visible.

Note that a lottie file is a vector format and can be scaled up and down.
So you shouldn't think of these values as a size in pixels.

## Layers

Now we look at the [layers](../layers.md).

Most file will be more complex than this and have multiple layers but here we only have one:

```json
 {
    "ddd": 0,
    "ty": 4,
    "ind": 0,
    "st": 0,
    "ip": 0,
    "op": 120,
    "nm": "Layer",
    "ks": {
        ...
    },
    "shapes": [...]
}
```

We see the layer can also have a name (`nm`).

You might note that `ip` and `op` have the same values as in the animation.
This means the layer will always be visible.
You can decide to show a layer only for a small amount of time, in which case
you would set `ip` to the first frame the layer should be visible at and
`op` to the last frame, and the layer will only be visible between those frames.

`ddd` is a boolean value that indicates whether this layer contains 3D elements.

`ty` is the layer type. In this case it's a [shape layer](../layers.md#shape-layer).

Finally `ind` is a unique number used to reference this layer.
Here it's not being used since there is only one layer.


## Layer transform

Here we'll have a look at the `ks` attribute of the layer that represents its [transform](../concepts.md#transform):

```json
{
    "a": {
        "a": 0,
        "k": [
            0,
            0
        ]
    },
    "p": {
        "a": 0,
        "k": [
            0,
            0
        ]
    },
    "s": {
        "a": 0,
        "k": [
            100,
            100
        ]
    },
    "r": {
        "a": 0,
        "k": 0
    },
    "o": {
        "a": 0,
        "k": 100
    }
}
```

This layer does not have any transform so everything is at its default value.
(If you see a transform missing some attributes, you can assume they have the values above)

You might have noticed that all the attributes of the transform are objects with the same structure.

This is because they are [animatable properties](../concepts.md#animated-property).
In this case they don't have any animations applied to them so `a` is `0` and `k` is the actual value.

If they were animated, `a` would be `1` and `k` would have a list of keyframes (more on this later).

The animated properties of a transform are as follows:

`a` is the anchor point along which other transformations are applied (you can think of it as the center of rotation).

`p` is the position (translation). Both `a` and `p` have arrays as values representing 2D coordinates.

`s` is the scale and, similar to `a` and `p`, its value has 2 components.

Note that values are expressed as percentages (`100` meaning 100% or no scaling).

`r` is the rotation angle in degrees.

`o` is opacity, similar to `s`, it also is expressed as a percentage.

You might also find `sk` and `sa` in a transform object, determining the skew.

## Shapes

Since this is a shape layer, it contains a list of shapes.

In this case there is only one shape:

```json
{
    "ty": "gr",
    "nm": "Ellipse Group",
    "it": [ ... ]
}
```

`ty` represents the type of the shape, in this case it's a [group](../shapes.md#group),
which is simply a shape that contains other shapes.

Groups add another layer of organization: you have layers at the top,
shape layers can contain group shapes, and groups can contain other groups.

`nm` is the name, same as before.

`it` is the list of shapes within the group, we will inspect them one by one

## Ellipse

```json
{
    "ty": "el",
    "nm": "Ellipse",
    "p": {
        "a": 0,
        "k": [
            204,
            169
        ]
    },
    "s": {
        "a": 0,
        "k": [
            153,
            153
        ]
    }
}
```

The first shape in the group is an [ellipse](../shapes.md#ellipse) (denoted by `"ty": "el"`).

It has two properties: position (`p`) and size (`s`).

The position determines the center of the ellipse and size its two axes.
In this case we can tell it's a circle since both values in `s` are the same.

## Fill

```json
{
    "ty": "fl",
    "nm": "Fill",
    "o": {
        "a": 0,
        "k": 100
    },
    "c": {
        "a": 0,
        "k": [
            0.710,
            0.192,
            0.278
        ]
    },
    "r": 1
}
```

An ellipse by itself doesn't actually draw anything. it just defines the shape.

So we need to apply some style to it. Here we have a [fill shape](../shapes.md#fill)
that determines the fill color for the ellipse.

`r` is not animated and it determines the [fill rule](../constants.md#fillrule).

`o` is the opacity, as a percentage.

`c` is a [color](../concepts.md#colors). Colors are RGB triplets with components in `[0, 1]`.<br/>
In this case it represents this color: {lottie_color:0.710,0.192,0.278}.

## Transform

```json
{
    "ty": "tr",
    "a": {
        "a": 0,
        "k": [
            204,
            169
        ]
    },
    "p": { ... },
    "s": { ... },
    "r": {
        "a": 0,
        "k": 0
    },
    "o": {
        "a": 0,
        "k": 100
    }
}
```

Unlike layers, that have the transform as an attribute, groups have them as a [shape](../shapes.md#transform-shape).

Note that this might give you a false sense of flexibility, because players
expect to have a transform shape at the end of their shape list.

The attributes are the same as the layer transform, with the addition of `ty`
to represent the shape type.

Here position (`p`) and scale (`s`) are animated and we'll look into them separately:


## Animated Position

```json
{
    "a": 1,
    "k": [
        {
            "t": 0,
            "s": [
                235,
                106
            ],
            "h": 0,
            "o": {
                "x": [
                    0.333
                ],
                "y": [
                    0
                ]
            },
            "i": {
                "x": [
                    1
                ],
                "y": [
                    1
                ]
            }
        },
        {
            "t": 60,
            "s": [
                235,
                441
            ],
            "h": 0,
            "o": {
                "x": [
                    0
                ],
                "y": [
                    0
                ]
            },
            "i": {
                "x": [
                    0.667
                ],
                "y": [
                    1
                ]
            }
        },
        {
            "t": 120,
            "s": [
                235,
                106
            ]
        }
    ]
}
```
`a` is `1`, denoting the property is animated. `k` contains a list of [keyframes](../concepts.md#keyframe).

### First Keyframe

```json
{
    "t": 0,
    "s": [
        235,
        106
    ],
    "h": 0,
    "o": {
        "x": [
            0.333
        ],
        "y": [
            0
        ]
    },
    "i": {
        "x": [
            1
        ],
        "y": [
            1
        ]
    }
}
```
The first keyframe specifies the time at which the property starts being animated.

In this case `t` is `0`, meaning the animation starts right away.

`s` shows the value the property will have at `t`.

`o` and `i` specify the [easing function](../concepts.md#easing-handles).

`o` affects the movement at the beginning of the keyframe and `i` at the end.

In this case, it uses an "ease in" kind of curve, where the animation starts
slowly and it picks up speed at the end.

### Second Keyframe

```json
{
    "t": 60,
    "s": [
        235,
        441
    ],
    "h": 0,
    "o": {
        "x": [
            0
        ],
        "y": [
            0
        ]
    },
    "i": {
        "x": [
            0.667
        ],
        "y": [
            1
        ]
    }
}
```

Here is the second keyframe, `t` is `60` which is the half way point of the animation.

You can compare `s` with the previous keyframe to see how the position is affected.

In this case it went from `[235, 106]` to `[235, 441]`, meaning the ball has moved down.

`i` and `o` are set up for an "ease out" curve, meaning the animation starts quick
but eventually it slows down.

### Last Keyframe

```json
{
    "t": 120,
    "s": [
        235,
        106
    ]
}
```

The last keyframe is at the end of the animation (`t` is `100`).

It doesn't have easing information because there are no more keyframes after this.

The value of `s` is the same as in the first keyframe, this allows for a seamless loop.

## Animated scale

```json
{
    "a": 1,
    "k": [
        {
            "t": 55,
            "s": [
                100,
                100
            ],
            "h": 0,
            "o": {
                "x": [
                    0
                ],
                "y": [
                    0
                ]
            },
            "i": {
                "x": [
                    1
                ],
                "y": [
                    1
                ]
            }
        },
        {
            "t": 60,
            "s": [
                136,
                59
            ],
            "h": 0,
            "o": {
                "x": [
                    0
                ],
                "y": [
                    0
                ]
            },
            "i": {
                "x": [
                    1
                ],
                "y": [
                    1
                ]
            }
        },
        {
            "t": 65,
            "s": [
                100,
                100
            ]
        }
    ]
}
```

This provides the "squishing" effect. The works the same as the animated position described above.

One thing to note is the first and last keyframe have `t` that doesn't match with the `ip` and `op` of the animation.

This mean the property will maintain its value on the time before the first keyframe and after the last one.


