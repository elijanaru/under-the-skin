#!/usr/bin/env python3
"""Authoring helper: writes scene.rml (pure RML, no scripts) for the date ticket.

Run:  python3 gen.py && ~/.rive/bin/rive . --verify
Motion is described as functions of time and sampled into linear keys (and
pruned where a straight line already fits), so springs and arcs stay smooth.
"""
import math, random, re
from xml.sax.saxutils import escape

FPS = 60
PI = math.pi

# ── ids ────────────────────────────────────────────────────────────────────
_next = [200]
def nid():
    _next[0] += 1
    return f"0:{_next[0]}"

def q(s):
    return escape(str(s), {'"': '&quot;', '\n': '&#10;'})

def f(v):
    s = f"{v:.4f}".rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s

def argb(hex6, a=1.0):
    return f"{round(a * 255):02X}{hex6.lstrip('#').upper()}"

# ── palette ────────────────────────────────────────────────────────────────
INK = '5a3a40'
PAPER_A, PAPER_B = 'f8e4e8', 'efd4dd'
BACK_A, BACK_B = 'f5dde2', 'ecd0d8'
PINK, ROSE = 'e6b1c4', 'd98aa5'
WILLOW, MOSS = '8c9768', '6c823e'

# ── fonts ──────────────────────────────────────────────────────────────────
F_FELL, F_SERIF, F_MONO = '0:11', '0:12', '0:13'

# ── geometry helpers ───────────────────────────────────────────────────────
def solid(hex6, a=1.0, cid=None):
    i = f' id="{cid}"' if cid else ''
    return f'<SolidColor colorValue="{argb(hex6, a)}" name="C"{i}/>'

def fill(paint, extra='', name='Fill'):
    return f'<Fill name="{name}"{extra}>{paint}</Fill>'

def stroke(paint, w, extra='', name='Stroke'):
    return f'<Stroke thickness="{f(w)}" cap="round" join="round" name="{name}"{extra}>{paint}</Stroke>'

def lgrad(x0, y0, x1, y1, stops):
    s = ''.join(f'<GradientStop colorValue="{argb(c, a)}" position="{f(p)}"/>' for p, c, a in stops)
    return f'<LinearGradient startX="{f(x0)}" startY="{f(y0)}" endX="{f(x1)}" endY="{f(y1)}" name="G">{s}</LinearGradient>'

def rgrad(cx, cy, r, stops):
    s = ''.join(f'<GradientStop colorValue="{argb(c, a)}" position="{f(p)}"/>' for p, c, a in stops)
    return f'<RadialGradient startX="{f(cx)}" startY="{f(cy)}" endX="{f(cx + r)}" endY="{f(cy)}" name="G">{s}</RadialGradient>'

def shape(name, geom, paints='', sid=None, x=0, y=0, rot=0, sx=1, sy=1, opacity=1, extra='', inner=''):
    a = f'name="{q(name)}"'
    if sid: a += f' id="{sid}"'
    for k, v, d in (('x', x, 0), ('y', y, 0), ('rotation', rot, 0), ('scaleX', sx, 1), ('scaleY', sy, 1), ('opacity', opacity, 1)):
        if abs(v - d) > 1e-9: a += f' {k}="{f(v)}"'
    return f'<Shape {a}{extra}>{geom}{paints}{inner}</Shape>'

def node(name, children, nid_=None, x=0, y=0, rot=0, sx=1, sy=1, opacity=1, tag='Node', extra=''):
    a = f'name="{q(name)}"'
    if nid_: a += f' id="{nid_}"'
    for k, v, d in (('x', x, 0), ('y', y, 0), ('rotation', rot, 0), ('scaleX', sx, 1), ('scaleY', sy, 1), ('opacity', opacity, 1)):
        if abs(v - d) > 1e-9: a += f' {k}="{f(v)}"'
    return f'<{tag} {a}{extra}>{"".join(children)}</{tag}>'

def rect(w, h, r=0, x=0, y=0, ox=0.5, oy=0.5):
    rr = f' cornerRadiusTL="{f(r)}"' if r else ''
    pos = (f' x="{f(x)}"' if x else '') + (f' y="{f(y)}"' if y else '')
    return f'<Rectangle width="{f(w)}" height="{f(h)}" originX="{f(ox)}" originY="{f(oy)}"{rr}{pos} name="P"/>'

def ellipse(w, h, x=0, y=0):
    pos = (f' x="{f(x)}"' if x else '') + (f' y="{f(y)}"' if y else '')
    return f'<Ellipse width="{f(w)}" height="{f(h)}"{pos} name="P"/>'

def vtx(x, y, ir=None, idist=0, orr=None, odist=0, radius=0):
    if ir is None and orr is None:
        r = f' radius="{f(radius)}"' if radius else ''
        return f'<StraightVertex x="{f(x)}" y="{f(y)}"{r}/>'
    return (f'<CubicDetachedVertex x="{f(x)}" y="{f(y)}" inRotation="{f(ir or 0)}" inDistance="{f(idist)}" '
            f'outRotation="{f(orr or 0)}" outDistance="{f(odist)}"/>')

def ppath(verts, closed=True, x=0, y=0):
    pos = (f' x="{f(x)}"' if x else '') + (f' y="{f(y)}"' if y else '')
    return f'<PointsPath isClosed="{"true" if closed else "false"}"{pos} name="P">{"".join(verts)}</PointsPath>'

