import Phaser from 'phaser';
import { COLOR } from './Button';
import { FONT } from './fonts';
import type { LevelId, LevelStatus } from '../state/SaveManager';

/**
 * LevelCard — tile interaktif untuk satu level.
 * Implementasi: container tanpa internal sizing, ukuran dikontrol via
 * `setCardScale(scale)`. Layout scene yang panggil scale ini berdasarkan
 * `getUiScale()` dari responsive.ts.
 */

export interface LevelCardOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  level: LevelId;
  title: string;
  status: LevelStatus;
  accentColor: number;
  iconTex?: string;
  lockedIconTex?: string;
  onClick: () => void;
  onLockedClick?: (reason: string) => void;
}

const BASE_W = 220;
const BASE_H = 300;
const BASE_RADIUS = 16;

export class LevelCard extends Phaser.GameObjects.Container {
  private bgIdle!: Phaser.GameObjects.Graphics;
  private bgHover!: Phaser.GameObjects.Graphics;
  private accent: number;
  private status: LevelStatus;
  private cardScale = 1;

  constructor(opts: LevelCardOptions) {
    super(opts.scene, opts.x, opts.y);
    opts.scene.add.existing(this);
    this.accent = opts.accentColor;
    this.status = opts.status;

    this.bgIdle = opts.scene.add.graphics();
    this.bgHover = opts.scene.add.graphics().setAlpha(0);
    this.add([this.bgIdle, this.bgHover]);

    this.drawIdle();
    this.drawHover();

    this.buildHeader(opts);
    this.buildArt(opts);
    this.buildFooter(opts);

    if (!opts.status.unlocked) this.buildLockOverlay();

    this.refreshHitArea();
    this.input!.cursor = 'pointer';

    this.on(Phaser.Input.Events.POINTER_OVER, () => this.setHover(true));
    this.on(Phaser.Input.Events.POINTER_OUT, () => this.setHover(false));
    this.on(Phaser.Input.Events.POINTER_DOWN, () => this.press(true));
    this.on(Phaser.Input.Events.POINTER_UP, () => {
      this.press(false);
      if (opts.status.unlocked) {
        opts.onClick();
      } else if (opts.status.lockReason && opts.onLockedClick) {
        opts.onLockedClick(opts.status.lockReason);
      }
    });
    this.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, () => this.press(false));
  }

  /** Set ukuran card lewat scale faktor (1 = base 220x300). */
  setCardScale(scale: number): this {
    this.cardScale = scale;
    this.setScale(scale);
    this.refreshHitArea();
    return this;
  }

  /** Hit area harus disesuaikan setiap scale berubah. */
  private refreshHitArea(): void {
    this.setSize(BASE_W, BASE_H);
    if (this.input) {
      this.input.hitArea = new Phaser.Geom.Rectangle(-BASE_W / 2, -BASE_H / 2, BASE_W, BASE_H);
    } else {
      this.setInteractive(
        new Phaser.Geom.Rectangle(-BASE_W / 2, -BASE_H / 2, BASE_W, BASE_H),
        Phaser.Geom.Rectangle.Contains,
      );
    }
  }

  private drawIdle(): void {
    const w = BASE_W;
    const h = BASE_H;
    const r = BASE_RADIUS;
    const g = this.bgIdle;
    g.clear();

    g.fillStyle(COLOR.GLASS_BG, 0.85);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, r);

    g.fillStyle(this.accent, 0.18);
    g.fillRoundedRect(-w / 2, -h / 2, w, 50, { tl: r, tr: r, bl: 0, br: 0 });

    g.fillStyle(COLOR.WHITE, 0.04);
    g.fillRoundedRect(-w / 2 + 2, -h / 2 + 2, w - 4, h / 2 - 2, { tl: r, tr: r, bl: 0, br: 0 });

    g.lineStyle(1, COLOR.WHITE, 0.18);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
  }

  private drawHover(): void {
    const w = BASE_W;
    const h = BASE_H;
    const r = BASE_RADIUS;
    const g = this.bgHover;
    g.clear();

    g.fillStyle(COLOR.GLASS_BG, 0.94);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, r);

    g.fillStyle(this.accent, 0.28);
    g.fillRoundedRect(-w / 2, -h / 2, w, 50, { tl: r, tr: r, bl: 0, br: 0 });

    g.fillStyle(COLOR.WHITE, 0.08);
    g.fillRoundedRect(-w / 2 + 2, -h / 2 + 2, w - 4, h / 2 - 2, { tl: r, tr: r, bl: 0, br: 0 });

    g.lineStyle(1, COLOR.WHITE, 0.5);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
    g.lineStyle(1.5, this.accent, 0.95);
    g.strokeRoundedRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6, r - 3);
  }

  private buildHeader(opts: LevelCardOptions): void {
    const accentHex = '#' + this.accent.toString(16).padStart(6, '0');

    const lv = this.scene.add
      .text(0, -BASE_H / 2 + 22, `LV ${String(opts.level).padStart(2, '0')}`, {
        fontFamily: FONT.HEAVY,
        fontSize: '20px',
        color: accentHex,
      })
      .setOrigin(0.5)
      .setLetterSpacing(4);
    this.add(lv);

    const sub = this.scene.add
      .text(0, -BASE_H / 2 + 42, opts.title.toUpperCase(), {
        fontFamily: FONT.BODY,
        fontSize: '11px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setLetterSpacing(3)
      .setAlpha(0.85);
    this.add(sub);
  }

  private buildArt(opts: LevelCardOptions): void {
    const artY = -10;
    const panelW = BASE_W - 28;
    const panelH = 130;

    const frame = this.scene.add.graphics();
    frame.fillStyle(0x000000, 0.4);
    frame.fillRoundedRect(-panelW / 2, artY - panelH / 2, panelW, panelH, 8);
    frame.lineStyle(1, COLOR.WHITE, 0.12);
    frame.strokeRoundedRect(-panelW / 2, artY - panelH / 2, panelW, panelH, 8);
    this.add(frame);

    const useTex = opts.status.unlocked ? opts.iconTex : opts.lockedIconTex ?? opts.iconTex;
    if (useTex && this.scene.textures.exists(useTex)) {
      const img = this.scene.add.image(0, artY, useTex).setOrigin(0.5);
      const maxW = panelW - 16;
      const maxH = panelH - 16;
      const scale = Math.min(maxW / img.width, maxH / img.height);
      img.setScale(scale);
      this.add(img);
    } else {
      const n = ['I', 'II', 'III'][opts.level - 1];
      const t = this.scene.add
        .text(0, artY, n, {
          fontFamily: FONT.DISPLAY,
          fontSize: '72px',
          color: '#ffffff',
          fontStyle: '900',
          stroke: '#000000',
          strokeThickness: 4,
        })
        .setOrigin(0.5)
        .setAlpha(0.85);
      this.add(t);
    }
  }

  private buildFooter(opts: LevelCardOptions): void {
    const baseY = BASE_H / 2 - 78;

    const starGap = 32;
    const starsTotalW = starGap * 2;
    for (let i = 0; i < 3; i++) {
      const filled = i < opts.status.stars;
      const star = this.scene.add.graphics();
      star.x = -starsTotalW / 2 + i * starGap;
      star.y = baseY;
      this.drawStar(star, 11, filled ? this.accent : 0x6b708a, filled ? 1 : 0.6);
      this.add(star);
    }

    const stats = this.scene.add
      .text(
        0,
        baseY + 26,
        `BATU  ${opts.status.bestStones}/${opts.status.targetStones}\nKOIN  ${opts.status.bestCoin}/${opts.status.targetCoin}`,
        {
          fontFamily: FONT.BODY,
          fontSize: '11px',
          color: '#cfd2e2',
          align: 'center',
          lineSpacing: 4,
        },
      )
      .setOrigin(0.5, 0)
      .setLetterSpacing(2);
    this.add(stats);
  }

  private buildLockOverlay(): void {
    const w = BASE_W;
    const h = BASE_H;
    const r = BASE_RADIUS;

    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.55);
    overlay.fillRoundedRect(-w / 2, -h / 2, w, h, r);
    this.add(overlay);

    const lock = this.scene.add.graphics();
    const lockY = -10;
    lock.fillStyle(0xa3a8b8, 1);
    lock.fillRoundedRect(-16, lockY, 32, 26, 4);
    lock.lineStyle(4, 0xa3a8b8, 1);
    lock.beginPath();
    lock.arc(0, lockY, 11, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false);
    lock.strokePath();
    lock.fillStyle(0x0d111a, 1);
    lock.fillCircle(0, lockY + 11, 3);
    lock.fillRect(-1.5, lockY + 11, 3, 8);
    this.add(lock);

    const t = this.scene.add
      .text(0, lockY + 40, 'TERKUNCI', {
        fontFamily: FONT.HEAVY,
        fontSize: '14px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setLetterSpacing(4)
      .setAlpha(0.9);
    this.add(t);
  }

  private drawStar(g: Phaser.GameObjects.Graphics, outerR: number, color: number, alpha: number): void {
    const innerR = outerR * 0.45;
    const points: Array<{ x: number; y: number }> = [];
    let rot = -Math.PI / 2;
    const step = Math.PI / 5;
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      points.push({ x: Math.cos(rot) * r, y: Math.sin(rot) * r });
      rot += step;
    }
    g.fillStyle(color, alpha);
    g.fillPoints(points, true);
    g.lineStyle(1, 0x000000, 0.4);
    g.strokePoints(points, true);
  }

  private setHover(on: boolean): void {
    this.scene.tweens.killTweensOf(this.bgHover);
    this.scene.tweens.add({
      targets: this.bgHover,
      alpha: on ? 1 : 0,
      duration: 150,
      ease: 'Sine.easeOut',
    });
    const target = on ? this.cardScale * 1.04 : this.cardScale;
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scaleX: target,
      scaleY: target,
      duration: 150,
      ease: 'Sine.easeOut',
    });
  }

  private press(down: boolean): void {
    const target = down ? this.cardScale * 0.97 : this.cardScale * 1.04;
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scaleX: target,
      scaleY: target,
      duration: 80,
    });
  }
}
