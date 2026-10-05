// ===== COUNTDOWN TIMER — target comes from js/config.js (countdown.nikah.target) =====
(function () {
  'use strict';
  var cfg = ((window.WEDDING_CONFIG || {}).countdown || {}).nikah || {};
  var TARGET = new Date(cfg.target || '2026-10-31T11:00:00+05:30');
  var ids = ['cd-days', 'cd-hours', 'cd-minutes', 'cd-seconds'];

  function pad(n) { return String(n).padStart(2, '0'); }

  function setValue(id, v) {
    var el = document.getElementById(id);
    if (!el || el.textContent === v) return;
    el.classList.add('flip');
    setTimeout(function () { el.classList.remove('flip'); }, 300);
    el.textContent = v;
  }

  function tick() {
    var diff = TARGET - new Date();
    if (isNaN(diff) || diff <= 0) {
      ids.forEach(function (id) { setValue(id, '00'); });
      var t = document.getElementById('cd-title');
      if (t && !isNaN(diff)) t.textContent = 'Alhamdulillah — Our Nikah Day';
      return;
    }
    setValue('cd-days',    pad(Math.floor(diff / 864e5)));
    setValue('cd-hours',   pad(Math.floor(diff % 864e5 / 36e5)));
    setValue('cd-minutes', pad(Math.floor(diff % 36e5 / 6e4)));
    setValue('cd-seconds', pad(Math.floor(diff % 6e4 / 1e3)));
  }

  tick();
  setInterval(tick, 1000);
})();