# minimal SVG path -> Rive vertices (M, L, H, V, C, Z; absolute)
def svg_path(d, dx=0, dy=0, sc=1.0):
    toks = re.findall(r'[MLHVCZmlhvcz]|[-+]?(?:\d+\.?\d*|\.\d+)', d)
    subs, cur, cmd, i = [], None, None, 0
    pt = lambda x, y: ((x + dx) * sc, (y + dy) * sc)
    last = (0, 0)
    def num():
        nonlocal i
        v = float(toks[i]); i += 1; return v
    while i < len(toks):
        t = toks[i]
        if re.match(r'[A-Za-z]', t):
            cmd = t; i += 1
            if cmd in 'Zz':
                cur['closed'] = True; subs.append(cur); cur = None
                continue
        if cmd == 'M':
            if cur: subs.append(cur)
            x, y = num(), num(); last = (x, y)
            cur = {'nodes': [{'p': pt(x, y), 'i': None, 'o': None}], 'closed': False}
            cmd = 'L'
        elif cmd in 'LHV':
            if cmd == 'L': x, y = num(), num()
            elif cmd == 'H': x, y = num(), last[1]
            else: x, y = last[0], num()
            last = (x, y)
            cur['nodes'].append({'p': pt(x, y), 'i': None, 'o': None})
        elif cmd == 'C':
            x1, y1, x2, y2, x, y = (num() for _ in range(6)); last = (x, y)
            cur['nodes'][-1]['o'] = pt(x1, y1)
            cur['nodes'].append({'p': pt(x, y), 'i': pt(x2, y2), 'o': None})
        else:
            raise ValueError(cmd)
    if cur: subs.append(cur)
    out = []
    for s in subs:
        ns = s['nodes']
        if s['closed'] and len(ns) > 1 and math.dist(ns[0]['p'], ns[-1]['p']) < 1e-6:
            ns[0]['i'] = ns[-1]['i']; ns = ns[:-1]
        vs = []
        for n in ns:
            (x, y), hi, ho = n['p'], n['i'], n['o']
            if hi is None and ho is None:
                vs.append(vtx(x, y)); continue
            ir = math.atan2(hi[1] - y, hi[0] - x) if hi else 0
            orr = math.atan2(ho[1] - y, ho[0] - x) if ho else 0
            vs.append(vtx(x, y, ir, math.dist(hi, (x, y)) if hi else 0, orr, math.dist(ho, (x, y)) if ho else 0))
        out.append(ppath(vs, s['closed']))
    return ''.join(out)

# ── the ticket silhouette (340 x 170, centred; notches at the perforation) ──
W, H = 340, 170
HW, HH = W / 2, H / 2
PERF = -106          # perforation x on the front (stub on the left)
NR = 9               # notch radius
K = 0.5523 * NR

def paper_path(px, cr=7):
    v = [vtx(-HW, -HH, radius=cr),
         vtx(px - NR, -HH, PI, 0, PI / 2, K), vtx(px, -HH + NR, PI, K, 0, K), vtx(px + NR, -HH, PI / 2, K, 0, 0),
         vtx(HW, -HH, radius=cr), vtx(HW, HH, radius=cr),
         vtx(px + NR, HH, 0, 0, -PI / 2, K), vtx(px, HH - NR, 0, K, PI, K), vtx(px - NR, HH, -PI / 2, K, PI, 0),
         vtx(-HW, HH, radius=cr)]
    return ppath(v)

# ── text ───────────────────────────────────────────────────────────────────
def text(name, runs, x, y, size, font, color=INK, alpha=1.0, ls=0, lh=None, w=None, h=None,
         sizing='autoWidth', overflow=None, wrap='noWrap', align=None, ox=0, oy=0, rot=0, tid=None, extra_styles=None, valign=None):
    """runs: list of (text, bindPropId or None). One style unless extra_styles given."""
    sid = nid()
    style = (f'<TextStylePaint fontSize="{f(size)}" fontAssetId="{font}"'
             + (f' letterSpacing="{f(ls)}"' if ls else '') + (f' lineHeight="{f(lh)}"' if lh else '')
             + f' name="S" id="{sid}">' + fill(solid(color, alpha)) + '</TextStylePaint>')
    rs = ''
    for t, bind in runs:
        b = f'<DataBindContext sourcePathIds="{VM}-{bind}" propertyKey="268"/>' if bind else ''
        rs += f'<TextValueRun styleId="{sid}" text="{q(t)}" name="{q(bind and PROPNAME[bind] or "Run")}">{b}</TextValueRun>'
    a = f'name="{q(name)}" x="{f(x)}" y="{f(y)}" sizingValue="{sizing}" wrapValue="{wrap}"'
    if tid: a += f' id="{tid}"'
    if w is not None: a += f' width="{f(w)}"'
    if h is not None: a += f' height="{f(h)}"'
    if overflow: a += f' overflowValue="{overflow}"'
    if align: a += f' alignValue="{align}"'
    if valign: a += f' verticalAlignValue="{valign}"'
    if ox: a += f' originX="{f(ox)}"'
    if oy: a += f' originY="{f(oy)}"'
    if rot: a += f' rotation="{f(rot)}"'
    return f'<Text {a}>{style}{rs}</Text>'

# ── view model ─────────────────────────────────────────────────────────────
VM, VMI = '0:40', '0:41'
P = dict(title='0:42', plan='0:43', name='0:44', when='0:45', frm='0:46', date='0:47', send='0:48', arrive='0:49')
PROPNAME = {P['title']: 'title', P['plan']: 'plan', P['name']: 'name', P['when']: 'when', P['frm']: 'from', P['date']: 'date'}
DEFAULTS = dict(title='A Night Out', plan='Dinner somewhere candle-lit, then a slow walk home the long way round.',
                name='MAYA', when='SATURDAY, 7 PM', frm='LEO', date='15-11-2026')

# ── artwork pieces ─────────────────────────────────────────────────────────
VT_PETAL = 'M0 0C-11-13-10-33 0-46C10-33 11-13 0 0Z'
GRAD_P = [(0, 'fdf2f4', 1), (0.55, 'f0bccb', 1), (1, 'cf7d96', 1)]   # front petals
GRAD_B = [(0, 'f3cfd8', 1), (0.6, 'df9cb0', 1), (1, 'b65d7b', 1)]   # back petals

def petal(a_deg, s, grad):
    vein = ('<Shape name="Vein" opacity="0.3">' + svg_path('M0-4V-40') + svg_path('M-3-6C-6-18-5-30-1-40') + svg_path('M3-6C6-18 5-30 1-40')
            + stroke(solid('9c4b66'), 0.6) + '</Shape>')
    body = shape('Petal', svg_path(VT_PETAL), fill(lgrad(0, 0, 0, -46, grad)))
    return node('Petal', [vein, body], rot=math.radians(a_deg), sx=s, sy=s)

def lotus(x, y, sc=1.0, name='Lotus'):
    back = [petal(a, s, GRAD_B) for a, s in [(-72, .74), (-38, .9), (0, 1), (38, .9), (72, .74)]]
    front = [petal(a, s, GRAD_P) for a, s in [(-54, .78), (-24, .94), (24, .94), (54, .78), (0, .8)]]
    seeds = shape('Seeds', ''.join(ellipse(1.8, 1.8, sx_, -17.5) for sx_ in (-5, -1.5, 2, 5.5)), fill(solid('b8862e')))
    heart = shape('Heart', ellipse(18, 7.2, 0, -17), fill(solid('e5c060')))
    # SVG order is back-to-front; Rive draws first child on top -> reverse
    kids = back + [heart, seeds] + front
    return node(name, list(reversed(kids)), x=x, y=y, sx=sc, sy=sc)

