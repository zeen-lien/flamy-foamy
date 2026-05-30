import Phaser from 'phaser';
import { SCENE, TEX } from '../config/keys';
import { Player } from '../entities/Player';
import { PlayerController } from '../entities/PlayerController';
import { TerrainBlock, type TerrainStyle } from '../entities/Terrain';
import { IconCircleButton, drawBackIcon } from '../ui/Button';
import { FONT } from '../ui/fonts';
import { getUiScale } from '../ui/responsive';
import type { PlayerMode } from '../config';
import { showToast } from '../ui/Toast';
import { LEVEL_TARGETS, type LevelId } from '../state/SaveManager';

const FLOOR_Y_FROM_BOTTOM = 80;

const ACCENT_BY_LEVEL: Record<LevelId, number> = {
  1: 0xb8a578,
  2: 0xff6a3d,
  3: 0x4dc6ff,
};

interface InitData {
  level?: LevelId;
}

export class PlayerTestScene extends Phaser.Scene {
  private bg?: Phaser.GameObjects.Image;
  private overlay!: Phaser.GameObjects.Rectangle;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private player!: Player;
  private controller!: PlayerController;
  private titleText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private backBtn!: IconCircleButton;

  // Game state untuk HUD
  private skor_koin = 0;
  private batu_terkumpul = 0;
  private currentLevel: LevelId = 1;

  constructor() {
    super({ key: SCENE.PLAYER_TEST });
  }

  init(data: InitData) {
    this.currentLevel = data.level ?? 1;
    this.skor_koin = 0;
    this.batu_terkumpul = 0;
  }

  create() {
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // Background
    if (this.textures.exists(TEX.BG_LEVEL1)) {
      this.bg = this.add.image(0, 0, TEX.BG_LEVEL1).setOrigin(0.5).setDepth(0);
    } else if (this.textures.exists(TEX.BG_HOME)) {
      this.bg = this.add.image(0, 0, TEX.BG_HOME).setOrigin(0.5).setDepth(0);
    }
    this.overlay = this.add.rectangle(0, 0, 100, 100, 0x000000, 0.35).setDepth(1);

    this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);

    this.platforms = this.physics.add.staticGroup();
    this.buildPlatforms();

    const startX = 200;
    const startY = this.scale.height - FLOOR_Y_FROM_BOTTOM - 80;
    this.player = new Player(this, startX, startY);
    this.player.setDepth(5);
    this.physics.add.collider(this.player, this.platforms);

    this.controller = new PlayerController(this, this.player);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Title kecil
    this.titleText = this.add
      .text(0, 0, 'PLAYER TEST', {
        fontFamily: FONT.HEAVY,
        fontSize: '13px',
        color: '#5eead4',
      })
      .setOrigin(0.5, 0)
      .setLetterSpacing(6)
      .setDepth(8)
      .setScrollFactor(0)
      .setAlpha(0.6);

    this.hintText = this.add
      .text(0, 0, '← → gerak  ·  ↑/Space lompat  ·  J attack  ·  G/B/M/N test koin/batu/damage/heal', {
        fontFamily: FONT.BODY,
        fontSize: '10px',
        color: '#cfd2e2',
      })
      .setOrigin(0.5, 0)
      .setLetterSpacing(2)
      .setDepth(8)
      .setScrollFactor(0)
      .setAlpha(0.65);

    this.backBtn = new IconCircleButton({
      scene: this,
      x: 0,
      y: 0,
      diameter: 40,
      drawIcon: drawBackIcon,
      label: 'Kembali',
      onClick: () => this.exitToHome(),
    });
    this.backBtn.setDepth(8).setScrollFactor(0);

    // Launch HUD scene paralel
    const hudData = {
      parentSceneKey: this.scene.key,
      hp: this.player.hp,
      maxHp: 200,
      coin: this.skor_koin,
      stone: this.batu_terkumpul,
      stoneTarget: LEVEL_TARGETS[this.currentLevel].stones,
      stoneAccent: ACCENT_BY_LEVEL[this.currentLevel],
      mode: this.player.mode,
      unlocked: { fire: true, water: true }, // di test scene semua unlocked
    };
    this.scene.launch(SCENE.HUD, hudData);

    // Listen events dari HUD
    this.events.on('hud:requestSwitchMode', (m: PlayerMode) => {
      this.player.setMode(m);
      this.events.emit('hud:mode', m);
    });
    this.events.on('hud:pause', () => {
      showToast({ scene: this, message: 'Pause coming soon (Step 17)' });
    });

    // Touch controls bridge
    this.events.on('hud:virtualLeft', (down: boolean) => {
      this.controller.setVirtualHorizontal(down ? 'left' : 'none');
    });
    this.events.on('hud:virtualRight', (down: boolean) => {
      this.controller.setVirtualHorizontal(down ? 'right' : 'none');
    });
    this.events.on('hud:virtualJump', () => this.controller.triggerVirtualJump());
    this.events.on('hud:virtualAttack', () => this.controller.triggerVirtualAttack());

