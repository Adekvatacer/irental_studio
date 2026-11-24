/* Динамічний фон: золотий пил + м'які боке, паралакс від скролу, відтінок залежить від колекції */
(function () {
  var cv = document.getElementById('bg-canvas');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = matchMedia('(pointer: coarse)').matches;
  var dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
  var W = 0, H = 0, parts = [], raf = 0, running = true, scrollY = 0;
  var tints = {
    gold:     ['255,226,150', '222,178,86'],
    bordeaux: ['255,170,170', '200,60,80'],
    ivory:    ['255,250,240', '230,215,190']
  };
  var cur = tints.gold;

  function size() {
    W = cv.width = Math.floor(innerWidth * dpr);
    H = cv.height = Math.floor(innerHeight * dpr);
    var n = Math.round(Math.min(110, Math.max(36, innerWidth * innerHeight / 14000)));
    if (coarse) n = Math.round(n * 0.6);
    while (parts.length < n) parts.push(make(true));
    parts.length = n;
  }
  function make(anywhere) {
    var bokeh = Math.random() < 0.12;
    return {
      x: Math.random() * W, y: anywhere ? Math.random() * H : H + 20 * dpr,
      r: (bokeh ? 14 + Math.random() * 34 : 0.6 + Math.random() * 1.9) * dpr,
      vy: -(0.08 + Math.random() * 0.34) * dpr, vx: (Math.random() - .5) * 0.16 * dpr,
      ph: Math.random() * 6.28, sp: 0.01 + Math.random() * 0.03,
      z: 0.3 + Math.random() * 0.9, bokeh: bokeh, a: bokeh ? 0.05 + Math.random() * 0.07 : 0.4 + Math.random() * 0.6
    };
  }
  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.ph += p.sp; p.x += p.vx + Math.sin(p.ph) * 0.15 * dpr; p.y += p.vy;
      if (p.y < -60 * dpr) { parts[i] = make(false); continue; }
      var py = p.y - scrollY * p.z * 0.18 * dpr;
      var tw = p.bokeh ? 1 : 0.55 + 0.45 * Math.sin(p.ph * 3);
      var c = p.bokeh ? cur[1] : cur[0];
      var g = ctx.createRadialGradient(p.x, py, 0, p.x, py, p.r * (p.bokeh ? 1 : 3.5));
      g.addColorStop(0, 'rgba(' + c + ',' + (p.a * tw) + ')');
      g.addColorStop(p.bokeh ? .7 : .4, 'rgba(' + c + ',' + (p.a * tw * (p.bokeh ? .6 : .35)) + ')');
      g.addColorStop(1, 'rgba(' + c + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, py, p.r * (p.bokeh ? 1 : 3.5), 0, 6.283); ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  }
  function start() { if (reduce) { frame(); running = false; cancelAnimationFrame(raf); return; } running = true; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }

  /* Скрол: паралакс смуг (CSS-змінна) */
  var ticking = false;
  addEventListener('scroll', function () {
    scrollY = window.pageYOffset;
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { document.documentElement.style.setProperty('--sy', scrollY); ticking = false; });
  }, { passive: true });

  addEventListener('resize', function () { size(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) { running = false; cancelAnimationFrame(raf); } else start(); });

  /* Публічний метод: змінити відтінок фону під колекцію */
  window.setBgTint = function (name) {
    document.body.setAttribute('data-tint', name);
    cur = tints[name] || tints.gold;
  };

  size(); start();
})();
