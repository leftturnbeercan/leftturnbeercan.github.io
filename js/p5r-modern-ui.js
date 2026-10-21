document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  if (body.dataset.game !== 'p5r') return;

  const dayContainer = document.getElementById('content-days');
  const calendar = document.getElementById('cal_nav');
  const days = dayContainer ? [...dayContainer.querySelectorAll(':scope > .daily-content')] : [];
  const boxes = [...document.querySelectorAll('.progress-checkbox')];
  const summary = document.querySelector('.social-summary');
  const progressText = document.getElementById('progress-text');
  const progressFill = document.getElementById('progress-fill');
  const progressTrack = document.querySelector('.progress-track');
  if (!dayContainer || !days.length) return;

  let activeIndex = Math.max(0, days.findIndex(day => day.classList.contains('is-active-day')));
  let initialized = false;
  let wasComplete = false;

  const dayId = day => day.querySelector('.date-font[id]')?.id || '';
  const dayBoxes = day => [...day.querySelectorAll('.progress-checkbox')];
  const state = day => {
    const items = dayBoxes(day);
    const completed = items.filter(item => item.checked).length;
    return {
      total: items.length,
      completed,
      percent: items.length ? Math.round(completed / items.length * 100) : 0,
      partial: completed > 0 && completed < items.length,
      complete: items.length > 0 && completed === items.length
    };
  };

  function cleanHeaders() {
    days.forEach(day => day.querySelectorAll('h4').forEach(heading => {
      [...heading.childNodes].forEach(node => {
        if (node.nodeType !== Node.TEXT_NODE) return;
        node.textContent = node.textContent.replace(/^\s*\[\s*/, '').replace(/\s*\]\s*$/, '').trim();
      });
      heading.classList.add('time-weather-heading');
    }));
  }

  function addCalendarHelp() {
    if (!calendar || document.querySelector('.calendar-help')) return;
    const help = document.createElement('div');
    help.className = 'calendar-help';
    help.innerHTML = `
      <p class="progress-help">Check activities as you complete them. Progress is saved in this browser.</p>
      <ul class="calendar-legend" aria-label="Calendar status legend">
        <li><span class="legend-dot is-partial" aria-hidden="true"></span>In progress</li>
        <li><span class="legend-dot is-complete" aria-hidden="true"></span>Complete</li>
        <li><span class="legend-selected" aria-hidden="true"></span>Selected day</li>
      </ul>`;
    const progress = document.querySelector('.month-progress');
    if (progress) progress.insertAdjacentElement('afterend', help);
    else calendar.insertAdjacentElement('afterend', help);
  }

  function enhanceDateHeadings() {
    days.forEach(day => {
      const heading = day.querySelector('.date-font');
      if (!heading || heading.querySelector('.date-primary')) return;
      const text = heading.textContent.trim();
      const match = text.match(/^([A-Za-z]+)\s+(\d{1,2})\s+(.+)$/);
      if (!match) return;
      heading.textContent = '';
      const primary = document.createElement('span');
      primary.className = 'date-primary';
      primary.textContent = `${match[1]} ${match[2]}`;
      const weekday = document.createElement('span');
      weekday.className = 'date-weekday';
      weekday.textContent = match[3];
      heading.append(primary, weekday);
    });
  }

  function buildDashboard() {
    document.querySelectorAll('.day-reader-nav').forEach(nav => nav.remove());
    const nav = document.createElement('nav');
    nav.className = 'day-reader-nav p5-enhanced-nav';
    nav.setAttribute('aria-label', 'Day navigation and progress');
    nav.innerHTML = `
      <button type="button" class="day-nav-button previous-day"><span aria-hidden="true">←</span><span>Previous Day</span></button>
      <div class="day-progress-dashboard">
        <div class="day-progress-ring"><strong class="day-progress-percent">0%</strong></div>
        <div class="day-progress-details">
          <span class="day-reader-status" aria-live="polite"></span>
          <span class="day-task-count"></span>
          <span class="day-state-pill"></span>
        </div>
      </div>
      <button type="button" class="day-nav-button next-day"><span>Next Day</span><span aria-hidden="true">→</span></button>`;
    nav.querySelector('.previous-day').addEventListener('click', event => {
      event.currentTarget.classList.add('nav-pressed');
      setTimeout(() => event.currentTarget.classList.remove('nav-pressed'), 320);
      showDay(activeIndex - 1, true);
    });
    nav.querySelector('.next-day').addEventListener('click', event => {
      event.currentTarget.classList.add('nav-pressed');
      setTimeout(() => event.currentTarget.classList.remove('nav-pressed'), 320);
      showDay(activeIndex + 1, true);
    });
    return nav;
  }

  addCalendarHelp();
  enhanceDateHeadings();
  const dashboard = buildDashboard();

  function updateDashboard() {
    const day = days[activeIndex];
    const current = state(day);
    const heading = day.querySelector('.date-font')?.textContent.trim() || 'Selected day';
    dashboard.querySelector('.day-progress-ring').style.setProperty('--day-progress', `${current.percent * 3.6}deg`);
    dashboard.querySelector('.day-progress-percent').textContent = `${current.percent}%`;
    dashboard.querySelector('.day-reader-status').textContent = `${heading} · Day ${activeIndex + 1} of ${days.length}`;
    dashboard.querySelector('.day-task-count').textContent = `${current.completed} of ${current.total} tasks`;
    const pill = dashboard.querySelector('.day-state-pill');
    pill.textContent = current.complete ? 'Day Complete' : current.partial ? 'In Progress' : 'Not Started';
    pill.className = `day-state-pill ${current.complete ? 'is-complete' : current.partial ? 'is-partial' : 'is-empty'}`;
    dashboard.querySelector('.previous-day').disabled = activeIndex === 0;
    dashboard.querySelector('.next-day').disabled = activeIndex === days.length - 1;
  }

  function updateAll() {
    const completed = boxes.filter(box => box.checked).length;
    const percent = boxes.length ? Math.round(completed / boxes.length * 100) : 0;
    const complete = boxes.length > 0 && completed === boxes.length;
    if (progressText) progressText.textContent = `${completed} of ${boxes.length} tasks (${percent}%)`;
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressTrack) {
      progressTrack.setAttribute('aria-valuenow', String(percent));
      progressTrack.classList.toggle('is-complete', complete);
    }

    days.forEach((day, index) => {
      const current = state(day);
      day.classList.toggle('is-partial', current.partial);
      day.classList.toggle('completed', current.complete);
      const link = document.querySelector(`#cal_nav a[href="#${CSS.escape(dayId(day))}"]`);
      if (link) {
        link.classList.toggle('is-selected-day', index === activeIndex);
        link.classList.toggle('is-partial-day', current.partial);
        link.classList.toggle('is-complete-day', current.complete);
      }
    });
    updateDashboard();

    if (summary) {
      summary.classList.toggle('is-unlocked', complete);
      summary.setAttribute('aria-hidden', complete ? 'false' : 'true');
      if (initialized && complete && !wasComplete) {
        summary.classList.add('is-unlocking');
        summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (!complete) summary.classList.remove('is-unlocking');
    }
    initialized = true;
    wasComplete = complete;
  }

  function showDay(index, scroll = false) {
    activeIndex = Math.max(0, Math.min(index, days.length - 1));
    days.forEach((day, current) => {
      const active = current === activeIndex;
      day.hidden = !active;
      day.classList.toggle('is-active-day', active);
      day.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    days[activeIndex].insertAdjacentElement('afterend', dashboard);
    const id = dayId(days[activeIndex]);
    if (id) history.replaceState(null, '', `#${id}`);
    updateAll();
    if (scroll) days[activeIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  cleanHeaders();
  dayContainer.classList.add('focused-day-view');
  boxes.forEach(box => box.addEventListener('change', () => {
    const label = box.nextElementSibling;
    if (label) {
      const className = box.checked ? 'task-checked-pop' : 'task-unchecked-pop';
      label.classList.remove('task-checked-pop', 'task-unchecked-pop');
      void label.offsetWidth;
      label.classList.add(className);
      setTimeout(() => label.classList.remove(className), 360);
    }
    if (progressTrack) {
      progressTrack.classList.remove('is-updating');
      void progressTrack.offsetWidth;
      progressTrack.classList.add('is-updating');
      setTimeout(() => progressTrack.classList.remove('is-updating'), 460);
    }
    updateAll();
  }));
  calendar?.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    const index = days.findIndex(day => dayId(day) === link.hash.slice(1));
    if (index < 0) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    showDay(index, true);
  }, true));

  const hashIndex = days.findIndex(day => dayId(day) === location.hash.slice(1));
  showDay(hashIndex >= 0 ? hashIndex : activeIndex, false);
});
