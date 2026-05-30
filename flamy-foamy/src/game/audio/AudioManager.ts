import Phaser from 'phaser';
import { loadSettings, saveSettings } from '../state/Settings';

/**
 * AudioManager singleton-style: dipasang di registry game,
 * jadi semua scene bisa akses BGM yang sama tanpa duplikat.
 *
 * Pakai pola: `AudioManager.get(scene).playBgm(key)`.
 */
export class AudioManager {
  private static INSTANCE: AudioManager | null = null;

  static get(scene: Phaser.Scene): AudioManager {
    if (!AudioManager.INSTANCE) {
      AudioManager.INSTANCE = new AudioManager(scene.game);
    }
    // Update reference ke game terbaru kalau perlu
    return AudioManager.INSTANCE;
  }

  private game: Phaser.Game;
  private currentBgm: Phaser.Sound.BaseSound | null = null;
  private currentBgmKey: string | null = null;

  private constructor(game: Phaser.Game) {
    this.game = game;
  }

  // ----------------------------------------------------------- BGM

  playBgm(key: string): void {
    const s = loadSettings();

    // Sudah main BGM yang sama? skip
    if (this.currentBgmKey === key && this.currentBgm?.isPlaying) {
      (this.currentBgm as Phaser.Sound.WebAudioSound).setMute?.(!s.musicEnabled);
      this.applyVolume();
      return;
    }

    this.stopBgm();

    if (!this.game.sound.get(key) && !this.game.cache.audio.exists(key)) {
      // Belum ke-load, abaikan
      return;
    }

    const sound = this.game.sound.add(key, {
      loop: true,
      volume: s.musicVolume,
    });
    sound.play();
    if (!s.musicEnabled) (sound as Phaser.Sound.WebAudioSound).setMute?.(true);

    this.currentBgm = sound;
    this.currentBgmKey = key;
  }

  stopBgm(): void {
    if (this.currentBgm) {
      this.currentBgm.stop();
      this.currentBgm.destroy();
      this.currentBgm = null;
      this.currentBgmKey = null;
    }
  }

  // ----------------------------------------------------------- SFX

  playSfx(scene: Phaser.Scene, key: string, volumeMul = 1): void {
    const s = loadSettings();
    if (!s.sfxEnabled) return;
    if (!scene.cache.audio.exists(key)) return;
    scene.sound.play(key, { volume: s.sfxVolume * volumeMul });
  }

  // ----------------------------------------------------------- Toggle / volume

  toggleMusic(): boolean {
    const s = loadSettings();
    const next = !s.musicEnabled;
    saveSettings({ musicEnabled: next });
    if (this.currentBgm) (this.currentBgm as Phaser.Sound.WebAudioSound).setMute?.(!next);
    return next;
  }

  toggleSfx(): boolean {
    const s = loadSettings();
    const next = !s.sfxEnabled;
    saveSettings({ sfxEnabled: next });
    return next;
  }

  setMusicVolume(v: number): void {
    const clamped = Math.max(0, Math.min(1, v));
    saveSettings({ musicVolume: clamped });
    this.applyVolume();
  }

  setSfxVolume(v: number): void {
    const clamped = Math.max(0, Math.min(1, v));
    saveSettings({ sfxVolume: clamped });
  }

  private applyVolume(): void {
    const s = loadSettings();
    if (this.currentBgm) {
      (this.currentBgm as Phaser.Sound.BaseSound & { setVolume?: (v: number) => void }).setVolume?.(s.musicVolume);
    }
  }
}
