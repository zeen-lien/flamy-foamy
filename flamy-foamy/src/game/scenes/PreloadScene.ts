import Phaser from 'phaser';
import { SCENE, TEX } from '../config/keys';
import {
  IMAGE_ASSETS,
  AUDIO_ASSETS,
  ANIM_ASSETS,
  frameKey,
  frameFile,
} from '../config/manifest';
import { LoadingVortex } from '../ui/LoadingVortex';
import { getUiScale } from '../ui/responsive';

const ELEMENT_COLORS = {
  batu: 0xb8a578,
  api: 0xff6a3d,
  air: 0x4dc6ff,
} as const;

export class PreloadScene extends Phaser.Scene {
  private barWidth = 520;
  private barHeight = 12;

  private bg?: Phaser.GameObjects.Image;
  private overlay!: Phaser.GameObjects.Rectangle;
  private titleText!: Phaser.GameObjects.Text;
  private subTitleText!: Phaser.GameObjects.Text;
  private percentText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;

  private vortex!: LoadingVortex;
  private barBgGfx!: Phaser.GameObjects.Graphics;
  private barFillGfx!: Phaser.GameObjects.Graphics;

  private currentProgress = 0;

  constructor() {
    super({ key: SCENE.PRELOAD });
  }

  preload() {
    this.currentProgress = 0;

    this.buildLoadingUI();
    this.queueAssets();
    this.wireProgressEvents();
  }

