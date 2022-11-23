full_page: 1
disable_toc: 1

<script src="../../scripts/editor.bundle.js"></script>
<script src="../../scripts/json_editor.js"></script>
<script src="../../scripts/lottie_explain.js"></script>
<link rel="stylesheet" href="../../style/editor.css" />

<div class="alert alert-danger" role="alert" style="display: none" id="error_alert"></div>
<div class="alert alert-primary" role="alert" style="display: none" id="loading_alert">
    <div class="spinner-border" role="status"></div>
    Loading...
</div>

<div id="editor_area">
    <div class="player-wrapper">
        <div class="alpha_checkered" id="lottie_target"></div>
        <div class="playback-controls">
            <button onclick="toggle_playback(this)" class="btn btn-primary btn-sm" title="Pause">
                <i class="fa-solid fa-pause"></i>
            </button>
            <button onclick="toggle_playback_controls()" class="btn btn-secondary btn-sm" title="Toggle Playback Controls">
                <i class="fa-solid fa-sliders"></i>
            </button>
            <input type="range" class="form-control" id="frame_slider" oninput="update_frame(this.value)" style="display: none"/>
            <input type="number" id="frame_edit" oninput="update_frame(this.value)" style="display: none"/>
        </div>
    </div>
    <div class="editor-side">
        <div class="action-menu">
            <div class="dropdown">
                <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" id="btn_menu_file" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    File
                </button>
                <ul class="dropdown-menu" aria-labelledby="btn_menu_file">
                    <li><a class="dropdown-item" onclick="action_new()"><i class="fa-solid fa-file"></i> New</a></li>
                    <li><a class="dropdown-item" data-toggle="modal" data-target="#modal_url">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Load from URL...
                    </a></li>
                    <li><a class="dropdown-item" data-toggle="modal" data-target="#modal_file">
                        <i class="fa-solid fa-folder-open"></i>
                        Open File...
                    </a></li>
                    <li><a class="dropdown-item" onclick="action_load()">
                        <i class="fa-solid fa-cloud-arrow-down"></i>
                        Load Saved
                    </a></li>
                    <li class="dropdown-divider"></li>
                    <li><a class="dropdown-item" onclick="action_save()"><i class="fa-solid fa-floppy-disk"></i> Save</a></li>
                    <li><a class="dropdown-item" onclick="action_download()"><i class="fa-solid fa-download"></i> Download</a></li>
                </ul>
            </div>
            <div class="dropdown">
                <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" id="btn_menu_edit" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Edit
                </button>
                <ul class="dropdown-menu" aria-labelledby="btn_menu_edit">
                    <li><a class="dropdown-item" onclick="editor.undo()"><i class="fa-solid fa-rotate-left"></i> Undo</a></li>
                    <li><a class="dropdown-item" onclick="editor.redo()"><i class="fa-solid fa-rotate-right"></i> Redo</a></li>
                    <li class="dropdown-divider"></li>
                    <li><a class="dropdown-item" onclick="search_by_json_cmd(editor.view)">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        Search by JSON...
                    </a></li>
                    <li><a class="dropdown-item" onclick="CodeMirrorWrapper.openSearchPanel(editor.view)">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        Find/Replace...
                    </a></li>
                    <li><a class="dropdown-item" onclick="CodeMirrorWrapper.gotoLine(editor.view)">
                        <i class="fa-solid fa-arrow-down-short-wide"></i>
                        Go to Line...
                    </a></li>
                    <li class="dropdown-divider"></li>
                    <li><a class="dropdown-item" onclick="pretty()"><i class="fa-solid fa-indent"></i> Prettify JSON</a></li>
                </ul>
            </div>
            <div class="dropdown">
                <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" id="btn_menu_lottie" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Lottie
                </button>
                <ul class="dropdown-menu" aria-labelledby="btn_menu_lottie">
                    <li><a class="dropdown-item" onclick="CodeMirrorWrapper.openLintPanel(editor.view)">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        View Issues...
                    </a></li>
                    <li><a class="dropdown-item" onclick="CodeMirrorWrapper.nextDiagnostic(editor.view)">
                        <i class="fa-solid fa-arrow-right-to-bracket"></i>
                        Go to Next Issue
                    </a></li>
                    <li class="dropdown-divider"></li>
                    <li><a class="dropdown-item" data-toggle="modal" data-target="#modal_features" onclick="refresh_features()">
                        <i class="fa-solid fa-list-check"></i>
                        View Lottie Features...
                    </a></li>
                </ul>
            </div>
            <div class="dropdown">
                <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" id="btn_menu_view" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    View
                </button>
                <ul class="dropdown-menu" aria-labelledby="btn_menu_view">
                    <li><a class="dropdown-item" onclick="document.body.classList.toggle('wide')">
                        <i class="fa-solid fa-arrows-left-right"></i> Toggle Wide Layout
                    </a></li>
                    <li>
                        <a class="dropdown-item" onclick="document.getElementById('background_color_input').click()">
                            <i class="fa-solid fa-palette"></i>
                            <input
                                id="background_color_input"
                                type="color"
                                class="dropdown-item"
                                style="margin:0;width:0;height:0;padding:0;visibility:hidden;"
                                oninput="document.getElementById('lottie_target').style.background = this.value;"
                                />
                            Preview Background...
                        </a>
                    </li>
                </ul>
            </div>
            <div class="dropdown">
                <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" id="btn_menu_help" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Help
                </button>
                <ul class="dropdown-menu" aria-labelledby="btn_menu_help">
                    <li><a class="dropdown-item" data-toggle="modal" data-target="#modal_key_bindings">
                        <i class="fa-solid fa-keyboard"></i> View Keyboard Shortcuts
                    </a></li>
                </ul>
            </div>
        </div>
        <div id="editor_parent">
            <div id="info_box">
                <div class="info_box_details"></div>
                <div class="info_box_lottie alpha_checkered"></div>
                <div class="info_box_buttons" style="display: none" data-toggle="buttons">
                    <label class="btn btn-primary btn-sm" id="btn_center_lottie" title="Show items centered in the preview">
                        <input type="radio" name="options" autocomplete="off"> Fit in View
                    </label>
                    <label class="btn btn-primary btn-sm" id="btn_reset_view" title="Show items as they appear on the file">
                        <input type="radio" name="options" autocomplete="off"> Normal View
                    </label>
                </div>
            </div>
        </div>
    </div>
