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
            options.animationData = JSON.parse(JSON.stringify(this.lottie));

        if ( this.anim != null )
        {
            try {
                this.anim.destroy();
            } catch ( e ) {}
        }

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
