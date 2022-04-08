disable_toc: 1

Explain my Lottie
=================

<style>
.info_box_trigger {
    position: relative;
    display: inline-block;
    border-bottom: 1px dotted black;
    cursor: pointer;
}

.info_box {
    visibility: hidden;
    width: 512px;
    border: 5px solid #555;
    border-radius: 6px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    top: 0%;
    left: 100%;
    margin-left: 15px;
    opacity: 0;
    transition: opacity 0.3s;
    background: white;
    color: black;
    font-style: normal;
    word-break: normal;
}


.info_box::before {
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

.info_box_trigger.active .info_box {
    visibility: visible;
    opacity: 1;
}
</style>
<div>
    <p><input type="file" onchange="lottie_file_input(event);" /></p>
</div>
<pre><code id="explainer"></code></pre>
<script>
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
                lottie_set_json(JSON.parse(e2.target.result));
            };

            reader.readAsText(file);
            return;
        }
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
    console.warn(err);
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
        if ( !this.cache[ref] )
            this.cache[ref] = new SchemaObject(this, this.get_raw(ref), ref);
        return this.cache[ref];
    }

    get_raw(ref)
    {
        if ( this.cache[ref] )
            return this.cache[ref].object;
        return this.walk_schema(this.schema, this.ref_to_path(ref));
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
     */
    resolve_callback(obj, callback)
    {
        if ( !obj )
            return;

        if ( Array.isArray(obj) )
        {
            for ( let sub of obj )
                this.resolve_callback(sub, callback);
            return;
        }

        if ( obj["$ref"] )
            this.resolve_callback(this.get_raw(obj["$ref"]), callback);

        if ( obj.allOf )
            for ( let val of obj.allOf )
                this.resolve_callback(val, callback);

        if ( obj.anyOf )
            for ( let val of obj.anyOf )
                this.resolve_callback(val, callback);

        if ( obj.oneOf )
            for ( let val of obj.oneOf )
                this.resolve_callback(val, callback);

        if ( obj.if )
        {
            this.resolve_callback(obj.then, callback);
            this.resolve_callback(obj.else, callback);
        }

        callback(obj);
    }

    find_object(json_object, schema_definitions)
    {
        for ( var def of schema_definitions )
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
        if ( "const" in def && json_value === def.const )
            return true;

        if ( "type" in def )
        {
            if ( this._type_of(json_value) != this._norm_type(def.type) )
                return false;
        }

        if ( typeof json_value == "object" )
        {
            if ( def.properties )
            {
                for ( var [name, prop] of Object.entries(json_value) )
                {
                    if ( name in def.properties )
                        if ( !this.validate(prop, def.properties[name]) )
                            return false;
                }
            }

            if ( "required" in def )
            {
                for ( var req of def.required )
                    if ( !(req in json_value) )
                        return false;
            }
        }

        if ( def.allOf )
        {
            for ( var base of def.allOf )
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
            for ( var base of def.oneOf )
                if ( this.validate(json_value, base) )
                    return true;
            return false;
        }
        return true;
    }
}


function info_box_simple(box, title, description)
{
    box.appendChild(document.createElement("strong"))
    .appendChild(document.createTextNode(title));
    if ( description )
    {
        box.appendChild(document.createElement("br"));
        box.appendChild(document.createTextNode(description));
    }
}

class SchemaProperty
{
    constructor(schema, name)
    {
        this.schema = schema;
        this.name = name;
        this.title = null;
        this.description = null;
        this.definitions = [];
    }

    add_definition(schema)
    {
        this.definitions.push(schema);
        if ( schema.title && !this.title )
            this.title = schema.title;
        if ( schema.description && !this.description )
            this.description = schema.description;
    }

    populate_info_box(box)
    {
        info_box_simple(box, this.title ?? this.name, this.description);
    }

    explain_value(object, value, formatter)
    {
        if ( Array.isArray(value) )
        {
            this.explain_array(value, formatter);
        }
        else if ( typeof value == "object" )
        {
            if ( value === null )
            {
                formatter.encode_item(value);
            }
            else
            {
                var found = this.schema.find_object(value, this.definitions);
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
                if ( object.const === value && object.title != this.title )
                    const_description = object;
            }
            this.schema.resolve_callback(this.definitions, callback.bind(this));

            if ( const_description && (const_description.title || const_description.description) )
            {
                var box = formatter.info_box(JSON.stringify(value), formatter.hljs_type(value));
                info_box_simple(box, const_description.title ?? value, const_description.description);
            }
            else
            {
                formatter.encode_item(value);
            }
        }
    }

    explain_array(value, formatter)
    {
        if ( value.length == 0 )
        {
            formatter.write("[]");
            return;
        }

        var items = [];
        var can_be_array = false;
        function callback(object)
        {
            if ( object.type == "array" )
                can_be_array = true;
            if ( object.items )
                items.push(object.items);
        }
        this.schema.resolve_callback(this.definitions, callback);

        if ( !can_be_array || items.length == 0 )
        {
            formatter.write_item(JSON.stringify(value), "comment");
            return;
        }

        items = [items[0].oneOf[4]];
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
        formatter.close("]");
    }
}

