(() => {
  const root = document.documentElement;
  const get = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const put = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };
  const dialog = document.querySelector('#contents-dialog');
  if (dialog && typeof dialog.showModal === 'function') {
    document.querySelectorAll('[data-open-contents]').forEach(link => link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); dialog.showModal();
    }));
    dialog.addEventListener('click', event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right)) dialog.close();
    });
  }
  const appearance = document.querySelector('#appearance');
  const size = document.querySelector('#text-size');
  const remember = document.querySelector('#remember');
  const status = document.querySelector('#settings-status');
  const settings = document.querySelector('.settings');
  const saved = get('peace-preferences', {});
  appearance.value = ['light', 'dark'].includes(saved.theme) ? saved.theme : 'system';
  size.value = ['large', 'largest'].includes(saved.size) ? saved.size : 'normal';
  remember.checked = saved.remember === true;
  const chapterPaths = new Set([...dialog.querySelectorAll('.contents-list a'), document.querySelector('.dialog-read-all')].map(link => new URL(link.href).pathname));
  function renderResume() {
    let place = get('peace-place', null);
    try {
      const url = new URL(place.url, location.origin);
      if (url.origin !== location.origin || !chapterPaths.has(url.pathname) || !url.hash || typeof place.title !== 'string') place = null;
    } catch { place = null; }
    document.querySelectorAll('[data-resume]').forEach(link => {
      link.hidden = !place;
      if (place) { link.href = place.url; link.textContent = `Continue with ${place.title} ↗`; }
    });
  }
  const anchors = [...document.querySelectorAll('[data-reading-anchor]')];
  const progress = document.querySelector('.reading-progress span');
  function updateReading() {
    const range = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = anchors.length && range > 0 ? `${Math.min(100, Math.max(0, scrollY / range * 100))}%` : '0';
    if (!remember.checked || !anchors.length) return;
    let current = anchors[0];
    for (const anchor of anchors) { if (anchor.getBoundingClientRect().top <= 180) current = anchor; }
    if (!put('peace-place', { url: location.pathname + '#' + current.id, title: current.dataset.title })) {
      status.textContent = 'Storage is unavailable. Your place cannot be saved.';
    }
  }
  function savePreferences() {
    const preferences = { theme: appearance.value, size: size.value, remember: remember.checked };
    if (preferences.theme === 'system') delete root.dataset.theme; else root.dataset.theme = preferences.theme;
    if (preferences.size === 'normal') delete root.dataset.size; else root.dataset.size = preferences.size;
    status.textContent = put('peace-preferences', preferences) ? '' : 'Storage is unavailable. Your choices apply to this page.';
    updateReading();
  }
  appearance.addEventListener('change', savePreferences);
  size.addEventListener('change', savePreferences);
  remember.addEventListener('change', savePreferences);
  document.querySelector('#clear-place').addEventListener('click', () => {
    try {
      localStorage.removeItem('peace-place');
      remember.checked = false; savePreferences(); renderResume();
      status.textContent = 'Saved place cleared.';
    } catch { status.textContent = 'This browser cannot clear the saved place.'; }
  });
  let frame;
  const schedule = () => { if (!frame) frame = requestAnimationFrame(() => { frame = null; updateReading(); }); };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  addEventListener('pageshow', schedule);
  addEventListener('storage', renderResume);
  renderResume(); updateReading();
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && settings.open) { settings.open = false; settings.querySelector('summary').focus(); }
  });
  document.addEventListener('click', event => { if (!settings.contains(event.target)) settings.open = false; });
  document.querySelectorAll('[data-print]').forEach(button => button.addEventListener('click', () => print()));
})();
