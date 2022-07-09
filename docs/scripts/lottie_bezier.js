class BezierPoint
{
    constructor(x, y)
    {
        this.pos = new Point(x, y);
        this.in_tangent = new Point(0, 0);
        this.out_tangent = new Point(0, 0);
    }

    set_in_tangent(x, y)
    {
        this.in_tangent = new Point(x, y);
        return this;
    }

    set_out_tangent(x, y)
    {
        this.out_tangent = new Point(x, y);
        return this;
    }
}

class Bezier
{
    constructor()
    {
        this.points = [];
        this.closed = true;
    }

    add_vertex(x, y)
    {
        let point = new BezierPoint(x, y);
        this.points.push(point);
        return point;
    }

    to_lottie()
    {
        let lot = {
            c: this.closed,
            v: [],
            i: [],
            o: []
        };

        for ( let p of this.points )
        {
            lot.v.push(p.pos.to_lottie());
            lot.i.push(p.in_tangent.to_lottie());
            lot.o.push(p.out_tangent.to_lottie());
        }

        return lot;
    }
}


function lerp(p0, p1, amount)
{
    if ( p0 instanceof Point )
        return new Point(lerp(p0.x, p1.x, amount), lerp(p0.y, p1.y, amount));

    return p0 * (1 - amount) + p1 * amount;
}


class Point
{
    constructor(x, y)
    {
        if ( Array.isArray(x) )
        {
            [this.x, this.y] = x;
        }
        else if ( x instanceof Point )
        {
            this.x = x.x;
            this.y = x.y;
        }
        else
        {
            this.x = x;
            this.y = y;
        }
    }

    add(...args)
    {
        let other = new Point(...args);
        other.x += this.x;
        other.y += this.y;
        return other;
    }

    sub(...args)
    {
        let other = new Point(...args);
        other.x = this.x - other.x;
        other.y = this.y - other.y;
        return other;
    }

    length()
    {
        return Math.hypot(this.x, this.y);
    }

    copy()
    {
        return new Point(this);
    }

    distance(...args)
    {
        return this.sub(...args).length();
    }

    mul(scalar)
    {
        return new Point(this.x * scalar, this.y * scalar);
    }

    div(scalar)
    {
        return new Point(this.x / scalar, this.y / scalar);
    }

    to_lottie()
    {
        return [this.x, this.y];
    }

    neg()
    {
        return new Point(-this.x, -this.y);
    }
}
