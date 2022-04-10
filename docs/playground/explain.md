disable_toc: 1

Explain my Lottie
=================

<style>
.info_box_trigger {
    display: inline-block;
    border-bottom: 1px dotted black;
    cursor: pointer;
}

.info_box_content, .info_box_lottie {
    display: none;
}

#info_box {
    display: none;
    width: 512px;
    border: 5px solid #555;
    border-radius: 6px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    margin-left: 30px;
/*     opacity: 0; */
/*     transition: opacity 0.3s; */
    background: white;
    color: black;
    font-style: normal;
    word-break: normal;
}


#info_box::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    margin-top: 5px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent #555 transparent transparent;
    margin-left: -15px;
    height: 5px;
}

#info_box .info_box_content{
    display: block;
}

.info_box_lottie {
    max-width: 300px;
    max-height: 300px;
    margin-top: 1.2em;
}

.info_box_content .description {
    white-space: pre-wrap;
}

.collapse-button {
    cursor: pointer;
    margin: 0 1ch;
}
.collapser {
    display: inline;
}
.collapser.collapsed {
    display: none;
}

summary {
    display: list-item;
}
</style>
<script src="../../scripts/lottie_explain.js"></script>
<details>
    <summary>About this page</summary>
    <p>This page allows you to load a lottie animation and, once you do,
    it shows an interactive explanation of the animation you loaded.</p>
    <p>It will render the file as a Formatted JSON,
    where you can click on objects and properties to open up a dialog with
    A brief explanation of what that object is.</p>
    <p>On that dialog you can also find links to a more in-depth explanation
    and a preview of the object you clicked on.</p>
    <p>If an object contains something that looks invalid, it will be highlighted accordingly.</p>
</details>

<details>
    <summary>Upload file</summary>
    <p><input type="file" onchange="lottie_file_input(event);" /></p>
</details>
<details>
    <summary>From URL</summary>
    <p><input type="text" id="input_from_url" /></p>
    <p><button onclick="lottie_url_input(document.getElementById('input_from_url').value)">Explain</button>
</details>
<details>
    <summary>From Input</summary>
    <div class="highlighted-input" style="height: 512px;">
    <textarea autocomplete="off" class="code-input" data-lang="js" data-lottie-input="editor"
    name="json" oninput="syntax_edit_update(this, this.value); syntax_edit_scroll(this); "
    onkeydown="syntax_edit_tab(this, event);" onscroll="syntax_edit_scroll(this);"
    rows="3" spellcheck="false" id="editor_input"></textarea>
    <pre aria-hidden="true"><code class="language-js hljs">
    </code></pre>
    </div>
    <p><button onclick="lottie_string_input(document.getElementById('editor_input').value)">Explain</button>
</details>
<pre><code id="explainer">Load a Lottie to view its contents</code></pre>
<div id="info_box"><div class="info_box_details"></div><div class="info_box_lottie alpha_checkered"></div><div>
<script>
function input_error(e)
{
    clear_element(parent);
    parent.appendChild(document.createTextNode("Could not load input!"));
    console.error(e);
}

function lottie_file_input(ev)
{
    lottie_receive_files(ev.target.files);
}

function lottie_receive_files(files)
{
    for ( var i = 0; i < files.length; i++ )
    {
        var file = files[i];
        if ( file.type.match("application/json") )
        {
            var reader = new FileReader();

            reader.onload = function(e2)
            {
                lottie_string_input(e2.target.result);
            };

            reader.readAsText(file);
            return;
        }
    }
}

function lottie_url_input(url)
{
    clear_element(parent);
    parent.appendChild(document.createTextNode("Loading..."));

    fetch(url).then(
        r => r.json().then(lottie_set_json).catch(input_error)
    ).catch(input_error);
}

function lottie_string_input(string)
{
    try {
        lottie_set_json(JSON.parse(string));
    } catch ( e ) {
        input_error(e);
    }
}

function clear_element(parent)
{
    while ( parent.firstChild )
        parent.removeChild(parent.firstChild);
}

