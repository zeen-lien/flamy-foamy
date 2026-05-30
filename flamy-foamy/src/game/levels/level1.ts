import type { TerrainStyle } from '../entities/Terrain';

/**
 * Data Level 1 — Area 1A "Awakening".
 * Koordinat dalam world space. Ground line di GROUND_Y.
 *
 * Catatan: ini baru Area 1A (tutorial lembut). Area 1B-1D nyusul di Step 12.
 */

export const LEVEL1_CONFIG = {
  width: 3200,        // panjang area 1A
  worldHeight: 720,   // tinggi world fixed (gak ikut viewport)
  groundY: 620,       // garis tanah (y world)
  spawnX: 140,
  spawnY: 540,
  exitX: 3050,        // posisi portal ke 1B
  deathY: 900,        // kalau player jatuh melewati ini → respawn
};

export interface TerrainDef {
  x: number;        // center x
  y: number;        // center y
  w: number;
  h: number;
  style: TerrainStyle;
  seed: number;
}

export interface CoinDef { x: number; y: number; }
export interface StoneDef { x: number; y: number; }
export interface XpDef { x: number; y: number; }
export interface CheckpointDef { x: number; y: number; }
export interface EnvTextDef { x: number; y: number; text: string; trigger?: number; }

const G = LEVEL1_CONFIG.groundY;

// ---------- Terrain (lantai + platform) ----------
export const LEVEL1_TERRAIN: TerrainDef[] = [
  // Floor segmen (style variatif) — ground utama
  { x: 250, y: G + 50, w: 520, h: 120, style: 'rock', seed: 1 },
  { x: 760, y: G + 50, w: 520, h: 120, style: 'mossy', seed: 2 },
  // Jurang kecil di sekitar x=1080 (player harus lompat)
  { x: 1450, y: G + 50, w: 560, h: 120, style: 'rubble', seed: 3 },
  { x: 2010, y: G + 50, w: 520, h: 120, style: 'brick', seed: 4 },
  { x: 2530, y: G + 50, w: 520, h: 120, style: 'mossy', seed: 5 },
  { x: 3010, y: G + 50, w: 420, h: 120, style: 'crystal', seed: 6 },

  // Platform melayang — tutorial lompat & reward eksplorasi
  { x: 1120, y: G - 60, w: 150, h: 28, style: 'rock', seed: 11 },   // jembatan jurang
  { x: 1280, y: G - 120, w: 140, h: 26, style: 'mossy', seed: 12 },
  { x: 980, y: G - 170, w: 130, h: 26, style: 'crystal', seed: 13 }, // hidden pocket (atas)
  { x: 1750, y: G - 130, w: 150, h: 26, style: 'brick', seed: 14 },  // stone platform
  { x: 2300, y: G - 90, w: 140, h: 26, style: 'rubble', seed: 15 },
];

// ---------- Coins ----------
export const LEVEL1_COINS: CoinDef[] = [
  // Trail tutorial walk
  { x: 260, y: G - 60 }, { x: 330, y: G - 60 }, { x: 400, y: G - 60 },
  // Sebelum jurang
  { x: 900, y: G - 70 }, { x: 980, y: G - 70 },
  // Di atas platform jembatan jurang
  { x: 1120, y: G - 110 }, { x: 1280, y: G - 170 },
  // Hidden pocket atas (reward eksplorasi)
  { x: 950, y: G - 220 }, { x: 980, y: G - 220 }, { x: 1010, y: G - 220 },
  // Mid area
  { x: 1600, y: G - 60 }, { x: 1680, y: G - 60 },
  { x: 1750, y: G - 180 }, // dekat stone platform
  { x: 2100, y: G - 60 }, { x: 2180, y: G - 60 }, { x: 2260, y: G - 60 },
  { x: 2300, y: G - 140 },
  { x: 2600, y: G - 60 }, { x: 2680, y: G - 60 }, { x: 2760, y: G - 60 },
];

// ---------- Stones (fire_stone untuk level 1) ----------
export const LEVEL1_STONES: StoneDef[] = [
  { x: 700, y: G - 70 },        // gampang, di permukaan
  { x: 1750, y: G - 175 },      // di platform, butuh lompat
  { x: 2530, y: G - 70 },       // permukaan akhir area
];

// ---------- XP pickup ----------
export const LEVEL1_XP: XpDef[] = [
  { x: 980, y: G - 215 },       // hidden pocket atas (reward eksplorasi)
];

// ---------- Checkpoint ----------
export const LEVEL1_CHECKPOINTS: CheckpointDef[] = [
  { x: 1500, y: G },            // tengah area
  { x: 2750, y: G },            // sebelum exit
];

// ---------- Environmental text (ghost hint + storytelling) ----------
export const LEVEL1_ENVTEXT: EnvTextDef[] = [
  { x: 240, y: G - 130, text: 'Gunakan  ←  →  untuk bergerak', trigger: 200 },
  { x: 1050, y: G - 130, text: 'Tekan  ↑  untuk melompati jurang', trigger: 220 },
  { x: 2000, y: G - 150, text: '"Telur Misterius… kuncinya tiga elemen…"', trigger: 260 },
];
