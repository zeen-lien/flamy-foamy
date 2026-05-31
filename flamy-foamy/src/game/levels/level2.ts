import type { TerrainStyle } from '../entities/Terrain';
import type { TrapVariant } from '../entities/Trap';

/**
 * Data Level 2 — Dunia Api. Width: 16000px. 4 areas.
 * Area 2A (0-4000): Pengenalan Flamy mode. Tutorial switch mode.
 * Area 2B (4000-8500): Lava river section. Platforms over lava.
 * Area 2C (8500-12500): Fire wall maze. Alternating fire walls.
 * Area 2D (12500-16000): Boss Api arena.
 */

export const LEVEL2_CONFIG = {
  width: 16000,
  worldHeight: 720,
  groundY: 620,
  spawnX: 140,
  spawnY: 560,
  exitX: 15700,
  bossTriggerX: 14200,
  deathY: 820,
};

export interface TerrainDef { x: number; y: number; w: number; h: number; style: TerrainStyle; seed: number; }
export interface CoinDef { x: number; y: number; }
export interface StoneDef { x: number; y: number; }
export interface XpDef { x: number; y: number; }
export interface CheckpointDef { x: number; y: number; }
export interface EnvTextDef { x: number; y: number; text: string; trigger?: number; }
export interface SpikeDef { x: number; y: number; w: number; }
export interface TrapDef { x: number; y: number; variant: TrapVariant; onDur?: number; offDur?: number; delay?: number; }
export interface LavaZoneDef { x: number; y: number; w: number; h: number; }

const G = LEVEL2_CONFIG.groundY;
const T1 = G - 110;
const T2 = G - 175;
const T3 = G - 235;

export const LEVEL2_TERRAIN: TerrainDef[] = [
  // ===== 2A (0-4000) Pengenalan Flamy mode =====
  { x: 250, y: G + 60, w: 520, h: 140, style: 'lava', seed: 100 },
  { x: 760, y: G + 60, w: 520, h: 140, style: 'rock', seed: 101 },
  { x: 1280, y: G + 60, w: 520, h: 140, style: 'brick', seed: 102 },
  { x: 1800, y: G + 60, w: 520, h: 140, style: 'lava', seed: 103 },
  { x: 2320, y: G + 60, w: 520, h: 140, style: 'rock', seed: 104 },
  // Platform opsional
  { x: 1050, y: T1, w: 170, h: 26, style: 'rock', seed: 110 },
  { x: 1750, y: T1, w: 170, h: 26, style: 'crystal', seed: 111 },
  // Gap sebelum lava pool pertama
  { x: 2840, y: G + 60, w: 400, h: 140, style: 'brick', seed: 105 },
  // Setelah lava pool pertama (gap 3040-3400 = lava pool)
  { x: 3600, y: G + 60, w: 400, h: 140, style: 'lava', seed: 106 },

  // ===== 2B (4000-8500) Lava river — platforms over lava =====
  { x: 4200, y: G + 60, w: 380, h: 140, style: 'rock', seed: 120 },
  // Floating platforms over lava river
  { x: 4700, y: T1, w: 180, h: 26, style: 'lava', seed: 121 },
  { x: 4960, y: T1, w: 180, h: 26, style: 'rock', seed: 122 },
  { x: 5220, y: T2, w: 170, h: 26, style: 'crystal', seed: 123 },
  { x: 5480, y: T1, w: 180, h: 26, style: 'lava', seed: 124 },
  // Landing
  { x: 5750, y: G + 60, w: 420, h: 140, style: 'brick', seed: 125 },
  // Second lava crossing
  { x: 6280, y: T1, w: 170, h: 26, style: 'rock', seed: 126 },
  { x: 6520, y: T2, w: 170, h: 26, style: 'lava', seed: 127 },
  { x: 6760, y: T1, w: 170, h: 26, style: 'crystal', seed: 128 },
  { x: 7000, y: T2, w: 170, h: 26, style: 'rock', seed: 129 },
  // Landing
  { x: 7280, y: G + 60, w: 440, h: 140, style: 'lava', seed: 130 },
  // Third crossing
  { x: 7820, y: T1, w: 180, h: 26, style: 'brick', seed: 131 },
  { x: 8060, y: T2, w: 170, h: 26, style: 'rock', seed: 132 },
  { x: 8300, y: G + 60, w: 400, h: 140, style: 'rock', seed: 133 },

  // ===== 2C (8500-12500) Fire wall maze =====
  { x: 8700, y: G + 60, w: 500, h: 140, style: 'brick', seed: 140 },
  { x: 9200, y: G + 60, w: 500, h: 140, style: 'lava', seed: 141 },
  // Platforms between fire walls
  { x: 9600, y: T1, w: 160, h: 26, style: 'crystal', seed: 142 },
  { x: 9850, y: T2, w: 160, h: 26, style: 'rock', seed: 143 },
  { x: 10100, y: G + 60, w: 480, h: 140, style: 'brick', seed: 144 },
  { x: 10580, y: G + 60, w: 480, h: 140, style: 'lava', seed: 145 },
  // Zigzag platforms
  { x: 10950, y: T1, w: 170, h: 26, style: 'rock', seed: 146 },
  { x: 11180, y: T2, w: 170, h: 26, style: 'crystal', seed: 147 },
  { x: 11410, y: T3, w: 180, h: 26, style: 'lava', seed: 148 },
  { x: 11640, y: T2, w: 170, h: 26, style: 'rock', seed: 149 },
  { x: 11870, y: T1, w: 170, h: 26, style: 'brick', seed: 150 },
  { x: 12100, y: G + 60, w: 500, h: 140, style: 'rock', seed: 151 },

  // ===== 2D (12500-16000) Boss Api arena =====
  { x: 13400, y: G + 60, w: 1600, h: 140, style: 'lava', seed: 160 },
  { x: 14800, y: G + 60, w: 1000, h: 140, style: 'rock', seed: 161 },
];

