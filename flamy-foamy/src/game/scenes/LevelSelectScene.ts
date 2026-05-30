import Phaser from 'phaser';
import { SCENE, TEX } from '../config/keys';
import { IconCircleButton, drawBackIcon, COLOR } from '../ui/Button';
import { LevelCard } from '../ui/LevelCard';
import { FONT } from '../ui/fonts';
import { getLevelStatus, type LevelId } from '../state/SaveManager';
import { showToast } from '../ui/Toast';
import { getUiScale, isPortrait } from '../ui/responsive';

const ACCENT_BY_LEVEL: Record<LevelId, number> = {
  1: 0xb8a578,
  2: 0xff6a3d,
  3: 0x4dc6ff,
};

const TITLE_BY_LEVEL: Record<LevelId, string> = {
  1: 'Dunia Batu',
  2: 'Dunia Api',
  3: 'Dunia Air',
};

const ICON_TEX: Record<LevelId, { open: string; locked?: string }> = {
  1: { open: TEX.ICON_LEVEL1 },
  2: { open: TEX.ICON_LEVEL2_KEBUKA, locked: TEX.ICON_LEVEL2_KEKUNCI },
  3: { open: TEX.ICON_LEVEL3_KEBUKA, locked: TEX.ICON_LEVEL3_KEKUNCI },
};

// Base sizes — di-scale otomatis sesuai viewport
const CARD_BASE_W = 220;
const CARD_BASE_H = 300;

export class LevelSelectScene extends Phaser.Scene {
  private bg?: Phaser.GameObjects.Image;
  private overlay!: Phaser.GameObjects.Rectangle;
  private titleText!: Phaser.GameObjects.Text;
  private subText!: Phaser.GameObjects.Text;
  private cards: LevelCard[] = [];
  private backBtn!: IconCircleButton;

  constructor() {
    super({ key: SCENE.LEVEL_SELECT });
  }

  create() {
    this.cards = [];

    this.cameras.main.fadeIn(420, 0, 0, 0);

    if (this.textures.exists(TEX.BG_HLMLEVEL)) {
      this.bg = this.add.image(0, 0, TEX.BG_HLMLEVEL).setOrigin(0.5).setDepth(0);
    } else if (this.textures.exists(TEX.BG_HOME)) {
      this.bg = this.add.image(0, 0, TEX.BG_HOME).setOrigin(0.5).setDepth(0).setAlpha(0.55);
    }

    this.overlay = this.add.rectangle(0, 0, 100, 100, 0x000000, 0.55).setDepth(1);

    this.titleText = this.add
      .text(0, 0, 'PILIH LEVEL', {
        fontFamily: FONT.DISPLAY,
        fontSize: '54px',
        color: '#f5f1e8',
        fontStyle: '900',
        stroke: '#000000',
        strokeThickness: 4,
        shadow: {
          offsetX: 0,
          offsetY: 4,
          color: '#000000',
          blur: 12,
          stroke: false,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setLetterSpacing(8)
      .setDepth(3);

    this.subText = this.add
      .text(0, 0, 'TAKLUKKAN 3 KERAJAAN ELEMEN', {
        fontFamily: FONT.HEAVY,
        fontSize: '14px',
        color: '#5eead4',
      })
      .setOrigin(0.5)
      .setLetterSpacing(8)
      .setAlpha(0.9)
      .setDepth(3);

    this.buildCards();
    this.buildBackButton();

    this.layout();
    this.scale.on('resize', this.layout, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.layout, this);
    });
  }

  private buildCards(): void {
    const levels: LevelId[] = [1, 2, 3];
    for (const lv of levels) {
      const status = getLevelStatus(lv);
      const card = new LevelCard({
        scene: this,
        x: 0,
        y: 0,
        level: lv,
        title: TITLE_BY_LEVEL[lv],
        accentColor: ACCENT_BY_LEVEL[lv],
        status,
        iconTex: ICON_TEX[lv].open,
        lockedIconTex: ICON_TEX[lv].locked,
        onClick: () => this.startLevel(lv),
        onLockedClick: (reason) =>
          showToast({
            scene: this,
            message: reason,
            accentColor: COLOR.ROSE,
          }),
      });
      card.setDepth(4);
      this.cards.push(card);
    }
  }

  private buildBackButton(): void {
    this.backBtn = new IconCircleButton({
      scene: this,
      x: 0,
      y: 0,
      diameter: 44,
      drawIcon: drawBackIcon,
      label: 'Kembali',
      onClick: () => this.gotoHome(),
    });
    this.backBtn.setDepth(5);
  }

  private gotoHome(): void {
    this.cameras.main.fadeOut(320, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(SCENE.HOME);
    });
  }

