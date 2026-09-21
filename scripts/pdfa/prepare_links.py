"""Prepare a temporary PDF for strict PDF/A conversion, preserving the source."""
import argparse
from pathlib import Path
from pypdf import PdfWriter
from pypdf.generic import NameObject, NumberObject

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("source", type=Path)
parser.add_argument("prepared", type=Path)
args = parser.parse_args()
if args.source.resolve() == args.prepared.resolve():
    parser.error("Use a separate temporary output, never the original PDF")
w = PdfWriter(clone_from=args.source)
count = 0
for page in w.pages:
    for ref in page.get('/Annots', []):
        annotation = ref.get_object()
        if annotation.get('/Subtype') != '/Link':
            raise SystemExit("Unexpected non-link annotation. Inspect it before normalizing flags.")
        flags = int(annotation.get('/F', 0))
        normalized = (flags | 4) & ~(1 | 2 | 32)
        if flags != normalized:
            annotation[NameObject('/F')] = NumberObject(normalized)
            count += 1
w.write(args.prepared)
print(f"Normalized {count} link annotation flags in {args.prepared}")
