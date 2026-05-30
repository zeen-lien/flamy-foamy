// Manifest semua aset yang harus di-load PreloadScene.
// Di-pisah supaya scene preload sendiri tetep ramping & deklaratif.

import { TEX, ANIM, AUDIO } from './keys';

// ---------- Image (single) ----------
export interface ImageEntry {
  key: string;
  path: string;
}

export const IMAGE_ASSETS: ImageEntry[] = [
  // backgrounds
  { key: TEX.BG_HOME, path: 'assets/bg/bghome.png' },
  { key: TEX.BG_LEVEL1, path: 'assets/bg/bglevel1.png' },
  { key: TEX.BG_LEVEL2, path: 'assets/bg/bglevel2.png' },
  { key: TEX.BG_LEVEL3, path: 'assets/bg/bglevel3.png' },
  { key: TEX.BG_HLMLEVEL, path: 'assets/bg/bghlmlevel.png' },
  { key: TEX.BG_ALURCERITA, path: 'assets/bg/alurcerita.png' },
  { key: TEX.BG_ALURGAME, path: 'assets/bg/alurgame.png' },
  { key: TEX.BG_PARTIKEL, path: 'assets/bg/bgpartikel.png' },
  { key: TEX.BG_TENTANGGAME, path: 'assets/bg/tentanggame.png' },

  // items
  { key: TEX.ITEM_COIN, path: 'assets/items/coin.png' },
  { key: TEX.ITEM_FIRESTONE, path: 'assets/items/firestone.png' },
  { key: TEX.ITEM_WATERSTONE, path: 'assets/items/waterstone.png' },
  { key: TEX.ITEM_BATUKRISTAL, path: 'assets/items/batukristal.png' },
  { key: TEX.ITEM_XP, path: 'assets/items/hp.png' },

  // ui
  { key: TEX.LOGO_GAME, path: 'assets/ui/logogame.png' },
  { key: TEX.HEADER_MUSIK, path: 'assets/ui/header_musik.png' },
  { key: TEX.LOADING_LOGO, path: 'assets/audio/loading-logo.png' },

  // buttons single
  { key: TEX.BTN_MULAI, path: 'assets/btnmobile/btnmulaibermain.png' },
  { key: TEX.BTN_NEXT, path: 'assets/btnmobile/btnnext.png' },
  { key: TEX.BTN_RESET, path: 'assets/btnmobile/btnreset.png' },

  // mode switcher
  { key: TEX.BTN_SWITCH_BATU, path: 'assets/btnmobile/btnswitch/btnswitchbatu.png' },
  { key: TEX.BTN_SWITCH_API, path: 'assets/btnmobile/btnswitch/btnswitchapi.png' },
  { key: TEX.BTN_SWITCH_AIR, path: 'assets/btnmobile/btnswitch/btnswitchair.png' },

  // navbar
  { key: TEX.BTN_NAV_HOME, path: 'assets/btnmobile/navbar/btnhome.png' },
  { key: TEX.BTN_NAV_ABOUT, path: 'assets/btnmobile/navbar/btnabout.png' },
  { key: TEX.BTN_NAV_LEVEL, path: 'assets/btnmobile/navbar/btnlevel.png' },
  { key: TEX.BTN_NAV_SETTING, path: 'assets/btnmobile/navbar/btnsetting.png' },

  // in-game
  { key: TEX.BTN_IG_HOME, path: 'assets/btnmobile/btningame/btnlogohome.png' },
  { key: TEX.BTN_IG_RESTART, path: 'assets/btnmobile/btningame/btnlogorestart.png' },
  { key: TEX.BTN_IG_SETTING, path: 'assets/btnmobile/btningame/btnlogosetting.png' },
  { key: TEX.BTN_IG_X, path: 'assets/btnmobile/btningame/btnlogoX.png' },
  { key: TEX.BTN_IG_MENU, path: 'assets/btnmobile/btningame/btnmenu.png' },
  { key: TEX.BTN_IG_RESUME, path: 'assets/btnmobile/btningame/btnresume.png' },

  // music toggle
  { key: TEX.BTN_MUSIC_ON, path: 'assets/btnmobile/btnonmusic/on/000.png' },
  { key: TEX.BTN_MUSIC_OFF, path: 'assets/btnmobile/btnonmusic/off/000.png' },

  // mobile movement (per mode)
  { key: TEX.BTN_LEFT_BLOP, path: 'assets/btnmobile/btn_left/btnleftblop/000.png' },
  { key: TEX.BTN_LEFT_FLAMY, path: 'assets/btnmobile/btn_left/btnleftflamy/000.png' },
  { key: TEX.BTN_LEFT_FOAMY, path: 'assets/btnmobile/btn_left/btnleftfoamy/000.png' },
  { key: TEX.BTN_RIGHT_BLOP, path: 'assets/btnmobile/btn_right/btnrightblop/000.png' },
  { key: TEX.BTN_RIGHT_FLAMY, path: 'assets/btnmobile/btn_right/btnrightflamy/000.png' },
  { key: TEX.BTN_RIGHT_FOAMY, path: 'assets/btnmobile/btn_right/btnrightfoamy/000.png' },
  { key: TEX.BTN_JUMP_BLOP, path: 'assets/btnmobile/btn_jump/btnjumpblop/000.png' },
  { key: TEX.BTN_JUMP_FLAMY, path: 'assets/btnmobile/btn_jump/btnjumpflamy/000.png' },
  { key: TEX.BTN_JUMP_FOAMY, path: 'assets/btnmobile/btn_jump/btnjumpfoamy/000.png' },
  { key: TEX.BTN_ATTACK_BLOP, path: 'assets/btnmobile/btnattack/btnattackblop/000.png' },
  { key: TEX.BTN_ATTACK_FLAMY, path: 'assets/btnmobile/btnattack/btnattackflamy/000.png' },
  { key: TEX.BTN_ATTACK_FOAMY, path: 'assets/btnmobile/btnattack/btnattackfoamy/000.png' },

  // checkpoint
  { key: TEX.CP_OFF, path: 'assets/cp/off/000.png' },
  { key: TEX.CP_ON, path: 'assets/cp/on/000.png' },

  // icon level
  { key: TEX.ICON_LEVEL1, path: 'assets/iconlevel/iconlevel1.png' },
  { key: TEX.ICON_LEVEL2_KEBUKA, path: 'assets/iconlevel/level2kebuka.png' },
  { key: TEX.ICON_LEVEL2_KEKUNCI, path: 'assets/iconlevel/level2kekunci.png' },
  { key: TEX.ICON_LEVEL3_KEBUKA, path: 'assets/iconlevel/level3kebuka.png' },
  { key: TEX.ICON_LEVEL3_KEKUNCI, path: 'assets/iconlevel/level3kekunci.png' },
];

