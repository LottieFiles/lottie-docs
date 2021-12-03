Contributing
============

JSON Schema
-----------

The schema is split into multiple files for ease of edit/search.

It can be merged into a single file using

    make lottie.schema.json

If you need to make changes to the schema, edit the individual files then
run the merge script to get the final one.

Please use unique naming for `title` property because it's important for auto-generating-type tools.
For example, if you need to auto-convert JSON-Schema into Typescript (TS), the `title` naming will be
utilized for Interface and Type.

Some places in the documentation pull information from the unified schema file
so you will only see them if you merge the files.

Making changes to the merged file is not recommended as it will be overwritten by the script.

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
    control 1
    control 2

The header works the same as with `{lottie:...}` but it's followed by a sequence of controls in the form:

    label:type:path.in[the].json:type-specific arguments...

The `label` is just text shown before the input element

`type` is the type of control, described below.

The JSON path is what you'd use to access the property if you had a javascript object representing the JSON data.

Then follows a `:` list of arguments specific to the given `type`

### `enum`

If the `type` is `enum`, it will show a selection box with enum values pulled from the schema.

At the end it takes the enum name, as you'd pass it to `{schema_enum:...}`

For example:

    {lottie_playground:blend_mode.json:512:512}
    Blend Mode:enum:layers[0].bm:blend-mode

### `slider`

Shows an integer slider between a min and max value.

The arguments are: `min`, `initial_value`, `max`.

Try to set `initial_value` to the value in the JSON.

Example:

    {lottie_playground:blend_mode.json:512:512}
    Opacity:slider:layers[0].ks.o.k:0:50:100
