// REST 읽기 변환 자동 테스트 — 실행: node tests/rest.test.mjs (저장소 루트에서)
import * as R from "../rest-core.js";
import { makeReader } from "../rest-core.js";

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) pass++; else { fail++; console.log(`✗ ${name}\n   기대: ${w}\n   실제: ${g}`); }
};
const mkTs = ms => ({ toMillis: () => ms, isTs: 1 });

// ---------- 값 만들기
eq("문자열", R.toFsValue("가"), { stringValue: "가" });
eq("정수는 문자열 숫자", R.toFsValue(42), { integerValue: "42" });
eq("소수", R.toFsValue(1.5), { doubleValue: 1.5 });
eq("불·null", [R.toFsValue(true), R.toFsValue(null)], [{ booleanValue: true }, { nullValue: null }]);
eq("시간(밀리초 객체)", R.toFsValue(mkTs(Date.UTC(2026, 9, 29, 12, 0, 0))), { timestampValue: "2026-10-29T12:00:00.000Z" });
eq("배열·객체", R.toFsValue({ a: [1, "x"], b: undefined }), { mapValue: { fields: { a: { arrayValue: { values: [{ integerValue: "1" }, { stringValue: "x" }] } } } } });

// ---------- 조건 → 질의
eq("조건 하나", R.fsQuery("clubMembers", [["uid", "==", "u1"]]),
  { structuredQuery: { from: [{ collectionId: "clubMembers" }], where: { fieldFilter: { field: { fieldPath: "uid" }, op: "EQUAL", value: { stringValue: "u1" } } } } });
const q2 = R.fsQuery("games", [["clubId", "==", "c1"], ["pk", "array-contains", "u1"], ["updatedAt", ">", mkTs(1000)]]);
eq("조건 여러 개는 AND", [q2.structuredQuery.where.compositeFilter.op, q2.structuredQuery.where.compositeFilter.filters.map(f => f.fieldFilter.op)], ["AND", ["EQUAL", "ARRAY_CONTAINS", "GREATER_THAN"]]);
eq("시간 조건 값", q2.structuredQuery.where.compositeFilter.filters[2].fieldFilter.value, { timestampValue: "1970-01-01T00:00:01.000Z" });
eq("조건 없음", R.fsQuery("x", []).structuredQuery.where, undefined);
let thrown = false; try { R.fsQuery("x", [["a", "~", 1]]) } catch (e) { thrown = true }
eq("모르는 연산은 오류", thrown, true);

// ---------- 값 풀기
const fsDoc = {
  name: "projects/p/databases/(default)/documents/clubs/ABC123",
  fields: {
    name: { stringValue: "제이드" }, n: { integerValue: "12" }, r: { doubleValue: 0.5 }, ok: { booleanValue: false }, nul: { nullValue: null },
    at: { timestampValue: "2026-10-29T12:34:56.789123456Z" },
    tiers: { arrayValue: { values: [{ stringValue: "A" }, { integerValue: "2" }] } },
    sched: { mapValue: { fields: { "20261101": { mapValue: { fields: { off: { booleanValue: true } } } } } } },
    empty: { arrayValue: {} }, emptyMap: { mapValue: {} }
  }
};
const s = R.docSnap(fsDoc, mkTs);
eq("문서 id·exists", [s.id, s.exists()], ["ABC123", true]);
const d = s.data();
eq("풀기: 기본형", [d.name, d.n, d.r, d.ok, d.nul], ["제이드", 12, 0.5, false, null]);
eq("풀기: 시간(나노초 잘라 밀리초)", d.at.toMillis(), Date.UTC(2026, 9, 29, 12, 34, 56, 789));
eq("풀기: 배열·중첩 맵", [d.tiers, d.sched["20261101"].off], [["A", 2], true]);
eq("풀기: 빈 배열·빈 맵", [d.empty, d.emptyMap], [[], {}]);
d.name = "바꿈";
eq("data()는 부를 때마다 새 객체", s.data().name, "제이드");
eq("소수 문자열(NaN 등)", R.fromFsValue({ doubleValue: "Infinity" }, mkTs), Infinity);

