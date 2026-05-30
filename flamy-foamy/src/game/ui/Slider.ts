import Phaser from 'phaser';
import { COLOR } from './Button';
import { FONT } from './fonts';

/**
 * Slider — kontrol volume horizontal.
 *
 * Drag knob atau klik track. Memanggil `onChange(value)` setiap nilai berubah,
 * dan `onCommit(value)` saat user selesai drag/klik (untuk save ke storage).
 */

export interface SliderOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  width?: number;
  value?: number;          // 0..1
  accentColor?: number;
  enabled?: boolean;       // default true; disabled: alpha rendah & gak bisa drag
  onChange?: (v: number) => void;
  onCommit?: (v: number) => void;
}

const TRACK_HEIGHT = 6;
const KNOB_RADIUS = 11;

export class Slider extends Phaser.GameObjects.Container {
  private trackBg!: Phaser.GameObjects.Graphics;
  private trackFill!: Phaser.GameObjects.Graphics;
  private knob!: Phaser.GameObjects.Graphics;
  private knobHover!: Phaser.GameObjects.Graphics;
  private hitZone!: Phaser.GameObjects.Zone;
  private valueLabel!: Phaser.GameObjects.Text;

  private trackWidth: number;
  private accent: number;
  private enabled: boolean;
  private value: number;
  private dragging = false;

  private onChangeFn?: (v: number) => void;
  private onCommitFn?: (v: number) => void;

  constructor(opts: SliderOptions) {
    super(opts.scene, opts.x, opts.y);
    opts.scene.add.existing(this);

    this.trackWidth = opts.width ?? 220;
    this.accent = opts.accentColor ?? COLOR.MINT;
    this.enabled = opts.enabled ?? true;
    this.value = Phaser.Math.Clamp(opts.value ?? 0.5, 0, 1);
    this.onChangeFn = opts.onChange;
    this.onCommitFn = opts.onCommit;

    this.trackBg = opts.scene.add.graphics();
    this.trackFill = opts.scene.add.graphics();
    this.knobHover = opts.scene.add.graphics().setAlpha(0);
    this.knob = opts.scene.add.graphics();
    this.add([this.trackBg, this.trackFill, this.knobHover, this.knob]);

    // Numeric label (kanan track)
    this.valueLabel = opts.scene.add
      .text(this.trackWidth / 2 + 18, 0, this.percentText(), {
        fontFamily: FONT.HEAVY,
        fontSize: '14px',
        color: '#ffffff',
      })
      .setOrigin(0, 0.5)
      .setLetterSpacing(2);
    this.add(this.valueLabel);

    this.draw();

    // Hit zone (sedikit lebih tinggi dari track supaya gampang di-tap di mobile)
    const zoneH = KNOB_RADIUS * 2 + 12;
    this.hitZone = opts.scene.add
      .zone(0, 0, this.trackWidth + KNOB_RADIUS * 2, zoneH)
      .setOrigin(0.5);
    this.hitZone.setInteractive(
      new Phaser.Geom.Rectangle(
        -(this.trackWidth + KNOB_RADIUS * 2) / 2,
        -zoneH / 2,
        this.trackWidth + KNOB_RADIUS * 2,
        zoneH,
      ),
      Phaser.Geom.Rectangle.Contains,
    );
    if (this.enabled) this.hitZone.input!.cursor = 'pointer';
    this.add(this.hitZone);

    this.hitZone.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this);
    this.hitZone.on(Phaser.Input.Events.POINTER_OVER, () => this.setKnobHover(true));
    this.hitZone.on(Phaser.Input.Events.POINTER_OUT, () => {
      if (!this.dragging) this.setKnobHover(false);
    });
    opts.scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
    opts.scene.input.on(Phaser.Input.Events.POINTER_UP, this.onPointerUp, this);
    this.once(Phaser.Scenes.Events.DESTROY, () => {
      opts.scene.input.off(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
      opts.scene.input.off(Phaser.Input.Events.POINTER_UP, this.onPointerUp, this);
    });
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    this.alpha = on ? 1 : 0.4;
    if (this.hitZone.input) this.hitZone.input.cursor = on ? 'pointer' : 'default';
  }

