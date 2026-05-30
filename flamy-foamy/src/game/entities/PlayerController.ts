import Phaser from 'phaser';
import type { Player } from './Player';
import type { PlayerMode } from '../config';

/**
 * PlayerController — input bridge antara keyboard/touch dan Player entity.
 *
 * Strategi: ekspos high-level intent (left/right pressed, jump triggered,
 * attack triggered, mode switch) lewat `update()`. Player sendiri yang
 * apply ke physics + animasi.
 *
 * Keyboard mapping:
 *  ← / A  : left
 *  → / D  : right
 *  ↑ / W / Space : jump
 *  J / K  : attack
 *  Z / X / C : mode blop / fire / water
 *
 * Catatan: nantinya controller yang sama bisa di-extend untuk touch
 * dengan inject `setVirtualState({ left, right, jump, attack })`.
 */

export interface VirtualInputState {
  left: boolean;
  right: boolean;
  jumpPressed: boolean; // single-shot trigger (true selama 1 frame)
  attackPressed: boolean;
  switchMode?: PlayerMode;
}

export class PlayerController {
  private scene: Phaser.Scene;
  private player: Player;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyJ!: Phaser.Input.Keyboard.Key;
  private keyK!: Phaser.Input.Keyboard.Key;
  private keyZ!: Phaser.Input.Keyboard.Key;
  private keyX!: Phaser.Input.Keyboard.Key;
  private keyC!: Phaser.Input.Keyboard.Key;

  private virtual: VirtualInputState = {
    left: false,
    right: false,
    jumpPressed: false,
    attackPressed: false,
  };

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;

    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keyW = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keyJ = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
      this.keyK = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
      this.keyZ = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
      this.keyX = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
      this.keyC = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    }
  }

  /** API untuk touch controls (HUD): set state continous + trigger jump/attack. */
  setVirtual(state: Partial<VirtualInputState>): void {
    Object.assign(this.virtual, state);
  }

  update(): void {
    if (this.player.isDead) return;

    // ---- Horizontal ----
    const leftDown =
      this.virtual.left ||
      this.cursors?.left?.isDown ||
      this.keyA?.isDown;
    const rightDown =
      this.virtual.right ||
      this.cursors?.right?.isDown ||
      this.keyD?.isDown;

    if (leftDown && !rightDown) {
      this.player.moveLeft();
    } else if (rightDown && !leftDown) {
      this.player.moveRight();
    } else {
      this.player.setVelocityX(0);
    }

    // ---- Jump ----
    const jumpJustDown =
      this.virtual.jumpPressed ||
      Phaser.Input.Keyboard.JustDown(this.cursors!.up!) ||
      Phaser.Input.Keyboard.JustDown(this.cursors!.space!) ||
      Phaser.Input.Keyboard.JustDown(this.keyW);
    if (jumpJustDown) this.player.jump();

    // ---- Attack ----
    const attackJustDown =
      this.virtual.attackPressed ||
      Phaser.Input.Keyboard.JustDown(this.keyJ) ||
      Phaser.Input.Keyboard.JustDown(this.keyK);
    if (attackJustDown) this.player.attack();

    // ---- Mode switch ----
    if (this.virtual.switchMode) {
      this.player.setMode(this.virtual.switchMode);
      this.virtual.switchMode = undefined;
    }
    if (Phaser.Input.Keyboard.JustDown(this.keyZ)) this.player.setMode('blop');
    if (Phaser.Input.Keyboard.JustDown(this.keyX)) this.player.setMode('fire');
    if (Phaser.Input.Keyboard.JustDown(this.keyC)) this.player.setMode('water');

    // Single-shot virtual flags reset
    this.virtual.jumpPressed = false;
    this.virtual.attackPressed = false;

    // Update animation berdasarkan state physics terkini
    this.player.updateAnimation();
  }
}
