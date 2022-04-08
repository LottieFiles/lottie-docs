disable_toc: 1


<div class="alpha_checkered" id="lottie_target" style="width:512px;height:512px">
</div>

<button onclick="pretty()">Prettify JSON</button>
<div class="highlighted-input" style="height: 100vh;">
<textarea autocomplete="off" class="code-input" data-lang="js" data-lottie-input="editor"
name="json" oninput="syntax_edit_update(this, this.value); syntax_edit_scroll(this); lottie_player.reload();"
onkeydown="syntax_edit_tab(this, event);" onscroll="syntax_edit_scroll(this);"
rows="3" spellcheck="false" id="editor_input">
</textarea>
<pre aria-hidden="true"><code class="language-js hljs">
</code></pre>
</div>

<script>
var textarea = document.getElementById("editor_input");

var lottie_player = new PlaygroundPlayer(
    "editor",
    "lottie_target",
    undefined,
    function(json, data) {
        if ( this.lottie === undefined )
        {
            this.lottie = {
                "v": "5.5.2",
                "fr": 60,
                "ip": 0,
                "op": 60,
                "w": 512,
                "h": 512,
                "ddd": 0,
                "assets": [],
                "fonts": {
                    "list": []
                },
                "chars": [],
                "markers": [],
                "layers": []
            };
            textarea.value = JSON.stringify(this.lottie, undefined, 4);
            syntax_edit_update(textarea, textarea.value);
        }
        else
        {
            try {
                this.lottie = JSON.parse(data["json"]);
            } catch(e) {}
        }
    }
);

function pretty()
{
    textarea.value = JSON.stringify(lottie_player.lottie, undefined, 4);
    syntax_edit_update(textarea, textarea.value);
}

</script>
