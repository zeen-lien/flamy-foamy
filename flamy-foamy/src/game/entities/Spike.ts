import Phaser from 'phaser';

/**
 * Spike (duri) — instant-kill trap, drawn via Graphics (no PNG).
 * Deretan segitiga tajam metallic dengan base plate.
 *
 * Physics: overlap zone di area spike (bukan full height, cuma bagian tajam).
 */

export interface SpikeOptions {
  scene: Phaser.Scene;
  x: number;          // center x
  y: number;          // bottom y (spike base sits here)
  width: number;      // total lebar deretan
  spikeColor?: number;
  baseColor?: number;
}

const SPIKE_H = 22;
const SPIKE_W = 16;

export class Spike extends Phaser.GameObjects.Container {
  declare body: Phaser.Physics.Arcade.Body;

  constructor(opts: SpikeOptions) {
    super(opts.scene, opts.x, opts.y);
    opts.scene.add.existing(this);

    const g = opts.scene.add.graphics();
    this.add(g);

    const w = opts.width;
    const spikeColor = opts.spikeColor ?? 0xc8ccdc;
    const baseColor = opts.baseColor ?? 0x4a4054;

    // Base plate
    g.fillStyle(baseColor, 1);
    g.fillRect(-w / 2, -4, w, 8);
    g.fillStyle(0x2a2435, 0.6);
    g.fillRect(-w / 2, 0, w, 4);

    // Deretan spike segitiga
    const count = Math.max(1, Math.floor(w / SPIKE_W));
    const startX = -w / 2 + (w - count * SPIKE_W) / 2 + SPIKE_W / 2;
    for (let i = 0; i < count; i++) {
      const sx = startX + i * SPIKE_W;
      const tip = { x: sx, y: -SPIKE_H };
      const left = { x: sx - SPIKE_W / 2 + 1, y: -2 };
      const right = { x: sx + SPIKE_W / 2 - 1, y: -2 };

      // Body
      g.fillStyle(spikeColor, 1);
      g.fillTriangle(tip.x, tip.y, left.x, left.y, right.x, right.y);
      // Facet kiri terang
      g.fillStyle(0xffffff, 0.4);
      g.fillTriangle(tip.x, tip.y, left.x, left.y, sx, -2);
      // Facet kanan gelap
      g.fillStyle(0x6b6178, 0.6);
      g.fillTriangle(tip.x, tip.y, right.x, right.y, sx, -2);
      // Outline
      g.lineStyle(1, 0x2a2435, 0.8);
      g.strokeTriangle(tip.x, tip.y, left.x, left.y, right.x, right.y);
    }

    // Physics overlap body — area tajam
    opts.scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    const bw = w;
    const bh = SPIKE_H;
    this.body.setSize(bw, bh);
    this.body.setOffset(-bw / 2, -bh);
  }
}
