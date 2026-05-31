import Phaser from 'phaser';
import { SCENE, TEX, AUDIO } from '../config/keys';
import { Player } from '../entities/Player';
import { PlayerController } from '../entities/PlayerController';
import { TerrainBlock } from '../entities/Terrain';
import { Collectible } from '../entities/Collectible';
import { Checkpoint } from '../entities/Checkpoint';
import { Spike } from '../entities/Spike';
import { Trap } from '../entities/Trap';
import { Boss } from '../entities/Boss';
import { Egg } from '../entities/Egg';
import { EnvText } from '../entities/EnvText';
import { ParallaxBg } from '../entities/ParallaxBg';
import { AudioManager } from '../audio/AudioManager';
import { FONT } from '../ui/fonts';
import { LEVEL_TARGETS } from '../state/SaveManager';
import { GAMEPLAY } from '../config';
import type { PlayerMode } from '../config';
import {
  LEVEL2_CONFIG,
  LEVEL2_TERRAIN,
  LEVEL2_COINS,
  LEVEL2_STONES,
  LEVEL2_XP,
  LEVEL2_CHECKPOINTS,
  LEVEL2_SPIKES,
  LEVEL2_TRAPS,
  LEVEL2_ENVTEXT,
  LEVEL2_LAVAZONES,
} from '../levels/level2';

const LEVEL_ACCENT = 0xff6a3d; // orange/fire untuk level 2

const DESIGN_VIEW_HEIGHT = 420;
const GROUND_SCREEN_FRAC = 0.72;

export class Level2Scene extends Phaser.Scene {
  private parallax!: ParallaxBg;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private player!: Player;
  private controller!: PlayerController;

  private coins!: Phaser.GameObjects.Group;
  private stones!: Phaser.GameObjects.Group;
  private xps!: Phaser.GameObjects.Group;
  private checkpoints: Checkpoint[] = [];
  private envTexts: EnvText[] = [];
  private spikes: Spike[] = [];
  private traps: Trap[] = [];
  private lavaZones: Phaser.GameObjects.Rectangle[] = [];
  private boss?: Boss;
  private egg?: Egg;
  private bossTriggered = false;
  private eggSpawned = false;
  private levelComplete = false;
  private finishPortal?: Phaser.GameObjects.Container;
  private playerHitRegistered = false;
  private eggHitRegistered = false;

  // State
  private skor_koin = 0;
  private batu_terkumpul = 0;
  private respawnX = LEVEL2_CONFIG.spawnX;
  private respawnY = LEVEL2_CONFIG.spawnY;
  private invulnerableUntil = 0;

  constructor() {
    super({ key: SCENE.LEVEL2 });
  }

