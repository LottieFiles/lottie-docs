# Enumerations

<h2 id="blend-mode">Blend Mode</h2>

{schema_string:constants/blend-mode/description}

{schema_enum:blend-mode}

In the following example you can change the blend mode of the top layer

<lottie-playground example="blend_mode.json">
    <title>Example</title>
    <form>
        <input title="Opacity" type="range" min="0" value="50" max="100"/>
        <enum title="Blend Mode">blend-mode</enum>
    </form>
    <json>lottie.layers[0]</json>
    <script>
        lottie.layers[0].bm = Number(data["Blend Mode"]);
        lottie.layers[0].ks.o.k = data["Opacity"];
    </script>
</lottie-playground>


<h2 id="composite">Composite</h2>

{schema_string:constants/composite/description}

{schema_enum:composite}


<h2 id="fill-rule">Fill Rule</h2>

{schema_string:constants/fill-rule/description}

{schema_enum:fill-rule}

<lottie-playground example="fill.json">
    <title>Example</title>
    <form>
        <enum title="Fill Rule">fill-rule</enum>
    </form>
    <json>lottie.layers[0].shapes[0].it[1]</json>
    <script>
        var shape = lottie.layers[0].shapes[0].it[1];
        shape.r = Number(data["Fill Rule"]);
    </script>
</lottie-playground>


<h2 id="font-path-origin">Font Path Origin</h2>

{schema_string:constants/font-path-origin/description}

{schema_enum:font-path-origin}


<h2 id="gradient-type">Gradient Type</h2>

{schema_string:constants/gradient-type/description}

{schema_enum:gradient-type}


<h2 id="line-cap">Line Cap</h2>

{schema_string:constants/line-cap/description}

{schema_enum:line-cap}

<lottie-playground example="stroke.json">
    <title>Example</title>
    <form>
        <enum title="Line Cap" value="2">line-cap</enum>
    </form>
    <json>lottie.layers[0].shapes[2]</json>
    <script>
        var shape = lottie.layers[0].shapes[2];
        shape.lc = Number(data["Line Cap"]);
        shape.d = undefined;
    </script>
</lottie-playground>


<h2 id="line-join">Line Join</h2>

{schema_string:constants/line-join/description}

{schema_enum:line-join}

<lottie-playground example="stroke.json">
    <title>Example</title>
    <form>
        <enum title="Line Join" value="2">line-join</enum>
        <input type="range" min="0" max="10" value="3" title="Miter Limit"/>
    </form>
    <json>lottie.layers[0].shapes[2]</json>
    <script>
        var shape = lottie.layers[0].shapes[2];
        shape.lj = Number(data["Line Join"]);
        shape.ml = data["Miter Limit"];
        shape.d = undefined;
        var trim = lottie.layers[0].shapes[1];
        trim.e.k = 100;
    </script>
</lottie-playground>

<h2 id="mask-mode">Mask Mode</h2>

{schema_string:constants/mask-mode/description}

{schema_enum:mask-mode}

<lottie-playground example="mask.json">
    <title>Example</title>
    <form>
        <enum title="Mask Mode" value="a">mask-mode</enum>
        <input type="range" min="0" max="100" value="100" title="Mask1 Opacity"/>
        <input type="range" min="0" max="100" value="100" title="Mask2 Opacity"/>
    </form>
    <json>lottie.layers[1].masksProperties[1]</json>
    <script>
        let mask1 = lottie.layers[1].masksProperties[0];
        let mask2 = lottie.layers[1].masksProperties[1];
        mask1.o.k = Number(data["Mask1 Opacity"]);
        mask2.o.k = Number(data["Mask2 Opacity"]);
        mask2.mode = data["Mask Mode"];
    </script>
</lottie-playground>


<h2 id="matte-mode">Matte Mode</h2>

{schema_string:constants/matte-mode/description}

{schema_enum:matte-mode}

<lottie-playground example="matte.json">
    <title>Example</title>
    <form>
        <enum title="Matte Mode" value="1">matte-mode</enum>
    </form>
    <json>{...lottie.layers[1], shapes: [], ks: {}}</json>
    <script>
        lottie.layers[1].tt = Number(data["Matte Mode"]);
    </script>
</lottie-playground>


<h2 id="merge-mode">Merge Mode</h2>

{schema_string:constants/merge-mode/description}

{schema_enum:merge-mode}


<h2 id="shape-direction">Shape Direction</h2>

{schema_string:constants/shape-direction/description}

{schema_enum:shape-direction}

<lottie-playground example="trim_path.json">
    <form>
        <enum title="Shape Direction">shape-direction</enum>
    </form>
    <json>lottie.layers[0].shapes[1]</json>
    <script>
        for ( let shape of lottie.layers[0].shapes )
            shape.d = Number(data["Shape Direction"]);
    </script>
</lottie-playground>


<h2 id="star-type">Star Type</h2>

{schema_string:constants/star-type/description}

{schema_enum:star-type}

<lottie-playground example="star.json">
    <title>Example</title>
    <form>
        <enum title="Star Type">star-type</enum>
    </form>
    <json>lottie.layers[0].shapes[0].it[0]</json>
    <script>
        var star = lottie.layers[0].shapes[0].it[0];
        star.sy = Number(data["Star Type"]);
        if ( data["Star Type"] == "1" )
        {
            star["ir"] = {"a": 0, "k": 100};
            star["is"] = {"a": 0, "k": 0};
        }
        else
        {
            delete star["ir"];
            delete star["is"];
        }
        lottie.layers[0].shapes[0].it[0] = star;
    </script>
</lottie-playground>


<h2 id="stroke-dash-type">Stroke Dash Type</h2>

{schema_string:constants/stroke-dash-type/description}

{schema_enum:stroke-dash-type}


<h2 id="text-based">Text Based</h2>

{schema_string:constants/text-based/description}

{schema_enum:text-based}



<h2 id="text-grouping">Text Grouping</h2>

{schema_string:constants/text-grouping/description}

{schema_enum:text-grouping}



<h2 id="text-justify">Text Justify</h2>

{schema_string:constants/text-justify/description}

{schema_enum:text-justify}



<h2 id="text-shape">Text Shape</h2>

{schema_string:constants/text-shape/description}

{schema_enum:text-shape}

To better illustrate what the value mean, the graphics below shows an
example for each value, including the function itself, based on the
range start and end character.

![Text Shapes](/lottie-docs/static/examples/text_shape.png)


<h2 id="trim-multiple-shapes">Trim Multiple Shapes</h2>

{schema_string:constants/trim-multiple-shapes/description}

{schema_enum:trim-multiple-shapes}

<lottie-playground example="trim_path.json">
    <form>
        <enum title="Multiple Shapes">trim-multiple-shapes</enum>
    </form>
    <json>lottie.layers[0].shapes[4]</json>
    <script>
        lottie.layers[0].shapes[4].m = Number(data["Multiple Shapes"]);
    </script>
</lottie-playground>


<h2 id="text-caps">Text Caps</h2>

{schema_string:constants/text-caps/description}

{schema_enum:text-caps}


<h2 id="text-range-units">Text Range Units</h2>

{schema_string:constants/text-range-units/description}

{schema_enum:text-range-units}
