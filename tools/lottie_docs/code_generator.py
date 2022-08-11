import re
import sys
import json
from pathlib import Path

from .schema import Schema, SchemaPath
from .default import default_schema


class TypeReference:
    def __init__(self, module, name, ref):
        self.module = module
        self.name = name
        self.ref = ref

    @property
    def key(self):
        return self.module + "." + self.name

    def __str__(self):
        return self.key

    @staticmethod
    def from_ref(ref):
        split = ref.split("/")
        return TypeReference(split[-2], split[-1], ref)

class SchemaItem:
    def __init__(self, schema: Schema):
        self.schema = schema

    @property
    def title(self):
        return self.schema.get("title", "")

    @property
    def description(self):
        return self.schema.get("description", "")


class Type(SchemaItem):
    def __init__(self, reference: TypeReference, schema: Schema):
        super().__init__(schema)
        self.reference = reference


class Class(Type):
    class Property(SchemaItem):
        def __init__(self, key: str, schema: Schema):
            super().__init__(schema)
            self.key = key
            self.type = TypeReference.from_ref(schema["$ref"]) if "$ref" in schema else schema.get("type")
            self.required = False


    def __init__(self, reference: TypeReference, schema: Schema):
        super().__init__(reference, schema)
        self.bases = []
        self.properties = []
        self.property_dict = {}
        required = set()
        if "allOf" in schema:
            for base in schema.child("allOf"):
                if "$ref" in base:
                    self.bases.append(TypeReference.from_ref(base["$ref"]))
                elif "properties" in base:
                    self._gather_props(base, required)

        if "properties" in schema:
            self._gather_props(schema, required)

        for prop in self.properties:
            prop.required = prop.key in required

    def _gather_props(self, schema, required):
        for k, v in schema.child("properties").items():
            prop = self.Property(k, v)
            self.properties.append(prop)
            self.property_dict[k] = prop

        for req in schema.get("required", []):
            required.add(req)


class Enum(Type):
    class Value(SchemaItem):
        def __init__(self, schema):
            super().__init__(schema)
            self.name = self.title
            self.value = self.schema.get("const")

        @property
        def valid(self):
            return self.name and self.value is not None

    def __init__(self, reference: TypeReference, schema: Schema, values: list):
        super().__init__(reference, schema)
        self.values = values


class Effect(Class):
    def __init__(self, reference: TypeReference, schema: Schema):
        super().__init__(reference, schema)
        self.effect_controls = []
        if "ef" in self.property_dict:
            for item in self.property_dict["ef"].schema / "prefixItems":
                self.effect_controls.append(self.Property(item.get("title"), item))



class LottieCodeGenerator:
    camel_re = re.compile(r"[\s_]+([^\s_])");
    snake_re = re.compile(r"\s+");
    anti_camel_re = re.compile(r"([a-z])([A-Z])");

    def __init__(self, schema: Schema):
        self.schema = schema

    @classmethod
    def default(cls):
        return cls(default_schema())

    def run(self):
        """
        Visits all the definitions in the schema
        """
        for module_name, module_schema in self.schema.child("$defs").items():
            self.on_module(module_name, module_schema)

    def on_module(self, module_name, module_schema):
        self.on_module_start(module_name, module_schema)
        ref_base = "#/$defs/" + module_name + "/"
        for class_name, class_schema in module_schema.items():
            self.on_type(TypeReference(module_name, class_name, ref_base + class_name), class_schema)
        self.on_module_start(module_name, module_schema)

    def run_item(self, ref):
        """
        Visits a single item, based on its $ref
        """
        self.on_type(TypeReference.from_ref(ref), self.schema.get_ref(SchemaPath(ref)))

    def run_module(self, ref):
        """
        Visits a single modulem by its $ref
        """
        path = SchemaPath(ref)
        module_name = path.chunks[-1]
        module_schema = self.schema.get_ref(path)
        return self.on_module(module_name, module_schema)

    def on_type(self, ref: TypeReference, schema: Schema):
        """
        Invoked on a definition
        """
        if "oneOf" in schema:
            values = list(map(Enum.Value, schema["oneOf"]))
            if all(v.valid for v in values):
                return self.on_enum(Enum(ref, schema, values))

        type = schema.get("type", "object")
        if type == "array":
            return self.on_array(Type(ref, schema))
        elif type != "object":
            return self.on_unknown(Type(ref, schema))

        item_type = Class
        if ref.module == "effects" and ref.name != "effect":
            item_type = Effect

        self.on_class(item_type(ref, schema))

    def on_module_start(self, name: str, schema: Schema):
        """
        Invoked on a new module, before anything defined in it
        """
        pass

    def on_module_end(self, name: str, schema: Schema):
        """
        Invoked on a module, after everything defined in it
        """
        pass

    def on_enum(self, item: Enum):
        """
        Invoken when an enumeration has been found
        """
        pass

    def on_class(self, item: Class):
        """
        Invoken when a class has been found
        """
        pass

    def on_array(self, item: Type):
        """
        Invoked on array type definitions
        """
        pass

    def on_unknown(self, item: Type):
        """
        Invoked on unknown definitions, which should never happen
        """
        pass

    @classmethod
    def title_to_camel(cls, title, upper=True):
        "Converts a title to CamelCase"
        title = cls.camel_re.sub(lambda m: m.group(1).upper(), title)
        pre = title[0]
        return (pre.upper() if upper else pre.lower()) + title[1:]

    @classmethod
    def title_to_snake(cls, title):
        "Converts a title to snake_case"
        return cls.anti_camel_re.sub(
            lambda m: m.group(1) + "_" + m.group(2),
            cls.snake_re.sub("_", title)
        ).lower()



class ExampleGenerator(LottieCodeGenerator):
    """
    Very basic example that prints definitions on stdout
    """
    def on_type(self, ref: TypeReference, schema: Schema):
        super().on_type(ref, schema)
        sys.stdout.write("\n")

    def on_class(self, item: Class):
        sys.stdout.write("%s.%s" % (item.reference.module, self.title_to_camel(item.title)))

        if item.bases:
            sys.stdout.write(" (")
            sys.stdout.write(", ".join(b.key for b in item.bases))
            sys.stdout.write(")")

        sys.stdout.write(":\n")

        if isinstance(item, Effect):
            for prop in item.effect_controls:
                sys.stdout.write("    %s: %s\n" % (
                    self.title_to_snake(prop.title),
                    prop.type
                ))
        elif item.properties:
            for prop in item.properties:
                sys.stdout.write("    %s %s: %s\n" % (
                    prop.key,
                    self.title_to_snake(prop.title),
                    prop.type
                ))
        else:
            sys.stdout.write("    (empty)\n")


    def on_enum(self, item: Enum):
        sys.stdout.write("%s.%s:\n" % (item.reference.module, self.title_to_camel(item.title)))
        for value in item.values:
            sys.stdout.write("    %s = %s\n" % (self.title_to_camel(value.name), value.value))

    def on_unknown(self, item: Type):
        raise Exception(item.ref)


    def on_array(self, item: Type):
        sys.stdout.write("%s.%s:\n" % (item.reference.module, self.title_to_camel(item.title)))
        sys.stdout.write("    (array)\n")


if __name__ == "__main__":
    what = sys.argv[1] if len(sys.argv) > 1 else ""
    generator = ExampleGenerator.default()
    if not what:
        generator.run()
    else:
        if what.strip("#/").replace("$defs/", "").count("/"):
            generator.run_item(what)
        else:
            generator.run_module(what)
