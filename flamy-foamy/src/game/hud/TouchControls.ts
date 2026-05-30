import Phaser from 'phaser';
import { TEX } from '../config/keys';
import type { PlayerMode } from '../config';

/**
 * TouchControls — virtual buttons untuk mobile/touch device.
 *
 * 2 cluster:
 *  - Kiri-bawah:  LEFT, RIGHT (hold-to-press)
 *  - Kanan-bawah: JUMP, ATTACK (tap, single-shot)
 *
 * Texture button auto-ganti sesuai mode aktif (PNG btnleft/right/jump/attack
 * versi blop/flamy/foamy).
 *
 * State virtual disinkron via callback ke parent (PlayerController.setVirtual).
 */

const TEX_LEFT: Record<PlayerMode, string> = {
  blop: TEX.BTN_LEFT_BLOP,
  fire: TEX.BTN_LEFT_FLAMY,
  water: TEX.BTN_LEFT_FOAMY,
};
const TEX_RIGHT: Record<PlayerMode, string> = {
  blop: TEX.BTN_RIGHT_BLOP,
  fire: TEX.BTN_RIGHT_FLAMY,
  water: TEX.BTN_RIGHT_FOAMY,
};
const TEX_JUMP: Record<PlayerMode, string> = {
  blop: TEX.BTN_JUMP_BLOP,
  fire: TEX.BTN_JUMP_FLAMY,
  water: TEX.BTN_JUMP_FOAMY,
};
const TEX_ATTACK: Record<PlayerMode, string> = {
  blop: TEX.BTN_ATTACK_BLOP,
  fire: TEX.BTN_ATTACK_FLAMY,
  water: TEX.BTN_ATTACK_FOAMY,
};

export interface TouchControlsCallbacks {
  onLeft: (down: boolean) => void;
  onRight: (down: boolean) => void;
  onJump: () => void;
  onAttack: () => void;
}

export interface TouchControlsOptions {
  buttonSize?: number;       // default 76
  edgePadding?: number;      // default 28
  pairGap?: number;          // default 12 antar 2 tombol di cluster yang sama
  initialMode: PlayerMode;
  callbacks: TouchControlsCallbacks;
}

interface TouchBtn {
  img: Phaser.GameObjects.Image;
  glow: Phaser.GameObjects.Graphics;
  pressed: boolean;
}

export class TouchControls extends Phaser.GameObjects.Container {
  private buttonSize: number;
  private edgePadding: number;
  private pairGap: number;
  private mode: PlayerMode;
  private callbacks: TouchControlsCallbacks;

  private leftBtn!: TouchBtn;
  private rightBtn!: TouchBtn;
  private jumpBtn!: TouchBtn;
  private attackBtn!: TouchBtn;

  constructor(scene: Phaser.Scene, opts: TouchControlsOptions) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.buttonSize = opts.buttonSize ?? 76;
    this.edgePadding = opts.edgePadding ?? 28;
    this.pairGap = opts.pairGap ?? 12;
    this.mode = opts.initialMode;
    this.callbacks = opts.callbacks;

    this.leftBtn = this.createBtn(TEX_LEFT[this.mode]);
    this.rightBtn = this.createBtn(TEX_RIGHT[this.mode]);
    this.jumpBtn = this.createBtn(TEX_JUMP[this.mode]);
    this.attackBtn = this.createBtn(TEX_ATTACK[this.mode]);

