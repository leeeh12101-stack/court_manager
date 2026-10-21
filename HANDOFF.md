# Court Manager 인수인계 문서

> Claude가 GitHub 저장소에 직접 연결돼 있어요. 새 대화에서 "court_manager 저장소에서 …"라고 요청하면 최신 파일을 저장소에서 바로 읽어요.
> 기준 시점: 2026-10-21 · **BUILD `1021-11`** · 버전 표기 `v0.1`
> **이 파일만 처음에 읽기.** BUILD별 상세 기록은 `HISTORY.md`(통째로 읽지 말고 검색).

---

## 1. 앱 개요

- **Court Manager**: 테니스 클럽·모임 운영(클럽·모임 모드) + 개인 경기 기록(개인 모드) PWA. 한국어 UI.
- 라이브: https://leeeh12101-stack.github.io/court_manager/ · 저장소: `leeeh12101-stack/court_manager`
- 보조 저장소: `leeeh12101-stack.github.io` (루트 사이트: `.well-known/assetlinks.json`, `.nojekyll`, 앱으로 이동하는 `index.html`)
- Firebase 프로젝트 ID **`court-manager-abcde`** (무료 Spark). ⚠ 구글 클라우드의 `court-manager-abcde-510319`는 **다른 프로젝트**(혼동 주의, 삭제 권장)
- 개발자 이메일: `leeeh12101@gmail.com` (규칙 `isDev()`와 `firebase-config.js`의 `devEmail`에 동일하게)

## 2. 파일 구조

| 파일 | 내용 |
|---|---|
| `index.html` | 뼈대(시작 로고·로딩 표시 포함), Firebase SDK·앱 파일 미리 받기(modulepreload) |
| `app.css` | 디자인 |
| `app.js` | 화면과 동작(약 286KB). 하나의 ES 모듈 |
| `core.js` | **순수 계산**(Firebase·화면 무관) → 자동 테스트 대상 |
| `ft-data.js` / `ft-core.js` / `ft.js` | **포백 테스트**: 문구 모음 / 순수 계산(테스트 `tests/ft.test.mjs`) / 화면·동작(app.js가 `ftInstall()`로 V·A·BACK에 합침) |
| `firebase-config.js` | ⚠ **절대 덮어쓰지 말 것**(App Check 키·개발자 이메일 포함, 저장소 것이 최신). 사진 AI 전용 프로젝트 설정 `aiConfig`·`aiCheckKey`는 사용자가 직접 붙여 넣음(1021-7) |
| `firestore.rules` | 보안 규칙. `main`에 푸시하면 **자동 게시**(GitHub Actions `.github/workflows/firestore-rules.yml`, Secret `FIREBASE_SERVICE_ACCOUNT` = 규칙 게시 전용 서비스 계정 `github-rules-deploy`). 수동 재실행: Actions › Firestore rules deploy › Run workflow |
| `sw.js` | 서비스 워커(`V` 버전, 지금 `cm-v55`): 네트워크 우선, 3초 응답 없으면 저장본. 같은 출처 요청은 `cache:'no-cache'`로 브라우저 저장분(Pages max-age 10분)을 건너뛰고 서버 확인(1014-2) → 배포 직후에도 새 파일 |
| `icon.svg` | **앱 아이콘 원본**(CM 모노그램, C 안 공 실밥, 로고 1.15배(폭 약 51%, 1012-6), 숲색 `#174A43`·크림 `#F3EEE3`). PNG(`icon-192/512`, `icon-maskable-512`, `apple-touch-icon`, `favicon-32`(실밥 굵게))는 이 SVG에서 Playwright로 렌더(1012-5) |
| `manifest.webmanifest`, `privacy.html` | 스토어 대비 매니페스트, 개인정보처리방침(`#delete`에 계정 삭제 안내) |
| `tests/core.test.mjs` | core.js 테스트 155개 |
| `tests/check.py` | **점검 한 번에 돌리기**: 기본 = 코드 점검(약 5초), `--ui` 화면 점검 추가, `--draw` 대진 점검 추가, `--all` 전부(동시 실행, 약 20초). 통과하면 한 줄, 실패하면 자세히(`-v`는 늘 자세히) |
| `tests/shot.py` | **360·390 캡처 한 장**: `python3 tests/shot.py 이름 "[data-a=club]" ".nav [data-k=stats]"` (누를 곳 순서대로, `js:코드`·`wait:ms`, `--init "JS"` 가짜 데이터 바꾸기, `--h`·`--full`·`--el 선택자`, **`--cmp` = 마지막 커밋과 바꾼 뒤를 위아래로**). 가로 넘침 자동 검사. 결과 `tests/out/이름.png`(git 제외) |
| `tests/smoke/h.py` | 점검 공통: 앱 서버·가짜 Firebase 연결·`idle()`(고정 대기 대신 로딩 원 없고 화면 변화가 0.25초 멈추면 진행) |
| `tests/smoke/` | **화면 점검**(가짜 Firebase로 앱을 띄워 클릭, 10가지 상황): `python3 tests/smoke/smoke.py` (Playwright 필요). 대진 점검은 따로 `draw.py`(사람별 출전·페어 장면 + 무작위 설정 400개, `DRAW_N`으로 개수 조절). app.js 끝의 `globalThis.__cm`은 가짜 Firebase(`__DB`)일 때만 생김 |

