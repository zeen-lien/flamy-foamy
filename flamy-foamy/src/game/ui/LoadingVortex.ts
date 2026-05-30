import Phaser from 'phaser';

/**
 * LoadingVortex — animated loader 100% from code.
 *
 * Layers (depth low -> high):
 *  1. Outer ring  : 3 arc segments (batu/api/air) dengan gap, rotate CW
 *  2. Middle ring : 16 small dashes, rotate CCW (lebih cepat)
 *  3. Inner ring  : single dashed circle, slow CW
 *  4. Center      : triangle rotating + pulsing, morph color cycling 3 elemen
 *  5. Pulse wave  : ring expanding outward dari center, fade out (di-emit periodic)
 *
 * Semua animasi via Phaser tweens (no update() loop) untuk performa.
 */

const ELEMENT_COLORS = {
  batu: 0xb8a578,
  api: 0xff6a3d,
  air: 0x4dc6ff,
} as const;

const COLORS_ORDER = [
  ELEMENT_COLORS.batu,
  ELEMENT_COLORS.api,
  ELEMENT_COLORS.air,
] as const;

export interface LoadingVortexOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  size?: number;   // diameter outer ring (default 140)
}

export class LoadingVortex extends Phaser.GameObjects.Container {
  private outerRing!: Phaser.GameObjects.Graphics;
  private middleRing!: Phaser.GameObjects.Graphics;
  private innerRing!: Phaser.GameObjects.Graphics;
  private centerTriangle!: Phaser.GameObjects.Graphics;
  private size: number;
  private pulseEmitTimer?: Phaser.Time.TimerEvent;
  private currentColorIdx = 0;

  constructor(opts: LoadingVortexOptions) {
    super(opts.scene, opts.x, opts.y);
    this.size = opts.size ?? 140;
    opts.scene.add.existing(this);

    this.buildOuterRing();
    this.buildMiddleRing();
    this.buildInnerRing();
    this.buildCenter();
    this.startPulseWaves();
  }

  // ============================================================ OUTER RING

  private buildOuterRing(): void {
    this.outerRing = this.scene.add.graphics();
    this.add(this.outerRing);

    const r = this.size / 2;
    const arcLen = Phaser.Math.DegToRad(90); // 90° per segment
    const gap = Phaser.Math.DegToRad(30);
    const lineW = 4;

    // 3 arc warna elemen, berjarak gap
    for (let i = 0; i < 3; i++) {
      const start = i * (arcLen + gap);
      this.outerRing.lineStyle(lineW, COLORS_ORDER[i], 0.95);
      this.outerRing.beginPath();
      this.outerRing.arc(0, 0, r, start, start + arcLen, false);
      this.outerRing.strokePath();
    }

    // Rotate CW
    this.scene.tweens.add({
      targets: this.outerRing,
      rotation: Math.PI * 2,
      duration: 4000,
      repeat: -1,
      ease: 'Linear',
    });
  }

  // ============================================================ MIDDLE RING

  private buildMiddleRing(): void {
    this.middleRing = this.scene.add.graphics();
    this.add(this.middleRing);

    const r = this.size * 0.36;
    const dashCount = 18;
    const dashAngle = Phaser.Math.DegToRad(360 / dashCount);
    const dashLen = dashAngle * 0.45;

    this.middleRing.lineStyle(2, 0xffffff, 0.55);
    for (let i = 0; i < dashCount; i++) {
      const start = i * dashAngle;
      this.middleRing.beginPath();
      this.middleRing.arc(0, 0, r, start, start + dashLen, false);
      this.middleRing.strokePath();
    }

    // Rotate CCW lebih cepat
    this.scene.tweens.add({
      targets: this.middleRing,
      rotation: -Math.PI * 2,
      duration: 2400,
      repeat: -1,
      ease: 'Linear',
    });
  }

  // ============================================================ INNER RING

