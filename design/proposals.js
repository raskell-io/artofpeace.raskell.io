(() => {
  'use strict';
  const book = window.PEACE_REVIEW;
  if (!book) {
    const notice = document.createElement('p');
    notice.className = 'no-script';
    notice.textContent = 'The passage data is missing. Run mise run prepare-proposals from the book directory, then reopen this file.';
    document.querySelector('#studies').prepend(notice);
    return;
  }
  const $ = selector => document.querySelector(selector);
  const passage = ref => {
    if (!book.passages[ref]) throw new Error(`Unknown manuscript passage: ${ref}`);
    return book.passages[ref];
  };
  const element = (tag, className, text) => {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  };
  const button = (className, text, action) => {
    const item = element('button', className, text);
    item.type = 'button';
    item.addEventListener('click', action);
    return item;
  };
  const firstSentence = text => text.split('. ')[0] + (text.includes('. ') ? '.' : '');

  document.querySelectorAll('[data-view]').forEach(control => {
    if (control.tagName !== 'BUTTON') return;
    control.addEventListener('click', () => {
      $('#studies').dataset.view = control.dataset.view;
      document.querySelectorAll('.view-switch button').forEach(item => item.setAttribute('aria-pressed', String(item === control)));
    });
  });

  // Study 01: an explicit place in a navigable volume.
  let openChapter = 2;
  let keptPlace = null;
  let openStart = 4;
  const rail = $('#chapter-rail');
  const selector = $('#chapter-select');
  book.chapters.forEach((chapter, index) => {
    const item = button('', chapter.roman, () => renderOpen(index));
    item.setAttribute('aria-label', `${chapter.roman} · ${chapter.title}`);
    rail.append(item);
    const option = element('option', '', `${chapter.roman} · ${chapter.title}`);
    option.value = index;
    selector.append(option);
    $('#chapter-locator').append(element('span'));
  });
  selector.addEventListener('change', () => renderOpen(Number(selector.value)));
  function renderOpen(index, start = index === 2 ? 4 : 0) {
    openChapter = index;
    openStart = start;
    const chapter = book.chapters[index];
    selector.value = index;
    [...rail.children].forEach((item, number) => item.setAttribute('aria-current', String(number === index)));
    [...$('#chapter-locator').children].forEach((item, number) => item.classList.toggle('current', number === index));
    $('#open-chapter-label').textContent = `Chapter ${chapter.roman}`;
    $('#open-chapter-title').textContent = chapter.title;
    $('#chapter-position').textContent = `${chapter.roman} of XIII`;
    const list = $('#open-passages');
    list.replaceChildren();
    chapter.references.slice(start, start + 2).forEach(ref => {
      const text = passage(ref).text;
      const section = element('article', 'open-passage' + (keptPlace === ref ? ' kept' : ''));
      const line = element('div', 'reference-line');
      line.append(element('span', 'reference', ref));
      line.append(button('quiet-button', keptPlace === ref ? 'Release this place' : 'Keep my place here', () => {
        keptPlace = keptPlace === ref ? null : ref;
        renderOpen(openChapter, openStart);
        $('#place-status').textContent = keptPlace ? `Place kept at ${ref}.` : 'Saved place released.';
      }));
      section.append(line, element('p', 'book-prose', text));
      list.append(section);
    });
    const next = book.chapters[(index + 1) % book.chapters.length];
    $('#next-chapter .eyebrow').textContent = `${index === 12 ? 'Begin again with' : 'Continue with'} ${next.title}`;
    $('#next-chapter .next-title').textContent = firstSentence(passage(next.references[0]).text);
    const back = $('#return-place');
    back.hidden = !keptPlace;
    if (keptPlace) {
      back.textContent = `Return to ${keptPlace} ↗`;
      back.title = firstSentence(passage(keptPlace).text);
    }
    $('#place-status').textContent = '';
  }
  $('#next-chapter').addEventListener('click', () => renderOpen((openChapter + 1) % book.chapters.length));
  $('#return-place').addEventListener('click', () => {
    if (!keptPlace) return;
    const index = book.chapters.findIndex(chapter => chapter.references.includes(keptPlace));
    renderOpen(index, book.chapters[index].references.indexOf(keptPlace));
    $('#place-status').textContent = `Back at ${keptPlace}.`;
  });
  renderOpen(2);

  // Study 02: four authored routes, with working passage navigation.
  const paths = [
    { title: 'Before a difficult conversation', refs: ['VIII.1', 'V.4', 'VIII.3', 'IX.2'], bridges: ['Now consider how the other person understands the matter.', 'Look beneath the demand for the need it is meant to meet.', 'Give the next irreversible act enough time to become a choice.', 'The path ends here. The conversation remains yours.'] },
    { title: 'When disagreement feels personal', refs: ['II.4', 'III.2', 'III.4'], bridges: ['Consider where a personal boundary begins and ends.', 'Look closely at conduct, power, and the ability to withdraw.', 'A difference can remain unresolved without giving harm a free hand.'] },
    { title: 'After a promise has been broken', refs: ['VII.6', 'VII.8', 'XII.5'], bridges: ['Let the pace of trust answer to what people actually do.', 'Consider what would make a return both possible and safe.', 'A way back needs something more than an invitation to forget.'] },
    { title: 'When a relationship must change', refs: ['II.8', 'XII.6', 'XII.4'], bridges: ['There may still be peace between the two houses.', 'Consider which responsibilities remain yours to fulfil.', 'Repair can begin without demanding forgiveness in return.'] }
  ];
  let chosenPath = 0;
  let chosenStep = 0;
  paths.forEach((path, index) => {
    const item = button('path-choice', '', () => { chosenPath = index; chosenStep = 0; renderPath(); });
    item.append(element('span', '', String(index + 1).padStart(2, '0')), element('span', '', path.title));
    $('#path-choices').append(item);
  });
  function renderPath() {
    const path = paths[chosenPath];
    const current = passage(path.refs[chosenStep]);
    [...$('#path-choices').children].forEach((item, index) => item.setAttribute('aria-pressed', String(index === chosenPath)));
    $('#path-title').textContent = path.title;
    $('#path-count').textContent = `A path in ${path.refs.length === 4 ? 'four' : 'three'} passages`;
    $('#path-steps').replaceChildren();
    path.refs.forEach((ref, index) => {
      const item = button('', ref, () => { chosenStep = index; renderPath(); });
      item.setAttribute('aria-label', `Read passage ${ref}`);
      if (index === chosenStep) item.setAttribute('aria-current', 'step');
      $('#path-steps').append(item);
    });
    $('#path-reference').textContent = current.reference;
    $('#path-chapter').textContent = current.chapter;
    $('#path-body').textContent = current.text;
    $('#path-bridge-text').textContent = path.bridges[chosenStep];
    $('#path-position').textContent = `${chosenStep + 1} / ${path.refs.length}`;
    $('#path-back').disabled = chosenStep === 0;
    $('#path-next').textContent = chosenStep === path.refs.length - 1 ? 'Read this path again ↺' : `Continue to ${path.refs[chosenStep + 1]} →`;
  }
  $('#path-back').addEventListener('click', () => { chosenStep = Math.max(0, chosenStep - 1); renderPath(); });
  $('#path-next').addEventListener('click', () => { chosenStep = (chosenStep + 1) % paths[chosenPath].refs.length; renderPath(); });
  renderPath();

  // Study 03: two complete passages and a separate editorial connection.
  const pairs = [
    { first: 'III.2', second: 'III.4', title: 'When conduct becomes threatening', note: 'A boundary can overreach. A threat can also hide behind a claim of free inquiry. Consider what the person is doing, and whose freedom the response would restrict.' },
    { first: 'V.4', second: 'V.5', title: 'Understanding without excusing', note: 'Hearing a concern accurately does not require you to invent an innocent motive. Understanding can help you see what needs protection.' },
    { first: 'X.1', second: 'X.7', title: 'The courage to keep asking', note: 'You may need to change your judgment. You may also need to question the room. Humility leaves both possibilities open.' }
  ];
  function openCompanion(open, focus = false) {
    $('#companion').hidden = !open;
    $('#conversation-layout').classList.toggle('closed', !open);
    $('#pair-toggle').setAttribute('aria-expanded', String(open));
    if (focus) $('#pair-toggle').focus({ preventScroll: true });
  }
  function renderPair(index) {
    const pair = pairs[index];
    const first = passage(pair.first);
    const second = passage(pair.second);
    $('#pair-chapter-label').textContent = `Chapter ${first.roman}`;
    $('#pair-chapter-title').textContent = first.chapter;
    $('#pair-first-reference').textContent = first.reference;
    $('#pair-first-body').textContent = first.text;
    $('#pair-second-reference').textContent = second.reference;
    $('#pair-second-title').textContent = pair.title;
    $('#pair-second-body').textContent = second.text;
    $('#pair-commentary').textContent = pair.note;
    $('#pair-trigger-text').textContent = `Read beside ${pair.second}`;
    $('#pair-footer').textContent = `${pair.first} ↔ ${pair.second}`;
    document.querySelectorAll('[data-pair]').forEach(item => item.setAttribute('aria-pressed', String(Number(item.dataset.pair) === index)));
    openCompanion(true);
  }
  document.querySelectorAll('[data-pair]').forEach(item => item.addEventListener('click', () => renderPair(Number(item.dataset.pair))));
  $('#pair-toggle').addEventListener('click', () => openCompanion($('#companion').hidden));
  $('#pair-close').addEventListener('click', () => openCompanion(false, true));
  renderPair(0);

  // Study 04: intentionally ephemeral, private prototype notes.
  const notes = new Map();
  let editing = null;
  let undo = null;
  ['IV.4', 'X.7'].forEach(ref => {
    const article = element('article', 'margin-passage');
    article.append(element('span', 'reference', `${ref} · ${passage(ref).chapter}`), element('p', 'book-prose', passage(ref).text));
    const actions = element('div', 'margin-passage-actions');
    actions.append(button('', 'Leave a thought', () => editNote(ref)));
    const keep = button('', 'Keep this passage', () => {
      if (!notes.has(ref)) notes.set(ref, { ref, note: '' });
      renderNotes();
      $('#note-status').textContent = `${ref} kept in your margin.`;
    });
    keep.dataset.keepRef = ref;
    actions.append(keep);
    article.append(actions);
    $('#margin-passages').append(article);
  });
  function editNote(ref) {
    editing = ref;
    $('#note-form').hidden = false;
    $('#margin-empty').hidden = true;
    $('#note-reference').textContent = `${ref} · ${passage(ref).chapter}`;
    $('#note-text').value = notes.get(ref)?.note || '';
    $('#note-text').setCustomValidity('');
    $('#note-text').focus({ preventScroll: true });
  }
  function cancelNote() {
    editing = null;
    $('#note-form').hidden = true;
    renderNotes();
  }
  function renderNotes() {
    $('#margin-count').textContent = `Your margin · ${notes.size}`;
    $('#margin-empty').hidden = notes.size > 0 || editing !== null;
    $('#export-notes').disabled = notes.size === 0;
    $('#saved-notes').replaceChildren();
    for (const entry of notes.values()) {
      const article = element('article', 'saved-entry');
      article.append(element('span', 'reference', entry.ref), element('p', 'saved-quote', firstSentence(passage(entry.ref).text)));
      if (entry.note) article.append(element('p', '', entry.note));
      const actions = element('div');
      actions.append(button('', entry.note ? 'Edit thought' : 'Add a thought', () => editNote(entry.ref)));
      const remove = button('', 'Remove', () => {
        undo = [...notes.values()].map(note => ({ ...note }));
        notes.delete(entry.ref);
        if (editing === entry.ref) { editing = null; $('#note-form').hidden = true; }
        renderNotes();
        $('#note-status').textContent = `${entry.ref} removed. You can undo this.`;
      });
      remove.setAttribute('aria-label', `Remove ${entry.ref} from your margin`);
      actions.append(remove);
      article.append(actions);
      $('#saved-notes').append(article);
    }
    document.querySelectorAll('[data-keep-ref]').forEach(item => {
      const kept = notes.has(item.dataset.keepRef);
      item.textContent = kept ? 'Passage kept ✓' : 'Keep this passage';
      item.disabled = kept;
    });
    $('#undo-note').hidden = !undo;
  }
  $('#note-form').addEventListener('submit', event => {
    event.preventDefault();
    const text = $('#note-text').value.trim();
    if (!text) { $('#note-text').setCustomValidity('Write a thought, or use Keep this passage.'); $('#note-text').reportValidity(); return; }
    notes.set(editing, { ref: editing, note: text });
    const ref = editing;
    cancelNote();
    $('#note-status').textContent = `Your thought beside ${ref} is kept in this tab.`;
  });
  $('#note-text').addEventListener('input', () => $('#note-text').setCustomValidity(''));
  $('#note-cancel').addEventListener('click', cancelNote);
  $('#undo-note').addEventListener('click', () => {
    if (!undo) return;
    notes.clear();
    undo.forEach(note => notes.set(note.ref, note));
    undo = null;
    renderNotes();
    $('#note-status').textContent = 'Your margin has been restored.';
  });
  $('#reset-margin').addEventListener('click', () => {
    if (notes.size) undo = [...notes.values()].map(note => ({ ...note }));
    notes.clear();
    cancelNote();
    $('#note-status').textContent = undo ? 'Study cleared. You can undo this.' : 'This study is empty.';
  });
  $('#export-notes').addEventListener('click', () => {
    const text = ['The Art of Peace', 'Your margin from the visual design study', 'First manuscript', '', ...[...notes.values()].flatMap(note => [note.ref + ' · ' + passage(note.ref).chapter, passage(note.ref).text, '', note.note ? 'My thought: ' + note.note : 'Kept passage', '', ''])].join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = element('a');
    link.href = url;
    link.download = 'the-art-of-peace-my-margin.txt';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('#note-status').textContent = 'Your margin has been exported as a text file.';
  });
  renderNotes();
})();
