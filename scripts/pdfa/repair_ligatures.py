import argparse
import difflib
import hashlib
import json
import unicodedata
from pathlib import Path
from pypdf import PdfReader, PdfWriter
from pypdf.generic import DecodedStreamObject,NameObject
parser=argparse.ArgumentParser(description="Repair the observed Ghostscript 10.08.0 ffi/ffl mappings and verify text preservation.")
parser.add_argument("source", type=Path)
parser.add_argument("converted", type=Path)
parser.add_argument("--reviewed-text-differences", type=Path,
                    help="Explicitly reviewed extraction differences, bound to the source PDF hash")
args=parser.parse_args()
if args.source.resolve()==args.converted.resolve():
    parser.error("Source and converted PDF must be different files")
w=PdfWriter(clone_from=args.converted);seen=set();counts={}
def visit(res):
 if not res:return
 res=res.get_object()
 for ref in res.get('/Font',{}).values():
  f=ref.get_object();key=id(f)
  if key in seen:continue
  seen.add(key)
  cmap=f.get('/ToUnicode')
  if cmap:
   data=cmap.get_object().get_data();new=data
   for a,b in [(b'<006600cf>',b'<006600660069>'),(b'<006600d2>',b'<00660066006c>')]:
    n=new.count(a)
    if n:counts[a.decode()]=counts.get(a.decode(),0)+n;new=new.replace(a,b)
   if new!=data:
    obj=DecodedStreamObject();obj.set_data(new);f[NameObject('/ToUnicode')]=w._add_object(obj)
 for ref in res.get('/XObject',{}).values():
  o=ref.get_object();key=id(o)
  if key in seen:continue
  seen.add(key);visit(o.get('/Resources'))
for p in w.pages:visit(p.get('/Resources'))
candidate=args.converted.with_suffix(".repair-candidate.pdf")
w.write(candidate)
source=PdfReader(args.source)
repaired=PdfReader(candidate)
if len(source.pages)!=len(repaired.pages):
    candidate.unlink()
    raise SystemExit("Page count differs. Converted PDF left unchanged.")
def normalize(text):
    return "".join(unicodedata.normalize("NFKC", text).split())
differences=[]
for i,(a,b) in enumerate(zip(source.pages,repaired.pages)):
    x,y=normalize(a.extract_text()),normalize(b.extract_text())
    if x!=y:
        differences.append({"page":i+1,"diff":[
            {"old":x[k:l],"new":y[m:n],"context":x[max(0,k-20):l+20]}
            for op,k,l,m,n in difflib.SequenceMatcher(None,x,y,autojunk=False).get_opcodes()
            if op!="equal"]})
approved=False
if args.reviewed_text_differences:
    review=json.loads(args.reviewed_text_differences.read_text())
    approved=(review.get("source_sha256")==hashlib.sha256(args.source.read_bytes()).hexdigest()
              and review.get("differences")==differences)
    if not approved:
        candidate.unlink()
        raise SystemExit("Review does not match the source hash and exact extraction differences.")
if differences and not approved:
    candidate.unlink()
    raise SystemExit(f"Text still differs on pages {[d['page'] for d in differences]}. Converted PDF left unchanged. Investigate instead of applying more blind substitutions.")
candidate.replace(args.converted)
print("Repaired Unicode mappings:",counts)
if differences:
    print("Text matches except for explicitly reviewed extraction differences on pages:", [d['page'] for d in differences])
else:
    print("Every page matches the source text after Unicode and whitespace normalization.")
print("Rerun veraPDF after this edit.")
