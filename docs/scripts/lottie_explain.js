class ValidationResult
{
    constructor()
    {
        this.issues = [];
        this.warnings = [];
        this.items_array = [];
        this.valid = true;
        this.fitness = 0;
        this.children = {};
        this.title = undefined;
        this.type = undefined;
        this.description = undefined;
        this.feature = undefined;
        this.group = undefined;
        this.cls = undefined;
        this.const = undefined;
        this.def = undefined;
        this.key = undefined;
        this.all_properties = {};
        this._links = null;
    }

    get show_warning()
    {
        return this.valid === false || this.warnings.length > 0;
    }

    fail(issue = null)
    {
        this.valid = false;
        if ( issue )
            this.issues.push(issue + ".");
    }

    merge_from(other)
    {
        this.valid = this.valid && other.valid;
        this.fitness += other.fitness;

        for ( let key of ValidationResult.simple_keys )
            if ( !this[key] )
                this[key] = other[key];

        for ( let key of ValidationResult.array_keys )
            this[key] = this[key].concat(other[key]);

        for ( let [key, child] of Object.entries(other.children) )
            this.add_child(key, child);

        this.all_properties = {
            ...this.all_properties,
            ...other.all_properties
        };
    }

    add_child(child_key, child_validation)
    {
        if ( !this.children[child_key] )
            this.children[child_key] = child_validation;
        else
            this.children[child_key].merge_from(child_validation);
    }

    set_key_validation(name, matcher)
    {
        this.key = new ValidationResult(matcher);
        matcher.populate_result(this.key);

        if ( !this.key.title )
            this.key.title = name;
    }
}

ValidationResult.matcher_keys = ["title", "description", "feature", "group", "cls", "def", "type"];
ValidationResult.simple_keys = ValidationResult.matcher_keys.concat("const", "key");
ValidationResult.array_keys = ["issues", "warnings"];


function descend_validation_path(result, path)
{
    let node = result;
    let parents = [node];
    for ( let item of path )
    {
        if ( !(item in node.children) )
            return [];

        node = node.children[item];
        parents.unshift(node);
    }

    return parents;
}

function descend_lottie_path(lottie, path)
{
    let node = lottie;
    for ( let item of path )
    {
        if ( item in node )
            node = node[item];
        else
            return null;
    }

    return node;
}


function get_features_recursive(validation, output, add_layers, add_shapes)
{
    if ( validation.feature )
        output.features.add(validation.feature);

    for ( let [name, child] of Object.entries(validation.children) )
    {
        if ( add_layers && child.def && !output.layers_ref.has(child.def) )
        {
            output.layers_ref.add(child.def);
            output.layers.push(child);
        }
        else if ( add_shapes && child.def && !output.shapes_ref.has(child.def) )
        {
            output.shapes_ref.add(child.def);
            output.shapes.push(child);
        }

        get_features_recursive(child, output, name == "layers", name == "it" || name == "shapes");
    }
}

function get_features(validation)
{
    let output = {
        features: new Set(),
        layers: [],
        layers_ref: new Set(),
        shapes: [],
        shapes_ref: new Set(),
    };

    get_features_recursive(validation, output, false, false);
    return output;
}

function get_validation_links(validation, schema)
{
    if ( validation._links === null )
    {
        if ( validation.cls )
        {
            validation._links = schema.get_links(validation.group, validation.cls, validation.title);
            if ( validation._links.length )
                validation.title = validation._links.map(l => l.name).join(" ");
        }
        else
        {
            validation._links = [];
        }
    }

    return validation._links;
}


class BaseMatcher
{
    constructor(){}
    add_array_item_types(result) {}
}

class SchemaMatcher extends BaseMatcher
{
    constructor(
        schema,
        schema_definition,
        def = null,
        def_path = null
    )
    {
        super();
        this.schema = schema;
        this.schema_start = schema_definition;

        this._built = false;
        this.matchers = [];
        this.bases = [];
        this.properties = [];
        this.title = undefined;
        this.description = undefined;
        this.type = undefined;
        this.feature  = undefined;
        this.const = undefined;
        this.required = new Set();

        this.def = def;
        this.def_path = def_path;
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
        this._build_definition(this.schema_start);
    }

