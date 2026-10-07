# Court Manager 인수인계 문서

> 새 대화를 시작할 때 이 문서와 **최신 파일(`index.html`, `app.js`, `app.css`, `core.js`, `sw.js`, `firestore.rules`, `tests/` 폴더)**을 함께 올려 주세요.
> 기준 시점: 2026-10-08 · **BUILD `1008-1`** · 버전 표기 `v0.1`

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
| `firebase-config.js` | ⚠ **절대 덮어쓰지 말 것**(App Check 키·개발자 이메일 포함, 저장소 것이 최신) |
| `firestore.rules` | 보안 규칙. 바꾸면 콘솔에 **게시** 필요 |
| `sw.js` | 서비스 워커 `cm-v4`: 네트워크 우선, 3초 응답 없으면 저장본 |
| `manifest.webmanifest`, `privacy.html` | 스토어 대비 매니페스트, 개인정보처리방침(`#delete`에 계정 삭제 안내) |
| `tests/core.test.mjs` | core.js 테스트 137개 |
| `tests/check.py` | **점검 한 번에 돌리기** |

## 3. 작업 규칙 (꼭 지킬 것)

1. **수정 후 항상** `python3 tests/check.py` 실행 → `✅ 모두 통과` 확인 후 전달.
   - 문법 / core 테스트 / 정의되지 않은 이름(TypeScript) / 버튼 연결·**이름표 겹침**·화면·뒤로가기
2. **BUILD 번호를 매번 올리기**: `app.js`의 `BUILD="MMDD-n"`. 모드 선택 화면 맨 아래 `테스트 버전 v0.1 · 1008-1`로 보여서, 사용자가 새 파일이 실행 중인지 확인함.
3. **core.js에 export를 추가하면** `app.js` 첫머리의 `import {…} from "./core.js"` 목록을 다시 만들기:
   `node -e 'import("./core.js").then(m=>{const k=Object.keys(m).sort(),fs=require("fs");let a=fs.readFileSync("app.js","utf8");a=a.replace(/import \{[^}]*\} from "\.\/core\.js";/,"import {"+k.join(",")+"} from \"./core.js\";");fs.writeFileSync("app.js",a)})'`
4. **이름표(data-*) 겹침 주의**: 클릭 처리에서 특별 분기하는 속성 `np ep pn ps pt lk nt sk st2 pr xv pk fl sc pm pu r d`는 **새 요소에 쓰지 말 것**(과거 3번 버그). 날짜는 `data-dk`, 접는 칸은 `data-sec`를 씀.
5. 계산 로직은 가능하면 **core.js에 넣고 테스트 추가**.
6. 파일 전달은 **바뀐 파일만 zip 하나**(폴더 구조 포함)로, **"한 번에 커밋"** 안내. 바로 이어서 코딩할 땐 중간 파일 만들지 않기, 규칙 변경 시 **게시** 안내.
7. **화면에 보이는 기능을 바꾸면 `NEWS`(app.js) 맨 아래에 새 묶음 추가**: `[대상, 제목, 한 줄 설명]`, 대상은 all·club·personal·권한 키. 사람마다 `users.newsSeen`(본 묶음 수)까지 건너뛰고 밀린 항목을 한 번에 보여 줌. 새 가입자는 처음부터 본 것으로 처리.
8. **누를 수 있는 곳 표시 규칙**: 목록 줄은 `.li.tap`이면 자동으로 `›`(이동이 아닌 줄은 `noar`), 문장 속 글자는 `.lnk`(주의는 `.lnk.warn`) 점선 밑줄, 아래 창은 제목+닫기 머리줄·바깥 누르기·뒤로가기로 닫힘.
9. Python으로 패치할 때 문자열 정확히 일치 확인(실패 목록 출력) → 실패 0이어야 함.

## 4. 코드 구조 (app.js)

