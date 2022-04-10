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
    margin-left: 30px;
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

.info_box_content .description {
    white-space: pre-wrap;
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
    var object = new SchemaObject(json);
    schema.root.validate(object, true, true);
    object.explain(formatter);
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

class ValidationResult
{
    static merge_props = ["title", "description", "type"];
    static merge_on_def = ["group", "cls", "def"].concat(ValidationResult.merge_props);

    constructor(
        schema_definition
    )
    {
        this.schema_definition = schema_definition;
        this.valid = null;
        this.penalty = 0;

        this.title = null;
        this.description = null;
        this.group = null;
        this.cls = null;
        this.def = null;
        this.type = null;
        this.items_array = [];
    }

    fail(penalty)
    {
        this.penalty += penalty;
    }

    merge_from(other)
    {
        for ( var prop of ValidationResult.merge_props )
            if ( !this[prop] )
                this[prop] = other[prop];

        if ( !this.def && other.def )
        {
            for ( var prop of ValidationResult.merge_on_def )
                if ( other[prop] )
                    this[prop] = other[prop];
        }


        if ( other.items_array && other.items_array.length )
            this.items_array = this.items_array.concat(other.items_array);

        if ( other.items && other.items instanceof SchemaDefinition )
        {
            other.items.build();

            if ( other.items.type || other.items.ref )
                this.items_array.push(other.items);

            if ( other.items.oneOf )
                this.items_array = this.items_array.concat(other.items.oneOf);

            if ( other.items.anyOf )
                this.items_array = this.items_array.concat(other.items.anyOf);
        }
    }

    info_box_description(box, concise_type)
    {
        if ( this.type || this.def )
        {
            if ( concise_type )
            {
                box.add("br");
                this.format_type(box, concise_type);
            }
            else if ( this.type == "array" && this.items_array )
            {
                box.add("br");
                this._format_type_array(box);
            }
        }

        box.add("br");
        box.add("span", this.description, {class: "description"});
    }

    info_box(json, formatter)
    {
        var box = formatter.info_box(this.title, "comment", icons[this.def] ?? "fas fa-info-circle");
        this.info_box_title(box);
        box.add("a", "View Schema", {class: "schema-link", href: "/lottie-docs/schema/" + this.def});

        this.info_box_description(box, false);

        if ( this.cls == "transform" )
        {
            box.lottie_json = rect_shape_lottie(lottie.w, lottie.h, lottie);
            box.lottie_json.layers[0].shapes[0].s.k = [lottie.w / 3, lottie.h / 3];
            box.lottie_json.layers[0].shapes.push({
                "ty": "fl",
                "o": {"a": 0, "k": 80},
                "c": {"a": 0, "k": [1, 0, 0]},
            });
            box.lottie_json.layers[0].ks = json;
            box.lottie_json.layers.push({
                "ip": lottie.ip,
                "op": lottie.op,
                "st": 0,
                "ks": {},
                "ty": 4,
                "shapes": [
                    box.lottie_json.layers[0].shapes[0],{
                        "ty": "fl",
                        "o": {"a": 0, "k": 60},
                        "c": {"a": 0, "k": [0.5, 0.2, 0.2]},
                    }

                ]
            });
        }
        else if ( this.group == "animation" && this.cls == "animation" )
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
                box.lottie_json = dummy_lottie(lottie.w, lottie.h, lottie);
                box.lottie_json.layers = [shape_layer];
                shape_layer.shapes = [json];
            }
            else if ( ["rectangle", "ellipse", "polystar", "path"].includes(this.cls) )
            {
                box.lottie_json = dummy_lottie(lottie.w, lottie.h, lottie);
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
                var w = 96;
                var h = 48;

                if ( this.cls.includes("gradient") )
                    [w, h] = [lottie.w, lottie.h];

                box.lottie_json = rect_shape_lottie(w, h, lottie);
                box.lottie_json.layers[0].shapes.push(json);
            }
        }
        else if ( this.group == "animated-properties" )
        {
            if ( this.cls == "color-value" )
            {
                box.lottie_json = rect_shape_lottie(96, 48, lottie);
                box.lottie_json.layers[0].shapes.push({
                    "ty": "fl",
                    "o": {"a": 0, "k": 100 },
                    "c": json
                });
            }
            else if ( this.cls == "gradient-colors"  )
            {
                box.lottie_json = rect_shape_lottie(300, 48, lottie);
                box.lottie_json.layers[0].shapes.push({
                    "ty": "gf",
                    "o": {"a": 0, "k": 100 },
                    "s": {"a":0, "k":[0, 0]},
                    "e": {"a":0, "k":[box.lottie_json.w, 0]},
                    "t": 1,
                    "g": json
                });
            }
            else if ( this.cls == "shape-property" )
            {
                box.lottie_json = bezier_shape_lottie(lottie, json);
            }
        }
        else if ( this.group == "helpers" )
        {
            if ( this.cls == "color" )
            {
                box.lottie_json = rect_shape_lottie(96, 48, lottie);
                box.lottie_json.layers[0].shapes.push({
                    "ty": "fl",
                    "o": {"a": 0, "k": 100},
                    "c": {"a": 0, "k": json},
                });
            }
            else if ( this.cls == "bezier" )
            {
                var prop = {"a": 0, "k": json};
                box.lottie_json = bezier_shape_lottie(lottie, prop);
            }
            else if ( this.cls == "mask" )
            {
                box.lottie_json = rect_shape_lottie(lottie.w, lottie.h, lottie);
                box.lottie_json.layers[0].shapes.push({
                    "ty": "fl",
                    "o": {"a": 0, "k": 100},
                    "c": {"a": 0, "k": [0, 0, 0]},
                });
                box.lottie_json.layers[0].hasMask = true;
                box.lottie_json.layers[0].masksProperties = [json];
            }
        }
        else if ( this.group == "text" )
        {
            var doc = null;
            var font = null;
            var bg = null;
            if ( this.cls == "font" )
            {
                font = json;
                doc = {
                    "f": json.fName,
                    "fc": [0, 0, 0],
                    "s": 24,
                    "t": "The quick brown fox\rjumps over the lazy dog",
                    "lh": 24 * 1.2,
                    "j": 0
                };
                bg = "#ffffff";
            }
            else if ( this.cls == "text-document" )
            {
                doc = json;
                font = lottie.fonts.list.find(x => x.fName == json.f);
            }

            if ( doc && font )
            {
                var lh = doc.lh ?? (1.2 * doc.s);
                var height = Math.ceil(lh * ((doc.t.match(/\r/g)?.length ?? 0) + 1));

                box.lottie_json = dummy_lottie(300, height, lottie);
                box.lottie_json.fonts = {list:[font]};
                box.lottie_json.layers = [{
                    "ip": lottie.ip,
                    "op": lottie.op,
                    "st": 0,
                    "ks": {
                        "p": {"a": 0, "k": [10, doc.s]}
                    },
                    "ty": 5,
                    "t": {
                        "a": [],
                        "d": {
                            "k": [
                                {
                                    "s": doc,
                                    "t": 0
                                }
                            ]
                        },
                        "m": {
                            "a": {"a": 0, "k": [0,0]},
                            "g": 3
                        },
                        "p": {}
                    }
                }];

                if ( bg )
                {
                    box.lottie_json.layers.push({
                        "ip": lottie.ip,
                        "op": lottie.op,
                        "st": 0,
                        "ks": {"o": {"a":0, "k": 80}},
                        "ty": 1,
                        "sc": bg,
                        "sh": height,
                        "sw": 300
                    });
                }
            }
        }
    }


    get_links()
    {
        if ( this.cls )
            return this.schema_definition.schema.get_links(this.group, this.cls, this.title);
        return [];
    }

    links_to_element(parent)
    {
        var links = this.get_links();
        if ( links.length == 0 )
        {
            parent.appendChild(document.createTextNode(this.title ?? "??"));
        }
        else
        {
            for ( var link of links )
            {
                parent.appendChild(link.to_element());
                parent.appendChild(document.createTextNode(" "));
            }

            parent.removeChild(parent.lastChild);
        }
    }

    info_box_title(box)
    {
        var title = box.element.appendChild(document.createElement("strong"));
        this.links_to_element(title);
    }

    _format_type_array(box)
    {
        box.add(null, "Array of ");

        for ( var item of this.items_array )
        {
            item.build();
            var val = new ValidationResult(item);
            val.merge_from(item);
            if ( item.ref )
            {
                item.ref.build();
                val.merge_from(item.ref);
            }
            val.format_type(box);
            box.add(null, ", ");
        }

        if ( this.items_array.length > 0 )
            box.element.removeChild(box.element.lastChild);
        else
            box.add(null, "???");
    }

    format_type(box)
    {
        if ( this.def )
            this.links_to_element(box.element);
        else if ( this.type == "array" && this.items_array )
            this._format_type_array(box);
        else
            box.add("code", this.type ?? "???");
    }
}

