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

.tab-content {
    margin: 1em 0;
}

.drop-area {
    border: 1px solid #ccc;
    color: #ccc;
    min-height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: column;
}

</style>
<script src="../../scripts/lottie_explain.js"></script>
<ul class="nav nav-pills">
    <li class="active"><a href="#tab_about">About this page</a></li>
    <li><a href="#tab_file">Upload File</a></li>
    <li><a href="#tab_url">From URL</a></li>
    <li><a href="#tab_textarea">Direct Input</a></li>
</ul>
<div class="tab-content">
    <div id="tab_about" class="tab-pane fade in active">
        <p>This page allows you to load a lottie animation and, once you do,
        it shows an interactive explanation of the animation you loaded.</p>
        <p>It will render the file as a Formatted JSON,
        where you can click on objects and properties to open up a dialog with
        A brief explanation of what that object is.</p>
        <p>On that dialog you can also find links to a more in-depth explanation
        and a preview of the object you clicked on.</p>
        <p>If an object contains something that looks invalid, it will be highlighted accordingly.</p>
    </div>
    <div id="tab_file" class="tab-pane fade in">
        <div class="drop-area" ondrop="lottie_drop_input(event);" ondragover="event.preventDefault();">
            <p>Drop JSON file here</p>
            <input type="file" onchange="lottie_file_input(event);" class="form-control-file" />
        </div>
    </div>
    <div id="tab_url" class="tab-pane fade in">
        <p><input type="text" id="input_from_url" class="form-control" /></p>
        <p><button onclick="lottie_url_input(document.getElementById('input_from_url').value)" class="btn btn-primary">Explain</button>
    </div>
    <div id="tab_textarea" class="tab-pane fade in">
        <div class="highlighted-input" style="height: 512px;">
            <textarea
                autocomplete="off" class="code-input"
                data-lang="js" data-lottie-input="editor"
                name="json" oninput="syntax_edit_update(this, this.value); syntax_edit_scroll(this); "
                onkeydown="syntax_edit_tab(this, event);"
                onscroll="syntax_edit_scroll(this);"
                rows="3" spellcheck="false" id="editor_input"></textarea>
            <pre aria-hidden="true"><code class="language-js hljs"></code></pre>
        </div>
        <button onclick="lottie_string_input(document.getElementById('editor_input').value)" class="btn btn-primary">Explain</button>
    </div>
</div>
<pre><code id="explainer">Load a Lottie to view its contents</code></pre>
<div id="info_box">
    <div class="info_box_details"></div>
    <div class="info_box_lottie alpha_checkered"></div>
    <div class="btn-group btn-group-toggle info_box_buttons" style="display: none" data-toggle="buttons">
        <label class="btn btn-primary btn-sm" id="btn_center_lottie" title="Show items centered in the preview">
            <input type="radio" name="options" autocomplete="off"> Fit in View
        </label>
        <label class="btn btn-primary btn-sm" id="btn_reset_view" title="Show items as they appear on the file">
            <input type="radio" name="options" autocomplete="off"> Normal View
        </label>
    </div>
</div>
<div>
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

function lottie_drop_input(ev)
{
    ev.preventDefault();

    if (ev.dataTransfer.items)
        lottie_receive_files(
            Array.from(ev.dataTransfer.items)
            .filter(i => i.kind === 'file')
            .map(i => i.getAsFile())
        );
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

document.body.addEventListener("click", e => {
    if ( !info_box.element.contains(e.target) )
        info_box.hide()
});

document.querySelectorAll(".nav-pills a").forEach( link =>
    link.addEventListener("click", e => jQuery(e.target).tab("show"))
);

</script>
