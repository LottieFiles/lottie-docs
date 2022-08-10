import sys
import json
from pathlib import Path

from .schema_lib import Schema, SchemaPath


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

class SchemaItemHelper:
    def __init__(self, schema: Schema):
        self.schema = schema

    @property
    def title(self):
        return self.schema.get("title", "")

    @property
    def description(self):
        return self.schema.get("description", "")


class TypeHelper(SchemaItemHelper):
    def __init__(self, reference: TypeReference, schema: Schema):
        super().__init__(schema)
        self.reference = reference


class ClassHelper(TypeHelper):
    class Property(SchemaItemHelper):
        def __init__(self, key: str, schema: Schema):
            super().__init__(schema)
            self.key = key
            self.type = TypeReference.from_ref(schema["$ref"]) if "$ref" in schema else schema.get("type")
            self.required = False


    def __init__(self, reference: TypeReference, schema: Schema):
        super().__init__(reference, schema)
        self.bases = []
        self.properties = []
        required = set()
        if "allOf" in schema:
            for base in schema["allOf"]:
                if "$ref" in base:
                    self.bases.append(TypeReference.from_ref(base["$ref"]))
                elif "properties" in base:
                    self._gather_props(base, self.properties, required)

        if "properties" in schema:
            self._gather_props(schema, self.properties, required)

        for prop in self.properties:
            prop.required = prop.key in required

    def _gather_props(self, schema, props, required):
        for k, v in schema["properties"].items():
            props.append(self.Property(k, v))

        for req in schema.get("required", []):
            required.add(req)


class EnumHelper(TypeHelper):
    class Value(SchemaItemHelper):
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



class LottieCodeGenerator:
    def __init__(self, schema: Schema):
        self.schema = schema

    @classmethod
    def default(cls):
        with open(Path(__file__).parent.parent / "docs" / "schema" / "lottie.schema.json", "r") as f:
            return cls(Schema(json.load(f)))

    def run(self):
        """
        Visits all the definitions in the schema
        """
        for module_name, module_schema in self.schema["$defs"].items():
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
            values = list(map(EnumHelper.Value, schema["oneOf"]))
            if all(v.valid for v in values):
                return self.on_enum(EnumHelper(ref, schema, values))

        type = schema.get("type", "object")
        if type == "array":
            return self.on_array(TypeHelper(ref, schema))
        elif type != "object":
            return self.on_unknown(TypeHelper(ref, schema))

        helper_type = ClassHelper

        self.on_class(helper_type(ref, schema))

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

    def on_enum(self, helper: EnumHelper):
        """
        Invoken when an enumeration has been found
        """
        pass

    def on_class(self, helper: ClassHelper):
        """
        Invoken when a class has been found
        """
        pass

    def on_array(self, helper: TypeHelper):
        """
        Invoked on array type definitions
        """
        pass

    def on_unknown(self, helper: TypeHelper):
        """
        Invoked on unknown definitions, which should never happen
        """
        pass


class ExampleGenerator(LottieCodeGenerator):
    """
    Very basic example that prints definitions on stdout
    """
    def on_class(self, helper: ClassHelper):
        sys.stdout.write("%s %s" % (helper.reference, helper.title))

        if helper.bases:
            sys.stdout.write(" (")
            sys.stdout.write(", ".join(b.key for b in helper.bases))
            sys.stdout.write(")")

        sys.stdout.write(":\n")

        if helper.properties:
            for prop in helper.properties:
                sys.stdout.write("    %s %s: %s\n" % (
                    prop.key,
                    prop.title,
                    prop.type
                ))
        else:
            sys.stdout.write("    (empty)\n")


    def on_enum(self, helper: EnumHelper):
        sys.stdout.write("%s %s:\n" % (helper.reference, helper.title))
        for value in helper.values:
            sys.stdout.write("    %s = %s\n" % (value.name, value.value))

    def on_unknown(self, helper: TypeHelper):
        raise Exception(ref.ref)


    def on_array(self, helper: TypeHelper):
        sys.stdout.write("%s %s:\n" % (helper.reference, helper.title))
        sys.stdout.write("    (array)\n")
