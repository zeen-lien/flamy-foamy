// Game-wide constants. Resolution mengikuti laporan: 1280x720
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// Target ukuran display sprite (Phaser auto-scale, asli PNG gak diubah)
export const SPRITE_SIZE = {
  player: 88,
  boss: 160,
  egg: 110,
  collectible: 36,
  trap: 64,
  checkpoint: 72,
  tileHeight: 64,
  buttonMobile: 84,
};

export type PlayerMode = 'blop' | 'fire' | 'water';

// Konstanta gameplay (sesuai laporan)
export const GAMEPLAY = {
  playerSpeed: 260,
  jumpVelocity: -560,
  attackDuration: 600, // ms
  bossHpMax: 20,
  bossDamageToPlayer: 5,
  playerDamageToBoss: 1,
  eggHpMax: 5,
  hpPerXp: 50,
  coinValue: 5,
  bossChaseRange: 400,
  bossStopRange: 120,
  bossAttackCooldown: 2000,
} as const;

export const LEVEL_TARGETS = {
  level1: { coin: 200, stone: 5, stoneKey: 'firestone' },
  level2: { coin: 500, stone: 8, stoneKey: 'waterstone' },
  level3: { coin: 1000, stone: 10, stoneKey: 'batukristal' },
} as const;
