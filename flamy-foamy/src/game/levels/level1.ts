import type { TerrainStyle } from '../entities/Terrain';
import type { TrapVariant } from '../entities/Trap';

/**
 * Data Level 1 — full 4 area. Mobile-first: semua platform dekat ground
 * (max ~210px di atas) supaya muat di slice kamera & nyaman dilompat.
 */

export const LEVEL1_CONFIG = {
  width: 13500,
  worldHeight: 720,
  groundY: 620,
  spawnX: 140,
  spawnY: 560,
  exitX: 13200,
  bossTriggerX: 12200,
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

const G = LEVEL1_CONFIG.groundY;

// Tier ketinggian platform melayang (clearance jelas dari lantai G-10).
// Semua dalam batas jumpable: rise antar tier ≤ 60-120px.
const T1 = G - 110; // tier rendah (clearance ~100 dari permukaan lantai)
const T2 = G - 175; // tier sedang
const T3 = G - 235; // tier tinggi

export const LEVEL1_TERRAIN: TerrainDef[] = [
  // ===== 1A (0-3200) Tutorial — lantai menerus, 2 platform opsional =====
  { x: 250, y: G + 60, w: 520, h: 140, style: 'rock', seed: 1 },
  { x: 760, y: G + 60, w: 520, h: 140, style: 'mossy', seed: 2 },
  { x: 1280, y: G + 60, w: 520, h: 140, style: 'rubble', seed: 3 },
  { x: 1800, y: G + 60, w: 520, h: 140, style: 'brick', seed: 4 },
  { x: 2320, y: G + 60, w: 520, h: 140, style: 'mossy', seed: 5 },
  { x: 2840, y: G + 60, w: 520, h: 140, style: 'crystal', seed: 6 },
  // Platform opsional (reward) — tier jelas di atas
  { x: 1050, y: T1, w: 170, h: 26, style: 'rock', seed: 11 },
  { x: 1280, y: T2, w: 160, h: 26, style: 'mossy', seed: 12 },
  { x: 1750, y: T1, w: 170, h: 26, style: 'brick', seed: 14 },

  // ===== 1B (3500-7100) Lompatan & Jebakan =====
  // Lantai dengan jurang; platform jembatan di tier konsisten
  { x: 3700, y: G + 60, w: 420, h: 140, style: 'rock', seed: 20 },
  // Tangga lompatan: 3 platform tier T1, gap horizontal ~210
  { x: 4060, y: T1, w: 180, h: 26, style: 'brick', seed: 21 },
  { x: 4290, y: T1, w: 180, h: 26, style: 'mossy', seed: 22 },
  { x: 4520, y: T1, w: 180, h: 26, style: 'rock', seed: 23 },
  { x: 4850, y: G + 60, w: 460, h: 140, style: 'rubble', seed: 24 },
  // Jebakan section — lantai menerus (trap di atasnya)
  { x: 5410, y: G + 60, w: 560, h: 140, style: 'brick', seed: 25 },
  { x: 5990, y: G + 60, w: 540, h: 140, style: 'mossy', seed: 26 },
  // Platform timing tier T1 -> T2
  { x: 6430, y: T1, w: 170, h: 26, style: 'crystal', seed: 27 },
  { x: 6660, y: T2, w: 170, h: 26, style: 'rock', seed: 28 },
  { x: 6980, y: G + 60, w: 460, h: 140, style: 'rubble', seed: 29 },

  // ===== 1C (7400-10600) Naik Turun Pilar =====
  { x: 7600, y: G + 60, w: 420, h: 140, style: 'rock', seed: 30 },
  // Climbing T1 -> T2 -> T3 (gap horizontal ~220, rise ~60-65)
  { x: 7900, y: T1, w: 175, h: 26, style: 'brick', seed: 31 },
  { x: 8130, y: T2, w: 175, h: 26, style: 'mossy', seed: 32 },
  { x: 8360, y: T3, w: 185, h: 26, style: 'crystal', seed: 33 },
  // Hidden room (tier paling atas, sedikit di atas T3)
  { x: 8360, y: G - 320, w: 230, h: 26, style: 'rubble', seed: 34 },
  // Turun T2 -> T1
  { x: 8640, y: T2, w: 175, h: 26, style: 'rock', seed: 35 },
  { x: 8880, y: T1, w: 175, h: 26, style: 'brick', seed: 36 },
  { x: 9180, y: G + 60, w: 440, h: 140, style: 'mossy', seed: 37 },
  // Pilar zigzag T1 <-> T2
  { x: 9560, y: T1, w: 160, h: 26, style: 'crystal', seed: 38 },
  { x: 9800, y: T2, w: 160, h: 26, style: 'rock', seed: 39 },
  { x: 10040, y: T1, w: 160, h: 26, style: 'mossy', seed: 40 },
  { x: 10380, y: G + 60, w: 440, h: 140, style: 'brick', seed: 41 },

  // ===== 1D (10700-13500) Boss Arena =====
  { x: 11600, y: G + 60, w: 1500, h: 140, style: 'crystal', seed: 50 },
  { x: 12700, y: G + 60, w: 800, h: 140, style: 'rock', seed: 51 },
];

export const LEVEL1_COINS: CoinDef[] = [
  // 1A
  { x: 260, y: G - 55 }, { x: 330, y: G - 55 }, { x: 400, y: G - 55 },
  { x: 850, y: G - 60 }, { x: 920, y: G - 60 },
  { x: 1050, y: T1 - 45 }, { x: 1280, y: T2 - 45 },
  { x: 1600, y: G - 55 }, { x: 1680, y: G - 55 },
  { x: 1750, y: T1 - 45 },
  { x: 2100, y: G - 55 }, { x: 2180, y: G - 55 }, { x: 2260, y: G - 55 },
  { x: 2600, y: G - 55 }, { x: 2680, y: G - 55 }, { x: 2760, y: G - 55 },
  // 1B
  { x: 4060, y: T1 - 45 }, { x: 4290, y: T1 - 45 }, { x: 4520, y: T1 - 45 },
  { x: 4850, y: G - 55 }, { x: 4930, y: G - 55 },
  { x: 5410, y: G - 55 }, { x: 5510, y: G - 55 },
  { x: 5990, y: G - 55 }, { x: 6090, y: G - 55 },
  { x: 6430, y: T1 - 45 }, { x: 6660, y: T2 - 45 },
  { x: 6980, y: G - 55 }, { x: 7060, y: G - 55 },
  // 1C
  { x: 7900, y: T1 - 45 }, { x: 8130, y: T2 - 45 }, { x: 8360, y: T3 - 45 },
  { x: 8300, y: G - 365 }, { x: 8360, y: G - 365 }, { x: 8420, y: G - 365 },
  { x: 8640, y: T2 - 45 }, { x: 8880, y: T1 - 45 },
  { x: 9180, y: G - 55 }, { x: 9260, y: G - 55 },
  { x: 9560, y: T1 - 45 }, { x: 9800, y: T2 - 45 }, { x: 10040, y: T1 - 45 },
  { x: 10380, y: G - 55 }, { x: 10460, y: G - 55 },
  // 1D
  { x: 11200, y: G - 55 }, { x: 11350, y: G - 55 }, { x: 11500, y: G - 55 },
  { x: 11900, y: G - 55 }, { x: 12050, y: G - 55 },
];

export const LEVEL1_STONES: StoneDef[] = [
  { x: 700, y: G - 60 },
  { x: 1750, y: T1 - 50 },
  { x: 4290, y: T1 - 50 },
  { x: 6660, y: T2 - 50 },
  { x: 8360, y: G - 360 },
  { x: 9800, y: T2 - 50 },
  { x: 11600, y: G - 60 },
];

export const LEVEL1_XP: XpDef[] = [
  { x: 1280, y: T2 - 50 },
  { x: 8360, y: G - 360 },
  { x: 10380, y: G - 55 },
];

export const LEVEL1_CHECKPOINTS: CheckpointDef[] = [
  { x: 1500, y: G },
  { x: 3700, y: G },
  { x: 4850, y: G },
  { x: 6980, y: G },
  { x: 9180, y: G },
  { x: 10380, y: G },
];

export const LEVEL1_SPIKES: SpikeDef[] = [
  { x: 5130, y: G - 10, w: 90 },
  { x: 5700, y: G - 10, w: 100 },
  { x: 6280, y: G - 10, w: 90 },
  { x: 9020, y: G - 10, w: 90 },
  { x: 9680, y: G - 10, w: 80 },
];

export const LEVEL1_TRAPS: TrapDef[] = [
  { x: 5410, y: G, variant: 1, onDur: 2000, offDur: 2600, delay: 0 },
  { x: 5560, y: G, variant: 1, onDur: 2000, offDur: 2600, delay: 1300 },
  { x: 5990, y: G, variant: 2, onDur: 2200, offDur: 2800, delay: 600 },
  { x: 6140, y: G, variant: 2, onDur: 2200, offDur: 2800, delay: 1900 },
  { x: 9180, y: G, variant: 3, onDur: 1800, offDur: 3000, delay: 0 },
  { x: 10460, y: G, variant: 3, onDur: 1800, offDur: 3000, delay: 900 },
];

export const LEVEL1_ENVTEXT: EnvTextDef[] = [
  { x: 240, y: G - 120, text: 'Gunakan  ←  →  untuk bergerak', trigger: 200 },
  { x: 1050, y: G - 120, text: 'Tekan  ↑  untuk melompat', trigger: 220 },
  { x: 2000, y: G - 140, text: '"Telur Misterius… kuncinya tiga elemen…"', trigger: 260 },
  { x: 3700, y: G - 140, text: 'Awas jurang & duri. Lompat dengan tepat!', trigger: 240 },
  { x: 5410, y: G - 150, text: 'Jebakan menyala berkala. Tunggu saat aman.', trigger: 240 },
  { x: 7900, y: G - 170, text: 'Naik pilar demi pilar. Ada rahasia di puncak.', trigger: 240 },
  { x: 10380, y: G - 130, text: '"Penjaga Batu menanti… bersiaplah."', trigger: 260 },
];
