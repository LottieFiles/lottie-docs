import shutil
from pathlib import Path
from setuptools import setup

schema_src = Path(__file__).parent.parent / "docs" / "schema" / "lottie.schema.json"
schema_dst = Path(__file__).parent / "lottie_docs" / "lottie.schema.json"

if schema_src.exists() and (not schema_dst.exists() or schema_src.stat().st_mtime > schema_dst.stat().st_mtime):
    shutil.copy(schema_src, schema_dst)

setup(
    name="lottie-docs",
    version="1.0",
    description="Python utilities for the lottie docs",
    author="Mattia Basaglia",
    author_email="mattia.basaglia@gmail.com",
    url="https://lottiefiles.github.io/lottie-docs/",
    packages=["lottie_docs"],
    package_data={
        "lottie_docs": ["lottie.schema.json"],
    },
)
