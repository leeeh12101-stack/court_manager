// Court Manager 순수 계산 모음 — 화면·Firebase와 무관해서 자동 테스트가 가능한 부분
export const CAT=[["club","클럽"],["tour","대회"],["friendly","친선"],["etc","기타"]],CATN={club:"클럽",tour:"대회",friendly:"친선",etc:"기타"},MT={single:"단식",mens:"남복",womens:"여복",mixed:"혼복",doubles:"복식"},CT={clay:"클레이",turf:"인조잔디",hard:"하드"},KPRE={club:["정기모임","월례대회"],tour:[],friendly:[],etc:[]};
export const STG=["예선 1","예선 2","32강","16강","8강","4강","결승"];
export const dayDiff=(a,b)=>Math.abs((new Date(+b.slice(0,4),+b.slice(4,6)-1,+b.slice(6))-new Date(+a.slice(0,4),+a.slice(4,6)-1,+a.slice(6)))/864e5);
export const POS={fore:"포",back:"백",either:"포or백"},DOW="일월화수목금토";
export const ymd=d=>d.getFullYear()+String(d.getMonth()+1).padStart(2,"0")+String(d.getDate()).padStart(2,"0");
export const XSYN=[["date",/^(날짜|일자|date|경기일)/],["pg",/^파트너성별/],["o1p",/^상대1포지션/],["o2p",/^상대2포지션/],["o1g",/^상대1성별/],["o2g",/^상대2성별/],["o1",/^상대1$/],["o2",/^상대2$/],["opf",/상대.*포|상대포/],["opb",/상대.*백|상대백/],["sa",/^(내점수|득점|우리점수)/],["sb",/^(상대점수|실점)/],["pos",/포지션|사이드|position/],["order",/차수|순서|order/],["mtype",/형태|종목|단복식|type/],["court",/코트|surface/],["cat",/^(구분|분류|category|경기유형)/],["kind",/유형|등급|레벨|종류|부서|level/],["label",/클럽|대회|모임명|장소|club/],["partner",/파트너|짝|partner/],["opp",/상대/],["score",/스코어|점수|score/],["res",/승패|결과|result/],["note",/메모|비고|코멘트|note/]];
export const XV={cat:[[/클럽|정기|번개|월례/,"club"],[/대회|오픈|tour/,"tour"],[/친선|교류|friend/,"friendly"],[/기타|etc/,"etc"]],court:[[/하드|hard/i,"hard"],[/클레이|앙투카|흙|clay/i,"clay"],[/인조|잔디|카펫|turf|grass/i,"turf"],[/^[-–]?$/,""]],mtype:[[/단식|single/i,"single"],[/남복|남자/,"mens"],[/여복|여자/,"womens"],[/혼복|혼합|mix/i,"mixed"],[/복식|double/i,"doubles"]],pos:[[/^(포|f|fore|듀스|deuce)/i,"fore"],[/^(백|b|back|애드|ad)/i,"back"],[/^[-–]?$/,"either"]],g:[[/^(남|m$|male)/i,"m"],[/^(여|f$|female)/i,"f"]],res:[[/^(승|w|win|o|○)/i,"w"],[/^(패|l|lose|loss|x|×)/i,"l"],[/^(무|d|draw|△)/i,"d"]]};
export const XO={cat:CAT,court:[["","–"],["clay","클레이"],["turf","인조잔디"],["hard","하드"]],mtype:Object.entries(MT),pos:[["fore","포"],["back","백"],["either","–"]],res:[["w","승"],["l","패"],["d","무"]],g:[["m","남"],["f","여"]]},XN={g:"성별",cat:"구분",court:"코트 바닥",mtype:"단·복식",pos:"내 포지션",res:"승패"};
export const xn=h=>String(h||"").replace(/[\s_\/()·.\-]/g,"").toLowerCase();
export const xStage=v=>{v=String(v).trim();const t=[[/^(sf|semi)|준결승|(^|\D)4강/i,"4강"],[/^(f|final)$|(^|[^준])결승/i,"결승"],[/^(qf|quarter)|(^|\D)8강/i,"8강"],[/^r?16$|(^|\D)16강/i,"16강"],[/^r?32$|(^|\D)32강/i,"32강"],[/예선\s*1|^q1$/i,"예선 1"],[/예선\s*2|^q2$/i,"예선 2"]].find(([re])=>re.test(v));return t?t[1]:v};
export const xDate=v=>{v=String(v).trim();let m,y,mo,d,ny=0;if(/^\d{5}$/.test(v)){const t=new Date(Date.UTC(1899,11,30)+(+v)*864e5);y=t.getUTCFullYear();mo=t.getUTCMonth()+1;d=t.getUTCDate()}
 else if(m=v.match(/^(\d{2,4})\s*[-.\/년]\s*(\d{1,2})\s*[-.\/월]\s*(\d{1,2})/)){y=+m[1];if(y<100)y+=2000;mo=+m[2];d=+m[3]}else if(m=v.match(/^(\d{1,2})\s*[-.\/월]\s*(\d{1,2})/)){y=new Date().getFullYear();mo=+m[1];d=+m[2];ny=1}else return null;
 if(mo<1||mo>12||d<1||d>31)return null;return{d:`${y}${String(mo).padStart(2,"0")}${String(d).padStart(2,"0")}`,ny}};
