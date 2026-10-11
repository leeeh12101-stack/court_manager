// 포백 테스트 계산 — 화면·Firebase와 무관한 순수 계산(자동 테스트 대상: tests/ft.test.mjs)
import { TYPES, COMBOS, SEAT, CENTER, CAUTION, PROMISES, POSN, SHOT_NM, REASON } from "./ft-data.js";

// 답 배열 순서. 모든 값은 고른 보기 번호(0부터). 샷 문항(a~h)은 0 자신 있음·1 보통·2 부담
export const FT_KEYS = ["q2", "q3", "q4", "a", "b", "c", "d", "e", "f", "g", "h", "q6", "q7", "q8", "q9", "q10", "q11"];
const NOPT = { q2: 3, q3: 3, q4: 3, q6: 3, q7: 3, q8: 3, q9: 3, q10: 3, q11: 3 };
const PT = { q2: [-1, 1, 0], q3: [-2, 2, 0], q4: [2, -2, 0], q6: [2, -1, -2], q11: [2, -1, -2] }, SHOT = [1, 0, -1], STY = ["lead", "link", "safe"];
// 자리별 샷: out=바깥쪽, cen=센터 쪽. FB 포 후위 · BB 백 후위 · FN 포 전위 · BN 백 전위
export const SPOTS = {
  R: { FB: { out: "a", cen: "d" }, BB: { out: "b", cen: "c" }, FN: { out: "e", cen: "h" }, BN: { out: "f", cen: "g" } },
  L: { FB: { out: "b", cen: "c" }, BB: { out: "a", cen: "d" }, FN: { out: "f", cen: "g" }, BN: { out: "e", cen: "h" } }
};
export const isFore = k => "aceg".includes(k);
const fill = (t, m) => t.replace(/\{(\w+)\}/g, (_, k) => m[k] ?? ""); // 포핸드·포발리 문항

// 답 검증: h "R"|"L", a 길이 17, 각 값이 보기 범위 안
export function ftValid(h, a) {
  if (h !== "R" && h !== "L") return false;
  if (!Array.isArray(a) || a.length !== FT_KEYS.length) return false;
  return FT_KEYS.every((k, i) => Number.isInteger(a[i]) && a[i] >= 0 && a[i] < (NOPT[k] || 3));
}
const obj = a => Object.fromEntries(FT_KEYS.map((k, i) => [k, a[i]]));

export function ftScore(h, a) {
  const o = obj(a), v = k => SHOT[o[k]], sp = SPOTS[h], sum = s => v(sp[s].out) + v(sp[s].cen);
  const mind = PT.q2[o.q2] + PT.q3[o.q3] + PT.q4[o.q4], shotP = (sum("BB") - sum("FB")) + 0.5 * (sum("BN") - sum("FN")), P = mind + shotP;
  const pos = P < -2 ? "F" : P > 2 ? "B" : "X", back = Math.round(50 + 40 * P / 11);
  // 운영: 7~11번 표. 11번 '쭈뼛'(1)은 표 없음, 11번 '자리 지키기'(2)는 안정
  const votes = { lead: 0, link: 0, safe: 0 };
  ["q7", "q8", "q9", "q10"].forEach(k => votes[STY[o[k]]]++);
  if (o.q11 === 0) votes.lead++; else if (o.q11 === 2) votes.safe++;
  const mx = Math.max(votes.lead, votes.link, votes.safe), top = STY.filter(s => votes[s] === mx);
  const sty = top.includes("link") ? "link" : top.length === 1 ? top[0] : STY[o.q7];
  const C = PT.q6[o.q6] + PT.q11[o.q11] + (v("g") + v("h")) / 2, cov = C >= 2 ? "act" : C <= -2 ? "share" : "bal";
  const flags = { freeze: o.q6 === 1, hesitate: o.q11 === 1, mixed: votes.lead >= 2 && votes.safe >= 2 };
  const shots = Object.fromEntries("abcdefgh".split("").map(k => [k, v(k)]));
  const key = pos + "-" + sty;
  return { h, P, mind, shotP, pos, back, fore: 100 - back, votes, sty, C, cov, flags, shots, key, type: TYPES[key], sum: { FB: sum("FB"), BB: sum("BB"), FN: sum("FN"), BN: sum("BN") }, q4: o.q4 };
}

// 결과 화면용: 자신 있는 샷·더 연습하면 좋은 샷(리시브 → 전위 순)
export function ftShots(r) { const ks = "abcdefgh".split(""); return { good: ks.filter(k => r.shots[k] === 1).map(k => SHOT_NM[k]), weak: ks.filter(k => r.shots[k] === -1).map(k => SHOT_NM[k]) } }
// 추천 자리 이유 한 줄: 마음(2~4번)과 샷(5번)이 어느 쪽을 가리키는지
export function ftReason(r) {
  const sg = x => x > 0 ? "B" : x < 0 ? "F" : "", m = sg(r.mind), t = sg(r.shotP), f = s => fill(s, { S: POSN[r.pos], M: POSN[m], T: POSN[t] });
  if (r.pos === "X") return f(m && t && m !== t ? REASON.flexMix : REASON.flex);
  if (m === r.pos && t === r.pos) return f(REASON.both);
  if (t === r.pos) return f(m ? REASON.shotWin : REASON.shotOnly);
  return f(t ? REASON.mindWin : REASON.mindOnly);
}

// 잘 맞는 파트너 유형: 자리는 반대(유연은 유연), 운영은 다른 것 2개
export function ftPartners(r) {
  const op = { F: "B", B: "F", X: "X" }[r.pos], alt = { lead: ["link", "safe"], link: ["lead", "safe"], safe: ["lead", "link"] }[r.sty];
  return alt.map(s => ({ key: op + "-" + s, ...TYPES[op + "-" + s] }));
}