  private startLevel(level: LevelId): void {
    // Sementara: semua level masuk PlayerTestScene (sandbox).
    // Step 11+: ganti ke Level1Scene/Level2Scene/Level3Scene proper.
    this.cameras.main.fadeOut(380, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(SCENE.PLAYER_TEST, { level });
    });
  }

  private layout(): void {
    const w = this.scale.gameSize.width;
    const h = this.scale.gameSize.height;
    const cx = w / 2;
    const cy = h / 2;
    const ui = getUiScale(this);
    const portrait = isPortrait(this);

    if (this.bg) {
      this.bg.setPosition(cx, cy);
      const s = Math.max(w / this.bg.width, h / this.bg.height);
      this.bg.setScale(s);
    }
    this.overlay.setPosition(cx, cy);
    this.overlay.setSize(w, h);

    // Title scale
    const titleSize = Math.round(54 * ui);
    this.titleText.setFontSize(titleSize);
    this.titleText.setPosition(cx, Math.round(78 * ui));

    const subSize = Math.max(11, Math.round(14 * ui));
    this.subText.setFontSize(subSize);
    this.subText.setPosition(cx, Math.round(78 * ui) + Math.round(42 * ui));

    // Card scale + positioning
    // Coba muat 3 card horizontal dengan margin yang reasonable.
    // Kalau gak muat / portrait, stack vertikal.
    const cardScaledW = CARD_BASE_W * ui;
    const cardScaledH = CARD_BASE_H * ui;
    const horizontalGap = Math.max(20, 28 * ui);
    const totalRowW = 3 * cardScaledW + 2 * horizontalGap;

    const fitsHorizontal = !portrait && totalRowW + 80 < w;

    if (fitsHorizontal) {
      const startX = cx - totalRowW / 2 + cardScaledW / 2;
      const cardY = cy + Math.round(20 * ui);
      this.cards.forEach((c, i) => {
        c.setCardScale(ui);
        c.setPosition(startX + i * (cardScaledW + horizontalGap), cardY);
      });
    } else {
      // Portrait / sempit: scale down extra biar 3 card muat vertikal
      // Atau horizontal tighter.
      // Strategi: kalau portrait true → stack vertikal dengan scale 0.8 * ui.
      // Kalau landscape sempit → squeeze horizontal dengan scale yang fit.
      if (portrait) {
        const stackScale = Math.min(ui, (h * 0.7) / (3 * CARD_BASE_H + 40));
        const cardH = CARD_BASE_H * stackScale;
        const verticalGap = Math.max(14, 20 * stackScale);
        const totalColH = 3 * cardH + 2 * verticalGap;
        const startY = cy - totalColH / 2 + cardH / 2 + Math.round(20 * ui);
        this.cards.forEach((c, i) => {
          c.setCardScale(stackScale);
          c.setPosition(cx, startY + i * (cardH + verticalGap));
        });
      } else {
        // Landscape sempit — squeeze
        const maxRowW = w - 60;
        const squeezeScale = Math.min(ui, (maxRowW - 2 * horizontalGap) / (3 * CARD_BASE_W));
        const sw = CARD_BASE_W * squeezeScale;
        const tot = 3 * sw + 2 * horizontalGap;
        const startX = cx - tot / 2 + sw / 2;
        const cardY = cy + Math.round(20 * ui);
        this.cards.forEach((c, i) => {
          c.setCardScale(squeezeScale);
          c.setPosition(startX + i * (sw + horizontalGap), cardY);
        });
      }
    }

    // Back button
    const backScale = ui;
    this.backBtn.setScale(backScale);
    this.backBtn.setPosition(Math.round(40 * ui) + 6, Math.round(40 * ui) + 6);
  }
}
