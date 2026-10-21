#!/usr/bin/env python3
"""대진 만들기 점검: 사람별 출전·고정 페어 장면 + 무작위 설정 수백 개.
'만들기 전 검사를 통과했는데 대진이 조건을 어기는' 경우가 하나라도 있으면 실패. 저장소 루트에서: python3 tests/smoke/draw.py"""
import os, sys, datetime, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from h import serve, setup, idle
from playwright.sync_api import sync_playwright
srv, URL = serve()
# 12~3시, 40분, 2코트(4회차). 김나리 2시까지, 냥이 1시 20분까지
N = [["김나리","14:00"],["강이","15:00"],["냥이","13:20"],["타냐","15:00"],["김가루","15:00"],["이수빈","15:00"],["이은현","15:00"],["고은지","15:00"],["윰이","15:00"],["김수정","15:00"],["박하늘","15:00"],["최유리","15:00"],["정다온","15:00"]]
SEED = """(()=>{const td=Object.keys(__DB.sessions)[0].split("_")[1],ts=Object.values(__DB.games)[0].updatedAt;
Object.assign(__DB.clubs.c1,{regularStartTime:"12:00",regularEndTime:"15:00",roundInterval:40,regularCourtCount:2});
__DB.sessionParticipants=Object.fromEntries(%s.map(([n,e],i)=>[`c1_${td}_x${i}`,{clubId:"c1",date:td,uid:"",guest:true,name:n,status:"in",start:"12:00",end:e,position:["fore","back","either"][i%%3],updatedAt:ts}]));__DB.sessions={};})();""" % json.dumps(N, ensure_ascii=False)
FUZZ = """(T)=>{const {S,buildDraw,psIssues,psViol}=__cm,ks=S.parts.filter(p=>p.status==="in").map(p=>"g:"+p.name),R=4,rnd=n=>Math.random()*n|0;let pass=0,blocked=0;const bad=[];
for(let t=0;t<T;t++){const ps={},pairs=[],pick=()=>ks[rnd(ks.length)];for(let i=0,nP=1+rnd(5);i<nP;i++){const k=pick(),r={};for(let n=1;n<=R;n++){const x=Math.random();if(x<.25)r[n]="in";else if(x<.4)r[n]="out"}ps[k]={r,n:Math.random()<.4?1+rnd(3):0}}
 for(let i=0,np=rnd(3);i<np;i++){const a=pick(),b=pick();if(a!==b&&!pairs.some(p=>p.includes(a)||p.includes(b)))pairs.push(Math.random()<.5?[a,b]:[a,b,1+rnd(2)])}
 const dr={mode:"pos",excl:{},pairs,ps,prio:["pair","pos","opp"]};if(psIssues(dr).length){blocked++;continue}
 let ok=false;for(let i=0;i<40&&!ok;i++){const pl=buildDraw(S.parts,S.cur,dr);if(!psViol(pl.rounds,dr).length)ok=true}if(ok)pass++;else bad.push(dr)}
return{pass,blocked,bad:bad.slice(0,3)}}"""
errs = []; out = []
def chk(c, msg):
    if not c: errs.append(msg)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 390, "height": 844})
    pg.on("pageerror", lambda e: errs.append("오류: " + str(e)))
    pg.clock.install(time=datetime.datetime.now().replace(hour=9, minute=0, second=0, microsecond=0))
    setup(pg, SEED)
    pg.goto(URL); idle(pg, 400)
    pg.locator("[data-a=club]").first.click(); idle(pg)
    pg.locator("[data-a=toDraw]").first.click(); idle(pg)
    W = lambda ms=0: idle(pg, 30)   # 클릭 뒤 화면이 다시 그려질 때까지만
    def acc(v):
        if pg.locator(f'[data-a=accTog][data-v={v}] .accv').inner_text() == "▾": pg.locator(f'[data-a=accTog][data-v={v}] .accv').click(); W()
    def add_people(*names):
        acc("ps"); pg.locator("[data-a=psAdd]").click(); W()
        for n in names: pg.locator(f'.sh [data-a=pkTap][data-id="g:{n}"]').click(); W(80)
        pg.locator("[data-a=pkOk]").click(); W()
    def cell(n, r, times): 
        for _ in range(times): pg.locator(f'.mc[data-id="g:{n}"][data-v="{r}"]').click(); W(80)
    # 찾기: 초성
    acc("ps"); pg.locator("[data-a=psAdd]").click(); W(); pg.fill("#pkq", "ㄱㅇㅈ"); W()
    shown = pg.locator(".sh .pkc b").all_inner_texts(); chk(shown == ["고은지"], f"초성 찾기 결과가 이상해요: {shown}")
    pg.fill("#pkq", "김ㄴ"); W(); shown = pg.locator(".sh .pkc b").all_inner_texts(); chk(shown == ["김나리"], f"섞어 찾기 결과가 이상해요: {shown}")
    pg.locator(".sh [data-a=pkX]").last.click(); W()
    # 사진 사례: 1·3 출전, 2·4 휴식 → 2게임 정해짐
    add_people("이은현"); cell("이은현", 1, 1); cell("이은현", 2, 2); cell("이은현", 3, 1); cell("이은현", 4, 2)
    fx = pg.locator('.mxr:has(.mc[data-id="g:이은현"]) .mg').inner_text(); chk(fx == "2게임", f"1·3 출전 + 2·4 휴식인데 게임 수가 '{fx}'")
    # 2시 회원 1~3 출전 → 매번 3경기
    add_people("김나리"); cell("김나리", 1, 1); cell("김나리", 2, 1); cell("김나리", 3, 1)
    # 페어(냥이 1:20에 감)
    acc("pp"); pg.locator("[data-a=ppAdd]").click(); W(); pg.locator('.sh [data-a=pkTap][data-id="g:강이"]').click(); W(80); pg.locator('.sh [data-a=pkTap][data-id="g:냥이"]').click(); W()
    RD = "()=>[...document.querySelectorAll('.list')].filter(l=>l.querySelector('.rh')).map(l=>[...l.querySelectorAll('.gr')].map(g=>[...g.querySelectorAll('.tg')].map(t=>[...t.querySelectorAll('span')].map(s=>s.textContent.trim()))))"
    pg.locator("[data-a=gen]").last.click(); W(450)
    for i in range(15):
        run = pg.evaluate(RD)
        c = lambda n: sum(1 for rd in run for g in rd if any(n in t for t in g))
        chk(c("김나리") == 3, f"김나리가 {c('김나리')}경기"); chk(c("이은현") == 2, f"이은현이 {c('이은현')}경기")
        for ri, rd in enumerate(run):
            for g in rd:
                for t in g:
                    if any("강이" in x for x in t) and ri < 2: chk(any("냥이" in x for x in t) or not any("냥이" in x for gg in rd for tt in gg for x in tt), f"{ri+1}회차 강이·냥이가 갈라짐")
        pg.locator("[data-a=gen]").last.click(); W(220)
    pg.go_back(); idle(pg)
    if not pg.locator("[data-a=psAdd]").count(): pg.locator("[data-a=toDraw]").first.click(); idle(pg)
    out.append("장면 점검 끝")
    # 무작위
    NF=int(os.environ.get("DRAW_N","400")); r = pg.evaluate(FUZZ, NF); out.append(f"무작위 {NF}개: 통과 {r['pass']} · 미리 막음 {r['blocked']} · 어김 {len(r['bad'])}")
    chk(not r["bad"], "검사를 통과했는데 조건을 어긴 설정: " + json.dumps(r["bad"], ensure_ascii=False)[:600])
    chk(r["pass"] > 100, f"통과한 설정이 너무 적어요({r['pass']})")
    # 게임 수 제한(4게임)이 있어도 마지막 회차까지 코트를 다 채우는지: 15명(1명은 14:20에 감)·3코트·35분·5회차(1021-6, 예전엔 마지막 회차 2코트)
    CAP = """(o)=>{const {S,buildDraw,key}=__cm,c={...S.cur,regularStartTime:"12:00",regularEndTime:"15:00",roundInterval:35,regularCourtCount:3},
 parts=Array.from({length:15},(_,i)=>({status:"in",guest:true,uid:"",name:"사람"+i,start:"12:00",end:i===14?"14:20":"15:00",position:"either"})),ps={};
 parts.slice(0,o.n).forEach(p=>ps[key(p)]={r:{},n:4});const dr={mode:"pos",excl:{},pairs:[],ps,prio:["pair","pos","opp"]},bad=[];
 for(let t=0;t<o.T;t++){const pl=buildDraw(parts,c,dr),cts=pl.rounds.map(r=>r.games.length),g={};pl.rounds.forEach(r=>r.games.forEach(x=>[...x.t1,...x.t2].forEach(p=>g[p.k]=(g[p.k]||0)+1)));
  const over=Object.keys(ps).filter(k=>(g[k]||0)>4);if(cts.length!==5||cts.some(x=>x!==3)||over.length)bad.push({cts,over})}
 return bad.slice(0,3)}"""
    for n in (6, 8):
        bad = pg.evaluate(CAP, {"n": n, "T": 60}); out.append(f"4게임 제한 {n}명 · 5회차 3코트: 어김 {len(bad)}")
        chk(not bad, f"4게임 제한 {n}명인데 코트가 비거나 게임 수 초과: " + json.dumps(bad, ensure_ascii=False)[:300])
    # 고정 페어 게임 수를 앞 회차에 다 써 버리던 경우(1021-7): 박하늘 4회차만·1게임, 타냐 3회차 출전·2게임, 둘이 같이 1게임 → 4회차에 같이
    PR = {"mode": "pos", "excl": {}, "pairs": [["g:타냐", "g:박하늘", 1]], "ps": {"g:김수정": {"r": {"1": "in", "2": "out", "4": "out"}, "n": 0}, "g:박하늘": {"r": {"2": "out", "4": "in"}, "n": 1}, "g:타냐": {"r": {"3": "in"}, "n": 2}, "g:윰이": {"r": {}, "n": 0}}, "prio": ["pair", "pos", "opp"]}
    # 같이 칠 게임을 '내 출전 확정 회차'에서 칠 수 있으면 중복으로 떼지 않음(수정 중 생긴 문제 2개)
    PRS = [PR, {"mode": "pos", "excl": {}, "pairs": [["g:냥이", "g:김나리", 2], ["g:타냐", "g:이은현", 2]], "ps": {"g:냥이": {"r": {"2": "in", "3": "out"}, "n": 2}, "g:이은현": {"r": {"1": "in"}, "n": 0}, "g:윰이": {"r": {"3": "in"}, "n": 0}}, "prio": ["pair", "pos", "opp"]},
           {"mode": "pos", "excl": {}, "pairs": [["g:김나리", "g:강이", 2]], "ps": {"g:김수정": {"r": {"3": "out", "4": "in"}, "n": 1}, "g:정다온": {"r": {"2": "out", "4": "in"}, "n": 1}, "g:김나리": {"r": {"2": "out", "3": "in"}, "n": 2}, "g:이수빈": {"r": {"4": "in"}, "n": 1}}, "prio": ["pair", "pos", "opp"]}]
    for i, dr in enumerate(PRS):
        f = pg.evaluate("(dr)=>{const {S,buildDraw,psViol}=__cm;let f=0;for(let t=0;t<60;t++){let ok=false;for(let i=0;i<40&&!ok;i++){const pl=buildDraw(S.parts,S.cur,dr);if(!psViol(pl.rounds,dr).length)ok=true}if(!ok)f++}return f}", dr)
        out.append(f"페어 같이 게임 장면 {i+1} · 60번: 어김 {f}"); chk(not f, f"페어 같이 게임 장면 {i+1}에서 {f}번 어김")
    b.close()
srv.shutdown()
print("\n".join(out)); print("\n".join(errs) if errs else "✅ 대진 점검 통과"); sys.exit(1 if errs else 0)
