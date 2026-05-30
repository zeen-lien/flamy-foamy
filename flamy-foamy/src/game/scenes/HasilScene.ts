import Phaser from 'phaser';
import { SCENE, TEX, AUDIO } from '../config/keys';
import { FONT } from '../ui/fonts';
import { PrimaryButton, COLOR } from '../ui/Button';
import { getUiScale } from '../ui/responsive';
import { AudioManager } from '../audio/AudioManager';
import { saveProgress, loadSave, type LevelId } from '../state/SaveManager';

export interface HasilData {
  level: LevelId;
  coin: number;
  coinTarget: number;
  stone: number;
  stoneTarget: number;
}

export class HasilScene extends Phaser.Scene {
  private hasilData!: HasilData;
  private stars = 0;

  constructor() {
    super({ key: SCENE.HASIL });
  }

  init(d: HasilData) {
    this.hasilData = d;
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;
    const ui = getUiScale(this);

    this.cameras.main.fadeIn(400, 0, 0, 0);

    // Bg gelap + vignette
    if (this.textures.exists(TEX.BG_HLMLEVEL)) {
      const bg = this.add.image(cx, cy, TEX.BG_HLMLEVEL);
      const s = Math.max(width / bg.width, height / bg.height);
      bg.setScale(s).setAlpha(0.5);
    }
    this.add.rectangle(cx, cy, width, height, 0x05070d, 0.7);

    // Hitung bintang
    const bintangFinish = 1;
    const bintangCoin = this.hasilData.coin >= this.hasilData.coinTarget ? 1 : 0;
    const bintangStone = this.hasilData.stone >= this.hasilData.stoneTarget ? 1 : 0;
    this.stars = bintangFinish + bintangCoin + bintangStone;

    // Simpan progress (best-of)
    this.persist();

    // Title
    this.add
      .text(cx, cy - 150 * ui, 'LEVEL SELESAI!', {
        fontFamily: FONT.DISPLAY,
        fontSize: `${Math.round(46 * ui)}px`,
        color: '#ffd84d',
        fontStyle: '900',
        stroke: '#000000',
        strokeThickness: 4,
        shadow: { offsetX: 0, offsetY: 4, color: '#000000', blur: 10, fill: true, stroke: false },
      })
      .setOrigin(0.5)
      .setLetterSpacing(4);

    // Bintang (3 slot, animasi pop satu-satu)
    this.buildStars(cx, cy - 70 * ui, ui);

    // Stats
    const coinOk = bintangCoin ? 'âœ“' : 'âœ—';
    const stoneOk = bintangStone ? 'âœ“' : 'âœ—';
    this.add
      .text(
        cx,
        cy + 10 * ui,
        `KOIN  ${this.hasilData.coin} / ${this.hasilData.coinTarget}   ${coinOk}\nBATU  ${this.hasilData.stone} / ${this.hasilData.stoneTarget}   ${stoneOk}`,
        {
          fontFamily: FONT.BODY,
          fontSize: `${Math.round(16 * ui)}px`,
          color: '#e6e8f0',
          align: 'center',
          lineSpacing: 8,
        },
      )
      .setOrigin(0.5)
      .setLetterSpacing(2);

    // Tombol: Replay, Next/Menu
    const btnY = cy + 110 * ui;
    new PrimaryButton({
      scene: this,
      x: cx - 130 * ui,
      y: btnY,
      label: 'Ulangi',
      width: 200 * ui,
      height: 50 * ui,
      onClick: () => this.replay(),
    });
    const isLast = this.hasilData.level >= 3;
    new PrimaryButton({
      scene: this,
      x: cx + 130 * ui,
      y: btnY,
      label: isLast ? 'Menu' : 'Lanjut',
      width: 200 * ui,
      height: 50 * ui,
      accentColor: COLOR.LIME,
      onClick: () => (isLast ? this.toMenu() : this.next()),
    });

    AudioManager.get(this).playSfx(this, AUDIO.SFX_VICTORY, 0.9);
  }

  private buildStars(cx: number, cy: number, ui: number): void {
    const gap = 80 * ui;
    const r = 26 * ui;
    for (let i = 0; i < 3; i++) {
      const x = cx - gap + i * gap;
      const filled = i < this.stars;
      const star = this.add.graphics();
      star.x = x;
      star.y = cy;
      this.drawStar(star, r, filled ? 0xffd84d : 0x4a4054, filled ? 1 : 0.6);
      star.setScale(0);
      // Pop satu-satu
      this.time.delayedCall(300 + i * 250, () => {
        this.tweens.add({
          targets: star,
          scale: 1,
          duration: 380,
          ease: 'Back.easeOut',
        });
        if (filled) {
          AudioManager.get(this).playSfx(this, AUDIO.SFX_COIN, 0.8);
          // sparkle
          for (let k = 0; k < 6; k++) {
            const p = this.add.circle(x, cy, 3, 0xffe27a, 1).setDepth(30);
            const ang = (k / 6) * Math.PI * 2;
            this.tweens.add({
              targets: p,
              x: x + Math.cos(ang) * 40 * ui,
              y: cy + Math.sin(ang) * 40 * ui,
              alpha: 0,
              duration: 500,
              onComplete: () => p.destroy(),
            });
          }
        }
      });
    }
  }

  private drawStar(g: Phaser.GameObjects.Graphics, outerR: number, color: number, alpha: number): void {
    const innerR = outerR * 0.45;
    const pts: Array<{ x: number; y: number }> = [];
    let rot = -Math.PI / 2;
    const step = Math.PI / 5;
    for (let i = 0; i < 10; i++) {
      const rr = i % 2 === 0 ? outerR : innerR;
      pts.push({ x: Math.cos(rot) * rr, y: Math.sin(rot) * rr });
      rot += step;
    }
    g.fillStyle(color, alpha);
    g.fillPoints(pts, true);
    g.lineStyle(2, 0x000000, 0.4);
    g.strokePoints(pts, true);
  }

  private persist(): void {
    const lv = this.hasilData.level;
    const save = loadSave();
    const patch: Record<string, number | boolean> = {};
    patch[`level${lv}_complete`] = true;
    patch[`level${lv}_stones_collected`] = Math.max(
      (save as unknown as Record<string, number>)[`level${lv}_stones_collected`] ?? 0,
      this.hasilData.stone,
    );
    patch[`level${lv}_best_coin`] = Math.max(
      (save as unknown as Record<string, number>)[`level${lv}_best_coin`] ?? 0,
      this.hasilData.coin,
    );
    patch[`level${lv}_best_stars`] = Math.max(
      (save as unknown as Record<string, number>)[`level${lv}_best_stars`] ?? 0,
      this.stars,
    );
    if (lv === 1) patch.fire_unlocked = true;
    if (lv === 2) patch.water_unlocked = true;
    saveProgress(patch as never);
  }

  private replay(): void {
    this.fadeTo(() => {
      const key = this.hasilData.level === 1 ? SCENE.LEVEL1 : SCENE.LEVEL1;
      this.scene.start(key);
    });
  }

  private next(): void {
    this.fadeTo(() => {
      // Level 2/3 belum ada â†’ balik ke level select
      this.scene.start(SCENE.LEVEL_SELECT);
    });
  }

  private toMenu(): void {
    this.fadeTo(() => this.scene.start(SCENE.HOME));
  }

  private fadeTo(cb: () => void): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, cb);
  }
}
