import Phaser from 'phaser';
import { COLOR } from '../ui/Button';
import { FONT } from '../ui/fonts';

/**
 * StoneBadge — hexagonal panel dengan stone icon (kristal) + counter
 * "X / target" + deretan dot kecil di bawah yang nyala sesuai progress.
 *
 * Warna ikut elemen level (cokelat batu / orange api / cyan air).
 */

export interface StoneBadgeOptions {
  width?: number;
  height?: number;
  target: number;
  accentColor: number;
}

export class StoneBadge extends Phaser.GameObjects.Container {
  private bg!: Phaser.GameObjects.Graphics;
  private icon!: Phaser.GameObjects.Graphics;
  private counter!: Phaser.GameObjects.Text;
  private dotsGfx!: Phaser.GameObjects.Graphics;

  private value = 0;
  private target: number;
  private accent: number;
  private wPx: number;
  private hPx: number;

  constructor(scene: Phaser.Scene, x: number, y: number, opts: StoneBadgeOptions) {
    super(scene, x, y);
    scene.add.existing(this);
    this.wPx = opts.width ?? 150;
    this.hPx = opts.height ?? 42;
    this.target = opts.target;
    this.accent = opts.accentColor;

    this.bg = scene.add.graphics();
    this.icon = scene.add.graphics();
    this.dotsGfx = scene.add.graphics();
    this.add([this.bg, this.icon, this.dotsGfx]);

    this.counter = scene.add
      .text(0, -3, `0/${this.target}`, {
        fontFamily: FONT.HEAVY,
        fontSize: '15px',
        color: '#ffffff',
      })
      .setOrigin(0, 0.5)
      .setLetterSpacing(2);
    this.add(this.counter);

    this.draw();
  }

  setValue(v: number): void {
    const newVal = Phaser.Math.Clamp(v, 0, this.target);
    if (newVal === this.value) return;
    this.value = newVal;
    this.counter.setText(`${this.value}/${this.target}`);
    this.drawDots();
    // Pop icon
    this.scene.tweens.add({
      targets: this.icon,
      scaleX: { from: 1.3, to: 1 },
      scaleY: { from: 1.3, to: 1 },
      duration: 320,
      ease: 'Back.easeOut',
    });
  }

  setTarget(t: number): void {
    this.target = t;
    this.value = Math.min(this.value, t);
    this.counter.setText(`${this.value}/${this.target}`);
    this.drawDots();
  }

  private hexPoints(cx: number, cy: number, w: number, h: number): Array<{ x: number; y: number }> {
    // Hexagon horizontal (flat top/bottom, runcing kiri-kanan tipis)
    const cutW = h * 0.45;
    return [
      { x: cx - w / 2 + cutW, y: cy - h / 2 },
      { x: cx + w / 2 - cutW, y: cy - h / 2 },
      { x: cx + w / 2, y: cy },
      { x: cx + w / 2 - cutW, y: cy + h / 2 },
      { x: cx - w / 2 + cutW, y: cy + h / 2 },
      { x: cx - w / 2, y: cy },
    ];
  }

  private draw(): void {
    const w = this.wPx;
    const h = this.hPx;
    const points = this.hexPoints(0, 0, w, h);

    this.bg.clear();
    // Shadow
    this.bg.fillStyle(0x000000, 0.45);
    this.bg.fillPoints(points.map((p) => ({ x: p.x + 2, y: p.y + 3 })), true);
    // Body glass
    this.bg.fillStyle(COLOR.GLASS_BG, 0.9);
    this.bg.fillPoints(points, true);
    // Border accent
    this.bg.lineStyle(2, this.accent, 0.85);
    this.bg.strokePoints(points, true);
    // Inner subtle highlight (atas)
    this.bg.fillStyle(COLOR.WHITE, 0.06);
    this.bg.fillPoints(
      [
        { x: points[0].x + 4, y: points[0].y + 2 },
        { x: points[1].x - 4, y: points[1].y + 2 },
        { x: points[1].x - 4, y: 0 },
        { x: points[0].x + 4, y: 0 },
      ],
      true,
    );

    // ----- Stone icon (diamond/kristal) -----
    const iconCx = -w / 2 + h * 0.7;
    const iconY = -3;
    this.icon.clear();

    // Outer kristal
    const k = h * 0.32;
    const top = { x: iconCx, y: iconY - k };
    const right = { x: iconCx + k * 0.7, y: iconY - k * 0.2 };
    const bot = { x: iconCx, y: iconY + k };
    const left = { x: iconCx - k * 0.7, y: iconY - k * 0.2 };
    const midR = { x: iconCx + k * 0.35, y: iconY - k * 0.55 };
    const midL = { x: iconCx - k * 0.35, y: iconY - k * 0.55 };

    // Solid bg crystal
    this.icon.fillStyle(this.accent, 0.6);
    this.icon.fillPoints([top, right, bot, left], true);

    // Facets (3 garis ke top)
    this.icon.lineStyle(1.5, this.accent, 1);
    this.icon.strokePoints([top, right, bot, left], true);
    this.icon.lineBetween(top.x, top.y, midL.x, midL.y);
    this.icon.lineBetween(top.x, top.y, midR.x, midR.y);
    this.icon.lineBetween(midL.x, midL.y, midR.x, midR.y);

    // Highlight putih
    this.icon.fillStyle(0xffffff, 0.45);
    this.icon.fillPoints([top, midR, midL], true);

    // ----- Counter posisi -----
    this.counter.setPosition(iconCx + k + 8, iconY);

    // ----- Dots progress -----
    this.drawDots();
  }

  private drawDots(): void {
    const dotR = 2.2;
    const dotGap = 6;
    const dotsY = this.hPx / 2 - 6;
    const totalDots = this.target;
    const totalW = (totalDots - 1) * dotGap;
    const startX = -totalW / 2;

    this.dotsGfx.clear();
    for (let i = 0; i < totalDots; i++) {
      const x = startX + i * dotGap;
      if (i < this.value) {
        this.dotsGfx.fillStyle(this.accent, 1);
        this.dotsGfx.fillCircle(x, dotsY, dotR);
      } else {
        this.dotsGfx.fillStyle(0xffffff, 0.18);
        this.dotsGfx.fillCircle(x, dotsY, dotR);
      }
    }
  }
}
