'use strict';

const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function enhanceCodeBlocks() {
  for (const pre of document.querySelectorAll('.prose pre')) {
    const block = pre.closest('.code-block');
    if (!block || block.querySelector('.copy-button')) continue;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-button';
    button.textContent = 'Copiar';
    button.setAttribute('aria-label', 'Copiar bloco de código');
    button.addEventListener('click', async () => {
      const text = pre.innerText;
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = 'Copiado';
        button.setAttribute('aria-live', 'polite');
        setTimeout(() => { button.textContent = 'Copiar'; }, 1800);
      } catch {
        button.textContent = 'Selecione e copie';
      }
    });
    block.append(button);
  }
}

function enhancePostSearch() {
  const input = document.querySelector('[data-post-search]');
  if (!input) return;
  const cards = [...document.querySelectorAll('[data-post]')];
  const count = document.querySelector('[data-post-count]');
  const empty = document.querySelector('[data-post-empty]');
  const buttons = [...document.querySelectorAll('[data-study-track]')];
  const groups = [...document.querySelectorAll('[data-track-section]')];
  const tracks = new Set(buttons.map(button => button.dataset.studyTrack));
  let track = '';

  const filter = () => {
    const terms = normalize(input.value.trim()).split(/\s+/).filter(Boolean);
    const totals = new Map();
    let visible = 0;
    for (const card of cards) {
      const haystack = normalize([
        card.dataset.search || '',
        card.textContent || ''
      ].join(' '));
      const match = (!track || card.dataset.track === track) && terms.every(term => haystack.includes(term));
      card.hidden = !match;
      if (match) {
        visible += 1;
        totals.set(card.dataset.track, (totals.get(card.dataset.track) || 0) + 1);
      }
    }
    for (const group of groups) {
      const n = totals.get(group.dataset.trackSection) || 0;
      group.hidden = n === 0;
      group.querySelector('[data-track-count]').textContent = n + (n === 1 ? ' capítulo' : ' capítulos');
    }
    if (count) {
      count.textContent = visible === cards.length ? `${visible} capítulos` : `${visible} de ${cards.length} capítulos`;
    }
    if (empty) empty.classList.toggle('visible', visible === 0);
  };
  const selectTrack = value => {
    track = tracks.has(value) ? value : '';
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.studyTrack === track));
    filter();
  };
  const readTrack = () => selectTrack(new URL(location.href).searchParams.get('assunto'));

  input.addEventListener('input', filter);
  for (const button of buttons) button.addEventListener('click', () => {
    if (button.dataset.studyTrack === track) return;
    const url = new URL(location.href);
    if (button.dataset.studyTrack) url.searchParams.set('assunto', button.dataset.studyTrack);
    else url.searchParams.delete('assunto');
    history.pushState(null, '', url);
    selectTrack(button.dataset.studyTrack);
  });
  window.addEventListener('popstate', readTrack);
  readTrack();
}

function enhanceToc() {
  const links = [...document.querySelectorAll('.article-toc a[href^="#"]')];
  if (!links.length || !('IntersectionObserver' in window)) return;
  const byId = new Map(links.map(link => [link.getAttribute('href').slice(1), link]));
  const headings = [...byId.keys()].map(id => document.getElementById(id)).filter(Boolean);
  if (!headings.length) return;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const link of links) link.removeAttribute('aria-current');
      const link = byId.get(entry.target.id);
      if (link) link.setAttribute('aria-current', 'location');
    }
  }, { rootMargin: '-92px 0px -68% 0px', threshold: 0 });
  for (const heading of headings) observer.observe(heading);
}

enhanceCodeBlocks();
enhancePostSearch();
enhanceToc();
