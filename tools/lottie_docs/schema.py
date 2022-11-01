import json
import pathlib

class SchemaPath:
    """
    Path inside a Schema object
    """
    def __init__(self, path=None):
        if isinstance(path, str):
            self.chunks = path.strip("#/").split("/")
        elif path is None:
            self.chunks = []
        elif isinstance(path, SchemaPath):
            self.chunks = list(path.chunks)
        else:
            self.chunks = list(path)

    def __itruediv__(self, chunk):
        self.chunks.append(chunk)

    def __truediv__(self, chunk):
        return SchemaPath(self.chunks + [chunk])

    def walk(self, schema):
        for chunk in self.chunks:
            if not self.valid_step(schema, chunk):
                return None
            schema = self.step(schema, chunk)
        return schema

    @classmethod
    def step(cls, schema, chunk):
        return schema[chunk]

    @classmethod
    def valid_step(cls, schema, chunk):
        if isinstance(chunk, int) and (not isinstance(schema, list) or len(schema) <= chunk):
            return False
        elif chunk not in schema:
            return False
        return True

    def __str__(self):
        return "#/" + "/".join(map(str, self.chunks))


class Schema:
    """
    Class to access data from a JSON schema
    """
    def __init__(self, schema, path=None):
        self.schema = schema
        self.path = SchemaPath(path)

    def __getitem__(self, key):
        return self.child(key).value

    def __truediv__(self, key):
        return self.child(key)

    def __contains__(self, item):
        return isinstance(self.schema, dict) and item in self.schema

    def get(self, key, default=None):
        return self.schema.get(key, default) if isinstance(self.schema, dict) else default

    @property
    def value(self):
        return self.schema

    def __iter__(self):
        if isinstance(self.schema, list):
            iter = enumerate(self.schema)
        elif isinstance(self.schema, dict):
            iter = self.schema.items()
        else:
            return

        for key, value in iter:
            if isinstance(value, (object, list)):
                yield self / key

    def get_ref(self, path):
        path = SchemaPath(path)
        obj = path.walk(self)
        if obj is None:
            raise Exception("Schema object %s not found" % path)
        return Schema(obj, path)

    def items(self):
        if isinstance(self.schema, dict):
            for k, v in self.schema.items():
                yield k, Schema(v, self.path / k)
        return None

    def child(self, key):
        return Schema(SchemaPath.step(self.schema, key), self.path / key)


def join_parts(
    path: pathlib.Path,
    root_ref="#/$defs/animation/animation",
    id="https://lottiefiles.github.io/lottie-docs/schema/lottie.schema.json",
    schema="https://json-schema.org/draft/2020-12/schema"
):
    json_data = {
        "$schema": schema,
        "$id": id,
        "type": "object",
        "allOf": [{
            "$ref": root_ref
        }]
    }

    defs = {}
    for subdir in sorted(path.iterdir()):
        dir_schema = {}
        if subdir.is_dir():
            for file_item in subdir.iterdir():
                if file_item.is_file() and file_item.suffix == ".json":
                    with open(file_item, "r") as file:
                        try:
                            file_schema = json.load(file)
                        except Exception:
                            print(file_item)
                            raise
                    file_schema.pop("$schema", None)
                    dir_schema[file_item.stem] = file_schema
            defs[subdir.name] = dir_schema

    json_data["$defs"] = defs

    return json_data
