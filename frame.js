/* frame.js — 안내 페이지 공통 스크립트
 *
 * 1) APP_URL: Apps Script 웹 앱 배포 주소. **배포 주소가 바뀌면 여기 한 곳만 고치면 됩니다.**
 *    (배포는 [배포 관리 → 수정 → 새 버전]으로 하면 주소가 그대로예요)
 * 2) 떠다니는 음식 장식 (앱 Common.html 의 FOOD_ICONS·FOOD_SKY 와 같은 값 — 앱 쪽을 바꾸면 여기도)
 * 3) 끼워 넣는 틀: <body data-mode="app|owner|admin"> 인 페이지에서
 *    - app   : 주민 화면
 *    - owner : 주소 #t=토큰 → 사장님 화면 (토큰은 # 뒤라 GitHub 서버로 가지 않음)
 *    - admin : 주소 #k=열쇠 → 관리 화면 (PIN 은 화면 안에서 입력)
 *    앱이 그려지면 보내는 'ftm:ready' 신호를 받을 때만 스플래시를 걷음. 8초가 지나면 [바로 열기] 버튼.
 */
var APP_URL = 'https://script.google.com/macros/s/AKfycbwjJjUpcnmtXTRk7pbqFLmmg4b7M1Zb_QZKC-M5d_gabPM1p0hL7juK2tblVztOzl__wg/exec';

