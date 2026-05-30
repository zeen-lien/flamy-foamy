import Phaser from 'phaser';
import { FONT } from '../ui/fonts';

/**
 * BossHpBar — bar HP boss di top-center. Compact, vivid, jelas terbaca.
 */
export class BossHpBar extends Phaser.GameObjects.Container {
  private bg!: Phaser.GameObjects.Graphics;
  private fill!: Phaser.GameObjects.Graphics;
  private label!: Phaser.GameObjects.Text;
  private wPx: number;
  private hPx = 14;
  private ratio = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, name: string, width = 360) {
    super(scene, x, y);
    scene.add.existing(this);
    this.wPx = width;

    this.bg = scene.add.graphics();
    this.fill = scene.add.graphics();
    this.add([this.bg, this.fill]);

    this.label = scene.add
      .text(0, -this.hPx / 2 - 13, name.toUpperCase(), {
        fontFamily: FONT.HEAVY,
        fontSize: '13px',
        color: '#ffd8c0',
      })
      .setOrigin(0.5)
      .setLetterSpacing(3)
      .setShadow(0, 2, '#000000', 4, true, true);
    this.add(this.label);

    this.redraw();
    this.setAlpha(0);
    scene.tweens.add({ targets: this, alpha: 1, duration: 350, ease: 'Sine.easeOut' });
  }

  setRatio(r: number): void {
    const clamped = Phaser.Math.Clamp(r, 0, 1);
    if (Math.abs(clamped - this.ratio) < 0.0005) return;
    const decreased = clamped < this.ratio;
    this.ratio = clamped;
    this.redraw();
    if (decreased) {
      this.scene.tweens.killTweensOf(this.fill);
      this.fill.x = 0;
      this.scene.tweens.add({
        targets: this.fill,
        x: { from: -3, to: 3 },
        duration: 35,
        yoyo: true,
        repeat: 2,
        onComplete: () => { this.fill.x = 0; },
      });
    }
  }

  private redraw(): void {
    const w = this.wPx;
    const h = this.hPx;
    const r = h / 2;

    // Frame
    this.bg.clear();
    this.bg.fillStyle(0x0d111a, 0.92);
    this.bg.fillRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, r + 3);
    this.bg.lineStyle(2, 0xffd84d, 0.9);
    this.bg.strokeRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, r + 3);
    // Empty track (gelap merah)
    this.bg.fillStyle(0x3a1418, 1);
    this.bg.fillRoundedRect(-w / 2, -h / 2, w, h, r);

    // Fill
    this.fill.clear();
    const fw = Math.max(0, w * this.ratio);
    if (fw > 2) {
      this.fill.fillStyle(0xff3b3b, 1);
      this.fill.fillRoundedRect(-w / 2, -h / 2, fw, h, r);
      this.fill.fillStyle(0xff9a4d, 0.85);
      this.fill.fillRoundedRect(-w / 2, -h / 2, fw, h * 0.45, { tl: r, tr: 0, bl: 0, br: 0 });
      this.fill.fillStyle(0xffffff, 0.35);
      this.fill.fillRect(-w / 2 + 2, -h / 2 + 1, fw - 4, 2);
    }
  }
}
