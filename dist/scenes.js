/* Koricho's original, code-native ingredient film. No scroll-scrubbing or scroll lock. */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const $ = s => document.querySelector(s);
  const flesh = 'M478 100C445 141 422 215 428 293C433 380 468 447 516 481C538 497 568 474 552 448C507 376 501 304 516 231C531 165 555 118 525 99C510 89 494 90 478 100Z';
  const chip = 'M-12-118C18-123 35-108 62-99C85-94 96-74 99-51C113-30 121-9 112 14C118 39 97 56 82 76C69 99 41 102 19 112C-8 120-27 109-51 105C-75 108-88 87-99 66C-118 46-111 20-117-3C-123-27-106-48-96-69C-87-92-60-98-41-109C-29-116-22-115-12-118Z';
  const words = [['Good','ingredients.'],['A different','process.'],['One big','crunch.']];
  const pores = Array.from({length:65},(_,i)=>{
    const a=i*2.39996,r=22+Math.sqrt(i/65)*82;
    return `<ellipse cx="${(Math.cos(a)*r).toFixed(1)}" cy="${(Math.sin(a)*r).toFixed(1)}" rx="${(1+i%3*.55).toFixed(1)}" ry="${(1.4+i%4*.3).toFixed(1)}" fill="${i%3?'#b77721':'#fff0ab'}" opacity="${i%3?'.18':'.6'}"/>`;
  }).join('');
  function createFilm() {
    const svg = document.createElementNS(NS,'svg');
    svg.classList.add('ingredient-film');
    svg.setAttribute('viewBox','0 0 1000 620');
    svg.setAttribute('aria-hidden','true');
    svg.innerHTML = `<defs>
      <linearGradient id="peel-gold" x1="0" x2="1"><stop stop-color="#af7021"/><stop offset=".25" stop-color="#f5c943"/><stop offset=".53" stop-color="#ffe78a"/><stop offset=".8" stop-color="#e8b337"/><stop offset="1" stop-color="#bb7a20"/></linearGradient>
      <linearGradient id="peel-inside" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff1b8"/><stop offset=".5" stop-color="#e9c45b"/><stop offset="1" stop-color="#bb842b"/></linearGradient>
      <linearGradient id="banana-flesh" x1="0" x2="1"><stop stop-color="#d8bd7d"/><stop offset=".4" stop-color="#fff0c6"/><stop offset=".7" stop-color="#fff7db"/><stop offset="1" stop-color="#dfc88e"/></linearGradient>
      <radialGradient id="chip-gold" cx=".35" cy=".3" r=".75"><stop stop-color="#f7d575"/><stop offset=".5" stop-color="#e6b44e"/><stop offset=".85" stop-color="#d99b34"/><stop offset="1" stop-color="#a96723"/></radialGradient>
      <radialGradient id="chip-raw"><stop stop-color="#fff4cd"/><stop offset=".8" stop-color="#ebd9a4"/><stop offset="1" stop-color="#d7b66b"/></radialGradient>
      <filter id="letter-grain"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="5" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale=".8"/></filter>
      <path id="fruit-flesh" d="${flesh}"/>
      ${Array.from({length:5},(_,i)=>`<clipPath id="fruit-cut-${i}"><rect x="380" y="${90+i*82}" width="210" height="81"/></clipPath>`).join('')}
    </defs>
    <ellipse class="film-shadow" cx="500" cy="523" rx="105" ry="16" fill="#8a6329" opacity=".09"/>
    <g class="film-fruit">
      <g class="peel-flap peel-left"><path d="M491 427C431 419 376 382 354 323C334 274 315 246 290 257C271 269 296 288 303 317C324 400 402 482 500 479Z" fill="url(#peel-gold)"/><path d="M491 427C423 403 387 352 365 305C349 277 321 254 290 257C321 268 327 303 344 338C380 412 430 447 499 462Z" fill="url(#peel-inside)"/><path d="M313 282C351 365 406 425 477 448" fill="none" stroke="#a77829" stroke-opacity=".3" stroke-width="2"/></g>
      <g class="peel-flap peel-right"><path d="M515 430C572 381 616 322 657 251C675 221 695 211 711 225C726 241 698 246 689 275C652 373 592 455 526 477Z" fill="url(#peel-gold)"/><path d="M515 430C592 362 608 284 668 233C684 220 699 220 711 225C686 229 680 262 666 289C625 370 573 430 526 461Z" fill="url(#peel-inside)"/><path d="M691 238C646 321 596 405 536 451" fill="none" stroke="#a77829" stroke-opacity=".3" stroke-width="2"/></g>
      ${Array.from({length:5},(_,i)=>`<g class="fruit-segment segment-${i}" clip-path="url(#fruit-cut-${i})"><use href="#fruit-flesh" fill="url(#banana-flesh)"/><path d="M493 119C457 224 460 356 526 457" fill="none" stroke="#ead9a6" stroke-width="3" opacity=".6"/></g>`).join('')}
      <g class="peel-flap peel-front"><path d="M484 416C461 468 464 544 501 582C527 608 552 588 541 567C517 525 528 471 535 433Z" fill="url(#peel-gold)"/><path d="M494 438C482 491 485 550 515 581" fill="none" stroke="#fff0ae" stroke-width="10" opacity=".6"/></g>
      <g class="closed-peel"><path d="${flesh}" fill="url(#peel-gold)"/><path d="M489 108C458 219 461 373 527 463" fill="none" stroke="#fff0a4" stroke-width="4" opacity=".55"/><path d="M475 115C442 237 461 395 516 469" fill="none" stroke="#a47221" stroke-width="2" opacity=".22"/><path d="M491 100L496 72Q508 63 520 74L522 99" fill="#8e6930"/><path d="M503 74L506 94" stroke="#b7954f" stroke-width="4"/>
        ${[0,1,2,3,4,5,6,7].map(i=>`<ellipse cx="${449+(i*37)%69}" cy="${166+i*34}" rx="1.4" ry="2" fill="#8d642a" opacity=".35"/>`).join('')}
      </g>
      <g class="slice-lines" fill="none" stroke="#b89553" stroke-width="1.5" opacity=".65">${[172,254,336,418].map(y=>`<path d="M417 ${y}Q480 ${y+15} 545 ${y}"/>`).join('')}</g>
      <path class="cut-glint" d="M395 130L575 490" fill="none" stroke="#fff9e3" stroke-width="3" opacity="0"/>
    </g>
    ${words.map((lines,i)=>`<g class="film-chip film-chip-${i}" transform="translate(500 300)"><g class="chip-drift"><path class="chip-base" d="${chip}" fill="url(#chip-gold)" stroke="#bf8230" stroke-width="1.6"/><path d="M-70-77C-39-109 30-109 67-81" fill="none" stroke="#fff0ae" stroke-width="3" opacity=".55"/>${pores}<g class="chip-seeds" fill="#8d5420" opacity=".2"><ellipse cy="-22" rx="2" ry="5"/><ellipse cx="20" cy="5" rx="4" ry="2"/><ellipse cx="-17" cy="8" rx="4" ry="2"/></g><g class="chip-lettering" filter="url(#letter-grain)"><text class="chip-words chip-emboss" text-anchor="middle" transform="translate(0 1)"><tspan x="0" y="-8">${lines[0]}</tspan><tspan x="0" y="25">${lines[1]}</tspan></text><text class="chip-words" text-anchor="middle"><tspan x="0" y="-8">${lines[0]}</tspan><tspan x="0" y="25">${lines[1]}</tspan></text></g></g></g>`).join('')}`;
    $('.film-stage').prepend(svg);
    $('.film-fallback').hidden=true;
  }
  createFilm();

  window.KorichoScenes = {
    mount({ reduced, playCrunch }) {
      const cleanups=[];
      const stage=$('.film-stage');
      const control=$('.film-control');
      const caption=$('.film-caption');
      const steps=[...document.querySelectorAll('.film-step')];
      const mobile=matchMedia('(max-width: 760px)').matches;
      $('.ingredient-film').setAttribute('viewBox',mobile?'250 0 500 700':'0 0 1000 620');
      const targets=mobile?{x:[385,615,500],y:[195,340,510]}:{x:[210,500,790],y:[300,325,300]};
      let film,context,visible=false,userPaused=false,played=false,done=false;
      function markStep(index,text){steps.forEach((el,i)=>el.classList.toggle('is-active',i===index));caption.textContent=text;stage.dataset.chapter=['peel','slice','transform','message'][index];}
      if(!window.gsap){$('.ingredient-film').remove();$('.film-fallback').hidden=false;control.hidden=true;return ()=>{};}
      context=gsap.context(()=>{
        gsap.set('.film-chip',{x:500,y:300,scale:.15,opacity:0,rotation:0});
        gsap.set('.peel-flap',{opacity:0,scaleY:.05,transformOrigin:'50% 100%'});
        gsap.set('.fruit-segment,.slice-lines,.chip-lettering',{opacity:0});
        gsap.set('.closed-peel,.film-fruit',{opacity:1,x:0,y:0,scale:1});
        film=gsap.timeline({paused:true,onStart:()=>{stage.dataset.state='playing';control.textContent='Pause film Ⅱ';},onComplete:()=>{done=true;stage.dataset.state='complete';control.textContent='Watch again ↻';}});
        film.call(()=>markStep(0,'First, a familiar ingredient.'))
          .to('.film-fruit',{rotation:-5,duration:.65,ease:'power2.inOut'})
          .to('.closed-peel',{opacity:0,clipPath:'inset(100% 0% 0% 0%)',duration:1.2,ease:'power2.inOut'},.55)
          .to('.fruit-segment',{opacity:1,duration:.35},.65)
          .to('.peel-flap',{opacity:1,scaleY:1,duration:1.1,stagger:.13,ease:'power2.out'},.6)
          .call(()=>markStep(1,'Then, one careful slice at a time.'),null,2.05)
          .to('.slice-lines',{opacity:1,duration:.25},2.05)
          .fromTo('.cut-glint',{y:-170,opacity:0},{y:75,opacity:.9,duration:.6,ease:'power2.inOut'},2.05)
          .to('.cut-glint',{opacity:0,duration:.15},2.65)
          .to('.fruit-segment',{x:i=>[-28,24,-22,23,-15][i],y:i=>(i-2)*13,duration:.65,stagger:.07,ease:'power2.out'},2.3)
          .to('.slice-lines,.peel-flap',{opacity:0,y:30,duration:.5},2.75)
          .call(()=>markStep(2,'A different process. A golden transformation.'),null,3.15)
          .to('.fruit-segment',{opacity:0,scale:.7,transformOrigin:'50% 50%',duration:.45},3.15)
          .set('.film-chip',{y:i=>[190,300,410][i]},3.15)
          .to('.film-chip',{opacity:1,scale:.6,rotation:i=>[-70,30,90][i],duration:.5,stagger:.08,ease:'power2.out'},3.2)
          .fromTo('.chip-base',{fill:'url(#chip-raw)'},{fill:'url(#chip-gold)',duration:.8},3.45)
          .to('.film-chip',{x:i=>targets.x[i],y:i=>targets.y[i],scale:1,rotation:i=>[-12,6,15][i],duration:1.2,stagger:.11,ease:'power3.inOut'},3.7)
          .to('.film-shadow',{rx:mobile?130:380,opacity:.05,duration:1},3.8)
          .call(()=>markStep(3,'Good ingredients. A different process. One big crunch.'),null,4.9)
          .fromTo('.chip-lettering',{opacity:0,scale:.86},{opacity:1,scale:1,duration:.75,stagger:.2,transformOrigin:'50% 50%',ease:'power2.out'},4.9)
          .to('.film-chip-0',{rotation:-8,y:targets.y[0]-6,duration:1.15,ease:'sine.inOut'},5.4)
          .to('.film-chip-2',{rotation:10,y:targets.y[2]-4,duration:1.15,ease:'sine.inOut'},5.4);
      });
      function update(){if(!film||done||reduced())return;if(visible&&!document.hidden&&!userPaused)film.play();else film.pause();}
      function toggle(){if(done){done=false;userPaused=false;film.restart();stage.dataset.state='playing';control.textContent='Pause film Ⅱ';}else{userPaused=!userPaused;update();stage.dataset.state=userPaused?'paused':'playing';control.textContent=userPaused?'Continue film ▷':'Pause film Ⅱ';}}
      control.addEventListener('click',toggle);cleanups.push(()=>control.removeEventListener('click',toggle));
      control.hidden=reduced();
      if(reduced()){film.progress(1).pause();stage.dataset.state='reduced';}
      else {
        stage.dataset.state='ready';
        const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.55;if(visible&&!played)played=true;update();},{threshold:[0,.55,.85]});
        observer.observe(stage);cleanups.push(()=>observer.disconnect());
        document.addEventListener('visibilitychange',update);cleanups.push(()=>document.removeEventListener('visibilitychange',update));
      }
      const benefits=$('.benefit-animation');
      let benefitsPlayed=false,benefitsTimeline;
      const benefitContext=gsap.context(()=>{
        benefitsTimeline=gsap.timeline({paused:true,onStart:()=>benefits.dataset.state='playing',onComplete:()=>benefits.dataset.state='complete'})
          .fromTo('.heat-column',{scaleY:1},{scaleY:.48,transformOrigin:'50% 100%',duration:1.8,ease:'power2.inOut'})
          .fromTo('.heat-ripple',{opacity:.8,scale:.7},{opacity:0,scale:1.4,duration:1.8,stagger:.2,transformOrigin:'50% 50%'},0)
          .fromTo('.benefit-leaf',{rotation:-20,scale:.85},{rotation:0,scale:1,duration:1.2,transformOrigin:'50% 80%',ease:'power2.out'},.7)
          .fromTo('.benefit-line',{scaleX:0},{scaleX:1,transformOrigin:'0% 50%',duration:.7,stagger:.18},1.4);
      });
      if(reduced())benefitsTimeline.progress(1).pause();
      else {const observer=new IntersectionObserver(e=>{if(e[0].isIntersecting&&!benefitsPlayed){benefitsPlayed=true;benefitsTimeline.play();}},{threshold:.65});observer.observe(benefits);cleanups.push(()=>observer.disconnect());}
      const crunch=$('.crunch-playground');
      let crunched=false,crunchVisible=false,active=true;
      if(!reduced()){
        const pictures=[...crunch.querySelectorAll('img')];
        let imagesReady=pictures.every(image=>image.complete&&image.naturalWidth>0);
        function startCrunch(){if(active&&crunchVisible&&imagesReady&&!crunched){crunched=true;playCrunch();}}
        const observer=new IntersectionObserver(e=>{crunchVisible=e[0].isIntersecting&&e[0].intersectionRatio>=.65;startCrunch();},{threshold:[0,.65]});
        observer.observe(crunch);
        Promise.all(pictures.map(image=>image.decode().catch(()=>{}))).then(()=>{imagesReady=pictures.every(image=>image.naturalWidth>0);startCrunch();});
        cleanups.push(()=>{active=false;observer.disconnect();});
      }
      else {crunch.dataset.state='reduced';$('.crunch-result').textContent='All the character. All the crunch.';}
      return ()=>{cleanups.forEach(fn=>fn());context.revert();benefitContext.revert();};
    }
  };
})();
