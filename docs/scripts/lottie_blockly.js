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
    "output": "value",
    "colour": 230,
},
{
    "type": "json_object_list",
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
    "previousStatement": "object",
    "nextStatement": "object",
    "colour": 230,
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
  "output": "keyframe",
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
  "output": "transform",
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
  "helpUrl": "/lottie-docs/concepts/#transform"
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
  "type": "my_test",
  "message0": "Foo %1",
  "args0": [
    {
      "type": "input_value",
      "name": "value",
    }
  ],
  "output": "value",
  "colour": 0,
  "tooltip": "",
  "helpUrl": ""
}
]);

Blockly.Blocks["json_array"] = {
    init: function()
    {
        this.appendDummyInput().appendField("[");
        this.appendDummyInput("close").appendField("]");

        this.setInputsInline(false);
        this.setColour(230);
        this.itemCount_ = 0;
        this.updateShape_();
        this.setOutput(true, 'value');
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
        this.removeInput("close");

        // Add new inputs.
        for ( var i = 0; i < this.itemCount_; i++ )
        {
            if ( !this.getInput('ADD' + i) )
                this.add_input(i);
        }
        // Remove deleted inputs.
        while ( this.getInput('ADD' + i) )
        {
            this.removeInput('ADD' + i);
            i++;
        }

        this.add_input(this.itemCount_);

        this.appendDummyInput("close").appendField("]");
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
                        var input = this.getInput('ADD' + this.itemCount_ - 1);
                        if ( input && input.connection.isConnected() )
                            break;
                        this.itemCount_ -= 1;
                    }
                    this.updateShape_();
                }
            }
        }
    },

};


Blockly.Blocks["lottie_property_animated"] = {
    init: function()
    {
        this.setInputsInline(false);
        this.setColour(180);
        this.itemCount_ = 0;
        this.updateShape_();
        this.setOutput(true, 'property');
        this.setHelpUrl("/lottie-docs/concepts/#animated-property");
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
            .setAlign(Blockly.ALIGN_RIGHT)
            .setCheck("keyframe");
        if ( index == 0 )
            input.appendField("Animated Property");
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
        // Remove deleted inputs.
        while ( this.getInput('ADD' + i) )
        {
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
                        var input = this.getInput('ADD' + this.itemCount_ - 1);
                        if ( input && input.connection.isConnected() )
                            break;
                        this.itemCount_ -= 1;
                    }
                    this.updateShape_();
                }
            }
        }
    },

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

Blockly.FieldAngle.CLOCKWISE = true;
Blockly.FieldAngle.OFFSET = 90;


const lottie_toolbox = generated_toolbox;

lottie_toolbox["contents"].push({
    "kind": "category",
    "name": "Properties",
    "colour": 180,
    "contents": [
        {"kind": "block", "type": "lottie_property_static"},
        {"kind": "block", "type": "lottie_property_animated"},
        {"kind": "block", "type": "lottie_keyframe"},
        {"kind": "block", "type": "lottie_easing"},
        {"kind": "block", "type": "lottie_easing_hold"},
        {"kind": "block", "type": "lottie_color"},
        {"kind": "block", "type": "lottie_vector2d"},
        {"kind": "block", "type": "json_number"},
        {"kind": "block", "type": "lottie_angle"},
        {"kind": "block", "type": "lottie_transform"},
        {"kind": "block", "type": "lottie_split_property"},
    ]
});
lottie_toolbox["contents"].push(
    {
        "kind": "category",
        "name": "JSON",
        "colour": 230,
        "contents": [
            {"kind": "block", "type": "json_object"},
            {"kind": "block", "type": "json_object_list"},
            {"kind": "block", "type": "json_member"},
            {"kind": "block", "type": "json_array"},
            {"kind": "block", "type": "json_array_statements"},
            {"kind": "block", "type": "json_number"},
            {"kind": "block", "type": "json_text"},
            {"kind": "block", "type": "json_boolean"},
            {"kind": "block", "type": "json_null"},
            {"kind": "block", "blockxml": `
            <block type="my_test">
                <value name="value">
                    <shadow type="lottie_transform">
                        <value name="p">
                            <shadow type="lottie_property_static">
                            </shadow>
                        </value>
                    </shadow>
                </value>
            </block>`},
        ]
    }
);

class BlockyJsonGenerator extends GeneratedGenerator
{
    block_to_json(block)
    {
        if ( !block.isEnabled() )
            return undefined;
        return this[block.type](block);
    }

    input_to_json(block, input_name)
    {
        var input = block.getInput(input_name)
        if ( !input || !input.connection.isConnected() )
            return undefined;
        return this.block_to_json(input.connection.targetBlock());
    }

    statements_to_json(block, input_name)
    {
        var json = [];

        var connection = block.getInput(input_name).connection;
        if ( !connection.isConnected() )
            return [];

        var result = {};


        for ( var item = connection.targetBlock(); item; item = item.getNextBlock() )
        {
            var block = this.block_to_json(item);
            if ( block !== undefined )
                json.push(block);
        }

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

    json_object_list(block)
    {
        return this.json_object(block);
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
        for ( var i = 0; i < block.itemCount_; i++ )
        {
            let keyframe = this.input_to_json(block, 'ADD' + i)
            if ( keyframes !== undefined )
                keyframes.push(keyframe);
        }
        return {
            "a": 1,
            "k": keyframes,
        };
    }

    lottie_keyframe(block)
    {

        return {
            "t": Number(block.getFieldValue("time")),
            ...this.input_to_json(block, "easing"),
            "s": this.input_to_json(block, "value"),
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

    lottie_color(block)
    {
        return [
            block.getFieldValue("red"),
            block.getFieldValue("green"),
            block.getFieldValue("blue"),
        ];
    }

    lottie_transform(block)
    {
        var out = {};
        for ( var prop of ["a", "p", "r", "s", "o", "sk", "sa"] )
        {
            Object.assign(out, this.maybe_split_property(block, prop));
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

    lottie_split_property(block, prefix='')
    {
        var out = {};
        for ( var comp of ["x", "y", "z"] )
            out[prefix + comp] = this.input_to_json(block, comp);
        return out;
    }

    maybe_split_property(block, prefix)
    {
        var input = block.getInput(prefix)
        if ( !input || !input.connection.isConnected() )
            return {};

        var target = input.connection.targetBlock();
        if ( target.type == "lottie_split_property" )
            return this.lottie_split_property(target, prefix)

        var out = {};
        out[prefix] = this.block_to_json(target);
        return out;
    }
}
