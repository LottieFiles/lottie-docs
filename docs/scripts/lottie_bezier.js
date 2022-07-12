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
        return BezierSegment.from_bezier_points(p1, p2);
    }

    segment_count()
    {
        return this.closed ? this.points.length : this.points.length - 1;
    }

    index_at_t(t)
    {
        if ( t <= 0 )
            return [0, 0];

        if ( t >= 1 )
            return [this.segment_count() - 1, 1];

        let n = this.segment_count();
        let i = 0;
        for ( i = 0; i < n; i++ )
            if ( (i+1) / n > t )
                break;

        return [i, (t - (i/n)) * n];
    }
}

function fuzzy_compare(a, b)
{
    return Math.abs(a - b) * 100000 <= Math.min(Math.abs(a), Math.abs(b));
}

function fuzzy_zero(f)
{
    return Math.abs(f) <= 0.00001;
}

class BezierSegment
{
    constructor(k0, k1, k2, k3)
    {
        this.a = this._a(k0, k1, k2, k3);
        this.b = this._b(k0, k1, k2);
        this.c = this._c(k0, k1);
        this.d = this._d(k0);
        this.points = [k0, k1, k2, k3];
    }

    get start()
    {
        return this.points[0];
    }

    get end()
    {
        return this.points[3];
    }

    static from_bezier_points(start, end)
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

        return new BezierSegment(k0, k1, k2, k3);
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
        return Math.atan2(p.y, p.x);
    }

    normal_angle(t)
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

    inflection_points()
    {
        let denom = this.a.y * this.b.x - this.a.x * this.b.y;
        if ( fuzzy_zero(denom) )
            return [];

        let t_cusp = -0.5 * (this.a.y * this.c.x - this.a.x * this.c.y) / denom;

        let square = t_cusp * t_cusp - 1/3 * (this.b.y * this.c.x - this.b.x * this.c.y) / denom;

        if ( square < 0 )
            return [];

        let root = Math.sqrt(square);
        if ( fuzzy_zero(root) )
        {
            if ( root > 0 && root < 1 )
                return [t_cusp];
            return [];
        }

        return [t_cusp - root, t_cusp + root].filter(r => r > 0 && r < 1);
    }

    split(t)
    {
        if ( t == 0 )
            return [new BezierSegment(this.start, this.start, this.start, this.start), this];

        if ( t == 1 )
            return [this, new BezierSegment(this.end, this.end, this.end, this.end)];

        let p10 = lerp(this.points[0], this.points[1], t);
        let p11 = lerp(this.points[1], this.points[2], t);
        let p12 = lerp(this.points[2], this.points[3], t);
        let p20 = lerp(p10, p11, t);
        let p21 = lerp(p11, p12, t);
        let p3 = lerp(p20, p21, t);

        return [
            new BezierSegment(this.points[0], p10, p20, p3),
            new BezierSegment(p3, p21, p12, this.points[3])
        ];
    }

    bounds()
    {
        return {
            x: this._extrema("x"),
            y: this._extrema("y"),
        };
    }

    bounding_box()
    {
        let bounds = this.bounds();

        return {
            left: bounds.x.min,
            right: bounds.x.max,
            top: bounds.y.min,
            bottom: bounds.y.max,
            width: bounds.x.max - bounds.x.min,
            height: bounds.y.max - bounds.y.min,
            cx: (bounds.x.max + bounds.x.min) / 2,
            cy: (bounds.y.max + bounds.y.min) / 2,
        }
    }

    _extrema(comp)
    {
        let min = this.start[comp];
        let max = this.end[comp];

        if ( min > max )
            [min, max] = [max, min];

        // Derivative roots to find min/max
        for ( let t of this._quad_roots(3 * this.a[comp], 2 * this.b[comp], this.c[comp]) )
        {
            if ( t > 0 && t < 1 )
            {
                let val = this.point(t)[comp];
                if ( val < min )
                    min = val;
                else if ( val > max )
                    max = val;
            }
        }

        return {
            min: min,
            max: max
        };
    }

    _quad_roots(a, b, c)
    {
        // no root
        if ( a == 0 )
            return [];

        let s = b * b - 4 * a * c;

        // Complex roots
        if ( s < 0 )
            return [];

        let single_root = -b / (2 * a);

        // 1 root
        if ( s === 0 )
            return [single_root];

        let delta = Math.sqrt(s) / (2 * a);

        // 2 roots
        return [single_root - delta, single_root + delta];
    }

    _intersect_data(t1, t2)
    {
        return {
            ...this.bounding_box(),
            bez: this,
            t1: t1,
            t2: t2,
            t: (t1 + t2) / 2
        }
    }

    static _split_data(data)
    {
        let split = data.bez.split(0.5);
        return [
            split[0]._intersect_data(data.t1, data.t),
            split[1]._intersect_data(data.t, data.t2),
        ];
    }

    intersections(other, tolerance = 2, max_recursion = 10)
    {
        let intersections = [];

        BezierSegment._intersects_impl(
            this._intersect_data(0, 1), other._intersect_data(0, 1),
            tolerance, intersections, 0, max_recursion
        );

        return intersections;
    }

    static _box_intersect(b1, b2)
    {
        return Math.abs(b1.cx - b2.cx) * 2 < b1.width + b2.width &&
               Math.abs(b1.cy - b2.cy) * 2 < b1.height + b2.height;
    }

    static _intersects_impl(d1, d2, tolerance, intersections, depth, max_recursion)
    {
        if ( !BezierSegment._box_intersect(d1, d2) )
            return;

        if ( depth >= max_recursion || (d1.width <= tolerance && d1.height <= tolerance && d2.width <= tolerance && d2.height <= tolerance) )
        {
            intersections.push([d1.t, d2.t]);
            return;
        }

        let d1s = BezierSegment._split_data(d1);
        let d2s = BezierSegment._split_data(d2);

        BezierSegment._intersects_impl(d1s[0], d2s[0], tolerance, intersections, depth + 1, max_recursion);
        BezierSegment._intersects_impl(d1s[0], d2s[1], tolerance, intersections, depth + 1, max_recursion);
        BezierSegment._intersects_impl(d1s[1], d2s[0], tolerance, intersections, depth + 1, max_recursion);
        BezierSegment._intersects_impl(d1s[1], d2s[1], tolerance, intersections, depth + 1, max_recursion);
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

    static polar(angle, length)
    {
        return new Point(Math.cos(angle) * length, Math.sin(angle) * length);
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

    add_polar(angle, length)
    {
        return new Point(this.x + Math.cos(angle) * length, this.y - Math.sin(angle) * length);
    }

    is_equal(other)
    {
        return other instanceof Point && fuzzy_compare(this.x, other.x) && fuzzy_compare(this.y, other.y);
    }
}


function cross_product(a, b)
{
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ];
}

function line_intersection(start1, end1, start2, end2)
{
    let v1 = [start1.x, start1.y, 1];
    let v2 = [end1.x, end1.y, 1];
    let v3 = [start2.x, start2.y, 1];
    let v4 = [end2.x, end2.y, 1];

    let [x, y, z] = cross_product(
        cross_product(v1, v2),
        cross_product(v3, v4)
    );

    if ( fuzzy_zero(z) )
        return null;

    return new Point(x / z, y / z);
}
