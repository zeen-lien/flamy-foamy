// Save/load progres game (level complete, stones, bintang) ke localStorage.
// Settings audio terpisah di state/Settings.ts.

const SAVE_KEY = 'flamy-foamy-save-v1';

export interface SaveData {
  level1_complete: boolean;
  level2_complete: boolean;
  level3_complete: boolean;
  level1_stones_collected: number;
  level2_stones_collected: number;
  level3_stones_collected: number;
  level1_best_stars: number; // 0..3
  level2_best_stars: number;
  level3_best_stars: number;
  level1_best_coin: number;
  level2_best_coin: number;
  level3_best_coin: number;
  fire_unlocked: boolean;
  water_unlocked: boolean;
}

export const DEFAULT_SAVE: SaveData = {
  level1_complete: false,
  level2_complete: false,
  level3_complete: false,
  level1_stones_collected: 0,
  level2_stones_collected: 0,
  level3_stones_collected: 0,
  level1_best_stars: 0,
  level2_best_stars: 0,
  level3_best_stars: 0,
  level1_best_coin: 0,
  level2_best_coin: 0,
  level3_best_coin: 0,
  fire_unlocked: false,
  water_unlocked: false,
};

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    return { ...DEFAULT_SAVE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

export function saveProgress(patch: Partial<SaveData>): SaveData {
  const current = loadSave();
  const merged = { ...current, ...patch };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(merged));
  } catch {
    /* localStorage mati / quota — abaikan */
  }
  return merged;
}

export function resetSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* abaikan */
  }
}

// ---------------------- Helpers untuk UI ----------------------

export const LEVEL_TARGETS = {
  1: { stones: 5, coin: 200 },
  2: { stones: 8, coin: 500 },
  3: { stones: 10, coin: 1000 },
} as const;

export type LevelId = 1 | 2 | 3;

export interface LevelStatus {
  unlocked: boolean;
  /** Pesan kalau locked, untuk popup notif. */
  lockReason: string | null;
  stars: number;          // 0..3
  bestCoin: number;
  bestStones: number;
  targetStones: number;
  targetCoin: number;
  complete: boolean;
}

export function getLevelStatus(level: LevelId, save: SaveData = loadSave()): LevelStatus {
  const target = LEVEL_TARGETS[level];

  if (level === 1) {
    return {
      unlocked: true,
      lockReason: null,
      stars: save.level1_best_stars,
      bestCoin: save.level1_best_coin,
      bestStones: save.level1_stones_collected,
      targetStones: target.stones,
      targetCoin: target.coin,
      complete: save.level1_complete,
    };
  }

  if (level === 2) {
    const need = LEVEL_TARGETS[1].stones;
    const have = save.level1_stones_collected;
    const unlocked = have >= need;
    return {
      unlocked,
      lockReason: unlocked
        ? null
        : `Kumpulkan dulu ${need} batu di Level 1 (sekarang ${have}/${need})`,
      stars: save.level2_best_stars,
      bestCoin: save.level2_best_coin,
      bestStones: save.level2_stones_collected,
      targetStones: target.stones,
      targetCoin: target.coin,
      complete: save.level2_complete,
    };
  }

  // level 3
  const need = LEVEL_TARGETS[2].stones;
  const have = save.level2_stones_collected;
  const unlocked = have >= need;
  return {
    unlocked,
    lockReason: unlocked
      ? null
      : `Kumpulkan dulu ${need} batu di Level 2 (sekarang ${have}/${need})`,
    stars: save.level3_best_stars,
    bestCoin: save.level3_best_coin,
    bestStones: save.level3_stones_collected,
    targetStones: target.stones,
    targetCoin: target.coin,
    complete: save.level3_complete,
  };
}
