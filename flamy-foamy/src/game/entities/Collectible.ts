import Phaser from 'phaser';
import { TEX } from '../config/keys';

/**
 * Collectible — coin / stone / xp pickup.
 *
 * Pakai Container + child Image (texture PNG dari items/). Punya:
 *  - idle float bob + sedikit rotate/pulse
 *  - collect(): tween fly ke arah HUD (magnet) lalu destroy, return promise-like callback
 *
 * Physics: pakai overlap zone (gak collide), jadi gak ganggu movement.
 */

export type CollectibleType = 'coin' | 'stone' | 'xp';

const TEX_BY_TYPE: Record<string, string> = {
  coin: TEX.ITEM_COIN,
  xp: TEX.ITEM_XP,
  // stone tergantung level — di-set via opts.textureKey
};

export interface CollectibleOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  type: CollectibleType;
  /** Override texture (buat stone per-level: firestone/waterstone/batukristal). */
  textureKey?: string;
  /** Ukuran target tinggi (px). Default per-type. */
  size?: number;
  value?: number;
}

const DEFAULT_SIZE: Record<CollectibleType, number> = {
  coin: 28,
  stone: 40,
  xp: 34,
};

export class Collectible extends Phaser.GameObjects.Container {
  public readonly type: CollectibleType;
  public readonly value: number;
  public collected = false;

  private img: Phaser.GameObjects.Image;
  private glowGfx: Phaser.GameObjects.Graphics;
  private baseY: number;

  constructor(opts: CollectibleOptions) {
    super(opts.scene, opts.x, opts.y);
    opts.scene.add.existing(this);
    this.type = opts.type;
    this.value = opts.value ?? (opts.type === 'coin' ? 5 : opts.type === 'xp' ? 50 : 1);
    this.baseY = opts.y;

    const texKey = opts.textureKey ?? TEX_BY_TYPE[opts.type];
    const size = opts.size ?? DEFAULT_SIZE[opts.type];

    // Glow halo di belakang (tipis & subtle)
    this.glowGfx = opts.scene.add.graphics();
    const glowColor = opts.type === 'coin' ? 0xfbbf24 : opts.type === 'xp' ? 0xff7a90 : 0xffffff;
    this.glowGfx.fillStyle(glowColor, 0.1);
    this.glowGfx.fillCircle(0, 0, size * 0.6);
    this.glowGfx.fillStyle(glowColor, 0.14);
    this.glowGfx.fillCircle(0, 0, size * 0.42);
    this.add(this.glowGfx);

    this.img = opts.scene.add.image(0, 0, texKey).setOrigin(0.5);
    if (this.img.height > 0) this.img.setScale(size / this.img.height);
    this.add(this.img);

    // Physics overlap body (static-ish, manual)
    opts.scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(size, size);
    body.setOffset(-size / 2, -size / 2);

    this.startIdle();
  }

  private startIdle(): void {
    // Float bob
    this.scene.tweens.add({
      targets: this,
      y: this.baseY - 7,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    // Glow pulse (halus)
    this.scene.tweens.add({
      targets: this.glowGfx,
      alpha: { from: 0.55, to: 0.85 },
      scaleX: { from: 1, to: 1.1 },
      scaleY: { from: 1, to: 1.1 },
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    // Coin & stone slight spin (flip horizontally illusion)
    if (this.type === 'coin' || this.type === 'stone') {
      this.scene.tweens.add({
        targets: this.img,
        scaleX: { from: this.img.scaleX, to: this.img.scaleX * 0.5 },
        duration: 1400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  /**
   * Mainkan animasi collect: pop + fly ke target (posisi HUD di screen space).
   * onDone dipanggil setelah selesai.
   */
  collect(targetX: number, targetY: number, onDone?: () => void): void {
    if (this.collected) return;
    this.collected = true;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.killTweensOf(this.img);
    this.scene.tweens.killTweensOf(this.glowGfx);

    // Pop dulu, lalu fly
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.4,
      scaleY: 1.4,
      duration: 120,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: this,
          x: targetX,
          y: targetY,
          scaleX: 0.3,
          scaleY: 0.3,
          alpha: 0.6,
          duration: 420,
          ease: 'Cubic.easeIn',
          onComplete: () => {
            onDone?.();
            this.destroy();
          },
        });
      },
    });
  }
}
