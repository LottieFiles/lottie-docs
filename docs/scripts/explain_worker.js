importScripts(
    "https://cdnjs.cloudflare.com/ajax/libs/ajv/8.17.1/ajv2020.min.js",
    // "https://cdn.jsdelivr.net/npm/@lottie-animation-community/lottie-specs/src/validator.js",
    "validator.js",
    "lottie_explain.js"
);

var validator = null;

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
        validator = new LottieDocsValidator(jsons[0]);
        postMessage({
            type: "schema_loaded",
            schema: validator.schema,
            expressions: jsons[1]
        });
    })
    .catch(critical_error);
})
.catch(critical_error);

function process_lottie(json)
{
    if ( validator === null )
        return;

    var errors = validator.validate(json);
    postMessage({
        type: "result",
        result: validator.errors_to_validation(errors),
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
