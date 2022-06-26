importScripts("lottie_explain.js");

var schema = null;

function critical_error(err)
{
    postMessage({type: "error", message: err});
}

var requests = [fetch("/lottie-docs/schema/lottie.schema.json"), fetch("/lottie-docs/schema/docs_mapping.json")]
Promise.all(requests)
.then(responses => {
    Promise.all(responses.map(r => r.json()))
    .then(jsons => {
        schema = new SchemaData(jsons[0], jsons[1]);
        postMessage({
            type: "schema_loaded",
            schema: schema,
        });
        postMessage({
            type: "status",
            status: "initialized",
        });
    })
    .catch(critical_error);
})
.catch(critical_error);

function process_lottie(json)
{
    if ( schema === null )
        return;

    postMessage({
        type: "status",
        status: "processing",
    });

    var validation = schema.root.validate(json);
    postMessage({
        type: "result",
        result: validation,
    });

    postMessage({
        type: "status",
        status: "processing_complete",
    });
}

onmessage = function(ev)
{
    switch ( ev.data.type )
    {
        case "update":
            process_lottie(ev.data.lottie);
            return;
    }
};
