(() => {
  const root = document.documentElement;
  const labels = JSON.parse(document.querySelector('#reader-labels').textContent);
  const t = key => labels[key] || key;
  const placeKey = root.lang === 'en' ? 'peace-place' : `peace-place-${root.lang}`;
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
  const choice = name => document.querySelector(`input[name="${name}"]:checked`).value;
  const selectChoice = (name, value) => { document.querySelector(`input[name="${name}"][value="${value}"]`).checked = true; };
  const remember = document.querySelector('#remember');
  const status = document.querySelector('#settings-status');
  const settings = document.querySelector('.settings');
  const saved = get('peace-preferences', {});
  selectChoice('appearance', ['light', 'dark'].includes(saved.theme) ? saved.theme : 'system');
  selectChoice('text-size', ['large', 'largest'].includes(saved.size) ? saved.size : 'normal');
  remember.checked = saved.remember === true;
  const chapterPaths = new Set([...dialog.querySelectorAll('.contents-list a'), document.querySelector('.dialog-read-all')].map(link => new URL(link.href).pathname));
  function renderResume() {
    let place = get(placeKey, null);
    try {
      const url = new URL(place.url, location.origin);
      if (url.origin !== location.origin || !chapterPaths.has(url.pathname) || !url.hash || typeof place.title !== 'string') place = null;
    } catch { place = null; }
    document.querySelectorAll('[data-resume]').forEach(link => {
      link.hidden = !place;
      if (place) { link.href = place.url; link.textContent = t('Continue with {title} ↗').replace('{title}', place.title); }
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
    if (!put(placeKey, { url: location.pathname + '#' + current.id, title: current.dataset.title })) {
      status.textContent = t('Storage is unavailable. Your place cannot be saved.');
    }
  }
  function savePreferences() {
    const preferences = { theme: choice('appearance'), size: choice('text-size'), remember: remember.checked };
    if (preferences.theme === 'system') delete root.dataset.theme; else root.dataset.theme = preferences.theme;
    if (preferences.size === 'normal') delete root.dataset.size; else root.dataset.size = preferences.size;
    status.textContent = put('peace-preferences', preferences) ? '' : t('Storage is unavailable. Your choices apply to this page.');
    updateReading();
  }
  document.querySelectorAll('input[name=appearance], input[name=text-size]').forEach(input => input.addEventListener('change', savePreferences));
  remember.addEventListener('change', savePreferences);
  document.querySelector('#clear-place').addEventListener('click', () => {
    try {
      localStorage.removeItem(placeKey);
      remember.checked = false; savePreferences(); renderResume();
      status.textContent = t('Saved place cleared.');
    } catch { status.textContent = t('This browser cannot clear the saved place.'); }
  });
  let frame;
  const schedule = () => { if (!frame) frame = requestAnimationFrame(() => { frame = null; updateReading(); }); };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  addEventListener('pageshow', schedule);
  addEventListener('storage', renderResume);
  renderResume(); updateReading();
  const menus = [settings, document.querySelector('.language-menu')];
  const closeSettings = () => { settings.open = false; settings.querySelector('summary').focus(); };
  document.querySelector('.settings-close').addEventListener('click', closeSettings);
  menus.forEach(menu => menu.addEventListener('toggle', () => {
    if (menu.open) menus.filter(other => other !== menu).forEach(other => { other.open = false; });
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') menus.forEach(menu => { if (menu.open) { menu.open = false; menu.querySelector('summary').focus(); } });
  });
  document.addEventListener('click', event => menus.forEach(menu => { if (!menu.contains(event.target)) menu.open = false; }));
  document.addEventListener('focusin', event => menus.forEach(menu => { if (menu.open && !menu.contains(event.target)) menu.open = false; }));
  document.querySelectorAll('[data-language-link]').forEach(link => link.addEventListener('click', () => {
    let anchor = location.hash;
    if (!anchor && anchors.length && scrollY > 120) {
      let current = anchors[0];
      for (const candidate of anchors) { if (candidate.getBoundingClientRect().top <= 180) current = candidate; }
      anchor = '#' + current.id;
    }
    const target = new URL(link.href); target.hash = anchor; link.href = target.href;
  }));
  document.querySelectorAll('[data-print]').forEach(button => button.addEventListener('click', () => print()));
})();
