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
  let secondsLeft = 0;

  function destroy() {
    observer?.disconnect();
    resizeObserver?.disconnect();
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
      body: slot.name.includes('COS') || Object.hasOwn(config.foodSlots ?? {}, slot.name) || (slot.displayIndex >= 0 && slot.display?.visible),
      rect: new PIXI.Bounds(),
    }));
    const idleBounds = probe.display.getBounds();
    const bodyBounds = new PIXI.Bounds();
    const effectBounds = new PIXI.Bounds();
    const pose = new PIXI.Bounds();
    const extras = [];

    function recordPose() {
      pose.clear();
      extras.length = 0;
      for (const { slot, body, rect } of parts) {
        if (!visible(slot)) continue;
        slot.display.getBounds(false, rect);
        if (body) pose.addBounds(rect);
        else extras.push(rect);
      }
      const anchor = pose.isValid ? pose : idleBounds;
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
      recordPose();
      // A throwing hand can change displays at a keyframe. Measure both
      // sides of that switch as well as the interpolated pose between keys.
      const dt = duration / count;
      const epsilon = 1e-6;
      const deltas = [epsilon, dt / 2 - epsilon, dt / 2 - epsilon, epsilon];
      for (let frame = 0; frame < count; frame++) {
        for (const delta of deltas) {
          probe.advanceTime(delta);
          recordPose();
        }
      }
    }
    const frame = { bodyBounds, effectBounds };
    frames.set(costume, frame);
    return frame;
  }

  function layout() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    if (app.screen.width !== w || app.screen.height !== h) app.renderer.resize(w, h);
    const { bodyBounds, effectBounds } = measureFrame();
    const margin = 6;
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
    layout();
  }

  function playNextClip() {
    const step = pendingClips.shift();
    if (!step) {
      action = config.idle;
      onAction(action);
    }
    secondsLeft = step?.seconds ?? 0;
    startClip(armature, step);
  }

  function play(name) {
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
    host.appendChild(app.canvas);
    layout();
    play(config.idle);
    app.ticker.add(ticker => {
      const dt = Math.min(ticker.deltaMS / 1000, 0.1);
      armature.advanceTime(dt);
      if (action === config.idle) return;
      if (secondsLeft > 0) {
        secondsLeft -= dt;
        if (secondsLeft <= 0) playNextClip();
      } else if (armature.animation.isCompleted) {
        playNextClip();
      }
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