class SchemaDefinition
{
    constructor(
        schema,
        schema_definition,
        def = null,
        def_path = null,
    )
    {
        this.schema = schema;
        this.schema_definition = schema_definition;
        this.def = def;
        this.def_path = def_path;
        this.steps = []
        this._built = false;
        if ( this.def_path && this.def_path.length == 3 && this.def_path[0] == "$defs" )
        {
            this.group = this.def_path[1];
            this.cls = this.def_path[2];
        }
    }

    build()
    {
        if ( this._built )
            return;
        this._built = true;

        this.title = this.schema_definition.title;
        this.description = this.schema_definition.description;

        if ( this.schema_definition.type )
            this.type = this._norm_type(this.schema_definition.type);
        else
            this.type = null;

        if ( this.schema_definition.properties )
        {
            this.properties = {};
            for ( var [name, prop] of Object.entries(this.schema_definition.properties) )
            {
                var prop = new SchemaDefinition(this.schema, prop);
                this.properties[name] = prop;
            }
        }

        this.ref_anchor = null;
        this.ref = null;
        if ( this.schema_definition.$ref )
        {
            this.ref = this.schema.get_ref(this.schema_definition.$ref);
            this.ref_anchor = this.ref.def;
        }

        for ( var what of ["oneOf", "allOf", "anyOf"] )
        {
            if ( this.schema_definition[what] )
                this[what] = this.schema_definition[what].map(d => new SchemaDefinition(this.schema, d));
        }

        if ( this.schema_definition.not )
            this.not = new SchemaDefinition(this.schema, this.schema_definition.not);

        if ( this.schema_definition.items )
            this.items = new SchemaDefinition(this.schema, this.schema_definition.items);

        if ( this.schema_definition.if )
        {
            this.if = new SchemaDefinition(this.schema, this.schema_definition.if);
            this.then = new SchemaDefinition(this.schema, this.schema_definition.then);
            if ( this.schema_definition.else )
                this.else = new SchemaDefinition(this.schema, this.schema_definition.else);
        }
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

    _sub_validate(object, validation, positive)
    {
        var myvalid = this.validate(object, false, positive);
        if ( positive )
            validation.merge_from(myvalid);
        return myvalid;
    }

    _any_of(object, validation, children, positive)
    {
        var best = null;
        var best_penalty = Infinity;
        for ( let base of children )
        {
            var myvalid = base.validate(object, false, positive);
            if ( myvalid.penalty < best_penalty )
            {
                best_penalty = myvalid.penalty;
                best = myvalid;
            }
        }

        if ( best && positive )
            validation.merge_from(best);

        if ( !best || !best.valid )
            validation.fail(10);

        return best;
    }

    validate(object, add_validation, positive)
    {
        this.build();

        var validation = new ValidationResult(this);
        if ( positive )
            validation.merge_from(this);

        if ( this.type && this._type_of(object.json_value) != this.type )
            validation.fail(100);

        if ( "const" in this.schema_definition && object.json_value !== this.schema_definition.const )
            validation.fail(10);

        if ( object.is_object )
        {
            if ( this.properties )
            {
                for ( let [name, prop] of object.properties )
                {
                    if ( name in this.properties )
                        if ( !this.properties[name].validate(prop, positive, positive).valid )
                            validation.fail(1);
                }
            }

            if ( "required" in this.schema_definition )
            {
                for ( let req of this.schema_definition.required )
                    if ( !(req in object.json_value) )
                        validation.fail(10);
            }
        }
        else if ( object.is_array && this.items )
        {
            for ( var it of object.items )
                if ( !this.items.validate(it, positive, positive).valid )
                    validation.fail(1);
        }

        if ( this.ref )
        {
            var val = this.ref._sub_validate(object, validation, positive);
            validation.fail(val.penalty);
        }

        if ( this.if )
        {
            if ( this.if.validate(object, false, false).valid )
            {
                if ( this.else )
                    this._any_of(object, validation, [this.then, this.else], positive);
                else if ( !this.then._sub_validate(object, validation, positive).valid )
                    validation.fail(20);
            }
            else if ( this.else )
            {
                this._any_of(object, validation, [this.else, this.then], positive);
            }
            else if ( positive )
            {
                this.then._sub_validate(object, validation, positive)
            }
        }

        if ( this.not )
        {
            if ( this.not.validate(object, false, false).valid )
                validation.fail(50);
        }

        if ( this.oneOf )
        {
            // Should succeed only if exactly 1 matches, but we can be more lax
            this._any_of(object, validation, this.oneOf, positive);
        }

        if ( this.anyOf )
        {
            this._any_of(object, validation, this.anyOf, positive);
        }

        if ( this.allOf )
        {
            for ( let base of this.allOf )
            {
                var val = base._sub_validate(object, validation, positive);
                validation.fail(val.penalty);
            }
        }

        validation.valid = validation.penalty == 0;
        if ( add_validation )
            object.validations.push(validation);

        return validation;
    }
}


class SchemaObject
{
    constructor(
        json_value,
        parent=null
    )
    {
        this.json_value = json_value;
        this.parent = parent;
        this.validations = [];
        this.is_array = false;
        this.is_object = false;
        this._validation = null;
        if ( Array.isArray(json_value) )
        {
            this.is_array = true;
            this.items = json_value.map(v => new SchemaObject(v, this));
        }
        else if ( typeof json_value == "object" )
        {
            this.is_object = true;
            this.properties = Object.entries(json_value).map(
                e => [e[0], new SchemaObject(e[1], this)]
            );
        }
    }

