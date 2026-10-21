#!/usr/bin/env python3
"""화면 캡처: 가짜 Firebase로 앱을 띄워 원하는 화면까지 눌러 가고, 폭 360·390을 나란히 한 장으로 저장.
저장소 루트에서:
  python3 tests/shot.py 이름 [누를 곳 ...] [--init "JS"] [--h 740] [--full] [--cmp] [--el 선택자]
  · 누를 곳: CSS 선택자(첫 번째 것을 누름). 'js:코드'면 그 코드를 실행, 'wait:ms'면 기다림
  · --init: 앱이 뜨기 전 실행할 JS(가짜 데이터 바꾸기, 예 "__DB.clubs.c1.mode='queue';")
  · --h: 화면 높이(기본 740), --full: 페이지 전체 길이, --el: 그 부분만
  · --cmp: 마지막 커밋(바꾸기 전)과 지금(바꾼 뒤)을 위아래로 나란히
예) python3 tests/shot.py 통계 "[data-a=club]" ".nav [data-k=stats]"
결과: tests/out/이름.png (git에 안 올라감)"""
import os, sys, subprocess, tempfile, io
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "smoke"))
from h import ROOT, serve, setup, idle
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont
a = sys.argv[1:]
if not a or a[0].startswith("-"): print(__doc__); sys.exit(1)
name, steps, init, H, full, cmp_, el = a[0], [], "", 740, False, False, None
i = 1
while i < len(a):
    x = a[i]
    if x == "--init": init = a[i + 1]; i += 1
    elif x == "--h": H = int(a[i + 1]); i += 1
    elif x == "--el": el = a[i + 1]; i += 1
    elif x == "--full": full = True
    elif x == "--cmp": cmp_ = True
    else: steps.append(x)
    i += 1
errs = []
def shoot(b, url, w):
    pg = b.new_page(viewport={"width": w, "height": H}, device_scale_factor=2)
    pg.on("pageerror", lambda e: errs.append(f"[{w}] 오류: {e}"))
    setup(pg, init); pg.goto(url); idle(pg, 400)
    for s in steps:
        if s.startswith("js:"): pg.evaluate("()=>{" + s[3:] + "}")
        elif s.startswith("wait:"): pg.wait_for_timeout(int(s[5:]))
        else:
            l = pg.locator(s).first
            if not l.count(): errs.append(f"[{w}] 찾을 수 없음: {s}"); continue
            l.click()
        idle(pg)
    # 가로 넘침 확인(360·390 폭에서 화면이 옆으로 밀리는지)
    ov = pg.evaluate("()=>{const W=document.documentElement.clientWidth;return [...document.querySelectorAll('#app *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>W+1&&getComputedStyle(e).position!=='fixed'&&!e.closest('[style*=overflow],.hs,.chips')}).slice(0,5).map(e=>(e.className||e.tagName)+'').filter(Boolean)}")
    if ov: errs.append(f"[{w}] 화면 밖으로 넘친 요소: {ov}")
    png = pg.locator(el).first.screenshot() if el else pg.screenshot(full_page=full)
    pg.close(); return Image.open(io.BytesIO(png))
def row(root):
    srv, url = serve(root)
    with sync_playwright() as p:
        b = p.chromium.launch(); ims = [shoot(b, url, w) for w in (360, 390)]; b.close()
    srv.shutdown(); return ims
def font(sz):
    for f in ("/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf", "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc", "/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc"):
        if os.path.exists(f): return ImageFont.truetype(f, sz)
    import glob
    for f in glob.glob("/usr/share/fonts/**/*CJK*.tt[cf]", recursive=True) + glob.glob("/usr/share/fonts/**/*Nanum*.ttf", recursive=True):
        return ImageFont.truetype(f, sz)
    return ImageFont.load_default()
rows = []
if cmp_:
    d = tempfile.mkdtemp()
    subprocess.run(f"git archive HEAD | tar -x -C {d}", shell=True, cwd=ROOT, check=True)
    rows.append(("바꾸기 전", row(d)))
rows.append(("바꾼 뒤" if cmp_ else "", row(ROOT)))
G, T = 40, 56
W = sum(im.width for im in rows[0][1]) + G * 3
Ht = sum(max(im.height for im in r) + T for _, r in rows) + G
out = Image.new("RGB", (W, Ht), "#E9ECEA"); dr = ImageDraw.Draw(out); f = font(26); y = G // 2
for lab, ims in rows:
    x = G
    for w, im in zip((360, 390), ims):
        dr.text((x, y + 12), f"{lab}  {w}px".strip(), fill="#33403B", font=f); out.paste(im, (x, y + T)); x += im.width + G
    y += max(im.height for im in ims) + T
os.makedirs(os.path.join(ROOT, "tests", "out"), exist_ok=True)
path = os.path.join(ROOT, "tests", "out", f"{name}.png"); out.save(path)
print("\n".join(errs) if errs else "✅ 오류·넘침 없음"); print(path)