export const hsh=t=>{let h=0;for(const ch of t)h=(h*31+ch.charCodeAt(0))|0;return Math.abs(h)},clean=d=>{const x={...d};for(const k in x)if(x[k]&&typeof x[k].toMillis==="function")x[k]=x[k].toMillis();return x};
export const ymdD=d=>d?`${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6)}`:"",PSL=p=>p==="fore"?"포":p==="back"?"백":"",tsD=x=>x&&x.toDate?x.toDate().toLocaleDateString("ko-KR"):x?new Date(x).toLocaleDateString("ko-KR"):"";
export const xvalDef=(d,raw)=>{raw=String(raw).trim();const r=(XV[d]||[]).find(([re])=>re.test(raw));return r?r[1]:undefined};
export function findHeader(rows){let hi=0,best=-1;rows.slice(0,10).forEach((r,i)=>{const sc=r.filter(h=>XSYN.some(([,re])=>re.test(xn(h)))).length;if(sc>best){best=sc;hi=i}});return hi}
export function detectCols(hdrs,saved={}){const used=new Set();return hdrs.map(h=>{const n=xn(h);if(!n)return"";let f=saved[n];if(f===undefined){const m=XSYN.find(([fd,re])=>re.test(n)&&(fd==="opp"||!used.has(fd)));f=m?m[0]:""}if(f&&f!=="opp"&&f!=="extra"){if(used.has(f))f="";else used.add(f)}return f})}
export function pickTeams(four,pc,oc,tl,tierOn){const [a,b,c,d]=four,K=(x,y)=>x<y?x+"|"+y:y+"|"+x,
 sc=([A,B])=>{let v=(pc[K(A[0].k,A[1].k)]||0)*10+(pc[K(B[0].k,B[1].k)]||0)*10;A.forEach(p=>B.forEach(q=>v+=(oc[K(p.k,q.k)]||0)*4));[A,B].forEach(t=>{if(t[0].p===t[1].p&&t[0].p!=="either")v+=8});if(tierOn)v+=Math.abs(tl(A[0])+tl(A[1])-tl(B[0])-tl(B[1]))*5;return v};
 return[[[a,b],[c,d]],[[a,c],[b,d]],[[a,d],[b,c]]].sort((x1,x2)=>sc(x1)-sc(x2))[0]}
export function mergeDocs(c,list,rep,keep){if(rep)c.docs={};list.forEach(r=>{const x=clean(r);if(x.deleted||(keep&&!keep(x)))delete c.docs[x._id];else c.docs[x._id]=x;c.last=Math.max(c.last,typeof x.updatedAt==="number"?x.updatedAt:0)});return c}
export function tourResults(gs,pres){const t=gs.filter(g=>g.cat==="tour"&&g.label).sort((a,b)=>a.date.localeCompare(b.date)),cl=[];t.forEach(g=>{const c=cl.find(x=>x.label===g.label&&dayDiff(x.last,g.date)<=3);if(c){c.gs.push(g);c.last=g.date}else cl.push({label:g.label,first:g.date,last:g.date,gs:[g]})});
 const rk=s=>{const i=STG.indexOf(s);return i<0?-1:i},NX={"32강":"16강","16강":"8강","8강":"4강","4강":"결승"};
 return cl.reverse().map(c=>{const z=[...c.gs].sort((a,b)=>rk(a.stage)-rk(b.stage)||a.date.localeCompare(b.date)),L=z[z.length-1],r=pres(L),st=L.stage||"",k=c.gs.find(g=>g.kind);let result,tone;
  if(st==="결승"){result=r==="w"?"우승":"준우승";tone=r==="w"?"gold":"tint"}else if(!st){result=`${c.gs.length}경기`;tone="gray"}else if(st.startsWith("예선")){result=r==="l"?"예선":"예선 통과";tone="gray"}else if(r==="l"){result=st;tone="gray"}else{result=NX[st]==="결승"?"결승 진출":(NX[st]||st);tone="tint"}
  return{label:c.label,first:c.first,kind:k?k.kind:"",result,tone}})}

