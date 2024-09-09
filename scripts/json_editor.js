function json_path_from_node(node, path, state)
{
    while ( node.name != "JsonText" )
    {
        if ( node.name == "PropertyName" )
        {
            var prop = state.sliceDoc(node.from + 1, node.to - 1);
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

function indent_at(state, pos)
{
    let line = state.doc.lineAt(pos);
    return "\n" + line.text.match(/^\s*/)[0];
}

function process_long_completion(completion, dynamic)
{
    if ( !dynamic )
        return completion;

    if ( typeof dynamic == "function" )
        return dynamic();

    let ret = {};
    for ( let [k, v] of Object.entries(completion) )
        ret[k] = process_long_completion(v, dynamic[k]);
    return ret;
}

function apply_long_completion(view, completion, from, to)
{
    let template = process_long_completion(completion.template, completion.dynamic);
    let lines = JSON.stringify(template, undefined, 4).split("\n");
    let text = lines.join(indent_at(view.state, from));

    view.dispatch(CodeMirrorWrapper.insertCompletionText(view.state, text, from, to));
}

class ExpressionCompletions
{
    constructor()
    {
        this.completions = [];
    }

    autocomplete(context)
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
            options: this.completions
        };
    }

    extension()
    {
        let lang = CodeMirrorWrapper.javascript();

        // Use this instead of override to keep default completions
        return new CodeMirrorWrapper.LanguageSupport(
            lang.language,
            [
                ...lang.support,
                lang.language.data.of({autocomplete: this.autocomplete.bind(this)})
            ],
        );
    }

    add_function(name, def)
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

            this.completions.push(data);
        }
    }

    add_builtin(name, value)
    {
        this.completions.push({
            label: name,
            type: "namespace",
        });

        for ( let [n, d] of Object.entries(Object.getOwnPropertyDescriptors(value)) )
        {
            if ( n.indexOf("(") != -1 )
                continue;

            let is_func = typeof d.value == "function";

            this.completions.push({
                label: "Math." + n,
                type: is_func ? "function" : "constant",
                detail: is_func ? "()" : "",
            });

        }
    }

    load_completions(expr_schema)
    {
        for ( let [n, v] of Object.entries(expr_schema.variables) )
        {
            let data = {
                label: n,
                type: "variable"
            };
            if ( v.description )
                data.info = v.description;
            this.completions.push(data);
        }

        for ( let [n, v] of Object.entries(expr_schema.functions) )
            this.add_function(n, v);

        for ( let [n, v] of Object.entries(expr_schema.aliases) )
            this.add_function(n, expr_schema.functions[v]);

        this.add_builtin("Math", Math);
    }
}

class ExpressionEditor
{
    constructor(parent_element, completions, on_change)
    {
        this.on_change = on_change;
        this.view = new CodeMirrorWrapper.EditorView({
            state: CodeMirrorWrapper.EditorState.create({
                extensions: [
                    ...CodeMirrorWrapper.default_extensions,
                    CodeMirrorWrapper.on_change(this._on_change.bind(this)),
                    completions.extension()
                ]
            }),
            parent: parent_element
        });
    }

    _on_change(update)
    {
        this.on_change(update.state.doc.toString());
    }

    set_code(code)
    {
        this.view.dispatch({
            changes: {from: 0, to: this.view.state.doc.length, insert: code}
        });
    }

    focus()
    {
        this.view.focus(),
        this.view.dispatch({selection: {anchor: this.view.state.doc.length}})
    }
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

class TreeResultVisitor
{
    constructor(editor)
    {
        this.lint_errors = [];
        this.decorations = [];
        this.editor = editor;
    }

