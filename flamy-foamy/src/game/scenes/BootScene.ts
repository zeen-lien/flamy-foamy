import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    this.cameras.main.setBackgroundColor('#0a0a14');

    const title = this.add
      .text(cx, cy - 40, 'FLAMY & FOAMY', {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '64px',
        color: '#ffd84d',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy + 40, 'Booting…', {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '24px',
        color: '#9aa0b4',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: title,
      alpha: { from: 0.4, to: 1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });
  }
}
