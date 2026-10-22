document.addEventListener('DOMContentLoaded', () => {
  const cards = [...document.querySelectorAll('.month-card[data-month]')];
  const overallText = document.getElementById('overall-progress-text');
  const overallFill = document.getElementById('overall-progress-fill');
  const continueLink = document.getElementById('continue-link');
  const overallState = document.getElementById('overall-state');
  const overallTrack = document.querySelector('.overall-track');
  const resetButton = document.getElementById('reset-progress');

  const completeValue = 'completed';

  function completedFor(month) {
    const prefix = `p5r-${month}-`;
    let completed = 0;
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key || !key.startsWith(prefix) || key.endsWith('-last-viewed-day')) continue;
      if (localStorage.getItem(key) === completeValue) completed += 1;
    }
    return completed;
  }

  function update() {
    let totalTasks = 0;
    let totalCompleted = 0;
    let firstIncomplete = null;

    cards.forEach((card) => {
      const month = card.dataset.month;
      const total = Number.parseInt(card.dataset.total, 10) || 0;
      const completed = Math.min(completedFor(month), total);
      const percent = total ? Math.round(completed / total * 100) : 0;
      totalTasks += total;
      totalCompleted += completed;

      card.classList.toggle('is-partial', completed > 0 && completed < total);
      card.classList.toggle('is-complete', total > 0 && completed === total);
      card.querySelector('.month-count').textContent = `${completed} of ${total} tasks (${percent}%)`;
      card.querySelector('.month-fill').style.width = `${percent}%`;
      card.querySelector('.month-state').textContent = completed === total && total > 0 ? 'Complete' : completed > 0 ? 'In Progress' : 'Not Started';
      if (!firstIncomplete && completed < total) firstIncomplete = card.querySelector('.month-link');
    });

    const overallPercent = totalTasks ? Math.round(totalCompleted / totalTasks * 100) : 0;
    const guideComplete = totalTasks > 0 && totalCompleted === totalTasks;
    overallText.textContent = `${totalCompleted} of ${totalTasks} tasks (${overallPercent}%)`;
    overallFill.style.width = `${overallPercent}%`;
    overallTrack?.setAttribute('aria-valuenow', String(overallPercent));
    overallTrack?.classList.toggle('is-complete', guideComplete);
    document.querySelector('.overall-progress')?.classList.toggle('is-complete', guideComplete);
    if (overallState) {
      overallState.textContent = guideComplete ? 'Guide Complete' : totalCompleted > 0 ? 'In Progress' : 'Not Started';
      overallState.className = `overall-state ${guideComplete ? 'is-complete' : totalCompleted > 0 ? 'is-partial' : 'is-empty'}`;
    }

    const lastPage = localStorage.getItem('p5r-calendar-last-month');
    const matching = lastPage ? cards.find(card => card.dataset.month === lastPage)?.querySelector('.month-link') : null;
    const target = matching || firstIncomplete || cards[0]?.querySelector('.month-link');
    if (guideComplete) {
      continueLink.removeAttribute('href');
      continueLink.textContent = 'Guide Complete';
      continueLink.setAttribute('aria-disabled', 'true');
      continueLink.setAttribute('aria-label', 'Guide complete. All months are finished.');
      continueLink.title = 'All Persona 5 Royal calendar months are complete.';
      continueLink.classList.add('is-disabled');
      continueLink.tabIndex = -1;
    } else if (target) {
      continueLink.href = target.href;
      const monthName = target.closest('.month-card').querySelector('.month-name').textContent;
      continueLink.textContent = `Continue: ${monthName}`;
      continueLink.setAttribute('aria-disabled', 'false');
      continueLink.setAttribute('aria-label', `Continue the guide in ${monthName}`);
      continueLink.title = `Continue from ${monthName}.`;
      continueLink.classList.remove('is-disabled');
      continueLink.tabIndex = 0;
    }
  }

  cards.forEach((card) => card.querySelector('.month-link').addEventListener('click', () => {
    localStorage.setItem('p5r-calendar-last-month', card.dataset.month);
  }));

  resetButton.addEventListener('click', () => {
    const approved = window.confirm('Reset all saved Persona 5 Royal calendar progress in this browser?');
    if (!approved) return;
    const keys = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith('p5r-')) keys.push(key);
    }
    keys.forEach(key => localStorage.removeItem(key));
    update();
  });

  update();
  window.addEventListener('pageshow', update);
});