    visit(node, result, json, path = [], context={})
    {
        if ( !node || !result )
            return false;

        if ( node.name == "JsonText" )
        {
            this.visit(node.firstChild, result, json, path, context);
            return false;
        }

        if ( node.name == "Object" )
        {
            this.on_object(node, result, json, path, context);
            if ( result.cls == "gradient-colors" )
                context = {...context, gradient: true, color_count: json.p ?? 0};

            for ( let prop_node of node.getChildren("Property") )
            {
                let name_node = prop_node.getChild("PropertyName");
                if ( !name_node )
                    continue;

                let name = this.editor.view.state.sliceDoc(name_node.from + 1, name_node.to - 1);
                if ( name in result.children )
                {
                    let prop_result = result.children[name];
                    this.on_property(name, name_node, prop_node, prop_result, result, path);
                    if ( name == "ty" && prop_result.const )
                        this.on_ty_value(prop_node.lastChild, prop_result, result)
                    else
                        this.visit(prop_node.lastChild, prop_result, json[name], path.concat([name]), {...context, prop: name});
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
            this.on_array(node, result, json, path, context);
            var index = 0;
            var cur = node.firstChild.cursor();
            // first child is [
            while ( cur.nextSibling() )
            {
                if ( !(index in result.children) )
                    break;

                if ( this.visit(cur.node, result.children[index], json[index], path.concat([index]), context) )
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
        let editor = this.editor;
        this.add_lint_errors(node, prop_result);
        let deco = CodeMirrorWrapper.Decoration.mark({
            class: "info_box_trigger",
            info_box: (pos) => TreeResultVisitor.ty_info_box(
                pos, editor, node, prop_result, object_result
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

    on_object(node, result, json, path, context)
    {
        this.add_lint_errors(node.firstChild, result);
        this.add_lint_errors(node.lastChild, result);

        if ( context.gradient && Array.isArray(json) && (context.prop == "k" || context.prop == "s" || context.prop == "e") )
        {
            let pos = node.firstChild.to;
            let deco = CodeMirrorWrapper.Decoration.widget({
                widget: new GradientSchemaWidget(this.editor, path, result, json, pos, node, context.color_count),
                side: 1
            });
            this.decorations.push(deco.range(pos));
        }
        else if ( result.description && result.title.length > 1 )
        {
            let widget;
            let pos = node.firstChild.to;

            if ( result.group == "helpers" && result.cls == "color" )
                widget = new ColorSchemaWidget(this.editor, path, result, json, pos, node);
            else if ( result.group == "helpers" && result.cls == "bezier" )
                widget = new BezierSchemaWidget(this.editor, path, result, json, pos, node);
            else if ( result.cls && result.cls.indexOf("keyframe") != -1 )
                widget = new KeyframeSchemaWidget(this.editor, path, result, json, pos, node);
            else
                widget = new SchemaTypeWidget(this.editor, path, result, json, pos);

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
            let editor = this.editor;
            let deco = CodeMirrorWrapper.Decoration.mark({
                class: "info_box_trigger",
                info_box: (pos) => TreeResultVisitor.property_info_box(
                    pos, editor, name_node, obj_result, prop_result
                ),
            });
            this.decorations.push(deco.range(name_node.from, name_node.to));

            let value_node = prop_node.lastChild;
            if ( name == "x" && value_node.name == "String" )
            {
                let widget = new EditExpressionWidget(this.editor, path, value_node);
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
            let editor = this.editor;
            let deco = CodeMirrorWrapper.Decoration.mark({
                class: "info_box_trigger",
                info_box: (pos) => TreeResultVisitor.enum_info_box(
                    pos, editor, node, result
                ),
            });
            this.decorations.push(deco.range(node.from, node.to));
        }
    }

    on_array(node, result, json, path, context)
    {
        this.on_object(node, result, json, path, context);
    }

    static property_info_box(pos, editor, node, obj_result, prop_result)
    {
        let box = new InfoBoxContents(null, editor.schema);
        box.property(obj_result, prop_result);
        editor.show_info_box_with_contents(pos, box.element, box);
    }

    static ty_info_box(pos, editor, node, prop_result, object_result)
    {
        let box = new InfoBoxContents(null, editor.schema);
        box.ty_value(object_result, prop_result, editor.view.state.sliceDoc(node.from, node.to));
        editor.show_info_box_with_contents(pos, box.element, box);
    }

    static enum_info_box(pos, editor, node, result)
    {
        let box = new InfoBoxContents(null, editor.schema);
        box.enum_value(result, editor.view.state.sliceDoc(node.from, node.to));
        editor.show_info_box_with_contents(pos, box.element, box);
    }
}

class LottieCompletions
{
    constructor()
    {
        this.macro_completions = [];
        this.validation_result = null;
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

    add_schema_completion(template_builder, name, ref, dynamic=undefined)
    {
        let data = template_builder.ref_data(ref);
        let template = template_builder.data_to_template(data);
        this.add_macro_completion(name.replace("-", "_"), template, data.description, undefined, dynamic);
    }

    add_macro_completion(name, template, description, detail, dynamic=undefined)
    {
        this.macro_completions.push({
            label: name,
            type: "type",
            detail: detail,
            info: description,
            template: template,
            dynamic: dynamic,
            apply: apply_long_completion
        });
    }

    autocomplete_macros(context)
    {
        let word = context.matchBefore(/\w*/)
        if ( word.from == word.to && !context.explicit )
            return null;

        return {
            from: word.from,
            options: this.macro_completions
        }
    }

    load_schema(schema)
    {
        let template_builder = new TemplateFromSchemaBuilder(schema);
        for ( let name of Object.keys(schema.schema.$defs.layers) )
        {
            if ( !name.endsWith("-layer") )
                continue;

            this.add_schema_completion(template_builder, name, "#/$defs/layers/" + name, {
                op: () => lottie_player.lottie.op ?? 0,
                ip: () => lottie_player.lottie.ip ?? 0,
            });
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

    autocomplete_context(context)
    {
        if ( !this.validation_result )
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
        json_path_from_node(cur.node.cursor(), path, context.state);

        let object_data = descend_validation_path(this.validation_result, path);
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

    extension()
    {
        return CodeMirrorWrapper.autocompletion({override: [
            this.autocomplete_context.bind(this),
            this.autocomplete_macros.bind(this)
        ]})
    }
}

class LottieJsonWorker
{
    constructor()
    {
        this.worker = new Worker("/lottie-docs/scripts/explain_worker.js");
        this.worker.onmessage = this.on_message.bind(this);
        this.listeners = {
            error: data => console.error(data.message)
        }
    }

    update(lottie)
    {
        this.worker.postMessage({type: "update", lottie: lottie});
    }

    on(message, func)
    {
        this.listeners[message] = func;
    }

    on_message(ev)
    {
        if ( ev.data.type in this.listeners )
            this.listeners[ev.data.type](ev.data);
        else
            console.warn("Unknown worker message", ev.data);
    }
}

class LottieJsonEditor
{
    constructor(parent_element, info_box_element, on_lottie_loaded)
    {
        this.schema = null;
        this.lint_errors = [];
        this.decorations = [];
        this.validation_result = null;
        this.clear_info_effect = CodeMirrorWrapper.StateEffect.define();
        this.load_info_effect = CodeMirrorWrapper.StateEffect.define();
        this.update_info_box_tooltip_effect = CodeMirrorWrapper.StateEffect.define();
        this.expression_completions = new ExpressionCompletions();
        this.completions = new LottieCompletions();
        this.lottie = null;
        this.on_lottie_loaded = on_lottie_loaded;

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
                    if ( effect.is(self.update_info_box_tooltip_effect) )
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

        this.view = new CodeMirrorWrapper.EditorView({
            state: CodeMirrorWrapper.EditorState.create({
                extensions: [
                    CodeMirrorWrapper.lintGutter(),
                    ...CodeMirrorWrapper.default_extensions,
                    CodeMirrorWrapper.json(),
                    CodeMirrorWrapper.on_change(this.update_lottie_from_view.bind(this)),
                    this.decoration_field,
                    this.info_box_field,
                    this.completions.extension(),
                    CodeMirrorWrapper.EditorView.domEventHandlers({click: this.on_click.bind(this)}),
                ]
            }),
            parent: parent_element
        });

        this.info_box = new InfoBox(info_box_element);
    }

    begin_load()
    {
        this.lint_errors = [];
        this.decorations = [];
        this.view.dispatch({effects: [this.clear_info_effect.of()]});
    }

    get string_contents()
    {
        return this.view.state.doc.toString();
    }

    end_load(result)
    {
        this.completions.validation_result = result;

        let tree = CodeMirrorWrapper.ensureSyntaxTree(this.view.state, undefined, 2000);
        if ( tree )
        {
            let visitor = new TreeResultVisitor(this);
            visitor.visit(tree.topNode, result, lottie_player.lottie);
            this.lint_errors = visitor.lint_errors;
            this.decorations = visitor.decorations;

            this.get_syntax_errors(tree);
        }
        else
        {
            this.lint_errors = [];
        }

        this.view.dispatch(CodeMirrorWrapper.setDiagnostics(this.view.state, this.lint_errors));

        this.view.dispatch({effects: [this.load_info_effect.of({result: result})]});
    }

    load_error()
    {
        this.end_load(this.completions.validation_result);
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

    hide_info_box_tooltip()
    {
        this.info_box.hide();
        this.view.dispatch({effects: [this.update_info_box_tooltip_effect.of(null)]});
    }

    show_info_box_with_contents(pos, element, data, options = {})
    {
        this.info_box.show(element, data);
        this.show_info_box_tooltip(pos, options);
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
                this.info_box.element.setAttribute("style", "");
                div.appendChild(this.info_box.element);
                div.classList.add("tooltip-info-box");
                return {dom: div};
            }
        }

        this.view.dispatch({effects: [this.update_info_box_tooltip_effect.of(tooltip)]});
    }

    set_schema(schema)
    {
        this.schema = schema;
        this.schema.root = null; // not needed
        this.completions.load_schema(schema);

    }

    on_click(ev, view)
    {
        let pos = view.posAtCoords({x: ev.clientX, y: ev.clientY});
        view.state.field(this.decoration_field).between(pos, pos, (from, to, deco) => {
            if ( deco.spec.info_box )
                deco.spec.info_box(pos)
        });
    }

    update_lottie_from_view()
    {
        var load_ok = true;
        var lottie;
        var json_data = this.string_contents;

        this.begin_load();

        try {
            lottie = JSON.parse(json_data);
        } catch ( json_error ) {
            // Fall back to actual JS notation, which is more forgiving
            try {
                lottie = Function("return " + json_data)();
            } catch(e) {
                load_ok = false;
                this.load_error();
            }
        }

        if ( load_ok )
        {
            this.lottie = lottie;
            this.on_lottie_loaded(lottie);
        }
    }

    undo()
    {
        CodeMirrorWrapper.undo(this.view)
    }

    redo()
    {
        CodeMirrorWrapper.redo(this.view)
    }

    set_content(data)
    {
        this.view.dispatch({
            changes: {from: 0, to: this.view.state.doc.length, insert: data}
        });
    }

}

class PathBasedWidget  extends CodeMirrorWrapper.WidgetType
{
    constructor(editor, path)
    {
        super();
        this.editor = editor;
        this.path_str = path.join(".");
    }

    eq(other)
    {
        return this.path_str == other.path_str;
    }
}

class SchemaTypeWidget extends PathBasedWidget
{
    constructor(editor, path, result, json, pos)
    {
        super(editor, path);
        this.result = result;
        this.lottie = json;
        this.pos = pos;
    }

    show_info_box(pos)
    {
        let box = new InfoBoxContents(null, this.editor.schema);
        box.result_info_box(this.result, this.lottie, this.editor.lottie, false);
        this.editor.show_info_box_with_contents(pos, box.element, box);
    }

    build_dom(show_icon)
    {
        get_validation_links(this.result, this.editor.schema); // updates title

        let span = document.createElement("span");
        span.classList.add("schema-type");
        span.classList.add("info_box_trigger");

        if ( show_icon )
        {
            let icon_class = schema_icons[this.result.def] ?? "fas fa-info-circle";
            let icon = document.createElement("i");
            icon.setAttribute("class", icon_class);
            span.appendChild(icon);
        }

        span.appendChild(document.createTextNode(this.result.title));
        span.addEventListener("click", this.on_click.bind(this));

        return span;
    }

    toDOM()
    {
        return this.build_dom(true);
    }

    on_click()
    {
        this.show_info_box(this.pos);
    }

    ignoreEvent(ev) { return true; }
}


class EditorSchemaWidget extends SchemaTypeWidget
{
    constructor(editor, path, result, json, pos, node)
    {
        super(editor, path, result, json, pos);
        this.from = node.from;
        this.to = node.to;
    }

    update_lines(lines)
    {
        let text = lines.join(indent_at(this.editor.view.state, this.from));

        this.editor.view.dispatch({
            changes: {from: this.from, to: this.to, insert: text}
        });
        this.to = this.from + text.length;
    }

    update_lottie(lottie)
    {
        this.update_lines(JSON.stringify(lottie, undefined, 4).split("\n"));
    }
}

class ColorSchemaWidget extends EditorSchemaWidget
{
    constructor(editor, path, result, json, pos, node)
    {
        super(editor, path, result, json, pos, node);
        this.initial_value = null;
    }

    on_input(ev)
    {
        this.update_lottie(color_hex_to_lottie(ev.target.value));
    }

    show_info_box(pos)
    {
        let box = new InfoBoxContents(null, this.schema);
        box.result_info_box(this.result, this.lottie, lottie_player.lottie, false, true, false);
        var input = box.add("input", null, {type: "color", value: this.initial_value, style: "display: block"});

        input.addEventListener("input", this.on_input.bind(this));

        this.editor.show_info_box_with_contents(pos, box.element, box);
    }

    toDOM()
    {
        let span = this.build_dom(false);
        let color = span.insertBefore(document.createElement("span"), span.firstChild);
        color.classList.add("color-preview");
        this.initial_value = color_lottie_to_hex(this.lottie);
        color.style.background = this.initial_value;
        return span;
    }
}

class KeyframeSchemaWidget extends EditorSchemaWidget
{
    _on_change(lottie)
    {
        this.update_lottie({
            ...this.lottie,
            ...lottie
        });
    }

    show_info_box(pos)
    {
        let box = new InfoBoxContents(null, this.editor.schema);
        box.result_info_box(this.result, this.lottie, this.editor.lottie, false);
        box.element.appendChild(document.createElement("p"))
            .appendChild(document.createElement("strong"))
            .appendChild(document.createTextNode("Transition"));
        box.kf_preview = new KeyframePreviewEditor(box.element, this.lottie, this._on_change.bind(this));
        this.editor.show_info_box_with_contents(pos, box.element, box);
    }
}

class EditExpressionWidget extends PathBasedWidget
{
    constructor(editor, path, node)
    {
        super(editor, path);
        this.from = node.from;
        this.to = node.to;
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

    update_code(expr)
    {
        expr = JSON.stringify(expr);
        this.editor.view.dispatch({
            changes: {from: this.from, to: this.to, insert: expr}
        });
        this.to = this.from + expr.length;
    }

    show_info_box(editor, pos)
    {
        let element = document.createElement("div");

        let title = element.appendChild(document.createElement("strong"));
        let a = title.appendChild(document.createElement("a"));
        a.appendChild(document.createTextNode("Expression"));
        a.setAttribute("href", "/lottie-docs/expressions/");
        title.appendChild(document.createTextNode(" Editor"));

        let expression_editor = new ExpressionEditor(
            element,
            this.editor.expression_completions,
            this.update_code.bind(this)
        );
        let code = JSON.parse(this.editor.view.state.sliceDoc(this.from, this.to));
        expression_editor.set_code(code);

        let line = this.editor.view.state.doc.lineAt(this.from);

        setTimeout(expression_editor.focus.bind(expression_editor), 0);

        this.editor.show_info_box_with_contents(line.from, element, expression_editor, {
            arrow: false,
            above: false,
        });
    }

    ignoreEvent(ev) { return false; }
}

class BezierSchemaWidget extends EditorSchemaWidget
{
    show_info_box(pos)
    {
        let box = new InfoBoxContents(null, this.editor.schema);
        box.result_info_box(this.result, null, null, false, true, false);
        try {
            box.bez_preview = new BezierPreviewEditor(box.element, this.lottie, this.update_lottie.bind(this));
        } catch(e) {}
        this.editor.show_info_box_with_contents(pos, box.element, box);
    }
}

function search_by_json_factory()
{
    function json_search_match(state, cur, value_search)
    {
        return JSON.stringify(JSON.parse(state.sliceDoc(cur.from, cur.to))) === value_search;
    }

    function recursive_json_search(state, cur, path_search, value_search, out, curpath)
    {
        switch ( cur.name )
        {
            case "JsonText":
                if ( cur.firstChild() )
                    recursive_json_search(state, cur, path_search, value_search, out, curpath);
                break;
            case "Object":
                if ( cur.firstChild() )
                {
                    while ( cur.nextSibling() )
                        recursive_json_search(state, cur, path_search, value_search, out, curpath);
                    cur.parent();
                }
                break;
            case "Array":
                if ( cur.firstChild() )
                {
                    let index = 0;
                    while ( cur.nextSibling() && cur.name != "]" )
                    {
                        let path = curpath + "." + index;
                        if ( path.endsWith(path_search) && (value_search === undefined || json_search_match(state, cur, value_search)) )
                            out.push(cur.node);
                        recursive_json_search(state, cur, path_search, value_search, out, path);
                        index++;
                    }
                    cur.parent();
                }
                break;
            case "Property":
                if ( cur.firstChild() )
                {
                    if ( cur.name == "PropertyName" )
                    {
                        let name = JSON.parse(state.sliceDoc(cur.from, cur.to));
                        let path = curpath + "." + name;
                        let matches = path.endsWith(path_search);
                        if ( matches && value_search === undefined )
                            out.push(cur.node);
                        cur.parent();
                        cur.lastChild();
                        if ( matches && value_search !== undefined && json_search_match(state, cur, value_search) )
                            out.push(cur.node);
                        recursive_json_search(state, cur, path_search, value_search, out, path);
                    }
                    cur.parent();
                }
                break;
        }
    }

    function json_search(view, path, value, search_up)
    {
        let tree = CodeMirrorWrapper.ensureSyntaxTree(view.state);
        let norm_path = "." + path.replace("[", ".").replace("]", "");
        let search = value.length ? JSON.stringify(JSON.parse(value)) : undefined;
        let results = [];

        recursive_json_search(view.state, tree.cursor(), norm_path, search, results, "");

        if ( results.length == 0 )
            return;

        let curpos = view.state.selection.ranges[0].head;
        let node;

        if ( search_up )
        {
            results.sort((a, b) => b.to - a.to);

            node = results[0];
            for ( let result of results )
            {
                if ( result.to < curpos )
                {
                    node = result;
                    break;
                }
            }
        }
        else
        {
            results.sort((a, b) => a.from - b.from);

            node = results[0];
            for ( let result of results )
            {
                if ( result.from > curpos )
                {
                    node = result;
                    break;
                }
            }
        }

        view.dispatch({
            selection: {
                anchor: node.from,
                head: node.to,
            },
            scrollIntoView: true
        });
        view.focus();
    }

    function create_panel(view)
    {
        let path_input = document.createElement("input");

        let value_input = document.createElement("input");

        let dom = document.createElement("form");
        dom.classList.add("json-search-panel");
        dom.addEventListener("keydown", (ev) => {
            // Escape
            if (ev.keyCode == 27)
            {
                ev.preventDefault();
                view.dispatch({effects: dialogEffect.of(false)});
                view.focus();
            }
            // Enter
            else if ( ev.keyCode == 13 )
            {
                ev.preventDefault();
                json_search(view, path_input.value, value_input.value);
            }
        });
        dom.addEventListener("submit", (ev) => {
            ev.preventDefault();
            json_search(view, path_input.value, value_input.value);
        });

        let lab = dom.appendChild(document.createElement("label"));
        lab.appendChild(document.createTextNode("Search by JSON "));
        lab.appendChild(path_input);
        dom.appendChild(document.createTextNode(" "));

        lab = dom.appendChild(document.createElement("label"));
        lab.appendChild(document.createTextNode("Value "));
        lab.appendChild(value_input);
        dom.appendChild(document.createTextNode(" "));

        let btn = dom.appendChild(document.createElement("button"));
        btn.setAttribute("class", "btn btn-secondary btn-sm");
        btn.type = "submit";
        btn.title = "Find Next";
        btn.appendChild(document.createElement("i")).setAttribute("class", "fa-solid fa-arrow-down");

        btn = dom.appendChild(document.createElement("button"));
        btn.setAttribute("class", "btn btn-secondary btn-sm");
        btn.title = "Find Previus";
        btn.appendChild(document.createElement("i")).setAttribute("class", "fa-solid fa-arrow-up");
        btn.addEventListener("click", (ev) => {
            ev.preventDefault();
            json_search(view, path_input.value, value_input.value, true);
        });

        return {dom: dom};
    }

    const dialogEffect = CodeMirrorWrapper.StateEffect.define();

    const dialogField = CodeMirrorWrapper.StateField.define({
        create() { return true },
        update(value, tr) {
            for ( let e of tr.effects )
            {
                if ( e.is(dialogEffect) )
                    value = e.value;
            }
            return value
        },
        provide: f => CodeMirrorWrapper.showPanel.from(f, val => val ? create_panel : null)
    });

    function command(view)
    {
        let panel = CodeMirrorWrapper.getPanel(view, create_panel);
        if ( !panel )
        {
            let effects = [dialogEffect.of(true)];
            if ( view.state.field(dialogField, false) == null )
                effects.push(CodeMirrorWrapper.StateEffect.appendConfig.of([dialogField, baseTheme]));
            view.dispatch({effects});
            panel = CodeMirrorWrapper.getPanel(view, create_panel);
        }

        if ( panel )
            panel.dom.querySelector("input").focus();

        return true;
    }

    const baseTheme = CodeMirrorWrapper.EditorView.baseTheme({
        ".cm-panel.json-search-panel": {
            padding: "10px 6px 6px",
        }
    });

    return command;
}

class GradientSchemaWidget extends EditorSchemaWidget
{
    constructor(editor, path, result, json, pos, node, color_count)
    {
        result = {
            ...result,
            title: "Gradient Value",
            cls: "gradient-colors",
            group: "animated-properties",
            description: editor.schema.get_ref_data("#/$defs/animated-properties/gradient-colors").description,
            def: "#/$defs/animated-properties/gradient-colors"
        }
        super(editor, path, result, json, pos, node);
        this.color_count = color_count;
    }

    show_info_box(pos)
    {
        let box = new InfoBoxContents(null, this.editor.schema);
        box.result_info_box(this.result, null, null, false, true, false);
        try {
            box.preview = new GradientPreviewEditor(box.element, this.lottie, this.color_count, this.update_lottie.bind(this));
        } catch(e) {}
        this.editor.show_info_box_with_contents(pos, box.element, box);
    }
}