## 3. 작업 규칙 (꼭 지킬 것)

1. **수정 후 항상** `python3 tests/check.py` 실행(화면을 바꿨으면 `--ui`, 대진이면 `--draw`, 둘 다면 `--all`)(문법 검사는 .mjs 사본으로 해야 app.js 오류를 잡음 — 1009-1에서 수정) → `✅ 모두 통과` 확인 후 전달.
   - 문법 / core 테스트 / 정의되지 않은 이름(TypeScript) / 버튼 연결·**이름표 겹침**·화면·뒤로가기
1-1. 화면을 바꿨으면 `check.py --ui`(= smoke.py, 11가지 상황 동시 실행 약 18초; 늦게 터지는 오류는 바로 다음 단계 이름으로 찍힐 수 있음) → `✅ 화면 점검` 확인(실행 중 오류는 check.py로 못 잡음. 1009-3의 `key` 변수 충돌이 그 예)
1-2. **대진 만들기(buildDraw·사람별 출전·고정 페어·psIssues/psViol)를 바꿨을 때만** `check.py --draw`(= draw.py) 실행 → `✅ 대진 점검 통과`(장면 + 무작위 400개, 큰 확인은 `DRAW_N=2000`). smoke.py에서는 분리돼 있음(속도).
2. **BUILD 번호를 매번 올리기**: `app.js`의 `BUILD="MMDD-n"`. 모드 선택 화면 맨 아래 `테스트 버전 v0.1 · 1009-4`로 보여서, 사용자가 새 파일이 실행 중인지 확인함.
3. **core.js에 export를 추가하면** `app.js` 첫머리의 `import {…} from "./core.js"` 목록을 다시 만들기:
   `node -e 'import("./core.js").then(m=>{const k=Object.keys(m).sort(),fs=require("fs");let a=fs.readFileSync("app.js","utf8");a=a.replace(/import \{[^}]*\} from "\.\/core\.js";/,"import {"+k.join(",")+"} from \"./core.js\";");fs.writeFileSync("app.js",a)})'`
