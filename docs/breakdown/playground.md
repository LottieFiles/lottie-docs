disable_toc: 1

# Playground

<script src="https://unpkg.com/blockly/blockly.min.js"></script>
<script src="../../scripts/blockly_generated.js"></script>
<script src="../../scripts/blockly_generator.js"></script>

<div id="blockly_div" style="height: 800px; width: 100%;"></div>

<p>
    <button onclick="update_code()">Update</button>
    <button onclick="save()">Save</button>
    <button onclick="load()">Load</button>
    <button onclick="clear()">Clear</button>
</p>

<div style="display: flex">
    <div class="alpha_checkered" id="lottie_player"  style="width: 50%; height: 512px"></div>
    <pre style="margin: 0; width: 50%;"><code id="blockly_output"></code></pre>
</div>

</div>

<script>
var options = {
  comments: true,
  toolbox: lottie_toolbox,
  media: 'https://unpkg.com/blockly/media/',
};

var workspace = Blockly.inject("blockly_div", options);
var generator = new BlockyJsonGenerator();
var anim = null;

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

function clear()
{
    Blockly.mainWorkspace.clear();
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
        anim.destroy();
        anim = null;
    }

    anim = bodymovin.loadAnimation(anim_data);
}

load();

</script>

