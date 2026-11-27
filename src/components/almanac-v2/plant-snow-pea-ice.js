import baseUrl from './assets/snow-pea-ice/base.png';
import iceUrl from './assets/snow-pea-ice/ice.png';

export function loadSnowPeaIce(readImage, signal) {
  return Promise.all([baseUrl, iceUrl].map(url => readImage(url, signal)));
}

// SnowPeaFoodIcetilePAR grows a stretched base beneath a repeating ice sprite.
export function createSnowPeaIce(PIXI, stage, plantDisplay, images) {
  const textures = images.map(resource => new PIXI.Texture({ source: new PIXI.ImageSource({ resource }) }));
  const base = new PIXI.Sprite(textures[0]);
  const ice = new PIXI.TilingSprite({ texture: textures[1], height: 173 });
  const layer = new PIXI.Container();
  layer.position.copyFrom(plantDisplay.position);
  layer.scale.set(plantDisplay.scale.x * 0.8); // 0.4× ice prefab beside the 0.5× plant
  layer.addChild(base, ice);
  stage.addChildAt(layer, 0);
  layer.visible = false;
  base.anchor.set(0, 0.5);
  base.height = 146;
  ice.position.set(32.15, -86.5);
  let elapsed = 0;
  let fading = false;

  function spread(t) {
    const progress = Math.min(t / 0.8, 1);
    base.width = 6.1 + (6000 - 6.1) * progress;
    ice.width = 6 + (6000 - 6) * progress;
  }

  return {
    start() {
      elapsed = 0;
      fading = false;
      layer.visible = true;
      base.x = 181.719;
      ice.alpha = 1;
      spread(0);
    },
    end() { elapsed = 0; fading = true; },
    clear() { layer.visible = false; },
    advance(dt) {
      if (!layer.visible) return;
      elapsed += dt;
      if (fading) {
        const progress = Math.min(elapsed, 1);
        base.x = 181.719 + (3000 - 181.719) * progress;
        ice.alpha = 1 - progress;
        if (progress === 1) layer.visible = false;
      } else if (elapsed - dt < 0.8) {
        spread(elapsed);
      }
    },
    destroy() {
      layer.destroy({ children: true });
      for (const texture of textures) texture.destroy(true);
    },
  };
}