4. **이름표(data-*) 겹침 주의**: 클릭 처리에서 특별 분기하는 속성 `np ep pn ps pt lk nt sk st2 pr xv pk fl sc pm pu r d`는 **새 요소에 쓰지 말 것**(과거 3번 버그). 날짜는 `data-dk`, 접는 칸은 `data-sec`를 씀.
5. 계산 로직은 가능하면 **core.js에 넣고 테스트 추가**.
6. 점검 통과 후 **저장소 `main`에 바로 커밋·푸시**(GitHub Pages 자동 반영, 실패 시에만 바뀐 파일 zip 전달). **Pages 배포 완료를 기다리지 않음**(크레딧·속도; 사용자가 앱을 열어 BUILD로 확인). sw.js는 `cache:'no-cache'`라 푸시 1~2분 뒤 앱을 다시 열면 새 버전. 바로 이어서 코딩할 땐 중간 파일 만들지 않기, 규칙은 푸시하면 자동 게시되니 Actions 성공(`gh run list --workflow firestore-rules.yml`)만 확인.
6-1. **작업 기록**: BUILD마다 `HISTORY.md` 맨 아래 `## 새 기록`에 한두 줄. HANDOFF.md에는 구조·규칙·주의·보류가 바뀔 때만 고침(길게 늘리지 않기). 화면 캡처는 `tests/shot.py`(즉석 스크립트 만들지 않기).
7. **새 기능이 생기면 `NEWS`(app.js) 맨 아래에 새 묶음 추가** — **큰 기능만**(버튼 위치·문구 같은 작은 변경은 넣지 않음, 1021-11). 알림은 7일에 한 번(`users.newsAt`), 최근 3개만 먼저. 묶음을 지우지 말 것(개수가 줄면 `newsSeen`이 어긋남 → 비우기 `[]`): `[대상, 제목, 한 줄 설명]`, 대상은 all·club·personal·권한 키. 사람마다 `users.newsSeen`(본 묶음 수)까지 건너뛰고 밀린 항목을 한 번에 보여 줌. 새 가입자는 처음부터 본 것으로 처리.
8. **누를 수 있는 곳 표시 규칙**: 목록 줄은 `.li.tap`이면 자동으로 `›`(이동이 아닌 줄은 `noar`), 문장 속 글자는 `.lnk`(주의는 `.lnk.warn`) 점선 밑줄, 아래 창은 제목+닫기 머리줄·바깥 누르기·뒤로가기로 닫힘.
9. Python으로 패치할 때 문자열 정확히 일치 확인(실패 목록 출력) → 실패 0이어야 함.
10. **Windows PC(코드 모드)**: Python은 `%LOCALAPPDATA%\Programs\Python\Python312\python.exe`(`python`/`python3`는 스토어 바로가기라 안 됨), 실행 전 `PYTHONUTF8=1`(한글 깨짐 방지). Playwright·Chromium·Pillow·TypeScript 설치됨(1021-10·11).

## 4. 코드 구조 (app.js)

- 상태 `S`, 동작 `A`(data-a로 연결, 약 252개), 화면 `V`(go("화면")), 클럽 탭 `T`(today·games·stats·members·settings), 개인 탭 `P`(home·games·stats·settings), 뒤로가기 `BACK`.
- 렌더: `render()`, 입력 유지 재렌더 `keepR()`/`rer()`, 클럽 데이터 `load()`, 개인 데이터 `pLoad()`.
- 쓰기 함수 `setDoc/updateDoc/deleteDoc/writeBatch`는 **감싼 버전**(회원 화면 미리보기 중 저장 차단 + 회원 명단 캐시 무효화).
- 폰 저장소 `IDB`는 3초 안에 안 열리면(iOS IndexedDB 멈춤 대비) 그 실행 동안 저장 없이 서버에서 바로 받음(1012-9). 개인 설정 클럽 동기화 줄에 가져온 경기 수·꺼짐 표시.
- 회원 명단 2분 캐시 `memQ()`, 경기·출석·개인 기록은 **폰 저장 + 바뀐 것만 받기** `syncQ()`(IndexedDB, 30일 전체 갱신을 키별로 분산).
- **삭제는 삭제 표시**(`deleted:true` + `updatedAt`). 저장·수정 시 **`updatedAt` 필수**(바뀐 것만 받기 때문).

### 꼭 기억할 주의 (자세한 건 HISTORY.md 검색)
- 클릭 분기 속성(`data-r` 등)은 새 요소에 쓰지 말 것 — 대신 `data-mk`·`data-dk`·`data-sec`(1015-6). `.pv`(사진 미리보기)·`.qm`(? 버튼)·`.mc`(회원 목록) 클래스 이미 있음.
- 펼치는 UI는 `showIn(selector)`로 자동 스크롤(1014-7).
- `tips.js` 팁·투어 `TOUR` 단계는 **뒤에 추가만**(저장 id 유지, 1020-3·1021-1).
- Firestore 규칙: `Set.toList()` 없음, `a.diff(b).addedKeys()`=a에만 있는 키(1015-7·1016-4). photoDays는 칸 단위 쓰기 + 최상위 `ch`(1016-3). 에뮬레이터 없음 → 실기기 확인.
- 파이썬으로 파일 고칠 땐 **읽고 → 따로 쓰기**(같은 줄에서 `open(...,'w')`와 읽기를 섞으면 파일이 비워짐, 1016-2 sw.js 사고).
- 삭제는 삭제 표시(`deleted:true`+`updatedAt`), 저장·수정 시 `updatedAt` 필수.
- 공정성: 짧게 있는 사람을 자동으로 몰아 넣는 규칙 금지(사용자 결정, 1014-5).

