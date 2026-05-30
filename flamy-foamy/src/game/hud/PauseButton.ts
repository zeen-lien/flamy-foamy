import Phaser from 'phaser';
import { COLOR } from '../ui/Button';

/**
 * PauseButton — octagonal glass button dengan ikon ‖ (pause bars).
 */

export class PauseButton extends Phaser.GameObjects.Container {
  private bg!: Phaser.GameObjects.Graphics;
  private icon!: Phaser.GameObjects.Graphics;
  private size: number;

  constructor(scene: Phaser.Scene, x: number, y: number, opts: { size?: number; onClick: () => void }) {
    super(scene, x, y);
    scene.add.existing(this);
    this.size = opts.size ?? 44;

    this.bg = scene.add.graphics();
    this.icon = scene.add.graphics();
    this.add([this.bg, this.icon]);

    this.draw(false);

    this.setSize(this.size, this.size);
    this.setInteractive(
      new Phaser.Geom.Polygon(this.octagonPoints(this.size)),
      Phaser.Geom.Polygon.Contains,
    );
    this.input!.cursor = 'pointer';

    this.on(Phaser.Input.Events.POINTER_OVER, () => {
      this.draw(true);
      scene.tweens.add({ targets: this, scaleX: 1.08, scaleY: 1.08, duration: 130 });
    });
    this.on(Phaser.Input.Events.POINTER_OUT, () => {
      this.draw(false);
      scene.tweens.add({ targets: this, scaleX: 1, scaleY: 1, duration: 130 });
    });
    this.on(Phaser.Input.Events.POINTER_UP, () => opts.onClick());
  }

  private octagonPoints(s: number): Array<{ x: number; y: number }> {
    const r = s / 2;
    const k = r * 0.42;
    return [
      { x: -k, y: -r }, { x: k, y: -r },
      { x: r, y: -k }, { x: r, y: k },
      { x: k, y: r }, { x: -k, y: r },
      { x: -r, y: k }, { x: -r, y: -k },
    ];
  }

  private draw(hover: boolean): void {
    const points = this.octagonPoints(this.size);
    this.bg.clear();
    // Shadow
    this.bg.fillStyle(0x000000, 0.45);
    this.bg.fillPoints(points.map((p) => ({ x: p.x + 1, y: p.y + 2 })), true);
    // Body
    this.bg.fillStyle(COLOR.GLASS_BG, hover ? 0.95 : 0.85);
    this.bg.fillPoints(points, true);
    // Border
    this.bg.lineStyle(1, 0xffffff, hover ? 0.55 : 0.25);
    this.bg.strokePoints(points, true);
    if (hover) {
      this.bg.lineStyle(1.5, COLOR.MINT, 0.85);
      const innerScale = 0.82;
      this.bg.strokePoints(points.map((p) => ({ x: p.x * innerScale, y: p.y * innerScale })), true);
    }

    // Pause bars
    this.icon.clear();
    const barW = this.size * 0.12;
    const barH = this.size * 0.4;
    const gap = this.size * 0.1;
    this.icon.fillStyle(0xffffff, 1);
    this.icon.fillRoundedRect(-gap - barW, -barH / 2, barW, barH, 2);
    this.icon.fillRoundedRect(gap, -barH / 2, barW, barH, 2);
  }
}
