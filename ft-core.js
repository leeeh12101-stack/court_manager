// 포백 테스트 계산 — 화면·Firebase와 무관한 순수 계산(자동 테스트 대상: tests/ft.test.mjs)
import { TYPES, COMBOS, SEAT, CENTER, CAUTION, CAUTION2, PROMISES, POSN, SHOT_NM, REASON, AN, REAL, REASON_E, TEAM } from "./ft-data.js";

// 답 배열 순서(v2). 모든 값은 고른 보기 번호(0부터). 샷 문항(a~h)은 5단계(0 매우 자신 … 4 매우 부담), role 3은 '응답 없음'(예전 결과를 옮긴 경우)
export const FT_KEYS = ["q2", "q3", "q4", "a", "b", "c", "d", "e", "f", "g", "h", "q6", "q7", "q8", "q9", "q10", "q11", "role"];
const NOPT = { q2: 3, q3: 3, q4: 3, q6: 3, q7: 3, q8: 3, q9: 3, q10: 3, q11: 3, role: 4 };
const PT = { q2: [-1, 1, 0], q3: [-2, 2, 0], q4: [2, -2, 0], q6: [2, -1, -2], q11: [2, -1, -2] }, SHOT = [1, .5, 0, -.5, -1], STY = ["lead", "link", "safe"];
// 위치 점수 가중치: 바깥 공(더 강한 스트로크를 바깥에) > 센터 > 전위 발리. 프로는 발리가 우선이지만 동호인은 커버 범위가 좁아 발리 비중을 중간으로
export const W = { out: 1.25, cen: 1, vol: .75 }, PMAX = 5 + 2 * W.out + 2 * W.cen + 4 * W.vol;
// 자리별 샷: out=바깥쪽, cen=센터 쪽. FB 포 후위 · BB 백 후위 · FN 포 전위 · BN 백 전위
export const SPOTS = {
  R: { FB: { out: "a", cen: "d" }, BB: { out: "b", cen: "c" }, FN: { out: "e", cen: "h" }, BN: { out: "f", cen: "g" } },
  L: { FB: { out: "b", cen: "c" }, BB: { out: "a", cen: "d" }, FN: { out: "f", cen: "g" }, BN: { out: "e", cen: "h" } }
};
export const isFore = k => "aceg".includes(k); // 포핸드·포발리 문항
const fill = (t, m) => t.replace(/\{(\w+)\}/g, (_, k) => m[k] ?? "");
// 예전(v1: 17칸, 샷 3단계) 답을 v2로 옮기기
export function ftUp(a) { if (!Array.isArray(a) || a.length !== 17) return a; const b = a.slice(); for (let i = 3; i <= 10; i++) b[i] = [0, 2, 4][a[i]] ?? a[i]; b.push(3); return b }

// 쉬운 버전 답(8칸): 리턴 편한 쪽 · 포/백핸드 자신감 · e1~e6(e2는 커버)
export const EASY_KEYS = ["es", "ek", "e1", "e2", "e3", "e4", "e5", "e6"];
const ENOPT = [4, 4, 3, 3, 3, 3, 3, 3];
// 답 검증: h "R"|"L", a 길이 18(상세) 또는 8(쉬운 버전), 각 값이 보기 범위 안
export function ftValid(h, a) {
  if (h !== "R" && h !== "L") return false;
  if (Array.isArray(a) && a.length === EASY_KEYS.length) return a.every((x, i) => Number.isInteger(x) && x >= 0 && x < ENOPT[i]);
  if (!Array.isArray(a) || a.length !== FT_KEYS.length) return false;
  return FT_KEYS.every((k, i) => Number.isInteger(a[i]) && a[i] >= 0 && a[i] < (NOPT[k] || 5));
}
const obj = a => Object.fromEntries(FT_KEYS.map((k, i) => [k, a[i]]));