def bud(x, y, rot, sc):
    kids = [petal(-16, .9, GRAD_B), petal(16, .9, GRAD_B), petal(0, 1, GRAD_P)]
    return node('Bud', list(reversed(kids)), x=x, y=y, rot=math.radians(rot), sx=sc, sy=sc)

def wing(s, c, e):
    a = shape('Upper', svg_path('M0-1C-6-14-22-17-21-5C-20 3-9 4 0 1Z'), fill(solid(c)) + stroke(solid(e), .8))
    b = shape('Lower', svg_path('M0 1C-5 4-15 6-13 13C-11 18-3 12 0 3Z'), fill(solid(c, .92)) + stroke(solid(e), .8))
    v = shape('Veins', svg_path('M-4-2C-9-8-15-10-17-6') + svg_path('M-3 3C-7 6-10 9-10 12'), stroke(solid(e, .6), .5))
    return node('Wing', [v, b, a], sx=s)   # draw: lower, upper, veins on top

def butterfly(x, y, rot, sc, wid):
    bodyy = shape('Body', svg_path('M0-7V9'), stroke(solid('5b4636'), 1.7))
    ant = shape('Antennae', svg_path('M0-7C-2-12-4-13-6-13') + svg_path('M0-7C2-12 4-13 6-13'), stroke(solid('5b4636'), .6))
    # wing pair inside a node we can flutter (scaleX)
    wings = node('Wings', [wing(1, 'cdb6dc', '8f78a6'), wing(-1, 'cdb6dc', '8f78a6')], nid_=wid)
    return node('Butterfly', [ant, bodyy, wings], x=x, y=y, rot=math.radians(rot), sx=sc, sy=sc)

def collage(clip_id, wid):
    """The lotus collage, authored in the 140x150 SVG space, back-to-front."""
    txt = ['her rhythm and your plans,', 'a slow evening, two cups', 'of tea and nowhere to be.', 'Tonight is for the two of',
           'you. Phones away, hands', 'free, and the whole night', 'to be close again. Admit']
    paperclip = []
    news_txt = text('Newsprint', [('\n'.join(txt), None)], 10, 69, 6.6, F_MONO, color='5e4a38', alpha=.62, lh=8.3,
                    sizing='autoWidth', wrap='noWrap')
    news = node('Newsprint', [news_txt,
                              shape('Edge', rect(132, 66, 0, 72, 97), stroke(solid('c9b28a'), .6)),
                              shape('Sheet', rect(132, 66, 0, 72, 97), fill(solid('ead9b9')))],
                rot=math.radians(-4), x=0, y=0, extra='')
    # rotate the newsprint about (70,100): wrap in a node at the pivot
    news = node('NewsPivot', [node('News', [news], x=-70, y=-100)], x=70, y=100, rot=math.radians(-4))
    pad = shape('Pad', svg_path('M70 131 120 124C124 139 102 148 70 148 37 148 15 140 19 129 23 119 49 115 70 116Z'),
                fill(rgrad(63, 128, 60, [(0, 'a6b27f', 1), (1, '6c7a48', 1)])))
    veins = shape('PadVeins', ''.join(svg_path(d) for d in ('M70 131 40 120', 'M70 131 28 135', 'M70 131 52 146', 'M70 131 92 147', 'M70 131 112 140')),
                  stroke(solid('58663a', .55), .7))
    stems = shape('Stems', svg_path('M70 120C68 108 70 99 70 92') + svg_path('M74 122C90 106 102 88 110 68'), stroke(solid('6c7a48'), 2.2))
    kids = [news, pad, veins, stems, lotus(70, 96), bud(114, 64, 24, .5), butterfly(34, 40, -16, .9, wid)]
    return list(reversed(kids))

# ── faces ──────────────────────────────────────────────────────────────────
def grain(seed, n=70):
    rnd = random.Random(seed)
    dots = ''.join(ellipse(r, r, rnd.uniform(-HW + 4, HW - 4), rnd.uniform(-HH + 4, HH - 4))
                   for r in (rnd.uniform(.6, 1.4) for _ in range(n)))
    return shape('Grain', dots, fill(solid(INK, .07)))

def barcode():
    rnd = random.Random(21)
    y, bars = -59.0, []
    while True:
        h = rnd.choice([0.8, 0.8, 1.2, 1.6, 2.4, 3.2])
        if y + h > 59: break
        bars.append((y, h)); y += h + rnd.choice([1.0, 1.3, 1.8, 2.6])
    geo = ''.join(rect(13, hh, 0, 0, yy + hh / 2) for yy, hh in bars)
    return shape('Barcode', geo, fill(solid(INK, .88)), x=-155)

def stars():
    geo = ''.join(f'<Star width="9" height="9" points="5" innerRadius="0.45" x="{f(-85 + i * 11.5)}" y="-64" name="P"/>' for i in range(5))
    return shape('Stars', geo, fill(solid(INK, .92)))

