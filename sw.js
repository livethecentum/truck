/* sw.js — 주민 화면(app.html)을 안드로이드에서 '앱 설치' 할 수 있게 하는 서비스 워커 (v2.6~)
 * 아무것도 저장(캐시)하지 않음 — 화면은 늘 인터넷에서 새로 받음. 인터넷이 끊겼을 때만 안내 화면을 보여줌.
 * frame.js 가 scope './app.html' 로 등록 → 사장님·관리자 페이지에는 관여하지 않음. */
var OFFLINE = '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
  '<title>오늘의 푸드트럭</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#18202E;color:#ECEDE8;' +
  'font:16px/1.6 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;text-align:center;padding:24px}' +
  'button{margin-top:16px;font:inherit;font-weight:800;padding:12px 22px;border:0;border-radius:12px;background:#FFC93C;color:#18202E}</style></head>' +
  '<body><div><p><b>인터넷에 연결되지 않았어요.</b><br>연결을 확인한 뒤 다시 열어주세요.</p><button onclick="location.reload()">다시 열기</button></div></body></html>';
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(fetch(e.request).catch(function () {
    return new Response(OFFLINE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }));
});
