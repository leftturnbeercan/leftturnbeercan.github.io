document.addEventListener('DOMContentLoaded', () => {
  const COMPLETE = 'completed';
  const REDUCED_MOTION = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

  function storageKey(checkbox) {
    return checkbox.dataset.id || checkbox.id || '';
  }

  function allCheckboxes(scope = document) {
    return [...scope.querySelectorAll('.progress-checkbox')];
  }

  function completedCount(boxes) {
    return boxes.filter((box) => box.checked).length;
  }

  function restoreCheckboxes() {
    allCheckboxes().forEach((box) => {
      const key = storageKey(box);
      if (key) box.checked = localStorage.getItem(key) === COMPLETE;
    });
  }

  function ensureDayProgress(day) {
    let line = day.querySelector('.day-progress-line');
    if (!line) {
      line = document.createElement('div');
      line.className = 'day-progress-line';
      line.setAttribute('aria-live', 'polite');
      day.querySelector('.day-title')?.insertAdjacentElement('afterend', line);
    }
    return line;
  }

  function updateMonthPage() {
    const all = allCheckboxes();
    const done = completedCount(all);
    const total = all.length;
    const percent = total ? Math.round(done / total * 100) : 0;

    document.querySelectorAll('[data-progress-text]').forEach((node) => {
      node.textContent = total ? `${done} of ${total} tasks (${percent}%)` : 'Guide data not entered';
    });
    document.querySelectorAll('[data-progress-fill]').forEach((node) => {
      node.style.width = `${percent}%`;
    });

    document.querySelectorAll('.day-content').forEach((day) => {
      const boxes = allCheckboxes(day);
      const dayDone = completedCount(boxes);
      const dayTotal = boxes.length;
      const line = ensureDayProgress(day);
      line.textContent = dayTotal
        ? `Day progress: ${dayDone} of ${dayTotal} tasks (${Math.round(dayDone / dayTotal * 100)}%)`
        : 'Day progress: guide data not entered';
      day.classList.toggle('is-partial', dayDone > 0 && dayDone < dayTotal);
      day.classList.toggle('is-complete', dayTotal > 0 && dayDone === dayTotal);
    });
  }

  restoreCheckboxes();
  allCheckboxes().forEach((box) => {
    box.addEventListener('change', () => {
      const key = storageKey(box);
      if (!key) return;
      if (box.checked) localStorage.setItem(key, COMPLETE);
      else localStorage.removeItem(key);
      updateMonthPage();
    });
  });

  const days = [...document.querySelectorAll('.day-content')];
  let activeDay = Math.max(0, days.findIndex((day) => location.hash && day.id === location.hash.slice(1)));
  function showDay(index) {
    if (!days.length) return;
    activeDay = Math.max(0, Math.min(index, days.length - 1));
    days.forEach((day, dayIndex) => { day.hidden = dayIndex !== activeDay; });
    document.querySelectorAll('[data-prev]').forEach((button) => { button.disabled = activeDay === 0; });
    document.querySelectorAll('[data-next]').forEach((button) => { button.disabled = activeDay === days.length - 1; });
  }

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-prev]')) showDay(activeDay - 1);
    if (event.target.closest('[data-next]')) showDay(activeDay + 1);
    const calendarLink = event.target.closest('.calendar-table a[href^="#"]');
    if (calendarLink) {
      event.preventDefault();
      const index = days.findIndex((day) => day.id === calendarLink.hash.slice(1));
      if (index >= 0) {
        history.replaceState(null, '', calendarLink.hash);
        showDay(index);
      }
    }
  });

  const search = document.querySelector('#social-search');
  if (search) {
    search.addEventListener('input', () => {
      const query = search.value.toLowerCase().trim();
      document.querySelectorAll('.social-card').forEach((card) => {
        card.hidden = Boolean(query) && !card.dataset.search.includes(query);
      });
    });
  }

  async function updateCalendarLanding() {
    const cards = [...document.querySelectorAll('.month-card[data-month]')];
    if (!cards.length) return;

    await Promise.all(cards.map(async (card) => {
      const link = card.querySelector('a[href]');
      if (!link) return;
      try {
        const response = await fetch(link.href, { credentials: 'same-origin' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        const parsed = new DOMParser().parseFromString(html, 'text/html');
        const ids = [...parsed.querySelectorAll('.progress-checkbox')]
          .map((box) => box.dataset.id || box.id)
          .filter(Boolean);
        const total = ids.length;
        const done = ids.filter((id) => localStorage.getItem(id) === COMPLETE).length;
        const percent = total ? Math.round(done / total * 100) : 0;
        card.querySelector('p').textContent = total
          ? `${done} of ${total} tasks (${percent}%)`
          : 'Guide data not entered';
        card.querySelector('.progress-fill').style.width = `${percent}%`;
        const state = card.querySelector('.month-state');
        state.textContent = total && done === total ? 'Complete' : done ? 'In Progress' : total ? 'Not Started' : 'Draft';
        card.classList.toggle('is-partial', done > 0 && done < total);
        card.classList.toggle('is-complete', total > 0 && done === total);
      } catch (error) {
        card.querySelector('p').textContent = 'Guide data not entered';
        console.warn(`Unable to read ${link.href}`, error);
      }
    }));
  }

  function addTelevisionStatic() {
    document.querySelectorAll('.p4-main-hero, .p4-hero').forEach((hero) => {
      if (hero.querySelector('.tv-static-screen')) return;
      const screen = document.createElement('span');
      screen.className = 'tv-static-screen';
      screen.setAttribute('aria-hidden', 'true');
      screen.innerHTML = '<span class="tv-static-noise"></span><span class="tv-static-scan"></span>';
      hero.append(screen);
    });
  }

  function addTransitionOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'tv-page-transition';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = '<span class="tv-transition-noise"></span><span class="tv-transition-line"></span>';
    document.body.append(overlay);

    if (REDUCED_MOTION) return;
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.hash && url.pathname === location.pathname) return;
      event.preventDefault();
      overlay.classList.add('is-active');
      window.setTimeout(() => { location.href = url.href; }, 360);
    });
  }

  showDay(activeDay);
  updateMonthPage();
  updateCalendarLanding();
  addTelevisionStatic();
  addTransitionOverlay();
  window.addEventListener('pageshow', () => {
    restoreCheckboxes();
    updateMonthPage();
    updateCalendarLanding();
    document.querySelector('.tv-page-transition')?.classList.remove('is-active');
  });
});
