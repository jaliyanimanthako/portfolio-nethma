/* All assets use relative file paths so index.html also works with file://. */
(() => {
  'use strict';
  const pages = Array.from({ length: 27 }, (_, i) => `pages/page-${String(i + 1).padStart(2, '0')}.webp`);
  const $ = id => document.getElementById(id);
  const select = $('page-select');
  const reader = $('reader');
  let book;
  let ready = false;
  let readerPage = 0;
  let selectedPage = 0;
  let turning = false;
  let soundEnabled = true;
  let audioContext;
  let paperBuffer;
  let audioReady;
  let activeSound;
  try { soundEnabled = localStorage.getItem('cv1-flip-sound') !== 'off'; } catch { /* File storage may be unavailable. */ }
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  function updateSoundButton() {
    $('sound').textContent = soundEnabled ? 'Sound on' : 'Sound off';
    $('sound').setAttribute('aria-pressed', String(soundEnabled));
  }
  // Decode the bundled page-turn recording. Embedded bytes also work with file://.
  function prepareAudio() {
    if (!soundEnabled || !AudioContextClass) return;
    try {
      if (!audioContext) {
        audioContext = new AudioContextClass();
        const bytes = Uint8Array.from(atob(window.CV1_PAGE_FLIP_AUDIO), char => char.charCodeAt(0));
        audioReady = audioContext.decodeAudioData(bytes.buffer)
          .then(buffer => { paperBuffer = buffer; })
          .catch(() => { soundEnabled = false; updateSoundButton(); $('sound').title = 'The page-turn audio could not be loaded'; });
      }
      if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    } catch { /* Audio must never prevent page navigation. */ }
  }
  function playPaperSound() {
    if (!soundEnabled) return;
    prepareAudio();
    if (!audioContext || !audioReady) return;
    const start = () => {
      if (!soundEnabled || !paperBuffer || audioContext.state !== 'running') return;
      if (activeSound) { try { activeSound.stop(); } catch {} }
      const source = audioContext.createBufferSource();
      source.buffer = paperBuffer;
      source.playbackRate.value = 1;
      source.connect(audioContext.destination);
      source.onended = () => { source.disconnect(); if (activeSound === source) activeSound = null; };
      activeSound = source;
      source.start();
    };
    Promise.all([audioReady, audioContext.resume()]).then(start).catch(() => {});
  }
  if (!AudioContextClass) { soundEnabled = false; $('sound').disabled = true; $('sound').title = 'Sound is unavailable in this browser'; }
  updateSoundButton();
  // Unlock audio during a user gesture, including touch and keyboard navigation.
  document.addEventListener('pointerdown', prepareAudio, { capture: true, passive: true });
  document.addEventListener('keydown', prepareAudio, { capture: true });
  $('sound').addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (!soundEnabled && activeSound) { try { activeSound.stop(); } catch {} }
    if (soundEnabled) prepareAudio();
    updateSoundButton();
    try { localStorage.setItem('cv1-flip-sound', soundEnabled ? 'on' : 'off'); } catch {}
  });
  pages.forEach((_, i) => select.add(new Option(String(i + 1), String(i))));

  function showError(message) { $('error').textContent = message; $('error').hidden = false; }
  function visiblePages() {
    const start = book.getCurrentPageIndex();
    const end = book.getOrientation() === 'landscape' && start > 0 ? Math.min(start + 1, pages.length - 1) : start;
    return { start, end };
  }
  function positionBook() {
    // A closed cover occupies only the right half of a landscape spread.
    // Move the entire viewer so its pointer coordinates follow the cover.
    const centerCover = book.getOrientation() === 'landscape'
      && book.getCurrentPageIndex() === 0 && !turning;
    const offset = centerCover ? -book.getBoundsRect().pageWidth / 2 : 0;
    $('book').style.transform = `translate3d(${offset}px, 0, 0)`;
  }
  function update() {
    if (!ready) return;
    positionBook();
    const { start, end } = visiblePages();
    if (selectedPage < start || selectedPage > end) selectedPage = start;
    select.value = String(selectedPage);
    const label = start === end ? `Page ${start + 1} of ${pages.length}` : `Pages ${start + 1}–${end + 1} of ${pages.length}`;
    $('page-status').textContent = label;
    $('book').setAttribute('aria-label', `Portfolio flipbook, ${label.toLowerCase()}`);
    $('previous').disabled = turning || start === 0;
    $('next').disabled = turning || end === pages.length - 1;
    select.disabled = turning;
    $('read').disabled = turning;
  }
  function turn(direction) {
    if (!ready || turning) return;
    const { start, end } = visiblePages();
    if (direction < 0 && start > 0) book.flipPrev();
    if (direction > 0 && end < pages.length - 1) book.flipNext();
  }
  function showReaderPage(index) {
    readerPage = Math.max(0, Math.min(pages.length - 1, index));
    $('reader-image').src = pages[readerPage];
    $('reader-image').alt = `Landscape architecture portfolio, page ${readerPage + 1}`;
    $('reader-status').textContent = `${readerPage + 1} / ${pages.length}`;
    $('reader-prev').disabled = readerPage === 0;
    $('reader-next').disabled = readerPage === pages.length - 1;
    $('reader-scroll').scrollTo(0, 0);
  }
  $('previous').addEventListener('click', () => turn(-1));
  $('next').addEventListener('click', () => turn(1));
  select.addEventListener('change', () => { const target = Number(select.value); book.turnToPage(target); selectedPage = target; update(); });
  $('read').addEventListener('click', () => { showReaderPage(selectedPage); reader.showModal(); });
  $('reader-prev').addEventListener('click', () => showReaderPage(readerPage - 1));
  $('reader-next').addEventListener('click', () => showReaderPage(readerPage + 1));
  $('close-reader').addEventListener('click', () => reader.close());
  reader.addEventListener('close', () => { selectedPage = readerPage; book.turnToPage(readerPage); update(); $('read').focus(); });
  $('zoom').addEventListener('click', () => {
    const zoomed = $('reader-scroll').classList.toggle('zoomed');
    $('zoom').textContent = zoomed ? 'Fit page' : 'Zoom in';
    $('zoom').setAttribute('aria-pressed', String(zoomed));
  });
  $('fullscreen').hidden = !document.fullscreenEnabled;
  $('fullscreen').addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch { showError('Fullscreen is unavailable in this browser. You can still use Enlarge page.'); }
  });
  document.addEventListener('keydown', event => {
    if (event.target.matches('select, input, textarea') || event.altKey || event.ctrlKey || event.metaKey) return;
    if (!ready || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (reader.open) {
      showReaderPage(event.key === 'Home' ? 0 : event.key === 'End' ? pages.length - 1 : readerPage + (event.key === 'ArrowRight' ? 1 : -1));
    } else if (!turning) {
      if (event.key === 'Home' || event.key === 'End') {
        selectedPage = event.key === 'Home' ? 0 : pages.length - 1;
        book.turnToPage(selectedPage); update();
      } else turn(event.key === 'ArrowRight' ? 1 : -1);
    }
  });

  async function initialize() {
    try {
      if (!window.St || !St.PageFlip) throw new Error('The local page-flip.browser.js library is missing.');
      await Promise.all(pages.map(src => new Promise((resolve, reject) => {
        const image = new Image(); image.onload = resolve;
        image.onerror = () => reject(new Error(`Could not load ${src}. Keep the pages folder beside index.html.`));
        image.src = src;
      })));
      book = new St.PageFlip($('book'), {
        width: 842, height: 596, size: 'stretch',
        minWidth: 520, maxWidth: 1000, minHeight: 180, maxHeight: 708,
        autoSize: false, showCover: true, usePortrait: true, drawShadow: true,
        maxShadowOpacity: .45,
        flippingTime: matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 850,
        // The book fills the screen; keep touch gestures with the page turner.
        mobileScrollSupport: false, swipeDistance: 30
      });
      book.on('init', () => {
        // Let the library measure and render the cover before exposing it.
        // Keeping the book positioned inside the stage also prevents its
        // temporary page elements from changing the surrounding layout.
        requestAnimationFrame(() => {
          book.getUI().update();
          positionBook();
          requestAnimationFrame(() => {
            ready = true;
            update();
            $('book').classList.add('is-ready');
            $('loading').hidden = true;
          });
        });
      });
      book.on('flip', update);
      book.on('changeOrientation', () => requestAnimationFrame(update));
      book.on('changeState', event => {
        const nextTurning = event.data === 'flipping' || event.data === 'user_fold';
        if (nextTurning && !turning) playPaperSound();
        turning = nextTurning;
        update();
      });
      const pageElements = pages.map((src, i) => {
        const element = document.createElement('div');
        element.className = 'book-page';
        const image = document.createElement('img');
        image.src = src; image.alt = `Portfolio page ${i + 1}`; image.draggable = false;
        element.append(image); $('book').append(element);
        return element;
      });
      book.loadFromHTML(pageElements);
      new ResizeObserver(() => { if (ready) book.getUI().update(); }).observe($('stage'));
    } catch (error) { $('loading').hidden = true; showError(`${error.message} The original CV 1.pdf is also included in the folder.`); }
  }
  initialize();
})();
