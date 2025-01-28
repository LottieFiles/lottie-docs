# Layer Effects

Layers can have post-processing effects applied to them.

<h2 id="effect">Effects</h2>

{schema_object:effects/effect}

Many effects have unused values which are labeled with a number.


Effect types:

{schema_subtype_table:effects/all-effects:ty}


All the examples will use this as their base:

{lottie:image.json:512:512}


### Fill Effect

Fill all opaque areas with a solid color

{schema_object:effects/fill-effect}

{schema_effect:effects/fill-effect}

<lottie-playground example="effects-fill.json">
    <form>
        <input title="Opacity" type="range" min="0" value="1" max="1" step="0.1"/>
        <th>Color</th>
        <input title="Red" type="range" min="0" value="1" max="1" step="0.1"/>
        <input title="Green" type="range" min="0" value="0.9" max="1" step="0.1"/>
        <input title="Blue" type="range" min="0" value="0" max="1" step="0.1"/>
    </form>
    <json>lottie.layers[0].ef[0]</json>
    <script>
    lottie.layers[0].ef[0].ef[6].v.k = data["Opacity"];
    lottie.layers[0].ef[0].ef[2].v.k[0] = data["Red"];
    lottie.layers[0].ef[0].ef[2].v.k[1] = data["Green"];
    lottie.layers[0].ef[0].ef[2].v.k[2] = data["Blue"];
    </script>
</lottie-playground>

### Stroke Effect

{schema_object:effects/stroke-effect}


{schema_effect:effects/stroke-effect}


### Tritone Effect

Converts the layer to greyscale, then applies the gradient based on bright/mid/dark.

{schema_object:effects/tritone-effect}


{schema_effect:effects/tritone-effect}

<lottie-playground example="effects-tritone.json">
    <form>
        <th>Bright</th>
        <input title="Red" type="range" min="0" value="1" max="1" step="0.1" name="r1"/>
        <input title="Green" type="range" min="0" value="1" max="1" step="0.1" name="g1"/>
        <input title="Blue" type="range" min="0" value="1" max="1" step="0.1" name="b1"/>
        <th>Mid</th>
        <input title="Red" type="range" min="0" value="0.3" max="1" step="0.1" name="r2"/>
        <input title="Green" type="range" min="0" value="0.8" max="1" step="0.1" name="g2"/>
        <input title="Blue" type="range" min="0" value="0.3" max="1" step="0.1" name="b2"/>
        <th>Dark</th>
        <input title="Red" type="range" min="0" value="0" max="1" step="0.1" name="r3"/>
        <input title="Green" type="range" min="0" value="0" max="1" step="0.1" name="g3"/>
        <input title="Blue" type="range" min="0" value="0" max="1" step="0.1" name="b3"/>
    </form>
    <json>lottie.layers[0].ef[0]</json>
    <script>
    lottie.layers[0].ef[0].ef[0].v.k[0] = data["r1"];
    lottie.layers[0].ef[0].ef[0].v.k[1] = data["g1"];
    lottie.layers[0].ef[0].ef[0].v.k[2] = data["b1"];
    lottie.layers[0].ef[0].ef[1].v.k[0] = data["r2"];
    lottie.layers[0].ef[0].ef[1].v.k[1] = data["g2"];
    lottie.layers[0].ef[0].ef[1].v.k[2] = data["b2"];
    lottie.layers[0].ef[0].ef[2].v.k[0] = data["r3"];
    lottie.layers[0].ef[0].ef[2].v.k[1] = data["g3"];
    lottie.layers[0].ef[0].ef[2].v.k[2] = data["b3"];
    </script>
</lottie-playground>



### Pro Levels Effect

