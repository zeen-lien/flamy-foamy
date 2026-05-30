import Phaser from 'phaser';
import { SCENE, TEX } from '../config/keys';
import { IconCircleButton, drawBackIcon, COLOR } from '../ui/Button';
import { FONT } from '../ui/fonts';
import { getUiScale } from '../ui/responsive';

const SECTIONS = [
  {
    title: 'TUJUAN',
    body: [
      'Bantu Plenger menjelajahi 3 kerajaan elemen, mengumpulkan',
      'Batu Kristal, mengalahkan Boss Penjaga, dan memecahkan',
      'Telur Misterius di setiap kerajaan.',
    ],
  },
  {
    title: 'KONTROL — KEYBOARD',
    body: [
      '← →   Gerak kiri / kanan',
      '↑ atau Spasi   Lompat',
      'A atau J   Serang',
      'Z   Mode Blop  ·  X   Mode Flamy  ·  C   Mode Foamy',
      'Esc atau P   Pause',
    ],
  },
  {
    title: 'KONTROL — MOBILE',
    body: [
      'Tombol kiri-bawah  : gerak kiri / kanan',
      'Tombol kanan-bawah : lompat & serang',
      'Tombol atas        : ganti mode (Blop · Flamy · Foamy)',
      'Pojok kanan-atas   : pause',
    ],
  },
  {
    title: 'MODE & ELEMEN',
    body: [
      'Setiap mode kebal pada elemennya sendiri:',
      '🪨 BLOP   — bentuk dasar, hati-hati pada api & air',
      '🔥 FLAMY  — kebal lava & dinding api',
      '💧 FOAMY  — kebal air bertekanan & zona dingin',
      'Ganti mode di waktu yang tepat = kunci keberhasilan.',
    ],
  },
  {
    title: 'JEBAKAN',
    body: [
      'Duri statis  : mati seketika untuk semua mode',
      'Jebakan ON   : aktif saat menyala (perhatikan timing-nya)',
      'Garis jurang : jatuh = respawn ke checkpoint terakhir',
    ],
  },
  {
    title: 'BINTANG & RATING',
    body: [
      '⭐ FINISH : selesaikan level',
      '⭐ KOIN   : kumpulkan koin minimal di target level',
      '⭐ BATU   : kumpulkan Batu Kristal minimal di target level',
      'Bisa replay level untuk dapat 3 bintang penuh.',
    ],
  },
];

interface SectionTexts {
  title: Phaser.GameObjects.Text;
  body: Phaser.GameObjects.Text;
}

export class CaraBermainScene extends Phaser.Scene {
  private bg?: Phaser.GameObjects.Image;
  private overlay!: Phaser.GameObjects.Rectangle;
  private titleText!: Phaser.GameObjects.Text;
  private subText!: Phaser.GameObjects.Text;
  private panelGfx!: Phaser.GameObjects.Graphics;
  private sections: SectionTexts[] = [];
  private backBtn!: IconCircleButton;

  constructor() {
    super({ key: SCENE.CARA_BERMAIN });
  }

