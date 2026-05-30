// Persistensi settings global (musik, sfx, volume) ke localStorage.
// Save game progress (level complete, stones, dst) ditangani SaveManager terpisah nanti.

const SETTINGS_KEY = 'flamy-foamy-settings-v1';

export interface Settings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number; // 0..1
  sfxVolume: number;   // 0..1
}

export const DEFAULT_SETTINGS: Settings = {
  musicEnabled: true,
  sfxEnabled: true,
  musicVolume: 0.5,
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
    /* localStorage mati / quota — abaikan, settings cuma in-memory */
  }
  return merged;
}