def front_face(ids):
    clip = ids['front_clip']
    glint = shape('Glint', rect(90, 360), fill(lgrad(-45, 0, 45, 0, [(0, 'ffffff', 0), (.38, 'ffffff', .35), (.5, 'ffffff', .85), (.62, 'ffffff', .35), (1, 'ffffff', 0)])),
                  sid=ids['glint'], x=-330, rot=0.42, inner=f'<ClippingShape sourceId="{clip}" name="Clip"/>')
    shade = shape('Shade', paper_path(PERF), fill(lgrad(-HW, 0, HW, 0, [(0, INK, .0), (1, INK, .26)])), sid=ids['front_shade'], opacity=0)
    lines = [text('Line Name', [('NAME : ', None), (DEFAULTS['name'], P['name'])], -90, 34, 9.2, F_MONO, ls=.9, w=160, h=12, sizing='fixed', overflow='ellipsis'),
             text('Line When', [('WHEN : ', None), (DEFAULTS['when'], P['when'])], -90, 46, 9.2, F_MONO, ls=.9, w=160, h=12, sizing='fixed', overflow='ellipsis'),
             text('Line From', [('FROM : ', None), (DEFAULTS['frm'], P['frm'])], -90, 58, 9.2, F_MONO, ls=.9, w=160, h=12, sizing='fixed', overflow='ellipsis')]
    plan = text('Plan', [(DEFAULTS['plan'], P['plan'])], -90, -3, 11.5, F_FELL, alpha=.9, lh=13.5, w=152, h=29, sizing='fixed', overflow='fitFontSize', wrap='wrap')
    title = text('Title', [(DEFAULTS['title'], P['title'])], -91, -45, 36, F_FELL, w=170, h=40, sizing='fixed', overflow='fitFontSize', wrap='noWrap', valign='middle')
    eyebrow = text('Eyebrow', [('A TICKET FOR', None)], -90, -57, 12, F_SERIF, ls=1.8)
    admit = text('Admit', [('ADMIT TWO', None)], -134, 0, 13, F_SERIF, ls=2.2, ox=.5, oy=.5, rot=-PI / 2)
    date = text('Date', [(DEFAULTS['date'], P['date'])], -119, 0, 9, F_MONO, ls=1.2, ox=.5, oy=.5, rot=-PI / 2)
    perf = shape('Perforation', svg_path(f'M{PERF} -72V72'),
                 f'<Stroke thickness="1.3" cap="round" name="Dash">{solid(INK, .6)}<DashPath name="D"><Dash length="3.2" name="On"/><Dash length="3.4" name="Off"/></DashPath></Stroke>')
    frame = shape('Frame', rect(254, 154, 3, (PERF + 10 + 162) / 2, 0) + '', stroke(solid(INK, .26), .7))
    frame2 = shape('Frame Inner', rect(248, 148, 2, (PERF + 10 + 162) / 2, 0), stroke(solid(INK, .13), .5))
    art = node('Art', collage(clip, ids['wings']) + [f'<ClippingShape sourceId="{clip}" name="Clip"/>'],
               x=64, y=-30, sx=.8, sy=.8)
    paper = shape('Paper', paper_path(PERF),
                  fill(lgrad(-HW, -HH, HW, HH, [(0, PAPER_A, 1), (1, PAPER_B, 1)]), name='Base')
                  + fill(rgrad(-150, 90, 230, [(0, 'c98a97', .16), (1, 'c98a97', 0)]), name='Warm')
                  + fill(rgrad(120, -80, 220, [(0, 'ffffff', .5), (1, 'ffffff', 0)]), name='Light')
                  + stroke(solid('b77b88', .45), .8, name='Edge'))
    clipsrc = shape('Front Clip', paper_path(PERF), sid=clip)
    kids = [glint, shade, *lines, plan, title, eyebrow, stars(), date, admit, barcode(), perf, art, frame2, frame, grain(7), paper, clipsrc]
    return node('Front', kids, nid_=ids['front'])

def back_face(ids):
    cx = (-HW + -PERF) / 2   # centre of the big part (stub is on the right on the back)
    shade = shape('Shade', paper_path(-PERF), fill(lgrad(-HW, 0, HW, 0, [(0, INK, .26), (1, INK, 0)])), sid=ids['back_shade'], opacity=0)
    frm = text('From', [('FROM ', None), (DEFAULTS['frm'], P['frm'])], cx, 50, 9.5, F_MONO, alpha=.85, ls=2.4, ox=.5, oy=.5)
    love = text('With love', [('With love', None)], cx, 22, 31, F_FELL, ox=.5, oy=.5)
    ring = shape('Ring', ellipse(66, 66, cx, -30), stroke(solid(ROSE, .55), .9))
    ring2 = shape('Ring Inner', ellipse(60, 60, cx, -30), stroke(solid(ROSE, .3), .6))
    disc = shape('Disc', ellipse(60, 60, cx, -30), fill(rgrad(cx - 6, -38, 40, [(0, 'fbeef1', .9), (1, PINK, .35)])))
    seal = node('Seal', [lotus(0, 0, .56, 'Seal Lotus')], x=cx, y=-17)
    stub = text('Stub', [('KEEP THIS STUB', None)], 138, 0, 8.5, F_MONO, alpha=.5, ls=1.6, ox=.5, oy=.5, rot=PI / 2)
    heart_s = shape('Stub Heart', svg_path(HEART_D, -12, -12, .45), fill(solid(ROSE, .7)), x=138, y=-62)
    content = node('Back Content', [frm, love, seal, ring, ring2, disc, stub, heart_s], nid_=ids['back_content'])
    perf = shape('Perforation', svg_path(f'M{-PERF} -72V72'),
                 f'<Stroke thickness="1.2" cap="round" name="Dash">{solid(INK, .3)}<DashPath name="D"><Dash length="3.2" name="On"/><Dash length="3.4" name="Off"/></DashPath></Stroke>')
    frame = shape('Frame', rect(254, 154, 3, (-PERF - 10 - 162) / 2, 0), stroke(solid(INK, .18), .7))
    paper = shape('Paper', paper_path(-PERF),
                  fill(lgrad(HW, -HH, -HW, HH, [(0, BACK_A, 1), (1, BACK_B, 1)]), name='Base')
                  + fill(rgrad(-110, -80, 220, [(0, 'ffffff', .4), (1, 'ffffff', 0)]), name='Light')
                  + stroke(solid('b77b88', .45), .8, name='Edge'))
    return node('Back', [shade, content, perf, frame, grain(11), paper], nid_=ids['back'])

HEART_D = 'M12 21C12 21 3 14.5 3 8.5C3 5.5 5.3 3.5 8 3.5C9.8 3.5 11.2 4.6 12 6C12.8 4.6 14.2 3.5 16 3.5C18.7 3.5 21 5.5 21 8.5C21 14.5 12 21 12 21Z'

