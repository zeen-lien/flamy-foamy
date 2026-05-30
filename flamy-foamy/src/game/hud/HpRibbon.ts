import Phaser from 'phaser';
import { COLOR } from '../ui/Button';
import { FONT } from '../ui/fonts';

/**
 * HpRibbon — HP bar berbentuk ribbon dengan ujung runcing kiri,
 * heart icon di kepala, dan segment fill yang gradient warna mengikuti
 * persentase HP (hijau → kuning → merah).
 *
 * Bentuk ribbon dibikin pakai Graphics polygon (no PNG).
 */

export class HpRibbon extends Phaser.GameObjects.Container {
  private bg!: Phaser.GameObjects.Graphics;
  private fillGfx!: Phaser.GameObjects.Graphics;
  private heart!: Phaser.GameObjects.Graphics;
  private label!: Phaser.GameObjects.Text;

  private maxHp: number;
  private current: number;
  private widthPx: number;
  private heightPx: number;

  constructor(scene: Phaser.Scene, x: number, y: number, opts: { width?: number; height?: number; maxHp?: number; hp?: number }) {
    super(scene, x, y);
    scene.add.existing(this);
    this.widthPx = opts.width ?? 240;
    this.heightPx = opts.height ?? 30;
    this.maxHp = opts.maxHp ?? 200;
    this.current = opts.hp ?? 100;

    this.bg = scene.add.graphics();
    this.fillGfx = scene.add.graphics();
    this.heart = scene.add.graphics();
    this.add([this.bg, this.fillGfx, this.heart]);

    this.label = scene.add
      .text(0, 0, this.formatLabel(), {
        fontFamily: FONT.HEAVY,
        fontSize: '12px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setLetterSpacing(2);
    this.add(this.label);

    this.draw();
  }

  setHp(hp: number, max?: number): void {
    if (typeof max === 'number') this.maxHp = max;
    this.current = Phaser.Math.Clamp(hp, 0, this.maxHp);
    this.draw();
    this.label.setText(this.formatLabel());
  }

  setMaxHp(max: number): void {
    this.maxHp = max;
    this.current = Math.min(this.current, max);
    this.draw();
    this.label.setText(this.formatLabel());
  }

  private formatLabel(): string {
    return `${this.current} / ${this.maxHp}`;
  }

  private draw(): void {
    const w = this.widthPx;
    const h = this.heightPx;
    const tipW = h * 0.55;       // ujung runcing kiri
    const heartArea = h * 1.15;  // panel heart di kiri ribbon

    // Ribbon polygon points (origin di tengah container).
    // Layout horizontal: [heart bulat] -[ribbon dengan tip kiri & corner kanan]-
    const ribbonStartX = -w / 2 + heartArea;
    const ribbonEndX = w / 2;
    const top = -h / 2;
    const bot = h / 2;

    const ribbonPoints = [
      { x: ribbonStartX, y: top },                     // top-left
      { x: ribbonEndX - 4, y: top },                   // top-right
      { x: ribbonEndX, y: top + 4 },
      { x: ribbonEndX, y: bot - 4 },
      { x: ribbonEndX - 4, y: bot },                   // bottom-right
      { x: ribbonStartX, y: bot },                     // bottom-left
      { x: ribbonStartX - tipW, y: 0 },                // tip runcing kiri
    ];

    // ----- BG ribbon -----
    this.bg.clear();
    // Shadow drop
    this.bg.fillStyle(0x000000, 0.45);
    this.bg.fillPoints(ribbonPoints.map((p) => ({ x: p.x + 2, y: p.y + 3 })), true);
    // Body glass
    this.bg.fillStyle(COLOR.GLASS_BG, 0.85);
    this.bg.fillPoints(ribbonPoints, true);
    // Border tipis
    this.bg.lineStyle(1, COLOR.WHITE, 0.25);
    this.bg.strokePoints(ribbonPoints, true);

    // Inner notch decorative — 3 garis vertikal di kanan ujung
    this.bg.lineStyle(1, COLOR.WHITE, 0.12);
    for (let i = 0; i < 3; i++) {
      const nx = ribbonEndX - 8 - i * 4;
      this.bg.lineBetween(nx, top + 6, nx, bot - 6);
    }

    // ----- Fill (gradient warna sesuai HP) -----
    const ratio = this.maxHp > 0 ? this.current / this.maxHp : 0;
    const fillColor = this.colorByRatio(ratio);
    const innerLeft = ribbonStartX + 2;
    const innerRight = ribbonEndX - 4;
    const innerTop = top + 4;
    const innerBot = bot - 4;
    const innerW = innerRight - innerLeft;
    const fillW = Math.max(0, innerW * ratio);

    this.fillGfx.clear();
    if (fillW > 0) {
      this.fillGfx.fillStyle(fillColor, 0.95);
      this.fillGfx.fillRect(innerLeft, innerTop, fillW, innerBot - innerTop);
      // Glossy stripe atas
      this.fillGfx.fillStyle(0xffffff, 0.22);
      this.fillGfx.fillRect(innerLeft, innerTop, fillW, (innerBot - innerTop) / 3);
    }

    // ----- Heart icon (bulat di kiri ribbon) -----
    const heartCx = -w / 2 + heartArea / 2;
    const heartCy = 0;
    const heartR = h * 0.68;

    this.heart.clear();
    // Lingkaran badge background dengan accent merah
    this.heart.fillStyle(0x000000, 0.45);
    this.heart.fillCircle(heartCx + 2, heartCy + 3, heartR / 2 + 2);
    this.heart.fillStyle(0x1a0d18, 0.95);
    this.heart.fillCircle(heartCx, heartCy, heartR / 2);
    this.heart.lineStyle(2, 0xff5970, 1);
    this.heart.strokeCircle(heartCx, heartCy, heartR / 2);
    this.heart.lineStyle(1, COLOR.WHITE, 0.18);
    this.heart.strokeCircle(heartCx, heartCy, heartR / 2 - 3);

    // Heart shape via 2 lingkaran + segitiga
    const heartSize = heartR * 0.32;
    this.drawHeart(this.heart, heartCx, heartCy + 1, heartSize, 0xff5970);

    // ----- Label posisi di tengah ribbon -----
    this.label.setPosition((innerLeft + innerRight) / 2, 0);
  }

  private drawHeart(g: Phaser.GameObjects.Graphics, cx: number, cy: number, size: number, color: number): void {
    g.fillStyle(color, 1);
    // 2 lobus atas
    g.fillCircle(cx - size * 0.5, cy - size * 0.2, size * 0.5);
    g.fillCircle(cx + size * 0.5, cy - size * 0.2, size * 0.5);
    // Segitiga bawah (point ke bawah)
    g.fillTriangle(
      cx - size, cy - size * 0.05,
      cx + size, cy - size * 0.05,
      cx, cy + size,
    );
  }

  private colorByRatio(r: number): number {
    if (r > 0.6) return 0x4ade80;       // green
    if (r > 0.3) return 0xfbbf24;       // amber
    return 0xff5970;                     // rose
  }
}
