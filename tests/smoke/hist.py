#!/usr/bin/env python3
"""지난 모임 반영 점검(1107-5): 지난 모임 경기 3개를 넣고, 반영 켬/끔 300번씩 비교. 저장소 루트에서: python3 tests/smoke/hist.py"""
import sys,os,json,datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
src=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),"draw.py")).read()
exec(src.split("errs = []")[0])
SEED2 = SEED.replace("__DB.sessions={};})();", """__DB.sessions={};
const P=n=>({k:"g:"+n,n,p:"either"});let i=0;const mk=(a,b,c,d)=>__DB.games["h"+(i++)]={clubId:"c1",date:"20261110",round:1,court:1,t1:[P(a),P(b)],t2:[P(c),P(d)],updatedAt:ts};
mk("이은현","고은지","윰이","타냐");mk("김가루","이수빈","김수정","박하늘");mk("최유리","정다온","이은현","강이");})();""")
EV="""(o)=>{const {S,buildDraw,key}=__cm;const base={mode:"pos",excl:{},pairs:[],ps:{},prio:["pair","pos","opp"]};const K=(a,b)=>a<b?a+"|"+b:b+"|"+a;
const prevP=new Set(["이은현|고은지","김가루|이수빈","최유리|정다온","타냐|윰이","박하늘|김수정","이은현|강이"].map(x=>{const [a,b]=x.split("|");return K("g:"+a,"g:"+b)}));
const prevO=new Set();[["이은현","고은지","윰이","타냐"],["김가루","이수빈","김수정","박하늘"],["최유리","정다온","이은현","강이"]].forEach(([a,b,c,d])=>[a,b].forEach(x=>[c,d].forEach(y=>prevO.add(K("g:"+x,"g:"+y)))));
const run=(on)=>{const h=S.hist;if(!on)S.hist=null;let pr=0,opp=0;for(let t=0;t<o.T;t++){const pl=buildDraw(S.parts,S.cur,{...base});pl.rounds.forEach(r=>r.games.forEach(g=>{[g.t1,g.t2].forEach(tm=>{if(prevP.has(K(tm[0].k,tm[1].k)))pr++});g.t1.forEach(a=>g.t2.forEach(b=>{if(prevO.has(K(a.k,b.k)))opp++}))}))}S.hist=h;return{pr:+(pr/o.T).toFixed(2),opp:+(opp/o.T).toFixed(2)}};
return{hist:S.hist&&{d:S.hist.date,n:S.hist.n},on:run(true),off:run(false)}}"""
EV2="""(o)=>{const {S,buildDraw,key}=__cm;const mkp=i=>({uid:"x"+i,name:"선수"+i,status:"in",start:"18:00",end:"22:00",position:"either",date:S.parts[0].date,noPlay:false});
S.parts=Array.from({length:20},(_,i)=>mkp(i));S.cur.regularStartTime="18:00";S.cur.regularEndTime="22:00";S.cur.regularCourtCount=3;const ps={};S.parts.forEach((p,i)=>{ps[key(p)]={n:i%2?3:4}});
const out=[];for(let t=0;t<30;t++){const pl=buildDraw(S.parts,S.cur,{mode:"pos",excl:{},pairs:[],ps,prio:["pair","pos","opp"]});out.push(pl.rounds.map(r=>r.games.length).join(","))}return[...new Set(out)]}"""
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={"width":390,"height":844})
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.clock.install(time=datetime.datetime.now().replace(hour=9,minute=0,second=0,microsecond=0))
    setup(pg,SEED2);pg.goto(URL);idle(pg,400)
    pg.locator("[data-a=club]").first.click();idle(pg)
    pg.locator("[data-a=toDraw]").first.click();idle(pg,800)
    r=pg.evaluate(EV,{"T":300});note=pg.locator("text=지난 모임").count()
    print(f"지난 모임 반영: 지난번 짝 반복 {r['off']['pr']}→{r['on']['pr']} · 지난번 상대 반복 {r['off']['opp']}→{r['on']['opp']} (대진 1개당 평균)")
    bad=[]
    if not r["hist"] or r["hist"]["n"]!=3: bad.append("지난 모임 기록을 못 읽었어요")
    if r["on"]["pr"]>r["off"]["pr"]*0.5: bad.append("지난 짝 반복이 충분히 줄지 않았어요")
    if r["on"]["opp"]>=r["off"]["opp"]*0.8: bad.append("지난 상대 반복이 충분히 줄지 않았어요")
    if not note: bad.append("설정 화면에 안내 문구가 없어요")
    r2=pg.evaluate(EV2,{})
    if r2!=["3,3,3,3,3,2"]: bad.append(f"게임 수 제한이 빠듯할 때 첫 회차부터 코트를 채워야 하는데 {r2}")
    errs+=bad
    b.close()
srv.shutdown()
print("\n".join(errs) if errs else "✅ 지난 모임 반영 통과"); sys.exit(1 if errs else 0)
