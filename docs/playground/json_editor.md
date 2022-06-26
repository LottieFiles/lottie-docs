disable_toc: 1

<script src="../../scripts/editor.bundle.js"></script>
<script src="../../scripts/lottie_explain.js"></script>

<div class="alpha_checkered" id="lottie_target" style="max-width:100%; width: 512px;"></div>

<p id="json_error" style="white-space: pre-wrap"></p>

<button onclick="pretty()" class="btn btn-secondary">Prettify JSON</button>

<div class="code-frame" style="height: 80vh;" id="editor_parent" >

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

</div>

<script>
    function set_editor_json(data)
    {
        lottie_string_input(JSON.stringify(data, undefined, 4));
    }

    function update_player_from_editor()
    {
        var error = "";
        var load_ok = true;
        var lottie;
        var json_data = editor.state.doc.toString();

        try {
            lottie = JSON.parse(json_data);
        } catch ( json_error ) {
            var message = json_error.message.replace("JSON.parse: ", "");
            try {
                lottie = Function("return " + json_data)();
                error = "Warning: Invalid JSON, using permissive mode\n" + message;
            } catch(e) {
                error = "Error: Could not load JSON\n" + message;
                load_ok = false;
            }
        }

        document.getElementById("json_error").innerText = error;

//         var datalist = document.getElementById("datalist_expression_paths");
//         datalist.innerHTML = "";
        if ( load_ok )
        {
            lottie_player.lottie = lottie;
            lottie_player.reload();
            /*if ( data["expression_path"].length )
            {
                try {
                    var expr_target = lottie;
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
            gather_expressions(lottie, "", datalist);*/
            worker.postMessage({type: "update", lottie: lottie});
        }
    }

    function pretty()
    {
        set_editor_json(lottie_player.lottie);
    }

    function lottie_string_input(data)
    {
        editor.dispatch({
            changes: {from: 0, to: editor.state.doc.length, insert: data}
        });
    }

    function lottie_url_input(url)
    {
        fetch(url)
        .then(r => r.text())
        .then(lottie_string_input)
        .catch(console.warn);
    }

    function json_path_from_node(node, path)
    {
        while ( node.name != "JsonText" )
        {
            if ( node.name == "PropertyName" )
            {
                var prop = editor.state.sliceDoc(node.from + 1, node.to - 1);
                path.unshift(prop);
                node.parent();
                node.parent();
            }
            else if ( node.name == "Property" )
            {
                node.firstChild();
            }
            else
            {
                if ( node.node.parent.name == "Array" )
                {
                    var index = -1;
                    while ( node.prevSibling() )
                        index++;

                    path.unshift(Math.max(0, index));
                }
                node.parent();
            }
        }
    }

    function json_path_from_pos(pos)
    {
        var tree = CodeMirrorWrapper.ensureSyntaxTree(editor.state);
        var cur = tree.cursorAt(pos);
        var path = [];
        var starting_token = cur.node;
        json_path_from_node(cur, path);
        return [path, starting_token];
    }

    let editor_parent = document.getElementById("editor_parent");

    let editor = new CodeMirrorWrapper.EditorView({
        state: CodeMirrorWrapper.EditorState.create({
            extensions: [
                ...CodeMirrorWrapper.default_extensions,
                CodeMirrorWrapper.json(),
                CodeMirrorWrapper.on_change(update_player_from_editor)
            ]
        }),
        parent: editor_parent
    });

    editor_parent.addEventListener("contextmenu", function (ev){
        ev.preventDefault();
        if ( !validation_result )
            return;
        let pos = editor.posAtCoords({x: ev.clientX, y: ev.clientY});
        let [path, token] = json_path_from_pos(pos);
        let match = descend_validation_path(validation_result, path);

        while ( match.length && !match[0].description && !match[0].title )
            match.shift();

        if ( !match.length )
            return;

        let box = new InfoBoxContents(null, schema);
        let bbox = editor_parent.getBoundingClientRect();
        let x = ev.clientX - bbox.left + editor_parent.scrollLeft;
        let y = ev.clientY - bbox.top - 10 + editor_parent.scrollTop;
        info_box.show_with_contents(null, box.element, box, x, y);

        if ( token.name == "PropertyName" && match[0].key && match.length > 1 )
        {
            box.property(match[1], match[0]);
        }
        else if ( match[0].const )
        {
            var value_token = token.node.cursor();
            if ( value_token.name == "Property" )
                value_token.lastChild();
            box.enum_value(match[0], editor.state.sliceDoc(value_token.from, value_token.to));
        }
        else
        {
            get_validation_links(match[0], schema); // updates title
            box.result_info_box(match[0], descend_lottie_path(lottie_player.lottie, path), lottie_player.lottie, false);
        }
    });

    let validation_result = null;
    let schema = null;
    let info_box = new InfoBox(document.getElementById("info_box"));

    const worker = new Worker("../../scripts/explain_worker.js");
    worker.onmessage = function(ev)
    {
        switch ( ev.data.type )
        {
            case "error":
                console.error(ev.data.message);
                break;
            case "status":
                console.log(ev.data.status);
                break;
            case "schema_loaded":
                schema = Object.assign(new SchemaData(), ev.data.schema);
                schema.root = null; // not needed
                if ( lottie_player.lottie )
                    worker.postMessage({type: "update", lottie: lottie_player.lottie});
                break;
            case "result":
                validation_result = ev.data.result;
                break;
            default:
                console.log(ev.data);
                break;
        }
    };

    var lottie_player = new LottiePlayer("lottie_target", undefined);

    var data = playground_get_data();
    if ( data )
    {
        if ( data[0] == "{" )
            lottie_string_input(data);
        else
            lottie_url_input(data);
    }
    else
    {
        set_editor_json(/*{
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
        }*/
        {
"v": "5.5.7",
"ip": 0,
"op": 180,
"nm": "Animation",
"mn": "{8f1618e3-6f83-4531-8f65-07dd4b68ee2e}",
"fr": 60,
"w": 512,
"h": 512,
"assets": [
],
"layers": [
    {
        "ddd": 0,
        "ty": 4,
        "ind": 0,
        "st": 0,
        "ip": 0,
        "op": 180,
        "nm": "Layer",
        "mn": "{85f37d8b-1792-4a4f-82d2-1b3b6d829c07}",
        "ks": {
            "a": {
                "a": 0,
                "k": [
                    256,
                    256
                ]
            },
            "p": {
                "a": 0,
                "k": [
                    256,
                    256
                ]
            },
            "s": {
                "a": 0,
                "k": [
                    100,
                    100
                ]
            },
            "r": {
                "a": 0,
                "k": 0
            },
            "o": {
                "a": 0,
                "k": 100
            }
        },
        "shapes": [
            {
                "ty": "gr",
                "nm": "Group",
                "it": [
                    {
                        "ty": "rc",
                        "nm": "Rectangle",
                        "p": {
                            "a": 0,
                            "k": [
                                256,
                                256
                            ]
                        },
                        "s": {
                            "a": 0,
                            "k": [
                                256,
                                256
                            ]
                        },
                        "r": {
                            "a": 0,
                            "k": 0
                        }
                    },
                    {
                        "ty": "st",
                        "nm": "Stroke",
                        "mn": "{0930ce27-c8f9-4371-b0cf-111a859abfaf}",
                        "o": {
                            "a": 0,
                            "k": 100
                        },
                        "c": {
                            "a": 0,
                            "k": [
                                1,
                                0.9803921568627451,
                                0.2823529411764706
                            ]
                        },
                        "lc": 2,
                        "lj": 2,
                        "ml": 0,
                        "w": {
                            "a": 0,
                            "k": 30
                        }
                    },
                    {
                        "ty": "tr",
                        "a": {
                            "a": 0,
                            "k": [
                                249.3134328358209,
                                254.47164179104476
                            ]
                        },
                        "p": {
                            "a": 0,
                            "k": [
                                249.3134328358209,
                                254.47164179104476
                            ]
                        },
                        "s": {
                            "a": 0,
                            "k": [
                                100,
                                100
                            ]
                        },
                        "r": {
                            "a": 0,
                            "k": 0
                        },
                        "o": {
                            "a": 0,
                            "k": 100
                        }
                    }
                ]
            }
        ]
    }
],
"meta": {
    "g": "Glaxnimate 0.4.6-26-g7b05e75c"
}
}


        );
    }
</script>


<!--


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

        worker.postMessage({type: "update", lottie: this.lottie});
    }
);
</script>
-->