// ---------- Audio ----------
export interface AudioEntry {
  key: string;
  path: string;
}

export const AUDIO_ASSETS: AudioEntry[] = [
  { key: AUDIO.BGM_HOME, path: 'assets/audio/bgmhome.ogg' },
  { key: AUDIO.BGM_LEVEL1, path: 'assets/audio/bgmlevel1.ogg' },
  { key: AUDIO.BGM_LEVEL2, path: 'assets/audio/bgmlevel2.ogg' },
  { key: AUDIO.BGM_LEVEL3, path: 'assets/audio/bgmlevel3.ogg' },
  { key: AUDIO.SFX_JUMP, path: 'assets/audio/sfx_jump.ogg' },
  { key: AUDIO.SFX_COIN, path: 'assets/audio/sfx_coin.ogg' },
  { key: AUDIO.SFX_DEATH, path: 'assets/audio/sfx_death.ogg' },
  { key: AUDIO.SFX_VICTORY, path: 'assets/audio/sfx_victory.ogg' },
];

// ---------- Animations (multi-frame) ----------
// Setiap entry = 1 animasi Phaser. Frame loaded sebagai image (per file PNG),
// lalu dirakit jadi animation di anims.create().
export interface AnimEntry {
  key: string;          // animation key (juga jadi prefix texture key tiap frame)
  folder: string;       // relatif ke `public/`
  frames: number;       // jumlah PNG (000.png … (n-1).png)
  frameRate: number;
  repeat: number;       // -1 = loop infinite, 0 = sekali
}

