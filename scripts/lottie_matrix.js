
class LottieMatrix
{
    constructor(elements)
    {
        this.elements = elements ?? LottieMatrix.identity();
    }

    static identity()
    {
        let mat = new Float32Array(16);
        mat[0] = mat[5] = mat[10] = mat[15] = 1;
        return mat;
    }

    static rotation_z(angle)
    {
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);
        let mat = new Float32Array(16);
        mat[0] = cos;
        mat[1] = -sin;
        mat[4] = sin;
        mat[5] = cos;

        mat[10] = mat[15] = 1;
        return mat;
    }

    static rotation_x(angle)
    {
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);
        let mat = new Float32Array(16);

        mat[5] = cos;
        mat[6] = -sin;
        mat[9] = sin;
        mat[10] = cos;

        mat[0] = mat[15] = 1;
        return mat;
    }

    static rotation_y(angle)
    {
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);
        let mat = new Float32Array(16);

        mat[0] = cos;
        mat[2] = sin;
        mat[8] = -sin;
        mat[10] = cos;

        mat[5] = mat[15] = 1;
        return mat;
    }

    static axis_skew(angle)
    {
        let mat = LottieMatrix.identity();
        mat[4] = Math.tan(angle);
        return mat;
    }

    static scale_matrix(x, y, z = 1)
    {
        let mat = new Float32Array(16);
        mat[0] = x;
        mat[5] = y;
        mat[10] = z;
        mat[15] = 1;
        return mat;
    }

    static translation(x, y, z = 0)
    {
        let mat = this.identity();
        mat[12] = x;
        mat[13] = y;
        mat[14] = z;
        return mat;
    }

    mul(matrix)
    {
        if ( matrix instanceof LottieMatrix )
            this._mul(matrix.elements);
        else
            this._mul(matrix);
    }

    _mul(matrix)
    {
        let mat = new Float32Array(16);

        for ( let row = 0; row < 4; row++ )
        {
            for ( let col = 0; col < 4; col++ )
            {
                let res = 0;
                for ( let i = 0; i < 4; i++ )
                    res += this.elements[row * 4 + i] * matrix[i * 4 + col];
                mat[row * 4 + col] = res;
            }
        }

        this.elements = mat;
    }

    map(x, y, z = 0)
    {
        return [
            x * this.elements[0] + y * this.elements[4] + z * this.elements[8] + this.elements[12],
            x * this.elements[1] + y * this.elements[5] + z * this.elements[9] + this.elements[13],
            x * this.elements[2] + y * this.elements[6] + z * this.elements[10] + this.elements[14],
        ]
    }

    rotate(angle)
    {
        this._mul(LottieMatrix.rotation_z(angle));
        return this;
    }

    rotate_x(angle)
    {
        this._mul(LottieMatrix.rotation_x(angle));
        return this;
    }

    rotate_y(angle)
    {
        this._mul(LottieMatrix.rotation_y(angle));
        return this;
    }

    rotate_z(angle)
    {
        this._mul(LottieMatrix.rotation_z(angle));
        return this;
    }

    translate(dx, dy, dz = 0)
    {
        this._mul(LottieMatrix.translation(dx, dy, dz));
        return this;
    }

    scale(sx, sy, sz = 1)
    {
        this._mul(LottieMatrix.scale_matrix(sx, sy, sz));
        return this;
    }

    skew(axis, angle)
    {
        this.rotate(-angle);
        this._mul(LottieMatrix.axis_skew(-axis));
        this.rotate(angle);
    }
}