def envelope(ids):
    seal = node('Wax Seal', [
        shape('Seal Heart', svg_path(HEART_D, -12, -12, .5), fill(solid('fff4f6', .95))),
        shape('Seal', ellipse(26, 26), fill(rgrad(-4, -5, 18, [(0, 'e7a1b6', 1), (1, 'b65d7b', 1)])) + stroke(solid('9c4b66', .5), .8)),
    ], nid_=ids['seal'], y=9, sx=0, sy=0)
    flap = shape('Flap', ppath([vtx(-HW, 0, radius=4), vtx(HW, 0, radius=4), vtx(0, 96, radius=14)]),
                 fill(solid('f1d2da', cid=ids['flap_color'])) + stroke(solid('b77b88', .5), .8), sid=ids['flap'], y=-HH, sy=0)
    flap_shadow = shape('Flap Shadow', ppath([vtx(-HW + 6, 0), vtx(HW - 6, 0), vtx(0, 94, radius=14)]),
                        f'<Fill fillRule="clockwise" name="Soft">{solid(INK, .22)}<Feather strength="9" name="F"/></Fill>',
                        sid=ids['flap_shadow'], y=-HH + 3, sy=0, opacity=0)
    lower = shape('Lower Flap', ppath([vtx(-HW, HH), vtx(-6, 2, radius=10), vtx(6, 2), vtx(HW, HH)]),
                  fill(lgrad(0, 0, 0, HH, [(0, 'ecc8d2', 1), (1, 'f2d6dd', 1)])) + stroke(solid('b77b88', .4), .7))
    sides = shape('Side Flaps', ppath([vtx(-HW, -HH), vtx(-20, -2, radius=10), vtx(-HW, HH)]) + ppath([vtx(HW, -HH), vtx(20, -2, radius=10), vtx(HW, HH)]),
                  fill(solid('f4dbe1')) + stroke(solid('b77b88', .3), .6))
    body = shape('Envelope Body', rect(W, H, 6), fill(lgrad(-HW, -HH, HW, HH, [(0, 'f6dee4', 1), (1, 'edd0d8', 1)])) + stroke(solid('b77b88', .45), .8))
    return [node('Envelope Flap', [seal, flap, flap_shadow], nid_=ids['envflap'], opacity=0),
            node('Envelope', [lower, sides, body], nid_=ids['envelope'], opacity=0)]

def heart_node(i, hid):
    col = ['e6809c', 'f4c6d6', 'd98aa5', 'efb3c6', 'e6809c'][i]
    return node(f'Heart {i + 1}', [shape('Heart', svg_path(HEART_D, -12, -12), fill(solid(col)))], nid_=hid, x=-60, y=-60, opacity=0)

# ── motion ─────────────────────────────────────────────────────────────────
def bez(x1, y1, x2, y2):
    def bx(t): return 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t ** 2 * x2 + t ** 3
    def by(t): return 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t ** 2 * y2 + t ** 3
    def e(u):
        if u <= 0: return 0.0
        if u >= 1: return 1.0
        lo, hi = 0.0, 1.0
        for _ in range(40):
            m = (lo + hi) / 2
            if bx(m) < u: lo = m
            else: hi = m
        return by((lo + hi) / 2)
    return e

EASE_OUT = bez(.22, .8, .32, 1)
EASE_IO = bez(.45, 0, .25, 1)
EASE_IN = bez(.5, 0, .85, .45)
SOFT = bez(.4, 0, .2, 1)

def seg(t, a, b):
    return min(1.0, max(0.0, (t - a) / (b - a)))

def damp(t, period, decay):
    """1 at t=0, decaying cosine; 0 before 0."""
    if t < 0: return 0.0
    return math.exp(-decay * t) * math.cos(2 * PI * t / period)

def dsin(t, period, decay):
    if t < 0: return 0.0
    return math.exp(-decay * t) * math.sin(2 * PI * t / period)

REST = dict(tx=200, ty=250)

class Track:
    def __init__(self, obj, prop, fn, kind='double'):
        self.obj, self.prop, self.fn, self.kind = obj, prop, fn, kind

def sample(fn, nframes, step=1, tol=0.0015):
    pts = [(fr, fn(fr / FPS)) for fr in range(0, nframes + 1, step)]
    if pts[-1][0] != nframes: pts.append((nframes, fn(nframes / FPS)))
    # prune keys that a straight line through their neighbours already reproduces
    keep = [pts[0]]
    for i in range(1, len(pts) - 1):
        a, b, c = keep[-1], pts[i], pts[i + 1]
        lin = a[1] + (c[1] - a[1]) * (b[0] - a[0]) / (c[0] - a[0])
        span = max(1e-6, abs(c[1] - a[1]), abs(b[1]))
        if abs(lin - b[1]) > tol * max(1.0, span) or (c[0] - a[0]) > 40:
            keep.append(b)
    keep.append(pts[-1])
    return keep

def anim_xml(name, aid, nframes, tracks, loop='oneShot'):
    byobj = {}
    for tr in tracks: byobj.setdefault(tr.obj, []).append(tr)
    out = [f'<LinearAnimation name="{name}" fps="{FPS}" duration="{nframes}" loopValue="{loop}" id="{aid}">']
    for obj, trs in byobj.items():
        out.append(f'<KeyedObject objectId="{obj}">')
        for tr in trs:
            out.append(f'<KeyedProperty property="{tr.prop}">')
            if tr.kind == 'double':
                for fr, v in sample(tr.fn, nframes):
                    out.append(f'<KeyFrameDouble value="{f(v)}" frame="{fr}" interpolationType="linear"/>')
            elif tr.kind in ('id', 'color'):
                tag = 'KeyFrameId' if tr.kind == 'id' else 'KeyFrameColor'
                for fr, v in tr.fn:   # explicit hold keys
                    out.append(f'<{tag} value="{v}" frame="{fr}" interpolationType="hold"/>')
            out.append('</KeyedProperty>')
        out.append('</KeyedObject>')
    out.append('</LinearAnimation>')
    return '\n'.join(out)

def flip_fns(t0, t1, face_a, face_b, lift_base=0.0, lift_amp=-14.0):
    """theta 0..pi between t0 and t1; returns helpers and the face swap time."""
    def th(t): return PI * SOFT(seg(t, t0, t1))
    # time at which theta crosses pi/2
    lo, hi = t0, t1
    for _ in range(50):
        m = (lo + hi) / 2
        if th(m) < PI / 2: lo = m
        else: hi = m
    return th, hi

