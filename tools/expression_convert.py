import sys
import json


def variable(name=None, type=None, description=None, default=None, notes=None):
    params = dict(locals())
    ret = {}
    for k, v in params.items():
        if v is not None:
            ret[k] = v
    return ret


name = ret = description = None
params = []

for line in sys.stdin:
    try:
        chunks = [c.strip() for c in line.split(":")]
        if chunks[0] == "name":
            name = chunks[1]
        elif chunks[0] == "return":
            ret = chunks[1:]
        elif chunks[0] == "param":
            params.append(chunks[1:])
        elif chunks[0] == "description":
            description = chunks[1]
        elif name:
            fdef = {}
            if description:
                fdef["description"] = description
            if params:
                fdef["params"] = [variable(*p) for p in params]
            if ret:
                fdef["return"] = variable(None, *ret)

            data = json.dumps({name: fdef}, indent=4)
            print(data[1:-2]+",")

            name = ret = description = None
            params = []
    except Exception as e:
        print(e)