function lottie_set_json(json)
{
    clear_element(parent);
    parent.appendChild(document.createTextNode("Loading..."));

    setTimeout(function(){
        clear_element(parent);
        var formatter = new JsonFormatter(parent);
        formatter.lottie = json;
        var object = new SchemaObject(json);
        schema.root.validate(object, true, true);
        object.explain(formatter);
        formatter.finalize();
    });
}

function critical_error(err)
{
    alert("Could not load data");
    console.error(err);
}

var parent = document.getElementById("explainer");
var schema = null;
var info_box = new InfoBox(document.getElementById("info_box"));
var icons = {
    "#/$defs/animated-properties/color-value": "fas fa-palette",
    "#/$defs/animated-properties/gradient-colors": "fas fa-swatchbook",
    //"#/$defs/animated-properties/keyframe-bezier-handle": "fas fa-bezier-curve",
    "#/$defs/animated-properties/keyframe": "fas fa-key",
    "#/$defs/animated-properties/multi-dimensional": "fas fa-running",
    "#/$defs/animated-properties/position-keyframe": "fas fa-key",
    "#/$defs/animated-properties/position": "fas fa-map-marker-alt",
    "#/$defs/animated-properties/shape-keyframe": "fas fa-key",
    "#/$defs/animated-properties/shape-property": "fas fa-bezier-curve",
    "#/$defs/animated-properties/split-vector": "fas fa-map-marker-alt",
    "#/$defs/animated-properties/position-value": "fas fa-running",
    "#/$defs/animated-properties/value": "fas fa-running",

    "#/$defs/animation/animation": "fas fa-video",
    "#/$defs/animation/metadata": "fas fa-info-circle",
    "#/$defs/animation/motion-blur": "fas fa-wind",

    "#/$defs/assets/image": "fas fa-file-image",
    "#/$defs/assets/sound": "fas fa-file-audio",
    "#/$defs/assets/precomposition": "fas fa-file-video",

    "#/$defs/helpers/bezier": "fas fa-bezier-curve",
    "#/$defs/helpers/color": "fas fa-palette",
    "#/$defs/helpers/mask": "fas fa-theater-mask",
    "#/$defs/helpers/transform": "fas fa-arrows-alt",

    "#/$defs/layers/shape-layer": "fas fa-shapes",
    "#/$defs/layers/image-layer": "fas fa-image",
    "#/$defs/layers/precomposition-layer": "fas fa-video",
    "#/$defs/layers/solid-color-layer": "fas fa-square-full",
    "#/$defs/layers/text-layer": "fas fa-font",
    "#/$defs/layers/null-layer": "fas fa-sitemap",

    "#/$defs/shapes/ellipse": "fas fa-circle",
    "#/$defs/shapes/fill": "fas fa-fill-drip",
    "#/$defs/shapes/gradient-fill": "fas fa-fill-drip",
    "#/$defs/shapes/gradient-stroke": "fas fa-paint-brush",
    "#/$defs/shapes/group": "fas fa-object-group",
    "#/$defs/shapes/path": "fas fa-bezier-curve",
    "#/$defs/shapes/polystar": "fas fa-star",
    "#/$defs/shapes/rectangle": "fas fa-rectangle",
    "#/$defs/shapes/stroke": "fas fa-paint-brush",
    "#/$defs/shapes/transform": "fas fa-arrows-alt",
    "#/$defs/shapes/shape-list": "fas fa-list",

    "#/$defs/text/character-data": "fas fa-font",
    "#/$defs/text/font-list": "fas fa-list",
    "#/$defs/text/font": "fas fa-font",
    "#/$defs/text/text-animator-data": "fas fa-font",
    "#/$defs/text/text-data": "fas fa-running",
    "#/$defs/text/text-document": "far fa-file-alt",
    "#/$defs/text/text-data-keyframe": "fas fa-key",
}

var requests = [fetch("/lottie-docs/schema/lottie.schema.json"), fetch("/lottie-docs/schema/docs_mapping.json")]
Promise.all(requests)
.then(responses => {
    Promise.all(responses.map(r => r.json()))
    .then(jsons => { schema = new SchemaData(jsons[0], jsons[1]); })
    .catch(critical_error);
})
.catch(critical_error);