## 5. 데이터 (Firestore)

컬렉션: `personalNotes, photoDays, clubPhotos, users, clubs, clubMembers, clubPrivate, inviteCodes, clubApplications, sessions, sessionParticipants, games, personalGames, personalPeople, aiUsage, aiDrawUsage, queues, feedback`

**clubs 주요 필드**: `rankShow`, `mode`(round/queue/record), `qrule`, `schedType`(weekly/monthly/none), `schedM{week,weeks[],dow}`(매월 여러 주 `weeks`, 예전 폰 호환용 `week`=첫 주, core `mWeeks`·`mWeeksLab`), `regularDays`, 시간·코트, `noPlayEnabled`, `monthly{on,week,dow}`(월례대회 자동, 매주 클럽만), `mdays{yyyymmdd:bool}`, **`sched{yyyymmdd:{start,end,courts,title,memo,deadline,off,closed,ended}}`**(추가 모임·날짜별 변경·취소·응답 마감·모임 종료), `mtgOverride`(예전 방식, 호환 유지), `genderMode`(m/f/mixed), `memberView{tier,pos,gender}`, `tierEnabled`, `tiers`, `permissions`, `notice`, `gOk`(게스트로 인정한 이름), `lastBackupAt`, `visibility`, `joinMethod`.
**clubMembers**: `displayName, role, status, defaultPosition, tierId, gender, uid 또는 oid(미가입)`.
**users**: `name, gender, dpos, sync, syncAsked, opts, hide, xlmap, imports, dupKeep`.
**personalGames**: 직접 기록 + 클럽 경기 덧붙임(id `${uid}_${gameId}`: kind·court·mtype·note).

**색인(콘솔에 생성 완료)**: games(clubId+updatedAt), games(clubId+pk 배열+updatedAt), sessionParticipants(clubId+updatedAt), personalGames(ownerUid+updatedAt).

## 6. Firebase·외부 설정 현황

- **사진 AI 프로젝트 분리(1021-7, 진행 중)**: 모임 영상 때문에 원래 프로젝트를 Blaze로 바꾸면 Gemini Developer API가 유료(선불)로 바뀌어 사진 AI가 막힐 수 있음 → 사용자 결정: 사진 AI만 새 무료(Spark) 프로젝트 `court-manager-ai`로. 앱은 `aiConfig`가 있으면 첫 사진 읽기 때 `initializeApp(aiConfig,"ai")`+App Check(`aiCheckKey`)로 연결(`aiBase`/`acX`), 없거나 실패하면 원래 프로젝트. 사용 제한(aiUsage)은 원래 프로젝트. 개발자 'App Check 진단'에 AI 프로젝트·AI 토큰 줄. **순서**: 새 프로젝트 만들기(웹 앱·AI Logic Gemini Developer API·App Check reCAPTCHA Enterprise 키, 결제 연결 X) → firebase-config.js에 두 줄 → 진단·사진 입력 확인 → App Check 적용(AI Logic) → 그다음 원래 프로젝트 Blaze → 원래 프로젝트 Gemini(Generative Language) API 끄기. 2026-11-02부터 AI Logic은 App Check 적용 필수.

