from pypdf import PdfReader
import logging,json,argparse
from pathlib import Path
parser=argparse.ArgumentParser(description="Compare PDF links, bookmarks, labels and page counts.")
parser.add_argument("source")
parser.add_argument("converted")
parser.add_argument("report",type=Path)
args=parser.parse_args()
logging.getLogger('pypdf').setLevel(logging.ERROR)
def inspect(path):
 r=PdfReader(path);pages={p.indirect_reference.idnum:i for i,p in enumerate(r.pages)}
 def dest(v):
  if isinstance(v,str):
   if v not in r.named_destinations:return ['UNRESOLVED',v]
   return r.get_destination_page_number(r.named_destinations[v])
  if hasattr(v,'get_object'):v=v.get_object()
  if isinstance(v,list) and v:
   target=v[0]
   if hasattr(target,'idnum'):return pages.get(target.idnum,'UNRESOLVED')
   return int(target)
  return str(v)
 links=[]
 for n,p in enumerate(r.pages):
  for ref in p.get('/Annots',[]):
   a=ref.get_object()
   if a.get('/Subtype')!='/Link':continue
   action=a.get('/A');d=a.get('/Dest')
   if action:
    if action.get('/S')=='/URI':links.append((n,'URI',str(action.get('/URI'))));continue
    if action.get('/S')=='/GoTo':d=action.get('/D')
   links.append((n,'GoTo',dest(d)))
 def outlines(items,depth=0):
  out=[]
  for x in items:
   if isinstance(x,list):out.extend(outlines(x,depth+1))
   else:out.append((depth,x.title,r.get_destination_page_number(x)))
  return out
 return {'links':links,'outlines':outlines(r.outline),'labels':r.page_labels,'pages':len(r.pages),'metadata':dict(r.metadata),'last_text':r.pages[-1].extract_text()}
a=inspect(args.source);b=inspect(args.converted)
for key in ['links','outlines','labels']:
 print(key,'original',len(a[key]),'pdfa',len(b[key]),'identical',a[key]==b[key])
 if a[key]!=b[key]:
  print('first differences',[(x,y) for x,y in zip(a[key],b[key]) if x!=y][:3])
print('Final metadata',b['metadata']);print('Last page text',repr(b['last_text']))
args.report.write_text(json.dumps({'source':a,'pdfa':b},ensure_ascii=False,indent=2))

if any(a[k]!=b[k] for k in ["links","outlines","labels","pages"]):
    raise SystemExit("Navigation or page count changed: inspect the JSON report.")
