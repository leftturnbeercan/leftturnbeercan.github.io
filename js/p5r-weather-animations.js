document.addEventListener('DOMContentLoaded', () => {
  const weatherPattern = /(Weather\s*:\s*)(Rain|Cloudy|Sunny|Clear)/i;
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  const supportsAnimation = window.CSS?.supports?.('animation-name', 'p5-weather-test') !== false;
  const useAnimation = supportsAnimation && !reduceMotion;

  document.querySelectorAll('#content-days h4').forEach((heading) => {
    if (heading.querySelector('.p5-weather')) return;

    const textNode = Array.from(heading.childNodes).find((node) =>
      node.nodeType === Node.TEXT_NODE && weatherPattern.test(node.textContent)
    );
    if (!textNode) return;

    const match = textNode.textContent.match(weatherPattern);
    if (!match) return;

    const before = textNode.textContent.slice(0, match.index);
    const after = textNode.textContent.slice(match.index + match[0].length);
    const weatherName = match[2];
    const weatherType = weatherName.toLowerCase();

    const weather = document.createElement('span');
    weather.className = `p5-weather p5-weather--${weatherType}`;

    const prefix = document.createElement('span');
    prefix.className = 'p5-weather__prefix';
    prefix.textContent = match[1];

    const fallback = document.createElement('span');
    fallback.className = 'p5-weather__fallback';
    fallback.textContent = weatherName;

    const icon = document.createElement('span');
    icon.className = 'p5-weather__icon';
    icon.setAttribute('role', 'img');
    icon.setAttribute('aria-label', `${weatherName} weather`);
    icon.innerHTML = [
      '<span class="p5-weather__sun"></span>',
      '<span class="p5-weather__cloud"></span>',
      '<span class="p5-weather__rain"></span>'
    ].join('');

    weather.append(prefix, fallback, icon);
    textNode.replaceWith(document.createTextNode(before), weather, document.createTextNode(after));

    requestAnimationFrame(() => {
      weather.classList.add(useAnimation ? 'is-animated' : 'uses-fallback');
    });
  });
});
