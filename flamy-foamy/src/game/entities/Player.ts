import Phaser from 'phaser';
import { ANIM } from '../config/keys';
import { GAMEPLAY, type PlayerMode } from '../config';

/**
 * Player (Plenger).
 *
 * Arsitektur: pakai Container sebagai physics owner + child Sprite untuk
 * render. Kenapa? Karena PNG frame setiap animasi punya ukuran / posisi
 * konten yang beda-beda. Kalau Sprite dipake langsung sebagai physics body,
 * tiap frame sprite akan "ghosting" karena anchor & body resync per frame.
 *
 * Dengan Container:
 *  - Body physics fixed (48x64) di posisi container.
 *  - Sprite = child di dalam container, anchor (0.5, 1) (feet), bisa render
 *    dengan tinggi konstan tanpa nge-disturb body.
 */

const ANIM_KEYS = {
  blop: {
    idle: ANIM.PLAYER_BLOP_IDLE,
    run: ANIM.PLAYER_BLOP_RUN,
    jump: ANIM.PLAYER_BLOP_JUMP,
    attack: ANIM.PLAYER_BLOP_ATTACK,
  },
  fire: {
    idle: ANIM.PLAYER_FIRE_IDLE,
    run: ANIM.PLAYER_FIRE_RUN,
    jump: ANIM.PLAYER_FIRE_JUMP,
    attack: ANIM.PLAYER_FIRE_ATTACK,
  },
  water: {
    idle: ANIM.PLAYER_WATER_IDLE,
    run: ANIM.PLAYER_WATER_RUN,
    jump: ANIM.PLAYER_WATER_JUMP,
    attack: ANIM.PLAYER_WATER_ATTACK,
  },
} as const;

export type PlayerAction = 'idle' | 'run' | 'jump' | 'attack';

const BODY_W = 48;
const BODY_H = 64;
const SPRITE_RENDER_HEIGHT = 92; // tinggi visual sprite
// Art PNG karakter punya pedang/efek di bawah kaki, jadi sprite di-angkat
// ke atas supaya bagian "berdiri" napak di permukaan (bukan tenggelam).
const FOOT_LIFT = 18;

export class Player extends Phaser.GameObjects.Container {
  declare body: Phaser.Physics.Arcade.Body;

  public mode: PlayerMode = 'blop';
  public hp = 100;
  public isAttacking = false;
  public isDead = false;
  public facingLeft = false;

  private sprite: Phaser.GameObjects.Sprite;
  private currentAction: PlayerAction = 'idle';
  private attackTimer?: Phaser.Time.TimerEvent;

  // Jump feel: coyote time + jump buffer
  private lastGroundedTime = 0;
  private jumpBufferedTime = -1000;
  private readonly COYOTE_MS = 110;       // masih bisa lompat 110ms setelah lepas tepi
  private readonly JUMP_BUFFER_MS = 130;  // lompat ke-buffer 130ms sebelum mendarat

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    // Sprite: anchor di bottom-center supaya kaki konsisten meskipun
    // tiap frame PNG punya tinggi/lebar berbeda. Sprite digeser ke bawah
    // sehingga feet sprite = bottom body.
    const initialKey = `${ANIM.PLAYER_BLOP_IDLE}__0`;
    // sprite anchor (0.5,1) di y = bottom body - FOOT_LIFT, supaya kaki
    // sprite napak di permukaan collider (bukan tenggelam).
    this.sprite = scene.add.sprite(0, BODY_H / 2 - FOOT_LIFT, initialKey);
    this.sprite.setOrigin(0.5, 1);
    this.add(this.sprite);

    this.fitSpriteSize();

    // Container body — fixed size, gak ke-pengaruh sprite display size.
    this.setSize(BODY_W, BODY_H);
    scene.physics.add.existing(this);

    const body = this.body;
    body.setSize(BODY_W, BODY_H);
    body.setOffset(-BODY_W / 2, -BODY_H / 2); // container origin = (0,0) di tengah
    body.setDragX(800);
    body.setMaxVelocity(GAMEPLAY.playerSpeed * 1.6, 1500);
    body.setCollideWorldBounds(true);

    // Re-fit sprite size tiap frame berubah (PNG natural size beda-beda).
    this.sprite.on(Phaser.Animations.Events.ANIMATION_UPDATE, () => this.fitSpriteSize());
    this.sprite.on(Phaser.Animations.Events.ANIMATION_START, () => this.fitSpriteSize());

