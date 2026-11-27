import lightTextureUrl from './assets/plant-food-light/texture.png';
import { createPlantEffects, createPlantFoodLight } from './plant-animation-effects';
import { formActions, plantForms } from './plant-forms';
import { plantAnimations } from './plant-animations';

// Almanac.prefab uses a 555 × 470 backdrop. plantDisplayer is 133.578 units
// below its center at 3× scale. These plant DIS prefabs have a 0.5× root.
const gameFrame = { width: 555, height: 470, originY: -133.578, displayScale: 3, prefabScale: 0.5 };

const assetRoot = '/assets/almanac-animation';

async function readAsset(url, signal, format) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response[format]();
}

async function readImage(url, signal) {
  const png = await readAsset(url, signal, 'blob');
  const image = new Image();
  const objectUrl = URL.createObjectURL(png);
  try {
    image.src = objectUrl;
    await image.decode();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
  return image;
}

export async function mountPlantAnimation(host, code, displayOffset, signal, onAction, onForm, onFoodUpgrade) {
  const folder = `${assetRoot}/${code}`;
  const [{ PIXI, dragonBones }, skeleton, atlas, image, lightImage] = await Promise.all([
    import('./vendor/pixi-8.9.2-dragonbones-5.7.mjs'),
    readAsset(`${folder}/skeleton.json`, signal, 'json'),
    readAsset(`${folder}/atlas.json`, signal, 'json'),
    readImage(`${folder}/texture.png`, signal),
    readImage(lightTextureUrl, signal),
  ]);
  signal.throwIfAborted();

  const config = plantAnimations[code];
  const foodSlots = new Map();
  const app = new PIXI.Application();
  let factory, armature, probe, texture, observer, resizeObserver;
  let frame;
  const forms = plantForms(code);
  let formIndex = 0;
  let form = forms[0];
  let actions = formActions(config, form);
  let jellySpikes;
  let hasFoodAppearance = false;
  let recovery;
  let costume = -1;
  let action = config.idle;
  let pendingClips = [];
  let secondsLeft = null;
  let effects, foodLight;

  function destroy() {
    observer?.disconnect();
    resizeObserver?.disconnect();
    effects?.clear();
    foodLight?.destroy();
    jellySpikes?.dispose();
    probe?.dispose();
    armature?.dispose();
    factory?.clear(true);
    if (factory) dragonBones.PixiFactory.advanceTime(0);
    if (app.renderer) app.destroy(true, { children: true });
    texture?.destroy();
  }

  function applyCostume(rig) {
    for (const slot of rig.getSlots()) {
      if (slot.name.includes('COS')) {
        slot.displayIndex = rig === probe || (costume >= 0 && slot.name.includes(`COS${costume}`)) ? 0 : -1;
      }
    }
    rig.advanceTime(0);
  }

  function startClip(rig, step, poseForm = form, upgraded = hasFoodAppearance) {
    const clip = typeof step === 'string' ? step : step?.clip ?? poseForm?.idle ?? config.idle;
    const size = step?.scale ?? poseForm?.scale ?? 1;
    rig.display.scale.set(gameFrame.displayScale * gameFrame.prefabScale * size);
    rig.animation.reset();
    const playback = rig.animation.animationConfig;
    playback.animation = clip;
    playback.playTimes = !step || step.seconds ? 0 : step.repeats ?? 1;
    if (step?.fromFrame !== undefined || step?.toFrame !== undefined) {
      const fps = rig.armatureData.frameRate;
      playback.position = (step.fromFrame ?? 0) / fps;
      const end = step.toFrame === undefined ? rig.animation.animations[clip].duration : step.toFrame / fps;
      playback.duration = end - playback.position;
    }
    if (rig === armature && step?.speed) playback.timeScale = step.speed;
    playback.fadeInTime = 0;
    // Root timeline actions can otherwise skip the preview's ending or idle.
    playback.actionEnabled = false;
    const state = rig.animation.playConfig(playback);
    for (const [name, index] of foodSlots) {
      const slot = rig.getSlot(name);
      slot.displayIndex = (upgraded || step?.foodAppearance) ? index : slot.slotData.displayIndex;
    }
    applyCostume(rig);
    for (const slotName of config.hiddenSlots ?? []) {
      const slot = rig.getSlot(slotName);
      if (slot) slot.displayIndex = -1;
    }
    if (poseForm) {
      for (const slot of rig.getSlots()) {
        if (poseForm.powered !== undefined && slot.displayFrameCount > 1 && slot.name.includes('_DARK')) slot.displayIndex = Number(poseForm.powered);
        if (poseForm.heads && /_HEAD[0-4]$/.test(slot.name)) slot.displayIndex = Number(slot.name.at(-1)) < poseForm.heads ? 0 : -1;
        if (poseForm.jelly !== undefined && slot.name.startsWith('JELLY')) slot.displayIndex = poseForm.jelly ? 0 : -1;
      }
      rig.advanceTime(0);
    }
    return state;
  }

  function measureFrame() {
    // Measure in card coordinates once. All outfits, forms and actions share this camera.
    const bodyBounds = new PIXI.Bounds();
    const effectBounds = new PIXI.Bounds();
    const pose = new PIXI.Bounds();
    const idlePose = new PIXI.Bounds();
    let poseWidth = 0, poseHeight = 0;
    const extras = [];

    const parts = probe.getSlots().map(slot => ({
      slot, body: false, rect: new PIXI.Bounds(),
    }));
    const visible = slot => slot.displayIndex >= 0 && slot.display?.visible && slot.display.alpha > 0;
    function recordPose(isRest, idleBounds) {
      pose.clear();
      extras.length = 0;
      for (const { slot, body, rect } of parts) {
        if (!visible(slot)) continue;
        slot.display.getBounds(false, rect);
        if (body) pose.addBounds(rect);
        else extras.push(rect);
      }
      const anchor = pose.isValid ? pose : idleBounds;
      if (config.framing === 'flight') {
        if (isRest) idlePose.addBounds(anchor);
        poseWidth = Math.max(poseWidth, anchor.width);
        poseHeight = Math.max(poseHeight, anchor.height);
      }
      bodyBounds.addBounds(anchor);
      effectBounds.addBounds(anchor);
      for (const rect of extras) {
        if (rect.minX <= anchor.maxX && rect.maxX >= anchor.minX &&
            rect.minY <= anchor.maxY && rect.maxY >= anchor.minY) effectBounds.addBounds(rect);
      }
    }

    function measureForm(poseForm, upgraded) {
      startClip(probe, undefined, poseForm, upgraded);
      const idleBounds = probe.display.getBounds();
      for (const part of parts) {
        const { slot } = part;
        part.body = !slot.name.includes('COS') &&
          (config.bodySlots?.includes(slot.name) || foodSlots.has(slot.name) || visible(slot));
      }
      const steps = Object.values(formActions(config, poseForm)).filter(Boolean).flat();
      steps.push(...Object.values(config.recoverAfter ?? {}).flat());
      if (poseForm?.enter) steps.push(poseForm.enter);
      for (const step of [undefined, ...steps]) {
        const state = startClip(probe, step, poseForm, upgraded);
        const duration = Math.min(state.totalTime, step?.seconds ?? Infinity);
        const count = Math.ceil(duration * probe.armatureData.frameRate);
        const isRest = !step && poseForm === forms[0] && !upgraded;
        recordPose(isRest, idleBounds);
        // Include both sides of display switches and the interpolation between keys.
        const dt = duration / count;
        const epsilon = 1e-6;
        const deltas = [epsilon, dt / 2 - epsilon, dt / 2 - epsilon, epsilon];
        for (let i = 0; i < count; i++) {
          for (const delta of deltas) {
            probe.advanceTime(delta);
            recordPose(isRest, idleBounds);
          }
        }
      }
    }
    for (const poseForm of forms.length ? forms : [undefined]) {
      measureForm(poseForm, false);
      if (foodSlots.size) measureForm(poseForm, true);
    }
    return { bodyBounds, effectBounds,
      center: config.framing === 'flight' ? { idlePose, poseWidth, poseHeight } : undefined };
  }

  function layout() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    if (app.screen.width !== w || app.screen.height !== h) app.renderer.resize(w, h);
    const { bodyBounds, effectBounds, center } = frame ??= measureFrame();
    const margin = 6;
    const scale = Math.min(w / gameFrame.width, h / gameFrame.height,
      w / ((center?.poseWidth ?? bodyBounds.width) + 2 * margin),
      h / ((center?.poseHeight ?? bodyBounds.height) + 2 * margin));
    let x, y;
    if (center) {
      const { idlePose } = center;
      x = (w - (idlePose.minX + idlePose.maxX) * scale) / 2;
      y = (h - (idlePose.minY + idlePose.maxY) * scale) / 2;
    } else {
      // Use spare space for effects without letting a large blast shrink the plant.
      const bounds = (effectBounds.width + 2 * margin) * scale <= w &&
        (effectBounds.height + 2 * margin) * scale <= h ? effectBounds : bodyBounds;
      const offset = (size, nativeSize, min, max) => Math.max((margin - min) * scale,
        Math.min((size - nativeSize * scale) / 2, size - (max + margin) * scale));
      x = offset(w, gameFrame.width, bounds.minX, bounds.maxX);
      y = offset(h, gameFrame.height, bounds.minY, bounds.maxY) - h * (config.previewLift ?? 0);
    }
    app.stage.scale.set(scale);
    app.stage.position.set(x, y);
  }

  function setCostume(index) {
    costume = index;
    applyCostume(armature);
    effects?.updateCostume();
  }

  function selectForm(index) {
    effects?.clear();
    recovery = undefined;
    formIndex = index;
    form = forms[index];
    actions = formActions(config, form);
    if (jellySpikes) jellySpikes.display.visible = Boolean(form.jelly);
    onForm(index);
  }

  function setForm(index) {
    foodLight.clear();
    selectForm(index);
    action = 'Form';
    onAction(action);
    pendingClips = form.enter ? [form.enter] : [];
    playNextClip();
  }

  function playNextClip() {
    let step = pendingClips.shift();
    const result = !step ? form?.afterAction?.[action] : undefined;
    if (!step && action === 'Food') foodLight.end();
    if (!step && config.recoverAfter?.[action]) {
      pendingClips = [...config.recoverAfter[action]];
      step = pendingClips.shift();
      action = 'Recover';
      onAction(action);
    }
    if (result) {
      selectForm(result.index);
      if (result.recovery) recovery = { ...result.recovery };
    }
    if (step?.foodAppearance && !hasFoodAppearance) {
      hasFoodAppearance = true;
      onFoodUpgrade(true);
    }
    if (!step) {
      action = config.idle;
      onAction(action);
    }
    secondsLeft = step?.seconds ?? null;
    startClip(armature, step);
  }

  function resetFoodUpgrade() {
    hasFoodAppearance = false;
    onFoodUpgrade(false);
    play(config.idle);
  }

  function play(name) {
    if (name === 'Food') {
      recovery = undefined;
      foodLight.start();
    } else {
      foodLight.clear();
    }
    effects?.play(name, form?.effects);
    action = name;
    const clips = actions[name];
    pendingClips = Array.isArray(clips) ? [...clips] : clips ? [clips] : [];
    if (clips) onAction(name);
    playNextClip();
  }

  try {
    await app.init({
      width: gameFrame.width, height: gameFrame.height, resolution: Math.min(window.devicePixelRatio || 1, 2),
      preference: 'webgl', backgroundAlpha: 0, antialias: true, autoStart: false,
    });
    signal.throwIfAborted();
    factory = new dragonBones.PixiFactory(undefined, false);
    texture = new PIXI.ImageSource({ resource: image });
    factory.parseDragonBonesData(skeleton, code);
    factory.parseTextureAtlasData(atlas, texture, code);
    // Use the rig's own atlas. An override would also bind textures to same-named child armatures.
    armature = factory.buildArmature(config.armature, code);
    if (config.foodSlots) {
      for (const { name } of armature.getSlots()) {
        const index = typeof config.foodSlots === 'function' ? config.foodSlots(name) : config.foodSlots[name];
        if (index !== undefined) foodSlots.set(name, index);
      }
    }
    const display = armature.display;
    const { width, height, originY, displayScale, prefabScale } = gameFrame;
    const { x, y } = displayOffset ?? { x: 0, y: 0 };
    display.scale.set(displayScale * prefabScale);
    // Cocos positions increase upward, Pixi screen coordinates downward.
    const [bodyX, bodyY] = config.bodyOffset ?? [0, 0];
    display.position.set(
      width / 2 + (x + bodyX * prefabScale) * displayScale,
      height / 2 - originY - (y + bodyY * prefabScale) * displayScale,
    );
    probe = factory.buildArmature(config.armature, code);
    probe.display.scale.copyFrom(display.scale);
    probe.display.position.copyFrom(display.position);
    // foodLightPAR is a 0.7× prefab placed at the plant's tile, behind its body.
    foodLight = createPlantFoodLight(PIXI, factory, app.stage, lightImage, display.position, displayScale * 0.7);
    if (forms.some(entry => entry.jelly)) {
      jellySpikes = factory.buildArmature('_spikes', code, '', code);
      jellySpikes.display.position.copyFrom(display.position);
      jellySpikes.display.scale.copyFrom(display.scale);
      jellySpikes.animation.play('Idle', 0);
      jellySpikes.display.visible = false;
      app.stage.addChild(jellySpikes.display);
    }
    app.stage.addChild(display);
    if (config.effects) {
      effects = createPlantEffects({ PIXI, dragonBones, factory, code, plant: armature, tracks: config.effects, applyCostume });
    }
    host.appendChild(app.canvas);
    layout();
    play(config.idle);
    app.ticker.add(ticker => {
      const dt = Math.min(ticker.deltaMS / 1000, 0.1);
      armature.advanceTime(dt);
      foodLight.advance(dt);
      if (jellySpikes?.display.visible) jellySpikes.advanceTime(dt);
      if (recovery) {
        recovery.seconds -= dt;
        if (recovery.seconds <= 0) {
          setForm(recovery.index);
          return;
        }
      }
      if (action === config.idle) return;
      effects?.advance(dt);
      if (secondsLeft !== null) secondsLeft = Math.max(0, secondsLeft - dt);
      const done = secondsLeft === null ? armature.animation.isCompleted : secondsLeft === 0;
      if (done && (pendingClips.length || !effects?.playing)) playNextClip();
    });
    observer = new IntersectionObserver(([entry]) => {
      if (signal.aborted) return;
      if (entry.isIntersecting) app.start();
      else app.stop();
    });
    observer.observe(host);
    resizeObserver = new ResizeObserver(layout);
    resizeObserver.observe(host);
    app.render();
    signal.addEventListener('abort', destroy, { once: true });
    return { play, setCostume, setForm, resetFoodUpgrade };
  } catch (error) {
    destroy();
    throw error;
  }
}
