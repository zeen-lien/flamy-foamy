import Phaser from 'phaser';
import type { PlayerMode } from '../config';
import { TEX } from '../config/keys';
import { COLOR } from '../ui/Button';

/**
 * ModeSwitcher — 3 tombol PNG (Blop/Flamy/Foamy) dengan jarak antar tombol.
 * Mode aktif: scale up + glow ring di belakang sesuai elemen.
 * Mode locked: tinted gelap + padlock overlay.
 */

const TEX_BY_MODE: Record<PlayerMode, string> = {
  blop: TEX.BTN_SWITCH_BATU,
  fire: TEX.BTN_SWITCH_API,
  water: TEX.BTN_SWITCH_AIR,
};

const ACCENT_BY_MODE: Record<PlayerMode, number> = {
  blop: 0xb8a578,
  fire: 0xff6a3d,
  water: 0x4dc6ff,
};

export interface ModeSwitcherOptions {
  current: PlayerMode;
  unlocked: { fire: boolean; water: boolean };
  onSwitch: (mode: PlayerMode) => void;
  onLockedAttempt?: (mode: PlayerMode) => void;
  /** Diameter target tombol (pixel). Default 64. */
  buttonSize?: number;
  /** Jarak horizontal antar pusat tombol (pixel). Default 90. */
  spacing?: number;
}

interface ModeCell {
  mode: PlayerMode;
  container: Phaser.GameObjects.Container;
  glowGfx: Phaser.GameObjects.Graphics;
  img: Phaser.GameObjects.Image;
  lockOverlay?: Phaser.GameObjects.Graphics;
  unlockedRef: () => boolean;
}

export class ModeSwitcher extends Phaser.GameObjects.Container {
  private cells: ModeCell[] = [];
  private current: PlayerMode;
  private unlocked: { fire: boolean; water: boolean };
  private onSwitchFn: (m: PlayerMode) => void;
  private onLockedFn?: (m: PlayerMode) => void;

  private buttonSize: number;
  private spacing: number;

  constructor(scene: Phaser.Scene, x: number, y: number, opts: ModeSwitcherOptions) {
    super(scene, x, y);
    scene.add.existing(this);
    this.current = opts.current;
    this.unlocked = opts.unlocked;
    this.onSwitchFn = opts.onSwitch;
    this.onLockedFn = opts.onLockedAttempt;
    this.buttonSize = opts.buttonSize ?? 64;
    this.spacing = opts.spacing ?? 90;

    const order: PlayerMode[] = ['blop', 'fire', 'water'];
    const totalW = (order.length - 1) * this.spacing;
    const startX = -totalW / 2;

    order.forEach((mode, i) => {
      const cellX = startX + i * this.spacing;
      const cellContainer = scene.add.container(cellX, 0);
      const glowGfx = scene.add.graphics();
      const tex = TEX_BY_MODE[mode];
      const img = scene.add.image(0, 0, tex).setOrigin(0.5);

      // Fit image ke buttonSize (height-based)
      const h = img.height;
      if (h > 0) img.setScale(this.buttonSize / h);

      cellContainer.add([glowGfx, img]);
      this.add(cellContainer);

      // Hit area = bounding box image
      cellContainer.setSize(img.displayWidth, img.displayHeight);
      cellContainer.setInteractive(
        new Phaser.Geom.Rectangle(
          -img.displayWidth / 2,
          -img.displayHeight / 2,
          img.displayWidth,
          img.displayHeight,
        ),
        Phaser.Geom.Rectangle.Contains,
      );
      cellContainer.input!.cursor = 'pointer';

      const isUnlocked = () =>
        mode === 'blop' ? true : mode === 'fire' ? this.unlocked.fire : this.unlocked.water;

      cellContainer.on(Phaser.Input.Events.POINTER_OVER, () => {
        if (this.current !== mode) {
          this.scene.tweens.add({
            targets: cellContainer,
            scaleX: 1.08,
            scaleY: 1.08,
            duration: 130,
            ease: 'Sine.easeOut',
          });
        }
      });
      cellContainer.on(Phaser.Input.Events.POINTER_OUT, () => {
        if (this.current !== mode) {
          this.scene.tweens.add({
            targets: cellContainer,
            scaleX: 1,
            scaleY: 1,
            duration: 130,
            ease: 'Sine.easeOut',
          });
        }
      });
      cellContainer.on(Phaser.Input.Events.POINTER_UP, () => {
        if (!isUnlocked()) {
          this.onLockedFn?.(mode);
          this.scene.tweens.add({
            targets: cellContainer,
            x: cellX + 6,
            duration: 60,
            yoyo: true,
            repeat: 3,
            onComplete: () => cellContainer.setX(cellX),
          });
          return;
        }
        if (mode !== this.current) this.onSwitchFn(mode);
      });

      this.cells.push({
        mode,
        container: cellContainer,
        glowGfx,
        img,
        unlockedRef: isUnlocked,
      });
    });

    this.redrawAll();
  }

