import Phaser from 'phaser';
import { AUDIO, SCENE, TEX } from '../config/keys';
import { AudioManager } from '../audio/AudioManager';
import { loadSettings } from '../state/Settings';
import {
  PrimaryButton,
  IconCircleButton,
  drawLevelIcon,
  drawSettingIcon,
  drawAboutIcon,
  drawHelpIcon,
  drawMusicOnIcon,
  drawMusicOffIcon,
  COLOR,
} from '../ui/Button';
import { FONT } from '../ui/fonts';
import { getUiScale, isPortrait } from '../ui/responsive';

/**
 * HomeScene = menu utama.
 * Pakai Phaser.Scale.RESIZE jadi bg + UI re-layout setiap viewport berubah.
 */

const SAFE_PADDING = 28;
const NAV_BTN_SIZE = 42;
const NAV_GAP = 14;
const CTA_W = 240;
const CTA_H = 50;

interface Branding {
  title: Phaser.GameObjects.Text;
  sub: Phaser.GameObjects.Text;
}

export class HomeScene extends Phaser.Scene {
  private bg!: Phaser.GameObjects.Image;
  private bgBaseScale = 1;
  private dust: Array<{
    s: Phaser.GameObjects.Arc;
    vx: number;
    vy: number;
  }> = [];

  private vignTop!: Phaser.GameObjects.Graphics;
  private vignBot!: Phaser.GameObjects.Graphics;
  private vignLeft!: Phaser.GameObjects.Graphics;

  private branding!: Branding;
  private navBtns: IconCircleButton[] = [];
  private cta!: PrimaryButton;
  private ctaCaption!: Phaser.GameObjects.Text;
  private musicBtn?: IconCircleButton;

  constructor() {
    super({ key: SCENE.HOME });
  }

