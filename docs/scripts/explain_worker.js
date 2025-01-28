importScripts("lottie_explain.js");

var schema = null;

function critical_error(err)
{
    postMessage({type: "error", message: err});
}

var requests = [
    fetch("/lottie-docs/lottie.schema.json"),
    fetch("/lottie-docs/static/expressions.json")
]
Promise.all(requests)
.then(responses => {
    Promise.all(responses.map(r => r.json()))
    .then(jsons => {
        schema = new SchemaData(jsons[0], jsons[1]);
        postMessage({
            type: "schema_loaded",
            schema: schema,
            expressions: jsons[1]
        });
    })
    .catch(critical_error);
})
.catch(critical_error);

function process_lottie(json)
{
    if ( schema === null )
        return;

    var validation = schema.root.validate(json);
    postMessage({
        type: "result",
        result: validation,
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