    _build_definition(schema_data)
    {
        for ( let key of SchemaMatcher.simple_keys )
        {
            if ( key in schema_data && this[key] === undefined )
                this[key] = schema_data[key];
        }

        if ( schema_data.required )
            this.required = new Set([...schema_data.required, ...this.required]);

        if ( "$ref" in schema_data )
            this.matchers.push(this.schema.get_ref(schema_data["$ref"]));

        if ( "allOf" in schema_data )
        {
            for ( let sub of schema_data.allOf )
            {
                if ( "$ref" in sub )
                {
                    this.bases.push(this.schema.get_ref(sub["$ref"]));
                }
                else
                {
                    this._build_definition(sub);
                }
            }
        }

        if ( "anyOf" in schema_data )
        {
            for ( let sub of schema_data.anyOf )
                this._build_definition(sub);
        }

        if ( "oneOf" in schema_data )
        {
            this.matchers.push(new OneOfSchemaMatcher(
                this.schema,
                schema_data.oneOf.map(d => new SchemaMatcher(this.schema, d))
            ));
        }

        if ( "properties" in schema_data )
        {
            for ( let [name, data] of Object.entries(schema_data.properties) )
            {
                this.properties.push(new PropertySchemaMatcher(name, schema, data));
            }
        }

        if ( "prefixItems" in schema_data || "items" in schema_data || "minItems" in schema_data || "maxItems" in schema_data )
        {
            this.matchers.push(new ArraySchemaMatcher(this.schema, schema_data));
        }

        if ( schema_data.type )
        {
            this.type = schema_data.type;
            this.norm_type = this._norm_type(schema_data.type);
        }

        if ( schema_data.caniuse )
            this.feature = schema_data.caniuse;

        if ( schema_data.not )
            this.matchers.push(new NotSchemaMatcher(this.schema, schema_data.not));

        if ( schema_data.if )
            this.matchers.push(new ConditionalSchemaMatcher(this.schema, schema_data));
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

    populate_result(result)
    {
        this.build();

        for ( let key of ValidationResult.matcher_keys )
            if ( !result[key] && this[key] )
                result[key] = this[key];

        if ( this.deprecated )
            result.warnings.push("This property is deprecated");
    }

    validate(json_value, result = null, post_populate = false)
    {
        this.build();
        if ( !result )
            result = new ValidationResult(this);

        if ( !post_populate )
            this.populate_result(result);

        if ( this.type )
        {
            var val_type = this._type_of(json_value);
            if ( val_type != this.norm_type )
                result.fail(
                    `Type doesn't match (should be <code>${this.type}</code> instead of <code>${val_type}</code>)`
                );
        }

        if ( this.const !== undefined )
        {
            if ( json_value !== this.const )
            {
                result.fail(`Value should be <code>${JSON.stringify(this.const)}</code>`);
            }
            else
            {
                result.const = result;
                result.fitness += 2;
            }
        }

        for ( let matcher of this.matchers )
            matcher.validate(json_value, result);


        if ( typeof json_value == "object" )
        {
            for ( let req of this.required )
            {
                if ( !(req in json_value) )
                    result.fail(`Missing required property <code>${req}</code>`);
                else
                    result.fitness += 1;
            }

            for ( let matcher of this.properties )
                matcher.validate(json_value, result);
        }

        for ( let other of this.bases )
        {
            other.validate(json_value, result);
        }

        if ( post_populate )
            this.populate_result(result);

        return result;
    }

    add_array_item_types(result)
    {
        this.build();

        if ( this.type || this.def )
        {
            var val = new ValidationResult();
            this.populate_result(val);
            result.items_array.push(val);
        }

        for ( let matcher of this.matchers )
            matcher.add_array_item_types(result);
    }
}

SchemaMatcher.simple_keys = ["title", "description", "deprecated", "const"];

class PropertySchemaMatcher extends BaseMatcher
{
    constructor(property, schema, data)
    {
        super();
        this.property = property;
        this.matcher = new SchemaMatcher(schema, data);
    }

    add_to_all(result)
    {
        result.all_properties[this.property] = {
            title: this.matcher.title,
            description: this.matcher.description,
        };
    }

