import Phaser from 'phaser';
import { ANIM } from '../config/keys';

/**
 * Boss — musuh penjaga. Container + child Sprite (sama pola dgn Player
 * supaya gak ghosting karena frame PNG beda ukuran).
 *
 * AI sederhana:
 *  - idle  : diam/patroli pelan sampai player masuk chaseRange
 *  - chase : kejar player sampai stopRange
 *  - attack: kalau dekat & cooldown habis, mainkan attack anim + damage
 *  - dead  : fade + destroy
 *
 * Boss bisa di-hit player saat player.isAttacking & overlap → hp berkurang.
 */

const ANIM_BY_TYPE = {
  batu: { run: ANIM.BOSS_BATU_RUN, attack: ANIM.BOSS_BATU_ATTACK },
  api: { run: ANIM.BOSS_API_RUN, attack: ANIM.BOSS_API_ATTACK },
  es: { run: ANIM.BOSS_ES_RUN, attack: ANIM.BOSS_ES_ATTACK },
} as const;

export type BossType = 'batu' | 'api' | 'es';
export type BossState = 'idle' | 'chase' | 'attack' | 'dead';

export interface BossConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;          // bottom (feet) y
  type: BossType;
  hpMax: number;
  chaseRange: number;
  stopRange: number;
  attackCooldown: number;
  damage: number;
  chaseSpeed: number;
  renderHeight?: number;
}

const BODY_W = 80;
const BODY_H = 110;
const FOOT_LIFT = 14; // angkat sprite biar kaki napak di permukaan, gak tenggelam

export class Boss extends Phaser.GameObjects.Container {
  declare body: Phaser.Physics.Arcade.Body;

  public hp: number;
  public readonly hpMax: number;
  public aiState: BossState = 'idle';
  public alive = true;

  private sprite: Phaser.GameObjects.Sprite;
  private cfg: BossConfig;
  private renderH: number;
  private canAttack = true;
  private facingLeft = true;
  private onHitPlayerFn?: (dmg: number) => void;
  private onDeathFn?: () => void;

  constructor(cfg: BossConfig) {
    super(cfg.scene, cfg.x, cfg.y);
    cfg.scene.add.existing(this);
    this.cfg = cfg;
    this.hp = cfg.hpMax;
    this.hpMax = cfg.hpMax;
    this.renderH = cfg.renderHeight ?? 150;

    const runKey = ANIM_BY_TYPE[cfg.type].run;
    const initial = `${runKey}__0`;
    this.sprite = cfg.scene.add.sprite(0, BODY_H / 2 - FOOT_LIFT, initial).setOrigin(0.5, 1);
    this.fitSprite();
    this.add(this.sprite);

    this.setSize(BODY_W, BODY_H);
    cfg.scene.physics.add.existing(this);
    this.body.setSize(BODY_W, BODY_H);
    this.body.setOffset(-BODY_W / 2, -BODY_H / 2);
    this.body.setCollideWorldBounds(false);
    this.body.setDragX(600);

    this.sprite.on(Phaser.Animations.Events.ANIMATION_UPDATE, () => this.fitSprite());
    if (cfg.scene.anims.exists(runKey)) this.sprite.play(runKey, true);
  }

  onHitPlayer(cb: (dmg: number) => void): void { this.onHitPlayerFn = cb; }
  onDeath(cb: () => void): void { this.onDeathFn = cb; }

  private fitSprite(): void {
    // LOCK tinggi konstan (renderH) — lebar ngikutin aspect frame.
    // Ini mencegah size berubah antara idle/run/attack karena PNG beda resolusi.
    const f = this.sprite.frame;
    if (!f || f.height <= 0) return;
    const aspect = f.width / f.height;
    this.sprite.setDisplaySize(this.renderH * aspect, this.renderH);
    this.sprite.setFlipX(this.facingLeft);
  }

  /** AI update — dipanggil scene tiap frame dengan posisi player. */
  updateAI(playerX: number, playerY: number): void {
    if (!this.alive) return;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);
    const dir = playerX < this.x ? -1 : 1;

    if (dist > this.cfg.chaseRange) {
      this.aiState = 'idle';
      this.body.setVelocityX(0);
    } else if (dist > this.cfg.stopRange) {
      this.aiState = 'chase';
      this.facingLeft = dir < 0;
      this.sprite.setFlipX(this.facingLeft);
      this.body.setVelocityX(dir * this.cfg.chaseSpeed);
      this.playRun();
    } else {
      this.aiState = 'attack';
      this.facingLeft = dir < 0;
      this.sprite.setFlipX(this.facingLeft);
      this.body.setVelocityX(0);
      if (this.canAttack) this.doAttack();
    }
  }

  private playRun(): void {
    const key = ANIM_BY_TYPE[this.cfg.type].run;
    if (this.scene.anims.exists(key) && this.sprite.anims.currentAnim?.key !== key) {
      this.sprite.play(key, true);
    }
  }

  private doAttack(): void {
    this.canAttack = false;
    const key = ANIM_BY_TYPE[this.cfg.type].attack;
    if (this.scene.anims.exists(key)) {
      this.sprite.play(key, true);
      this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => this.playRun());
    }
    // Damage ke player (scene yang cek overlap; ini trigger waktu attack)
    this.onHitPlayerFn?.(this.cfg.damage);
    this.scene.time.delayedCall(this.cfg.attackCooldown, () => { this.canAttack = true; });
  }

  /** Player memukul boss. */
  takeHit(dmg: number): void {
    if (!this.alive) return;
    this.hp = Math.max(0, this.hp - dmg);
    // Knockback + flash
    const dir = this.facingLeft ? 1 : -1;
    this.body.setVelocityX(dir * 120);
    this.sprite.setTint(0xff8a8a);
    this.scene.time.delayedCall(120, () => this.sprite.clearTint());
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: this.sprite.scaleX * 1.08,
      duration: 80,
      yoyo: true,
    });
    if (this.hp <= 0) this.die();
  }

  private die(): void {
    if (!this.alive) return;
    this.alive = false;
    this.aiState = 'dead';
    this.body.setVelocity(0, 0);
    this.body.enable = false;
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      angle: this.facingLeft ? -80 : 80,
      scaleX: this.sprite.scaleX * 0.8,
      scaleY: this.sprite.scaleY * 0.8,
      duration: 700,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.onDeathFn?.();
        this.destroy();
      },
    });
  }
}