- 상태 `S`, 동작 `A`(data-a로 연결, 약 252개), 화면 `V`(go("화면")), 클럽 탭 `T`(today·games·stats·members·settings), 개인 탭 `P`(home·games·stats·settings), 뒤로가기 `BACK`.
- 렌더: `render()`, 입력 유지 재렌더 `keepR()`/`rer()`, 클럽 데이터 `load()`, 개인 데이터 `pLoad()`.
- 쓰기 함수 `setDoc/updateDoc/deleteDoc/writeBatch`는 **감싼 버전**(회원 화면 미리보기 중 저장 차단 + 회원 명단 캐시 무효화).
- 회원 명단 2분 캐시 `memQ()`, 경기·출석·개인 기록은 **폰 저장 + 바뀐 것만 받기** `syncQ()`(IndexedDB, 30일 전체 갱신을 키별로 분산).
- **삭제는 삭제 표시**(`deleted:true` + `updatedAt`). 저장·수정 시 **`updatedAt` 필수**(바뀐 것만 받기 때문).
- 경기 탭 '기록': 날짜 칸 안에서 `groupRounds`(core.js)로 회차별 묶음(1회차부터·코트순 / 순번제는 `n번째` / 회차 없음은 `기타`). 왼쪽 칸은 코트.
- 경기 `round`: 대진=회차, 순번제=경기 순서, 직접·사진=0 또는 입력 화면에서 고른 회차. 대진 칸에서 온 경기는 회차 고정, 순번제는 회차 칸 숨김. 수정해도 `source` 유지.
- 경기 추가(새 입력)는 같은 날짜·회차로 **경기 카드 여러 개**(코트 선택, 최대 max(6, 코트 수)) → writeBatch 한 번에 저장. 입력 칸 id는 `gn{카드}_{자리}`, `sa{카드}`/`sb{카드}`, `gc{카드}`.
- 이름 겹침 `dupNames`(core.js) + `dupOK`(app.js): 같은 회차 여러 경기=막기, 같은 날·같은 회차 저장된 경기=묻기, 회차 없음=직접 입력만 묻기(사진은 건너뜀). 사진 입력(클럽)도 회차 고르기.
- 통계·회원 상세·페어는 `gNorm()`(이름→회원 키 `ck` 적용)으로 계산. 게스트 키(`g:이름`)로 저장됐지만 지금 회원 이름과 같은 경기는 경기 탭 '회원과 연결 안 된 경기' 카드 → `gLink`로 t1·t2·pk를 회원 키로 일괄 수정.
- **배지**(저장 안 하고 계산): core `badges()`·`pTable()`·`topK()`(동률: 값→승→패 적은→득실, 완전 동률 공동). 일별=최다승(월례대회 날 표시), 월·분기·연=출석왕·최다 경기·최다승·승률왕(최소 5/10/20경기)·연승왕·베스트 페어(최소 3/5/10). 꺼 둔 통계 항목은 배지 없음. 통계 1위 옆 표시(진행 중 기간은 '현재 1위'), 회원 상세 '받은 배지'(끝난 기간만, 연·분기는 개별, 월·일은 개수로 묶음, 5개 넘으면 +n, 전체 보기), 오늘 탭 결과 요약에 오늘의 최다승. app은 `allBadges()`(메모)·`bdBlock(k)`.
- **순위 공개** `clubs.rankShow{m:all|top|hide,n}`: 회원은 상위 n명만/하위 n명 가림(1위는 항상), 내 순위는 맨 아래 한 줄. 통계 권한자는 전체. 규칙의 stats 권한 항목에 `rankShow` 추가.
- 회원 탭 이름 → 누구나 전적 창(`msd`, 전체 기간, `S.sdAll`). 관리자·Tier 권한·본인은 창 안 '회원 관리' → 기존 회원 창(`msheet`). 회원 탭도 경기·출석 기록을 불러옴.
- **연타 방지**: 클릭 처리에서 비동기 동작은 끝날 때까지 같은 동작 무시(`BUSY`, 버튼 비활성, 30초 안전 해제). 아래 창(.sh)은 안쪽(`data-keep`)을 누르면 닫히지 않음(모든 창 공통).
- **같은 경기 확인**: core `sameGame()`(날짜·사람·점수, 띄어쓰기·순서 무시), 개인·클럽 새 경기 저장 시 묻기. 개인 홈에 `exactDups()`로 여러 번 저장된 경기 정리 카드(`xdupFix`, 그대로 두기는 `users.dupKeep`).
- 클럽 경기 저장 시 `pk`(참여 선수 키 배열), `mtype`, 선수별 성별 `g`, `gx:1`.
- 이름 → 회원 연결: 경기 저장 시 활동명과 **정확히 같으면** 회원 키, 아니면 게스트 `g:이름`. 통계(`canon`)는 **띄어쓰기 차이는 같은 회원**으로 봄. 경기 입력 칸에 `게스트` 표시, 저장 시 비슷한 이름 확인(`simName`), 경기 탭 점선 표시와 정리 화면(`gfix`).
- 사진 AI: `gemini-3.5-flash-lite` 먼저 → 빈 결과·붐빔·한도·모델 없음이면 `gemini-3.5-flash`. 한도 초과 시 재시도 안 함. 화면 아래 경과 시간 표시(`#aist`). 이미지 1280px·품질 0.8. 사용 제한: 계정 하루 2회, 클럽 하루 5회(+대진 사진 클럽 하루 1회).

## 5. 데이터 (Firestore)

컬렉션: `users, clubs, clubMembers, clubPrivate, inviteCodes, clubApplications, sessions, sessionParticipants, games, personalGames, personalPeople, aiUsage, aiDrawUsage, queues, feedback`

**clubs 주요 필드**: `rankShow`, `mode`(round/queue/record), `qrule`, `schedType`(weekly/monthly/none), `schedM{week,dow}`, `regularDays`, 시간·코트, `noPlayEnabled`, `monthly{on,week,dow}`(월례대회 자동, 매주 클럽만), `mdays{yyyymmdd:bool}`, **`sched{yyyymmdd:{start,end,courts,title,memo,deadline,off,closed,ended}}`**(추가 모임·날짜별 변경·취소·응답 마감·모임 종료), `mtgOverride`(예전 방식, 호환 유지), `genderMode`(m/f/mixed), `memberView{tier,pos,gender}`, `tierEnabled`, `tiers`, `permissions`, `notice`, `gOk`(게스트로 인정한 이름), `lastBackupAt`, `visibility`, `joinMethod`.
**clubMembers**: `displayName, role, status, defaultPosition, tierId, gender, uid 또는 oid(미가입)`.
**users**: `name, gender, dpos, sync, syncAsked, opts, hide, xlmap, imports, dupKeep`.
**personalGames**: 직접 기록 + 클럽 경기 덧붙임(id `${uid}_${gameId}`: kind·court·mtype·note).

