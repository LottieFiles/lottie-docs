Contributing
============

JSON Schema
-----------

The schema is split into multiple files for ease of edit/search.

It can be merged into a single file using

    make lottie.schema.json

If you need to make changes to the schema, edit the individual files then
run the merge script to get the final one.

Some places in the documentation pull information from the unified schema file
so you will only see them if you merge the files.

Making changes to the merged file is not recommended as it will be overwritten by the script.

Try to keep a single "object" in a single file.

You can also check for errors in the schema with

    make validate


Documentation
-------------

The documentation uses `mkdocs` and is written in Markdown.

There are a few custom markdown extensions used:

## Embedding Lottie animation

Can be done with the following syntax:

    {lottie:filename.json:width:height}

Where `filename.json` points to a JSON file under `docs/examples`.

## Showing Lottie colors

You can use one of these:

    {lottie_color:r,g,b}
    {lottie_color_255:r,g,b}

The first uses components in 0, 1, the other in 0, 255.

It shows an array with the 0,1 values like in lottie and a square with the selected color.

## Matrices

Pretty much just used in the page about the transform.

Splits the following paragraph into a table based on whitespace, with a minimalistic style.


## Enumeration table

You can show a table with the values for an enumeration (taken from the schema):

    {schema_enum:enum-name}

Where `enum-name` is one of the enums defined under `docs/schema/constants`.

You can override the description for individual values:

    {schema_enum:enum-name}
    1: Some Description

Where `1` is one of the values in the enum.

## Schema string

You can pull a string from the schema and into Markdown

    {schema_attribute:attribute_name:path/inside/the/schema}

## Lottie Playground

This is similar to `{lottie:...}` but it's a block instead of being inline.

    {lottie_playground:filename.json:width:height}
    Label 1:<input 1>
    Label 2:<input 2>
    <json>lottie.path.to[object].to.display</json>
    <script>
        lottie.path.to[object].to.modify = data["Label 1"];
    </script>

The header works the same as with `{lottie:...}` but it's followed by a sequence of controls in the form:

    label:input element...

The `label` is just text shown before the input element, the elements are as you would add them in HTML.

There's a shorthand for dropdowns showing enum values (`enum-name` is as you'd pass it to `{schema_enum:...}`):

    <enum>enum-name</enum>

Due to limitation of the parser, the HTML elements must be valid XML.
Also multiline elements are only allowed if the opening tag is in the same line as the label.

You can have a label without input to show a separator.

The `<json>` element contains a JS expression that will be serialized as JSON
and displayed to the user. Usually this would be an object from the lottie structure.

At the end of everything, you can use a `<script>` element to modify the JSON
when the user makes some changes on the HTML inputs. You have access to the following variables:

* `lottie` The Lottie structure as a JS object
* `data` Data from all controls as an object, keys are based on element names or labels
