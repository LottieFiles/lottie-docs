disable_toc: 1

Explain my Lottie
=================

<style>
.info_box_trigger {
    display: inline-block;
    border-bottom: 1px dotted black;
    cursor: pointer;
}

.info_box_content, .info_box_lottie {
    display: none;
}

#info_box {
    display: none;
    width: 512px;
    border: 5px solid #555;
    border-radius: 6px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    margin-left: 15px;
/*     opacity: 0; */
/*     transition: opacity 0.3s; */
    background: white;
    color: black;
    font-style: normal;
    word-break: normal;
}


#info_box::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    margin-top: 5px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent #555 transparent transparent;
    margin-left: -15px;
    height: 5px;
}

#info_box .info_box_content{
    display: block;
}

.info_box_lottie {
    max-width: 300px;
    max-height: 300px;
    margin-top: 1.2em;
}

.collapse-button {
    cursor: pointer;
    margin: 0 1ch;
}
.collapser {
    display: inline;
}
.collapser.collapsed {
    display: none;
}


</style>
<details>
    <summary>Upload file</summary>
    <p><input type="file" onchange="lottie_file_input(event);" /></p>
</details>
<details>
    <summary>From URL</summary>
    <p><input type="text" id="input_from_url" /></p>
    <p><button onclick="lottie_url_input(document.getElementById('input_from_url').value)">Explain</button>
</details>
<details>
    <summary>From Input</summary>
    <div class="highlighted-input" style="height: 512px;">
    <textarea autocomplete="off" class="code-input" data-lang="js" data-lottie-input="editor"
    name="json" oninput="syntax_edit_update(this, this.value); syntax_edit_scroll(this); "
    onkeydown="syntax_edit_tab(this, event);" onscroll="syntax_edit_scroll(this);"
    rows="3" spellcheck="false" id="editor_input"></textarea>
    <pre aria-hidden="true"><code class="language-js hljs">
    </code></pre>
    </div>
    <p><button onclick="lottie_string_input(document.getElementById('editor_input').value)">Explain</button>
</details>
<pre><code id="explainer"></code></pre>
<div id="info_box"><div class="info_box_details"></div><div class="info_box_lottie alpha_checkered"></div><div>
<script>
function input_error(e)
{
    console.error(e);
    alert("Could not load input!");
}

function lottie_file_input(ev)
{
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
}

function lottie_url_input(url)
{
    fetch(url).then(
        r => r.json().then(lottie_set_json).catch(input_error)
    ).catch(input_error);
}

function lottie_string_input(string)
{
    try {
        lottie_set_json(JSON.parse(string));
    } catch ( e ) {
        input_error(e);
    }
}

function lottie_set_json(json)
{
    lottie = json;
    while ( parent.firstChild )
        parent.removeChild(parent.firstChild);

    var formatter = new JsonFormatter(parent);
    schema.root.explain(json, formatter);
}

function critical_error(err)
{
    console.error(err);
    alert("Could not load data");
}

class ReferenceLink
{
    constructor(page, anchor, name)
    {
        this.page = page;
        this.anchor = anchor;
        this.name = name;
    }

    to_element()
    {
        var a = document.createElement("a");
        a.setAttribute("href", `/lottie-docs/${this.page}/#${this.anchor}`);
        a.appendChild(document.createTextNode(this.name));
        return a;
    }
}

class SchemaRecursionStop {}

class SchemaData
{
    constructor(schema, mapping_data)
    {
        this.schema = schema;
        this.mapping_data = mapping_data;
        this.cache = {};
        this._root = null;
    }

    get root()
    {
        if ( !this._root )
            this._root = this.get_ref("#/$defs/animation/animation");
        return this._root;
    }

    get_ref(ref)
    {
        if ( this.cache[ref] )
            return this.cache[ref];

        var path = this.ref_to_path(ref);
        var data = this.walk_schema(this.schema, path);
        var object = new SchemaObject(this, data, ref, path);
        this.cache[ref] = object;
        return object;

    }

    get_raw(ref)
    {
        return this.get_ref(ref).object;
    }