  setValue(v: number, fire = true): void {
    const clamped = Phaser.Math.Clamp(v, 0, 1);
    if (clamped === this.value) return;
    this.value = clamped;
    this.draw();
    this.valueLabel.setText(this.percentText());
    if (fire) this.onChangeFn?.(this.value);
  }

  getValue(): number {
    return this.value;
  }

  private percentText(): string {
    return `${Math.round(this.value * 100)}`;
  }

  private setKnobHover(on: boolean): void {
    this.scene.tweens.killTweensOf(this.knobHover);
    this.scene.tweens.add({
      targets: this.knobHover,
      alpha: on ? 1 : 0,
      duration: 120,
      ease: 'Sine.easeOut',
    });
  }

  private draw(): void {
    const halfW = this.trackWidth / 2;

    this.trackBg.clear();
    this.trackBg.fillStyle(0x000000, 0.55);
    this.trackBg.fillRoundedRect(-halfW, -TRACK_HEIGHT / 2, this.trackWidth, TRACK_HEIGHT, TRACK_HEIGHT / 2);
    this.trackBg.lineStyle(1, COLOR.WHITE, 0.18);
    this.trackBg.strokeRoundedRect(-halfW, -TRACK_HEIGHT / 2, this.trackWidth, TRACK_HEIGHT, TRACK_HEIGHT / 2);

    // Filled portion
    this.trackFill.clear();
    const fillW = Math.max(0, this.trackWidth * this.value);
    if (fillW > 1) {
      this.trackFill.fillStyle(this.accent, 1);
      this.trackFill.fillRoundedRect(-halfW, -TRACK_HEIGHT / 2, fillW, TRACK_HEIGHT, TRACK_HEIGHT / 2);
    }

    // Knob
    const knobX = -halfW + fillW;
    this.knob.clear();
    this.knob.fillStyle(COLOR.GLASS_BG, 1);
    this.knob.fillCircle(knobX, 0, KNOB_RADIUS);
    this.knob.lineStyle(2, this.accent, 1);
    this.knob.strokeCircle(knobX, 0, KNOB_RADIUS);
    // Inner dot
    this.knob.fillStyle(this.accent, 0.85);
    this.knob.fillCircle(knobX, 0, KNOB_RADIUS - 5);

    // Knob hover (glow ring)
    this.knobHover.clear();
    this.knobHover.lineStyle(2, this.accent, 0.6);
    this.knobHover.strokeCircle(knobX, 0, KNOB_RADIUS + 5);
  }

  private onPointerDown(_p: Phaser.Input.Pointer, lx: number): void {
    if (!this.enabled) return;
    this.dragging = true;
    this.setKnobHover(true);
    this.applyLocalX(lx);
  }

  private onPointerMove(p: Phaser.Input.Pointer): void {
    if (!this.dragging) return;
    // Convert global pointer ke local x dari container
    const local = this.toLocalPoint(p.x, p.y);
    this.applyLocalX(local.x);
  }

  private onPointerUp(): void {
    if (!this.dragging) return;
    this.dragging = false;
    this.setKnobHover(false);
    this.onCommitFn?.(this.value);
  }

  private toLocalPoint(gx: number, gy: number): Phaser.Math.Vector2 {
    // Akun rotasi/scale parent. Pakai inverse matrix.
    const m = this.getWorldTransformMatrix();
    const inv = m.invert();
    const out = new Phaser.Math.Vector2();
    inv.transformPoint(gx, gy, out);
    return out;
  }

  private applyLocalX(lx: number): void {
    const halfW = this.trackWidth / 2;
    const ratio = Phaser.Math.Clamp((lx + halfW) / this.trackWidth, 0, 1);
    this.setValue(ratio);
  }
}