// ---------- 응답 풀기
const rq = R.parseRunQuery([{ document: fsDoc, readTime: "t" }, { document: { name: "x/documents/clubs/Z", fields: {} } }], mkTs);
eq("runQuery: 문서 2개", [rq.size, rq.empty, rq.docs.map(x => x.id)], [2, false, ["ABC123", "Z"]]);
eq("runQuery: 결과 없음(readTime만)", R.parseRunQuery([{ readTime: "t" }], mkTs).empty, true);
let e1 = null; try { R.parseRunQuery([{ error: { code: 403, status: "PERMISSION_DENIED", message: "no" } }], mkTs) } catch (e) { e1 = e }
eq("runQuery: 안에 오류 있으면 던짐", [e1 && e1.code, e1 && e1.message], ["permission-denied", "no"]);
let e2 = null; try { R.parseRunQuery({ error: { status: "UNAUTHENTICATED", message: "x" } }, mkTs) } catch (e) { e2 = e }
eq("runQuery: 객체 오류", e2 && e2.code, "unauthenticated");
const bg = R.parseBatchGet([{ found: { name: "p/documents/clubs/B", fields: { n: { integerValue: "2" } } } }, { missing: "p/documents/clubs/C" }, { found: { name: "p/documents/clubs/A", fields: {} } }], ["A", "B", "C"], mkTs);
eq("batchGet: 요청 순서·없는 문서", [bg.map(x => x.id), bg.map(x => x.exists())], [["A", "B", "C"], [true, true, false]]);
eq("없는 문서 data()", bg[2].data(), undefined);
const fe = R.fsError(403, { error: { status: "FAILED_PRECONDITION", message: "The query requires an index. https://console.firebase.google.com/x" } });
eq("오류 이름·주소 보존", [fe.code, /console\.firebase\.google\.com/.test(fe.message), fe.status], ["failed-precondition", true, 403]);

// ---------- 저장본용 포장
const raw = { a: mkTs(5), list: [{ t: mkTs(7), x: 1 }], o: { n: null }, s: "가" };
const packed = R.packTs(raw);
eq("포장", packed, { a: { __ts: 5 }, list: [{ t: { __ts: 7 }, x: 1 }], o: { n: null }, s: "가" });
const back = R.unpackTs(JSON.parse(JSON.stringify(packed)), mkTs);
eq("되돌리기: 시간 객체 복원", [back.a.isTs, back.a.toMillis(), back.list[0].t.toMillis(), back.list[0].x], [1, 5, 7, 1]);
eq("되돌리기: 일반 값 그대로", [back.o, back.s], [{ n: null }, "가"]);
eq("__ts 말고 다른 키가 있으면 시간으로 안 봄", R.unpackTs({ __ts: 1, k: 2 }, mkTs), { __ts: 1, k: 2 });


