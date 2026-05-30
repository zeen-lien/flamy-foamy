import Phaser from 'phaser';

/**
 * Button system murni dari kode (no PNG asset).
 *
 * Render strategy:
 *  - BG di-draw SEKALI di constructor (idle visual). Tidak di-redraw saat hover.
 *  - Hover overlay (border accent + tint) adalah Graphics terpisah dengan
 *    alpha 0 saat idle, di-tween ke 1 saat hover. Bersih, no flash.
 *  - Hit area = full bentuk button (Rectangle untuk pill, Circle untuk circle).
 *  - useHandCursor selalu aktif supaya cursor jelas.
 */

export const COLOR = {
  GLASS_BG: 0x0d111a,
  WHITE: 0xffffff,
  MINT: 0x5eead4,
  MINT_DEEP: 0x14b8a6,
  ROSE: 0xfb7185,
  AMBER: 0xfbbf24,
  ICE: 0x93c5fd,
  LIME: 0x86efac,
  ORANGE: 0xfb923c,
  CYAN: 0x67e8f9,
} as const;

export type IconDrawer = (g: Phaser.GameObjects.Graphics, size: number) => void;

// ============================================================
// PRIMARY BUTTON (CTA besar â€” pill shape)
// ============================================================

export interface PrimaryButtonOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  label: string;
  width?: number;
  height?: number;
  onClick: () => void;
  accentColor?: number;
}

export class PrimaryButton extends Phaser.GameObjects.Container {
  private bgIdle!: Phaser.GameObjects.Graphics;
  private bgHover!: Phaser.GameObjects.Graphics;
  private labelText!: Phaser.GameObjects.Text;
  private bw: number;
  private bh: number;
  private accent: number;

  constructor(opts: PrimaryButtonOptions) {
    super(opts.scene, opts.x, opts.y);
    this.bw = opts.width ?? 240;
    this.bh = opts.height ?? 50;
    this.accent = opts.accentColor ?? COLOR.MINT;
    opts.scene.add.existing(this);

    this.bgIdle = opts.scene.add.graphics();
    this.bgHover = opts.scene.add.graphics().setAlpha(0);
    this.add([this.bgIdle, this.bgHover]);

    this.drawIdle();
    this.drawHover();

    this.labelText = opts.scene.add
      .text(0, 0, opts.label.toUpperCase(), {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setLetterSpacing(4);
    this.add(this.labelText);

    // Hit area = FULL pill shape (rectangle covers it conservatively)
    this.setSize(this.bw, this.bh);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-this.bw / 2, -this.bh / 2, this.bw, this.bh),
      Phaser.Geom.Rectangle.Contains,
    );
    this.input!.cursor = 'pointer';

    this.on(Phaser.Input.Events.POINTER_OVER, () => this.setHover(true));
    this.on(Phaser.Input.Events.POINTER_OUT, () => this.setHover(false));
    this.on(Phaser.Input.Events.POINTER_DOWN, () => this.press(true));
    this.on(Phaser.Input.Events.POINTER_UP, () => {
      this.press(false);
      opts.onClick();
    });
    // Kalau pointer keluar saat di-press, reset
    this.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, () => this.press(false));
  }

  private drawIdle(): void {
    const w = this.bw;
    const h = this.bh;
    const r = h / 2;
    const g = this.bgIdle;
    g.clear();
    // Body
    g.fillStyle(COLOR.GLASS_BG, 0.78);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, r);
    // Top highlight (glossy)
    g.fillStyle(COLOR.WHITE, 0.06);
    g.fillRoundedRect(-w / 2 + 2, -h / 2 + 2, w - 4, h / 2 - 2, { tl: r, tr: r, bl: 0, br: 0 });
    // Border luar tipis
    g.lineStyle(1, COLOR.WHITE, 0.18);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
  }

  private drawHover(): void {
    const w = this.bw;
    const h = this.bh;
    const r = h / 2;
    const g = this.bgHover;
    g.clear();
    // Tint terang
    g.fillStyle(COLOR.GLASS_BG, 0.95);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, r);
    // Highlight kuat
    g.fillStyle(COLOR.WHITE, 0.10);
    g.fillRoundedRect(-w / 2 + 2, -h / 2 + 2, w - 4, h / 2 - 2, { tl: r, tr: r, bl: 0, br: 0 });
    // Border luar putih lebih jelas
    g.lineStyle(1, COLOR.WHITE, 0.5);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
    // Border accent dalam
    g.lineStyle(1.5, this.accent, 0.9);
    g.strokeRoundedRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6, r - 3);
  }

  private setHover(on: boolean): void {
    this.scene.tweens.killTweensOf(this.bgHover);
    this.scene.tweens.add({
      targets: this.bgHover,
      alpha: on ? 1 : 0,
      duration: 140,
      ease: 'Sine.easeOut',
    });
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scaleX: on ? 1.03 : 1,
      scaleY: on ? 1.03 : 1,
      duration: 140,
      ease: 'Sine.easeOut',
    });
  }

  private press(down: boolean): void {
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scaleX: down ? 0.97 : 1.03,
      scaleY: down ? 0.97 : 1.03,
      duration: 80,
    });
  }
}

