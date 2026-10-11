// 포백 테스트 화면 — app.js에서 ftInstall(도구)로 연결해요. 문구는 ft-data.js, 계산은 ft-core.js
// 화면: ftStart 시작 · ftQ 문항 · ftLoad 분석 중 · ftRes 결과 · ftWait 궁합 대기 · ftMatch 궁합 · ftMy 내 복식 성향
import { FQ, SHOT_O, FT_LOADING, POSN, STYN, COVN, TIP_HESITATE, TIP_MIXED, FT_NOTE } from "./ft-data.js";
import { FT_KEYS, SPOTS, ftValid, ftScore, ftPartners, ftMatch, b64e, ftInvite, ftReturn } from "./ft-core.js";

export function ftInstall(X) {
  const { S, go, esc, toast, pop, askText } = X;
  const rr = () => { S.still = 1; X.render(); S.still = 0 };
  // ---------- 저장: 먼저 폰(localStorage), 로그인하면 users 문서의 ft(내 결과)·ftc(궁합) 항목에 최근 5개
  const LS = "cm_ft", ld = () => { try { return JSON.parse(localStorage.getItem(LS) || "{}") } catch (e) { return {} } }, sv = o => { try { localStorage.setItem(LS, JSON.stringify(o)) } catch (e) { } };
  const okR = x => x && x.at && ftValid(x.h, x.a), okC = x => x && x.at && x.A && x.B && ftValid(x.A.h, x.A.a) && ftValid(x.B.h, x.B.a);
  const uniq = (L, ok) => { const m = {}; L.forEach(x => { if (ok(x)) m[x.at] = { ...(m[x.at] || {}), ...x } }); return Object.values(m).sort((a, b) => b.at - a.at).slice(0, 5) };
  const mine = () => uniq([...(ld().r || []), ...((S.profile && S.profile.ft) || [])], okR);
  const comps = () => uniq([...(ld().c || []), ...((S.profile && S.profile.ftc) || [])], okC);
  const myName = () => (S.profile && S.profile.name ? String(S.profile.name).slice(0, 10) : "") || ld().nick || "";
  function keepLocal(k, rec, ok) { const o = ld(); o[k] = uniq([rec, ...(o[k] || [])], ok); sv(o); sync() }
  async function sync() {
    if (!S.user || !S.profile) return;
    const r = mine(), c = comps(), same = (a, b) => JSON.stringify(a || []) === JSON.stringify(b || []);
    if (same(r, S.profile.ft) && same(c, S.profile.ftc)) return;
    try { await X.saveUser({ ft: r, ftc: c }); S.profile.ft = r; S.profile.ftc = c } catch (e) { }
  }
  const latest = () => mine()[0] || null;
  const url = (k, o) => `${location.origin}${location.pathname}?${k}=${b64e(o)}`;
  async function share(t, okMsg) { try { if (navigator.share) { await navigator.share({ text: t }); return } await navigator.clipboard.writeText(t); toast(okMsg || "링크를 복사했어요. 카톡에 붙여넣어 주세요") } catch (e) { } }

  // ---------- 그림: 하프 코트 타점 지도(뒤에서 본 시점, 네트가 위, 왼쪽 백·오른쪽 포)
  const CL = { 1: "rgba(46,150,90,.5)", 0: "rgba(140,146,142,.35)", "-1": "rgba(235,130,40,.55)" };
  function court(P, opt = {}) {
    const k = 24, mx = 30, top = 16, W = 10.97 * k, L = 11.885 * k, cx = mx + W / 2, sg = 1.37 * k, sl = top + 6.4 * k, bl = top + L, w = mx * 2 + W, h = bl + 62;
    const XY = { FN: [cx + 66, top + 3 * k], BN: [cx - 66, top + 3 * k], FB: [cx + 66, bl + 20], BB: [cx - 66, bl + 20] };
    const NM = { FN: "포 전위", BN: "백 전위", FB: "포 후위", BB: "백 후위" };
    let g = `<rect x="${mx}" y="${top}" width="${W}" height="${L}" fill="#DCE6CF"/><g stroke="#fff" stroke-width="2" fill="none"><rect x="${mx}" y="${top}" width="${W}" height="${L}"/><line x1="${mx + sg}" y1="${top}" x2="${mx + sg}" y2="${bl}"/><line x1="${mx + W - sg}" y1="${top}" x2="${mx + W - sg}" y2="${bl}"/><line x1="${mx + sg}" y1="${sl}" x2="${mx + W - sg}" y2="${sl}"/><line x1="${cx}" y1="${top}" x2="${cx}" y2="${sl}"/></g><line x1="${mx - 8}" y1="${top}" x2="${mx + W + 8}" y2="${top}" stroke="#5C635F" stroke-width="3"/><text x="${cx}" y="${top - 4}" font-size="10" text-anchor="middle" fill="#5C635F">네트</text>`;
    P.forEach(p => {
      const [x, y] = XY[p.spot], deuce = p.spot[0] === "F", sp = SPOTS[p.h][p.spot], li = deuce ? sp.cen : sp.out, ri = deuce ? sp.out : sp.cen, fr = p.h === "R" ? "r" : "l";
      const semi = (side, it) => { const dx = side === "r" ? 11 : -11, cen = it === sp.cen && opt.center; return `<path d="M${x + dx},${y - 17} A17 17 0 0 ${side === "r" ? 1 : 0} ${x + dx},${y + 17} Z" fill="${CL[p.shots[it]]}"${cen ? ' stroke="#174A43" stroke-width="2"' : ""}/><text x="${x + dx + (side === "r" ? 8 : -8)}" y="${y + 4}" font-size="11" font-weight="600" text-anchor="middle" fill="#202522">${side === fr ? "포" : "백"}</text>` };
      g += semi("l", li) + semi("r", ri) + `<circle cx="${x}" cy="${y}" r="8" fill="#174A43"/><text x="${x}" y="${y + 33}" font-size="11" text-anchor="middle" fill="#202522" font-weight="${p.rec ? 700 : 500}">${esc(p.label || NM[p.spot])}${p.rec ? " · 추천" : ""}</text>`;
    });
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="display:block;max-width:360px;margin:0 auto" role="img" aria-label="타점 지도">${g}</svg><div class="sub center" style="font-size:12px;margin-top:4px"><span style="color:#2E965A">●</span> 자신 있음 · <span style="color:#8C928E">●</span> 보통 · <span style="color:#EB8228">●</span> 부담</div>`;
  }
  const tags = r => `<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:8px 0"><span class="pill">${POSN[r.pos]}</span><span class="pill">${STYN[r.sty]}</span><span class="pill">커버 ${COVN[r.cov]}</span></div>`;
  const ratio = r => `<div class="ftbar"><span style="width:${r.fore}%">포 ${r.fore}%</span><span style="width:${r.back}%">백 ${r.back}%</span></div><div class="sub center" style="font-size:12px">설문으로 본 상대적 선호</div>`;

  // ---------- 공유 카드(세로 이미지): 짙은 코트 바닥 + 비스듬한 코트 라인 + 공
  function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath() }
  function courtBg(c) {
    let sd = 7; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const g = c.createLinearGradient(0, 0, 1080, 1350); g.addColorStop(0, "#22573A"); g.addColorStop(.55, "#1A4A31"); g.addColorStop(1, "#133B26"); c.fillStyle = g; c.fillRect(0, 0, 1080, 1350);
    for (let i = 0; i < 26000; i++) { c.fillStyle = rnd() < .5 ? "rgba(255,255,255,.035)" : "rgba(0,0,0,.06)"; c.fillRect(rnd() * 1080, rnd() * 1350, 2, 2) } // 바닥 질감
    c.save(); c.filter = "blur(46px)"; c.fillStyle = "rgba(0,0,0,.3)"; [[-80, 120], [-80, 300]].forEach(([x, y]) => { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 760, y - 260); c.lineTo(x + 800, y - 170); c.lineTo(x + 40, y + 90); c.fill() }); c.restore(); // 빛 그림자
    const line = (x1, y1, x2, y2, w) => { c.save(); c.lineCap = "butt"; c.strokeStyle = "rgba(232,238,228,.82)"; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
      c.clip(new Path2D(`M${x1},${y1}L${x2},${y2}`)); const n = Math.hypot(x2 - x1, y2 - y1) * w / 30; for (let i = 0; i < n; i++) { const t = rnd(), o = (rnd() - .5) * w; const nx = -(y2 - y1), ny = x2 - x1, l = Math.hypot(nx, ny); c.fillStyle = "rgba(20,60,35,.25)"; c.fillRect(x1 + (x2 - x1) * t + nx / l * o, y1 + (y2 - y1) * t + ny / l * o, 3, 3) } c.restore() };
    line(-60, 930, 400, 1420, 26); line(130, 1420, 1140, 1095, 26); line(640, -20, 1140, 235, 22);
    const bx = 1035, by = 1252, br = 92; c.save(); c.filter = "blur(18px)"; c.fillStyle = "rgba(0,0,0,.45)"; c.beginPath(); c.ellipse(bx - 30, by + 70, br * .95, br * .35, 0, 0, 7); c.fill(); c.restore(); // 공
    const bg = c.createRadialGradient(bx - 35, by - 40, 10, bx, by, br); bg.addColorStop(0, "#EAF56A"); bg.addColorStop(.7, "#C6DA36"); bg.addColorStop(1, "#93A826"); c.fillStyle = bg; c.beginPath(); c.arc(bx, by, br, 0, 7); c.fill(); c.save(); c.beginPath(); c.arc(bx, by, br, 0, 7); c.clip();
    c.strokeStyle = "rgba(255,255,240,.85)"; c.lineWidth = 7; c.beginPath(); c.arc(bx - br * 1.15, by, br * .95, -.75, .75); c.stroke(); c.beginPath(); c.arc(bx + br * 1.15, by, br * .95, Math.PI - .75, Math.PI + .75); c.stroke(); c.restore();
  }
  function header(c, F) { c.fillStyle = "rgba(236,240,230,.9)"; c.font = `600 30px ${F}`; try { c.letterSpacing = "7px" } catch (e) { } c.fillText("COURT MANAGER", 540, 200); const hw = c.measureText("COURT MANAGER").width / 2 + 34; try { c.letterSpacing = "0px" } catch (e) { }
    c.strokeStyle = "rgba(236,240,230,.6)"; c.lineWidth = 2; [[540 - hw - 110, 540 - hw], [540 + hw, 540 + hw + 110]].forEach(([a, b]) => { c.beginPath(); c.moveTo(a, 189); c.lineTo(b, 189); c.stroke() }) }
  function footer(c, F) { c.strokeStyle = "rgba(220,235,190,.5)"; c.lineWidth = 2; [[325, 512], [608, 795]].forEach(([a, b]) => { c.beginPath(); c.moveTo(a, 1110); c.lineTo(b, 1110); c.stroke() });
    c.fillStyle = "#C6DA36"; c.beginPath(); c.arc(560, 1110, 18, 0, 7); c.fill(); c.strokeStyle = "#1A4A31"; c.lineWidth = 3; c.beginPath(); c.arc(541, 1110, 15, -.8, .8); c.stroke(); c.beginPath(); c.arc(579, 1110, 15, Math.PI - .8, Math.PI + .8); c.stroke();
    c.fillStyle = "#D6E8A4"; c.font = `500 32px ${F}`; c.fillText("Court Manager · 포백 테스트", 540, 1178) }
  function pills(c, F, L, y) { c.font = `600 34px ${F}`; const pw = L.map(t => c.measureText(t).width + 64), tw = pw.reduce((a, b) => a + b, 0) + 18 * (L.length - 1); let x = 540 - tw / 2;
    L.forEach((t, i) => { rrect(c, x, y, pw[i], 64, 32); c.fillStyle = "rgba(10,40,24,.35)"; c.fill(); c.strokeStyle = "rgba(200,230,120,.55)"; c.lineWidth = 2; c.stroke(); c.fillStyle = "#DDEFA8"; c.fillText(t, x + pw[i] / 2, y + 44); x += pw[i] + 18 }) }
  function wrap(c, t, x, y, mw, lh) { let line = "", yy = y; for (const ch of String(t)) { if (c.measureText(line + ch).width > mw && line) { c.fillText(line, x, yy); line = ch; yy += lh } else line += ch } c.fillText(line, x, yy); return yy + lh }
  function card(draw, name) {
    const cv = document.createElement("canvas"); cv.width = 1080; cv.height = 1350; const c = cv.getContext("2d"), F = '"Apple SD Gothic Neo","Noto Sans KR",system-ui,sans-serif';
    courtBg(c); c.textAlign = "center"; header(c, F); draw(c, F); footer(c, F);
    cv.toBlob(async b => { const f = new File([b], name, { type: "image/png" }); try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f] }); return } } catch (e) { if (e && e.name === "AbortError") return } S.ftImg = cv.toDataURL("image/png"); rr() }, "image/png");
  }
  const imgSheet = () => S.ftImg ? `<div class="sh" data-a="ftImgX"><div data-keep="1"><div class="row"><h3>카드 이미지</h3><button class="link" data-a="ftImgX">닫기</button></div><img src="${S.ftImg}" alt="공유 카드" style="width:100%;border-radius:12px;margin-top:8px"><div class="sub center" style="margin-top:6px">이미지를 길게 눌러 저장하세요</div></div></div>` : "";

  // ---------- 화면
  const back = (t = "뒤로") => `<button class="link bk" data-a="ftBack"><span class="ar">←</span> ${t}</button>`;
  const sec = (t, v) => `<div class="li" style="display:block"><div class="sub">${t}</div><div style="margin-top:2px">${esc(v)}</div></div>`;
  function resBlock(R, rec) {
    const r = ftScore(R.h, R.a), T = r.type, pp = ftPartners(r);
    const map = court(["FN", "BN", "FB", "BB"].map(s => ({ spot: s, h: r.h, shots: r.shots, rec: (r.pos === "F" && s === "FB") || (r.pos === "B" && s === "BB") })));
    const tips = [r.flags.hesitate ? TIP_HESITATE : "", r.flags.mixed ? TIP_MIXED : ""].filter(Boolean);
    return `<div class="center"><div class="sub">${rec ? "내 복식 성향" : esc(R.n || "") + "님의 복식 성향"} · ${r.h === "R" ? "오른손" : "왼손"}</div><div style="font-size:34px;font-weight:800;color:var(--main);letter-spacing:-.02em;margin-top:2px">${T.n}</div>${tags(r)}<div style="font-weight:600;margin-bottom:12px">"${esc(T.one)}"</div></div>
<div class="card">${ratio(r)}<div style="margin-top:12px">${map}</div></div>
<div class="list">${sec("이럴 때 당신답다", T.moment)}${sec("무기", T.weapon)}${sec("이것만 조심", T.careful)}${sec("파트너에게 들을 법한 말", `"${T.quote}"`)}${sec("다음 경기 미션", T.mission)}</div>
${tips.map(t => `<div class="card" style="background:var(--tint);box-shadow:none;padding:12px 14px">${esc(t)}</div>`).join("")}
<div class="card" style="padding:12px 14px"><div class="sub">잘 맞는 파트너 유형</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${pp.map(p => `<span class="pill">${p.n} <span style="font-weight:400">${POSN[p.key[0]]}·${STYN[p.key.slice(2)]}</span></span>`).join("")}</div></div>`;
  }
  const loginBtn = () => !S.user ? `<button class="ghost" data-a="ftSave">로그인해 저장</button>` : "";
  const FV = {
    ftStart: () => { const I = S.ft && S.ft.inv; return `${back(I ? "닫기" : "뒤로")}<div class="mid center" style="padding:10px 0"><h1 style="font-size:28px">포백 테스트</h1><p class="hi" style="margin-bottom:6px">나는 포잡이? 백잡이?</p><div class="sub">12문항 · 약 2분 · 로그인 없이 바로</div>
${I ? `<div class="card" style="margin-top:18px;text-align:left;background:var(--tint);box-shadow:none"><b>${esc(I.n || "파트너")}님이 복식 궁합을 보자고 해요</b><div class="sub">테스트를 마치면 둘의 궁합이 바로 열려요</div></div><div class="sub" style="text-align:left">내 이름 (궁합에 보여요)</div><input id="ftn" maxlength="10" value="${esc(S.ft.nick || myName())}" placeholder="이름 또는 닉네임">` : ""}</div><div class="bar"><button data-a="ftGo">테스트 시작</button></div>` },
    ftQ: () => {
      const st = S.ft.step, q = FQ[st], A = S.ft.a, n = FQ.length;
      let body;
      if (q.rows) body = `${q.rows.map(([k, t]) => `<div class="card" style="padding:12px 14px"><div style="font-weight:600;margin-bottom:8px">${esc(t)}</div><div style="display:flex;gap:6px">${SHOT_O.map((o, i) => `<span class="ftchip${A[k] === i ? " on" : ""}" data-a="ftShot" data-x="${k}" data-v="${i}">${o}</span>`).join("")}</div></div>`).join("")}<div class="bar"><button data-a="ftNext" ${q.rows.every(([k]) => A[k] != null) ? "" : "disabled"}>다음</button></div>`;
      else { const sel = q.id === "hand" ? (S.ft.h === "R" ? 0 : S.ft.h === "L" ? 1 : -1) : A[q.id]; body = q.o.map((t, i) => `<div class="card tap ftopt${sel === i ? " on" : ""}" data-a="ftAns" data-v="${i}">${esc(t)}</div>`).join("") }
      return `<button class="link bk" data-a="ftPrev"><span class="ar">←</span> ${st ? "이전" : "나가기"}</button><div class="row" style="margin:4px 0 6px"><span class="sub">${st + 1} / ${n}</span></div><div class="ftprog"><span style="width:${(st + 1) / n * 100}%"></span></div>
${q.pre ? `<div class="card center" style="background:var(--tint);box-shadow:none;padding:10px 12px;margin-top:12px;color:var(--main);font-weight:600">${esc(q.pre)}</div>` : ""}<h1 style="font-size:21px;margin:14px 0 14px;line-height:1.4">${esc(q.t)}</h1>${body}`
    },
    ftLoad: () => `<div class="mid center"><div class="spin"></div><p class="hi" style="margin-top:18px">${FT_LOADING}</p></div>`,
    ftRes: () => {
      const R = S.ftr, I = S.ft && S.ft.inv && S.ftr.fresh;
      return `${back()}${resBlock(R, 1)}
${I ? `<button data-a="ftMatchGo">${esc(I.n || "파트너")}님과 궁합 보기</button>` : `<button data-a="ftInv">파트너와 궁합 보기</button>`}<button class="ghost" data-a="ftCard">카드 저장</button>${loginBtn()}${!S.user ? `<button class="link" data-a="ftHome" style="display:block;margin:8px auto 0">Court Manager 둘러보기</button>` : ""}
<div class="sub center" style="margin:16px 0 24px;font-size:12px">${FT_NOTE}</div>${imgSheet()}` },
    ftWait: () => `${back("결과로")}<div class="mid center"><h1>궁합 대기 중</h1><p class="hi">파트너가 테스트를 마치면 궁합이 열립니다</p><div class="card" style="text-align:left;background:var(--tint);box-shadow:none"><div class="sub">파트너가 결과 화면에서 '궁합 결과 보내기'를 누르면, 받은 링크로 둘의 궁합을 볼 수 있어요.</div></div></div><div class="bar"><button data-a="ftInvAgain">링크 다시 보내기</button></div>`,
    ftMatch: () => {
      const M = S.ftm, m = ftMatch(M.A, M.B), na = M.A.n || "A", nb = M.B.n || "B", N = [na, nb], R = [m.ra, m.rb];
      const tcard = (n, r) => `<div class="card center" style="flex:1;min-width:0;margin:0;padding:12px 8px"><div class="sub" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(n)}</div><b style="font-size:19px;color:var(--main)">${r.type.n}</b><div class="sub" style="font-size:12px">${POSN[r.pos]} · ${STYN[r.sty]} · 커버 ${COVN[r.cov]}</div></div>`;
      const map = court([{ spot: "FB", h: R[m.fore].h, shots: R[m.fore].shots, label: N[m.fore] + " (포)" }, { spot: "BB", h: R[m.back].h, shots: R[m.back].shots, label: N[m.back] + " (백)" }], { center: 1 });
      const pr = M.pr || [];
      return `${back()}<h1 class="center">${esc(na)} × ${esc(nb)}</h1><div class="row" style="gap:8px;align-items:stretch;margin:10px 0 12px">${tcard(na, m.ra)}${tcard(nb, m.rb)}</div>
<div class="card hero center" style="padding:18px"><div class="sub">우리 조합</div><div style="font-size:28px;font-weight:800">${m.combo.n}</div><div>"${m.combo.one}"</div></div>
<div class="list">${sec("잘 맞는 점", m.combo.good)}${sec("주의할 점", m.combo.bad)}</div>
<h2>추천 자리</h2><div class="card">${esc(m.seat)}</div>
<h2>센터 지도</h2><div class="card">${map}<div style="margin-top:10px;font-weight:600">${esc(m.center)}</div>${m.lr ? `<div class="sub" style="margin-top:4px">${esc(m.lr)}</div>` : ""}</div>
${m.cautions.length ? `<h2>주의할 장면</h2>${m.cautions.map(c => `<div class="card" style="background:#FFF8E6;box-shadow:none;border:1px solid #F0D9A0;padding:12px 14px">${esc(c)}</div>`).join("")}` : ""}
<h2>우리 둘의 약속</h2><div class="sub" style="margin:-4px 2px 8px">둘이 함께 골라 보세요</div>${m.prom.map((p, pi) => `<div class="card" style="padding:12px 14px"><b>${esc(p.q)}</b><div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">${p.o.map((o, oi) => `<span class="ftchip${pr[pi] === oi ? " on" : ""}" data-a="ftPick" data-x="${pi}" data-v="${oi}" style="text-align:left">${esc(o)}</span>`).join("")}</div></div>`).join("")}
${M.role === "B" ? `<button data-a="ftSendBack">${esc(na)}님에게 궁합 결과 보내기</button>` : ""}<button class="${M.role === "B" ? "ghost" : ""}" data-a="ftMCard">궁합 카드 저장</button>${loginBtn()}${!S.user ? `<button class="link" data-a="ftHome" style="display:block;margin:8px auto 0">Court Manager 둘러보기</button>` : ""}
<div class="sub center" style="margin:16px 0 24px;font-size:12px">${FT_NOTE}</div>${imgSheet()}`
    },
    ftMy: () => {
      const L = mine(), C = comps(), d = at => { const x = new Date(at); return `${x.getMonth() + 1}.${String(x.getDate()).padStart(2, "0")}` };
      return `${back()}<h1>내 복식 성향</h1>${L.length ? (() => { const r = ftScore(L[0].h, L[0].a); return `<div class="card tap" data-a="ftView" data-x="${L[0].at}" style="padding:16px"><div class="sub">최근 결과 · ${d(L[0].at)}</div><b style="font-size:22px;color:var(--main)">${r.type.n}</b><div class="sub">${POSN[r.pos]} · ${STYN[r.sty]} · 커버 ${COVN[r.cov]} · 백 ${r.back}%</div></div><button data-a="ftInvMy">파트너와 궁합 보기</button>` })() : `<div class="card sub center">아직 테스트 결과가 없어요</div>`}<button class="ghost" data-a="ftNew">${L.length ? "다시 하기" : "테스트 시작"}</button>
${L.length > 1 ? `<h2>지난 결과</h2><div class="list">${L.slice(1).map(x => { const r = ftScore(x.h, x.a); return `<div class="li tap" data-a="ftView" data-x="${x.at}"><span class="sub" style="width:44px">${d(x.at)}</span><span class="nm">${r.type.n}</span><span class="sub">백 ${r.back}%</span></div>` }).join("")}</div>` : ""}
${C.length ? `<h2>궁합 기록</h2><div class="list">${C.map(x => { const m = ftMatch(x.A, x.B); return `<div class="li tap" data-a="ftCView" data-x="${x.at}"><span class="sub" style="width:44px">${d(x.at)}</span><span class="nm">${esc(x.A.n)} × ${esc(x.B.n)}</span><span class="sub">${m.combo.n}</span></div>` }).join("")}</div>` : ""}
${X.isDev() ? `<div class="sub center" id="ftst" style="margin-top:16px">테스트 통계 불러오는 중…</div>` : ""}`
    }
  };

  // ---------- 동작
  const resetFt = inv => { S.ft = { step: 0, h: null, a: {}, inv: inv || null, nick: "" } };
  function finish() {
    const a = FT_KEYS.map(k => S.ft.a[k]);
    if (!ftValid(S.ft.h, a)) return pop("답하지 않은 문항이 있어요.");
    const rec = { at: Date.now(), h: S.ft.h, a };
    keepLocal("r", rec, okR); X.count("done"); if (S.ft.inv) X.count("invDone");
    S.ftr = { ...rec, n: S.ft.nick || myName(), fresh: 1 }; go("ftLoad"); setTimeout(() => { if (S.screen === "ftLoad") go("ftRes") }, 1000);
  }
  function openMatch(A, B, role, from) {
    const ex = comps().find(x => JSON.stringify([x.A, x.B]) === JSON.stringify([A, B]));
    S.ftm = ex ? { ...ex, role } : { at: Date.now(), A, B, pr: [], role }; S.ftFrom = from || S.ftFrom;
    keepLocal("c", { at: S.ftm.at, A, B, pr: S.ftm.pr || [] }, okC); go("ftMatch");
  }
  async function invite(R) {
    let n = myName(); if (!n) { n = ((await askText("파트너에게 보일 내 이름(10자까지)", "")) || "").trim().slice(0, 10); if (!n) return; const o = ld(); o.nick = n; sv(o) }
    S.ftr = { ...R, n }; X.count("inv");
    await share(`[포백 테스트] ${n}님이 복식 궁합을 보자고 해요!\n나는 포잡이? 백잡이? 테스트하고 둘의 궁합을 확인해 보세요\n${url("ft", { v: 1, n, h: R.h, a: R.a })}`);
    go("ftWait");
  }
  function exit() { const f = S.ftFrom; if (f === "ftMy") go("ftMy"); else if (f === "personal") X.toP(); else X.home() }
  const FA = {
    ftOpen(el) { S.ftFrom = S.screen === "personal" ? "personal" : S.user && S.profile ? "mode" : "login"; const L = latest(); if (L && el.dataset.v !== "new") { S.ftr = { ...L, n: myName() }; resetFt(); go("ftRes") } else { resetFt(); go("ftStart") } },
    ftMyOpen() { S.ftFrom = "personal"; go("ftMy"); X.devStats() },
    ftNew() { if (S.screen === "ftMy") S.ftFrom = "ftMy"; resetFt(); go("ftStart") },
    ftGo() { const i = document.getElementById("ftn"); if (i) { const n = i.value.trim().slice(0, 10); S.ft.nick = n; if (n && !S.profile) { const o = ld(); o.nick = n; sv(o) } } S.ft.step = 0; go("ftQ") },
    ftAns(el) { const i = +el.dataset.v, q = FQ[S.ft.step]; if (q.id === "hand") S.ft.h = i ? "L" : "R"; else S.ft.a[q.id] = i; rr(); setTimeout(() => { if (S.screen !== "ftQ") return; if (S.ft.step >= FQ.length - 1) finish(); else { S.ft.step++; go("ftQ") } }, 160) },
    ftShot(el) { S.ft.a[el.dataset.x] = +el.dataset.v; rr() },
    ftNext() { if (S.ft.step >= FQ.length - 1) finish(); else { S.ft.step++; go("ftQ") } },
    ftPrev() { if (S.ft.step > 0) { S.ft.step--; go("ftQ") } else go("ftStart") },
    ftBack() { const f = FB[S.screen]; if (f) f() },
    async ftInv() { await invite(S.ftr) },
    async ftInvMy() { const L = latest(); if (L) { S.ftFrom = "ftMy"; await invite(L) } },
    async ftInvAgain() { const R = S.ftr; await share(`[포백 테스트] ${R.n}님이 복식 궁합을 보자고 해요!\n나는 포잡이? 백잡이? 테스트하고 둘의 궁합을 확인해 보세요\n${url("ft", { v: 1, n: R.n, h: R.h, a: R.a })}`) },
    ftMatchGo() { const I = S.ft.inv, R = S.ftr; openMatch(I, { n: R.n || "나", h: R.h, a: R.a }, "B") },
    async ftSendBack() { const M = S.ftm; await share(`[포백 테스트] ${M.B.n}님이 테스트를 마쳤어요! 우리 둘의 복식 궁합 보기\n${url("fr", { v: 1, A: M.A, B: M.B })}`) },
    ftPick(el) { const M = S.ftm, pi = +el.dataset.x, oi = +el.dataset.v, pr = [...(M.pr || [])]; pr[pi] = pr[pi] === oi ? null : oi; M.pr = pr; keepLocal("c", { at: M.at, A: M.A, B: M.B, pr }, okC); rr() },
    ftCard() {
      const r = ftScore(S.ftr.h, S.ftr.a), T = r.type;
      card((c, F) => {
        c.fillStyle = "#CFE67A"; c.font = `700 52px ${F}`; c.fillText("내 복식 성향", 540, 310);
        c.fillStyle = "#F6F4EC"; c.font = `800 ${T.n.length > 3 ? 150 : 176}px ${F}`; c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 24; c.fillText(T.n, 540, 492); c.shadowBlur = 0;
        c.font = `700 ${T.one.length > 18 ? 42 : 50}px ${F}`; let y = wrap(c, `“${T.one}”`, 540, 590, 940, 62);
        pills(c, F, [POSN[r.pos], STYN[r.sty] + "형", "커버 " + COVN[r.cov]], y + 14);
        const bx = 158, bw = 764, by = y + 124, bh = 82, fw = Math.max(0, Math.min(bw, bw * r.fore / 100));
        c.save(); rrect(c, bx, by, bw, bh, bh / 2); c.clip(); c.fillStyle = "#2B6650"; c.fillRect(bx, by, bw, bh); c.fillStyle = "#CBE56A"; c.fillRect(bx, by, fw, bh); c.restore();
        rrect(c, bx, by, bw, bh, bh / 2); c.strokeStyle = "rgba(200,230,120,.5)"; c.lineWidth = 2; c.stroke();
        c.font = `700 38px ${F}`; c.fillStyle = "#1A3D28"; if (r.fore >= 16) c.fillText(`포 ${r.fore}%`, bx + fw / 2, by + 55); c.fillStyle = "#F6F4EC"; if (r.back >= 16) c.fillText(`백 ${r.back}%`, bx + fw + (bw - fw) / 2, by + 55);
      }, "포백테스트.png")
    },
    ftMCard() {
      const M = S.ftm, m = ftMatch(M.A, M.B), pr = M.pr || [];
      card((c, F) => {
        c.fillStyle = "#CFE67A"; c.font = `700 50px ${F}`; c.fillText(`${M.A.n} × ${M.B.n}`, 540, 310);
        c.fillStyle = "#F6F4EC"; c.font = `800 136px ${F}`; c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 24; c.fillText(m.combo.n, 540, 470); c.shadowBlur = 0;
        c.font = `700 46px ${F}`; let y = wrap(c, `“${m.combo.one}”`, 540, 566, 940, 60) + 10;
        const top = y, L = m.prom.map((p, i) => [p.k, pr[i] != null ? p.o[pr[i]] : "아직 안 정함"]), bh = 92 + L.length * 64;
        rrect(c, 150, top, 780, bh, 28); c.fillStyle = "rgba(10,40,24,.38)"; c.fill(); c.strokeStyle = "rgba(200,230,120,.45)"; c.lineWidth = 2; c.stroke();
        c.fillStyle = "#CFE67A"; c.font = `700 36px ${F}`; c.fillText("우리의 약속", 540, top + 58); c.textAlign = "left";
        L.forEach(([k, v], i) => { const yy = top + 124 + i * 64; c.fillStyle = "rgba(221,239,168,.85)"; c.font = `600 32px ${F}`; c.fillText(k, 196, yy); c.fillStyle = "#F6F4EC"; c.textAlign = "right"; let fs = 34; c.font = `600 ${fs}px ${F}`; while (c.measureText(v).width > 440 && fs > 24) { fs -= 2; c.font = `600 ${fs}px ${F}` } c.fillText(v, 884, yy); c.textAlign = "left" }); c.textAlign = "center";
      }, "포백궁합.png")
    },
    async ftSave() { await X.login() },
    ftHome() { X.home() },
    ftView(el) { const x = mine().find(r => String(r.at) === el.dataset.x); if (x) { S.ftFrom = "ftMy"; S.ftr = { ...x, n: myName() }; resetFt(); go("ftRes") } },
    ftCView(el) { const x = comps().find(r => String(r.at) === el.dataset.x); if (x) { S.ftm = { ...x, role: "A" }; S.ftFrom = "ftMy"; go("ftMatch") } },
    ftImgX() { S.ftImg = null; rr() }
  };
  const FB = {
    ftStart: () => exit(), ftQ: () => FA.ftPrev(), ftLoad: () => { }, ftRes: () => exit(), ftWait: () => go("ftRes"),
    ftMatch: () => { if (S.ftFrom === "ftMy") go("ftMy"); else if (S.ftr && S.ftr.fresh) go("ftRes"); else exit() }, ftMy: () => X.toP()
  };
  // 링크로 들어왔을 때: ?ft=초대(테스트 시작) / ?fr=결과 돌려받기(궁합). 처리했으면 true
  function pending() {
    let t = null, f = null; try { t = sessionStorage.getItem("cm_ft"); f = sessionStorage.getItem("cm_fr"); sessionStorage.removeItem("cm_ft"); sessionStorage.removeItem("cm_fr") } catch (e) { }
    if (f) { const r = ftReturn(f); if (r) { S.ftFrom = S.user && S.profile ? "mode" : "login"; openMatch(r.A, r.B, "A"); return true } }
    if (t) { const I = ftInvite(t); if (I) { S.ftFrom = S.user && S.profile ? "mode" : "login"; resetFt(I); go("ftStart"); return true } }
    return false;
  }
  const isFt = s => /^ft[A-Z]/.test(s || "");
  const banner = () => { const L = latest(); if (!L) return `<div class="card tap ftban" data-a="ftOpen" data-v="new"><div><b>포백 테스트</b><div class="sub">나는 포잡이? 백잡이?</div></div><span class="sub">›</span></div>`; const r = ftScore(L.h, L.a); return `<div class="card tap ftban" data-a="ftOpen"><div><b>내 유형: ${r.type.n}</b><div class="sub">파트너와 궁합 보기 →</div></div></div>` };
  const pcard = () => { const L = latest(), r = L && ftScore(L.h, L.a); return `<div class="card row tap" data-a="ftMyOpen" style="padding:12px 14px"><div><b>내 복식 성향</b><div class="sub">${r ? `${r.type.n} · ${POSN[r.pos]} · ${STYN[r.sty]}` : "포백 테스트로 내 자리 찾기"}</div></div><span class="sub">›</span></div>` };
  return { V: FV, A: FA, BACK: FB, pending, isFt, banner, pcard, sync };
}
