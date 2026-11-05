/* Automatic chapter playback. The ingredient film is rendered with solid textured 3D geometry. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  window.KorichoScenes = {
    mount({ reduced, playCrunch }) {
      const cleanups = [], stage = $('.film-stage'), control = $('.film-control'), caption = $('.film-caption');
      const steps = [...document.querySelectorAll('.film-step')];
      let movie, active = true, visible = false, userPaused = false, done = false, preparing = false;
      function markStep(index, text) {
        steps.forEach((element, i) => element.classList.toggle('is-active', i === index));
        caption.textContent = text; stage.dataset.chapter = ['peel','slice','transform','message'][index];
      }
      function update() {
        if (!movie || done || reduced()) return;
        if (visible && !document.hidden && !userPaused) movie.timeline.play(); else movie.timeline.pause();
      }
      function complete() { done = true; stage.dataset.state = 'complete'; control.textContent = 'Watch again ↻'; }
      async function prepare() {
        if (preparing || !active) return;
        preparing = true;
        try {
          const { createBananaFilm } = await import('./banana-film.js');
          const result = await createBananaFilm(stage, { onStep: markStep, onComplete: complete, reduced });
          if (!active) { result.dispose(); return; }
          movie = result;
          movie.timeline.eventCallback('onStart', () => { stage.dataset.state = 'playing'; control.textContent = 'Pause film Ⅱ'; });
          control.disabled = false; control.hidden = reduced();
          if (reduced()) { stage.dataset.state = 'reduced'; movie.timeline.progress(1).pause(); }
          else { stage.dataset.state = 'ready'; update(); }
        } catch (error) {
          if (!active) return;
          stage.dataset.renderer = 'photo'; stage.dataset.state = 'fallback'; control.hidden = true;
          $('.film-fallback').hidden = false;
          caption.textContent = 'Good ingredients. A different process. One big crunch.';
          console.warn('Koricho ingredient film uses the photographic fallback:', error.message);
        }
      }
      function toggle() {
        if (!movie) return;
        if (done) { done = false; userPaused = false; movie.timeline.restart(); }
        else { userPaused = !userPaused; update(); stage.dataset.state = userPaused ? 'paused' : 'playing'; control.textContent = userPaused ? 'Continue film ▷' : 'Pause film Ⅱ'; }
      }
      stage.dataset.state = 'ready'; control.disabled = true; control.hidden = reduced();
      const prepareObserver = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { prepare(); prepareObserver.disconnect(); } }, { rootMargin: '600px' });
      prepareObserver.observe(stage);
      const sceneObserver = new IntersectionObserver(entries => { visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .55; if (visible) prepare(); update(); }, { threshold: [0,.55,.85] });
      sceneObserver.observe(stage);
      control.addEventListener('click', toggle); document.addEventListener('visibilitychange', update);
      cleanups.push(() => { prepareObserver.disconnect(); sceneObserver.disconnect(); control.removeEventListener('click', toggle); document.removeEventListener('visibilitychange', update); movie?.dispose(); });

      const benefits = $('.benefit-animation');
      let benefitsPlayed = false;
      const benefitContext = window.gsap ? gsap.context(() => {
        const timeline = gsap.timeline({ paused: true, onStart: () => benefits.dataset.state = 'playing', onComplete: () => benefits.dataset.state = 'complete' })
          .fromTo('.process-food', { y: 25, scale: .94, rotation: -4 }, { y: 0, scale: 1, rotation: 0, duration: 1.7, ease: 'power2.out' })
          .fromTo('.temperature-indicator', { scaleY: 1 }, { scaleY: .45, transformOrigin: '50% 100%', duration: 1.8, ease: 'sine.inOut' }, .25)
          .fromTo('.process-stat', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .7, stagger: .15, ease: 'power2.out' }, .8);
        if (reduced()) timeline.progress(1).pause();
        else {
          const observer = new IntersectionObserver(entries => { if (entries[0].isIntersecting && !benefitsPlayed) { benefitsPlayed = true; timeline.play(); } }, { threshold: .55 });
          observer.observe(benefits); cleanups.push(() => observer.disconnect());
        }
      }) : null;
      cleanups.push(() => benefitContext?.revert());
      const crunch = $('.crunch-playground');
      let crunched = false, crunchVisible = false;
      if (!reduced()) {
        const images = [...crunch.querySelectorAll('img')];
        let ready = images.every(image => image.complete && image.naturalWidth > 0);
        function start() { if (active && crunchVisible && ready && !crunched) { crunched = true; playCrunch(); } }
        const observer = new IntersectionObserver(entries => { crunchVisible = entries[0].isIntersecting && entries[0].intersectionRatio >= .65; start(); }, { threshold: [0,.65] });
        observer.observe(crunch); cleanups.push(() => observer.disconnect());
        Promise.all(images.map(image => image.decode().catch(() => {}))).then(() => { ready = images.every(image => image.naturalWidth > 0); start(); });
      } else { crunch.dataset.state = 'reduced'; $('.crunch-result').textContent = 'All the character. All the crunch.'; }
      return () => { active = false; cleanups.forEach(fn => fn()); };
    }
  };
})();
