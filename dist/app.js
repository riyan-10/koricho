(() => {
  'use strict';
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const systemMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let manualReduced = false;
  try { manualReduced = localStorage.getItem('koricho-reduce-motion') === 'true'; } catch {}
  let animationContext;
  let cleanupScenes;
  let soundEnabled = true;
  let pendingCrunch = false;
  let audioContext;
  let crunchBuffer;
  let activeCrunchSource;
  let crunchLoad;
  let crunchTimeline;
  const reduced = () => systemMotion.matches || manualReduced;

  // Navigation is native anchor navigation; visitors can bypass every scene.
  const menu = $('.menu-toggle');
  const mobileNav = $('#mobile-nav');
  function closeMenu() {
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open navigation');
    mobileNav.hidden = true;
    document.body.style.overflow = '';
  }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    mobileNav.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('a', mobileNav).forEach(link => link.addEventListener('click', closeMenu));
  mobileNav.addEventListener('keydown', event => {
    if (event.key === 'Escape') { closeMenu(); menu.focus(); }
    if (event.key !== 'Tab') return;
    const links = $$('a', mobileNav);
    if (event.shiftKey && document.activeElement === links[0]) { event.preventDefault(); menu.focus(); }
    else if (!event.shiftKey && document.activeElement === links.at(-1)) { event.preventDefault(); menu.focus(); }
  });
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
    if (event.key === 'Tab' && menu.getAttribute('aria-expanded') === 'true') {
      event.preventDefault();
      const links = $$('a', mobileNav);
      (event.shiftKey ? links.at(-1) : links[0]).focus();
    }
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  function buildMotion() {
    cleanupScenes?.();
    animationContext?.revert();
    crunchTimeline?.kill();
    $('.crunch-crumbs').replaceChildren();
    $('.crunch-result').textContent = '';
    $('.crunch-playground').dataset.state = 'ready';
    document.body.classList.toggle('motion-reduced', reduced());
    $('.motion-toggle').setAttribute('aria-pressed', String(reduced()));
    $('.motion-toggle').textContent = systemMotion.matches ? 'Reduced motion: system' : manualReduced ? 'Enable motion' : 'Reduce motion';
    if (window.gsap) {
      gsap.set('.chip-half, .crunch-food, .crunch-rays, .crunch-result', { clearProps: 'transform,opacity' });
    }
    cleanupScenes = window.KorichoScenes?.mount({ reduced, playCrunch: animateCrunch });
    if (!window.gsap || !window.ScrollTrigger || reduced()) return;
    gsap.registerPlugin(ScrollTrigger);
    animationContext = gsap.context(() => {
      gsap.from('.hero-eyebrow, .hero-line, .hero-bottom-copy', { y: 35, opacity: 0, duration: 1, stagger: .11, ease: 'power3.out', clearProps: 'opacity' });
      gsap.from('.hero-still', { scale: .94, opacity: 0, y: 16, duration: 1, ease: 'power3.out', delay: .1, clearProps: 'transform,opacity' });
      if (window.matchMedia('(min-width: 761px)').matches) gsap.to('.hero-still', { y: -60, rotation: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
      gsap.to('.round-stamp', { rotation: 25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
      gsap.from('.product-card', { y: 65, opacity: 0, stagger: .13, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: '.product-grid', start: 'top 88%', toggleActions: 'play none none none' } });
      gsap.from('.origin-art img', { y: 24, scale: .97, ease: 'none', scrollTrigger: { trigger: '.origin-section', start: 'top 85%', end: 'center 45%', scrub: 1 } });
      gsap.from('.story-mark', { rotation: -8, y: 35, ease: 'none', scrollTrigger: { trigger: '.story-section', start: 'top bottom', end: 'center center', scrub: 1 } });
    });
    ScrollTrigger.refresh();
  }
  $('.motion-toggle').addEventListener('click', () => {
    if (systemMotion.matches) return;
    manualReduced = !manualReduced;
    try { localStorage.setItem('koricho-reduce-motion', String(manualReduced)); } catch {}
    buildMotion();
  });
  systemMotion.addEventListener('change', buildMotion);
  window.matchMedia('(max-width: 760px)').addEventListener('change', buildMotion);
  buildMotion();
  if (document.fonts) document.fonts.ready.then(() => window.ScrollTrigger?.refresh());
  window.addEventListener('load', () => window.ScrollTrigger?.refresh(), { once: true });

  // A locally hosted, CC0 recording of an actual chip bite. Decode ahead of the
  // break; only resume the audio device inside a browser-approved user gesture.
  const soundButton = $('.sound-toggle');
  const unlockButton = $('.sound-unlock');
  const crunchBytes = fetch('./assets/chip-bite.wav').then(response => {
    if (!response.ok) throw new Error('Crunch recording unavailable');
    return response.arrayBuffer();
  });
  crunchBytes.catch(() => { document.body.dataset.audioState = 'unavailable'; });
  function loadCrunch() {
    if (!audioContext) return Promise.resolve();
    if (!crunchLoad) crunchLoad = crunchBytes.then(bytes => audioContext.decodeAudioData(bytes.slice(0))).then(buffer => { crunchBuffer = buffer; }).catch(() => {
      crunchLoad = null; document.body.dataset.audioState = 'unavailable';
    });
    return crunchLoad;
  }
  function stopCrunch() { activeCrunchSource?.stop(); activeCrunchSource = null; }
  function updateSoundUI() {
    soundButton.setAttribute('aria-pressed', String(soundEnabled));
    $('span', soundButton).textContent = soundEnabled ? 'Sound on' : 'Sound off';
    if (!soundEnabled) unlockButton.hidden = true;
  }
  async function unlockAudio(fromGesture = false) {
    if (!soundEnabled) return false;
    if (!fromGesture && !navigator.userActivation?.hasBeenActive && !audioContext) return false;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return false;
      audioContext ||= new Audio();
      if (audioContext.state !== 'running' && (fromGesture || navigator.userActivation?.hasBeenActive)) await audioContext.resume();
      await loadCrunch();
      const ready = audioContext.state === 'running' && !!crunchBuffer;
      document.body.dataset.audioState = ready ? 'ready' : 'activation-needed';
      if (ready) unlockButton.hidden = true;
      return ready;
    } catch { document.body.dataset.audioState = 'unavailable'; return false; }
  }
  function gestureUnlock(event) {
    if (event.target.closest?.('.sound-toggle, .sound-unlock, .crunch-replay') || !soundEnabled) return;
    // Unlock silently. A late gesture must not play a bite from an offscreen scene.
    unlockAudio(true);
  }
  document.addEventListener('pointerdown', gestureUnlock, { passive: true });
  document.addEventListener('keydown', gestureUnlock);
  soundButton.addEventListener('click', () => {
    soundEnabled = !soundEnabled; updateSoundUI();
    if (!soundEnabled) { pendingCrunch = false; stopCrunch(); }
    else unlockAudio(true);
  });
  unlockButton.addEventListener('click', () => {
    unlockAudio(true).then(ready => { if (ready) { pendingCrunch = false; reduced() ? playCrunch() : animateCrunch(); } });
  });
  $('.crunch-replay').addEventListener('click', () => {
    if (!soundEnabled) { soundEnabled = true; updateSoundUI(); }
    unlockAudio(true).then(() => reduced() ? playCrunch() : animateCrunch());
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { pendingCrunch = false; stopCrunch(); } });
  updateSoundUI();
  function playCrunch() {
    if (!soundEnabled || document.hidden) return;
    unlockAudio().then(ready => {
      if (!soundEnabled || document.hidden) return;
      if (!ready) { pendingCrunch = true; unlockButton.hidden = false; return; }
      pendingCrunch = false;
      stopCrunch();
      const source = audioContext.createBufferSource();
      const gain = audioContext.createGain();
      source.buffer = crunchBuffer;
      gain.gain.value = .8;
      source.connect(gain); gain.connect(audioContext.destination);
      activeCrunchSource = source;
      source.start();
      source.onended = () => { if (activeCrunchSource === source) activeCrunchSource = null; source.disconnect(); gain.disconnect(); };
      document.body.dataset.crunchSoundDuration = String(crunchBuffer.duration);
      document.body.dataset.crunchSoundCount = String((Number(document.body.dataset.crunchSoundCount) || 0) + 1);
    });
  }
  function animateCrunch() {
    const playground = $('.crunch-playground');
    if (!window.gsap || reduced()) { playground.dataset.state = 'complete'; return; }
    playground.dataset.state = 'playing';
    crunchTimeline?.kill();
    const crumbs = $('.crunch-crumbs'); crumbs.replaceChildren();
    for (let i = 0; i < 15; i++) crumbs.append(document.createElement('i'));
    crunchTimeline = gsap.timeline({ onComplete: () => { playground.dataset.state = 'complete'; crumbs.replaceChildren(); } });
    crunchTimeline.set('.chip-half', { x: 0, y: 0, rotation: 0, opacity: 1 }, 0)
      .to('.crunch-food', { scale: 1.04, duration: .65, ease: 'sine.inOut' }, 0)
      .call(playCrunch, null, .65)
      .to('.chip-left', { x: -39, y: 13, rotation: -12, duration: .23, ease: 'power3.out' }, .65)
      .to('.chip-right', { x: 39, y: -7, rotation: 11, duration: .23, ease: 'power3.out' }, '<')
      // The .23s fracture and .13s settle share the .36s recorded bite.
      .to('.chip-left', { x: -42, y: 15, rotation: -13, duration: .13, ease: 'sine.out' }, .88)
      .to('.chip-right', { x: 42, y: -8, rotation: 12, duration: .13, ease: 'sine.out' }, .88)
      .fromTo('.crunch-rays', { scale: .85, rotation: 20 }, { scale: 1.1, rotation: 35, duration: .36, ease: 'power3.out' }, .65)
      .to('.crunch-crumbs i', { x: i => Math.cos(i / 15 * Math.PI * 2) * (110 + (i % 4) * 35), y: i => Math.sin(i / 15 * Math.PI * 2) * (90 + (i % 3) * 40), rotation: i => i * 43, opacity: 0, scale: .3, duration: .36, ease: 'power2.out' }, .65)
      .call(() => { $('.crunch-result').textContent = 'That’s the moment.'; }, null, 1.03)
      .fromTo('.crunch-result', { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: 'power2.out' }, 1.03);
  }

  const products = {
    banana: { title: 'Banana', ingredient: 'Banana', description: 'The familiar favourite, with a different kind of bite. Meet Koricho’s vacuum-fried banana snack.', image: 'banana-chip', color: '#e5ca78' },
    'sweet-potato': { title: 'Sweet potato', ingredient: 'Sweet potato', description: 'A colourful character in the Koricho collection. Discover our vacuum-fried sweet potato snack.', image: 'sweet-potato-chip', color: '#dca788' },
    jackfruit: { title: 'Jackfruit', ingredient: 'Jackfruit', description: 'A golden original with a personality all its own. Meet Koricho’s vacuum-fried jackfruit snack.', image: 'jackfruit-chip', color: '#b9c69c' }
  };
  const dialog = $('.product-dialog');
  let dialogTrigger;
  $$('.product-card').forEach(card => card.addEventListener('click', () => {
    const product = products[card.dataset.product];
    $('#dialog-title').textContent = product.title;
    $('#dialog-description').textContent = product.description;
    $('#dialog-ingredient').textContent = product.ingredient;
    $('#dialog-image').src = `./assets/${product.image}.webp`;
    $('#dialog-image').alt = `Koricho ${product.title.toLowerCase()} snack concept`;
    $('.dialog-art').style.background = product.color;
    dialogTrigger = card;
    dialog.showModal();
    $('.dialog-close').focus();
  }));
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => dialogTrigger?.focus({ preventScroll: true }));
  $('#year').textContent = String(new Date().getFullYear());
})();
