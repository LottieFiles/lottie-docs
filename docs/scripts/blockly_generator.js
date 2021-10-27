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
            "check": "json_member",
        }
    ],
    "output": null,
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
            "check": "json_member",
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
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
    "previousStatement": null,
    "nextStatement": null,
    "colour": 190,
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
    "output": null,
    "colour": 210,
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "json_null",
    "message0": "null",
    "output": null,
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
    "output": null,
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
    "output": null,
    "colour": 210,
    "tooltip": "",
    "helpUrl": ""
},
{
  "type": "lottie_animation",
  "message0": "name %1 %2 version %3 %4 width %5 %6 height %7 %8 framerate %9 %10 in point %11 %12 out point %13 %14 Assets %15 Layers %16",
  "args0": [
    {
      "type": "field_input",
      "name": "name",
      "text": "Animation"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "field_input",
      "name": "version",
      "text": "5.7.1"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "field_number",
      "name": "width",
      "value": 512,
      "min": 0
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "field_number",
      "name": "height",
      "value": 512,
      "min": 0
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "field_number",
      "name": "framerate",
      "value": 60,
      "min": 0
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "field_number",
      "name": "in point",
      "value": 0,
      "min": 0
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "field_number",
      "name": "out point",
      "value": 60,
      "min": 0
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "assets",
      "check": "lottie_asset"
    },
    {
      "type": "input_statement",
      "name": "layers",
      "check": "lottie_layer"
    }
  ],
  "colour": 260,
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
        this.setOutput(true, 'Array');
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

const lottie_toolbox = {
    "kind": "categoryToolbox",
    "contents": [
        {
            "kind": "category",
            "name": "Animation",
            "contents": [
                {"kind": "block", "type": "lottie_animation"},
            ]
        },
        {
            "kind": "category",
            "name": "JSON",
            "contents": [
                {"kind": "block", "type": "json_object"},
                {"kind": "block", "type": "json_object_list"},
                {"kind": "block", "type": "json_member"},
                {"kind": "block", "type": "json_array"},
                {"kind": "block", "type": "json_number"},
                {"kind": "block", "type": "json_text"},
                {"kind": "block", "type": "json_boolean"},
                {"kind": "block", "type": "json_null"},
            ]
        },
    ]
};

class BlockyJsonGenerator
{
    block_to_json(block)
    {
        return this[block.type](block);
    }

    input_to_json(block, input_name)
    {
        var input = block.getInput(input_name)
        if ( !input || !input.connection.isConnected )
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
            json.push(this.block_to_json(item));

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

    json_object(block)
    {
        var connection = block.getInput("members").connection;
        if ( !connection.isConnected() )
            return {};

        var result = {};

        for ( var item = connection.targetBlock(); item; item = item.getNextBlock() )
        {
            result[item.getFieldValue("name")] = this.input_to_json(item, "value");
        }

        return result;
    }

    lottie_animation(block)
    {
        return {
            "nm": block.getFieldValue("name"),
            "w": Number(block.getFieldValue("width")),
            "h": Number(block.getFieldValue("height")),
            "fr": Number(block.getFieldValue("framerate")),
            "ip": Number(block.getFieldValue("in point")),
            "op": Number(block.getFieldValue("out point")),
            "assets": this.statements_to_json(block, "assets"),
            "layers": this.statements_to_json(block, "layers"),
        };
    }
}
