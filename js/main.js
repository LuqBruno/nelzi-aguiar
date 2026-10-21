(() => {
  'use strict';
  const root = document.documentElement;
  const M = window.Motion;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const narrow = matchMedia('(max-width: 860px)');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = [.16, 1, .3, 1];
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  let motionOn = !!M && !reduced.matches && root.classList.contains('motion');
  if (motionOn) window.__nelziReady = true; else root.classList.remove('motion');

  // scroll loop shared by every scroll-linked piece
  const onScroll = new Set();
  let ticking = false;
  const frame = () => { ticking = false; onScroll.forEach(fn => fn()); };
  const queue = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue, { passive: true });

  /* header */
  const top = $('[data-top]'), menu = $('#menu-mobile'), menuButton = $('.menu-toggle');
  let lastY = scrollY;
  onScroll.add(() => {
    const y = scrollY, menuOpen = !menu.hidden;
    top.classList.toggle('solid', y > 40 || menuOpen);
    if (!menuOpen && Math.abs(y - lastY) > 6) { top.classList.toggle('away', y > lastY && y > innerHeight * .6); lastY = y; }
  });
  addEventListener('focusin', e => { if (top.contains(e.target)) top.classList.remove('away'); });

  const navLinks = $$('.nav a');
  const sections = navLinks.map(a => $(a.getAttribute('href')));
  const navObserver = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) navLinks.forEach((a, i) => sections[i] === e.target ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
  }), { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => s && navObserver.observe(s));

  /* mobile menu */
  const menuLinks = $$('a', menu);
  function closeMenu(restore = true) {
    menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Abrir menu');
    document.body.style.overflow = ''; queue(); if (restore) menuButton.focus();
  }
  function openMenu() {
    menu.hidden = false; document.body.style.overflow = 'hidden'; top.classList.add('solid'); top.classList.remove('away');
    menuButton.setAttribute('aria-expanded', 'true'); menuButton.setAttribute('aria-label', 'Fechar menu');
    if (motionOn) M.animate(menuLinks.map(a => a.firstElementChild), { transform: ['translateY(110%)', 'translateY(0)'] }, { duration: .7, ease, delay: M.stagger(.05) });
    menuLinks[0].focus();
  }
  menuButton.addEventListener('click', () => menu.hidden ? openMenu() : closeMenu());
  menuLinks.forEach(a => a.addEventListener('click', () => closeMenu(false)));
  document.addEventListener('keydown', e => {
    if (menu.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); closeMenu(); }
    if (e.key === 'Tab') {
      const nodes = [menuButton, ...menuLinks], i = nodes.indexOf(document.activeElement);
      e.preventDefault(); nodes[e.shiftKey ? (i <= 0 ? nodes.length - 1 : i - 1) : (i + 1) % nodes.length].focus();
    }
  });
  narrow.addEventListener('change', () => { if (!narrow.matches && !menu.hidden) closeMenu(false); });

  /* hero entrance + reveals */
  const lines = el => $$('.ln > *', el);
  if (motionOn) {
    const hero = $('.hero');
    M.animate(lines(hero), { transform: ['translateY(108%)', 'translateY(0)'] }, { duration: 1.25, ease, delay: M.stagger(.09, { startDelay: .15 }) });
    M.animate('.hero .portrait-frame', { clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'] }, { duration: 1.5, ease: [.7, 0, .2, 1] });
    M.animate('.hero .portrait-frame img', { transform: ['scale(1.18)', 'scale(1)'], filter: ['blur(10px)', 'blur(0px)'] }, { duration: 2, ease });
    M.animate('.hero .signature', { clipPath: ['inset(-20% 100% -20% 0)', 'inset(-20% 0% -20% 0)'] }, { duration: 1.9, delay: 1.1, ease: [.45, 0, .25, 1] });
    M.animate($$('[data-rise]', hero), { opacity: [0, 1], transform: ['translateY(22px)', 'translateY(0)'] }, { duration: 1, ease, delay: M.stagger(.12, { startDelay: .75 }) });

    $$('h2, h3').filter(h => !hero.contains(h) && $('.ln', h)).forEach(h => {
      M.inView(h, () => { M.animate(lines(h), { transform: ['translateY(108%)', 'translateY(0)'] }, { duration: 1.1, ease, delay: M.stagger(.1) }); }, { amount: .4 });
    });
    $$('[data-rise]').filter(el => !hero.contains(el)).forEach(el => {
      M.inView(el, () => { M.animate(el, { opacity: [0, 1], transform: ['translateY(22px)', 'translateY(0)'] }, { duration: .9, ease, delay: .12 }); }, { amount: .3 });
    });
    M.inView('.values', el => { M.animate($$('li', el), { opacity: [0, 1], transform: ['translateY(16px)', 'translateY(0)'] }, { duration: .9, ease, delay: M.stagger(.12) }); }, { amount: .3 });
    M.inView('.doctor-portrait', el => { M.animate($('.signature', el), { clipPath: ['inset(-20% 100% -20% 0)', 'inset(-20% 0% -20% 0)'] }, { duration: 1.8, ease: [.45, 0, .25, 1], delay: .5 }); M.animate($('img', el), { transform: ['scale(1.14)', 'scale(1)'] }, { duration: 1.8, ease }); }, { amount: .35 });
    M.inView('.detail-pieces', el => { M.animate($('img', el), { clipPath: ['inset(12% 12% 12% 12% round 22px)', 'inset(0% 0% 0% 0% round 22px)'], transform: ['scale(1.06)', 'scale(1)'] }, { duration: 1.4, ease }); }, { amount: .25 });
    M.inView('.detail-macro', el => { M.animate($('img', el), { transform: ['scale(1.12)', 'scale(1)'] }, { duration: 1.6, ease }); }, { amount: .25 });

    // hero depth on scroll
    const portrait = $('.hero .portrait-frame'), copy = $('.hero-copy');
    onScroll.add(() => {
      const y = scrollY; if (y > innerHeight * 1.2) return;
      portrait.style.translate = `0 ${y * .12}px`;
      copy.style.translate = `0 ${y * -.05}px`;
      copy.style.opacity = String(1 - clamp(y / (innerHeight * .9)) * .6);
    });
  }

  /* compare (before/after) */
  function Compare(el) {
    const range = $('.compare-range', el);
    const api = { el, value: Number(range.value), user: false };
    api.set = (v, fromUser) => {
      api.value = clamp(v, 0, 100);
      el.style.setProperty('--pos', api.value + '%');
      range.value = Math.round(api.value);
      range.setAttribute('aria-valuetext', `${Math.round(api.value)}% depois`);
      el.classList.toggle('at-edge', api.value < .5 || api.value > 99.5);
      el.classList.toggle('no-after', api.value < 10); el.classList.toggle('no-before', api.value > 90);
      if (fromUser) api.user = true;
    };
    const fromPointer = e => { const r = el.getBoundingClientRect(); api.set((e.clientX - r.left) / r.width * 100, true); };
    let id = null, startX = 0, startY = 0, locked = false;
    el.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      id = e.pointerId; startX = e.clientX; startY = e.clientY; locked = e.pointerType === 'mouse';
      if (locked) { el.setPointerCapture(id); el.classList.add('dragging'); fromPointer(e); }
    });
    el.addEventListener('pointermove', e => {
      if (e.pointerId !== id) return;
      if (!locked) {
        const dx = Math.abs(e.clientX - startX), dy = Math.abs(e.clientY - startY);
        if (dy > dx && dy > 6) { id = null; return; }
        if (dx > 6) { locked = true; el.setPointerCapture(id); el.classList.add('dragging'); }
      }
      if (locked) { e.preventDefault(); fromPointer(e); }
    });
    const end = e => { if (e.pointerId !== id) return; if (!locked && e.type === 'pointerup') fromPointer(e); id = null; el.classList.remove('dragging'); };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
    range.addEventListener('input', () => api.set(Number(range.value), true));
    api.set(api.value);
    return api;
  }
  const compares = $$('[data-compare]').map(Compare);

  /* act: a tela → a artista → a obra de arte */
  const act = $('.act'), actCompare = compares.find(c => c.el.hasAttribute('data-scroll-driven'));
  const words = $$('[data-act]', act), notes = $$('[data-note]', act), progress = $('.act-progress', act);
  let actIndex = -1;
  const setAct = i => { if (i === actIndex) return; actIndex = i; words.forEach((w, k) => w.classList.toggle('on', k === i)); notes.forEach((n, k) => n.classList.toggle('on', k === i)); };
  function actMode() {
    const pinned = motionOn;
    act.classList.toggle('pinned', pinned);
    if (!pinned) { words.forEach(w => w.classList.remove('on')); notes.forEach(n => n.classList.remove('on')); actIndex = -1; if (!actCompare.user) actCompare.set(50); }
    queue();
  }
  onScroll.add(() => {
    if (!act.classList.contains('pinned')) return;
    const r = act.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const p = clamp(-r.top / Math.max(1, r.height - innerHeight));
    const w = clamp((p - .2) / .58);
    const eased = w < .5 ? 4 * w * w * w : 1 - Math.pow(-2 * w + 2, 3) / 2;
    actCompare.set(eased * 100); actCompare.user = false;
    setAct(p < .2 ? 0 : p < .8 ? 1 : 2);
    progress.style.setProperty('--p', p.toFixed(4));
  });
  actMode();
  reduced.addEventListener('change', () => { motionOn = !!M && !reduced.matches; root.classList.toggle('motion', motionOn); actMode(); });

  /* case view switch: rosto / sorriso de perto */
  const caseCompare = compares.find(c => c.el.closest('.case'));
  const switcher = $('.view-switch');
  const alts = [
    ['Antes: paciente sorrindo de frente, com dentes de tons diferentes.', 'Depois: o mesmo paciente com lentes de contato em porcelana.'],
    ['Antes: o mesmo sorriso visto de perto, com um incisivo mais amarelado.', 'Depois: o sorriso de perto com as lentes de contato em porcelana.']
  ];
  let view = 0, swapping = false;
  // animations can stall in a hidden tab; never let the switch wait on them forever
  const settle = (anim, ms) => Promise.race([anim.finished, new Promise(r => setTimeout(r, ms))]);
  $$('button', switcher).forEach(btn => btn.addEventListener('click', async () => {
    const next = Number(btn.dataset.view);
    if (next === view || swapping) return;
    swapping = true; view = next;
    switcher.dataset.active = String(next);
    $$('button', switcher).forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    const el = caseCompare.el, imgs = [$('.compare-before', el), $('.compare-after', el)];
    const from = el.getBoundingClientRect().height;
    const load = imgs.map((img, k) => { const src = `assets/img/${img.dataset.views.split(' ')[next]}.webp`; const pre = new Image(); pre.src = src; return Promise.race([pre.decode().catch(() => {}), new Promise(r => setTimeout(r, 700))]).then(() => src); });
    if (motionOn) await settle(M.animate(imgs, { opacity: [1, 0] }, { duration: .22 }), 300);
    const srcs = await Promise.all(load);
    imgs.forEach((img, k) => { img.src = srcs[k]; img.alt = alts[next][k]; img.width = next ? 1200 : 516; img.height = next ? 450 : 920; });
    el.classList.toggle('view-wide', next === 1);
    if (motionOn) {
      const to = el.getBoundingClientRect().height;
      el.style.height = from + 'px';
      await Promise.all([settle(M.animate(el, { height: [from + 'px', to + 'px'] }, { duration: .7, ease }), 800), settle(M.animate(imgs, { opacity: [0, 1] }, { duration: .5, delay: .25 }), 850)]);
      imgs.forEach(img => { img.style.opacity = ''; });
      el.style.height = '';
    }
    caseCompare.set(50);
    swapping = false;
  }));
  if (motionOn) M.inView(caseCompare.el, () => {
    if (caseCompare.user) return;
    M.animate(0, 1, { duration: 1.8, ease: [.45, 0, .25, 1], delay: .4, onUpdate: t => { if (!caseCompare.user) caseCompare.set(50 + Math.sin(t * Math.PI * 2) * 14 * (1 - t * .3)); } });
  }, { amount: .55 });

  /* loupe */
  const loupeFrame = $('.loupe-frame'), loupe = $('.loupe', loupeFrame), macro = $('img', loupeFrame);
  const zoom = 2.6;
  let target = { x: 0, y: 0 }, cur = { x: 0, y: 0 }, loupeRaf = 0, looking = false;
  function loupeTick() {
    const k = motionOn ? .22 : 1;
    cur.x += (target.x - cur.x) * k; cur.y += (target.y - cur.y) * k;
    const r = loupeFrame.getBoundingClientRect(), half = loupe.offsetWidth / 2;
    loupe.style.translate = `${cur.x}px ${cur.y}px`;
    loupe.style.backgroundSize = `${r.width * zoom}px ${r.height * zoom}px`;
    loupe.style.backgroundPosition = `${-(cur.x * zoom - half)}px ${-(cur.y * zoom - half)}px`;
    loupeRaf = looking || Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > .5 ? requestAnimationFrame(loupeTick) : 0;
  }
  loupeFrame.addEventListener('pointerenter', e => {
    if (!fine.matches) return;
    loupe.style.backgroundImage = `url("${macro.currentSrc || macro.src}")`;
    const r = loupeFrame.getBoundingClientRect(); cur.x = target.x = e.clientX - r.left; cur.y = target.y = e.clientY - r.top;
    looking = true; loupeFrame.classList.add('looking'); if (!loupeRaf) loupeRaf = requestAnimationFrame(loupeTick);
  });
  loupeFrame.addEventListener('pointermove', e => { if (!looking) return; const r = loupeFrame.getBoundingClientRect(); target.x = e.clientX - r.left; target.y = e.clientY - r.top; });
  loupeFrame.addEventListener('pointerleave', () => { looking = false; loupeFrame.classList.remove('looking'); });

  /* lab rail */
  const rail = $('.lab-rail'), cards = $$('.lab-card', rail), railButtons = $$('[data-rail]'), meter = $('.rail-meter');
  const step = () => cards[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(rail).columnGap) || 24);
  function railState() {
    const max = rail.scrollWidth - rail.clientWidth;
    railButtons[0].disabled = rail.scrollLeft < 4; railButtons[1].disabled = rail.scrollLeft > max - 4;
    meter.style.setProperty('--m', (rail.clientWidth / rail.scrollWidth + (1 - rail.clientWidth / rail.scrollWidth) * (max ? rail.scrollLeft / max : 0)).toFixed(3));
    if (!motionOn) return;
    const mid = rail.getBoundingClientRect().left + rail.clientWidth / 2;
    cards.forEach(c => { const img = $('img', c); if (!img) return; const r = c.getBoundingClientRect(); img.style.setProperty('--shift', `${(mid - (r.left + r.width / 2)) * .06}px`); });
  }
  let railRaf = 0;
  rail.addEventListener('scroll', () => { if (!railRaf) railRaf = requestAnimationFrame(() => { railRaf = 0; railState(); }); }, { passive: true });
  railButtons.forEach(b => b.addEventListener('click', () => rail.scrollBy({ left: step() * Number(b.dataset.rail), behavior: motionOn ? 'smooth' : 'instant' })));
  rail.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault(); rail.scrollBy({ left: step() * (e.key === 'ArrowRight' ? 1 : -1), behavior: motionOn ? 'smooth' : 'instant' });
  });
  let drag = null;
  rail.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.button === 0) drag = { x: e.clientX, left: rail.scrollLeft, id: e.pointerId, on: false }; });
  rail.addEventListener('pointermove', e => {
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.x;
    if (!drag.on && Math.abs(dx) > 6) { drag.on = true; rail.setPointerCapture(e.pointerId); rail.classList.add('dragging'); }
    if (drag.on) rail.scrollLeft = drag.left - dx;
  });
  const railEnd = e => {
    if (!drag || drag.id !== e.pointerId) return;
    const moved = drag.on; drag = null; rail.classList.remove('dragging');
    if (moved) { const i = Math.round(rail.scrollLeft / step()); rail.scrollTo({ left: i * step(), behavior: motionOn ? 'smooth' : 'instant' }); }
  };
  rail.addEventListener('pointerup', railEnd); rail.addEventListener('pointercancel', railEnd);
  new ResizeObserver(railState).observe(rail); railState();

  /* magnetic primary buttons */
  if (motionOn) $$('[data-magnet]').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      if (!fine.matches) return;
      const r = btn.getBoundingClientRect();
      btn.style.translate = `${(e.clientX - r.left - r.width / 2) * .16}px ${(e.clientY - r.top - r.height / 2) * .28}px`;
    });
    btn.addEventListener('pointerleave', () => {
      const [x, y] = (btn.style.translate || '0px 0px').split(' ').map(parseFloat);
      M.animate(btn, { translate: [`${x || 0}px ${y || 0}px`, '0px 0px'] }, { type: 'spring', stiffness: 260, damping: 15 });
    });
  });

  /* floating CTA */
  const floating = $('.floating-cta');
  let heroIn = true, contactIn = false;
  const floatState = () => floating.classList.toggle('visible', !heroIn && !contactIn);
  new IntersectionObserver(([e]) => { heroIn = e.isIntersecting; floatState(); }).observe($('.hero'));
  new IntersectionObserver(([e]) => { contactIn = e.isIntersecting; floatState(); }).observe($('.contact'));

  queue();
})();
