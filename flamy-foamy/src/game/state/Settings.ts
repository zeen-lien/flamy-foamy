// Persistensi settings global ke localStorage.

const SETTINGS_KEY = 'flamy-foamy-settings-v1';

export interface Settings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number;       // 0..1 — BGM Home & Menu
  musicLevelVolume: number;  // 0..1 — BGM saat in-game
  sfxVolume: number;         // 0..1 — semua SFX
}

export const DEFAULT_SETTINGS: Settings = {
  musicEnabled: true,
  sfxEnabled: true,
  musicVolume: 0.5,
  musicLevelVolume: 0.45,
  sfxVolume: 0.7,
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(patch: Partial<Settings>): Settings {
  const current = loadSettings();
  const merged = { ...current, ...patch };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
  } catch {
    /* abaikan */
  }
  return merged;
}
