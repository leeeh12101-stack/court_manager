// 포백 테스트 계산 자동 테스트 — 실행: node tests/ft.test.mjs (저장소 루트에서)
import * as F from "../ft-core.js";
// 예전(v1) 17칸 답으로 적은 사례를 v2로 옮겨서 계산(샷 0→매우 자신, 1→보통, 2→매우 부담, 역할 응답 없음)
const sc = (h, a) => F.ftScore(h, F.ftUp(a));

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) pass++; else { fail++; console.log(`✗ ${name}\n   기대: ${w}\n   실제: ${g}`); }
};
// 답 순서: q2 q3 q4 | a b c d | e f g h | q6 q7 q8 q9 q10 q11
const A = [1, 1, 0, 1, 0, 0, 2, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0];

// ---------- 기획서 검증 사례
const ra = sc("R", A);
eq("사례 A(v2 가중치): 위치 점수·판정·백 %", [ra.P, ra.pos, ra.back], [8.25, "B", 76]);
eq("사례 A: 운영 표·결과", [ra.votes, ra.sty], [{ lead: 4, link: 1, safe: 0 }, "lead"]);
eq("사례 A: 커버", [ra.C, ra.cov], [4, "act"]);
eq("사례 A: 유형 해결사", ra.type.n, "해결사");
const rb = sc("L", A);
eq("사례 B(왼손): P 1.75 → 유연 · 조커", [rb.P, rb.pos, rb.type.n], [1.75, "X", "조커"]);
const C = A.slice(); C.splice(12, 5, 0, 2, 0, 2, 1);
const rc = sc("R", C);
eq("사례 C: 주도 2·안정 2, 7번 주도 → 주도", [rc.votes, rc.sty], [{ lead: 2, link: 0, safe: 2 }, "lead"]);
eq("사례 C: 쭈뼛 표시·전략형 표시", [rc.flags.hesitate, rc.flags.mixed], [true, true]);
const D = A.slice(); D.splice(12, 5, 1, 0, 2, 0, 2);
const rd = sc("R", D);
eq("사례 D: 주도 2·안정 2·연결 1, 7번 연결 → 연결", [rd.votes, rd.sty, rd.flags.mixed], [{ lead: 2, link: 1, safe: 2 }, "link", true]);
eq("연결이 공동 1위에 있으면 연결", sc("R", [1, 1, 0, 1, 0, 0, 2, 1, 1, 1, 1, 0, 0, 1, 2, 1, 2]).sty, "link");

// ---------- 결과 화면용 문구
eq("사례 A: 마음 +5 · 샷 +3.25(바깥 1.25·센터 1·발리 0.75)", [ra.mind, ra.shotP], [5, 3.25]);
eq("사례 A: 편한 샷·연습할 샷", F.ftShots(ra), { good: ["리시브 바깥 백핸드", "리시브 센터 포핸드"], weak: ["리시브 센터 백핸드"] });
eq("사례 A: 이유(둘 다 백)", F.ftReason(ra), "평소 백 자리가 편하고, 백 자리 샷도 더 자신 있게 나왔어요.");
eq("사례 B(왼손): 마음 백·샷 포 → 유연", F.ftReason(rb), "마음은 백 쪽, 샷은 포 쪽이라 어느 자리든 맞출 수 있어요.");
const SW = [1, 1, 2, 0, 2, 2, 0, 0, 2, 2, 0, 0, 0, 0, 0, 1, 0]; // 마음 +1(백 쪽), 샷은 포 쪽이 압도
const rsw = sc("R", SW);
eq("백을 좋아해도 샷이 포면 포 + 이유", [rsw.pos, F.ftReason(rsw)], ["F", "백 자리를 좋아하는 편이지만, 포 자리 샷이 훨씬 편하게 나왔어요."]);

