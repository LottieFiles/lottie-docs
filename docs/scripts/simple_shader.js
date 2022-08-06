class SimpleShader
{
    constructor(canvas)
    {
        this.canvas = canvas;
        this.gl = canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if ( !this.gl )
            throw new Error("Your browser doesn't support WebGL");

        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

        this.buffer = null;
        this.program = null;
        this.textures = {};
        this.max_texture = 0;
    }

    destroy()
    {
        this.uniforms = {};
        this.gl.useProgram(null);

        if ( this.buffer )
            this.gl.deleteBuffer(this.buffer);

        if ( this.program )
            this.gl.deleteProgram(this.program);

    }

    compile_shader(source, type)
    {
        const gl = this.gl;
        const shader = gl.createShader(gl[type]);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if ( !compiled )
        {
            const errors = gl.getShaderInfoLog(shader).split("\n");
            const lines = source.split("\n");
            gl.deleteShader(shader);
            throw new Error(`Couldn't compile ${type}:\n` + errors.map(e => {
                let match = e.match(/([0-9]+):([0-9]+):/);
                if ( match )
                    return lines[Number(match[2]) - 1] + "\n" + e;
                return e;
            }).join("\n"));
        }

        return shader;
    }

    set_shader(fragment_source)
    {
        let vertex_source;

        if ( fragment_source.indexOf("#version 300 es") != -1 )
            vertex_source =
            `   #version 300 es
                in vec2 position;

                void main() {
                    gl_Position = vec4(position, 0, 1.0);
                }
            `;
        else
            vertex_source =
            `   #version 100
                attribute vec2 position;

                void main() {
                    gl_Position = vec4(position, 0, 1.0);
                }
            `;
        const gl = this.gl;
        const vertex_shader = this.compile_shader(vertex_source, "VERTEX_SHADER");
        const fragment_shader = this.compile_shader(fragment_source, "FRAGMENT_SHADER");
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertex_shader);
        gl.attachShader(this.program, fragment_shader);
        gl.linkProgram(this.program);
        gl.detachShader(this.program, vertex_shader);
        gl.detachShader(this.program, fragment_shader);
        gl.deleteShader(vertex_shader);
        gl.deleteShader(fragment_shader);
        if ( !gl.getProgramParameter(this.program, gl.LINK_STATUS) )
        {
            const msg = gl.getProgramInfoLog(this.program);
            this.destroy();
            throw new Error(`Shader error: ${msg}`);
        }

        this.initialize_attributes();
    }

    render(clear = true)
    {
        if ( clear )
        {
            this.gl.clearColor(0, 0, 0, 0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        }

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    initialize_attributes()
    {
        this.buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array([
                -1.0, -1.0,
                1.0, -1.0,
                -1.0,  1.0,
                -1.0,  1.0,
                1.0, -1.0,
                1.0,  1.0
            ]),
            this.gl.STATIC_DRAW
        );

        this.gl.useProgram(this.program);
        var position = this.gl.getAttribLocation(this.program, "position");
        this.gl.enableVertexAttribArray(this.position);
        this.gl.vertexAttribPointer(this.position, 2, this.gl.FLOAT, false, 0, 0);

        const canvas_size = this.gl.getUniformLocation(this.program, "canvas_size");
        this.gl.uniform2fv(canvas_size, [this.canvas.width, this.canvas.height]);

        this.texture(SimpleShader.image_url).bind("texture_sampler");

        this.uniforms = {};
    }


    set_uniform(name, type, value)
    {
        if ( !(name in this.uniforms) )
        {
            let location = this.gl.getUniformLocation(this.program, name);
            let setter = this.gl["uniform" + type].bind(this.gl);
            this.uniforms[name] = {location, setter};
        }

        let uniform = this.uniforms[name];
        uniform.setter(uniform.location, value);
    }

    texture(url)
    {
        if ( !(url in this.textures) )
            this.textures[url] = SimpleShader.texture_factory.loader(url).texture(this);
        return this.textures[url];
    }
}

class TextureLoader
{
    constructor(image_url)
    {
        this.image_loaded = false;
        this.waiting = [];
        this.image_url = image_url;

        this.image = new Image();
        this.image.addEventListener("load", this.on_image_loaded.bind(this));
        this.image.src = image_url;
    }

    on_image_loaded()
    {
        this.image_loaded = true;
        for ( let texture of this.waiting )
        {
            texture.apply_image(this.image);
            texture.shader.render();
        }
        this.waiting = [];
    }

    texture(shader)
    {
        return new Texture(shader, this);
    }
}

class Texture
{
    constructor(shader, loader)
    {
        this.shader = shader;
        this.index = shader.max_texture++;

        const gl = this.shader.gl;
        gl.activeTexture(gl.TEXTURE0 + this.index);
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        if ( !loader.image_loaded )
        {
            // Placeholder until image is loaded
            const width = 1;
            const height = 1;
            const pixel = new Uint8Array([0, 0, 255, 255]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

            loader.waiting.push(this);
        }
        else
        {
            this.apply_image(loader.image);
        }
    }

    apply_image(image)
    {
        const gl = this.shader.gl;
        gl.activeTexture(gl.TEXTURE0 + this.index);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        // gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    bind(uniform_name)
    {
        const uniform_location = this.shader.gl.getUniformLocation(this.shader.program, uniform_name);
        this.shader.gl.uniform1i(uniform_location, this.index);
    }
}

class TextureFactory
{
    constructor()
    {
        this.loaders = {};
    }

    loader(url)
    {
        if ( !(url in this.loaders) )
            this.loaders[url] = new TextureLoader(url);

        return this.loaders[url];
    }
}

SimpleShader.texture_factory = new TextureFactory();
SimpleShader.image_url = "/lottie-docs/examples/blep.png";
