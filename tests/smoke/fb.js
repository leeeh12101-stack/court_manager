// 가짜 Firebase(메모리 DB) — 화면 점검용
const DB = (globalThis.__DB = globalThis.__DB || {});
const now = () => Date.now();
export const initializeApp = () => ({});
// auth
export const getAuth = () => ({});
export class GoogleAuthProvider {}
export const signInWithPopup = async () => {}, signOut = async () => {}, deleteUser = async () => {}, reauthenticateWithPopup = async () => {};
export const onAuthStateChanged = (a, cb) => setTimeout(() => cb(globalThis.__USER), 10);
// firestore
export const getFirestore = () => ({});
let auto = 0;
export const collection = (db, c) => ({ coll: c });
export const doc = (a, c, id) => a && a.coll ? { coll: a.coll, id: "auto" + (++auto) } : { coll: c, id };
export const where = (f, op, v) => ({ f, op, v });
export const limit = n => ({ limit: n });
export const query = (c, ...w) => ({ coll: c.coll, w: w.filter(x => x.f) });
const col = c => (DB[c] = DB[c] || {});
const snap = (c, id) => ({ id, exists: () => id in col(c), data: () => col(c)[id] && JSON.parse(JSON.stringify(col(c)[id])), ref: { coll: c, id } });
const ok = (d, w) => { const x = d[w.f]; const v = typeof x === "object" && x && x.ms ? x.ms : x;
  return w.op === "==" ? v === w.v : w.op === "array-contains" ? Array.isArray(x) && x.includes(w.v) : w.op === ">" ? (typeof v === "number" ? v : 0) > (w.v && w.v.toMillis ? w.v.toMillis() : w.v) : w.op === ">=" ? v >= w.v : true; };
export const getDoc = async r => { await 0; return snap(r.coll, r.id); };
export const getDocs = async q => { await 0; const c = col(q.coll); const docs = Object.keys(c).filter(id => q.w.every(w => ok(c[id], w))).map(id => snap(q.coll, id)); return { docs, size: docs.length, empty: !docs.length, forEach: f => docs.forEach(f) }; };
const fix = o => { const r = {}; for (const k in o) { const v = o[k]; r[k] = v && v.__ts ? { ms: now(), toMillis: () => now() } : v; } return r; };
const put = (r, data, merge) => { const c = col(r.coll); c[r.id] = merge ? { ...(c[r.id] || {}), ...fix(data) } : fix(data); };
export const setDoc = async (r, d, o) => put(r, d, o && o.merge);
export const updateDoc = async (r, d) => { if (!(r.id in col(r.coll))) throw new Error("no doc"); put(r, d, true); };
export const deleteDoc = async r => { delete col(r.coll)[r.id]; };
export const writeBatch = () => { const ops = []; return { set: (r, d, o) => ops.push(() => put(r, d, o && o.merge)), update: (r, d) => ops.push(() => put(r, d, true)), delete: r => ops.push(() => delete col(r.coll)[r.id]), commit: async () => ops.forEach(f => f()) }; };
export const serverTimestamp = () => ({ __ts: 1 });
export const onSnapshot = (r, cb) => { setTimeout(() => cb(snap(r.coll, r.id)), 5); return () => {}; };
export const runTransaction = async (db, fn) => fn({ get: getDoc, set: (r, d) => put(r, d), update: (r, d) => put(r, d, true) });
export const Timestamp = { fromMillis: ms => ({ toMillis: () => ms }), now: () => ({ toMillis: () => now() }) };
// ai / app check
export const getAI = () => ({}), getGenerativeModel = () => ({}), GoogleAIBackend = class {};
export const initializeAppCheck = () => ({}), getToken = async () => ({ token: "x" }), onTokenChanged = () => () => {};
export class ReCaptchaEnterpriseProvider {}
