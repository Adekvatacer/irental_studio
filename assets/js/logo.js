/* Анімований логотип: тигр (з трасування) + літери I та R (вектор), золото з блиском */
(function () {
  var host = document.getElementById('hero-logo');
  if (!host || !window.LOGO) return;
  var D = window.LOGO;

  var LET = [
    'M119 57.5H147V59H137V143.5H147V145.5H119V143.5H129V59H119ZM131.2 59H134.8V143.5H131.2Z',
    'M154 57.5H186C204 57.5 213 66 213 80C213 92 206 100 195 103.5L217 141H224V145.5H207L182 105H169V141H176V145.5H154V141H161V59H154ZM169 61H184C195 61 204 69 204 80C204 90 197 100 184 102H169Z'
  ];

  function build() {
    var P = D.paths.slice().sort(function (a, b) { return a.x - b.x; });
    var all = P.map(function (p) { return p.d; }).join('');
    var letters = LET.join('');
    var dl = function (t) { return 'style="animation-delay:' + t.toFixed(2) + 's,' + (t + 2.5).toFixed(2) + 's"'; };
    var lines = '<g mask="url(#lgFadeL)">' + LET.map(function (d, i) {
      return '<path class="lg-line" pathLength="1" ' + dl(i * 0.35) + ' d="' + d + '"/>';
    }).join('') + '</g><g mask="url(#lgFadeT)">' + P.map(function (p, i) {
      return '<path class="lg-line" pathLength="1" ' + dl(0.5 + i * 0.045) + ' d="' + p.d + '"/>';
    }).join('') + '</g>';
    var sweep = function (clip) {
      return '<g clip-path="url(#' + clip + ')"><g>' +
        '<animateTransform attributeName="transform" type="translate" values="-140 0;' + (D.w + 120) + ' 0;' + (D.w + 120) + ' 0" keyTimes="0;.3;1" dur="6s" begin="3.1s" repeatCount="indefinite"/>' +
        '<rect x="0" y="-40" width="70" height="' + (D.h + 80) + '" fill="url(#lgSweep)" transform="skewX(-22)" style="mix-blend-mode:soft-light"/>' +
        '<rect x="12" y="-40" width="22" height="' + (D.h + 80) + '" fill="url(#lgSweep)" transform="skewX(-22)" opacity=".9"/>' +
        '</g></g>';
    };
    host.innerHTML =
      '<div class="lg"><div class="lg-halo"></div>' +
      '<svg viewBox="0 0 ' + D.w + ' ' + D.h + '" aria-hidden="true"><defs>' +
      '<linearGradient id="lgGold" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="' + D.w + '" y2="' + D.h + '" spreadMethod="reflect">' +
      '<stop offset="0" stop-color="#7d5a1b"/><stop offset=".18" stop-color="#c79a3f"/><stop offset=".34" stop-color="#f3dc92"/><stop offset=".5" stop-color="#b8892c"/><stop offset=".68" stop-color="#e6c26e"/><stop offset=".84" stop-color="#9a6f22"/><stop offset="1" stop-color="#d8b358"/>' +
      '<animateTransform attributeName="gradientTransform" type="translate" values="0 0;-120 -40;0 0" dur="9s" begin="1.6s" repeatCount="indefinite"/></linearGradient>' +
      '<linearGradient id="lgSweep" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fffbe9" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="lgGL" gradientUnits="userSpaceOnUse" x1="0" y1="104" x2="0" y2="152"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="lgGT" gradientUnits="userSpaceOnUse" x1="0" y1="140" x2="0" y2="162"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff"/></linearGradient>' +
      '<mask id="lgFadeL" maskUnits="userSpaceOnUse" x="0" y="0" width="' + D.w + '" height="' + D.h + '"><rect width="' + D.w + '" height="' + D.h + '" fill="url(#lgGL)"/></mask>' +
      '<mask id="lgFadeT" maskUnits="userSpaceOnUse" x="0" y="0" width="' + D.w + '" height="' + D.h + '"><rect width="' + D.w + '" height="' + D.h + '" fill="url(#lgGT)"/></mask>' +
      '<clipPath id="lgClipL"><path clip-rule="evenodd" d="' + letters + '"/></clipPath>' +
      '<clipPath id="lgClipT"><path clip-rule="evenodd" d="' + all + '"/></clipPath></defs>' +
      '<g>' + lines + '</g>' +
      '<g class="lg-fill">' +
      '<g mask="url(#lgFadeL)"><path fill="url(#lgGold)" fill-rule="evenodd" d="' + letters + '"/>' + sweep('lgClipL') + '</g>' +
      '<g mask="url(#lgFadeT)"><path fill="url(#lgGold)" fill-rule="evenodd" d="' + all + '"/>' + sweep('lgClipT') + '</g>' +
      '</g></svg></div>';
  }
  build();
  host.addEventListener('click', build);
  host.style.cursor = 'pointer';
})();