var FOOD_ICONS = {
  fish: "<path d='M2.5 12c2.6-4.6 9.4-5.6 13.6-2l4.4-3.2v10.4L16.1 14c-4.2 3.6-11 2.6-13.6-2z'/><circle cx='6.6' cy='11.2' r='.9'/><path d='M10 9.6c.9 1.5.9 3.3 0 4.8M12.8 9.8c.8 1.4.8 3 0 4.4'/>",
  skewer: "<path d='M3 21 21 3'/><rect x='5.6' y='14' width='4.4' height='4.4' rx='1.4' transform='rotate(45 7.8 16.2)'/><rect x='9.8' y='9.8' width='4.4' height='4.4' rx='1.4' transform='rotate(45 12 12)'/><rect x='14' y='5.6' width='4.4' height='4.4' rx='1.4' transform='rotate(45 16.2 7.8)'/>",
  burger: "<path d='M4 10.5a8 5.5 0 0 1 16 0z'/><path d='M3 13.5c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0'/><path d='M4 16.5h16'/><path d='M4.5 18.5h15a0 0 0 0 1 0 0 2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2z'/><path d='M9 7.6h.01M12.5 6.8h.01M15 8.2h.01'/>",
  coffee: "<path d='M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z'/><path d='M16 10.5h1.2a2.4 2.4 0 0 1 0 4.8H16'/><path d='M8.5 3.5c-1 1 1 2 0 3M12 3.5c-1 1 1 2 0 3'/><path d='M4 21h13'/>",
  bowl: "<path d='M3 11.5h18a9 7.5 0 0 1-18 0z'/><path d='M6.5 9.5 10 6M10.5 9.5l3.5-3.5M14.5 9.5l2.5-2.5'/><path d='M9 21h6'/>",
  takoyaki: "<path d='M2.5 14h19l-2.2 5.5H4.7z'/><circle cx='7' cy='11' r='3'/><circle cx='12' cy='9.8' r='3'/><circle cx='17' cy='11' r='3'/>",
  hotdog: "<path d='M5 8.5h14a3.5 3.5 0 0 1 0 7H5a3.5 3.5 0 0 1 0-7z'/><path d='M2.5 12h19'/><path d='M6 10.6l1.8 1.4 1.8-1.4 1.8 1.4 1.8-1.4 1.8 1.4 1.8-1.4 1.8 1.4'/>",
  icecream: "<path d='M8 12l4 9.5 4-9.5'/><path d='M6.5 12a5.5 5.5 0 0 1 11 0z'/><path d='M9.3 15.5h5.4'/>",
  potato: "<path d='M3.5 15.5c-1.6-3.6 2.6-8.8 8.3-9.3 5.3-.5 9.5 2.4 8.6 5.8-.9 3.5-6 6.6-10.3 6.4-3.3-.2-5.7-1.1-6.6-2.9z'/><path d='M8 11.5l1 1M12.5 10.5l1 .8M15.8 12.4l.9.6M10.5 15l1 .6'/>",
  donut: "<circle cx='12' cy='12' r='8.5'/><circle cx='12' cy='12' r='2.8'/><path d='M7.5 7.8l.8.6M15.8 7.2l-.4.9M17.6 13.4l-.9.3M9 16.8l.7-.7M5.8 12.6l.9-.2'/>",
  cake: "<path d='M3.5 20.5h17'/><path d='M5 20.5v-7h14v7'/><path d='M5 16.3c1.2 1 2.3 1 3.5 0s2.3-1 3.5 0 2.3 1 3.5 0 2.3-1 3.5 0'/><path d='M8.5 13.5V10.5M12 13.5V10.5M15.5 13.5V10.5'/><path d='M8.5 7.6c-.6.6-.6 1.3 0 1.6.6-.3.6-1 0-1.6zM12 7.6c-.6.6-.6 1.3 0 1.6.6-.3.6-1 0-1.6zM15.5 7.6c-.6.6-.6 1.3 0 1.6.6-.3.6-1 0-1.6z'/>",
  cupcake: "<path d='M6.2 12.5h11.6l-1.7 8H7.9z'/><path d='M10 12.5l.4 8M14 12.5l-.4 8'/><path d='M5.6 12.5a2.9 2.9 0 0 1 1.6-5.3 4.9 4.9 0 0 1 9.6 0 2.9 2.9 0 0 1 1.6 5.3'/><circle cx='12' cy='3.3' r='1'/>",
  macaron: "<path d='M4 9.6C4 6.9 7.6 4.8 12 4.8s8 2.1 8 4.8z'/><path d='M4 14.4c0 2.7 3.6 4.8 8 4.8s8-2.1 8-4.8z'/><rect x='5' y='10.6' width='14' height='2.8' rx='1.4'/>",
  croissant: "<path d='M12 6.5c-3 0-5 2.4-5.6 6.5L4.6 11c-1.5.4-2.4 2-1.9 3.5l1.2 2.6c1 .8 2.6.7 3.5-.3L9 15.2l3 1.3 3-1.3 1.6 1.6c.9 1 2.5 1.1 3.5.3l1.2-2.6c.5-1.5-.4-3.1-1.9-3.5l-1.8 2C17 8.9 15 6.5 12 6.5z'/><path d='M9.3 8.4 10.5 15M14.7 8.4 13.5 15'/>",
  waffle: "<rect x='4' y='4' width='16' height='16' rx='4.5'/><path d='M9.3 4.4v15.2M14.7 4.4v15.2M4.4 9.3h15.2M4.4 14.7h15.2'/>",
  cookie: "<path d='M20.4 12.6A8.5 8.5 0 1 1 11.4 3.6a2.8 2.8 0 0 0 3.4 3.3 2.8 2.8 0 0 0 3.2 3.4 2.4 2.4 0 0 0 2.4 2.3z'/><path d='M8 9.2h.01M12.3 12.6h.01M8.4 15.3h.01M15.2 16.1h.01M10.6 18.6h.01'/>",
  popsicle: "<path d='M7.5 8.5a4.5 4.5 0 0 1 9 0V16a1.5 1.5 0 0 1-1.5 1.5H9A1.5 1.5 0 0 1 7.5 16z'/><path d='M12 17.5V21.5'/><path d='M10.2 7v6'/><path d='M7.5 11.8c1.5.8 3 .8 4.5 0s3-.8 4.5 0'/>",
  pudding: "<path d='M6.5 19.5h11l-1.7-9.3H8.2z'/><path d='M8.2 10.2c.5-2.6 2-4 3.8-4s3.3 1.4 3.8 4'/><path d='M7.8 12.4c1.4.9 2.8.9 4.2 0s2.8-.9 4.2 0'/><path d='M4.5 19.5h15'/>",
  lollipop: "<circle cx='12' cy='8.8' r='5.8'/><path d='M12 8.8c0-1.2 1.6-1.6 2.2-.6.8 1.4-.4 3-2 3.1-2.2.2-3.6-2-2.9-3.9.8-2.4 3.9-3.2 5.9-1.7'/><path d='M12 14.6v6.9'/>",
  twist: "<ellipse cx='5.8' cy='12' rx='2.3' ry='4.2' transform='rotate(35 5.8 12)'/><ellipse cx='9.9' cy='12' rx='2.3' ry='4.2' transform='rotate(35 9.9 12)'/><ellipse cx='14' cy='12' rx='2.3' ry='4.2' transform='rotate(35 14 12)'/><ellipse cx='18.1' cy='12' rx='2.3' ry='4.2' transform='rotate(35 18.1 12)'/>"
};
// [아이콘, 가로 %, 세로 %, 크기 rem, 한 번 움직이는 시간(초), 시작 지점(초), 기울기(도)] — 앞 14개만 휴대폰에서 보임 (v2.5~ 디저트 늘리고 더 빠르게)
var FOOD_SKY = [
  ['cake', 5, 9, 3.25, 15, -2, -10],
  ['coffee', 86, 7, 3, 13, -6, 8],
  ['cupcake', 13, 40, 3.25, 16, -4, 12],
  ['burger', 90, 32, 3.25, 17, -9, -6],
  ['macaron', 4, 67, 3, 14, -7, 6],
  ['donut', 84, 61, 3, 15, -11, -8],
  ['icecream', 44, 92, 2.75, 13, -3, -10],
  ['croissant', 22, 84, 3, 16, -8, 10],
  ['waffle', 70, 87, 2.75, 18, -2, -12],
  ['popsicle', 58, 19, 2.75, 14, -5, 14],
  ['fish', 32, 55, 2.75, 17, -10, -14],
  ['cookie', 76, 47, 2.75, 15, -1, -14],
  ['twist', 52, 72, 2.75, 16, -12, -18],
  ['lollipop', 24, 20, 2.5, 14, -6, 10],
  ['skewer', 62, 5, 2.5, 18, -3, 20],
  ['pudding', 94, 80, 2.75, 15, -9, 6],
  ['takoyaki', 8, 94, 2.5, 17, -4, 8],
  ['hotdog', 40, 30, 2.5, 19, -7, -6],
  ['bowl', 66, 38, 2.5, 16, -13, 4],
  ['potato', 30, 3, 2.5, 18, -2, -16]
];

