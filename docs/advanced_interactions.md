# Advanced Interactions

This page will describe how to create lotties with advanced interactivity,
specifically when used with [lottie-web](https://github.com/airbnb/lottie-web/) player.

This page is divided into "levels", each level adds more obscure features
which are less portable but add increased interaction capabilities.

There are 9 levels below _Regular Lottie_, which is the same as the
number of circles of hell in Dante's Inferno. Reader discretion is advised.


The techniques described below require knowledge on the following topics:

* The [Lottie format](index.md)
* Lottie [expressions](expressions.md)
* The [lottie-web](https://github.com/airbnb/lottie-web/) player
* [ECMAScript / JavaScript](https://developer.mozilla.org/en-US/docs/Web/javascript)
* [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) and [events](https://developer.mozilla.org/en-US/docs/Web/Events)

<style>
.playground_html > div > svg
{
    border: 1px solid #ccc;
}
</style>

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


## Level 5: Breaking Time

In the previous examples, we had a condition at the start of some expressions
initializing custom attributes when `time` is equal to 0.

```js
if ( time == 0 )
    thisLayer.my_property = "some value";
```

This works because the first frame is always at time 0 but it isn't a
super reliable check: when the player loops, the time can go back to 0
which would result in your properties being initialized again.

If you want your interactions to carry over across loops, a better
approach is to use a condition where you check for `undefined` layer
properties:

```js
if ( thisLayer.my_property === undefined )
    thisLayer.my_property = "some value";
```

For smooth value increments, we need to properly handle the `time`
variable within expressions. Similarly to what we've done before the
following example shows how to initialize and update a variable over
time;

```js
// Initialization
if ( thisLayer.last_time === undefined )
{
    thisLayer.last_time = time;
    thisLayer.value = 0;
    thisLayer.speed = 600;
}

// Handle looping
if ( time < thisLayer.last_time )
    thisLayer.last_time = time;

// `dt` is the time since the last expression evaluation in seconds
var dt = time - thisLayer.last_time;

// Update the time management variable
thisLayer.last_time = time;

// Increment
thisLayer.value = dt * thisLayer.speed;
```

This approach allows you to change values regardless of playback speed
and framerate. I also allows you to continue the movement when the
lottie reaches its last frame and starts looping.

In the following example, the lottie is set to loop every second but
it keeps going indefinitely because of the `time` management setup:


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
            "nm": "star",
            "ip": 0,
            "op": 60,
            "st": 0,
            "ks": {
                "p": {"a": 0, "k": [0, 0], "x": `
// Initialization
if ( thisLayer.prev_time === undefined )
{
    thisLayer.px = thisComp.width / 2;
    thisLayer.py = thisComp.height / 2;

    thisLayer.dx = 1;
    thisLayer.dy = 1;
    thisLayer.prev_time = 0;
}

// Time management
if ( time < thisLayer.prev_time )
    thisLayer.prev_time = time;
var dt = time - thisLayer.prev_time;
thisLayer.prev_time = time;

// Animation
thisLayer.px += thisLayer.dx * dt * 100;
thisLayer.py += thisLayer.dy * dt * 120;

var radius = thisLayer.content(1).outerRadius;
if ( thisLayer.px < radius )
    thisLayer.dx = 1;
else if ( thisLayer.px > thisComp.width - radius )
    thisLayer.dx = -1;
if ( thisLayer.py < radius )
    thisLayer.dy = 1;
else if ( thisLayer.py > thisComp.height - radius )
    thisLayer.dy = -1;

// Set value
var $bm_rt = [thisLayer.px, thisLayer.py];
                `}},
            "shapes": [
                {
                    "ty": "sr",
                    "p": {"a": 0, "k": [0, 0]},
                    "or": {"a": 0, "k": 70},
                    "ir": {"a": 0, "k": 40},
                    "r": {"a": 0, "k": 0},
                    "pt": {"a": 0, "k": 5},
                    "sy": 1,
                    "os": {"a": 0, "k": 0},
                    "is": {"a": 0, "k": 0}
                },
                {
                    "ty": "fl",
                    "o": {"a": 0, "k": 100},
                    "c": {
                        "a": 0,
                        "k": [1, 1, 0.3],
                    }
                }
            ]
        }
    ]
}
```
```html
<div id="level5"></div>
```
```js
var options = {
    container: document.getElementById("level5"),
    renderer: "svg",
    loop: true,
    autoplay: true,
    animationData: json,
};
var anim = bodymovin.loadAnimation(options);
```
</script_playground>

## Level 6: Injecting Data

Remember the `anim` object we get from lottie-web?
It's the key for more advanced interactions.

Internally it stores its lottie structure and the objects being passed
to expression as `thisComp` and `thisLayer`. Being able to access these
objects allows us to pass data directly to the lottie expressions.

The object corresponding to `thisComp` can be accessed as
`anim.renderer.compInterface`, and from there you can get the layers
by name or index (see the [Composition](expressions.md#composition) expression object).


In the example below the rotation direction and color of the star change
based on whether the mouse is over the element containing the lottie.

```js
// Time management as before
if ( time == 0 )
{
    thisLayer.angle = 0;
    thisLayer.prev_time = 0;
}
if ( time < thisLayer.prev_time )
    thisLayer.prev_time = time;
var dt = time - thisLayer.prev_time;
thisLayer.prev_time = time;

var direction = thisComp.counter_clockwise ? -1 : 1;
thisLayer.angle += dt * direction * 60;
var $bm_rt = thisLayer.angle;
```

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
                    "r": {"a": 0, "k": 0, "x": `
// Time management as before
if ( thisLayer.prev_time === undefined )
{
    thisLayer.angle = 0;
    thisLayer.prev_time = 0;
}
if ( time < thisLayer.prev_time )
    thisLayer.prev_time = time;
var dt = time - thisLayer.prev_time;
thisLayer.prev_time = time;

var direction = thisComp.mouse_is_over ? -1 : 1;
thisLayer.angle += dt * direction * 60;
var $bm_rt = thisLayer.angle;
                    `},
                    "pt": {"a": 0, "k": 5},
                    "sy": 1,
                    "os": {"a": 0, "k": 0},
                    "is": {"a": 0, "k": 0}
                },
                {
                    "ty": "st",
                    "o": {"a": 0, "k": 100},
                    "c": {
                        "a": 0,
                        "k": [1, 1, 0.3],
                        "x": "var $bm_rt = thisComp.mouse_is_over ? [0.196, 0.314, 0.69] : value;"
                    },
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
<div id="level6"></div>
```
```js
var container = document.getElementById("level6");
var options = {
    container: container,
    renderer: "svg",
    loop: true,
    autoplay: true,
    animationData: json,
};
var anim = bodymovin.loadAnimation(options);

container.addEventListener("mouseenter", () => {
    anim.renderer.compInterface.mouse_is_over = true;
});
container.addEventListener("mouseleave", () => {
    anim.renderer.compInterface.mouse_is_over = false;
});
```
</script_playground>

## Level 7: Automatic Event Handlers

So far the interaction logic has been done by JavaScript on the browser.

In this section we'll add all the logic in the JSON itself and write a
wrapper script that sets up the animation.

This allows you to have self-contained lotties you can embed in a web
page that will handle events on their own.

### Lottie JSON Extension

First thing is to write the expressions in the Lottie itself.

Since Lottie is just a JSON file, it's easy to add custom values:

```json
{
    "v": "5.9.1",
    "ip": 0,
    "op": 60,
    "fr": 60,
    "w": 512,
    "h": 512,
    "events": {
        "click": "/*event handler code*/"
    }
}
```

Now we need to add some JavaScript so we can listen to the events
fired by the DOM and execute expressions:

```js
for ( let [ev_type, expression] of Object.entries(json.events) )
{
    let expression_function = Function("event", expression);
    container.addEventListener(ev_type, expression_function);
}
```

### Preparing Globals

While the above would work, we should expose some objects for it to be
useful. The lottie player define a bunch of [objects](expressions.md#global-objects)
and [functions](expressions/#misc-functions) for expressions, but we don't really
need all of them since the even handlers only need to pass along the information
that an event has occurred.

We will define [thisComp](expressions.md#thiscomp) and [time](expressions.md#time)
to be the same as the globals of the same name you'd expect to find an expressions,
and pass them to the event handling function:


```js

function event_handler(ev, expression_function)
{
    var thisComp = anim.renderer.compInterface;
    var time = anim.renderer.renderedFrame / anim.renderer.globalData.frameRate;

    expression_function(ev, thisComp, time);
}

for ( let [ev_type, expression] of Object.entries(json.events) )
{
    let expression_function = Function("event", "thisComp", "time", expression);
    container.addEventListener(ev_type, ev => event_handler(ev, expression_function));
}
```

After this step, you're all set to hanle DOM events automatically from a lottie.
The next couple steps add some polish to the event interface for a smoother experience.


### Mouse Events


Events like `click`, `mousemove`, etc. provide the mouse coordinates,
which you might want to access from within the lottie.

By default these coordinates aren't in the same space as the values
inside the lottie so we need to scale them appropriately:

```js
function event_handler(ev, expression_function)
{
    var thisComp = anim.renderer.compInterface;
    var time = anim.renderer.renderedFrame / anim.renderer.globalData.frameRate;

    if ( ev.clientX !== undefined )
    {
        var rect = container.getBoundingClientRect();
        ev.lottie_x = (ev.clientX - rect.left) / rect.width * thisComp.width;
        ev.lottie_y = (ev.clientY - rect.top) / rect.height * thisComp.height;
    }

    expression_function(ev, thisComp, time);
}

for ( let [ev_type, expression] of Object.entries(json.events) )
{
    let expression_function = Function("event", "thisComp", "time", expression);
    container.addEventListener(ev_type, ev => event_handler(ev, expression_function));
}
```

Now we can reference the position in the lottie expression:

```js
{
    "v": "5.9.1",
    "ip": 0,
    "op": 60,
    "fr": 60,
    "w": 512,
    "h": 512,
    "events": {
        "click": `
var star = thisComp("star");
star.px = event.lottie_x;
star.py = event.lottie_y;
`
    }
}
```

In the example below you can click to move the star to a given position:

<script_playground>
```json
{
    "v": "5.9.1",
    "ip": 0,
    "op": 60,
    "fr": 60,
    "w": 512,
    "h": 512,
    "events": {
        "click": `
var star = thisComp("star");
star.px = event.lottie_x;
star.py = event.lottie_y;
`
    },
    "layers": [
        {
            "ty": 4,
            "nm": "star",
            "ip": 0,
            "op": 60,
            "st": 0,
            "ks": {
                "p": {"a": 0, "k": [0, 0], "x": `
// Initialization
if ( thisLayer.px === undefined )
{
    thisLayer.px = thisComp.width / 2;
    thisLayer.py = thisComp.height / 2;
}

// Set value
var $bm_rt = [thisLayer.px, thisLayer.py];
                `}},
            "shapes": [
                {
                    "ty": "sr",
                    "p": {"a": 0, "k": [0, 0]},
                    "or": {"a": 0, "k": 70},
                    "ir": {"a": 0, "k": 40},
                    "r": {"a": 0, "k": 0},
                    "pt": {"a": 0, "k": 5},
                    "sy": 1,
                    "os": {"a": 0, "k": 0},
                    "is": {"a": 0, "k": 0}
                },
                {
                    "ty": "fl",
                    "o": {"a": 0, "k": 100},
                    "c": {
                        "a": 0,
                        "k": [1, 1, 0.3],
                    }
                }
            ]
        }
    ]
}
```
```html
<div id="level7_mouse"></div>
```
```js
var container = document.getElementById("level7_mouse");
var options = {
    container: container,
    renderer: "svg",
    loop: true,
    autoplay: true,
    animationData: json,
};
var anim = bodymovin.loadAnimation(options);

function event_handler(ev, expression_function)
{
    var thisComp = anim.renderer.compInterface;
    var time = anim.renderer.renderedFrame / anim.renderer.globalData.frameRate;

    if ( ev.clientX !== undefined )
    {
        var rect = container.getBoundingClientRect();
        ev.lottie_x = (ev.clientX - rect.left) / rect.width * thisComp.width;
        ev.lottie_y = (ev.clientY - rect.top) / rect.height * thisComp.height;
    }

    expression_function(ev, thisComp, time);
}

for ( let [ev_type, expression] of Object.entries(json.events) )
{
    let expression_function = Function("event", "thisComp", "time", expression);
    container.addEventListener(ev_type, ev => event_handler(ev, expression_function));
}
```
</script_playground>

### Keyboard Events

To allow keyboard events to be fired correctly, you need to ensure the
element containing the lottie is focusable.

You can do this by setting the `tabindex` attribute in HTML or with JavaScript.

```html
<div id="level7_keyboard" tabindex="0"></div>
```

or

```js
container.setAttribute("tabindex", "0");
```

In the example below we'll move a layer based on whether the user is
pressing the left and right arrow keys.

A good solution for this is to keep track of which key has been pressed
and react accordingly.

The event handler code is simple enough:

For `keydown`:

```js
if ( event.key == "ArrowLeft" )
    thisComp("star").left = true;
else if ( event.key == "ArrowRight" )
    thisComp("star").right = true;

// Prevent scrolling and other browser shortcuts
event.preventDefault();
```

`keyup`:

```js
if ( event.key == "ArrowLeft" )
    thisComp("star").left = false;
else if ( event.key == "ArrowRight" )
    thisComp("star").right = false;

// Prevent scrolling and other browser shortcuts
event.preventDefault();
```

We should also reset these when the lottie element loses focus:

`focusout`:

```js
    thisComp("star").left = false;
    thisComp("star").right = false;
```

We need to add some logic to the layer position property:

```js
// Initialization
if ( thisLayer.px === undefined )
{
    thisLayer.px = thisComp.width / 2;
    thisLayer.py = thisComp.height / 2;
    thisLayer.left = false;
    thisLayer.right = false;
    thisLayer.prev_time = 0;
}
// Handle time wrapping around
if ( time < thisLayer.prev_time )
    thisLayer.prev_time = time;

// Time delta
var dt = time - thisLayer.prev_time;
thisLayer.prev_time = time;

// Figure which direction to move
var direction = 0;
if ( thisLayer.left && thisLayer.right )
    direction = 0;
else if ( thisLayer.left )
    direction = -1;
else if ( thisLayer.right )
    direction = 1;

// Move
if ( direction != 0 )
{
    // 600 is the "speed", you need to consider that dt is the time
    // in seconds since the previous frame so it's usally a rather small value
    thisLayer.px += direction * dt * 600;
    var radius = thisLayer.content(1).outerRadius;
    thisLayer.px = clamp(thisLayer.px, radius, thisComp.width - radius);
}

// Set value
var $bm_rt = [thisLayer.px, thisLayer.py];
```

The example below shows how to handle keyboard event.

Focusing on the element changes the star color.
When focused (blue star) left and right arrow keys move the star in the corresponding direction.

<script_playground>
```json
{
    "v": "5.9.1",
    "ip": 0,
    "op": 60,
    "fr": 60,
    "w": 512,
    "h": 512,
    "events": {
        "keydown": `
if ( event.key == "ArrowLeft" )
    thisComp("star").left = true;
else if ( event.key == "ArrowRight" )
    thisComp("star").right = true;

// Prevent scrolling and other browser shortcuts
event.preventDefault();
`,
        "keyup": `
if ( event.key == "ArrowLeft" )
    thisComp("star").left = false;
else if ( event.key == "ArrowRight" )
    thisComp("star").right = false;

// Prevent scrolling and other browser shortcuts
event.preventDefault();
`,
        "focusin": "thisComp.focus = true;",
        "focusout": `
    thisComp("star").left = false;
    thisComp("star").right = false;
    thisComp.focus = false;
`,
    },
    "layers": [
        {
            "ty": 4,
            "nm": "star",
            "ip": 0,
            "op": 60,
            "st": 0,
            "ks": {
                "p": {"a": 0, "k": [0, 0], "x": `
// Initialization
if ( thisLayer.px === undefined )
{
    thisLayer.px = thisComp.width / 2;
    thisLayer.py = thisComp.height / 2;
    thisLayer.left = false;
    thisLayer.right = false;
    thisLayer.prev_time = 0;
}
// Handle time wrapping around
if ( time < thisLayer.prev_time )
    thisLayer.prev_time = time;

// Time delta
var dt = time - thisLayer.prev_time;
thisLayer.prev_time = time;

// Figure which direction to move
var direction = 0;
if ( thisLayer.left && thisLayer.right )
    direction = 0;
else if ( thisLayer.left )
    direction = -1;
else if ( thisLayer.right )
    direction = 1;

// Move
if ( direction != 0 )
{
    // 600 is the "speed", you need to consider that dt is the time
    // in seconds since the previous frame so it's usally a rather small value
    thisLayer.px += direction * dt * 600;
    var radius = thisLayer.content(1).outerRadius;
    thisLayer.px = clamp(thisLayer.px, radius, thisComp.width - radius);
}

// Set value
var $bm_rt = [thisLayer.px, thisLayer.py];
                `}},
            "shapes": [
                {
                    "ty": "sr",
                    "p": {"a": 0, "k": [0, 0]},
                    "or": {"a": 0, "k": 70},
                    "ir": {"a": 0, "k": 40},
                    "r": {"a": 0, "k": 0},
                    "pt": {"a": 0, "k": 5},
                    "sy": 1,
                    "os": {"a": 0, "k": 0},
                    "is": {"a": 0, "k": 0}
                },
                {
                    "ty": "fl",
                    "o": {"a": 0, "k": 100},
                    "c": {
                        "a": 0,
                        "k": [1, 1, 0.3],
                        "x": "var $bm_rt = thisComp.focus ? [0.196, 0.314, 0.69] : value;"
                    }
                }
            ]
        }
    ]
}
```
```html
<div id="level7_keyboard" tabindex="0"></div>
```
```js
var container = document.getElementById("level7_keyboard");
var options = {
    container: container,
    renderer: "svg",
    loop: true,
    autoplay: true,
    animationData: json,
};
var anim = bodymovin.loadAnimation(options);

function event_handler(ev, expression_function)
{
    var thisComp = anim.renderer.compInterface;
    var time = anim.renderer.renderedFrame / anim.renderer.globalData.frameRate;

    if ( ev.clientX !== undefined )
    {
        var rect = container.getBoundingClientRect();
        ev.lottie_x = (ev.clientX - rect.left) / rect.width * thisComp.width;
        ev.lottie_y = (ev.clientY - rect.top) / rect.height * thisComp.height;
    }

    expression_function(ev, thisComp, time);
}

for ( let [ev_type, expression] of Object.entries(json.events) )
{
    let expression_function = Function("event", "thisComp", "time", expression);
    container.addEventListener(ev_type, ev => event_handler(ev, expression_function));
}
```
</script_playground>


## Level 8: Sound Effects

Lottie web supports playing audio layers with the help of [Howler](https://howlerjs.com/).

By default the level of control you get with sound is rather limited but
we can find a way around it.

The issue is audio layers don't have a scriptable property that controls
playback which means we can't attach an expression to audio layers.

The trick is to wrap an audio layer into a precomp and to use an expression
on its time remapping property.

We can then control playback as follows:

```js
if ( thisLayer.last_time === undefined )
{
    thisLayer.last_time = time;
    // This variable wil control whether the sound is played
    thisLayer.sound_play = 0;
    // This should be the time in seconds you want the sound to play for
    // To get the best results, it should be just short of the duration
    // of the audio file
    thisLayer.sound_duration = 1;

}
// Usual time management stuff
if ( time < thisLayer.last_time )
    thisLayer.last_time = time;
var dt = time - thisLayer.last_time;
thisLayer.last_time = time;

// Default to not playing
var $bm_rt = 0;

if ( thisLayer.sound_play > 0 )
{
    $bm_rt = thisLayer.sound_duration - thisLayer.sound_play;
    thisLayer.sound_play -= dt;
}
```

In the example that follows you can click on the lottie to make it play a sound.

The precomp also has a green cicle that shows playback progress.

<script_playground>
```json
{
    "v": "5.5.2",
    "fr": 60,
    "ip": 0,
    "op": 180,
    "w": 512,
    "h": 512,
    "ddd": 0,
    "events": {
        "click": "thisComp('sound_control').sound_play = thisComp('sound_control').sound_duration"
    },
    "assets": [
        {
            "id": "sound",
            "u": "/lottie-docs/examples/",
            "p": "sound.mp3",
            "e": 0
        },
        {
            "id": "precomp",
            "layers": [
                {
                    "nm": "a",
                    "ty": 4,
                    "ip": 0,
                    "op": 180,
                    "st": 0,
                    "ks": {},
                    "shapes": [
                        {
                            "ty": "el",
                            "p": {"a": 1, "k": [
                                {
                                    "t": 0,
                                    "s": [0, 256],
                                    "i": {"x": 0, "y": 0},
                                    "o": {"x": 1, "y": 1},
                                },
                                {
                                    "t": 60,
                                    "s": [512, 256],
                                }
                            ]},
                            "s": {"a": 0, "k": [100, 100]},
                        },
                        {
                            "ty": "fl",
                            "c": {"a": 0, "k": [0, 1, 0]},
                            "o": {"a": 0, "k": 100},
                        }
                    ]
                },
                {
                    "ty": 6,
                    "ip": 1,
                    "op": 60,
                    "st": 1,
                    "refId": "sound",
                    "au": {
                        "lv": {"a": 0, "k": [100, 100]}
                    }
                }
            ]
        }
    ],
    "markers": [],
    "layers": [
        {
            "ty": 4,
            "nm": "star",
            "ip": 0,
            "op": 180,
            "st": 0,
            "ks": {},
            "shapes": [
                {
                    "ty": "sr",
                    "p": {"a": 0, "k": [256, 256]},
                    "or": {"a": 0, "k": 70},
                    "ir": {"a": 0, "k": 40},
                    "r": {
                        "a": 1,
                        "k": [
                            {
                                "t": 0,
                                "s": [0],
                                "i": {"x": 0, "y": 0},
                                "o": {"x": 1, "y": 1}
                            },
                            {
                                "t": 180,
                                "s": [360]
                            }
                        ]
                    },
                    "pt": {"a": 0, "k": 5},
                    "sy": 1,
                    "os": {"a": 0, "k": 0},
                    "is": {"a": 0, "k": 0}
                },
                {
                    "ty": "fl",
                    "o": {"a": 0, "k": 100},
                    "c": {
                        "a": 0,
                        "k": [1, 1, 1],
                        "x": `
var amount = thisComp('sound_control').sound_play ?? 0;
var $bm_rt = [amount, 0, 0];
`,
                    }
                }
            ]
        },
        {
            "nm": "sound_control",
            "ty": 0,
            "ip": 0,
            "op": 180,
            "st": 0,
            "ks": {},
            "refId": "precomp",
            "w": 512,
            "h": 512,
            "tm": {
                "a": 1,
                "k": [{
                        "t": 0,
                        "s": [0],
                        "i": {"x": 0, "y": 0},
                        "o": {"x": 1, "y": 1}
                    },
                    {
                        "t": 180,
                        "s": [0]
                    }
                ],
                "x": `
if ( thisLayer.last_time === undefined )
{
    thisLayer.last_time = time;
    // This variable wil control whether the sound is played
    thisLayer.sound_play = 0;
    // This should be the time in seconds you want the sound to play for
    thisLayer.sound_duration = 1;

}
// Usual time management stuff
if ( time < thisLayer.last_time )
    thisLayer.last_time = time;
var dt = time - thisLayer.last_time;
thisLayer.last_time = time;

// Default to not playing
var $bm_rt = 100;

if ( thisLayer.sound_play > 0 )
{
    $bm_rt = thisLayer.sound_duration - thisLayer.sound_play;
    thisLayer.sound_play -= dt;
}`
            }
        }
    ]
}

```
```html
<div id="level8"></div>
```
```js
var container = document.getElementById("level8");
var options = {
    container: container,
    renderer: "svg",
    loop: true,
    autoplay: true,
    animationData: json,
};
var anim = bodymovin.loadAnimation(options);

function event_handler(ev, expression_function)
{
    var thisComp = anim.renderer.compInterface;
    var time = anim.renderer.renderedFrame / anim.renderer.globalData.frameRate;

    if ( ev.clientX !== undefined )
    {
        var rect = container.getBoundingClientRect();
        ev.lottie_x = (ev.clientX - rect.left) / rect.width * thisComp.width;
        ev.lottie_y = (ev.clientY - rect.top) / rect.height * thisComp.height;
    }

    expression_function(ev, thisComp, time);
}

for ( let [ev_type, expression] of Object.entries(json.events) )
{
    let expression_function = Function("event", "thisComp", "time", expression);
    container.addEventListener(ev_type, ev => event_handler(ev, expression_function));
}
```
</script_playground>


## Interlude: Writing a Small Wrapper

Follows a JavaScript class that sets everything we've seen until now
in a self-contained object.

```js
class LottieInteractionPlayer
{
    constructor(container, custom_options={})
    {
        if ( typeof container == "string" )
            this.container = document.getElementById(container);
        else
            this.container = container;

        this.anim = null;

        this.custom_options = custom_options;

        // needed by keyup/down
        if ( !container.hasAttribute("tabindex") )
            container.setAttribute("tabindex", "0");

        this.handlers = {};

        this._container_event_listener = this.container_event.bind(this);
    }

    // Deep copy lottie JSON
    lottie_clone(json)
    {
        return JSON.parse(JSON.stringify(json));
    }

    load(lottie, resize = true)
    {
        // Options
        var options = {
            container: this.container,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            // Clone because the player modifies the passed object
            animationData = this.lottie_clone(lottie);
            ...this.custom_options,
        };

        if ( resize )
        {
            this.container.style.width = lottie.w + "px";
            this.container.style.height = lottie.h + "px";
        }

        // Clean up
        this.clear();

        // Setup handlers
        this.handlers = {};
        if ( lottie.events )
        {
            for ( var [name, func] of Object.entries(lottie.events) )
            {
                this.handlers[name] = this.expression_to_event_handler(func);
                this.container.addEventListener(name, this._container_event_listener);
            }
        }

        // Create lottie player
        this.anim = bodymovin.loadAnimation(options);
    }

    // Destroy the animation
    clear()
    {
        if ( this.anim != null )
        {
            try {
                this.anim.destroy();
                this.anim = null;
            } catch ( e ) {}
        }

        for ( let name of Object.keys(this.handlers) )
            this.container.removeEventListener(name, this._container_event_listener);
    }

    // Get the expression `thisComp` global
    get thisComp()
    {
        return this.anim.renderer.compInterface;
    }

    // Get the expression `time` global
    get time()
    {
        return this.anim.renderer.renderedFrame / this.anim.renderer.globalData.frameRate;
    }

    // Get an expression layer
    layer(name)
    {
        return this.thisComp(name);
    }

    // Handles an event from the container element
    container_event(ev)
    {
        this.prepare_lottie_event(ev);

        if ( this.handlers[ev.type] )
            this.handle_lottie_event(ev, this.handlers[ev.type]);
    }

    // Adds useful attributes to an event object
    prepare_lottie_event(ev)
    {
        if ( ev.clientX !== undefined )
        {
            var rect = this.container.getBoundingClientRect();
            ev.lottie_x = (ev.clientX - rect.left) / rect.width * this.thisComp.width;
            ev.lottie_y = (ev.clientY - rect.top) / rect.height * this.thisComp.height;
        }
    }

    // Handles an event given a handler
    handle_lottie_event(ev, handler)
    {
        handler(ev, this.thisComp, this.time);
    }

    // Sets up an event handler
    expression_to_event_handler(expr)
    {
        return Function("event", "thisComp", "time", expr);
    }
}
```

## Level 9: Patching the Renderer

So far we've used the vanilla lottie-web player without modifications.

This is good for the interactions described until now but for more
advanced stuff we need to patch the player.

The code in this level assumes you have a wrapper class similar to the one
described in the interlude.

### Why

Follows a description of some use cases that don't work with the current approach.

#### Initializing Values

So far we've initialized custom layer attributes in the expressions using them.

We started by checking if `time` is 0:

```js
// Initialize everything at the start
if ( time == 0 )
{
    thisLayer.my_value = size[0] / 2;
    thisLayer.speed = 60;
    thisLayer.direction = 1;
    thisLayer.prev_time = 0;
}
```

Since that isn't always reliable, we moved on to checking if the attributes
are undefined:

```js
// Initialization
if ( thisLayer.px === undefined )
{
    thisLayer.px = thisComp.width / 2;
    thisLayer.py = thisComp.height / 2;
}
```

While this works, it's a bit annoying because you don't know if you can
access another layer's custom attributes on frame 0, so it would be nice
to have an event for this:

```json
{
    "v": "5.9.1",
    "ip": 0,
    "op": 60,
    "fr": 60,
    "w": 512,
    "h": 512,
    "events": {
        "load": "thisComp('mylayer').value = 123;"
    }
}
```

We have the options of the `DOMLoaded` event from bodymovin:

```js
    load(lottie, resize = true)
    {
        // (omitted the part of the code that's the same as before)

        // Create lottie player
        this.anim = bodymovin.loadAnimation(options);

        this.anim.addEventListener("DOMLoaded", this._lottie_loaded_event.bind(this));
    }

    _lottie_loaded_event()
    {
        // Create a dummy event object and invoke the
        this.container.dispatchEvent(new Event("load"), {});
    }
```

The issue with this is such event can only be fired after the first
frame has been renderer (and expressions have been evaluated at least once).


#### DOM Events from Layers

Until now the event handling has been done on the container element.
Since all the layers result in SVG `<g>` elements, it would be nice to
be able to listen to events from those elements and handle them based
on expressions defined on each layer.

```json
{
    "ty": 4,
    "nm": "My layer",
    "ip": 0,
    "op": 60,
    "st": 0,
    "ks": {},
    "shapes": [],
    "events": {
        "click": "thisLayer.clicked = true;"
    }
}
```

To do this we need a way of mapping the layer in the JSON to the
DOM element and the value for the expression `thisLayer`.

All this information is within the lottie-web SVG renderer but we need
to find a way of accessing it.

The first step is to allow a layer object to be passed to the events:
```javascript
    // Handles an event from the container element
    container_event(ev)
    {
        this.prepare_lottie_event(ev);

        if ( this.handlers[ev.type] )
            this.handle_lottie_event(ev, this.handlers[ev.type], null);
    }

    // Handles an event given a handler
    handle_lottie_event(ev, handler, layer)
    {
        handler(ev, this.thisComp, this.time, layer);
    }

    // Sets up an event handler
    expression_to_event_handler(expr)
    {
        return Function("event", "thisComp", "time", "thisLayer", expr);
    }
```

### How

The gist of it is we need to path the renderer object and inject our
code in some of its methods. Luckily we can do this on the fly:

```javascript
    load(lottie, resize = true)
    {
        // (omitted the part of the code that's the same as before)

        // Create lottie player
        this.anim = bodymovin.loadAnimation(options);

        this._patch_renderer();
    }


    _patch_renderer()
    {
        // We patch initItems to trigger an event before any expression is evaluated:
        var old_init = this.anim.renderer.initItems.bind(this.anim.renderer);
        var post_init = this._lottie_load_event.bind(this)
        this.anim.renderer.initItems = function(){
            old_init();
            post_init();
        };

        // We patch createItem to add event listener.
        // It takes the JSON layer as input and returns the renderer later object
        this.layer_elements = [];
        var old_create = this.anim.renderer.createItem.bind(this.anim.renderer);
        this.anim.renderer.createItem = (function(layer){
            var item = old_create(layer);
            this._create_item_event(layer, item);
            return item;
        }).bind(this);
    }

    _lottie_load_event()
    {
        let ev = new Event("load", {});
        this.container.dispatchEvent(ev);
        for ( let layer of this.layer_elements )
            layer.dispatchEvent(ev);
    }

    _create_item_event(lottie, item)
    {
        // lottie is the JSON layer
        // item.layerElement is the DOM element for this layer
        // item.layerInterface is the expression thisLayer object
        if ( !lottie.events )
            return;

        // Create a dummy element for Null layers and the like,
        // it makes it easier to listen for `load` events
        let element = item.layerElement ?? document.createElement("div");

        // Keep track of layer elements so they can have the `load` event too
        this.layer_elements.push(element);

        for ( let [name, func] of Object.entries(lottie.events) )
        {
            let handler = this.expression_to_event_handler(func);
            function listener(ev)
            {
                this.prepare_lottie_event(ev);
                this.handle_lottie_event(ev, handler, item.layerInterface);
            }
            element.addEventListener(name, listener.bind(this));
        }
    }
```

Now that the renderer has been patched can we be assured the patching is
done before the functions we are patching have been called?

The short answer is No, but we can have a look at how we can achieve this.


#### Abusing Font Loading

When a lottie has external fonts, the lottie-web player waits for every
font to be loaded before initializing the renderer. Which means when you
have text layers, the code above works perfectly.

This is nice but not all lotties need text so we'll need something better.

#### Deferring Animation Load

The trick is to not pass the lottie JSON to lottie-web until after
we've patched the renderer. This is easy enough because if you call
`bodymovin.loadAnimation` without `path` or `animationData` everything
will be initialized (including the renderer) and only the JSON loading
step is missing.

We can use this to patch the renderer before loading the animation:

```javascript
    load(lottie, resize = true)
    {
        // Options
        var options = {
            container: this.container,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            ...this.custom_options,
            // Note that animationData is deferred
        };

        if ( resize )
        {
            this.container.style.width = lottie.w + "px";
            this.container.style.height = lottie.h + "px";
        }

        // Clean up
        this.clear();

        // Setup handlers
        this.handlers = {};
        if ( lottie.events )
        {
            for ( var [name, func] of Object.entries(lottie.events) )
            {
                this.handlers[name] = this.expression_to_event_handler(func);
                this.container.addEventListener(name, this._container_event_listener);
            }
        }

        // Create lottie player
        this.anim = bodymovin.loadAnimation(options);

        this._patch_renderer();

        this.anim.addEventListener("DOMLoaded", this._lottie_loaded_event.bind(this));

        // Clone because the player modifies the passed object
        var animation_data = this.lottie_clone(lottie);

        // Load animation separately so we can patch the renderer
        this.anim.setupAnimation(animation_data);
    }
```

Note that `anim.setupAnimation` is available from lottie-web version
5.8.0. If you have earlier versions, you should call `anim.configAnimation`
instead.

## Final Thoughts


### Resulting Wrapper

Here's the same wrapper class as described earlier, but with patching
code applied to support the `load` event and layer events.

<script_playground global-script="1">
```js
class LottieInteractionPlayer
{
    constructor(container, custom_options={})
    {
        if ( typeof container == "string" )
            this.container = document.getElementById(container);
        else
            this.container = container;

        this.anim = null;

        this.custom_options = custom_options;

        // needed by keyup/down
        if ( !container.hasAttribute("tabindex") )
            container.setAttribute("tabindex", "0");

        this.handlers = {};

        this._container_event_listener = this.container_event.bind(this);
    }

    // Deep copy lottie JSON
    lottie_clone(json)
    {
        return JSON.parse(JSON.stringify(json));
    }

    load(lottie, resize = true)
    {
        // Options
        var options = {
            container: this.container,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            ...this.custom_options,
            // Note that animationData is deferred
        };

        if ( resize )
        {
            this.container.style.width = lottie.w + "px";
            this.container.style.height = lottie.h + "px";
        }

        // Clean up
        this.clear();

        // Setup handlers
        this.handlers = {};
        if ( lottie.events )
        {
            for ( var [name, func] of Object.entries(lottie.events) )
            {
                this.handlers[name] = this.expression_to_event_handler(func);
                this.container.addEventListener(name, this._container_event_listener);
            }
        }

        // Create lottie player
        this.anim = bodymovin.loadAnimation(options);

        this._patch_renderer();

        // Clone because the player modifies the passed object
        var animation_data = this.lottie_clone(lottie);

        // Load animation separately so we can patch the renderer
        this.anim.setupAnimation(animation_data);
    }

    _patch_renderer()
    {
        // We patch initItems to trigger an event before any expression is evaluated:
        var old_init = this.anim.renderer.initItems.bind(this.anim.renderer);
        var post_init = this._lottie_load_event.bind(this)
        this.anim.renderer.initItems = function(){
            old_init();
            post_init();
        };

        // We patch createItem to add event listener.
        // It takes the JSON layer as input and returns the renderer later object
        this.layer_elements = [];
        var old_create = this.anim.renderer.createItem.bind(this.anim.renderer);
        this.anim.renderer.createItem = (function(layer){
            var item = old_create(layer);
            this._create_item_event(layer, item);
            return item;
        }).bind(this);
    }

    _create_item_event(lottie, item)
    {
        // lottie is the JSON layer
        // item.layerElement is the DOM element for this layer
        // item.layerInterface is the expression thisLayer object
        if ( !lottie.events )
            return;

        // Create a dummy element for Null layers and the like,
        // it makes it easier to listen for `load` events
        let element = item.layerElement ?? document.createElement("div");

        // Keep track of layer elements so they can have the `load` event too
        this.layer_elements.push(element);

        for ( let [name, func] of Object.entries(lottie.events) )
        {
            let handler = this.expression_to_event_handler(func);
            function listener(ev)
            {
                this.prepare_lottie_event(ev);
                this.handle_lottie_event(ev, handler, item.layerInterface);
            }
            element.addEventListener(name, listener.bind(this));
        }
    }

    _lottie_load_event()
    {
        let ev = new Event("load", {});
        this.container.dispatchEvent(ev);
        for ( let layer of this.layer_elements )
            layer.dispatchEvent(ev);
    }

    // Destroy the animation
    clear()
    {
        if ( this.anim != null )
        {
            try {
                this.anim.destroy();
                this.anim = null;
            } catch ( e ) {}
        }

        for ( let name of Object.keys(this.handlers) )
            this.container.removeEventListener(name, this._container_event_listener);
    }

    // Get the expression `thisComp` global
    get thisComp()
    {
        return this.anim.renderer.compInterface;
    }

    // Get the expression `time` global
    get time()
    {
        return this.anim.renderer.renderedFrame / this.anim.renderer.globalData.frameRate;
    }

    // Get an expression layer
    layer(name)
    {
        return this.thisComp(name);
    }

    // Handles an event from the container element
    container_event(ev)
    {
        this.prepare_lottie_event(ev);

        if ( this.handlers[ev.type] )
            this.handle_lottie_event(ev, this.handlers[ev.type], null);
    }

    // Adds useful attributes to an event object
    prepare_lottie_event(ev)
    {
        if ( ev.clientX !== undefined )
        {
            var rect = this.container.getBoundingClientRect();
            ev.lottie_x = (ev.clientX - rect.left) / rect.width * this.thisComp.width;
            ev.lottie_y = (ev.clientY - rect.top) / rect.height * this.thisComp.height;
        }
    }

    // Handles an event given a handler
    handle_lottie_event(ev, handler, layer)
    {
        handler(ev, this.thisComp, this.time, layer);
    }

    // Sets up an event handler
    expression_to_event_handler(expr)
    {
        return Function("event", "thisComp", "time", "thisLayer", expr);
    }
}
```
</script_playground>


### Animation or Interaction

It's possible to use the custom `load` to detect whether the lottie
is being played in an environment that supports the custom events.

The following example is similar to the click example from level 7
but when a player doesn't have interaction support, the star moves
around on its own.


<script_playground>
```json
{
    "v": "5.9.1",
    "ip": 0,
    "op": 60,
    "fr": 60,
    "w": 512,
    "h": 512,
    "events": {
        "click": "var star = thisComp('star'); star.px = event.lottie_x; star.py = event.lottie_y;",
        "load": "thisComp('star').interactive = true;"
    },
    "layers": [
        {
            "ty": 4,
            "nm": "star",
            "ip": 0,
            "op": 60,
            "st": 0,
            "ks": {
                "p": {"a": 0, "k": [0, 0], "x": `
// Initialization
if ( thisLayer.px === undefined )
{
    thisLayer.px = thisComp.width / 2;
    thisLayer.py = thisComp.height / 2;

    if ( !thisLayer.interactive )
    {
        thisLayer.dx = 1;
        thisLayer.dy = 1;
        thisLayer.prev_time = 0;
    }
}

if ( !thisLayer.interactive )
{
    if ( time < thisLayer.prev_time )
        thisLayer.prev_time = time;
    var dt = time - thisLayer.prev_time;
    thisLayer.prev_time = time;

    thisLayer.px += thisLayer.dx * dt * 100;
    thisLayer.py += thisLayer.dy * dt * 120;

    var radius = thisLayer.content(1).outerRadius;
    if ( thisLayer.px < radius )
        thisLayer.dx = 1;
    else if ( thisLayer.px > thisComp.width - radius )
        thisLayer.dx = -1;
    if ( thisLayer.py < radius )
        thisLayer.dy = 1;
    else if ( thisLayer.py > thisComp.height - radius )
        thisLayer.dy = -1;

}

// Set value
var $bm_rt = [thisLayer.px, thisLayer.py];
                `}},
            "shapes": [
                {
                    "ty": "sr",
                    "p": {"a": 0, "k": [0, 0]},
                    "or": {"a": 0, "k": 70},
                    "ir": {"a": 0, "k": 40},
                    "r": {"a": 0, "k": 0},
                    "pt": {"a": 0, "k": 5},
                    "sy": 1,
                    "os": {"a": 0, "k": 0},
                    "is": {"a": 0, "k": 0}
                },
                {
                    "ty": "fl",
                    "o": {"a": 0, "k": 100},
                    "c": {
                        "a": 0,
                        "k": [1, 1, 0.3],
                    }
                }
            ]
        }
    ]
}
```
```html
<div id="animation_interaction_parent">
    <div id="lottie_not_interactive"></div>
    <div id="lottie_interactive"></div>
</div>
```
```css
#animation_interaction_parent {
    display: flex;
}
#lottie_interactive, #lottie_not_interactive {
    border: 1px solid #ccc;
    width: 50%;
    box-sizing: border-box;
}
```
```js
var options = {
    container: document.getElementById("lottie_not_interactive"),
    renderer: "svg",
    loop: true,
    autoplay: true,
    animationData: json,
};
var anim = bodymovin.loadAnimation(options);

var player = new LottieInteractionPlayer(document.getElementById("lottie_interactive"));
player.load(json, false);
```
</script_playground>

### Lottie Button Example

This example uses everything we discussed so far.

A quick note: to avoid clicks going to the wrong layer we need to define
some CSS that gets rid of pointer events for layers we don't want to click.

<script_playground>
```json
{
    "v": "5.9.1",
    "ip": 0,
    "op": 60,
    "fr": 60,
    "w": 512,
    "h": 512,
    "fonts": {"list":[
        {
            "ascent": 72,
            "fFamily": "Roboto",
            "fName": "Roboto Regular",
            "fStyle": "Regular",
            "fPath": "https://fonts.googleapis.com/css2?family=Roboto&display=swap",
            "origin": 1,
        }
    ]},
    "layers": [
        {
            "ty": 5,
            "ip": 0,
            "op": 60,
            "st": 0,
            "parent": 1,
            "cl": "no-mouse",
            "ks": {
                "p": {"a": 0, "k": [0, 25]},
            },
            "t": {
                "a": [],
                "d": {
                    "x": "var $bm_rt = 'Clicks: ' + thisComp('button').clicks;",
                    "k": [
                        {
                            "s": {
                                "f": "Roboto Regular",
                                "fc": [0, 0, 0],
                                "s": 70,
                                "t": "",
                                "j": 2,
                            },
                            "t": 0
                        }
                    ]
                },
                "m": {
                    "a": {"a": 0, "k": [0,0]},
                    "g": 3
                },
                "p": {}
            }
        },
        {
            "ty": 4,
            "nm": "button",
            "ip": 0,
            "op": 60,
            "st": 0,
            "ind": 1,
            "cl": "lottie-button",
            "events": {
                "load": "thisLayer.clicks = 0;",
                "click": "thisLayer.clicks += 1;",
                "mouseenter": "thisLayer.highlighted = true;",
                "mouseleave": "thisLayer.highlighted = false;"
            },
            "ks": {
                "p": {"a": 0, "k": [256, 256]},
                "s": {
                    "a": 0,
                    "k": [100, 100],
                    "x": "var sz = thisLayer.highlighted ? 120 : 100; var $bm_rt = [sz, sz];"
                }
            },
            "shapes": [
                {
                    "ty": "rc",
                    "p": {"a": 0, "k": [0, 0]},
                    "s": {"a": 0, "k": [350, 90]},
                    "r": {"a": 0, "k": 3},
                },
                {
                    "ty": "st",
                    "o": {"a": 0, "k": 100},
                    "c": {"a": 0, "k": [0, 1, 0]},
                    "w": {"a": 0, "k": 1},
                },
                {
                    "ty": "fl",
                    "o": {"a": 0, "k": 50, "x": "var $bm_rt = thisLayer.highlighted ? 70 : 30;"},
                    "c": {"a": 0, "k": [0.4, 1, 0.4]}
                }
            ]
        }
    ]
}
```
```js
var container = document.getElementById("final_example");
var player = new LottieInteractionPlayer(container);
player.load(json);
```
```html
<div id="final_example"></div>
```
```css
.no-mouse {
    pointer-events: none;
}
.lottie-button {
    cursor: pointer;
}
```
</script_playground>
