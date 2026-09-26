# Thesis and abstract PDF/A workflow

This records the workflow used successfully on 21 September 2026. It creates separate **PDF/A-2b** files. The submission guideline requires PDF, not PDF/A. PDF/A-2b is our archival export choice, not an institutional requirement.

The commands below use the original export names `abstract_en-pdfa.pdf` and `abstract_pl-pdfa.pdf`. The abstract exports were subsequently renamed to `output/pdf/abstract_en.pdf` and `output/pdf/abstract_pl.pdf` in this workspace. Adjust paths if validating those existing files, or retain the explicit `-pdfa` names for a fresh export.

**Current submission limit: 20 MB.** Use the 300 dpi submission profile at the end of this document for `output/pdf/main-pdfa.pdf`. The full-resolution lossless profile below remains available for archival copies.

Keep `main.pdf`, `abstract_en.pdf`, `abstract_pl.pdf`, the LaTeX sources, and all `papers/*.pdf` as the originals. Convert copies. Never overwrite a published paper to make the assembled thesis compliant. Do not commit automatically.

## Tools and tested versions

- LuaLaTeX via `latexmk`, using the repository's cache settings.
- Ghostscript **10.08.0** (`/opt/homebrew/bin/gs`).
- veraPDF Greenfield **1.30.2**.
- Eclipse Temurin Java **21.0.12.1**, macOS ARM64 JRE, used only to run veraPDF.
- Python with `pypdf` and Pillow. Runtime used: `/Users/adam/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3`.
- Poppler `pdftoppm` and `pdfinfo`.
- sRGB profile: `/opt/homebrew/share/ghostscript/iccprofiles/srgb.icc`.

