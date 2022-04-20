disable_toc: 1

<div class="alpha_checkered" id="lottie_target" style="width:100%;"></div>

<p id="json_error" style="white-space: pre-wrap"></p>

<details>
    <summary>Expression Editor</summary>
    <div class="form-group">
        <label for="expression_path">Expression JSON Path</label>
        <input
            type="text"
            data-lottie-input="editor"
            name="expression_path"
            id="expression_path"
            list="datalist_expression_paths"
            class="form-control"
            oninput="select_expression(this.value)"
            autocomplete="off"
        />
        <datalist id="datalist_expression_paths"></datalist>
    </div>
    <div class="highlighted-input" style="height: 15em;">
        <textarea
            autocomplete="off"
            class="code-input"
            data-lang="js"
            data-lottie-input="editor"
            name="expression"
            oninput="syntax_edit_update(this, this.value); syntax_edit_scroll(this); "
            onkeydown="syntax_edit_tab(this, event);"
            onscroll="syntax_edit_scroll(this);"
            spellcheck="false"
            id="editor_expression_input"
        ></textarea>
        <pre aria-hidden="true"><code class="language-js hljs"></code></pre>
    </div>
    <button onclick="lottie_player.reload();" class="btn btn-secondary">Set Expression</button>
</details>

<button onclick="pretty()" class="btn btn-secondary">Prettify JSON</button>

<div class="highlighted-input" style="height: 80vh;">
<textarea autocomplete="off" class="code-input" data-lang="js" data-lottie-input="editor"
name="json" oninput="syntax_edit_update(this, this.value); syntax_edit_scroll(this); lottie_player.reload();"
onkeydown="syntax_edit_tab(this, event);" onscroll="syntax_edit_scroll(this);"
rows="3" spellcheck="false" id="editor_input">
</textarea>
<pre aria-hidden="true"><code class="language-js hljs"></code></pre>
</div>

<script>
function gather_expressions(object, path, datalist)
{
    for ( var [k, v] of Object.entries(object) )
    {
        if ( typeof v == "object" )
            gather_expressions(v, path + k + ".", datalist);
        else if ( k == "x" && typeof v == "string" )
            datalist.appendChild(document.createElement("option")).setAttribute("value", path + "x");
    }
}

function select_expression(path)
{
    console.log(path);
    try {
        var expr_target = lottie_player.lottie;
        var expr_path = path.split(".");
        for ( var chunk of expr_path )
            expr_target = expr_target[chunk];

        if ( typeof expr_target == "string" )
        {
            var textarea = document.getElementById("editor_expression_input");
            textarea.value = expr_target;
            syntax_edit_update(textarea, expr_target);
        }
    } catch ( e ) {
        console.log(e);
    }
}


var textarea = document.getElementById("editor_input");

var lottie_player = new PlaygroundPlayer(
    "editor",
    "lottie_target",
    undefined,
    function(json, data) {
        console.log("on load...");
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
                "markers": [],
                "layers": []
            };
            textarea.value = JSON.stringify(this.lottie, undefined, 4);
            syntax_edit_update(textarea, textarea.value);
        }
        else
        {
            var error = "";
            this.load_ok = true;
            try {
                this.lottie = JSON.parse(data["json"]);
            } catch ( json_error ) {
                var message = json_error.message.replace("JSON.parse: ", "");
                try {
                    this.lottie = Function("return " + data["json"])();
                    error = "Warning: Invalid JSON, using permissive mode\n" + message;
                } catch(e) {
                    error = "Error: Could not load JSON\n" + message;
                    this.load_ok = false;
                }
            }

            var datalist = document.getElementById("datalist_expression_paths");
            datalist.innerHTML = "";
            if ( this.load_ok )
            {
                if ( data["expression_path"].length )
                {
                    try {
                        var expr_target = this.lottie;
                        var expr_path = data["expression_path"].split(".");
                        var last = expr_path.pop();
                        for ( var chunk of expr_path )
                            expr_target = expr_target[chunk];
                        expr_target[last] = data["expression"];
                    } catch ( e ) {
                        if ( error.length )
                            error += "\n\n";
                        error += "Could not set the expression";
                    }
                }
                gather_expressions(this.lottie, "", datalist);
            }

            document.getElementById("json_error").innerText = error;
        }
    }
);

function pretty()
{
    textarea.value = JSON.stringify(lottie_player.lottie, undefined, 4);
    syntax_edit_update(textarea, textarea.value);
}

</script>
