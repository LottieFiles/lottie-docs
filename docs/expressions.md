# Expressions

<!--
    https://github.com/bodymovin/bodymovin-extension/blob/master/src/helpers/expressions/expressions.js
    https://github.com/airbnb/lottie-web/blob/master/player/js/utils/expressions/ExpressionManager.js
    https://helpx.adobe.com/after-effects/using/expression-language-reference.html

    continue from
    https://helpx.adobe.com/after-effects/using/expression-language-reference.html#time_conversion_methods_expression_reference
-->

Properties can have expressions associated with them,
when this is the case the value of such properties can be modified by using the expression.

The expression language is based on JavaScript / ECMAScript.

For the most part it uses what is described in the [After Effects expressions](https://helpx.adobe.com/after-effects/using/expression-language-reference.html).



## Global objects and methods

### `$bm_rt`

{variable_docs}
name: $bm_rt
type: Depends on the property
description: Output value for the property
notes: Must be declared and be assigned a value in every expression

The special variable `$bm_rt` is used to determine the value of the expression.

This variable must be declared by the expression and must have a value compatible with the property;

```js
var $bm_rt;
$bm_rt = 60;
```

{lottie_playground:image.json:512:512}
Rotation Expression:expression:layers[0].ks.r.x
var $bm_rt = 60;
:end:
:json:layers[0].ks.r


### `time`


{variable_docs}
name: time
type: number
description: The current time within the composition in seconds
notes: Read only

{lottie_playground:image.json:512:512}
Rotation Expression:expression:layers[0].ks.r.x
var $bm_rt = time * 360;
:end:
:json:layers[0].ks.r


### `value`

{variable_docs}
name: value
type: Depends on the property
description: The value the property would have without expressions
notes: Read only


{lottie_playground:image.json:512:512}
Position Expression:expression:layers[0].ks.p.x
var $bm_rt = [];
$bm_rt[0] = value[0] + Math.cos(2 * Math.PI * time) * 100;
$bm_rt[1] = value[1];
:end:
:json:layers[0].ks.p

### `thisProperty`

{variable_docs}
name: thisProperty
type: Property
description: Property the expression is operating on
notes: Read only

### `thisComp`

{variable_docs}
name: thisComp
type: Composition
description: Composition the property is in
notes: Read only

### `thisLayer`

{variable_docs}
name: thisLayer
type: Layer
description: Layer the property is in
notes: Read only

### comp()

{function_docs}
name: comp
param: name : string : Composition name
return: Composition :


### posterizeTime()

{function_docs}
name: posterizeTime
param: fps : number : Frames per seconds
description: The rest of the expression will only be updated this many times per second


### timeToFrames()

{function_docs}
name: timeToFrames
param: time : number : Time in seconds : time + thisComp.displayStartTime
param: fps : number : Frames per second : 1.0 / thisComp.frameDuration
return: number : Number of frames
description: Converts a time in seconds to a number of frames

### framesToTime()

{function_docs}
name: framesToTime
param: frames : number : Number of frames
param: fps : number : Frames per second : 1.0 / thisComp.frameDuration
return: number : Time in seconds
description: Converts a number of frames to a time in seconds

## Math functions


### add()

{function_docs}
name: add
param: a : any :
param: b : any :
return: any :

If `a` and `b` are numbers, it will return their sum.

If they string, their concatenation.

If they are vectors, their element-wise sum.

If one is a vector and the other a number, it will return the sum of the number by the first element of the vector.

This function is also available as `$bm_sum` and `sum`.

### sub()

{function_docs}
name: sub
param: a : any :
param: b : any :
return: any :

If `a` and `b` are numbers, or can be converted to numbers, it will return their difference.

If they are vectors, their element-wise difference.

This function is also avilable as `$bm_sub`.

### mul()


{function_docs}
name: mul
param: a : any :
param: b : any :
return: any :

If `a` and `b` are numbers, or can be converted to numbers, it will return their product.

If one of them is a vector and the other a number, it will return a vector with each element multiplied by the number.

This function is also avilable as `$bm_mul`.


### div()


{function_docs}
name: div
param: a : any :
param: b : any :
return: any :

If `a` and `b` are numbers, or can be converted to numbers, it will return their division.

If one of them is a vector and the other a number, it will return a vector with each element divided by the number.

This function is also avilable as `$bm_div`.


### mod()


{function_docs}
name: mod
param: a : number :
param: b : number :
return: number : `a % b`


### clamp()

{function_docs}
name: clamp
param: value : number : The value to clamp
param: minimum : number : Minimum value
param: maximum : number : Maximum value
return: number :
description: Clamps a value inside a range


### normalize()


{function_docs}
name: normalize
param: vector : array
return: number : same `div(vector, length(vector))`
description: Divides a vector by its length


### length()

{function_docs}
name: length
param: vector : array
return: number : length of `vector`


{function_docs}
name: length
param: a : array
param: b : array
return: number : Distance between `a` and `b`.


### looAt()

{function_docs}
name: length
param: from_point : array[3]
param: to_point : array[3]
return: number : length of `vector`

<!--
not implemented:
    dot
    cross
-->


## Random Numbers

### seedRandom()

{function_docs}
name: seedRandom
param: seed : number
description: Sets the seed for random functions


### random()

{function_docs}
name: random
return: number : Random number between 0 and 1



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
name: loopIn
param: type : string :
param: duration : number :
param: wrap : boolean :
return: Depends on the property :


## Composition

Function that can be used to search layer / properties

{lottie_playground:image_animated.json:512:512}
Position Expression:expression:layers[0].ks.p.x
var $bm_rt = [256, 256]
var rotation = comp("Animation").layer("Layer").transform.rotation / 180 * Math.PI;
$bm_rt[0] += Math.cos(rotation) * 200;
$bm_rt[1] += Math.sin(rotation) * 200;
:end:
:exec:window.foo = {}
:json:layers[0].ks.p
