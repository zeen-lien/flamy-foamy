import Phaser from 'phaser';

/**
 * Trap (jebakan) — 100% code-drawn (no PNG). Toggle on/off berkala.
 *
 * 3 varian visual:
 *  1. SPIKE_TRAP  : spike yang nyembul dari lubang (naik saat on)
 *  2. SAW         : gergaji bundar berputar yang muncul saat on
 *  3. FLAME       : semburan api dari ground saat on
 *
 * Ada warning (~0.6s) sebelum on: indikator merah berkedip biar fair.
 * `isLethal()` = true cuma saat fase "on".
 */

export type TrapVariant = 1 | 2 | 3;

export interface TrapOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;          // bottom y (di permukaan)
  variant?: TrapVariant;
  width?: number;     // lebar area trap
  onDuration?: number;
  offDuration?: number;
  startDelay?: number;
}

type Phase = 'off' | 'warn' | 'on';

export class Trap extends Phaser.GameObjects.Container {
  declare body: Phaser.Physics.Arcade.Body;

  private variant: TrapVariant;
  private widthPx: number;
  private onDuration: number;
  private offDuration: number;
  private phase: Phase = 'off';

  private baseGfx: Phaser.GameObjects.Graphics;   // bagian statis (lubang/base)
  private activeGfx: Phaser.GameObjects.Graphics; // bagian bahaya (naik/turun/spin)
  private warnGfx: Phaser.GameObjects.Graphics;

  private activeAmount = 0; // 0 = tersembunyi, 1 = full keluar
  private sawAngle = 0;
  private cycleTimer?: Phaser.Time.TimerEvent;

  constructor(opts: TrapOptions) {
    super(opts.scene, opts.x, opts.y);
    opts.scene.add.existing(this);

    this.variant = opts.variant ?? 1;
    this.widthPx = opts.width ?? 70;
    this.onDuration = opts.onDuration ?? 2000;
    this.offDuration = opts.offDuration ?? 2600;

    this.baseGfx = opts.scene.add.graphics();
    this.activeGfx = opts.scene.add.graphics();
    this.warnGfx = opts.scene.add.graphics();
    this.add([this.activeGfx, this.baseGfx, this.warnGfx]);

    this.drawBase();

    // Physics overlap body — area bahaya (di atas base)
    opts.scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    const bw = this.widthPx * 0.85;
    const bh = 40;
    this.body.setSize(bw, bh);
    this.body.setOffset(-bw / 2, -bh);

    opts.scene.time.delayedCall(opts.startDelay ?? 0, () => this.goOff());
  }

  /** Dipanggil scene tiap frame untuk animasi (saw spin, naik-turun). */
  tick(delta: number): void {
    if (this.variant === 2 && this.phase === 'on') {
      this.sawAngle += delta * 0.02;
    }
    this.drawActive();
  }

  isLethal(): boolean {
    return this.phase === 'on';
  }

  // ---------------- Cycle ----------------