  setCurrent(mode: PlayerMode): void {
    if (mode === this.current) return;
    this.current = mode;
    this.redrawAll();
  }

  setUnlocked(unlocked: { fire: boolean; water: boolean }): void {
    this.unlocked = unlocked;
    this.redrawAll();
  }

  private redrawAll(): void {
    for (const c of this.cells) {
      const isActive = c.mode === this.current;
      const unlocked = c.unlockedRef();
      const accent = ACCENT_BY_MODE[c.mode];

      // Glow ring di belakang tombol (hanya kalau active)
      c.glowGfx.clear();
      if (isActive && unlocked) {
        const r = this.buttonSize * 0.6;
        c.glowGfx.fillStyle(accent, 0.25);
        c.glowGfx.fillCircle(0, 0, r + 8);
        c.glowGfx.fillStyle(accent, 0.4);
        c.glowGfx.fillCircle(0, 0, r);
        c.glowGfx.lineStyle(2, accent, 0.85);
        c.glowGfx.strokeCircle(0, 0, r);
      }

      // Image tint & alpha
      if (!unlocked) {
        c.img.setTint(0x4a4a55);
        c.img.setAlpha(0.55);
      } else if (isActive) {
        c.img.clearTint();
        c.img.setAlpha(1);
      } else {
        c.img.clearTint();
        c.img.setAlpha(0.7);
      }

      // Lock overlay
      if (!unlocked) {
        if (!c.lockOverlay) {
          c.lockOverlay = this.scene.add.graphics();
          c.container.add(c.lockOverlay);
        }
        const lock = c.lockOverlay;
        lock.clear();
        const lx = 0;
        const ly = 0;
        // Padlock body
        lock.fillStyle(0x000000, 0.55);
        lock.fillCircle(lx, ly, 14);
        lock.fillStyle(0xa3a8b8, 1);
        lock.fillRoundedRect(lx - 7, ly - 1, 14, 11, 2);
        lock.lineStyle(2.5, 0xa3a8b8, 1);
        lock.beginPath();
        lock.arc(lx, ly - 2, 5, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false);
        lock.strokePath();
        lock.fillStyle(0x0d111a, 1);
        lock.fillCircle(lx, ly + 4, 1.5);
      } else if (c.lockOverlay) {
        c.lockOverlay.destroy();
        c.lockOverlay = undefined;
      }

      // Scale animate active
      this.scene.tweens.killTweensOf(c.container);
      this.scene.tweens.add({
        targets: c.container,
        scaleX: isActive ? 1.15 : 1,
        scaleY: isActive ? 1.15 : 1,
        duration: 220,
        ease: 'Back.easeOut',
      });

      // Pulse glow active
      if (isActive && unlocked) {
        this.scene.tweens.killTweensOf(c.glowGfx);
        c.glowGfx.setAlpha(1);
        this.scene.tweens.add({
          targets: c.glowGfx,
          alpha: { from: 1, to: 0.55 },
          duration: 1200,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      } else {
        this.scene.tweens.killTweensOf(c.glowGfx);
      }

      // Bring active container to top so glow & scale tidak ke-occlude
      if (isActive) this.bringToTop(c.container);
    }
  }
}

// Re-export accent for HUDScene reuse if needed
export { ACCENT_BY_MODE };
// Suppress unused COLOR import (kept for potential future styling)
void COLOR;
