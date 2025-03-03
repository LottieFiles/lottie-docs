class ShaderWrapper
{
    constructor(canvas)
    {
        this.canvas = canvas;
        this.gl = canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if ( !this.gl )
            throw new Error("Your browser doesn't support WebGL");

        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

        this.textures = {};
        this.max_texture = 0;

        this.shape_buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.shape_buffer);
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
    }

    destroy()
    {
        if ( this.buffer )
            this.gl.deleteBuffer(this.buffer);
    }

    render() {}

    texture(url)
    {
        if ( !(url in this.textures) )
            this.textures[url] = ShaderProgram.texture_factory.loader(url).texture(this);

        return this.textures[url];
    }
}

class MultiPassShader extends ShaderWrapper
{
    constructor(canvas)
    {
        super(canvas);
        this.passes = [];
        this.buffers = [
            new OutputTexture(this),
            new OutputTexture(this)
        ];
    }

    destroy()
    {
        for ( let program of this.passes )
            program.destroy();

        super.destroy();
    }

    add_pass(program, uniforms = {})
    {
        this.passes.push({
            program: program,
            uniforms: uniforms,
        });
    }

    render_pass(texture, pass, render_target)
    {
        if ( render_target )
            render_target.bind_buffer();

        this.gl.useProgram(pass.program.program);

        texture.set_uniform(pass.program, "texture_sampler");
        for ( let [name, [type, value]] of Object.entries(pass.uniforms) )
            pass.program.set_uniform(name, type, value);

        pass.program.render();

        if ( render_target )
            render_target.unbind_buffer();
    }

    render()
    {
        let texture = this.texture(ShaderProgram.image_url);

        for ( let i = 0; i < this.passes.length - 1; i++ )
        {
            let buffer = this.buffers[i % 2];
            this.render_pass(texture, this.passes[i], buffer);
            texture = buffer;
        }

        this.render_pass(texture, this.passes[this.passes.length - 1], null);
    }

    set_uniform(pass, name, type, value)
    {
        this.passes[pass].uniforms[name] = [type, value];
    }

    add_pass_source(source, uniforms = {})
    {
        let program = new ShaderProgram(this.gl);
        program.set_fragment(source);
        this.add_pass(program, uniforms);
    }
}

class SinglePassShader extends ShaderWrapper
{
    constructor(canvas)
    {
        super(canvas);
        this.program = new ShaderProgram(this.gl);
    }

    destroy()
    {
        this.program.destroy();
        super.destroy();
    }

    render()
    {
        this.texture(ShaderProgram.image_url).set_uniform(this.program, "texture_sampler");
        this.program.render();
    }

    set_uniform(name, type, value)
    {
        this.program.set_uniform(name, type, value);
    }

    set_fragment(fragment_source)
    {
        this.program.set_fragment(fragment_source);
    }
}

class ShaderProgram
{
    constructor(gl)
    {
        this.gl = gl;
        this.uniforms = {};
        this.position = null;
    }

    destroy()
    {
        this.uniforms = {};
        this.gl.useProgram(null);

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

    set_fragment(fragment_source)
    {
        if ( this.program )
            this.gl.deleteProgram(this.program);

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

        this.gl.useProgram(this.program);

        if ( !this.position )
        {
            this.position = this.gl.getAttribLocation(this.program, "position");
            this.gl.enableVertexAttribArray(this.position);
            this.gl.vertexAttribPointer(this.position, 2, this.gl.FLOAT, false, 0, 0);
        }

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    initialize_attributes()
    {
        this.gl.useProgram(this.program);

        const canvas_size = this.gl.getUniformLocation(this.program, "canvas_size");
        this.gl.uniform2fv(canvas_size, [this.gl.drawingBufferWidth, this.gl.drawingBufferHeight]);

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

class BaseTexture
{
    constructor(shader)
    {
        this.shader = shader;
        this.index = shader.max_texture++;

        const gl = this.shader.gl;
        gl.activeTexture(gl.TEXTURE0 + this.index);
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }

    get gl()
    {
        return this.shader.gl;
    }

    create(width, height, data)
    {
        const gl = this.shader.gl;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    }

    set_parameters()
    {
        const gl = this.shader.gl;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    set_uniform(program, uniform_name)
    {
        this.bind_texture();
        const uniform_location = this.gl.getUniformLocation(program.program, uniform_name);
        this.gl.uniform1i(uniform_location, this.index);
    }

    bind_texture()
    {
        const gl = this.shader.gl;
        gl.activeTexture(gl.TEXTURE0 + this.index);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }

    unbind_texture()
    {
        const gl = this.shader.gl;
        gl.activeTexture(gl.TEXTURE0 + this.index);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}

class Texture extends BaseTexture
{
    constructor(shader, loader)
    {
        super(shader);

        if ( !loader.image_loaded )
        {
            // Placeholder until image is loaded
            this.create(1, 1, new Uint8Array([0, 0, 255, 255]));
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
        this.set_parameters();
    }
}


class OutputTexture extends BaseTexture
{
    constructor(shader)
    {
        super(shader);

        const gl = this.shader.gl;
        this.create(gl.drawingBufferWidth, gl.drawingBufferHeight, null);
        this.set_parameters();

        this.buffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.buffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
        this.unbind_buffer();
    }

    bind_buffer()
    {
        const gl = this.shader.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.buffer);
    }

    unbind_buffer()
    {
        const gl = this.shader.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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

ShaderProgram.texture_factory = new TextureFactory();
ShaderProgram.image_url = "/lottie-docs/examples/blep.png";
