document.addEventListener('DOMContentLoaded', () => {
  const checkboxes = Array.from(document.querySelectorAll('.progress-checkbox'));
  const dayContainer = document.getElementById('content-days');
  const daySections = dayContainer ? Array.from(dayContainer.querySelectorAll('.daily-content')) : [];
  const progressText = document.getElementById('progress-text');
  const progressFill = document.getElementById('progress-fill');
  const progressTrack = document.querySelector('.progress-track');
  const socialSummary = document.querySelector('.social-summary');
  const monthHeading = document.querySelector('h1')?.textContent.trim() || 'Month';
  const monthName = monthHeading.replace(/[^a-zA-Z]/g, '') || 'Month';
  const firstDayId = daySections.map(section => section.querySelector('.date-font[id]')?.id).find(Boolean) || '';
  const pageMatch = firstDayId.match(/^(p[345]r)-([a-z]+)-/i);
  const gameSlug = (document.body.dataset.game || pageMatch?.[1] || 'persona').toLowerCase();
  const monthSlug = (document.body.dataset.month || pageMatch?.[2] || monthName).toLowerCase();
  const storageKey = `${gameSlug}-${monthSlug}-last-viewed-day`;
  const cssEscape = window.CSS?.escape || (value => value.replace(/[^a-zA-Z0-9_-]/g, '\\$&'));

  let activeIndex = 0;
  let previousButton;
  let nextButton;
  let dayStatus;
  let readerNav;
  let monthCompletionInitialized = false;
  let wasMonthComplete = false;

  const getDayId = section => section.querySelector('.date-font[id]')?.id || '';
  const getSectionCheckboxes = section => Array.from(section.querySelectorAll('.progress-checkbox'));
  const getSectionState = section => {
    const boxes = getSectionCheckboxes(section);
    const completed = boxes.filter(box => box.checked).length;
    return { total: boxes.length, completed, isComplete: boxes.length > 0 && completed === boxes.length, isPartial: completed > 0 && completed < boxes.length };
  };

  function updateSection(section) {
    section.classList.toggle('completed', getSectionState(section).isComplete);
  }

  function updateCalendarStates() {
    daySections.forEach((section, index) => {
      const id = getDayId(section);
      const link = id ? document.querySelector(`#cal_nav a[href="#${cssEscape(id)}"]`) : null;
      if (!link) return;
      const state = getSectionState(section);
      link.classList.toggle('is-selected-day', index === activeIndex);
      link.classList.toggle('is-complete-day', state.isComplete);
      link.classList.toggle('is-partial-day', state.isPartial);
      if (index === activeIndex) link.setAttribute('aria-current', 'date');
      else link.removeAttribute('aria-current');
    });
  }

  function updateProgress() {
    const completed = checkboxes.filter(box => box.checked).length;
    const total = checkboxes.length;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    const monthComplete = total > 0 && completed === total;
    const isDraft = total === 0;
    if (progressText) progressText.textContent = isDraft ? 'Guide in Progress' : `${completed} of ${total} tasks (${percent}%)`;
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressTrack) {
      progressTrack.setAttribute('aria-valuenow', String(percent));
      progressTrack.hidden = isDraft;
    }

    if (socialSummary) {
      socialSummary.classList.toggle('is-unlocked', monthComplete);
      socialSummary.setAttribute('aria-hidden', monthComplete ? 'false' : 'true');
      const justCompleted = monthCompletionInitialized && monthComplete && !wasMonthComplete;
      if (justCompleted) {
        socialSummary.classList.remove('is-unlocking');
        window.requestAnimationFrame(() => {
          socialSummary.classList.add('is-unlocking');
          socialSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
      if (!monthComplete) socialSummary.classList.remove('is-unlocking');
    }
    wasMonthComplete = monthComplete;
    monthCompletionInitialized = true;
    updateCalendarStates();
  }

  function updateReaderControls() {
    if (!daySections.length) return;
    const heading = daySections[activeIndex].querySelector('.date-font')?.textContent.trim() || 'Selected day';
    if (previousButton) previousButton.disabled = activeIndex === 0;
    if (nextButton) nextButton.disabled = activeIndex === daySections.length - 1;
    if (dayStatus) dayStatus.textContent = `${heading} · Day ${activeIndex + 1} of ${daySections.length}`;
  }

  function showDay(index, options = {}) {
    if (!daySections.length) return;
    activeIndex = Math.max(0, Math.min(index, daySections.length - 1));
    daySections.forEach((section, i) => {
      const active = i === activeIndex;
      section.classList.toggle('is-active-day', active);
      section.hidden = !active;
      section.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    const activeSection = daySections[activeIndex];
    const id = getDayId(activeSection);
    if (id) {
      localStorage.setItem(storageKey, id);
      if (options.updateHash !== false && location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
    }
    if (readerNav) activeSection.insertAdjacentElement('afterend', readerNav);
    updateReaderControls();
    updateCalendarStates();
    if (options.scroll) activeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const findIndexById = id => daySections.findIndex(section => getDayId(section) === id);
  const firstIncompleteIndex = () => {
    const index = daySections.findIndex(section => {
      const state = getSectionState(section);
      return state.total > 0 && !state.isComplete;
    });
    return index >= 0 ? index : 0;
  };

  function createReaderNavigation() {
    if (!dayContainer || !daySections.length) return;
    dayContainer.classList.add('focused-day-view');
    readerNav = document.createElement('nav');
    readerNav.className = 'day-reader-nav';
    readerNav.setAttribute('aria-label', 'Day navigation');
    previousButton = document.createElement('button'); previousButton.type = 'button'; previousButton.className = 'day-nav-button previous-day'; previousButton.innerHTML = '<span aria-hidden="true">←</span><span>Previous Day</span>';
    dayStatus = document.createElement('span'); dayStatus.className = 'day-reader-status'; dayStatus.setAttribute('aria-live', 'polite');
    nextButton = document.createElement('button'); nextButton.type = 'button'; nextButton.className = 'day-nav-button next-day'; nextButton.innerHTML = '<span>Next Day</span><span aria-hidden="true">→</span>';
    readerNav.append(previousButton, dayStatus, nextButton);
    daySections[0].insertAdjacentElement('afterend', readerNav);
    previousButton.addEventListener('click', () => { pulse(previousButton, 'nav-pressed'); showDay(activeIndex - 1, { scroll: true }); });
    nextButton.addEventListener('click', () => { pulse(nextButton, 'nav-pressed'); showDay(activeIndex + 1, { scroll: true }); });
  }

  function pulse(element, className) {
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
    window.setTimeout(() => element.classList.remove(className), 360);
  }

  function cleanTimeHeaders() {
    daySections.forEach(section => section.querySelectorAll('h4').forEach(heading => {
      Array.from(heading.childNodes).forEach(node => {
        if (node.nodeType !== Node.TEXT_NODE) return;
        node.textContent = node.textContent
          .replace(/^\s*\[\s*/, '')
          .replace(/\s*\]\s*$/, '')
          .replace(/\s+\]/g, '')
          .trim();
      });
      heading.classList.add('time-weather-heading');
    }));
  }

  checkboxes.forEach(checkbox => {
    const id = checkbox.dataset.id;
    if (id && localStorage.getItem(id) === 'completed') checkbox.checked = true;
    checkbox.addEventListener('change', () => {
      if (id) checkbox.checked ? localStorage.setItem(id, 'completed') : localStorage.removeItem(id);
      const section = checkbox.closest('.daily-content');
      if (section) updateSection(section);
      pulse(checkbox.nextElementSibling, checkbox.checked ? 'task-checked-pop' : 'task-unchecked-pop');
      updateProgress();
    });
  });

  daySections.forEach(updateSection);
  cleanTimeHeaders();
  createReaderNavigation();
  document.querySelectorAll('#cal_nav a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    const index = findIndexById(link.getAttribute('href').slice(1));
    if (index < 0) return;
    event.preventDefault(); showDay(index, { scroll: true });
  }));
  window.addEventListener('popstate', () => {
    const index = findIndexById(location.hash.slice(1));
    if (index >= 0) showDay(index, { updateHash: false, scroll: true });
  });

  const hashIndex = findIndexById(location.hash.slice(1));
  const savedIndex = findIndexById(localStorage.getItem(storageKey) || '');
  const initialIndex = hashIndex >= 0 ? hashIndex : savedIndex >= 0 ? savedIndex : firstIncompleteIndex();
  showDay(initialIndex, { updateHash: hashIndex < 0, scroll: false });
  updateProgress();
});