    validate(object, result)
    {
        if ( typeof object != "object" )
            return;

        if ( !(this.property in object) )
        {
            this.matcher.build();
            this.add_to_all(result);
            return;
        }


        let validation = this.matcher.validate(object[this.property], null, true);
        validation.set_key_validation(this.property, this.matcher);
        result.add_child(this.property, validation);
        this.add_to_all(result);

        if ( !validation.valid )
            result.fail(`Property <code>${this.property}</code> doesn't match`);
        else
            result.fitness += this.property == "ty" ? 4 : 2;
    }
}

class OneOfSchemaMatcher extends BaseMatcher
{
    constructor(schema, definitions)
    {
        super();
        this.schema = schema;
        this.matchers = definitions;
    }

    validate(object, result)
    {
        let best_fitness = -1;
        let best = null;
        let constants = [];

        for ( let match of this.matchers )
        {
            let validation = match.validate(object);
            if ( match.const !== undefined )
                constants.push(match);

            if ( validation.valid )
            {
                best = validation;
                break;
            }

            if ( validation.fitness > best_fitness )
            {
                best_fitness = validation.fitness;
                best = validation;
            }
        }

        if ( best )
        {
            if ( !best.valid && constants.length == this.matchers.length && constants.length )
            {
                result.fail("Possible values:<br/>" +
                    constants.map(match => `<code>${match.const}</code> = ${match.title}`)
                    .join(",<br/>")
                );
            }
            else
                result.merge_from(best);
        }
    }

    add_array_item_types(result)
    {
        for ( let matcher of this.matchers )
            matcher.add_array_item_types(result);
    }
}


class ArraySchemaMatcher extends BaseMatcher
{
    constructor(schema, schema_definition)
    {
        super();
        this.definition = schema_definition;
        this.prefix = [];
        this.items = null;

        if ( "prefixItems" in schema_definition )
            this.prefix = schema_definition.prefixItems.map(item => new SchemaMatcher(schema, item));

        if ( "items" in schema_definition )
            this.items = new SchemaMatcher(schema, schema_definition.items);
    }

    validate(object, result)
    {
        // Error should be set on `type` mismatch
        if ( !Array.isArray(object) )
            return;

        if ( object.length < this.definition.minItems )
            result.fail(`Too few items (<code>${object.length}</code>, should have <code>${this.definition.minItems}</code>)`);

        if ( object.length > this.definition.maxItems )
            result.fail(`Too many items (<code>${object.length}</code>, should have <code>${this.definition.maxItems}</code>)`);

        let i = 0;
        for ( ; i < Math.min(object.length, this.prefix.length); i++ )
        {
            let validation = this.prefix[i].validate(object[i]);
            if ( validation.valid )
            {
                result.fitness += 1;
                result.add_child(i, validation);
            }
            else
            {
                result.fail(`Item <code>${i}</code> doesn't match`);
                if ( this.items )
                {
                    let generic_validation = this.items.validate(object[i]);
                    if ( generic_validation.valid || generic_validation.fitness > result.fitness )
                        result.add_child(i, generic_validation);
                    else
                        result.add_child(i, validation);
                }
            }

            this.prefix[i].add_array_item_types(result);
        }

        if ( this.items )
        {
            for ( ; i < object.length; i++ )
            {
                let validation = this.items.validate(object[i]);
                result.add_child(i, validation);

                if ( validation.valid )
                    result.fitness += 1;
                else
                    result.fail(`Item <code>${i}</code> doesn't match`);
            }

            this.items.add_array_item_types(result);
        }
    }
}

class NotSchemaMatcher extends BaseMatcher
{
    constructor(schema, schema_data)
    {
        super();
        this.wrapped = new SchemaMatcher(schema, schema_data);
    }

    validate(object, result)
    {
        if ( this.wrapped.validate(object).valid )
            result.fail(`Matches <code>not</code> condition.`);
    }
}

class ConditionalSchemaMatcher extends BaseMatcher
{
    constructor(schema, schema_data)
    {
        super();
        this.if = new SchemaMatcher(schema, schema_data.if);
        this.then = schema_data.then ? new SchemaMatcher(schema, schema_data.then) : null;
        this.else = schema_data.else ? new SchemaMatcher(schema, schema_data.else) : null;
    }

