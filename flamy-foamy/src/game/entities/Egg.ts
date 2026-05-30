import Phaser from 'phaser';
import { ANIM } from '../config/keys';

/**
 * Egg (Telur) — muncul setelah boss mati. Player attack untuk pecah.
 * Setiap hit maju 1 frame crack. Setelah hpMax hit → pecah & callback.
 */

const ANIM_BY_TYPE = {
  batu: { idle: ANIM.EGG_BATU_IDLE, crack: ANIM.EGG_BATU_CRACK },
  api: { idle: ANIM.EGG_API_IDLE, crack: ANIM.EGG_API_CRACK },
  es: { idle: ANIM.EGG_ES_IDLE, crack: ANIM.EGG_ES_CRACK },
} as const;

export type EggType = 'batu' | 'api' | 'es';

export interface EggConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  type: EggType;
  hpMax: number;        // jumlah hit untuk pecah
  renderHeight?: number;
  accentColor?: number;
  onCracked?: () => void;
}

export class Egg extends Phaser.GameObjects.Container {
  declare body: Phaser.Physics.Arcade.Body;

  public hp = 0;
  public readonly hpMax: number;
  public cracked = false;

  private sprite: Phaser.GameObjects.Sprite;
  private crackFrames: number;
  private cfg: EggConfig;
  private renderH: number;
  private crackKey: string;

  constructor(cfg: EggConfig) {
    super(cfg.scene, cfg.x, cfg.y);
    cfg.scene.add.existing(this);
    this.cfg = cfg;
    this.hpMax = cfg.hpMax;
    this.renderH = cfg.renderHeight ?? 90;

    const idleKey = ANIM_BY_TYPE[cfg.type].idle;
    this.crackKey = ANIM_BY_TYPE[cfg.type].crack;
    const initial = `${idleKey}__0`;
    this.sprite = cfg.scene.add.sprite(0, 0, initial).setOrigin(0.5, 1);
    this.fitSprite();
    this.add(this.sprite);

    // Jumlah frame crack anim (untuk mapping hit → frame)
    const crackAnim = cfg.scene.anims.get(this.crackKey);
    this.crackFrames = crackAnim ? crackAnim.frames.length : 5;

    // Physics body (overlap)
    cfg.scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    const bw = this.sprite.displayWidth * 0.8;
    const bh = this.sprite.displayHeight;
    this.body.setSize(bw, bh);
    this.body.setOffset(-bw / 2, -bh);

    // Idle bob + glow muncul (spawn animation)
    this.setScale(0);
    cfg.scene.tweens.add({
      targets: this,
      scale: 1,
      duration: 400,
      ease: 'Back.easeOut',
    });
    cfg.scene.tweens.add({
      targets: this.sprite,
      y: '-=6',
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private fitSprite(): void {
    const f = this.sprite.frame;
    if (!f || f.height <= 0) return;
    const aspect = f.width / f.height;
    this.sprite.setDisplaySize(this.renderH * aspect, this.renderH);
  }

  /** Player memukul telur. Return true kalau pecah. */
  hit(): boolean {
    if (this.cracked) return false;
    this.hp = Math.min(this.hpMax, this.hp + 1);

    // Set frame crack sesuai progress
    const progress = this.hp / this.hpMax;
    const frameIdx = Math.min(this.crackFrames - 1, Math.floor(progress * this.crackFrames));
    const frameKey = `${this.crackKey}__${frameIdx}`;
    if (this.scene.textures.exists(frameKey)) {
      this.sprite.setTexture(frameKey);
      this.fitSprite();
    }

    // Shake + flash feedback
    this.scene.tweens.add({
      targets: this.sprite,
      x: { from: -3, to: 3 },
      duration: 50,
      yoyo: true,
      repeat: 2,
      onComplete: () => { this.sprite.x = 0; },
    });
    const accent = this.cfg.accentColor ?? 0xffd84d;
    this.sprite.setTint(accent);
    this.scene.time.delayedCall(100, () => this.sprite.clearTint());

    if (this.hp >= this.hpMax) {
      this.crack();
      return true;
    }
    return false;
  }

  private crack(): void {
    this.cracked = true;
    this.body.enable = false;
    // Burst particle
    const accent = this.cfg.accentColor ?? 0xffd84d;
    for (let i = 0; i < 14; i++) {
      const p = this.scene.add.circle(this.x, this.y - this.renderH / 2, Phaser.Math.Between(2, 5), accent, 1).setDepth(20);
      const ang = (i / 14) * Math.PI * 2;
      const dist = Phaser.Math.Between(40, 90);
      this.scene.tweens.add({
        targets: p,
        x: this.x + Math.cos(ang) * dist,
        y: this.y - this.renderH / 2 + Math.sin(ang) * dist,
        alpha: 0,
        scale: 0.2,
        duration: 600,
        ease: 'Cubic.easeOut',
        onComplete: () => p.destroy(),
      });
    }
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scale: this.sprite.scale * 1.3,
      duration: 400,
      ease: 'Sine.easeOut',
      onComplete: () => this.cfg.onCracked?.(),
    });
  }
}
