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
  LEVEL1_CONFIG,
  LEVEL1_TERRAIN,
  LEVEL1_COINS,
  LEVEL1_STONES,
  LEVEL1_XP,
  LEVEL1_CHECKPOINTS,
  LEVEL1_SPIKES,
  LEVEL1_TRAPS,
  LEVEL1_ENVTEXT,
} from '../levels/level1';

const LEVEL_ACCENT = 0xb8a578; // batu/gold untuk level 1

// Tinggi world yang SELALU terlihat (konsisten lintas device).
// camera.zoom = viewportHeight / DESIGN_VIEW_HEIGHT → framing vertikal identik
// di HP, tablet, desktop. Canvas tetap full (RESIZE), no letterbox.
// 420 = fokus ke area main (player + ground + ruang lompat), gak kebanyakan langit.
const DESIGN_VIEW_HEIGHT = 420;
// Ground muncul di posisi ini (fraksi dari atas area tampil). 0.72 = agak bawah.
const GROUND_SCREEN_FRAC = 0.72;

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
  private spikes: Spike[] = [];
  private traps: Trap[] = [];
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
  private respawnX = LEVEL1_CONFIG.spawnX;
  private respawnY = LEVEL1_CONFIG.spawnY;
  private invulnerableUntil = 0;

  constructor() {
    super({ key: SCENE.LEVEL1 });
  }

  create() {
    this.skor_koin = 0;
    this.batu_terkumpul = 0;
    this.checkpoints = [];
    this.envTexts = [];
    this.spikes = [];
    this.traps = [];
    this.boss = undefined;
    this.egg = undefined;
    this.bossTriggered = false;
    this.eggSpawned = false;
    this.levelComplete = false;
    this.finishPortal = undefined;
    this.respawnX = LEVEL1_CONFIG.spawnX;
    this.respawnY = LEVEL1_CONFIG.spawnY;
    this.invulnerableUntil = 0;

    this.cameras.main.fadeIn(450, 0, 0, 0);

    const W = LEVEL1_CONFIG.width;
    const H = LEVEL1_CONFIG.worldHeight;

    // ---- Parallax bg ----
    this.parallax = new ParallaxBg(this);
    this.parallax.addLayer({ textureKey: TEX.BG_LEVEL1, scrollFactor: 0.3, alpha: 1 });

    // (Tanpa underground fill — bg parallax sudah menutupi area bawah lantai)

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

    // Camera: manual control (gak pakai startFollow) supaya vertikal benar-benar
    // terkunci. Horizontal di-lerp ke player di lockCameraX().
    this.updateCameraVerticalLock();

    // ---- Collectibles ----
    this.buildCollectibles();

    // ---- Checkpoints ----
    this.buildCheckpoints();

    // ---- Spikes & Traps ----
    this.buildSpikes();
    this.buildTraps();

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

  update(_t: number, delta: number) {
    this.controller.update();
    this.lockCameraX();
    this.lockCameraY();
    this.parallax.update(this.cameras.main);

    // Animate traps
    for (const trap of this.traps) trap.tick(delta);

    // Boss trigger saat player masuk arena
    if (!this.bossTriggered && this.player.x >= LEVEL1_CONFIG.bossTriggerX) {
      this.spawnBoss();
    }
    // Boss AI + player attack check
    if (this.boss && this.boss.alive) {
      this.boss.updateAI(this.player.x, this.player.y);
      this.events.emit('hud:bossHp', this.boss.hp / this.boss.hpMax);
      // Player attack mengenai boss
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

  private buildSpikes(): void {
    for (const s of LEVEL1_SPIKES) {
      const spike = new Spike({ scene: this, x: s.x, y: s.y, width: s.w });
      spike.setDepth(4);
      this.spikes.push(spike);
      this.physics.add.overlap(this.player, spike, () => this.onHazardHit());
    }
  }

  private buildTraps(): void {
    for (const t of LEVEL1_TRAPS) {
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

  private onHazardHit(): void {
    if (this.player.isDead) return;
    if (this.time.now < this.invulnerableUntil) return;
    // Instant kill hazard → respawn
    this.respawnPlayer();
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
    this.cameras.main.shake(220, 0.012);
    AudioManager.get(this).playSfx(this, AUDIO.SFX_DEATH, 0.7);

    // Death particle burst di posisi player
    this.spawnDeathBurst(this.player.x, this.player.y);

    this.player.respawnAt(this.respawnX, this.respawnY);
    this.events.emit('hud:hp', { hp: this.player.hp, max: 200 });

    // Invulnerable 1.2 detik + blink
    this.invulnerableUntil = this.time.now + 1200;
    this.blinkPlayer(1200);
  }

  /** Restart full level (dipakai saat HP habis di boss fight). */
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
    const blink = this.tweens.add({
      targets: this.player,
      alpha: { from: 1, to: 0.3 },
      duration: 120,
      yoyo: true,
      repeat: Math.floor(duration / 240),
      onComplete: () => this.player.setAlpha(1),
    });
    void blink;
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

  // ============================================================ BOSS / EGG / FINISH

  private spawnBoss(): void {
    this.bossTriggered = true;
    const bx = LEVEL1_CONFIG.bossTriggerX + 350;
    this.boss = new Boss({
      scene: this,
      x: bx,
      y: LEVEL1_CONFIG.groundY - 200, // spawn di atas tanah → jatuh & mendarat
      type: 'batu',
      hpMax: 20,
      chaseRange: 700,
      stopRange: 110,
      attackCooldown: 1800,
      damage: 8,
      chaseSpeed: 130,
      renderHeight: 200,
    });
    this.boss.setDepth(6);
    this.physics.add.collider(this.boss, this.platforms);

    this.boss.onHitPlayer((dmg) => {
      if (this.time.now < this.invulnerableUntil) return;
      this.player.takeDamage(dmg);
      this.events.emit('hud:hp', { hp: this.player.hp, max: 200 });
      this.invulnerableUntil = this.time.now + 800;
      // HP habis saat boss fight → restart full level (gak ada checkpoint
      // di arena karena player ke-lock, biar fight beneran menantang).
      if (this.player.hp <= 0) this.restartLevel();
    });
    this.boss.onDeath(() => this.onBossDefeated());

    // HUD boss bar
    this.events.emit('hud:bossShow', { name: 'Penjaga Batu' });
    AudioManager.get(this).playSfx(this, AUDIO.SFX_VICTORY, 0.4);

    // Tutup arena dengan dinding invisible kiri (biar gak kabur)
    this.addCollider(LEVEL1_CONFIG.bossTriggerX - 40, LEVEL1_CONFIG.groundY - 200, 40, 500);
  }

  private onBossDefeated(): void {
    this.events.emit('hud:bossHide');
    AudioManager.get(this).playSfx(this, AUDIO.SFX_VICTORY, 0.9);
    this.cameras.main.flash(300, 184, 165, 120);
    if (this.eggSpawned) return;
    this.eggSpawned = true;
    // Spawn telur di posisi boss mati
    const ex = this.boss ? this.boss.x : LEVEL1_CONFIG.bossTriggerX + 350;
    this.egg = new Egg({
      scene: this,
      x: ex,
      y: LEVEL1_CONFIG.groundY,
      type: 'batu',
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
    const px = (this.egg ? this.egg.x : LEVEL1_CONFIG.exitX) + 200;
    const py = LEVEL1_CONFIG.groundY - 60;
    const portal = this.add.container(px, py).setDepth(6);
    const g = this.add.graphics();
    // Portal ring glow
    g.fillStyle(0xffd84d, 0.25); g.fillCircle(0, 0, 70);
    g.fillStyle(0x5eead4, 0.35); g.fillCircle(0, 0, 50);
    g.fillStyle(0xffffff, 0.5); g.fillCircle(0, 0, 28);
    portal.add(g);
    this.tweens.add({
      targets: g, scaleX: { from: 0.9, to: 1.1 }, scaleY: { from: 0.9, to: 1.1 },
      alpha: { from: 0.7, to: 1 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
    this.tweens.add({ targets: portal, y: py - 8, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.finishPortal = portal;

    // Overlap zone untuk finish
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
        level: 1,
        coin: this.skor_koin,
        coinTarget: LEVEL_TARGETS[1].coin,
        stone: this.batu_terkumpul,
        stoneTarget: LEVEL_TARGETS[1].stones,
      });
    });
  }

  private showEnvBanner(text: string): void {
    const t = this.add
      .text(this.scale.width / 2, this.scale.height * 0.3, text, {
        fontFamily: FONT.BODY,
        fontSize: '18px',
        color: '#ffd84d',
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

  /**
   * Camera zoom = viewH / DESIGN_VIEW_HEIGHT → tinggi world yang tampil SELALU
   * = DESIGN_VIEW_HEIGHT di semua device. Canvas full (RESIZE), no gap.
   */
  private updateCameraVerticalLock(): void {
    const cam = this.cameras.main;
    const viewH = this.scale.height;
    const zoom = viewH / DESIGN_VIEW_HEIGHT;
    cam.setZoom(zoom);
    cam.setBounds(0, -1000, LEVEL1_CONFIG.width, DESIGN_VIEW_HEIGHT + 2000);
    this.lockCameraY();
  }

  /**
   * scrollY diatur supaya ground (y=620) selalu ~90px dari bawah area tampil.
   * Kalau player lompat tinggi, kamera pan ke atas.
   */
  private lockCameraY(): void {
    const cam = this.cameras.main;
    // Ground muncul di GROUND_SCREEN_FRAC dari atas area tampil.
    // scrollY (top world) = groundY - DESIGN_VIEW_HEIGHT * GROUND_SCREEN_FRAC
    const groundedScrollY = LEVEL1_CONFIG.groundY - DESIGN_VIEW_HEIGHT * GROUND_SCREEN_FRAC;
    const threshold = groundedScrollY + DESIGN_VIEW_HEIGHT * 0.32;
    let targetScrollY = groundedScrollY;
    if (this.player.y < threshold) {
      targetScrollY = this.player.y - DESIGN_VIEW_HEIGHT * 0.32;
    }
    targetScrollY = Math.min(targetScrollY, groundedScrollY);
    cam.scrollY = Phaser.Math.Linear(cam.scrollY, targetScrollY, 0.15);
  }

  /** Lerp scrollX ke posisi player (center horizontal), pakai lebar world tampil. */
  private lockCameraX(): void {
    const cam = this.cameras.main;
    // Lebar world yang tampil = viewW / zoom = viewW / (viewH/DESIGN) = DESIGN * (viewW/viewH)
    const visibleW = DESIGN_VIEW_HEIGHT * (this.scale.width / this.scale.height);
    let targetX = this.player.x - visibleW / 2;
    targetX = Phaser.Math.Clamp(targetX, 0, Math.max(0, LEVEL1_CONFIG.width - visibleW));
    cam.scrollX = Phaser.Math.Linear(cam.scrollX, targetX, 0.12);
  }
}
