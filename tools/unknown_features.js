#!/usr/bin/env node

var fs = require("fs");
var explain = require(__dirname + "/../docs/scripts/lottie_explain.js");
var args = process.argv.slice(2);


function get_unknown(path, parent, issues)
{
    var suf = "";
    if ( parent && parent.json_value && parent.json_value.nm )
        suf += " (in " + parent.json_value.nm + ")";
    issues.push(path.join(".") + suf);
}

function get_summary(path, object, parent, issues)
{
    if ( !object.validation )
    {
        get_unknown(path, parent, issues);
    }
    else if ( object.is_array )
    {
        for ( var i = 0; i < object.items.length; i++ )
            get_summary(path.concat(i), object.items[i], object, issues);
    }
    else if ( object.is_object )
    {
        for ( var i = 0; i < object.properties.length; i++ )
        {
            var [name, item] = object.properties[i];
            get_summary(path.concat(name), item, object, issues);
        }
    }
    else if ( !object.validation.valid )
    {
        get_unknown(path, parent, issues);
    }
}


function process_file(file, schema)
{
    var data = fs.readFileSync(file);
    var object = new explain.SchemaObject(JSON.parse(data));
    schema.root.validate(object, true, true);

    var issues = [];
    get_summary([], object, object, issues);

    var indent = "    ";
    console.log(file);

    if ( issues.length == 0 )
    {
        console.log(indent, "OK");
    }
    else
    {
        for ( var issue of issues )
            console.log(indent, issue);
    }

    console.log("");
}


var schema_json = JSON.parse(fs.readFileSync(__dirname + "/../docs/schema/lottie.schema.json"));
var mapping_json = JSON.parse(fs.readFileSync(__dirname + "/../docs/schema/docs_mapping.json"));
var schema = new explain.SchemaData(schema_json, mapping_json);


for ( var arg of args )
    process_file(arg, schema);
