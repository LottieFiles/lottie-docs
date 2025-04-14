# Layers

<h2 id="layer">Layer</h2>

{schema_string:layers/layer/description}

{schema_object:layers/layer}

The `ty` property defines the specific layer type based on the following values:

{schema_subtype_table:layers/all-layers:ty}

<h2 id="visual-layer">Visual Layer</h2>

{schema_string:layers/visual-layer/description}

{schema_object:layers/visual-layer}

Note that layers that don't have a visual component (Audio layers for example),
won't have a transform and similar.

The layer is only visible between its `ip` and `op`.
If they match the corresponding attributes in {link:composition/animation}, the layer
will be visible the whole time, otherwise it will become visible at the frame `ip`
and disappear at `op`.

### Parenting

Within a list of layers, the `ind` attribute (if present) must be unique.

Layers having a `parent` attribute matching another layer will inherit their
parent's transform (except for opacity).

Basically you need multiply the transform matrix by the parent's transform matrix
to get a child layer's final transform.

The flat layer structure and flexible parenting allows more flexibility but it's
different from the more traditional approach of nesting child layers inside the
parent layer (like a folder structure).

One of the advantages of flexible parenting is you can have children of the same
layer be intermixed with unrelated layers.

In the following example, the star and the ellipse are in separate layers,
but both have the same parent, which moves left and right.
Between the two there's an additional layer with the rectangle.

{lottie src="static/examples/parenting.json"}

### Auto Orient

When true, if the transform position is animated, it rotates the layer along the
path the position follows.

In the following example there are two arrows animated along the same path,
with no rotation when the position moves towards the right.

The transparent one keeps its rotation the same (`ao` is 0), while the solid one
follows the path (`ao` is 1).

{lottie src="static/examples/auto_orient.json"}

### Mattes

A matte allows using a layer as a mask for another layer.

