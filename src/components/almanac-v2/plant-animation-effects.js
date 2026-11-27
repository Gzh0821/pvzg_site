import lightAtlas from './assets/plant-food-light/atlas.json';
import lightSkeleton from './assets/plant-food-light/skeleton.json';

export function createPlantFoodLight(PIXI, factory, stage, image, position, scale) {
  const key = 'plant_food_light';
  const texture = new PIXI.ImageSource({ resource: image });
  factory.parseDragonBonesData(lightSkeleton, key);
  factory.parseTextureAtlasData(lightAtlas, texture, key);
  const rig = factory.buildArmature(key, key, '', key);
  rig.display.position.copyFrom(position);
  rig.display.scale.set(scale);
  rig.display.visible = false;
  stage.addChildAt(rig.display, 0);

  function play(clip) {
    rig.animation.reset();
    const playback = rig.animation.animationConfig;
    playback.animation = clip;
    playback.actionEnabled = false;
    playback.playTimes = clip === 'Idle' ? 0 : 1;
    playback.fadeInTime = 0;
    rig.animation.playConfig(playback);
    rig.advanceTime(0);
  }

  return {
    start() { rig.display.visible = true; play('Start'); },
    end() { if (rig.display.visible) play('End'); },
    clear() { rig.display.visible = false; },
    advance(dt) {
      if (!rig.display.visible) return;
      rig.advanceTime(dt);
      if (!rig.animation.isCompleted) return;
      if (rig.animation.lastAnimationName === 'Start') play('Idle');
      else rig.display.visible = false;
    },
    destroy() {
      stage.removeChild(rig.display);
      rig.dispose();
      texture.destroy();
    },
  };
}

// Each cue uses its own clock so nested rigs start at the scheduled frame.
export function createPlantEffects({ PIXI, dragonBones, factory, screen, code, plant, tracks, applyCostume }) {
  const layer = new PIXI.Container();
  layer.position.copyFrom(plant.display.position);
  layer.scale.copyFrom(plant.display.scale);
  plant.display.parent.addChild(layer);
  const fps = plant.armatureData.frameRate;
  const active = [];
  let pending = [];
  let time = 0;

  function dispose(rig, mask) {
    if (mask) {
      rig.display.mask = null;
      mask.destroy();
    }
    layer.removeChild(rig.display);
    rig.dispose();
  }

  function clear() {
    for (const { rig, mask } of active) dispose(rig, mask);
    active.length = 0;
    pending = [];
    plant.display.visible = true;
    time = 0;
  }

  function advance(dt) {
    if (!active.length && !pending.length) return;
    const previous = time;
    time += dt;
    while (pending.length && pending[0].frame / fps <= time + 1e-8) {
      const cue = pending.shift();
      const rig = factory.buildArmature(cue.armature, cue.pack ?? code);
      const clock = new dragonBones.WorldClock();
      clock.add(rig);
      const state = rig.animation.play(cue.clip, cue.frames ? 0 : 1);
      if (cue.armature === plant.name) applyCostume(rig);
      rig.display.scale.set(cue.scaleX ?? cue.scale, cue.scaleY ?? cue.scale);
      rig.display.angle = cue.angle ?? 0;
      layer.addChild(rig.display);
      let mask;
      if (cue.clipWidth !== undefined) {
        const bounds = rig.armatureData.aabb;
        mask = new PIXI.Graphics().rect(0, bounds.y, cue.clipWidth, bounds.height).fill(0xffffff);
        mask.scale.copyFrom(rig.display.scale);
        mask.angle = rig.display.angle;
        layer.addChild(mask);
        rig.display.mask = mask;
      }
      const socket = cue.bone ? plant.getBone(cue.bone).globalTransformMatrix : null;
      active.push({ cue, rig, clock, mask, x: socket?.tx ?? 0, y: socket?.ty ?? 0, duration: cue.frames ? cue.frames / fps : state.totalTime });
    }
    for (let i = active.length - 1; i >= 0; i--) {
      const { cue, rig, clock, mask, x, y, duration } = active[i];
      const start = cue.frame / fps;
      const age = Math.max(0, time - start);
      if (age + 1e-8 >= duration) {
        dispose(rig, mask);
        active.splice(i, 1);
        continue;
      }
      clock.advanceTime(Math.max(0, time - Math.max(previous, start)));
      const progress = age / duration;
      rig.display.position.set(
        x + cue.x + ((cue.toX ?? cue.x) - cue.x) * progress,
        y + cue.y + ((cue.toY ?? cue.y) - cue.y) * progress - (cue.arc ?? 0) * 4 * progress * (1 - progress),
      );
      if (mask) mask.position.copyFrom(rig.display.position);
    }
    plant.display.visible = !active.some(({ cue }) => cue.hidePlant);
  }

  function play(action, formTracks) {
    clear();
    const cues = formTracks?.[action] ?? tracks[action] ?? [];
    const rightEdge = layer.toLocal({ x: screen.width, y: 0 }).x;
    const resolveX = x => typeof x === 'object' ? x.rightEdgeFraction * rightEdge : x;
    pending = cues.map(cue => ({ ...cue, x: resolveX(cue.x), toX: resolveX(cue.toX) }))
      .sort((a, b) => a.frame - b.frame);
    advance(0);
  }

  function updateCostume() {
    for (const { rig, cue } of active) {
      if (cue.armature === plant.name) applyCostume(rig);
    }
  }

  return {
    play, advance, clear, updateCostume,
    get holdsAction() {
      return pending.some(cue => !cue.projectile) || active.some(({ cue }) => !cue.projectile);
    },
  };
}
