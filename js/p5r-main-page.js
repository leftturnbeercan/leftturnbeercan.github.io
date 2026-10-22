document.addEventListener('DOMContentLoaded', () => {
  const totalTasks = 1919;
  const mainStoryTotal = 1738;
  const thirdSemesterTotal = 181;
  const completedValue = 'completed';

  const allText = document.getElementById('guide-progress-text');
  const allFill = document.getElementById('guide-progress-fill');
  const allTrack = document.querySelector('.progress-track');
  const allState = document.getElementById('guide-state');
  const continueLink = document.getElementById('continue-guide');

  function countCompleted(prefixes) {
    let result = 0;
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key || !prefixes.some(prefix => key.startsWith(prefix)) || key.endsWith('-last-viewed-day')) continue;
      if (localStorage.getItem(key) === completedValue) result += 1;
    }
    return result;
  }

  function stateFor(completed, total) {
    return completed === total && total > 0 ? 'complete' : completed > 0 ? 'partial' : 'empty';
  }

  function updateCard(card, completed, total) {
    const percent = total ? Math.round(completed / total * 100) : 0;
    const state = stateFor(completed, total);
    card.classList.toggle('is-complete', state === 'complete');
    const badge = card.querySelector('.card-status');
    badge.textContent = state === 'complete' ? 'Complete' : state === 'partial' ? 'In Progress' : 'Not Started';
    badge.className = `card-status is-${state}`;
    card.querySelector('.card-metric').textContent = `${completed} / ${total}`;
    card.querySelector('.card-detail').textContent = `${percent}% complete`;
  }

  function update() {
    const mainPrefixes = ['p5r-april-','p5r-may-','p5r-june-','p5r-july-','p5r-august-','p5r-september-','p5r-october-','p5r-november-','p5r-december-'];
    const thirdPrefixes = ['p5r-january-','p5r-february-'];
    const mainCompleted = Math.min(countCompleted(mainPrefixes), mainStoryTotal);
    const thirdCompleted = Math.min(countCompleted(thirdPrefixes), thirdSemesterTotal);
    const completed = mainCompleted + thirdCompleted;
    const percent = Math.round(completed / totalTasks * 100);
    const complete = completed === totalTasks;

    allText.textContent = `${completed} of ${totalTasks} tasks (${percent}%)`;
    allFill.style.width = `${percent}%`;
    allTrack.setAttribute('aria-valuenow', String(percent));
    allTrack.classList.toggle('is-complete', complete);
    allState.textContent = complete ? 'Guide Complete' : completed > 0 ? 'In Progress' : 'Not Started';
    allState.className = `guide-state is-${stateFor(completed,totalTasks)}`;

    updateCard(document.getElementById('main-story-card'), mainCompleted, mainStoryTotal);
    updateCard(document.getElementById('third-semester-card'), thirdCompleted, thirdSemesterTotal);

    if (complete) {
      continueLink.removeAttribute('href');
      continueLink.textContent = 'Guide Complete';
      continueLink.classList.add('is-disabled');
      continueLink.setAttribute('aria-disabled','true');
      continueLink.tabIndex = -1;
    } else {
      continueLink.href = '/Persona5royal/calendar-r5r.html';
      continueLink.textContent = 'Continue Guide';
      continueLink.classList.remove('is-disabled');
      continueLink.setAttribute('aria-disabled','false');
      continueLink.tabIndex = 0;
    }
  }

  update();
  window.addEventListener('pageshow', update);
});
