(() => {
  const frames = [...document.querySelectorAll('iframe')];
  addEventListener('message', event => {
    const frame = frames.find(item => item.contentWindow === event.source);
    if (!frame || event.data?.type !== 'peace-preview-height') return;
    const height = event.data.height;
    if (Number.isFinite(height) && height > 100 && height < 15000) frame.style.height = Math.ceil(height) + 'px';
  });
  document.querySelectorAll('[data-width]').forEach(button => button.addEventListener('click', () => {
    document.body.dataset.width = button.dataset.width;
    document.querySelectorAll('[data-width]').forEach(item => {
      if (item.tagName === 'BUTTON') item.setAttribute('aria-pressed', String(item === button));
    });
  }));
})();
