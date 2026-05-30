import Phaser from 'phaser';
import { COLOR } from '../ui/Button';
import { FONT } from '../ui/fonts';

/**
 * CoinBadge — circular gold badge dengan coin icon di kiri + counter
 * yang animate (count up) saat value berubah.
 */

export class CoinBadge extends Phaser.GameObjects.Container {
  private bg!: Phaser.GameObjects.Graphics;
  private icon!: Phaser.GameObjects.Graphics;
  private counter!: Phaser.GameObjects.Text;
  private value = 0;
  private displayValue = 0;
  private wPx: number;
  private hPx: number;

  constructor(scene: Phaser.Scene, x: number, y: number, opts: { width?: number; height?: number } = {}) {
    super(scene, x, y);
    scene.add.existing(this);
    this.wPx = opts.width ?? 130;
    this.hPx = opts.height ?? 36;

    this.bg = scene.add.graphics();
    this.icon = scene.add.graphics();
    this.add([this.bg, this.icon]);

    this.counter = scene.add
      .text(0, 0, '0', {
        fontFamily: FONT.HEAVY,
        fontSize: '17px',
        color: '#ffe27a',
      })
      .setOrigin(0, 0.5)
      .setLetterSpacing(2);
    this.add(this.counter);

    this.draw();
  }

  setValue(v: number, animate = true): void {
    this.value = v;
    if (!animate) {
      this.displayValue = v;
      this.counter.setText(String(v));
      return;
    }
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      displayValue: v,
      duration: 400,
      ease: 'Sine.easeOut',
      onUpdate: () => this.counter.setText(String(Math.round(this.displayValue))),
    });
    // Pop
    this.scene.tweens.add({
      targets: this.icon,
      scaleX: { from: 1.25, to: 1 },
      scaleY: { from: 1.25, to: 1 },
      duration: 280,
      ease: 'Back.easeOut',
    });
  }

  getValue(): number {
    return this.value;
  }

  private draw(): void {
    const w = this.wPx;
    const h = this.hPx;
    const r = h / 2;

    this.bg.clear();
    // Drop shadow
    this.bg.fillStyle(0x000000, 0.45);
    this.bg.fillRoundedRect(-w / 2 + 2, -h / 2 + 3, w, h, r);
    // Body glass
    this.bg.fillStyle(COLOR.GLASS_BG, 0.9);
    this.bg.fillRoundedRect(-w / 2, -h / 2, w, h, r);
    // Border emas
    this.bg.lineStyle(2, 0xfbbf24, 0.85);
    this.bg.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
    // Inner highlight glossy top
    this.bg.fillStyle(COLOR.WHITE, 0.08);
    this.bg.fillRoundedRect(-w / 2 + 2, -h / 2 + 2, w - 4, h / 2 - 2, { tl: r, tr: r, bl: 0, br: 0 });

    // ----- Coin icon (circular gold dengan rim & accent) -----
    const iconCx = -w / 2 + h * 0.55;
    const iconR = h * 0.42;

    this.icon.clear();
    // Outer rim
    this.icon.fillStyle(0x8c5a0d, 1);
    this.icon.fillCircle(iconCx, 0, iconR + 2);
    // Body
    this.icon.fillStyle(0xfbbf24, 1);
    this.icon.fillCircle(iconCx, 0, iconR);
    // Highlight
    this.icon.fillStyle(0xfde68a, 0.85);
    this.icon.fillCircle(iconCx - iconR * 0.25, -iconR * 0.25, iconR * 0.4);
    // "$" / "C" stylized di tengah
    this.icon.lineStyle(2, 0x8c5a0d, 1);
    this.icon.beginPath();
    this.icon.arc(iconCx, 0, iconR * 0.45, Phaser.Math.DegToRad(40), Phaser.Math.DegToRad(320), false);
    this.icon.strokePath();

    // ----- Counter posisi di kanan icon -----
    this.counter.setPosition(iconCx + iconR + 8, 0);
  }
}
