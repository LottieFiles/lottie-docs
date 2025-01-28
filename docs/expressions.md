# Expressions

<!--
    https://github.com/bodymovin/bodymovin-extension/blob/master/src/helpers/expressions/expressions.js
    https://github.com/airbnb/lottie-web/blob/master/player/js/utils/expressions/ExpressionManager.js
    https://helpx.adobe.com/after-effects/using/expression-language-reference.html

    continue from
    https://helpx.adobe.com/after-effects/using/expression-language-reference.html#mask_attributes_and_methods_expression_reference
-->

Properties can have expressions associated with them,
when this is the case the value of such properties can be modified by using the expression.

The expression language is based on JavaScript / ECMAScript.

For the most part it uses what is described in the After Effects expressions.


More resources on AE expressions:

* [Expression Language Reference](https://helpx.adobe.com/after-effects/using/expression-language-reference.html)
* [After Effects Expression Reference](https://ae-expressions.docsforadobe.dev/)


## Global objects

### `$bm_rt`

{variable_docs}
schema: $bm_rt

The special variable `$bm_rt` is used to determine the value of the expression.

This variable must be declared by the expression and must have a value compatible with the property;

```js
var $bm_rt;
$bm_rt = 60;
```

<lottie-playground example="image.json">
    <form>
        <highlight title="Rotation Expression">
        var $bm_rt = 60;
        </highlight>
        <highlight title="Position Expression">
        var $bm_rt = [256, 256];
        </highlight>
    </form>
    <json>lottie.layers[0].ks</json>
    <script>
    lottie.layers[0].ks.r.x = data["Rotation Expression"];
    lottie.layers[0].ks.p.x = data["Position Expression"];
    </script>
</lottie-playground>



### `time`


{variable_docs}
schema: time


<lottie-playground example="image.json">
    <form>
        <highlight title="Rotation Expression">
        var $bm_rt = time * 360;
        </highlight>
    </form>
    <json>lottie.layers[0].ks.r</json>
    <script>
    lottie.layers[0].ks.r.x = data["Rotation Expression"];
    </script>
</lottie-playground>


### `value`

{variable_docs}
schema: value

<lottie-playground example="image.json">
    <form>
        <highlight title="Position Expression">
        var $bm_rt = [];
        $bm_rt[0] = value[0] + Math.cos(2 * Math.PI * time) * 100;
        $bm_rt[1] = value[1];
        </highlight>
    </form>
    <json>lottie.layers[0].ks.p</json>
    <script>
    lottie.layers[0].ks.p.x = data["Position Expression"];
    </script>
</lottie-playground>


### `thisProperty`

{variable_docs}
schema: thisProperty

### `thisComp`

{variable_docs}
schema: thisComp

### `thisLayer`

{variable_docs}
schema: thisLayer

## Animation Structure functions

### comp()


{function_docs}
schema: comp

## Misc Functions

### posterizeTime()

{function_docs}
schema: posterizeTime

### timeToFrames()

{function_docs}
schema: timeToFrames

### framesToTime()

{function_docs}
schema: framesToTime

### rgbToHsl()

{function_docs}
schema: rgbToHsl

### hslToRgb()

{function_docs}
schema: hslToRgb

### createPath()

{function_docs}
schema: createPath

## Math functions


### add()

{function_docs}
schema: add

If `a` and `b` are numbers, it will return their sum.

If they string, their concatenation.

If they are vectors, their element-wise sum.

If one is a vector and the other a number, it will return the sum of the number by the first element of the vector.

This function is also available as `$bm_sum` and `sum`.

### sub()

{function_docs}
schema: sub

If `a` and `b` are numbers, or can be converted to numbers, it will return their difference.

If they are vectors, their element-wise difference.

This function is also avilable as `$bm_sub`.

### mul()


{function_docs}
schema: mul

If `a` and `b` are numbers, or can be converted to numbers, it will return their product.

If one of them is a vector and the other a number, it will return a vector with each element multiplied by the number.

This function is also avilable as `$bm_mul`.


### div()


{function_docs}
schema: div

If `a` and `b` are numbers, or can be converted to numbers, it will return their division.

If one of them is a vector and the other a number, it will return a vector with each element divided by the number.

This function is also avilable as `$bm_div`.


### mod()


{function_docs}
schema: mod


### clamp()

{function_docs}
schema: clamp


### normalize()


{function_docs}
schema: normalize


### length()

{function_docs}
schema: length

### looAt()

{function_docs}
schema: lookAt


### seedRandom()

{function_docs}
schema: seedRandom

### random()

{function_docs}
schema: random

### linear()

{function_docs}
schema: linear

### ease()

Works the same as `linear()` but with a smooth cubic interpolation.

{function_docs}
schema: ease

### easeIn()

Interpolation, starts the same as `ease()` and ends the same as `linear()`

{function_docs}
schema: easeIn

### easeOut()

Interpolation, starts the same as `linear()` and ends the same as `ease()`

{function_docs}
schema: easeOut


### degreesToRadians()

{function_docs}
schema: degreesToRadians

### radiansToDegrees()

{function_docs}
schema: radiansToDegrees

<!--
Not implemented:
    footage()
    colorDepth()
    dot()
    cross()
    gaussRandom()
    noise()
    Footage

-->

## Property

### Property.value

{variable_docs}
name: value
type: Depends on the property
description: The current value the property
notes: Read only

### Property.numKeys

{variable_docs}
name: numKeys
type: number
description: Number of keyframes
notes: Read only

### Property.propertyIndex

{variable_docs}
name: propertyIndex
type: number
description: Value of `ix` in the JSON for this property
notes: Read only

### Property.valueAtTime()

{function_docs}
name: valueAtTime
param: t : number : Time in seconds
return: Depends on the property : The value of the property at the given time (without expressions)


### Property.getVelocityAtTime()

{function_docs}
name: getVelocityAtTime
param: t : number : Time in seconds
return: Depends on the property : The rate of change for the property, with the same dimensions as the value


### Property.getSpeedAtTime()

{function_docs}
name: getSpeedAtTime
param: t : number : Time in seconds
return: number : The rate of change for the property as a scalar

### Property.smooth()

{function_docs}
name: smooth
param: width : number :
param: samples : number :
return: Depends on the property :


### Property.loopIn()

{function_docs}
name: loopIn
param: type : string :
param: duration : number :
param: wrap : boolean :
return: Depends on the property :


### Property.loopOut()

{function_docs}
name: loopOut
param: type : string :
param: duration : number :
param: wrap : boolean :
return: Depends on the property :


## Composition

Composition object

<lottie-playground example="image_animated.json">
    <form>
        <highlight title="Position Expression">
        var $bm_rt = [256, 256]
        var rotation = comp("Animation").layer("Layer").transform.rotation / 180 * Math.PI;
        $bm_rt[0] += Math.cos(rotation) * 200;
        $bm_rt[1] += Math.sin(rotation) * 200;
        </highlight>
    </form>
    <json>lottie.layers[0].ks.p</json>
    <script>
    lottie.layers[0].ks.p.x = data["Position Expression"];
    </script>
</lottie-playground>

### As a function

As a function a composition object can give you access to the layers by name or index

<lottie-playground example="image_animated.json">
    <form>
        <highlight title="Position Expression">
        var $bm_rt = [256, 256]
        var rotation = thisComp("Layer").transform.rotation / 180 * Math.PI;
        $bm_rt[0] += Math.cos(rotation) * 200;
        $bm_rt[1] += Math.sin(rotation) * 200;
        </highlight>
    </form>
    <json>lottie.layers[0].ks.p</json>
    <script>
    lottie.layers[0].ks.p.x = data["Position Expression"];
    </script>
</lottie-playground>


### Composition.numLayers

{variable_docs}
name: numLayers
type: number
description: Number of layers in the composition

### Composition.width

{variable_docs}
name: width
type: number
description: Width of the composition, same as `w` in the JSON

### Composition.height

{variable_docs}
name: height
type: number
description: Height of the composition, same as `h` in the JSON

### Composition.displayStartTime


{variable_docs}
name: displayStartTime
type: number
description: Start time of the composition, in seconds. Similar to `ip` in the JSON but converted into seconds


### Composition.frameDuration

{variable_docs}
name: frameDuration
type: number
description: Duration of a frame in second, reciprocal of frames per second


### Composition.pixelAspect

{variable_docs}
name: pixelAspect
type: number
description: Pixel aspect ratio, generally `1`


### Composition.layer()

{function_docs}
name: layer
param: layer : number|string : Layer name or index
return: Layer :
description: Returns the given layer

<!--

Not implemented:
    layer(otherLayer, relIndex)
    marker
    activeCamera
    duration
    ntscDropFrame
    shutterAngle
    shutterPhase
    bgColor
    name
-->

## Layer

Layer object.

Note that it also has all the attributes from [Transform](#transform).


### Layer.index

{variable_docs}
name: index
type: number
description: Layer index, same as `ind` in the JSON

### Layer.inPoint

{variable_docs}
name: inPoint
type: number
description: Same as `ip` in the JSON but in seconds

### Layer.outPoint

{variable_docs}
name: outPoint
type: number
description: Same as `op` in the JSON but in seconds

### Layer.startTime

{variable_docs}
name: startTime
type: number
description: Same as `st` in the JSON but in seconds

### Layer.transform

Transform attributes can also be accessed from the layer object directly

{variable_docs}
name: transofrm
type: Transform

### Layer.source

{variable_docs}
name: source
type: string
description: For layers referencing an asset, the `id` of that asses. (Same as `refId` in the JSON)

### Layer.width

{variable_docs}
name: width
type: number
description: Same as `Layer.sourceRectAtTime().width`

### Layer.height

{variable_docs}
name: height
type: number
description: Same as `Layer.sourceRectAtTime().height`


### Layer.hasParent

{variable_docs}
name: hasParent
type: boolean
description: Whether the layer has a parent

### Layer.parent

{variable_docs}
name: parent
type: Layer
description: Parent layer


### Layer.sourceRectAtTime

{function_docs}
name: sourceRectAtTime
return: object : Object with these attributes: `top`, `left`, `width`, `height`

### Layer.effect

{function_docs}
name: effect
param: effect : number|string : Name or index
return: Effect :
description: Returns the given effect

### Layer.contents

{function_docs}
name: contents
param: shape : number|string : Name or index
return: Shape :
description: For shape layers, returns the given shape

## Layer space transforms

These methods convert between coordinates systems within a layer.

Some of these functions have a `Vec` suffix, which means they should be used
for difference between points (the version without this suffix is for points).

### Layer.toComp

{function_docs}
name: toComp
param: point : Array : Point
param: time : number : Time : time
return: Array :
description: Maps a point from Layer coordinates to composition coordinates

### Layer.fromComp

{function_docs}
name: toComp
param: point : Array : Point
param: time : number : Time : time
return: Array :
description: Maps a point from composition coordinates to Layer coordinates

### Layer.toCompVec

{function_docs}
name: toComp
param: point : Array : Vector
param: time : number : Time : time
return: Array :
description: Maps a vector from Layer coordinates to composition coordinates

### Layer.fromCompVec

{function_docs}
name: toComp
param: point : Array : Vector
param: time : number : Time : time
return: Array :
description: Maps a vector from composition coordinates to Layer coordinates


### Layer.toWorld

{function_docs}
name: toWorld
param: point : Array : Point
param: time : number : Time : time
return: Array :
description: Maps a point from Layer coordinates to world coordinates

### Layer.fromWorld

{function_docs}
name: toWorld
param: point : Array : Point
param: time : number : Time : time
return: Array :
description: Maps a point from world coordinates to Layer coordinates

### Layer.toWorldVec

{function_docs}
name: toWorld
param: point : Array : Vector
param: time : number : Time : time
return: Array :
description: Maps a vector from Layer coordinates to world coordinates

### Layer.fromWorldVec

{function_docs}
name: toWorld
param: point : Array : Vector
param: time : number : Time : time
return: Array :
description: Maps a vector from world coordinates to Layer coordinates



<!--
Not Implemented:
    sourceTime()
    mask
    hasVideo
    hasAudio
    active
    enabled
    audioActive
    audioLevels
    timeRemap
    marker
    name
    Layer 3D attributes and methods
    fromCompToSurface

Implemented but dummy:
    sourceRectAtTime()
    sampleImage()
-->


### Transform


{variable_docs}
name: anchorPoint
type: array[2]
description: Value of `a`

{variable_docs}
name: position
type: array[2]
description: Value of `p`

{variable_docs}
name: scale
type: number
description: Value of `s`

{variable_docs}
name: rotation
type: number
description: Value of `r`

{variable_docs}
name: opacity
type: number
description: Value of `o`

{variable_docs}
name: skew
type: number
description: Value of `sk`

{variable_docs}
name: skewAxis
type: number
description: Value of `sa`


### Effect

{variable_docs}
name: active
type: boolean
description: Whether the effect is active

### Effect()

{function_docs}
name:
param: property : number|string : Name or index of the property
return: number|Array :
description: Returns the value for the given property of the effect


<!--
Not Implemented:
    param()
-->
