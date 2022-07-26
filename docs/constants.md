# Enumerations

## {schema_attribute:title:constants/blend-mode}

{schema_attribute:description:constants/blend-mode}

{schema_enum:blend-mode}

In the following example you can change the blend mode of the top layer

{lottie_playground:blend_mode.json:512:512}
Blend Mode:<enum>blend-mode</enum>
Opacity:<input type="range" min="0" value="50" max="100"/>
<script>
lottie.layers[0].bm = Number(data["Blend Mode"]);
lottie.layers[0].ks.o.k = data["Opacity"];
</script>


## {schema_attribute:title:constants/composite}

{schema_attribute:description:constants/composite}

{schema_enum:composite}


## {schema_attribute:title:constants/fill-rule}

{schema_attribute:description:constants/fill-rule}

{schema_enum:fill-rule}


## {schema_attribute:title:constants/font-path-origin}

{schema_attribute:description:constants/font-path-origin}

{schema_enum:font-path-origin}


## {schema_attribute:title:constants/gradient-type}

{schema_attribute:description:constants/gradient-type}

{schema_enum:gradient-type}


## {schema_attribute:title:constants/line-cap}

{schema_attribute:description:constants/line-cap}

{schema_enum:line-cap}


## {schema_attribute:title:constants/line-join}

{schema_attribute:description:constants/line-join}

{schema_enum:line-join}


## {schema_attribute:title:constants/mask-mode}

{schema_attribute:description:constants/mask-mode}

{schema_enum:mask-mode}


## {schema_attribute:title:constants/matte-mode}

{schema_attribute:description:constants/matte-mode}

{schema_enum:matte-mode}

{lottie_playground:matte.json:512:512}
Matte Mode:<enum value="1">matte-mode</enum>
<script>
lottie.layers[2].tt = Number(data["Matte Mode"]);
</script>


## {schema_attribute:title:constants/merge-mode}

{schema_attribute:description:constants/merge-mode}

{schema_enum:merge-mode}


## {schema_attribute:title:constants/shape-direction}

{schema_attribute:description:constants/shape-direction}

{schema_enum:shape-direction}


## {schema_attribute:title:constants/star-type}

{schema_attribute:description:constants/star-type}

{schema_enum:star-type}


## {schema_attribute:title:constants/stroke-dash-type}

{schema_attribute:description:constants/stroke-dash-type}

{schema_enum:stroke-dash-type}


## {schema_attribute:title:constants/text-based}

{schema_attribute:description:constants/text-based}

{schema_enum:text-based}


## {schema_attribute:title:constants/text-grouping}

{schema_attribute:description:constants/text-grouping}

{schema_enum:text-grouping}


## {schema_attribute:title:constants/text-justify}

{schema_attribute:description:constants/text-justify}

{schema_enum:text-justify}


## {schema_attribute:title:constants/text-shape}

{schema_attribute:description:constants/text-shape}

{schema_enum:text-shape}


## {schema_attribute:title:constants/trim-multiple-shapes}

{schema_attribute:description:constants/trim-multiple-shapes}

{schema_enum:trim-multiple-shapes}

## {schema_attribute:title:constants/text-caps}

{schema_attribute:description:constants/text-caps}

{schema_enum:text-caps}