export const LEVEL2_COINS: CoinDef[] = [
  // 2A
  { x: 260, y: G - 55 }, { x: 330, y: G - 55 }, { x: 400, y: G - 55 },
  { x: 850, y: G - 60 }, { x: 920, y: G - 60 }, { x: 990, y: G - 60 },
  { x: 1050, y: T1 - 45 }, { x: 1750, y: T1 - 45 },
  { x: 1600, y: G - 55 }, { x: 1680, y: G - 55 },
  { x: 2100, y: G - 55 }, { x: 2180, y: G - 55 }, { x: 2260, y: G - 55 },
  { x: 2600, y: G - 55 }, { x: 2680, y: G - 55 },
  { x: 3600, y: G - 55 }, { x: 3700, y: G - 55 },
  // 2B
  { x: 4200, y: G - 55 }, { x: 4300, y: G - 55 },
  { x: 4700, y: T1 - 45 }, { x: 4960, y: T1 - 45 }, { x: 5220, y: T2 - 45 },
  { x: 5480, y: T1 - 45 },
  { x: 5750, y: G - 55 }, { x: 5850, y: G - 55 }, { x: 5950, y: G - 55 },
  { x: 6280, y: T1 - 45 }, { x: 6520, y: T2 - 45 }, { x: 6760, y: T1 - 45 },
  { x: 7000, y: T2 - 45 },
  { x: 7280, y: G - 55 }, { x: 7380, y: G - 55 },
  { x: 7820, y: T1 - 45 }, { x: 8060, y: T2 - 45 },
  { x: 8300, y: G - 55 }, { x: 8400, y: G - 55 },
  // 2C
  { x: 8700, y: G - 55 }, { x: 8800, y: G - 55 }, { x: 8900, y: G - 55 },
  { x: 9200, y: G - 55 }, { x: 9300, y: G - 55 },
  { x: 9600, y: T1 - 45 }, { x: 9850, y: T2 - 45 },
  { x: 10100, y: G - 55 }, { x: 10200, y: G - 55 }, { x: 10300, y: G - 55 },
  { x: 10580, y: G - 55 }, { x: 10680, y: G - 55 },
  { x: 10950, y: T1 - 45 }, { x: 11180, y: T2 - 45 }, { x: 11410, y: T3 - 45 },
  { x: 11640, y: T2 - 45 }, { x: 11870, y: T1 - 45 },
  { x: 12100, y: G - 55 }, { x: 12200, y: G - 55 }, { x: 12300, y: G - 55 },
  // 2D
  { x: 13000, y: G - 55 }, { x: 13150, y: G - 55 }, { x: 13300, y: G - 55 },
  { x: 13600, y: G - 55 }, { x: 13800, y: G - 55 },
  { x: 14000, y: G - 55 }, { x: 14200, y: G - 55 },
];

