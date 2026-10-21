"""점검 공통 도우미: 앱 파일 서버, 가짜 Firebase 연결, '화면이 멈출 때까지 기다리기'.
고정 시간 대신 '로딩 원이 없고 화면 변화가 QUIET ms 동안 없으면' 바로 다음 단계로 감(최대 MAXW ms)."""
import os, http.server, threading, functools
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); SM = os.path.join(ROOT, "tests", "smoke")
QUIET, MAXW = 250, 6000
# 화면(DOM)이 마지막으로 바뀐 시각을 기록
WATCH = "(()=>{window.__lm=0;new MutationObserver(()=>{window.__lm=performance.now()}).observe(document,{subtree:true,childList:true,attributes:true,characterData:true})})()"
IDLE = "(q)=>!document.querySelector('#app .spin')&&performance.now()-(window.__lm||0)>q"
class _Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
class _S(http.server.ThreadingHTTPServer):
    def handle_error(self, *a): pass
def serve(root=ROOT):
    srv = _S(("127.0.0.1", 0), functools.partial(_Q, directory=root)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f"http://127.0.0.1:{srv.server_address[1]}/index.html"
# (주소 패턴, 대신 줄 파일 또는 None=빈 파일)
ROUTES = [("https://www.gstatic.com/**", os.path.join(SM, "fb.js")), ("**/firebase-config.js", os.path.join(SM, "fbcfg.js")), ("**/sw.js", None)]
def _ful(path):
    return (lambda r: r.fulfill(path=path, content_type="text/javascript")) if path else (lambda r: r.fulfill(body="", content_type="text/javascript"))
def setup(pg, *init):
    """동기(sync) 페이지 준비: 가짜 Firebase + 가짜 데이터 + 변화 감시"""
    for pat, path in ROUTES: pg.route(pat, _ful(path))
    pg.add_init_script(WATCH); pg.add_init_script(path=os.path.join(SM, "seed.js"))
    for s in init: pg.add_init_script(s)
def idle(pg, q=QUIET, mx=MAXW):
    """동기 페이지: 화면이 멈출 때까지(최대 mx). 시간 넘기면 False"""
    try: pg.wait_for_function(IDLE, arg=q, timeout=mx, polling=20); return True
    except Exception: return False
async def asetup(pg, *init):
    for pat, path in ROUTES: await pg.route(pat, _ful(path))
    await pg.add_init_script(WATCH); await pg.add_init_script(path=os.path.join(SM, "seed.js"))
    for s in init: await pg.add_init_script(s)
async def aidle(pg, q=QUIET, mx=MAXW):
    try: await pg.wait_for_function(IDLE, arg=q, timeout=mx, polling=20); return True
    except Exception: return False
