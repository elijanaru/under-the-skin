# contact sheet: python sheet.py out.png a.png b.png ... (uses the editing venv's PIL/cv2)
import sys
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
ims = [Image.open(f).convert('RGB') for f in files]
w, h = ims[0].size; s = 0.5
tw, th = int(w * s), int(h * s); cols = min(4, len(ims)); rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * tw, rows * th), 'white'); d = ImageDraw.Draw(S)
for i, (im, fn) in enumerate(zip(ims, files)):
    x, y = (i % cols) * tw, (i // cols) * th
    S.paste(im.resize((tw, th)), (x, y)); d.text((x + 6, y + 6), fn.split('/')[-1], fill='black')
S.save(out)