// 쉬운 버전 계산: 위치 = 편한 쪽(±2) + 더 강한 스트로크를 바깥에(오른손 포핸드 강하면 포 쪽). 샷은 포/백핸드 자신감으로 채워 궁합 계산에 씀
function ftScoreE(h, a) {
  const [es, ek, ...E] = a, sd = [-2, 2, 0, 0][es], st = [-1.5, -.75, 0, 1][ek] * (h === "R" ? 1 : -1), P = sd + st;
  const pos = P < -1.5 ? "F" : P > 1.5 ? "B" : "X", back = Math.round(50 + 40 * P / 3.5);
  const votes = { lead: 0, link: 0, safe: 0 };[0, 2, 3, 4, 5].forEach(i => votes[STY[E[i]]]++);
  const mx = Math.max(votes.lead, votes.link, votes.safe), top = STY.filter(s => votes[s] === mx), sty = top.includes("link") ? "link" : top.length === 1 ? top[0] : STY[E[0]];
  const cov = ["act", "bal", "share"][E[1]], C = { act: 3, bal: 0, share: -3 }[cov];
  const fv = [1, .5, 0, -.5][ek], bv = [-.5, 0, 0, 1][ek], shots = Object.fromEntries("abcdefgh".split("").map(k => [k, isFore(k) ? fv : bv]));
  const sp = SPOTS[h], sum = s => shots[sp[s].out] + shots[sp[s].cen], key = pos + "-" + sty;
  return { easy: 1, h, es, ek, P, mind: sd, shotP: st, pos, back, fore: 100 - back, votes, sty, C, cov, flags: { freeze: false, hesitate: false, mixed: votes.lead >= 2 && votes.safe >= 2 }, shots, key, type: TYPES[key], sum: { FB: sum("FB"), BB: sum("BB"), FN: sum("FN"), BN: sum("BN") }, q4: -1 };
}
export const ftReasonE = r => `${REASON_E.side[r.es]} ${REASON_E.stroke[r.ek < 2 ? "fore" : r.ek === 3 ? "back" : "even"]} ${REASON_E.tail[r.pos]}`;
// 팀 전략: 기본 포메이션(두 사람 강한 구역) + 서브/리턴 게임 플랜(운영 조합)
export function ftTeam(m) {
  const z = r => r.easy ? "even" : ftAnalysis(r).zone, za = z(m.ra), zb = z(m.rb), f = za === "net" && zb === "net" ? "net" : za === "back" && zb === "back" ? "back" : "mix";
  const k = [m.ra.sty, m.rb.sty].sort((x, y) => STY.indexOf(x) - STY.indexOf(y)).join("+");
  return { form: TEAM.form[f], serve: TEAM.plan[k][0], ret: TEAM.plan[k][1] };
}

export function ftScore(h, a) {
  if (Array.isArray(a) && a.length === EASY_KEYS.length) return ftScoreE(h, a);
  const o = obj(a), v = k => SHOT[o[k]], sp = SPOTS[h], sum = s => v(sp[s].out) + v(sp[s].cen);
  const mind = PT.q2[o.q2] + PT.q3[o.q3] + PT.q4[o.q4];
  const shotP = W.out * (v(sp.BB.out) - v(sp.FB.out)) + W.cen * (v(sp.BB.cen) - v(sp.FB.cen)) + W.vol * (sum("BN") - sum("FN")), P = mind + shotP;
  const pos = P < -2 ? "F" : P > 2 ? "B" : "X", back = Math.round(50 + 40 * P / PMAX);
  // 운영: 7~10번·역할 문항 표 + 11번('쭈뼛'은 표 없음, '자리 지키기'는 안정)
  const votes = { lead: 0, link: 0, safe: 0 };
  ["q7", "q8", "q9", "q10"].forEach(k => votes[STY[o[k]]]++);
  if (o.role < 3) votes[STY[o.role]]++;
  if (o.q11 === 0) votes.lead++; else if (o.q11 === 2) votes.safe++;
  const mx = Math.max(votes.lead, votes.link, votes.safe), top = STY.filter(s => votes[s] === mx);
  const sty = top.includes("link") ? "link" : top.length === 1 ? top[0] : STY[o.q7];
  const C = PT.q6[o.q6] + PT.q11[o.q11] + (v("g") + v("h")) / 2, cov = C >= 2 ? "act" : C <= -2 ? "share" : "bal";
  const flags = { freeze: o.q6 === 1, hesitate: o.q11 === 1, mixed: votes.lead >= 2 && votes.safe >= 2 };
  const shots = Object.fromEntries("abcdefgh".split("").map(k => [k, v(k)]));
  const key = pos + "-" + sty;
  return { h, P, mind, shotP, pos, back, fore: 100 - back, votes, sty, C, cov, flags, shots, key, type: TYPES[key], sum: { FB: sum("FB"), BB: sum("BB"), FN: sum("FN"), BN: sum("BN") }, q4: o.q4 };
}
// 루이 카이에 복식 스타일 분류에 가까운 것(없으면 빈 값)
export const ftCayer = r => r.pos === "X" && r.sty === "link" ? "allcourt" : r.sty === "lead" ? (r.cov === "act" ? "poach" : "power") : r.sty === "link" ? "precision" : "";