    // ----- LEFT -----
    this.bindHold(this.leftBtn, (down) => {
      this.callbacks.onLeft(down);
    });
    // ----- RIGHT -----
    this.bindHold(this.rightBtn, (down) => {
      this.callbacks.onRight(down);
    });
    // ----- JUMP (single-shot) -----
    this.bindTap(this.jumpBtn, () => this.callbacks.onJump());
    // ----- ATTACK (single-shot) -----
    this.bindTap(this.attackBtn, () => this.callbacks.onAttack());
  }

  setMode(mode: PlayerMode): void {
    if (this.mode === mode) return;
    this.mode = mode;
    this.leftBtn.img.setTexture(TEX_LEFT[mode]);
    this.rightBtn.img.setTexture(TEX_RIGHT[mode]);
    this.jumpBtn.img.setTexture(TEX_JUMP[mode]);
    this.attackBtn.img.setTexture(TEX_ATTACK[mode]);
    this.fitAll();
  }

  private createBtn(tex: string): TouchBtn {
    // Glow ring di belakang (initially invisible)
    const glow = this.scene.add.graphics();
    glow.setAlpha(0);
    this.add(glow);

    const img = this.scene.add.image(0, 0, tex).setOrigin(0.5);
    if (img.height > 0) img.setScale(this.buttonSize / img.height);
    img.setInteractive({ useHandCursor: false });
    this.add(img);

    return { img, glow, pressed: false };
  }

  /** Hold-to-press: down/up event. */
  private bindHold(btn: TouchBtn, cb: (down: boolean) => void): void {
    btn.img.on(Phaser.Input.Events.POINTER_DOWN, () => {
      btn.pressed = true;
      cb(true);
      this.pressEffect(btn, true);
    });
    btn.img.on(Phaser.Input.Events.POINTER_UP, () => {
      if (!btn.pressed) return;
      btn.pressed = false;
      cb(false);
      this.pressEffect(btn, false);
    });
    btn.img.on(Phaser.Input.Events.POINTER_OUT, () => {
      if (!btn.pressed) return;
      btn.pressed = false;
      cb(false);
      this.pressEffect(btn, false);
    });
    btn.img.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, () => {
      if (!btn.pressed) return;
      btn.pressed = false;
      cb(false);
      this.pressEffect(btn, false);
    });
  }

  /** Tap-to-trigger: fire on POINTER_UP. */
  private bindTap(btn: TouchBtn, cb: () => void): void {
    btn.img.on(Phaser.Input.Events.POINTER_DOWN, () => this.pressEffect(btn, true));
    btn.img.on(Phaser.Input.Events.POINTER_UP, () => {
      this.pressEffect(btn, false);
      cb();
    });
    btn.img.on(Phaser.Input.Events.POINTER_OUT, () => this.pressEffect(btn, false));
    btn.img.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, () => this.pressEffect(btn, false));
  }

  private pressEffect(btn: TouchBtn, down: boolean): void {
    // Ukuran tombol selalu sama. Feedback pakai glow ring + tint sedikit.
    this.scene.tweens.killTweensOf(btn.glow);
    this.scene.tweens.killTweensOf(btn.img);

    if (down) {
      // Draw glow ring di belakang tombol (di posisi tombol di-attach ke container)
      const r = (this.buttonSize / 2) * 1.05;
      btn.glow.clear();
      btn.glow.fillStyle(0xffffff, 0.45);
      btn.glow.fillCircle(btn.img.x, btn.img.y, r);
      btn.glow.lineStyle(2, 0xffffff, 0.85);
      btn.glow.strokeCircle(btn.img.x, btn.img.y, r);

      btn.glow.setAlpha(0.9);
      this.scene.tweens.add({
        targets: btn.glow,
        alpha: 0.4,
        duration: 250,
        ease: 'Sine.easeOut',
      });
      // Tint subtle
      btn.img.setTint(0xfff5b8);
    } else {
      this.scene.tweens.add({
        targets: btn.glow,
        alpha: 0,
        duration: 180,
        ease: 'Sine.easeOut',
      });
      btn.img.clearTint();
    }
  }

  /** Public layout — dipanggil scene saat resize. */
  layout(width: number, height: number, ui: number): void {
    const pad = this.edgePadding * ui;
    const gap = this.pairGap * ui;
    const size = this.buttonSize * ui;

    // Re-fit semua button ke ui scale
    this.fitAll(ui);

    // Cluster kiri-bawah: LEFT, RIGHT
    const leftClusterY = height - pad - size / 2;
    this.leftBtn.img.setPosition(pad + size / 2, leftClusterY);
    this.rightBtn.img.setPosition(pad + size + gap + size / 2, leftClusterY);

    // Cluster kanan-bawah: ATTACK (kiri), JUMP (kanan)
    const rightClusterY = height - pad - size / 2;
    this.attackBtn.img.setPosition(width - pad - size / 2 - size - gap, rightClusterY);
    this.jumpBtn.img.setPosition(width - pad - size / 2, rightClusterY);
  }

  private fitAll(ui = 1): void {
    for (const b of [this.leftBtn, this.rightBtn, this.jumpBtn, this.attackBtn]) {
      if (b.img.height > 0) b.img.setScale((this.buttonSize * ui) / b.img.height);
    }
  }
}
