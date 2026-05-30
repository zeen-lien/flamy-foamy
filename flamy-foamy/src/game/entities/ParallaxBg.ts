import Phaser from 'phaser';

/**
 * ParallaxBg — background scroll yang BENAR di bawah camera zoom.
 *
 * Strategi: TileSprite di-render di WORLD SPACE, tiap frame di-reposisi &
 * di-resize ke `camera.worldView` (rectangle world yang keliatan — sudah
 * memperhitungkan zoom). tilePositionX di-geser pakai scrollX * factor untuk
 * efek parallax. Ini menghindari masalah scrollFactor(0) yang ke-zoom.
 */

export interface ParallaxLayerConfig {
  textureKey: string;
  scrollFactor: number;
  alpha?: number;
  tint?: number;
}

interface Layer {
  ts: Phaser.GameObjects.TileSprite;
  factor: number;
  texH: number;
}

export class ParallaxBg {
  private scene: Phaser.Scene;
  private layers: Layer[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  addLayer(cfg: ParallaxLayerConfig): Phaser.GameObjects.TileSprite | null {
    if (!this.scene.textures.exists(cfg.textureKey)) return null;

    const ts = this.scene.add.tileSprite(0, 0, 100, 100, cfg.textureKey).setOrigin(0, 0);
    ts.setDepth(-10 + this.layers.length);
    if (cfg.alpha !== undefined) ts.setAlpha(cfg.alpha);
    if (cfg.tint !== undefined) ts.setTint(cfg.tint);

    const src = this.scene.textures.get(cfg.textureKey).getSourceImage() as HTMLImageElement;
    const texH = src?.height || 720;

    this.layers.push({ ts, factor: cfg.scrollFactor, texH });
    return ts;
  }

  /** Panggil tiap frame. Pakai camera.worldView supaya benar di bawah zoom. */
  update(camera: Phaser.Cameras.Scene2D.Camera): void {
    const view = camera.worldView; // rectangle world yang tampil (sudah account zoom)
    for (const layer of this.layers) {
      const ts = layer.ts;
      ts.setPosition(view.x, view.y);
      ts.setSize(view.width, view.height);
      // Scale texture supaya cover tinggi world view
      const scale = view.height / layer.texH;
      ts.setTileScale(scale, scale);
      // Parallax horizontal
      ts.tilePositionX = (camera.scrollX * layer.factor) / scale;
    }
  }

  resize(): void {
    // Tidak perlu — update() handle sizing tiap frame.
  }

  destroy(): void {
    for (const l of this.layers) l.ts.destroy();
    this.layers = [];
  }
}