    get validation()
    {
        if ( this._validation == null && this.validations.length )
        {
            var best_penalty = Infinity;

            for ( var val of this.validations )
            {
                if ( val.penalty < best_penalty )
                {
                    best_penalty = val.penalty;
                    this._validation = val;
                }
            }
        }

        return this._validation;
    }

    explain(formatter)
    {
        if ( !this.validation )
        {
            formatter.write_item(JSON.stringify(this.json_value), "deletion");
        }
        else if ( this.is_array )
        {
            this.explain_array(formatter);
        }
        else if ( this.is_object )
        {
            this.explain_object(formatter);
        }
        else if ( this.validation.valid )
        {
            formatter.encode_item(this.json_value);
        }
        else
        {
            formatter.write_item(JSON.stringify(this.json_value), "deletion");
        }
    }

    explain_array(formatter)
    {
        if ( this.json_value.length == 0 )
        {
            if ( !this.validation.valid )
                formatter.write_item("[]", "deletion");
            else
                formatter.write("[]");
            return;
        }

        formatter.open("[");
        var container = null;
        if ( this.validation.cls )
        {
            this.validation.info_box(this.json_value, formatter);
            container = formatter.collapser();
        }

        if ( !this.validation.valid )
            formatter.warn_invalid();

        var space = "\n";
        if ( !container && this.json_value.map(x => typeof x != "object").reduce((a, b) => a && b) )
            space = " ";

        if ( space == "\n" )
            formatter.write(space);

        for ( var i = 0; i < this.items.length; i++ )
        {
            if ( space == "\n" )
                formatter.write_indent();

            this.items[i].explain(formatter);

            if ( i != this.items.length -1 )
                formatter.write("," + space);
            else if ( space == "\n" )
                formatter.write(space);
        }

        if ( space == "\n" )
            formatter.write_indent(-1);

        if ( container )
            formatter.set_container(container);

        formatter.close("]");
    }

