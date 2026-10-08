#!/usr/bin/env python3
"""화면 점검: 가짜 Firebase(tests/smoke/fb.js)와 가짜 데이터(seed.js)로 앱을 띄워 주요 화면을 눌러 보고
자바스크립트 오류·멈춘 로딩을 찾아요. 저장소 루트에서: python3 tests/smoke/smoke.py  (playwright 필요)"""
import os, sys, http.server, threading, functools
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); SM = os.path.join(ROOT, "tests", "smoke")
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
class S2(http.server.ThreadingHTTPServer):
    def handle_error(self, *a): pass
srv = S2(("127.0.0.1", 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start(); port = srv.server_address[1]
VAR = {"기본": "", "순번제": "__DB.clubs.c1.mode='queue';", "결과만 기록": "__DB.clubs.c1.mode='record';",
       "대진 없음": "__DB.sessions={};", "코트 번호 없음": "delete __DB.clubs.c1.cnum;", "모임 끝남": "__DB.clubs.c1.regularEndTime='00:01';",
       "불참": "Object.values(__DB.sessionParticipants).forEach(x=>{if(x.uid==='u1')x.status='out'});",
       "모임 없는 날": "__DB.clubs.c1.regularDays=[(new Date().getDay()+3)%7];", "개인 모드": "localStorage.setItem('cm_mode','personal');"}
errs = []
def run(b, vn, vs):
    pg = b.new_page(viewport={"width": 390, "height": 844}); cur = ["시작"]
    pg.on("pageerror", lambda e: errs.append(f"[{vn} · {cur[0]}] 오류: {e}"))
    pg.on("console", lambda m: m.type == "error" and "Failed to load resource" not in m.text and errs.append(f"[{vn} · {cur[0]}] 콘솔: {m.text}"))
    pg.route("https://www.gstatic.com/**", lambda r: r.fulfill(path=os.path.join(SM, "fb.js"), content_type="text/javascript"))
    pg.route("**/firebase-config.js", lambda r: r.fulfill(path=os.path.join(SM, "fbcfg.js"), content_type="text/javascript"))
    pg.route("**/sw.js", lambda r: r.fulfill(body="", content_type="text/javascript"))
    pg.add_init_script(path=os.path.join(SM, "seed.js")); pg.add_init_script(vs)
    pg.goto(f"http://127.0.0.1:{port}/index.html"); pg.wait_for_timeout(1500)
    def step(name, sel=None, wait=800, opt=False):
        cur[0] = name
        if sel:
            el = pg.locator(sel).first
            if el.count() == 0:
                if not opt: errs.append(f"[{vn} · {name}] 찾을 수 없음: {sel}")
                return
            el.click()
        pg.wait_for_timeout(wait)
        if pg.locator("#app .spin").count(): errs.append(f"[{vn} · {name}] 로딩 원이 계속 보임")
    if vn == "개인 모드":
        for t in ["home", "games", "stats", "settings"]: step("개인 " + t, f".nav [data-k={t}]")
        step("사람 카드", "[data-a=pmopen]", opt=True)
    else:
        step("클럽 열기", "[data-a=club]", 1500)
        for t in ["games", "stats", "members", "settings", "today"]: step(t, f".nav [data-k={t}]", 1000)
        step("내 대진", "[data-a=mdt]", opt=True); step("닫기", ".sh [data-a=mclose]", opt=True)
        step("회원 탭", ".nav [data-k=members]"); step("회원 전적", "[data-a=msd]")
    pg.screenshot(path=os.path.join(SM, f"shot_{vn}.png")); pg.close()
with sync_playwright() as p:
    b = p.chromium.launch()
    for vn, vs in VAR.items(): run(b, vn, vs)
    b.close()
srv.shutdown()
print("\n".join(errs) if errs else f"✅ 화면 점검: {len(VAR)}가지 상황 오류 없음"); sys.exit(1 if errs else 0)
