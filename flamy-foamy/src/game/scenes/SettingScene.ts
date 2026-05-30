import Phaser from 'phaser';
import { SCENE, TEX } from '../config/keys';
import { IconCircleButton, drawBackIcon, COLOR } from '../ui/Button';
import { FONT } from '../ui/fonts';
import { getUiScale } from '../ui/responsive';
import { loadSettings, saveSettings, type Settings } from '../state/Settings';
import { AudioManager } from '../audio/AudioManager';
import { Switch } from '../ui/Switch';
import { Slider } from '../ui/Slider';
import { showToast } from '../ui/Toast';
import { resetSave } from '../state/SaveManager';

interface RowControls {
  labelText: Phaser.GameObjects.Text;
  hintText: Phaser.GameObjects.Text;
  control: Phaser.GameObjects.Container;  // Switch | Slider
  type: 'switch' | 'slider';
}

export class SettingScene extends Phaser.Scene {
  private bg?: Phaser.GameObjects.Image;
  private overlay!: Phaser.GameObjects.Rectangle;
  private titleText!: Phaser.GameObjects.Text;
  private subText!: Phaser.GameObjects.Text;
  private panelGfx!: Phaser.GameObjects.Graphics;

  private rows: RowControls[] = [];
  private resetBtn!: Phaser.GameObjects.Container;
  private resetLabel!: Phaser.GameObjects.Text;
  private backBtn!: IconCircleButton;

  private settings: Settings = loadSettings();

  // Sliders refs untuk update enabled state saat music/sfx switched
  private musicVolSlider!: Slider;
  private musicLevelSlider!: Slider;
  private sfxVolSlider!: Slider;

  constructor() {
    super({ key: SCENE.SETTING });
  }

  create() {
    this.rows = [];
    this.settings = loadSettings();

    this.cameras.main.fadeIn(400, 0, 0, 0);

    if (this.textures.exists(TEX.BG_HLMLEVEL)) {
      this.bg = this.add.image(0, 0, TEX.BG_HLMLEVEL).setOrigin(0.5).setDepth(0);
    }
    this.overlay = this.add.rectangle(0, 0, 100, 100, 0x000000, 0.55).setDepth(1);

    this.titleText = this.add
      .text(0, 0, 'PENGATURAN', {
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
      .text(0, 0, 'ATUR SUARA & PROGRES', {
        fontFamily: FONT.HEAVY,
        fontSize: '13px',
        color: '#5eead4',
      })
      .setOrigin(0.5)
      .setLetterSpacing(8)
      .setAlpha(0.85)
      .setDepth(3);

    this.panelGfx = this.add.graphics().setDepth(2);

    this.buildRows();
    this.buildResetButton();
    this.buildBackButton();

    this.layout();
    this.scale.on('resize', this.layout, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.layout, this);
    });
  }

  private buildRows(): void {
    // Row 1: Music master switch
    this.addSwitchRow({
      label: 'Musik Utama',
      hint: 'BGM saat di Menu / Home',
      value: this.settings.musicEnabled,
      onChange: (v) => {
        this.settings = saveSettings({ musicEnabled: v });
        AudioManager.get(this).applyMusicEnabled(v);
        this.refreshSliderEnabled();
      },
    });

    // Row 2: Music volume (menu)
    this.musicVolSlider = this.addSliderRow({
      label: 'Volume Musik Menu',
      hint: 'Saat di luar level',
      value: this.settings.musicVolume,
      onChange: (v) => {
        this.settings = saveSettings({ musicVolume: v });
        AudioManager.get(this).applyVolume();
      },
    });

    // Row 3: In-game music switch (volume slider per level)
    this.musicLevelSlider = this.addSliderRow({
      label: 'Volume Musik In-Game',
      hint: 'Saat sedang main level',
      value: this.settings.musicLevelVolume,
      onChange: (v) => {
        this.settings = saveSettings({ musicLevelVolume: v });
      },
    });

    // Row 4: SFX switch
    this.addSwitchRow({
      label: 'Efek Suara (SFX)',
      hint: 'Lompat, koin, hit, dll',
      value: this.settings.sfxEnabled,
      onChange: (v) => {
        this.settings = saveSettings({ sfxEnabled: v });
        this.refreshSliderEnabled();
      },
    });

    // Row 5: SFX volume
    this.sfxVolSlider = this.addSliderRow({
      label: 'Volume SFX',
      hint: 'Besar kecilnya efek suara',
      value: this.settings.sfxVolume,
      onChange: (v) => {
        this.settings = saveSettings({ sfxVolume: v });
      },
    });

    this.refreshSliderEnabled();
  }

