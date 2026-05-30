import Phaser from 'phaser';
import { SCENE } from '../config/keys';
import type { PlayerMode } from '../config';
import { getUiScale } from '../ui/responsive';
import { HpRibbon } from '../hud/HpRibbon';
import { CoinBadge } from '../hud/CoinBadge';
import { StoneBadge } from '../hud/StoneBadge';
import { ModeSwitcher } from '../hud/ModeSwitcher';
import { PauseButton } from '../hud/PauseButton';
import { showToast } from '../ui/Toast';

/**
 * HUDScene â€” overlay yang jalan paralel dengan level scene.
 * Komunikasi: level scene `scene.launch(HUD, payload)` lalu update via
 * scene events.
 *
 * Events yang di-listen:
 *  - 'hud:hp'      payload: { hp, max }
 *  - 'hud:coin'    payload: number
 *  - 'hud:stone'   payload: number
 *  - 'hud:mode'    payload: PlayerMode
 *  - 'hud:unlocks' payload: { fire, water }
 *
 * Events yang di-emit ke level scene:
 *  - 'hud:requestSwitchMode'  payload: PlayerMode
 *  - 'hud:pause'
 */

export interface HUDInitData {
  parentSceneKey: string;
  hp: number;
  maxHp: number;
  coin: number;
  stone: number;
  stoneTarget: number;
  stoneAccent: number;
  mode: PlayerMode;
  unlocked: { fire: boolean; water: boolean };
}

export class HUDScene extends Phaser.Scene {
  private hp!: HpRibbon;
  private coin!: CoinBadge;
  private stone!: StoneBadge;
  private mode!: ModeSwitcher;
  private pause!: PauseButton;

  private hudData!: HUDInitData;
  private parentScene!: Phaser.Scene;

  constructor() {
    super({ key: SCENE.HUD });
  }

  init(payload: HUDInitData) {
    this.hudData = payload;
  }

  create() {
    const parent = this.scene.get(this.hudData.parentSceneKey);
    this.parentScene = parent;

    // Build all HUD widgets
    this.hp = new HpRibbon(this, 0, 0, {
      width: 240,
      height: 30,
      maxHp: this.hudData.maxHp,
      hp: this.hudData.hp,
    });
    this.coin = new CoinBadge(this, 0, 0, { width: 130, height: 36 });
    this.coin.setValue(this.hudData.coin, false);

    this.stone = new StoneBadge(this, 0, 0, {
      target: this.hudData.stoneTarget,
      accentColor: this.hudData.stoneAccent,
    });
    this.stone.setValue(this.hudData.stone);

    this.mode = new ModeSwitcher(this, 0, 0, {
      current: this.hudData.mode,
      unlocked: this.hudData.unlocked,
      buttonSize: 44,
      spacing: 64,
      onSwitch: (m) => parent.events.emit('hud:requestSwitchMode', m),
      onLockedAttempt: (m) => {
        const need = m === 'fire' ? 'Selesaikan Level 1 dulu' : 'Selesaikan Level 2 dulu';
        showToast({ scene: this, message: `Mode ${m.toUpperCase()} masih terkunci. ${need}` });
      },
    });

    this.pause = new PauseButton(this, 0, 0, {
      size: 44,
      onClick: () => parent.events.emit('hud:pause'),
    });

    // Listeners dari parent scene
    parent.events.on('hud:hp', (p: { hp: number; max?: number }) => this.hp.setHp(p.hp, p.max));
    parent.events.on('hud:coin', (v: number) => this.coin.setValue(v));
    parent.events.on('hud:stone', (v: number) => this.stone.setValue(v));
    parent.events.on('hud:mode', (m: PlayerMode) => this.mode.setCurrent(m));
    parent.events.on('hud:unlocks', (u: { fire: boolean; water: boolean }) => this.mode.setUnlocked(u));

    // Cleanup saat parent scene shutdown
    parent.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scene.stop();
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
    const ui = getUiScale(this);
    const padding = Math.round(20 * ui);

    // HP ribbon â€” top-left
    this.hp.setScale(ui);
    this.hp.setPosition(padding + (240 * ui) / 2 + (30 * ui) * 0.55, padding + (30 * ui) / 2);

    // Coin badge â€” di bawah HP, kiri
    this.coin.setScale(ui);
    this.coin.setPosition(padding + (130 * ui) / 2, padding + 30 * ui + 14 * ui + (36 * ui) / 2);

    // Stone badge â€” kanan dari coin
    this.stone.setScale(ui);
    this.stone.setPosition(
      padding + 130 * ui + 12 * ui + (150 * ui) / 2,
      padding + 30 * ui + 14 * ui + (42 * ui) / 2,
    );

    // Mode switcher â€” BOTTOM-center
    this.mode.setScale(ui);
    this.mode.setPosition(w / 2, h - Math.round(60 * ui));

    // Pause â€” top-right
    this.pause.setScale(ui);
    this.pause.setPosition(w - padding - (44 * ui) / 2, padding + (44 * ui) / 2);
  }
}