    ref_to_path(ref)
    {
        return ref.replace(/^#\//, '').split("/");
    }

    walk_schema(source, path)
    {
        for ( var item of path )
            source = source[item];
        return source;
    }

    get_links(group, cls, title)
    {
        var values = {
            "extra": null,
            "page": group,
            "anchor": cls,
            "name": title,
            "name_prefix": "",
        };

        if ( group == "constants" )
            values["anchor"] = values["anchor"].replace("-", "");

        var mapping_data = this.mapping_data[group];
        if ( mapping_data )
            values = {
                ...values,
                ...(mapping_data._defaults ?? {}),
                ...(mapping_data[cls] ?? {}),
            }

        var links = [];
        if ( values["page"] )
        {
            links.push(new ReferenceLink(
                values["page"], values["anchor"], values["name_prefix"] + values["name"]
            ));
        }

        if ( values["extra"] )
        {
            var extra = values["extra"];
            links.push(new ReferenceLink(
                extra["page"], extra["anchor"], extra["name"],
            ));
        }
        return links;
    }

    /**
     * Calls a callback on every referenced object definition
     *
     * Basically runs through all the $ref and nested definitions,
     * calling \p callback.
     *
     * \param object    Object from the schema dict
     * \param callback  Callback to call
     * \param condition_object Object to check conditions
     */
    resolve_callback(obj, callback, condition_object=undefined)
    {
        if ( !obj )
            return;

        if ( Array.isArray(obj) )
        {
            for ( let sub of obj )
                this.resolve_callback(sub, callback, condition_object);
            return;
        }

        if ( obj["$ref"] )
            this.resolve_callback(this.get_raw(obj["$ref"]), callback, condition_object);

        if ( obj.allOf )
            for ( let val of obj.allOf )
                this.resolve_callback(val, callback, condition_object);

        if ( obj.anyOf )
            for ( let val of obj.anyOf )
                this.resolve_callback(val, callback, condition_object);

        if ( obj.oneOf )
            for ( let val of obj.oneOf )
                this.resolve_callback(val, callback, condition_object);

        if ( obj.if )
        {
            if ( condition_object === undefined )
            {
                this.resolve_callback(obj.then, callback, condition_object);
                this.resolve_callback(obj.else, callback, condition_object);
            }
            else if ( this.validate(condition_object, obj.if) )
            {
                this.resolve_callback(obj.then, callback, condition_object);
            }
            else
            {
                this.resolve_callback(obj.else, callback, condition_object)
            }
        }

        callback(obj);
    }

    find_object(json_object, schema_definitions)
    {
        for ( let def of schema_definitions )
        {
            if ( schema_definitions.properties || schema_definitions.allOf )
            {
                if ( this.validate(json_object, def) )
                    return def;
            }
            else
            {
                if ( def.$ref )
                {
                    var ref = this.get_ref(def.$ref);
                    if ( this.validate(json_object, ref.object) )
                        return ref;
                }

                var look_into = [];
                if ( def.oneOf )
                    look_into = look_into.concat(def.oneOf);
                if ( def.anyOf )
                    look_into = look_into.concat(def.anyOf);
                var found = this.find_object(json_object, look_into);
                if ( found )
                    return found;
            }

            if ( found )
                return found;
        }

        return null;
    }

    _type_of(json_value)
    {
        if ( Array.isArray(json_value) )
            return "array";
        return typeof json_value;
    }

    _norm_type(schema_type)
    {
        if ( schema_type == "integer" )
            return "number";
        return schema_type;
    }

    validate(json_value, def)
    {
        if ( "const" in def )
            return json_value === def.const;

        if ( "type" in def )
        {
            if ( this._type_of(json_value) != this._norm_type(def.type) )
                return false;
        }

        if ( typeof json_value == "object" )
        {
            if ( def.properties )
            {
                for ( let [name, prop] of Object.entries(json_value) )
                {
                    if ( name in def.properties )
                        if ( !this.validate(prop, def.properties[name]) )
                            return false;
                }
            }

            if ( "required" in def )
            {
                for ( let req of def.required )
                    if ( !(req in json_value) )
                        return false;
            }
        }

        if ( def.allOf )
        {
            for ( let base of def.allOf )
                if ( !this.validate(json_value, base) )
                    return false;
        }

        if ( def.$ref )
        {
            if ( !this.validate(json_value, this.get_raw(def.$ref)) )
                return false;
        }

        // leave this last
        if ( def.oneOf )
        {
            for ( let base of def.oneOf )
                if ( this.validate(json_value, base) )
                    return true;
            return false;
        }
        return true;
    }
}

class SchemaProperty
{
    constructor(schema, name)
    {
        this.schema = schema;
        this.name = name;
        this.definitions = [];
    }

