# Advanced Interactions

This page will describe how to create lotties with advanced interactivity,
specifically when used with [lottie-web](https://github.com/airbnb/lottie-web/) player.

This page is divided into "levels", each level adds more obscure features
which are less portable but add increased interaction capabilities.


The techniques described below require knowledge on the following topics:

* The [Lottie format](index.md)
* Lottie [expressions](expressions.md)
* The [lottie-web](https://github.com/airbnb/lottie-web/) player
* [ECMAScript / JavaScript](https://developer.mozilla.org/en-US/docs/Web/javascript)
* [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) and [events](https://developer.mozilla.org/en-US/docs/Web/Events)


## Level 0: Regular Lotties

Lotties can play an animation, loading an animation looks something like this:

<script_playground>
```json
{
    "v": "5.9.1",
    "ip": 0,
    "op": 360,
    "fr": 60,
    "w": 512,
    "h": 512,
    "layers": [
        {
            "ty": 4,
            "ip": 0,
            "op": 360,
            "st": 0,
            "ks": {},
            "shapes": [
                {
                    "ty": "sr",
                    "p": {"a": 0, "k": [256, 256]},
                    "or": {"a": 0, "k": 200},
                    "ir": {"a": 0, "k": 100},
                    "r": {"a": 1, "k": [
                        {"t": 0, "s": [0], "o": {"x": 0, "y": 0}, "i": {"x": 1, "y": 1}},
                        {"t": 180, "s": [360]}
                    ]},
                    "pt": {"a": 0, "k": 5},
                    "sy": 1,
                    "os": {"a": 0, "k": 0},
                    "is": {"a": 0, "k": 0}
                },
                {
                    "ty": "st",
                    "o": {"a": 0, "k": 100},
                    "c": {"a": 0, "k": [1, 1, 0.3]},
                    "lc": 2,
                    "lj": 2,
                    "ml": 0,
                    "w": {"a": 0, "k": 30}
                }
            ]
        }
    ]
}
```
```html
<div id="level0"></div>
```
```js
var container = document.getElementById("level0");
var options = {
    container: container,
    renderer: "svg",
    loop: true,
    autoplay: true,
    animationData: json,
};
var anim = bodymovin.loadAnimation(options);
```
</script_playground>

By themselves lotties just play an animation, but luckily lottie-web provides some utility functions,
note how in the **Script** above we are storing the variable `anim` returned by `bodymovin.loadAnimation`.

## Level 1: Controlling Playback

You can play around with the `anim` object like setting the current frame, pausing stopping etc.

There's also the LottieFiles [interactivity library](https://lottiefiles.com/interactivity)
that makes some of these interactions easier to create.

Here's an example of a lottie changing based on mouse position:

<script_playground>
```json
{
    "v": "5.9.1",
    "ip": 0,
    "op": 360,
    "fr": 60,
    "w": 512,
    "h": 512,
    "layers": [
        {
            "ty": 4,
            "ip": 0,
            "op": 360,
            "st": 0,
            "ks": {},
            "shapes": [
                {
                    "ty": "sr",
                    "p": {"a": 0, "k": [256, 256]},
                    "or": {"a": 0, "k": 200},
                    "ir": {"a": 0, "k": 100},
                    "r": {"a": 1, "k": [
                        {"t": 0, "s": [0], "o": {"x": 0, "y": 0}, "i": {"x": 1, "y": 1}},
                        {"t": 360, "s": [360]}
                    ]},
                    "pt": {"a": 0, "k": 5},
                    "sy": 1,
                    "os": {"a": 0, "k": 0},
                    "is": {"a": 0, "k": 0}
                },
                {
                    "ty": "st",
                    "o": {"a": 0, "k": 100},
                    "c": {"a": 0, "k": [1, 1, 0.3]},
                    "lc": 2,
                    "lj": 2,
                    "ml": 0,
                    "w": {"a": 0, "k": 30}
                }
            ]
        }
    ]
}
```
```html
<div id="level1"></div>
```
```js
var container = document.getElementById("level1");
var options = {
    container: container,
    renderer: "svg",
    loop: true,
    autoplay: false,
    animationData: json,
};
var anim = bodymovin.loadAnimation(options);
container.addEventListener("mousemove", ev => {
    var rect = container.getBoundingClientRect();
    var t = (ev.clientX - rect.left) / rect.width;
    anim.goToAndStop(t * json.op, true);
});
```
</script_playground>



## Level 2: SVG Styling

When using the SVG renderer, you can make use of CSS styling by specifying
a value for `cl` in the lottie layers.

In the example below, CSS rules highlight the lottie layer showing a rectangle when the mouse is over it.


<script_playground>
```json
{
    "v": "5.9.1",
    "ip": 0,
    "op": 360,
    "fr": 60,
    "w": 512,
    "h": 512,
    "layers": [
        {
            "ty": 4,
            "ip": 0,
            "op": 360,
            "st": 0,
            "ks": {},
            "shapes": [
                {
                    "ty": "el",
                    "p": {"a": 0, "k": [400, 300]},
                    "s": {"a": 0, "k": [150, 150]},
                },
                {
                    "ty": "fl",
                    "o": {"a": 0, "k": 100},
                    "c": {"a": 0, "k": [0.769, 0.851, 0.961]}
                }
            ]
        },
        {
            "ty": 4,
            "ip": 0,
            "op": 360,
            "st": 0,
            "ks": {},
            "cl": "lottie_level_2",
            "shapes": [
                {
                    "ty": "rc",
                    "p": {"a": 0, "k": [256, 256]},
                    "s": {"a": 0, "k": [256, 128]},
                    "r": {"a": 0, "k": 3},
                },
                {
                    "ty": "fl",
                    "o": {"a": 0, "k": 100},
                    "c": {"a": 0, "k": [0.196, 0.314, 0.69]}
                }
            ]
        },
        {
            "ty": 4,
            "ip": 0,
            "op": 360,
            "st": 0,
            "ks": {},
            "shapes": [
                {
                    "ty": "el",
                    "p": {"a": 0, "k": [100, 200]},
                    "s": {"a": 0, "k": [150, 150]},
                },
                {
                    "ty": "fl",
                    "o": {"a": 0, "k": 100},
                    "c": {"a": 0, "k": [0.769, 0.851, 0.961]}
                }
            ]
        }
    ]
}
```
```css
.lottie_level_2:hover {
    opacity: 10%;
}
.lottie_level_2 {
    cursor: pointer;
}
```
```html
<div id="level2"></div>
```
```js
var container = document.getElementById("level2");
var options = {
    container: container,
    renderer: "svg",
    loop: true,
    autoplay: false,
    animationData: json,
};
var anim = bodymovin.loadAnimation(options);
```
</script_playground>


## Level 3: Basic Expressions

Lotties can have [expressions](expressions.md), they are basically small
snippets of JavaScript code used to modify the value of animated properties.

Below the star rotation is animated using an expression instead of using keyframes.

<script_playground>
```json
{
    "v": "5.9.1",
    "ip": 0,
    "op": 360,
    "fr": 60,
    "w": 512,
    "h": 512,
    "layers": [
        {
            "ty": 4,
            "ip": 0,
            "op": 360,
            "st": 0,
            "ks": {},
            "shapes": [
                {
                    "ty": "sr",
                    "p": {"a": 0, "k": [256, 256]},
                    "or": {"a": 0, "k": 200},
                    "ir": {"a": 0, "k": 100},
                    "r": {"a": 0, "k": 0, "x": "var $bm_rt = time * 60;"},
                    "pt": {"a": 0, "k": 5},
                    "sy": 1,
                    "os": {"a": 0, "k": 0},
                    "is": {"a": 0, "k": 0}
                },
                {
                    "ty": "st",
                    "o": {"a": 0, "k": 100},
                    "c": {"a": 0, "k": [1, 1, 0.3]},
                    "lc": 2,
                    "lj": 2,
                    "ml": 0,
                    "w": {"a": 0, "k": 30}
                }
            ]
        }
    ]
}
```
```html
<div id="level3"></div>
```
```js
var container = document.getElementById("level3");
var options = {
    container: container,
    renderer: "svg",
    loop: true,
    autoplay: true,
    animationData: json,
};
var anim = bodymovin.loadAnimation(options);
```
</script_playground>


## Level 4: Advanced Expressions

Within expressions you can access properties from other layers, and since
they are all JavaScript objects, you can add your own properties to them.


You can make a layer follow the position of another:

```js
// Set the layer position to follow the X position of another layer
var other_position = thisComp("layer_name").transform.position;
var $bm_rt = [other_position[0], value[1]];
```

Since property values are initialized to their non-expression value,
you can't access updated value of the property you are changing from the
expression. However you can work around this by storing state in the
layer object.

```js
// Get size of the rect
var size = thisLayer.content(1).size;

// Initialize everything at the start
if ( time == 0 )
{
    thisLayer.my_value = size[0] / 2;
    thisLayer.speed = 60;
    thisLayer.direction = 1;
    thisLayer.prev_time = 0;
}

// Handle the case when the lottie has looped and time has reset
// as it might not be exactly 0
if ( time < thisLayer.prev_time )
    thisLayer.prev_time = time;

// Find the time delta to keep constant speed
var dt = time - thisLayer.prev_time;
thisLayer.prev_time = time;

// Increment x
thisLayer.my_value += dt * thisLayer.speed * thisLayer.direction;
var x = thisLayer.my_value;
if ( x >= thisComp.width - size[0] / 2)
    thisLayer.direction = -1;
else if ( x <= size[0] / 2 )
    thisLayer.direction = 1;

// Calculate y based on x
var y = value[1] + Math.sin((x / thisComp.width) * Math.PI * 2) * (thisComp.height - size[1]) / 2;

var $bm_rt = [x, y];
```

Here's an example:

Note that the JSON uses ECMAScript's backtick string syntax for clarity,
in a real Lottie file you'd need to put it into a single line.

Newlines in the expression string work fine as long as the last line of
the expression doesn't end in a single line comment.

<script_playground>
```json
{
    "v": "5.9.1",
    "ip": 0,
    "op": 60,
    "fr": 60,
    "w": 512,
    "h": 512,
    "layers": [
        {
            "ty": 4,
            "ip": 0,
            "op": 60,
            "st": 0,
            "nm": "layer_name",
            "ks": {
                "p": {
                    "a": 0,
                    "k": [0, 256],
                    "x": `
// Get size of the rect
var size = thisLayer.content(1).size;

// Initialize everything at the start
if ( time == 0 )
{
    thisLayer.my_value = size[0] / 2;
    thisLayer.speed = 120;
    thisLayer.direction = 1;
    thisLayer.prev_time = 0;
}

// Handle the case when the lottie has looped and time has reset
// as it might not be exactly 0
if ( time < thisLayer.prev_time )
    thisLayer.prev_time = time;

// Find the time delta to keep constant speed
var dt = time - thisLayer.prev_time;
thisLayer.prev_time = time;

// Increment x
thisLayer.my_value += dt * thisLayer.speed * thisLayer.direction;
var x = thisLayer.my_value;
if ( x >= thisComp.width - size[0] / 2)
    thisLayer.direction = -1;
else if ( x <= size[0] / 2 )
    thisLayer.direction = 1;

// Calculate y based on x
var y = value[1] + Math.sin((x / thisComp.width) * Math.PI * 2) * (thisComp.height - size[1]) / 2;

var $bm_rt = [x, y];
`
                }
            },
            "shapes": [
                {
                    "ty": "rc",
                    "p": {"a": 0, "k": [0, 0]},
                    "s": {"a": 0, "k": [80, 80]},
                    "r": {"a": 0, "k": 3},
                },
                {
                    "ty": "fl",
                    "o": {"a": 0, "k": 100},
                    "c": {"a": 0, "k": [0.196, 0.314, 0.69]}
                }
            ]
        },
        {
            "ty": 4,
            "ip": 0,
            "op": 3600,
            "st": 0,
            "ks": {
                "p": {
                    "a": 0,
                    "k": [0, 256],
                    "x": `
// Set the layer position to follow the X position of another layer
var other_position = thisComp("layer_name").transform.position;
var $bm_rt = [other_position[0], value[1]];
`
                }
            },
            "shapes": [
                {
                    "ty": "el",
                    "p": {"a": 0, "k": [0, 0]},
                    "s": {"a": 0, "k": [150, 150]},
                },
                {
                    "ty": "fl",
                    "o": {"a": 0, "k": 100},
                    "c": {"a": 0, "k": [0.769, 0.851, 0.961]}
                }
            ]
        }
    ]
}
```
```html
<div id="level4"></div>
```
```js
var container = document.getElementById("level4");
var options = {
    container: container,
    renderer: "svg",
    loop: true,
    autoplay: true,
    animationData: json,
};
var anim = bodymovin.loadAnimation(options);
```
</script_playground>

## Level 5: Accessing Expression Objects from the Browser

Remember the `anim` object we get from lottie-web?
It's the key for more advanced interactions.

Internally it stores its lottie structure and the objects being passed
to expression as `thisComp` and `thisLayer`. Being able to access these
objects allows us to pass data directly to the lottie expressions.

## Level 6: Executing Expressions on DOM Events

## Level 7: Storing Event Logic in the Lottie

## Level 8: Initializing Values

## Level 10: DOM Events from Layers

## Level 11: Patching the Renderer

### Abusing Font Loading

### Deferring Animation Load

### Lottie Button