Color correction levels.
For more information refer to the [After Effects Documentation](https://helpx.adobe.com/after-effects/using/color-correction-effects.html#levels_effect).

{schema_object:effects/pro-levels-effect}


{schema_effect:effects/pro-levels-effect}

<lottie-playground example="effects-prolevels.json">
    <form>
        Composite:
            <input title="In Black" type="range" min="0" value="0" max="1" step="0.1" name="Composite In Black"/>
            <input title="In White" type="range" min="0" value="1" max="1" step="0.1" name="Composite In White"/>
            <input title="Gamma" type="range" min="0" value="1" max="3" step="0.1" name="Composite Gamma"/>
            <input title="Out Black" type="range" min="0" value="0" max="1" step="0.1" name="Composite Out Black"/>
            <input title="Out White" type="range" min="0" value="1" max="1" step="0.1" name="Composite Out White"/>
        Red:
            <input title="In Black" type="range" min="0" value="0" max="1" step="0.1" name="Red In Black"/>
            <input title="In White" type="range" min="0" value="1" max="1" step="0.1" name="Red In White"/>
            <input title="Gamma" type="range" min="0" value="1" max="3" step="0.1" name="Red Gamma"/>
            <input title="Out Black" type="range" min="0" value="0" max="1" step="0.1" name="Red Out Black"/>
            <input title="Out White" type="range" min="0" value="1" max="1" step="0.1" name="Red Out White"/>
        Green:
            <input title="In Black" type="range" min="0" value="0" max="1" step="0.1" name="Green In Black"/>
            <input title="In White" type="range" min="0" value="1" max="1" step="0.1" name="Green In White"/>
            <input title="Gamma" type="range" min="0" value="1" max="3" step="0.1" name="Green Gamma"/>
            <input title="Out Black" type="range" min="0" value="0" max="1" step="0.1" name="Green Out Black"/>
            <input title="Out White" type="range" min="0" value="1" max="1" step="0.1" name="Green Out White"/>
        Blue:
            <input title="In Black" type="range" min="0" value="0" max="1" step="0.1" name="Blue In Black"/>
            <input title="In White" type="range" min="0" value="1" max="1" step="0.1" name="Blue In White"/>
            <input title="Gamma" type="range" min="0" value="1" max="3" step="0.1" name="Blue Gamma"/>
            <input title="Out Black" type="range" min="0" value="0" max="1" step="0.1" name="Blue Out Black"/>
            <input title="Out White" type="range" min="0" value="1" max="1" step="0.1" name="Blue Out White"/>
    </form>
    <json>lottie.layers[0].ef[0]</json>
    <script>
    lottie.layers[0].ef[0].ef[3].v.k = data["Composite In Black"];
    lottie.layers[0].ef[0].ef[4].v.k = data["Composite In White"];
    lottie.layers[0].ef[0].ef[5].v.k = data["Composite Gamma"];
    lottie.layers[0].ef[0].ef[6].v.k = data["Composite Out Black"];
    lottie.layers[0].ef[0].ef[7].v.k = data["Composite Out White"];
    lottie.layers[0].ef[0].ef[10].v.k = data["Red In Black"];
    lottie.layers[0].ef[0].ef[11].v.k = data["Red In White"];
    lottie.layers[0].ef[0].ef[12].v.k = data["Red Gamma"];
    lottie.layers[0].ef[0].ef[13].v.k = data["Red Out Black"];
    lottie.layers[0].ef[0].ef[14].v.k = data["Red Out White"];
    lottie.layers[0].ef[0].ef[17].v.k = data["Green In Black"];
    lottie.layers[0].ef[0].ef[18].v.k = data["Green In White"];
    lottie.layers[0].ef[0].ef[19].v.k = data["Green Gamma"];
    lottie.layers[0].ef[0].ef[20].v.k = data["Green Out Black"];
    lottie.layers[0].ef[0].ef[21].v.k = data["Green Out White"];
    lottie.layers[0].ef[0].ef[24].v.k = data["Blue In Black"];
    lottie.layers[0].ef[0].ef[25].v.k = data["Blue In White"];
    lottie.layers[0].ef[0].ef[26].v.k = data["Blue Gamma"];
    lottie.layers[0].ef[0].ef[27].v.k = data["Blue Out Black"];
    lottie.layers[0].ef[0].ef[28].v.k = data["Blue Out White"];
    </script>
</lottie-playground>


### Tint Effect

The layer is converted to grayscale, then black to white is mapped to
the given color.

The result is merged back with the original based on the intensity.

{schema_object:effects/tint-effect}


{schema_effect:effects/tint-effect}

<lottie-playground example="effects-tint.json">
    <form>
        <th>Black</th>
        <input title="Red" type="range" min="0" value="0" max="1" step="0.1" name="Black Red"/>
        <input title="Green" type="range" min="0" value="0" max="1" step="0.1" name="Black Green"/>
        <input title="Blue" type="range" min="0" value="0" max="1" step="0.1" name="Black Blue"/>
        <th>White</th>
        <input title="Red" type="range" min="0" value="0" max="1" step="0.1" name="White Red"/>
        <input title="Green" type="range" min="0" value="1" max="1" step="0.1" name="White Green"/>
        <input title="Blue" type="range" min="0" value="0" max="1" step="0.1" name="White Blue"/>
        <th>Intensity</th>
        <input title="Effect Intensity" type="range" min="0" value="90" max="100"/>
    </form>
    <json>lottie.layers[0].ef[0]</json>
    <script>
    lottie.layers[0].ef[0].ef[0].v.k[0] = data["Black Red"];
    lottie.layers[0].ef[0].ef[0].v.k[1] = data["Black Green"];
    lottie.layers[0].ef[0].ef[0].v.k[2] = data["Black Blue"];
    lottie.layers[0].ef[0].ef[1].v.k[0] = data["White Red"];
    lottie.layers[0].ef[0].ef[1].v.k[1] = data["White Green"];
    lottie.layers[0].ef[0].ef[1].v.k[2] = data["White Blue"];
    lottie.layers[0].ef[0].ef[2].v.k = data["Effect Intensity"];
    </script>
</lottie-playground>

### Matte3 Effect

{schema_string:effects/matte3-effect/description}

{schema_object:effects/matte3-effect}


{schema_effect:effects/matte3-effect}

<lottie-playground example="effects-matte3.json">
    <form>
        <select title="Layer"><option value="2">Circle</option><option value="3">Rectangle</option></select>
        <select title="Channel">
            <option value="1">Red</option>
            <option value="2">Green</option>
            <option value="3">Blue</option>
            <option value="4" selected="selected">Alpha</option>
            <option value="5">Luma</option>
            <option value="6">Hue</option>
            <option value="7">Lightness</option>
            <option value="8">Saturation</option>
            <option value="9">Full</option>
            <option value="10">Off</option>
        </select>
        <input title="Invert" type="checkbox" />
        <input title="Stretch To Fit" type="checkbox" checked="checked"/>
        <input title="Show Mask" type="checkbox" checked="checked"/>
        <input title="Premultiply Mask" type="checkbox" checked="checked"/>
    </form>
    <json>lottie.layers[0].ef[0]</json>
    <script>
    lottie.layers[0].ef[0].ef[0].v.k = Number(data["Layer"]);
    lottie.layers[0].ef[0].ef[1].v.k = Number(data["Channel"]);
    lottie.layers[0].ef[0].ef[2].v.k = Number(data["Invert"]);
    lottie.layers[0].ef[0].ef[3].v.k = Number(data["Stretch To Fit"]);
    lottie.layers[0].ef[0].ef[4].v.k = Number(data["Show Mask"]);
    lottie.layers[0].ef[0].ef[5].v.k = Number(data["Premultiply Mask"]);
    </script>
</lottie-playground>

### Gaussian Blur Effect

{schema_object:effects/gaussian-blur-effect}


{schema_effect:effects/gaussian-blur-effect}


<lottie-playground example="effects-blur.json">
    <form>
        <input title="Sigma" type="range" min="0" value="25" max="100"/>
        <select title="Direction">
            <option value="1">Both</option>
            <option value="2">Horizontal</option>
            <option value="3">Vertical</option>
        </select>
        <input title="Wrap" type="checkbox" />
    </form>
    <json>lottie.layers[0].ef[0]</json>
    <script>
    lottie.layers[0].ef[0].ef[0].v.k = data["Sigma"];
    lottie.layers[0].ef[0].ef[1].v.k = Number(data["Direction"]);
    lottie.layers[0].ef[0].ef[2].v.k = Number(data["Wrap"]);
    </script>
</lottie-playground>



### Drop Shadow Effect

{schema_object:effects/drop-shadow-effect}


{schema_effect:effects/drop-shadow-effect}

<lottie-playground example="effects-shadow.json">
    <form>
        <input title="Red" type="range" min="0" value="0" max="1" step="0.1"/>
        <input title="Green" type="range" min="0" value="0" max="1" step="0.1"/>
        <input title="Blue" type="range" min="0" value="0" max="1" step="0.1"/>
        <input title="Opacity" type="range" min="0" value="128" max="256"/>
        <input title="Angle" type="range" min="0" value="135" max="360"/>
        <input title="Distance" type="range" min="0" value="10" max="512"/>
        <input title="Blur" type="range" min="0" value="7" max="512"/>
    </form>
    <json>lottie.layers[0].ef[0]</json>
    <script>
    lottie.layers[0].ef[0].ef[0].v.k[0] = data["Red"];
    lottie.layers[0].ef[0].ef[0].v.k[1] = data["Green"];
    lottie.layers[0].ef[0].ef[0].v.k[2] = data["Blue"];
    lottie.layers[0].ef[0].ef[1].v.k = data["Opacity"];
    lottie.layers[0].ef[0].ef[2].v.k = data["Angle"];
    lottie.layers[0].ef[0].ef[3].v.k = data["Distance"];
    lottie.layers[0].ef[0].ef[4].v.k = data["Blur"];
    </script>
</lottie-playground>



### Radial Wipe Effect

{schema_object:effects/radial-wipe-effect}


{schema_effect:effects/radial-wipe-effect}


### Displacement Map Effect

{schema_object:effects/displacement-map-effect}


{schema_effect:effects/displacement-map-effect}


### Mesh Warp Effect

{schema_object:effects/mesh-warp-effect}


{schema_effect:effects/mesh-warp-effect}

### Puppet Effect

{schema_object:effects/puppet-effect}


{schema_effect:effects/puppet-effect}


### Spherize Effect

{schema_object:effects/spherize-effect}


{schema_effect:effects/spherize-effect}


### Wavy Effect

{schema_object:effects/wavy-effect}


{schema_effect:effects/wavy-effect}

### Twirl Effect

{schema_object:effects/twirl-effect}


{schema_effect:effects/twirl-effect}

### Custom Effect

You might find various different effects all with `ty` = 5.

Sometimes these are used together with expressions.

{schema_object:effects/custom-effect}



## Effect Values

{schema_object:effect-values/effect-value}

{schema_subtype_table:effect-values/all-effect-values:ty}

### No Value

{schema_object:effect-values/no-value}


### Slider

{schema_object:effect-values/slider}


### Angle

{schema_object:effect-values/angle}


### Color

{schema_object:effect-values/color}


### Point

{schema_object:effect-values/point}


### Checkbox

{schema_object:effect-values/checkbox}


### Ignored

{schema_object:effect-values/ignored}


### Drop Down

{schema_object:effect-values/drop-down}


### Layer

{schema_object:effect-values/layer}


## Layer Style

A layer can also have a list of styles applied to it

{schema_object:styles/layer-style}


Style types:

{schema_subtype_table:styles/all-layer-styles:ty}

### Stroke Style

{schema_object:styles/stroke-style}


### Drop Shadow Style

{schema_object:styles/drop-shadow-style}


### Inner Shadow Style

{schema_object:styles/inner-shadow-style}


### Outer Glow Style

{schema_object:styles/outer-glow-style}


### Inner Glow Style

{schema_object:styles/inner-glow-style}


### Bevel / Emboss Style

{schema_object:styles/bevel-emboss-style}


### Satin Style

{schema_object:styles/satin-style}


### Color Overlay Style

{schema_object:styles/color-overlay-style}


### Gradient Overlay Style

{schema_object:styles/gradient-overlay-style}

