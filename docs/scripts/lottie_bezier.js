class BezierPoint
{
    constructor(x, y)
    {
        this.pos = [x, y];
        this.in_tangent = [0, 0];
        this.out_tangent = [0, 0];
    }

    set_in_tangent(x, y)
    {
        this.in_tangent = [x, y];
        return this;
    }

    set_out_tangent(x, y)
    {
        this.out_tangent = [x, y];
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
            c: this.closed;
            v: [],
            i: [],
            o: []
        };

        for ( let p of this.points )
        {
            lot.v.push(p.pos);
            lot.i.push(p.in_tangent);
            lot.o.push(p.out_tangent);
        }

        return lot;
    }
}
