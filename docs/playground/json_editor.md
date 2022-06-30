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

#editor_area {
    display: flex;
    flex-flow: row wrap;
}

#editor_area > div:first-child {
    margin-bottom: 1ex;
    margin-right: 1ex;
}

.playback-controls {
    display: flex;
}

.player-wrapper {
    max-width:100%;
    width: 512px;
}

.cm-editor:focus-within {
    outline: 2px solid #3daee9 !important;
}

#editor_parent > .cm-editor > .cm-scroller {
    height: 80vh;
}

#editor_parent .cm-scroller {
    overflow: auto;
    resize: vertical;
}

#editor_parent {
    position: relative;
}

body.wide .editor-side {
    width: calc(100% - 512px - 1em);
}

.editor-side {
    width: 100%;
}

body.wide .container {
    width: 100vw;
    margin: 0;
    padding: 0;
}


#editor_parent > #info_box {
    display: none;
    border: 5px solid #555;
    border-radius: 6px;
    padding: 5px;
    background: white;
    color: black;
    font-style: normal;
    word-break: normal;
}


.cm-editor > .tooltip-info-box
{
    background: none;
    border: none;
}

#info_box
{
    border: 5px solid #555;
    border-radius: 6px;
    padding: 5px;
    background: white;
    color: black;
    font-style: normal;
    word-break: normal;
}

.cm-editor > .tooltip-info-box > .cm-tooltip-arrow:after {
    border-top-color: #555;
}

#info_box input[type="color"]
{
    display: block;
    padding: 0;
    width: 96px;
    height: 48px;
    margin-top: 1ex;
}

</style>
<div class="alert alert-danger" role="alert" style="display: none" id="error_alert"></div>
<div class="alert alert-primary" role="alert" style="display: none" id="loading_alert">
    <div class="spinner-border" role="status"></div>
    Loading...
</div>

<div id="editor_area">
    <div class="player-wrapper">
        <div class="alpha_checkered" id="lottie_target"></div>
        <div class="playback-controls">
            <button onclick="toggle_playback(this)" class="btn btn-primary btn-sm" title="Pause">
                <i class="fa-solid fa-pause"></i>
            </button>
            <button onclick="toggle_playback_controls()" class="btn btn-secondary btn-sm" title="Toggle Playback Controls">
                <i class="fa-solid fa-sliders"></i>
            </button>
            <input type="range" class="form-control" id="frame_slider" oninput="update_frame(this.value)" style="display: none"/>
            <input type="number" id="frame_edit" oninput="update_frame(this.value)" style="display: none"/>
        </div>
    </div>
    <div class="editor-side">
        <button onclick="action_new()" class="btn btn-primary btn-sm" title="New"><i class="fa-solid fa-file"></i></button>
        <button onclick="action_load()" class="btn btn-primary btn-sm" title="Load"><i class="fa-solid fa-cloud-arrow-down"></i></button>
        <button type="button" class="btn btn-primary btn-sm" data-toggle="modal" data-target="#modal_url" title="Load from URL">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </button>
        <button type="button" class="btn btn-primary btn-sm" data-toggle="modal" data-target="#modal_file" title="Upload file">
            <i class="fa-solid fa-upload"></i>
        </button>
        <button onclick="action_save()" class="btn btn-primary btn-sm" title="Save"><i class="fa-solid fa-floppy-disk"></i></button>
        <button onclick="action_download()" class="btn btn-primary btn-sm" title="Download"><i class="fa-solid fa-download"></i></button>
        <button onclick="CodeMirrorWrapper.undo(editor)" class="btn btn-warning btn-sm" title="Undo"><i class="fa-solid fa-rotate-left"></i></button>
        <button onclick="CodeMirrorWrapper.redo(editor)" class="btn btn-success btn-sm" title="Redo"><i class="fa-solid fa-rotate-right"></i></button>
        <button onclick="pretty()" class="btn btn-info btn-sm" title="Prettify JSON"><i class="fa-solid fa-indent"></i></button>
        <button onclick="document.body.classList.toggle('wide')" class="btn btn-secondary btn-sm" title="Toggle Wide Layout">
            <i class="fa-solid fa-arrows-left-right"></i>
        </button>
        <div id="editor_parent" >
            <div id="info_box">
                <div class="info_box_details"></div>
                <div class="info_box_lottie alpha_checkered"></div>
                <div class="info_box_buttons" style="display: none" data-toggle="buttons">
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
<details>
    <summary>Key Bindings</summary>
    <table id="key_bindings"></table>
