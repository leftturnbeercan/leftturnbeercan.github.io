/* Adds Snow support to the existing P5R weather module. */
document.addEventListener('DOMContentLoaded', () => {
  const pattern = /(Weather\s*:\s*)(Snow)/i;
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  const supportsAnimation = window.CSS?.supports?.('animation-name', 'p5-snow-test') !== false;
  const animate = supportsAnimation && !reduceMotion;

  document.querySelectorAll('#content-days h4').forEach((heading) => {
    if (heading.querySelector('.p5-weather')) return;
    const textNode = [...heading.childNodes].find((node) =>
      node.nodeType === Node.TEXT_NODE && pattern.test(node.textContent)
    );
    if (!textNode) return;

    const match = textNode.textContent.match(pattern);
    if (!match) return;

    const before = textNode.textContent.slice(0, match.index);
    const after = textNode.textContent.slice(match.index + match[0].length);
    const weather = document.createElement('span');
    weather.className = `p5-weather p5-weather--snow ${animate ? 'is-animated' : 'uses-fallback'}`;

    const prefix = document.createElement('span');
    prefix.className = 'p5-weather__prefix';
    prefix.textContent = match[1];

    const fallback = document.createElement('span');
    fallback.className = 'p5-weather__fallback';
    fallback.textContent = match[2];

    const icon = document.createElement('span');
    icon.className = 'p5-weather__icon p5-snow';
    icon.setAttribute('role', 'img');
    icon.setAttribute('aria-label', 'Snow weather');
    icon.innerHTML = [
      '<span class="p5-snow__cloud"></span>',
      '<span class="p5-snow__flake p5-snow__flake--one">✦</span>',
      '<span class="p5-snow__flake p5-snow__flake--two">✦</span>',
      '<span class="p5-snow__flake p5-snow__flake--three">✦</span>'
    ].join('');

    weather.append(prefix, fallback, icon);
    textNode.replaceWith(document.createTextNode(before), weather, document.createTextNode(after));
  });
});
