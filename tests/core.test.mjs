// Court Manager 핵심 계산 자동 테스트
// 실행: node tests/core.test.mjs   (저장소 루트에서)
import * as C from "../core.js";

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) pass++; else { fail++; console.log(`✗ ${name}\n   기대: ${w}\n   실제: ${g}`); }
};

// ---------- 날짜
eq("ymd", C.ymd(new Date(2026, 9, 4)), "20261004");
eq("ymdD", C.ymdD("20261004"), "2026-10-04");
eq("dayDiff 3일", C.dayDiff("20260930", "20261003"), 3);
eq("xDate 표준", C.xDate("2026-09-20"), { d: "20260920", ny: 0 });
eq("xDate 점", C.xDate("2026.9.2"), { d: "20260902", ny: 0 });
eq("xDate 두 자리 연도", C.xDate("26/9/20"), { d: "20260920", ny: 0 });
eq("xDate 한글", C.xDate("2026년 9월 20일"), { d: "20260920", ny: 0 });
eq("xDate 연도 없음", C.xDate("9/22").ny, 1);
eq("xDate 엑셀 일련번호", C.xDate("46285"), { d: "20260920", ny: 0 });
eq("xDate 잘못된 달", C.xDate("2026-13-01"), null);
eq("xDate 글자", C.xDate("어제"), null);

// ---------- 대회 단계 표기
for (const [raw, want] of [["F", "결승"], ["final", "결승"], ["SF", "4강"], ["준결승", "4강"], ["QF", "8강"], ["R16", "16강"], ["32강", "32강"], ["예선1", "예선 1"], ["Q2", "예선 2"], ["64강", "64강"], ["128강", "128강"], ["결승전", "결승"], ["4강전", "4강"], ["준결승전", "4강"]])
  eq(`xStage ${raw}`, C.xStage(raw), want);

// ---------- 엑셀 열 인식 (새 양식 · 앱 내보내기 · 예전 양식)
const cols = h => C.detectCols(h);
eq("열 인식: 앱 내보내기 양식",
  cols(["날짜", "경기 유형", "클럽/대회명", "모임 종류/레벨", "코트면", "경기형태", "당일 경기차수", "내 포지션", "파트너", "상대 포", "상대 백", "상대 기타1", "상대 기타2", "스코어", "승패", "메모", "출처"]),
  ["date", "cat", "label", "kind", "court", "mtype", "order", "pos", "partner", "opf", "opb", "opp", "opp", "score", "res", "note", ""]);
eq("열 인식: 예전 양식(구분)",
  cols(["날짜", "구분", "클럽/대회명", "모임 유형/대회 등급", "코트면", "경기형태", "당일 경기차수", "내 포지션", "파트너", "상대 포", "상대 백", "스코어", "승패", "메모"]),
  ["date", "cat", "label", "kind", "court", "mtype", "order", "pos", "partner", "opf", "opb", "score", "res", "note"]);
eq("열 인식: 점수 두 칸", cols(["일자", "상대1", "상대2", "내 점수", "상대 점수"]), ["date", "o1", "o2", "sa", "sb"]);
eq("열 인식: 새 공통 양식", cols(C.XHDR), ["date", "cat", "label", "kind", "court", "mtype", "order", "pos", "partner", "pg", "o1", "o1p", "o1g", "o2", "o2p", "o2g", "score", "res", "note", ""]);
eq("열 인식: 저장된 내 양식이 우선", C.detectCols(["비고"], { "비고": "extra" }), ["extra"]);
eq("제목 줄 찾기(위에 제목 행)", C.findHeader([["2026 내 기록"], [], ["날짜", "파트너", "상대", "스코어"], ["2026-09-01", "a", "b", "6-4"]]), 2);

// ---------- 값 인식
for (const [d, raw, want] of [["cat", "클럽", "club"], ["cat", "교류전", "friendly"], ["court", "앙투카", "clay"], ["court", "인조잔디", "turf"], ["mtype", "혼합복식", "mixed"], ["mtype", "여복", "womens"], ["pos", "듀스", "fore"], ["pos", "백", "back"], ["res", "W", "w"], ["res", "패", "l"], ["court", "모름", undefined]])
  eq(`값 인식 ${d}:${raw}`, C.xvalDef(d, raw), want);

