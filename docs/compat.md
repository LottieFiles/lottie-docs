# Compatibility with older versions

This page describes breaking changes that have been introduced over time.

You'd need to check `v` from {link:composition/animation} to see the
the lottie is so old to need to worry about these.

The code examples are just for illustrative purposes and are not to be
taken as a complete conversion code.

## [0,255] Colors

Until `v` 4.1.9.

Modern Lotties have {link:values/color:color} components in the [0, 1] range.
Older ones have components in the [0, 255] range.

Fix: Divide all color components by 255.

## Static text document

Until `v` 4.4.14.

In {link:text/text-data}, `d` was not animated.

Fix: Wrap into an animated property

`text_layer.t.d = {"a": 0, "k": text_layer.t.d}`

## Shape closing

Until `v` 4.4.18.

{link:shapes/path} objects had a boolean `closed` property and `c` was not
present in the bezier data.

Similarly, {link:helpers/mask} had `cl` that worked the same way.

Fix: For each {link:shapes/path}, update all the keyframes
(or the non-animated value) of `ks`.
Do the same to fix `pt` in each {link:helpers/mask}.

`shape.ks.k.c = shape.closed ? 1 : 0`

## Old keyframe style

Until `v` 5.0.0 (?).

{link:properties/base-keyframe:Keyframes} had an `e` property that specified
the end value for that keyframe (`s` marking the start value),
and the last keyframe would not have `s`.

Fix: Ignore all the `e` in keyframes, but copy the `e` from the keyframe
before last into the last keyframe.

`keyframes[keyframes.length - 1].s = keyframes[keyframes.length - 2].e`



## Static text layer properties

Until `v` 5.7.15.

In {link:text/text-follow-path} properties `r`, `a`, and `p` were
plain numbers instead of animated properties.

Fix: Wrap all of those into animated properties

`text_layer.t.p.a + {"a": 0, "k": text_layer.t.p.a}`

