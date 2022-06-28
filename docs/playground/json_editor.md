disable_toc: 1

<script src="../../scripts/editor.bundle.js"></script>
<script src="../../scripts/lottie_explain.js"></script>
<style>
.schema-type {
    color: #998;
    font-style: italic;
}

.schema-type i {
    margin-right: 5px;
    font-style: normal;
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
<div class="alert alert-danger" role="alert" style="display: none" id="error_alert"></div>
<div class="alert alert-primary" role="alert" style="display: none" id="loading_alert">
    <div class="spinner-border" role="status"></div>
    Loading...
</div>

<ul class="nav nav-pills">
    <li><a data-toggle="pill" href="#tab_file">Upload File</a></li>
    <li><a data-toggle="pill" href="#tab_url">From URL</a></li>
    <li class="active"><a data-toggle="pill" href="#tab_editor" id="editor_tab">Editor</a></li>
</ul>
<div class="tab-content">
    <div id="tab_file" class="tab-pane fade in ">
        <div class="drop-area" ondrop="lottie_drop_input(event);" ondragover="event.preventDefault();">
            <p>Drop JSON file here</p>
            <input type="file" onchange="lottie_file_input(event);" class="form-control-file" />
        </div>
    </div>
    <div id="tab_url" class="tab-pane fade in">
        <p><input type="text" id="input_from_url" class="form-control" /></p>
        <p><button onclick="lottie_url_input(document.getElementById('input_from_url').value)" class="btn btn-primary">Explain</button>
    </div>
    <div id="tab_editor" class="tab-pane fade in active">
        <div class="alpha_checkered" id="lottie_target" style="max-width:100%; width: 512px;"></div>
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
    </div>
</div>

<script>
    function input_error(e, safe = false)
    {
        error_container.style.display = "block";
        loading_div.style.display = "none";
        clear_element(error_container);
        error_container.appendChild(document.createTextNode(safe ? e : "Could not load input!"));
        console.error(e);
    }

    function input_start()
    {
        error_container.style.display = "none";
        loading_div.style.display = "block";
    }

    function lottie_file_input(ev)
    {
        input_start();
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

        input_error("Not a JSON file", true);
    }

    function lottie_drop_input(ev)
    {
        ev.preventDefault();

        if (ev.dataTransfer.items)
        {
            input_start();
            lottie_receive_files(
                Array.from(ev.dataTransfer.items)
                .filter(i => i.kind === 'file')
                .map(i => i.getAsFile())
            );
        }
    }

    function lottie_url_input(url)
    {
        input_start();
        fetch(url)
        .then(r => r.json())
        .then(set_editor_json)
        .catch(input_error);
    }

    function set_editor_json(data)
    {
        lottie_string_input(JSON.stringify(data, undefined, 4));
    }

    function update_player_from_editor()
    {
        var load_ok = true;
        var lottie;
        var json_data = editor.state.doc.toString();

        tree_state.begin_load(editor);

        try {
            lottie = JSON.parse(json_data);
        } catch ( json_error ) {
            // Fall back to actual JS notation, which is more forgiving
            try {
                lottie = Function("return " + json_data)();
            } catch(e) {
                load_ok = false;
                tree_state.load_error(editor);
            }
        }

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

        error_container.style.display = "none";
        loading_div.style.display = "none";
        document.getElementById("editor_tab").click();
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

    function on_worker_message(ev)
    {
        switch ( ev.data.type )
        {
            case "error":
                console.error(ev.data.message);
                break;
            case "schema_loaded":
                tree_state.schema = Object.assign(new SchemaData(), ev.data.schema);
                tree_state.schema.root = null; // not needed
                if ( lottie_player.lottie )
                    worker.postMessage({type: "update", lottie: lottie_player.lottie});
                break;
            case "result":
                tree_state.end_load(editor, ev.data.result);
                break;
            default:
                console.log(ev.data);
                break;
        }
    }

    class TreeResultVisitor
    {
        constructor(schema)
        {
            this.lint_errors = [];
            this.decorations = [];
            this.schema = schema;
        }

        visit(node, result, json, path = [])
        {
            if ( !node || !result )
                return false;

            if ( node.name == "JsonText" )
            {
                this.visit(node.firstChild, result, json, path);
                return false;
            }

            if ( node.name == "Object" )
            {
                this.on_object(node, result, json, path);

                for ( let prop_node of node.getChildren("Property") )
                {
                    let name_node = prop_node.getChild("PropertyName");
                    if ( !name_node )
                        continue;

                    let name = editor.state.sliceDoc(name_node.from + 1, name_node.to - 1);
                    if ( name in result.children )
                    {
                        let prop_result = result.children[name];
                        this.on_property(name_node, prop_node, prop_result, result, path);
                        this.visit(prop_node.lastChild, prop_result, json[name], path.concat([name]));
                    }
                    else
                    {
                        this.on_unknown_property(name, name_node, prop_node, path.concat([name]));
                    }
                }

                return true;
            }
            else if ( node.name == "Array" && node.firstChild )
            {
                this.on_array(node, result, json, path);
                var index = 0;
                var cur = node.firstChild.cursor();
                // first child is [
                while ( cur.nextSibling() )
                {
                    if ( !(index in result.children) )
                        break;

                    if ( this.visit(cur.node, result.children[index], json[index], path.concat([index])) )
                        index += 1;
                }
                return true;
            }
            else if (
                node.name == "True" || node.name == "False" ||
                node.name == "Null" || node.name == "Number" ||
                node.name == "String"
            )
            {
                this.on_value(node, result, json, path);
                return true;
            }

            return false;
        }

        lint_error(node, severity, message)
        {
            let error = {
                from: node.from,
                to: node.to,
                severity: severity,
                message: message,
            };
            if ( message.indexOf("<") != -1 )
            {
                error.renderMessage = function() {
                    let span = document.createElement("span");
                    span.innerHTML = message;
                    return span;
                };
            }
            this.lint_errors.push(error);
        }

        add_lint_errors(node, result, path)
        {
            if ( !node || !result )
                return;

            for ( let issue of new Set(result.issues) )
                this.lint_error(node, "error", issue);

            for ( let issue of new Set(result.warnings) )
                this.lint_error(node, "warning", issue);
        }

        on_object(node, result, json, path)
        {
            this.add_lint_errors(node.firstChild, result);
            this.add_lint_errors(node.lastChild, result);

            if ( result.description )
            {
                let deco = CodeMirrorWrapper.Decoration.widget({
                    widget: new SchemaTypeWidget(path, result, this.schema),
                    side: 1
                });
                this.decorations.push(deco.range(node.firstChild.to));
            }
        }

        on_property(name_node, prop_node, prop_result, obj_result, path)
        {
            this.add_lint_errors(name_node, prop_result.key);

            if ( prop_result.key )
            {
                let schema = this.schema;
                let deco = CodeMirrorWrapper.Decoration.mark({
                    class: "info_box_trigger",
                    info_box: (view) => TreeResultVisitor.property_info_box(view, schema, name_node, obj_result, prop_result),
                });
                this.decorations.push(deco.range(name_node.from, name_node.to));
            }
        }

        on_unknown_property(name, name_node, prop_node, path)
        {
            this.lint_error(name_node, "warning", `Unknown Property <code>${name}</code>`);
        }

        on_value(node, result, json, path)
        {
            this.add_lint_errors(node, result);
            if ( result.const )
            {
                let schema = this.schema;
                let deco = CodeMirrorWrapper.Decoration.mark({
                    class: "info_box_trigger",
                    info_box: (view) => TreeResultVisitor.enum_info_box(view, schema, node, result),
                });
                this.decorations.push(deco.range(node.from, node.to));
            }
        }

        on_array(node, result, json, path)
        {
            this.on_object(node, result, json, path);
        }

        static property_info_box(view, schema, node, obj_result, prop_result)
        {
            let box = new InfoBoxContents(null, schema);
            box.property(obj_result, prop_result);
            TreeResultVisitor.show_info_box(view, box, node);
        }

        static enum_info_box(view, schema, node, result)
        {
            let box = new InfoBoxContents(null, schema);
            box.enum_value(result, view.state.sliceDoc(node.from, node.to));
            TreeResultVisitor.show_info_box(view, box, node);
        }

        static show_info_box(view, box, node)
        {
            let coords = view.coordsAtPos(node.to);
            let bbox = view.dom.getBoundingClientRect();
            let x = coords.left - bbox.left;
            let y = coords.top - bbox.top;
            info_box.show_with_contents(null, box.element, box, x, y);
        }
    }

    class TreeState
    {
        constructor()
        {
            this.schema = null;
            this.lint_errors = [];
            this.decorations = [];
            this.validation_result = null;
            this.clear_info_effect = CodeMirrorWrapper.StateEffect.define();
            this.load_info_effect = CodeMirrorWrapper.StateEffect.define();
        }

        begin_load(view)
        {
            this.lint_errors = [];
            this.decorations = [];
            view.dispatch({effects: [this.clear_info_effect.of()]});
        }

        end_load(view, result)
        {
            this.validation_result = result;

            let tree = CodeMirrorWrapper.ensureSyntaxTree(view.state, undefined, 1000);
            if ( tree )
            {
                let visitor = new TreeResultVisitor(this.schema);
                visitor.visit(tree.topNode, result, lottie_player.lottie);
                this.lint_errors = visitor.lint_errors;
                this.decorations = visitor.decorations;

                this.get_syntax_errors(tree);
            }

            view.dispatch({effects: [this.load_info_effect.of({result: result})]});
        }

        load_error(view)
        {
            this.end_load(view, this.validation_result);
        }

        get_syntax_errors(tree)
        {
            tree.topNode.cursor().iterate(this.add_syntax_error.bind(this));
        }

        add_syntax_error(node)
        {
            if ( node.type.isError )
                this.lint_errors.push({
                    from: node.from == node.to && node.from > 0 ? node.from -1 : node.from,
                    to: node.to,
                    severity: "error",
                    message: "Invalid JSON"
                });
            return true;
        }

        linter()
        {
            return CodeMirrorWrapper.linter((() => this.lint_errors).bind(this));
        }
    }

    function inspect_tree(node)
    {
        let children = [];
        let name = node.name;

        if ( node.firstChild() )
        {
            while ( true )
            {
                children.push(inspect_tree(node));
                if ( !node.nextSibling() )
                    break;
            }
            node.parent()
        }

        return { [name]: children };
    }

    function autocomplete_cmp(a, b)
    {
        if ( a.boost != b.boost )
        {
            if ( a.boost < b.boost )
                return 1;

            if ( a.boost > b.boost )
                return -1;
        }

        if ( a.label < b.label )
            return -1;

        if ( a.label > b.label )
            return 1;

        return 0;
    }

    function autocomplete(context)
    {
        if ( !tree_state.validation_result )
            return null;

        let tree = CodeMirrorWrapper.ensureSyntaxTree(context.state);
        let cur = tree.cursorAt(context.pos);
        let from = context.pos;
        let to = context.pos;
        let in_prop = false;
        let prop_prefix = "";

        if ( cur.name == "Property" )
        {
            cur.firstChild();
            if ( cur.nextSibling() )
            {
                if ( !cur.type.isError )
                    return null;
                cur.prevSibling();
            }
        }

        if ( cur.name == "PropertyName" )
        {
            from = cur.from;
            to = cur.to;
            cur.parent()
            cur.parent();
            prop_prefix = context.state.sliceDoc(from + 1, to);
            if ( prop_prefix.endsWith("\"") )
                prop_prefix = prop_prefix.substr(0, prop_prefix.length - 1);

            in_prop = true;
        }
        else if ( !context.explicit )
        {
            return null;
        }

        if ( cur.name != "Object" )
            return null;

        let before = context.state.sliceDoc(0, context.pos);
        if ( !in_prop )
        {
            let obj_token = before.search(/[{,][^:{},]*$/);
            if ( obj_token == -1 )
                return null;

            let unmatched_quote = before.substr(obj_token).indexOf('"');
            if ( unmatched_quote != -1 )
            {
                from = unmatched_quote + obj_token;
                prop_prefix = before.substr(from+1);
            }
        }
        else if ( before.search(/:[^,]*$/) != -1 )
        {
            return null;
        }

        let path = [];
        json_path_from_node(cur.node.cursor(), path);

        let object_data = descend_validation_path(tree_state.validation_result, path);
        if ( !object_data.length )
            return null;

        let all_props = Object.keys(object_data[0].all_properties);
        if ( !all_props.length )
            return null;

        let keys_already_present = new Set();
        cur.firstChild();
        while ( cur.nextSibling() )
        {
            if ( cur.name == "Property" )
            {
                cur.firstChild();
                keys_already_present.add(context.state.sliceDoc(cur.from + 1, cur.to - 1));
                cur.parent();
            }
        }

        let matching_props = [];

        for ( let prop of all_props )
        {
            let boost = prop_prefix && prop.startsWith(prop_prefix) ? 1 : 0;
            if ( !keys_already_present.has(prop) || boost )
                matching_props.push({
                    label: prop,
                    apply: '"' + prop + '"' + (in_prop ? "" : ": "),
                    boost: boost,
                    type: "variable",
                    detail: object_data[0].all_properties[prop].title,
                    info: object_data[0].all_properties[prop].description,
                });
        }

        if ( !matching_props.length )
            return null;

        matching_props.sort(autocomplete_cmp);

        return {
            from: from,
            to: to,
            filter: false,
            options: matching_props
        };
    }

    class SchemaTypeWidget extends CodeMirrorWrapper.WidgetType
    {
        constructor(path, result, schema)
        {
            super();
            this.result = result;
            this.path = path;
            this.path_str = path.join(".");
            this.schema = schema;
        }

        eq(other)
        {
            return this.path_str == other.path_str;
        }

        show_info_box(target)
        {
            let lottie = descend_lottie_path(lottie_player.lottie, this.path);
            let box = new InfoBoxContents(null, this.schema);
            box.result_info_box(this.result, lottie, lottie_player.lottie, false);
            let bbox = editor_parent.getBoundingClientRect();
            let x = target.offsetLeft + target.offsetWidth;
            let y = target.offsetTop;
            info_box.show_with_contents(null, box.element, box, x, y);
        }

        toDOM()
        {
            get_validation_links(this.result, this.schema); // updates title

            let span = document.createElement("span");
            span.classList.add("schema-type");
            span.classList.add("info_box_trigger");

            let icon_class = schema_icons[this.result.def] ?? "fas fa-info-circle";
            let icon = document.createElement("i");
            icon.setAttribute("class", icon_class);
            span.appendChild(icon);

            span.appendChild(document.createTextNode(this.result.title));

            let self = this;
            span.addEventListener("click", e => self.show_info_box(span));

            return span;
        }
    }

    function on_click(ev, view)
    {
        let pos = editor.posAtCoords({x: ev.clientX, y: ev.clientY});
        view.state.field(decoration_field).between(pos, pos, (from, to, deco) => {
            if ( deco.spec.info_box )
                deco.spec.info_box(view);
        });
    }

    let tree_state = new TreeState();
    let decoration_field = CodeMirrorWrapper.StateField.define({
        create()
        {
            return CodeMirrorWrapper.Decoration.none;
        },

        update(value, transaction)
        {
            for ( let effect of transaction.effects)
            {
                if ( effect.is(tree_state.clear_info_effect) )
                    value = CodeMirrorWrapper.Decoration.none;
                else if ( effect.is(tree_state.load_info_effect) )
                    value = CodeMirrorWrapper.Decoration.set(tree_state.decorations, true);
            }

            return value;
        },
        provide: f => CodeMirrorWrapper.EditorView.decorations.from(f)

    });

    let editor_parent = document.getElementById("editor_parent");
    let editor = new CodeMirrorWrapper.EditorView({
        state: CodeMirrorWrapper.EditorState.create({
            extensions: [
                CodeMirrorWrapper.lintGutter(),
                ...CodeMirrorWrapper.default_extensions,
                CodeMirrorWrapper.json(),
                CodeMirrorWrapper.on_change(update_player_from_editor),
                tree_state.linter(),
                CodeMirrorWrapper.autocompletion({override: [autocomplete]}),
                decoration_field,
                CodeMirrorWrapper.EditorView.domEventHandlers({
                    click: on_click
                })

            ]
        }),
        parent: editor_parent
    });

    let info_box = new InfoBox(document.getElementById("info_box"));
    document.body.addEventListener("click", e => {
        if (
            !e.target.closest(".info_box_trigger") &&
            !info_box.element.contains(e.target)
        )
            info_box.hide()
    });

    const worker = new Worker("../../scripts/explain_worker.js");
    worker.onmessage = on_worker_message;

    var lottie_player = new LottiePlayer("lottie_target", undefined);

    let error_container = document.getElementById("error_alert");
    let loading_div = document.getElementById("loading_alert");

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
        set_editor_json({
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
        });
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
