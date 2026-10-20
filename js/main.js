(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  // revelação por seção
  const rv = [...document.querySelectorAll('.rv')];
  if (reduce || !('IntersectionObserver' in window)) {
    rv.forEach(e => e.classList.add('in'));
  } else {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rv.forEach(e => io.observe(e));
  }

  // conceito: cada linha acende ao cruzar o centro da tela
  const rows = [...document.querySelectorAll('[data-t]')];
  if (reduce || !('IntersectionObserver' in window)) {
    rows.forEach(r => r.classList.add('on'));
  } else {
    const to = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('on');
    }), { rootMargin: '-30% 0px -30% 0px' });
    rows.forEach(r => to.observe(r));
  }

  // refletor: a luz da parede segue o ponteiro (só mouse, sem movimento reduzido)
  if (fine && !reduce) {
    const hero = document.querySelector('.hero');
    let raf = 0, nx = 72, ny = 30;
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      nx = ((e.clientX - r.left) / r.width) * 100;
      ny = ((e.clientY - r.top) / r.height) * 100;
      if (!raf) raf = requestAnimationFrame(() => {
        hero.style.setProperty('--mx', nx.toFixed(1) + '%');
        hero.style.setProperty('--my', ny.toFixed(1) + '%');
        raf = 0;
      });
    }, { passive: true });
    document.querySelectorAll('.plate').forEach(p => {
      p.addEventListener('pointermove', e => {
        const r = p.getBoundingClientRect();
        p.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
        p.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 100).toFixed(1) + '%');
      }, { passive: true });
    });
  }

  // salas: setas e teclado
  const rail = document.querySelector('.rail');
  const step = dir => {
    const room = rail.querySelector('.room');
    const w = room.getBoundingClientRect().width + (parseFloat(getComputedStyle(rail).columnGap) || 24);
    rail.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
  };
  const count = document.getElementById('count');
  const romans = ['I', 'II', 'III'];
  const room0 = rail.querySelector('.room');
  rail.addEventListener('scroll', () => {
    const w = room0.getBoundingClientRect().width + (parseFloat(getComputedStyle(rail).columnGap) || 24);
    const i = Math.min(2, Math.max(0, Math.round(rail.scrollLeft / w)));
    count.textContent = romans[i] + ' / III';
  }, { passive: true });
  document.querySelectorAll('.arrow').forEach(b => b.addEventListener('click', () => step(+b.dataset.dir)));
  rail.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });

  // CTA fixo no celular depois da primeira dobra
  const float = document.querySelector('[data-float]');
  const hero = document.querySelector('.hero');
  const visit = document.querySelector('#visita');
  if (float && 'IntersectionObserver' in window) {
    let past = false, atVisit = false;
    const upd = () => float.classList.toggle('show', past && !atVisit);
    new IntersectionObserver(([e]) => { past = !e.isIntersecting; upd(); }).observe(hero);
    new IntersectionObserver(([e]) => { atVisit = e.isIntersecting; upd(); }, { threshold: .2 }).observe(visit);
  }
})();