  create() {
    this.sections = [];

    this.cameras.main.fadeIn(400, 0, 0, 0);

    if (this.textures.exists(TEX.BG_HLMLEVEL)) {
      this.bg = this.add.image(0, 0, TEX.BG_HLMLEVEL).setOrigin(0.5).setDepth(0);
    }
    this.overlay = this.add.rectangle(0, 0, 100, 100, 0x000000, 0.6).setDepth(1);

    this.titleText = this.add
      .text(0, 0, 'CARA BERMAIN', {
        fontFamily: FONT.DISPLAY,
        fontSize: '46px',
        color: '#f5f1e8',
        fontStyle: '900',
        stroke: '#000000',
        strokeThickness: 4,
        shadow: { offsetX: 0, offsetY: 4, color: '#000000', blur: 10, fill: true, stroke: false },
      })
      .setOrigin(0.5)
      .setLetterSpacing(8)
      .setDepth(3);

    this.subText = this.add
      .text(0, 0, 'KONTROL · ATURAN · TIPS', {
        fontFamily: FONT.HEAVY,
        fontSize: '13px',
        color: '#5eead4',
      })
      .setOrigin(0.5)
      .setLetterSpacing(8)
      .setAlpha(0.85)
      .setDepth(3);

    this.panelGfx = this.add.graphics().setDepth(2);

    for (const section of SECTIONS) {
      const titleObj = this.add
        .text(0, 0, section.title, {
          fontFamily: FONT.HEAVY,
          fontSize: '15px',
          color: '#5eead4',
        })
        .setOrigin(0, 0)
        .setLetterSpacing(4)
        .setDepth(3);

      const bodyObj = this.add
        .text(0, 0, section.body.join('\n'), {
          fontFamily: FONT.BODY,
          fontSize: '12px',
          color: '#e6e8f0',
          align: 'left',
          lineSpacing: 4,
        })
        .setOrigin(0, 0)
        .setDepth(3);

      this.sections.push({ title: titleObj, body: bodyObj });
    }

    this.backBtn = new IconCircleButton({
      scene: this,
      x: 0,
      y: 0,
      diameter: 44,
      drawIcon: drawBackIcon,
      label: 'Kembali',
      onClick: () => {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
          this.scene.start(SCENE.HOME);
        });
      },
    });
    this.backBtn.setDepth(5);

    this.layout();
    this.scale.on('resize', this.layout, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.layout, this);
    });
  }

  private layout(): void {
    const w = this.scale.gameSize.width;
    const h = this.scale.gameSize.height;
    const cx = w / 2;
    const ui = getUiScale(this);

    if (this.bg) {
      this.bg.setPosition(cx, h / 2);
      const s = Math.max(w / this.bg.width, h / this.bg.height);
      this.bg.setScale(s);
    }
    this.overlay.setPosition(cx, h / 2);
    this.overlay.setSize(w, h);

    this.titleText.setFontSize(Math.round(46 * ui));
    this.titleText.setPosition(cx, Math.round(70 * ui));
    this.subText.setFontSize(Math.max(11, Math.round(13 * ui)));
    this.subText.setPosition(cx, Math.round(70 * ui) + Math.round(36 * ui));

    // Panel
    const panelW = Math.min(820 * ui, w - 40);
    const panelTop = Math.round(70 * ui) + Math.round(80 * ui);
    const padX = Math.round(28 * ui);
    const padY = Math.round(22 * ui);

    // Layout sections: 2 kolom kalau panel cukup lebar (>= 600), 1 kolom kalau sempit
    const colCount = panelW >= 600 * ui ? 2 : 1;
    const colGap = Math.round(28 * ui);
    const colW = (panelW - padX * 2 - (colCount - 1) * colGap) / colCount;

    const titleSize = Math.max(12, Math.round(15 * ui));
    const bodySize = Math.max(10, Math.round(12 * ui));
    const sectionGap = Math.round(18 * ui);

    // Hitung tinggi tiap section
    this.sections.forEach((s) => {
      s.title.setFontSize(titleSize);
      s.body.setFontSize(bodySize);
      s.body.setStyle({ wordWrap: { width: colW } });
    });

    // Distribute ke kolom (greedy fill — tinggi terkecil)
    const colHeights: number[] = new Array(colCount).fill(0);
    const sectionLayouts: Array<{ col: number; y: number; height: number }> = [];

    this.sections.forEach((s) => {
      let targetCol = 0;
      for (let i = 1; i < colCount; i++) {
        if (colHeights[i] < colHeights[targetCol]) targetCol = i;
      }
      const sectionH =
        s.title.displayHeight + Math.round(6 * ui) + s.body.displayHeight + sectionGap;
      sectionLayouts.push({ col: targetCol, y: colHeights[targetCol], height: sectionH });
      colHeights[targetCol] += sectionH;
    });

    const contentH = Math.max(...colHeights);
    const panelH = Math.min(contentH + padY * 2, h - panelTop - Math.round(60 * ui));

    this.panelGfx.clear();
    this.panelGfx.fillStyle(COLOR.GLASS_BG, 0.78);
    this.panelGfx.fillRoundedRect(cx - panelW / 2, panelTop, panelW, panelH, 14);
    this.panelGfx.lineStyle(1, COLOR.WHITE, 0.18);
    this.panelGfx.strokeRoundedRect(cx - panelW / 2, panelTop, panelW, panelH, 14);

    const colTopY = panelTop + padY;
    const colXs: number[] = new Array(colCount)
      .fill(0)
      .map((_, i) => cx - panelW / 2 + padX + i * (colW + colGap));

    this.sections.forEach((s, i) => {
      const lay = sectionLayouts[i];
      const x = colXs[lay.col];
      const y = colTopY + lay.y;
      s.title.setPosition(x, y);
      s.body.setPosition(x, y + s.title.displayHeight + Math.round(6 * ui));
    });

    this.backBtn.setScale(ui);
    this.backBtn.setPosition(Math.round(40 * ui) + 6, Math.round(40 * ui) + 6);
  }
}
