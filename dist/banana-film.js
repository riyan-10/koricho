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
  const peelGroup = new THREE.Group(); root.add(peelGroup);
  const state = { peel: 0, spread: 0, cook: 0, gather: 0, letters: 0, leave: 0, turn: 0 };
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
  const skinMaterial = keep(new THREE.MeshStandardMaterial({ map: skin, roughness: .69, metalness: 0, side: THREE.FrontSide }));
  const insideMaterial = keep(new THREE.MeshStandardMaterial({ color: 0xf0dfac, roughness: .9, side: THREE.BackSide }));
  const peelMeshes = [];
  const rows = 64, columns = 8;
  for (let strip = 0; strip < 5; strip++) {
    const geometry = keep(new THREE.BufferGeometry());
    const positions = new Float32Array((rows + 1) * (columns + 1) * 3);
    const uvs = [], indices = [];
    for (let row = 0; row <= rows; row++) for (let col = 0; col <= columns; col++) {
      uvs.push((strip + col / columns) / 5, 1 - row / rows);
    }
    for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
      const a = row * (columns + 1) + col, b = a + columns + 1;
      indices.push(a, b, b + 1, a, b + 1, a + 1);
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geometry.setIndex(indices);
    const outside = new THREE.Mesh(geometry, skinMaterial), inside = new THREE.Mesh(geometry, insideMaterial);
    outside.frustumCulled = inside.frustumCulled = false;
    peelGroup.add(outside, inside); peelMeshes.push({ geometry, strip, positions });
  }

  // Cache both peel shapes once. Playback only interpolates typed arrays; it does not rebuild the model.
  const peelBase = curve.getPoint(.97);
  for (const ribbon of peelMeshes) {
    const closed = new Float32Array(ribbon.positions.length), opened = new Float32Array(ribbon.positions.length);
    const angle = (ribbon.strip + .5) / 5 * Math.PI * 2;
    for (let row=0; row<=rows; row++) {
      const t=row/rows, u=1-t, reach=Math.sin(u*Math.PI*.83)*1.25+u*.33;
      const x=peelBase.x+Math.cos(angle)*reach, y=peelBase.y-u*1.15+Math.sin(u*Math.PI)*.5, z=peelBase.z+Math.sin(angle)*reach;
      for(let col=0;col<=columns;col++) {
        const theta=(ribbon.strip+col/columns)/5*Math.PI*2, original=surface(t,theta), width=(col/columns-.5)*radius(t)*1.21;
        const offset=(row*(columns+1)+col)*3;
        closed.set([original.x,original.y,original.z],offset);
        opened.set([x-Math.sin(angle)*width,y+.04*Math.sin(col/columns*Math.PI),z+Math.cos(angle)*width],offset);
      }
    }
    ribbon.closed=closed; ribbon.opened=opened;
  }
  const tipMaterial = keep(new THREE.MeshStandardMaterial({ color: 0x806032, roughness: .95 }));
  const stem = new THREE.Mesh(keep(new THREE.CapsuleGeometry(.055, .18, 6, 12)), tipMaterial); peelGroup.add(stem);
  const bottom = new THREE.Mesh(keep(new THREE.SphereGeometry(.045, 12, 8)), tipMaterial);
  bottom.position.copy(curve.getPoint(.995)); peelGroup.add(bottom);

  const sideMaterial = keep(new THREE.MeshStandardMaterial({ color: 0xf4e8c9, roughness: .8 }));
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
  const cream = new THREE.Color(0xf4e8c9), gold = new THREE.Color(0xd7a848);
  const identity = new THREE.Quaternion();

  function updatePeel() {
    for (const { geometry, positions, closed, opened } of peelMeshes) {
      for (let row = 0; row <= rows; row++) {
        const t = row / rows;
        const p = THREE.MathUtils.smoothstep(THREE.MathUtils.clamp(state.peel * 1.4 - t * .4, 0, 1), 0, 1);
        for (let col = 0; col <= columns; col++) {
          const offset = (row * (columns + 1) + col) * 3;
          for(let axis=0;axis<3;axis++)positions[offset+axis]=closed[offset+axis]+(opened[offset+axis]-closed[offset+axis])*p;
        }
      }
      geometry.attributes.position.needsUpdate = true; geometry.computeVertexNormals();
    }
    const stemPoint = peelMeshes[0].positions;
    stem.position.set(stemPoint[12], stemPoint[13] + .09 * (1 - state.peel), stemPoint[14]);
    stem.rotation.z = -.35 - state.peel * 1.7;
  }
  let lastPeel = -1;
  function render() {
    if (disposed) return;
    if (state.peel !== lastPeel) { updatePeel(); lastPeel = state.peel; }
    peelGroup.visible = state.leave < .995;
    peelGroup.position.set(0, -state.leave * .7, -state.leave * .5); peelGroup.scale.setScalar(1 - state.leave * .5);
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
      group.scale.set(scale, scale, 1 - state.cook * .77);
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
  timeline.call(()=>onStep(0,'A real ingredient. Let’s get a little closer.'))
    .to(state,{turn:.18,duration:1.0,ease:'sine.inOut'},0)
    .to(state,{peel:1,duration:2.45,ease:'sine.inOut'},.55)
    .call(()=>onStep(1,'Peel back. Slice through. Every piece keeps its character.'),null,3.0)
    .to(state,{leave:1,duration:1.3,ease:'power2.inOut'},3.0)
    .to(state,{spread:1,turn:0,duration:1.8,ease:'power3.inOut'},3.15)
    .call(()=>onStep(2,'A warmer colour. A thinner slice. The Koricho crunch.'),null,4.8)
    .to(state,{cook:1,duration:1.45,ease:'sine.inOut'},4.8)
    .to(state,{gather:1,duration:1.65,ease:'power3.inOut'},5.75)
    .call(()=>onStep(3,'Good ingredients. A different process. One big crunch.'),null,7.25)
    .to(state,{letters:1,duration:1.0,ease:'sine.out'},7.25)
    .to({}, {duration:.6});
  if(reduced()) timeline.progress(1).pause(); else render();
  return {
    timeline, render,
    dispose() { disposed=true; timeline.kill(); resizeObserver.disconnect(); renderer.dispose(); resources.forEach(r=>r.dispose?.()); renderer.domElement.remove(); if(!stage.querySelector('canvas'))stage.classList.remove('has-webgl'); }
  };
}
