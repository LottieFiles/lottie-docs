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

    segment(index)
    {
        let p1 = this.points[index];
        let p2 = this.points[(index + 1) % this.points.length];
        return new BezierSegment(p1, p2);
    }

    segment_count()
    {
        return this.closed ? this.points.length : this.points.length - 1;
    }
}

class BezierSegment
{
    constructor(start, end)
    {
        let k0 = start.pos;
        let k1;
        let k2;
        let k3 = end.pos;
        if ( start.out_tangent.is_origin() && end.in_tangent.is_origin() )
        {
            k1 = lerp(start.pos, end.pos, 1/3);
            k2 = lerp(start.pos, end.pos, 2/3);
        }
        else
        {
            k1 = start.pos.add(start.out_tangent);
            k2 = end.pos.add(end.in_tangent);
        }
        this.a = this._a(k0, k1, k2, k3);
        this.b = this._b(k0, k1, k2);
        this.c = this._c(k0, k1);
        this.d = this._d(k0);
        this.start = start;
        this.end = end;
    }

    point(t)
    {
        return this.a.mul(t).add(this.b).mul(t).add(this.c).mul(t).add(this.d);
    }

    derivative(t)
    {
        return this.a.mul(3 * t).add(this.b.mul(2)).mul(t).add(this.c);
    }

    tangent_angle(t)
    {
        let p = this.derivative(t);
        return Math.atan2(p.x, p.y);
    }

    _a(k0, k1, k2, k3)
    {
        return k0.neg().add(k1.mul(3)).add(k2.mul(-3)).add(k3);
    }

    _b(k0, k1, k2)
    {
        return k0.mul(3).add(k1.mul(-6)).add(k2.mul(3));
    }

    _c(k0, k1)
    {
        return k0.mul(-3).add(k1.mul(3));
    }

    _d(k0)
    {
        return k0;
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

    is_origin()
    {
        return this.x == 0 && this.y == 0;
    }
}