// ---------- 플레이 분석·자리 표시·실전 비교
eq("사례 A: 분석 판정", (({ zone, hand, dir }) => ({ zone, hand, dir }))(F.ftAnalysis(ra)), { zone: "even", hand: "even", dir: "even" });
eq("사례 A: 조심할 샷(백 자리)", F.ftAnalysis(ra).rows[3][2], "백 자리에서 부담스러운 샷이 없어요.");
eq("사례 A: 샷도 백 → 추천 자리", F.ftSeatLabel(ra), "추천 자리");
const PF = sc("R", [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0]);
eq("샷이 중립이면 선호 자리", [PF.pos, F.ftSeatLabel(PF)], ["B", "선호 자리"]);
const FH = sc("R", [1, 1, 0, 0, 2, 0, 2, 0, 2, 0, 2, 0, 0, 0, 0, 1, 0]);
eq("포핸드 의존형·네트/후위 균형", [F.ftAnalysis(FH).hand, F.ftAnalysis(FH).zone], ["fore", "even"]);
const NT = sc("R", [1, 1, 0, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]);
eq("네트형·센터 강자", [F.ftAnalysis(NT).zone, F.ftAnalysis(NT).dir], ["net", "cen"]);
const Z = (fw, fl, bw, bl) => ({ fore: { g: fw + fl, w: fw, l: fl, d: 0 }, back: { g: bw + bl, w: bw, l: bl, d: 0 } });
eq("실전: 경기 부족", F.ftReal(ra, Z(1, 1, 5, 2)).text, "포·백을 입력한 복식 경기가 쌓이면 비교해 드려요. (지금 9경기)");
eq("실전: 설문 백 · 실전 백", F.ftReal(ra, Z(3, 6, 12, 5)).text, "설문과 실전이 같은 쪽이에요. 백 자리에서 더 잘 풀려요.");
eq("실전: 설문 포 · 실전 백", F.ftReal(rsw, Z(3, 6, 12, 5)).text, "설문은 포, 실전은 백 자리에서 더 잘 풀려요.");
eq("실전: 비슷", F.ftReal(ra, Z(5, 5, 5, 4)).text, "실전에서는 포·백 성적이 비슷해요.");
const m5 = F.ftMatch({ n: "가", h: "R", a: F.ftUp(FH.h ? [1, 1, 0, 0, 2, 0, 2, 0, 2, 0, 2, 0, 0, 0, 0, 1, 0] : []) }, { n: "나", h: "R", a: F.ftUp([1, 1, 0, 0, 2, 0, 2, 0, 2, 0, 2, 0, 0, 0, 0, 1, 0]) });
eq("궁합: 둘 다 포핸드 의존 → 경고", m5.cautions.some(c => c.startsWith("둘 다 포핸드에")), true);

// ---------- 쉬운 버전
const E1 = [1, 1, 0, 0, 0, 1, 0, 2]; // 왼쪽 편함 · 포핸드 조금 · 주도 3(e1,e3,e5) 연결 1(e4) 안정 1(e6) · 커버 먼저 간다
const re1 = F.ftScore("R", E1);
eq("쉬운: 검증", F.ftValid("R", E1), true);
eq("쉬운: 왼쪽(+2) + 오른손 포핸드 조금(-0.75) = 1.25 → 유연", [re1.P, re1.pos], [1.25, "X"]);
eq("쉬운: 운영 주도 · 커버 적극 · 조커", [re1.sty, re1.cov, re1.type.n], ["lead", "act", "조커"]);
eq("쉬운: 이유 문장", F.ftReason(re1), "왼쪽(백) 리턴이 편하고 포핸드가 더 자신 있어요. 어느 자리든 맞출 수 있어요.");
const re2 = F.ftScore("L", [1, 0, 1, 1, 1, 1, 2, 1]);
eq("쉬운(왼손): 왼쪽 편함 + 포핸드 훨씬 → 백 · 연결", [re2.P, re2.pos, re2.sty], [3.5, "B", "link"]);
eq("쉬운: 모름 + 비슷 → 유연", F.ftScore("R", [3, 2, 2, 2, 2, 2, 2, 2]).pos, "X");
const mE = F.ftMatch({ n: "가", h: "R", a: E1 }, { n: "나", h: "R", a: F.ftUp(A) });
eq("쉬운 + 상세 궁합도 계산됨", [mE.combo.n, mE.prom.length], ["불꽃 콤비", 3]);
eq("팀 전략: 조합별 플랜", F.ftTeam(mE).serve, "둘 다 서브 후 빠르게 붙어서 압박해요.");

// ---------- 범위
const all = (n, v) => Array(n).fill(v);
const maxB = [1, 1, 0, 2, 0, 0, 2, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0];  // 백 후위·백 전위 자신, 포 쪽 부담
const maxF = [0, 0, 1, 0, 2, 2, 0, 0, 2, 2, 0, 2, 2, 2, 2, 2, 2];
eq("P 최댓값 +12.5 → 백 90%", [sc("R", maxB).P, sc("R", maxB).back], [12.5, 90]);
eq("P 최솟값 -12.5 → 백 10%", [sc("R", maxF).P, sc("R", maxF).back], [-12.5, 10]);
eq("C 최댓값 +5", sc("R", [...all(9, 1), 0, 0, 0, 0, 0, 0, 0, 0]).C, 5);
eq("C 최솟값 -5", sc("R", [...all(9, 1), 2, 2, 2, 2, 2, 2, 2, 2]).C, -5);

