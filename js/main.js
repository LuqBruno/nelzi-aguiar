(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 760px)');
  const cleanups = [], stops = [];
  const listen = (el, event, fn, options) => { el.addEventListener(event, fn, options); cleanups.push(() => el.removeEventListener(event, fn, options)); };
  const motion = window.Motion;
  if (motion && !reduced.matches) {
    stops.push(motion.animate('.hero h1', { opacity: [.75, 1], transform: ['translateY(18px)', 'translateY(0)'] }, { duration: .8, ease: [.16, 1, .3, 1] }));
    stops.push(motion.animate('.hero-art', { clipPath: ['inset(8% 0 8% 0)', 'inset(0)'], opacity: [.6, 1] }, { duration: 1, ease: [.16, 1, .3, 1] }));
    const stopPortrait = motion.inView('.portrait-crop', entry => { stops.push(motion.animate(entry, { clipPath: ['inset(4% 0 4% 0 round 24px)', 'inset(0 round 24px)'] }, { duration: .75, ease: [.16, 1, .3, 1] })); }, { amount: .25 });
    cleanups.push(stopPortrait);
  }
  const menu = document.querySelector('.mobile-menu'), menuButton = document.querySelector('.menu-toggle');
  const menuLinks = [...menu.querySelectorAll('a')];
  let oldOverflow = '';
  function closeMenu(restore = true) {
    menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Abrir menu');
    document.body.style.overflow = oldOverflow; if (restore) menuButton.focus();
  }
  function openMenu() {
    oldOverflow = document.body.style.overflow; menu.hidden = false; document.body.style.overflow = 'hidden';
    menuButton.setAttribute('aria-expanded', 'true'); menuButton.setAttribute('aria-label', 'Fechar menu');
    if (motion && !reduced.matches) motion.animate(menu, { opacity: [0, 1], transform: ['translateY(-12px)', 'translateY(0)'] }, { duration: .2, ease: [.16, 1, .3, 1] });
    menuLinks[0].focus();
  }
  listen(menuButton, 'click', () => menu.hidden ? openMenu() : closeMenu());
  menuLinks.forEach(a => listen(a, 'click', () => closeMenu(false)));
  listen(document, 'keydown', e => {
    if (menu.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); closeMenu(); }
    if (e.key === 'Tab') {
      const nodes = [menuButton, ...menuLinks], i = nodes.indexOf(document.activeElement);
      e.preventDefault(); nodes[e.shiftKey ? (i <= 0 ? nodes.length - 1 : i - 1) : (i + 1) % nodes.length].focus();
    }
  });
  listen(mobile, 'change', () => { if (!mobile.matches && !menu.hidden) closeMenu(false); });

  const scene = document.querySelector('.porcelain-scene'), object = document.querySelector('.scene-object');
  const notes = [...document.querySelectorAll('[data-note]')];
  let sceneVisible = false, raf = 0, activeNote = -1;
  function renderScene() {
    raf = 0;
    if (reduced.matches || mobile.matches) { object.style.transform = ''; notes.forEach(n => n.classList.add('active')); return; }
    const rect = scene.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - innerHeight)));
    object.style.transform = `translateY(${-progress * 22}px) scale(${1 + progress * .13})`;
    const index = Math.min(2, Math.floor(progress * 3));
    if (index !== activeNote) { notes.forEach((n, i) => n.classList.toggle('active', i === index)); activeNote = index; }
  }
  function queueScene() { if (sceneVisible && !raf) raf = requestAnimationFrame(renderScene); }
  const sceneObserver = new IntersectionObserver(([entry]) => { sceneVisible = entry.isIntersecting; if (sceneVisible) queueScene(); });
  sceneObserver.observe(scene);
  listen(window, 'scroll', queueScene, { passive: true }); listen(window, 'resize', queueScene, { passive: true }); listen(reduced, 'change', renderScene); listen(mobile, 'change', renderScene); renderScene();

  const gallery = document.querySelector('.lab-gallery'), slides = [...gallery.querySelectorAll('.lab-slide')];
  const arrows = [...document.querySelectorAll('[data-slide-dir]')], count = document.querySelector('.gallery-count');
  let selected = 0, galleryFrame = 0;
  const slideWidth = () => slides[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(gallery).columnGap) || 24);
  function galleryState() {
    galleryFrame = 0;
    selected = Math.min(slides.length - 1, Math.max(0, Math.round(gallery.scrollLeft / slideWidth())));
    count.textContent = `${selected + 1} / ${slides.length}`;
    arrows[0].disabled = gallery.scrollLeft < 3; arrows[1].disabled = gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 3;
  }
  function goTo(index, instant = false) { gallery.scrollTo({ left: Math.max(0, Math.min(slides.length - 1, index)) * slideWidth(), behavior: instant || reduced.matches ? 'instant' : 'smooth' }); }
  arrows.forEach(button => listen(button, 'click', () => goTo(selected + Number(button.dataset.slideDir))));
  listen(gallery, 'scroll', () => { if (!galleryFrame) galleryFrame = requestAnimationFrame(galleryState); }, { passive: true });
  listen(gallery, 'keydown', e => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault(); goTo(e.key === 'Home' ? 0 : e.key === 'End' ? slides.length - 1 : selected + (e.key === 'ArrowRight' ? 1 : -1), true);
  });
  let drag = null;
  listen(gallery, 'pointerdown', e => { if (e.pointerType === 'mouse' && e.button === 0) drag = { x: e.clientX, y: e.clientY, left: gallery.scrollLeft, id: e.pointerId, active: false }; });
  listen(gallery, 'pointermove', e => {
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.active && Math.abs(dy) > Math.abs(dx) + 5) { drag = null; return; }
    if (Math.abs(dx) > 8 || drag.active) { drag.active = true; gallery.setPointerCapture(e.pointerId); gallery.classList.add('dragging'); e.preventDefault(); gallery.scrollLeft = drag.left - dx; }
  });
  const stopDrag = e => { if (drag?.id === e.pointerId) { drag = null; gallery.classList.remove('dragging'); if (gallery.hasPointerCapture(e.pointerId)) gallery.releasePointerCapture(e.pointerId); } };
  listen(gallery, 'pointerup', stopDrag); listen(gallery, 'pointercancel', stopDrag);
  const galleryResize = new ResizeObserver(galleryState); galleryResize.observe(gallery); galleryState();
  const floating = document.querySelector('.floating-contact');
  let heroVisible = true, contactVisible = false;
  function floatingState() { floating.classList.toggle('visible', !heroVisible && !contactVisible); }
  const heroObserver = new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; floatingState(); });
  const contactObserver = new IntersectionObserver(([e]) => { contactVisible = e.isIntersecting; floatingState(); });
  heroObserver.observe(document.querySelector('.hero')); contactObserver.observe(document.querySelector('.contact'));
  listen(window, 'pagehide', e => { if (e.persisted) return; cleanups.forEach(fn => fn()); stops.forEach(a => a.stop()); sceneObserver.disconnect(); galleryResize.disconnect(); heroObserver.disconnect(); contactObserver.disconnect(); cancelAnimationFrame(raf); cancelAnimationFrame(galleryFrame); });
})();