  create() {
    this.createAllAnimations();

    this.currentProgress = 1;
    this.drawBar(1);
    this.percentText.setText('100%');
    this.statusText.setText('Siap berpetualang…');

    this.cameras.main.fadeOut(450, 5, 7, 13);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(SCENE.HOME);
    });
  }

  // ----------------------------------------------------------- UI

  private buildLoadingUI(): void {
    if (this.textures.exists(TEX.BG_PARTIKEL)) {
      this.bg = this.add.image(0, 0, TEX.BG_PARTIKEL).setOrigin(0.5);
    }

    this.overlay = this.add.rectangle(0, 0, 100, 100, 0x05070d, 0.6);

    // Vortex placeholder, posisi di-set di layout()
    this.vortex = new LoadingVortex({ scene: this, x: 0, y: 0, size: 150 });
    this.vortex.setDepth(5);

    this.titleText = this.add
      .text(0, 0, 'FLAMY & FOAMY', {
        fontFamily: '"Cinzel", "Trajan Pro", Georgia, serif',
        fontSize: '40px',
        color: '#f5f1e8',
        fontStyle: '900',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setLetterSpacing(6)
      .setShadow(0, 4, '#000000', 8, true, true);

    this.subTitleText = this.add
      .text(0, 0, 'PETUALANGAN ELEMEN', {
        fontFamily: '"Bebas Neue", Impact, system-ui, sans-serif',
        fontSize: '14px',
        color: '#5eead4',
      })
      .setOrigin(0.5)
      .setLetterSpacing(8);

    this.barBgGfx = this.add.graphics();
    this.barFillGfx = this.add.graphics();

    this.percentText = this.add
      .text(0, 0, '0%', {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setLetterSpacing(2);

    this.statusText = this.add
      .text(0, 0, 'Memuat aset…', {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '11px',
        color: '#cfd2e2',
      })
      .setOrigin(0.5);

    this.hintText = this.add
      .text(0, 0, 'BLOP · FLAMY · FOAMY', {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '10px',
        color: '#7a7f99',
      })
      .setOrigin(0.5)
      .setLetterSpacing(4);

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
    const cy = h / 2;
    const ui = getUiScale(this);

    if (this.bg) {
      this.bg.setPosition(cx, cy);
      const s = Math.max(w / this.bg.width, h / this.bg.height);
      this.bg.setScale(s);
    }
    this.overlay.setPosition(cx, cy);
    this.overlay.setSize(w, h);

    // Vortex di tengah-atas
    this.vortex.setScale(ui);
    this.vortex.setPosition(cx, cy - Math.round(40 * ui));

    this.titleText.setFontSize(Math.round(40 * ui));
    this.titleText.setPosition(cx, cy + Math.round(80 * ui));

    this.subTitleText.setFontSize(Math.max(11, Math.round(14 * ui)));
    this.subTitleText.setPosition(cx, cy + Math.round(116 * ui));

    // Bar — ukuran ikut UI scale
    this.barWidth = Math.round(520 * ui);
    this.barHeight = Math.max(8, Math.round(12 * ui));

    const barY = cy + Math.round(160 * ui);
    this.drawBarFrame(barY);
    this.drawBar(this.currentProgress);
    this.percentText.setFontSize(Math.max(11, Math.round(14 * ui)));
    this.percentText.setPosition(cx, barY - Math.round(22 * ui));
    this.statusText.setFontSize(Math.max(9, Math.round(11 * ui)));
    this.statusText.setPosition(cx, barY + Math.round(22 * ui));

    this.hintText.setFontSize(Math.max(9, Math.round(10 * ui)));
    this.hintText.setPosition(cx, h - Math.round(26 * ui));
  }

  private drawBarFrame(barY: number): void {
    const cx = this.scale.gameSize.width / 2;
    const x = cx - this.barWidth / 2;
    this.barBgGfx.clear();
    this.barBgGfx.fillStyle(0x000000, 0.55);
    this.barBgGfx.fillRoundedRect(x, barY - this.barHeight / 2, this.barWidth, this.barHeight, 3);
    this.barBgGfx.lineStyle(1, 0xffffff, 0.18);
    this.barBgGfx.strokeRoundedRect(x, barY - this.barHeight / 2, this.barWidth, this.barHeight, 3);

    (this.barBgGfx as Phaser.GameObjects.Graphics & { _barY?: number; _barX?: number })._barY = barY;
    (this.barBgGfx as Phaser.GameObjects.Graphics & { _barY?: number; _barX?: number })._barX = x;
  }

  private drawBar(progress: number): void {
    const meta = this.barBgGfx as Phaser.GameObjects.Graphics & { _barY?: number; _barX?: number };
    const barY = meta._barY ?? 0;
    const barX = meta._barX ?? 0;
    const w = Math.max(2, this.barWidth * progress);

    this.barFillGfx.clear();
    const seg = w / 3;
    const colors = [ELEMENT_COLORS.batu, ELEMENT_COLORS.api, ELEMENT_COLORS.air];
    for (let i = 0; i < 3; i++) {
      const segW = Math.max(0, Math.min(seg, w - i * seg));
      if (segW <= 0) break;
      this.barFillGfx.fillStyle(colors[i], 1);
      this.barFillGfx.fillRect(barX + i * seg, barY - this.barHeight / 2, segW, this.barHeight);
    }
    this.barFillGfx.fillStyle(0xffffff, 0.25);
    this.barFillGfx.fillRect(barX, barY - this.barHeight / 2 + 1, w, 2);
  }

  // ----------------------------------------------------------- Queue + progress

  private queueAssets(): void {
    for (const img of IMAGE_ASSETS) this.load.image(img.key, img.path);
    for (const a of AUDIO_ASSETS) this.load.audio(a.key, a.path);
    for (const anim of ANIM_ASSETS) {
      for (let i = 0; i < anim.frames; i++) {
        this.load.image(frameKey(anim.key, i), `${anim.folder}/${frameFile(i)}`);
      }
    }
  }

  private wireProgressEvents(): void {
    this.load.on(Phaser.Loader.Events.PROGRESS, (value: number) => {
      this.tweens.add({
        targets: this,
        currentProgress: value,
        duration: 180,
        ease: 'Sine.easeOut',
        onUpdate: () => {
          this.drawBar(this.currentProgress);
          this.percentText.setText(`${Math.floor(this.currentProgress * 100)}%`);
        },
      });
    });
    this.load.on(Phaser.Loader.Events.FILE_PROGRESS, (file: Phaser.Loader.File) => {
      const short = file.key.length > 38 ? `${file.key.slice(0, 35)}…` : file.key;
      this.statusText.setText(`Memuat: ${short}`);
    });
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.warn('[Preload] Gagal load:', file.key, file.src);
    });
  }

  private createAllAnimations(): void {
    for (const anim of ANIM_ASSETS) {
      if (this.anims.exists(anim.key)) continue;
      const frames: Array<{ key: string }> = [];
      for (let i = 0; i < anim.frames; i++) {
        const k = frameKey(anim.key, i);
        if (this.textures.exists(k)) frames.push({ key: k });
      }
      if (frames.length === 0) continue;
      this.anims.create({
        key: anim.key,
        frames,
        frameRate: anim.frameRate,
        repeat: anim.repeat,
      });
    }
  }
}
