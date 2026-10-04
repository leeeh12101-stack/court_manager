// Court Manager 순수 계산 모음 — 화면·Firebase와 무관해서 자동 테스트가 가능한 부분
export const CAT=[["club","클럽"],["tour","대회"],["friendly","친선"],["etc","기타"]],CATN={club:"클럽",tour:"대회",friendly:"친선",etc:"기타"},MT={single:"단식",mens:"남복",womens:"여복",mixed:"혼복",doubles:"복식"},CT={clay:"클레이",turf:"인조잔디",hard:"하드"},KPRE={club:["정기모임","월례대회"],tour:[],friendly:[],etc:[]};
export const STG=["예선 1","예선 2","32강","16강","8강","4강","결승"];
export const dayDiff=(a,b)=>Math.abs((new Date(+b.slice(0,4),+b.slice(4,6)-1,+b.slice(6))-new Date(+a.slice(0,4),+a.slice(4,6)-1,+a.slice(6)))/864e5);
export const POS={fore:"포",back:"백",either:"포or백"},DOW="일월화수목금토";
export const ymd=d=>d.getFullYear()+String(d.getMonth()+1).padStart(2,"0")+String(d.getDate()).padStart(2,"0");
export const XSYN=[["date",/^(날짜|일자|date|경기일)/],["pg",/^파트너성별/],["o1p",/^상대1포지션/],["o2p",/^상대2포지션/],["o1g",/^상대1성별/],["o2g",/^상대2성별/],["o1",/^상대1$/],["o2",/^상대2$/],["opf",/상대.*포|상대포/],["opb",/상대.*백|상대백/],["sa",/^(내점수|득점|우리점수)/],["sb",/^(상대점수|실점)/],["pos",/포지션|사이드|position/],["order",/차수|순서|order/],["mtype",/형태|종목|type/],["court",/코트|surface/],["cat",/^(구분|분류|category|경기유형)/],["kind",/유형|등급|레벨|종류|부서|level/],["label",/클럽|대회|모임명|장소|club/],["partner",/파트너|짝|partner/],["opp",/상대/],["score",/스코어|점수|score/],["res",/승패|결과|result/],["note",/메모|비고|코멘트|note/]];
export const XV={cat:[[/클럽|정기|번개|월례/,"club"],[/대회|오픈|tour/,"tour"],[/친선|교류|friend/,"friendly"],[/기타|etc/,"etc"]],court:[[/하드|hard/i,"hard"],[/클레이|앙투카|흙|clay/i,"clay"],[/인조|잔디|카펫|turf|grass/i,"turf"],[/^[-–]?$/,""]],mtype:[[/단식|single/i,"single"],[/남복|남자/,"mens"],[/여복|여자/,"womens"],[/혼복|혼합|mix/i,"mixed"],[/복식|double/i,"doubles"]],pos:[[/^(포|f|fore|듀스|deuce)/i,"fore"],[/^(백|b|back|애드|ad)/i,"back"],[/^[-–]?$/,"either"]],g:[[/^(남|m$|male)/i,"m"],[/^(여|f$|female)/i,"f"]],res:[[/^(승|w|win|o|○)/i,"w"],[/^(패|l|lose|loss|x|×)/i,"l"],[/^(무|d|draw|△)/i,"d"]]};
export const XO={cat:CAT,court:[["","–"],["clay","클레이"],["turf","인조잔디"],["hard","하드"]],mtype:Object.entries(MT),pos:[["fore","포"],["back","백"],["either","–"]],res:[["w","승"],["l","패"],["d","무"]],g:[["m","남"],["f","여"]]},XN={g:"성별",cat:"경기 유형",court:"코트",mtype:"경기형태",pos:"내 포지션",res:"승패"};
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
export const XHDR=["날짜","경기 유형","클럽/대회명","모임 종류/레벨","코트","경기형태","경기 순서/대회 단계","내 포지션","파트너","파트너 성별","상대1","상대1 포지션","상대1 성별","상대2","상대2 포지션","상대2 성별","스코어","승패","메모","출처"];
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
