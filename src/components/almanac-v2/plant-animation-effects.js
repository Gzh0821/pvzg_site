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

// These armatures share the plant's already loaded atlas and manual clock.
export function createPlantEffects({ PIXI, dragonBones, factory, code, plant, tracks, applyCostume }) {
  const layer = new PIXI.Container();
  layer.position.copyFrom(plant.display.position);
  layer.scale.copyFrom(plant.display.scale);
  plant.display.parent.addChild(layer);
  const fps = plant.armatureData.frameRate;
  const active = [];
  let pending = [];
  let time = 0;

  function dispose(rig) {
    layer.removeChild(rig.display);
    rig.dispose();
  }

  function clear() {
    for (const { rig } of active) dispose(rig);
    if (active.length) dragonBones.PixiFactory.advanceTime(0);
    active.length = 0;
    pending = [];
    plant.display.visible = true;
    time = 0;
  }

  function advance(dt) {
    const previous = time;
    time += dt;
    while (pending.length && pending[0].frame / fps <= time + 1e-8) {
      const cue = pending.shift();
      const rig = factory.buildArmature(cue.armature, code, '', code);
      const state = rig.animation.play(cue.clip, cue.frames ? 0 : 1);
      if (cue.armature === plant.name) applyCostume(rig);
      rig.display.scale.set(cue.scale);
      layer.addChild(rig.display);
      active.push({ cue, rig, duration: cue.frames ? cue.frames / fps : state.totalTime });
    }
    let disposed = false;
    for (let i = active.length - 1; i >= 0; i--) {
      const { cue, rig, duration } = active[i];
      const start = cue.frame / fps;
      const age = Math.max(0, time - start);
      if (age + 1e-8 >= duration) {
        dispose(rig);
        active.splice(i, 1);
        disposed = true;
        continue;
      }
      rig.advanceTime(Math.max(0, time - Math.max(previous, start)));
      const progress = age / duration;
      rig.display.position.set(
        cue.x + ((cue.toX ?? cue.x) - cue.x) * progress,
        cue.y + ((cue.toY ?? cue.y) - cue.y) * progress - (cue.arc ?? 0) * 4 * progress * (1 - progress),
      );
    }
    if (disposed) dragonBones.PixiFactory.advanceTime(0);
    plant.display.visible = !active.some(({ cue }) => cue.hidePlant);
  }

  function play(action, formTracks) {
    clear();
    pending = [...(formTracks?.[action] ?? tracks[action] ?? [])].sort((a, b) => a.frame - b.frame);
    advance(0);
  }

  function updateCostume() {
    for (const { rig, cue } of active) {
      if (cue.armature === plant.name) applyCostume(rig);
    }
  }

  return { play, advance, clear, updateCostume, get playing() { return pending.length > 0 || active.length > 0; } };
}
