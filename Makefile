# Executable names
PIP ?= pip
PYTHON ?= python
MKDOCS ?= PYTHONPATH="$(SOURCE_DIR)/extensions" mkdocs

# Paths
SOURCE_DIR = $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
OUTPUT_DIR ?= $(CURDIR)/site

.PHONY: all install_dependencies docs docs_serve



all: docs

docs:
	$(MKDOCS) build -f $(SOURCE_DIR)/mkdocs.yml -d $(OUTPUT_DIR)

docs_serve:
	$(MKDOCS) serve -f $(SOURCE_DIR)/mkdocs.yml

install_dependencies:
	$(PIP) install -r $(SOURCE_DIR)/requirements.txt
