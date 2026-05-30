import Phaser from 'phaser';
import { SCENE, TEX } from '../config/keys';
import { IconCircleButton, drawBackIcon } from '../ui/Button';

abstract class StubScene extends Phaser.Scene {
  protected abstract title: string;
  protected abstract subtitle: string;

  private bg?: Phaser.GameObjects.Image;
  private bgFallback?: Phaser.GameObjects.Image;
  private vignette!: Phaser.GameObjects.Rectangle;
  private titleText!: Phaser.GameObjects.Text;
  private subText!: Phaser.GameObjects.Text;
  private noteText!: Phaser.GameObjects.Text;
  private backBtn!: IconCircleButton;

  create() {
    this.cameras.main.fadeIn(400, 0, 0, 0);

    if (this.textures.exists(TEX.BG_HLMLEVEL)) {
      this.bg = this.add.image(0, 0, TEX.BG_HLMLEVEL).setOrigin(0.5);
    } else if (this.textures.exists(TEX.BG_HOME)) {
      this.bgFallback = this.add.image(0, 0, TEX.BG_HOME).setOrigin(0.5).setAlpha(0.55);
    } else {
      this.cameras.main.setBackgroundColor('#0a0a14');
    }

    this.vignette = this.add.rectangle(0, 0, 100, 100, 0x000000, 0.4);

    this.titleText = this.add
      .text(0, 0, this.title, {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '40px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setShadow(0, 4, '#000000', 8, true, true)
      .setLetterSpacing(4);

    this.subText = this.add
      .text(0, 0, this.subtitle, {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
        color: '#cfd2e2',
      })
      .setOrigin(0.5);

    this.noteText = this.add
      .text(0, 0, '(scene ini akan dibuat proper di step berikutnya)', {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '11px',
        color: '#9aa0b4',
      })
      .setOrigin(0.5)
      .setAlpha(0.7);

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

    if (this.bg) {
      this.bg.setPosition(cx, cy);
      const s = Math.max(w / this.bg.width, h / this.bg.height);
      this.bg.setScale(s);
    }
    if (this.bgFallback) {
      this.bgFallback.setPosition(cx, cy);
      const s = Math.max(w / this.bgFallback.width, h / this.bgFallback.height);
      this.bgFallback.setScale(s);
    }

    this.vignette.setPosition(cx, cy);
    this.vignette.setSize(w, h);

    this.titleText.setPosition(cx, cy - 70);
    this.subText.setPosition(cx, cy - 18);
    this.noteText.setPosition(cx, cy + 24);

    this.backBtn.setPosition(50, 50);
  }
}

export class LevelSelectScene extends StubScene {
  protected title = 'PILIH LEVEL';
  protected subtitle = 'Level 1 · Dunia Batu  ·  Level 2 · Dunia Api  ·  Level 3 · Dunia Air';
  constructor() {
    super({ key: SCENE.LEVEL_SELECT });
  }
}

export class SettingScene extends StubScene {
  protected title = 'PENGATURAN';
  protected subtitle = 'Musik  ·  SFX  ·  Volume  ·  Reset Progres';
  constructor() {
    super({ key: SCENE.SETTING });
  }
}

export class AboutScene extends StubScene {
  protected title = 'TENTANG GAME';
  protected subtitle = 'Cerita · Kontrol · Kredit';
  constructor() {
    super({ key: SCENE.ABOUT });
  }
}