// ============================================================
// ICON CIRCLE BUTTON
// ============================================================

export interface IconCircleButtonOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  diameter?: number;
  drawIcon: IconDrawer;
  label?: string;
  accentColor?: number;
  iconColor?: number;
  onClick: () => void;
}

export class IconCircleButton extends Phaser.GameObjects.Container {
  private bgIdle!: Phaser.GameObjects.Graphics;
  private bgHover!: Phaser.GameObjects.Graphics;
  private iconG!: Phaser.GameObjects.Graphics;
  private labelText?: Phaser.GameObjects.Text;
  private bd: number;
  private accent: number;
  public iconColor: number;
  private drawIconFn: IconDrawer;

  constructor(opts: IconCircleButtonOptions) {
    super(opts.scene, opts.x, opts.y);
    this.bd = opts.diameter ?? 44;
    this.accent = opts.accentColor ?? COLOR.MINT;
    this.iconColor = opts.iconColor ?? COLOR.WHITE;
    this.drawIconFn = opts.drawIcon;
    opts.scene.add.existing(this);

    this.bgIdle = opts.scene.add.graphics();
    this.bgHover = opts.scene.add.graphics().setAlpha(0);
    this.iconG = opts.scene.add.graphics();
    this.add([this.bgIdle, this.bgHover, this.iconG]);

    this.drawIdleBg();
    this.drawHoverBg();
    this.drawIconFn(this.iconG, this.bd);

    if (opts.label) {
      this.labelText = opts.scene.add
        .text(this.bd / 2 + 12, 0, opts.label.toUpperCase(), {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '11px',
          color: '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0, 0.5)
        .setLetterSpacing(2)
        .setAlpha(0.7);
      this.add(this.labelText);
    }

    // Hit area = FULL circle
    this.setSize(this.bd, this.bd);
    this.setInteractive(
      new Phaser.Geom.Circle(0, 0, this.bd / 2),
      Phaser.Geom.Circle.Contains,
    );
    this.input!.cursor = 'pointer';

    this.on(Phaser.Input.Events.POINTER_OVER, () => this.setHover(true));
    this.on(Phaser.Input.Events.POINTER_OUT, () => this.setHover(false));
    this.on(Phaser.Input.Events.POINTER_DOWN, () => this.press(true));
    this.on(Phaser.Input.Events.POINTER_UP, () => {
      this.press(false);
      opts.onClick();
    });
    this.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, () => this.press(false));
  }

  setIcon(drawer: IconDrawer): void {
    this.drawIconFn = drawer;
    this.iconG.clear();
    this.drawIconFn(this.iconG, this.bd);
  }

  setAccent(color: number): void {
    this.accent = color;
    this.drawHoverBg();
  }

  private drawIdleBg(): void {
    const r = this.bd / 2;
    const g = this.bgIdle;
    g.clear();
    // Body
    g.fillStyle(COLOR.GLASS_BG, 0.78);
    g.fillCircle(0, 0, r);
    // Top arc highlight halus
    g.fillStyle(COLOR.WHITE, 0.06);
    g.beginPath();
    g.arc(0, 0, r - 1, Phaser.Math.DegToRad(195), Phaser.Math.DegToRad(345), false);
    g.fillPath();
    // Border luar tipis
    g.lineStyle(1, COLOR.WHITE, 0.18);
    g.strokeCircle(0, 0, r);
  }

  private drawHoverBg(): void {
    const r = this.bd / 2;
    const g = this.bgHover;
    g.clear();
    // Body lebih solid
    g.fillStyle(COLOR.GLASS_BG, 0.95);
    g.fillCircle(0, 0, r);
    // Highlight kuat
    g.fillStyle(COLOR.WHITE, 0.10);
    g.beginPath();
    g.arc(0, 0, r - 1, Phaser.Math.DegToRad(195), Phaser.Math.DegToRad(345), false);
    g.fillPath();
    // Border luar
    g.lineStyle(1, COLOR.WHITE, 0.5);
    g.strokeCircle(0, 0, r);
    // Border accent dalam
    g.lineStyle(1.5, this.accent, 0.9);
    g.strokeCircle(0, 0, r - 3);
  }

  private setHover(on: boolean): void {
    this.scene.tweens.killTweensOf(this.bgHover);
    this.scene.tweens.add({
      targets: this.bgHover,
      alpha: on ? 1 : 0,
      duration: 140,
      ease: 'Sine.easeOut',
    });
    if (this.labelText) {
      this.scene.tweens.killTweensOf(this.labelText);
      this.scene.tweens.add({
        targets: this.labelText,
        alpha: on ? 1 : 0.7,
        duration: 140,
      });
    }
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scaleX: on ? 1.06 : 1,
      scaleY: on ? 1.06 : 1,
      duration: 140,
      ease: 'Sine.easeOut',
    });
  }

  private press(down: boolean): void {
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scaleX: down ? 0.93 : 1.06,
      scaleY: down ? 0.93 : 1.06,
      duration: 80,
    });
  }
}

