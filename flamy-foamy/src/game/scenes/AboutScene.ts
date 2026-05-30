import Phaser from 'phaser';
import { SCENE, TEX } from '../config/keys';
import { IconCircleButton, drawBackIcon, COLOR } from '../ui/Button';
import { FONT } from '../ui/fonts';
import { getUiScale } from '../ui/responsive';
import { JustifyText } from '../ui/JustifyText';

// Story = paragraf, dipisah `\n\n`. Setiap paragraf flow otomatis,
// linebreak ditentukan width kolom + algoritma justify.
const STORY = [
  'Dahulu kala di dunia Elemental Realm, tiga kerajaan agung berdiri sejajar: Kerajaan Batu yang tegar, Kerajaan Api yang berkobar, dan Kerajaan Air yang dalam. Mereka hidup dalam keseimbangan, dijaga oleh tiga Boss Penjaga yang melindungi sebuah artefak kuno: TELUR MISTERIUS — sumber kekuatan elemen.',
  'Suatu hari, keseimbangan retak. Telur mulai bersinar pelan, memanggil seseorang. Seekor makhluk lendir adaptif bernama PLENGER terbangun di reruntuhan kuno, siap memulai petualangannya.',
  'Plenger bisa berubah wujud menjadi tiga elemen: BLOP — wujud batu yang gigih, FLAMY — wujud api yang kebal terhadap lava, dan FOAMY — wujud air yang mampu melewati zona bertekanan. Setiap mode punya kekuatan dan kelemahan masing-masing.',
  'Tugasnya jelas: jelajahi tiga kerajaan, kumpulkan Batu Kristal Elemen, kalahkan tiga Boss Penjaga, lalu pecahkan Telur Misterius untuk mengungkap rahasia di baliknya.',
  'Apakah Plenger akan menyatukan tiga elemen menjadi satu kekuatan? Atau justru membangkitkan sesuatu yang lebih berbahaya? Hanya kamu yang bisa menentukan akhirnya.',
].join('\n\n');

export class AboutScene extends Phaser.Scene {
  private bg?: Phaser.GameObjects.Image;
  private overlay!: Phaser.GameObjects.Rectangle;
  private titleText!: Phaser.GameObjects.Text;
  private subText!: Phaser.GameObjects.Text;
  private panelGfx!: Phaser.GameObjects.Graphics;

  // Story sebagai JustifyText (di-rebuild tiap layout karena width berubah)
  private storyContainer?: JustifyText;

  // Credits di kanan-bawah panel
  private creditLabel!: Phaser.GameObjects.Text;
  private creditValue!: Phaser.GameObjects.Text;

  private backBtn!: IconCircleButton;

  constructor() {
    super({ key: SCENE.ABOUT });
  }

