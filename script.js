(() => {
  'use strict';

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const loader = document.querySelector('#loader');

  window.addEventListener('load', () => {
    window.setTimeout(() => loader?.classList.add('done'), reducedMotion ? 0 : 950);
  });

  // Reveal animations: content remains visible if JavaScript or observer fails.
  const revealElements = [...document.querySelectorAll('.reveal')];

  if ('IntersectionObserver' in window && !reducedMotion) {
    document.documentElement.classList.add('reveal-ready');

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -35px 0px'
    });

    revealElements.forEach(element => revealObserver.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add('in'));
  }

  // Active navigation section.
  const nav = document.querySelector('#primary-navigation');
  const navLinks = [...document.querySelectorAll('#primary-navigation a')];
  const sections = [...document.querySelectorAll('main section[id]')];

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        navLinks.forEach(link => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle('active', active);

          if (active) {
            link.setAttribute('aria-current', 'location');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    }, {
      rootMargin: '-35% 0px -55% 0px'
    });

    sections.forEach(section => sectionObserver.observe(section));
  }

  // Accessible mobile navigation.
  const menuButton = document.querySelector('.menu-toggle');

  function setMenuOpen(open) {
    nav?.classList.toggle('open', open);
    menuButton?.setAttribute('aria-expanded', String(open));
    menuButton?.setAttribute(
      'aria-label',
      open ? 'Close navigation' : 'Open navigation'
    );

    if (menuButton) {
      menuButton.textContent = open ? '×' : '☰';
    }
  }

  menuButton?.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen);
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      setMenuOpen(false);
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      setMenuOpen(false);
    }
  });

  document.addEventListener('click', event => {
    if (
      nav?.classList.contains('open') &&
      !nav.contains(event.target) &&
      !menuButton?.contains(event.target)
    ) {
      setMenuOpen(false);
    }
  });

  // Pointer aura and subtle orbital movement on desktop.
  const aura = document.querySelector('.cursor-aura');
  const cosmos = document.querySelector('.cosmos');

  if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', event => {
      if (aura) {
        aura.style.left = `${event.clientX}px`;
        aura.style.top = `${event.clientY}px`;
      }

      const x = (event.clientX / window.innerWidth - 0.5) * 10;
      const y = (event.clientY / window.innerHeight - 0.5) * 10;

      if (cosmos) {
        cosmos.style.transform = `translate(${x}px, ${y}px)`;
      }
    }, { passive: true });
  }

  // Quick navigation palette.
  const dialog = document.querySelector('.command-dialog');
  const commandInput = document.querySelector('.command-input');
  const commandHint = document.querySelector('.command-hint');
  const commandClose = document.querySelector('.command-close');
  const resultLinks = [...document.querySelectorAll('.command-results a')];

  let paletteOpener = null;

  function filterCommands(value) {
    const query = value.trim().toLowerCase();

    resultLinks.forEach(link => {
      link.hidden = !link.textContent.toLowerCase().includes(query);
    });
  }

  function openPalette(opener = document.activeElement) {
    if (!dialog || dialog.open) return;

    paletteOpener = opener;
    dialog.showModal();

    if (commandInput) {
      commandInput.value = '';
      filterCommands('');
      commandInput.focus();
    }
  }

  function closePalette() {
    if (!dialog?.open) return;

    dialog.close();
  }

  commandHint?.addEventListener('click', () => {
    openPalette(commandHint);
  });

  commandClose?.addEventListener('click', closePalette);

  commandInput?.addEventListener('input', event => {
    filterCommands(event.target.value);
  });

  commandInput?.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;

    const firstVisible = resultLinks.find(link => !link.hidden);

    if (firstVisible) {
      firstVisible.click();
    }
  });

  resultLinks.forEach(link => {
    link.addEventListener('click', closePalette);
  });

  dialog?.addEventListener('click', event => {
    if (event.target === dialog) {
      closePalette();
    }
  });

  dialog?.addEventListener('close', () => {
    if (paletteOpener instanceof HTMLElement) {
      paletteOpener.focus();
    }

    paletteOpener = null;
  });

  document.addEventListener('keydown', event => {
    const isShortcut = (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === 'k';

    if (isShortcut) {
      event.preventDefault();
      openPalette();
    }
  });

  // Back-to-top control.
  const backTop = document.querySelector('.back-top');

  window.addEventListener('scroll', () => {
    backTop?.classList.toggle('show', window.scrollY > 650);
  }, { passive: true });

  backTop?.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? 'auto' : 'smooth'
    });
  });

  // Automatic current year.
  document.querySelectorAll('[data-year]').forEach(element => {
    element.textContent = new Date().getFullYear();
  });
})();
