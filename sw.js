const V = 'cm-v27';
const SHELL = ['./', 'index.html', 'app.css', 'app.js', 'core.js', 'ft.js', 'ft-core.js', 'ft-data.js', 'privacy.html', 'firebase-config.js', 'manifest.webmanifest', 'icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // Firebase 요청은 캐시하지 않음
  // 네트워크 우선, 단 3초 안에 응답이 없으면 저장본으로 먼저 열기(느린 망에서 빈 화면 방지)
  // 브라우저 저장분(최대 10분)을 건너뛰고 서버에 바뀌었는지만 확인(안 바뀌면 304로 짧게 끝남) → 배포 직후에도 새 파일
  const req = e.request.mode === 'navigate' ? new Request(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }) : new Request(e.request, { cache: 'no-cache' });
  const net = fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); } return r; });
  e.respondWith(new Promise(res => {
    let done = false; const go = r => { if (!done && r) { done = true; res(r); } };
    const t = setTimeout(() => caches.match(e.request).then(go), 3000);
    net.then(r => { clearTimeout(t); go(r); }).catch(() => caches.match(e.request).then(r => go(r || Response.error())));
  }));
});