// 궁합: A·B = {n,h,a}. 추천 자리·센터·주의 장면·약속 후보까지 계산
export function ftMatch(A, B) {
  const ra = ftScore(A.h, A.a), rb = ftScore(B.h, B.a), na = A.n || "A", nb = B.n || "B";
  const combo = COMBOS[[ra.sty, rb.sty].sort((x, y) => STY.indexOf(x) - STY.indexOf(y)).join("+")];
  // 추천 자리: fore=포 자리 사람(0=A,1=B)
  let fore, seat;
  const P = [ra, rb], N = [na, nb];
  if (ra.pos !== "X" && rb.pos !== "X" && ra.pos !== rb.pos) { fore = ra.pos === "F" ? 0 : 1; seat = fill(SEAT.split, { A: N[fore], B: N[1 - fore] }) }
  else if (ra.pos !== "X" && ra.pos === rb.pos) {
    // 같은 쪽: |P|가 작은 사람이 이동, 같으면 반대쪽 후위 샷 합이 높은 사람이 이동
    const side = ra.pos, other = side === "F" ? "B" : "F", os = other === "F" ? "FB" : "BB";
    let mv = Math.abs(ra.P) < Math.abs(rb.P) ? 0 : Math.abs(rb.P) < Math.abs(ra.P) ? 1 : (rb.sum[os] > ra.sum[os] ? 1 : 0);
    fore = other === "F" ? mv : 1 - mv;
    seat = fill(SEAT.same, { A: N[mv], S1: POSN[side], S2: POSN[other] });
  } else if (ra.pos === "X" && rb.pos === "X") { fore = rb.P < ra.P ? 1 : 0; seat = SEAT.bothFlex }
  else { const fx = ra.pos === "X" ? 0 : 1, st = P[1 - fx].pos; fore = st === "F" ? 1 - fx : fx; seat = fill(SEAT.oneFlex, { A: N[fx], B: N[1 - fx], S1: POSN[st] }) }
  const back = 1 - fore, fr = P[fore], br = P[back];
  // 센터: 포 자리 사람의 포 후위 센터 쪽, 백 자리 사람의 백 후위 센터 쪽
  const fc = fr.shots[SPOTS[fr.h].FB.cen], bc = br.shots[SPOTS[br.h].BB.cen];
  const center = fc === 1 && bc === 1 ? CENTER.both : fc === 1 || bc === 1 ? fill(CENTER.one, { A: N[fc === 1 ? fore : back] }) : CENTER.none;
  const cKind = fc === 1 && bc === 1 ? "both" : fc === 1 || bc === 1 ? "one" : "none";
  const lr = fr.h !== br.h ? fill(CENTER.lr, { S: isFore(SPOTS[fr.h].FB.cen) ? "포핸드" : "백핸드" }) : "";
  // 주의할 장면(최대 2개)
  const bothAct = ra.cov === "act" && rb.cov === "act", bothShare = ra.cov === "share" && rb.cov === "share",
    bothFreeze = ra.flags.freeze && rb.flags.freeze, anyHes = ra.flags.hesitate || rb.flags.hesitate, zone = bothFreeze && anyHes;
  const cau = [];
  if (zone) cau.push(CAUTION.zone);
  if (bothAct) cau.push(CAUTION.act);
  if (bothShare) cau.push(CAUTION.share);
  if (!zone && bothFreeze) cau.push(CAUTION.freeze);
  if (!zone && anyHes) cau.push(CAUTION.hesitate);
  // 약속 3개: 조건 맞는 것 우선순위대로, 모자라면 위에서부터
  const centerWarn = cKind === "none" || bothAct || bothShare || bothFreeze || zone;
  const cond = { center: centerWarn, poach: anyHes || bothAct, change: ra.sty !== rb.sty, gp: ra.q4 === rb.q4, lob: true };
  const pick = PROMISES.filter(p => cond[p.id] && p.id !== "lob").map(p => p.id);
  PROMISES.forEach(p => { if (pick.length < 3 && !pick.includes(p.id)) pick.push(p.id) });
  const prom = PROMISES.filter(p => pick.slice(0, 3).includes(p.id)).map(p => ({ ...p, o: p.o.map(x => fill(x, { A: na, B: nb })) }));
  return { ra, rb, combo, fore, back, seat, center, cKind, lr, cautions: cau.slice(0, 2), prom };
}

// 링크용 인코딩: base64url(JSON)
export const b64e = o => { const s = new TextEncoder().encode(JSON.stringify(o)); let b = ""; s.forEach(c => b += String.fromCharCode(c)); return btoa(b).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") };
export const b64d = t => { try { const b = atob(String(t).replace(/-/g, "+").replace(/_/g, "/")); return JSON.parse(new TextDecoder().decode(Uint8Array.from(b, c => c.charCodeAt(0)))) } catch (e) { return null } };
const person = x => x && typeof x === "object" && ftValid(x.h, x.a) ? { n: String(x.n || "").slice(0, 10), h: x.h, a: x.a.slice() } : null;
// 초대 링크 ?ft= {v:1,n,h,a} / 결과 돌려주기 ?fr= {v:1,A:{n,h,a},B:{n,h,a}}. 잘못되면 null
export function ftInvite(t) { const o = b64d(t); return o && o.v === 1 ? person(o) : null }
export function ftReturn(t) { const o = b64d(t); if (!o || o.v !== 1) return null; const A = person(o.A), B = person(o.B); return A && B ? { A, B } : null }
