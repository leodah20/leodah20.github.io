'use strict';

(() => {
  const gallery = document.querySelector('[data-ops-gallery]');
  if (!gallery) return;
  const buttons = [...gallery.querySelectorAll('[data-ops-view]')];
  const frames = [...gallery.querySelectorAll('[data-ops-frame]')];
  const show = id => {
    for (const button of buttons)
      button.setAttribute('aria-pressed', String(button.getAttribute('aria-controls') === id));
    for (const frame of frames) frame.hidden = frame.id !== id;
  };
  for (const button of buttons)
    button.addEventListener('click', () => show(button.getAttribute('aria-controls')));
  show(buttons[0].getAttribute('aria-controls'));
  gallery.querySelector('.demo-ops-views').hidden = false;
})();
