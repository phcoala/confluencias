/* =============================================================
   CONFLUÊNCIAS — deck.js
   motor de cenas: navegação, tema, notas, índice, atalhos
   ============================================================= */
(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;
  const deck = $('#deck');
  const slides = $$('.slide');
  const total = slides.length;
  let cur = 0;
  let locked = false;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- tema ---------- */
  const THEME_KEY = 'confluencias:theme';
  function setTheme(t) {
    root.dataset.theme = t;
    const b = $('#theme');
    if (b) {
      b.setAttribute('aria-pressed', String(t === 'light'));
      b.setAttribute('aria-label', t === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro');
      const use = b.querySelector('use');
      if (use) use.setAttribute('href', t === 'light' ? '#i-sun' : '#i-moon');
    }
    try { localStorage.setItem(THEME_KEY, t); } catch (e) { /* modo privado */ }
  }
  function initTheme() {
    let t = null;
    /* ?tema=claro|escuro — útil para projetores com luz forte */
    const q = (location.search.match(/tema=(claro|escuro)/) || [])[1];
    if (q) t = q === 'claro' ? 'light' : 'dark';
    if (!t) { try { t = localStorage.getItem(THEME_KEY); } catch (e) { /* ignora */ } }
    if (!t) t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    setTheme(t);
  }

  /* ---------- ponteiro: holofote ---------- */
  if (window.matchMedia('(pointer: fine)').matches && !reduced) {
    let raf = null;
    window.addEventListener('pointermove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        root.style.setProperty('--mx', (e.clientX / innerWidth * 100).toFixed(1) + '%');
        root.style.setProperty('--my', (e.clientY / innerHeight * 100).toFixed(1) + '%');
        raf = null;
      });
    }, { passive: true });
  }

  /* ---------- varredura de tecido ---------- */
  const wipe = $('#wipe');
  function sweep() {
    if (!wipe || reduced) return;
    wipe.classList.remove('go');
    void wipe.offsetWidth;
    wipe.classList.add('go');
  }

  /* ---------- chrome: progresso, rail, toc ---------- */
  const prog = $('#prog');
  const rail = $('#rail');
  const toc = $('#toc-list');
  const SUBJECTS = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7'];

  const chapters = [];
  slides.forEach((s, i) => {
    const ch = s.dataset.chapter || 'capa';
    if (!chapters.some((c) => c.id === ch)) chapters.push({ id: ch, name: s.dataset.chapterName || ch, i });
  });
  /* rail: só os sete assuntos, para pular pelo clique */
  const subjects = SUBJECTS.map((id, k) => {
    const first = slides.findIndex((s) => s.dataset.chapter === id);
    const c = chapters.find((x) => x.id === id);
    return { id, i: first, name: c ? c.name : id, n: k + 1 };
  }).filter((s) => s.i >= 0);

  slides.forEach((s, i) => {
    if (prog) {
      const b = document.createElement('button');
      b.className = 'prog__s';
      b.type = 'button';
      b.title = (i + 1) + '. ' + (s.dataset.title || '');
      b.setAttribute('aria-label', 'Ir para a cena ' + (i + 1));
      b.addEventListener('click', () => go(i));
      prog.appendChild(b);
    }
    if (toc) {
      const b = document.createElement('button');
      b.className = 'toc__i';
      b.type = 'button';
      b.dataset.i = String(i);
      b.innerHTML = '<span class="toc__n">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="toc__t">' + (s.dataset.title || '') + '</span>';
      b.addEventListener('click', () => { closeOv(); go(i); });
      toc.appendChild(b);
    }
  });

  subjects.forEach((c) => {
    if (!rail) return;
    const b = document.createElement('button');
    b.className = 'rail__i';
    b.type = 'button';
    b.innerHTML = '<span class="rail__l">' + c.n + ' · ' + c.name + '</span><span class="rail__d"></span>';
    b.setAttribute('aria-label', 'Assunto ' + c.n + ': ' + c.name);
    b.addEventListener('click', () => go(c.i));
    rail.appendChild(b);
  });

  const segs = prog ? $$('.prog__s', prog) : [];
  const rails = rail ? $$('.rail__i', rail) : [];
  const tocs = toc ? $$('.toc__i', toc) : [];

  function paint() {
    segs.forEach((s, i) => {
      s.classList.toggle('now', i === cur);
      s.classList.toggle('done', i < cur);
    });
    const ch = slides[cur].dataset.chapter;
    const idx = subjects.findIndex((s) => s.id === ch);
    rails.forEach((r, i) => r.classList.toggle('on', i === idx));
    tocs.forEach((t, i) => t.classList.toggle('on', i === cur));

    root.dataset.chapter = ch;
    root.dataset.cloth = slides[cur].dataset.cloth || 'kente';

    const ct = $('#count');
    if (ct) ct.innerHTML = '<b>' + String(cur + 1).padStart(2, '0') + '</b> / ' + String(total).padStart(2, '0');
    const nm = $('#chapname');
    if (nm) nm.textContent = slides[cur].dataset.chapterName || '';
    const tt = $('#doctitle');
    if (tt) tt.textContent = (slides[cur].dataset.title || 'Confluências') + ' — Confluências';

    $('#prev').disabled = cur === 0;
    $('#next').disabled = cur === total - 1;

    const nt = $('#note-body');
    if (nt) nt.innerHTML = slides[cur].dataset.note || '<p>Sem notas para esta cena.</p>';
    const nl = $('#note-loc');
    if (nl) nl.textContent = String(cur + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');

    syncTone(slides[cur]);
    countUp(slides[cur]);
    hideHint();
    if (typeof paintCloth === 'function') paintCloth();
  }

  /* ---------- contadores ---------- */
  function countUp(slide) {
    $$('[data-count]', slide).forEach((el) => {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      const target = parseFloat(String(el.dataset.count).replace(',', '.'));
      const suffix = el.dataset.suffix || '';
      const dec = (String(el.dataset.count).split('.')[1] || '').length;
      if (reduced) { el.textContent = el.dataset.count + suffix; return; }
      const t0 = performance.now(), dur = 1500;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - k, 3);
        el.textContent = (target * e).toFixed(dec).replace('.', ',') + suffix;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------- navegação ---------- */
  function go(i, dir) {
    i = Math.max(0, Math.min(total - 1, i));
    if (i === cur || locked) return;
    dir = dir || (i > cur ? 'next' : 'prev');
    locked = true;
    deck.dataset.dir = dir;

    const from = slides[cur];
    from.classList.remove('is-active');
    from.setAttribute('aria-hidden', 'true');
    from.inert = true;

    cur = i;
    const to = slides[cur];
    to.inert = false;
    to.removeAttribute('aria-hidden');
    to.classList.add('is-active');
    /* reinicia animações de entrada */
    to.querySelectorAll('[data-anim]').forEach((n) => {
      n.style.animation = 'none';
      void n.offsetWidth;
      n.style.animation = '';
    });
    clearTimeout(to._t);
    to._t = setTimeout(() => to.classList.add('is-settled'), 1700);

    paint();
    sweep();
    if (history.replaceState) history.replaceState(null, '', '#/' + (to.id || cur));
    setTimeout(() => { locked = false; }, reduced ? 60 : 620);
  }
  const next = () => go(cur + 1, 'next');
  const prev = () => go(cur - 1, 'prev');

  /* ---------- teclado ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    const openOv = $$('.ov.on');
    const passthru = ['g', 'G', 'o', 'O', '?', '/'];

    if (k === 'Escape') { closeOv(); return; }
    if (openOv.length && passthru.indexOf(k) < 0 &&
        ['ArrowRight', 'ArrowLeft'].indexOf(k) < 0) return;

    switch (k) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': case 'Enter':
        e.preventDefault(); next(); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace':
        e.preventDefault(); prev(); break;
      case 'f': case 'F': toggleFs(); break;
      case 'r': case 'R': toggleClock(); break;
      case 't': case 'T': setTheme(root.dataset.theme === 'light' ? 'dark' : 'light'); break;
      case 'n': case 'N': toggleNotes(); break;
      case 'g': case 'G': case 'o': case 'O': e.preventDefault(); toggleOv('#ov-toc'); break;
      case '?': case '/': e.preventDefault(); toggleOv('#ov-help'); break;
    }
  });

  /* ---------- roda do mouse e trackpad ----------
     navegação implícita: não aparece na lista de atalhos */
  let wheelLock = 0, acc = 0;
  window.addEventListener('wheel', (e) => {
    if ($$('.ov.on').length || (e.target.closest && e.target.closest('.notes'))) return;
    if (Math.abs(e.deltaY) < 12 && Math.abs(e.deltaX) < 12) return;
    const now = performance.now();
    if (now - wheelLock < 900) return;
    const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    /* um clique de roda chega com delta grande e ja vale: trackpad vem em doses
       pequenas, entao ai o movimento precisa se acumular. */
    const forte = Math.abs(d) >= 50;
    if (!forte && Math.abs(acc) < 40) { acc += d; return; }
    wheelLock = now;
    acc = 0;
    if (d > 0) next(); else prev();
  }, { passive: true });

  /* ---------- toque ---------- */
  let tx = 0, ty = 0, tt2 = 0;
  window.addEventListener('touchstart', (e) => {
    tx = e.changedTouches[0].clientX; ty = e.changedTouches[0].clientY; tt2 = Date.now();
  }, { passive: true });
  window.addEventListener('touchend', (e) => {
    if ($$('.ov.on').length) return;
    const dx = e.changedTouches[0].clientX - tx;
    const dy = e.changedTouches[0].clientY - ty;
    if (Date.now() - tt2 < 700 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      dx < 0 ? next() : prev();
    }
  }, { passive: true });

  /* ---------- sobreposições ---------- */
  function toggleOv(sel) {
    const ov = $(sel);
    if (!ov) return;
    const on = ov.classList.contains('on');
    $$('.ov').forEach((o) => o.classList.remove('on'));
    if (!on) ov.classList.add('on');
  }
  function closeOv() { $$('.ov').forEach((o) => o.classList.remove('on')); }
  $$('[data-ov]').forEach((b) => b.addEventListener('click', () => toggleOv(b.dataset.ov)));
  $$('.ov').forEach((ov) => ov.addEventListener('click', (e) => { if (e.target === ov) closeOv(); }));

  /* ---------- notas do apresentador ---------- */
  function toggleNotes() {
    const n = $('#notes');
    if (!n) return;
    const on = n.classList.toggle('on');
    const b = $('#notesbtn');
    if (b) b.setAttribute('aria-pressed', String(on));
  }
  const nb = $('#notesbtn');
  if (nb) nb.addEventListener('click', toggleNotes);
  const nc = $('#notes-close');
  if (nc) nc.addEventListener('click', toggleNotes);

  /* ---------- tela cheia ---------- */
  function toggleFs() {
    if (!document.fullscreenElement) {
      (document.documentElement.requestFullscreen || function () {}).call(document.documentElement);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
  const fb = $('#fsbtn');
  if (fb) fb.addEventListener('click', toggleFs);

  /* ---------- tema ---------- */
  const tb = $('#theme');
  if (tb) tb.addEventListener('click', () => setTheme(root.dataset.theme === 'light' ? 'dark' : 'light'));

  /* ---------- cronômetro: mostrar e esconder sem zerar ---------- */
  const clock = $('#clock');
  let t0 = 0, tick = null, running = false;
  function paintClock() {
    const s = Math.floor((Date.now() - t0) / 1000);
    clock.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }
  function toggleClock() {
    if (!clock) return;
    if (!running) { t0 = Date.now(); running = true; tick = setInterval(paintClock, 1000); paintClock(); }
    /* some sozinho depois de 4 s, sem interromper a contagem */
    clearTimeout(clock._t);
    clock.classList.add('on');
    clock._t = setTimeout(() => clock.classList.remove('on'), 4000);
    const b = $('#clockbtn');
    if (b) b.setAttribute('aria-pressed', 'true');
  }
  function resetClock() {
    t0 = Date.now(); paintClock();
  }
  const cb = $('#clockbtn');
  if (cb) cb.addEventListener('click', toggleClock);
  if (clock) {
    clock.addEventListener('click', (e) => { e.stopPropagation(); resetClock(); });
    clock.addEventListener('pointerenter', () => { clearTimeout(clock._t); clock.classList.add('on'); });
    clock.addEventListener('pointerleave', () => { clock._t = setTimeout(() => clock.classList.remove('on'), 1500); });
  }

  /* ---------- botões de cena ---------- */
  const pn = $('#prev'), nx = $('#next');
  if (pn) pn.addEventListener('click', prev);
  if (nx) nx.addEventListener('click', next);
  $$('[data-goto]').forEach((b) => b.addEventListener('click', () => go(+b.dataset.goto)));

  /* ---------- dica inicial ---------- */
  const hint = $('#hint');
  function hideHint() { if (hint) hint.style.opacity = '0'; }
  const heroNext = $('#hero-next');
  if (heroNext) heroNext.addEventListener('click', next);

  /* ---------- espectro de tons ---------- */
  function syncTone(slide) {
    const bar = slide.querySelector('[data-tone-bar]');
    if (!bar) return;
    const first = bar.querySelector('.l-tone__sw');
    if (first && !bar.dataset.done) { bar.dataset.done = '1'; selectTone(bar, first.dataset.tone); }
  }
  function selectTone(bar, key) {
    const slide = bar.closest('.slide');
    const panel = slide.querySelector('[data-tone-panel]');
    $$('.l-tone__sw', bar).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tone === key)));
    if (panel) {
      const p = panel.querySelector('[data-pane="' + key + '"]');
      $$('[data-pane]', panel).forEach((x) => { x.hidden = x !== p; });
    }
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.l-tone__sw');
    if (!b) return;
    const bar = b.closest('[data-tone-bar]');
    selectTone(bar, b.dataset.tone);
  });

  /* ---------- padrão de fundo ----------
     O desenho vem da variavel --pat, trocada por [data-cloth] no <html>.
     As camadas ficam sempre ligadas; o que muda e o desenho. */
  const clothEls = $$('.cloth');
  function paintCloth() {
    clothEls.forEach((c) => c.classList.add('on'));
  }
  paintCloth();

  /* ---------- motivos têxteis decorativos no fundo ---------- */
  const bgmark = $('#bgmark');
  if (bgmark) {
    const MARKS = ['kente', 'bogolan', 'aso', 'kuba', 'adire', 'lozenge'];
    bgmark.innerHTML = MARKS.map((n) => Art.motif(n)).join('');
    bgmark.classList.add('on');
  }

  /* ---------- inicialização ---------- */
  function start() {
    initTheme();
    const hash = (location.hash.match(/#\/([\w-]+)/) || [])[1];
    let i = hash ? slides.findIndex((s) => s.id === hash) : 0;
    if (i < 0) i = 0;

    slides.forEach((s, k) => {
      s.setAttribute('aria-hidden', 'true');
      s.inert = true;
      s.classList.toggle('is-active', k === i);
      if (k === i) { s.removeAttribute('aria-hidden'); s.inert = false; }
    });
    cur = i;
    paint();
    paintCloth();
    setTimeout(() => slides[i].classList.add('is-settled'), 1700);

    const b = $('#boot');
    if (b) {
      b.classList.add('gone');
      setTimeout(() => b.remove(), 900);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      Art.mount();
      const go1 = () => start();
      if (document.fonts && document.fonts.ready) {
        let done = false;
        const fin = () => { if (!done) { done = true; go1(); } };
        document.fonts.ready.then(fin);
        setTimeout(fin, 1600);
      } else go1();
    });
  } else { Art.mount(); start(); }
})();
