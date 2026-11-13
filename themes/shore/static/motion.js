// One motion preference for the cover and chapter illustrations.
(() => {
  const labels = JSON.parse(document.querySelector('#reader-labels').textContent);
  const t = key => labels[key] || key;
  const root = document.documentElement;
  const control = document.querySelector('#gentle-motion');
  const note = document.querySelector('#motion-note');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!control) return;
  function update() {
    control.checked = !reduced.matches && root.dataset.motion !== 'off';
    control.disabled = reduced.matches;
    note.textContent = reduced.matches ? t('Motion is off to match your device setting.') : t('Quiet movement in illustrations. Turn off for stillness.');
    dispatchEvent(new Event('peace-motion-change'));
  }
  control.addEventListener('change', () => {
    root.dataset.motion = control.checked ? 'on' : 'off';
    update();
    try { localStorage.setItem('peace-motion', control.checked ? 'on' : 'off'); }
    catch { note.textContent = t('Your motion choice applies to this visit.'); }
  });
  reduced.addEventListener('change', update);
  addEventListener('storage', event => {
    if (event.key === 'peace-motion' || event.key === null) {
      root.dataset.motion = event.newValue === 'off' ? 'off' : 'on'; update();
    }
  });
  const visibility = () => document.body.classList.toggle('motion-resting', document.hidden);
  document.addEventListener('visibilitychange', visibility);
  visibility();update();
  const art = document.querySelectorAll('.chapter-art');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('art-visible', entry.isIntersecting)), { threshold: .05 });
    art.forEach(item => observer.observe(item));
  } else art.forEach(item => item.classList.add('art-visible'));
})();
