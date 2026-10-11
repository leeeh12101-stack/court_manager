// 포백 테스트 계산 자동 테스트 — 실행: node tests/ft.test.mjs (저장소 루트에서)
import * as F from "../ft-core.js";

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) pass++; else { fail++; console.log(`✗ ${name}\n   기대: ${w}\n   실제: ${g}`); }
};
// 답 순서: q2 q3 q4 | a b c d | e f g h | q6 q7 q8 q9 q10 q11
const A = [1, 1, 0, 1, 0, 0, 2, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0];

// ---------- 기획서 검증 사례
const ra = F.ftScore("R", A);
eq("사례 A: 위치 점수·판정·백 %", [ra.P, ra.pos, ra.back], [8, "B", 79]);
eq("사례 A: 운영 표·결과", [ra.votes, ra.sty], [{ lead: 4, link: 1, safe: 0 }, "lead"]);
eq("사례 A: 커버", [ra.C, ra.cov], [4, "act"]);
eq("사례 A: 유형 해결사", ra.type.n, "해결사");
const rb = F.ftScore("L", A);
eq("사례 B(왼손): P 2 → 유연 · 조커", [rb.P, rb.pos, rb.type.n], [2, "X", "조커"]);
const C = A.slice(); C.splice(12, 5, 0, 2, 0, 2, 1);
const rc = F.ftScore("R", C);
eq("사례 C: 주도 2·안정 2, 7번 주도 → 주도", [rc.votes, rc.sty], [{ lead: 2, link: 0, safe: 2 }, "lead"]);
eq("사례 C: 쭈뼛 표시·전략형 표시", [rc.flags.hesitate, rc.flags.mixed], [true, true]);
const D = A.slice(); D.splice(12, 5, 1, 0, 2, 0, 2);
const rd = F.ftScore("R", D);
eq("사례 D: 주도 2·안정 2·연결 1, 7번 연결 → 연결", [rd.votes, rd.sty, rd.flags.mixed], [{ lead: 2, link: 1, safe: 2 }, "link", true]);
eq("연결이 공동 1위에 있으면 연결", F.ftScore("R", [1, 1, 0, 1, 0, 0, 2, 1, 1, 1, 1, 0, 0, 1, 2, 1, 2]).sty, "link");

// ---------- 범위
const all = (n, v) => Array(n).fill(v);
const maxB = [1, 1, 0, 2, 0, 0, 2, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0];  // 백 후위·백 전위 자신, 포 쪽 부담
const maxF = [0, 0, 1, 0, 2, 2, 0, 0, 2, 2, 0, 2, 2, 2, 2, 2, 2];
eq("P 최댓값 +11 → 백 90%", [F.ftScore("R", maxB).P, F.ftScore("R", maxB).back], [11, 90]);
eq("P 최솟값 -11 → 백 10%", [F.ftScore("R", maxF).P, F.ftScore("R", maxF).back], [-11, 10]);
eq("C 최댓값 +5", F.ftScore("R", [...all(9, 1), 0, 0, 0, 0, 0, 0, 0, 0]).C, 5);
eq("C 최솟값 -5", F.ftScore("R", [...all(9, 1), 2, 2, 2, 2, 2, 2, 2, 2]).C, -5);

// ---------- 답 검증·링크
eq("검증: 정상", F.ftValid("R", A), true);
eq("검증: 손 잘못", F.ftValid("X", A), false);
eq("검증: 길이 잘못", F.ftValid("R", A.slice(1)), false);
eq("검증: 범위 밖", F.ftValid("R", [...A.slice(0, 16), 3]), false);
const inv = F.b64e({ v: 1, n: "김민지 테니스왕자님짱짱", h: "R", a: A });
eq("초대 링크: 되살리기·이름 10자", F.ftInvite(inv), { n: "김민지 테니스왕자님", h: "R", a: A });
eq("초대 링크: 변조는 무시", F.ftInvite(inv.slice(0, -4) + "AAAA"), null);
eq("초대 링크: 아무 글자", F.ftInvite("hello"), null);
const ret = F.b64e({ v: 1, A: { n: "가", h: "R", a: A }, B: { n: "나", h: "L", a: D } });
eq("돌려주기 링크", F.ftReturn(ret).B.h, "L");
eq("돌려주기 링크: 한쪽이 잘못되면 무시", F.ftReturn(F.b64e({ v: 1, A: { n: "가", h: "R", a: A }, B: { n: "나", h: "R", a: [1] } })), null);

// ---------- 궁합
const m1 = F.ftMatch({ n: "가", h: "R", a: A }, { n: "나", h: "R", a: maxF });
eq("궁합: 백 + 포 → 자리 나누기", [m1.fore, m1.seat], [1, "자리 고민 끝! 나님 포, 가님 백."]);
eq("궁합: 운영 조합 이름(주도+안정)", m1.combo.n, "창과 방패");
const m2 = F.ftMatch({ n: "가", h: "R", a: A }, { n: "나", h: "R", a: maxB });
eq("궁합: 둘 다 백 → |P| 작은 사람이 포로", [m2.fore, m2.seat.includes("가님이 포에")], [0, true]);
const m3 = F.ftMatch({ n: "가", h: "R", a: A }, { n: "나", h: "L", a: A });
eq("궁합: 한 명 유연 → 유연한 사람이 맞춤", [m3.fore, m3.seat], [1, "유연한 나님이 맞춰주면 끝. 가님은 편한 백 자리로."]);
eq("궁합: 오른손 백 + 왼손 포 → 센터 둘 다 포핸드", m3.lr, "왼손·오른손 조합이라 센터에서 둘 다 포핸드예요.");
eq("궁합: 약속은 3개", m1.prom.length, 3);
const fz = A.slice(); fz[11] = 1; fz[16] = 1;
const m4 = F.ftMatch({ n: "가", h: "R", a: fz }, { n: "나", h: "R", a: fz });
eq("궁합: 둘 다 멈칫 + 쭈뼛 → 무인지대 최우선", m4.cautions[0].startsWith("센터는 지금 우리 팀의 무인지대"), true);
eq("궁합: 같은 답이면 항상 같은 결과", JSON.stringify(F.ftMatch({ n: "가", h: "R", a: A }, { n: "나", h: "L", a: D })), JSON.stringify(F.ftMatch({ n: "가", h: "R", a: A }, { n: "나", h: "L", a: D })));

console.log(`\n${fail ? "❌" : "✅"} 통과 ${pass} · 실패 ${fail}`);
if (fail) process.exit(1);
