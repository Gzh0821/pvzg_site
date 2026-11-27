import { createPlantEffects } from './plant-animation-effects';
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

export async function mountPlantAnimation(host, code, displayOffset, signal, onAction) {
  const folder = `${assetRoot}/${code}`;
  const [{ PIXI, dragonBones }, skeleton, atlas, png] = await Promise.all([
    import('./vendor/pixi-8.9.2-dragonbones-5.7.mjs'),
    readAsset(`${folder}/skeleton.json`, signal, 'json'),
    readAsset(`${folder}/atlas.json`, signal, 'json'),
    readAsset(`${folder}/texture.png`, signal, 'blob'),
  ]);
  signal.throwIfAborted();
  const image = new Image();
  const objectUrl = URL.createObjectURL(png);
  try {
    image.src = objectUrl;
    await image.decode();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
  signal.throwIfAborted();

  const config = plantAnimations[code];
  const foodSlots = Object.entries(config.foodSlots ?? {});
  const app = new PIXI.Application();
  let factory, armature, probe, texture, observer, resizeObserver;
  const frames = new Map();
  let costume = -1;
  let action = config.idle;
  let pendingClips = [];
  let secondsLeft = null;
  let effects;
  let centeredView;

  function destroy() {
    observer?.disconnect();
    resizeObserver?.disconnect();
    effects?.clear();
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
        slot.displayIndex = costume >= 0 && slot.name.includes(`COS${costume}`) ? 0 : -1;
      }
    }
    rig.advanceTime(0);
  }

  function startClip(rig, step) {
    const clip = typeof step === 'string' ? step : step?.clip ?? config.idle;
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
    playback.fadeInTime = 0;
    // Root timeline actions can otherwise skip the preview's ending or idle.
    playback.actionEnabled = false;
    const state = rig.animation.playConfig(playback);
    for (const [name, index] of foodSlots) {
      const slot = rig.getSlot(name);
      slot.displayIndex = step?.foodAppearance ? index : slot.slotData.displayIndex;
    }
    applyCostume(rig);
    for (const slotName of config.hiddenSlots ?? []) {
      const slot = rig.getSlot(slotName);
      if (slot) slot.displayIndex = -1;
    }
    return state;
  }

  function clipSteps(name) {
    const clips = config.actions[name];
    return Array.isArray(clips) ? clips : [clips];
  }

  function measureFrame() {
    if (frames.has(costume)) return frames.get(costume);
    startClip(probe);
    // Follow the plant and equipped costume through the motion. Detached
    // projectiles can travel thousands of units beyond an almanac card.
    const visible = slot => slot.displayIndex >= 0 && slot.display?.visible && slot.display.alpha > 0;
    const parts = probe.getSlots().map(slot => ({
      slot,
      body: slot.name.includes('COS') || config.bodySlots?.includes(slot.name) ||
        Object.hasOwn(config.foodSlots ?? {}, slot.name) || (slot.displayIndex >= 0 && slot.display?.visible),
      rect: new PIXI.Bounds(),
    }));
    const idleBounds = probe.display.getBounds();
    const bodyBounds = new PIXI.Bounds();
    const effectBounds = new PIXI.Bounds();
    const pose = new PIXI.Bounds();
    const idlePose = new PIXI.Bounds();
    let poseWidth = 0, poseHeight = 0;
    const extras = [];

    function recordPose(isIdle) {
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
        if (isIdle) idlePose.addBounds(anchor);
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

    // Reserve one camera for idle and every action in this outfit.
    const steps = [undefined, ...Object.keys(config.actions).flatMap(clipSteps)];
    for (const step of steps) {
      const state = startClip(probe, step);
      const duration = Math.min(state.totalTime, step?.seconds ?? Infinity);
      const count = Math.ceil(duration * probe.armatureData.frameRate);
      recordPose(step === undefined);
      // A throwing hand can change displays at a keyframe. Measure both
      // sides of that switch as well as the interpolated pose between keys.
      const dt = duration / count;
      const epsilon = 1e-6;
      const deltas = [epsilon, dt / 2 - epsilon, dt / 2 - epsilon, epsilon];
      for (let frame = 0; frame < count; frame++) {
        for (const delta of deltas) {
          probe.advanceTime(delta);
          recordPose(step === undefined);
        }
      }
    }
    const frame = { bodyBounds, effectBounds };
    if (config.framing === 'flight') {
      frame.center = {
        idlePose, poseWidth, poseHeight,
        slots: parts.filter(part => part.body).map(part => armature.getSlot(part.slot.name)),
      };
    }
    frames.set(costume, frame);
    return frame;
  }

  // Keep the resting pose centered. During flight only pan as far as the
  // visible pose needs, without changing the scale or chasing emitted effects.
  function fitCurrentPose(returnFraction = 1) {
    if (!centeredView) return;
    const { slots, x, y, margin, pose, rect } = centeredView;
    pose.clear();
    for (const slot of slots) {
      if (slot.displayIndex < 0 || !slot.display?.visible || slot.display.alpha <= 0) continue;
      slot.display.getBounds(false, rect);
      pose.addBounds(rect);
    }
    const stage = app.stage;
    if (!pose.isValid) return;
    const dx = Math.max(margin - pose.minX, Math.min((x - stage.x) * returnFraction, app.screen.width - margin - pose.maxX));
    const dy = Math.max(margin - pose.minY, Math.min((y - stage.y) * returnFraction, app.screen.height - margin - pose.maxY));
    stage.position.set(stage.x + dx, stage.y + dy);
  }

  function layout() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    if (app.screen.width !== w || app.screen.height !== h) app.renderer.resize(w, h);
    const { bodyBounds, effectBounds, center } = measureFrame();
    const margin = 6;
    if (center) {
      const { idlePose, poseWidth, poseHeight, slots } = center;
      const scale = Math.min(w / gameFrame.width, h / gameFrame.height,
        w / (poseWidth + 2 * margin), h / (poseHeight + 2 * margin));
      const x = (w - (idlePose.minX + idlePose.maxX) * scale) / 2;
      const y = (h - (idlePose.minY + idlePose.maxY) * scale) / 2;
      centeredView = { slots, x, y, margin: margin * scale, pose: new PIXI.Bounds(), rect: new PIXI.Bounds() };
      app.stage.scale.set(scale);
      app.stage.position.set(x, y);
      fitCurrentPose();
      return;
    }
    const scale = Math.min(w / gameFrame.width, h / gameFrame.height,
      w / (bodyBounds.width + 2 * margin), h / (bodyBounds.height + 2 * margin));
    // Use spare space for effects without letting a large blast shrink the plant.
    const bounds = (effectBounds.width + 2 * margin) * scale <= w &&
      (effectBounds.height + 2 * margin) * scale <= h ? effectBounds : bodyBounds;
    const offset = (size, nativeSize, min, max) => Math.max((margin - min) * scale,
      Math.min((size - nativeSize * scale) / 2, size - (max + margin) * scale));
    app.stage.scale.set(scale);
    app.stage.position.set(offset(w, gameFrame.width, bounds.minX, bounds.maxX),
      offset(h, gameFrame.height, bounds.minY, bounds.maxY));
  }

  function setCostume(index) {
    costume = index;
    applyCostume(armature);
    effects?.updateCostume();
    layout();
  }

  function playNextClip() {
    const step = pendingClips.shift();
    if (!step) {
      action = config.idle;
      onAction(action);
    }
    secondsLeft = step?.seconds ?? null;
    startClip(armature, step);
    fitCurrentPose();
  }

  function play(name) {
    effects?.play(name);
    action = name;
    const clips = config.actions[name];
    pendingClips = clips ? [...clipSteps(name)] : [];
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
    armature = factory.buildArmature(config.armature, code, '', code);
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
    probe = factory.buildArmature(config.armature, code, '', code);
    probe.display.scale.copyFrom(display.scale);
    probe.display.position.copyFrom(display.position);
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
      if (action === config.idle) return;
      if (centeredView) fitCurrentPose(1 - Math.exp(-12 * dt));
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
    return { play, setCostume };
  } catch (error) {
    destroy();
    throw error;
  }
}