The way it works is the layer defining the mask has a `tt` attribute with the
appropriate [value](constants.md#mattemode).
By defaults it affects the layer on top (the layer before it in the layer list, which has the `td` attribute),
otherwise check the `tp` attribute.


In this example there's a layer with a rectangle and a star being masked by an ellipse:

<lottie-playground example="matte.json">
    <title>Example</title>
    <form>
        <input type="checkbox" checked="checked" title="Enable Matte"/>
        <enum title="Matte Mode" value="1">matte-mode</enum>
    </form>
    <json>{...lottie.layers[1], shapes: [], ks: {}}</json>
    <script>
        if ( data["Enable Matte"] )
        {
            lottie.layers[1].tt = Number(data["Matte Mode"]);
            lottie.layers[1].tp = 1;
            lottie.layers[0].td = 1;
        }
        else
        {
            lottie.layers[1].tt = undefined;
            lottie.layers[1].tp = undefined;
            lottie.layers[0].td = undefined;
        }
    </script>
</lottie-playground>


### Masks

A layer can have an array of {link:helpers/mask:masks} that clip the contents of the layer to a shape.

This is similar to [mattes](#mattes), but there are a few differences.

With mattes, you use a layer to define the clipping area, while with masks
you use an [animated](properties.md#animated-property) {link:values/bezier:bezier curve}.

<lottie-playground example="mask.json">
    <title>Example</title>
    <form>
        <enum title="Mode" value="a">mask-mode</enum>
        <input type="range" min="0" max="100" value="100" title="Opacity"/>
        <input title="Invert" type="checkbox"/>
        <input type="range" min="-100" max="100" value="0" title="Expand"/>
    </form>
    <json>lottie.layers[0].masksProperties[0]</json>
    <script>
        let mask = lottie.layers[0].masksProperties[0];
        mask.o.k = Number(data["Opacity"]);
        mask.inv = data["Invert"];
        mask.x.k = Number(data["Expand"]);
        mask.mode = data["Mode"];
    </script>
</lottie-playground>



### Lists of layers and shapes

Such lists appear Precomposition, Animation, ShapeLayer, and Groop.

In such lists, items coming first will be rendered on top

So if you have for example: `[Ellipse, Rectangle]`

The ellipse will show on top of the rectangle:

{lottie src="static/examples/layer_order.json"}

This means the render order goes from the last element to the first.


<h2 id="shape-layer">Shape Layer</h2>

Renders vector data.

The only special property for this layer is **shapes**, an [array](layers.md#lists-of-layers-and-shapes) of [shapes](shapes.md#shape-element).

{schema_object:layers/shape-layer}

<h2 id="precomposition-layer">Precomposition Layer</h2>

This layer renders a [precomposition](assets.md#precomposition).

You can find more details in the [Precompositions](breakdown/precomps.md) page.

{schema_object:layers/precomposition-layer}

### Time remapping

The `tm` property maps the time in seconds of the precomposition to show.

Basically you get the value of `tm` at the current frame, then assume that's
a time in seconds since the start of the animation, and render the corresponding
frame of the precomposition.

Follows an example of this, here there are two layers showing the same
precomposition, the one at the top right keeps the original time while the bottom
one remaps time as follows:

* frame 0 (0s) maps to 0s (frame 0) in the precomp
* frame 30 (0.5s) maps to 3s (frame 180) in the precomp
* frame 60 (1s) maps to 1.5s (frame 90) in the precomp
* frame 180 (3s) maps to 3s (frame 180) in the precomp

Basically it makes the precomp play in the first half second, then rewind
to half way for the next half second, and plays back to the end for the remaining
2 seconds.

<lottie-playground example="remapping.json">
    <json>{...lottie.layers[1], ks:{}}</json>
</lottie-playground>


<h2 id="null-layer">Null Layer</h2>

This layer doesn't have any special properties.

It's often used by animators as a parent to multiple other layers (see [parenting](#parenting)).

{schema_object:layers/null-layer}

<h2 id="text-layer">Text Layer</h2>

For text data, please refer to the [section about text](text.md) for details.

{schema_object:layers/text-layer}

<h2 id="image-layer">Image Layer</h2>

This layer renders a static [image](assets.md#image).

{schema_object:layers/image-layer}

<h2 id="solid-layer">Solid Layer</h2>

This layer represents a rectangle with a single color.

Anything you can do with solid layers, you can do better with a shape layer
and a rectangle shape since none of this layer's own properties can be animated.

Note that the color is represented as a string, unlike most other places.

{schema_object:layers/solid-layer}

<lottie-playground example="layers-solid.json">
    <form>
        <input title="Color" type="color" value="#ff0000" />
        <input title="Width" type="range" min="0" max="512" value="512"/>
        <input title="Height" type="range" min="0" max="512" value="512"/>
    </form>
    <json>lottie.layers[0]</json>
    <script>
    lottie.layers[0].sc = data["Color"];
    lottie.layers[0].sw = Number(data["Width"]);
    lottie.layers[0].sh = Number(data["Height"]);
    </script>
</lottie-playground>


<h2 id="audio-layer">Audio Layer</h2>

This layer plays a {link:assets/sound:sound}.

{schema_object:layers/audio-layer}

### Audio Settings

{schema_object:layers/audio-settings}

## 3D Layers

Layers can have 3D transforms as well:

<lottie src="static/examples/3d_layers_animation.json" renderer="html" />

3D layers need to have the `ddd` set to `1` (and so does the top-level object).

Their transform will habe `a` and `p` specified as 3D components.

Rotation will be split into 3 properties: `rx`, `ry`, `rz`, and
you have and additional orientation property `or`.


<lottie-playground example="3d_layers.json" renderer="html">
    <form>
        <th>Anchor</th>
        <input title="X" type="range" min="0" max="512" value="0" name="ax"/>
        <input title="Y" type="range" min="0" max="512" value="0" name="ay"/>
        <input title="Z" type="range" min="-100" max="100" value="0" name="az"/>
        <th>Position</th>
        <input title="X" type="range" min="0" max="512" value="256" name="px"/>
        <input title="Y" type="range" min="0" max="512" value="256" name="py"/>
        <input title="Z" type="range" min="-100" max="100" value="0" name="pz"/>
        <th>Rotation</th>
        <input title="X" type="range" min="0" max="360" value="0" name="rx"/>
        <input title="Y" type="range" min="0" max="360" value="30" name="ry"/>
        <input title="Z" type="range" min="0" max="360" value="0" name="rz"/>
        <th>Orientation</th>
        <input title="X" type="range" min="0" max="360" value="0" name="orx"/>
        <input title="Y" type="range" min="0" max="360" value="0" name="ory"/>
        <input title="Z" type="range" min="0" max="360" value="0" name="orz"/>
        <th>Scale</th>
        <input title="X" type="range" min="0" max="300" value="100" name="sx"/>
        <input title="Y" type="range" min="0" max="300" value="100" name="sy"/>
        <input title="Z" type="range" min="0" max="300" value="100" name="sz"/>
    </form>
    <json>lottie.layers[1].ks</json>
    <script>
    lottie.layers[1].ks.a.k = [
        data["ax"], data["ay"], data["az"]
    ];
    lottie.layers[1].ks.p.k = [
        data["px"], data["py"], data["pz"]
    ];
    lottie.layers[1].ks.or.k = [
        data["orx"], data["ory"], data["orz"]
    ];
    lottie.layers[1].ks.s.k = [
        data["sx"], data["sy"], data["sz"]
    ];
    lottie.layers[1].ks.rx.k = data["rx"];
    lottie.layers[1].ks.ry.k = data["ry"];
    lottie.layers[1].ks.rz.k = data["rz"];
    </script>
</lottie-playground>

<h3 id="camera-layer">Camera Layer</h3>

Camera for 3D layers.

{schema_object:layers/camera-layer}


<lottie-playground example="camera.json" renderer="html">
    <form>
        <input title="Perspective" type="range" min="0" max="512" value="256" />
        <th>Position</th>
        <input title="X" type="range" min="-512" max="512" value="0" name="px"/>
        <input title="Y" type="range" min="-512" max="512" value="0" name="py"/>
        <input title="Z" type="range" min="-512" max="512" value="-10" name="pz"/>
        <th>Rotation</th>
        <input title="X" type="range" min="-180" max="180" value="0" name="rx"/>
        <input title="Y" type="range" min="-180" max="180" value="0" name="ry"/>
        <input title="Z" type="range" min="-180" max="180" value="0" name="rz"/>
        <th>Orientation</th>
        <input title="X" type="range" min="-180" max="180" value="0" name="orx"/>
        <input title="Y" type="range" min="-180" max="180" value="0" name="ory"/>
        <input title="Z" type="range" min="-180" max="180" value="0" name="orz"/>
    </form>
    <json>lottie.layers[0]</json>
    <script>
    var index = 0;
    lottie.layers[index].ks.p.k = [
        data["px"], data["py"], data["pz"]
    ];
    lottie.layers[index].ks.or.k = [
        data["orx"], data["ory"], data["orz"]
    ];
    lottie.layers[index].ks.rx.k = data["rx"];
    lottie.layers[index].ks.ry.k = data["ry"];
    lottie.layers[index].ks.rz.k = data["rz"];
    lottie.layers[index].pe.k = data["Perspective"];
    </script>
</lottie-playground>

### 3D Parenting

As with 2D layers, you can parent 3D layers.

<lottie-playground example="3d_parenting.json" renderer="html">
    <form>
        <th>Position</th>
        <input title="X" type="range" min="-512" max="512" value="0" name="px"/>
        <input title="Y" type="range" min="-512" max="512" value="0" name="py"/>
        <input title="Z" type="range" min="-512" max="512" value="-10" name="pz"/>
        <th>Rotation</th>
        <input title="X" type="range" min="-180" max="180" value="0" name="rx"/>
        <input title="Y" type="range" min="-180" max="180" value="0" name="ry"/>
        <input title="Z" type="range" min="-180" max="180" value="0" name="rz"/>
        <th>Orientation</th>
        <input title="X" type="range" min="-180" max="180" value="0" name="orx"/>
        <input title="Y" type="range" min="-180" max="180" value="0" name="ory"/>
        <input title="Z" type="range" min="-180" max="180" value="0" name="orz"/>
    </form>
    <json>lottie.layers[1]</json>
    <script>
    var index = 1;
    lottie.layers[index].ks.p.k = [
        data["px"], data["py"], data["pz"]
    ];
    lottie.layers[index].ks.or.k = [
        data["orx"], data["ory"], data["orz"]
    ];
    lottie.layers[index].ks.rx.k = data["rx"];
    lottie.layers[index].ks.ry.k = data["ry"];
    lottie.layers[index].ks.rz.k = data["rz"];
    </script>
</lottie-playground>


## Data Layer

This layer links to a [data source](assets.md#data-source).

{schema_object:layers/data-layer}
