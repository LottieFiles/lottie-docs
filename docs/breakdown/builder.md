disable_toc: 1

<script src="https://unpkg.com/blockly/blockly.min.js"></script>
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
    font-family: Hack,Menlo,Monaco,Consolas,"Courier New",monospace;
    white-space: pre;
    font-size: small;
    color: #333;
    font-size: 14px;
    background-color: #fcfdff;
    border: none;
}
#playground_output_buttons
{
    padding: 0;
    list-style: none;
    display: flex;
}
</style>

<div id="playground_layout">
    <div id="blockly_div"></div>
    <div id="playground_output">
        <ul id="playground_output_buttons">
            <li><button onclick="save()">Save</button></li>
            <li><button onclick="load()">Load</button></li>
            <li><button onclick="clear_workspace()">Clear</button></li>
            <li><button onclick="copy_json()">Copy JSON</button></li>
            <li><button onclick="load_url_prompt()">Load from URL</button></li>
        </ul>
        <div class="alpha_checkered" id="lottie_player"></div>
        <textarea id="blockly_output" onchange="parse_json()"></textarea>
    </div>
</div>

<script>

function save()
{
    var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
    localStorage.setItem("blockly_lottie", Blockly.Xml.domToText(xml));
}

function load()
{
    Blockly.mainWorkspace.clear();
    var xml = Blockly.Xml.textToDom(localStorage.getItem("blockly_lottie"));
    Blockly.Xml.domToWorkspace(xml, Blockly.mainWorkspace);
    update_code();
}

function clear_workspace()
{
    Blockly.mainWorkspace.clear();
    update_code();
}

function update_code()
{
    var top_block = workspace.getTopBlocks()[0];
    var json = {};
    if ( top_block !== undefined )
        json = generator.block_to_json(top_block);

    document.getElementById("blockly_output").value = JSON.stringify(json, null, 4);

    var anim_data = {
        container: document.getElementById('lottie_player'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: json
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
    var text = element.innerText;
    navigator.clipboard.writeText(text);
}

function parse_json()
{
    var parser = new BlocklyJsonParser();
    var json = JSON.parse(document.getElementById("blockly_output").value);
    parser.parse(json, workspace);
}

function load_url_prompt()
{
    var url = prompt("URL to a lottie JSON");
    if ( url )
        load_url(url)
}

function load_url(url)
{
    try {
        new URL(url);
    } catch (e) {
        alert("Invalid URL");
        return;
    }

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4)
        {
            if ( this.status == 200 || xhttp.status == 304 )
            {
                var parser = new BlocklyJsonParser();
                var json
                try {
                    json = JSON.parse(xmlhttp.responseText);
                } catch (e) {
                    alert("Invalid JSON");
                    return;
                }
                parser.parse(json, workspace);
            }
            else
            {
                alert("Could not fetch the JSON");
            }
        }
    };

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

var options = {
  comments: true,
  toolbox: lottie_toolbox,
  media: 'https://unpkg.com/blockly/media/',
  collapse: true,
};

var workspace = Blockly.inject("blockly_div", options);
var generator = new BlockyJsonGenerator();
var anim = null;

workspace.addChangeListener(update_code);

var current_url = new URL(window.location.href);
var requested_url = current_url.searchParams.get("url");
if ( requested_url )
    load_url(requested_url);
else
    load();

</script>