// 엑셀 양식(빈 양식·내보내기·가져오기 공통)
export const XHDR=["날짜","구분","클럽·대회 이름","모임 종류·부서","코트 바닥","단·복식","경기 순서·대회 단계","내 포지션","파트너","파트너 성별","상대1","상대1 포지션","상대1 성별","상대2","상대2 포지션","상대2 성별","스코어","승패","메모","출처"];
// 월례대회: 날짜별 지정이 우선, 없으면 자동 규칙(매월 n번째 주 또는 마지막 주의 요일)
export function isMonthly(c,dk){const o=(c&&c.mdays||{})[dk];if(o!==undefined)return !!o;const M=(c&&c.monthly)||{};if(!M.on||!M.week)return false;
 const d=new Date(+dk.slice(0,4),+dk.slice(4,6)-1,+dk.slice(6));if(d.getDay()!==+M.dow)return false;const dim=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();return +M.week===5?d.getDate()+7>dim:Math.ceil(d.getDate()/7)===+M.week}
// 붙여넣은 명단에서 이름만 골라내기
export function parseNames(t){const out=[];String(t||"").split(/[\n,，、;·\t|/]+/).forEach(s=>{s=s.replace(/\([^)]*\)|\[[^\]]*\]|<[^>]*>/g," ").replace(/^\s*\d+\s*[.)\-:]?\s*/,"").replace(/[^\p{L}\s]/gu," ").replace(/\s+/g," ").trim();if(!s)return;
  (/^([가-힣]{2,4}\s)+[가-힣]{2,4}$/.test(s)?s.split(" "):[s]).forEach(n=>{n=n.trim();if(n&&n.length<=20&&!out.includes(n))out.push(n)})});return out}
// 선수 성별로 경기형태 정하기: 한 명이라도 모르면 "doubles"
export function mtOfP(t1,t2){if((t1||[]).length<2)return"single";const a=[...t1,...t2].map(p=>p&&p.g);if(a.length<4||a.some(x=>x!=="m"&&x!=="f"))return"doubles";const nm=a.filter(x=>x==="m").length;
 if(nm===4)return"mens";if(nm===0)return"womens";if(t1.filter(p=>p.g==="m").length===1&&t2.filter(p=>p.g==="m").length===1)return"mixed";return"doubles"}
// 매월 n번째 주(5=마지막 주) 요일인지
export function nthDow(d,week,dow){if(d.getDay()!==+dow)return false;const dim=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();return +week===5?d.getDate()+7>dim:Math.ceil(d.getDate()/7)===+week}
// 정기 모임 날인지: 매주(요일들) / 매월(n번째 주 요일) / 비정기(없음)
export function isRegDay(c,d){const t=(c&&c.schedType)||"weekly";if(t==="none")return false;if(t==="monthly"){const M=c.schedM||{};return !!+M.week&&nthDow(d,M.week,M.dow??6)}return ((c&&c.regularDays)||[]).includes(d.getDay())}
// 정기 일정이 정해져 있는지(비정기는 정한 것으로 봄)
export function schedSet(c){const t=(c&&c.schedType)||"weekly";return t==="none"||(t==="monthly"?!!+((c.schedM||{}).week):((c&&c.regularDays)||[]).length>0)}
// 앞으로의 모임 목록: 정기 규칙 + 날짜별 일정(sched: 추가 모임·변경·취소) + 예전 방식의 다음 모임 수정(mtgOverride)
export function meetingsAhead(c,now,days=60){const td=ymd(now),SC=(c&&c.sched)||{},ov=(c&&c.mtgOverride)||null,out=new Map(),D=k=>new Date(+k.slice(0,4),+k.slice(4,6)-1,+k.slice(6));
 for(let i=0;i<days;i++){const x=new Date(now.getFullYear(),now.getMonth(),now.getDate()+i);if(isRegDay(c,x)){const k=ymd(x);out.set(k,{dk:k,date:x,kind:"reg"})}}
 for(const [k,e] of Object.entries(SC)){if(!e||k<td)continue;if(e.off){out.delete(k);continue}const cur=out.get(k);out.set(k,{...(cur||{}),...e,dk:k,date:D(k),kind:cur?"reg":"extra"})}
 if(ov){if(ov.from)out.delete(ov.from);if(!ov.off&&ov.date&&ov.date>=td){const k=ov.date,cur=out.get(k),x=D(k);out.set(k,{...(cur||{}),dk:k,date:x,kind:cur?cur.kind:(isRegDay(c,x)?"reg":"extra"),start:ov.start,end:ov.end,courts:ov.courts,memo:ov.memo||"",mode:ov.mode,qrule:ov.qrule})}}
 return [...out.values()].filter(m=>m.dk>=td).sort((a,b)=>a.dk<b.dk?-1:1).map(m=>({...m,today:m.dk===td,monthly:isMonthly(c,m.dk)}))}
