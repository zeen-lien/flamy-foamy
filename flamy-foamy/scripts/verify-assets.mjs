// Verify all assets referenced in LAPORAN_GAME_LENGKAP.md exist on disk.
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.cwd(), 'public', 'assets');

const expectedFolders = {
  // player: <mode>_<action> with frame counts
  'player/blop_idle': 3,
  'player/blop_run': 5,
  'player/blop_jump': 3,
  'player/blop_attack': 6,
  'player/fire_idle': 6,
  'player/fire_run': 6,
  'player/fire_jump': 4,
  'player/fire_attack': 6,
  'player/water_idle': 6,
  'player/water_run': 6,
  'player/water_jump': 6,
  'player/water_attack': 6,

  // bosses
  'bos/bos_batu/ebatu_run': 6,
  'bos/bos_batu/ebatu_attack': 6,
  'bos/bos_api/eapi_run': 7,
  'bos/bos_api/eapi_attack': 6,
  'bos/bos_es/eair_run': 6,
  'bos/bos_es/eair_attack': 6,

  // eggs
  'items/telur/telurbatu': 1,
  'items/telur/telurbatupecah': 6,
  'items/telur/telurapi': 1,
  'items/telur/telurapipecah': 6,
  'items/telur/telures': 1,
  'items/telur/telurespecah': 5,

  // traps
  'jebakan/jebakan1/off': 1,
  'jebakan/jebakan1/on': 5,
  'jebakan/jebakan2/off': 1,
  'jebakan/jebakan2/on': 5,
  'jebakan/jebakan3/off': 1,
  'jebakan/jebakan3/on': 5,

  // checkpoint
  'cp/off': 1,
  'cp/on': 1,

  // mobile button mode variants
  'btnmobile/btn_left/btnleftblop': 1,
  'btnmobile/btn_left/btnleftflamy': 1,
  'btnmobile/btn_left/btnleftfoamy': 1,
  'btnmobile/btn_right/btnrightblop': 1,
  'btnmobile/btn_right/btnrightflamy': 1,
  'btnmobile/btn_right/btnrightfoamy': 1,
  'btnmobile/btn_jump/btnjumpblop': 1,
  'btnmobile/btn_jump/btnjumpflamy': 1,
  'btnmobile/btn_jump/btnjumpfoamy': 1,
  'btnmobile/btnattack/btnattackblop': 1,
  'btnmobile/btnattack/btnattackflamy': 1,
  'btnmobile/btnattack/btnattackfoamy': 1,
  'btnmobile/btnonmusic/on': 1,
  'btnmobile/btnonmusic/off': 1,
};

const expectedFiles = [
  // background
  'bg/bghome.png',
  'bg/bglevel1.png',
  'bg/bglevel2.png',
  'bg/bglevel3.png',
  'bg/bghlmlevel.png',
  'bg/alurcerita.png',
  'bg/alurgame.png',
  'bg/bgpartikel.png',
  'bg/tentanggame.png',

  // items
  'items/coin.png',
  'items/firestone.png',
  'items/waterstone.png',
  'items/batukristal.png',
  'items/hp.png',

  // ui
  'ui/logogame.png',
  'ui/header_musik.png',

  // mobile single buttons
  'btnmobile/btnmulaibermain.png',
  'btnmobile/btnnext.png',
  'btnmobile/btnreset.png',
  'btnmobile/btnswitch/btnswitchair.png',
  'btnmobile/btnswitch/btnswitchapi.png',
  'btnmobile/btnswitch/btnswitchbatu.png',
  'btnmobile/btningame/btnlogohome.png',
  'btnmobile/btningame/btnlogorestart.png',
  'btnmobile/btningame/btnlogosetting.png',
  'btnmobile/btningame/btnlogoX.png',
  'btnmobile/btningame/btnmenu.png',
  'btnmobile/btningame/btnresume.png',
  'btnmobile/navbar/btnabout.png',
  'btnmobile/navbar/btnhome.png',
  'btnmobile/navbar/btnlevel.png',
  'btnmobile/navbar/btnsetting.png',

  // iconlevel
  'iconlevel/iconlevel1.png',
  'iconlevel/level2kebuka.png',
  'iconlevel/level2kekunci.png',
  'iconlevel/level3kebuka.png',
  'iconlevel/level3kekunci.png',

  // audio
  'audio/bgmhome.ogg',
  'audio/bgmlevel1.ogg',
  'audio/bgmlevel2.ogg',
  'audio/bgmlevel3.ogg',
  'audio/sfx_jump.ogg',
  'audio/sfx_coin.ogg',
  'audio/sfx_death.ogg',
  'audio/sfx_victory.ogg',
  'audio/selesai.webm',
  'audio/loading-logo.png',
  'audio/icon-16.png',
  'audio/icon-32.png',
  'audio/icon-114.png',
  'audio/icon-128.png',
  'audio/icon-256.png',
];

let missing = 0;
let foundFolders = 0;
let frameMismatch = 0;

console.log('=== ASSET VERIFICATION ===\n');

console.log('-- Folders (with frame counts) --');
for (const [rel, expectedCount] of Object.entries(expectedFolders)) {
  const full = join(ROOT, rel);
  if (!existsSync(full) || !statSync(full).isDirectory()) {
    console.log(`MISSING FOLDER: ${rel}`);
    missing++;
    continue;
  }
  const pngs = readdirSync(full).filter((f) => f.toLowerCase().endsWith('.png'));
  if (pngs.length !== expectedCount) {
    console.log(`FRAME MISMATCH: ${rel} -> expected ${expectedCount}, got ${pngs.length}`);
    frameMismatch++;
  } else {
    foundFolders++;
  }
}

console.log('\n-- Files --');
let foundFiles = 0;
for (const rel of expectedFiles) {
  const full = join(ROOT, rel);
  if (!existsSync(full)) {
    console.log(`MISSING FILE: ${rel}`);
    missing++;
  } else {
    foundFiles++;
  }
}

console.log('\n=== SUMMARY ===');
console.log(`Folders OK         : ${foundFolders}/${Object.keys(expectedFolders).length}`);
console.log(`Frame mismatches   : ${frameMismatch}`);
console.log(`Files OK           : ${foundFiles}/${expectedFiles.length}`);
console.log(`Missing total      : ${missing}`);
console.log(missing === 0 && frameMismatch === 0 ? '\nALL GOOD ✓' : '\nNeeds attention ✗');

process.exit(missing === 0 && frameMismatch === 0 ? 0 : 1);
