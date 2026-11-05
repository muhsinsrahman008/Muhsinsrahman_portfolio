(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader = document.querySelector('#loader');
  window.addEventListener('load', () => setTimeout(() => loader?.classList.add('done'), reduced ? 0 : 950));

  // Reveal sections as they enter the viewport.
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: .12, rootMargin: '0px 0px -35px 0px'});
    revealEls.forEach(el => revealObserver.observe(el));
  } else revealEls.forEach(el => el.classList.add('in'));

  // Active section tracking.
  const navLinks = [...document.querySelectorAll('.topnav nav a')];
  const sections = [...document.querySelectorAll('main section[id]')];
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
    }), {rootMargin: '-35% 0px -55% 0px'});
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Mobile menu.
  const menuBtn = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.topnav nav');
  menuBtn?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menuBtn.textContent = open ? '×' : '☰';
  });
  navLinks.forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open'); menuBtn?.setAttribute('aria-expanded', 'false');
    if (menuBtn) { menuBtn.textContent = '☰'; menuBtn.setAttribute('aria-label', 'Open navigation'); }
  }));

  // Gentle pointer aura + subtle planet parallax (desktop, motion-safe only).
  const aura = document.querySelector('.cursor-aura');
  const cosmos = document.querySelector('.cosmos');
  if (!reduced && matchMedia('(pointer:fine)').matches) {
    window.addEventListener('pointermove', event => {
      if (aura) { aura.style.left = `${event.clientX}px`; aura.style.top = `${event.clientY}px`; }
      const x = (event.clientX / innerWidth - .5) * 10;
      const y = (event.clientY / innerHeight - .5) * 10;
      if (cosmos) cosmos.style.transform = `translate(${x}px, ${y}px)`;
    }, {passive:true});
  }

  // Quick navigation command palette: Ctrl/Cmd + K.
  const dialog = document.querySelector('.command-dialog');
  const commandInput = document.querySelector('.command-input');
  const resultLinks = [...document.querySelectorAll('.command-results a')];
  const openPalette = () => { if (!dialog.open) dialog.showModal(); commandInput.value=''; filterCommands(''); commandInput.focus(); };
  const closePalette = () => dialog?.close();
  const filterCommands = value => {
    const q = value.trim().toLowerCase();
    resultLinks.forEach(link => link.hidden = !link.textContent.toLowerCase().includes(q));
  };
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openPalette(); }
    if (event.key === 'Escape' && dialog?.open) closePalette();
  });
  document.querySelector('.command-hint')?.addEventListener('click', openPalette);
  document.querySelector('.command-close')?.addEventListener('click', closePalette);
  commandInput?.addEventListener('input', event => filterCommands(event.target.value));
  commandInput?.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      const first = resultLinks.find(link => !link.hidden);
      if (first) { first.click(); closePalette(); }
    }
  });
  resultLinks.forEach(link => link.addEventListener('click', closePalette));
  dialog?.addEventListener('click', event => { if (event.target === dialog) closePalette(); });

  // Back-to-top appears after scrolling.
  const backTop = document.querySelector('.back-top');
  window.addEventListener('scroll', () => backTop?.classList.toggle('show', scrollY > 650), {passive:true});
  backTop?.addEventListener('click', () => window.scrollTo({top:0,behavior:reduced?'auto':'smooth'}));

  // Current year.
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
