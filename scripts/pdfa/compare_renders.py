from PIL import Image,ImageChops,ImageStat,ImageDraw
from pathlib import Path
import json,argparse
parser=argparse.ArgumentParser(description="Compare paired Poppler renders and create sheets of the six largest differences.")
parser.add_argument("directory",type=Path)
args=parser.parse_args()
p=args.directory;stats=[]
original=sorted((p/'original').glob('*.png'))
converted=sorted((p/'converted').glob('*.png'))
if not original or [f.name for f in original]!=[f.name for f in converted]:
 raise SystemExit('Render directories must contain matching, nonempty page PNG sets')
for f in original:
 a=Image.open(f).convert('RGB');b=Image.open(p/'converted'/f.name).convert('RGB')
 assert a.size==b.size
 diff=ImageChops.difference(a,b)
 stats.append((int(f.stem.split('-')[-1]),sum(ImageStat.Stat(diff).mean)/3))
(p/'pixel-comparison.json').write_text(json.dumps(stats))
print('Compared pages',len(stats),'Largest pixel differences (0–255 scale):',sorted(stats,key=lambda x:x[1],reverse=True)[:15])
nums=[x[0] for x in sorted(stats,key=lambda x:x[1],reverse=True)[:6]]
for start in range(0,len(nums),2):
 out=Image.new('RGB',(1200,1740),'#ccc');d=ImageDraw.Draw(out)
 for row,n in enumerate(nums[start:start+2]):
  for col,folder in enumerate(['original','converted']):
   im=Image.open(p/folder/f'page-{n:03}.png');im.thumbnail((596,840));x=col*600;y=row*870;out.paste(im,(x,y+25));d.text((x+10,y+5),f'{folder} page {n}',fill='black')
 out.save(p/f'compare-{start}.jpg')