def build():
    ids = {k: nid() for k in ('ticket', 'squash', 'body', 'skewA', 'skewS', 'skewB', 'flip', 'lift', 'faces', 'front', 'back',
                             'front_shade', 'back_shade', 'back_content', 'glint', 'front_clip', 'shadow', 'envelope',
                             'flap', 'flap_color', 'envflap', 'flap_shadow', 'seal', 'wings')}
    hearts = [nid() for _ in range(5)]
    I = ids

    shadow = shape('Shadow', rect(326, 158, 10), f'<Fill fillRule="clockwise" name="Soft">{solid("6b3a48", .34)}<Feather strength="15" name="F"/></Fill>',
                   sid=I['shadow'], y=9)
    faces = node('Faces', [front_face(I), back_face(I)], nid_=I['faces'], tag='Solo', extra=f' activeComponentId="{I["front"]}"')
    lift = node('Lift', [*envelope(I), faces], nid_=I['lift'])
    flip = node('Flip', [lift, shadow], nid_=I['flip'])
    skewB = node('SkewB', [flip], nid_=I['skewB'], rot=-PI / 4)
    skewS = node('SkewS', [skewB], nid_=I['skewS'])
    skewA = node('SkewA', [skewS], nid_=I['skewA'], rot=PI / 4)
    body = node('Body', [skewA], nid_=I['body'], y=-HH)
    squash = node('Squash', [body], nid_=I['squash'], y=HH)
    ticket = node('Ticket', [squash], nid_=I['ticket'], x=REST['tx'], y=REST['ty'])
    heart_nodes = [heart_node(i, h) for i, h in enumerate(hearts)]

    # ── rest values for every animated property ──
    rest = {
        (I['ticket'], 'x'): REST['tx'], (I['ticket'], 'y'): REST['ty'], (I['ticket'], 'rotation'): 0,
        (I['ticket'], 'scaleX'): 1, (I['ticket'], 'scaleY'): 1, (I['ticket'], 'opacity'): 1,
        (I['squash'], 'scaleX'): 1, (I['squash'], 'scaleY'): 1,
        (I['skewA'], 'rotation'): PI / 4, (I['skewS'], 'scaleX'): 1, (I['skewS'], 'scaleY'): 1,
        (I['flip'], 'scaleX'): 1, (I['flip'], 'scaleY'): 1, (I['lift'], 'y'): 0,
        (I['front_shade'], 'opacity'): 0, (I['back_shade'], 'opacity'): 0, (I['back_content'], 'opacity'): 1,
        (I['glint'], 'x'): -330, (I['shadow'], 'y'): 9, (I['shadow'], 'opacity'): 1,
        (I['envelope'], 'opacity'): 0, (I['envflap'], 'opacity'): 0, (I['flap'], 'scaleY'): 0, (I['flap_shadow'], 'opacity'): 0, (I['flap_shadow'], 'scaleY'): 0,
        (I['seal'], 'scaleX'): 0, (I['seal'], 'scaleY'): 0, (I['seal'], 'rotation'): 0,
        (I['wings'], 'scaleX'): 1,
    }
    for h in hearts:
        rest.update({(h, 'x'): -60, (h, 'y'): -60, (h, 'opacity'): 0, (h, 'scaleX'): 1, (h, 'scaleY'): 1, (h, 'rotation'): 0})

    def tracks_from(fns, nframes, solo_keys, flap_col_keys=None):
        trs = []
        for key, rv in rest.items():
            fn = fns.get(key, (lambda rv: (lambda t: rv))(rv))
            trs.append(Track(key[0], key[1], fn))
        trs.append(Track(I['faces'], 'activeComponentId', solo_keys, 'id'))
        trs.append(Track(I['flap_color'], 'colorValue', flap_col_keys or [(0, argb('e7c0cb'))], 'color'))
        return trs

    def skew_fns(kfn):
        return {(I['skewA'], 'rotation'): lambda t: PI / 4 + kfn(t) / 2,
                (I['skewS'], 'scaleX'): lambda t: 1 + kfn(t) / 2,
                (I['skewS'], 'scaleY'): lambda t: 1 - kfn(t) / 2}

    # ═════════ SEND (his phone) ═════════
    S_N = 147
    th_s, swap_s = flip_fns(0.30, 0.95, 'front', 'back')
    def s_squash_y(t):
        v = 1.0
        if t < 0.12: v = 1 - 0.075 * EASE_OUT(t / 0.12)
        else: v = 1 - 0.075 * damp(t - 0.12, 0.30, 6.5)
        # crouch before take-off, then stretch
        v += -0.05 * math.sin(PI * seg(t, 1.36, 1.52)) if t < 1.52 else 0.045 * math.sin(PI * seg(t, 1.52, 1.82))
        return v
    def s_squash_x(t):
        v = 1.0
        if t < 0.12: v = 1 + 0.045 * EASE_OUT(t / 0.12)
        else: v = 1 + 0.045 * damp(t - 0.12, 0.30, 6.5)
        v += 0.03 * math.sin(PI * seg(t, 1.36, 1.52)) if t < 1.52 else -0.03 * math.sin(PI * seg(t, 1.52, 1.82))
        return v
    def s_lift(t):
        up = -15 * EASE_OUT(seg(t, 0.10, 0.42)) - 7 * math.sin(th_s(t))
        down = 9 * EASE_IO(seg(t, 0.95, 1.30))   # settles a little while it folds
        return up + down
    # flight path: bezier from rest to beyond the top-right corner
    P0, P1, P2, P3 = (REST['tx'], REST['ty'] + 4), (REST['tx'] + 10, 150), (300, 40), (392, -70)
    def path_pt(s):
        u = 1 - s
        return tuple(u ** 3 * a + 3 * u * u * s * b + 3 * u * s * s * c + s ** 3 * d for a, b, c, d in zip(P0, P1, P2, P3))
    FLY = bez(.55, 0, .72, .9)
    def s_prog(t): return FLY(seg(t, 1.50, 2.12))
    def s_tx(t): return REST['tx'] + (path_pt(s_prog(t))[0] - REST['tx']) if t >= 1.50 else REST['tx']
    def s_ty(t):
        crouch = 5 * math.sin(PI * seg(t, 1.36, 1.52)) if t < 1.52 else 0
        return (path_pt(s_prog(t))[1] if t >= 1.50 else REST['ty']) + crouch - (4 * (1 - s_prog(t)) if t >= 1.5 else 0) * 0
    def s_rot(t):
        flipr = -0.035 * math.sin(th_s(t))
        crouch = 0.035 * math.sin(PI * seg(t, 1.36, 1.52)) if t < 1.52 else 0
        fly = -0.34 * EASE_IO(seg(t, 1.50, 2.0)) + 0.06 * math.sin(PI * seg(t, 1.6, 2.1))
        return flipr + crouch + fly
    def s_scale(t): return 1 - 0.7 * bez(.4, 0, .3, 1)(seg(t, 1.50, 2.05))
    def s_op(t): return 1 - EASE_IN(seg(t, 1.86, 2.12))
    def s_k(t): return 0.075 * math.sin(2 * th_s(t))
    FLAP_CLOSE = bez(.55, 0, .25, 1)
    def flap_y(t):
        if t < 1.12: return -EASE_OUT(seg(t, 0.98, 1.12))
        return -1 + 2 * FLAP_CLOSE(seg(t, 1.12, 1.36)) + 0.04 * math.sin(PI * seg(t, 1.33, 1.46))
    fns = {
        (I['ticket'], 'x'): s_tx, (I['ticket'], 'y'): s_ty, (I['ticket'], 'rotation'): s_rot,
        (I['ticket'], 'scaleX'): s_scale, (I['ticket'], 'scaleY'): s_scale, (I['ticket'], 'opacity'): s_op,
        (I['squash'], 'scaleX'): s_squash_x, (I['squash'], 'scaleY'): s_squash_y,
        (I['flip'], 'scaleX'): lambda t: max(0.0, abs(math.cos(th_s(t)))),
        (I['flip'], 'scaleY'): lambda t: 1 + 0.045 * math.sin(th_s(t)),
        (I['lift'], 'y'): s_lift,
        (I['shadow'], 'y'): lambda t: 9 - 0.75 * s_lift(t),
        (I['shadow'], 'opacity'): lambda t: 1 + 0.028 * s_lift(t),
        (I['front_shade'], 'opacity'): lambda t: math.sin(th_s(t)) ** 1.5,
        (I['back_shade'], 'opacity'): lambda t: math.sin(th_s(t)) ** 1.5,
        (I['back_content'], 'opacity'): lambda t: 1 - EASE_IO(seg(t, 0.98, 1.14)),
        (I['envelope'], 'opacity'): lambda t: EASE_IO(seg(t, 0.96, 1.10)),
        (I['envflap'], 'opacity'): lambda t: seg(t, 0.96, 1.0),
        (I['flap'], 'scaleY'): flap_y,
        (I['flap_shadow'], 'scaleY'): lambda t: max(0.0, flap_y(t)),
        (I['flap_shadow'], 'opacity'): lambda t: EASE_IO(seg(t, 1.22, 1.36)),
        (I['seal'], 'scaleX'): lambda t: (1 - damp(t - 1.36, 0.26, 12)) * (t >= 1.36),
        (I['seal'], 'scaleY'): lambda t: (1 - damp(t - 1.36, 0.26, 12)) * (t >= 1.36),
        (I['seal'], 'rotation'): lambda t: -0.5 * (1 - EASE_OUT(seg(t, 1.36, 1.62))),
        (I['wings'], 'scaleX'): lambda t: 1,
    }
    fns.update(skew_fns(s_k))
    # hearts: born along the flight path, drift up and fade
    births = [1.66, 1.74, 1.82, 1.89, 1.96]
    rnd = random.Random(3)
    for i, (h, tb) in enumerate(zip(hearts, births)):
        bx, by = path_pt(s_prog(tb))
        ox, size, sway, rise = rnd.uniform(-14, 6), [0.82, 0.62, 0.9, 0.66, 0.78][i], rnd.uniform(5, 9) * (1 if i % 2 else -1), rnd.uniform(38, 52)
        life = 0.48
        def mk(tb=tb, bx=bx, by=by, ox=ox, size=size, sway=sway, rise=rise):
            u = lambda t: seg(t, tb, tb + life)
            return {
                (h, 'x'): lambda t: bx + ox - 6 + sway * math.sin(PI * 1.2 * u(t)),
                (h, 'y'): lambda t: by + 18 - rise * EASE_OUT(u(t)),
                (h, 'opacity'): lambda t: 0 if t < tb else min(1, (t - tb) / 0.07) * (1 - EASE_IN(seg(t, tb + life * .45, tb + life))),
                (h, 'scaleX'): lambda t: size * (1 - damp(t - tb, 0.24, 10)) * (t >= tb),
                (h, 'scaleY'): lambda t: size * (1 - damp(t - tb, 0.24, 10)) * (t >= tb),
                (h, 'rotation'): lambda t: 0.22 * math.sin(PI * 1.6 * u(t)) * (1 if sway > 0 else -1),
            }
        fns.update(mk())
    send_solo = [(0, I['front']), (round(swap_s * FPS), I['back'])]
    send_flap = [(0, argb('e7c0cb')), (round(1.06 * FPS + (1.34 - 1.06) * FPS * 0.5), argb('f1d2da'))]
    # flap crosses zero when the bezier reaches 0.5; find it
    fe = bez(.55, 0, .25, 1)
    lo, hi = 0.0, 1.0
    for _ in range(40):
        m = (lo + hi) / 2
        if fe(m) < 0.5: lo = m
        else: hi = m
    send_flap = [(0, argb('e7c0cb')), (round((1.12 + hi * 0.24) * FPS), argb('f1d2da'))]
    send = anim_xml('send', '0:31', S_N, tracks_from(fns, S_N, send_solo, send_flap))

    # ═════════ ARRIVE (her phone) ═════════
    A_N = 138
    T_LAND = 0.64
    th_a, swap_a = flip_fns(1.02, 1.62, 'back', 'front')
    DROP = bez(.5, 0, .82, .58)
    def a_ty(t):
        if t < T_LAND: return -150 + (REST['ty'] + 150) * DROP(t / T_LAND)
        u = t - T_LAND
        hop = -11 * math.sin(PI * seg(u, 0.07, 0.37)) * (0.07 <= u <= 0.37)
        return REST['ty'] + hop
    def a_tx(t): return REST['tx'] + 24 * (1 - EASE_OUT(seg(t, 0, T_LAND))) - 6 * math.sin(PI * seg(t, 0.0, T_LAND)) * (t < T_LAND)
    def a_rot(t):
        fall = -0.2 * (1 - bez(.3, 0, .4, 1)(seg(t, 0, T_LAND))) + 0.05 * math.sin(PI * seg(t, 0.25, T_LAND + 0.25))
        return fall - 0.03 * math.sin(th_a(t))
    def a_sq_y(t):
        land = -0.10 * dsin(t - T_LAND, 0.36, 6.5)
        settle = -0.03 * math.sin(PI * seg(t, 1.60, 1.76)) * (t < 1.76)
        return 1 + land + settle
    def a_sq_x(t):
        land = 0.065 * dsin(t - T_LAND, 0.36, 6.5)
        settle = 0.018 * math.sin(PI * seg(t, 1.60, 1.76)) * (t < 1.76)
        return 1 + land + settle
    def a_lift(t): return -16 * math.sin(th_a(t))
    def a_drop_p(t): return DROP(seg(t, 0, T_LAND))
    fns = {
        (I['ticket'], 'x'): a_tx, (I['ticket'], 'y'): a_ty, (I['ticket'], 'rotation'): a_rot,
        (I['ticket'], 'scaleX'): lambda t: 0.94 + 0.06 * EASE_OUT(seg(t, 0, T_LAND)),
        (I['ticket'], 'scaleY'): lambda t: 0.94 + 0.06 * EASE_OUT(seg(t, 0, T_LAND)),
        (I['squash'], 'scaleX'): a_sq_x, (I['squash'], 'scaleY'): a_sq_y,
        (I['flip'], 'scaleX'): lambda t: abs(math.cos(th_a(t))),
        (I['flip'], 'scaleY'): lambda t: 1 + 0.045 * math.sin(th_a(t)),
        (I['lift'], 'y'): a_lift,
        (I['shadow'], 'y'): lambda t: 9 + 26 * (1 - a_drop_p(t)) - 0.75 * a_lift(t),
        (I['shadow'], 'opacity'): lambda t: (0.15 + 0.85 * a_drop_p(t) ** 2) * (1 + 0.028 * a_lift(t)),
        (I['back_shade'], 'opacity'): lambda t: math.sin(th_a(t)) ** 1.5,
        (I['front_shade'], 'opacity'): lambda t: math.sin(th_a(t)) ** 1.5,
        (I['glint'], 'x'): lambda t: -330 + 660 * bez(.42, 0, .3, 1)(seg(t, 1.58, 2.22)),
    }
    fns.update(skew_fns(lambda t: -0.075 * math.sin(2 * th_a(t))))
    arrive_solo = [(0, I['back']), (round(swap_a * FPS), I['front'])]
    arrive = anim_xml('arrive', '0:32', A_N, tracks_from(fns, A_N, arrive_solo))

    # ═════════ IDLE ═════════
    idle = anim_xml('idle', '0:30', 60, tracks_from({}, 60, [(0, I['front'])]), loop='loop')

    # ── state machine ──
    def vm_trigger_cond(pid):
        return (f'<TransitionViewModelCondition><TransitionPropertyViewModelComparator><BindablePropertyTrigger>'
                f'<DataBindContext sourcePathIds="{VM}-{pid}" propertyKey="686"/></BindablePropertyTrigger>'
                f'</TransitionPropertyViewModelComparator><TransitionValueTriggerComparator/></TransitionViewModelCondition>')
    sm = f'''<StateMachine name="Ticket" id="0:20">
  <StateMachineTrigger name="send" id="0:21"/>
  <StateMachineTrigger name="arrive" id="0:22"/>
  <StateMachineLayer name="Ticket" id="0:23">
    <AnyState x="160" y="-140" id="0:24">
      <StateTransition stateToId="0:26" duration="0"><TransitionTriggerCondition inputId="0:21"/></StateTransition>
      <StateTransition stateToId="0:26" duration="0">{vm_trigger_cond(P['send'])}</StateTransition>
      <StateTransition stateToId="0:27" duration="0"><TransitionTriggerCondition inputId="0:22"/></StateTransition>
      <StateTransition stateToId="0:27" duration="0">{vm_trigger_cond(P['arrive'])}</StateTransition>
    </AnyState>
    <ExitState x="560" y="-140" id="0:28"/>
    <EntryState x="0" y="0" id="0:29"><StateTransition stateToId="0:25"/></EntryState>
    <AnimationState x="200" y="0" animationId="0:30" id="0:25"/>
    <AnimationState x="400" y="-60" animationId="0:31" reset="true" id="0:26"/>
    <AnimationState x="400" y="80" animationId="0:32" reset="true" id="0:27">
      <StateTransition stateToId="0:25" duration="0" enableExitTime="true" exitTimeIsPercetange="true" exitTime="100"/>
    </AnimationState>
  </StateMachineLayer>
</StateMachine>'''

    vm_props = ''.join(f'<ViewModelPropertyString name="{n}" id="{P[k]}"/>' for k, n in
                       (('title', 'title'), ('plan', 'plan'), ('name', 'name'), ('when', 'when'), ('frm', 'from'), ('date', 'date')))
    vm_props += f'<ViewModelPropertyTrigger name="send" id="{P["send"]}"/><ViewModelPropertyTrigger name="arrive" id="{P["arrive"]}"/>'
    vm_vals = ''.join(f'<ViewModelInstanceString propertyValue="{q(DEFAULTS[k])}" viewModelPropertyId="{P[k]}"/>'
                      for k in ('title', 'plan', 'name', 'when', 'frm', 'date'))
    vm_vals += f'<ViewModelInstanceTrigger viewModelPropertyId="{P["send"]}"/><ViewModelInstanceTrigger viewModelPropertyId="{P["arrive"]}"/>'

    doc = f'''<Rive version="1" kind="fragment">
<!-- GENERATED by gen.py: edit gen.py, then run `python3 gen.py`. -->
<Artboard defaultStateMachineId="0:20" viewModelId="{VM}" viewModelInstanceId="{VMI}" clip="true" styleId="0:5" width="400" height="420" name="Ticket" id="0:2">
<LayoutComponentStyle name="Artboard Style" id="0:5"/>
{ticket}
{''.join(heart_nodes)}
{PREVIEW_BG if PREVIEW else ''}
{sm}
{idle}
{send}
{arrive}
</Artboard>
<ViewModel defaultInstanceId="{VMI}" name="Ticket" id="{VM}">{vm_props}
<ViewModelInstance exports="true" name="Default" id="{VMI}">{vm_vals}</ViewModelInstance>
</ViewModel>
<FontAsset file="fonts/IMFeENit28P.ttf" name="IM Fell English Italic" id="{F_FELL}"/>
<FontAsset file="fonts/DMSerifDisplay-Regular.ttf" name="DM Serif Display" id="{F_SERIF}"/>
<FontAsset file="fonts/CourierPrime-Regular.ttf" name="Courier Prime" id="{F_MONO}"/>
</Rive>
'''
    return doc

PREVIEW = False
PREVIEW_BG = ('<Shape name="Preview Backdrop">' + rect(400, 420, 0, 200, 210)
              + fill(lgrad(0, 0, 0, 420, [(0, 'f6eef0', 1), (1, 'efe4e6', 1)])) + '</Shape>')

if __name__ == '__main__':
    import os, sys
    PREVIEW = '--preview' in sys.argv
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, 'scene.rml'), 'w') as fh:
        fh.write(build())
    print('wrote scene.rml')