    add_definition(schema)
    {
        this.definitions.push(schema);
    }

    find_definition(value)
    {
        for ( var def of this.definitions )
        {
            if ( schema.validate(value, def) )
            {
                var items = [];
                var type;
                var ref;
                function callback(object)
                {
                    if ( object.items )
                        items.push(object.items);
                    if ( object.type )
                        type = object.type;
                    if ( object.$ref )
                        ref = object.$ref;
                }
                this.schema.resolve_callback(def, callback, value);
                return {
                    ...def,
                    _collected: {
                        items: items,
                        type: type,
                        $ref: ref,
                    }
                };
            }
        }

        console.warn(this, value);
        return null;
    }

    _format_type(box, type_data)
    {
        if ( type_data.$ref )
        {
            var links = this.schema.get_ref(type_data.$ref).links;
            for ( var link of links )
            {
                box.element.appendChild(link.to_element());
                box.add(null, " ");
            }
            if ( links.length )
                box.element.removeChild(box.element.lastChild);
            else
                box.add(null, "??");
        }
        else if ( type_data.type == "array" && type_data.items )
        {
            box.add("", "Array of ");
            for ( var item of type_data.items )
            {
                if ( "oneOf" in item )
                {
                    for ( var subitem of item.oneOf )
                    {
                        this._format_type(box, subitem);
                        box.add(null, ", ");
                    }

                }
                else
                {
                    this._format_type(box, item);
                    box.add(null, ", ");
                }
            }

            box.element.removeChild(box.element.lastChild);
        }
        else
        {
            box.add("code", type_data.type);
        }
    }

    populate_info_box(object, definition, box)
    {
        object.info_box_title(box);
        box.add(null, " \u2192 ");
        if ( !definition )
        {
            box.add("strong", this.name);
            return;
        }

        box.add("strong", definition.title ?? this.name);


        if ( definition._collected.type || definition._collected.ref )
        {
            box.add("br");
            this._format_type(box, definition._collected);
        }

        if ( definition.description )
        {
            box.add("br");
            box.add(null, definition.description);
        }
    }

    explain_value(object, definition, value, formatter)
    {
        if ( !definition )
        {
            formatter.write_item(JSON.stringify(value), "comment");
        }
        else if ( Array.isArray(value) )
        {
            this.explain_array(definition, value, formatter);
        }
        else if ( typeof value == "object" )
        {
            if ( value === null )
            {
                formatter.encode_item(value);
            }
            else
            {
                var found = definition ? this.schema.find_object(value, [definition]) : null;
                if ( found )
                    found.explain(value, formatter);
                else
                    formatter.write_item(JSON.stringify(value), "comment");
            }
        }
        else
        {
            var const_description = null;
            function callback(object)
            {
                if ( object.const === value && object.title != definition.title )
                    const_description = object;
            }
            this.schema.resolve_callback(definition, callback.bind(this));

            if ( const_description && (const_description.title || const_description.description) )
            {
                var box = formatter.info_box(JSON.stringify(value), formatter.hljs_type(value));
                box.add("strong", const_description.title ?? value);
                if ( const_description.description )
                {
                    box.add("br");
                    box.add(null, const_description.description);
                }
            }
            else
            {
                formatter.encode_item(value);
            }
        }
    }

    explain_array(definition, value, formatter)
    {
        if ( value.length == 0 )
        {
            formatter.write("[]");
            return;
        }

        var items = definition._collected.items;

        if ( items.length == 0 )
        {
            formatter.write_item(JSON.stringify(value), "comment");
            return;
        }

        formatter.open("[\n");
        for ( var i = 0; i < value.length; i++ )
        {
            formatter.write_indent();

            var found = this.schema.find_object(value[i], items);
            if ( found )
                found.explain(value[i], formatter);
            else
                formatter.write_item(JSON.stringify(value[i]), "comment");

            if ( i != value.length -1 )
                formatter.write(",\n");
            else
                formatter.write("\n");
        }
        formatter.write_indent();
        formatter.close("]");
    }
}

class SchemaObject
{
    constructor(schema, object, ref, path)
    {
        this.schema = schema;
        this.object = object;
        this.ref = ref;
        this.path = path;
        if ( path.length == 3 )
        {
            this.group = path[1];
            this.cls = path[2];
        }
        this._title = this.cls;
        this._description = null;
        this._links = [];
    }

