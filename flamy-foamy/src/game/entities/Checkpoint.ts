import Phaser from 'phaser';
import { TEX } from '../config/keys';

/**
 * Checkpoint — pakai PNG cp/off & cp/on.
 * Default off. Saat player overlap pertama kali → on + glow ring + callback
 * supaya scene simpan posisi respawn.
 */

export interface CheckpointOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  size?: number;
  onActivate?: (cp: Checkpoint) => void;
}

export class Checkpoint extends Phaser.GameObjects.Container {
  public active = false;
  public readonly spawnX: number;
  public readonly spawnY: number;

  private img: Phaser.GameObjects.Image;
  private glowGfx: Phaser.GameObjects.Graphics;
  private onActivateFn?: (cp: Checkpoint) => void;

  constructor(opts: CheckpointOptions) {
    super(opts.scene, opts.x, opts.y);
    opts.scene.add.existing(this);
    this.spawnX = opts.x;
    this.spawnY = opts.y - 40; // spawn sedikit di atas flag

    const size = opts.size ?? 72;
    this.onActivateFn = opts.onActivate;

    this.glowGfx = opts.scene.add.graphics();
    this.glowGfx.setAlpha(0);
    this.add(this.glowGfx);

    this.img = opts.scene.add.image(0, 0, TEX.CP_OFF).setOrigin(0.5, 1);
    if (this.img.height > 0) this.img.setScale(size / this.img.height);
    this.add(this.img);

    // Overlap body
    opts.scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    const bw = this.img.displayWidth * 0.8;
    const bh = this.img.displayHeight;
    body.setSize(bw, bh);
    body.setOffset(-bw / 2, -bh);
  }

  activate(): void {
    if (this.active) return;
    this.active = true;
    this.img.setTexture(TEX.CP_ON);
    // Re-fit scale (tekstur on bisa beda dimensi)
    // Pertahankan tinggi sama
    const targetH = this.img.displayHeight;
    if (this.img.height > 0) this.img.setScale(targetH / this.img.height);

    // Glow ring burst (tipis)
    this.glowGfx.clear();
    this.glowGfx.fillStyle(0x5eead4, 0.22);
    this.glowGfx.fillCircle(0, -this.img.displayHeight / 2, this.img.displayWidth * 0.7);
    this.glowGfx.setAlpha(1);
    this.scene.tweens.add({
      targets: this.glowGfx,
      alpha: { from: 0.8, to: 0 },
      scaleX: { from: 0.6, to: 1.4 },
      scaleY: { from: 0.6, to: 1.4 },
      duration: 700,
      ease: 'Sine.easeOut',
    });
    // Bob the flag sekali
    this.scene.tweens.add({
      targets: this.img,
      scaleY: { from: this.img.scaleY * 1.15, to: this.img.scaleY },
      duration: 300,
      ease: 'Back.easeOut',
    });

    this.onActivateFn?.(this);
  }
}