    validate(object, result)
    {
        var if_result = this.if.validate(object);
        if ( if_result.valid )
        {
            if ( this.then )
                this.then.validate(object, result);
        }
        else if ( this.else )
        {
            this.else.validate(object, result);
        }
    }
}

class SchemaData
{
    constructor(schema, mapping_data)
    {
        this.schema = schema;
        this.mapping_data = mapping_data;
        this.cache = {};
        this.root = new SchemaMatcher(this, schema);
    }

    get_ref(ref)
    {
        if ( this.cache[ref] )
            return this.cache[ref];

        var path = this.ref_to_path(ref);
        var data = this.walk_schema(this.schema, path);
        var object = new SchemaMatcher(this, data, ref, path);
        this.cache[ref] = object;
        return object;
    }

    get_ref_data(ref)
    {
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

class LottiePreviewGenerator
{
    constructor(group, cls, json, lottie)
    {
        this.group = group;
        this.cls = cls;
        this.json = json;
        this.lottie = lottie;
    }

    generate()
    {
        var generated = null;

        if ( this.cls == "transform" || this.cls == "repeater-transform" )
        {
            generated = this.rect_shape_lottie(this.lottie.w, this.lottie.h);
            generated.layers[0].shapes[0].s.k = [this.lottie.w / 3, this.lottie.h / 3];
            generated.layers[0].shapes.push({
                "ty": "fl",
                "o": {"a": 0, "k": 80},
                "c": {"a": 0, "k": [1, 0, 0]},
            });
            generated.layers[0].ks = this.json;
            generated.layers.push({
                "ip": this.lottie.ip,
                "op": this.lottie.op,
                "st": 0,
                "ks": {},
                "ty": 4,
                "shapes": [
                    generated.layers[0].shapes[0],{
                        "ty": "fl",
                        "o": {"a": 0, "k": 60},
                        "c": {"a": 0, "k": [0.5, 0.2, 0.2]},
                    }

                ]
            });
        }
        else if ( this.group == "animation" && this.cls == "animation" )
        {
            generated = lottie_clone(this.lottie);
        }
        else if ( this.group == "layers" && this.cls != "null-layer" )
        {
            generated = lottie_clone(this.lottie);
            var stand_alone_layer = lottie_clone(this.json);
            delete stand_alone_layer.parent;
            delete stand_alone_layer.tt;
            delete stand_alone_layer.td;
            generated.layers = [stand_alone_layer];
        }
        else if ( this.group == "assets" && this.cls == "precomposition" )
        {
            generated = lottie_clone(this.lottie);
            generated.layers = this.json.layers;
            if ( this.json.fr )
                generated.fr = this.json.fr;
        }
        else if ( this.group == "assets" && this.cls == "image" )
        {
            generated = this.dummy_lottie(this.json.w, this.json.h);
            generated.assets = [this.json];
            generated.layers = [{
                "ip": 0,
                "op": this.lottie.op,
                "st": 0,
                "ks": {},
                "ty": 2,
                "refId": this.json.id
            }];
            generated.nobutton = true;
        }
        else if ( this.group == "shapes" )
        {
            var shape_layer = {
                "ip": this.lottie.ip,
                "op": this.lottie.op,
                "st": 0,
                "ks": {},
                "ty": 4,
                "shapes": []
            };
            if ( this.cls == "group" )
            {
                generated = this.dummy_lottie(this.lottie.w, this.lottie.h);
                generated.layers = [shape_layer];
                shape_layer.shapes = [this.json];
            }
            else if ( ["rectangle", "ellipse", "polystar", "path"].includes(this.cls) )
            {
                generated = this.dummy_lottie(this.lottie.w, this.lottie.h);
                generated.layers = [shape_layer];
                var fill = {
                    "ty": "fl",
                    "o": {"a": 0, "k": 100},
                    "c": {"a": 0, "k": [0, 0, 0]}
                };
                shape_layer.shapes = [this.json, fill];
                generated.auto_fit = true;

            }
            else if ( ["fill", "gradient-fill", "stroke", "gradient-stroke"].includes(this.cls) )
            {
                var w = 96;
                var h = 48;

                if ( this.cls.includes("gradient") )
                    [w, h] = [this.lottie.w, this.lottie.h];

                generated = this.rect_shape_lottie(w, h);
                generated.layers[0].shapes.push(this.json);
                generated.nobutton = true;
            }
        }
        else if ( this.group == "animated-properties" )
        {
            if ( this.cls == "color-value" )
            {
                generated = this.rect_shape_lottie(96, 48);
                generated.layers[0].shapes.push({
                    "ty": "fl",
                    "o": {"a": 0, "k": 100 },
                    "c": this.json
                });
                generated.nobutton = true;
            }
            else if ( this.cls == "gradient-colors"  )
            {
                generated = this.rect_shape_lottie(300, 48);
                generated.layers[0].shapes.push({
                    "ty": "gf",
                    "o": {"a": 0, "k": 100 },
                    "s": {"a":0, "k":[0, 0]},
                    "e": {"a":0, "k":[generated.w, 0]},
                    "t": 1,
                    "g": this.json
                });
                generated.nobutton = true;
            }
            else if ( this.cls == "shape-property" )
            {
                generated = this.bezier_shape_lottie(this.json);
            }
        }
        else if ( this.group == "helpers" )
        {
            if ( this.cls == "color" )
            {
                generated = this.rect_shape_lottie(96, 48);
                generated.layers[0].shapes.push({
                    "ty": "fl",
                    "o": {"a": 0, "k": 100},
                    "c": {"a": 0, "k": this.json},
                });
                generated.nobutton = true;
            }
            else if ( this.cls == "bezier" )
            {
                var prop = {"a": 0, "k": this.json};
                generated = this.bezier_shape_lottie(prop);
            }
            else if ( this.cls == "mask" )
            {
                generated = this.rect_shape_lottie(this.lottie.w, this.lottie.h);
                generated.layers[0].shapes.push({
                    "ty": "fl",
                    "o": {"a": 0, "k": 100},
                    "c": {"a": 0, "k": [0, 0, 0]},
                });
                generated.layers[0].hasMask = true;
                generated.layers[0].masksProperties = [this.json];
            }
        }
        else if ( this.group == "text" )
        {
            var doc = null;
            var fonts = [];
            var svg_style = "";
            var animator = null;

            if ( this.cls == "font" )
            {
                fonts = [this.json];
                doc = {
                    "f": this.json.fName,
                    "fc": [0, 0, 0],
                    "s": 24,
                    "t": "The quick brown fox\rjumps over the lazy dog",
                    "lh": 24 * 1.2,
                    "j": 0
                };
                svg_style = "background: #ffffff;";
            }
            else if ( this.cls == "text-document" )
            {
                doc = this.json;
                fonts = [this.lottie.fonts.list.find(x => x.fName == this.json.f)];
            }
            else if ( this.cls == "text-data-keyframe" )
            {
                doc = this.json.s;
                fonts = [this.lottie.fonts.list.find(x => x.fName == doc.f)];
            }
            else if ( this.cls == "text-animator-data" )
            {
                fonts = this.lottie.fonts.list;
                animator = this.json;
            }

            if ( doc || animator )
            {
                if ( !animator )
                {
                    animator = {
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
                    };
                }

                var [height, font_size] = animator.d.k.map(
                    kf => {
                        var lh = kf.s.lh ?? (1.2 * kf.s.s);
                        return [Math.ceil(lh * ((kf.s.t.match(/\r/g)?.length ?? 0) + 1)), kf.s.s];
                    }
                ).reduce((a, b) => (a < b) ? b : a);

                generated = this.dummy_lottie(300, height);
                generated.fonts = {list: fonts};
                generated.layers = [{
                    "ip": this.lottie.ip,
                    "op": this.lottie.op,
                    "st": 0,
                    "ks": {
                        "p": {"a": 0, "k": [10, font_size]}
                    },
                    "ty": 5,
                    "t": animator
                }];

                generated.svg_style = svg_style;
            }
            else
            {
                generated = null;
            }
        }

        return generated;
    }

    bezier_shape_lottie(shape_prop)
    {
        var lottie_json = this.dummy_lottie(300, 300);
        lottie_json.layers = [{
            "ip": lottie_json.ip,
            "op": lottie_json.op,
            "st": 0,
            "ks": {},
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
        lottie_json.auto_fit = true;

        return lottie_json;
    }

    rect_shape_lottie(w, h)
    {
        var lottie_json = this.dummy_lottie(w, h);
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

    dummy_lottie(w, h)
    {
        return {
            "fr": this.lottie.fr ?? 60,
            "ip": this.lottie.ip ?? 0,
            "op": this.lottie.op ?? 60,
            "w": w,
            "h": h,
            "assets": [],
            "layers": []
        }
    }

}

class InfoBox
{
    constructor(element)
    {
        this.element = element;
        this.contents = null;
        this.lottie_target = this.element.querySelector(".info_box_lottie");
        this.contents_target = this.element.querySelector(".info_box_details");
        this.lottie_player = new LottiePlayer(this.lottie_target, null, false, {viewBoxOnly: false});
        this.btn_center_lottie = this.element.querySelector("#btn_center_lottie");
        this.btn_center_lottie.addEventListener("click", this.on_btn_center.bind(this));
        this.btn_reset_view = this.element.querySelector("#btn_reset_view");
        this.btn_reset_view.addEventListener("click", this.on_btn_reset_view.bind(this));
        this.button_container = this.element.querySelector(".info_box_buttons");
        this.info_box_data = null;
    }

    clear()
    {
        clear_element(this.contents_target);

        this.lottie_player.clear();

        this.lottie_target.style.display = "none";
        this.button_container.style.display = "none";
        this.target = null;
        this.contents = null;
        if ( this.info_box_data && this.info_box_data.destroy )
            this.info_box_data.destroy();
        this.info_box_data = null;
    }

    hide()
    {
        this.clear();
        this.element.style.display = "none";
    }

    show(contents, data)
    {
        this.clear();
        this.contents = contents;
        this.contents_target.appendChild(this.contents);
        this.info_box_data = data;
        this.element.style.display = "block";

        var lottie_json = this.info_box_data.lottie_json;
        if ( lottie_json )
        {
            this.lottie_target.style.display = "block";
            this.button_container.style.display = lottie_json.nobutton ? "none" : "block";
            this.lottie_target.style.width = lottie_json.w + "px";
            this.lottie_target.style.height = lottie_json.h + "px";
            this.lottie_player.lottie = lottie_json;
            this.lottie_player.reload();
            if ( lottie_json.svg_style )
            {
                var svg = this.lottie_target.querySelector("svg");
                svg.setAttribute("style", svg.getAttribute("style") + ";" + lottie_json.svg_style);
            }

            if ( lottie_json.auto_fit )
            {
                $(this.btn_center_lottie).button("toggle");
                this.on_btn_center();
            }
            else
            {
                $(this.btn_reset_view).button("toggle");
            }
        }
    }

    on_btn_center()
    {
        var svg = this.lottie_target.querySelector("svg");
        var lottie = this.contents.info_box_data.lottie_json;
        var bbox = svg.getBBox();
        var pad = 10;
        var new_viewbox = [
            bbox.x - pad,
            bbox.y - pad,
            bbox.width + 2 * pad,
            bbox.height + 2 * pad,
        ];

        svg.setAttribute("viewBox", new_viewbox.join(" "));

        for ( let g of svg.querySelectorAll("svg > g") )
        {
            g.setAttribute("_clip-path", g.getAttribute("clip-path"));
            g.setAttribute("clip-path", "");
        }
    }

    on_btn_reset_view()
    {
        var svg = this.lottie_target.querySelector("svg");
        var lottie = this.info_box_data.lottie_json;
        var new_viewbox = [0, 0, lottie.w, lottie.h];
        svg.setAttribute("viewBox", new_viewbox.join(" "));

        for ( let g of svg.querySelectorAll("svg > g") )
            g.setAttribute("clip-path", g.getAttribute("_clip-path"));
    }
}

class InfoBoxContents
{
    constructor(parent, schema)
    {
        this.element = document.createElement("span");
        this.element.setAttribute("class", "info_box_content");
        if ( parent )
            parent.appendChild(this.element);
        this.element.info_box_data = this;
        this._lottie_json = undefined;
        this.lottie_loader = null;
        this.schema = schema;
    }

    get lottie_json()
    {
        if ( this._lottie_json === undefined && this.lottie_loader )
            this._lottie_json = this.lottie_loader.generate();
        return this._lottie_json;
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

    type_line(result, link_defs)
    {
        if ( result.type || result.def )
        {
            this.add("br");
            this.format_type(result, link_defs);
            return true;
        }
    }

    schema_link(result)
    {
        if ( result.def )
            this.add("a", "View Schema", {class: "schema-link", href: "/lottie-docs/schema/" + result.def});
    }

    result_links_to_element(result, parent)
    {
        var links = get_validation_links(result, this.schema);
        if ( links.length == 0 )
        {
            parent.appendChild(document.createTextNode(result.title ?? "??"));
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

    result_title(result)
    {
        var title = this.element.appendChild(document.createElement("strong"));
        this.result_links_to_element(result, title);
    }

    _format_type_array(result)
    {
        this.add(null, "Array of ");

        for ( var item of result.items_array )
        {
            this.format_type(item);
            this.add(null, ", ");
        }

        if ( result.items_array.length > 0 )
            this.element.removeChild(this.element.lastChild);
        else
            this.add(null, "???");
    }

    format_type(result, link_defs = true)
    {
        if ( link_defs && result.def )
            this.result_links_to_element(result, this.element);
        else if ( result.type == "array" && result.items_array.length )
            this._format_type_array(result, this);
        else
            this.add("code", result.type ?? "???");
    }

    enum_value(validation, value_string)
    {
        var title_val = validation.def || !validation.key ? validation : validation.key;

        this.result_title(title_val);
        this.schema_link(title_val);

        this.type_line(validation, false);

        this.add("br");
        this.add("code", value_string);
        this.add(null, " = ");
        this.add("", validation.const.title);

        this.add("br");
        this.add("", validation.const.description);
    }


    ty_value(object_validation, prop_validation, value_string)
    {
        this.result_title(prop_validation.key);

        this.type_line(prop_validation, false);

        this.add("br");
        this.add("code", value_string);
        this.add(null, " = ");
        this.result_links_to_element(object_validation, this.add("span"));

        this.add("br");
        this.add("", object_validation.description);
    }

    property(validation, prop_validation)
    {
        this.result_title(validation);
        get_validation_links(prop_validation, this.schema);
        get_validation_links(prop_validation.key, this.schema);
        this.add(null, " \u2192 ");
        this.add("strong", prop_validation.key.title);
        this.add("br");
        this.format_type(prop_validation);
        if ( prop_validation.key.description )
        {
            this.add("br");
            this.add("span", prop_validation.key.description, {class: "description"});
        }
    }

    result_info_box(result, json, lottie_json, link_defs = true, show_type = true, show_preview = true)
    {
        this.result_title(result);

        this.schema_link(result);

        if ( show_type )
            this.type_line(result, link_defs);

        if ( result.description )
        {
            this.add("br");
            this.add("span", result.description, {class: "description"});
        }

        if ( show_preview )
            this.lottie_loader = new LottiePreviewGenerator(result.group, result.cls, json, lottie_json);
    }
}


function clear_element(parent)
{
    while ( parent.firstChild )
        parent.removeChild(parent.firstChild);
}

const schema_icons = {
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
    "#/$defs/layers/null-layer": "fas fa-sitemap",

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
    "#/$defs/shapes/repeater-transform": "fas fa-arrows-alt",
    "#/$defs/shapes/shape-list": "fas fa-list",
    "#/$defs/shapes/repeater": "fas fa-clone",

    "#/$defs/text/character-data": "fas fa-font",
    "#/$defs/text/font-list": "fas fa-list",
    "#/$defs/text/font": "fas fa-font",
    "#/$defs/text/text-animator-data": "fas fa-font",
    "#/$defs/text/text-data": "fas fa-running",
    "#/$defs/text/text-document": "far fa-file-alt",
    "#/$defs/text/text-data-keyframe": "fas fa-key",
};


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
                data = {
                    properties: {
                        a: this.prop_schema([0, 0]),
                        p: this.prop_schema([0, 0]),
                        s: this.prop_schema([100, 100]),
                        o: this.prop_schema(100),
                        r: this.prop_schema(0),
                    },
                    required: ["a", "p", "s", "r", "o"]
                }
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
        {
            if ( obj.title === "Opacity" && obj.$ref == "#/$defs/animated-properties/value" )
                this.merge_data(out, this.prop_schema(100));
            else
                this.merge_data(out, this.ref_data(obj.$ref));
        }

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


if ( typeof window == "undefined" && typeof module != "undefined" )
    module.exports = { SchemaData };