// ============================================================
// ICON DRAWERS
// ============================================================

const ICON_COLOR = COLOR.WHITE;

/** Stack 3 baris (level / list) */
export const drawLevelIcon: IconDrawer = (g, size) => {
  const w = size * 0.42;
  const h = size * 0.06;
  const r = h / 2;
  const x = -w / 2;
  g.fillStyle(ICON_COLOR, 1);
  for (let i = 0; i < 3; i++) {
    const y = -size * 0.14 + i * size * 0.14;
    g.fillCircle(x, y, h * 0.7);
    g.fillRoundedRect(x + h * 1.2, y - h / 2, w - h * 1.4, h, r);
  }
};

/** Gear */
export const drawSettingIcon: IconDrawer = (g, size) => {
  const teeth = 8;
  const innerR = size * 0.18;
  const outerR = size * 0.27;
  const toothW = Phaser.Math.DegToRad(360 / teeth / 2.6);

  g.fillStyle(ICON_COLOR, 1);
  g.fillCircle(0, 0, innerR + 2);
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const x1 = Math.cos(a - toothW) * innerR;
    const y1 = Math.sin(a - toothW) * innerR;
    const x2 = Math.cos(a + toothW) * innerR;
    const y2 = Math.sin(a + toothW) * innerR;
    const x3 = Math.cos(a + toothW) * outerR;
    const y3 = Math.sin(a + toothW) * outerR;
    const x4 = Math.cos(a - toothW) * outerR;
    const y4 = Math.sin(a - toothW) * outerR;
    g.fillPoints([
      { x: x1, y: y1 },
      { x: x2, y: y2 },
      { x: x3, y: y3 },
      { x: x4, y: y4 },
    ], true);
  }
  // Lubang tengah
  g.fillStyle(COLOR.GLASS_BG, 1);
  g.fillCircle(0, 0, innerR * 0.45);
};

/** Info "i" */
export const drawAboutIcon: IconDrawer = (g, size) => {
  const r = size * 0.05;
  g.fillStyle(ICON_COLOR, 1);
  g.fillCircle(0, -size * 0.16, r);
  g.fillRoundedRect(-r, -size * 0.06, r * 2, size * 0.22, r);
};

/** Music note */
export const drawMusicOnIcon: IconDrawer = (g, size) => {
  g.fillStyle(ICON_COLOR, 1);
  const stemW = size * 0.04;
  g.fillRect(-size * 0.02, -size * 0.22, stemW, size * 0.36);
  g.fillRect(size * 0.14, -size * 0.18, stemW, size * 0.32);
  g.fillRect(-size * 0.02, -size * 0.22, size * 0.18 + stemW, size * 0.05);
  g.fillCircle(-size * 0.02 - size * 0.04, size * 0.14, size * 0.06);
  g.fillCircle(size * 0.14 + size * 0.04 - size * 0.04, size * 0.14, size * 0.06);
};

/** Music off */
export const drawMusicOffIcon: IconDrawer = (g, size) => {
  g.fillStyle(0xa3a8b8, 1);
  const stemW = size * 0.04;
  g.fillRect(size * 0.02, -size * 0.20, stemW, size * 0.34);
  g.fillRect(size * 0.02, -size * 0.20, size * 0.13, size * 0.05);
  g.fillCircle(size * 0.02 - size * 0.03, size * 0.14, size * 0.06);
  g.lineStyle(size * 0.05, COLOR.ROSE, 1);
  g.beginPath();
  g.moveTo(-size * 0.26, -size * 0.26);
  g.lineTo(size * 0.26, size * 0.26);
  g.strokePath();
};

/** Question mark / how-to-play */
export const drawHelpIcon: IconDrawer = (g, size) => {
  g.fillStyle(ICON_COLOR, 1);
  // "?" stylized: top arc + dot
  const r = size * 0.13;
  // Curve: arc dari kiri-bawah, atas, ke kanan-bawah
  g.lineStyle(size * 0.07, ICON_COLOR, 1);
  g.beginPath();
  g.arc(0, -size * 0.06, r, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360 + 30), false);
  g.strokePath();
  // Tail vertical
  g.fillRect(-size * 0.04, -size * 0.04, size * 0.08, size * 0.13);
  // Dot bawah
  g.fillCircle(0, size * 0.18, size * 0.05);
};

/** Back arrow */
export const drawBackIcon: IconDrawer = (g, size) => {
  g.fillStyle(ICON_COLOR, 1);
  const w = size * 0.20;
  const h = size * 0.24;
  g.fillTriangle(-w, 0, w * 0.3, -h, w * 0.3, h);
  g.fillRect(-w * 0.4, -size * 0.04, w * 1.4, size * 0.08);
};
