// Firestore REST 읽기용 순수 변환(Firebase·화면 무관) → 자동 테스트 대상(tests/rest.test.mjs)
// app.js가 쓰는 곳: 한 번 읽기(fq/fd/fdm)를 SDK 대신 일반 웹 요청으로 보낼 때 요청 만들기·응답 풀기, 저장본(IDB)용 시간값 포장.

export const FS_OPS = { "==": "EQUAL", "!=": "NOT_EQUAL", "<": "LESS_THAN", "<=": "LESS_THAN_OR_EQUAL", ">": "GREATER_THAN", ">=": "GREATER_THAN_OR_EQUAL", "array-contains": "ARRAY_CONTAINS", "in": "IN", "array-contains-any": "ARRAY_CONTAINS_ANY", "not-in": "NOT_IN" };
const isTs = v => !!v && typeof v === "object" && typeof v.toMillis === "function";

// JS 값 → Firestore REST 값
export function toFsValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (isTs(v)) return { timestampValue: new Date(v.toMillis()).toISOString() };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: Number.isFinite(v) ? v : String(v) };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFsValue) } };
  return { mapValue: { fields: toFsFields(v) } };
}
export function toFsFields(o) { const f = {}; for (const k in o) if (o[k] !== undefined) f[k] = toFsValue(o[k]); return f; }

// 조건 목록 [[필드, 연산, 값], …] → runQuery 본문
export function fsQuery(coll, filters, opts = {}) {
  const fl = (filters || []).map(([f, op, v]) => {
    if (!FS_OPS[op]) throw new Error("지원하지 않는 조건: " + op);
    return { fieldFilter: { field: { fieldPath: f }, op: FS_OPS[op], value: toFsValue(v) } };
  });
  const sq = { from: [{ collectionId: coll }] };
  if (fl.length === 1) sq.where = fl[0]; else if (fl.length > 1) sq.where = { compositeFilter: { op: "AND", filters: fl } };
  if (opts.limit) sq.limit = opts.limit;
  return { structuredQuery: sq };
}

// Firestore REST 값 → JS 값. 시간값은 mkTs(밀리초)로 만든 객체(앱에서는 Timestamp)
export function fromFsValue(v, mkTs) {
  if (!v || typeof v !== "object") return null;
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return Number(v.doubleValue);
  if ("booleanValue" in v) return !!v.booleanValue;
  if ("nullValue" in v) return null;
  if ("timestampValue" in v) return mkTs(Date.parse(String(v.timestampValue).replace(/(\.\d{3})\d*/, "$1")));
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(x => fromFsValue(x, mkTs));
  if ("mapValue" in v) return fromFsFields(v.mapValue.fields || {}, mkTs);
  if ("geoPointValue" in v) return { latitude: v.geoPointValue.latitude || 0, longitude: v.geoPointValue.longitude || 0 };
  if ("referenceValue" in v) return v.referenceValue;
  if ("bytesValue" in v) return v.bytesValue;
  return null;
}
export function fromFsFields(f, mkTs) { const o = {}; for (const k in f) o[k] = fromFsValue(f[k], mkTs); return o; }

// 문서 하나를 SDK의 문서 결과처럼 보이게(id, exists(), data()). data()는 부를 때마다 새로 만듦(받은 쪽이 고쳐 써도 안전)
export const docSnap = (fsDoc, mkTs) => { const f = fsDoc.fields || {}; return { id: String(fsDoc.name).split("/").pop(), exists: () => true, data: () => fromFsFields(f, mkTs) }; };
export const missSnap = id => ({ id, exists: () => false, data: () => undefined });
export const docsResult = snaps => ({ docs: snaps, size: snaps.length, empty: !snaps.length, forEach: f => snaps.forEach(f) });

// 오류 응답 → Error(code는 SDK와 비슷하게 permission-denied 꼴)
export function fsError(status, j) {
  const er = (j && (Array.isArray(j) ? (j[0] && j[0].error) : j.error)) || {};
  const e = new Error(er.message || ("HTTP " + status)); e.status = status; e.code = String(er.status || "").toLowerCase().replace(/_/g, "-"); return e;
}
// runQuery 응답(목록) → 문서 결과
export function parseRunQuery(j, mkTs) {
  if (!Array.isArray(j)) throw fsError(200, j);
  const out = [];
  for (const it of j) { if (it && it.error) throw fsError(200, [it]); if (it && it.document) out.push(docSnap(it.document, mkTs)); }
  return docsResult(out);
}
// batchGet 응답 → ids 순서대로 문서(없으면 missSnap)
export function parseBatchGet(j, ids, mkTs) {
  if (!Array.isArray(j)) throw fsError(200, j);
  const m = {};
  for (const it of j) { if (it && it.error) throw fsError(200, [it]); if (it && it.found) { const s = docSnap(it.found, mkTs); m[s.id] = s; } }
  return ids.map(id => m[id] || missSnap(id));
}