    explain_object(formatter)
    {
        if ( this.json_value.length == 0 )
        {
            if ( !this.validation.valid )
                formatter.write_item("{}", "deletion");
            else
                formatter.write("{}");
            return;
        }

        formatter.open("{");
        if ( this.validation.cls )
            this.validation.info_box(this.json_value, formatter);

        var container = formatter.collapser();

        if ( !this.validation.valid )
            formatter.warn_invalid();

        formatter.write("\n");

        for ( var i = 0; i < this.properties.length; i++ )
        {
            formatter.write_indent();
            var [name, item] = this.properties[i];

            if ( item.validation )
            {
                var prop_box = formatter.info_box(JSON.stringify(name), "string")
                this.property_info_box(prop_box, name, item);
                formatter.write(": ");
                item.explain(formatter);
            }
            else
            {
                formatter.encode_item(name);
                formatter.write(": ");
                formatter.encode_item(item.json_value, "deletion");
            }

            if ( i != this.properties.length -1 )
                formatter.write(",\n");
            else
                formatter.write("\n");
        }

        formatter.write_indent(-1);
        formatter.set_container(container);
        formatter.close("}");
    }

    property_info_box(box, prop_name, prop_object)
    {
        this.validation.info_box_title(box);
        box.add(null, " \u2192 ");

        box.add("strong", prop_object.validation.title ?? prop_name);

        prop_object.validation.info_box_description(box, true);
    }
}

class SchemaData
{
    constructor(schema, mapping_data)
    {
        this.schema = schema;
        this.mapping_data = mapping_data;
        this.cache = {};
        this.root = new SchemaDefinition(this, schema);
    }