</details>
<div class="modal fade" id="modal_file" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    Upload File
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" />
                        <span aria-hidden="true">&times;</span>
                    </button>
                </h5>
            </div>
            <div class="modal-body">
                <div class="drop-area" ondrop="lottie_drop_input(event);" ondragover="event.preventDefault();">
                    <p>Drop JSON file here</p>
                    <input type="file" onchange="lottie_file_input(event);" class="form-control-file" />
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal" id="dismiss_file_modal">Cancel</button>
            </div>
        </div>
    </div>
</div>
<div class="modal fade" id="modal_url" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    Load from URL
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" />
                        <span aria-hidden="true">&times;</span>
                    </button>
                </h5>
            </div>
            <div class="modal-body">
                <input type="text" id="input_from_url" class="form-control" />
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" data-dismiss="modal"
                    onclick="lottie_url_input(document.getElementById('input_from_url').value)">Load</button>
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
                    document.getElementById("dismiss_file_modal").click();
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

        if ( load_ok )
        {
            lottie_player.lottie = lottie;
            frame_slider.min = frame_edit.min = lottie.ip;
            frame_slider.max = frame_edit.max = lottie.op;
            lottie_player.reload();
            frame_slider.value = frame_edit.value = Math.round(lottie_player.anim.currentFrame);
            lottie_player.anim.addEventListener("enterFrame", (ev) => {
                frame_slider.value = frame_edit.value = Math.round(ev.currentTime);
            });
            worker.postMessage({type: "update", lottie: lottie});
        }
    }

    function update_frame(value)
    {
        value = Number(value);
        if ( value != Math.round(lottie_player.anim.currentFrame) )
            lottie_player.go_to_frame(value);
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
                tree_state.set_schema(Object.assign(new SchemaData(), ev.data.schema));
                tree_state.load_expressions(ev.data.expressions)
                if ( lottie_player.lottie )
                    worker.postMessage({type: "update", lottie: lottie_player.lottie});
                break;
            case "result":
                tree_state.end_load(editor, ev.data.result);
                break;
            default:
                console.warn("Unknown worker message", ev.data);
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
                        this.on_property(name, name_node, prop_node, prop_result, result, path);
                        if ( name == "ty" && prop_result.const )
                            this.on_ty_value(prop_node.lastChild, prop_result, result)
                        else
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

        on_ty_value(node, prop_result, object_result)
        {
            this.add_lint_errors(node, prop_result);
            let schema = this.schema;
            let deco = CodeMirrorWrapper.Decoration.mark({
                class: "info_box_trigger",
                info_box: () => TreeResultVisitor.ty_info_box(
                    editor, schema, node, prop_result, object_result
                ),
            });
            this.decorations.push(deco.range(node.from, node.to));
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

            if ( result.description && result.title.length > 1 )
            {
                let widget;
                let pos = node.firstChild.to;
                if ( result.group == "helpers" && result.cls == "color" )
                    widget = new ColorSchemaWidget(path, result, json, this.schema, pos, node);
                else
                    widget = new SchemaTypeWidget(path, result, json, this.schema, pos);
                let deco = CodeMirrorWrapper.Decoration.widget({
                    widget: widget,
                    side: 1
                });
                this.decorations.push(deco.range(pos));
            }
        }

        on_property(name, name_node, prop_node, prop_result, obj_result, path)
        {
            this.add_lint_errors(name_node, prop_result.key);

            if ( prop_result.key )
            {
                let schema = this.schema;
                let deco = CodeMirrorWrapper.Decoration.mark({
                    class: "info_box_trigger",
                    info_box: (pos) => TreeResultVisitor.property_info_box(
                        pos, editor, schema, name_node, obj_result, prop_result
                    ),
                });
                this.decorations.push(deco.range(name_node.from, name_node.to));

                let value_node = prop_node.lastChild;
                if ( name == "x" && value_node.name == "String" )
                {
                    let code = editor.state.sliceDoc(value_node.from, value_node.to);
                    let widget = new EditExpressionWidget(path, code, value_node);
                    let deco = CodeMirrorWrapper.Decoration.widget({
                        widget: widget,
                        info_box: widget.show_info_box.bind(widget),
                        side: 1
                    });
                    this.decorations.push(deco.range(value_node.from));
                }
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
                    info_box: (pos) => TreeResultVisitor.enum_info_box(
                        pos, editor, schema, node, result
                    ),
                });
                this.decorations.push(deco.range(node.from, node.to));
            }
        }

        on_array(node, result, json, path)
        {
            this.on_object(node, result, json, path);
        }

        static property_info_box(pos, view, schema, node, obj_result, prop_result)
        {
            let box = new InfoBoxContents(null, schema);
            box.property(obj_result, prop_result);
            TreeResultVisitor.show_info_box(pos, view, box, node);
        }

        static ty_info_box(view, schema, node, prop_result, object_result)
        {
            let box = new InfoBoxContents(null, schema);
            box.ty_value(object_result, prop_result, view.state.sliceDoc(node.from, node.to));
            TreeResultVisitor.show_info_box(node.from, view, box, node);
        }

        static enum_info_box(pos, view, schema, node, result)
        {
            let box = new InfoBoxContents(null, schema);
            box.enum_value(result, view.state.sliceDoc(node.from, node.to));
            TreeResultVisitor.show_info_box(pos, view, box, node);
        }

        static show_info_box(pos, view, box, node)
        {
            info_box.show_with_contents(null, box.element, box, 0, 0);
            tree_state.show_info_box_tooltip(pos);
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
            this.update_tooltip_effect = CodeMirrorWrapper.StateEffect.define();
            this.expression_completions = [];
            this.macro_completions = [];

            let self = this;

            this.decoration_field = CodeMirrorWrapper.StateField.define({
                create()
                {
                    return CodeMirrorWrapper.Decoration.none;
                },

                update(value, transaction)
                {
                    for ( let effect of transaction.effects)
                    {
                        if ( effect.is(self.clear_info_effect) )
                            value = CodeMirrorWrapper.Decoration.none;
                        else if ( effect.is(self.load_info_effect) )
                            value = CodeMirrorWrapper.Decoration.set(self.decorations, true);
                    }

                    return value;
                },

                provide: f => CodeMirrorWrapper.EditorView.decorations.from(f)

            });
            this.info_box_field = CodeMirrorWrapper.StateField.define({
                create() { return []; },

                update(value, transaction)
                {
                    for ( let effect of transaction.effects)
                    {
                        if ( effect.is(self.update_tooltip_effect) )
                        {
                            if ( effect.value )
                                return [effect.value];
                            else
                                return [];
                        }
                    }

                    return value;
                },

                provide: f => CodeMirrorWrapper.showTooltip.computeN([f], state => state.field(f))
            });
        }

        extensions()
        {
            return [
                this.decoration_field,
                this.info_box_field,
            ]
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

            let tree = CodeMirrorWrapper.ensureSyntaxTree(view.state, undefined, 2000);
            if ( tree )
            {
                let visitor = new TreeResultVisitor(this.schema);
                visitor.visit(tree.topNode, result, lottie_player.lottie);
                this.lint_errors = visitor.lint_errors;
                this.decorations = visitor.decorations;

                this.get_syntax_errors(tree);
            }
            else
            {
                this.lint_errors = [];
            }

            view.dispatch(CodeMirrorWrapper.setDiagnostics(view.state, this.lint_errors));

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

        add_expr_function(name, def)
        {
            if ( !Array.isArray(def) )
                def = [def];

            for ( let d of def )
            {
                let syn = "";
                if ( d.params )
                    syn = d.params.map(p => p.name).join(", ");

                let data = {
                    label: name,
                    type: "function",
                    detail: "(" + syn + ")"
                };

                if ( d.description )
                    data.info = d.description;
                else if ( d.return && d.return.description )
                    data.info = d.return.description;

                this.expression_completions.push(data);
            }
        }

        add_expr_builtin(name, value)
        {
            this.expression_completions.push({
                label: name,
                type: "namespace",
            });

            for ( let [n, d] of Object.entries(Object.getOwnPropertyDescriptors(value)) )
            {
                if ( n.indexOf("(") != -1 )
                    continue;

                let is_func = typeof d.value == "function";

                this.expression_completions.push({
                    label: "Math." + n,
                    type: is_func ? "function" : "constant",
                    detail: is_func ? "()" : "",
                });

            }
        }

        load_expressions(expr_schema)
        {
            for ( let [n, v] of Object.entries(expr_schema.variables) )
            {
                let data = {
                    label: n,
                    type: "variable"
                };
                if ( v.description )
                    data.info = v.description;
                this.expression_completions.push(data);
            }

            for ( let [n, v] of Object.entries(expr_schema.functions) )
                this.add_expr_function(n, v);

            for ( let [n, v] of Object.entries(expr_schema.aliases) )
                this.add_expr_function(n, expr_schema.functions[v]);

            this.add_expr_builtin("Math", Math);
        }

        hide_tooltip()
        {
            editor.dispatch({effects: [this.update_tooltip_effect.of(null)]});
        }

        show_info_box_tooltip(pos, options = {})
        {
            let tooltip = {
                pos: pos,
                above: true,
                arrow: true,
                ...options,
                create: () => {
                    let div = document.createElement("div");
                    info_box.element.setAttribute("style", "");
                    div.appendChild(info_box.element);
                    div.classList.add("tooltip-info-box");
                    return {dom: div};
                }
            }

            editor.dispatch({effects: [this.update_tooltip_effect.of(tooltip)]});
        }

        set_schema(schema)
        {
            this.schema = schema;
            this.schema.root = null; // not needed

            let template_builder = new TemplateFromSchemaBuilder(schema);
            for ( let name of Object.keys(schema.schema.$defs.layers) )
            {
                if ( name.endsWith("-layer") )
                    this.add_schema_completion(template_builder, name, "#/$defs/layers/" + name);
            }

            let avoid = new Set([
                "base-stroke", "gradient", "modifier", "repeater-transform", "shape-element",
                "shape-list", "shape",
            ]);

            for ( let name of Object.keys(schema.schema.$defs.shapes) )
            {
                if ( ! avoid.has(name) )
                    this.add_schema_completion(template_builder, name == "transform" ? "transform_shape" : name, "#/$defs/shapes/" + name);
            }

            this.add_schema_completion(template_builder, "transform", "#/$defs/helpers/transform");

            this.add_property_macro(template_builder, "value", 0);
            this.add_property_macro(template_builder, "vector", [0, 0]);
            this.add_property_macro(template_builder, "color", [0, 0, 0]);
        }

        add_property_macro(template_builder, name, value, descr)
        {
            let template = {
                a: 0,
                k: value
            };
            this.add_macro_completion(name, template);

            template = {
                a: 1,
                k: [
                    template_builder.keyframe_value(value),
                    {
                        t: 0,
                        s: Array.isArray(value) ? value : [value],
                    },
                ]
            };
            this.add_macro_completion(name, template, undefined, "(animated)");
            this.add_macro_completion(name, template_builder.keyframe_value(value), undefined, "keyframe");
        }

        add_schema_completion(template_builder, name, ref)
        {
            let data = template_builder.ref_data(ref);
            let template = template_builder.data_to_template(data);
            this.add_macro_completion(name.replace("-", "_"), template, data.description);
        }

        add_macro_completion(name, template, description, detail)
        {
            let lines = JSON.stringify(template, undefined, 4).split("\n");
            this.macro_completions.push({
                label: name,
                type: "type",
                detail: detail,
                info: description,
                lines: lines,
                apply: apply_long_completion
            })
        }

        macro_autocomplete(context)
        {
            let word = context.matchBefore(/\w*/)
            if ( word.from == word.to && !context.explicit )
                return null;

            return {
                from: word.from,
                options: this.macro_completions
            }
        }
    }

    function indent_at(state, pos)
    {
        let line = state.doc.lineAt(pos);
        return "\n" + line.text.match(/^\s*/)[0];
    }

    function apply_long_completion(view, completion, from, to)
    {
        let lines = completion.lines;
        let text = lines.join(indent_at(view.state, from));

        view.dispatch(CodeMirrorWrapper.insertCompletionText(view.state, text, from, to));
    }

    class TemplateFromSchemaBuilder
    {
        constructor(schema)
        {
            this.schema = schema;
            this.data_cache = {};
        }

        ref_data(ref)
        {
            if ( ref in this.data_cache )
                return this.data_cache[ref];

            let data = {};
            switch ( ref )
            {
                case "#/$defs/animated-properties/position":
                case "#/$defs/animated-properties/multi-dimensional":
                    data = this.prop_schema([0, 0]);
                    break;
                case "#/$defs/animated-properties/color-value":
                    data = this.prop_schema([0, 0, 0]);
                    break;
                case "#/$defs/animated-properties/value":
                    data = this.prop_schema(0);
                    break;
                case "#/$defs/animated-properties/position-keyframe":
                case "#/$defs/animated-properties/keyframe":
                    data = this.keyframe_schema([0, 0]);
                    break;
                case "#/$defs/helpers/transform":
                    this.item_data(this.schema.get_ref_data(ref), data);
                    data.properties.o = this.prop_schema(100);
                    data.properties.r = this.prop_schema(0);
                    data.properties.p = this.prop_schema([0, 0]);
                    data.required = ["a", "p", "s", "r", "o"];
                    break;
                default:
                    this.item_data(this.schema.get_ref_data(ref), data);
                    break;
            }
            this.data_cache[ref] = data;
            return data;
        }

        prop_schema(value)
        {
            return {
                "const": {
                    a: 0,
                    k: value,
                }
            }
        }

        keyframe_value(value)
        {
            return {
                t: 0,
                s: Array.isArray(value) ? value : [value],
                o: {x: [0], y: [0]},
                i: {x: [1], y: [1]},
            }
        }

        item_data(obj, out)
        {
            if ( obj.const !== undefined )
            {
                out.const = obj.const;

                if ( obj.description )
                    out.description = obj.description;

                return;
            }

            if ( obj.allOf )
                for ( let s of obj.allOf )
                    this.item_data(s, out)

            if ( obj.if )
            {
                this.item_data(obj.if, out);
                this.item_data(obj.then, out);
            }

            if ( obj.$ref )
                this.merge_data(out, this.ref_data(obj.$ref));


            if ( obj.description )
                out.description = obj.description;

            if ( obj.properties )
            {
                if ( !out.properties )
                    out.properties = {};

                for ( let [name, prop] of Object.entries(obj.properties) )
                {
                    if ( !(name in out) )
                        out.properties[name] = {};
                    this.item_data(prop, out.properties[name]);
                }
            }

            switch ( obj.type )
            {
                case "number":
                case "integer":
                    out.default = 0;
                    break;
                case "string":
                    out.default = {};
                    break;
                case "boolean":
                    out.default = false;
                    break;
                case "array":
                    obj.default = [];
                    break;
            }

            if ( obj.default !== undefined )
                out.default = obj.default;

            if ( obj.required )
            {
                if ( !out.required )
                    out.required = [];
                out.required = out.required.concat([...obj.required]);
            }
        }

        merge_data(dest, other)
        {
            if ( dest.description === undefined )
                dest.description = other.description;

            if ( dest.const === undefined && other.const !== undefined )
            {
                dest.const = other.const;
                return;
            }

            if ( dest.default === undefined )
                dest.default = other.default;

            if ( other.properties )
            {
                if ( !dest.properties )
                    dest.properties = {};

                for ( let [name, prop] of Object.entries(other.properties) )
                {
                    if ( !(name in dest.properties) )
                        dest.properties[name] = {};

                    this.merge_data(dest.properties[name], prop);
                }
            }


            if ( other.required )
            {
                if ( !dest.required )
                    dest.required = [];
                dest.required = dest.required.concat([...other.required]);
            }
        }

        data_to_template(data)
        {
            if ( data.template )
                return data.template;

            if ( data.const !== undefined )
                return data.template = data.const;

            if ( data.default !== undefined )
                return data.template = data.default;

            data.template = {};

            if ( data.required )
            {
                for ( let name of new Set(data.required) )
                    data.template[name] = this.data_to_template(data.properties[name]);
            }

            return data.template;
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
        constructor(path, result, json, schema, pos)
        {
            super();
            this.result = result;
            this.path = path;
            this.path_str = path.join(".");
            this.schema = schema;
            this.lottie = json;
            this.pos = pos;
        }

        eq(other)
        {
            return this.path_str == other.path_str;
        }

        show_info_box(pos)
        {
            let box = new InfoBoxContents(null, this.schema);
            box.result_info_box(this.result, this.lottie, lottie_player.lottie, false);
            info_box.show_with_contents(null, box.element, box, 0, 0);
            tree_state.show_info_box_tooltip(pos);
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
            span.addEventListener("click", this.on_click.bind(this));

            return span;
        }

        on_click()
        {
            this.show_info_box(this.pos);
        }

        ignoreEvent(ev) { return true; }
    }

    class ColorSchemaWidget extends SchemaTypeWidget
    {
        constructor(path, result, json, schema, pos, node)
        {
            super(path, result, json, schema, pos);
            this.from = node.from;
            this.to = node.to;
        }

        lottie_to_hex(lottie)
        {
            return "#" + lottie.slice(0, 3)
                .map(i => Math.round(Math.min(Math.max(i, 0), 1) * 0xff)
                .toString(16).padStart(2, "0")).join("")
            ;
        }

        hex_to_lottie_lines(hex)
        {
            return ["[", ...[1, 3, 5].map(i =>
                "    " +
                (parseInt(hex.slice(i, i+2), 16) / 255).toFixed(3) +
                (i != 5 ? "," : "")
            ), "]"];
        }

        on_input(ev)
        {
            let lines = this.hex_to_lottie_lines(ev.target.value);
            let text = lines.join(indent_at(editor.state, this.from));

            editor.dispatch({
                changes: {from: this.from, to: this.to, insert: text}
            });
            this.to = this.from + text.length;
        }

        show_info_box(pos)
        {
            let box = new InfoBoxContents(null, this.schema);
            box.result_info_box(this.result, this.lottie, lottie_player.lottie, false, true, false);
            var input = box.add("input", null, {type: "color", value: this.lottie_to_hex(this.lottie)});
            input.addEventListener("input", this.on_input.bind(this));


            info_box.show_with_contents(null, box.element, box, 0, 0);
            tree_state.show_info_box_tooltip(pos);
        }
    }

    class EditExpressionWidget extends CodeMirrorWrapper.WidgetType
    {
        constructor(path, script, node)
        {
            super();
            this.path = path;
            this.script = JSON.parse(script);
            this.path_str = path.join(".");
            this.from = node.from;
            this.to = node.to;
        }

        eq(other)
        {
            return this.path_str == other.path_str;
        }

        toDOM()
        {
            let span = document.createElement("span");
            span.classList.add("schema-type");
            span.classList.add("info_box_trigger");

            let icon = document.createElement("i");
            icon.setAttribute("class", "fas fa-file-code");
            span.appendChild(icon);

            span.title = "Edit Expression";

            return span;
        }

        update_code(update)
        {
            let expr = JSON.stringify(update.state.doc.toString());

            editor.dispatch({
                changes: {from: this.from, to: this.to, insert: expr}
            });
            this.to = this.from + expr.length;
        }

        show_info_box(pos)
        {
            let element = document.createElement("div");

            let title = element.appendChild(document.createElement("strong"));
            let a = title.appendChild(document.createElement("a"));
            a.appendChild(document.createTextNode("Expression"));
            a.setAttribute("href", "/lottie-docs/expressions/");
            title.appendChild(document.createTextNode(" Editor"));

            let lang = CodeMirrorWrapper.javascript();
            let expression_editor = new CodeMirrorWrapper.EditorView({
                state: CodeMirrorWrapper.EditorState.create({
                    extensions: [
                        ...CodeMirrorWrapper.default_extensions,
                        CodeMirrorWrapper.on_change(this.update_code.bind(this)),
                        // Use this instead of override to keep default completions
                        new CodeMirrorWrapper.LanguageSupport(
                            lang.language,
                            [
                                ...lang.support,
                                lang.language.data.of({autocomplete: autocomplete_expression})
                            ],
                        )
                    ]
                }),
                parent: element
            });
            expression_editor.dispatch({
                changes: {from: 0, to: 0, insert: this.script}
            });
            let line = editor.state.doc.lineAt(this.from);
            info_box.show_with_contents(null, element, expression_editor, 0, 0);

            setTimeout(() => {
                expression_editor.focus(),
                expression_editor.dispatch({selection: {anchor: this.script.length}})
            }, 0);

            tree_state.show_info_box_tooltip(
                line.from,
                {
                    arrow: false,
                    above: false,
                }
            );
        }

        ignoreEvent(ev) { return false; }
    }

    function on_click(ev, view)
    {
        let pos = editor.posAtCoords({x: ev.clientX, y: ev.clientY});
        view.state.field(tree_state.decoration_field).between(pos, pos, (from, to, deco) => {
            if ( deco.spec.info_box )
                deco.spec.info_box(pos)
        });
    }

    function action_save()
    {
        localStorage.setItem("editor_lottie", JSON.stringify(lottie_player.lottie));
    }

    function action_load()
    {
        set_editor_json(JSON.parse(localStorage.getItem("editor_lottie")));
    }

    function action_new()
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
            "layers": []
        });
    }

    function action_download()
    {
        download_json(lottie_player.lottie, "lottie.json");
    }

    function autocomplete_expression(context)
    {
        let line = context.state.doc.lineAt(context.pos);
        let before = line.text.slice(line.from, context.pos - line.from);
        let after = line.text.slice(context.pos - line.from);

        let start = before.search(/(\w|\.|\$)*$/);
        if ( start == -1 )
            start = context.pos;
        else
            start += line.from;

        let end = after.search(/(\W|$)/);
        if ( end == -1 )
            end = context.pos;
        else
            end += context.pos;

        if ( start == end && !context.explicit )
            return null;

        return {
            from: start,
            to: end,
            options: tree_state.expression_completions
        };
    }

    function toggle_playback(button)
    {
        if ( lottie_player.autoplay )
        {
            lottie_player.pause();
            button.title = "Play";
            button.firstElementChild.setAttribute("class", "fa-solid fa-play");
        }
        else
        {
            lottie_player.play();
            button.title = "Pause";
            button.firstElementChild.setAttribute("class", "fa-solid fa-pause");
        }
    }

    function toggle_playback_controls()
    {
        if ( frame_slider.style.display == "none" )
        {
            frame_slider.style.display = "block";
            frame_edit.style.display = "block";
        }
        else
        {
            frame_slider.style.display = "none";
            frame_edit.style.display = "none";
        }
    }

    function get_tooltip(state)
    {
        if ( !tree_state.tooltip )
            return [];

        return [tree_state.tooltip]
    }

    let expr_variables = ["$bm_rt", "time", "value", "thisProperty", "thisComp", "thisLayer"];
    let expr_funcs = ["comp", "posterizeTime", "timeToFrames", "framesToTime", "rgbToHsl", "hslToRgb",
        "createPath", "add", "sub", "mul", "div", "mod", "clamp", "normalize", "length", "lookAt",
        "seedRandom", "random", "linear", "ease", "easeIn", "easeOut",
        "degreesToRadians", "radiansToDegrees", "$bm_sum", "sum", "$bm_sub", "$bm_div"
    ];

    let tree_state = new TreeState();

    let frame_slider = document.getElementById("frame_slider");
    let frame_edit = document.getElementById("frame_edit");

    let editor_parent = document.getElementById("editor_parent");
    let editor = new CodeMirrorWrapper.EditorView({
        state: CodeMirrorWrapper.EditorState.create({
            extensions: [
                CodeMirrorWrapper.lintGutter(),
                ...CodeMirrorWrapper.default_extensions,
                CodeMirrorWrapper.json(),
                CodeMirrorWrapper.on_change(update_player_from_editor),
                tree_state.extensions(),
                CodeMirrorWrapper.autocompletion({override: [autocomplete, tree_state.macro_autocomplete.bind(tree_state)]}),
                CodeMirrorWrapper.EditorView.domEventHandlers({click: on_click}),
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
        {
            info_box.hide();
            tree_state.hide_tooltip();
        }
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
        action_new();
    }

    let key_bindings_parent = document.getElementById("key_bindings");
    let platform = "linux";
    let mod = "Ctrl";
    if ( navigator.platform.indexOf("Mac") != -1 )
    {
        platform = "mac";
        mode = "Cmd";
    }
    else if ( navigator.platform.indexOf("Win") != -1 )
    {
        platform = "win";
    }

    for ( arr of editor.state.field(CodeMirrorWrapper.keymap) )
    {
        for ( key of arr )
        {
            let seq = key[platform] ?? key.key;
            if ( seq && key.run.name )
            {
                let row = key_bindings.appendChild(document.createElement("tr"));
                row.appendChild(document.createElement("th"))
                .appendChild(document.createTextNode(seq.replace("Mod", mod)));

                let cmd = key.run.name.replace(/[A-Z]/g, l => " " + l)
                .replace(/^[a-z]/, l => l.toUpperCase());
                row.appendChild(document.createElement("td"))
                .appendChild(document.createTextNode(cmd));
            }
        }
    }
</script>
