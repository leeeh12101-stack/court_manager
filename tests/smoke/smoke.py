#!/usr/bin/env python3
"""화면 점검: 가짜 Firebase(tests/smoke/fb.js)와 가짜 데이터(seed.js)로 앱을 띄워 주요 화면을 눌러 보고
자바스크립트 오류·멈춘 로딩을 찾아요. 저장소 루트에서: python3 tests/smoke/smoke.py  (playwright 필요)
고정 대기 없이 화면이 멈추면 바로 다음 단계(h.py), 상황 여러 개를 동시에 실행(SMOKE_PAR, 기본 4)."""
import os, sys, asyncio
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from h import SM, serve, asetup, aidle
from playwright.async_api import async_playwright
VAR = {"기본": "", "순번제": "__DB.clubs.c1.mode='queue';", "결과만 기록": "__DB.clubs.c1.mode='record';",
       "대진 없음": "__DB.sessions={};", "코트 번호 없음": "delete __DB.clubs.c1.cnum;", "모임 끝남": "__DB.clubs.c1.regularEndTime='00:01';",
       "불참": "Object.values(__DB.sessionParticipants).forEach(x=>{if(x.uid==='u1')x.status='out'});",
       "모임 없는 날": "__DB.clubs.c1.regularDays=[(new Date().getDay()+3)%7];", "개인 모드": "localStorage.setItem('cm_mode','personal');", "포백 테스트(로그인 전)": "globalThis.__USER=null;", "사용법 투어": "globalThis.__TOUR=1;"}
errs = []
async def run(b, url, vn, vs):
    pg = await b.new_page(viewport={"width": 390, "height": 844}); cur = ["시작"]
    pg.on("pageerror", lambda e: errs.append(f"[{vn} · {cur[0]}] 오류: {e}"))
    pg.on("console", lambda m: m.type == "error" and "Failed to load resource" not in m.text and errs.append(f"[{vn} · {cur[0]}] 콘솔: {m.text}"))
    await asetup(pg, vs); await pg.goto(url); await aidle(pg, 400)
    async def step(name, sel=None, opt=False):
        cur[0] = name
        if sel:
            el = pg.locator(sel).first
            if await el.count() == 0:
                if not opt: errs.append(f"[{vn} · {name}] 찾을 수 없음: {sel}")
                return
            await el.click()
        await aidle(pg)
        if await pg.locator("#app .spin").count(): errs.append(f"[{vn} · {name}] 로딩 원이 계속 보임")
    async def tour(name, need=True):
        cur[0] = name; k = 0
        try: await pg.wait_for_selector("#tour", timeout=1500)   # 투어는 화면 그린 뒤 0.45초에 뜸
        except Exception: pass
        while await pg.locator("#tour").count() and k < 8:
            k += 1; await pg.locator("#tour [data-t=n]").click(); await aidle(pg, 150)
        if need and not k: errs.append(f"[{vn} · {name}] 사용법이 안 뜸")
        if await pg.locator("#tour").count(): errs.append(f"[{vn} · {name}] 사용법이 안 닫힘")
    if vn == "사용법 투어":
        await step("클럽 열기", "[data-a=club]"); await tour("오늘 탭")
        await step("회원 탭", ".nav [data-k=members]"); await tour("회원 탭")
        await step("오늘 탭", ".nav [data-k=today]"); await tour("다시 안 뜸", False)
        if await pg.evaluate("()=>(JSON.parse(localStorage.getItem('cm_tour')||'[]')).length") < 3: errs.append(f"[{vn}] 본 단계가 저장 안 됨")
    elif vn.startswith("포백"):
        for n, s in [("배너", "[data-a=ftOpen]"), ("시작", "[data-a=ftGo]"), ("손", "[data-a=ftAns]"), ("이전", "[data-a=ftPrev]")]: await step(n, s)
    elif vn == "개인 모드":
        for t in ["home", "games", "stats", "settings"]: await step("개인 " + t, f".nav [data-k={t}]")
        await step("사람 카드", "[data-a=pmopen]", opt=True)
    else:
        await step("클럽 열기", "[data-a=club]")
        for t in ["games", "stats", "members", "settings", "today"]: await step(t, f".nav [data-k={t}]")
        await step("내 대진", "[data-a=mdt]", opt=True); await step("닫기", ".sh [data-a=mclose]", opt=True)
        await step("회원 탭", ".nav [data-k=members]"); await step("회원 전적", "[data-a=msd]")
    cur[0] = "끝"; await pg.wait_for_timeout(500)   # 늦게 도는 타이머(투어 확인 등) 오류까지 잡기
    await pg.screenshot(path=os.path.join(SM, f"shot_{vn}.png")); await pg.close()
async def main():
    srv, url = serve(); sem = asyncio.Semaphore(int(os.environ.get("SMOKE_PAR", "4")))
    async with async_playwright() as p:
        b = await p.chromium.launch()
        async def one(vn, vs):
            async with sem: await run(b, url, vn, vs)
        await asyncio.gather(*(one(vn, vs) for vn, vs in VAR.items())); await b.close()
    srv.shutdown()
asyncio.run(main())
print("\n".join(errs) if errs else f"✅ 화면 점검: {len(VAR)}가지 상황 오류 없음"); sys.exit(1 if errs else 0)