    // Sample testing keys: G = +25 coin, B = +1 stone, M = -20 hp
    this.input.keyboard?.on('keydown-G', () => {
      this.skor_koin += 25;
      this.events.emit('hud:coin', this.skor_koin);
    });
    this.input.keyboard?.on('keydown-B', () => {
      this.batu_terkumpul += 1;
      this.events.emit('hud:stone', this.batu_terkumpul);
    });
    this.input.keyboard?.on('keydown-M', () => {
      this.player.takeDamage(20);
      this.events.emit('hud:hp', { hp: this.player.hp, max: 200 });
    });
    this.input.keyboard?.on('keydown-N', () => {
      this.player.heal(30);
      this.events.emit('hud:hp', { hp: this.player.hp, max: 200 });
    });
    // Toggle physics debug (P) untuk verify collision box vs visual
    this.input.keyboard?.on('keydown-P', () => {
      const dbg = this.physics.world.drawDebug;
      this.physics.world.drawDebug = !dbg;
      if (this.physics.world.debugGraphic) {
        this.physics.world.debugGraphic.setVisible(!dbg);
        this.physics.world.debugGraphic.clear();
      } else if (!dbg) {
        this.physics.world.createDebugGraphic();
      }
    });

    this.layout();
    this.scale.on('resize', this.layout, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.layout, this);
    });
  }

  update() {
    this.controller.update();
    // Sync mode ke HUD kalau diubah lewat keyboard (Z/X/C)
    this.events.emit('hud:mode', this.player.mode);
  }

  private buildPlatforms(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const floorY = h - FLOOR_Y_FROM_BOTTOM;
    const floorH = FLOOR_Y_FROM_BOTTOM;

    // ----- Floor: 1 collision zone full-width + beberapa visual segmen -----
    this.addCollider(w / 2, floorY + floorH / 2, w, floorH);

    const segmentCount = Math.max(3, Math.ceil(w / 320));
    const segmentW = w / segmentCount;
    const styles: TerrainStyle[] = ['rock', 'mossy', 'rubble', 'brick', 'crystal'];
    for (let i = 0; i < segmentCount; i++) {
      const styleIdx = (i * 3 + 1) % styles.length;
      const style = styles[styleIdx];
      const cx = i * segmentW + segmentW / 2;
      const tb = new TerrainBlock({
        scene: this,
        x: cx,
        y: floorY + floorH / 2,
        width: segmentW + 1,
        height: floorH,
        style,
        accentColor: ACCENT_BY_LEVEL[this.currentLevel],
        seed: i * 7 + this.currentLevel * 31,
      });
      tb.setDepth(2);
    }

    // ----- Platform melayang: visual + collider masing-masing -----
    const floats: Array<{ cx: number; cy: number; w: number; h: number; style: TerrainStyle; seed: number }> = [
      { cx: 450, cy: floorY - 110, w: 180, h: 30, style: 'mossy', seed: 11 },
      { cx: 700, cy: floorY - 200, w: 160, h: 30, style: 'crystal', seed: 22 },
      { cx: 950, cy: floorY - 110, w: 180, h: 30, style: 'brick', seed: 33 },
      { cx: 1200, cy: floorY - 220, w: 180, h: 30, style: 'rubble', seed: 44 },
    ];
    for (const f of floats) {
      const tb = new TerrainBlock({
        scene: this,
        x: f.cx,
        y: f.cy,
        width: f.w,
        height: f.h,
        style: f.style,
        accentColor: ACCENT_BY_LEVEL[this.currentLevel],
        seed: f.seed,
      });
      tb.setDepth(3);
      this.addCollider(f.cx, f.cy, f.w, f.h);
    }
  }

  /**
   * Tambah collider statis invisible di posisi/ukuran tertentu.
   * Pakai Rectangle (bukan Zone) karena static body Rectangle reliable
   * nge-center (origin 0.5,0.5 + updateFromGameObject), jadi permukaan
   * collision tepat di top visual terrain.
   */
  private addCollider(cx: number, cy: number, w: number, h: number): void {
    const rect = this.add.rectangle(cx, cy, w, h, 0x00ff00, 0); // alpha 0 = invisible
    this.physics.add.existing(rect, true); // static
    const body = rect.body as Phaser.Physics.Arcade.StaticBody;
    body.updateFromGameObject();
    this.platforms.add(rect);
  }

  private exitToHome(): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.stop(SCENE.HUD);
      this.scene.start(SCENE.HOME);
    });
  }

  private layout(): void {
    const w = this.scale.gameSize.width;
    const h = this.scale.gameSize.height;
    const ui = getUiScale(this);

    if (this.bg) {
      this.bg.setPosition(w / 2, h / 2);
      const s = Math.max(w / this.bg.width, h / this.bg.height);
      this.bg.setScale(s);
    }
    this.overlay.setPosition(w / 2, h / 2);
    this.overlay.setSize(w, h);

    this.physics.world.setBounds(0, 0, w, h);
    this.cameras.main.setBounds(0, 0, w, h);

    this.titleText.setFontSize(Math.max(11, Math.round(13 * ui)));
    this.titleText.setPosition(w / 2, Math.round(8 * ui));

    this.hintText.setFontSize(Math.max(9, Math.round(10 * ui)));
    this.hintText.setPosition(w / 2, Math.round(28 * ui));

    this.backBtn.setScale(ui);
    this.backBtn.setPosition(Math.round(40 * ui) + 6, h - Math.round(40 * ui) - 6);
  }
}
