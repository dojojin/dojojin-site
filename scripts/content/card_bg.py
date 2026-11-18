#!/usr/bin/env python3
# Cover background for photo_cover.py: light gradient + official image as a rounded card 90px from right/bottom (owner 18 Nov 2026).
# usage: python3 scripts/content/card_bg.py SRC x0,y0,x1,y1 CARD_W OUT.png TOP_R,G,B BOTTOM_R,G,B  → spec: photo OUT.png, fit "1600px 1200px", pos "left top", mode light
import sys
from PIL import Image, ImageDraw, ImageFilter
src,crop,W,out,c1,c2=sys.argv[1],tuple(map(int,sys.argv[2].split(','))),int(sys.argv[3]),sys.argv[4],tuple(map(int,sys.argv[5].split(','))),tuple(map(int,sys.argv[6].split(',')))
card=Image.open(src).convert('RGB').crop(crop); H=round(card.height*W/card.width); card=card.resize((W,H),Image.LANCZOS)
c=Image.new('RGB',(1600,1200)); d=ImageDraw.Draw(c)
for y in range(1200):
  t=y/1199; d.line([(0,y),(1600,y)],fill=tuple(round(a+(b-a)*t) for a,b in zip(c1,c2)))
x0=1600-90-W; y0=1200-90-H; r=32
mk=Image.new('L',card.size,0); ImageDraw.Draw(mk).rounded_rectangle((0,0,W-1,H-1),r,fill=255)
sh=Image.new('L',(1600,1200),0); ImageDraw.Draw(sh).rounded_rectangle((x0+6,y0+14,x0+W+6,y0+H+14),r,fill=90); sh=sh.filter(ImageFilter.GaussianBlur(20))
c=Image.composite(Image.new('RGB',c.size,(90,100,130)),c,sh); c.paste(card,(x0,y0),mk); c.save(out); print(out,'card',W,H,'at',x0,y0)
