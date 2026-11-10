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
  donut: "<circle cx='12' cy='12' r='8.5'/><circle cx='12' cy='12' r='2.8'/><path d='M7.5 7.8l.8.6M15.8 7.2l-.4.9M17.6 13.4l-.9.3M9 16.8l.7-.7M5.8 12.6l.9-.2'/>"
};
// [아이콘, 가로 %, 세로 %, 크기 rem, 한 번 움직이는 시간(초), 시작 지점(초), 기울기(도)] — 앞 10개만 휴대폰에서 보임
var FOOD_SKY = [
  ['fish', 4, 10, 3.5, 34, -2, -14],
  ['coffee', 88, 8, 3, 28, -9, 8],
  ['skewer', 12, 42, 3.25, 31, -5, 20],
  ['burger', 92, 36, 3.5, 36, -12, -6],
  ['bowl', 3, 72, 3.25, 29, -7, 6],
  ['takoyaki', 85, 68, 3.25, 33, -15, -8],
  ['hotdog', 44, 93, 2.75, 38, -4, -10],
  ['icecream', 24, 86, 2.75, 27, -11, 12],
  ['potato', 70, 88, 3, 35, -3, -16],
  ['donut', 60, 22, 2.75, 32, -8, 10],
  ['fish', 30, 58, 2.5, 30, -13, 18],
  ['coffee', 76, 52, 2.5, 37, -6, -12],
  ['skewer', 52, 74, 2.5, 29, -10, -24],
  ['burger', 20, 22, 2.5, 34, -1, 8]
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

  var src = APP_URL, direct = APP_URL;
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
    src = APP_URL + '?p=' + mode + '&via=landing&' + name + '=' + m[1];
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