    get_ref(ref)
    {
        if ( this.cache[ref] )
            return this.cache[ref];

        var path = this.ref_to_path(ref);
        var data = this.walk_schema(this.schema, path);
        var object = new SchemaDefinition(this, data, ref, path);
        this.cache[ref] = object;
        return object;
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
        if ( hljs_type == "deletion" )
            span.title = "This value appears to be invalid according to the schema";
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

    write_indent(delta = 0)
    {
        this.write("    ".repeat(this.indent + delta));
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

    collapser()
    {
        var collapse_button = this.parent.appendChild(document.createElement("i"));
        collapse_button.setAttribute("class", "collapse-button hljs-comment fas fa-caret-down");
        collapse_button.title = "Collapse object";

        var collapser = this.parent.appendChild(document.createElement("span"));
        collapser.classList.add("collapser");

        collapse_button.addEventListener("click", ev => {
            collapser.classList.toggle("collapsed");
            collapse_button.classList.toggle("fa-caret-down");
            collapse_button.classList.toggle("fa-ellipsis-h");
        });

        collapser.id = "object_" + (this.object_id++);

        return this.set_container(collapser);
    }

    warn_invalid()
    {
        var icon = this.parent.appendChild(document.createElement("i"));
        icon.setAttribute("class", "schema-invalid fas fa-exclamation-triangle")
        icon.title = "There are some validation issues in this object";
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

function bezier_shape_lottie(timing, shape_prop)
{
    var minx = Infinity;
    var miny = Infinity;
    var maxx = -Infinity;
    var maxy = -Infinity;

    var keyframes = shape_prop.a ? shape_prop.k : [{s: shape_prop.k}];
    for ( var kf of keyframes )
    {
        for ( var i = 0; i < kf.s.v.length; i++ )
        {
            var offsets = [[0, 0], kf.s.i[i], kf.s.o[i]];
            for ( var off of offsets )
            {
                var x = kf.s.v[i][0] + off[0];
                var y = kf.s.v[i][1] + off[1];
                if ( x < minx ) minx = x;
                if ( x > maxx ) maxx = x;
                if ( y < miny ) miny = y;
                if ( y > maxy ) maxy = y;
            }
        }
    }

    var lottie_json = dummy_lottie(maxx - minx, maxy - miny, timing);
    lottie_json.layers = [{
        "ip": lottie_json.ip,
        "op": lottie_json.op,
        "st": 0,
        "ks": {
            "p": {"a": 0, "k": [-minx, -miny]},
        },
        "ty": 4,
        "shapes": [
            {
                "ty": "sh",
                "ks": shape_prop,
            },
            {
                "ty": "fl",
                "o": {"a": 0, "k": 100},
                "c": {"a": 0, "k": [0, 0, 0]},
            }
        ]
    }];

    return lottie_json;
}

function rect_shape_lottie(w, h, timing)
{
    var lottie_json = dummy_lottie(w, h, timing);
    lottie_json.layers = [{
        "ip": lottie_json.ip,
        "op": lottie_json.op,
        "st": 0,
        "ks": {},
        "ty": 4,
        "shapes": [
            {
                "ty": "rc",
                "p": {"a": 0, "k": [lottie_json.w/2, lottie_json.h/2]},
                "s": {"a": 0, "k": [lottie_json.w, lottie_json.h]},
                "r": {"a": 0, "k": 0},
            }
        ]
    }];

    return lottie_json;
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
    "#/$defs/animated-properties/value": "fas fa-running",

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
    "#/$defs/text/text-animator-data": "fas fa-font",
    "#/$defs/text/text-data": "fas fa-running",
    "#/$defs/text/text-document": "far fa-file-alt",
    "#/$defs/text/text-data-keyframe": "fas fa-key",
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
        "meta": {"g":"Test","a":"","k":"","d":123,"tc":"#FFFFFF"},
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
                    /*{
                        "ty": "sh",
                        "ks": {
                            "a": 0,
                            "k": {
                                "v": [
                                    [100, 10],
                                    [190, 100],
                                    [100, 190],
                                    [0, 100],
                                ],
                                "i": [
                                    [0, 0],
                                    [0, 0],
                                    [0, 0],
                                    [0, 0],
                                ],
                                "o": [
                                    [0, 0],
                                    [0, 0],
                                    [0, 0],
                                    [0, 0],
                                ],
                                "c": true
                            }
                        }
                    },*/
                    {
                        "hd": false,
                        "ty": "el",
                        /*"p": {
                            "a": 0,
                            "k": [
                                256,
                                256
                            ]
                        },*/
                        "p": {
                            "a": 1,
                            "k": [
                                {
                                    "t": 0,
                                    "s": [100, 256],
                                    "o": {x: 0.3, y: 0},
                                    "i": {x: 0.7, y: 1},
                                },
                                {
                                    "t": 30,
                                    "s": [300, 256],
                                    "o": {x: [0.3], y: [0]},
                                    "i": {x: [0.7], y: [1]},
                                },
                                {
                                    "t": 60,
                                    "s": [100, 256],
                                    "o": {x: [0.3], y: [0]},
                                    "i": {x: [0.7], y: [1]},
                                }
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
                        "ty": "fl",
                        "c": {
                            "a": 0,
                            "k": [
                                1,
                                0,
                                0
                            ]
                        },
                        /*
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
                        */
                    }
                ]
            }
        ]
    };

    /*lottie_json = {
        "v": "5.5.2",
        "fr": 60,
        "ip": 0,
        "op": 60,
        "w": 512,
        "h": 512,
        "assets": [],
        "fonts": {
            "list": [
                {
                    "ascent": 72,
                    "fFamily": "sans",
                    "fName": "sans-Regular",
                    "fStyle": "Regular",
                    "fPath": "sans"
                }
            ]
        },
        "layers": [
            {
                "ip": 0,
                "op": 60,
                "st": 0,
                "ks": {
                    "p": {"a": 0, "k": [200, 200]}
                },
                "ty": 5,
                "t": {
                    "a": [],
                    "d": {
                        "k": [
                            {
                                "s": {
                                    "f": "sans-Regular",
                                    "fc": [1, 0, 0],
                                    "s": 50,
                                    "t": "Hello",
                                    "j": 0
                                },
                                "t": 0
                            }
                        ]
                    },
                    "m": {
                        "a": {"a": 0, "k": [0,0]},
                        "g": 3
                    },
                    "p": {}
                }
            }
        ]
    };*/
    lottie_set_json(lottie_json);
}

quick_test();

</script>