// 결과 화면용: 자신 있는 샷·더 연습하면 좋은 샷(리시브 → 전위 순)
export function ftShots(r) { const ks = "abcdefgh".split(""); return { good: ks.filter(k => r.shots[k] > 0).map(k => SHOT_NM[k]), weak: ks.filter(k => r.shots[k] < 0).map(k => SHOT_NM[k]) } }
// 추천 자리 이유 한 줄: 마음(2~4번)과 샷(5번)이 어느 쪽을 가리키는지
export function ftReason(r) {
  if (r.easy) return ftReasonE(r);
  const sg = x => x > 0 ? "B" : x < 0 ? "F" : "", m = sg(r.mind), t = sg(r.shotP), f = s => fill(s, { S: POSN[r.pos], M: POSN[m], T: POSN[t] });
  if (r.pos === "X") return f(m && t && m !== t ? REASON.flexMix : REASON.flex);
  if (m === r.pos && t === r.pos) return f(REASON.both);
  if (t === r.pos) return f(m ? REASON.shotWin : REASON.shotOnly);
  return f(t ? REASON.mindWin : REASON.mindOnly);
}

// 자리 표시: 샷 자신감도 같은 쪽을 가리키면 '추천 자리', 선호만으로 정해졌으면 '선호 자리'
export const ftSeatLabel = r => r.pos === "X" ? "자리" : (r.shotP > 0 ? "B" : r.shotP < 0 ? "F" : "") === r.pos ? "추천 자리" : "선호 자리";
// 플레이 분석 4줄: 강한 구역(리시브 vs 발리) · 포핸드/백핸드 · 센터/바깥 · 추천 자리에서 조심할 샷
export function ftAnalysis(r) {
  const v = r.shots, s = ks => ks.split("").reduce((t, k) => t + v[k], 0);
  const z = s("abcd") - s("efgh"), hd = s("aceg") - s("bdfh"), dr = s("cdgh") - s("abef");
  const zone = z >= 1.5 ? "back" : z <= -1.5 ? "net" : "even", hand = hd >= 1.5 ? "fore" : hd <= -1 ? "back" : "even", dir = dr >= 1.5 ? "cen" : dr <= -1.5 ? "out" : "even";
  let weak;
  if (r.pos === "X") { const w = "abcdefgh".split("").filter(k => v[k] < 0).slice(0, 2).map(k => SHOT_NM[k]); weak = w.length ? fill(AN.weak.flex, { W: w.join(", ") }) : AN.weak.flexNone }
  else { const sp = SPOTS[r.h], w = [sp[r.pos + "B"].out, sp[r.pos + "B"].cen, sp[r.pos + "N"].out, sp[r.pos + "N"].cen].filter(k => v[k] < 0).map(k => SHOT_NM[k]); weak = fill(w.length ? AN.weak.some : AN.weak.none, { S: POSN[r.pos], W: w.join(", ") }) }
  return { zone, hand, dir, rows: [[AN.zone.k, ...AN.zone[zone]], [AN.hand.k, ...AN.hand[hand]], [AN.dir.k, ...AN.dir[dir]], [AN.weak.k, "", weak]] };
}
// 실전 기록 비교: z={fore:{w,l,d,g},back:{...}} → 문구. 각 자리 3경기 미만이면 안내
export function ftReal(r, z) {
  const n = z.fore.g + z.back.g; if (z.fore.g < 3 || z.back.g < 3) return { ok: 0, text: fill(REAL.few, { N: n }) };
  const rt = o => o.w + o.l ? o.w / (o.w + o.l) : 0, d = rt(z.back) - rt(z.fore);
  if (Math.abs(d) < .1) return { ok: 1, text: REAL.flat };
  const S = d > 0 ? "B" : "F";
  return { ok: 1, better: S, text: r.pos === "X" ? fill(REAL.flexBetter, { S: POSN[S] }) : fill(S === r.pos ? REAL.same : REAL.diff, { S: POSN[S], Q: POSN[r.pos] }) };
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
  const center = fc > 0 && bc > 0 ? CENTER.both : fc > 0 || bc > 0 ? fill(CENTER.one, { A: N[fc > bc ? fore : back] }) : CENTER.none;
  const cKind = fc > 0 && bc > 0 ? "both" : fc > 0 || bc > 0 ? "one" : "none";
  const lr = fr.h !== br.h ? fill(CENTER.lr, { S: isFore(SPOTS[fr.h].FB.cen) ? "포핸드" : "백핸드" }) : "";
  // 주의할 장면(최대 2개)
  const bothAct = ra.cov === "act" && rb.cov === "act", bothShare = ra.cov === "share" && rb.cov === "share",
    bothFreeze = ra.flags.freeze && rb.flags.freeze, anyHes = ra.flags.hesitate || rb.flags.hesitate, zone = bothFreeze && anyHes;
  const aa = ftAnalysis(ra), ab = ftAnalysis(rb), bothFore = aa.hand === "fore" && ab.hand === "fore", bothBackZ = aa.zone === "back" && ab.zone === "back", bothNet = aa.zone === "net" && ab.zone === "net";
  const cau = [];
  if (zone) cau.push(CAUTION.zone);
  if (bothFore) cau.push(CAUTION2.fore);
  if (bothAct) cau.push(CAUTION.act);
  if (bothShare) cau.push(CAUTION.share);
  if (!zone && bothFreeze) cau.push(CAUTION.freeze);
  if (!zone && anyHes) cau.push(CAUTION.hesitate);
  if (bothBackZ) cau.push(CAUTION2.back);
  if (bothNet) cau.push(CAUTION2.net);
  // 약속 3개: 조건 맞는 것 우선순위대로, 모자라면 위에서부터
  const centerWarn = cKind === "none" || bothAct || bothShare || bothFreeze || zone || bothFore;
  const cond = { center: centerWarn, poach: anyHes || bothAct, change: ra.sty !== rb.sty, gp: ra.q4 === rb.q4, lob: bothNet };
  const pick = PROMISES.filter(p => cond[p.id]).map(p => p.id);
  PROMISES.forEach(p => { if (pick.length < 3 && !pick.includes(p.id)) pick.push(p.id) });
  const prom = PROMISES.filter(p => pick.slice(0, 3).includes(p.id)).map(p => ({ ...p, o: p.o.map(x => fill(x, { A: na, B: nb })) }));
  return { ra, rb, combo, fore, back, seat, center, cKind, lr, cautions: cau.slice(0, 2), prom };
}