export const LEVEL2_STONES: StoneDef[] = [
  { x: 700, y: G - 60 },
  { x: 1750, y: T1 - 50 },
  { x: 4960, y: T1 - 50 },
  { x: 6520, y: T2 - 50 },
  { x: 8060, y: T2 - 50 },
  { x: 9850, y: T2 - 50 },
  { x: 11410, y: T3 - 50 },
  { x: 12200, y: G - 60 },
];

export const LEVEL2_XP: XpDef[] = [
  { x: 1050, y: T1 - 50 },
  { x: 5220, y: T2 - 50 },
  { x: 9600, y: T1 - 50 },
  { x: 11180, y: T2 - 50 },
];

export const LEVEL2_CHECKPOINTS: CheckpointDef[] = [
  { x: 1500, y: G },
  { x: 2840, y: G },
  { x: 4200, y: G },
  { x: 5750, y: G },
  { x: 7280, y: G },
  { x: 8700, y: G },
  { x: 10100, y: G },
];

export const LEVEL2_SPIKES: SpikeDef[] = [
  { x: 4100, y: G - 10, w: 90 },
  { x: 5650, y: G - 10, w: 90 },
  { x: 7180, y: G - 10, w: 100 },
  { x: 8600, y: G - 10, w: 90 },
  { x: 9100, y: G - 10, w: 80 },
  { x: 10000, y: G - 10, w: 90 },
  { x: 10500, y: G - 10, w: 80 },
  { x: 12000, y: G - 10, w: 90 },
];

export const LEVEL2_TRAPS: TrapDef[] = [
  // 2A — intro flame trap
  { x: 2320, y: G, variant: 3, onDur: 1800, offDur: 2800, delay: 0 },
  // 2B — saws and flames over lava
  { x: 5750, y: G, variant: 2, onDur: 2000, offDur: 2400, delay: 0 },
  { x: 5900, y: G, variant: 2, onDur: 2000, offDur: 2400, delay: 1200 },
  // 2C — fire wall maze (mostly flame traps)
  { x: 8700, y: G, variant: 3, onDur: 1600, offDur: 2200, delay: 0 },
  { x: 8900, y: G, variant: 3, onDur: 1600, offDur: 2200, delay: 800 },
  { x: 9200, y: G, variant: 1, onDur: 2000, offDur: 2600, delay: 400 },
  { x: 10100, y: G, variant: 3, onDur: 1400, offDur: 2000, delay: 0 },
  { x: 10300, y: G, variant: 3, onDur: 1400, offDur: 2000, delay: 700 },
  { x: 10580, y: G, variant: 2, onDur: 1800, offDur: 2400, delay: 300 },
  { x: 12100, y: G, variant: 3, onDur: 1600, offDur: 2600, delay: 0 },
];

export const LEVEL2_ENVTEXT: EnvTextDef[] = [
  { x: 240, y: G - 120, text: 'Dunia Api… panas membara di mana-mana.', trigger: 200 },
  { x: 1800, y: G - 140, text: 'Ganti ke mode Flamy! Tekan X', trigger: 240 },
  { x: 2840, y: G - 150, text: 'Kolam lava! Hanya Flamy yang tahan.', trigger: 240 },
  { x: 4200, y: G - 140, text: 'Lompat antar platform. Jangan jatuh ke lava!', trigger: 240 },
  { x: 5750, y: G - 130, text: 'Jebakan gergaji. Tunggu timing yang tepat.', trigger: 240 },
  { x: 8700, y: G - 150, text: 'Labirin api! Hindari dinding api berkala.', trigger: 260 },
  { x: 12100, y: G - 130, text: '"Penjaga Api menanti… bersiaplah."', trigger: 260 },
];

export const LEVEL2_LAVAZONES: LavaZoneDef[] = [
  // Lava pool di area 2A (gap antara terrain)
  { x: 3220, y: G + 20, w: 380, h: 120 },
  // Lava river di area 2B (gaps between platforms)
  { x: 4500, y: G + 40, w: 1200, h: 100 },
  { x: 6080, y: G + 40, w: 1100, h: 100 },
  { x: 7600, y: G + 40, w: 600, h: 100 },
];
