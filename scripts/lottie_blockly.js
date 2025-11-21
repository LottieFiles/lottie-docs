Blockly.defineBlocksWithJsonArray([
{
    "type": "json_object",
    "message0": "{ %1 %2 }",
    "args0": [
        {
            "type": "input_dummy"
        },
        {
            "type": "input_statement",
            "name": "members",
            "check": "object_member",
        }
    ],
    "output": null,
    "colour": 230,
},
{
    "type": "json_statement_adapter",
    "message0": "%1",
    "args0": [
        {
            "type": "input_value",
            "name": "value"
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 190,
},
{
    "type": "json_member",
    "message0": "%1 %2 %3",
    "args0": [
        {
            "type": "field_input",
            "name": "name",
            "text": ""
        },
        {
            "type": "field_label",
            "text": ":"
        },
        {
            "type": "input_value",
            "name": "value"
        }
    ],
    "previousStatement": "object_member",
    "nextStatement": "object_member",
    "colour": 190,
},
{
    "type": "json_array_statements",
    "message0": "[ %1 %2 ]",
    "args0": [
        {
            "type": "input_dummy"
        },
        {
            "type": "input_statement",
            "name": "members",
        }
    ],
    "output": "value",
    "colour": 230,
},
{
    "type": "json_number",
    "message0": "%1",
    "args0": [
        {
        "type": "field_number",
        "name": "value",
        "value": 0
        }
    ],
    "output": "value",
    "colour": 210,
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "json_null",
    "message0": "null",
    "output": "value",
    "colour": 210,
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "json_boolean",
    "message0": "%1",
    "args0": [
        {
            "type": "field_dropdown",
            "name": "value",
            "options": [
                [
                "true",
                "true"
                ],
                [
                "false",
                "false"
                ]
            ]
        }
    ],
    "output": "value",
    "colour": 210,
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "json_text",
    "message0": "\" %1 %2 %3 \"",
    "args0": [
        {
            "type": "input_dummy"
        },
        {
            "type": "field_input",
            "name": "value",
            "text": ""
        },
        {
            "type": "input_dummy"
        }
    ],
    "inputsInline": true,
    "output": "value",
    "colour": 210,
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "lottie_property_static",
    "message0": "Static Property %1",
    "args0": [
        {
            "type": "input_value",
            "name": "value",
            "check": "value"
        }
    ],
    "output": "property",
    "colour": 180,
    "tooltip": "",
    "helpUrl": "/lottie-docs/concepts/#animated-property"
},
{
    "type": "lottie_property_animated",
    "message0": "Animated Property %1",
    "args0": [
        {
            "type": "input_statement",
            "name": "keyframes",
            "check": "keyframe"
        }
    ],
    "output": "property",
    "colour": 180,
    "tooltip": "",
    "helpUrl": "/lottie-docs/concepts/#animated-property"
},
{
    "type": "lottie_property_static_expression",
    "type": "lottie_property_static_expression",
    "message0": "Static Property %1 Expression %2 Index %3",
    "args0": [
        {
            "type": "input_value",
            "name": "value",
            "check": "value"
        },
        {
            "type": "input_value",
            "name": "expression",
            "check": "expression"
        },
        {
            "type": "input_value",
            "name": "index",
            "check": "value"
        }
    ],
    "output": "property",
    "colour": 180,
    "tooltip": "",
    "helpUrl": "/lottie-docs/concepts/#animated-property"
},
{
    "type": "lottie_property_animated_expression",
    "type": "lottie_property_animated_expression",
    "message0": "Animated Property %1 Expression %2 Index %3",
    "args0": [
        {
            "type": "input_statement",
            "name": "keyframes",
            "check": "keyframe"
        },
        {
            "type": "input_value",
            "name": "expression",
            "check": "expression"
        },
        {
            "type": "input_value",
            "name": "index",
            "check": "value"
        }
    ],
    "output": "property",
    "colour": 180,
    "tooltip": "",
    "helpUrl": "/lottie-docs/concepts/#animated-property"
},
{
    "type": "lottie_expression_source",
    "message0": "Expression %1",
    "args0": [
        {
            "type": "field_input",
            "name": "value",
            "text": ""
        }
    ],
    "inputsInline": true,
    "output": "expression",
    "colour": 10,
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "lottie_property_animated",
    "message0": "Animated Property %1",
    "args0": [
        {
            "type": "input_statement",
            "name": "keyframes",
            "check": "keyframe"
        }
    ],
    "output": "property",
    "colour": 180,
    "tooltip": "",
    "helpUrl": "/lottie-docs/concepts/#animated-property"
},
{
    "type": "lottie_keyframe",
    "message0": "Keyframe %1 time %2 %3 easing %4 value %5",
    "args0": [
        {
            "type": "input_dummy"
        },
        {
            "type": "field_number",
            "name": "time",
            "value": 0
        },
        {
            "type": "input_dummy"
        },
        {
            "type": "input_value",
            "name": "easing",
            "check": "easing"
        },
        {
            "type": "input_value",
            "name": "value",
            "check": "value"
        }
    ],
    "previousStatement": "keyframe",
    "nextStatement": "keyframe",
    "colour": 45,
    "tooltip": "",
    "helpUrl": "/lottie-docs/concepts/#keyframe"
},
{
    "type": "lottie_easing",
    "lastDummyAlign0": "RIGHT",
    "message0": "Easing %1 Start %2 %3 %4 End %5 %6",
    "args0": [
        {
            "type": "input_dummy"
        },
        {
            "type": "field_number",
            "name": "ox",
            "value": 0,
            "min": 0,
            "max": 1
        },
        {
            "type": "field_number",
            "name": "oy",
            "value": 0,
            "min": 0,
            "max": 1
        },
        {
            "type": "input_dummy",
            "align": "RIGHT"
        },
        {
            "type": "field_number",
            "name": "ix",
            "value": 1,
            "min": 0,
            "max": 1
        },
        {
            "type": "field_number",
            "name": "iy",
            "value": 1,
            "min": 0,
            "max": 1
        }
    ],
    "output": "easing",
    "colour": 60,
    "tooltip": "",
    "helpUrl": "/lottie-docs/concepts/#keyframe"
},
{
    "type": "lottie_easing_hold",
    "message0": "Hold",
    "args0": [
    ],
    "output": "easing",
    "colour": 60,
    "tooltip": "",
    "helpUrl": "/lottie-docs/concepts/#keyframe"
},
{
    "type": "lottie_vector2d",
    "message0": "x %1 y %2",
    "args0": [
        {
            "type": "field_number",
            "name": "x",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "y",
            "value": 0
        }
    ],
    "output": "value",
    "colour": 0,
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "lottie_vector3d",
    "message0": "x %1 y %2 z %3",
    "args0": [
        {
            "type": "field_number",
            "name": "x",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "y",
            "value": 0
        },
        {
            "type": "field_number",
            "name": "z",
            "value": 0
        }
    ],
    "output": "value",
    "colour": 0,
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "lottie_transform",
    "message0": "Transform %1 Anchor %2 Position %3 Rotation %4 Scale %5 Opacity %6 Skew %7 Skew Angle %8",
    "args0": [
        {
            "type": "input_dummy"
        },
        {
            "type": "input_value",
            "name": "a",
            "check": "property"
        },
        {
            "type": "input_value",
            "name": "p",
            "check": "property"
        },
        {
            "type": "input_value",
            "name": "r",
            "check": "property"
        },
        {
            "type": "input_value",
            "name": "s",
            "check": "property"
        },
        {
            "type": "input_value",
            "name": "o",
            "check": "property"
        },
        {
            "type": "input_value",
            "name": "sk",
            "check": "property"
        },
        {
            "type": "input_value",
            "name": "sa",
            "check": "property"
        }
    ],
    "output": "lottie_transform",
    "colour": 330,
    "tooltip": "Transform",
    "helpUrl": "/lottie-docs/concepts/#transform"
},
{
    "type": "lottie_split_property",
    "message0": "X %1 Y %2 Z %3",
    "args0": [
        {
            "type": "input_value",
            "name": "x",
            "check": "property"
        },
        {
            "type": "input_value",
            "name": "y",
            "check": "property"
        },
        {
            "type": "input_value",
            "name": "z",
            "check": "property"
        },
    ],
    "output": "property",
    "colour": 320,
    "tooltip": "Split Property",
    "helpUrl": "/lottie-docs/concepts/#split-vector"
},
{
    "type": "lottie_angle",
    "message0": "%1",
    "args0": [
        {
            "type": "field_angle",
            "name": "value",
            "angle": 0,
        }
    ],
    "output": "value",
    "colour": 0,
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "lottie_gradient_colors",
    "message0": "Gradient %1 Count %2 %3 Colors %4",
    "args0": [
        {
            "type": "input_dummy"
        },
        {
            "type": "field_number",
            "name": "count",
            "value": 0,
            "min": 0
        },
        {
            "type": "input_dummy"
        },
        {
            "type": "input_value",
            "name": "colors",
            "check": "property"
        }
    ],
    "output": "lottie_gradient_colors",
    "colour": 250,
    "tooltip": "",
    "helpUrl": ""
},
/*{
    "type": "lottie_gradient_value",
    "message0": "Gradient %1 %2",
    "args0": [
        {
            "type": "input_dummy"
        },
        {
            "type": "input_statement",
            "name": "colors",
            "check": "gradient_stop"
        }
    ],
    "inputsInline": false,
    "output": "property",
    "colour": 320,
    "tooltip": "",
    "helpUrl": "/lottie-docs/shapes/#gradients"
},
{
    "type": "lottie_gradient_stop",
    "message0": "Gradient Stop %1 Offset %2 %3 Color %4 Alpha %5",
    "args0": [
        {
            "type": "input_dummy"
        },
        {
            "type": "field_number",
            "name": "offset",
            "value": 0,
            "min": 0,
            "max": 1
        },
        {
            "type": "input_dummy"
        },
        {
            "type": "input_value",
            "name": "color",
            "check": "value"
        },
        {
            "type": "input_value",
            "name": "alpha",
            "check": "value"
        }
    ],
    "previousStatement": "gradient_stop",
    "nextStatement": "gradient_stop",
    "colour": 190,
    "tooltip": "",
    "helpUrl": "/lottie-docs/shapes/#gradients"
}*/
{
    "type": "expression_number",
    "message0": "%1",
    "args0": [
        {
            "type": "field_number",
            "name": "value",
            "value": 0
        }
    ],
    "output": "x_value",
    "colour": 230,
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "expression_variable",
    "message0": "%1",
    "args0": [
        {
            "type": "field_input",
            "name": "name",
            "text": "varname"
        }
    ],
    "output": ["x_value", "x_variable"],
    "colour": 315,
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "expression_variable_definition",
    "message0": "var %1 = %2",
    "args0": [
        {
            "type": "field_input",
            "name": "name",
            "text": "varname"
        },
        {
            "type": "input_value",
            "name": "value",
            "check": "x_value",
        }
    ],
    "previousStatement": "x_stetement",
    "nextStatement": "x_stetement",
    "colour": 315,
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "expression_assign",
    "message0": "%1 = %2 %3",
    "args0": [
        {
            "type": "input_value",
            "name": "variable",
            "check": "x_variable"
        },
        {
            "type": "input_dummy"
        },
        {
            "type": "input_value",
            "name": "value",
            "check": "x_value",
        }
    ],
    "inputsInline": true,
    "previousStatement": "x_statement",
    "nextStatement": "x_statement",
    "colour": 10,
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "expression_var_bm_ret",
    "message0": "%1",
    "args0": [
        {
            "type": "field_label_serializable",
            "name": "name",
            "text": "$bm_rt"
        }
    ],
    "output": [
        "x_value",
        "x_variable",
    ],
    "colour": 315,
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "expression_var_time",
    "message0": "%1",
    "args0": [
        {
            "type": "field_label_serializable",
            "name": "name",
            "text": "time"
        }
    ],
    "output": "x_value",
    "colour": 315,
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "expression_fn_bm_isinstanceofarray",
    "message0": "%1 ( %2 )",
    "args0": [
        {
            "type": "field_label_serializable",
            "name": "name",
            "text": "$bm_isInstanceOfArray"
        },
        {
            "type": "input_value",
            "name": "ARG0",
            "check": "x_value"
        }
    ],
    "output": "x_value",
    "colour": 290,
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "expression_statements",
    "message0": "%1",
    "args0": [
        {
            "type": "input_statement",
            "name": "statements",
            "check": "x_statement"
        }
    ],
    "output": "expression",
    "colour": 10,
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "expression_fn_mul",
    "message0": "%1 ( %2 , %3 )",
    "args0": [
        {
            "type": "field_label_serializable",
            "name": "name",
            "text": "$bm_mul"
        },
        {
            "type": "input_value",
            "name": "ARG0",
            "check": "x_value"
        },
        {
            "type": "input_value",
            "name": "ARG1",
            "check": "x_value"
        }
    ],
    "output": "x_value",
    "colour": 260,
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "expression_statement_expression",
    "message0": "%1",
    "args0": [
        {
            "type": "input_statement",
            "name": "value",
            "check": "x_value"
        }
    ],
    "previousStatement": "x_statement",
    "nextStatement": "x_statement",
    "colour": 10,
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "expression_fn_div",
    "message0": "%1 ( %2 , %3 )",
    "args0": [
        {
            "type": "field_label_serializable",
            "name": "name",
            "text": "$bm_div"
        },
        {
            "type": "input_value",
            "name": "ARG0",
            "check": "x_value"
        },
        {
            "type": "input_value",
            "name": "ARG1",
            "check": "x_value"
        }
    ],
    "output": "x_value",
    "colour": 260,
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "expression_fn_sum",
    "message0": "%1 ( %2 , %3 )",
    "args0": [
        {
            "type": "field_label_serializable",
            "name": "name",
            "text": "$bm_sum"
        },
        {
            "type": "input_value",
            "name": "ARG0",
            "check": "x_value"
        },
        {
            "type": "input_value",
            "name": "ARG1",
            "check": "x_value"
        }
    ],
    "output": "x_value",
    "colour": 260,
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "expression_fn_sub",
    "message0": "%1 ( %2 , %3 )",
    "args0": [
        {
            "type": "field_label_serializable",
            "name": "name",
            "text": "$bm_sub"
        },
        {
            "type": "input_value",
            "name": "ARG0",
            "check": "x_value"
        },
        {
            "type": "input_value",
            "name": "ARG1",
            "check": "x_value"
        }
    ],
    "output": "x_value",
    "colour": 260,
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "expression_fn_mod",
    "message0": "%1 ( %2 , %3 )",
    "args0": [
        {
            "type": "field_label_serializable",
            "name": "name",
            "text": "$bm_mod"
        },
        {
            "type": "input_value",
            "name": "ARG0",
            "check": "x_value"
        },
        {
            "type": "input_value",
            "name": "ARG1",
            "check": "x_value"
        }
    ],
    "output": "x_value",
    "colour": 260,
    "tooltip": "",
    "helpUrl": ""
},
]);

const BlocklyArrayBase = {
    init: function()
    {
        this.itemCount_ = 0;
        this.updateShape_();
    },
    mutationToDom: function()
    {
        var container = Blockly.utils.xml.createElement('mutation');
        container.setAttribute('items', this.itemCount_);
        return container;
    },
    domToMutation: function(xmlElement)
    {
        this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
        this.updateShape_();
    },
    saveConnections: function(containerBlock)
    {
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        var i = 0;
        while (itemBlock)
        {
            var input = this.getInput('ADD' + i);
            itemBlock.valueConnection_ = input && input.connection.targetConnection;
            i++;
            itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
        }
    },
    add_input: function(index)
    {
        var input = this.appendValueInput('ADD' + index)
            .setAlign(Blockly.ALIGN_RIGHT);
        return input;
    },
    updateShape_: function()
    {
        // Add new inputs.
        for ( var i = 0; i < this.itemCount_; i++ )
        {
            if ( !this.getInput('ADD' + i) )
                this.add_input(i);
        }

        var input;
        // Remove deleted inputs.
        while ( input = this.getInput('ADD' + i) )
        {
            if ( input.connection.isConnected() )
                input.connection.disconnect();
            this.removeInput('ADD' + i);
            i++;
        }

        this.add_input(this.itemCount_);
    },
    onchange: function(ev)
    {
        if ( ev instanceof Blockly.Events.Move )
        {
            if ( ev.newParentId == this.id || ev.oldParentId == this.id )
            {
                if ( this.getInput("ADD" + this.itemCount_).connection.isConnected() )
                {
                    this.itemCount_ += 1;
                    this.updateShape_();
                }
                else
                {
                    while ( this.itemCount_ > 0 )
                    {
                        var name = 'ADD' + (this.itemCount_ - 1);
                        var input = this.getInput(name);
                        if ( input && input.connection.isConnected() && name != ev.oldInputName )
                            break;
                        this.itemCount_ -= 1;
                    }
                    this.updateShape_();
                }
            }
        }
    },
};

Blockly.Blocks["json_array"] = {
    ...BlocklyArrayBase,
    init: function()
    {
        this.appendDummyInput().appendField("[");
        this.appendDummyInput("close").appendField("]");

        this.setInputsInline(false);
        this.setColour(230);
        this.setOutput(true, 'value');
        BlocklyArrayBase.init.bind(this)();
    },
    updateShape_: function()
    {
        this.removeInput("close");
        BlocklyArrayBase.updateShape_.bind(this)();
        this.appendDummyInput("close").appendField("]");
    }
};


Blockly.Blocks["lottie_color"] = {
    init: function()
    {
        this.appendDummyInput()
            .appendField(new Blockly.FieldColour("#000000"), "value");
        this.appendDummyInput()
            .appendField("R")
            .appendField(new Blockly.FieldNumber(0, 0, 1), "red");
        this.appendDummyInput()
            .appendField("G")
            .appendField(new Blockly.FieldNumber(0, 0, 1), "green");
        this.appendDummyInput()
            .appendField("B")
            .appendField(new Blockly.FieldNumber(0, 0, 1), "blue");

        this.setInputsInline(false);
        this.setColour(0);
        this.setOutput(true, 'value');
        this.setHelpUrl("/lottie-docs/concepts/#colors");
    },
    onchange: function(ev)
    {
        if ( (ev instanceof Blockly.Events.BlockChange) && ev.blockId == this.id && ev.element == "field" )
        {
            if ( ev.name == "value" )
            {
                var color = this.getFieldValue("value");
                var offset = 1;
                for ( var field_name of ["red", "green", "blue"] )
                {
                    var value = parseInt(color.substr(offset, 2), 16)
                    offset += 2;
                    var field = this.getField(field_name);
                    if ( value != Math.round(field.getValue() * 255) )
                        field.setValue(value / 255);
                }
            }
            else
            {
                var rgb = '#';
                for ( var field_name of ["red", "green", "blue"] )
                {
                    var field = this.getField(field_name);
                    var value = Math.round(field.getValue() * 255);
                    rgb += value.toString(16).padStart(2, '0');
                }
                var field =  this.getField("value");
                if ( rgb != field.getValue() )
                    field.setValue(rgb);
            }

        }
    },
};

Blockly.Blocks["lottie_color_rgba"] = {
    init: function()
    {
        Blockly.Blocks["lottie_color"].init.bind(this)();
        this.appendDummyInput()
            .appendField("A")
            .appendField(new Blockly.FieldNumber(1, 0, 1), "alpha");
    },
    onchange: Blockly.Blocks["lottie_color"].onchange,
}

Blockly.FieldAngle.CLOCKWISE = true;
Blockly.FieldAngle.OFFSET = 90;
Blockly.FieldAngle.prototype.wrapValue_ = function(value) { return value; }


const lottie_toolbox = generated_toolbox;

lottie_toolbox["contents"].push({
    "kind": "category",
    "name": "Properties",
    "colour": 180,
    "contents": [
        {"kind": "block", "type": "lottie_property_static"},
        {"kind": "block", "type": "lottie_property_animated"},
        {"kind": "block", "type": "lottie_keyframe", "blockxml": `
            <block type="lottie_keyframe">
                <value name="easing">
                    <shadow type="lottie_easing"></shadow>
                </value>
            </block>
        `},
        {"kind": "block", "type": "lottie_easing"},
        {"kind": "block", "type": "lottie_easing_hold"},
        {"kind": "block", "type": "lottie_color"},
        {"kind": "block", "type": "lottie_color_rgba"},
        {"kind": "block", "type": "lottie_vector2d"},
        {"kind": "block", "type": "lottie_vector3d"},
        {"kind": "block", "type": "json_number"},
        {"kind": "block", "type": "lottie_angle"},
        {"kind": "block", "type": "lottie_transform"},
        {"kind": "block", "type": "lottie_split_property"},
        {"kind": "block", "type": "lottie_gradient_colors"},
        /*{"kind": "block", "type": "lottie_gradient_value", "blockxml": `
            <block type="lottie_gradient_value">
                <statement name="colors">
                    <block type="lottie_gradient_stop">
                        <field name="offset">0</field>
                        <value name="color">
                            <shadow type="lottie_color">
                                <field name="red">0</field>
                                <field name="green">0</field>
                                <field name="blue">0</field>
                            </shadow>
                        </value>
                        <next>
                            <block type="lottie_gradient_stop">
                                <field name="offset">1</field>
                                <value name="color">
                                    <shadow type="lottie_color">
                                        <field name="red">0</field>
                                        <field name="green">0</field>
                                        <field name="blue">0</field>
                                    </shadow>
                                </value>
                            </block>
                        </next>
                    </block>
                </value>
            </block>
        `},
        {"kind": "block", "type": "lottie_gradient_stop", "blockxml": `
            <block type="lottie_gradient_stop">
                <value name="color">
                    <shadow type="lottie_color">
                        <field name="red">0</field>
                        <field name="green">0</field>
                        <field name="blue">0</field>
                    </shadow>
                </value>
            </block>
        `}*/,
    ]
});
lottie_toolbox["contents"].push(
    {
        "kind": "category",
        "name": "JSON",
        "colour": 230,
        "contents": [
            {"kind": "block", "type": "json_object"},
            {"kind": "block", "type": "json_member"},
            {"kind": "block", "type": "json_array"},
            {"kind": "block", "type": "json_array_statements"},
            {"kind": "block", "type": "json_statement_adapter"},
            {"kind": "block", "type": "json_number"},
            {"kind": "block", "type": "json_text"},
            {"kind": "block", "type": "json_boolean"},
            {"kind": "block", "type": "json_null"},
        ]
    }
);
lottie_toolbox["contents"].push({
    "kind": "category",
    "name": "Expressions",
    "colour": 10,
    "contents": [
        {
            "kind": "category",
            "name": "Properties",
            "colour": 180,
            "contents": [
                {"kind": "block", "type": "lottie_property_static_expression", "blockxml": `
                    <block type="lottie_property_static_expression">
                        <value name="expression">
                            <block type="expression_statements"></block>
                        </value>
                    </block>
                `},
                {"kind": "block", "type": "lottie_property_animated_expression", "blockxml": `
                    <block type="lottie_property_animated_expression">
                        <value name="expression">
                            <block type="expression_statements"></block>
                        </value>
                    </block>
                `},
                {"kind": "block", "type": "lottie_expression_source"},
                {"kind": "block", "type": "expression_statements"},
            ]
        },
        {
            "kind": "category",
            "name": "Statements",
            "colour": 60,
            "contents": [
                {"kind": "block", "type": "expression_statement_expression"},
                {"kind": "block", "type": "expression_variable_definition"},
                {"kind": "block", "type": "expression_assign"},
            ]
        },
        {
            "kind": "category",
            "name": "Values",
            "colour": 230,
            "contents": [
                {"kind": "block", "type": "expression_number"},
                {"kind": "block", "type": "expression_variable"},
            ]
        },
        {
            "kind": "category",
            "name": "Variables",
            "colour": 315,
            "contents": [
                {"kind": "block", "type": "expression_variable_definition"},
                {"kind": "block", "type": "expression_variable"},
                {"kind": "block", "type": "expression_assign"},
                {"kind": "block", "type": "expression_var_bm_ret"},
                {"kind": "block", "type": "expression_var_time"},
            ]
        },
        {
            "kind": "category",
            "name": "Functions",
            "colour": 290,
            "contents": [
                {"kind": "block", "type": "expression_fn_sum"},
                {"kind": "block", "type": "expression_fn_sub"},
                {"kind": "block", "type": "expression_fn_mul"},
                {"kind": "block", "type": "expression_fn_div"},
                {"kind": "block", "type": "expression_fn_mod"},
                {"kind": "block", "type": "expression_fn_bm_isinstanceofarray"},
            ]
        }
    ]
});

class BlockyJsonGenerator extends GeneratedGenerator
{
    block_to_json(block)
    {
        if ( !block.isEnabled() )
            return undefined;

        if ( block.type.startsWith("expression_var_") )
            return this.expression_variable(block);

        if ( block.type.startsWith("expression_fn_") )
            return this.expression_function(block);

        return this[block.type](block);
    }

    input_to_json(block, input_name)
    {
        var input = block.getInput(input_name)
        if ( !input || !input.connection.isConnected() )
            return undefined;
        return this.block_to_json(input.connection.targetBlock());
    }

    statements_to_json(block, input_name, null_empty=false)
    {
        var json = [];

        var connection = block.getInput(input_name).connection;
        if ( !connection.isConnected() )
            return null_empty ? undefined : [];

        var result = {};

        for ( var item = connection.targetBlock(); item; item = item.getNextBlock() )
        {
            var block = this.block_to_json(item);
            if ( block !== undefined )
                json.push(block);
        }

        if ( null_empty && json.length == 0 )
            return undefined;

        return json;
    }

    json_null(block)
    {
        return null;
    }

    json_text(block)
    {
        return block.getFieldValue("value")
    }

    json_number(block)
    {
        return Number(block.getFieldValue("value"))
    }

    lottie_angle(block)
    {
        return Number(block.getFieldValue("value"))
    }

    json_boolean(block)
    {
        return block.getFieldValue('value') == 'true';
    }

    json_array(block)
    {
        const values = [];
        for ( var i = 0; i < block.itemCount_; i++ )
        {
            let valueCode = this.input_to_json(block, 'ADD' + i)
            if ( valueCode !== undefined )
                values.push(valueCode);
        }
        return values;
    }

    json_statement_adapter(block)
    {
        return this.input_to_json(block, "value")
    }

    object_members_to_json(block, input)
    {
        var connection = block.getInput(input).connection;
        if ( !connection.isConnected() )
            return {};

        var result = {};

        for ( var item = connection.targetBlock(); item; item = item.getNextBlock() )
        {
            result[item.getFieldValue("name")] = this.input_to_json(item, "value");
        }

        return result;
    }

    json_object(block)
    {
        return this.object_members_to_json(block, "members");
    }

    lottie_property_static(block)
    {
        return {
            "a": 0,
            "k": this.input_to_json(block, "value"),
        };
    }

    lottie_property_animated(block)
    {
        const keyframes = [];

        var connection = block.getInput("keyframes").connection;
        if ( connection.isConnected() )
        {
            for ( var item = connection.targetBlock(); item; item = item.getNextBlock() )
            {
                let keyframe = this.block_to_json(item);
                if ( keyframes !== undefined )
                    keyframes.push(keyframe);
            }
        }

        return {
            "a": 1,
            "k": keyframes,
        };
    }

    lottie_property_animated_expression(block)
    {
        return {
            ...this.lottie_property_animated(block),
            "x": this.input_to_json(block, "expression"),
            "ix": this.input_to_json(block, "index")
        }
    }

    lottie_property_static_expression(block)
    {
        return {
            ...this.lottie_property_static(block),
            "x": this.input_to_json(block, "expression"),
            "ix": this.input_to_json(block, "index")
        }
    }

    lottie_keyframe(block)
    {
        var value = this.input_to_json(block, "value");
        if ( typeof value == "number" )
            value = [value];

        return {
            "t": Number(block.getFieldValue("time")),
            ...this.input_to_json(block, "easing"),
            "s": value,
        };
    }

    lottie_easing(block)
    {
        return {
            i: {
                x: [Number(block.getFieldValue("ix"))],
                y: [Number(block.getFieldValue("iy"))]
            },
            o: {
                x: [Number(block.getFieldValue("ox"))],
                y: [Number(block.getFieldValue("oy"))]
            },
        };
    }

    lottie_easing_hold(block)
    {
        return {
            "h": 1,
        };
    }

    lottie_vector2d(block)
    {
        return [
            Number(block.getFieldValue("x")),
            Number(block.getFieldValue("y")),
        ]
    }

    lottie_vector3d(block)
    {
        return [
            Number(block.getFieldValue("x")),
            Number(block.getFieldValue("y")),
            Number(block.getFieldValue("z")),
        ]
    }

    lottie_color(block)
    {
        return [
            block.getFieldValue("red"),
            block.getFieldValue("green"),
            block.getFieldValue("blue"),
        ];
    }

    lottie_color_rgba(block)
    {
        return [
            block.getFieldValue("red"),
            block.getFieldValue("green"),
            block.getFieldValue("blue"),
            block.getFieldValue("alpha"),
        ];
    }

    lottie_transform(block)
    {
        var out = {};
        for ( var prop of ["a", "p", "r", "s", "o", "sk", "sa"] )
        {
            out[prop] = this.input_to_json(block, prop);
        }
        return out;
    }

    json_array_statements(block)
    {
        var connection = block.getInput("members").connection;
        if ( !connection.isConnected() )
            return {};

        var result = [];

        for ( var item = connection.targetBlock(); item; item = item.getNextBlock() )
        {
            result.push(this.block_to_json(item));
        }

        return result;
    }

    lottie_split_property(block)
    {
        var out = {
            "s": true
        };
        for ( var comp of ["x", "y", "z"] )
            out[comp] = this.input_to_json(block, comp);
        return out;
    }

    lottie_expression_source(block)
    {
        return block.getFieldValue("value");
    }

    lottie_gradient_colors(block)
    {
        return {
            "p": block.getFieldValue("count"),
            "k":  this.input_to_json(block, "colors")
        };
    }

    expression_statements(block)
    {
        var connection = block.getInput("statements").connection;
        if ( !connection.isConnected() )
            return "";

        var code = "var $bm_rt;\n";
        for ( var item = connection.targetBlock(); item; item = item.getNextBlock() )
        {
            code += this.block_to_json(item) + "\n";
        }

        return code;
    }

    expression_number(block)
    {
        return block.getFieldValue("value").toString();
    }

    expression_variable(block)
    {
        return block.getFieldValue("name");
    }

    expression_variable_definition(block)
    {
        var code = "var " + block.getFieldValue("name");

        var input = block.getInput("value")
        if ( input && input.connection.isConnected() )
            code += " = " + this.block_to_json(input.connection.targetBlock());

        return code + ";";
    }

    expression_assign(block)
    {
        var code = "";
        code += this.input_to_json(block, "variable");
        code += " = ";
        code += this.input_to_json(block, "value");
        return code + ";";
    }

    expression_function(block)
    {
        var code = block.getFieldValue("name");
        code += "(";
        for ( var i = 0; ; i++ )
        {
            var input = block.getInput("ARG" + i)
            if ( !input )
                break;

            if ( i > 0 )
                code += ", ";

            if ( !input.connection.isConnected() )
                code += "undefined";
            else
                code += this.block_to_json(input.connection.targetBlock());
        }
        return code + ")";
    }

    expression_statement_expression(block)
    {
        return this.input_to_json(block, "value") + ";";
    }
}

class BlocklyJsonParser extends GeneratedParser
{

    parse(json, workspace)
    {
        var root = document.createElement("xml");
        this.json_to_block(root, json, "lottie_animation", BlocklyJsonParser.NoConnection);
        workspace.clear();
        Blockly.Xml.domToWorkspace(root, workspace);
    }

    json_to_block(parent, json, type, connection)
    {
        if ( type in this )
            return this[type](parent, json);

        if ( connection == BlocklyJsonParser.Output )
            return this.create_value_block(parent, json);


        return this.create_value_block_statement(parent, json);
    }

    create_value_block_statement(parent, json)
    {
        var wrapper = this.create_block(parent, "json_statement_adapter");
        this.create_value_block(this.value(wrapper, "value"), json);
        return wrapper;
    }

    create_block(parent, type)
    {
        var block = document.createElement("block");
        block.setAttribute("type", type);
        parent.appendChild(block);
        return block;
    }

    statement(block, name)
    {
        var statement = document.createElement("statement");
        statement.setAttribute("name", name);
        block.appendChild(statement);
        return statement;
    }

    set_field(block, name, value)
    {
        var field = document.createElement("field");
        field.setAttribute("name", name);
        field.innerText = value;
        block.appendChild(field);
    }

    value(block, name)
    {
        var value = document.createElement("value");
        value.setAttribute("name", name);
        block.appendChild(value);
        return value;
    }

    next(block)
    {
        var next = document.createElement("next");
        block.appendChild(next);
        return next;
    }

    object_members_from_json(block, json, members_name, check_animated=false)
    {
        if ( json === undefined )
            return;

        var members = this.statement(block, members_name);
        var parent = members;
        for ( var [name, value] of Object.entries(json) )
        {
            if ( value === undefined )
                continue;
            var member = this.create_block(parent, "json_member");
            this.set_field(member, "name", name);

            if ( check_animated && typeof value == "object" && "a" in value && "k" in value )
                this.create_property_block(member, json, name, "", "value");
            else
                this.create_value_block(this.value(member, "value"), value);

            parent = this.next(member);
        }
    }

    json_object(parent, json)
    {
        var block = this.create_block(parent, "json_object");
        this.object_members_from_json(block, json, "members");
        return block;
    }

    create_value_block(parent, json, value_hint=null)
    {
        if ( json === undefined )
            return;

        if ( value_hint == "vector" )
            return this.lottie_vector2d(parent, json);
        if ( value_hint == "color" )
            return this.lottie_color(parent, json);
        if ( value_hint == "angle" )
            return this.lottie_angle(parent, json);
        if ( value_hint == "expression" )
            return this.lottie_expression_source(parent, json);

        if ( typeof json == "number" )
            return this.json_number(parent, json);
        if ( typeof json == "string" )
            return this.json_text(parent, json);
        if ( typeof json == "boolean" )
            return this.json_boolean(parent, json);
        if ( typeof json === null )
            return this.json_null(parent, json);
        if ( Array.isArray(json) )
            return this.json_array(parent, json);
        return this.json_object(parent, json);
    }

    json_null(parent, json)
    {
        return this.create_block(parent, "json_null");
    }

    json_text(parent, json)
    {
        var block = this.create_block(parent, "json_text");
        this.set_field(block, "value", json);
        return block;
    }

    lottie_expression_source(parent, json)
    {
        var block = this.create_block(parent, "lottie_expression_source");
        this.set_field(block, "value", json);
        return block;
    }

    json_number(parent, json)
    {
        var block = this.create_block(parent, "json_number");
        this.set_field(block, "value", json.toString());
        return block;
    }

    lottie_angle(parent, json)
    {
        var block = this.create_block(parent, "lottie_angle");
        this.set_field(block, "value", json.toString());
        return block;
    }

    json_boolean(parent, json)
    {
        var block = this.create_block(parent, "json_boolean");
        this.set_field(block, "value", json ? "true" : "false");
        return block;
    }

    json_array(parent, json)
    {
        var block = this.create_block(parent, "json_array");

        block.appendChild(document.createElement("mutation")).setAttribute("items", json.length.toString());

        for ( var i = 0; i < json.length; i++ )
        {
            var value = this.value(block, "ADD" + i);
            this.create_value_block(value, json[i]);
        }

        return block;
    }

    json_array_statements(parent, json)
    {
        var block = this.create_block(parent, "json_array_statements");

        var members = this.statement(block, "members");
        var parent = members;
        for ( var value of json )
        {
            if ( value === undefined )
                continue;

            var member = this.create_value_block_statement(parent, value);
            parent = this.next(member);
        }
        return block;
    }

    lottie_property(parent, json, type_hint)
    {
        var animated;

        if ( "a" in json )
        {
            animated = json.a;
        }
        else
        {
            animated = Array.isArray(json) && json.length > 0 && ("s" in json);
        }

        var expression = "";
        if ( "x" in json )
            expression = "_expression";

        if ( animated )
            return this.lottie_property_animated(parent, json, type_hint, expression);
        else
            return this.lottie_property_static(parent, json, type_hint,expression);
    }

    lottie_property_expression(block, json)
    {
        this.create_value_block(this.value(block, "expression"), json.x, "expression");
        this.create_value_block(this.value(block, "index"), json.ix);
    }

    lottie_property_static(parent, json, type_hint, expression)
    {
        var block = this.create_block(parent, "lottie_property_static" + expression);
        var value = this.value(block, "value");
        this.create_value_block(value, json.k, type_hint);
        if ( expression )
            this.lottie_property_expression(block, json);
        return block;
    }

    lottie_property_animated(parent, json, type_hint, expression)
    {
        var block = this.create_block(parent, "lottie_property_animated" + expression);

        var members = this.statement(block, "keyframes");
        var parent = members;
        var e;
        for ( var value of json.k )
        {
            if ( value === undefined )
                continue;

            var member = this.lottie_keyframe(parent, value, type_hint, e);
            e = value.e;
            parent = this.next(member);
        }

        if ( expression )
            this.lottie_property_expression(block, json);

        return block;
    }

    lottie_keyframe(parent, json, type_hint, e)
    {
        var block = this.create_block(parent, "lottie_keyframe");

        this.set_field(block, "time", json.t);

        var easing = this.value(block, "easing");

        if ( "h" in json && json.h )
        {
            this.create_block(easing, "lottie_easing_hold");
        }
        else if ( "i" in json )
        {
            this.lottie_easing(easing, json);
        }


        var value = json.s;

        if ( value === undefined )
        {
            if ( e === undefined )
                return block;

            value = e;
        }

        this.create_value_block(this.value(block, "value"), value, type_hint);

        return block;
    }

    lottie_easing_item(json)
    {
        var x, y;
        if ( Array.isArray(json.x) )
            x = json.x[0];
        if ( Array.isArray(json.y) )
            y = json.y[0];
        return [x, y];
    }

    lottie_easing(parent, json)
    {
        var ix, iy, ox, oy;
        [ix, iy] = this.lottie_easing_item(json.i);
        [ox, oy] = this.lottie_easing_item(json.o);
        var block = this.create_block(parent, "lottie_easing");
        this.set_field(block, "ox", ox);
        this.set_field(block, "oy", oy);
        this.set_field(block, "ix", ix);
        this.set_field(block, "iy", iy);
        return block;
    }

    lottie_vector2d(parent, json)
    {
        if ( !Array.isArray(json) || json.length < 2 || json.length > 3 )
            return this.create_value_block(parent, json);

        var block = this.create_block(parent, `lottie_vector${json.length}d`);
        this.set_field(block, "x", json[0]);
        this.set_field(block, "y", json[1]);
        if ( json.length == 3 )
            this.set_field(block, "z", json[2]);
        return block;
    }

    lottie_color(parent, json)
    {
        if ( !Array.isArray(json) || json.length < 3 || json.length > 4 )
            return this.create_value_block(parent, json);

        var block_type = "lottie_color";
        if ( json.length == 4 )
            block_type += "_rgba";
        var block = this.create_block(parent, block_type);
        this.set_field(block, "red", json[0]);
        this.set_field(block, "green", json[1]);
        this.set_field(block, "blue", json[2]);
        if ( json.length == 4 )
            this.set_field(block, "alpha", json[3]);
        return block;
    }

    create_property_block(block, json, property, type_hint, input_name=null)
    {
        if ( json[property] === undefined )
            return;

        if ( input_name == null )
            input_name = property;

        var input = this.value(block, input_name);
        this.lottie_property(input, json[property], type_hint);
    }

    lottie_split_property(parent, json)
    {
        var block = this.create_block(parent, "lottie_split_property");
        this.create_property_block(block, json, "x");
        this.create_property_block(block, json, "y");
        this.create_property_block(block, json, "z");
        return block;
    }

    maybe_split_property(block, json, property)
    {
        if ( json[property] === undefined )
            return;

        if ( json[property].s )
        {
            var input = this.value(block, property);
            this.lottie_split_property(input, json[property]);
        }
        else
        {
            this.create_property_block(block, json, property, "vector");
        }
    }

    lottie_transform(parent, json)
    {
        var has_extra = Object.keys(json).filter(prop => ["a", "p", "r", "s", "o", "sk", "sa"].indexOf(prop) < 0).length;

        if ( has_extra )
        {
            var block = this.create_block(parent, "json_object");
            this.object_members_from_json(block, json, "members", true);
            return block;
        }

        var block = this.create_block(parent, "lottie_transform");

        this.create_property_block(block, json, "a", "vector");
        this.maybe_split_property(block, json, "p", "vector");
        this.create_property_block(block, json, "r", "angle");
        this.create_property_block(block, json, "s", "vector");
        this.create_property_block(block, json, "o", "");
        this.create_property_block(block, json, "sk", "");
        this.create_property_block(block, json, "sa", "");
        return block;
    }

    statements_from_json(block, name, json, type)
    {
        var members = this.statement(block, name);
        var parent = members;
        for ( var value of json )
        {
            if ( value === undefined )
                continue;


            var member = this.statement_from_json(parent, value, type);
            parent = this.next(member);
        }
        return block;
    }

    statement_from_json(parent, json, type)
    {
        var type_callback = "get_type_for_" + type;

        if ( type_callback in this )
        {
            var block_type = this[type_callback](json);
            return this.json_to_block(parent, json, block_type, BlocklyJsonParser.BeforeAfter);
        }


        return this.create_value_block_statement(parent, json);
    }

    get_type_for_assets(json)
    {
        if ( "layers" in json )
            return "lottie_precomposition";
        return "lottie_image";
    }

    lottie_gradient_colors(parent, json)
    {
        var block = this.create_block(parent, "lottie_gradient_colors");
        this.set_field(block, "count", json.p);
        this.create_property_block(block, json, "k", "", "colors");
        return block;
    }
}

BlocklyJsonParser.NoConnection = 0;
BlocklyJsonParser.Output = 1;
BlocklyJsonParser.BeforeAfter = 2;


class LottieBlockly
{
    constructor(blockly_options, workspace_id, on_error)
    {
        this.workspace = Blockly.inject(workspace_id, options);
        this.generator = new BlockyJsonGenerator();
        this.parser = new BlocklyJsonParser();
    }

    json_to_workspace(json)
    {
        if ( typeof json == "string" )
            json = JSON.parse(json);

        this.parser.parse(json, this.workspace);
    }

    load_json_url(url)
    {
        try {
            new URL(url, window.location.href);
        } catch (e) {
            this.on_error("Invalid URL");
            return;
        }

        var xmlhttp = new XMLHttpRequest();

        var lottie_blockly = this;
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4)
            {
                if ( this.status == 200 || xhttp.status == 304 )
                {
                    if ( xmlhttp.responseXML )
                    {
                        lottie_blockly.xml_to_workspace(xmlhttp.responseXML.documentElement);
                    }
                    else
                    {
                        var json;
                        try {
                            json = JSON.parse(xmlhttp.responseText);
                        } catch (e) {
                            lottie_blockly.on_error("Invalid JSON");
                            return;
                        }
                        lottie_blockly.json_to_workspace(json);
                    }
                }
                else
                {
                    lottie_blockly.on_error("Could not fetch the JSON");
                }
            }
        };

        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    }

    xml_to_workspace(xml)
    {
        this.workspace.clear();
        if ( typeof xml == "string" )
            xml = Blockly.Xml.textToDom(xml);
        Blockly.Xml.domToWorkspace(xml, this.workspace);
    }

    workspace_to_xml()
    {
        return Blockly.Xml.workspaceToDom(this.workspace);
    }

    workspace_to_xml_string()
    {
        return Blockly.Xml.domToText(this.workspace_to_xml());
    }

    clear_workspace()
    {
        this.workspace.clear();
    }

    workspace_to_json()
    {
        var top_block = this.workspace.getTopBlocks()[0];
        if ( top_block !== undefined )
            return this.generator.block_to_json(top_block);
        return {};
    }
}
