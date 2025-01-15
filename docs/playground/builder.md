full_page: 1
disable_toc: 1

<script src="https://unpkg.com/blockly@10.3.0/blockly.min.js"></script>
<script src="../../scripts/blockly_generated.js"></script>
<script src="../../scripts/lottie_blockly.js"></script>
<style>
html, body {
    min-height: 100vh;
}
body {
    display: flex;
    flex-flow: column;
}
div[role='main'], body > .container, #playground_layout
{
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    flex-grow: 1;
    display: flex;
    flex-flow: column;
}

#playground_layout
{
    display: flex;
    flex-flow: row;
    align-items: stretch;
    padding: 24px
}
#blockly_div
{
    flex-grow: 1;
}
#playground_output_container
{
    width: 512px;
}
#lottie_player
{
    width: 512px;
    height: 512px
}
#playground_output
{
    margin: 0;
    width: 512px;
    display: flex;
    flex-flow: column;
}
#blockly_output
{
    margin: 0;
    overflow: auto;
    flex-grow: 1;
    border: none;
}
#playground_output_buttons
{
    padding: 0;
    list-style: none;
    display: flex;
    margin-bottom: 0px;
}
#playground_output_buttons > li > button
{
   border: 1px solid #D9E0E6;
   padding: 8px;
}
</style>

<div id="playground_layout">
    <div id="blockly_div"></div>
    <div id="playground_output">
        <ul id="playground_output_buttons">
            <li><button onclick="save()">Save</button></li>
            <li><button onclick="load()">Load</button></li>
            <li><button onclick="lottie_blockly.clear_workspace()">Clear</button></li>
            <li><button onclick="copy_json()">Copy JSON</button></li>
            <li><button onclick="load_url_prompt()">Load from URL</button></li>
        </ul>
        <div class="alpha_checkered" id="lottie_player"></div>
        <div class="highlighted-input" style="flex-grow: 1">
            <textarea
                autocomplete="off"
                class="code-input"
                data-lang="js"
                data-lottie-input="editor"
                 oninput="syntax_edit_update(this, this.value); syntax_edit_scroll(this); parse_json();"
                onkeydown="syntax_edit_tab(this, event);" onscroll="syntax_edit_scroll(this);"
                spellcheck="false"
                id="blockly_output"
            ></textarea>
            <pre aria-hidden="true"><code class="language-js hljs"></code></pre>
        </div>
    </div>
</div>

<script>

function save()
{
    localStorage.setItem("blockly_lottie", lottie_blockly.workspace_to_xml_string());
}

function load()
{
    lottie_blockly.xml_to_workspace(localStorage.getItem("blockly_lottie"));
}


function update_code()
{
    var json = lottie_blockly.workspace_to_json();

    var output = document.getElementById("blockly_output");
    output.value = JSON.stringify(json, null, 4);
    syntax_edit_update(output, output.value);

    var anim_data = {
        container: document.getElementById('lottie_player'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: JSON.parse(output.value)
    };

    var frame = 0;

    if ( anim != null )
    {
        try {
            frame = anim.currentFrame
        } catch (e) {}
        try {
            anim.destroy();
        } catch (e) {}
        anim = null;
    }

    anim = bodymovin.loadAnimation(anim_data);
    if ( frame != 0 )
        anim.goToAndPlay(frame, true);
}

function copy_json()
{
    var element = document.getElementById("blockly_output");
    var text = element.value;
    navigator.clipboard.writeText(text);
}

function copy_xml()
{
    navigator.clipboard.writeText(lottie_blockly.workspace_to_xml_string());
}

function parse_json()
{
    lottie_blockly.json_to_workspace(document.getElementById("blockly_output").value);
}

function load_url_prompt()
{
    var url = prompt("URL to a lottie JSON");
    if ( url )
        lottie_blockly.load_json_url(url)
}

var options = {
  comments: true,
  toolbox: lottie_toolbox,
  media: 'https://unpkg.com/blockly/media/',
  collapse: true,
};

var anim = null;

var lottie_blockly = new LottieBlockly(options, "blockly_div", alert);

lottie_blockly.workspace.addChangeListener(update_code);

var current_url = new URL(window.location.href);
var requested_url = current_url.searchParams.get("url");
if ( requested_url )
    lottie_blockly.load_json_url(requested_url);
else
    load();

</script>
