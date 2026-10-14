# Court Manager 인수인계 문서

> Claude가 GitHub 저장소에 직접 연결돼 있어요. 새 대화에서 "court_manager 저장소에서 …"라고 요청하면 최신 파일을 저장소에서 바로 읽어요.
> 기준 시점: 2026-10-14 · **BUILD `1014-1`** · 버전 표기 `v0.1`

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
| `firebase-config.js` | ⚠ **절대 덮어쓰지 말 것**(App Check 키·개발자 이메일 포함, 저장소 것이 최신) |
| `firestore.rules` | 보안 규칙. `main`에 푸시하면 **자동 게시**(GitHub Actions `.github/workflows/firestore-rules.yml`, Secret `FIREBASE_SERVICE_ACCOUNT` = 규칙 게시 전용 서비스 계정 `github-rules-deploy`). 수동 재실행: Actions › Firestore rules deploy › Run workflow |
| `sw.js` | 서비스 워커 `cm-v4`: 네트워크 우선, 3초 응답 없으면 저장본 |
| `icon.svg` | **앱 아이콘 원본**(CM 모노그램, C 안 공 실밥, 로고 1.15배(폭 약 51%, 1012-6), 숲색 `#174A43`·크림 `#F3EEE3`). PNG(`icon-192/512`, `icon-maskable-512`, `apple-touch-icon`, `favicon-32`(실밥 굵게))는 이 SVG에서 Playwright로 렌더(1012-5) |
| `manifest.webmanifest`, `privacy.html` | 스토어 대비 매니페스트, 개인정보처리방침(`#delete`에 계정 삭제 안내) |
| `tests/core.test.mjs` | core.js 테스트 138개 |
| `tests/check.py` | **점검 한 번에 돌리기** |
| `tests/smoke/` | **화면 점검**(가짜 Firebase로 앱을 띄워 클릭, 9가지 상황): `python3 tests/smoke/smoke.py` (Playwright 필요) |

## 3. 작업 규칙 (꼭 지킬 것)

1. **수정 후 항상** `python3 tests/check.py` 실행(문법 검사는 .mjs 사본으로 해야 app.js 오류를 잡음 — 1009-1에서 수정) → `✅ 모두 통과` 확인 후 전달.
   - 문법 / core 테스트 / 정의되지 않은 이름(TypeScript) / 버튼 연결·**이름표 겹침**·화면·뒤로가기
1-1. 화면을 바꿨으면 `python3 tests/smoke/smoke.py`도 실행 → `✅ 화면 점검` 확인(실행 중 오류는 check.py로 못 잡음. 1009-3의 `key` 변수 충돌이 그 예)
2. **BUILD 번호를 매번 올리기**: `app.js`의 `BUILD="MMDD-n"`. 모드 선택 화면 맨 아래 `테스트 버전 v0.1 · 1009-4`로 보여서, 사용자가 새 파일이 실행 중인지 확인함.
3. **core.js에 export를 추가하면** `app.js` 첫머리의 `import {…} from "./core.js"` 목록을 다시 만들기:
   `node -e 'import("./core.js").then(m=>{const k=Object.keys(m).sort(),fs=require("fs");let a=fs.readFileSync("app.js","utf8");a=a.replace(/import \{[^}]*\} from "\.\/core\.js";/,"import {"+k.join(",")+"} from \"./core.js\";");fs.writeFileSync("app.js",a)})'`
4. **이름표(data-*) 겹침 주의**: 클릭 처리에서 특별 분기하는 속성 `np ep pn ps pt lk nt sk st2 pr xv pk fl sc pm pu r d`는 **새 요소에 쓰지 말 것**(과거 3번 버그). 날짜는 `data-dk`, 접는 칸은 `data-sec`를 씀.
5. 계산 로직은 가능하면 **core.js에 넣고 테스트 추가**.
6. 점검 통과 후 **저장소 `main`에 바로 커밋·푸시**(GitHub Pages 자동 반영, 실패 시에만 바뀐 파일 zip 전달). 바로 이어서 코딩할 땐 중간 파일 만들지 않기, 규칙은 푸시하면 자동 게시되니 Actions 성공(`gh run list --workflow firestore-rules.yml`)만 확인.
7. **화면에 보이는 기능을 바꾸면 `NEWS`(app.js) 맨 아래에 새 묶음 추가**: `[대상, 제목, 한 줄 설명]`, 대상은 all·club·personal·권한 키. 사람마다 `users.newsSeen`(본 묶음 수)까지 건너뛰고 밀린 항목을 한 번에 보여 줌. 새 가입자는 처음부터 본 것으로 처리.
8. **누를 수 있는 곳 표시 규칙**: 목록 줄은 `.li.tap`이면 자동으로 `›`(이동이 아닌 줄은 `noar`), 문장 속 글자는 `.lnk`(주의는 `.lnk.warn`) 점선 밑줄, 아래 창은 제목+닫기 머리줄·바깥 누르기·뒤로가기로 닫힘.
9. Python으로 패치할 때 문자열 정확히 일치 확인(실패 목록 출력) → 실패 0이어야 함.

