# Repository instructions

## Building the thesis

Compile `main.tex` from the repository root with LuaLaTeX through `latexmk`:

```sh
mkdir -p tmp/texmf-cache
TEXMFCACHE="$PWD/tmp/texmf-cache" \
TEXMFVAR="$PWD/tmp/texmf-cache" \
VARTEXMF="$PWD/tmp/texmf-cache" \
latexmk -pdflua -interaction=nonstopmode -halt-on-error main.tex
```

The explicit cache directory avoids font-cache writes outside the workspace in
sandboxed environments. Use `latexmk -g -pdflua ...` when a forced full rebuild
is needed. The final artifact is `main.pdf`.

After bibliography or citation changes, let `latexmk` complete all BibTeX and
LuaLaTeX passes. Check `main.log` for undefined citations or references, render
the affected pages for visual inspection, and remove `tmp/` intermediates when
finished.