for (const [raw, want] of [["남", "m"], ["여자", "f"], ["M", "m"], ["female", "f"], ["모름", undefined]]) eq(`성별 인식 ${raw}`, C.xvalDef("g", raw), want);

// ---------- 월례대회 자동 규칙
const club = { monthly: { on: true, week: 5, dow: 6 } }; // 매월 마지막 주 토요일
eq("월례: 2026-10-31(마지막 토)", C.isMonthly(club, "20261031"), true);
eq("월례: 2026-10-24(넷째 토)", C.isMonthly(club, "20261024"), false);
eq("월례: 2026-10-30(금)", C.isMonthly(club, "20261030"), false);
const club2 = { monthly: { on: true, week: 2, dow: 0 }, mdays: { "20261011": false, "20261018": true } }; // 둘째 일요일
eq("월례: 둘째 일요일 규칙", C.isMonthly({ monthly: club2.monthly }, "20261011"), true);
eq("월례: 날짜 지정 해제가 규칙보다 우선", C.isMonthly(club2, "20261011"), false);
eq("월례: 날짜 지정이 규칙보다 우선", C.isMonthly(club2, "20261018"), true);
eq("월례: 사용 안 함", C.isMonthly({ monthly: { on: false, week: 2, dow: 0 } }, "20261011"), false);
eq("월례: 수동만(규칙 없음)", C.isMonthly({ monthly: { on: true, week: 0, dow: 0 } }, "20261011"), false);

// ---------- 정기 일정 방식
const D = (y, m, d) => new Date(y, m - 1, d);
eq("매주: 토요일", C.isRegDay({ regularDays: [6] }, D(2026, 10, 10)), true);
eq("매주: 일요일 아님", C.isRegDay({ regularDays: [6] }, D(2026, 10, 11)), false);
eq("매월: 둘째 토요일", C.isRegDay({ schedType: "monthly", schedM: { week: 2, dow: 6 } }, D(2026, 10, 10)), true);
eq("매월: 첫째 토요일은 아님", C.isRegDay({ schedType: "monthly", schedM: { week: 2, dow: 6 } }, D(2026, 10, 3)), false);
eq("매월: 마지막 일요일", C.isRegDay({ schedType: "monthly", schedM: { week: 5, dow: 0 } }, D(2026, 10, 25)), true);
eq("비정기: 요일이 있어도 정기 날 아님", C.isRegDay({ schedType: "none", regularDays: [6] }, D(2026, 10, 10)), false);
eq("일정 설정됨: 비정기", C.schedSet({ schedType: "none" }), true);
eq("일정 설정 안 됨: 매주 요일 없음", C.schedSet({ regularDays: [] }), false);
eq("일정 설정 안 됨: 매월 주 미지정", C.schedSet({ schedType: "monthly", schedM: { week: 0 } }), false);

// ---------- 앞으로의 모임 목록
const NOW = new Date(2026, 9, 5); // 2026-10-05 (월)
const wk = { regularDays: [6] }; // 매주 토
let M = C.meetingsAhead(wk, NOW, 21);
eq("일정: 매주 토요일 3번", M.map(m => m.dk), ["20261010", "20261017", "20261024"]);
M = C.meetingsAhead({ ...wk, sched: { "20261014": { title: "추가", start: "19:00" }, "20261017": { off: true } } }, NOW, 21);
eq("일정: 추가 모임 들어가고 취소한 날 빠짐", M.map(m => m.dk + ":" + m.kind), ["20261010:reg", "20261014:extra", "20261024:reg"]);
M = C.meetingsAhead({ ...wk, sched: { "20261010": { start: "10:00", memo: "시간 변경" } } }, NOW, 7);
eq("일정: 정기 날 시간만 변경", [M[0].kind, M[0].start, M[0].memo], ["reg", "10:00", "시간 변경"]);
M = C.meetingsAhead({ ...wk, mtgOverride: { from: "20261010", date: "20261011", start: "09:00" } }, NOW, 9);
eq("일정: 예전 방식 날짜 이동 호환", M.map(m => m.dk + ":" + (m.start || "")), ["20261011:09:00"]);
M = C.meetingsAhead({ ...wk, mtgOverride: { from: "20261010", off: true } }, NOW, 9);
eq("일정: 예전 방식 취소 호환", M.length, 0);
M = C.meetingsAhead({ ...wk, monthly: { on: true, week: 5, dow: 6 } }, NOW, 30);
eq("일정: 월례대회 표시(마지막 토)", M.filter(m => m.monthly).map(m => m.dk), ["20261031"]);
M = C.meetingsAhead({ schedType: "none", sched: { "20261020": { title: "번개" }, "20260930": { title: "지난" } } }, NOW, 30);
eq("일정: 비정기는 추가 모임만, 지난 일정 제외", M.map(m => m.dk), ["20261020"]);
eq("모임 종류: 정기", C.kindOf(wk, "20261010"), "정기모임");
eq("모임 종류: 월례대회", C.kindOf({ ...wk, mdays: { "20261010": true } }, "20261010"), "월례대회");
eq("모임 종류: 추가 모임은 비움", C.kindOf({ ...wk, sched: { "20261014": {} } }, "20261014"), "");