## 4. 코드 구조 (app.js)

- 상태 `S`, 동작 `A`(data-a로 연결, 약 252개), 화면 `V`(go("화면")), 클럽 탭 `T`(today·games·stats·members·settings), 개인 탭 `P`(home·games·stats·settings), 뒤로가기 `BACK`.
- 렌더: `render()`, 입력 유지 재렌더 `keepR()`/`rer()`, 클럽 데이터 `load()`, 개인 데이터 `pLoad()`.
- 쓰기 함수 `setDoc/updateDoc/deleteDoc/writeBatch`는 **감싼 버전**(회원 화면 미리보기 중 저장 차단 + 회원 명단 캐시 무효화).
- 폰 저장소 `IDB`는 3초 안에 안 열리면(iOS IndexedDB 멈춤 대비) 그 실행 동안 저장 없이 서버에서 바로 받음(1012-9). 개인 설정 클럽 동기화 줄에 가져온 경기 수·꺼짐 표시.
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
- **로딩 규칙**: 첫 데이터 전에는 빈 상태 문구 대신 로딩 원. 클럽은 탭 첫 방문 시 `S.cready=false`(`S.tvis`), 개인은 `S.pready`(pLoad 끝에 1, `A.pReload`).
- **뒤로가기(1010-1)**: 받침 기록은 `hTop()`이 사용자가 화면을 누를 때만 최대 4칸(`history.state.d`) 쌓음(누르지 않고 쌓은 기록은 Chrome이 건너뛰어 앱이 꺼졌음). popstate에서는 다시 쌓지 않음. 클럽·개인 화면의 다른 탭 → 오늘/홈 탭, 모드 화면은 "한 번 더 누르면 종료"(`S.exitArm`, 받침을 0으로 되돌림·`S.hSkip`).
- 개인 상대 카드·이름 요약: 단식(`isSgl`)은 "단식 · 상대로"로 따로 집계, 단식이 없으면 기존 두 칸.
- **결과 공유·지난달 요약(1010-2)**: 오늘 탭 결과 카드 `doneShare`(최다승 `topW()`·경기 수·참석 수 + 링크, 관리자면 `?join=초대코드`). 지난달 요약 `rcCard`(core `monthRecap`·`prevYm`), 매달 1~15일·닫으면 `cm_rc_{p|c_클럽id}`에 그달 저장. 개인 홈 `rcP()`, 클럽 오늘 탭 `rcClub()`(games를 syncQ로 한 번 받아 `S.rc`, 클럽 지난달 최다승 포함).
- **페어에게 보내기(1010-3)**: 개인 복식 기록을 `guestShares`{kind:"p",clubId:"",clubName:대회명,from,guests:[{n:페어,games}]}로 공유(`pShare`, `pgOut`은 label·cat·kind·stage·court·order·성별 포함, 메모 제외). 대회 복식 저장 시 끝(결승 또는 본선 패배)이면 `tourOf()`로 대회 경기를 모아 보낼지 물음. 경기 상세 `pShare1`, 대회 묶음 `pShareG`(`pairOf`: 파트너가 모두 같을 때만). 받는 쪽은 기존 `gsImp`/`gsGo`(kind p면 필드 유지). 이어서 입력은 페어 이름·포지션·성별 유지. 규칙: guestShares create에 kind p 허용.
- **메모 화면(1011-1)**: `memoView()` 날짜별(경기 메모를 날짜 묶음, 접기 키 `md:날짜`, 최근 날짜만 펼침)·사람 메모(이름순, 누르면 상대 카드). 보기 상태 `S.form.pmv`.
- **포백 테스트(1011-2)**: 로그인 없이 가능. 진입 = 로그인 화면·모드 선택·클럽 목록 배너(`FT.banner()`), 개인 홈 카드(`FT.pcard()` → `ftMy`). 링크 `?ft=`(초대: base64url `{v:1,n,h,a}`) → 바로 `ftStart`, `?fr=`(돌려주기 `{v:1,A,B}`) → `ftMatch`. 잘못된 링크는 무시. 답 배열 17칸(`FT_KEYS`, 보기 번호), 손은 `h`. 저장: 폰 `localStorage cm_ft`{r:결과,c:궁합,nick} → 로그인하면 `users.ft`·`users.ftc`(최근 5개, `FT.sync()`). 운영 동점(주도=안정, 연결 아님)은 7번 답, 주도·안정 둘 다 2표 이상이면 '전략형' 한 줄. 측정 `ftStats/{done|inv|invDone}.n`(increment, 규칙: 1씩만, 개발자만 읽음, `ftMy` 하단에 개발자용 표시). 문구는 ft-data.js만 고치면 됨. 삭제·초대 보강(1012-4): 결과·궁합 삭제는 지운 at 목록(`cm_ft.del`·`users.ftDel`)으로 걸러 다른 기기에서도 안 살아남. 파트너 응답은 하위 컬렉션 `ftShares/{코드}/r/{id}`{B,at}(여러 명, 추가만) → `checkInv`가 모두 받아 궁합 기록에 저장(1명/여러 명 알림), 결과 링크 `?fc=코드-응답id`. 이미 결과가 있는 사람은 초대 화면에서 "이 결과로 바로 궁합 보기"(보낼지 물어봄 `ftUseOld`). 내가 보낸 초대를 내가 열면 도착분 궁합 또는 대기 화면. 예전 `B` 필드도 읽음. 쉬운 버전·전략(1012-2): 시작 화면은 재미 테스트 톤(`START`), 기본 버튼 = 상세 테스트, 보조 = 왕초보용 간단 테스트(`EQ` 9화면, 답 8칸 `EASY_KEYS`: 편한 리턴 쪽+포/백핸드 자신감 → 위치, e1·e3~e6 운영, e2 커버), 결과 같은 9유형, 쉬운 결과는 샷 분석 대신 "상세 테스트로 샷까지 보기". `ftScore`가 답 길이(8/18)로 구분. 전략: 개인 `STRAT`(운영별 서브·리턴·밀릴 때), 궁합 `ftTeam`(포메이션·조합별 플랜). 참여 수 `ftStats` done(상세)·doneE(쉬운)·inv·invDone → 개발자 계정 모드 선택 화면·내 복식 캐릭터 화면. 앨리 → 사이드라인/바깥. 궁합 공유(1012-1): 초대 시 `ftShares/{8자리}`{A,owner,at,exp} 생성 → 링크 `?ft=코드`. 파트너가 마치면 B를 자동 기록(규칙: B는 한 번만, 30일). 앱을 열 때 `checkInv()`가 내 초대(owner 조회 + 폰의 `cm_ft.inv`)에 B가 오면 궁합 기록에 저장하고 토스트. 결과 링크 `?fc=코드`. 예전 긴 링크(`?ft=`base64, `?fr=`)도 열림. 카카오톡 브라우저면 "앱에서 열기(intent)·다른 브라우저로 열기" 안내(`S.ftLink`). 샷 문항 화면(1011-8): 손에 맞춰 자리별로 묶어 물음(`SHOT_GROUPS`, 작은 코트 아이콘 `mini()`), 답 키(a~h)·계산은 그대로. 플레이 분석은 요약 칩+한 줄 판정+조심할 샷 상자, 실전 기록은 "기록 없음"·부족 안내 두 줄. 계산 v2(1011-7): 13문항(역할 문항 `role` 추가, 운영 표에 포함), 샷 5단계(+1/+0.5/0/-0.5/-1), 위치 가중치 `W`(바깥 1.25·센터 1·발리 0.75, 동호인 커버 범위 고려), PMAX 12.5. 예전 결과·링크(v1, 17칸)는 `ftUp()`으로 옮겨 열림. 근거 자료: 지기 페르난데스 자리 기준, 루이 카이에 복식 스타일(`ftCayer`), 복식 공유 정신 모델 연구(약속 안내 `AGREE`), TSEI-10(5단계 근거). 결과 화면(1011-6): 상단 뒤로·COURT MANAGER → ① 핵심 요약(`summary`: 유형·한 줄·태그 `COVTAG`·포백 %·추천/선호 자리 `ftSeatLabel`+이유) → 궁합 보기·결과 카드 저장 → ② 플레이 분석(`detail`: `ftAnalysis` 4줄[강한 구역·포/백핸드·센터/바깥·조심할 샷], 실전 기록 비교 `ftReal` ← app `realRec()`이 개인 기록 중 포지션 입력한 복식 경기 승률 계산(필요하면 pLoad), 자리별 2×2 접힘) → ③ 플레이 스타일 접힘. 궁합 경고에 둘 다 포핸드 의존/후위형/네트형 추가(`CAUTION2`). 배너·목록에는 유형 이름 숨김. 공유 카드는 캔버스로 코트 바닥·라인·공(`courtBg`).
- **나에 대한 메모(1012-10)**: 경기 탭 메모 `날짜별 · 사람 메모 · 나`(`S.form.pmv` = date·ppl·me). 일지는 `personalNotes`{ownerUid,date,tag,text}(본인만, 꼬리표 `SNT` 기술·컨디션·장비·목표, pLoad에서 `S.pn`), 고정 메모는 `users.selfPin` → 개인 홈 맨 위 한 줄(`pinLine`). 날짜별 보기에서 그날 나의 메모가 경기 메모 위에. 새 경기 저장 직후 토스트 '나에 대한 메모 남기기'. 입력 창 `snSheet`(`S.sne`).
- **메모 삭제(1012-10)**: 메모 옆 ✕(`gnDel` 경기 메모=note 비우기, `pmDel` 사람 메모=privateNote 비우기, `snDel` 일지 삭제) → 확인 후 지우고 토스트 '되돌리기'. 상대 카드에도 '메모 삭제'.
- **주차권·모임 사진(1012-11)**: 클럽 설정 `parkOn`·`photoOn`(기본 꺼짐, 관리자). 설정 칸 안에서 '올릴 수 있는 사람'(운영진/지정 회원/회원 모두 → `permissions.park`·`permissions.photo`, `all` 플래그는 규칙 can()에도 반영). 권한 목록(`PALL`)에서는 빠지고 savePerm은 이 둘을 덮어쓰지 않음. 사진 1장 = `clubPhotos`{clubId,date,kind,by,byName,exp,data(base64 1280px),w,h,at}, 목록 = `photoDays/{클럽_날짜_종류}`{clubId,date,kind,n,items{id:{by,bn,at,exp,t,tn,tt}}}. **주차권**: 모임 1주 전부터(`parkOpen`) 30장, 여러 장 한 번에 올리기, 삭제 시각 `parkExp` = 당일 자정과 끝난 뒤 3시간 중 늦은 때. 회원은 '가져가기'(transaction으로 안 쓴 것 하나에 t=나, 동시에 눌러도 겹치지 않음)·'돌려놓기', 관리자·올리기 권한자는 '전체 주차권' 목록. 사진은 보이는 것만 받음(`cpImgs`). **QR(1012-12)**: 올릴 때 jsQR(`vendor/jsQR.js`, Apache-2.0, 지연 로드)로 QR 내용을 읽어 `items[id].q`·`clubPhotos.qr`에 저장, 같은 QR은 건너뜀. 볼 때 QRious로 흰 바탕에 새로 그림(`cpQr`, `tk`) + '원본 사진 보기'(`cpOrig`). QR을 못 읽은 주차권은 사진 그대로('사진' 표시), 관리자는 'QR 다시 읽기'(`cpRescan`). **올리기(1012-13)**: transaction 대신 batch(`photoDays` merge + `n:increment(1)`, 규칙이 n==items.size·한도 확인), 단계마다 시간 제한(`TO`: 줄이기 20초·올리기 45초), 진행 표시(`S.cph.up`, 버튼 자리), 실패 시 오류 코드 표시. 사진 줄이기는 Image → 실패 시 createImageBitmap. 모임 사진 1024px.
- **새 버전 알림(1012-13)**: 앱을 다시 볼 때 `app.js` HEAD(ETag) 비교, 바뀌면 '새 버전이 있어요 · 새로고침' 토스트(`verChk`, 5분에 한 번). sw.js는 3초 안에 응답이 없으면 저장본을 먼저 열기 때문에 예전 버전이 남을 수 있음. **모임 사진**: 당일부터(`grpOpen`, 7일 안) 3장, 올린 지 7일 보관. 만료분은 클럽을 열 때 `cpDays`→`cpClean`이 삭제. 버튼: 모임 카드 아래 줄(`heroBar`), 결과 카드(`doneCard` 한 줄 버튼), 경기 탭 날짜 묶음(`cpRow`). 보기 창 `cpSheet`(`S.cph`).
- **오늘 탭 정리(1013-1)**: 모임 카드 `heroFull`(머리줄=라벨+수정, 배지 `heroPills`는 시간 아래 줄: 일정 변경·월례대회·진행 중·참석 마감), 아래 줄 `heroBar`=주차권·모임 사진, `heroUp(m)`=카드에 보인 모임 뺀 '다른 일정'. 운영진 줄 `staffBar`(`.sbar`: 참석 마감/다시 열기·대진 만들기 n명·모임 종료·+ 일정, 미리보기 중 숨김). 참석 카드(`myCard`)는 날짜 반복 없이 '참석하시나요? · 마감 …'. 모임 끝난 날은 결과 카드 + 다음 모임 `heroMini`(안에 참석 버튼 `miniResp`). 결과 카드: 숫자 세 칸·최다승·모임 사진 썸네일(`cpThumbs`, 점선 + 칸 `cpAddG`)·미입력 줄·버튼 줄(결과 공유·주차권). 사진 전체 화면 `cpViewer`(`S.cpv`, `.phv*`, 밀어서 넘기기, 저장·삭제 `cpDelete`). ⚠ `.pv` 클래스는 사진 입력 미리보기용으로 이미 있음.
- **대진 카드(1013-1)**: `drawSec(m)` 제목 '대진 n회차 · n명' + `관리 ⋯`(`dmSheet`: 대진 수정·다시 만들기·사진으로 입력·이미지로 저장·작성자 지정, `dmGo`), 회원은 '이미지로 저장'. 진행 중이면 `rListLive`(지난 회차 접기 `S.form.rpast`, 지금/다음 표시 `.rh.now`). 쉬는 사람 `.rest.t` 한 줄. 대진 없으면 빈 카드 + 대진 만들기.
- **1013-2**: 다음 모임 카드 `heroMini` 3줄(라벨+수정 / 날짜·시간 / 참석 상태·주차권), 운영진 줄에서 대진 만들기 뺌(같은 폭). 대진 만들기 옵션 `?`(`dhd`, HELP dmode·dtier·dgm). 대진 바꾸기 확인 `cx2`: 페어·상대 반복 증가(`cx2c` 기준 대비), 연속 휴식 2회차 이상, 경기 수 차이 2 이상, Tier 내/균형·혼복/같은 성별·포지션 위반 → pick의 확인 창. 경기 수정: 대진 경기도 회차 변경 가능(바꾸면 새 문서·source manual, 원래 문서 deleted). 결과 카드 미입력 수는 대진표 자리 id와 연결된 경기만.
- **1013-3**: 개인 통계 '몇 번째 경기별'을 **그날 내가 치른 순서**로(`dayOrd`: 대회 제외, 하루 1경기거나 그날 경기 모두 order가 있고 겹치지 않을 때만, 클럽 회차 아님) + `?` 설명(HELP pord). 대회 탭: 대회 성적 줄 누르면 경기 순서대로 펼침(`pgtog` 키 `t:라벨+첫날`), 단계별 성적, 대회 안 몇 번째 경기별(HELP tord; `tourResults`가 `gs`(단계순 정렬)·`sq`(단계가 모두 있고 겹치지 않음) 반환). sw `cm-v16`.
- **1013-4**: 대진 조건 우선순위. 대진 만들기에 '먼저 맞출 조건' 목록(켜 둔 조건만, ↑↓ `dpMv`, '기본 순서로' `dpRst`). 키 `DPD=[gen,pair,pos,tier,opp]`, 기본 순서면 예전 가중치 `DPL`, 바꾸면 순위 가중치 `DPR=[40,16,7,3,1.2]`(`dW`). 대진 생성 시 순서를 `clubs.dprio`에 저장(규칙: draw 권한, dprio만, 리스트 8개 이하). `buildDraw`: 경기 수가 같으면 직전 회차에 쉰 사람 먼저(`rp`). 미리보기에 '지키지 못한 조건' 요약(`cx2(R,1)`; 페어·상대 반복은 고르게 나눈 몫(`fair`)을 넘을 때만), 누르면 상세(`dsumO`). sw `cm-v17`.
- **1013-5**: 대진 만들기의 대진 방식·성별·Tier·순서 목록을 **조건 칩 한 줄**로 통합(`DC`, 누른 순서=우선순위 `dcTap`/`dcRst`, 혼복↔같은 성별·Tier 비슷하게↔균형 배타 `DCX`, 랜덤=포·백 끔). `clubs.dprio`에 칩 키 배열 저장(예전 값은 무시하고 기본 `DCD`). `gen`이 칩에서 mode/gmode/tier를 만듦, `dW`가 칩→가중치(기본 순서면 `DPL`). `cx2`는 이제 항목 객체 `{c,i,w,d}`(페어·상대 반복에 회차 목록) 반환, `cxHtml`·`askH`(#popmsg에 HTML, 안쪽은 span만 — `#pop div` 스타일 때문)로 바꾸기 확인·미리보기 상세를 사람별 줄로, 새로 생긴 것 진하게/원래 있던 것 흐리게. sw `cm-v18`.
- **1013-6**: 대진 조건 칩을 종류별 줄로 정리(`DCG`: 반복 피하기·포지션·성별·Tier, 왼쪽 이름 칸 70px, 칩 2칸 격자·같은 크기, 1칸 줄은 빈 자리 `.ph`). 번호는 칩 왼쪽 위 모서리 배지(글자 안 밀림), 아래에 '맞추는 순서' 요약(`DCS`), 기본으로는 제목 오른쪽. Tier 끈 클럽·성별 안 나누는 클럽은 해당 줄 숨김. 360·390 폭 확인. sw `cm-v19`.
- **1013-7**: 오늘 탭 정리. 큰 모임 카드 `heroFull`: 수정은 '수정 ›' 글자, 아래 줄(`.hbot`)에 내 참석 상태(`heroMe`, 모임 당일 아니면; 미응답이면 참석/불참 버튼, 주차권 칩은 질문 줄 오른쪽)와 주차권·사진 칩(`.hchip` 테두리), 첫 경기 줄은 `myCard(m,1)`. 당일이 아니면 아래 참석 카드 없음. 알약 `.hpill` 은은하게, 운영진 줄 노란색 없앰, 대진 빈 상태 왼쪽 정렬 + 보조 버튼 2칸(`.dempty`), 카드 둥글기 16·버튼 14·카드 그림자 옅게, 머리줄 👁 없앰. sw `cm-v20`.
- **1013-8**: 주차권 화면에 올린 사람·가져간 사람 요약(`.cpsum`, 많은 순, 가져간 사람은 메모 있는 장수 '(게스트 n)'). 가져간 주차권 메모 `items[id].m`(20자, 가져간 본인만 `cpMemo`, 돌려놓으면 삭제). 규칙 변경 없음. sw `cm-v21`.
- **1013-9**: 내 주차권 '카톡으로 게스트에게 보내기'(`cpSend`): 오늘 게스트 참석자 칩(`cpGPick`) 또는 직접 입력 → 메모 '게스트 이름' 저장(`cpSetM`, 공통) + Web Share로 QR(없으면 원본) 이미지 파일 공유(클릭 직후 동기로 File 만들어 share — 사용자 동작 유지). 공유 미지원이면 이미지 저장 + 안내. sw `cm-v22`.
- **1013-10**: 고정 페어 게임 수(`dr.pairs` 항목 `[a,b,n?]`, 화면 '게임 수' 전부/1/2/3/직접 `S.form.pgn`·`#pgnv`). `buildDraw`는 같이 한 게임(`fpc`)이 n을 채우면 묶지 않음. 바꾸기 확인은 n 있는 페어는 'n게임 중 m게임만 같이 해요'(갈라진 게임이 있을 때만). 대진 화면 선택 목록 이름이 비던 문제 수정(`dnp`, `nmOf`). 전체 글자 줄바꿈 `word-break:keep-all`. sw `cm-v23`.
- **1014-1**: 대진표 이미지(`drawImg(rs,meta,lr)`). '이미지로 저장·공유'(`exportDraw`) → 아래 창 `dxpSheet`(팀 배치 `위아래|좌우`, seg 키 `dlay`, 폰 `cm_dlay`에 기억, 기본 좌우) → `dxpGo`→`exportGo(lr)`. 위아래 = 원래 모양 + 연두 선 가운데 작은 vs 원, 좌우 = 왼쪽 팀 오른쪽 정렬·오른쪽 팀 왼쪽 정렬 + 연두 vs 원. 맨 오른쪽 '쉬는 사람' 칸(크림 바탕, `restOf(r)` = 앱 '쉼' 줄과 같은 기준, 이름 사이 가운데점·점 위치 고정, 5명 이상 한 줄 3명, 넘치는 이름은 …). 앱 안 대진 카드는 그대로. sw `cm-v24`.
- **참석 마감(1013-1)**: 이름 '응답 마감'→'참석 마감'. `mClosed(m)` = sched.reopen 아니고 (sched.closed 또는 자동 마감 시각 지남). 자동 `clubs.rclose{t:'none'|'h'|'d',n,at}`(설정 › 모임 일정, 규칙 schedule 키에 rclose), `autoAt`·`closeLab`. 마감 시 확인, 다시 열면 `reopen:true`. 참석자 목록 포지션 빈 값은 '포or백', 시간 칸은 전체가 아닌 사람만. 경기 결과 삭제는 경기 편집의 '이 경기 결과 삭제'(확인+되돌리기).
- **아래 창 그리는 위치**: 전적 창(`sSheet`)은 clubHome, 상대 카드(`pmSheet`)는 personal 화면 맨 아래에서 그림(탭과 무관).
- 개인: 홈 최근 5경기, 상대 카드(만난 경기 수·파트너/상대 따로·최근 경기·포지션별 접기·메모, 이름 띄어쓰기 무시), 경기 탭 보기 방식 `pgv`(전체/날짜별/클럽·대회별, core `groupLabel`).
- 오늘 탭 이름 → 대진 창(`mSheet`): 회차 순으로 대진 한 줄(회차·시간·코트 고정 칸 + 이름 4칸 오른쪽 정렬), 쉬는 회차는 사이에 '휴식' 줄, 오늘이면 다음 경기 줄 연두색 강조, 파트너·상대 횟수는 아래.
- **회원 화면 미리보기**: 관리자는 선택 창(일반 회원/운영진/취소, `pvSheet`), 휴대폰 뒤로가기 = 미리보기 끝내기, 끝내면 시작한 탭으로(`S.pvTab`).
- **초대 가입 흐름**: 이름 화면에 초대 안내 → 가입 후 `goClub(cid,1)`로 그 클럽 오늘 탭 → 미가입 회원이 있으면 '명단에 내 이름이 있나요?'(`pickSheet`) → 고르면 내 clubMembers `displayName`=그 이름, `linkReq`=oid → 관리자 화면의 기존 '같은 사람일 수 있어요'(linkPairs) 카드로 연동.
- **모임 당일 내 카드**: `curR()` 이번 회차 = 결과가 모두 입력됐거나 다음 회차 시각이 지난 회차를 건너뛴 첫 회차. 오늘 경기 결과는 today 로드 때 `S.tg`(clubId+date). 첫 경기/이번 회차/휴식/오늘 경기 끝. 모임 당일엔 카드가 공지 위로.
- 클럽 만들기: 기본값 비공개·초대만, 선택 설명 한 줄, 회차제 추천, 단계 표시. 보조 글자색 `--sub:#5C635F`.
- 개인 용어: 구분 / 클럽·대회 이름 / 모임 종류·부서(레벨) / 단·복식 / 코트 바닥 / 몇 번째 경기·대회 단계. 엑셀 가져오기는 옛 제목도 인식.
- **코트 번호**: `clubs.cnum`(예: ["5","6","8"], 설정 › 정기 모임, 규칙 schedule 항목에 `cnum`). 표시는 `cN(i)`/`cLab(g)` → '5번'(없으면 '1코트'). 경기 저장 시 `cname` 함께 저장(사진 대진의 시간대별 번호도 유지). 시간대별 변경·경기 중 옮기기는 아직 없음(2단계 후보).
- **게스트 기록 보내기**: 운영진(result)이 `guestShares/{8자리}`{clubId,clubName,date,createdBy,exp(30일),guests:[{n,games}]} 생성 → `?gs=코드` 링크. 받는 사람은 `gsPending` → 화면 `gsImp`에서 이름 고르기 → 개인 기록으로 복사(`importId` gs_…, 같은 경기는 건너뜀, '가져오기 취소' 가능). 진입: 오늘 모임 결과 카드, 경기 탭 날짜 묶음(펼쳤을 때), 이름별 '모든 경기 보내기'.
- **통계 정리(1009-3)**: 기준 날짜는 사용자가 직접 옮긴 경우(`S.form.pman`)만 유지, 통계 탭 진입 시 최신으로(`statReset`), 클럽·모드 전환 시 날짜·필터 초기화. 출석은 미가입 회원 포함(게스트 제외, 키=`key(p)`). 전적·페어 창도 정기/월례 필터 적용. 승률 최소 경기 `WMIN`(일3·월5·분기10·연20), 페어 `PMIN`(일2·월3·분기5·연10)·페어는 승률 순. 순위 번호는 동률 규칙(값→승→패→득실) 후 완전 동률이면 공동(1,1,3), 순위 공개 경계의 공동 순위는 함께 보임. 출석 순위는 항상 전체 공개. 설정의 통계 항목은 '순위 탭'/'회원 상세 창'으로 나눔. 순위 탭을 모두 끄면 통계 권한 없는 회원에게 통계 탭 숨김.
- 클럽 경기 저장 시 `pk`(참여 선수 키 배열), `mtype`, 선수별 성별 `g`, `gx:1`.
- 이름 → 회원 연결: 경기 저장 시 활동명과 **정확히 같으면** 회원 키, 아니면 게스트 `g:이름`. 통계(`canon`)는 **띄어쓰기 차이는 같은 회원**으로 봄. 경기 입력 칸에 `게스트` 표시, 저장 시 비슷한 이름 확인(`simName`), 경기 탭 점선 표시와 정리 화면(`gfix`).
- 사진 AI: `gemini-3.5-flash-lite` 먼저 → 빈 결과·붐빔·한도·모델 없음이면 `gemini-3.5-flash`. 한도 초과 시 재시도 안 함. 화면 아래 경과 시간 표시(`#aist`). 이미지 1280px·품질 0.8. 사용 제한: 계정 하루 2회, 클럽 하루 5회(+대진 사진 클럽 하루 1회).

## 5. 데이터 (Firestore)

컬렉션: `personalNotes, photoDays, clubPhotos, users, clubs, clubMembers, clubPrivate, inviteCodes, clubApplications, sessions, sessionParticipants, games, personalGames, personalPeople, aiUsage, aiDrawUsage, queues, feedback`

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
- **답은 항상 한국어**(영어로 바뀌면 싫어함).
- **화면은 기본적으로 깔끔하게 정렬**: 종류별로 묶고, 같은 크기·같은 세로선, 들쑥날쑥 금지. 노란색은 경고에만. 말하지 않아도 맞출 것.
- 화면을 바꾸면 **폭 360·390에서 캡처해 넘침·정렬 확인 후** 올리고, 큰 변화는 **바꾸기 전·후 나란히** 보여주기.
- 문구는 사용자가 아는 말로(내부 용어 X). "1로"처럼 짧은 답이 애매하면 추천안 기준으로 진행하고 어떻게 해석했는지 밝힐 것.

## 8. 주요 기능 현황 (요약)

- **클럽·모임**: 만들기 3단계(성격·일정·운영 방식), 회원 추가 한 화면(이름 붙여넣기·사진·초대 링크/QR), 클럽 정보(성별·Tier 포함), 모임 일정(매주/매월/비정기), 추가 모임·날짜 이동·취소·응답 마감·모임 종료, 오늘 모임 3단계(전/진행 중/종료 후 결과 요약), 다가오는 일정 한 줄+전체 일정, 참석 바로 응답·미응답·카톡 알리기, 대진(포지션·Tier·혼성 옵션·고정 페어)·사진 대진, 순번제(실시간 코트 현황), 결과만 기록, 월례대회 표시·통계 분리, 혼성 클럽 성별·경기형태 자동 판별, 공지, 권한, 백업(엑셀), 의견 보내기/받은 의견.
- **개인**: 경기 추가(경기형태 한 줄·포지션 팀 단위·혼복 성별·점수 숫자 목록), 대회 단계·이어서 입력 제안, 선택지 관리, 엑셀 가져오기/내보내기(공통 양식 `XHDR`), 검색, 통계(요약+사람/경기 종류/포지션/대회), 클럽 동기화(첫 진입 시 묻기), 클럽 기록과 겹침 찾기·합치기, 계정 삭제.

## 9. 보류·다음 후보

- **실기기 확인 필요**: 주차권 '카톡으로 게스트에게 보내기'(Web Share 파일 공유)가 안드로이드·아이폰 카톡에서 사진으로 잘 가는지
- 대진 조건 클럽 기본값을 설정 화면에도 둘지(지금은 대진 화면에서 고른 순서가 `clubs.dprio`에 저장되는 방식)
- 고정 페어 두 번째 선택 칸 기본값이 첫 칸과 같은 사람으로 뜸(작은 다듬기)
- 야외 모임 출석 체크(보류 중)

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
규칙: 앱 수정은 아이디어 먼저 정리 → 내가 "다음" 하면 코딩 / 점검 통과 후 main에 바로 커밋·푸시 /
firebase-config.js는 절대 덮어쓰지 말 것 / Firestore 규칙은 푸시하면 GitHub Actions로 자동 게시됨 /
답은 한국어로, 화면은 늘 깔끔하게 정렬해서 360·390 폭 캡처로 확인 후 올리기.
이번 작업: (여기에 적기)
```