    _collect()
    {
        if ( this._description !== null )
            return;


        this._title = this.cls ?? this.ref;
        this._description = "";
        this.schema.resolve_callback(this.object, this._on_collect_object.bind(this));

        if ( this.cls )
        {
            this._links = this.schema.get_links(this.group, this.cls, this.title);
            if ( this._links.length )
            {
                this._title = this._links.map(l => l.name).join(" ");
            }
        }
    }

    _on_collect_object(obj)
    {
        if ( obj.title )
            this._title = obj.title;

        if ( obj.description )
            this._description = obj.description;
    }

    get title()
    {
        this._collect();
        return this._title;
    }

    get links()
    {
        this._collect();
        return this._links;
    }

    get description()
    {
        this._collect();
        return this._description;
    }

    explain(json, formatter)
    {
        if ( Object.keys(json).length == 0 )
        {
            formatter.write("{");
            this.info_box(json, formatter);
            formatter.write("}");
            return;
        }

        var properties = {};
        function callback(obj)
        {
            if ( obj.properties )
            {
                for ( let [name, val] of Object.entries(obj.properties) )
                {
                    if ( !properties[name] )
                        properties[name] = new SchemaProperty(this.schema, name);
                    properties[name].add_definition(val);
                }
            }
        }
        this.schema.resolve_callback(this.object, callback.bind(this), json);

        formatter.open("{");
        this.info_box(json, formatter);

        var collapse_button = formatter.parent.appendChild(document.createElement("i"));
        collapse_button.setAttribute("class", "collapse-button hljs-comment fas fa-caret-down");
        collapse_button.title = "Collapse object";

        var collapser = formatter.parent.appendChild(document.createElement("span"));
        collapser.classList.add("collapser");
        var container = formatter.set_container(collapser);

        collapse_button.addEventListener("click", ev => {
            collapser.classList.toggle("collapsed");
            collapse_button.classList.toggle("fa-caret-down");
            collapse_button.classList.toggle("fa-ellipsis-h");
        })


        collapser.id = "object_" + (formatter.object_id++);
        formatter.write("\n");

        var entries = Object.entries(json);
        for ( var i = 0; i < entries.length; i++ )
        {
            var name = entries[i][0];
            var value = entries[i][1];
            formatter.write_indent();
            var property = properties[name];
            if ( property )
            {
                var prop_box = formatter.info_box(JSON.stringify(name), "string")
                var def = property.find_definition(value);
                property.populate_info_box(this, def, prop_box);
                formatter.write(": ");
                property.explain_value(this, def, value, formatter);
            }
            else
            {
                formatter.encode_item(name);
                formatter.write(": ");
                formatter.encode_item(value);
            }

            if ( i != entries.length -1 )
                formatter.write(",\n");
            else
                formatter.write("\n");
        }

        formatter.write_indent();
        formatter.set_container(container);
        formatter.close("}");
    }