// ---------- 개인·클럽 기록 겹침
const pl = n => ({ n });
const own = (id, d, pa, op, a, b) => ({ src: "own", docId: id, date: d, t1: [pl("나"), pl(pa)], t2: op.map(pl), scoreA: a, scoreB: b });
const clb = (id, d, pa, op, a, b) => ({ src: "club", clubGameId: id, date: d, t1: [pl("나"), pl(pa)], t2: op.map(pl), scoreA: a, scoreB: b });
const PG = [own("o1", "20260920", "손윤지", ["김민지", "박서연"], 6, 4), clb("g1", "20260920", "손 윤지", ["박서연", "김민지"], 6, 4),
  own("o2", "20260920", "이수진", ["최지현", "정하늘"], 6, 3), clb("g2", "20260920", "이수진", ["최지현", "정하늘"], 4, 6),
  own("o3", "20260921", "A", ["B", "C"], 6, 1), clb("g3", "20260921", "A", ["B", "X"], 6, 1), own("o4", "20260922", "A", ["B", "C"], 6, 0)];
let DP = C.findDups(PG);
eq("겹침: 확정(띄어쓰기·순서 무시)", DP.sure.map(([o, c]) => o.docId + "=" + c.clubGameId), ["o1=g1"]);
eq("겹침: 점수 다름·한 명 다름은 비슷한 경기", DP.maybe.map(([o, c]) => o.docId + "=" + c.clubGameId), ["o2=g2", "o3=g3"]);
eq("겹침: 둘 다 두기로 고른 건 제외", C.findDups(PG, ["o1"]).sure.length, 0);

// ---------- 오늘 모임 단계
const T0 = (h, mi) => new Date(2026, 9, 5, h, mi);
eq("단계: 시작 전", C.mPhase({ today: true }, "13:00", "16:00", T0(12, 59)), "before");
eq("단계: 진행 중", C.mPhase({ today: true }, "13:00", "16:00", T0(13, 0)), "during");
eq("단계: 종료 후", C.mPhase({ today: true }, "13:00", "16:00", T0(16, 0)), "after");
eq("단계: 일찍 종료", C.mPhase({ today: true, ended: true }, "13:00", "16:00", T0(14, 0)), "after");
eq("단계: 오늘이 아니면 모임 전", C.mPhase({ today: false }, "13:00", "16:00", T0(20, 0)), "before");

// ---------- 명단 붙여넣기
eq("명단: 쉼표·줄바꿈", C.parseNames("김민지, 이수진\n박서연"), ["김민지", "이수진", "박서연"]);
eq("명단: 띄어쓰기로 나열", C.parseNames("김민지 이수진 박서연"), ["김민지", "이수진", "박서연"]);
eq("명단: 번호·괄호·이모지 정리", C.parseNames("1. 김민지(방장)\n2) 이수진 🎾\n[총무] 박서연"), ["김민지", "이수진", "박서연"]);
eq("명단: 중복 제거", C.parseNames("김민지\n김민지, 이수진"), ["김민지", "이수진"]);
eq("명단: 영문 이름 유지", C.parseNames("John Kim, 최지현"), ["John Kim", "최지현"]);