  private buildInnerRing(): void {
    this.innerRing = this.scene.add.graphics();
    this.add(this.innerRing);

    const r = this.size * 0.22;
    const dashCount = 24;
    const dashAngle = Phaser.Math.DegToRad(360 / dashCount);
    const dashLen = dashAngle * 0.35;

    this.innerRing.lineStyle(1, 0xffffff, 0.35);
    for (let i = 0; i < dashCount; i++) {
      const start = i * dashAngle;
      this.innerRing.beginPath();
      this.innerRing.arc(0, 0, r, start, start + dashLen, false);
      this.innerRing.strokePath();
    }

    this.scene.tweens.add({
      targets: this.innerRing,
      rotation: Math.PI * 2,
      duration: 6000,
      repeat: -1,
      ease: 'Linear',
    });
  }

  // ============================================================ CENTER

  private buildCenter(): void {
    this.centerTriangle = this.scene.add.graphics();
    this.add(this.centerTriangle);
    this.drawTriangle(COLORS_ORDER[0]);

    // Rotation
    this.scene.tweens.add({
      targets: this.centerTriangle,
      rotation: Math.PI * 2,
      duration: 3500,
      repeat: -1,
      ease: 'Linear',
    });

    // Pulse scale
    this.scene.tweens.add({
      targets: this.centerTriangle,
      scale: { from: 0.85, to: 1.15 },
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Color cycle: ganti warna tiap 1.5s
    this.scene.time.addEvent({
      delay: 1500,
      loop: true,
      callback: () => {
        this.currentColorIdx = (this.currentColorIdx + 1) % COLORS_ORDER.length;
        this.drawTriangle(COLORS_ORDER[this.currentColorIdx]);
      },
    });
  }

  private drawTriangle(color: number): void {
    const r = this.size * 0.13;
    const g = this.centerTriangle;
    g.clear();

    // Triangle (equilateral pointing up)
    const points: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
      points.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
    }

    // Glow background (semi-transparent fill larger triangle)
    g.fillStyle(color, 0.35);
    const glowR = r * 1.6;
    const glowPts = points.map((p, i) => {
      const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
      return { x: Math.cos(a) * glowR, y: Math.sin(a) * glowR };
    });
    g.fillPoints(glowPts, true);

    // Solid triangle
    g.fillStyle(color, 1);
    g.fillPoints(points, true);

    // White core
    g.fillStyle(0xffffff, 0.9);
    const coreR = r * 0.45;
    const corePts = points.map((p, i) => {
      const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
      return { x: Math.cos(a) * coreR, y: Math.sin(a) * coreR };
    });
    g.fillPoints(corePts, true);
  }

  // ============================================================ PULSE WAVES

  private startPulseWaves(): void {
    // Setiap 700ms, emit ring expanding outward dari center -> fade out
    this.pulseEmitTimer = this.scene.time.addEvent({
      delay: 700,
      loop: true,
      callback: () => this.emitPulse(),
    });
    this.emitPulse(); // langsung satu di awal
  }

  private emitPulse(): void {
    const ring = this.scene.add.graphics();
    const startR = this.size * 0.18;
    const color = COLORS_ORDER[this.currentColorIdx];
    ring.lineStyle(1.5, color, 0.7);
    ring.strokeCircle(0, 0, startR);
    this.add(ring);
    this.bringToTop(this.centerTriangle); // center tetap di atas

    this.scene.tweens.add({
      targets: ring,
      scale: { from: 1, to: 2.6 },
      alpha: { from: 0.7, to: 0 },
      duration: 1400,
      ease: 'Sine.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  destroyVortex(): void {
    this.pulseEmitTimer?.remove(false);
    this.scene.tweens.killTweensOf(this.outerRing);
    this.scene.tweens.killTweensOf(this.middleRing);
    this.scene.tweens.killTweensOf(this.innerRing);
    this.scene.tweens.killTweensOf(this.centerTriangle);
    this.destroy();
  }
}
