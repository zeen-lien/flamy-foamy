import Phaser from 'phaser';
import { FONT } from '../ui/fonts';

/**
 * EnvText — teks naratif/hint yang fade-in saat player mendekat,
 * fade-out saat menjauh. Untuk tutorial halus & storytelling lingkungan.
 */

export interface EnvTextOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  text: string;
  triggerRadius?: number; // jarak aktivasi (default 220)
}

export class EnvText extends Phaser.GameObjects.Text {
  private triggerRadius: number;
  private shown = false;

  constructor(opts: EnvTextOptions) {
    super(opts.scene, opts.x, opts.y, opts.text, {
      fontFamily: FONT.BODY,
      fontSize: '16px',
      color: '#e6e8f0',
      align: 'center',
      fontStyle: 'italic',
    });
    opts.scene.add.existing(this);
    this.setOrigin(0.5);
    this.setAlpha(0);
    this.setShadow(0, 2, '#000000', 6, true, true);
    this.setDepth(6);
    this.triggerRadius = opts.triggerRadius ?? 220;
  }

  /** Dipanggil scene tiap frame dengan posisi player. */
  updateProximity(playerX: number, playerY: number): void {
    const dist = Phaser.Math.Distance.Between(playerX, playerY, this.x, this.y);
    const near = dist < this.triggerRadius;
    if (near && !this.shown) {
      this.shown = true;
      this.scene.tweens.killTweensOf(this);
      this.scene.tweens.add({
        targets: this,
        alpha: 1,
        y: this.y - 6,
        duration: 400,
        ease: 'Sine.easeOut',
      });
    } else if (!near && this.shown) {
      this.shown = false;
      this.scene.tweens.killTweensOf(this);
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        y: this.y + 6,
        duration: 400,
        ease: 'Sine.easeIn',
      });
    }
  }
}