// ---------- 성별로 경기형태
const Pg = g => ({ k: Math.random() + "", g });
eq("형태: 남복", C.mtOfP([Pg("m"), Pg("m")], [Pg("m"), Pg("m")]), "mens");
eq("형태: 여복", C.mtOfP([Pg("f"), Pg("f")], [Pg("f"), Pg("f")]), "womens");
eq("형태: 혼복", C.mtOfP([Pg("m"), Pg("f")], [Pg("f"), Pg("m")]), "mixed");
eq("형태: 남남 vs 여여는 복식", C.mtOfP([Pg("m"), Pg("m")], [Pg("f"), Pg("f")]), "doubles");
eq("형태: 3:1은 복식", C.mtOfP([Pg("m"), Pg("m")], [Pg("m"), Pg("f")]), "doubles");
eq("형태: 성별 모름 포함은 복식", C.mtOfP([Pg("m"), Pg("")], [Pg("f"), Pg("m")]), "doubles");
eq("형태: 단식", C.mtOfP([Pg("m")], [Pg("f")]), "single");

// ---------- 순번제 팀 나누기
const P = (k, p) => ({ k, n: k, p });
const tl0 = () => 1;
let t = C.pickTeams([P("a", "fore"), P("b", "fore"), P("c", "back"), P("d", "back")], {}, {}, tl0, false);
eq("팀: 포+백으로 짝", t.map(x => x.map(p => p.p).sort().join("+")), ["back+fore", "back+fore"]);
t = C.pickTeams([P("a", "either"), P("b", "either"), P("c", "either"), P("d", "either")], { "a|b": 3 }, {}, tl0, false);
eq("팀: 자주 짝한 a·b는 떨어뜨림", t.some(x => x.map(p => p.k).sort().join() === "a,b"), false);
const tier = { a: 0, b: 0, c: 3, d: 3 };
t = C.pickTeams([P("a", "either"), P("b", "either"), P("c", "either"), P("d", "either")], {}, {}, p => tier[p.k], true);
eq("팀: Tier 균형(강+약)", t.map(x => x.map(p => tier[p.k]).reduce((s, v) => s + v, 0)), [3, 3]);

// ---------- 동기화 병합(바뀐 것만 받기)
let c = { docs: {}, last: 0 };
C.mergeDocs(c, [{ _id: "g1", updatedAt: 100 }, { _id: "g2", updatedAt: 200 }], true);
eq("병합: 전체 받기", Object.keys(c.docs).sort(), ["g1", "g2"]);
eq("병합: 마지막 수정 시각", c.last, 200);
C.mergeDocs(c, [{ _id: "g1", updatedAt: 300, deleted: true }, { _id: "g3", updatedAt: 250 }], false);
eq("병합: 삭제 표시는 빠지고 새 것은 추가", Object.keys(c.docs).sort(), ["g2", "g3"]);
C.mergeDocs(c, [{ _id: "g4", updatedAt: 400, mine: false }], false, x => x.mine !== false);
eq("병합: 내 경기 아닌 것은 보관 안 함", "g4" in c.docs, false);
eq("병합: 서버 시각 변환", C.clean({ _id: "x", updatedAt: { toMillis: () => 123 } }).updatedAt, 123);

// ---------- 대회 성적
const pres = g => (g.a > g.b ? "w" : g.a < g.b ? "l" : "d");
const G = (date, label, stage, a, b) => ({ cat: "tour", label, date, stage, a, b });
const R = C.tourResults([
  G("20260910", "A오픈", "예선 1", 6, 3), G("20260911", "A오픈", "16강", 6, 2), G("20260911", "A오픈", "8강", 3, 6),
  G("20260920", "B대회", "4강", 6, 4), G("20260920", "B대회", "결승", 6, 5),
  G("20260925", "C컵", "4강", 6, 1),
  G("20261001", "A오픈", "예선 1", 2, 6),
], pres);
eq("대회 성적", R.map(r => `${r.label}:${r.result}`), ["A오픈:예선", "C컵:결승 진출", "B대회:우승", "A오픈:8강"]);

// ---------- 해시 분산(30일 갱신 날짜가 몰리지 않는지)
const days = new Set(Array.from({ length: 40 }, (_, i) => 15 + C.hsh(`uid${i}_cg_club${i * 7}`) % 30));
eq("갱신 날짜 분산(40개 키 → 10일 이상에 흩어짐)", days.size >= 10, true);

console.log(`\n${fail ? "❌" : "✅"} 통과 ${pass} · 실패 ${fail}`);
if (fail) process.exit(1);
