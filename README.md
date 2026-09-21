# Learning to look and search: Efficient visual exploration for embodied agents

This repository contains the LaTeX source for Adam Pardyl's Ph.D. thesis,
*Learning to look and search: Efficient visual exploration for embodied
agents*, submitted at the Jagiellonian University in 2026. The thesis studies
efficient active visual exploration, progressing from attention-guided
observation selection and adaptive Vision Transformer sampling to continuous
glimpse control and open-world vision--language-model exploration.

The main document is assembled from the chapters in `parts/`, figures in
`figures/`, bibliography entries in `main.bib`, and the included publications
in `papers/`.

## Download

[Read the thesis (PDF)](https://apardyl.github.io/phd-thesis/pdf/thesis.pdf).

## Build

Install a TeX Live distribution with LuaLaTeX and `latexmk`, then run the
following command from the repository root:

```sh
latexmk -pdflua -interaction=nonstopmode main.tex
```

The generated thesis is `main.pdf`. `latexmk` runs the required LuaLaTeX and
BibTeX passes automatically. The local TeX cache keeps generated font and
package-cache files inside `tmp/`, which is useful in sandboxed environments.

To force a complete rebuild after changing dependencies or generated inputs,
use `latexmk -g` with the same options.

## PDF/A export

The reproducible PDF/A-2b export and validation process is documented in
[`docs/pdfa-workflow.md`](docs/pdfa-workflow.md). It preserves `main.pdf` and
uses the helpers under `scripts/pdfa/` for conversion and verification.
