document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;


  function addHeroPhantomVisual() {
    const hero = document.querySelector('.guide-hero');
    if (!hero || hero.querySelector('.p5r-phantom-visual')) return;

    const visual = document.createElement('span');
    visual.className = 'p5r-phantom-visual';
    visual.setAttribute('aria-hidden', 'true');
    visual.innerHTML = [
      '<span class="p5r-favicon-burst"></span>',
      '<span class="p5r-favicon-orbit p5r-favicon-orbit--outer"></span>',
      '<span class="p5r-favicon-orbit p5r-favicon-orbit--inner"></span>',
      '<img class="p5r-favicon-art" src="/assets/p5r/icon-512.png" data-fallback="/assets/p5r/favicon.ico" alt="">',
      '<span class="p5r-favicon-spark p5r-favicon-spark--one"></span>',
      '<span class="p5r-favicon-spark p5r-favicon-spark--two"></span>'
    ].join('');
    hero.append(visual);

    const faviconArt = visual.querySelector('.p5r-favicon-art');
    faviconArt?.addEventListener('error', () => {
      const fallback = faviconArt.dataset.fallback;
      if (fallback && faviconArt.src !== new URL(fallback, location.href).href) {
        faviconArt.src = fallback;
      }
    }, { once: true });
  }

  function addTransition() {
    if (document.querySelector('.p5r-page-transition')) return;
    const overlay = document.createElement('div');
    overlay.className = 'p5r-page-transition';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = [
      '<span class="p5r-transition-halftone"></span>',
      '<span class="p5r-transition-speed"></span>',
      '<span class="p5r-transition-cut"></span>',
      '<span class="p5r-transition-card">Take Your Time</span>',
      '<span class="p5r-transition-flash"></span>'
    ].join('');
    document.body.append(overlay);

    if (reducedMotion) return;

    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (!link || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.hasAttribute('download') || link.target === '_blank') return;

      const url = new URL(link.href, location.href);
      const samePageAnchor = url.pathname === location.pathname && url.search === location.search && url.hash;
      if (url.origin !== location.origin || samePageAnchor) return;

      event.preventDefault();
      overlay.classList.add('is-active');
      window.setTimeout(() => { location.href = url.href; }, 500);
    });

    window.addEventListener('pageshow', () => overlay.classList.remove('is-active'));
  }

  addHeroPhantomVisual();
  addTransition();
});
