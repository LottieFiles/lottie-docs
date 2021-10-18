Lottie Documentation
====================

This repository contains both human-readable and machine-readable documentation about the Lottie format

The documentation is available online at https://lottiefiles.github.io/lottie-docs/

License
-------

CC-BY 4.0


Setting Up
----------

This project uses `mkdocs` to generate the HTML pages from the documentation,
and `pip` to install dependencies.

It's recommended you install dependencies on some kind of virtual environment.

Once you have your environment, you can run

    pip install requirements.txt

or

    make install_dependencies


Building the Docs
-----------------

You can use

    make

To build the static HTML.

During development, you might want to use

    make docs_serve

Which spins up a local server to host the docs and automatically reloads when done