// ---------- 읽기 도우미(REST 먼저, 늦거나 실패하면 SDK도)
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fsDoc1 = { name: "p/documents/clubs/K", fields: { n: { integerValue: "1" } } };
const resp = (ok, status, j) => ({ ok, status, text: async () => JSON.stringify(j) });
const mk = (over = {}) => {
  const recs = [], fails = []; let sdkCalls = 0;
  const o = { pid: "p", enabled: true, mkTs, getToken: async () => "tok", hedgeMs: 40, busy: () => false,
    fetch: async () => resp(true, 200, fsDoc1),
    sdkGet: async (c, id) => { sdkCalls++; return { id, exists: () => true, data: () => ({ via: "sdk" }) } },
    sdkQuery: async () => { sdkCalls++; return R.docsResult([]) },
    rec: (l, ms, v) => recs.push([l, v]), onFail: (l, e) => fails.push(l), ...over };
  return { rd: makeReader(o), recs, fails, calls: () => sdkCalls };
};
{ const t = mk(); const d = await t.rd.fd("a", "clubs", "K");
  eq("빠른 REST: REST 결과 사용·SDK 안 부름", [d.data().n, t.recs[0][1], t.calls()], [1, "rest", 0]); }
{ const t = mk({ fetch: async () => { await sleep(300); return resp(true, 200, fsDoc1) } }); const d = await t.rd.fd("a", "clubs", "K");
  eq("REST가 늦으면 40ms 뒤 SDK 결과 사용", [d.data().via, t.recs[0][1], t.calls()], ["sdk", "sdk", 1]); }
{ const t = mk({ fetch: async () => resp(false, 403, { error: { status: "PERMISSION_DENIED", message: "x" } }) }); const d = await t.rd.fd("a", "clubs", "K");
  eq("REST 실패하면 바로 SDK로", [d.data().via, t.fails.length, t.calls()], ["sdk", 1, 1]); }
{ const e0 = new Error("규칙 거절"); e0.code = "permission-denied";
  const t = mk({ fetch: async () => { throw new TypeError("net") }, sdkGet: async () => { throw e0 } }); let e = null; try { await t.rd.fd("a", "clubs", "K") } catch (x) { e = x }
  eq("둘 다 실패하면 SDK 오류를 그대로 던짐", [e === e0, e && e.code], [true, "permission-denied"]); }
{ const t = mk({ busy: () => true }); const d = await t.rd.fd("a", "clubs", "K");
  eq("쓰기 진행 중이면 SDK만", [d.data().via, t.recs[0][1]], ["sdk", "sdk"]); }
{ const t = mk({ enabled: false }); const d = await t.rd.fd("a", "clubs", "K");
  eq("꺼져 있으면 SDK만", [d.data().via], ["sdk"]); }
{ const t = mk({ fetch: async () => { throw new TypeError("net") } }); for (let i = 0; i < 2; i++) await t.rd.fd("a", "clubs", "K");
  eq("네트워크 오류 2번이면 REST 끔(bad≥3)", t.rd.bad >= 3, true); const before = t.fails.length; await t.rd.fd("a", "clubs", "K");
  eq("꺼진 뒤엔 REST를 더 안 부름", t.fails.length, before); }
{ const t = mk({ fetch: async () => resp(false, 404, { error: { status: "NOT_FOUND", message: "nf" } }) }); const d = await t.rd.fd("a", "clubs", "K");
  eq("없는 문서(404)는 오류 아님·exists false", [d.exists(), t.fails.length], [false, 0]); }
{ const t = mk({ fetch: async () => resp(true, 200, [{ document: fsDoc1 }]) }); const r = await t.rd.fq("q", "clubs", [["a", "==", 1]]);
  eq("fq: 문서 목록", [r.size, r.docs[0].id], [1, "K"]); }
{ const t = mk({ fetch: async () => resp(true, 200, [{ found: fsDoc1 }, { missing: "x/documents/clubs/M" }]) }); const r = await t.rd.fdm("b", "clubs", ["K", "M"]);
  eq("fdm: 한 번에 여러 문서·없는 것 표시", [r.map(x => x.exists()), (await t.rd.fdm("b", "clubs", [])).length], [[true, false], 0]); }
{ let url = "", body = null; const t = mk({ fetch: async (u, init) => { url = u; body = init.body; return resp(true, 200, [{ readTime: "t" }]) } }); await t.rd.fq("q", "games", [["clubId", "==", "c1"]]);
  eq("요청 주소·본문", [url, JSON.parse(body).structuredQuery.from[0].collectionId], ["https://firestore.googleapis.com/v1/projects/p/databases/(default)/documents:runQuery", "games"]); }

console.log(`\n${fail ? "❌" : "✅"} 통과 ${pass} · 실패 ${fail}`);
if (fail) process.exit(1);