class SchemaObject
{
    constructor(schema, object, ref)
    {
        this.schema = schema;
        this.object = object;
        this.ref = ref;
        var match = ref.match(/#\/\$defs\/([a-z]+)\/([a-z]+)/);
        if ( match )
        {
            this.group = match[1];
            this.cls = match[2];
        }
        this.properties = [];
        this._title = this.cls;
        this._description = null;
    }

    _collect()
    {
        if ( this._description !== null )
            return;


        this._title = this.cls ?? this.ref;
        this._description = "";
        this.schema.resolve_callback(this.object, this._on_collect_object.bind(this));
    }

    _on_collect_object(obj)
    {
        if ( obj.properties )
        {
            for ( let [name, val] of Object.entries(obj.properties) )
            {
                if ( !this.properties[name] )
                    this.properties[name] = new SchemaProperty(this.schema, name);
                this.properties[name].add_definition(val);
            }
        }

        if ( obj.title )
            this._title = obj.title;

        if ( obj.description )
            this._description = obj.description;
    }

    get_property(name)
    {
        this._collect();
        return this.properties[name];
    }

    get title()
    {
        this._collect();
        return this._title;
    }

    get description()
    {
        this._collect();
        return this._description;
    }

    get links()
    {
        return this.schema.get_links(this.group, this.cls, this.title);
    }

    explain(json, formatter)
    {
        if ( Object.keys(json).length == 0 )
        {
            formatter.write("{");
            this.info_box(formatter);
            formatter.write("}");
            return;
        }

        formatter.open("{");
        this.info_box(formatter);
        formatter.write("\n");
        var entries = Object.entries(json);
        for ( var i = 0; i < entries.length; i++ )
        {
            var name = entries[i][0];
            var value = entries[i][1];
            formatter.write_indent();
            if ( this.properties[name] )
            {
                var prop_box = formatter.info_box(JSON.stringify(name), "string")
                this.properties[name].populate_info_box(prop_box);
                formatter.write(": ");
                this.properties[name].explain_value(this, value, formatter);
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
        formatter.close("}");
    }

    info_box(formatter)
    {
        var box = formatter.info_box(this.title, "comment", icons[this.ref] ?? "fas fa-info-circle");
        var title = box.appendChild(document.createElement("strong"));
        var links = this.schema.get_links(this.group, this.cls, this.title);
        if ( links.length == 0 )
        {
            title.appendChild(document.createTextNode(this.title));
        }
        else
        {
            for ( var link of links )
            {
                var a = title.appendChild(document.createElement("a"));
                a.setAttribute("href", `/lottie-docs/${link.page}/#${link.anchor}`);
                a.appendChild(document.createTextNode(link.name));
                title.appendChild(document.createTextNode(" "));
            }
        }
        title.appendChild(document.createElement("br"));

        box.appendChild(document.createTextNode(this.description));
    }
}

class JsonFormatter
{
    constructor(element)
    {
        this.parent = element;
        this.indent = 0;
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
        wrapper.addEventListener("click", function(){
            document.querySelectorAll(".info_box_trigger").forEach(
                e => e != wrapper ? e.classList.remove("active") : null
            );
            wrapper.classList.toggle("active");
        });

        if ( icon_class )
        {
            var icon = document.createElement("i");
            var after = wrapper.firstChild;
            wrapper.insertBefore(icon, after);
            icon.setAttribute("class", icon_class);
            wrapper.insertBefore(document.createTextNode(" "), after);
        }

        var box = document.createElement("span");
        box.setAttribute("class", "info_box");
        wrapper.appendChild(box);
        return box;
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
        this.write_indent();
        this.write(char);
    }
}

var lottie = null;
var parent = document.getElementById("explainer");
var schema = null;
var icons = {
    "#/$defs/animation/animation": "fas fa-video",
    "#/$defs/assets/image": "fas fa-file-image",
    "#/$defs/assets/sound": "fas fa-file-audio",
    "#/$defs/assets/precomposition": "fas fa-file-video",
    "#/$defs/layers/shape-layer": "fas fa-shapes",
    "#/$defs/layers/image-layer": "fas fa-image",
    "#/$defs/shapes/group": "fas fa-object-group",
    "#/$defs/shapes/ellipse": "fas fa-circle",
    "#/$defs/shapes/rectangle": "fas fa-rectangle",
    "#/$defs/shapes/polystar": "fas fa-star",
    "#/$defs/shapes/polystar": "fas fa-star",
    "#/$defs/shapes/path": "fas fa-bezier-curve",
    "#/$defs/shapes/path": "fas fa-bezier-curve",
    "#/$defs/shapes/fill": "fas fa-fill-drip",
    "#/$defs/shapes/stroke": "fas fa-paint-brush",
    "#/$defs/shapes/gradient-fill": "fas fa-fill-drip",
    "#/$defs/shapes/gradient-stroke": "fas fa-paint-brush",
    "#/$defs/shapes/transform": "fas fa-arrows-alt",
    "#/$defs/helpers/transform": "fas fa-arrows-alt",
}

var requests = [fetch("/lottie-docs/schema/lottie.schema.json"), fetch("/lottie-docs/schema/docs_mapping.json")]
Promise.all(requests)
.then(responses => {
    Promise.all(responses.map(r => r.json()))
    .then(jsons => { schema = new SchemaData(jsons[0], jsons[1]); })
    .catch(critical_error);
})
.catch(critical_error);


function quick_test()
{
    if ( !schema )
    {
        setTimeout(quick_test, 0.1);
        return;
    }

    lottie_set_json({
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
                                100,
                                100
                            ]
                        }
                    },
                    {
                        "hd": false,
                        "ty": "fl",
                        "o": {
                            "a": 0,
                            "k": 100
                        },
                        "c": {
                            "a": 0,
                            "k": [
                                1,
                                0,
                                0
                            ]
                        }
                    }
                ]
            }
        ]
    });
}
quick_test();

</script>