  create() {
    this.cameras.main.fadeIn(400, 0, 0, 0);

    if (this.textures.exists(TEX.BG_HLMLEVEL)) {
      this.bg = this.add.image(0, 0, TEX.BG_HLMLEVEL).setOrigin(0.5).setDepth(0);
    }
    this.overlay = this.add.rectangle(0, 0, 100, 100, 0x000000, 0.6).setDepth(1);

    this.titleText = this.add
      .text(0, 0, 'TENTANG GAME', {
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
      .text(0, 0, 'CERITA · KARAKTER · MISI', {
        fontFamily: FONT.HEAVY,
        fontSize: '13px',
        color: '#5eead4',
      })
      .setOrigin(0.5)
      .setLetterSpacing(8)
      .setAlpha(0.85)
      .setDepth(3);

    this.panelGfx = this.add.graphics().setDepth(2);

    // Credit di kanan-bawah panel: dua line text
    this.creditLabel = this.add
      .text(0, 0, 'GAME DESIGN', {
        fontFamily: FONT.HEAVY,
        fontSize: '11px',
        color: '#5eead4',
      })
      .setOrigin(1, 1)
      .setLetterSpacing(3)
      .setAlpha(0.9)
      .setDepth(3);

    this.creditValue = this.add
      .text(0, 0, 'Zaini Leon', {
        fontFamily: FONT.DISPLAY,
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: '900',
      })
      .setOrigin(1, 1)
      .setLetterSpacing(2)
      .setDepth(3);

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

    // Panel — proporsi 4:3, single-column, lebar maksimal cukup readable
    const panelW = Math.min(720 * ui, w - 40);
    const panelTop = Math.round(70 * ui) + Math.round(80 * ui);
    const panelBottomMax = h - Math.round(60 * ui);
    const padX = Math.round(28 * ui);
    const padY = Math.round(24 * ui);
    const textW = panelW - padX * 2;
    const availablePanelH = panelBottomMax - panelTop;

    // Credit block ukuran (dihitung di luar loop biar bisa dipake jadi reservation)
    const creditValSize = Math.max(13, Math.round(16 * ui));
    const creditLblSize = Math.max(9, Math.round(11 * ui));
    this.creditValue.setFontSize(creditValSize);
    this.creditLabel.setFontSize(creditLblSize);
    const creditBlockH = creditValSize + creditLblSize + Math.round(8 * ui);
    const creditGap = Math.round(20 * ui); // gap story <-> credit
    const reservedNonStoryH = padY * 2 + creditBlockH + creditGap;

    // Maksimal tinggi story yang tersedia
    const maxStoryH = availablePanelH - reservedNonStoryH;

    // Try font sizes dari ideal turun ke minimum sampai muat.
    // Ini biar mobile horizontal (h kecil) gak bikin story overflow.
    const idealFs = Math.max(12, Math.round(13 * ui));
    const minFs = 10;
    let chosenFs = idealFs;
    let chosenLineSp = Math.round(5 * ui);
    let chosenParaSp = Math.round(12 * ui);

    for (let fs = idealFs; fs >= minFs; fs--) {
      // Bikin tentative untuk ukur tinggi
      const lineSp = Math.max(2, Math.round(fs * 0.38));
      const paraSp = Math.max(6, Math.round(fs * 0.85));

      this.storyContainer?.destroy();
      this.storyContainer = new JustifyText({
        scene: this,
        x: cx - panelW / 2 + padX,
        y: 0,
        text: STORY,
        width: textW,
        fontFamily: FONT.BODY,
        fontSize: `${fs}px`,
        color: '#e6e8f0',
        lineSpacing: lineSp,
        paragraphSpacing: paraSp,
      });
      this.storyContainer.setDepth(3);

      if (this.storyContainer.getHeight() <= maxStoryH || fs === minFs) {
        chosenFs = fs;
        chosenLineSp = lineSp;
        chosenParaSp = paraSp;
        break;
      }
    }

    // Tinggi panel mengikuti story actual + reserved
    const storyH = this.storyContainer!.getHeight();
    const panelH = Math.min(storyH + reservedNonStoryH, availablePanelH);

    // Draw panel
    this.panelGfx.clear();
    this.panelGfx.fillStyle(COLOR.GLASS_BG, 0.78);
    this.panelGfx.fillRoundedRect(cx - panelW / 2, panelTop, panelW, panelH, 14);
    this.panelGfx.lineStyle(1, COLOR.WHITE, 0.18);
    this.panelGfx.strokeRoundedRect(cx - panelW / 2, panelTop, panelW, panelH, 14);

    // Position story
    this.storyContainer!.setPosition(cx - panelW / 2 + padX, panelTop + padY);

    // Credit di kanan-bawah panel
    const creditX = cx + panelW / 2 - padX;
    const creditY = panelTop + panelH - padY;
    this.creditValue.setPosition(creditX, creditY);
    this.creditLabel.setPosition(creditX, creditY - creditValSize - Math.round(4 * ui));

    // Suppress unused warning (chosen vars dipake implicit di JustifyText terakhir)
    void chosenFs;
    void chosenLineSp;
    void chosenParaSp;

    // Back button
    this.backBtn.setScale(ui);
    this.backBtn.setPosition(Math.round(40 * ui) + 6, Math.round(40 * ui) + 6);
  }
}
