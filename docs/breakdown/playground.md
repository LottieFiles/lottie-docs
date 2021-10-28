disable_toc: 1

# Playground

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
#playground_output pre
{
    margin: 0;
    overflow: scroll;
    flex-grow: 1;
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
        </ul>
        <div class="alpha_checkered" id="lottie_player"></div>
        <pre><code id="blockly_output"></code></pre>
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

    document.getElementById("blockly_output").innerText = JSON.stringify(json, null, 4);

    var anim_data = {
        container: document.getElementById('lottie_player'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: json
    };

    if ( anim != null )
    {
        try {
            anim.destroy();
        } catch (e) {}
        anim = null;
    }

    anim = bodymovin.loadAnimation(anim_data);
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
load();



</script>