// ---------- 답 검증·링크
eq("검증: 정상(v2)", F.ftValid("R", F.ftUp(A)), true);
eq("검증: 예전 17칸은 그대로는 안 됨", F.ftValid("R", A), false);
eq("예전 답 옮기기: 샷 3단계 → 5단계, 역할 없음", F.ftUp(A).slice(3, 11).concat(F.ftUp(A)[17]), [2, 0, 0, 4, 2, 2, 2, 2, 3]);
eq("예전(v1) 초대 링크도 열림", F.ftInvite(F.b64e({ v: 1, n: "가", h: "R", a: A })).a.length, 18);
const RL = F.ftUp(A); RL[17] = 2; RL.splice(12, 4, 0, 2, 0, 2); RL[16] = 1;
eq("역할 문항도 운영 표에 들어감(안정 3 > 주도 2)", F.ftScore("R", RL).sty, "safe");
const S5 = F.ftUp(A); S5[3] = 1; S5[6] = 3;
eq("5단계: 자신(+0.5)·부담(-0.5)", [F.ftScore("R", S5).shots.a, F.ftScore("R", S5).shots.d], [0.5, -0.5]);
eq("검증: 손 잘못", F.ftValid("X", F.ftUp(A)), false);
eq("검증: 길이 잘못", F.ftValid("R", F.ftUp(A).slice(1)), false);
eq("검증: 범위 밖", F.ftValid("R", [...F.ftUp(A).slice(0, 17), 4]), false);
const inv = F.b64e({ v: 1, n: "김민지 테니스왕자님짱짱", h: "R", a: F.ftUp(A) });
eq("초대 링크: 되살리기·이름 10자", F.ftInvite(inv), { n: "김민지 테니스왕자님", h: "R", a: F.ftUp(A) });
eq("초대 링크: 변조는 무시", F.ftInvite(inv.slice(0, -4) + "AAAA"), null);
eq("초대 링크: 아무 글자", F.ftInvite("hello"), null);
const ret = F.b64e({ v: 1, A: { n: "가", h: "R", a: F.ftUp(A) }, B: { n: "나", h: "L", a: F.ftUp(D) } });
eq("돌려주기 링크", F.ftReturn(ret).B.h, "L");
eq("돌려주기 링크: 한쪽이 잘못되면 무시", F.ftReturn(F.b64e({ v: 1, A: { n: "가", h: "R", a: F.ftUp(A) }, B: { n: "나", h: "R", a: F.ftUp([1]) } })), null);

// ---------- 궁합
const m1 = F.ftMatch({ n: "가", h: "R", a: F.ftUp(A) }, { n: "나", h: "R", a: F.ftUp(maxF) });
eq("궁합: 백 + 포 → 자리 나누기", [m1.fore, m1.seat], [1, "자리 고민 끝! 나님 포, 가님 백."]);
eq("궁합: 운영 조합 이름(주도+안정)", m1.combo.n, "창과 방패");
const m2 = F.ftMatch({ n: "가", h: "R", a: F.ftUp(A) }, { n: "나", h: "R", a: F.ftUp(maxB) });
eq("궁합: 둘 다 백 → |P| 작은 사람이 포로", [m2.fore, m2.seat.includes("가님이 포에")], [0, true]);
const m3 = F.ftMatch({ n: "가", h: "R", a: F.ftUp(A) }, { n: "나", h: "L", a: F.ftUp(A) });
eq("궁합: 한 명 유연 → 유연한 사람이 맞춤", [m3.fore, m3.seat], [1, "유연한 나님이 맞춰주면 끝. 가님은 편한 백 자리로."]);
eq("궁합: 오른손 백 + 왼손 포 → 센터 둘 다 포핸드", m3.lr, "왼손·오른손 조합이라 센터에서 둘 다 포핸드예요.");
eq("궁합: 약속은 3개", m1.prom.length, 3);
const fz = A.slice(); fz[11] = 1; fz[16] = 1;
const m4 = F.ftMatch({ n: "가", h: "R", a: F.ftUp(fz) }, { n: "나", h: "R", a: F.ftUp(fz) });
eq("궁합: 둘 다 멈칫 + 쭈뼛 → 무인지대 최우선", m4.cautions[0].startsWith("센터는 지금 우리 팀의 무인지대"), true);
eq("궁합: 같은 답이면 항상 같은 결과", JSON.stringify(F.ftMatch({ n: "가", h: "R", a: F.ftUp(A) }, { n: "나", h: "L", a: F.ftUp(D) })), JSON.stringify(F.ftMatch({ n: "가", h: "R", a: F.ftUp(A) }, { n: "나", h: "L", a: F.ftUp(D) })));

console.log(`\n${fail ? "❌" : "✅"} 통과 ${pass} · 실패 ${fail}`);
if (fail) process.exit(1);
