document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('confidant-search');
  const cards = [...document.querySelectorAll('.confidant-card')];
  const count = document.getElementById('confidant-count');
  const empty = document.getElementById('confidant-empty');

  function update() {
    const term = input.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const matches = !term || card.dataset.search.includes(term);
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    count.textContent = `${visible} of ${cards.length} Confidants`;
    empty.hidden = visible !== 0;
  }

  input.addEventListener('input', update);
  update();
});