  private goOff(): void {
    this.phase = 'off';
    this.warnGfx.clear();
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      activeAmount: 0,
      duration: 200,
      ease: 'Sine.easeIn',
    });
    this.cycleTimer = this.scene.time.delayedCall(this.offDuration, () => this.goWarn());
  }

  private goWarn(): void {
    this.phase = 'warn';
    const warnDur = 600;
    // Indikator merah berkedip
    let blinkOn = true;
    const blinkEvt = this.scene.time.addEvent({
      delay: 100,
      repeat: Math.floor(warnDur / 100),
      callback: () => {
        blinkOn = !blinkOn;
        this.warnGfx.clear();
        this.warnGfx.fillStyle(0xff3b3b, blinkOn ? 0.5 : 0.15);
        this.warnGfx.fillCircle(0, -10, this.widthPx * 0.5);
      },
    });
    void blinkEvt;
    this.cycleTimer = this.scene.time.delayedCall(warnDur, () => this.goOn());
  }

  private goOn(): void {
    this.phase = 'on';
    this.warnGfx.clear();
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      activeAmount: 1,
      duration: 140,
      ease: 'Back.easeOut',
    });
    this.cycleTimer = this.scene.time.delayedCall(this.onDuration, () => this.goOff());
  }

  destroyTrap(): void {
    this.cycleTimer?.remove(false);
    this.destroy();
  }

  // ---------------- Drawing ----------------

  private drawBase(): void {
    const w = this.widthPx;
    const g = this.baseGfx;
    g.clear();
    if (this.variant === 1) {
      // Lubang gelap tempat spike keluar
      g.fillStyle(0x1a1622, 1);
      g.fillRoundedRect(-w / 2, -8, w, 14, 4);
      g.lineStyle(1, 0x000000, 0.6);
      g.strokeRoundedRect(-w / 2, -8, w, 14, 4);
    } else if (this.variant === 2) {
      // Slot gergaji (garis gelap)
      g.fillStyle(0x1a1622, 1);
      g.fillRect(-w / 2, -6, w, 10);
    } else {
      // Nozzle api (3 lubang)
      g.fillStyle(0x33291a, 1);
      g.fillRoundedRect(-w / 2, -8, w, 12, 3);
      g.fillStyle(0x000000, 0.5);
      for (let i = 0; i < 3; i++) {
        const x = -w / 2 + (i + 0.5) * (w / 3);
        g.fillCircle(x, -2, 3);
      }
    }
  }

  private drawActive(): void {
    const w = this.widthPx;
    const g = this.activeGfx;
    const amt = this.activeAmount;
    g.clear();
    if (amt <= 0.02) return;

    if (this.variant === 1) {
      // SPIKE nyembul ke atas
      const maxH = 34;
      const h = maxH * amt;
      const count = Math.max(2, Math.floor(w / 16));
      const sw = w / count;
      for (let i = 0; i < count; i++) {
        const sx = -w / 2 + (i + 0.5) * sw;
        const tip = { x: sx, y: -h };
        const left = { x: sx - sw / 2 + 1, y: 0 };
        const right = { x: sx + sw / 2 - 1, y: 0 };
        g.fillStyle(0xc8ccdc, 1);
        g.fillTriangle(tip.x, tip.y, left.x, left.y, right.x, right.y);
        g.fillStyle(0xffffff, 0.4);
        g.fillTriangle(tip.x, tip.y, left.x, left.y, sx, 0);
        g.lineStyle(1, 0x2a2435, 0.8);
        g.strokeTriangle(tip.x, tip.y, left.x, left.y, right.x, right.y);
      }
    } else if (this.variant === 2) {
      // SAW gergaji bundar berputar, naik dari slot
      const maxRise = 26;
      const cy = -maxRise * amt;
      const r = w * 0.42;
      g.fillStyle(0x9aa0b4, 1);
      g.fillCircle(0, cy, r);
      // Gerigi
      g.fillStyle(0xc8ccdc, 1);
      const teeth = 12;
      for (let i = 0; i < teeth; i++) {
        const a = this.sawAngle + (i / teeth) * Math.PI * 2;
        const tx = Math.cos(a) * (r + 5);
        const ty = cy + Math.sin(a) * (r + 5);
        const a2 = a + 0.18;
        const bx = Math.cos(a2) * r;
        const by = cy + Math.sin(a2) * r;
        const a3 = a - 0.18;
        const cx2 = Math.cos(a3) * r;
        const cy2 = cy + Math.sin(a3) * r;
        g.fillTriangle(tx, ty, bx, by, cx2, cy2);
      }
      // Hub tengah
      g.fillStyle(0x4a4054, 1);
      g.fillCircle(0, cy, r * 0.35);
      g.fillStyle(0x2a2435, 1);
      g.fillCircle(0, cy, r * 0.15);
    } else {
      // FLAME semburan api
      const maxH = 46;
      const h = maxH * amt;
      const count = 3;
      for (let i = 0; i < count; i++) {
        const fx = -w / 2 + (i + 0.5) * (w / count);
        // Flame body (orange)
        g.fillStyle(0xff6a3d, 0.9);
        g.fillTriangle(fx - 8, 0, fx + 8, 0, fx + (Math.random() - 0.5) * 4, -h);
        // Inner (kuning)
        g.fillStyle(0xfde68a, 0.9);
        g.fillTriangle(fx - 4, 0, fx + 4, 0, fx, -h * 0.6);
      }
    }
  }
}