    info_box(json, formatter)
    {
        var box = formatter.info_box(this.title, "comment", icons[this.ref] ?? "fas fa-info-circle");
        this.info_box_title(box);
        box.add("a", "View Schema", {class: "schema-link", href: "/lottie-docs/schema/" + this.ref});
        box.add("br");
        box.add("span", this.description, {style: "white-space: pre-wrap;"});

        if ( this.group == "animation" && this.cls == "animation" )
        {
            box.lottie_json = lottie_clone(lottie);
        }
        else if ( this.group == "layers" )
        {
            box.lottie_json = lottie_clone(lottie);
            box.lottie_json.layers = [json];
        }
        else if ( this.group == "assets" && this.cls == "precomposition" )
        {
            box.lottie_json = lottie_clone(lottie);
            box.lottie_json.layers = json.layers;
            if ( json.fr )
                box.lottie_json.fr = json.fr;
        }
        else if ( this.group == "assets" && this.cls == "image" )
        {
            box.lottie_json = dummy_lottie(json.w, json.h);
            box.lottie_json.assets = [json];
            box.lottie_json.layers = [{
                "ip": 0,
                "op": 60,
                "st": 0,
                "ks": {},
                "ty": 2,
                "refId": asset.id
            }];
        }
        else if ( this.group == "shapes" )
        {
            var shape_layer = {
                "ip": lottie.ip,
                "op": lottie.op,
                "st": 0,
                "ks": {},
                "ty": 4,
                "shapes": []
            };
            if ( this.cls == "group" )
            {
                box.lottie_json = lottie_clone(lottie);
                box.lottie_json.layers = [shape_layer];
                shape_layer.shapes = [json];
            }
            else if ( ["rectangle", "ellipse", "polystar", "path"].includes(this.cls) )
            {
                box.lottie_json = lottie_clone(lottie);
                box.lottie_json.layers = [shape_layer];
                var fill = {
                    "ty": "fl",
                    "o": {"a": 0, "k": 100},
                    "c": {"a": 0, "k": [0, 0, 0]}
                };
                shape_layer.shapes = [json, fill];

            }
            else if ( ["fill", "gradient-fill", "stroke", "gradient-stroke"].includes(this.cls) )
            {
                if ( this.cls.includes("gradient") )
                    box.lottie_json = dummy_lottie(lottie.w, lottie.h, lottie);
                else
                    box.lottie_json = dummy_lottie(96, 48, lottie);

                box.lottie_json.layers = [shape_layer];
                shape_layer.ip = 0;
                shape_layer.op = box.lottie_json.op;
                shape_layer.shapes = [
                    {
                        "ty": "rc",
                        "p": {"a": 0, "k": [box.lottie_json.w/2, box.lottie_json.h/2]},
                        "s": {"a": 0, "k": [box.lottie_json.w, box.lottie_json.h]},
                        "r": {"a": 0, "k": 0},
                    },
                    json
                ];
            }
        }
        else if ( this.group == "animated-properties" )
        {
            if ( this.cls == "color-value" )
            {
                box.lottie_json = dummy_lottie(96, 48, lottie);
                box.lottie_json.layers = [{
                    "ip": box.lottie_json.ip,
                    "op": box.lottie_json.op,
                    "st": 0,
                    "ks": {},
                    "ty": 4,
                    "shapes": [
                        {
                            "ty": "rc",
                            "p": {"a": 0, "k": [box.lottie_json.w/2, box.lottie_json.h/2]},
                            "s": {"a": 0, "k": [box.lottie_json.w, box.lottie_json.h]},
                            "r": {"a": 0, "k": 0},
                        },
                        {
                            "ty": "fl",
                            "o": {"a": 0, "k": 100 },
                            "c": json
                        }
                    ]
                }];
            }
            else if ( this.cls == "gradient-colors"  )
            {
                box.lottie_json = dummy_lottie(300, 48, lottie);
                box.lottie_json.layers = [{
                    "ip": box.lottie_json.ip,
                    "op": box.lottie_json.op,
                    "st": 0,
                    "ks": {},
                    "ty": 4,
                    "shapes": [
                        {
                            "ty": "rc",
                            "p": {"a": 0, "k": [box.lottie_json.w/2, box.lottie_json.h/2]},
                            "s": {"a": 0, "k": [box.lottie_json.w, box.lottie_json.h]},
                            "r": {"a": 0, "k": 0},
                        },
                        {
                            "ty": "gf",
                            "o": {"a": 0, "k": 100 },
                            "s": {"a":0, "k":[0, 0]},
                            "e": {"a":0, "k":[box.lottie_json.w, 0]},
                            "t": 1,
                            "g": json
                        }
                    ]
                }];
            }
        }
    }

    info_box_title(box)
    {
        var title = box.element.appendChild(document.createElement("strong"));
        var links = this.links;
        if ( links.length == 0 )
        {
            title.appendChild(document.createTextNode(this.title));
        }
        else
        {
            for ( var link of links )
            {
                title.appendChild(link.to_element());
                title.appendChild(document.createTextNode(" "));
            }
        }
    }
}

class JsonFormatter
{
    constructor(element)
    {
        this.element = element;
        this.parent = element;
        this.indent = 0;
        this.object_id = 0;
    }

    set_container(element)
    {
        var old = this.parent;
        this.parent = element;
        return old;
    }

    hljs_type(json_object)
    {
        if ( json_object === null || json_object === true || json_object === false )
            return "literal";
        return typeof json_object;
    }