  create() {
    this.skor_koin = 0;
    this.batu_terkumpul = 0;
    this.checkpoints = [];
    this.envTexts = [];
    this.spikes = [];
    this.traps = [];
    this.lavaZones = [];
    this.boss = undefined;
    this.egg = undefined;
    this.bossTriggered = false;
    this.eggSpawned = false;
    this.levelComplete = false;
    this.finishPortal = undefined;
    this.respawnX = LEVEL2_CONFIG.spawnX;
    this.respawnY = LEVEL2_CONFIG.spawnY;
    this.invulnerableUntil = 0;

    this.cameras.main.fadeIn(450, 0, 0, 0);

    const W = LEVEL2_CONFIG.width;
    const H = LEVEL2_CONFIG.worldHeight;

    // ---- Parallax bg ----
    this.parallax = new ParallaxBg(this);
    this.parallax.addLayer({ textureKey: TEX.BG_LEVEL2, scrollFactor: 0.3, alpha: 1 });

    // World bounds
    this.physics.world.setBounds(0, -200, W, H + 600);

    // ---- Terrain ----
    this.platforms = this.physics.add.staticGroup();
    this.buildTerrain();

    // ---- Player ----
    this.player = new Player(this, LEVEL2_CONFIG.spawnX, LEVEL2_CONFIG.spawnY);
    this.player.setDepth(5);
    this.physics.add.collider(this.player, this.platforms);

    this.controller = new PlayerController(this, this.player);

    // Camera
    this.updateCameraVerticalLock();

    // ---- Collectibles ----
    this.buildCollectibles();

    // ---- Checkpoints ----
    this.buildCheckpoints();

    // ---- Spikes & Traps ----
    this.buildSpikes();
    this.buildTraps();

    // ---- Lava zones ----
    this.buildLavaZones();

    // ---- Env text ----
    this.buildEnvTexts();

    // ---- BGM ----
    AudioManager.get(this).playBgm(AUDIO.BGM_LEVEL2);

    // ---- HUD ----
    this.launchHud();

    this.scale.on('resize', this.onResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.onResize, this);
    });
  }

  update(_t: number, delta: number) {
    this.controller.update();
    this.lockCameraX();
    this.lockCameraY();
    this.parallax.update(this.cameras.main);

    // Animate traps
    for (const trap of this.traps) trap.tick(delta);

    // Lava zone check
    this.checkLavaZones();

    // Boss trigger
    if (!this.bossTriggered && this.player.x >= LEVEL2_CONFIG.bossTriggerX) {
      this.spawnBoss();
    }
    // Boss AI + player attack check
    if (this.boss && this.boss.alive) {
      this.boss.updateAI(this.player.x, this.player.y);
      this.events.emit('hud:bossHp', this.boss.hp / this.boss.hpMax);
      if (this.player.isAttacking) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.boss.x, this.boss.y);
        if (dist < 90 && !this.playerHitRegistered) {
          this.playerHitRegistered = true;
          this.boss.takeHit(GAMEPLAY.playerDamageToBoss);
        }
      } else {
        this.playerHitRegistered = false;
      }
    }
    // Player attack mengenai telur
    if (this.egg && !this.egg.cracked && this.player.isAttacking) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.egg.x, this.egg.y);
      if (dist < 90 && !this.eggHitRegistered) {
        this.eggHitRegistered = true;
        this.egg.hit();
        AudioManager.get(this).playSfx(this, AUDIO.SFX_COIN, 0.8);
      }
    } else if (!this.player.isAttacking) {
      this.eggHitRegistered = false;
    }

    // Sync mode ke HUD
    this.events.emit('hud:mode', this.player.mode);

    // Proximity env text
    for (const et of this.envTexts) {
      et.updateProximity(this.player.x, this.player.y);
    }

    // Death plane
    if (!this.player.isDead && this.player.y > LEVEL2_CONFIG.deathY) {
      this.respawnPlayer();
    }
  }

  // ============================================================ BUILDERS

  private buildTerrain(): void {
    for (const t of LEVEL2_TERRAIN) {
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

    for (const c of LEVEL2_COINS) {
      const coin = new Collectible({ scene: this, x: c.x, y: c.y, type: 'coin', value: 5 });
      coin.setDepth(4);
      this.coins.add(coin);
      this.physics.add.overlap(this.player, coin, () => this.collectCoin(coin));
    }

    for (const s of LEVEL2_STONES) {
      const stone = new Collectible({
        scene: this,
        x: s.x,
        y: s.y,
        type: 'stone',
        textureKey: TEX.ITEM_WATERSTONE,
        value: 1,
      });
      stone.setDepth(4);
      this.stones.add(stone);
      this.physics.add.overlap(this.player, stone, () => this.collectStone(stone));
    }

    for (const x of LEVEL2_XP) {
      const xp = new Collectible({ scene: this, x: x.x, y: x.y, type: 'xp', value: 50 });
      xp.setDepth(4);
      this.xps.add(xp);
      this.physics.add.overlap(this.player, xp, () => this.collectXp(xp));
    }
  }

  private buildCheckpoints(): void {
    for (const cp of LEVEL2_CHECKPOINTS) {
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
    for (const e of LEVEL2_ENVTEXT) {
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

  private buildSpikes(): void {
    for (const s of LEVEL2_SPIKES) {
      const spike = new Spike({ scene: this, x: s.x, y: s.y, width: s.w });
      spike.setDepth(4);
      this.spikes.push(spike);
      this.physics.add.overlap(this.player, spike, () => this.onHazardHit());
    }
  }

  private buildTraps(): void {
    for (const t of LEVEL2_TRAPS) {
      const trap = new Trap({
        scene: this,
        x: t.x,
        y: t.y,
        variant: t.variant,
        width: 72,
        onDuration: t.onDur,
        offDuration: t.offDur,
        startDelay: t.delay,
      });
      trap.setDepth(4);
      this.traps.push(trap);
      this.physics.add.overlap(this.player, trap, () => {
        if (trap.isLethal()) this.onHazardHit();
      });
    }
  }

  private buildLavaZones(): void {
    for (const lz of LEVEL2_LAVAZONES) {
      const zone = this.add.rectangle(lz.x, lz.y, lz.w, lz.h, 0xff4500, 0.15);
      zone.setDepth(1);
      this.physics.add.existing(zone, true);
      (zone.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
      this.lavaZones.push(zone);
    }
  }

  private checkLavaZones(): void {
    if (this.player.isDead) return;
    if (this.time.now < this.invulnerableUntil) return;
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const playerRect = new Phaser.Geom.Rectangle(playerBody.x, playerBody.y, playerBody.width, playerBody.height);
    for (const zone of this.lavaZones) {
      const body = zone.body as Phaser.Physics.Arcade.StaticBody;
      const zoneRect = new Phaser.Geom.Rectangle(body.x, body.y, body.width, body.height);
      if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, zoneRect)) {
        if (this.player.mode !== 'fire') {
          this.respawnPlayer();
          return;
        }
      }
    }
  }

  private onHazardHit(): void {
    if (this.player.isDead) return;
    if (this.time.now < this.invulnerableUntil) return;
    this.respawnPlayer();
  }

  // ============================================================ COLLECT HANDLERS

  private collectCoin(coin: Collectible): void {
    if (coin.collected) return;
    this.skor_koin += coin.value;
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
    this.cameras.main.shake(220, 0.012);
    AudioManager.get(this).playSfx(this, AUDIO.SFX_DEATH, 0.7);
    this.spawnDeathBurst(this.player.x, this.player.y);
    this.player.respawnAt(this.respawnX, this.respawnY);
    this.events.emit('hud:hp', { hp: this.player.hp, max: 200 });
    this.invulnerableUntil = this.time.now + 1200;
    this.blinkPlayer(1200);
  }

  private restartLevel(): void {
    if (this.levelComplete) return;
    this.cameras.main.shake(300, 0.02);
    this.cameras.main.fadeOut(500, 0, 0, 0);
    AudioManager.get(this).playSfx(this, AUDIO.SFX_DEATH, 0.8);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.stop(SCENE.HUD);
      this.scene.restart();
    });
  }

  private spawnDeathBurst(x: number, y: number): void {
    for (let i = 0; i < 10; i++) {
      const p = this.add.circle(x, y - 20, Phaser.Math.Between(2, 4), 0xff5252, 1).setDepth(9);
      const ang = (i / 10) * Math.PI * 2;
      const dist = Phaser.Math.Between(30, 70);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(ang) * dist,
        y: y - 20 + Math.sin(ang) * dist,
        alpha: 0,
        scale: 0.3,
        duration: 450,
        ease: 'Cubic.easeOut',
        onComplete: () => p.destroy(),
      });
    }
  }

  private blinkPlayer(duration: number): void {
    this.tweens.add({
      targets: this.player,
      alpha: { from: 1, to: 0.3 },
      duration: 120,
      yoyo: true,
      repeat: Math.floor(duration / 240),
      onComplete: () => this.player.setAlpha(1),
    });
  }

  // ============================================================ HUD

  private launchHud(): void {
    const hudData = {
      parentSceneKey: this.scene.key,
      hp: this.player.hp,
      maxHp: 200,
      coin: this.skor_koin,
      stone: this.batu_terkumpul,
      stoneTarget: LEVEL_TARGETS[2].stones,
      stoneAccent: LEVEL_ACCENT,
      mode: this.player.mode,
      unlocked: { fire: true, water: false },
    };
    this.scene.launch(SCENE.HUD, hudData);
    this.scene.bringToTop(SCENE.HUD);

    this.events.on('hud:requestSwitchMode', (m: PlayerMode) => {
      this.player.setMode(m);
      this.events.emit('hud:mode', m);
    });
    this.events.on('hud:pause', () => {
      this.exitToHome();
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

  // ============================================================ BOSS / EGG / FINISH

  private spawnBoss(): void {
    this.bossTriggered = true;
    const bx = LEVEL2_CONFIG.bossTriggerX + 350;
    this.boss = new Boss({
      scene: this,
      x: bx,
      y: LEVEL2_CONFIG.groundY - 200,
      type: 'api',
      hpMax: 25,
      chaseRange: 700,
      stopRange: 100,
      attackCooldown: 1500,
      damage: 10,
      chaseSpeed: 150,
      renderHeight: 170,
    });
    this.boss.setDepth(6);
    this.physics.add.collider(this.boss, this.platforms);

    this.boss.onHitPlayer((dmg) => {
      if (this.time.now < this.invulnerableUntil) return;
      this.player.takeDamage(dmg);
      this.events.emit('hud:hp', { hp: this.player.hp, max: 200 });
      this.invulnerableUntil = this.time.now + 800;
      if (this.player.hp <= 0) this.restartLevel();
    });
    this.boss.onDeath(() => this.onBossDefeated());

    this.events.emit('hud:bossShow', { name: 'Penjaga Api' });
    AudioManager.get(this).playSfx(this, AUDIO.SFX_VICTORY, 0.4);

    // Arena wall
    this.addCollider(LEVEL2_CONFIG.bossTriggerX - 40, LEVEL2_CONFIG.groundY - 200, 40, 500);
  }

  private onBossDefeated(): void {
    this.events.emit('hud:bossHide');
    AudioManager.get(this).playSfx(this, AUDIO.SFX_VICTORY, 0.9);
    this.cameras.main.flash(300, 255, 106, 61);
    if (this.eggSpawned) return;
    this.eggSpawned = true;
    const ex = this.boss ? this.boss.x : LEVEL2_CONFIG.bossTriggerX + 350;
    this.egg = new Egg({
      scene: this,
      x: ex,
      y: LEVEL2_CONFIG.groundY,
      type: 'api',
      hpMax: 5,
      renderHeight: 90,
      accentColor: LEVEL_ACCENT,
      onCracked: () => this.onEggCracked(),
    });
    this.egg.setDepth(6);
    this.showEnvBanner('Pecahkan Telur! Serang dengan tombol Attack.');
  }

  private onEggCracked(): void {
    this.spawnFinishPortal();
    this.showEnvBanner('Portal terbuka! Menuju gerbang cahaya…');
  }

  private spawnFinishPortal(): void {
    const px = (this.egg ? this.egg.x : LEVEL2_CONFIG.exitX) + 200;
    const py = LEVEL2_CONFIG.groundY - 60;
    const portal = this.add.container(px, py).setDepth(6);
    const g = this.add.graphics();
    g.fillStyle(0xff6a3d, 0.25); g.fillCircle(0, 0, 70);
    g.fillStyle(0xff9f43, 0.35); g.fillCircle(0, 0, 50);
    g.fillStyle(0xffffff, 0.5); g.fillCircle(0, 0, 28);
    portal.add(g);
    this.tweens.add({
      targets: g, scaleX: { from: 0.9, to: 1.1 }, scaleY: { from: 0.9, to: 1.1 },
      alpha: { from: 0.7, to: 1 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
    this.tweens.add({ targets: portal, y: py - 8, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.finishPortal = portal;

    const zone = this.add.rectangle(px, py, 80, 140, 0x00ff00, 0);
    this.physics.add.existing(zone, true);
    (zone.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
    this.physics.add.overlap(this.player, zone, () => this.completeLevel());
  }

  private completeLevel(): void {
    if (this.levelComplete) return;
    this.levelComplete = true;
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.stop(SCENE.HUD);
      this.scene.start(SCENE.HASIL, {
        level: 2,
        coin: this.skor_koin,
        coinTarget: LEVEL_TARGETS[2].coin,
        stone: this.batu_terkumpul,
        stoneTarget: LEVEL_TARGETS[2].stones,
      });
    });
  }

  private showEnvBanner(text: string): void {
    const t = this.add
      .text(this.scale.width / 2, this.scale.height * 0.3, text, {
        fontFamily: FONT.BODY,
        fontSize: '18px',
        color: '#ff6a3d',
        fontStyle: 'italic',
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(40)
      .setAlpha(0);
    this.tweens.add({
      targets: t,
      alpha: 1,
      duration: 400,
      yoyo: true,
      hold: 2000,
      onComplete: () => t.destroy(),
    });
  }

  private exitToHome(): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.stop(SCENE.HUD);
      this.scene.start(SCENE.HOME);
    });
  }

  private onResize(): void {
    this.updateCameraVerticalLock();
  }

  private updateCameraVerticalLock(): void {
    const cam = this.cameras.main;
    const viewH = this.scale.height;
    const zoom = viewH / DESIGN_VIEW_HEIGHT;
    cam.setZoom(zoom);
    cam.setBounds(0, -1000, LEVEL2_CONFIG.width, DESIGN_VIEW_HEIGHT + 2000);
    this.lockCameraY();
  }

  private lockCameraY(): void {
    const cam = this.cameras.main;
    const groundedScrollY = LEVEL2_CONFIG.groundY - DESIGN_VIEW_HEIGHT * GROUND_SCREEN_FRAC;
    const threshold = groundedScrollY + DESIGN_VIEW_HEIGHT * 0.32;
    let targetScrollY = groundedScrollY;
    if (this.player.y < threshold) {
      targetScrollY = this.player.y - DESIGN_VIEW_HEIGHT * 0.32;
    }
    targetScrollY = Math.min(targetScrollY, groundedScrollY);
    cam.scrollY = Phaser.Math.Linear(cam.scrollY, targetScrollY, 0.15);
  }

  private lockCameraX(): void {
    const cam = this.cameras.main;
    const visibleW = DESIGN_VIEW_HEIGHT * (this.scale.width / this.scale.height);
    let targetX = this.player.x - visibleW / 2;
    targetX = Phaser.Math.Clamp(targetX, 0, Math.max(0, LEVEL2_CONFIG.width - visibleW));
    cam.scrollX = Phaser.Math.Linear(cam.scrollX, targetX, 0.12);
  }
}
