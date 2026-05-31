import Phaser from 'phaser';

/**
 * HazardZone — platform tipis yang bisa diinjak HANYA oleh mode tertentu.
 *
 * Lava platform: Flamy bisa injak (solid), Blop/Foamy mati.
 * Water platform: Foamy bisa injak (solid), Blop/Flamy mati.
 *
 * Visual: platform tipis (~30px tinggi) dengan animasi elemen.
 * Lava: permukaan magma bergelombang + gelembung + glow orange.
 * Water: permukaan air bergelombang + gelembung biru + spray.
 *
 * Collision: static body. Scene yang handle logic kill/safe berdasarkan
 * player.mode saat overlap/collide.
 */

export type HazardType = 'lava' | 'water';

export interface HazardZoneOptions {
  scene: Phaser.Scene;
  x: number;          // center x
  y: number;          // center y (platform tipis)
  width: number;
  type: HazardType;
}

const PLATFORM_H = 30;

export class HazardZone extends Phaser.GameObjects.Container {
  public readonly hazardType: HazardType;
  public platform!: Phaser.GameObjects.Rectangle;
  private gfx: Phaser.GameObjects.Graphics;
  private wPx: number;
  private time = 0;

  constructor(opts: HazardZoneOptions) {
    super(opts.scene, opts.x, opts.y);
    opts.scene.add.existing(this);
    this.hazardType = opts.type;
    this.wPx = opts.width;

    this.gfx = opts.scene.add.graphics();
    this.add(this.gfx);

    this.draw(0);

    // Platform collider — Rectangle terpisah (Container + static body unreliable).
    this.platform = opts.scene.add.rectangle(opts.x, opts.y + PLATFORM_H / 2, this.wPx, PLATFORM_H, 0x000000, 0);
    opts.scene.physics.add.existing(this.platform, true);
    (this.platform.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
  }

  /** Dipanggil tiap frame untuk animasi (gelembung, wave). */
  tick(delta: number): void {
    this.time += delta;
    this.draw(this.time);
  }

  private draw(t: number): void {
    const w = this.wPx;
    const h = PLATFORM_H;
    this.gfx.clear();

    if (this.hazardType === 'lava') {
      this.drawLava(w, h, t);
    } else {
      this.drawWater(w, h, t);
    }
  }

  private drawLava(w: number, h: number, t: number): void {
    // Base (gelap)
    this.gfx.fillStyle(0x1a0800, 1);
    this.gfx.fillRoundedRect(-w / 2, -h / 2, w, h, 4);

    // Lava body (orange-merah)
    this.gfx.fillStyle(0xcc3300, 0.9);
    this.gfx.fillRoundedRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4, 3);

    // Permukaan bergelombang (wave di atas)
    this.gfx.fillStyle(0xff6a00, 0.85);
    for (let x = -w / 2 + 2; x < w / 2 - 2; x += 5) {
      const yOff = Math.sin((x + t * 0.003) * 0.12) * 3;
      this.gfx.fillRect(x, -h / 2 + 2 + yOff, 5, 6);
    }

    // Glow terang
    this.gfx.fillStyle(0xffaa00, 0.6);
    for (let x = -w / 2 + 4; x < w / 2 - 4; x += 10) {
      const yOff = Math.sin((x + t * 0.002) * 0.15) * 2;
      this.gfx.fillRect(x, -h / 2 + 4 + yOff, 7, 2);
    }

    // Gelembung (3-4)
    const bubbles = Math.max(2, Math.floor(w / 80));
    for (let i = 0; i < bubbles; i++) {
      const bx = -w / 2 + (i + 0.5) * (w / bubbles);
      const phase = (t * 0.002 + i * 1.7) % 1;
      const by = (h / 2) * (1 - phase) - h / 2;
      this.gfx.fillStyle(0xffcc44, 0.6 * (1 - phase));
      this.gfx.fillCircle(bx, by, 2);
    }

    // Border
    this.gfx.lineStyle(2, 0x2a1400, 1);
    this.gfx.strokeRoundedRect(-w / 2, -h / 2, w, h, 4);
    this.gfx.lineStyle(1, 0xff6a00, 0.5);
    this.gfx.strokeRoundedRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4, 3);
  }

  private drawWater(w: number, h: number, t: number): void {
    // Base (gelap biru)
    this.gfx.fillStyle(0x001a33, 1);
    this.gfx.fillRoundedRect(-w / 2, -h / 2, w, h, 4);

    // Water body
    this.gfx.fillStyle(0x1a6baa, 0.9);
    this.gfx.fillRoundedRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4, 3);

    // Wave permukaan
    this.gfx.fillStyle(0x4dc6ff, 0.8);
    for (let x = -w / 2 + 2; x < w / 2 - 2; x += 5) {
      const yOff = Math.sin((x + t * 0.004) * 0.12) * 3;
      this.gfx.fillRect(x, -h / 2 + 2 + yOff, 5, 5);
    }

    // Highlight
    this.gfx.fillStyle(0x93e5ff, 0.5);
    for (let x = -w / 2 + 4; x < w / 2 - 4; x += 12) {
      const yOff = Math.cos((x + t * 0.003) * 0.1) * 2;
      this.gfx.fillRect(x, -h / 2 + 5 + yOff, 6, 2);
    }

    // Gelembung
    const bubbles = Math.max(2, Math.floor(w / 70));
    for (let i = 0; i < bubbles; i++) {
      const bx = -w / 2 + (i + 0.5) * (w / bubbles);
      const phase = (t * 0.0025 + i * 2.1) % 1;
      const by = (h / 2) * (1 - phase) - h / 2;
      this.gfx.fillStyle(0xaaeeff, 0.5 * (1 - phase));
      this.gfx.fillCircle(bx, by, 1.5);
    }

    // Border
    this.gfx.lineStyle(2, 0x002244, 1);
    this.gfx.strokeRoundedRect(-w / 2, -h / 2, w, h, 4);
    this.gfx.lineStyle(1, 0x4dc6ff, 0.5);
    this.gfx.strokeRoundedRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4, 3);
  }
}