export const ANIM_ASSETS: AnimEntry[] = [
  // ===== Player Blop =====
  { key: ANIM.PLAYER_BLOP_IDLE, folder: 'assets/player/blop_idle', frames: 3, frameRate: 6, repeat: -1 },
  { key: ANIM.PLAYER_BLOP_RUN, folder: 'assets/player/blop_run', frames: 5, frameRate: 12, repeat: -1 },
  { key: ANIM.PLAYER_BLOP_JUMP, folder: 'assets/player/blop_jump', frames: 3, frameRate: 10, repeat: 0 },
  { key: ANIM.PLAYER_BLOP_ATTACK, folder: 'assets/player/blop_attack', frames: 6, frameRate: 16, repeat: 0 },

  // ===== Player Fire (Flamy) =====
  { key: ANIM.PLAYER_FIRE_IDLE, folder: 'assets/player/fire_idle', frames: 6, frameRate: 8, repeat: -1 },
  { key: ANIM.PLAYER_FIRE_RUN, folder: 'assets/player/fire_run', frames: 6, frameRate: 14, repeat: -1 },
  { key: ANIM.PLAYER_FIRE_JUMP, folder: 'assets/player/fire_jump', frames: 4, frameRate: 12, repeat: 0 },
  { key: ANIM.PLAYER_FIRE_ATTACK, folder: 'assets/player/fire_attack', frames: 6, frameRate: 16, repeat: 0 },

  // ===== Player Water (Foamy) =====
  { key: ANIM.PLAYER_WATER_IDLE, folder: 'assets/player/water_idle', frames: 6, frameRate: 8, repeat: -1 },
  { key: ANIM.PLAYER_WATER_RUN, folder: 'assets/player/water_run', frames: 6, frameRate: 14, repeat: -1 },
  { key: ANIM.PLAYER_WATER_JUMP, folder: 'assets/player/water_jump', frames: 6, frameRate: 12, repeat: 0 },
  { key: ANIM.PLAYER_WATER_ATTACK, folder: 'assets/player/water_attack', frames: 6, frameRate: 16, repeat: 0 },

  // ===== Boss =====
  { key: ANIM.BOSS_BATU_RUN, folder: 'assets/bos/bos_batu/ebatu_run', frames: 6, frameRate: 10, repeat: -1 },
  { key: ANIM.BOSS_BATU_ATTACK, folder: 'assets/bos/bos_batu/ebatu_attack', frames: 6, frameRate: 12, repeat: 0 },
  { key: ANIM.BOSS_API_RUN, folder: 'assets/bos/bos_api/eapi_run', frames: 7, frameRate: 12, repeat: -1 },
  { key: ANIM.BOSS_API_ATTACK, folder: 'assets/bos/bos_api/eapi_attack', frames: 6, frameRate: 14, repeat: 0 },
  { key: ANIM.BOSS_ES_RUN, folder: 'assets/bos/bos_es/eair_run', frames: 6, frameRate: 12, repeat: -1 },
  { key: ANIM.BOSS_ES_ATTACK, folder: 'assets/bos/bos_es/eair_attack', frames: 6, frameRate: 14, repeat: 0 },

  // ===== Eggs =====
  { key: ANIM.EGG_BATU_IDLE, folder: 'assets/items/telur/telurbatu', frames: 1, frameRate: 1, repeat: -1 },
  { key: ANIM.EGG_BATU_CRACK, folder: 'assets/items/telur/telurbatupecah', frames: 6, frameRate: 8, repeat: 0 },
  { key: ANIM.EGG_API_IDLE, folder: 'assets/items/telur/telurapi', frames: 1, frameRate: 1, repeat: -1 },
  { key: ANIM.EGG_API_CRACK, folder: 'assets/items/telur/telurapipecah', frames: 6, frameRate: 8, repeat: 0 },
  { key: ANIM.EGG_ES_IDLE, folder: 'assets/items/telur/telures', frames: 1, frameRate: 1, repeat: -1 },
  { key: ANIM.EGG_ES_CRACK, folder: 'assets/items/telur/telurespecah', frames: 5, frameRate: 8, repeat: 0 },

  // ===== Traps =====
  { key: ANIM.TRAP_JEB1_OFF, folder: 'assets/jebakan/jebakan1/off', frames: 1, frameRate: 1, repeat: -1 },
  { key: ANIM.TRAP_JEB1_ON, folder: 'assets/jebakan/jebakan1/on', frames: 5, frameRate: 12, repeat: -1 },
  { key: ANIM.TRAP_JEB2_OFF, folder: 'assets/jebakan/jebakan2/off', frames: 1, frameRate: 1, repeat: -1 },
  { key: ANIM.TRAP_JEB2_ON, folder: 'assets/jebakan/jebakan2/on', frames: 5, frameRate: 12, repeat: -1 },
  { key: ANIM.TRAP_JEB3_OFF, folder: 'assets/jebakan/jebakan3/off', frames: 1, frameRate: 1, repeat: -1 },
  { key: ANIM.TRAP_JEB3_ON, folder: 'assets/jebakan/jebakan3/on', frames: 5, frameRate: 12, repeat: -1 },
];

/** Helper untuk generate texture key per frame yang konsisten. */
export function frameKey(animKey: string, index: number): string {
  return `${animKey}__${index}`;
}

/** Helper format nomor 3-digit ("000", "001", dst) sesuai naming PNG. */
export function frameFile(index: number): string {
  return `${String(index).padStart(3, '0')}.png`;
}