  private refreshSliderEnabled(): void {
    this.musicVolSlider.setEnabled(this.settings.musicEnabled);
    this.musicLevelSlider.setEnabled(this.settings.musicEnabled);
    this.sfxVolSlider.setEnabled(this.settings.sfxEnabled);
  }

  private addSwitchRow(opts: {
    label: string;
    hint: string;
    value: boolean;
    onChange: (v: boolean) => void;
  }): Switch {
    const labelText = this.add
      .text(0, 0, opts.label, {
        fontFamily: FONT.BODY,
        fontSize: '15px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5)
      .setDepth(3);
    const hintText = this.add
      .text(0, 0, opts.hint, {
        fontFamily: FONT.BODY,
        fontSize: '11px',
        color: '#9aa0b4',
      })
      .setOrigin(0, 0.5)
      .setDepth(3);
    const sw = new Switch({
      scene: this,
      x: 0,
      y: 0,
      value: opts.value,
      accentColor: COLOR.MINT,
      onChange: opts.onChange,
    });
    sw.setDepth(3);
    this.rows.push({ labelText, hintText, control: sw, type: 'switch' });
    return sw;
  }

  private addSliderRow(opts: {
    label: string;
    hint: string;
    value: number;
    onChange: (v: number) => void;
  }): Slider {
    const labelText = this.add
      .text(0, 0, opts.label, {
        fontFamily: FONT.BODY,
        fontSize: '15px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5)
      .setDepth(3);
    const hintText = this.add
      .text(0, 0, opts.hint, {
        fontFamily: FONT.BODY,
        fontSize: '11px',
        color: '#9aa0b4',
      })
      .setOrigin(0, 0.5)
      .setDepth(3);
    const sl = new Slider({
      scene: this,
      x: 0,
      y: 0,
      width: 220,
      value: opts.value,
      accentColor: COLOR.MINT,
      onChange: opts.onChange,
      onCommit: opts.onChange,
    });
    sl.setDepth(3);
    this.rows.push({ labelText, hintText, control: sl, type: 'slider' });
    return sl;
  }

  private buildResetButton(): void {
    // Glass button merah-rose untuk reset progres
    const w = 220;
    const h = 44;
    const r = h / 2;
    const c = this.add.container(0, 0).setDepth(3);

    const bg = this.add.graphics();
    bg.fillStyle(COLOR.GLASS_BG, 0.85);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, r);
    bg.lineStyle(1, COLOR.WHITE, 0.18);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
    bg.lineStyle(1.5, COLOR.ROSE, 0.85);
    bg.strokeRoundedRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6, r - 3);

    const labelText = this.add
      .text(0, 0, 'RESET PROGRES', {
        fontFamily: FONT.HEAVY,
        fontSize: '14px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setLetterSpacing(4);

    c.add([bg, labelText]);
    c.setSize(w, h);
    c.setInteractive(
      new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h),
      Phaser.Geom.Rectangle.Contains,
    );
    c.input!.cursor = 'pointer';

    let armed = false;
    let armTimer: Phaser.Time.TimerEvent | undefined;

    c.on(Phaser.Input.Events.POINTER_OVER, () =>
      this.tweens.add({ targets: c, scaleX: 1.04, scaleY: 1.04, duration: 130 }),
    );
    c.on(Phaser.Input.Events.POINTER_OUT, () =>
      this.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 130 }),
    );
    c.on(Phaser.Input.Events.POINTER_UP, () => {
      if (!armed) {
        armed = true;
        labelText.setText('TAP LAGI UNTUK KONFIRMASI');
        showToast({
          scene: this,
          message: 'Tap "RESET PROGRES" sekali lagi untuk mengonfirmasi',
          accentColor: COLOR.ROSE,
          duration: 3000,
        });
        armTimer = this.time.delayedCall(3000, () => {
          armed = false;
          labelText.setText('RESET PROGRES');
        });
      } else {
        armTimer?.remove(false);
        armed = false;
        resetSave();
        labelText.setText('RESET PROGRES');
        showToast({
          scene: this,
          message: 'Progres berhasil di-reset.',
          accentColor: COLOR.MINT,
          duration: 2000,
        });
      }
    });

    this.resetBtn = c;
    this.resetLabel = labelText;
  }

  private buildBackButton(): void {
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

    // Title
    this.titleText.setFontSize(Math.round(46 * ui));
    this.titleText.setPosition(cx, Math.round(70 * ui));
    this.subText.setFontSize(Math.max(11, Math.round(13 * ui)));
    this.subText.setPosition(cx, Math.round(70 * ui) + Math.round(36 * ui));

    // Hitung available space supaya panel + reset button masih muat
    const panelTop = Math.round(70 * ui) + Math.round(80 * ui);
    const resetBtnH = Math.round(44 * ui);
    const resetMargin = Math.round(36 * ui);
    const bottomPadding = Math.round(40 * ui);
    const maxPanelH = h - panelTop - resetBtnH - resetMargin - bottomPadding;

    // Adaptif: kalau available space sempit, kecilkan rowGap
    const totalRows = this.rows.length;
    const idealRowGap = Math.round(58 * ui);
    const minRowGap = Math.round(44 * ui);
    const verticalPadding = Math.round(80 * ui); // top + bottom padding inside panel
    const idealPanelH = idealRowGap * totalRows + verticalPadding;

    const rowGap =
      idealPanelH <= maxPanelH
        ? idealRowGap
        : Math.max(minRowGap, Math.floor((maxPanelH - verticalPadding) / totalRows));
    const panelH = rowGap * totalRows + verticalPadding;

    const panelW = Math.min(560 * ui, w - 40);
    const panelBottom = panelTop + panelH;

    this.panelGfx.clear();
    this.panelGfx.fillStyle(COLOR.GLASS_BG, 0.78);
    this.panelGfx.fillRoundedRect(cx - panelW / 2, panelTop, panelW, panelH, 14);
    this.panelGfx.lineStyle(1, COLOR.WHITE, 0.18);
    this.panelGfx.strokeRoundedRect(cx - panelW / 2, panelTop, panelW, panelH, 14);

    // Rows
    const rowPadX = Math.round(28 * ui);
    const rowStartY = panelTop + Math.round(40 * ui);
    const labelX = cx - panelW / 2 + rowPadX;
    const controlX = cx + panelW / 2 - rowPadX;

    this.rows.forEach((row, i) => {
      const y = rowStartY + i * rowGap;
      row.labelText.setPosition(labelX, y - Math.round(8 * ui));
      row.labelText.setFontSize(Math.max(12, Math.round(15 * ui)));
      row.hintText.setPosition(labelX, y + Math.round(11 * ui));
      row.hintText.setFontSize(Math.max(9, Math.round(11 * ui)));

      row.control.setScale(ui);
      if (row.type === 'slider') {
        const sliderTrackW = 220 * ui;
        row.control.setPosition(controlX - sliderTrackW / 2 - Math.round(28 * ui), y);
      } else {
        const swW = 56 * ui;
        row.control.setPosition(controlX - swW / 2, y);
      }
    });

    // Reset button di bawah panel
    const resetY = panelBottom + resetMargin;
    this.resetBtn.setScale(ui);
    this.resetBtn.setPosition(cx, resetY);

    // Back button
    this.backBtn.setScale(ui);
    this.backBtn.setPosition(Math.round(40 * ui) + 6, Math.round(40 * ui) + 6);
  }
}
