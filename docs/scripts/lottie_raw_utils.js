class LottiePlayer
{
    constructor(container, lottie, auto_load=true)
    {
        if ( typeof container == "string" )
            this.container = document.getElementById(container);
        else
            this.container = container;

        this.lottie = lottie;

        this.anim = null;

        if ( auto_load )
            this.reload();
    }

    reload()
    {
        var options = {
            container: this.container,
            renderer: 'svg',
            loop: true,
            autoplay: true,
        };

        this.on_reload();

        if ( typeof this.lottie == "string" )
            options.path = this.lottie;
        else
            // parse/stringify because the player modifies the passed object
            options.animationData = lottie_clone(this.lottie);

        if ( this.anim != null )
            this.clear();

        this.anim = bodymovin.loadAnimation(options);
    }

    play()
    {
        this.anim.play();
    }

    pause()
    {
        this.anim.pause();
    }

    on_reload()
    {
    }

    clear()
    {
        try {
            this.anim.destroy();
            this.anim = null;
        } catch ( e ) {}
    }
}

class PlaygroundPlayer extends LottiePlayer
{
    constructor(id, container, lottie, update_func)
    {
        super(container, lottie, false);
        this.id = id;
        this.update_func = update_func.bind(this);
        this.json_viewer_contents = undefined;
        this.reload();
        // need to defer to wait for hljs to load
//         window.addEventListener("load", this.show_json.bind(this));
    }

    on_reload()
    {
        var data = Object.fromEntries(
            Array.from(document.querySelectorAll(`*[data-lottie-input='${this.id}']`))
            .map(a => {
                var value = a.value;
                if ( ["number", "range"].includes(a.type) )
                    value = Number(a.value);
                else if ( a.type == "checkbox" )
                    value = a.checked;
                return [a.name, value];
            })
        );
        this.update_func(this.lottie, data);
        this.show_json();
    }

    show_json()
    {
        if ( this.json_viewer_contents !== undefined ) //&& typeof hljs !== "undefined" )
        {
            var raw_json = JSON.stringify(this.json_viewer_contents, undefined, 4);
            var pretty_json = hljs.highlight("json", raw_json).value;
            document.getElementById(`json_viewer_${this.id}`).innerHTML = pretty_json;
        }
    }
}


function lottie_clone(json)
{
    return JSON.parse(JSON.stringify(json));
}


function syntax_edit_update(element, text)
{
    let result_element = element.parentElement.querySelector("code");
    if ( text[text.length-1] == "\n" )
        text += " ";
    result_element.innerHTML = hljs.highlight(element.dataset.lang, text).value;
}

function syntax_edit_scroll(element)
{
    let result_element = element.parentElement.querySelector("pre");
    result_element.scrollTop = element.scrollTop;
    result_element.scrollLeft = element.scrollLeft;
}

function syntax_edit_tab(element, event)
{
    let code = element.value;
    if ( event.key == "Tab" )
    {
        event.preventDefault();
        let before_tab = code.slice(0, element.selectionStart);
        let after_tab = code.slice(element.selectionEnd, element.value.length);
        let cursor_pos = element.selectionEnd + 4;
        element.value = before_tab + "    " + after_tab;
        element.selectionStart = cursor_pos;
        element.selectionEnd = cursor_pos;
        syntax_edit_update(element, element.value);
    }
}