    encode_item(json_object, hljs_type=null)
    {
        if ( hljs_type === null )
            hljs_type = this.hljs_type(json_object);

        this.write_item(JSON.stringify(json_object), hljs_type);
    }

    write_item(content, hljs_type)
    {
        var span = document.createElement("span");
        span.classList.add("hljs-"+hljs_type);
        span.appendChild(document.createTextNode(content));
        this.parent.appendChild(span);
        return span;
    }

    info_box(content, hljs_type, icon_class=null)
    {
        var wrapper = this.write_item(content, hljs_type);
        wrapper.classList.add("info_box_trigger");
        wrapper.addEventListener("click", e => {info_box.show(wrapper); e.stopPropagation();});

        if ( icon_class )
        {
            var icon = document.createElement("i");
            var after = wrapper.firstChild;
            wrapper.insertBefore(icon, after);
            icon.setAttribute("class", icon_class);
            wrapper.insertBefore(document.createTextNode(" "), after);
        }

        return new InfoBoxContents(wrapper);
    }

    write(str)
    {
        this.parent.appendChild(document.createTextNode(str));
    }

    write_indent()
    {
        this.write("    ".repeat(this.indent));
    }

    open(char)
    {
        this.write(char);
        this.indent += 1;
    }

    close(char)
    {
        this.indent -= 1;
        this.write(char);
    }
}

class InfoBox
{
    constructor(element)
    {
        this.element = element;
        this.target = null;
        this.contents = null;
        this.element.addEventListener("click", e => e.stopPropagation());
        this.lottie_target = this.element.querySelector(".info_box_lottie");
        this.contents_target = this.element.querySelector(".info_box_details");
        this.lottie_player = new LottiePlayer(this.lottie_target, null, false);
    }

    clear()
    {
        if ( this.target )
        {
            this.target.appendChild(this.contents);

            while ( this.contents_target.firstChild )
                this.contents_target.removeChild(this.contents_target.firstChild);

            this.lottie_player.clear();

            this.lottie_target.style.display = "none";
            this.target = null;
            this.contents = null;
        }
    }

    hide()
    {
        this.clear();
        this.element.style.display = "none";
    }

    show(trigger)
    {
        this.clear();
        this.target = trigger;
        this.contents = this.target.querySelector(".info_box_content");
        this.contents_target.appendChild(this.contents);
        this.element.style.display = "block";
        this.element.style.top = (this.target.offsetTop - 5) + "px";
        this.element.style.left = (this.target.offsetLeft + this.target.offsetWidth) + "px";

        var lottie_json = this.contents.info_box_data.lottie_json;
        if ( lottie_json )
        {
            this.lottie_target.style.display = "block";
            this.lottie_target.style.width = lottie_json.w + "px";
            this.lottie_target.style.height = lottie_json.h + "px";
            this.lottie_player.lottie = lottie_json;
            this.lottie_player.reload();
        }
    }
}

class InfoBoxContents
{
    constructor(parent)
    {
        this.element = document.createElement("span");
        this.element.setAttribute("class", "info_box_content");
        parent.appendChild(this.element);
        this.element.info_box_data = this;
        this.lottie_json = null;
    }

