#!/usr/bin/env python3
"""Court Manager 점검 스크립트 — 저장소 루트에서: python3 tests/check.py
1) 문법  2) core.js 테스트  3) 정의되지 않은 이름(TypeScript)  4) 버튼 연결·이름표 겹침·화면·뒤로가기
"""
import json, os, re, shutil, subprocess, sys, tempfile, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
ok = True

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    return r.returncode, (r.stdout + r.stderr).strip()

# 1. 문법
for f in ["app.js", "core.js", "ft.js", "ft-core.js", "ft-data.js", "sw.js"]:
    # .js 그대로는 ES 모듈 문법 오류를 놓칠 수 있어 .mjs 사본으로 검사
    tmp = os.path.join(tempfile.mkdtemp(), os.path.basename(f) + (".mjs" if f != "sw.js" else ""))
    shutil.copy(f, tmp)
    c, o = run(["node", "--check", tmp])
    print(f"[문법] {f}: {'OK' if c == 0 else o}")
    ok &= c == 0

# 2. core.js 테스트
for t in ["tests/core.test.mjs", "tests/ft.test.mjs"]:
    c, o = run(["node", t])
    print(f"[테스트] {t.split('/')[-1]}:", o.splitlines()[-1] if o else o)
    ok &= c == 0

# 3. 정의되지 않은 이름 (TypeScript가 있으면)
tsc = shutil.which("tsc") or next(iter(glob.glob("/home/*/.npm-global/lib/node_modules/typescript/lib/tsc.js") +
                                          glob.glob("/usr/lib/node_modules/typescript/lib/tsc.js")), None)
if tsc:
    d = tempfile.mkdtemp()
    for f in ["app.js", "core.js", "ft.js", "ft-core.js", "ft-data.js"]:
        shutil.copy(f, d)
    open(os.path.join(d, "firebase-config.js"), "w").write('export const firebaseConfig={};export const appCheckKey="";export const devEmail="";\n')
    json.dump({"compilerOptions": {"allowJs": True, "checkJs": True, "noEmit": True, "target": "es2022", "module": "es2022",
               "moduleResolution": "bundler", "lib": ["es2022", "dom", "dom.iterable"], "strict": False, "skipLibCheck": True},
               "files": ["app.js", "core.js", "ft.js", "ft-core.js", "ft-data.js"]}, open(os.path.join(d, "tsconfig.json"), "w"))
    cmd = ["node", tsc, "-p", os.path.join(d, "tsconfig.json")] if tsc.endswith(".js") else [tsc, "-p", os.path.join(d, "tsconfig.json")]
    _, o = run(cmd)
    errs = [l for l in o.splitlines() if re.search(r"TS(2304|2552|2451|2300|1\d{3})\b", l)]
    print(f"[이름] 정의되지 않은 이름·중복 선언: {len(errs)}건", *errs[:10], sep="\n  ")
    ok &= not errs
else:
    print("[이름] TypeScript가 없어 건너뜀")

# 4. 버튼 연결·이름표 겹침·화면·뒤로가기
js = open("app.js").read()
h = js[js.index('document.addEventListener("click",e=>{const b=e.target.closest("[data-np]")'):js.index('if("serviceWorker"')]
branch = [a for a in re.findall(r'closest\("\[data-([a-z0-9]+)\]"\)', h) if a not in ("a", "keep")]
tags = re.findall(r'<(?:span|div|button|b|details|summary|input)[^<>]*?>', js)
clash = [t[:80] for t in tags if "data-a=" in t and any(re.search(r"\bdata-%s=" % a, t) for a in branch)]
a0 = js.index("const A={") + 8; d = 0
for j in range(a0, len(js)):
    if js[j] == "{": d += 1
    elif js[j] == "}":
        d -= 1
        if d == 0: break
A = js[a0:j + 1]; keys = []; d = 0
for m in re.finditer(r"[{}]|(?:(?<=[{,\n])\s*(?:async\s+)?([A-Za-z_]\w*)\s*(?:\(|:))", A):
    t = m.group(0)
    if t == "{": d += 1
    elif t == "}": d -= 1
    elif d == 1 and m.group(1): keys.append(m.group(1))
# 포백 테스트(ft.js)의 동작·화면·뒤로가기도 함께 확인
fj = open("ft.js").read()
def objkeys(src, start):
    a0 = src.index(start) + len(start) - 1; dd = 0
    for jj in range(a0, len(src)):
        if src[jj] == "{": dd += 1
        elif src[jj] == "}":
            dd -= 1
            if dd == 0: break
    body = src[a0:jj + 1]; out = []; dd = 0
    for mm in re.finditer(r"[{}]|(?:(?<=[{,\n])\s*(?:async\s+)?([A-Za-z_]\w*)\s*(?:\(|:))", body):
        tt = mm.group(0)
        if tt == "{": dd += 1
        elif tt == "}": dd -= 1
        elif dd == 1 and mm.group(1): out.append(mm.group(1))
    return out
fa = objkeys(fj, "const FA = {"); fv = objkeys(fj, "const FV = {"); fb = objkeys(fj, "const FB = {")
keys += fa
ftags = re.findall(r'<(?:span|div|button|b|details|summary|input)[^<>]*?>', fj)
clash += [t[:80] for t in ftags if "data-a=" in t and any(re.search(r"\bdata-%s=" % a, t) for a in branch)]
refs = set(re.findall(r'data-a="([A-Za-z_]\w*)"', js + fj))
missing = sorted(r for r in refs if r not in keys); dups = sorted({k for k in keys if keys.count(k) > 1})
v = js.index("const V={"); vk = set(re.findall(r"\n(\w+):\(\)=>", js[v:js.index("const A={")]))
vk |= set(fv); gos = set(re.findall(r'go\("(\w+)"', js + fj)); noscr = sorted(g for g in gos if g not in vk)
bk = set(re.findall(r"(\w+):\(\)=>", re.search(r"const BACK=\{(.*?)\};", js, re.S).group(1))) | set(fb)
noback = sorted(x for x in vk if x not in bk and x not in ("login", "name", "mode", "boot", "clubs0"))
print(f"[연결] 동작 {len(keys)}개 · 연결 안 됨 {missing} · 중복 {dups}")
print(f"[이름표] 클릭 분기 속성 {branch} · 겹침 {clash}")
print(f"[화면] 없는 화면 {noscr} · 뒤로가기 없음 {noback}")
ok &= not (missing or dups or clash or noscr or noback)
print("BUILD:", re.search(r'BUILD="([^"]+)"', js).group(1))
print("\n✅ 모두 통과" if ok else "\n❌ 확인 필요")
sys.exit(0 if ok else 1)