// 개인 기록의 모임 종류 자동 채우기
export function kindOf(c,dk){if(isMonthly(c,dk))return"월례대회";const e=((c&&c.sched)||{})[dk];if(e&&!e.off&&!isRegDay(c,new Date(+dk.slice(0,4),+dk.slice(4,6)-1,+dk.slice(6))))return"";return isRegDay(c,new Date(+dk.slice(0,4),+dk.slice(4,6)-1,+dk.slice(6)))?"정기모임":""}
// 개인 기록(own)과 클럽 동기화 기록(club)의 겹침 찾기: sure=날짜·사람·점수 같음, maybe=날짜 같고 사람 대부분 같음
export function findDups(pg,keep=[]){const nm=x=>xn(x||""),ppl=g=>({pa:(g.t1||[]).slice(1).map(p=>nm(p.n)).sort().join(","),op:(g.t2||[]).map(p=>nm(p.n)).sort().join(",")}),
 all=g=>[...(g.t1||[]).slice(1),...(g.t2||[])].map(p=>nm(p.n)),sc=g=>g.scoreA!=null?g.scoreA+":"+g.scoreB:"r"+(g.res||""),
 own=pg.filter(g=>g.src==="own"&&!keep.includes(g.docId)),club=pg.filter(g=>g.src==="club"),used=new Set(),sure=[],maybe=[];
 for(const o of own){const po=ppl(o);let hit=null,kind="";
  for(const c of club){if(used.has(c.clubGameId)||c.date!==o.date)continue;const pc=ppl(c);
   if(po.pa===pc.pa&&po.op===pc.op){hit=c;kind=sc(o)===sc(c)?"sure":"maybe";break}
   const a=all(o),b=all(c),same=a.filter(x=>b.includes(x)).length;if(a.length>=2&&same>=a.length-1&&!hit){hit=c;kind="maybe"}}
  if(hit){used.add(hit.clubGameId);(kind==="sure"?sure:maybe).push([o,hit])}}
 return{sure,maybe}}
