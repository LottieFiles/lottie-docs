Authors: Mattia Basaglia
no_nav: 1
disable_toc: 1

# A human's guide to the Lottie format

Lottie is a vector animation format, using JSON to represent its data.

This guide aims to provide a human-readable description of the format and how
everything works within it.

This documentation assumes the reader is already familiar with the following concepts:

* [JSON](https://en.wikipedia.org/wiki/JSON)
* [Vector Graphics](https://en.wikipedia.org/wiki/Vector_graphics)
* [Bezier Curves](https://en.wikipedia.org/wiki/B%C3%A9zier_curve)
* [Tweening](https://en.wikipedia.org/wiki/Inbetweening)
* [Easing Functions](https://www.febucci.com/2018/08/easing-functions/)

## What this guide is

This guide aims to describe the lottie format in its entirety, while also give
in-depth descriptions of how every aspect works, which you can't get from just
looking at a list of JSON attributes.

It contains a [section](breakdown/bouncy_ball.md) that shows a breakdown of
simple lottie animation describing what is going on as an introduction for the format.

It also has [reference pages](layers.md) which go over the details of every object
you can find in a lottie file, and a description of its most notable attributes.

It provides a complete [JSON schema](schema.md), this is intended
for people who want to write tools to parse or generate lottie and need to get
every little detail.

Finally it has a [section with details about rendering](rendering.md),
which gives tips and provides pseudo-code on how to draw various elements to
match with the lottie web player.

## What this guide is not

You won't find here information on how to animate, or how to export a lottie
file from your editor of choice.

It also won't give information on how to embed lottie animations in your
application or website.

This is because there's already a lot of documentation for creating and using
lottie animations, while this aims at providing a description of the file format itself.

## For the Impatient

The top level JSON object is the {link:composition/animation}.

Note that some lottie players require certain JSON keys to be presents before others in the file
to play properly.

Objects within the JSON may have a mixture of animatable and non-animatable properties.

If a property is not animated, the value is represented as usual within the JSON.
If it's animated, it has a special [representation](properties.md).

## Interactive Explanation

If you have a lottie animation and you want to see an interactive description
of its contents, you can visit the [JSON Editor](playground/json_editor.md) page.

## Anatomy of a Lottie file

Go to the [next page](breakdown/bouncy_ball.md) for a breakdown of a simple
lottie animation.

## JSON Schema

This guide provides a human-readable description of the format, but if you want
a machine-readable description, we also have a [JSON schema](lottie.schema.json).


## Other Resources

* [Lottie documentation from python-lottie](https://mattbas.gitlab.io/python-lottie/group__Lottie.html#details)
* [Lottie community documentation](https://github.com/lottie-animation-community/docs)
* [Lottie community schema](https://github.com/lottie-animation-community/tests)
