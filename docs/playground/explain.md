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
    constructor(anchor, page, name)
    {
        this.page = page;
        this.anchor = anchor;
        this.name = name;
    }
}

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
            this._root = this.get_ref("$defs/animation/animation");
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
}

class SchemaProperty
{
    constructor(name)
    {
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
        box.appendChild(document.createElement("strong"))
        .appendChild(document.createTextNode(this.title ?? this.name));
        if ( this.description )
        {
            box.appendChild(document.createElement("br"));
            box.appendChild(document.createTextNode(this.description));
        }
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
        this._title = null;
        this._description = null;
    }

    _collect()
    {
        if ( this._description !== null )
            return;


        this._title = this.cls ?? this.ref;
        this._description = "";
        this._collect_object(this.object);
    }

    _collect_object(obj)
    {
        if ( !obj )
            return;

        if ( obj["$ref"] )
            this._collect_object(this.schema.get_raw(obj["$ref"]));

        if ( obj.allOf )
            for ( let val of obj.allOf )
                this._collect_object(val);

        if ( obj.if )
        {
            this._collect_object(obj.if);
            this._collect_object(obj.then);
            this._collect_object(obj.else);
        }

        if ( obj.properties )
        {
            for ( let [name, val] of Object.entries(obj.properties) )
            {
                if ( !this.properties[name] )
                    this.properties[name] = new SchemaProperty(name);
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
        formatter.write_indent();
        formatter.open("{ ");
        this.populate_info_box (
            formatter.info_box(this.title, "comment", icons[this.ref] ?? "fas fa-info-circle")
        );
        formatter.write("\n");
        var entries = Object.entries(json);
        for ( var i = 0; i < entries.length; i++ )
        {
            var name = entries[i][0];
            formatter.write_indent();
            if ( this.properties[name] )
            {
                var prop_box = formatter.info_box(JSON.stringify(name), "string")
                this.properties[name].populate_info_box(prop_box);
            }
            else
            {
                formatter.encode(name);
            }

            formatter.write(": ");

            var value = entries[i][1];
            if ( (typeof value == "object" && value !== null) || typeof value == "array" )
                formatter.encode_item("todo", "comment");
            else
                formatter.encode_item(value);


            if ( i != entries.length -1 )
                formatter.write(",\n");
            else
                formatter.write("\n");
        }
        formatter.close("}");
    }

    populate_info_box(box)
    {
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

    encode_item(json_object, hljs_type=null)
    {
        if ( hljs_type === null )
        {
            hljs_type = typeof json_object;
            if ( json_object === null || json_object === true || json_object === false )
                hljs_type = "literal";
        }

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
        this.write(char+"\n");
    }
}

var lottie = null;
var parent = document.getElementById("explainer");
var schema = null;
var icons = {
    "$defs/animation/animation": "fas fa-video",
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