  create() {
    // Reset state karena scene di-reuse Phaser saat restart.
    // Tanpa ini, navBtns/dust accumulate tiap kali balik ke Home.
    this.navBtns = [];
    this.dust = [];
    this.musicBtn = undefined;

    this.cameras.main.fadeIn(450, 0, 0, 0);

    this.buildBackground();
    this.buildVignettes();
    this.buildDust();
    this.buildBranding();
    this.buildLeftNav();
    this.buildCta();
    this.buildTopRight();
    this.startBgm();

    this.layout();
    this.scale.on('resize', this.layout, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.layout, this);
    });
  }

  update(_t: number, delta: number) {
    this.updateDust(delta);
  }

  // ============================================================ BG

  private buildBackground(): void {
    this.bg = this.add.image(0, 0, TEX.BG_HOME).setOrigin(0.5).setDepth(0);

    // Slow ken-burns lewat scale offset (bukan absolute scale, supaya
    // re-layout gak ngerusak tween).
    this.tweens.add({
      targets: this.bg,
      scaleX: { getStart: () => this.bgBaseScale, getEnd: () => this.bgBaseScale * 1.04 },
      scaleY: { getStart: () => this.bgBaseScale, getEnd: () => this.bgBaseScale * 1.04 },
      duration: 16000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private buildVignettes(): void {
    this.vignTop = this.add.graphics().setDepth(1);
    this.vignBot = this.add.graphics().setDepth(1);
    this.vignLeft = this.add.graphics().setDepth(1);
  }

  private redrawVignettes(width: number, height: number): void {
    this.vignTop.clear();
    this.vignTop.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.55, 0.55, 0, 0);
    this.vignTop.fillRect(0, 0, width, 130);

    this.vignBot.clear();
    this.vignBot.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.7, 0.7);
    this.vignBot.fillRect(0, height - 200, width, 200);

    this.vignLeft.clear();
    this.vignLeft.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.5, 0, 0.5, 0);
    this.vignLeft.fillRect(0, 0, 220, height);
  }

  // ============================================================ DUST

  private buildDust(): void {
    const { width, height } = this.scale;
    const count = 30;
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const r = Phaser.Math.FloatBetween(0.6, 1.6);
      const baseAlpha = Phaser.Math.FloatBetween(0.2, 0.45);
      const s = this.add.circle(x, y, r, 0xffffff, baseAlpha).setDepth(2);
      this.tweens.add({
        targets: s,
        alpha: { from: baseAlpha, to: baseAlpha * 0.2 },
        duration: Phaser.Math.Between(1600, 3400),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
        ease: 'Sine.easeInOut',
      });
      this.dust.push({
        s,
        vx: Phaser.Math.FloatBetween(-0.03, 0.03),
        vy: Phaser.Math.FloatBetween(-0.06, -0.02),
      });
    }
  }

  private updateDust(delta: number): void {
    const { width, height } = this.scale;
    for (const d of this.dust) {
      d.s.x += d.vx * delta;
      d.s.y += d.vy * delta;
      if (d.s.y < -10) {
        d.s.y = height + 10;
        d.s.x = Phaser.Math.Between(0, width);
      }
      if (d.s.x < -10) d.s.x = width + 10;
      if (d.s.x > width + 10) d.s.x = -10;
    }
  }

  // ============================================================ BRANDING

  private buildBranding(): void {
    const title = this.add
      .text(0, 0, 'FLAMY & FOAMY', {
        fontFamily: FONT.DISPLAY,
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: '900',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0, 0)
      .setDepth(3)
      .setLetterSpacing(4)
      .setShadow(0, 2, '#000000', 4, true, true);

    const sub = this.add
      .text(0, 0, 'PETUALANGAN 3 ELEMEN', {
        fontFamily: FONT.HEAVY,
        fontSize: '11px',
        color: '#5eead4',
      })
      .setOrigin(0, 0)
      .setDepth(3)
      .setLetterSpacing(4)
      .setAlpha(0.85);

    this.branding = { title, sub };
  }

  // ============================================================ LEFT NAVBAR

  private buildLeftNav(): void {
    const items = [
      {
        icon: drawLevelIcon,
        label: 'Level',
        accent: COLOR.LIME,
        target: SCENE.LEVEL_SELECT,
      },
      {
        icon: drawHelpIcon,
        label: 'Cara',
        accent: COLOR.MINT,
        target: SCENE.CARA_BERMAIN,
      },
      {
        icon: drawSettingIcon,
        label: 'Setting',
        accent: COLOR.AMBER,
        target: SCENE.SETTING,
      },
      {
        icon: drawAboutIcon,
        label: 'About',
        accent: COLOR.ICE,
        target: SCENE.ABOUT,
      },
    ];

    items.forEach((it) => {
      const btn = new IconCircleButton({
        scene: this,
        x: 0,
        y: 0,
        diameter: NAV_BTN_SIZE,
        drawIcon: it.icon,
        label: it.label,
        accentColor: it.accent,
        onClick: () => this.gotoScene(it.target),
      });
      btn.setDepth(5);
      this.navBtns.push(btn);
    });
  }

  private gotoScene(target: string): void {
    this.cameras.main.fadeOut(330, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(target);
    });
  }

  // ============================================================ CTA

  private buildCta(): void {
    this.cta = new PrimaryButton({
      scene: this,
      x: 0,
      y: 0,
      label: 'Mulai Bermain',
      width: CTA_W,
      height: CTA_H,
      onClick: () => this.handleMulai(),
    });
    this.cta.setDepth(4);

    this.ctaCaption = this.add
      .text(0, 0, 'KETUK UNTUK MEMULAI', {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '9px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setLetterSpacing(4)
      .setDepth(4)
      .setAlpha(0.55);
  }

  private handleMulai(): void {
    this.cameras.main.fadeOut(380, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(SCENE.LEVEL_SELECT);
    });
  }

  // ============================================================ TOP RIGHT

  private buildTopRight(): void {
    const settings = loadSettings();
    this.musicBtn = new IconCircleButton({
      scene: this,
      x: 0,
      y: 0,
      diameter: 40,
      drawIcon: settings.musicEnabled ? drawMusicOnIcon : drawMusicOffIcon,
      accentColor: settings.musicEnabled ? COLOR.MINT : COLOR.ROSE,
      onClick: () => this.toggleMusic(),
    });
    this.musicBtn.setDepth(6);
  }

  private toggleMusic(): void {
    const enabled = AudioManager.get(this).toggleMusic();
    if (this.musicBtn) {
      this.musicBtn.setIcon(enabled ? drawMusicOnIcon : drawMusicOffIcon);
      this.musicBtn.setAccent(enabled ? COLOR.MINT : COLOR.ROSE);
    }
  }

  // ============================================================ AUDIO

  private startBgm(): void {
    AudioManager.get(this).playBgm(AUDIO.BGM_HOME);
  }

  // ============================================================ LAYOUT (responsive)

  private layout(): void {
    const width = this.scale.gameSize.width;
    const height = this.scale.gameSize.height;
    const ui = getUiScale(this);
    const portrait = isPortrait(this);

    // ---- BG cover ----
    this.bg.setPosition(width / 2, height / 2);
    this.bgBaseScale = Math.max(width / this.bg.width, height / this.bg.height);
    this.bg.setScale(this.bgBaseScale);

    // ---- Vignettes ----
    this.redrawVignettes(width, height);

    // ---- Branding (top-left) ----
    const padding = Math.round(SAFE_PADDING * ui);
    this.branding.title.setPosition(padding, padding);
    this.branding.title.setFontSize(Math.round(20 * ui));
    this.branding.sub.setPosition(padding, padding + Math.round(28 * ui));
    this.branding.sub.setFontSize(Math.max(9, Math.round(11 * ui)));

    // ---- Left navbar (vertical center) ----
    // Di portrait: pindah ke bottom-left supaya gak bentrok dengan CTA
    const navSize = Math.round(NAV_BTN_SIZE * ui);
    const navGap = Math.round(NAV_GAP * ui);
    const totalH = navSize * this.navBtns.length + navGap * (this.navBtns.length - 1);
    const startY = portrait
      ? height - 110 * ui - totalH / 2 + navSize / 2
      : height / 2 - totalH / 2 + navSize / 2;
    const navX = padding + navSize / 2;
    this.navBtns.forEach((btn, i) => {
      btn.setScale(ui);
      btn.setPosition(navX, startY + i * (navSize + navGap));
    });

    // ---- CTA (bottom center) ----
    const ctaY = height - Math.round(70 * ui);
    this.cta.setScale(ui);
    this.cta.setPosition(width / 2, ctaY);
    this.ctaCaption.setPosition(width / 2, ctaY - Math.round((CTA_H / 2 + 14) * ui));
    this.ctaCaption.setFontSize(Math.max(8, Math.round(9 * ui)));

    // ---- Music toggle (top-right) ----
    if (this.musicBtn) {
      this.musicBtn.setScale(ui);
      this.musicBtn.setPosition(
        width - padding - Math.round(20 * ui),
        padding + Math.round(20 * ui),
      );
    }
  }
}
