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
type: ThisLayerFunction
description: Composition the property is in
notes: Read only

### `thisLayer`

{variable_docs}
name: thisLayer
type: ThisLayerFunction
description: Layer the property is in
notes: Read only

## Global Functions

### comp()

{function_docs}
name: comp
param: name : string : Composition name
return: ThisLayerFunction :


### posterizeTime()

{function_docs}
name: posterizeTime
param: fps : number : Frames per seconds
description: The rest of the expression will only be updated this many times per second

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


## ThisLayerFunction

Function that can be used to search layer / properties

{lottie_playground:image_animated.json:512:512}
Position Expression:expression:layers[0].ks.p.x
var $bm_rt = [256, 256]
var rotation = comp("Animation")("Layer")("transform")("rotation") / 180 * Math.PI;
$bm_rt[0] += Math.cos(rotation) * 200;
$bm_rt[1] += Math.sin(rotation) * 200;
:end:
:exec:window.foo = {}
:json:layers[0].ks.p
