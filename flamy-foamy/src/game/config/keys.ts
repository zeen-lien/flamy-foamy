// Sentralisasi semua key texture & animasi Phaser supaya gak ada magic-string nyebar.

export const TEX = {
  // ===== Backgrounds =====
  BG_HOME: 'bg_home',
  BG_LEVEL1: 'bg_level1',
  BG_LEVEL2: 'bg_level2',
  BG_LEVEL3: 'bg_level3',
  BG_HLMLEVEL: 'bg_hlmlevel',
  BG_ALURCERITA: 'bg_alurcerita',
  BG_ALURGAME: 'bg_alurgame',
  BG_PARTIKEL: 'bg_partikel',
  BG_TENTANGGAME: 'bg_tentanggame',

  // ===== Items =====
  ITEM_COIN: 'item_coin',
  ITEM_FIRESTONE: 'item_firestone',
  ITEM_WATERSTONE: 'item_waterstone',
  ITEM_BATUKRISTAL: 'item_batukristal',
  ITEM_XP: 'item_xp',

  // ===== UI =====
  HEADER_MUSIK: 'header_musik',
  LOADING_LOGO: 'loading_logo',

  // ===== Mobile in-game movement (per mode) — masih dipake buat HUD touch =====
  BTN_LEFT_BLOP: 'btn_left_blop',
  BTN_LEFT_FLAMY: 'btn_left_flamy',
  BTN_LEFT_FOAMY: 'btn_left_foamy',
  BTN_RIGHT_BLOP: 'btn_right_blop',
  BTN_RIGHT_FLAMY: 'btn_right_flamy',
  BTN_RIGHT_FOAMY: 'btn_right_foamy',
  BTN_JUMP_BLOP: 'btn_jump_blop',
  BTN_JUMP_FLAMY: 'btn_jump_flamy',
  BTN_JUMP_FOAMY: 'btn_jump_foamy',
  BTN_ATTACK_BLOP: 'btn_attack_blop',
  BTN_ATTACK_FLAMY: 'btn_attack_flamy',
  BTN_ATTACK_FOAMY: 'btn_attack_foamy',

  // mode switcher (mungkin di-code juga, tapi keep dulu)
  BTN_SWITCH_BATU: 'btn_switch_batu',
  BTN_SWITCH_API: 'btn_switch_api',
  BTN_SWITCH_AIR: 'btn_switch_air',

  // checkpoint
  CP_OFF: 'cp_off',
  CP_ON: 'cp_on',

  // icon level (level select)
  ICON_LEVEL1: 'icon_level1',
  ICON_LEVEL2_KEBUKA: 'icon_level2_kebuka',
  ICON_LEVEL2_KEKUNCI: 'icon_level2_kekunci',
  ICON_LEVEL3_KEBUKA: 'icon_level3_kebuka',
  ICON_LEVEL3_KEKUNCI: 'icon_level3_kekunci',
} as const;

export const ANIM = {
  // ===== Player =====
  PLAYER_BLOP_IDLE: 'player_blop_idle',
  PLAYER_BLOP_RUN: 'player_blop_run',
  PLAYER_BLOP_JUMP: 'player_blop_jump',
  PLAYER_BLOP_ATTACK: 'player_blop_attack',
  PLAYER_FIRE_IDLE: 'player_fire_idle',
  PLAYER_FIRE_RUN: 'player_fire_run',
  PLAYER_FIRE_JUMP: 'player_fire_jump',
  PLAYER_FIRE_ATTACK: 'player_fire_attack',
  PLAYER_WATER_IDLE: 'player_water_idle',
  PLAYER_WATER_RUN: 'player_water_run',
  PLAYER_WATER_JUMP: 'player_water_jump',
  PLAYER_WATER_ATTACK: 'player_water_attack',

  // ===== Boss =====
  BOSS_BATU_RUN: 'boss_batu_run',
  BOSS_BATU_ATTACK: 'boss_batu_attack',
  BOSS_API_RUN: 'boss_api_run',
  BOSS_API_ATTACK: 'boss_api_attack',
  BOSS_ES_RUN: 'boss_es_run',
  BOSS_ES_ATTACK: 'boss_es_attack',

  // ===== Eggs =====
  EGG_BATU_IDLE: 'egg_batu_idle',
  EGG_BATU_CRACK: 'egg_batu_crack',
  EGG_API_IDLE: 'egg_api_idle',
  EGG_API_CRACK: 'egg_api_crack',
  EGG_ES_IDLE: 'egg_es_idle',
  EGG_ES_CRACK: 'egg_es_crack',

  // ===== Traps =====
  TRAP_JEB1_OFF: 'trap_jeb1_off',
  TRAP_JEB1_ON: 'trap_jeb1_on',
  TRAP_JEB2_OFF: 'trap_jeb2_off',
  TRAP_JEB2_ON: 'trap_jeb2_on',
  TRAP_JEB3_OFF: 'trap_jeb3_off',
  TRAP_JEB3_ON: 'trap_jeb3_on',
} as const;

export const AUDIO = {
  BGM_HOME: 'bgm_home',
  BGM_LEVEL1: 'bgm_level1',
  BGM_LEVEL2: 'bgm_level2',
  BGM_LEVEL3: 'bgm_level3',
  SFX_JUMP: 'sfx_jump',
  SFX_COIN: 'sfx_coin',
  SFX_DEATH: 'sfx_death',
  SFX_VICTORY: 'sfx_victory',
} as const;

export const SCENE = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  HOME: 'HomeScene',
  LEVEL_SELECT: 'LevelSelectScene',
  SETTING: 'SettingScene',
  ABOUT: 'AboutScene',
  CARA_BERMAIN: 'CaraBermainScene',
  PLAYER_TEST: 'PlayerTestScene',
  HUD: 'HUDScene',
} as const;
