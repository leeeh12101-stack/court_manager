// 포백 테스트 화면 — app.js에서 ftInstall(도구)로 연결해요. 문구는 ft-data.js, 계산은 ft-core.js
// 화면: ftStart 시작 · ftQ 문항 · ftLoad 분석 중 · ftRes 결과 · ftWait 궁합 대기 · ftMatch 궁합 · ftMy 내 복식 성향
import { FQ, EQ, EASY, START, STRAT, SHOT_O, SHOT_ST, FT_LOADING, POSN, STYN, COVN, COVTAG, TIP_HESITATE, TIP_MIXED, FT_NOTE, SEATN, REAL, CAYER, AGREE, SHOT_GROUPS, REAL2, AN_CHIP, SHOT_NM } from "./ft-data.js";
import { FT_KEYS, EASY_KEYS, ftTeam, SPOTS, isFore, ftUp, ftCayer, ftValid, ftScore, ftPartners, ftReason, ftSeatLabel, ftAnalysis, ftReal, ftMatch, b64e, ftInvite, ftReturn } from "./ft-core.js";

export function ftInstall(X) {
  const { S, go, esc, toast, pop, askText } = X;
  const rr = () => { S.still = 1; X.render(); S.still = 0 };
  // ---------- 저장: 먼저 폰(localStorage), 로그인하면 users 문서의 ft(내 결과)·ftc(궁합) 항목에 최근 5개
  const LS = "cm_ft", ld = () => { try { return JSON.parse(localStorage.getItem(LS) || "{}") } catch (e) { return {} } }, sv = o => { try { localStorage.setItem(LS, JSON.stringify(o)) } catch (e) { } };
  const okR = x => x && x.at && ftValid(x.h, x.a), okC = x => x && x.at && x.A && x.B && ftValid(x.A.h, x.A.a) && ftValid(x.B.h, x.B.a);
  const uniq = (L, ok) => { const m = {}; L.forEach(x => { if (ok(x)) m[x.at] = { ...(m[x.at] || {}), ...x } }); return Object.values(m).sort((a, b) => b.at - a.at).slice(0, 5) };
  const upR = x => x && { ...x, a: ftUp(x.a) }, upC = x => x && { ...x, A: x.A && { ...x.A, a: ftUp(x.A.a) }, B: x.B && { ...x.B, a: ftUp(x.B.a) } }; // 예전 결과(v1)를 v2로
  const mine = () => uniq([...(ld().r || []), ...((S.profile && S.profile.ft) || [])].map(upR), okR);
  const comps = () => uniq([...(ld().c || []), ...((S.profile && S.profile.ftc) || [])].map(upC), okC);
  const myName = () => (S.profile && S.profile.name ? String(S.profile.name).slice(0, 10) : "") || ld().nick || "";
  function keepLocal(k, rec, ok) { const o = ld(); o[k] = uniq([rec, ...(o[k] || [])], ok); sv(o); sync() }
  async function sync() {
    if (!S.user || !S.profile) return;
    const r = mine(), c = comps(), same = (a, b) => JSON.stringify(a || []) === JSON.stringify(b || []);
    if (same(r, S.profile.ft) && same(c, S.profile.ftc)) return;
    try { await X.saveUser({ ft: r, ftc: c }); S.profile.ft = r; S.profile.ftc = c } catch (e) { }
  }
  const latest = () => mine()[0] || null;
  const base = () => location.origin + location.pathname, gen = () => Array.from({ length: 8 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.random() * 32 | 0]).join("");
  const invText = (n, link) => `[포백 테스트] ${n}님이 복식 궁합을 보자고 해요!\n나는 포잡이? 백잡이? 테스트하고 둘의 궁합을 확인해 보세요\n${link}`;
  const url = (k, o) => `${location.origin}${location.pathname}?${k}=${b64e(o)}`;
  async function share(t, okMsg) { try { if (navigator.share) { await navigator.share({ text: t }); return } await navigator.clipboard.writeText(t); toast(okMsg || "링크를 복사했어요. 카톡에 붙여넣어 주세요") } catch (e) { } }

  // ---------- 그림: 하프 코트 타점 지도(뒤에서 본 시점, 네트가 위, 왼쪽 백·오른쪽 포)
  const PREF = { F: "포 선호", B: "백 선호", X: "유연" }, tags = r => `<div class="fttags"><span class="pill">${PREF[r.pos]}</span><span class="pill">${STYN[r.sty]}형</span><span class="pill">${COVTAG[r.cov]}</span></div>`;
  const ratio = r => `<div class="ftbar"><span style="width:${r.fore}%"></span><span style="width:${r.back}%"></span></div>`;

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
  // 결과: 유형 → 포·백(추천 자리·이유) → 샷 → 핵심 3줄. 자세한 설명·자리별 표는 '더 보기'에 접어 둠
  const IC = { 1: '<span class="ftic ok">✓</span>', 0: '<span class="ftic">–</span>', "-1": '<span class="ftic warn">◎</span>' };
  const shotNm = k => ("efgh".includes(k) ? (isFore(k) ? "포발리" : "백발리") : (isFore(k) ? "포핸드" : "백핸드"));
  // 결과: ① 핵심 요약(유형·포백 선호·추천 자리) ② 플레이 분석(자리별 4칸) ③ 플레이 스타일(접힘)
  const ST = v => SHOT_ST[String(v)], icon = v => IC[v > 0 ? 1 : v < 0 ? -1 : 0];
  // 작은 코트 아이콘: 해당 자리에 점, 공이 오는 방향 화살표(바깥/센터). 네트가 위, 왼쪽이 백(애드)
  function mini(sp, w) {
    const x = sp[0] === "F" ? 29 : 11, y = sp[1] === "N" ? 16 : 40, side = (sp[0] === "F") === (w === "out") ? 1 : -1, tx = x + side * 7;
    return `<svg width="46" height="52" viewBox="0 0 40 46" aria-hidden="true" style="flex:none"><rect x="2" y="5" width="36" height="38" fill="#DCE6CF" stroke="#fff" stroke-width="1.5"/><line x1="2" y1="25" x2="38" y2="25" stroke="#fff" stroke-width="1.2"/><line x1="20" y1="5" x2="20" y2="25" stroke="#fff" stroke-width="1.2"/><line x1="0" y1="5" x2="40" y2="5" stroke="#5C635F" stroke-width="2.5"/><line x1="20" y1="0" x2="${tx}" y2="${y - 2}" stroke="#5E8A1E" stroke-width="2.4" stroke-dasharray="3.5 2"/><circle cx="${tx}" cy="${y - 2}" r="3.4" fill="#D4E83A" stroke="#5E8A1E"/><circle cx="${x}" cy="${y}" r="4.2" fill="#174A43"/></svg>`;
  }
  const ball = () => `<svg width="140" height="84" viewBox="0 0 140 84" aria-hidden="true" style="display:block;margin:16px auto 8px"><ellipse cx="70" cy="76" rx="26" ry="4" fill="#E3E8DC"/><circle cx="70" cy="36" r="30" fill="#C9DE45"/><path d="M48 14 A30 30 0 0 1 48 58" fill="none" stroke="#fff" stroke-width="3.5"/><path d="M92 14 A30 30 0 0 0 92 58" fill="none" stroke="#fff" stroke-width="3.5"/><g stroke="#C9DE45" stroke-width="4" stroke-linecap="round"><line x1="22" y1="22" x2="30" y2="28"/><line x1="16" y1="38" x2="27" y2="38"/><line x1="22" y1="54" x2="30" y2="48"/><line x1="118" y1="22" x2="110" y2="28"/><line x1="124" y1="38" x2="113" y2="38"/><line x1="118" y1="54" x2="110" y2="48"/></g></svg>`;
  // 쉬운 버전 '리턴할 때 편한 쪽' 그림: 뒤에서 본 코트, 왼쪽 애드 · 오른쪽 듀스
  const sidePic = () => `<div class="card" style="padding:10px 12px"><svg viewBox="0 0 300 150" width="100%" aria-hidden="true"><rect x="40" y="18" width="220" height="110" fill="#DCE6CF"/><g stroke="#fff" stroke-width="2" fill="none"><rect x="40" y="18" width="220" height="110"/><line x1="40" y1="70" x2="260" y2="70"/><line x1="150" y1="18" x2="150" y2="70"/></g><line x1="30" y1="18" x2="270" y2="18" stroke="#5C635F" stroke-width="3"/><text x="150" y="12" font-size="10" text-anchor="middle" fill="#5C635F">네트</text><circle cx="95" cy="138" r="7" fill="#2B6650"/><circle cx="205" cy="138" r="7" fill="#174A43"/><text x="95" y="112" font-size="13" font-weight="700" text-anchor="middle" fill="#174A43">왼쪽</text><text x="95" y="127" font-size="11" text-anchor="middle" fill="#5C635F">애드 · 백 자리</text><text x="205" y="112" font-size="13" font-weight="700" text-anchor="middle" fill="#174A43">오른쪽</text><text x="205" y="127" font-size="11" text-anchor="middle" fill="#5C635F">듀스 · 포 자리</text></svg><div class="sub center" style="font-size:12px">내가 리턴하려고 서는 자리 (코트 뒤에서 본 모습)</div></div>`;
  function summary(R, rec) {
    const r = ftScore(R.h, R.a), T = r.type, lab = ftSeatLabel(r);
    return `<div class="card ftsum"><div class="sub">${rec ? "나의 복식 캐릭터" : esc(R.n || "") + "님의 복식 캐릭터"} · ${r.h === "R" ? "오른손" : "왼손"}${r.easy ? ` · <span style="color:var(--main);font-weight:700">${EASY.badge}</span>` : ""}</div><div class="fthero">${T.n}</div><div class="ftone">${esc(T.one)}</div>${tags(r)}
<div class="ftsec"><div class="row"><span class="ftlab" style="margin:0">포·백 선호도</span><span class="sub">설문 결과</span></div><div class="row ftpct"><span>포 ${r.fore}%</span><span>백 ${r.back}%</span></div>${ratio(r)}<div class="sub" style="margin-top:6px">실제 경기 성적이 아닌 상대적 선호도예요.</div></div>
<div class="ftsec"><span class="ftlab">${lab}</span><div class="ftsn" style="font-size:18px">${SEATN[r.pos]}</div><div class="sub" style="margin-top:2px">${esc(ftReason(r))}</div></div></div>`;
  }
  function detail(R) {
    const r = ftScore(R.h, R.a), T = r.type, an = ftAnalysis(r), tips = [r.flags.hesitate ? TIP_HESITATE : "", r.flags.mixed ? TIP_MIXED : ""].filter(Boolean);
    const NM = { BN: "백 전위", FN: "포 전위", BB: "백 후위", FB: "포 후위" };
    const cell = s => { const sp = SPOTS[r.h][s], rc = r.pos !== "X" && s[0] === r.pos, L = [["바깥", sp.out], ["센터", sp.cen]].sort((x, y) => r.shots[y[1]] - r.shots[x[1]]);
      return `<div class="ftcell${rc ? " rec" : ""}"><b class="ftch">${NM[s]}${rc ? " · " + (ftSeatLabel(r) === "추천 자리" ? "추천" : "선호") : ""}</b>${L.map(([w, k]) => `<div class="ftshot">${icon(r.shots[k])}<div><div class="ftsn">${w} ${shotNm(k)}</div><div class="sub">${ST(r.shots[k])}</div></div></div>`).join("")}</div>` };
    const rr2 = X.realRec(), real = rr2.st === "nologin" ? REAL.noLogin : rr2.st === "loading" ? REAL.loading : null, rv = real ? null : ftReal(r, rr2);
    const pct = o => o.w + o.l ? Math.round(o.w / (o.w + o.l) * 100) + "%" : "–", wl = o => `${o.w}승${o.d ? ` ${o.d}무` : ""} ${o.l}패`;
    const tile = (lab, o, on) => `<div class="${on ? "on" : ""}"><span class="sub">${lab}</span>${o.g ? `<b>${pct(o)}</b><span class="sub">${wl(o)}</span>` : `<b class="none">${REAL2.none}</b><span class="sub">0경기</span>`}</div>`;
    let rmsg = "";
    if (!real) { const fF = rr2.fore.g < 3, fB = rr2.back.g < 3; rmsg = fF || fB ? `<div class="ftsn" style="margin-top:12px">${fF && fB ? REAL2.both : REAL2.head.replace("{S}", fF ? "포" : "백")}</div><div class="sub" style="margin-top:2px">${REAL2.sub.replace("{F}", rr2.fore.g).replace("{B}", rr2.back.g)}</div>` : `<div class="ftsn" style="margin-top:12px">${esc(rv.text)}</div>` }
    const weak = an.rows[3][2], wkH = Object.values(SHOT_NM).reduce((t, n) => t.split(n).join(`<b>${n}</b>`), esc(weak));
    const strat = `<div class="card"><span class="ftlab">내 유형 맞춤 전략</span>${STRAT.k.map(([k, t]) => `<div class="anrow"><div><b style="font-size:15px">${t}</b></div><div>${esc(STRAT[r.sty][k])}</div></div>`).join("")}</div>`;
    const realC = `<div class="card"><div class="row"><span class="ftlab" style="margin:0">실전 기록 비교</span><span class="sub" style="font-size:12px">${REAL2.basis}</span></div>${real ? `<div class="sub" style="margin-top:8px">${real}</div>` : `<div class="ftreal">${tile("포 자리", rr2.fore, rv.better === "F")}${tile("백 자리", rr2.back, rv.better === "B")}</div>${rmsg}`}</div>`;
    const style = `<details class="card sd ftmore"><summary><b>플레이 스타일</b></summary><div class="ftstyle">${ftCayer(r) ? `<div class="sub">${CAYER.line.replace("{S}", `<b style="color:var(--main)">${CAYER[ftCayer(r)]}</b>`)}</div>` : ""}${tips.map(t => `<div class="fttip">${esc(t)}</div>`).join("")}${[["이럴 때 당신답다", T.moment], ["무기", T.weapon], ["이것만 조심", T.careful], ["다음 경기 미션", T.mission], ["파트너에게 들을 법한 말", `"${T.quote}"`]].map(([k, v]) => `<div><span class="ftlab">${k}</span><div>${esc(v)}</div></div>`).join("")}</div></details>`;
    if (r.easy) return `<h2>내 플레이</h2><div class="card"><span class="ftlab">포핸드·백핸드</span><b style="color:var(--main)">${EASY.stroke[r.ek < 2 ? "fore" : r.ek === 3 ? "back" : "even"]}</b><div class="sub" style="margin-top:10px">${EASY.moreSub}</div><button class="ghost sm" data-a="ftDetail" style="margin-top:10px">${EASY.more} ›</button></div>${strat}${realC}${style}`;
    return `<h2>플레이 분석</h2><div class="card ftan"><div class="fttags" style="margin-bottom:4px">${an.rows.slice(0, 3).map(x => `<span class="pill">${AN_CHIP[x[1]] || x[1]}</span>`).join("")}</div>
${an.rows.slice(0, 3).map(([k, v, tip]) => `<div class="anrow"><div><span class="ftlab">${k}</span><b>${v}</b></div><div class="sub">${esc(tip)}</div></div>`).join("")}
<div class="ftwarn${an.rows[3][2].includes("없어요") ? " ok" : ""}"><span class="ftlab">${an.rows[3][0]}</span><div>${wkH}</div></div></div>
${strat}${realC}
<details class="card sd ftmore"><summary><b>자리별 샷 자신감 보기</b></summary><div class="ftgrid" style="margin-top:8px">${["BN", "FN", "BB", "FB"].map(cell).join("")}</div></details>
${style}`;
  }
  const pairsLine = r => `<div class="sub">잘 맞는 파트너 유형</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${ftPartners(r).map(p => `<span class="pill">${p.n} <span style="font-weight:400">${POSN[p.key[0]]}·${STYN[p.key.slice(2)]}</span></span>`).join("")}</div>`;
  const loginBtn = () => !S.user ? `<button class="ghost" data-a="ftSave">로그인해 저장</button>` : "";
  const FV = {
    ftStart: () => { const I = S.ft && S.ft.inv; return `${back(I ? "닫기" : "뒤로")}${kakao()}<div class="ftstart center"><div class="ftbrand">${START.tag}</div>${ball()}<h1>${START.title}</h1><div class="ftlines">${START.lines.map(l => `<div>${l}</div>`).join("")}</div><div class="ftchips">${START.chips.map(c => `<span>${c}</span>`).join("")}</div>
${I ? `<div class="card" style="text-align:left;background:var(--tint);box-shadow:none;margin:16px 0 0"><b>${esc(I.n || "파트너")}님이 복식 궁합을 보자고 해요</b><div class="sub">테스트를 마치면 둘의 궁합이 바로 열려요</div><input id="ftn" maxlength="10" value="${esc(S.ft.nick || myName())}" placeholder="내 이름 (궁합에 보여요)" style="margin:10px 0 0"></div>` : ""}
<button data-a="ftGo" data-v="d" class="ftcta">${START.cta} →</button><button data-a="ftGo" data-v="e" class="ftcta2">${START.easy} →</button><div class="sub" style="margin-top:12px">${START.sub}</div>
<div class="ftrule"></div><div class="sub ftnote">${START.note}</div></div>` },
    ftQ: () => {
      const QS = qs(), st = S.ft.step, q = QS[st], A = S.ft.a, n = QS.length;
      let body;
      if (q.rows) { const G = SHOT_GROUPS[q.id], hd = S.ft.h || "R", ks = G.g.flatMap(([sp]) => [SPOTS[hd][sp].out, SPOTS[hd][sp].cen]);
        const line = (k, t, sp, w) => `<div class="ftq5"><div class="row" style="justify-content:flex-start;gap:8px;margin-bottom:8px">${mini(sp, w)}<div style="font-weight:600">${t} <span class="sub">(${shotNm(k)})</span></div></div><div style="display:flex;gap:6px">${SHOT_O.map((o, i) => `<span class="ftchip ftc5${A[k] === i ? " on" : ""}" data-a="ftShot" data-x="${k}" data-v="${i}">${o}</span>`).join("")}</div></div>`;
        body = `${G.g.map(([sp, t]) => `<div class="card" style="padding:12px 14px"><div class="ftlab" style="color:var(--main);font-size:14px">${t}</div>${line(SPOTS[hd][sp].out, G.out, sp, "out")}${line(SPOTS[hd][sp].cen, G.cen, sp, "cen")}</div>`).join("")}<div class="bar"><button data-a="ftNext" ${ks.every(k => A[k] != null) ? "" : "disabled"}>다음</button></div>` }
      else { const sel = q.id === "hand" ? (S.ft.h === "R" ? 0 : S.ft.h === "L" ? 1 : -1) : A[q.id]; body = q.o.map((t, i) => `<div class="card tap ftopt${sel === i ? " on" : ""}" data-a="ftAns" data-v="${i}">${esc(t)}</div>`).join("") }
      return `<button class="link bk" data-a="ftPrev"><span class="ar">←</span> ${st ? "이전" : "나가기"}</button><div class="row" style="margin:4px 0 6px"><span class="sub">${st + 1} / ${n}</span></div><div class="ftprog"><span style="width:${(st + 1) / n * 100}%"></span></div>
${q.pre ? `<div class="card center" style="background:var(--tint);box-shadow:none;padding:10px 12px;margin-top:12px;color:var(--main);font-weight:600">${esc(q.pre)}</div>` : ""}<h1 style="font-size:21px;margin:14px 0 14px;line-height:1.4">${esc(q.t)}</h1>${q.pic ? sidePic() : ""}${body}`
    },
    ftLoad: () => `<div class="mid center"><div class="spin"></div><p class="hi" style="margin-top:18px">${FT_LOADING}</p></div>`,
    ftRes: () => {
      const R = S.ftr, I = S.ft && S.ft.inv && S.ftr.fresh;
      return `<div class="row" style="margin-bottom:4px"><button class="link bk" data-a="ftBack" style="margin:0"><span class="ar">←</span> 뒤로</button><span class="ftbrand">COURT MANAGER</span></div>${kakao()}${summary(R, 1)}
${I ? `<button data-a="ftMatchGo">${esc(I.n || "파트너")}님과 궁합 보기</button>` : `<button data-a="ftInv">파트너와 궁합 보기</button>`}<button class="ghost" data-a="ftCard">결과 카드 저장</button>${!S.user ? `<button class="link" data-a="ftSave" style="display:block;margin:6px auto 0">로그인해 저장</button>` : ""}
<div class="sub center" style="margin:10px 0 4px">${ftScore(R.h, R.a).easy ? "아래에서 내 플레이와 맞춤 전략을 확인할 수 있어요." : "아래에서 샷 자신감과 상세 플레이 분석을 확인할 수 있어요."}</div>${detail(R)}
<button class="link" data-a="ftMyOpen" style="display:block;margin:6px auto 0">다시 하기 · 지난 결과</button>${!S.user ? `<button class="link" data-a="ftHome" style="display:block;margin:0 auto">Court Manager 둘러보기</button>` : ""}<div class="sub center" style="margin:12px 0 24px;font-size:12px">${FT_NOTE}</div>${imgSheet()}` },
    ftWait: () => `${back("결과로")}<div class="mid center"><h1>궁합 대기 중</h1><p class="hi">파트너가 테스트를 마치면 궁합이 열립니다</p><div class="card" style="text-align:left;background:var(--tint);box-shadow:none"><div class="sub">파트너가 결과 화면에서 '궁합 결과 보내기'를 누르면, 받은 링크로 둘의 궁합을 볼 수 있어요.</div></div><div class="card" style="text-align:left">${pairsLine(ftScore(S.ftr.h, S.ftr.a))}</div></div><div class="bar"><button data-a="ftInvAgain">링크 다시 보내기</button></div>`,
    ftMatch: () => {
      const M = S.ftm, m = ftMatch(M.A, M.B), na = M.A.n || "A", nb = M.B.n || "B", N = [na, nb], R = [m.ra, m.rb];
      const tcard = (n, r) => `<div class="card center" style="flex:1;min-width:0;margin:0;padding:12px 8px"><div class="sub" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(n)}</div><b style="font-size:19px;color:var(--main)">${r.type.n}</b><div class="sub" style="font-size:12px">${POSN[r.pos]} · ${STYN[r.sty]} · ${COVTAG[r.cov]}</div></div>`;
      const cline = (i, s) => { const k = SPOTS[R[i].h][s].cen, v = R[i].shots[k]; return `<div class="ftshot">${icon(v)}<div><div class="ftlab">${esc(N[i])}님 · ${s === "FB" ? "포" : "백"} 자리의 센터 쪽</div><div><b>${isFore(k) ? "포핸드" : "백핸드"}</b> <span class="sub">${ST(v)}</span></div></div></div>` };
      const map = cline(m.fore, "FB") + cline(m.back, "BB");
      const pr = M.pr || [];
      return `${back()}${kakao()}<h1 class="center">${esc(na)} × ${esc(nb)}</h1><div class="row" style="gap:8px;align-items:stretch;margin:10px 0 12px">${tcard(na, m.ra)}${tcard(nb, m.rb)}</div>
<div class="card hero center" style="padding:18px"><div class="sub">우리 조합</div><div style="font-size:28px;font-weight:800">${m.combo.n}</div><div>"${m.combo.one}"</div></div>
<div class="list">${sec("잘 맞는 점", m.combo.good)}${sec("주의할 점", m.combo.bad)}</div>
<h2>추천 자리</h2><div class="card">${esc(m.seat)}</div>
<h2>우리 팀 전략</h2><div class="card">${(() => { const t = ftTeam(m); return `<span class="ftlab">기본 포메이션</span><b style="color:var(--main)">${t.form[0]}</b><div class="sub" style="margin-top:2px">${t.form[1]}</div><div class="anrow"><div><b style="font-size:15px">서브 게임</b></div><div>${esc(t.serve)}</div></div><div class="anrow"><div><b style="font-size:15px">리턴 게임</b></div><div>${esc(t.ret)}</div></div>` })()}</div>
<h2>센터 담당</h2><div class="card">${map}<div style="margin-top:10px;font-weight:700">${esc(m.center)}</div>${m.lr ? `<div class="sub" style="margin-top:4px">${esc(m.lr)}</div>` : ""}</div>
${m.cautions.length ? `<h2>주의할 장면</h2>${m.cautions.map(c => `<div class="card" style="background:#FFF8E6;box-shadow:none;border:1px solid #F0D9A0;padding:12px 14px">${esc(c)}</div>`).join("")}` : ""}
<h2>우리 둘의 약속</h2><div class="sub" style="margin:-4px 2px 8px">${AGREE}</div>${m.prom.map((p, pi) => `<div class="card" style="padding:12px 14px"><b>${esc(p.q)}</b><div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">${p.o.map((o, oi) => `<span class="ftchip${pr[pi] === oi ? " on" : ""}" data-a="ftPick" data-x="${pi}" data-v="${oi}" style="text-align:left">${esc(o)}</span>`).join("")}</div></div>`).join("")}
<div class="card" style="margin-top:14px">${pairsLine(m.ra).replace("잘 맞는 파트너 유형", esc(na) + "님과 잘 맞는 유형")}<div style="height:10px"></div>${pairsLine(m.rb).replace("잘 맞는 파트너 유형", esc(nb) + "님과 잘 맞는 유형")}</div>
${M.role === "B" ? `<button data-a="ftSendBack">${esc(na)}님에게 궁합 결과 보내기</button>` : ""}<button class="${M.role === "B" ? "ghost" : ""}" data-a="ftMCard">궁합 카드 저장</button>${loginBtn()}${!S.user ? `<button class="link" data-a="ftHome" style="display:block;margin:8px auto 0">Court Manager 둘러보기</button>` : ""}
<div class="sub center" style="margin:16px 0 24px;font-size:12px">${FT_NOTE}</div>${imgSheet()}`
    },
    ftMy: () => {
      const L = mine(), C = comps(), d = at => { const x = new Date(at); return `${x.getMonth() + 1}.${String(x.getDate()).padStart(2, "0")}` };
      return `${back()}<h1>내 복식 성향</h1>${L.length ? (() => { const r = ftScore(L[0].h, L[0].a); return `<div class="card tap" data-a="ftView" data-x="${L[0].at}" style="padding:16px"><div class="row"><div><div class="sub">최근 결과 · ${d(L[0].at)}</div><b style="font-size:18px;color:var(--main)">내 플레이 분석 보기</b><div class="sub">${PREF[r.pos]} · ${r.fore >= r.back ? `포 ${r.fore}%` : `백 ${r.back}%`}</div></div><span class="sub">›</span></div></div><button data-a="ftInvMy">파트너와 궁합 보기</button>` })() : `<div class="card sub center">아직 테스트 결과가 없어요</div>`}<button class="ghost" data-a="ftNew">${L.length ? "다시 하기" : "테스트 시작"}</button>
${L.length > 1 ? `<h2>지난 결과</h2><div class="list">${L.slice(1).map(x => { const r = ftScore(x.h, x.a); return `<div class="li tap" data-a="ftView" data-x="${x.at}"><span class="sub" style="width:44px">${d(x.at)}</span><span class="nm">${PREF[r.pos]}</span><span class="sub">${r.fore >= r.back ? `포 ${r.fore}%` : `백 ${r.back}%`}</span></div>` }).join("")}</div>` : ""}
${C.length ? `<h2>궁합 기록</h2><div class="list">${C.map(x => { const m = ftMatch(x.A, x.B); return `<div class="li tap" data-a="ftCView" data-x="${x.at}"><span class="sub" style="width:44px">${d(x.at)}</span><span class="nm">${esc(x.A.n)} × ${esc(x.B.n)}</span><span class="sub">${m.combo.n}</span></div>` }).join("")}</div>` : ""}
${X.isDev() ? `<div class="sub center ftst" style="margin-top:16px">${S.ftStatsT || "테스트 통계 불러오는 중…"}</div>` : ""}`
    }
  };

  // ---------- 동작
  const qs = () => S.ft && S.ft.mode === "e" ? EQ : FQ;
  const resetFt = inv => { S.ft = { step: 0, h: null, a: {}, inv: inv || null, nick: "" } };
  function finish() {
    const a = (S.ft.mode === "e" ? EASY_KEYS : FT_KEYS).map(k => S.ft.a[k]);
    if (!ftValid(S.ft.h, a)) return pop("답하지 않은 문항이 있어요.");
    const rec = { at: Date.now(), h: S.ft.h, a };
    keepLocal("r", rec, okR); X.count(S.ft.mode === "e" ? "doneE" : "done"); if (S.ft.inv) X.count("invDone");
    S.ftr = { ...rec, n: S.ft.nick || myName(), fresh: 1 };
    if (S.ft.code) X.ftSetB(S.ft.code, { n: S.ftr.n || "파트너", h: rec.h, a: rec.a }).catch(() => { }); // 초대한 사람에게 자동으로 전달
    go("ftLoad"); setTimeout(() => { if (S.screen === "ftLoad") go("ftRes") }, 1000);
  }
  function openMatch(A, B, role, from) {
    const ex = comps().find(x => JSON.stringify([x.A, x.B]) === JSON.stringify([A, B]));
    S.ftm = ex ? { ...ex, role } : { at: Date.now(), A, B, pr: [], role }; S.ftFrom = from || S.ftFrom; if (role === "B" && S.ft && S.ft.code) S.ftm.code = S.ft.code;
    keepLocal("c", { at: S.ftm.at, A, B, pr: S.ftm.pr || [] }, okC); go("ftMatch");
  }
  async function invite(R) {
    let n = myName(); if (!n) { n = ((await askText("파트너에게 보일 내 이름(10자까지)", "")) || "").trim().slice(0, 10); if (!n) return; const o = ld(); o.nick = n; sv(o) }
    // 짧은 코드로 서버에 보관(실패하면 예전처럼 답을 담은 긴 링크)
    let code = null; try { code = gen(); await X.ftNew(code, { A: { n, h: R.h, a: R.a }, owner: S.user && S.profile ? S.user.uid : "", at: Date.now(), exp: Date.now() + 30 * 864e5 }); const o = ld(); o.inv = [{ code, at: Date.now() }, ...(o.inv || [])].slice(0, 10); sv(o) } catch (e) { code = null }
    S.ftr = { ...R, n, code }; X.count("inv");
    await share(invText(n, code ? base() + "?ft=" + code : url("ft", { v: 2, n, h: R.h, a: R.a })));
    go("ftWait");
  }
  function exit() { const f = S.ftFrom; if (f === "ftMy") go("ftMy"); else if (f === "personal") X.toP(); else X.home() }
  const FA = {
    ftOpen(el) { S.ftFrom = S.screen === "personal" ? "personal" : S.user && S.profile ? "mode" : "login"; const L = latest(); if (L && el.dataset.v !== "new") { S.ftr = { ...L, n: myName() }; resetFt(); go("ftRes") } else { resetFt(); go("ftStart") } },
    ftMyOpen() { if (S.ftFrom !== "ftMy") S.ftMyBack = S.ftFrom; S.ftFrom = "ftMy"; go("ftMy"); X.devStats() },
    ftNew() { if (S.screen === "ftMy") S.ftFrom = "ftMy"; resetFt(); go("ftStart") },
    ftGo(el) { S.ft.mode = el && el.dataset.v === "d" ? "d" : "e"; S.ft.a = {}; const i = document.getElementById("ftn"); if (i) { const n = i.value.trim().slice(0, 10); S.ft.nick = n; if (n && !S.profile) { const o = ld(); o.nick = n; sv(o) } } S.ft.step = 0; go("ftQ") },
    ftAns(el) { const QS = qs(), i = +el.dataset.v, q = QS[S.ft.step]; if (q.id === "hand") S.ft.h = i ? "L" : "R"; else S.ft.a[q.id] = i; rr(); setTimeout(() => { if (S.screen !== "ftQ") return; if (S.ft.step >= QS.length - 1) finish(); else { S.ft.step++; go("ftQ") } }, 160) },
    ftDetail() { resetFt(); S.ft.mode = "d"; S.ft.step = 0; go("ftQ") },
    ftShot(el) { S.ft.a[el.dataset.x] = +el.dataset.v; rr() },
    ftNext() { if (S.ft.step >= qs().length - 1) finish(); else { S.ft.step++; go("ftQ") } },
    ftPrev() { if (S.ft.step > 0) { S.ft.step--; go("ftQ") } else go("ftStart") },
    ftBack() { const f = FB[S.screen]; if (f) f() },
    async ftInv() { await invite(S.ftr) },
    async ftInvMy() { const L = latest(); if (L) { S.ftFrom = "ftMy"; await invite(L) } },
    async ftInvAgain() { const R = S.ftr; await share(invText(R.n, R.code ? base() + "?ft=" + R.code : url("ft", { v: 2, n: R.n, h: R.h, a: R.a }))) },
    ftMatchGo() { const I = S.ft.inv, R = S.ftr; openMatch(I, { n: R.n || "나", h: R.h, a: R.a }, "B") },
    async ftSendBack() { const M = S.ftm; await share(`[포백 테스트] ${M.B.n}님이 테스트를 마쳤어요! 우리 둘의 복식 궁합 보기\n${M.code ? base() + "?fc=" + M.code : url("fr", { v: 2, A: M.A, B: M.B })}`) },
    ftExtApp() { const u = new URL(S.ftLink); location.href = `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=https;package=io.github.leeeh12101_stack.courtmanager;S.browser_fallback_url=${encodeURIComponent(S.ftLink)};end` },
    ftExtBr() { location.href = "kakaotalk://web/openExternal?url=" + encodeURIComponent(S.ftLink) },
    ftPick(el) { const M = S.ftm, pi = +el.dataset.x, oi = +el.dataset.v, pr = [...(M.pr || [])]; pr[pi] = pr[pi] === oi ? null : oi; M.pr = pr; keepLocal("c", { at: M.at, A: M.A, B: M.B, pr }, okC); rr() },
    ftCard() {
      const r = ftScore(S.ftr.h, S.ftr.a), T = r.type;
      card((c, F) => {
        c.fillStyle = "#CFE67A"; c.font = `700 52px ${F}`; c.fillText("내 복식 성향", 540, 310);
        c.fillStyle = "#F6F4EC"; c.font = `800 ${T.n.length > 3 ? 150 : 176}px ${F}`; c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 24; c.fillText(T.n, 540, 492); c.shadowBlur = 0;
        c.font = `700 ${T.one.length > 18 ? 42 : 50}px ${F}`; let y = wrap(c, `“${T.one}”`, 540, 590, 940, 62);
        pills(c, F, [{ F: "포 선호", B: "백 선호", X: "유연" }[r.pos], STYN[r.sty] + "형", COVTAG[r.cov]], y + 14);
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
    ftMatch: () => { if (S.ftFrom === "ftMy") go("ftMy"); else if (S.ftr && S.ftr.fresh) go("ftRes"); else exit() }, ftMy: () => { S.ftFrom = S.ftMyBack; exit() }
  };
  // 링크로 들어왔을 때: ?ft=초대(짧은 코드 또는 예전 긴 링크) / ?fc=궁합 결과(짧은 코드) / ?fr=예전 긴 결과 링크. 처리했으면 true
  const person = x => x && ftValid(x.h, x.a) ? { n: String(x.n || "").slice(0, 10), h: x.h, a: x.a.slice() } : null;
  async function pending() {
    let t = null, f = null, c = null; try { t = sessionStorage.getItem("cm_ft"); f = sessionStorage.getItem("cm_fr"); c = sessionStorage.getItem("cm_fc");["cm_ft", "cm_fr", "cm_fc"].forEach(k => sessionStorage.removeItem(k)) } catch (e) { }
    const from = S.user && S.profile ? "mode" : "login";
    if (c) { c = c.toUpperCase(); S.ftLink = base() + "?fc=" + c; const d = await X.ftGet(c).catch(() => null), A = d && person(d.A), B = d && person(d.B);
      if (A && B) { S.ftFrom = from; got(c); openMatch(A, B, "A"); return true } pop(d ? "아직 파트너가 테스트를 마치지 않았어요." : "링크가 만료됐거나 올바르지 않아요."); return false }
    if (f) { const r = ftReturn(f); if (r) { S.ftFrom = from; openMatch(r.A, r.B, "A"); return true } }
    if (t && /^[A-Za-z0-9]{8}$/.test(t)) { t = t.toUpperCase(); S.ftLink = base() + "?ft=" + t; const d = await X.ftGet(t).catch(() => null), A = d && (d.exp || 0) > Date.now() && person(d.A);
      if (A) { S.ftFrom = from; resetFt(A); S.ft.code = t; go("ftStart"); return true } pop("초대 링크가 만료됐거나 올바르지 않아요."); return false }
    if (t) { const I = ftInvite(t); if (I) { S.ftFrom = from; resetFt(I); go("ftStart"); return true } }
    return false;
  }
  // 앱을 열 때: 내가 보낸 초대에 파트너 결과가 도착했으면 궁합 기록에 저장하고 알림
  const got = c => { const o = ld(); o.got = [...new Set([...(o.got || []), c])].slice(-50); o.inv = (o.inv || []).filter(x => x.code !== c); sv(o) };
  async function checkInv() {
    try {
      const o = ld(), seen = new Set(o.got || []), L = S.user && S.profile ? await X.ftMine().catch(() => []) : [];
      for (const x of o.inv || []) if (!L.some(y => y.code === x.code)) { const d = await X.ftGet(x.code).catch(() => null); if (d) L.push({ code: x.code, ...d }) }
      const fresh = L.filter(d => d.B && !seen.has(d.code) && person(d.A) && person(d.B)); if (!fresh.length) return;
      fresh.forEach(d => { keepLocal("c", { at: d.bAt || Date.now(), A: person(d.A), B: person(d.B), pr: [] }, okC); got(d.code) });
      const d = fresh[0]; toast(`${person(d.B).n || "파트너"}님이 궁합 결과를 보냈어요`, "보기", () => { S.ftFrom = S.user && S.profile ? "mode" : "login"; openMatch(person(d.A), person(d.B), "A") });
    } catch (e) { }
  }
  // 카카오톡 안의 브라우저에서는 저장이 앱에 남지 않아요 → 앱(또는 다른 브라우저)으로 열기
  const kakao = () => S.ftLink && /KAKAOTALK/i.test(navigator.userAgent) ? `<div class="card" style="background:#FFF8E6;box-shadow:none;border:1px solid #F0D9A0;padding:12px 14px"><b>카카오톡 안에서는 결과가 앱에 저장되지 않아요</b><div class="row" style="gap:8px;margin-top:8px">${/Android/i.test(navigator.userAgent) ? '<button class="sm" data-a="ftExtApp" style="margin:0">앱에서 열기</button>' : ""}<button class="sm ghost" data-a="ftExtBr" style="margin:0">다른 브라우저로 열기</button></div></div>` : "";
  const isFt = s => /^ft[A-Z]/.test(s || "");
  const banner = () => latest() ? `<div class="card tap ftban" data-a="ftOpen"><div><b>내 복식 캐릭터</b><div class="sub">내 복식 캐릭터 보기 →</div></div></div>` : `<div class="card tap ftban" data-a="ftOpen" data-v="new"><div><b>포백 테스트</b><div class="sub">코트 위에서 나는 어떤 타입일까?</div></div><span class="sub">›</span></div>`;
  return { V: FV, A: FA, BACK: FB, pending, checkInv, isFt, banner, sync };
}
