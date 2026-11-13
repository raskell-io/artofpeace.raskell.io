// Apply the reader's choices before the first paint. Storage is optional.
document.documentElement.classList.add('js');
try {
  if (localStorage.getItem('peace-motion') === 'off') document.documentElement.dataset.motion = 'off';
} catch { /* Motion preferences are optional. */ }
try {
  const preferences = JSON.parse(localStorage.getItem('peace-preferences') || '{}');
  if (['light', 'dark'].includes(preferences.theme)) document.documentElement.dataset.theme = preferences.theme;
  if (['large', 'largest'].includes(preferences.size)) document.documentElement.dataset.size = preferences.size;
} catch { /* Reading also works when storage is unavailable. */ }
