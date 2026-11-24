/* Rental Studio: каталог, картка образу, мови */
(function () {
  var DATA = window.DATA, I18N = window.I18N, ACC = window.ACCESSORIES;
  var TG = DATA.contacts.telegram, IG = DATA.contacts.instagram;
  /* Демо-значення для товару без даних (Snow Bloom): уточнити у власниці */
  var DEMO = { 'snow-bloom': [700, 250] };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var lang = 'ua';
  try { var saved = localStorage.getItem('rs_lang'); if (saved && I18N[saved]) lang = saved; } catch (e) {}
  var t = function (k) { return I18N[lang][k] != null ? I18N[lang][k] : k; };
  var tr = function (o) { return o && (o[lang] || o.ua); };
  var money = function (n) { return n.toLocaleString(lang === 'en' ? 'en-US' : 'uk-UA').replace(/,/g, ' ') + ' ₴'; };

  function plural(n) {
    if (lang === 'en') return n === 1 ? '1' : '2';
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return '1';
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return '2';
    return '5';
  }
  function itemPrice(p, i) {
    var it = p.items[i];
    if (it.price != null) return it.price;
    return (DEMO[p.id] || [])[i] || 0;
  }
  function setTotal(p) { return p.items.reduce(function (s, _, i) { return s + itemPrice(p, i); }, 0); }
  function photo(p, n) { return 'products/' + p.photos[Math.min(n, p.photos.length) - 1]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var colls = DATA.collections.filter(function (c) { return c.id !== 'final-touch'; });
  var finalTouch = DATA.collections.filter(function (c) { return c.id === 'final-touch'; })[0];
  var byId = {}; DATA.products.forEach(function (p) { byId[p.id] = p; });

  /* ---------- Каталог ---------- */
  function renderCatalog() {
    var html = colls.map(function (c) {
      var list = DATA.products.filter(function (p) { return p.collection === c.id; });
      var cards = list.map(function (p) {
        var alt = p.cover === 1 ? 2 : 1;
        return '<button type="button" class="card" data-id="' + p.id + '" aria-label="' + esc(t('open_look') + ': ' + p.name) + '">' +
          '<div class="card-ph"><img class="main" loading="lazy" decoding="async" src="' + photo(p, p.cover) + '" alt="' + esc(p.name) + '">' +
          (p.photos.length > 1 ? '<img class="alt" loading="lazy" decoding="async" src="' + photo(p, alt) + '" alt="">' : '') +
          '<span class="card-price">' + money(setTotal(p)) + '<small>' + t('per_shoot') + '</small></span></div>' +
          '<div class="card-info"><h3 class="card-name">' + esc(p.name) + '</h3><p class="card-tag">' + esc(tr(p.tagline)) + '</p></div></button>';
      }).join('');
      return '<section class="coll" id="coll-' + c.id + '" data-tint="' + c.accent + '" aria-labelledby="h-' + c.id + '">' +
        '<div class="coll-head"><h2 class="coll-name" id="h-' + c.id + '">' + esc(c.name) + '</h2>' +
        '<p class="coll-tag">' + esc(tr(c.tagline)) + '</p>' +
        '<p class="coll-count">' + list.length + ' ' + t('look_count_' + plural(list.length)) + '</p></div>' +
        '<div class="row">' + cards + '</div></section>';
    }).join('');

    var cam = '<svg class="ft-cam" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="12" cy="12" r="3.5"/></svg>';
    var acc = ACC.map(function (a) {
      return '<li class="ft-item" role="button" tabindex="0" aria-expanded="false" data-acc="' + a.id + '"><span class="ft-name">' + esc(tr(a.n)) + cam + '</span><b>' + a.p + ' ₴</b></li>';
    }).join('');
    html += '<section class="ft coll" id="coll-final-touch" data-tint="gold"><div class="ft-box"><div>' +
      '<h2 class="coll-name">' + esc(finalTouch.name) + '</h2><p class="coll-tag">' + esc(tr(finalTouch.tagline)) + '</p>' +
      '<p style="color:var(--smoke);margin:16px 0 0;max-width:42ch">' + t('ft_text') + '</p>' +
      '<a class="btn gold" target="_blank" rel="noopener" href="' + TG + '?text=' + encodeURIComponent(t('ft_cta')) + '">' + t('ft_cta') + '</a></div>' +
      '<div><ul class="ft-list" aria-label="' + esc(finalTouch.name) + '">' + acc + '</ul><p class="ft-hint">' + t('ft_hint') + '</p></div></div></section>';
    $('#catalog').innerHTML = html;

    var chips = colls.concat([finalTouch]).map(function (c) {
      return '<a href="#coll-' + c.id + '" data-chip="' + c.id + '">' + esc(c.name) + '</a>';
    }).join('');
    $('#chips').innerHTML = chips;
    observeSections();
  }

  var io;
  function observeSections() {
    if (io) io.disconnect();
    if (!('IntersectionObserver' in window)) return;
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.id.replace('coll-', '');
        $$('#chips a').forEach(function (a) {
          var on = a.getAttribute('data-chip') === id;
          if (on) { a.setAttribute('aria-current', 'true'); a.scrollIntoView && a.parentNode.scrollTo({ left: a.offsetLeft - 24, behavior: 'smooth' }); }
          else a.removeAttribute('aria-current');
        });
        if (window.setBgTint) window.setBgTint(e.target.getAttribute('data-tint') || 'gold');
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    $$('.coll').forEach(function (s) { io.observe(s); });
    var hero = $('#hero');
    new IntersectionObserver(function (en) { if (en[0].isIntersecting) { $$('#chips a').forEach(function (a) { a.removeAttribute('aria-current'); }); window.setBgTint && window.setBgTint('gold'); } }, { threshold: 0.5 }).observe(hero);
  }

  /* ---------- Фото аксесуара: спливає при наведенні миші або дотику ---------- */
  var pop = document.createElement('div');
  pop.className = 'acc-pop'; pop.setAttribute('aria-hidden', 'true');
  pop.innerHTML = '<img alt="" decoding="async">';
  document.body.appendChild(pop);
  var popImg = pop.firstChild, popFor = null, preloaded = false;

  function preloadAcc() {
    if (preloaded) return; preloaded = true;
    ACC.forEach(function (a) { var i = new Image(); i.src = 'products/accessories/' + a.id + '.webp'; });
  }
  function showPop(li) {
    preloadAcc();
    var id = li.getAttribute('data-acc'), a = ACC.filter(function (x) { return x.id === id; })[0]; if (!a) return;
    hidePop();
    popFor = li; li.setAttribute('aria-expanded', 'true');
    popImg.src = 'products/accessories/' + id + '.webp';
    popImg.alt = tr(a.n);
    var size = innerWidth < 560 ? 190 : 230;
    pop.style.width = pop.style.height = size + 'px';
    var r = li.getBoundingClientRect(), vw = document.documentElement.clientWidth, vh = innerHeight, gap = 14, minTop = 84, x, y;
    if (r.left - size - gap >= 8) {                         /* ліворуч від рядка */
      x = r.left - size - gap; y = r.top + r.height / 2 - size / 2;
    } else if (r.right + size + gap <= vw - 8) {            /* праворуч */
      x = r.right + gap; y = r.top + r.height / 2 - size / 2;
    } else {                                                /* над рядком (вузький екран) */
      x = Math.min(Math.max(8, r.right - size), vw - size - 8);
      y = r.top - size - 10;
      if (y < minTop) y = r.bottom + 10;
    }
    y = Math.min(Math.max(minTop, y), vh - size - 8);
    pop.style.left = Math.round(x) + 'px'; pop.style.top = Math.round(y) + 'px';
    pop.classList.add('on');
  }
  function hidePop() {
    pop.classList.remove('on');
    if (popFor) { popFor.setAttribute('aria-expanded', 'false'); popFor = null; }
  }
  var canHover = window.matchMedia && matchMedia('(hover: hover)').matches;
  document.addEventListener('mouseover', function (e) {
    if (!canHover) return;
    var li = e.target.closest && e.target.closest('.ft-item');
    if (li && li !== popFor) showPop(li); else if (!li && popFor) hidePop();
  });
  document.addEventListener('click', function (e) {
    var li = e.target.closest && e.target.closest('.ft-item');
    if (li) { if (li === popFor && !canHover) hidePop(); else showPop(li); }
    else if (popFor) hidePop();
  });
  document.addEventListener('keydown', function (e) {
    var li = e.target.closest && e.target.closest('.ft-item');
    if (li && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); li === popFor ? hidePop() : showPop(li); }
    if (e.key === 'Escape' && popFor) hidePop();
  });
  document.addEventListener('focusin', function (e) { var li = e.target.closest && e.target.closest('.ft-item'); if (!li && popFor) hidePop(); });
  addEventListener('scroll', function () { if (popFor) hidePop(); }, { passive: true });
  addEventListener('resize', hidePop);

  /* ---------- Умови ---------- */
  function renderTerms() {
    var out = '';
    for (var i = 1; i <= 6; i++) out += '<details' + (i === 1 ? ' open' : '') + '><summary>' + t('t' + i + '_h') + '</summary><p>' + t('t' + i + '_b') + '</p></details>';
    $('#acc').innerHTML = out;
  }

  /* ---------- Картка образу ---------- */
  var modal = $('#modal'), cur = null, mode = 'shoot', checked = [], lastFocus = null;

  function fillModal(keepScroll) {
    var p = cur; if (!p) return;
    var coll = DATA.collections.filter(function (c) { return c.id === p.collection; })[0];
    $('#m-coll').textContent = coll.name;
    $('#m-name').textContent = p.name;
    $('#m-tag').textContent = tr(p.tagline);
    if (!keepScroll) {
      $('#m-track').innerHTML = p.photos.map(function (_, i) { return '<img src="' + photo(p, i + 1) + '" alt="' + esc(p.name + ', ' + (i + 1) + '/' + p.photos.length) + '" decoding="async">'; }).join('');
      $('#m-dots').innerHTML = p.photos.map(function () { return '<i></i>'; }).join('');
      requestAnimationFrame(function () { var tk = $('#m-track'); tk.scrollLeft = (p.cover - 1) * tk.clientWidth; dots(); });
    }
    $('#m-items').innerHTML = p.items.map(function (it, i) {
      var sz = it.size ? '<small>' + t('size') + ': ' + esc(it.size) + '</small>' : '';
      return '<li data-i="' + i + '"><label><input type="checkbox" ' + (checked[i] ? 'checked' : '') + '><span class="it-name">' + esc(tr(it.name)) + sz + '</span><span class="it-price"></span></label></li>';
    }).join('');
    recalc();
    $$('.mode button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-mode') === mode)); });
  }

  function recalc() {
    var p = cur, k = mode === 'event' ? 2 : 1, sum = 0, names = [];
    $$('#m-items li').forEach(function (li) {
      var i = +li.getAttribute('data-i'), on = checked[i], price = itemPrice(p, i) * k;
      $('.it-price', li).textContent = money(price);
      li.classList.toggle('off', !on);
      if (on) { sum += price; names.push(tr(p.items[i].name)); }
    });
    $('#m-total').textContent = money(sum);
    $('#mode-hint').textContent = t(mode === 'event' ? 'mode_hint_event' : 'mode_hint_shoot');
    var msg = t('tg_msg').replace('{name}', p.name).replace('{mode}', t(mode === 'event' ? 'mode_event' : 'mode_shoot'))
      .replace('{items}', names.join(', ')).replace('{total}', String(sum).replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
    $('#m-tg').href = TG + '?text=' + encodeURIComponent(msg);
    $('#m-tg').setAttribute('aria-disabled', names.length ? 'false' : 'true');
  }

  function dots() {
    var tk = $('#m-track'), n = $$('#m-dots i').length; if (!n) return;
    var idx = Math.round(tk.scrollLeft / Math.max(1, tk.clientWidth));
    $$('#m-dots i').forEach(function (d, i) { d.classList.toggle('on', i === idx); });
    $('#m-prev').style.visibility = idx === 0 ? 'hidden' : 'visible';
    $('#m-next').style.visibility = idx >= n - 1 ? 'hidden' : 'visible';
  }

  function openModal(id, fromPop) {
    cur = byId[id]; if (!cur) return;
    mode = 'shoot'; checked = cur.items.map(function () { return true; });
    lastFocus = document.activeElement;
    modal.hidden = false; document.body.classList.add('lock');
    fillModal(false);
    $('#modal-panel .m-body').scrollTop = 0;
    $('.m-close', modal).focus({ preventScroll: true });
    if (!fromPop) history.pushState({ modal: id }, '');
  }
  function closeModal(fromPop) {
    if (modal.hidden) return;
    modal.hidden = true; document.body.classList.remove('lock');
    if (!fromPop && history.state && history.state.modal) history.back();
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  document.addEventListener('click', function (e) {
    var card = e.target.closest('.card'); if (card) { openModal(card.getAttribute('data-id')); return; }
    if (e.target.closest('[data-close]')) { closeModal(false); return; }
    var mb = e.target.closest('.mode button'); if (mb) { mode = mb.getAttribute('data-mode'); $$('.mode button').forEach(function (b) { b.setAttribute('aria-pressed', String(b === mb)); }); recalc(); return; }
    var lb = e.target.closest('.lang button'); if (lb) { setLang(lb.getAttribute('data-lang')); return; }
    if (e.target.closest('#m-prev')) { var tk = $('#m-track'); tk.scrollBy({ left: -tk.clientWidth, behavior: 'smooth' }); }
    if (e.target.closest('#m-next')) { var tk2 = $('#m-track'); tk2.scrollBy({ left: tk2.clientWidth, behavior: 'smooth' }); }
  });
  document.addEventListener('change', function (e) {
    if (e.target.matches('#m-items input')) { var li = e.target.closest('li'); checked[+li.getAttribute('data-i')] = e.target.checked; recalc(); }
  });
  $('#m-track').addEventListener('scroll', function () { requestAnimationFrame(dots); }, { passive: true });
  document.addEventListener('keydown', function (e) {
    if (modal.hidden) return;
    if (e.key === 'Escape') closeModal(false);
    if (e.key === 'ArrowRight') $('#m-next').click();
    if (e.key === 'ArrowLeft') $('#m-prev').click();
    if (e.key === 'Tab') { /* утримуємо фокус усередині вікна */
      var f = $$('button, a[href], input', $('#modal-panel')).filter(function (n) { return !n.disabled && n.offsetParent !== null && getComputedStyle(n).visibility !== 'hidden'; });
      if (!f.length) return; var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener('popstate', function (e) {
    if (e.state && e.state.modal) openModal(e.state.modal, true); else closeModal(true);
  });

  /* ---------- Мови ---------- */
  function applyStatic() {
    document.documentElement.lang = I18N[lang].htmlLang;
    document.title = t('meta_title');
    var md = $('meta[name="description"]'); if (md) md.setAttribute('content', t('meta_desc'));
    $$('[data-i18n]').forEach(function (n) { n.textContent = t(n.getAttribute('data-i18n')); });
    $$('[data-i18n-aria]').forEach(function (n) { n.setAttribute('aria-label', t(n.getAttribute('data-i18n-aria'))); });
    $$('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)); });
  }
  function setLang(l) {
    if (!I18N[l] || l === lang) return;
    lang = l; try { localStorage.setItem('rs_lang', l); } catch (e) {}
    applyStatic(); renderCatalog(); renderTerms();
    if (!modal.hidden) fillModal(true);
  }

  applyStatic(); renderCatalog(); renderTerms();
})();