    this.sprite.play(ANIM_KEYS.blop.idle, true);
  }

  /**
   * Render sprite dengan tinggi konstan; lebar otomatis ngikutin aspect
   * frame current. Sprite anchor (0.5, 1) jadi kaki tetap di y=BODY_H/2.
   */
  private fitSpriteSize(): void {
    const f = this.sprite.frame;
    if (!f || f.height <= 0) return;
    const aspect = f.width / f.height;
    this.sprite.setDisplaySize(SPRITE_RENDER_HEIGHT * aspect, SPRITE_RENDER_HEIGHT);
  }

  // --------------------------------------------------------- INPUT API

  moveLeft(): void {
    if (this.isDead) return;
    this.body.setVelocityX(-GAMEPLAY.playerSpeed);
    this.facingLeft = true;
    this.sprite.setFlipX(true);
  }

  moveRight(): void {
    if (this.isDead) return;
    this.body.setVelocityX(GAMEPLAY.playerSpeed);
    this.facingLeft = false;
    this.sprite.setFlipX(false);
  }

  setVelocityX(vx: number): void {
    this.body.setVelocityX(vx);
  }

  jump(): void {
    if (this.isDead) return;
    // Catat permintaan lompat (buffer). Eksekusi aktual di tryConsumeJump()
    // yang dipanggil tiap frame — supaya coyote time & buffer bekerja.
    this.jumpBufferedTime = this.scene.time.now;
  }

  /** Dipanggil tiap frame (updateAnimation) untuk proses jump dengan
   *  coyote time + jump buffer supaya lompatan terasa responsif & "nyampe". */
  private tryConsumeJump(): void {
    if (this.isDead) return;
    const now = this.scene.time.now;
    const grounded = this.body.blocked.down || this.body.touching.down;
    if (grounded) this.lastGroundedTime = now;

    const wantJump = now - this.jumpBufferedTime <= this.JUMP_BUFFER_MS;
    const canJump = now - this.lastGroundedTime <= this.COYOTE_MS;

    if (wantJump && canJump) {
      this.body.setVelocityY(GAMEPLAY.jumpVelocity);
      this.jumpBufferedTime = -1000; // consume
      this.lastGroundedTime = -1000; // cegah double jump
    }
  }

  attack(): void {
    if (this.isDead || this.isAttacking) return;
    this.isAttacking = true;
    this.playAction('attack');
    this.attackTimer?.remove(false);
    this.attackTimer = this.scene.time.delayedCall(GAMEPLAY.attackDuration, () => {
      this.isAttacking = false;
    });
  }

  setMode(mode: PlayerMode): void {
    if (this.mode === mode || this.isDead) return;
    this.mode = mode;
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: { from: 0.3, to: 1 },
      duration: 220,
      ease: 'Sine.easeOut',
    });
    this.playAction(this.currentAction, true);
  }

  takeDamage(amount: number): void {
    if (this.isDead) return;
    this.hp = Math.max(0, this.hp - amount);
    this.sprite.setTint(0xff5252);
    this.scene.time.delayedCall(180, () => this.sprite.clearTint());
    if (this.hp <= 0) this.die();
  }

  heal(amount: number): void {
    if (this.isDead) return;
    this.hp = Math.min(200, this.hp + amount);
  }

  die(): void {
    if (this.isDead) return;
    this.isDead = true;
    this.body.setVelocity(0, 0);
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      angle: 90,
      duration: 600,
      ease: 'Sine.easeIn',
    });
  }

  respawnAt(x: number, y: number): void {
    this.isDead = false;
    this.hp = 100;
    this.sprite.setAlpha(1);
    this.sprite.setAngle(0);
    this.body.setVelocity(0, 0);
    this.setPosition(x, y);
    this.playAction('idle', true);
  }

  // --------------------------------------------------------- ANIMATION

  updateAnimation(): void {
    this.tryConsumeJump();
    if (this.isDead || this.isAttacking) return;
    const grounded = this.body.blocked.down || this.body.touching.down;
    const movingX = Math.abs(this.body.velocity.x) > 30;

    let next: PlayerAction;
    if (!grounded) next = 'jump';
    else if (movingX) next = 'run';
    else next = 'idle';

    if (next !== this.currentAction) this.playAction(next);
  }

  private playAction(action: PlayerAction, force = false): void {
    this.currentAction = action;
    const key = ANIM_KEYS[this.mode][action];
    if (!this.scene.anims.exists(key)) return;
    this.sprite.play(key, !force);
  }
}