document.body.addEventListener("click", e => info_box.hide());


function quick_test()
{
    if ( !schema )
    {
        setTimeout(quick_test, 0.1);
        return;
    }

    var lottie_json = {
        "fr": 60,
        "ip": 0,
        "op": 60,
        "w": 512,
        "h": 512,
        "ddd": 0,
        "meta": {"g":"Test","a":"","k":"","d":123,"tc":"#FFFFFF"},
        "assets": [],
        "markers": [],
        "layers": [
            {
                "ddd": 0,
                "hd": false,
                "ip": 0,
                "op": 60,
                "st": 0,
                "ks": {},
                "ao": 0,
                "hasMask": false,
                "masksProperties": [],
                "ef": [],
                "mb": false,
                "ty": 4,
                "shapes": [
                    /*{
                        "ty": "sh",
                        "ks": {
                            "a": 0,
                            "k": {
                                "v": [
                                    [100, 10],
                                    [190, 100],
                                    [100, 190],
                                    [0, 100],
                                ],
                                "i": [
                                    [0, 0],
                                    [0, 0],
                                    [0, 0],
                                    [0, 0],
                                ],
                                "o": [
                                    [0, 0],
                                    [0, 0],
                                    [0, 0],
                                    [0, 0],
                                ],
                                "c": true
                            }
                        }
                    },*/
                    {
                        "hd": false,
                        "ty": "el",
                        "p": {
                            "a": 0,
                            "k": [
                                256,
                                256
                            ]
                        },
                        /*"p": {
                            "a": 1,
                            "k": [
                                {
                                    "t": 0,
                                    "s": [100, 256],
                                    "o": {x: 0.3, y: 0},
                                    "i": {x: 0.7, y: 1},
                                },
                                {
                                    "t": 30,
                                    "s": [300, 256],
                                    "o": {x: [0.3], y: [0]},
                                    "i": {x: [0.7], y: [1]},
                                },
                                {
                                    "t": 60,
                                    "s": [100, 256],
                                    "o": {x: [0.3], y: [0]},
                                    "i": {x: [0.7], y: [1]},
                                }
                            ]
                        },*/
                        "s": {
                            "a": 0,
                            "k": [
                                200,
                                200
                            ]
                        }
                    },
                    {
                        "hd": false,
                        "o": {
                            "a": 0,
                            "k": 100
                        },
                        "ty": "fl",
                        "c": {
                            "a": 0,
                            "k": [
                                1,
                                0,
                                0
                            ]
                        },
                        "bm": 1
                        /*
                        "ty": "gf",
                        "g": {
                            "p": 2,
                            "k": {
                                "a": 0,
                                "k": [
                                    0,
                                    1,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                ]
                            }
                        },
                        "s": {"a":0, "k":[300, 0]},
                        "e": {"a":0, "k":[400, 0]},
                        "t": 1,
                        */
                    }
                ]
            }
        ]
    };

    /*lottie_json = {
        "v": "5.5.2",
        "fr": 60,
        "ip": 0,
        "op": 60,
        "w": 512,
        "h": 512,
        "assets": [],
        "fonts": {
            "list": [
                {
                    "ascent": 72,
                    "fFamily": "sans",
                    "fName": "sans-Regular",
                    "fStyle": "Regular",
                    "fPath": "sans"
                }
            ]
        },
        "layers": [
            {
                "ip": 0,
                "op": 60,
                "st": 0,
                "ks": {
                    "p": {"a": 0, "k": [200, 200]}
                },
                "ty": 5,
                "t": {
                    "a": [],
                    "d": {
                        "k": [
                            {
                                "s": {
                                    "f": "sans-Regular",
                                    "fc": [1, 0, 0],
                                    "s": 50,
                                    "t": "Hello",
                                    "j": 0
                                },
                                "t": 0
                            }
                        ]
                    },
                    "m": {
                        "a": {"a": 0, "k": [0,0]},
                        "g": 3
                    },
                    "p": {}
                }
            }
        ]
    };*/
    lottie_set_json(lottie_json);
}

quick_test();

</script>
