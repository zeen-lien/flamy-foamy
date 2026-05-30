import Phaser from 'phaser';
import { SCENE, TEX, AUDIO } from '../config/keys';
import { Player } from '../entities/Player';
import { PlayerController } from '../entities/PlayerController';
import { TerrainBlock } from '../entities/Terrain';
import { Collectible } from '../entities/Collectible';
import { Checkpoint } from '../entities/Checkpoint';
import { EnvText } from '../entities/EnvText';
import { ParallaxBg } from '../entities/ParallaxBg';
import { AudioManager } from '../audio/AudioManager';
import { LEVEL_TARGETS } from '../state/SaveManager';
import type { PlayerMode } from '../config';
import {
  LEVEL1_CONFIG,
  LEVEL1_TERRAIN,
  LEVEL1_COINS,
  LEVEL1_STONES,
  LEVEL1_XP,
  LEVEL1_CHECKPOINTS,
  LEVEL1_ENVTEXT,
} from '../levels/level1';

const LEVEL_ACCENT = 0xb8a578; // batu/gold untuk level 1

export class Level1Scene extends Phaser.Scene {
  private parallax!: ParallaxBg;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private player!: Player;
  private controller!: PlayerController;

  private coins!: Phaser.GameObjects.Group;
  private stones!: Phaser.GameObjects.Group;
  private xps!: Phaser.GameObjects.Group;
  private checkpoints: Checkpoint[] = [];
  private envTexts: EnvText[] = [];

  // State
  private skor_koin = 0;
  private batu_terkumpul = 0;
  private respawnX = LEVEL1_CONFIG.spawnX;
  private respawnY = LEVEL1_CONFIG.spawnY;

  constructor() {
    super({ key: SCENE.LEVEL1 });
  }

