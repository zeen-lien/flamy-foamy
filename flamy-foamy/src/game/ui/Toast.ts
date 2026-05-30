import Phaser from 'phaser';
import { COLOR } from './Button';
import { FONT } from './fonts';

/**
 * Toast — popup notif kecil yang muncul di atas tengah, fade out otomatis.
 * Multiple toast bertumpuk vertikal.
 */

const ACTIVE_TOASTS = new WeakMap<Phaser.Scene, Phaser.GameObjects.Container[]>();

export interface ToastOptions {
  scene: Phaser.Scene;
  message: string;
  duration?: number;       // ms before fade-out (default 2400)
  accentColor?: number;    // border accent (default rose/red for warning)
}

export function showToast(opts: ToastOptions): void {
  const scene = opts.scene;
  const accent = opts.accentColor ?? COLOR.ROSE;
  const duration = opts.duration ?? 2400;

  const container = scene.add.container(0, 0).setDepth(1000);

  const padX = 22;
  const padY = 14;

  const text = scene.add
    .text(0, 0, opts.message, {
      fontFamily: FONT.BODY,
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: 480 },
    })
    .setOrigin(0.5)
    .setLetterSpacing(1);

  const w = text.width + padX * 2;
  const h = text.height + padY * 2;
  const r = h / 2;

  const bg = scene.add.graphics();
  bg.fillStyle(COLOR.GLASS_BG, 0.94);
  bg.fillRoundedRect(-w / 2, -h / 2, w, h, r);
  bg.lineStyle(1, COLOR.WHITE, 0.18);
  bg.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
  bg.lineStyle(1.5, accent, 0.95);
  bg.strokeRoundedRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6, r - 3);

  container.add([bg, text]);

  // Track active toasts → reposition kalau ada multiple
  const list = ACTIVE_TOASTS.get(scene) ?? [];
  list.push(container);
  ACTIVE_TOASTS.set(scene, list);
  repositionAll(scene);

  // Animate in
  container.setAlpha(0);
  scene.tweens.add({
    targets: container,
    alpha: 1,
    duration: 200,
    ease: 'Sine.easeOut',
  });

  // Fade out + cleanup
  scene.time.delayedCall(duration, () => {
    scene.tweens.add({
      targets: container,
      alpha: 0,
      duration: 240,
      ease: 'Sine.easeIn',
      onComplete: () => {
        container.destroy();
        const remaining = (ACTIVE_TOASTS.get(scene) ?? []).filter((c) => c !== container);
        ACTIVE_TOASTS.set(scene, remaining);
        repositionAll(scene);
      },
    });
  });
}

function repositionAll(scene: Phaser.Scene): void {
  const list = ACTIVE_TOASTS.get(scene) ?? [];
  const cx = scene.scale.gameSize.width / 2;
  const baseY = 80;
  const gap = 12;

  list.forEach((c, i) => {
    // Each container's height ≈ (text height + padY*2). Approx 44px.
    scene.tweens.add({
      targets: c,
      x: cx,
      y: baseY + i * (44 + gap),
      duration: 200,
      ease: 'Sine.easeOut',
    });
  });
}