// 저장본(IDB)용: 시간 객체 ↔ {__ts:밀리초} (IDB는 클래스 메서드를 잃어버리므로)
export function packTs(v) {
  if (isTs(v)) return { __ts: v.toMillis() };
  if (Array.isArray(v)) return v.map(packTs);
  if (v && typeof v === "object") { const o = {}; for (const k in v) o[k] = packTs(v[k]); return o; }
  return v;
}
export function unpackTs(v, mkTs) {
  if (Array.isArray(v)) return v.map(x => unpackTs(x, mkTs));
  if (v && typeof v === "object") {
    if (typeof v.__ts === "number" && Object.keys(v).length === 1) return mkTs(v.__ts);
    const o = {}; for (const k in v) o[k] = unpackTs(v[k], mkTs); return o;
  }
  return v;
}

// 읽기 도우미: 한 번 읽기를 일반 웹 요청(REST)으로 먼저 보내고, hedgeMs 안에 안 오거나 실패하면 SDK로도 시도해 먼저 오는 쪽을 씀.
// 둘 다 실패하면 SDK의 오류를 던짐(규칙 거절 등 원래 오류 그대로). 쓰기가 진행 중(busy)이면 SDK로만 읽고, REST가 연속 실패하면(bad≥3) 끔.
// o = { pid, enabled, fetch, getToken, mkTs, sdkQuery(coll,filters), sdkGet(coll,id), busy(), rec(label,ms,via), onFail(label,e), hedgeMs }
export function makeReader(o) {
  const base = `projects/${o.pid}/databases/(default)/documents`, FSB = `https://firestore.googleapis.com/v1/${base}`, hedgeMs = o.hedgeMs == null ? 3000 : o.hedgeMs;
  let bad = 0;
  async function call(path, body, method) {
    const tk = await o.getToken();
    const r = await o.fetch(FSB + path, { method: method || "POST", headers: body ? { Authorization: "Bearer " + tk, "Content-Type": "application/json" } : { Authorization: "Bearer " + tk }, body: body ? JSON.stringify(body) : undefined });
    const t = await r.text(); let j = null; try { j = JSON.parse(t) } catch (e) { }
    if (!r.ok) throw fsError(r.status, j);
    return j;
  }
  const rGet = async (coll, id) => { try { return docSnap(await call(`/${coll}/${encodeURIComponent(id)}`, null, "GET"), o.mkTs) } catch (e) { if (e && e.status === 404) return missSnap(id); throw e } };
  const rQuery = async (coll, fl) => parseRunQuery(await call(":runQuery", fsQuery(coll, fl)), o.mkTs);
  const rBatch = async (coll, ids) => parseBatchGet(await call(":batchGet", { documents: ids.map(id => `${base}/${coll}/${id}`) }), ids, o.mkTs);
  function hedge(label, rf, sf) {
    const t0 = Date.now(), rec = v => { if (o.rec) o.rec(label, Date.now() - t0, v) };
    if (!(o.enabled && !(o.busy && o.busy()) && bad < 3)) return sf().then(r => { rec("sdk"); return r });
    return new Promise((ok, no) => {
      let done = 0, rDead = 0, sOn = 0, sDead = 0, se = null, tm = 0;
      const fin = (v, r) => { if (done) return; done = 1; clearTimeout(tm); rec(v); ok(r) },
        fail = e => { if (done) return; done = 1; clearTimeout(tm); no(e) },
        sdk = () => { if (sOn) return; sOn = 1; clearTimeout(tm); sf().then(r => fin("sdk", r), e => { sDead = 1; se = e; if (rDead) fail(e) }) };
      tm = setTimeout(sdk, hedgeMs);
      rf().then(r => { bad = 0; fin("rest", r) }, e => { rDead = 1; bad += e instanceof TypeError ? 2 : 1; if (o.onFail) o.onFail(label, e); if (!sOn) sdk(); else if (sDead) fail(se) });
    });
  }
  return {
    fq: (label, coll, fl) => hedge(label, () => rQuery(coll, fl), () => o.sdkQuery(coll, fl)),
    fd: (label, coll, id) => hedge(label, () => rGet(coll, id), () => o.sdkGet(coll, id)),
    fdm: (label, coll, ids) => ids.length ? hedge(label, () => rBatch(coll, ids), () => Promise.all(ids.map(id => o.sdkGet(coll, id).catch(() => missSnap(id))))) : Promise.resolve([]),
    get bad() { return bad }
  };
}
