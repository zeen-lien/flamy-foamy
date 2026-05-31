import type { TerrainStyle } from '../entities/Terrain';
import type { TrapVariant } from '../entities/Trap';

/**
 * Data Level 3 â€” Dunia Air. Width: 18000px. 4 areas.
 * Area 3A (0-4500): Pengenalan Foamy mode. Water zones.
 * Area 3B (4500-9500): Ice platforms + water jets.
 * Area 3C (9500-14500): Multi-element maze. Rapid switching.
 * Area 3D (14500-18000): Boss Es arena.
 */

export const LEVEL3_CONFIG = {
  width: 18000,
  worldHeight: 720,
  groundY: 620,
  spawnX: 140,
  spawnY: 560,
  exitX: 17700,
  bossTriggerX: 16200,
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
export interface WaterZoneDef { x: number; y: number; w: number; h: number; }
export interface LavaZoneDef { x: number; y: number; w: number; h: number; }

const G = LEVEL3_CONFIG.groundY;
const T1 = G - 110;
const T2 = G - 175;
const T3 = G - 235;

export const LEVEL3_TERRAIN: TerrainDef[] = [
  // ===== 3A (0-4500) Pengenalan Foamy mode =====
  { x: 250, y: G + 60, w: 520, h: 140, style: 'ice', seed: 200 },
  { x: 760, y: G + 60, w: 520, h: 140, style: 'mossy', seed: 201 },
  { x: 1280, y: G + 60, w: 520, h: 140, style: 'ice', seed: 202 },
  { x: 1800, y: G + 60, w: 520, h: 140, style: 'rock', seed: 203 },
  { x: 2320, y: G + 60, w: 520, h: 140, style: 'ice', seed: 204 },
  // Platform opsional
  { x: 1050, y: T1, w: 170, h: 26, style: 'ice', seed: 210 },
  { x: 1750, y: T1, w: 170, h: 26, style: 'crystal', seed: 211 },
  // After water zone intro
  { x: 2840, y: G + 60, w: 400, h: 140, style: 'mossy', seed: 205 },
  // Gap (water zone 3240-3600)
  { x: 3800, y: G + 60, w: 400, h: 140, style: 'ice', seed: 206 },
  { x: 4200, y: G + 60, w: 400, h: 140, style: 'rock', seed: 207 },

  // ===== 3B (4500-9500) Ice platforms + water jets =====
  { x: 4700, y: G + 60, w: 400, h: 140, style: 'ice', seed: 220 },
  // Floating ice platforms (gap rapat ~220px)
  { x: 5150, y: T1, w: 180, h: 26, style: 'ice', seed: 221 },
  { x: 5370, y: T2, w: 170, h: 26, style: 'crystal', seed: 222 },
  { x: 5590, y: T1, w: 180, h: 26, style: 'ice', seed: 223 },
  { x: 5980, y: G + 60, w: 420, h: 140, style: 'mossy', seed: 224 },
  // Water jet section
  { x: 6500, y: G + 60, w: 500, h: 140, style: 'ice', seed: 225 },
  { x: 7000, y: G + 60, w: 500, h: 140, style: 'rock', seed: 226 },
  // More ice platforms (gap rapat ~220px)
  { x: 7550, y: T1, w: 170, h: 26, style: 'ice', seed: 227 },
  { x: 7770, y: T2, w: 170, h: 26, style: 'crystal', seed: 228 },
  { x: 7990, y: T1, w: 170, h: 26, style: 'ice', seed: 229 },
  { x: 8350, y: G + 60, w: 440, h: 140, style: 'mossy', seed: 230 },
  // Landing before 3C
  { x: 8900, y: G + 60, w: 500, h: 140, style: 'ice', seed: 231 },
  { x: 9400, y: G + 60, w: 300, h: 140, style: 'rock', seed: 232 },

  // ===== 3C (9500-14500) Multi-element maze =====
  { x: 9800, y: G + 60, w: 480, h: 140, style: 'rock', seed: 240 },
  // Fire zone platforms (need Flamy)
  { x: 10300, y: T1, w: 170, h: 26, style: 'crystal', seed: 241 },
  { x: 10540, y: T2, w: 170, h: 26, style: 'rock', seed: 242 },
  { x: 10780, y: G + 60, w: 440, h: 140, style: 'ice', seed: 243 },
  // Water zone (need Foamy)
  // Gap (11220-11600 = water zone)
  { x: 11800, y: G + 60, w: 440, h: 140, style: 'mossy', seed: 244 },
  // Fire zone again
  // Gap (12240-12600 = lava zone)
  { x: 12800, y: G + 60, w: 440, h: 140, style: 'rock', seed: 245 },
  // Zigzag climb (gap ~210px)
  { x: 13100, y: T1, w: 170, h: 26, style: 'ice', seed: 246 },
  { x: 13310, y: T2, w: 170, h: 26, style: 'crystal', seed: 247 },
  { x: 13520, y: T3, w: 180, h: 26, style: 'ice', seed: 248 },
  { x: 13730, y: T2, w: 170, h: 26, style: 'rock', seed: 249 },
  { x: 13940, y: T1, w: 170, h: 26, style: 'mossy', seed: 250 },
  { x: 14300, y: G + 60, w: 400, h: 140, style: 'ice', seed: 251 },

  // ===== 3D (14500-18000) Boss Es arena =====
  { x: 15400, y: G + 60, w: 1700, h: 140, style: 'ice', seed: 260 },
  { x: 16900, y: G + 60, w: 1000, h: 140, style: 'crystal', seed: 261 },
];

export const LEVEL3_COINS: CoinDef[] = [
  // 3A
  { x: 260, y: G - 55 }, { x: 330, y: G - 55 }, { x: 400, y: G - 55 },
  { x: 850, y: G - 60 }, { x: 920, y: G - 60 }, { x: 990, y: G - 60 },
  { x: 1050, y: T1 - 45 }, { x: 1750, y: T1 - 45 },
  { x: 1600, y: G - 55 }, { x: 1680, y: G - 55 }, { x: 1760, y: G - 55 },
  { x: 2100, y: G - 55 }, { x: 2180, y: G - 55 }, { x: 2260, y: G - 55 },
  { x: 2600, y: G - 55 }, { x: 2680, y: G - 55 }, { x: 2760, y: G - 55 },
  { x: 3800, y: G - 55 }, { x: 3900, y: G - 55 },
  { x: 4200, y: G - 55 }, { x: 4300, y: G - 55 },
  // 3B
  { x: 4700, y: G - 55 }, { x: 4800, y: G - 55 },
  { x: 5150, y: T1 - 45 }, { x: 5370, y: T2 - 45 }, { x: 5590, y: T1 - 45 },
  { x: 5980, y: G - 55 }, { x: 6080, y: G - 55 }, { x: 6180, y: G - 55 },
  { x: 6500, y: G - 55 }, { x: 6600, y: G - 55 }, { x: 6700, y: G - 55 },
  { x: 7000, y: G - 55 }, { x: 7100, y: G - 55 }, { x: 7200, y: G - 55 },
  { x: 7550, y: T1 - 45 }, { x: 7770, y: T2 - 45 }, { x: 7990, y: T1 - 45 },
  { x: 8350, y: G - 55 }, { x: 8450, y: G - 55 },
  { x: 8900, y: G - 55 }, { x: 9000, y: G - 55 }, { x: 9100, y: G - 55 },
  // 3C
  { x: 9800, y: G - 55 }, { x: 9900, y: G - 55 }, { x: 10000, y: G - 55 },
  { x: 10300, y: T1 - 45 }, { x: 10540, y: T2 - 45 },
  { x: 10780, y: G - 55 }, { x: 10880, y: G - 55 }, { x: 10980, y: G - 55 },
  { x: 11800, y: G - 55 }, { x: 11900, y: G - 55 }, { x: 12000, y: G - 55 },
  { x: 12800, y: G - 55 }, { x: 12900, y: G - 55 }, { x: 13000, y: G - 55 },
  { x: 13100, y: T1 - 45 }, { x: 13310, y: T2 - 45 }, { x: 13520, y: T3 - 45 },
  { x: 13730, y: T2 - 45 }, { x: 13940, y: T1 - 45 },
  { x: 14300, y: G - 55 }, { x: 14400, y: G - 55 },
  // 3D
  { x: 15000, y: G - 55 }, { x: 15150, y: G - 55 }, { x: 15300, y: G - 55 },
  { x: 15600, y: G - 55 }, { x: 15800, y: G - 55 },
  { x: 16000, y: G - 55 }, { x: 16200, y: G - 55 },
  { x: 16500, y: G - 55 }, { x: 16700, y: G - 55 },
  { x: 17000, y: G - 55 }, { x: 17200, y: G - 55 },
  { x: 17400, y: G - 55 }, { x: 17600, y: G - 55 },
];

export const LEVEL3_STONES: StoneDef[] = [
  { x: 700, y: G - 60 },
  { x: 1750, y: T1 - 50 },
  { x: 5370, y: T2 - 50 },
  { x: 6700, y: G - 60 },
  { x: 7770, y: T2 - 50 },
  { x: 9000, y: G - 60 },
  { x: 10540, y: T2 - 50 },
  { x: 12900, y: G - 60 },
  { x: 13520, y: T3 - 50 },
  { x: 14300, y: G - 60 },
];

export const LEVEL3_XP: XpDef[] = [
  { x: 1050, y: T1 - 50 },
  { x: 5590, y: T1 - 50 },
  { x: 7990, y: T1 - 50 },
  { x: 10300, y: T1 - 50 },
  { x: 13310, y: T2 - 50 },
];

export const LEVEL3_CHECKPOINTS: CheckpointDef[] = [
  { x: 1500, y: G },
  { x: 2840, y: G },
  { x: 4700, y: G },
  { x: 5980, y: G },
  { x: 8350, y: G },
  { x: 9800, y: G },
  { x: 11800, y: G },
  { x: 14300, y: G },
];

export const LEVEL3_SPIKES: SpikeDef[] = [
  { x: 4600, y: G - 10, w: 90 },
  { x: 5880, y: G - 10, w: 90 },
  { x: 6400, y: G - 10, w: 80 },
  { x: 7500, y: G - 10, w: 90 },
  { x: 8800, y: G - 10, w: 100 },
  { x: 9700, y: G - 10, w: 90 },
  { x: 10700, y: G - 10, w: 80 },
  { x: 11700, y: G - 10, w: 90 },
  { x: 12700, y: G - 10, w: 90 },
  { x: 14200, y: G - 10, w: 80 },
];

export const LEVEL3_TRAPS: TrapDef[] = [
  // 3A â€” intro
  { x: 2320, y: G, variant: 1, onDur: 2000, offDur: 2600, delay: 0 },
  // 3B â€” water jets (saws) + flames
  { x: 6500, y: G, variant: 2, onDur: 1800, offDur: 2200, delay: 0 },
  { x: 6700, y: G, variant: 2, onDur: 1800, offDur: 2200, delay: 900 },
  { x: 7000, y: G, variant: 3, onDur: 1600, offDur: 2000, delay: 400 },
  { x: 7200, y: G, variant: 3, onDur: 1600, offDur: 2000, delay: 1200 },
  // 3C â€” multi-element maze (dense traps)
  { x: 9800, y: G, variant: 3, onDur: 1400, offDur: 1800, delay: 0 },
  { x: 10000, y: G, variant: 1, onDur: 1800, offDur: 2200, delay: 600 },
  { x: 10780, y: G, variant: 2, onDur: 1600, offDur: 2000, delay: 0 },
  { x: 10980, y: G, variant: 3, onDur: 1400, offDur: 1800, delay: 700 },
  { x: 11800, y: G, variant: 2, onDur: 1600, offDur: 2200, delay: 300 },
  { x: 12800, y: G, variant: 3, onDur: 1400, offDur: 1800, delay: 0 },
  { x: 13000, y: G, variant: 3, onDur: 1400, offDur: 1800, delay: 700 },
];

export const LEVEL3_ENVTEXT: EnvTextDef[] = [
  { x: 240, y: G - 120, text: 'Dunia Airâ€¦ dingin menusuk tulang.', trigger: 200 },
  { x: 1800, y: G - 140, text: 'Ganti ke mode Foamy! Tekan C', trigger: 240 },
  { x: 2840, y: G - 150, text: 'Zona air! Hanya Foamy yang tahan.', trigger: 240 },
  { x: 4700, y: G - 140, text: 'Platform es licin. Hati-hati melompat!', trigger: 240 },
  { x: 6500, y: G - 130, text: 'Jebakan air & api. Timing adalah kunci.', trigger: 240 },
  { x: 9800, y: G - 150, text: 'Zona multi-elemen! Ganti mode cepat.', trigger: 260 },
  { x: 10780, y: G - 140, text: 'Zona air di depan. Ganti ke Foamy! Tekan C', trigger: 240 },
  { x: 12800, y: G - 140, text: 'Zona lava! Ganti ke Flamy! Tekan X', trigger: 240 },
  { x: 14300, y: G - 130, text: '"Penjaga Es menantiâ€¦ bersiaplah."', trigger: 260 },
];

export const LEVEL3_WATERZONES: WaterZoneDef[] = [
  // 3A â€” intro water zone
  { x: 3420, y: G + 20, w: 200, h: 30 },
  // 3C â€” water zones in multi-element maze
  { x: 11410, y: G + 20, w: 200, h: 30 },
  { x: 13050, y: G + 20, w: 300, h: 120 },
];

export const LEVEL3_LAVAZONES: LavaZoneDef[] = [
  // 3C â€” lava zones in multi-element maze
  { x: 12420, y: G + 20, w: 200, h: 30 },
];
