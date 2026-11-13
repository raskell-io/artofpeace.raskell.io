// Landing-page motion is decorative. All content starts visible without this script.
(() => {
  const root = document.documentElement;
  const hero = document.querySelector('.bay-hero');
  if (!hero) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set();
  const enabled = () => !reduced.matches && root.dataset.motion !== 'off';
  function update() {
    if (!enabled()) { animations.forEach(animation => animation.cancel()); animations.clear(); }
  }
  reduced.addEventListener('change', update);
  addEventListener('peace-motion-change', update);
  if ('IntersectionObserver' in window) {
    // Stop the ambient loops when the bay leaves the viewport.
    new IntersectionObserver(entries => {
      hero.classList.toggle('bay-resting', !entries[0].isIntersecting);
    }).observe(hero);
    // Reveal a section once, without hidden classes or a dependency on JavaScript for visibility.
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (!enabled() || typeof entry.target.animate !== 'function') continue;
        const animation = entry.target.animate([
          { opacity: .35, transform: 'translateY(14px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 1100, easing: 'cubic-bezier(.22,.61,.36,1)' });
        animations.add(animation);
        animation.onfinish = animation.oncancel = () => animations.delete(animation);
      }
    }, { threshold: .12 });
    document.querySelectorAll('.shore-intro, .bay-contents, .footer-invitation').forEach(section => observer.observe(section));
  }
  update();
})();
