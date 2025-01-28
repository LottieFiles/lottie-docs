# Executable names
PIP ?= pip
PYTHON ?= python
MKDOCS ?= PYTHONPATH="$(SOURCE_DIR)/tools" mkdocs

# Paths
SOURCE_DIR = $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
OUTPUT_DIR ?= $(CURDIR)/site
CANIUSE_DIR ?= $(SOURCE_DIR)/../caniuse/data

.PHONY: all install_dependencies docs docs_serve lottie.schema.json validate validate_links, validate_caniuse


all: docs

lottie.schema.json:$(SOURCE_DIR)/docs/lottie.schema.json

$(SOURCE_DIR)/docs/lottie.schema.json: $(wildcard $(SOURCE_DIR)/schema/**/*.json)
	schema-merge.py

docs:$(SOURCE_DIR)/docs/lottie.schema.json
docs:$(SOURCE_DIR)/docs/scripts/blockly_generated.js
	$(MKDOCS) build -f $(SOURCE_DIR)/mkdocs.yml -d $(OUTPUT_DIR)

$(OUTPUT_DIR)/index.html:$(wildcard $(SOURCE_DIR)/docs/**/*)
$(OUTPUT_DIR)/index.html:$(SOURCE_DIR)/docs/lottie.schema.json
$(OUTPUT_DIR)/index.html:$(SOURCE_DIR)/tools/md_extensions.py
$(OUTPUT_DIR)/index.html:docs

docs_serve:$(SOURCE_DIR)/docs/lottie.schema.json
	$(MKDOCS) serve -f $(SOURCE_DIR)/mkdocs.yml

install_dependencies:
	$(PIP) install -r $(SOURCE_DIR)/requirements.txt

validate: $(SOURCE_DIR)/docs/lottie.schema.json
	schema-validate.py


validate_links:$(OUTPUT_DIR)/index.html
	schema-validate.py --html $(OUTPUT_DIR) -i assets/file-asset -i effect-values/effect-value

$(SOURCE_DIR)/docs/scripts/blockly_generated.js: $(SOURCE_DIR)/tools/generate-blockly.py
$(SOURCE_DIR)/docs/scripts/blockly_generated.js: $(SOURCE_DIR)/docs/lottie.schema.json
	$(SOURCE_DIR)/tools/generate-blockly.py

validate_caniuse: $(SOURCE_DIR)/docs/lottie.schema.json
	$(SOURCE_DIR)/tools/caniuse.py '$(CANIUSE_DIR)'
