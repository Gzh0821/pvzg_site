import { plantAnimations } from './plant-animations';

// Almanac.prefab uses a 555 × 470 backdrop. plantDisplayer is 133.578 units
// below its center at 3× scale. The six supported DIS prefabs have a 0.5× root.
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
  const app = new PIXI.Application();
  let factory, armature, texture, observer;
  let costume = -1;
  let action = config.idle;
  let foodRemaining = 0;

  function destroy() {
    observer?.disconnect();
    armature?.dispose();
    factory?.clear(true);
    if (factory) dragonBones.PixiFactory.advanceTime(0);
    if (app.renderer) app.destroy(true, { children: true });
    texture?.destroy();
  }

  function setCostume(index) {
    costume = index;
    for (const slot of armature.getSlots()) {
      if (slot.name.includes('COS')) {
        slot.displayIndex = index >= 0 && slot.name.includes(`COS${index}`) ? 0 : -1;
      }
    }
    armature.advanceTime(0);
  }

  function play(name) {
    action = name;
    foodRemaining = name === 'Food' ? config.foodLoopSeconds : 0;
    armature.animation.reset();
    armature.animation.play(name, name === config.idle || foodRemaining > 0 ? 0 : 1);
    setCostume(costume);
    onAction(name);
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
    display.position.set(width / 2 + x * displayScale, height / 2 - originY - y * displayScale);
    app.stage.addChild(display);
    host.appendChild(app.canvas);
    play(config.idle);
    app.ticker.add(ticker => {
      const dt = Math.min(ticker.deltaMS / 1000, 0.1);
      armature.advanceTime(dt);
      if (action === config.idle) return;
      foodRemaining -= dt;
      if (armature.animation.isCompleted || (action === 'Food' && config.foodLoopSeconds && foodRemaining <= 0)) {
        play(config.idle);
      }
    });
    observer = new IntersectionObserver(([entry]) => {
      if (signal.aborted) return;
      if (entry.isIntersecting) app.start();
      else app.stop();
    });
    observer.observe(host);
    app.render();
    signal.addEventListener('abort', destroy, { once: true });
    return { play, setCostume };
  } catch (error) {
    destroy();
    throw error;
  }
}