// 오늘 모임의 단계: before(모임 전) / during(진행 중) / after(종료 후). 오늘이 아니면 before
export function mPhase(m,start,end,now){if(!m||!m.today)return"before";if(m.ended)return"after";const t=String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0");return t<start?"before":t<end?"during":"after"}
// 명단에 없는 이름과 비슷한 회원 이름 찾기(띄어쓰기·대소문자 무시, 한 글자 차이, 끝부분 일치). 후보가 둘 이상 비슷하면 빈 값
const lev=(a,b)=>{const d=Array.from({length:a.length+1},(_,i)=>[i,...Array(b.length).fill(0)]);for(let j=1;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length]};
export function simName(n,names){const a=xn(n);if(!a)return"";const ex=names.filter(m=>xn(m)===a&&m!==n);if(ex.length===1)return ex[0];if(ex.length>1)return"";
 const sc=names.filter(m=>m!==n).map(m=>{const b=xn(m);let d=lev(a,b);if(Math.min(a.length,b.length)>=2&&(b.endsWith(a)||a.endsWith(b)))d=Math.min(d,1);return[m,d,b.length]}).filter(([,d,l])=>d<=1&&l>=2&&a.length>=2);
 return sc.length===1?sc[0][0]:""}
// 하루 경기 기록을 회차별로 묶기: r=대진 회차(1회차부터, 코트순) / q=순번제(경기 순서) / x=회차 없음(기타)
export function groupRounds(gs){const isQ=g=>g.source==="queue"||/_q\d+$/.test(g.id||""),R=new Map(),Q=[],X=[];
 for(const g of gs||[]){if(isQ(g))Q.push(g);else if(+g.round>0){const n=+g.round;if(!R.has(n))R.set(n,[]);R.get(n).push(g)}else X.push(g)}
 const out=[...R.keys()].sort((a,b)=>a-b).map(n=>({k:"r",n,gs:R.get(n).sort((a,b)=>(a.court||0)-(b.court||0))}));
 if(Q.length)out.push({k:"q",n:0,gs:Q.sort((a,b)=>(a.round||0)-(b.round||0))});if(X.length)out.push({k:"x",n:0,gs:X});return out}
// 여러 경기 이름 겹침: self=한 경기 안 중복(경기 번호), cross=여러 경기에 들어간 사람, old=이미 저장된 경기(saved)에 있는 사람. 띄어쓰기·대소문자 무시
export function dupNames(gs,saved=[]){const self=[],seen=new Map(),old=[];
 (gs||[]).forEach((nm,i)=>{const ks=nm.map(n=>xn(n)).filter(Boolean);if(new Set(ks).size<ks.length)self.push(i);[...new Set(ks)].forEach(k=>{if(!seen.has(k))seen.set(k,{n:String(nm.find(x=>xn(x)===k)).trim(),gi:[]});seen.get(k).gi.push(i)})});
 const cross=[...seen.values()].filter(v=>v.gi.length>1);
 (saved||[]).forEach(s=>(s.nm||[]).forEach(n=>{const k=xn(n);if(k&&seen.has(k)&&!old.some(o=>o.k===k))old.push({k,n:seen.get(k).n,court:s.court||0})}));
 return{self,cross,old:old.map(({n,court})=>({n,court}))}}
// 선수·페어 성적표(날짜·회차·코트 순으로 연승 계산). 게스트(g:)는 제외, 점수 없는 경기 제외
export function pTable(gs){const P={},PR={};
 [...(gs||[])].sort((a,b)=>a.date.localeCompare(b.date)||(a.round||0)-(b.round||0)||(a.court||0)-(b.court||0)).forEach(g=>{if(g.scoreA==null||g.scoreB==null)return;const r=g.scoreA>g.scoreB?1:g.scoreA<g.scoreB?2:0;
  [[g.t1,1,g.scoreA-g.scoreB],[g.t2,2,g.scoreB-g.scoreA]].forEach(([tm,sd,df])=>{const res=r===0?"d":r===sd?"w":"l",mem=(tm||[]).filter(p=>p&&p.k&&!p.k.startsWith("g:"));
   mem.forEach(p=>{const o=P[p.k]=P[p.k]||{k:p.k,n:p.n,g:0,w:0,d:0,l:0,df:0,cur:0,max:0};o.g++;o[res]++;o.df+=df;if(res==="w"){o.cur++;o.max=Math.max(o.max,o.cur)}else o.cur=0});
   if(mem.length===2){const s=[...mem].sort((a,b)=>a.k<b.k?-1:1),k=s.map(p=>p.k).join("|"),o=PR[k]=PR[k]||{key:k,ks:s.map(p=>p.k),ns:s.map(p=>p.n),g:0,w:0,d:0,l:0,df:0};o.g++;o[res]++;o.df+=df}})});
 return{P,PR}}
// 순위 비교: 값(x) → 승 많은 → 패 적은 → 득실차
export const rankCmp=(a,b)=>(b.x-a.x)||((b.w||0)-(a.w||0))||((a.l||0)-(b.l||0))||((b.df||0)-(a.df||0));
// 1위(동률이면 공동). 값이 0 이하면 없음
export function topK(rows){const s=[...(rows||[])].sort(rankCmp);if(!s.length||!(s[0].x>0))return[];return s.filter(r=>rankCmp(r,s[0])===0)}
export const rate=o=>o.w+o.l?o.w/(o.w+o.l):0;
export const BMIN={win:{m:5,q:10,y:20},pr:{m:3,q:5,y:10}};
export const perKey=(per,d)=>per==="d"?d:per==="m"?d.slice(0,6):per==="q"?d.slice(0,4)+"Q"+Math.ceil(+d.slice(4,6)/3):d.slice(0,4);
// 배지 목록: 일별=최다승, 월·분기·연=출석왕·최다 경기·최다승·승률왕·연승왕·베스트 페어. att=[{k,date}]
export function badges(gs,att=[],o={}){const off=o.off||[],out=[],grp=(L,f)=>{const G={};L.forEach(x=>{const k=f(x.date);(G[k]=G[k]||[]).push(x)});return G};
 if(!off.includes("mw"))for(const [dk,L] of Object.entries(grp(gs||[],d=>d))){topK(Object.values(pTable(L).P).map(p=>({...p,x:p.w}))).forEach(r=>out.push({k:r.k,t:"mw",per:"d",pk:dk,mon:!!(o.isMon&&o.isMon(dk))}))}
 for(const per of ["m","q","y"]){const GG=grp(gs||[],d=>perKey(per,d)),GA=grp(att||[],d=>perKey(per,d));
  for(const pk of new Set([...Object.keys(GG),...Object.keys(GA)])){const {P,PR}=pTable(GG[pk]||[]),V=Object.values(P),add=(t,rows)=>{if(!off.includes(t))topK(rows).forEach(r=>out.push({k:r.k,t,per,pk}))};
   const ac={};(GA[pk]||[]).forEach(a=>ac[a.k]=(ac[a.k]||0)+1);add("att",Object.entries(ac).map(([k,c])=>({k,x:c})));
   add("gm",V.map(p=>({...p,x:p.g})));add("mw",V.map(p=>({...p,x:p.w})));add("win",V.filter(p=>p.g>=BMIN.win[per]).map(p=>({...p,x:rate(p)})));add("st",V.map(p=>({...p,x:p.max})));
   if(!off.includes("pr"))topK(Object.values(PR).filter(p=>p.g>=BMIN.pr[per]).map(p=>({...p,x:rate(p)}))).forEach(r=>r.ks.forEach((k,i)=>out.push({k,t:"pr",per,pk,with:r.ks[1-i]})))}}
 return out}
// 같은 경기인지: 날짜·사람(띄어쓰기·순서 무시)·점수가 같으면. 개인 기록(t1[0]=나)은 me=true, 클럽 기록은 팀 순서가 바뀌어도 같은 경기로 봄
export function sameGame(a,b,me){if(!a||!b||a.date!==b.date)return false;const side=t=>(t||[]).map(p=>xn(p&&p.n||"")).sort().join(","),A1=side(me?(a.t1||[]).slice(1):a.t1),A2=side(a.t2),B1=side(me?(b.t1||[]).slice(1):b.t1),B2=side(b.t2);
 const sc=(g,f)=>g.scoreA!=null?(f?g.scoreB+":"+g.scoreA:g.scoreA+":"+g.scoreB):"r"+(g.res||"");
 if(A1===B1&&A2===B2)return sc(a)===sc(b);return !me&&A1===B2&&A2===B1&&sc(a)===sc(b,1)}
// 개인 기록 안에서 똑같이 여러 번 저장된 경기 묶음(직접 입력한 것만). keep=그대로 두기로 한 docId
export function exactDups(pg,keep=[]){const own=(pg||[]).filter(g=>g.src==="own"&&!keep.includes(g.docId)),out=[],used=new Set();
 own.forEach((g,i)=>{if(used.has(i))return;const grp=[g];own.forEach((h,j)=>{if(j>i&&!used.has(j)&&sameGame(g,h,1)){grp.push(h);used.add(j)}});if(grp.length>1)out.push(grp)});return out}
// 개인 경기 클럽·대회별 묶기: 대회는 같은 이름이라도 3일 넘게 떨어지면 다른 대회, 나머지는 이름(없으면 '기타')별. 최근 순
export function groupLabel(gs){const out=[];
 [...(gs||[])].filter(g=>g.cat==="tour"&&g.label).sort((a,b)=>a.date.localeCompare(b.date)).forEach(g=>{const c=out.find(x=>x.tour&&x.label===g.label&&dayDiff(x.last,g.date)<=3);if(c){c.gs.push(g);c.last=g.date}else out.push({tour:1,label:g.label,first:g.date,last:g.date,gs:[g]})});
 (gs||[]).filter(g=>!(g.cat==="tour"&&g.label)).forEach(g=>{const l=g.label||"기타";let c=out.find(x=>!x.tour&&x.label===l);if(!c){c={tour:0,label:l,first:g.date,last:g.date,gs:[]};out.push(c)}c.gs.push(g);if(g.date<c.first)c.first=g.date;if(g.date>c.last)c.last=g.date});
 out.forEach(c=>{c.key=(c.tour?"t:"+c.first+":":"l:")+c.label;c.gs.sort((a,b)=>b.date.localeCompare(a.date)||(b.order||0)-(a.order||0))});return out.sort((a,b)=>b.last.localeCompare(a.last))}
