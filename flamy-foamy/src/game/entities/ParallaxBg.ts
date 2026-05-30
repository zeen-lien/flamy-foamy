import Phaser from 'phaser';

/**
 * ParallaxBg — multi-layer background scroll dengan kecepatan beda per layer.
 *
 * Karena kita cuma punya 1 PNG bg per level, strategi:
 *  - Layer 0 (terjauh): bg utama, scrollFactor kecil, di-stretch cover.
 *  - Layer dekoratif: kita generate light particle / silhouette via Graphics
 *    yang gerak beda kecepatan (opsional).
 *
 * Simplifikasi step ini: 1 image layer dengan scrollFactor + tileable
 * horizontal kalau level lebih lebar dari image.
 */

export interface ParallaxLayerConfig {
  textureKey: string;
  scrollFactor: number;
  alpha?: number;
  tint?: number;
}

export class ParallaxBg {
  private scene: Phaser.Scene;
  private layers: Phaser.GameObjects.TileSprite[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Tambah layer pakai TileSprite supaya bisa repeat horizontal untuk level
   * panjang. width = lebar viewport, height = tinggi viewport.
   */
  addLayer(cfg: ParallaxLayerConfig, viewW: number, viewH: number): Phaser.GameObjects.TileSprite {
    if (!this.scene.textures.exists(cfg.textureKey)) {
      // Fallback: skip kalau texture gak ada
      return null as unknown as Phaser.GameObjects.TileSprite;
    }
    const ts = this.scene.add.tileSprite(0, 0, viewW, viewH, cfg.textureKey).setOrigin(0, 0);
    ts.setScrollFactor(0); // kita scroll manual via tilePosition
    ts.setDepth(-10 + this.layers.length);
    if (cfg.alpha !== undefined) ts.setAlpha(cfg.alpha);
    if (cfg.tint !== undefined) ts.setTint(cfg.tint);

    // Scale texture supaya cover tinggi viewport
    const tex = this.scene.textures.get(cfg.textureKey).getSourceImage() as HTMLImageElement;
    if (tex && tex.height) {
      const scale = viewH / tex.height;
      ts.setTileScale(scale, scale);
    }

    (ts as Phaser.GameObjects.TileSprite & { _scrollFactor?: number })._scrollFactor = cfg.scrollFactor;
    this.layers.push(ts);
    return ts;
  }

  /** Panggil tiap frame dengan posisi kamera. */
  update(cameraScrollX: number, cameraScrollY = 0): void {
    for (const ts of this.layers) {
      const sf = (ts as Phaser.GameObjects.TileSprite & { _scrollFactor?: number })._scrollFactor ?? 0.5;
      ts.tilePositionX = cameraScrollX * sf;
      ts.tilePositionY = cameraScrollY * sf * 0.5;
    }
  }

  /** Resize semua layer ke viewport baru. */
  resize(viewW: number, viewH: number): void {
    for (const ts of this.layers) {
      ts.setSize(viewW, viewH);
      const tex = this.scene.textures.get(ts.texture.key).getSourceImage() as HTMLImageElement;
      if (tex && tex.height) {
        const scale = viewH / tex.height;
        ts.setTileScale(scale, scale);
      }
    }
  }

  destroy(): void {
    for (const ts of this.layers) ts.destroy();
    this.layers = [];
  }
}
