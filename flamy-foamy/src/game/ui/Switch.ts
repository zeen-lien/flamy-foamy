import Phaser from 'phaser';
import { COLOR } from './Button';
import { FONT } from './fonts';

/**
 * Switch — toggle on/off pill.
 * Klik = flip state. onChange dipanggil tiap state berubah.
 */

export interface SwitchOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  value?: boolean;
  accentColor?: number;
  onChange: (v: boolean) => void;
}

const SWITCH_W = 56;
const SWITCH_H = 28;

export class Switch extends Phaser.GameObjects.Container {
  private bg!: Phaser.GameObjects.Graphics;
  private knob!: Phaser.GameObjects.Graphics;
  private label!: Phaser.GameObjects.Text;
  private accent: number;
  private value: boolean;
  private onChangeFn: (v: boolean) => void;

  constructor(opts: SwitchOptions) {
    super(opts.scene, opts.x, opts.y);
    opts.scene.add.existing(this);
    this.value = opts.value ?? false;
    this.accent = opts.accentColor ?? COLOR.MINT;
    this.onChangeFn = opts.onChange;

    this.bg = opts.scene.add.graphics();
    this.knob = opts.scene.add.graphics();
    this.label = opts.scene.add
      .text(0, 0, this.value ? 'ON' : 'OFF', {
        fontFamily: FONT.HEAVY,
        fontSize: '11px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setLetterSpacing(2);
    this.add([this.bg, this.knob, this.label]);

    this.draw();

    this.setSize(SWITCH_W, SWITCH_H);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-SWITCH_W / 2, -SWITCH_H / 2, SWITCH_W, SWITCH_H),
      Phaser.Geom.Rectangle.Contains,
    );
    this.input!.cursor = 'pointer';

    this.on(Phaser.Input.Events.POINTER_UP, () => this.toggle());
  }

  toggle(): void {
    this.value = !this.value;
    this.animateTo();
    this.onChangeFn(this.value);
  }

  setValue(v: boolean, fire = false): void {
    if (v === this.value) return;
    this.value = v;
    this.animateTo();
    if (fire) this.onChangeFn(this.value);
  }

  getValue(): boolean {
    return this.value;
  }

  private animateTo(): void {
    this.label.setText(this.value ? 'ON' : 'OFF');
    this.scene.tweens.killTweensOf(this);
    // re-draw bg + knob via simple redraw (no tween of geometry karena Graphics)
    this.draw(true);
  }

  private draw(animateKnob = false): void {
    const r = SWITCH_H / 2;

    this.bg.clear();
    if (this.value) {
      this.bg.fillStyle(this.accent, 0.85);
    } else {
      this.bg.fillStyle(0x2a3046, 0.85);
    }
    this.bg.fillRoundedRect(-SWITCH_W / 2, -SWITCH_H / 2, SWITCH_W, SWITCH_H, r);
    this.bg.lineStyle(1, COLOR.WHITE, this.value ? 0.5 : 0.2);
    this.bg.strokeRoundedRect(-SWITCH_W / 2, -SWITCH_H / 2, SWITCH_W, SWITCH_H, r);

    const knobR = SWITCH_H / 2 - 4;
    const knobX = this.value ? SWITCH_W / 2 - r : -SWITCH_W / 2 + r;

    this.knob.clear();
    this.knob.fillStyle(0xffffff, 1);
    this.knob.fillCircle(knobX, 0, knobR);

    // Position label opposite of knob
    const labelX = this.value ? -r * 0.4 : r * 0.4;
    if (animateKnob) {
      this.scene.tweens.add({
        targets: this.label,
        x: labelX,
        duration: 160,
        ease: 'Sine.easeOut',
      });
    } else {
      this.label.x = labelX;
    }
  }
}
