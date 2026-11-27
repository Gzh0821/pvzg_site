import { plantAnimations } from './plant-animations';

const assetRoot = '/assets/almanac-animation';

async function readAsset(url, signal, format) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response[format]();
}

export async function mountPlantAnimation(host, code, signal, onAction) {
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
      width: 480, height: 350, resolution: Math.min(window.devicePixelRatio || 1, 2),
      preference: 'webgl', backgroundAlpha: 0, antialias: true, autoStart: false,
    });
    signal.throwIfAborted();
    factory = new dragonBones.PixiFactory(undefined, false);
    texture = new PIXI.ImageSource({ resource: image });
    factory.parseDragonBonesData(skeleton, code);
    factory.parseTextureAtlasData(atlas, texture, code);
    armature = factory.buildArmature(config.armature, code, '', code);
    const display = armature.display;
    const [x, y, width, height] = config.bounds;
    const [centerX, centerY] = config.idleCenter;
    // Fit every costume and action around the same resting position.
    const halfWidth = Math.max(centerX - x, x + width - centerX);
    const halfHeight = Math.max(centerY - y, y + height - centerY);
    const scale = Math.min(230 / halfWidth, 167.5 / halfHeight);
    display.scale.set(scale);
    display.position.set(240 - centerX * scale, 175 - centerY * scale);
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
