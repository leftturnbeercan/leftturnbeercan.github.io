document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

  function addHeaderClock() {
    const header = document.querySelector('.hero, .guide-hero, body > main > header, header');
    if (!header || header.querySelector('.p3r-clock-portal')) return;

    const portal = document.createElement('span');
    portal.className = 'p3r-clock-portal';
    portal.setAttribute('aria-hidden', 'true');
    portal.innerHTML = `
      <span class="p3r-clock-face">
        <span class="p3r-clock-label">S.E.E.S.</span>
        <span class="p3r-clock-numerals" aria-hidden="true">
          <i style="--n:0">XII</i><i style="--n:1">I</i><i style="--n:2">II</i>
          <i style="--n:3">III</i><i style="--n:4">IV</i><i style="--n:5">V</i>
          <i style="--n:6">VI</i><i style="--n:7">VII</i><i style="--n:8">VIII</i>
          <i style="--n:9">IX</i><i style="--n:10">X</i><i style="--n:11">XI</i>
        </span>
        <span class="p3r-clock-hand p3r-clock-hand--minute"></span>
        <span class="p3r-clock-hand p3r-clock-hand--hour"></span>
        <span class="p3r-clock-hand p3r-clock-hand--second"></span>
        <span class="p3r-clock-pin"></span>
      </span>
      <span class="p3r-clock-rings"></span>`;
    header.append(portal);
  }

  function addTransition() {
    if (document.querySelector('.p3r-page-transition')) return;

    const overlay = document.createElement('div');
    overlay.className = 'p3r-page-transition';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = [
      '<span class="p3r-transition-sweep"></span>',
      '<span class="p3r-transition-shards"></span>',
      '<span class="p3r-transition-clock"></span>'
    ].join('');
    document.body.append(overlay);

    if (reducedMotion) return;

    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (!link || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.hasAttribute('download') || link.target === '_blank') return;

      const url = new URL(link.href, location.href);
      const sameDocumentAnchor = url.pathname === location.pathname && url.search === location.search && url.hash;
      if (url.origin !== location.origin || sameDocumentAnchor) return;

      event.preventDefault();
      overlay.classList.add('is-active');
      window.setTimeout(() => { location.href = url.href; }, 390);
    });

    window.addEventListener('pageshow', () => {
      overlay.classList.remove('is-active');
    });
  }

  addHeaderClock();
  addTransition();
});