**색인(콘솔에 생성 완료)**: games(clubId+updatedAt), games(clubId+pk 배열+updatedAt), sessionParticipants(clubId+updatedAt), personalGames(ownerUid+updatedAt).

## 6. Firebase·외부 설정 현황

- **App Check**: reCAPTCHA Enterprise 키는 **`court-manager-abcde` 프로젝트**에서 만든 것, 앱 등록·`firebase-config.js` 반영 완료. AI Logic **기준 보호 적용**, 재생 보호 **사용 안 함**, 토큰 TTL 1시간. 개발자 전용 `App Check 진단` 버튼 있음.
- **AI 무료 한도(프로젝트 전체)**: 3.5 Flash 하루 약 20회, 3.5 Flash-Lite 약 500회(2026-09 기준 자료). 회원이 많아지면 종량제 검토.
- **플레이 스토어(2026-10-08)**: 비공개 테스트 버전 1 (1.0.0.1) 심사 전송. **업로드 키 = 10월 7일 PWABuilder 키**(SHA-1 7A:1E:17…, SHA-256 FA:4B:AC…), 10월 4일 키(87:F8…)는 사용 안 함. Play 앱 서명 키 SHA-256 4F:BD:AA…. assetlinks.json에 세 지문 등록. 새 .aab는 10월 7일 키로 Use mine + Version code 올리기(Package ID io.github.leeeh12101_stack.courtmanager).
- (이전 기록) **플레이 스토어**: 개발자 계정 승인 대기. 패키지 `io.github.leeeh12101_stack.courtmanager`, PWABuilder 서명 키 보관 완료, `assetlinks.json`에 시험 서명 지문 등록. **남은 일**: 콘솔에서 앱 생성 → `.aab` 업로드 → **Play 앱 서명 SHA-256을 assetlinks.json에 추가**(배열에 2개) → 비공개 테스트·스토어 정보·데이터 보안 양식. 개인정보처리방침 URL `…/court_manager/privacy.html`, 계정 삭제 URL `…/privacy.html#delete`.

## 7. 사용자 선호 (대화 방식)

- **아이디어를 먼저 정리 → 확정("다음") → 한 번에 코딩**. 크레딧 절약 위해 여러 항목을 묶어서 진행.
- 화면은 **간결하게**: 회색 설명 문장보다 **`?` 도움말**, 앱 전체 디자인 통일(선택 칸·카드·초록 버튼), 이모지 남발 X.
- 안내는 **비개발자 기준 쉬운 말**, 콘솔 작업은 화면 순서대로 단계별.
- 답변 끝에 **확인해 볼 항목**을 짧게.

## 8. 주요 기능 현황 (요약)

- **클럽·모임**: 만들기 3단계(성격·일정·운영 방식), 회원 추가 한 화면(이름 붙여넣기·사진·초대 링크/QR), 클럽 정보(성별·Tier 포함), 모임 일정(매주/매월/비정기), 추가 모임·날짜 이동·취소·응답 마감·모임 종료, 오늘 모임 3단계(전/진행 중/종료 후 결과 요약), 다가오는 일정 한 줄+전체 일정, 참석 바로 응답·미응답·카톡 알리기, 대진(포지션·Tier·혼성 옵션·고정 페어)·사진 대진, 순번제(실시간 코트 현황), 결과만 기록, 월례대회 표시·통계 분리, 혼성 클럽 성별·경기형태 자동 판별, 공지, 권한, 백업(엑셀), 의견 보내기/받은 의견.
- **개인**: 경기 추가(경기형태 한 줄·포지션 팀 단위·혼복 성별·점수 숫자 목록), 대회 단계·이어서 입력 제안, 선택지 관리, 엑셀 가져오기/내보내기(공통 양식 `XHDR`), 검색, 통계(요약+사람/경기 종류/포지션/대회), 클럽 동기화(첫 진입 시 묻기), 클럽 기록과 겹침 찾기·합치기, 계정 삭제.

## 9. 보류·다음 후보

- 플레이 콘솔 승인 후 등록 작업(6번 참조)
- 푸시 알림(서버 필요 → Blaze 요금제·카드 등록 결정 필요). 현재 대안: 카톡 공유 문구
- 순번제 자동 배정의 성별 옵션
- 클럽 대회 출전 기능(회원이 많아지면)
- 종목 확장(배드민턴·피클볼 등: 클럽·개인 기록에 `sport:"tennis"` 저장 중)
- 사진 Lite 모델 정확도 확인 결과에 따라 대진표 사진만 정밀 모델 우선으로 조정