- **App Check**: reCAPTCHA Enterprise 키는 **`court-manager-abcde` 프로젝트**에서 만든 것, 앱 등록·`firebase-config.js` 반영 완료. AI Logic **기준 보호 적용**, 재생 보호 **사용 안 함**, 토큰 TTL 1시간. 개발자 전용 `App Check 진단` 버튼 있음.
- **AI 무료 한도(프로젝트 전체)**: 3.5 Flash 하루 약 20회, 3.5 Flash-Lite 약 500회(2026-09 기준 자료). 회원이 많아지면 종량제 검토.
- **플레이 스토어(2026-10-08)**: 비공개 테스트 버전 1 (1.0.0.1) 심사 전송. **업로드 키 = 10월 7일 PWABuilder 키**(SHA-1 7A:1E:17…, SHA-256 FA:4B:AC…), 10월 4일 키(87:F8…)는 사용 안 함. Play 앱 서명 키 SHA-256 4F:BD:AA…. assetlinks.json에 세 지문 등록. 새 .aab는 10월 7일 키로 Use mine + Version code 올리기(Package ID io.github.leeeh12101_stack.courtmanager).
- (이전 기록) **플레이 스토어**: 개발자 계정 승인 대기. 패키지 `io.github.leeeh12101_stack.courtmanager`, PWABuilder 서명 키 보관 완료, `assetlinks.json`에 시험 서명 지문 등록. **남은 일**: 콘솔에서 앱 생성 → `.aab` 업로드 → **Play 앱 서명 SHA-256을 assetlinks.json에 추가**(배열에 2개) → 비공개 테스트·스토어 정보·데이터 보안 양식. 개인정보처리방침 URL `…/court_manager/privacy.html`, 계정 삭제 URL `…/privacy.html#delete`.

## 7. 사용자 선호 (대화 방식)

- **아이디어를 먼저 정리 → 확정("다음") → 한 번에 코딩**. 크레딧 절약 위해 여러 항목을 묶어서 진행.
- 화면은 **간결하게**: 회색 설명 문장보다 **`?` 도움말**, 앱 전체 디자인 통일(선택 칸·카드·초록 버튼), 이모지 남발 X.
- 안내는 **비개발자 기준 쉬운 말**, 콘솔 작업은 화면 순서대로 단계별.
- 답변 끝에 **확인해 볼 항목**을 짧게.
- **답은 항상 한국어**(영어로 바뀌면 싫어함).
- **화면은 기본적으로 깔끔하게 정렬**: 종류별로 묶고, 같은 크기·같은 세로선, 들쑥날쑥 금지. 노란색은 경고에만. 말하지 않아도 맞출 것.
- 화면을 바꾸면 **폭 360·390에서 캡처해 넘침·정렬 확인 후** 올리고, 큰 변화는 **바꾸기 전·후 나란히** 보여주기. 변화가 작으면 360 한 장만.
- **무언가를 펼치는 UI(접이식 카드 등)는 펼친 내용이 보이게 자동 스크롤**(`showIn(selector)`) — 말 안 해도 늘 넣기.
- 화면 문구는 사용자가 정한 걸 유지(예: 대진 조건 칩 `같은 페어 피하기`·`같은 상대 피하기`·`지정 포지션 반영`·`비슷한 실력끼리`·`팀 실력 균형`).
- 공정성: 짧게 있는 사람을 자동으로 몰아 넣는 규칙은 싫어함(길게 있는 사람 불만). 특별한 요청은 사람별 출전 설정으로만.
- **대화가 길어져 크레딧·속도가 나빠지면 적당한 시점에 새 채팅을 먼저 제안**(HANDOFF 정리 후 시작 문구 제공).
- 문구는 사용자가 아는 말로(내부 용어 X). "1로"처럼 짧은 답이 애매하면 추천안 기준으로 진행하고 어떻게 해석했는지 밝힐 것.

## 8. 주요 기능 현황 (요약)

- **클럽·모임**: 만들기 3단계(성격·일정·운영 방식), 회원 추가 한 화면(이름 붙여넣기·사진·초대 링크/QR), 클럽 정보(성별·Tier 포함), 모임 일정(매주/매월/비정기), 추가 모임·날짜 이동·취소·응답 마감·모임 종료, 오늘 모임 3단계(전/진행 중/종료 후 결과 요약), 다가오는 일정 한 줄+전체 일정, 참석 바로 응답·미응답·카톡 알리기, 대진(포지션·Tier·혼성 옵션·고정 페어)·사진 대진, 순번제(실시간 코트 현황), 결과만 기록, 월례대회 표시·통계 분리, 혼성 클럽 성별·경기형태 자동 판별, 공지, 권한, 백업(엑셀), 의견 보내기/받은 의견.
- **개인**: 경기 추가(경기형태 한 줄·포지션 팀 단위·혼복 성별·점수 숫자 목록), 대회 단계·이어서 입력 제안, 선택지 관리, 엑셀 가져오기/내보내기(공통 양식 `XHDR`), 검색, 통계(요약+사람/경기 종류/포지션/대회), 클럽 동기화(첫 진입 시 묻기), 클럽 기록과 겹침 찾기·합치기, 계정 삭제.

