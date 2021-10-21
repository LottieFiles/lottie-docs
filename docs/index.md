Authors: Mattia Basaglia

# A human's guide to the Lottie format

Lottie is a vector animation format, using JSON to represent its data.

This guide aims to provide a human-readable description of the format and how
everything works within it.

Lottie has several implementations and some things might vary from player to player,
this guide tries to follow the behaviour of [lottie web](https://github.com/airbnb/lottie-web/)
which is the reference implementation.

Note that some lottie players require certain JSON keys to be presents before others in the file
to play properly.

This documentation assumes the reader is already familiar with the following concepts:

* [Vector Graphics](https://en.wikipedia.org/wiki/Vector_graphics)
* [Bezier Curves](https://en.wikipedia.org/wiki/B%C3%A9zier_curve)
* [Tweening](https://en.wikipedia.org/wiki/Inbetweening)
* [Easing Functions](https://www.febucci.com/2018/08/easing-functions/)


## For the Impatient

The top level JSON object is the [Animation](animation.md).

Objects within the JSON may have a mixture of animatable and non-animatable properties.

If a property is not animated, the value is represented as usual within the JSON.

If it's animated, it has a special [representation](concepts/#animated-property).

## Anatomy of a Lottie file

Go to the [next page](breakdown/bouncy_ball.md) for a breakdown of a simple
lottie animation.

## JSON Schema

This guide provides a human-readable description of the format, but if you want
a machine-readable description, we also have a [JSON schema](schema/lottie.schema.json).


## Other Resources

* [Lottie documentation from python-lottie](https://mattbas.gitlab.io/python-lottie/group__Lottie.html#details)
* [Lottie community documentation](https://github.com/lottie-animation-community/docs)
* [Lottie community schema](https://github.com/lottie-animation-community/tests)
