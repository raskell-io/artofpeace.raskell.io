(() => {
  const base = 'http://127.0.0.1:1118/';
  document.querySelectorAll('[data-book]').forEach(a => { a.href = base + a.dataset.book; });
  document.querySelectorAll('[data-chapters]').forEach(list => {
    for (const chapter of window.PEACE_REVIEW?.chapters || []) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = base + chapter.slug + '/'; a.target = '_blank'; a.rel = 'noopener';
      const number = document.createElement('span'); number.textContent = chapter.roman;
      const title = document.createElement('div'); title.textContent = chapter.title;
      const arrow = document.createElement('b'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true');
      a.append(number, title, arrow); li.append(a); list.append(li);
    }
  });
  if (parent !== window) {
    const report = () => parent.postMessage({type:'peace-preview-height', height:document.body.scrollHeight}, '*');
    new ResizeObserver(report).observe(document.body);
    report();
  }
})();
