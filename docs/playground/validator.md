full_page: 1
disable_toc: 1

<script src="https://cdnjs.cloudflare.com/ajax/libs/ajv/8.17.1/ajv2020.min.js"></script>
<!-- <script src="https://cdn.jsdelivr.net/npm/@lottie-animation-community/lottie-specs/src/validator.js"></script> -->
<script src="../validator.js"></script>
<style>

    .file-drop {
        border: 1px solid black;
        margin: 20px auto;
        padding: 60px;
        box-sizing: border-box;
        text-align: center;
        border-radius: 5px;
        position: relative;
    }
    .file-drop input[type="file"] {
        position: absolute;
        width: 100%;
        height: 100%;
        opacity: 0;
        left: 0px;
        top: 0px;
        cursor: pointer;
    }
    #validator-page {
        max-width: 1024px;
        margin: 0 auto;
    }
    #results {
        display: none;
    }
</style>

<div id="validator-page">
    <div id="input-tab">
        <p>
            <input type="url" id="lottie-url" placeholder="Lottie file URL"/>
            <button title="Validate selected" onclick="load_url_input()">
            <i class="fa-solid fa-play"></i></button>
        </p>
        <div class="file-drop">
            <p>Drop Lottie file or click to browse files</p>
            <input id="lottie-input" type="file" accept=".json,.lot,video/lottie,application/json"/>
        </div>
    </div>
    <table id="results">
        <thead>
            <tr>
                <th>Severity</th>
                <th>Message</th>
                <th>Path</th>
                <th>Docs</th>
        </thead>
        <tbody></tbody>
    </table>
</div>

<script>
    document
    .querySelector("#lottie-input")
    .addEventListener("change", (e) => {
        //get the files
        const files = e.target.files;
        if (files.length > 0)
        {
            const file = files[0];
            parse_lottie_file(file);
        }
    });

    const table_parent = document.getElementById("results");
    const table = table_parent.querySelector("tbody");

    function clear_results()
    {
        table.innerHTML = "";
        table_parent.style.display = "table";
    }

    function add_result_row(error)
    {
        let row = document.createElement("tr");
        table.appendChild(row);
        row.classList.add(error.type == "error" ? "danger" : error.type);

        let icon = document.createElement("i");
        icon.classList.add("fa-solid");
        if ( error.type == "warning" )
            icon.classList.add("fa-triangle-exclamation");
        else
            icon.classList.add("fa-circle-exclamation");

        let sev = row.appendChild(document.createElement("td"));
        sev.appendChild(icon);
        sev.appendChild(document.createTextNode(
            error.type[0].toUpperCase() + error.type.substr(1)
        ));

        row.appendChild(document.createElement("td"))
            .appendChild(document.createTextNode(
                error.message
            )
        );


        row.appendChild(document.createElement("td"))
            .appendChild(document.createTextNode(
                error.path
            )
        );

        let docs = row.appendChild(document.createElement("td"))
        if ( error.docs )
        {
            let link = docs.appendChild(document.createElement("a"));

            docs.setAttribute("href", error.docs.replace("https://lottie.github.io/lottie-spec/", "/lottie-docs"));
            docs.appendChild(document.createTextNode(error.name));
        }
    }

    function load_url_input()
    {
        let url = document.getElementById("lottie-url").value;
        clear_results();
        add_result_row({type: "error", message: "Could not load URL", path: url});
        fetch(url).then( r => r.json() ).then(parse_lottie_json);
    }

    function parse_lottie_file(file)
    {
        clear_results();
        add_result_row({type: "error", message: "Could not load file", path: ""});
        const reader = new FileReader();
        reader.onload = function (e) {
            parse_lottie_string(e.target.result);
        };
        reader.readAsText(file);
    }

    function parse_lottie_string(json)
    {
        parse_lottie_json(JSON.parse(json));
    }

    function parse_lottie_json(data)
    {
        clear_results();
        const errors = validator.validate(data);
        errors.forEach(add_result_row);
    }

    let validator = null;
    let schema_url = "/lottie-docs/lottie.schema.json";
    fetch(schema_url).then( r => r.json() ).then(schema => {
        validator = new LottieValidator(ajv2020.Ajv2020, schema);
    });
</script>