</div>
<div class="modal fade" id="modal_file" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    Upload File
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" />
                        <span aria-hidden="true">&times;</span>
                    </button>
                </h5>
            </div>
            <div class="modal-body">
                <div class="drop-area" ondrop="lottie_drop_input(event);" ondragover="event.preventDefault();">
                    <p>Drop JSON file here</p>
                    <input type="file" onchange="lottie_file_input(event);" class="form-control-file" />
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal" id="dismiss_file_modal">Cancel</button>
            </div>
        </div>
    </div>
</div>
<div class="modal fade" id="modal_url" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    Load from URL
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" />
                        <span aria-hidden="true">&times;</span>
                    </button>
                </h5>
            </div>
            <div class="modal-body">
                <input type="text" id="input_from_url" class="form-control" />
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" data-dismiss="modal"
                    onclick="lottie_url_input(document.getElementById('input_from_url').value)">Load</button>
            </div>
        </div>
    </div>
</div>
<div class="modal fade" id="modal_key_bindings" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    Key bindings
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" />
                        <span aria-hidden="true">&times;</span>
                    </button>
                </h5>
            </div>
            <div class="modal-body">
                <table id="key_bindings"></table>
            </div>
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>
<div class="modal fade" id="modal_features" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    Lottie Features
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" />
                        <span aria-hidden="true">&times;</span>
                    </button>
                </h5>
            </div>
            <div class="modal-body" id="features_container"></div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>