/** 떠다니는 음식 장식을 parent 맨 앞에 넣음 */
function ftmFoodSky(parent) {
  var el = document.createElement('div');
  el.className = 'food-sky';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = FOOD_SKY.map(function (f) {
    return '<i style="left:' + f[1] + '%;top:' + f[2] + '%;width:' + f[3] + 'rem;height:' + f[3] + 'rem;--r:' + f[6] + 'deg;' +
      'animation-duration:' + f[4] + 's;animation-delay:' + f[5] + 's"><svg viewBox="0 0 24 24" focusable="false">' + FOOD_ICONS[f[0]] + '</svg></i>';
  }).join('');
  parent.insertBefore(el, parent.firstChild);
}

/* ---------- 끼워 넣는 틀 ---------- */
(function () {
  var mode = document.body && document.body.getAttribute('data-mode');
  if (!mode) return;
  var wait = document.getElementById('wait'), frame = document.getElementById('app');
  ftmFoodSky(wait);

  // 홈 화면 아이콘(앱 모드)으로 열었는지 — 관리 [이용 현황] 에서 셈 (기기에 따라 일반 열람으로 보일 수 있음)
  var home = false;
  try { home = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches; } catch (e) { home = false; }
  var src = APP_URL + '?via=landing' + (home ? '&src=home' : ''), direct = APP_URL;
  if (mode === 'owner' || mode === 'admin') {
    var name = mode === 'owner' ? 't' : 'k';
    var m = new RegExp('^#' + name + '=([A-Za-z0-9_-]{40,100})$').exec(location.hash || '');
    // 링크가 바뀌면(다른 링크를 붙여넣는 등) 새로 엶
    window.addEventListener('hashchange', function () { location.reload(); });
    if (!m) {
      document.getElementById('msg').textContent = document.body.getAttribute('data-bad') || '링크가 올바르지 않아요.';
      document.querySelector('.lot').hidden = true;
      return;
    }
    src = APP_URL + '?p=' + mode + '&via=landing' + (home ? '&src=home' : '') + '&' + name + '=' + m[1];
    direct = APP_URL + '?p=' + mode + '&' + name + '=' + m[1];
  }
  document.getElementById('direct').href = direct;
  // 오늘 날짜는 휴대폰 시계로 바로 표시 (데이터를 기다리지 않음)
  var d = new Date(), W = ['일', '월', '화', '수', '목', '금', '토'];
  document.getElementById('today').textContent = (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' + W[d.getDay()] + '요일';
  var slow = setTimeout(function () { wait.classList.add('is-slow'); }, 8000);
  // 앱이 실제로 그려졌을 때만 스플래시를 걷음 (iframe load 는 구글 오류 화면이어도 일어나서 믿을 수 없음)
  window.addEventListener('message', function (e) {
    if (e.data !== 'ftm:ready' || !/\.googleusercontent\.com$|^https:\/\/script\.google\.com$/.test(e.origin)) return;
    clearTimeout(slow);
    wait.classList.add('out');
    setTimeout(function () { wait.hidden = true; }, 350);
  });
  frame.src = src;
})();
