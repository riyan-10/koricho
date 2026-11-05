import * as THREE from './assets/three.module.js';

// A continuously deforming peel and solid, capped fruit slices. No raster keyframe swapping.
export async function createBananaFilm(stage, { onStep, onComplete, reduced }) {
  const resources = new Set();
  const keep = item => (resources.add(item), item);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .92;
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.className = 'banana-canvas';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 50);
  const mobile = () => stage.clientWidth < 650;
  const loader = new THREE.TextureLoader();
  let disposed = false;
  let raw, skin, crisp;
  try {
    [skin, raw, crisp] = await Promise.all(['banana-skin-v3', 'banana-flesh-v3', 'banana-crisp-v3'].map(async name => {
      const texture = keep(await loader.loadAsync(`./assets/${name}.webp`));
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      return texture;
    }));
  } catch (error) { renderer.dispose(); resources.forEach(r => r.dispose?.()); throw error; }

  scene.add(new THREE.HemisphereLight(0xfff9e9, 0x816642, 1.15));
  const key = new THREE.DirectionalLight(0xfff4d7, 2.4); key.position.set(-3, 5, 7); scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, .65); fill.position.set(4, 1, 5); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffdd8e, 1.2); rim.position.set(2, 4, -3); scene.add(rim);

  const root = new THREE.Group(); scene.add(root);

  const state = { reveal: 0, spread: 1, cook: 0, gather: 0, letters: 0, leave: 0, turn: 0 };
  const cookUniform = { value: 0 };
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(.32, 1.95, -.02), new THREE.Vector3(-.25, 1.35, .04),
    new THREE.Vector3(-.48, .35, .12), new THREE.Vector3(-.28, -.72, .05),
    new THREE.Vector3(.39, -1.55, -.02), new THREE.Vector3(.83, -1.78, -.06)
  ]);
  const radius = t => .305 * Math.pow(Math.max(.0001, Math.sin(Math.PI * t)), .37);
  const frame = t => {
    const center = curve.getPoint(t), tangent = curve.getTangent(t).normalize();
    const normal = new THREE.Vector3(tangent.y, -tangent.x, 0).normalize();
    const binormal = new THREE.Vector3().crossVectors(normal, tangent).normalize();
    // X cross Y = Z; the local front face points towards the top of the fruit.
    const axis = tangent.clone().negate();
    const basis = new THREE.Matrix4().makeBasis(normal, binormal, axis);
    return { center, tangent, normal, binormal, axis, quaternion: new THREE.Quaternion().setFromRotationMatrix(basis) };
  };
  const surface = (t, theta, shell = 1) => {
    const f = frame(t), r = radius(t) * shell * (1 + .038 * Math.cos(theta * 5));
    return f.center.clone().addScaledVector(f.normal, Math.cos(theta) * r).addScaledVector(f.binormal, Math.sin(theta) * r);
  };
  const sideMaterial = keep(new THREE.MeshStandardMaterial({ color: 0xf1e1b6, bumpMap: skin, bumpScale: .018, roughness: .82 }));
  const capMaterial = keep(new THREE.MeshStandardMaterial({ map: raw, roughness: .84, side: THREE.DoubleSide }));
  capMaterial.onBeforeCompile = shader => {
    shader.uniforms.cookedTexture = { value: crisp }; shader.uniforms.cookingProgress = cookUniform;
    shader.fragmentShader = 'uniform sampler2D cookedTexture;\nuniform float cookingProgress;\n' + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
      #ifdef USE_MAP
        vec4 rawColor = texture2D(map, vMapUv);
        vec4 cookedColor = texture2D(cookedTexture, vMapUv);
        diffuseColor *= mix(rawColor, cookedColor, cookingProgress);
      #endif
    `);
  };
  capMaterial.customProgramCacheKey = () => 'koricho-banana-surface-v3';

  const slices = [];
  const count = 11, radial = 56, lengthRows = 5;
  for (let i = 0; i < count; i++) {
    const start = .055 + i / count * .89, end = .055 + (i + 1) / count * .89;
    const f = frame((start + end) / 2), inverse = f.quaternion.clone().invert();
    const group = new THREE.Group(); group.position.copy(f.center); group.quaternion.copy(f.quaternion); root.add(group);
    const positions = [], uvs = [], indices = [];
    for (let row = 0; row <= lengthRows; row++) for (let col = 0; col <= radial; col++) {
      const t = THREE.MathUtils.lerp(start, end, row / lengthRows), theta = col / radial * Math.PI * 2;
      const p = surface(t, theta, .9).sub(f.center).applyQuaternion(inverse);
      positions.push(p.x, p.y, p.z); uvs.push(col / radial, row / lengthRows);
    }
    for (let row = 0; row < lengthRows; row++) for (let col = 0; col < radial; col++) {
      const a = row * (radial + 1) + col, b = a + radial + 1;
      indices.push(a, b, b + 1, a, b + 1, a + 1);
    }
    const geometry = keep(new THREE.BufferGeometry());
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geometry.setIndex(indices); geometry.computeVertexNormals();
    group.add(new THREE.Mesh(geometry, sideMaterial));
    let front;
    for (const [t, reverse] of [[start, false], [end, true]]) {
      const facePositions = [], faceUvs = [.5, .5], faceIndices = [];
      const center = curve.getPoint(t).sub(f.center).applyQuaternion(inverse);
      facePositions.push(center.x, center.y, center.z);
      for (let j = 0; j <= radial; j++) {
        const theta = j / radial * Math.PI * 2;
        const p = surface(t, theta, .9).sub(f.center).applyQuaternion(inverse);
        facePositions.push(p.x, p.y, p.z); faceUvs.push(.5 + Math.cos(theta) * .49, .5 + Math.sin(theta) * .49);
        if (j < radial) faceIndices.push(0, reverse ? j + 2 : j + 1, reverse ? j + 1 : j + 2);
      }
      const faceGeometry = keep(new THREE.BufferGeometry());
      faceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(facePositions, 3));
      faceGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(faceUvs, 2)); faceGeometry.setIndex(faceIndices); faceGeometry.computeVertexNormals();
      group.add(new THREE.Mesh(faceGeometry, capMaterial));
      if (!reverse) front = center;
    }
    slices.push({ group, start: f.center, quaternion: f.quaternion, front, frontNormal:frame(start).axis.applyQuaternion(inverse) });
  }

  if (document.fonts) await document.fonts.ready;
  const selected = [2, 5, 8];
  const lines = [['Good', 'ingredients.'], ['A different', 'process.'], ['One big', 'crunch.']];
  selected.forEach((index, i) => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 768;
    const ctx = canvas.getContext('2d'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '650 82px Grotesque, Arial';
    ctx.fillStyle = 'rgba(255,239,182,.65)'; lines[i].forEach((line, j) => ctx.fillText(line, 384, 345 + j * 82 + 2));
    ctx.fillStyle = 'rgba(61,33,8,.96)'; lines[i].forEach((line, j) => ctx.fillText(line, 384, 345 + j * 82));
    const texture = keep(new THREE.CanvasTexture(canvas)); texture.colorSpace = THREE.SRGBColorSpace;
    const material = keep(new THREE.MeshStandardMaterial({ map: texture, transparent: true, opacity: 0, roughness: .95, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    const label = new THREE.Mesh(keep(new THREE.PlaneGeometry(.56, .56)), material);
    label.position.copy(slices[index].front).addScaledVector(slices[index].frontNormal,.008);
    label.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),slices[index].frontNormal); label.renderOrder = 2;
    slices[index].group.add(label); slices[index].letterMaterial = material;
  });

  // A quiet contact shadow gives depth without an expensive continuously updated shadow map.
  const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 128;
  const shadowCtx = shadowCanvas.getContext('2d'), gradient = shadowCtx.createRadialGradient(64,64,2,64,64,64);
  gradient.addColorStop(0,'rgba(91,62,21,.17)'); gradient.addColorStop(1,'rgba(91,62,21,0)');
  shadowCtx.fillStyle = gradient; shadowCtx.fillRect(0,0,128,128);
  const shadow = new THREE.Mesh(keep(new THREE.PlaneGeometry(3.0,.35)), keep(new THREE.MeshBasicMaterial({ map: keep(new THREE.CanvasTexture(shadowCanvas)), transparent: true, depthWrite: false })));
  shadow.position.set(.1,-2.27,-.2); scene.add(shadow);
  const cream = new THREE.Color(0xf1e1b6), gold = new THREE.Color(0xd7a848);
  const identity = new THREE.Quaternion();

  function render() {
    if (disposed) return;
    root.visible = state.reveal > 0;
    root.rotation.set(.12 * (1 - state.gather), state.turn, -.18 * (1 - state.spread));
    root.position.y = mobile() ? -.1 : .1;
    cookUniform.value = state.cook; sideMaterial.color.copy(cream).lerp(gold, state.cook);
    slices.forEach((slice, i) => {
      const { group } = slice, chosen = selected.indexOf(i);
      const spread = new THREE.Vector3((i - 5) * .53, Math.sin(i / 10 * Math.PI) * .6 - .25, (i % 2) * .07);
      group.position.copy(slice.start).lerp(spread, state.spread);
      group.quaternion.copy(slice.quaternion).slerp(identity, state.spread);
      if (state.gather > 0) {
        const end = chosen < 0 ? new THREE.Vector3((i - 5) * 1.5, 3 + Math.abs(i - 5) * .15, -4) : mobile()
          ? new THREE.Vector3([-1.1,1.1,0][chosen], [1.5,0,-1.7][chosen], [.05,.15,.1][chosen])
          : new THREE.Vector3([-2.2,0,2.2][chosen], [.2,-.1,.15][chosen], [.05,.2,.1][chosen]);
        group.position.lerp(end, state.gather);
        const finalRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler([-.1,.1,-.08][Math.max(chosen,0)], [.15,-.08,-.16][Math.max(chosen,0)], [-.2,.08,.22][Math.max(chosen,0)]));
        group.quaternion.slerp(finalRotation,state.gather);
      }
      const scale = chosen < 0 ? 1 - state.gather * .85 : 1 + state.gather * 2.75;
      group.scale.set(scale * state.reveal, scale * state.reveal, (1 - state.cook * .77) * state.reveal);
      group.visible = chosen >= 0 || state.gather < .99;
      if (slice.letterMaterial) slice.letterMaterial.opacity = state.letters;
    });
    shadow.scale.x = 1 + state.gather * 1.25; shadow.material.opacity = 1 - state.leave * .65;
    renderer.render(scene,camera);
  }
  function resize() {
    const width = stage.clientWidth, height = stage.clientHeight;
    renderer.setSize(width,height,false); camera.aspect = width/height;
    camera.position.set(0,0,mobile()?9.5:8.7); camera.lookAt(0,0,0); camera.updateProjectionMatrix(); render();
  }
  resize();
  await renderer.compileAsync(scene,camera);
  stage.append(renderer.domElement); stage.classList.add('has-webgl'); stage.dataset.renderer='webgl';
  const resizeObserver=new ResizeObserver(resize); resizeObserver.observe(stage);
  const frameIntervals=[];let lastTick=0;
  const timeline=gsap.timeline({paused:true,onUpdate:()=>{
    const now=performance.now();if(lastTick&&now-lastTick>4&&now-lastTick<120)frameIntervals.push(now-lastTick);lastTick=now;render();
  },onComplete:()=>{
    if(frameIntervals.length){const sorted=[...frameIntervals].sort((a,b)=>a-b);stage.dataset.frameMedianMs=sorted[Math.floor(sorted.length/2)].toFixed(1);stage.dataset.frameSamples=String(sorted.length);}
    onComplete();
  }});
  const shot = document.createElement('div');
  shot.className = 'banana-shot';
  const whole = new Image();
  whole.src = './assets/banana-whole.webp';
  whole.alt = '';
  const strips = Array.from({length: 7}, (_, index) => {
    const strip = new Image();
    strip.src = './assets/banana-peeled.webp';
    strip.alt = '';
    const left = index * 100 / 7, right = (index + 1) * 100 / 7;
    strip.style.clipPath = `polygon(${left-3}% 0,${right-3}% 0,${right+3}% 100%,${left+3}% 100%)`;
    return strip;
  });
  await Promise.all([whole, ...strips].map(image => image.decode()));
  const slicesLayer = document.createElement('div');
  slicesLayer.style.cssText = 'position:absolute;inset:0;clip-path:inset(0 0 0 100%)';
  slicesLayer.append(...strips);
  shot.append(whole, slicesLayer);
  stage.append(shot);
  const distance = Math.min(stage.clientWidth * .09, 65);
  timeline.call(()=>onStep(0,'The peel slips back.'))
    .fromTo(whole,{clipPath:'inset(0% 0% 0% 0%)'},{clipPath:'inset(0% 100% 0% 0%)',duration:.72,ease:'sine.inOut'},.18)
    .fromTo(slicesLayer,{clipPath:'inset(0% -40% 0% 100%)'},{clipPath:'inset(-40% -40% -40% -40%)',duration:.72,ease:'sine.inOut'},.18)
    .call(()=>onStep(1,'One cut follows the next.'),null,.92)
    .to(strips,{x:i=>(i-3)*distance/3,y:i=>Math.sin(i*1.5)*8,rotation:i=>(i-3)*1.7,duration:.67,stagger:.055,ease:'power2.out'},.92)
    .to(shot,{opacity:0,scale:1.035,duration:.45,ease:'sine.inOut'},1.68)
    .to(state,{reveal:1,duration:.48,ease:'sine.inOut'},1.68)
    .call(()=>onStep(2,'The slices turn golden.'),null,2.06)
    .to(state,{cook:1,gather:1,duration:.98,ease:'power2.inOut'},2.05)
    .call(()=>onStep(3,'Good ingredients. A different process. One big crunch.'),null,2.92)
    .to(state,{letters:1,duration:.44,ease:'sine.out'},2.92);
  if(reduced()) timeline.progress(1).pause(); else render();
  return {
    timeline, render,
    dispose() { disposed=true; shot.remove(); timeline.kill(); resizeObserver.disconnect(); renderer.dispose(); resources.forEach(r=>r.dispose?.()); renderer.domElement.remove(); if(!stage.querySelector('canvas'))stage.classList.remove('has-webgl'); }
  };
}