// 링크용 인코딩: base64url(JSON)
export const b64e = o => { const s = new TextEncoder().encode(JSON.stringify(o)); let b = ""; s.forEach(c => b += String.fromCharCode(c)); return btoa(b).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") };
export const b64d = t => { try { const b = atob(String(t).replace(/-/g, "+").replace(/_/g, "/")); return JSON.parse(new TextDecoder().decode(Uint8Array.from(b, c => c.charCodeAt(0)))) } catch (e) { return null } };
const person = (x, up) => { if (!x || typeof x !== "object") return null; const a = up ? ftUp(x.a) : x.a; return ftValid(x.h, a) ? { n: String(x.n || "").slice(0, 10), h: x.h, a: a.slice() } : null };
// 초대 링크 ?ft= {v:1,n,h,a} / 결과 돌려주기 ?fr= {v:1,A:{n,h,a},B:{n,h,a}}. 잘못되면 null
export function ftInvite(t) { const o = b64d(t); return o && (o.v === 1 || o.v === 2) ? person(o, o.v === 1) : null }
export function ftReturn(t) { const o = b64d(t); if (!o || (o.v !== 1 && o.v !== 2)) return null; const A = person(o.A, o.v === 1), B = person(o.B, o.v === 1); return A && B ? { A, B } : null }