## 9. 보류·다음 후보


- **실기기 확인 필요**: 1021-3 탭 밀기(사진 넘기기·가로 스크롤 칸과 안 겹치는지, 안드로이드 뒤로가기 제스처와 안 겹치는지), 대진표 인쇄(플레이 스토어 앱·크롬·아이폰에서 인쇄 창이 뜨는지, 용지 한 장에 맞는지)
- **실기기 확인 필요**: 1021-1·2 사용법 투어(화면 들어갈 때만·본 단계 다시 안 뜸·'사용법 다시 보기'), 대진 미리보기 길게 누르기(글자 선택 메뉴 안 뜨는지·진동), 회원 탭 칸 모양 복구
- **실기기 확인 필요**: 1015-5 주차권(새 규칙으로 올리기·가져가기·돌려놓기·메모·다시 읽기·삭제가 실제 Firebase에서 되는지, 저장한 QR이 기계에서 읽히는지) — 규칙은 에뮬레이터 없이 올렸으니 실패 시 Actions·오류 코드 확인
- **실기기 확인 필요**: 1014-8·9 참석자 추가의 왔던 게스트(최근 순·며칠 전·더 보기)·새 게스트 추가 버튼·시간 접기가 실제 클럽 기록으로 맞게 나오는지
- **실기기 확인 필요**: 1014-7 대진 만들기 한 화면(360×640에서 조건·카드 접음 상태로 생성 버튼까지), 카드 펼칠 때 자동 스크롤, 찾기 칸에서 키보드가 가리지 않는지, 참석자 추가에 다른 클럽 이름이 안 보이는지
- **실기기 확인 필요**: 주차권 '카톡으로 게스트에게 보내기'(Web Share 파일 공유)가 안드로이드·아이폰 카톡에서 사진으로 잘 가는지
- 대진 조건 클럽 기본값을 설정 화면에도 둘지(지금은 대진 화면에서 고른 순서가 `clubs.dprio`에 저장되는 방식)
- 야외 모임 출석 체크(보류 중)
- **모임 영상(보류: 사용자 카드 준비 후)**: 정한 것 = Blaze 전환 + Firebase Storage(`US-CENTRAL1`, 무료 범위), 영상당 30초 이하(넘으면 휴대폰에서 잘라 달라고 안내), 모임당 3개, 앱에서 720p로 줄여 올림(진행 표시), 보관 7일(모임 사진과 같음), 클럽 회원만 보기, 올리기 = 모임 사진 권한, 삭제 = 올린 사람·관리자. 화면 = 결과 카드에 `모임 사진`/`모임 영상` 종류별 3칸 줄(▶·길이), 누르면 사진 보기 화면에서 재생. storage.rules + Actions 자동 게시 추가 필요. 콘솔 작업(업그레이드·예산 알림·Storage 시작) 안내는 했고 아직 안 함.

- 플레이 콘솔 승인 후 등록 작업(6번 참조)
- 푸시 알림(서버 필요 → Blaze 요금제·카드 등록 결정 필요). 현재 대안: 카톡 공유 문구
- 순번제 자동 배정의 성별 옵션
- 클럽 대회 출전 기능(회원이 많아지면)
- 종목 확장(배드민턴·피클볼 등: 클럽·개인 기록에 `sport:"tennis"` 저장 중)
- 사진 Lite 모델 정확도 확인 결과에 따라 대진표 사진만 정밀 모델 우선으로 조정

---

## 10. 새 채팅 시작 문구

```
court_manager 저장소 클론해서 HANDOFF.md 읽고 이어서 작업하자.
규칙: 앱 수정은 아이디어 먼저 정리 → 내가 "다음" 하면 코딩 / 화면을 바꿀 땐 코딩 전에 예시 화면 먼저 /
점검 통과 후 main에 바로 커밋·푸시 / firebase-config.js는 절대 덮어쓰지 말 것 /
Firestore 규칙은 푸시하면 GitHub Actions로 자동 게시됨 / 새 CSS 이름은 기존 것과 겹치지 않게(check.py가 검사) /
답은 한국어로, 화면은 늘 깔끔하게 정렬해서 360·390 폭 괜찮은지 확인.
이번 작업: (여기에 적기)
```
