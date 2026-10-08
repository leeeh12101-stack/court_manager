// 가짜 데이터: 오늘 진행 중인 모임 + 대진 + 일부 결과
const d = new Date(), ymd = x => x.getFullYear() + String(x.getMonth() + 1).padStart(2, "0") + String(x.getDate()).padStart(2, "0"), td = ymd(d);
const ts = { ms: Date.now(), toMillis: () => Date.now() };
const P = (k, n, p) => ({ k, n, p: p || "either" });
const mem = [["u1", "관리자", "admin"], ["u2", "김민지", "member"], ["u3", "이수진", "member"], ["u4", "박서연", "member"]];
globalThis.__USER = { uid: "u1", displayName: "관리자", email: "a@b.c", photoURL: "" };
globalThis.__DB = {
  users: { u1: { name: "관리자", newsSeen: 99, sync: {}, syncAsked: { c1: 1 } } },
  clubs: { c1: { name: "목요 테니스", status: "open", visibility: "private", joinMethod: "invite", primaryAdminId: "u1", createdBy: "u1", schedType: "weekly", regularDays: [d.getDay()], regularStartTime: "00:00", regularEndTime: "23:59", regularCourtCount: 2, roundInterval: 40, mode: "round", cnum: ["5", "6"], genderMode: "f" } },
  clubMembers: Object.fromEntries([...mem.map(([u, n, r]) => ["c1_" + u, { clubId: "c1", uid: u, displayName: n, role: r, status: "active", defaultPosition: "either" }]),
    ["c1_oa1", { clubId: "c1", uid: "", oid: "oa1", offline: true, displayName: "최지현", role: "member", status: "active" }],
    ["c1_oa2", { clubId: "c1", uid: "", oid: "oa2", offline: true, displayName: "정하늘", role: "member", status: "active" }]]),
  sessionParticipants: Object.fromEntries(["u1", "u2", "u3", "u4"].map(u => [`c1_${td}_${u}`, { clubId: "c1", date: td, uid: u, status: "in", start: "00:00", end: "23:59", position: "either", updatedAt: ts }])
    .concat([[`c1_${td}_oa1`, { clubId: "c1", date: td, uid: "", mk: "o:oa1", name: "최지현", status: "in", start: "00:00", end: "23:59", updatedAt: ts }],
      [`c1_${td}_g1`, { clubId: "c1", date: td, uid: "", guest: true, name: "게스트A", status: "in", start: "00:00", end: "23:59", updatedAt: ts }]])),
  sessions: { [`c1_${td}`]: { clubId: "c1", date: td, rounds: [
    { n: 1, time: "00:00", games: [{ court: 1, t1: [P("u1", "관리자"), P("u2", "김민지")], t2: [P("u3", "이수진"), P("u4", "박서연")] }] },
    { n: 2, time: "08:00", games: [{ court: 1, t1: [P("u1", "관리자"), P("o:oa1", "최지현")], t2: [P("u3", "이수진"), P("g:게스트A", "게스트A")] }] },
    { n: 3, time: "23:00", games: [{ court: 2, t1: [P("u2", "김민지"), P("u4", "박서연")], t2: [P("u3", "이수진"), P("o:oa1", "최지현")] }] }] } },
  games: { [`c1_${td}_r1_c1`]: { id: `c1_${td}_r1_c1`, clubId: "c1", date: td, round: 1, court: 1, t1: [P("u1", "관리자"), P("u2", "김민지")], t2: [P("u3", "이수진"), P("u4", "박서연")], pk: ["u1", "u2", "u3", "u4"], scoreA: 6, scoreB: 3, source: "draw", updatedAt: ts },
    "old1": { id: "old1", clubId: "c1", date: "20261001", round: 0, court: 0, t1: [P("u1", "관리자"), P("g:게스트A", "게스트A")], t2: [P("u3", "이수진"), P("o:oa1", "최지현")], pk: ["u1", "g:게스트A", "u3", "o:oa1"], scoreA: 6, scoreB: 4, source: "manual", updatedAt: ts } },
  personalGames: {}, personalPeople: {}, clubApplications: {}, queues: {}, clubPrivate: { c1: { inviteCode: "ABCD1234" } }, aiUsage: {}, feedback: {}, guestShares: {}
};
localStorage.setItem("cm_mode", "club");