Useful official references: [Ghostscript PDF/A conversion](https://ghostscript.readthedocs.io/en/latest/VectorDevices.html#creating-a-pdf-a-document), [veraPDF installation](https://docs.verapdf.org/install/), [veraPDF CLI validation](https://docs.verapdf.org/cli/validation/).

### Validator setup used in this session

Neither Java nor veraPDF was installed, so both were downloaded to `/private/tmp/abstracts-pdfa`. Nothing was installed system-wide.

```sh
mkdir -p /private/tmp/abstracts-pdfa
curl -fL https://software.verapdf.org/releases/verapdf-installer.zip \
  -o /private/tmp/abstracts-pdfa/verapdf.zip
curl -fL 'https://api.adoptium.net/v3/binary/latest/21/ga/mac/aarch64/jre/hotspot/normal/eclipse' \
  -o /private/tmp/abstracts-pdfa/java.tar.gz
unzip -q /private/tmp/abstracts-pdfa/verapdf.zip -d /private/tmp/abstracts-pdfa/installer
tar -xzf /private/tmp/abstracts-pdfa/java.tar.gz -C /private/tmp/abstracts-pdfa
```

These are *latest-release* URLs and may return different versions in future. Check the extracted names and record the versions actually used. On Intel Macs, use the appropriate JRE architecture.

The unattended installer configuration used was:

```xml
<AutomatedInstallation langpack="eng">
  <com.izforge.izpack.panels.htmlhello.HTMLHelloPanel id="welcome"/>
  <com.izforge.izpack.panels.target.TargetPanel id="install_dir">
    <installpath>/private/tmp/abstracts-pdfa/verapdf</installpath>
  </com.izforge.izpack.panels.target.TargetPanel>
  <com.izforge.izpack.panels.packs.PacksPanel id="sdk_pack_select">
    <pack index="0" name="veraPDF GUI" selected="true"/>
    <pack index="1" name="veraPDF Mac and *nix Scripts" selected="true"/>
    <pack index="2" name="veraPDF Validation model" selected="false"/>
    <pack index="3" name="veraPDF Documentation" selected="false"/>
    <pack index="4" name="veraPDF Sample Plugins" selected="false"/>
  </com.izforge.izpack.panels.packs.PacksPanel>
  <com.izforge.izpack.panels.install.InstallPanel id="install"/>
  <com.izforge.izpack.panels.finish.FinishPanel id="finish"/>
</AutomatedInstallation>
```

Save as `/private/tmp/abstracts-pdfa/install.xml`, then run:

```sh
'/private/tmp/abstracts-pdfa/jdk-21.0.12.1+1-jre/Contents/Home/bin/java' \
  -jar /private/tmp/abstracts-pdfa/installer/verapdf-greenfield-1.30.2/verapdf-izpack-installer-1.30.2.jar \
  /private/tmp/abstracts-pdfa/install.xml
```

Temporary directories may disappear. If the tools are gone, repeat setup or point the variables below to an existing installation.

## 1. Rebuild current sources

Run from the repository root. Choose only the targets requested, or build all three:

```sh
mkdir -p tmp/texmf-cache output/pdf
TEXMFCACHE="$PWD/tmp/texmf-cache" \
TEXMFVAR="$PWD/tmp/texmf-cache" \
VARTEXMF="$PWD/tmp/texmf-cache" \
latexmk -pdflua -interaction=nonstopmode -halt-on-error \
  main.tex abstract_en.tex abstract_pl.tex
```

Allow all bibliography and reference passes to finish. Review the logs for errors, undefined references, missing glyphs and overfull boxes. Do not assume the current document still has the historical page count.

Set task variables and use a fresh scratch directory:

```sh
PDFA_PYTHON=/Users/adam/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3
PDFA_WORK=$(mktemp -d /private/tmp/thesis-pdfa.XXXXXX)
PDFA_ICC=/opt/homebrew/share/ghostscript/iccprofiles/srgb.icc
PDFA_JAVA=/private/tmp/abstracts-pdfa/jdk-21.0.12.1+1-jre/Contents/Home
PDFA_VALIDATOR=/private/tmp/abstracts-pdfa/verapdf/verapdf
shasum -a 256 papers/*.pdf > "$PDFA_WORK/papers-before.sha256"
```

## 2. Prepare thesis link annotations

The first strict Ghostscript conversion of `main.pdf` printed repeated messages:

> Annotation set to non-printing, not permitted in PDF/A, aborting conversion

It continued processing pages despite these messages. A process exit code alone is therefore insufficient evidence of success.

The working fix was to clone the PDF into a temporary file and normalize link-annotation flags. Set the Print bit (`4`) and clear Invisible (`1`), Hidden (`2`) and NoView (`32`):

```python
normalized = (flags | 4) & ~(1 | 2 | 32)
```

All 631 annotations in this thesis were links. The reusable helper stops on a non-link annotation so a future form, widget or comment is not silently changed.

```sh
"$PDFA_PYTHON" scripts/pdfa/prepare_links.py main.pdf "$PDFA_WORK/main-prepared.pdf"
```

pypdf reported 26 duplicate `/Group` dictionary keys from imported publication page forms. Writing the temporary copy resolved the duplicates. This does not establish visual preservation by itself, so rendering comparison remains mandatory. The original PDFs are not edited.

The standalone abstracts had no problematic annotations and were converted directly, without this preparation step.

## 3. Convert with an embedded sRGB output intent

`scripts/pdfa/srgb-pdfa.ps` contains the output-intent PostScript used in the successful run. It now accepts `ICCProfile` and `DocumentLanguage` as variables instead of hardcoded paths. Use **strict policy 2**, which requests failure on incompatible features. Do not change it to policy 1 merely to silence errors, because that policy may drop features.

For the thesis:

```sh
gs -dBATCH -dNOPAUSE -sDEVICE=pdfwrite \
  -dPDFA=2 -dPDFACompatibilityPolicy=2 \
  -sColorConversionStrategy=RGB -sBlendConversionStrategy=Simple \
  -dEmbedAllFonts=true \
  -dAutoFilterColorImages=false -dAutoFilterGrayImages=false \
  -dColorImageFilter=/FlateEncode -dGrayImageFilter=/FlateEncode \
  -dPassThroughJPEGImages=true -dPassThroughJPXImages=true \
  -dDownsampleColorImages=false -dDownsampleGrayImages=false -dDownsampleMonoImages=false \
  "--permit-file-read=$PDFA_ICC" \
  -sOutputFile=output/pdf/main-pdfa.pdf \
  -c "/ICCProfile ($PDFA_ICC) def /DocumentLanguage (en-GB) def" \
  -f scripts/pdfa/srgb-pdfa.ps "$PDFA_WORK/main-prepared.pdf" \
  > "$PDFA_WORK/main-conversion.log" 2>&1
```

Inspect the complete conversion log. The tested thesis produced an invalid-ICC warning on source profiles inherited from FlySearch. Ghostscript selected a device colour space using the declared component count. Physical pages 144 and 146 were specifically checked afterwards. Locate these pages again if pagination changes.

For the abstracts, use the same flags, their original PDFs as input, `en-GB` / `pl-PL` as language, and the corresponding output filename. Append the matching metadata PostScript **after** the input PDF:

```sh
for lang in en pl; do
  if [ "$lang" = en ]; then PDFA_LANG=en-GB; else PDFA_LANG=pl-PL; fi
  gs -dBATCH -dNOPAUSE -sDEVICE=pdfwrite \
    -dPDFA=2 -dPDFACompatibilityPolicy=2 \
    -sColorConversionStrategy=RGB -sBlendConversionStrategy=Simple \
    -dEmbedAllFonts=true \
    -dAutoFilterColorImages=false -dAutoFilterGrayImages=false \
    -dColorImageFilter=/FlateEncode -dGrayImageFilter=/FlateEncode \
    -dPassThroughJPEGImages=true -dPassThroughJPXImages=true \
    -dDownsampleColorImages=false -dDownsampleGrayImages=false -dDownsampleMonoImages=false \
    "--permit-file-read=$PDFA_ICC" \
    "-sOutputFile=output/pdf/abstract_${lang}-pdfa.pdf" \
    -c "/ICCProfile ($PDFA_ICC) def /DocumentLanguage ($PDFA_LANG) def" \
    -f scripts/pdfa/srgb-pdfa.ps "abstract_${lang}.pdf" \
    "scripts/pdfa/abstract-${lang}-metadata.ps" \
    > "$PDFA_WORK/abstract-${lang}-conversion.log" 2>&1
done
```

The abstract metadata files preserve the exact title, author and subject used in this run. Titles are encoded as UTF-16BE hexadecimal strings prefixed with `feff`. Update these files if the thesis title changes. The thesis conversion preserves its own existing metadata.

Do not use `/screen`, `/ebook` or `/prepress` presets. The tested command explicitly disabled image downsampling and did not rasterize the document. Conversion still rewrites PDF internals, so binary identity is neither expected nor claimed.

## 4. Repair the observed ligature mappings and compare text

Ghostscript 10.08.0 produced visually correct glyphs but incorrect ToUnicode mappings. The abstracts initially passed PDF/A-2b validation despite this problem. Validation alone does not establish faithful text extraction.

The observed font-map replacements were:

| Incorrect destination | Correct destination | Meaning |
|---|---|---|
| `<006600cf>` | `<006600660069>` | `fÏ` → `ffi` |
| `<006600d2>` | `<00660066006c>` | `fÒ` → `ffl` |

Before repair, the thesis had 55 `fi` → `Ï` and one `fl` → `Ò` extraction differences, across 39 pages. Four font-map entries needed correction. The English abstract needed two entries corrected. The Polish abstract needed none.

These are **specific observed Ghostscript/font defects, not general substitutions for arbitrary PDFs**. The helper edits a candidate file, checks page count and normalized extracted text against the source, and replaces the converted file only if every page matches. If it fails, investigate. Do not broaden replacements blindly.

```sh
"$PDFA_PYTHON" scripts/pdfa/repair_ligatures.py main.pdf output/pdf/main-pdfa.pdf
"$PDFA_PYTHON" scripts/pdfa/repair_ligatures.py abstract_en.pdf output/pdf/abstract_en-pdfa.pdf
"$PDFA_PYTHON" scripts/pdfa/repair_ligatures.py abstract_pl.pdf output/pdf/abstract_pl-pdfa.pdf
```

Run only the commands for the files being produced. Any PDF edit invalidates earlier validation evidence, so validate again after this step.

## 5. Validate the final bytes with veraPDF

```sh
JAVA_HOME="$PDFA_JAVA" "$PDFA_VALIDATOR" -f 2b output/pdf/main-pdfa.pdf \
  > output/pdf/main-pdfa-validation.xml
JAVA_HOME="$PDFA_JAVA" "$PDFA_VALIDATOR" -f 2b \
  output/pdf/abstract_en-pdfa.pdf output/pdf/abstract_pl-pdfa.pdf \
  > output/pdf/abstracts-pdfa-validation.xml
```

For **every job**, require `isCompliant="true"`, zero failed rules/checks, and no parsing or execution failure. Do not rely only on a zero CLI exit status, a filename ending in `pdfa`, or a PDF/A metadata declaration.

## 6. Compare navigation and rendered pages

```sh
"$PDFA_PYTHON" scripts/pdfa/check_navigation.py \
  main.pdf output/pdf/main-pdfa.pdf "$PDFA_WORK/navigation.json"
mkdir -p "$PDFA_WORK/original" "$PDFA_WORK/converted"
pdftoppm -r 72 -png main.pdf "$PDFA_WORK/original/page"
pdftoppm -r 72 -png output/pdf/main-pdfa.pdf "$PDFA_WORK/converted/page"
"$PDFA_PYTHON" scripts/pdfa/compare_renders.py "$PDFA_WORK"
```

The navigation helper compares link source pages and destination pages/URLs, bookmark titles/hierarchy/target pages, page labels and page count. It saves the comparison and fails on differences. It does not compare the exact link rectangle or destination zoom coordinates. Inspect representative clickable elements if those matter.

The rendering helper records mean absolute pixel differences for every page and produces side-by-side sheets for the six largest differences. **There is no automatic “safe” difference threshold.** Review these sheets, the cover, contents, representative equations/tables/figures, Polish text, and the two known invalid-ICC pages. Confirm the final page is entirely white, not merely devoid of extractable text. Do not treat an empty extracted string as proof of a blank rendered page.

For abstracts, render source and output at **110 dpi** in separate scratch directories and inspect every page. The tested English abstract had 2 pages and the Polish abstract had 3. Their existing pagination, including the first-page number, was preserved.

In the original thesis run, all 176 pages were compared numerically at 72 dpi. Maximum mean difference was 0.986 on a 0–255 scale. The six highest-difference pages were 88, 110, 162, 113, 87 and 161. No missing content or changed layout was observed in the visual comparisons. Representative pages rendered identically before and after the Unicode repair.

## 7. Record results and preserve originals

```sh
shasum -a 256 -c "$PDFA_WORK/papers-before.sha256"
shasum -a 256 output/pdf/main-pdfa.pdf output/pdf/abstract_en-pdfa.pdf output/pdf/abstract_pl-pdfa.pdf
git diff --check
```

Save a short Markdown verification report alongside the output and XML validation report. Record tool versions, source identity, final hash, page counts, text/navigation results, visual checks and any repairs. Do not carry forward historical counts as though they were rechecked.

Results from 21 September 2026:

- Thesis: 176 pages, 631 links, 33 bookmarks, matching page labels, blank final page, and text matching on every page after whitespace normalization.
- Thesis veraPDF result: 144 passed rules, 1,121,249 passed checks, zero failures.
- Thesis output size: 12,914,136 bytes. SHA-256: `4132e9a4704c704124a4a6204751f0700d8da66bc3591398cd4ecf167bd43648`.
- Both abstracts passed PDF/A-2b validation. Their hashes and details are in `output/pdf/abstracts-pdfa-validation.md`.
- All seven publication source PDFs remained byte-for-byte unchanged.

Remove scratch files and the generated `tmp/texmf-cache` after review, without removing unrelated temporary work. Preserve the final PDFs and validation reports. Commit only when explicitly requested.

## Original publication inputs and image fidelity (21 September 2026)

The thesis now includes the seven original publication PDFs in `papers/` without the `_comp` suffix. The supplied files were identified by their title and page count and renamed without modifying their bytes. The older `_comp.pdf` files are retained but no longer included.

The conversion commands above now disable automatic JPEG selection and use lossless Flate encoding for colour and grayscale images that must be rewritten. Existing JPEG/JPX data can pass through where supported. Downsampling remains disabled. This avoids an additional lossy encoding stage, but does not undo compression already present in the published originals. Required colour-space conversion may still change pixel values. Earlier reported sizes refer to the previous compressed-input workflow.

### Text extraction with original publication fonts

The originals introduce valid ligature code points and mathematical font extraction differences. The helper now normalizes Unicode with NFKC as well as whitespace. It still stops on unreviewed differences. In the original-input build, 167 pages match and nine have mathematical-symbol differences (see `output/pdf/main-pdfa-text-review.json`). All nine were visually compared. No extra character-map replacements were made for them.

To reuse an existing reviewed comparison for exactly the same source bytes:

```sh
"$PDFA_PYTHON" scripts/pdfa/repair_ligatures.py main.pdf output/pdf/main-pdfa.pdf \
  --reviewed-text-differences output/pdf/main-pdfa-text-review.json
```

The review JSON contains `source_sha256`, a review explanation, and a `differences` list. Every entry records `page` and a `diff` list containing `old`, `new`, and `context`. Differences are computed with `difflib.SequenceMatcher(..., autojunk=False)` on NFKC-normalized text without whitespace, with 20 source characters of context on either side. The helper requires both the source hash and every exact difference to match. A fresh build may change the source hash. Investigate and review its differences rather than updating the hash blindly. Always validate the final bytes again and record any extraction differences honestly.

## Submission profile for the 20 MB limit

On 21 September 2026, the full-resolution original-paper PDF/A was 48.29 MB. At 300 dpi with lossless encoding it was 36.62 MB, and at 200 dpi it was 24.42 MB. Keeping 300 dpi and using high-quality automatic JPEG/Flate selection reduced it to 14.96 MB before Unicode-map repair and **15.29 MB after repair and validation**. Use decimal bytes for the upload limit: the final file must be smaller than 20,000,000 bytes.

Run this directly on the freshly prepared original-paper build from step 2, never on an earlier PDF/A or compressed export. It changes only the image policy from step 3:

```sh
gs -dBATCH -dNOPAUSE -sDEVICE=pdfwrite \
  -dPDFA=2 -dPDFACompatibilityPolicy=2 \
  -sColorConversionStrategy=RGB -sBlendConversionStrategy=Simple \
  -dEmbedAllFonts=true \
  -dAutoFilterColorImages=true -dAutoFilterGrayImages=true \
  -dColorImageFilter=/DCTEncode -dGrayImageFilter=/DCTEncode \
  -dPassThroughJPEGImages=true -dPassThroughJPXImages=true \
  -dDownsampleColorImages=true -dDownsampleGrayImages=true \
  -dColorImageResolution=300 -dGrayImageResolution=300 \
  -dColorImageDownsampleThreshold=1.0 -dGrayImageDownsampleThreshold=1.0 \
  -dColorImageDownsampleType=/Bicubic -dGrayImageDownsampleType=/Bicubic \
  -dDownsampleMonoImages=false \
  "--permit-file-read=$PDFA_ICC" \
  -sOutputFile=output/pdf/main-pdfa.pdf \
  -c "/ICCProfile ($PDFA_ICC) def /DocumentLanguage (en-GB) def" \
  -c '<< /ColorImageDict << /QFactor 0.15 /Blend 1 /HSamples [1 1 1 1] /VSamples [1 1 1 1] >> /GrayImageDict << /QFactor 0.15 /Blend 1 /HSamples [1 1 1 1] /VSamples [1 1 1 1] >> /ColorACSImageDict << /QFactor 0.15 /Blend 1 /HSamples [1 1 1 1] /VSamples [1 1 1 1] >> /GrayACSImageDict << /QFactor 0.15 /Blend 1 /HSamples [1 1 1 1] /VSamples [1 1 1 1] >> >> setdistillerparams' \
  -f scripts/pdfa/srgb-pdfa.ps "$PDFA_WORK/main-prepared.pdf" \
  > "$PDFA_WORK/main-conversion.log" 2>&1
```

This uses a low JPEG QFactor and no chroma subsampling, based on the image-quality controls described in [Ghostscript's documentation](https://ghostscript.readthedocs.io/en/master/VectorDevices.html). It does not apply the complete `/prepress` preset. Automatic filtering permits lossless compression where Ghostscript selects it. Monochrome images are not downsampled, lower-resolution images are not upscaled, and text/vector graphics remain scalable. The 300 dpi value is a downsampling target, not a guarantee that every image has exactly that effective resolution.

Continue with font-map repair, the exact reviewed text differences where applicable, final-byte veraPDF validation, navigation comparison and rendered QA. Include 300 dpi close-ups of raster figures and screenshots. Preserve the full-resolution PDF/A separately before replacing the submission file. The current backup is `output/pdf/main-pdfa-full-resolution.pdf`. Keep the original inputs unchanged and do not commit automatically.