<script>
    function input_error(e, safe = false)
    {
        error_container.style.display = "block";
        loading_div.style.display = "none";
        clear_element(error_container);
        error_container.appendChild(document.createTextNode(safe ? e : "Could not load input!"));
        console.error(e);
    }

    function input_start()
    {
        error_container.style.display = "none";
        loading_div.style.display = "block";
    }

    function lottie_file_input(ev)
    {
        input_start();
        lottie_receive_files(ev.target.files);
    }

    function lottie_receive_files(files)
    {
        for ( var i = 0; i < files.length; i++ )
        {
            var file = files[i];
            if ( file.type.match("application/json") )
            {
                var reader = new FileReader();

                reader.onload = function(e2)
                {
                    lottie_string_input(e2.target.result, true);
                    document.getElementById("dismiss_file_modal").click();
                };

                reader.readAsText(file);
                return;
            }
        }

        input_error("Not a JSON file", true);
    }

    function lottie_drop_input(ev)
    {
        ev.preventDefault();

        if (ev.dataTransfer.items)
        {
            input_start();
            lottie_receive_files(
                Array.from(ev.dataTransfer.items)
                .filter(i => i.kind === 'file')
                .map(i => i.getAsFile())
            );
        }
    }

    function lottie_url_input(url)
    {
        input_start();
        fetch(url)
        .then(r => r.json())
        .then(set_editor_json)
        .catch(input_error);
    }

    function set_editor_json(data)
    {
        lottie_string_input(JSON.stringify(data, undefined, 4));
    }

    function on_lottie_update(lottie)
    {
        worker.update(lottie);
        lottie_player.lottie = lottie;
        frame_slider.min = frame_edit.min = lottie.ip;
        frame_slider.max = frame_edit.max = lottie.op;
        lottie_player.reload();
        frame_slider.value = frame_edit.value = Math.round(lottie_player.anim.currentFrame);
        lottie_player.anim.addEventListener("enterFrame", (ev) => {
            frame_slider.value = frame_edit.value = Math.round(lottie_player.anim.currentFrame);
        });
    }

    function update_frame(value)
    {
        value = Number(value);
        if ( value != Math.round(lottie_player.anim.currentFrame) )
            lottie_player.go_to_frame(value);
    }

    function pretty()
    {
        set_editor_json(lottie_player.lottie);
    }

    function lottie_string_input(data, auto_prettify = false)
    {
        if ( auto_prettify && data.split("\n").length < 3 )
        {
            try {
                data = JSON.parse(data);
                data = JSON.stringify(data, undefined, 4);
            } catch (e) {}
        }

        editor.set_content(data);
        error_container.style.display = "none";
        loading_div.style.display = "none";
    }

    function inspect_tree(node)
    {
        let children = [];
        let name = node.name;

        if ( node.firstChild() )
        {
            while ( true )
            {
                children.push(inspect_tree(node));
                if ( !node.nextSibling() )
                    break;
            }
            node.parent()
        }

        return { [name]: children };
    }

    function action_save()
    {
        localStorage.setItem("editor_lottie", JSON.stringify(lottie_player.lottie));
    }

    function action_load()
    {
        set_editor_json(JSON.parse(localStorage.getItem("editor_lottie")));
    }

    function action_new()
    {
        set_editor_json({
            "v": "5.5.2",
            "fr": 60,
            "ip": 0,
            "op": 60,
            "w": 512,
            "h": 512,
            "ddd": 0,
            "assets": [],
            "fonts": {
                "list": []
            },
            "layers": []
        });
    }

    function action_download()
    {
        download_json(lottie_player.lottie, "lottie.json");
    }

    function toggle_playback(button)
    {
        if ( lottie_player.autoplay )
        {
            lottie_player.pause();
            button.title = "Play";
            button.firstElementChild.setAttribute("class", "fa-solid fa-play");
        }
        else
        {
            lottie_player.play();
            button.title = "Pause";
            button.firstElementChild.setAttribute("class", "fa-solid fa-pause");
        }
    }

    function toggle_playback_controls()
    {
        if ( frame_slider.style.display == "none" )
        {
            frame_slider.style.display = "block";
            frame_edit.style.display = "block";
        }
        else
        {
            frame_slider.style.display = "none";
            frame_edit.style.display = "none";
        }
    }

    function refresh_features()
    {
        let parent = document.getElementById("features_container");
        clear_element(parent);

        let features = get_features(editor.completions.validation_result);
        let has_something = false;

        for ( let what of ["Layers", "Shapes"] )
        {
            let attr = what.toLowerCase();

            if ( features[attr].length )
            {
                has_something = true;
                parent.appendChild(document.createElement("h6")).appendChild(document.createTextNode(what));
                let list = parent.appendChild(document.createElement("ul"));
                for ( let lay of features[attr] )
                {
                    let li = list.appendChild(document.createElement("li"));
                    for ( link of get_validation_links(lay, editor.schema) )
                    {
                        li.appendChild(link.to_element());
                        li.appendChild(document.createTextNode(" "));
                    }
                }
            }
        }

        if ( features.features.size )
        {
            has_something = true;
            parent.appendChild(document.createElement("h6")).appendChild(document.createTextNode("Features"));
            let list = parent.appendChild(document.createElement("ul"));
            for ( let feature of features.features )
            {
                let link = list.appendChild(document.createElement("li")).appendChild(document.createElement("a"));
                link.setAttribute("href", "https://canilottie.com/" + feature);
                link.appendChild(document.createTextNode(
                    feature.split("-").map(f => f[0].toUpperCase() + f.slice(1)).join(" ")
                ));
            }
        }

        if ( !has_something )
        {
            parent.appendChild(document.createElement("p")).appendChild(document.createTextNode("None Found"));
        }

    }

    let expr_variables = ["$bm_rt", "time", "value", "thisProperty", "thisComp", "thisLayer"];
    let expr_funcs = ["comp", "posterizeTime", "timeToFrames", "framesToTime", "rgbToHsl", "hslToRgb",
        "createPath", "add", "sub", "mul", "div", "mod", "clamp", "normalize", "length", "lookAt",
        "seedRandom", "random", "linear", "ease", "easeIn", "easeOut",
        "degreesToRadians", "radiansToDegrees", "$bm_sum", "sum", "$bm_sub", "$bm_div"
    ];

    let frame_slider = document.getElementById("frame_slider");
    let frame_edit = document.getElementById("frame_edit");

    let editor = new LottieJsonEditor(
        document.getElementById("editor_parent"),
        document.getElementById("info_box"),
        on_lottie_update
    );

    const search_by_json_cmd = search_by_json_factory();

    let worker = new LottieJsonWorker();
    worker.on("schema_loaded", (data) => {
        editor.set_schema(Object.assign(new SchemaData(), data.schema));
        editor.expression_completions.load_completions(data.expressions)
        if ( lottie_player.lottie )
            worker.update(lottie_player.lottie);
    });
    worker.on("result", data => editor.end_load(data.result));

    document.body.addEventListener("click", e => {
        if (
            !e.target.closest(".info_box_trigger") &&
            !editor.info_box.element.contains(e.target)
        )
        {
            editor.hide_info_box_tooltip();
        }
    });

    var lottie_player = new LottiePlayer("lottie_target", undefined);

    let error_container = document.getElementById("error_alert");
    let loading_div = document.getElementById("loading_alert");

    var data = playground_get_data();
    if ( data )
    {
        if ( data[0] == "{" )
            lottie_string_input(data, true);
        else
            lottie_url_input(data);
    }
    else if (window.location.search != '' )
    {
        let url = (new URL(window.location)).searchParams.get("url");
        if ( url )
            lottie_url_input(url);
    }
    else
    {
        action_new();
    }

    let key_bindings_parent = document.getElementById("key_bindings");
    let platform = "linux";
    let mod = "Ctrl";
    if ( navigator.platform.indexOf("Mac") != -1 )
    {
        platform = "mac";
        mode = "Cmd";
    }
    else if ( navigator.platform.indexOf("Win") != -1 )
    {
        platform = "win";
    }

    for ( arr of editor.view.state.field(CodeMirrorWrapper.keymap) )
    {
        for ( key of arr )
        {
            let seq = key[platform] ?? key.key;
            if ( seq && key.run.name )
            {
                let row = key_bindings.appendChild(document.createElement("tr"));
                row.appendChild(document.createElement("th"))
                .appendChild(document.createTextNode(seq.replace("Mod", mod)));

                let cmd = key.run.name.replace(/[A-Z]/g, l => " " + l)
                .replace(/^[a-z]/, l => l.toUpperCase());
                row.appendChild(document.createElement("td"))
                .appendChild(document.createTextNode(cmd));
            }
        }
    }
</script>
