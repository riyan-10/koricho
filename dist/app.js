(() => {
  'use strict';
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const systemMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let manualReduced = false;
  try { manualReduced = localStorage.getItem('koricho-reduce-motion') === 'true'; } catch {}
  let animationContext;
  let mediaContext;
  let soundEnabled = false;
  let audioContext;
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
    if (mediaContext) mediaContext.revert();
    if (animationContext) animationContext.revert();
    document.body.classList.toggle('motion-reduced', reduced());
    $('.motion-toggle').setAttribute('aria-pressed', String(reduced()));
    $('.motion-toggle').textContent = systemMotion.matches ? 'Reduced motion: system' : manualReduced ? 'Enable motion' : 'Reduce motion';
    if (!window.gsap || !window.ScrollTrigger || reduced()) return;
    gsap.registerPlugin(ScrollTrigger);
    animationContext = gsap.context(() => {
      gsap.from('.hero-eyebrow, .hero-line, .hero-bottom-copy', { y: 35, opacity: 0, duration: 1, stagger: .11, ease: 'power3.out', clearProps: 'opacity' });
      gsap.from('.hero-chip', { scale: .76, opacity: 0, y: 45, duration: 1.4, stagger: .13, ease: 'power3.out', delay: .18 });
      gsap.to('.hero-sweet', { y: -75, rotation: 25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
      gsap.to('.hero-banana', { y: -35, rotation: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
      gsap.to('.hero-jackfruit', { y: -110, rotation: -20, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
      gsap.to('.round-stamp', { rotation: 25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
      gsap.from('.process-intro h2, .process-intro > p:not(.eyebrow)', { y: 40, opacity: 0, stagger: .12, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: '.process-intro', start: 'top 85%', toggleActions: 'play none none none' } });
      gsap.fromTo('.process-visual > img', { rotation: -25, y: 55, scale: .8 }, { rotation: 12, y: -25, scale: 1.05, ease: 'none', scrollTrigger: { trigger: '.process-section', start: 'top 80%', end: 'bottom 20%', scrub: 1 } });
      gsap.to('.ring-two', { rotation: 150, ease: 'none', scrollTrigger: { trigger: '.process-section', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      const vapor = gsap.timeline({ repeat: -1, paused: true });
      vapor.fromTo('.vapor', { y: 20, opacity: 0, scale: .5 }, { y: -160, opacity: .8, scale: 1.8, stagger: .28, duration: 1.8, ease: 'power1.out' }).to('.vapor', { opacity: 0, duration: .4, stagger: .1 }, '-=.6');
      ScrollTrigger.create({ trigger: '.process-section', start: 'top bottom', end: 'bottom top', onEnter: () => vapor.play(), onLeave: () => vapor.pause(), onEnterBack: () => vapor.play(), onLeaveBack: () => vapor.pause() });
      gsap.from('.product-card', { y: 65, opacity: 0, stagger: .13, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: '.product-grid', start: 'top 88%', toggleActions: 'play none none none' } });
      gsap.from('.fan-left', { rotation: -5, x: 40, ease: 'none', scrollTrigger: { trigger: '.jackfruit-section', start: 'top 85%', end: 'center 45%', scrub: 1 } });
      gsap.from('.fan-right', { rotation: -5, x: -40, ease: 'none', scrollTrigger: { trigger: '.jackfruit-section', start: 'top 85%', end: 'center 45%', scrub: 1 } });
      gsap.from('.story-mark', { rotation: -8, y: 35, ease: 'none', scrollTrigger: { trigger: '.story-section', start: 'top bottom', end: 'center center', scrub: 1 } });
    });
    mediaContext = gsap.matchMedia();
    mediaContext.add({ desktop: '(min-width: 761px)', mobile: '(max-width: 760px)' }, ctx => {
      const { mobile } = ctx.conditions;
      const timeline = gsap.timeline({ scrollTrigger: { trigger: '.slice-stage', start: 'top top', end: mobile ? '+=1050' : '+=1300', pin: true, scrub: .8, invalidateOnRefresh: true, anticipatePin: 1 } });
      timeline.to('.whole-banana', { scale: 1.06, rotation: -4, duration: .25, ease: 'none' })
        .to('.whole-banana', { opacity: 0, scale: .85, duration: .2 }, .2)
        .fromTo('.slice-piece', { opacity: 0, scale: .4, rotationY: 65 }, {
          opacity: (i) => mobile && (i === 1 || i === 3) ? 0 : 1,
          scale: mobile ? 1.1 : 1,
          x: (i) => mobile ? [-80, -30, 80, 30, -60][i] : (i - 2) * Math.min(225, ($('.banana-stage').offsetWidth - 210) / 4),
          y: (i) => mobile ? [-60, 0, 30, 40, 135][i] : [10, -20, 25, -20, 10][i],
          rotationY: 0, rotation: (i) => [-18, -8, 0, 8, 18][i], duration: .65, stagger: .035, ease: 'power2.out'
        }, .27)
        .to('.slice-piece span', { opacity: 1, duration: .2 }, .72)
        .to({}, { duration: .4 });
      gsap.to('.slice-progress > span', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.slice-stage', start: 'top top', end: mobile ? '+=1050' : '+=1300', scrub: true } });
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
  buildMotion();
  if (document.fonts) document.fonts.ready.then(() => window.ScrollTrigger?.refresh());
  window.addEventListener('load', () => window.ScrollTrigger?.refresh(), { once: true });

  // Optional sound is synthesized locally, and only begins after a user action.
  $('.sound-toggle').addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    $('.sound-toggle').setAttribute('aria-pressed', String(soundEnabled));
    $('.sound-toggle span').textContent = soundEnabled ? 'Sound on' : 'Sound off';
  });
  function playCrunch() {
    if (!soundEnabled) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      audioContext ||= new Audio();
      if (audioContext.state === 'suspended') audioContext.resume();
      const time = audioContext.currentTime;
      for (let pulse = 0; pulse < 4; pulse++) {
        const duration = .075 + pulse * .012;
        const buffer = audioContext.createBuffer(1, Math.ceil(audioContext.sampleRate * duration), audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        const filter = audioContext.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.value = 1100;
        const gain = audioContext.createGain(); gain.gain.value = .13 - pulse * .02;
        source.connect(filter); filter.connect(gain); gain.connect(audioContext.destination);
        source.start(time + pulse * .045);
        source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
      }
    } catch { soundEnabled = false; $('.sound-toggle').setAttribute('aria-pressed', 'false'); $('.sound-toggle span').textContent = 'Sound off'; }
  }
  const crunchButton = $('.crunch-button');
  crunchButton.addEventListener('click', () => {
    playCrunch();
    $('.crunch-result').textContent = 'That’s the moment.';
    $('span', crunchButton).textContent = 'One more crunch';
    if (!window.gsap || reduced()) return;
    crunchButton.disabled = true;
    crunchTimeline?.kill();
    const crumbs = $('.crunch-crumbs'); crumbs.replaceChildren();
    for (let i = 0; i < 15; i++) crumbs.append(document.createElement('i'));
    crunchTimeline = gsap.timeline({ onComplete: () => { crunchButton.disabled = false; crumbs.replaceChildren(); } });
    crunchTimeline.set('.chip-half', { x: 0, y: 0, rotation: 0, opacity: 1 })
      .to('.chip-left', { x: -45, y: 12, rotation: -14, duration: .18, ease: 'power3.out' })
      .to('.chip-right', { x: 45, y: -5, rotation: 15, duration: .18, ease: 'power3.out' }, '<')
      .fromTo('.crunch-rays', { scale: .85, rotation: 20 }, { scale: 1.1, rotation: 35, duration: .45, ease: 'power3.out' }, 0)
      .to('.crunch-crumbs i', { x: i => Math.cos(i / 15 * Math.PI * 2) * (90 + (i % 4) * 35), y: i => Math.sin(i / 15 * Math.PI * 2) * (90 + (i % 3) * 40), rotation: i => i * 43, opacity: 0, scale: .3, duration: .8, ease: 'power2.out' }, .06)
      .to('.chip-half', { x: 0, y: 0, rotation: 0, duration: .55, ease: 'power2.inOut' }, '+=.7');
  });

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