    add(tag, text = null, attrs = {})
    {
        var add_to = this.element;
        if ( tag )
        {
            add_to = document.createElement(tag);
            this.element.appendChild(add_to);
            for ( var [n, v] of Object.entries(attrs) )
                add_to.setAttribute(n, v);
        }

        if ( text )
            add_to.appendChild(document.createTextNode(text));

        return add_to;
    }
}

function dummy_lottie(w, h, timing = {})
{
    return {
        "fr": timing.fr ?? 60,
        "ip": timing.ip ?? 0,
        "op": timing.op ?? 60,
        "w": w,
        "h": h,
        "assets": [],
        "layers": []
    }
}

var lottie = null;
var parent = document.getElementById("explainer");
var schema = null;
var info_box = new InfoBox(document.getElementById("info_box"));
var icons = {
    "#/$defs/animated-properties/color-value": "fas fa-palette",
    "#/$defs/animated-properties/gradient-colors": "fas fa-swatchbook",
    //"#/$defs/animated-properties/keyframe-bezier-handle": "fas fa-bezier-curve",
    "#/$defs/animated-properties/keyframe": "fas fa-key",
    "#/$defs/animated-properties/multi-dimensional": "fas fa-running",
    "#/$defs/animated-properties/position-keyframe": "fas fa-key",
    "#/$defs/animated-properties/position": "fas fa-map-marker-alt",
    "#/$defs/animated-properties/shape-keyframe": "fas fa-key",
    "#/$defs/animated-properties/shape-property": "fas fa-bezier-curve",
    "#/$defs/animated-properties/split-vector": "fas fa-map-marker-alt",
    "#/$defs/animated-properties/position-value": "fas fa-running",

    "#/$defs/animation/animation": "fas fa-video",
    "#/$defs/animation/metadata": "fas fa-info-circle",
    "#/$defs/animation/motion-blur": "fas fa-wind",

    "#/$defs/assets/image": "fas fa-file-image",
    "#/$defs/assets/sound": "fas fa-file-audio",
    "#/$defs/assets/precomposition": "fas fa-file-video",

    "#/$defs/helpers/bezier": "fas fa-bezier-curve",
    "#/$defs/helpers/color": "fas fa-palette",
    "#/$defs/helpers/mask": "fas fa-theater-mask",
    "#/$defs/helpers/transform": "fas fa-arrows-alt",

    "#/$defs/layers/shape-layer": "fas fa-shapes",
    "#/$defs/layers/image-layer": "fas fa-image",
    "#/$defs/layers/precomposition-layer": "fas fa-video",
    "#/$defs/layers/solid-color-layer": "fas fa-square-full",
    "#/$defs/layers/text-layer": "fas fa-font",

    "#/$defs/shapes/ellipse": "fas fa-circle",
    "#/$defs/shapes/fill": "fas fa-fill-drip",
    "#/$defs/shapes/gradient-fill": "fas fa-fill-drip",
    "#/$defs/shapes/gradient-stroke": "fas fa-paint-brush",
    "#/$defs/shapes/group": "fas fa-object-group",
    "#/$defs/shapes/path": "fas fa-bezier-curve",
    "#/$defs/shapes/polystar": "fas fa-star",
    "#/$defs/shapes/rectangle": "fas fa-rectangle",
    "#/$defs/shapes/stroke": "fas fa-paint-brush",
    "#/$defs/shapes/transform": "fas fa-arrows-alt",

    "#/$defs/text/character-data": "fas fa-font",
    "#/$defs/text/font-list": "fas fa-list",
    "#/$defs/text/font": "fas fa-font",
    "#/$defs/text/text-document": "far fa-file-alt",
}

var requests = [fetch("/lottie-docs/schema/lottie.schema.json"), fetch("/lottie-docs/schema/docs_mapping.json")]
Promise.all(requests)
.then(responses => {
    Promise.all(responses.map(r => r.json()))
    .then(jsons => { schema = new SchemaData(jsons[0], jsons[1]); })
    .catch(critical_error);
})
.catch(critical_error);

document.body.addEventListener("click", e => info_box.hide());


function quick_test()
{
    if ( !schema )
    {
        setTimeout(quick_test, 0.1);
        return;
    }

    var lottie_json = {
        "fr": 60,
        "ip": 0,
        "op": 60,
        "w": 512,
        "h": 512,
        "ddd": 0,
        "assets": [],
        "markers": [],
        "layers": [
            {
                "ddd": 0,
                "hd": false,
                "ip": 0,
                "op": 60,
                "st": 0,
                "ks": {},
                "ao": 0,
                "hasMask": false,
                "masksProperties": [],
                "ef": [],
                "mb": false,
                "ty": 4,
                "shapes": [
                    {
                        "hd": false,
                        "ty": "el",
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
                                200,
                                200
                            ]
                        }
                    },
                    {
                        "hd": false,
                        "o": {
                            "a": 0,
                            "k": 100
                        },
                        /*
                        "ty": "fl",
                        "c": {
                            "a": 0,
                            "k": [
                                1,
                                0,
                                0
                            ]
                        },*/
                        "ty": "gf",
                        "g": {
                            "p": 2,
                            "k": {
                                "a": 0,
                                "k": [
                                    0,
                                    1,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                ]
                            }
                        },
                        "s": {"a":0, "k":[300, 0]},
                        "e": {"a":0, "k":[400, 0]},
                        "t": 1,
                    }
                ]
            }
        ]
    };
    lottie_set_json(lottie_json);
}

quick_test();

</script>
