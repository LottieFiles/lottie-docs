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
    constructor(closed=true)
    {
        this.points = [];
        this.closed = closed;
    }

    static from_lottie(data)
    {
        let bez = new Bezier();
        bez.closed = !!data.c;
        for ( let i = 0; i < data.v.length; i++ )
        {
            bez.add_vertex(...data.v[i])
                .set_in_tangent(...data.i[i])
                .set_out_tangent(...data.o[i]);
        }
        return bez;
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
        return BezierSegment.from_bezier_points(p1, p1.out_tangent, p2.in_tangent, p2);
    }

    inverted_segment(index)
    {
        let p1 = this.points[index];
        let p2 = this.points[(index + 1) % this.points.length];
        return BezierSegment.from_bezier_points(p2, p2.in_tangent, p1.out_tangent, p1);
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

    add_segment(segment, merge_start)
    {
        let v = merge_start  && this.points.length ?
            this.points[this.points.length - 1] :
            this.add_vertex(segment.points[0])
        ;

        v.set_out_tangent(segment.points[1].sub(segment.points[0]));

        this.add_vertex(segment.points[3])
            .set_in_tangent(segment.points[2].sub(segment.points[3]));
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
        this.length_data = [];
        this.length = -1;
    }

    get start()
    {
        return this.points[0];
    }

    get end()
    {
        return this.points[3];
    }

    static from_bezier_points(start, tan1, tan2, end)
    {
        let k0 = start.pos;
        let k1;
        let k2;
        let k3 = end.pos;
        if ( tan1.is_origin() && tan2.is_origin() )
        {
            k1 = lerp(start.pos, end.pos, 1/3);
            k2 = lerp(start.pos, end.pos, 2/3);
        }
        else
        {
            k1 = start.pos.add(tan1);
            k2 = end.pos.add(tan2);
        }

        return new BezierSegment(k0, k1, k2, k3);
    }

    point(t)
    {
        return this.a.mul(t).add(this.b).mul(t).add(this.c).mul(t).add(this.d);
    }

    value(t)
    {
        return this.point(t);
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
            if ( t_cusp > 0 && t_cusp < 1 )
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
        for ( let t of quadratic_roots(3 * this.a[comp], 2 * this.b[comp], this.c[comp]) )
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

    calculate_length_data(chunks = 22)
    {
        if ( this.length_data.length >= chunks )
            return this.length_data;

        let last_point = this.points[0];
        this.length = 0;
        this.length_data = [];
        for ( let i = 1; i <= chunks; i++ )
        {
            let t = i / chunks;
            let point = this.point(t);
            this.length += point.distance(last_point);
            this.length_data.push([t, this.length]);
            last_point = point;
        }

        return this.length_data;
    }

    get_length(chunks)
    {
        this.calculate_length_data(chunks);
        return this.length;
    }

    t_at_length(length, chunks)
    {
        this.calculate_length_data(chunks);

        if ( length <= 0 )
            return 0;

        let prev_t = 0;
        let prev_len = 0;

        for ( let [t, len] of this.length_data )
        {
            if ( len > length )
            {
                let f = (length - prev_len) / (len - prev_len);
                return prev_t * (1 - f) + t * f;
            }

            prev_t = t;
            prev_len = len;
        }

        return 1;
    }

    t_at_length_percent(percent, chunks)
    {
        this.calculate_length_data(chunks);

        if ( this.length_data.length == 0 && chunks <= 0 )
            return percent;

        return this.t_at_length(this.length * percent, chunks);
    }

    t_at_x(x)
    {
        return filter_roots(cubic_roots(this.a.x, this.b.x, this.c.x, this.d.x - x))[0];
    }

    y_at_x(x)
    {
        return this.value(this.t_at_x(x)).y;
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


// Filters roots so they are in [0, 1]
function filter_roots(roots)
{
    return roots.map(r => {
        if ( fuzzy_zero(r) )
            return 0;
        if ( fuzzy_compare(r, 1) )
            return 1;
        if ( 0 <= r && r <= 1 )
            return r;
        return null;
    }).filter(r => r !== null);
}

// Returns the real cube root of a value
function cuberoot(v)
{
    if ( v < 0 )
        return -Math.pow(-v, 1/3);
    return Math.pow(v, 1/3);
}

/*
 * Solves
 *      a x^3 + b x^2 + c x + d = 0
 * Returns only solutions in [0, 1]
 */
function cubic_roots(a, b, c, d)
{
    // If a is 0, it's a quadratic
    if ( fuzzy_zero(a) )
        return quadratic_roots(b, c, d);

    // Cardano's algorithm.
    b /= a;
    c /= a;
    d /= a;

    let p = (3*c - b * b) / 3;
    let p3 = p / 3;
    let q = (2 * b*b*b - 9 * b * c + 27 * d) / 27;
    let q2 = q / 2;
    let discriminant = q2 * q2 + p3 * p3 * p3;

    // and some variables we're going to use later on:

    // 3 real roots:
    if ( discriminant < 0)
    {
        let mp3  = -p / 3;
        let r = Math.sqrt(mp3*mp3*mp3);
        let t = -q / (2*r);
        let cosphi = t < -1 ? -1 : t > 1 ? 1 : t;
        let phi  = Math.acos(cosphi);
        let crtr = cuberoot(r);
        let t1   = 2 * crtr;
        let root1 = t1 * Math.cos(phi / 3) - b / 3;
        let root2 = t1 * Math.cos((phi + 2 * Math.PI) / 3) - b / 3;
        let root3 = t1 * Math.cos((phi + 4 * Math.PI) / 3) - b / 3;
        return [root1, root2, root3];
    }

    // 2 real roots
    if ( fuzzy_zero(discriminant) )
    {
        let u1 = q2 < 0 ? cuberoot(-q2) : -cuberoot(q2);
        let root1 = 2*u1 - b / 3;
        let root2 = -u1 - b / 3;
        return [root1, root2];
    }

    // 1 real root, 2 complex roots
    let sd = Math.sqrt(discriminant);
    let u1 = cuberoot(sd - q2);
    let v1 = cuberoot(sd + q2);
    return [u1 - v1 - b / 3];
}


/*
 * Solves
 *      a x^2 + b x + c = 0
 */
function quadratic_roots(a, b, c)
{
    // linear
    if ( fuzzy_zero(a) )
    {
        if ( fuzzy_zero(b) )
            return [];

        return [-c / b];
    }

    let s = b * b - 4 * a * c;

    // Complex roots
    if ( s < 0 )
        return [];

    let single_root = -b / (2 * a);

    // 1 root
    if ( fuzzy_zero(s) )
        return [single_root];

    let delta = Math.sqrt(s) / (2 * a);

    // 2 roots
    return [single_root - delta, single_root + delta];
}
