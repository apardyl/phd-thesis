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

## PDF/A exports

For PDF/A-2b thesis or standalone abstract exports, follow
`docs/pdfa-workflow.md` and use the helpers in `scripts/pdfa/`. The workflow
includes annotation preparation, known Ghostscript ligature-map repairs,
veraPDF validation of the final bytes, and text/navigation/render comparisons.
Keep original PDFs and published attachments unchanged. Do not treat a
successful conversion or a PDF/A metadata declaration as proof of compliance.