  create() {
    this.skor_koin = 0;
    this.batu_terkumpul = 0;
    this.checkpoints = [];
    this.envTexts = [];
    this.respawnX = LEVEL1_CONFIG.spawnX;
    this.respawnY = LEVEL1_CONFIG.spawnY;

    this.cameras.main.fadeIn(450, 0, 0, 0);

    const W = LEVEL1_CONFIG.width;
    const H = LEVEL1_CONFIG.worldHeight;
    const viewW = this.scale.width;
    const viewH = this.scale.height;

    // ---- Parallax bg ----
    this.parallax = new ParallaxBg(this);
    this.parallax.addLayer({ textureKey: TEX.BG_LEVEL1, scrollFactor: 0.25, alpha: 1 }, viewW, viewH);

    // World bounds (physics) — pakai world height fixed.
    // Camera bounds di-set terpisah via updateCameraVerticalLock().
    this.physics.world.setBounds(0, -200, W, H + 600);

    // ---- Terrain ----
    this.platforms = this.physics.add.staticGroup();
    this.buildTerrain();

    // ---- Player ----
    this.player = new Player(this, LEVEL1_CONFIG.spawnX, LEVEL1_CONFIG.spawnY);
    this.player.setDepth(5);
    this.physics.add.collider(this.player, this.platforms);

    this.controller = new PlayerController(this, this.player);

    // Camera follow horizontal saja; vertical di-lock supaya ground selalu
    // nempel di bawah viewport (gak ngambang di tengah saat viewport tinggi).
    this.cameras.main.startFollow(this.player, true, 0.12, 0);
    this.updateCameraVerticalLock();

    // ---- Collectibles ----
    this.buildCollectibles();

    // ---- Checkpoints ----
    this.buildCheckpoints();

    // ---- Env text ----
    this.buildEnvTexts();

    // ---- BGM ----
    AudioManager.get(this).playBgm(AUDIO.BGM_LEVEL1);

    // ---- HUD ----
    this.launchHud();

    // ---- Death plane (jatuh ke bawah world) ----
    // dicek di update()

    this.scale.on('resize', this.onResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.onResize, this);
    });
  }

  update() {
    this.controller.update();
    this.parallax.update(this.cameras.main.scrollX, this.cameras.main.scrollY);

    // Sync mode ke HUD
    this.events.emit('hud:mode', this.player.mode);

    // Proximity env text
    for (const et of this.envTexts) {
      et.updateProximity(this.player.x, this.player.y);
    }

    // Death plane — jatuh ke jurang (pakai world coordinate fixed)
    if (!this.player.isDead && this.player.y > LEVEL1_CONFIG.deathY) {
      this.respawnPlayer();
    }
  }

  // ============================================================ BUILDERS

  private buildTerrain(): void {
    for (const t of LEVEL1_TERRAIN) {
      new TerrainBlock({
        scene: this,
        x: t.x,
        y: t.y,
        width: t.w,
        height: t.h,
        style: t.style,
        accentColor: LEVEL_ACCENT,
        seed: t.seed,
      }).setDepth(t.h > 80 ? 2 : 3);

      // Collider invisible rectangle
      this.addCollider(t.x, t.y, t.w, t.h);
    }
  }

  private addCollider(cx: number, cy: number, w: number, h: number): void {
    const rect = this.add.rectangle(cx, cy, w, h, 0x00ff00, 0);
    this.physics.add.existing(rect, true);
    (rect.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
    this.platforms.add(rect);
  }

  private buildCollectibles(): void {
    this.coins = this.add.group();
    this.stones = this.add.group();
    this.xps = this.add.group();

    for (const c of LEVEL1_COINS) {
      const coin = new Collectible({ scene: this, x: c.x, y: c.y, type: 'coin', value: 5 });
      coin.setDepth(4);
      this.coins.add(coin);
      this.physics.add.overlap(this.player, coin, () => this.collectCoin(coin));
    }

    for (const s of LEVEL1_STONES) {
      const stone = new Collectible({
        scene: this,
        x: s.x,
        y: s.y,
        type: 'stone',
        textureKey: TEX.ITEM_FIRESTONE,
        value: 1,
      });
      stone.setDepth(4);
      this.stones.add(stone);
      this.physics.add.overlap(this.player, stone, () => this.collectStone(stone));
    }

    for (const x of LEVEL1_XP) {
      const xp = new Collectible({ scene: this, x: x.x, y: x.y, type: 'xp', value: 50 });
      xp.setDepth(4);
      this.xps.add(xp);
      this.physics.add.overlap(this.player, xp, () => this.collectXp(xp));
    }
  }

  private buildCheckpoints(): void {
    for (const cp of LEVEL1_CHECKPOINTS) {
      const checkpoint = new Checkpoint({
        scene: this,
        x: cp.x,
        y: cp.y,
        size: 48,
        onActivate: (c) => {
          this.respawnX = c.spawnX;
          this.respawnY = c.spawnY;
          AudioManager.get(this).playSfx(this, AUDIO.SFX_COIN, 0.6);
        },
      });
      checkpoint.setDepth(3);
      this.checkpoints.push(checkpoint);
      this.physics.add.overlap(this.player, checkpoint, () => checkpoint.activate());
    }
  }

  private buildEnvTexts(): void {
    for (const e of LEVEL1_ENVTEXT) {
      const et = new EnvText({
        scene: this,
        x: e.x,
        y: e.y,
        text: e.text,
        triggerRadius: e.trigger ?? 220,
      });
      this.envTexts.push(et);
    }
  }

  // ============================================================ COLLECT HANDLERS

  private collectCoin(coin: Collectible): void {
    if (coin.collected) return;
    this.skor_koin += coin.value;
    // Target fly: posisi coin badge HUD (kira-kira kiri atas, screen space).
    // Karena collectible di world space, kita fly ke posisi world yang
    // setara dengan HUD corner (camera scroll + offset).
    const cam = this.cameras.main;
    const tx = cam.scrollX + 90;
    const ty = cam.scrollY + 90;
    coin.collect(tx, ty, () => {
      this.events.emit('hud:coin', this.skor_koin);
    });
    AudioManager.get(this).playSfx(this, AUDIO.SFX_COIN, 0.8);
  }

  private collectStone(stone: Collectible): void {
    if (stone.collected) return;
    this.batu_terkumpul += stone.value;
    const cam = this.cameras.main;
    const tx = cam.scrollX + 240;
    const ty = cam.scrollY + 90;
    stone.collect(tx, ty, () => {
      this.events.emit('hud:stone', this.batu_terkumpul);
    });
    AudioManager.get(this).playSfx(this, AUDIO.SFX_COIN, 1);
    // Screen flash sedikit
    this.cameras.main.flash(150, 184, 165, 120, false);
  }

  private collectXp(xp: Collectible): void {
    if (xp.collected) return;
    this.player.heal(xp.value);
    const cam = this.cameras.main;
    const tx = cam.scrollX + 40;
    const ty = cam.scrollY + 40;
    xp.collect(tx, ty, () => {
      this.events.emit('hud:hp', { hp: this.player.hp, max: 200 });
    });
    AudioManager.get(this).playSfx(this, AUDIO.SFX_COIN, 0.7);
  }

  private respawnPlayer(): void {
    this.cameras.main.flash(200, 80, 20, 20);
    AudioManager.get(this).playSfx(this, AUDIO.SFX_DEATH, 0.7);
    this.player.respawnAt(this.respawnX, this.respawnY);
    this.events.emit('hud:hp', { hp: this.player.hp, max: 200 });
  }

  // ============================================================ HUD

  private launchHud(): void {
    const hudData = {
      parentSceneKey: this.scene.key,
      hp: this.player.hp,
      maxHp: 200,
      coin: this.skor_koin,
      stone: this.batu_terkumpul,
      stoneTarget: LEVEL_TARGETS[1].stones,
      stoneAccent: LEVEL_ACCENT,
      mode: this.player.mode,
      unlocked: { fire: false, water: false }, // level 1 cuma blop
    };
    this.scene.launch(SCENE.HUD, hudData);
    // Pastikan HUD render di atas level scene (urutan scene list bikin
    // Level1 render di atas HUD kalau gak di-bringToTop).
    this.scene.bringToTop(SCENE.HUD);

    this.events.on('hud:requestSwitchMode', (m: PlayerMode) => {
      // Level 1 cuma blop unlocked; fire/water locked (di-handle ModeSwitcher)
      this.player.setMode(m);
      this.events.emit('hud:mode', m);
    });
    this.events.on('hud:pause', () => {
      this.exitToHome(); // sementara: pause = balik home. Step 17 ganti pause proper.
    });

    // Touch bridge
    this.events.on('hud:virtualLeft', (down: boolean) =>
      this.controller.setVirtualHorizontal(down ? 'left' : 'none'),
    );
    this.events.on('hud:virtualRight', (down: boolean) =>
      this.controller.setVirtualHorizontal(down ? 'right' : 'none'),
    );
    this.events.on('hud:virtualJump', () => this.controller.triggerVirtualJump());
    this.events.on('hud:virtualAttack', () => this.controller.triggerVirtualAttack());
  }

  private exitToHome(): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.stop(SCENE.HUD);
      this.scene.start(SCENE.HOME);
    });
  }

  private onResize(): void {
    this.parallax.resize(this.scale.width, this.scale.height);
    this.updateCameraVerticalLock();
  }

  /**
   * Lock kamera secara vertikal supaya ground (groundY) selalu berada dekat
   * bawah viewport, gak ngambang di tengah saat viewport lebih tinggi dari
   * world design height.
   */
  private updateCameraVerticalLock(): void {
    const viewH = this.scale.height;
    const groundY = LEVEL1_CONFIG.groundY;
    // Kita mau groundY tampil ~80px dari bawah layar.
    // scrollY = groundY + margin - viewH  (supaya ground di dekat bawah)
    const targetScrollY = groundY + 100 - viewH;
    // Camera bounds vertical di-set supaya scrollY ini valid & terkunci.
    const W = LEVEL1_CONFIG.width;
    this.cameras.main.setBounds(0, targetScrollY, W, viewH);
  }
}
