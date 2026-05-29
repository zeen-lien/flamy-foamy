# 🎮 LAPORAN LENGKAP PROJECT GAME "FLAMY & FOAMY"

> **Dokumen ini adalah single source of truth project. Kalau lo (atau AI agent lain seperti Antigravity, Cursor, Copilot, dll.) baru pertama kali baca file ini, lo bakal langsung paham tujuan, arsitektur, dan status project tanpa nanya lagi. Mulai dari section [Quick Start untuk AI Agent](#-quick-start-untuk-ai-agent--developer-baru) supaya gak salah langkah.**

---

## 📑 DAFTAR ISI

1. [Quick Start untuk AI Agent / Developer Baru](#-quick-start-untuk-ai-agent--developer-baru)
2. [Identitas Project](#1-identitas-project)
3. [Tech Stack & Tooling](#2-tech-stack--tooling)
4. [Struktur Folder Workspace](#3-struktur-folder-workspace)
5. [Konsep & Cerita Game](#4-konsep--cerita-game)
6. [Misi & Tujuan Game](#5-misi--tujuan-game)
7. [Karakter Utama](#6-karakter-utama)
8. [Struktur Scene / Layout](#7-struktur-scene--layout)
9. [Mekanik Gameplay](#8-mekanik-gameplay)
10. [Sistem Level (Detail Per Level)](#9-sistem-level-detail-per-level)
11. [Sistem Boss Fight](#10-sistem-boss-fight)
12. [Sistem Telur Tersembunyi](#11-sistem-telur-tersembunyi)
13. [Sistem HP, XP, Coin, Stone](#12-sistem-hp-xp-coin-stone)
14. [Sistem Bintang & Hasil Level](#13-sistem-bintang--hasil-level)
15. [Sistem Audio & Musik](#14-sistem-audio--musik)
16. [Kontrol Game](#15-kontrol-game)
17. [Daftar Asset & Mapping ke Code](#16-daftar-asset--mapping-ke-code)
18. [Variabel Global & State](#17-variabel-global--state)
19. [Save System (LocalStorage)](#18-save-system-localstorage)
20. [Build & Deploy ke Android (APK)](#19-build--deploy-ke-android-apk)
21. [Roadmap Pengerjaan (Step-by-Step)](#20-roadmap-pengerjaan-step-by-step)
22. [Status Pengerjaan Saat Ini](#21-status-pengerjaan-saat-ini)
23. [Konvensi Code & Best Practice](#22-konvensi-code--best-practice)
24. [Troubleshooting & FAQ](#23-troubleshooting--faq)

---
## 🚀 QUICK START UNTUK AI AGENT / DEVELOPER BARU

> **Halo AI agent (Antigravity / Cursor / Copilot / Claude / GPT / Kiro / dst). Baca section ini SEBELUM modifikasi apapun.**

### Apa project ini?

**Flamy & Foamy** adalah **game platformer 2D** yang dibangun dengan **React + Phaser 3 + TypeScript**, di-build pake **Vite**, dan di-bungkus jadi **APK Android via Capacitor**. Project ini dibuat dari ulang menggunakan asset PNG/audio yang sudah disiapkan user di workspace `e:\kuliah\game\`.

### Konteks penting

- User adalah **mahasiswa**, project ini adalah **tugas kuliah**
- Dosen minta game yang **seru, bikin penasaran, anti-bosen, tingkat kesulitan menengah-tinggi, dengan level yang panjang dan detail**
- Bahasa komunikasi default: **Bahasa Indonesia casual**
- User punya **asset PNG karakter, boss, telur, items, jebakan, background, button, audio** sudah lengkap di folder `e:\kuliah\game\` (lihat [section 16](#16-daftar-asset--mapping-ke-code))
- User TIDAK punya source code Construct 2 (laporan lama menyebut Construct 2 tapi project itu mangkrak — kita rebuild from scratch dengan stack baru)

### Folder kerja

| Path | Isi |
|------|-----|
| `C:\laragon\www\flamy-foamy\` | **PROJECT ROOT** — semua file project ada di sini (source code, asset, dokumen) |
| `C:\laragon\www\flamy-foamy\public\assets\` | Asset PNG/audio (di-serve langsung oleh Vite) |
| `C:\laragon\www\flamy-foamy\src\` | Source code TypeScript (game logic + React shell) |
| `C:\laragon\www\flamy-foamy\android\` | (Akan dibuat via Capacitor) Project Android Studio |
| `C:\laragon\www\flamy-foamy\node_modules\` | Dependencies (Phaser, React, Vite, dll) |

### Aturan emas

1. **Jangan ulang scaffolding.** Project Vite + React + Phaser sudah ke-setup di `flamy-foamy/`.
2. **Jangan install ulang `node_modules`** kecuali user minta — install sebelumnya butuh 36 menit karena network slow.
3. **Jangan modifikasi PNG asli** di folder asset. Resize via Phaser `setDisplaySize()` di runtime.
4. **Asset gameplay dari `public/assets/`** (yang sudah di-copy), JANGAN reference langsung ke folder asset di root workspace.
5. **Step-by-step**, jangan loncat-loncat. User prefer waterfall workflow.
6. **TypeScript strict mode aktif**. Semua code harus type-safe.
7. **Resolusi internal Phaser: 1280×720** (FIT scale ke layar device).
8. **Save progress pake `localStorage`** dengan key `flamy-foamy-save-v1`.

### Cara jalanin project (development)

```powershell
cd C:\laragon\www\flamy-foamy
npm run dev
```

Buka `http://localhost:5173`. Hot reload aktif untuk React + TypeScript.

### Cara build production

```powershell
cd C:\laragon\www\flamy-foamy
npm run build
```

Output di `dist/`. Folder ini yang akan di-copy ke Capacitor untuk APK.

### Cara build APK Android

Lihat [section 19: Build & Deploy ke Android](#19-build--deploy-ke-android-apk).

---

## 1. IDENTITAS PROJECT

| Item | Detail |
|------|--------|
| **Nama Game** | Flamy & Foamy |
| **Genre** | 2D Platformer Adventure (mode-switching mechanic) |
| **Target Platform** | Android APK (utama), Web/Desktop (sekunder via browser) |
| **Resolusi Internal** | 1280 × 720 (auto-fit ke layar device) |
| **Orientasi** | Landscape only |
| **Style Visual** | Cartoon / Fantasy 2D, hand-drawn sprite |
| **Bahasa UI** | Indonesia (HUD, dialog, menu) |
| **Audience** | Pemain casual, target tingkat kesulitan menengah ke tinggi |
| **Lisensi** | Project tugas kuliah (non-komersial) |

---

## 2. TECH STACK & TOOLING

### Runtime / Engine

| Komponen | Versi | Fungsi |
|----------|:-----:|--------|
| **Phaser 3** | ^3.80.1 | Game engine (rendering, fisika Arcade, input, audio, animasi sprite) |
| **React** | ^18.3.1 | Wrapper UI (mounting Phaser + nantinya overlay React HUD jika butuh) |
| **TypeScript** | ^5.6 | Type safety, better DX |
| **Vite** | ^5.4 | Dev server + bundler (super cepat) |

### Mengapa stack ini?

- **Phaser** = engine game 2D paling matang di JS/TS, support touch/mobile native, asset pipeline gampang
- **React** sebagai shell, bukan untuk gameplay (gameplay di-render ke `<canvas>` Phaser). Bisa dipake untuk overlay menu HTML kalau perlu, tapi default-nya semua di Phaser supaya konsisten
- **TypeScript** = mengurangi bug di game state yang kompleks (HP boss, inventory, dst)
- **Vite** = hot-reload sub-detik, build production cepat, output kecil

### Mobile / APK

| Komponen | Versi | Fungsi |
|----------|:-----:|--------|
| **Capacitor** | (akan ditambah di step 19) | Bungkus web app jadi APK Android |
| **Android Studio** | (eksternal) | Build APK final dari project Capacitor |

### Dependencies utama (`package.json`)

```json
{
  "dependencies": {
    "phaser": "^3.80.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.6.3",
    "vite": "^5.4.11"
  }
}
```

### Tooling Wajib di Mesin Developer

| Tool | Versi minimum | Catatan |
|------|:-------------:|---------|
| **Node.js** | 18 LTS atau 20 LTS | User confirmed pakai v24.16.0 (works) |
| **npm** | 10+ | Bundled dengan Node |
| **Java JDK** | 17+ | Untuk build APK via Android Studio |
| **Android Studio** | Hedgehog atau lebih baru | Untuk APK final |
| **Browser** | Chrome / Edge | Untuk testing web (DevTools mobile emulation) |

---

## 3. STRUKTUR FOLDER WORKSPACE

### Layout project (`C:\laragon\www\flamy-foamy\`)

> **Note:** Sejak versi 2.2, project di-flatten ke single folder di SSD internal (`C:\laragon\www\flamy-foamy\`). Sebelumnya ada di `e:\kuliah\game\flamy-foamy\` — sudah dipindahkan untuk performa I/O lebih baik (SSD internal vs flash external).

```
C:\laragon\www\flamy-foamy\
├── LAPORAN_GAME_LENGKAP.md     ← Single source of truth
├── README.md                    ← README ringkas untuk GitHub
├── CONTINUE_HERE.md             ← Prompt handoff untuk AI agent baru
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
│
├── src/                         ← Source code TypeScript
│   ├── main.tsx                 ← Entry React
│   ├── App.tsx                  ← Mount Phaser
│   ├── styles/
│   │   └── global.css
│   └── game/
│       ├── index.ts             ← Phaser game factory (createGame)
│       ├── config.ts            ← Constants gameplay
│       └── scenes/
│           ├── BootScene.ts     ← Loading awal
│           ├── PreloadScene.ts (akan dibuat)
│           ├── HomeScene.ts (akan dibuat)
│           ├── LevelSelectScene.ts (akan dibuat)
│           ├── Level1Scene.ts (akan dibuat)
│           ├── Level2Scene.ts (akan dibuat)
│           ├── Level3Scene.ts (akan dibuat)
│           ├── HasilScene.ts (akan dibuat)
│           └── ...
│
├── public/                      ← Static asset (Vite serve langsung dari sini)
│   └── assets/
│       ├── bg/                  ← Background images (level1/2/3, home, hlmlevel, dll)
│       ├── bos/                 ← Boss sprites (bos_batu, bos_api, bos_es)
│   ├── bos_api/
│   │   ├── eapi_attack/         ← 6 frame
│   │   └── eapi_run/            ← 7 frame
│   ├── bos_batu/
│   │   ├── ebatu_attack/        ← 6 frame
│   │   └── ebatu_run/           ← 6 frame
│   └── bos_es/
│       ├── eair_attack/         ← 6 frame
│       └── eair_run/            ← 6 frame
│
├── btnmobile/                   ← Tombol mobile (per mode + ingame + navbar)
│   ├── btn_jump/                ← btnjumpblop|flamy|foamy
│   ├── btn_left/                ← btnleftblop|flamy|foamy
│   ├── btn_right/               ← btnrightblop|flamy|foamy
│   ├── btnattack/               ← btnattackblop|flamy|foamy
│   ├── btn_switch/              ← (LEGACY, tidak dipakai)
│   ├── btnswitch/               ← btnswitchair|api|batu (mode switcher di HUD)
│   ├── btningame/               ← btnlogohome, btnlogorestart, btnlogosetting,
│   │                              btnlogoX, btnmenu, btnresume
│   ├── btnonmusic/              ← on/off (music toggle)
│   ├── navbar/                  ← btnabout, btnhome, btnlevel, btnsetting
│   ├── btnmulaibermain.png
│   ├── btnnext.png
│   └── btnreset.png
│
├── cp/                          ← Checkpoint (on/off)
├── iconlevel/                   ← Icon di level select (kebuka/kekunci)
├── items/                       ← Collectibles
│   ├── coin.png
│   ├── firestone.png            ← Stone Level 1
│   ├── waterstone.png           ← Stone Level 2
│   ├── batukristal.png          ← Stone Level 3
│   ├── hp.png                   ← XP/HP pickup
│   └── telur/                   ← Egg sprites (3 jenis: batu, api, es)
│       ├── telurbatu/           ← 1 frame (utuh)
│       ├── telurbatupecah/      ← 6 frame (animasi pecah)
│       ├── telurapi/
│       ├── telurapipecah/
│       ├── telures/
│       └── telurespecah/
│
├── jebakan/                     ← Trap on/off
│   ├── jebakan1/
│   │   ├── off/                 ← 1 frame
│   │   └── on/                  ← 5 frame
│   ├── jebakan2/
│   └── jebakan3/
│
├── player/                      ← Karakter utama (3 mode × 4 animasi)
│   ├── blop_attack/             ← 6 frame
│   ├── blop_idle/               ← 3 frame
│   ├── blop_jump/               ← 3 frame
│   ├── blop_run/                ← 5 frame
│   ├── fire_attack/             ← 6 frame
│   ├── fire_idle/               ← 6 frame
│   ├── fire_jump/               ← 4 frame
│   ├── fire_run/                ← 6 frame
│   ├── water_attack/            ← 6 frame
│   ├── water_idle/              ← 6 frame
│   ├── water_jump/              ← 6 frame
│   └── water_run/               ← 6 frame
│
├── audio/                       ← Audio (renamed dari "sound dan music")
│   ├── bgmhome.ogg
│   ├── bgmlevel1.ogg
│   ├── bgmlevel2.ogg
│   ├── bgmlevel3.ogg
│   ├── sfx_coin.ogg
│   ├── sfx_death.ogg
│   ├── sfx_jump.ogg
│   ├── sfx_victory.ogg
│   ├── selesai.webm             ← End screen video
│   ├── icon-16.png              ← App icons (untuk APK, akan di-move ke android/res nanti)
│   ├── icon-32.png
│   ├── icon-114.png
│   ├── icon-128.png
│   ├── icon-256.png
│   └── loading-logo.png         ← Splash screen logo
│
└── ui/
    ├── logogame.png             ← Logo "Flamy & Foamy" (title screen)
    └── header_musik.png         ← Header dekoratif "MUSIK" untuk SettingScene (renamed dari headertextmusic.png)
```

### Catatan tentang asset path

- Vite serve file dari folder `public/`. Semua asset di-load dari `'/assets/...'` (relatif terhadap public).
- Saat dev: Vite serve langsung dari `public/`.
- Saat build production: Vite copy `public/` ke `dist/` apa adanya.
- TIDAK perlu script copy-assets karena asset sudah ada di lokasi final.

---

## 4. KONSEP & CERITA GAME

### Lore

Di dunia bernama **Elemental Realm**, ada 3 kerajaan elemen yang saling berseteru: **Kerajaan Batu, Kerajaan Api, dan Kerajaan Air**. Setiap kerajaan dijaga oleh **Boss Penjaga** yang melindungi **Telur Misterius** — sebuah artefak kuno yang menyimpan rahasia kekuatan elemen.

Player berperan sebagai **Plenger**, makhluk lendir adaptif yang bisa berubah wujud menjadi 3 elemen. Plenger harus menyelinap melewati 3 kerajaan, mengumpulkan **Batu Kristal Elemen**, mengalahkan **Boss Penjaga**, dan akhirnya **memecahkan Telur Misterius** untuk mengungkap rahasianya.

### 3 Mode Karakter

| Mode | Wujud | Kemampuan Khusus |
|------|-------|------------------|
| 🪨 **Blop** | Slime batu, mode default | Bentuk dasar, bisa lewat semua medan biasa |
| 🔥 **Flamy** | Slime api | Kebal terhadap zona api & lava, bisa lewat tembok api |
| 💧 **Foamy** | Slime air | Kebal terhadap zona air, bisa lewat dinding air bertekanan |

Player **mulai default sebagai Blop**. Setelah masuk Level 2, mode Flamy unlock. Setelah masuk Level 3, mode Foamy unlock.

### Hook Cerita (biar player penasaran)

- **Awal Level 1**: Plenger nemu pesan retak yang nyebut "Telur Misterius… kuncinya 3 elemen…"
- **Setelah Boss Level 1**: Telur batu retak — keluar **batu kristal merah** (hint elemen api)
- **Awal Level 2**: Telur retak Level 1 muncul flashback singkat — narasi "Kerajaan Api memanggil…"
- **Setelah Boss Level 2**: Keluar **batu kristal biru** (hint elemen air)
- **Awal Level 3**: Narasi "Kerajaan terakhir, Telur Es… rahasia akhir menanti"
- **Setelah Boss Level 3 & telur pecah**: Cutscene singkat — semua telur menyatu, Plenger bertransformasi jadi wujud "Plenger Elemental Master", lalu video `selesai.webm` di-play

---

## 5. MISI & TUJUAN GAME

### Tujuan Utama (Per Level)

| Level | Tema | Misi Utama | Misi Tambahan (Bintang) |
|-------|------|-----------|------------------------|
| **Level 1** | Dunia Batu (Blop) | Kumpulkan ≥5 fire_stone + masuk portal finish | Coin ≥200 + Stone ≥5 |
| **Level 2** | Dunia Api (Flamy) | Kumpulkan ≥8 water_stone + masuk portal finish | Coin ≥500 + Stone ≥8 |
| **Level 3** | Dunia Air (Foamy) | Kumpulkan ≥10 batukristal + masuk portal finish | Coin ≥1000 + Stone ≥10 |

### Sistem Unlock Level

| Level | Syarat |
|-------|--------|
| Level 1 | Selalu terbuka |
| Level 2 | `level1_stones_collected ≥ 5` (default minimal stone Level 1) |
| Level 3 | `level2_stones_collected ≥ 8` (default minimal stone Level 2) |

Kalau player coba klik level yang masih kunci → muncul popup notif **"Level Terkunci - Kumpulkan dulu X batu di Level Y"**.

### 3 Bintang Per Level

Setiap selesai level, player dapat 0-3 bintang:

| Bintang | Variabel | Kondisi |
|---------|----------|---------|
| ⭐ Finish | `bintang_finish` | Selesai level (selalu dapat) |
| ⭐ Coin | `bintang_coin` | Total skor coin ≥ target |
| ⭐ Stone | `bintang_batu` | Total stone collected ≥ target |

Bintang disimpan ke save game. Player bisa replay level untuk improve rating.

---

## 6. KARAKTER UTAMA

### Plenger (Player)

| Properti | Detail |
|----------|--------|
| **Class TS** | `Player` (extend `Phaser.Physics.Arcade.Sprite`) |
| **Lokasi file** | `src/game/entities/Player.ts` |
| **Physics body** | Rectangle ~50×60 (offset disesuaikan biar fit ke sprite) |
| **Mass / drag** | Default Arcade. `setDragX(800)` biar gerak gak licin |
| **State** | `mode: 'blop' \| 'fire' \| 'water'`, `isAttacking: boolean`, `hp: number`, `isDead: boolean`, `facingLeft: boolean` |

### Animasi Player (12 total)

Phaser animation key disusun: `player_<mode>_<action>`. Contoh: `player_blop_idle`, `player_fire_run`, dst.

| Mode | Idle | Run | Jump | Attack |
|------|:----:|:---:|:----:|:------:|
| **blop** | 3 frame, 6fps loop | 5 frame, 12fps loop | 3 frame, 10fps no-loop | 6 frame, 16fps no-loop |
| **fire** | 6 frame, 8fps loop | 6 frame, 14fps loop | 4 frame, 12fps no-loop | 6 frame, 16fps no-loop |
| **water** | 6 frame, 8fps loop | 6 frame, 14fps loop | 6 frame, 12fps no-loop | 6 frame, 16fps no-loop |

### Display size

```ts
player.setDisplaySize(64, 88); // konsisten lintas mode walaupun resolusi PNG asli beda
```

### State Machine (sederhana)

```
idle ←→ run ←→ jump
  ↓      ↓      ↓
attack (override semua, isAttacking=true selama 600ms)
  ↓
kembali ke state sebelumnya
```

### Mode Switching

- **Blop ↔ Fire ↔ Water** dengan keyboard `Z` / `X` / `C` atau touch button
- Saat switch: trigger animasi flash (tween alpha 0→1 dalam 200ms) + particle burst sesuai elemen
- Mode `fire` & `water` cuma bisa dipakai kalau sudah di-unlock (`fire_unlocked`, `water_unlocked` di global state)
- Saat ganti mode, animasi tombol mobile ikut berubah (btnleftblop → btnleftflamy → btnleftfoamy)

---

## 7. STRUKTUR SCENE / LAYOUT

Phaser pakai konsep **Scene**. Setiap "halaman" game = 1 Scene class.

### Daftar Scene

| Scene Key | File | Fungsi |
|-----------|------|--------|
| `BootScene` | `BootScene.ts` | Init pertama, set scale & input config, langsung ke PreloadScene |
| `PreloadScene` | `PreloadScene.ts` | Load semua asset (sprite, audio, font) dengan progress bar |
| `HomeScene` | `HomeScene.ts` | Menu utama: Mulai, Level Select, Setting, About, Cara Bermain |
| `LevelSelectScene` | `LevelSelectScene.ts` | Pilih level (Level 1/2/3) dengan icon kebuka/kekunci |
| `IntroLevelScene` | `IntroLevelScene.ts` | Cutscene singkat sebelum mulai level (ganti2 narasi sesuai level) |
| `Level1Scene` | `Level1Scene.ts` | Gameplay Level 1 (Dunia Batu) |
| `Level2Scene` | `Level2Scene.ts` | Gameplay Level 2 (Dunia Api) |
| `Level3Scene` | `Level3Scene.ts` | Gameplay Level 3 (Dunia Air) |
| `HUDScene` | `HUDScene.ts` | Layer HUD: HP bar, coin counter, stone counter, mode switcher, pause button. Run paralel dengan level scene |
| `PauseScene` | `PauseScene.ts` | Overlay pause: Resume, Restart, Home |
| `HasilScene` | `HasilScene.ts` | Hasil level: bintang rating, next/replay/menu (key dipasangi level number) |
| `SettingScene` | `SettingScene.ts` | Toggle musik, SFX, sound volume |
| `AboutScene` | `AboutScene.ts` | Halaman about (multi-page) |
| `CaraBermainScene` | `CaraBermainScene.ts` | Tutorial kontrol & gameplay |
| `SelesaiScene` | `SelesaiScene.ts` | End screen: play `selesai.webm`, kredit |

### Flow Antar Scene

```
BootScene
   ↓
PreloadScene (loading bar)
   ↓
HomeScene ────────┬─────────────┬────────────┬──────────────┐
   │              │             │            │              │
   ↓              ↓             ↓            ↓              ↓
LevelSelect    Setting       About     CaraBermain      (logo title)
   │
   ↓
IntroLevelScene (Level X)
   │
   ↓
LevelXScene + HUDScene (paralel)
   │   ↓ (pause button)
   │   PauseScene → Resume / Restart / Home
   │
   ↓ (sentuh portal finish)
HasilScene
   ├─ Next   → IntroLevelScene (Level X+1)  atau  SelesaiScene (kalau X=3)
   ├─ Replay → IntroLevelScene (Level X)
   └─ Menu   → HomeScene
```

---

## 8. MEKANIK GAMEPLAY

### Movement (Platform Standard)

| Aksi | Keyboard | Touch |
|------|:--------:|:-----:|
| Gerak kiri | `←` | Tap & hold `btn_left` |
| Gerak kanan | `→` | Tap & hold `btn_right` |
| Lompat | `↑` / `Space` | Tap `btn_jump` |
| Mode Blop | `Z` | Tap `btnswitchbatu` |
| Mode Fire | `X` | Tap `btnswitchapi` |
| Mode Water | `C` | Tap `btnswitchair` |
| Attack | `A` / `J` | Tap `btnattack` |
| Pause | `Esc` / `P` | Tap `btnlogosetting` |

### Konstanta Gameplay (di `src/game/config.ts`)

```ts
export const GAMEPLAY = {
  playerSpeed: 260,            // pixels per second horizontal
  jumpVelocity: -560,          // negatif = ke atas
  gravity: 1100,               // di scene config
  attackDuration: 600,         // ms cooldown attack
  bossHpMax: 20,
  bossDamageToPlayer: 5,
  playerDamageToBoss: 1,
  eggHpMax: 5,
  hpPerXp: 50,                 // setiap pickup XP +50 HP
  coinValue: 5,                // setiap coin +5 skor
  bossChaseRange: 400,
  bossStopRange: 120,
  bossAttackCooldown: 2000,    // ms
  knockbackPlayer: -100,       // x velocity saat boss hit player
  knockbackBoss: 50,           // x velocity saat player hit boss
};
```

### Aturan Mode & Damage

| Trap | Blop | Fire | Water |
|------|:----:|:----:|:-----:|
| `duri` (instant kill) | ❌ Mati | ❌ Mati | ❌ Mati |
| `jebakan` saat **on** | ❌ Mati | ❌ Mati | ❌ Mati |
| `jebakan` saat **off** | ✅ Aman | ✅ Aman | ✅ Aman |
| `lava` / `lantailava` | ❌ Mati | ✅ Kebal | ❌ Mati |
| Zona Api (`znapi`) | ❌ Mati | ✅ Kebal | ❌ Mati |
| Zona Air (`znair`) | ❌ Mati | ❌ Mati | ✅ Kebal |
| `garis` (jurang/death boundary) | ❌ Respawn | ❌ Respawn | ❌ Respawn |

### Death & Respawn

- Player kena trap → spawn ulang di **checkpoint terakhir** yang aktif (cp1, cp2, cp3, dst)
- HP **tidak ter-reset** (harapannya: kalau HP habis, restart full level)
- `sfx_death` di-play
- Stone & coin yang sudah dikumpulkan tidak hilang (restored ke jumlah saat checkpoint diaktifkan)

### Attack System

- Tekan `A` (atau touch `btnattack`)
- Player mainkan animasi attack (`player_<mode>_attack`), `isAttacking = true`
- Selama `isAttacking = true`:
  - Animasi run/idle/jump tidak override
  - Hitbox attack aktif (rectangle 50px depan player)
- Setelah `attackDuration` (600ms): `isAttacking = false`, kembali ke state idle/run
- Attack mengenai boss: boss `hp -= 1`, knockback boss `+50px`
- Attack mengenai telur (kalau boss sudah mati): telur `hp += 1`, ganti animasi pecah sesuai progress

---

## 9. SISTEM LEVEL (DETAIL PER LEVEL)

> Goal dosen: **panjang, sulit, anti-bosen, bikin penasaran.** Tiap level di-desain punya **3-4 area** dengan mekanik berbeda biar player merasa "ada gebrakan baru tiap area".

### 🪨 Level 1 — Dunia Batu (Dasar)

**Tema visual:** Gua kerajaan batu kuno, dinding granit, runtuhan pilar.  
**Mode aktif:** Hanya **Blop**.  
**BGM:** `bgmlevel1.ogg`  
**Background:** `bg/bglevel1.png` dengan parallax layer.

#### Area 1A — "Tutorial Lembut" (panjang ~3000px)
- Platform datar dengan 2-3 lompatan kecil
- 5-8 coin tersebar di permukaan (familiarisasi)
- 1 fire_stone gampang di-grab
- 1 XP pickup di pojok hidden (reward eksplorasi)
- 1 checkpoint `cp1` di akhir area

#### Area 1B — "Lompatan & Jebakan" (panjang ~4000px)
- Platform terpisah dengan jurang (`garis` death boundary di bawah)
- **Duri statis** di antara platform (3-5 buah)
- **Jebakan1** toggle on/off (3 detik on / 3 detik off, animasi 5 frame)
- 2-3 fire_stone di lokasi yang butuh timing lompat
- Coin di lokasi tricky (reward player yang berani)
- 1 checkpoint `cp2`

#### Area 1C — "Naik Turun Pilar" (panjang ~4000px)
- Platform vertikal (climbing section)
- Wall jump? Tidak (Phaser Arcade gak support natural). Tapi tinggi platform pas untuk lompatan tunggal
- **Jebakan2** muncul random
- Hidden room di pojok atas (4 coin + 1 XP)
- 1 checkpoint `cp3`

#### Area 1D — "Boss Arena" (panjang ~2500px)
- Arena tertutup (tembok kiri-kanan invisible biar player gak kabur)
- **Boss `bos_batu`** muncul setelah player crossing trigger zone
- HP bar boss muncul di top center HUD
- Setelah boss mati: telur `telurbatu` accessible
- Setelah telur pecah (5 hit attack): finish portal `finish1` aktif
- Sentuh finish → save progress, transition ke `HasilScene` Level 1

**Total panjang Level 1:** ~13.500 pixel (~10x layar)
**Estimasi waktu main:** 5-8 menit
**Target stone:** 5 (ada 7-8 di level untuk fleksibilitas)
**Target coin:** 200 (ada ~250-300 di level)

---

### 🔥 Level 2 — Dunia Api (Sulit Menengah)

**Tema visual:** Lava, lantai panas, dinding magma, langit jingga.  
**Mode aktif:** **Blop + Flamy** (Flamy unlock otomatis saat masuk level)  
**BGM:** `bgmlevel2.ogg`  
**Background:** `bg/bglevel2.png` dengan layer animated (lava bubble particle).

#### Area 2A — "Pengenalan Mode Fire" (panjang ~3500px)
- Platform aman + zona api kecil yang HARUS dilewati pakai Flamy
- Player dipaksa belajar switch mode
- 2-3 fire stones... eh, water_stone (objektif level 2)
- Tutorial in-game: "Tekan X untuk Flamy mode"

#### Area 2B — "Lava River" (panjang ~4500px)
- Lantai panjang dengan **lantailava** (kill non-Flamy)
- Platform kecil melayang di atas lava (timing-based jumping)
- **Lavabergerak** (platform yang naik turun di lava — bisa diinjak hanya saat naik)
- Banyak duri di pinggir platform
- 1 checkpoint

#### Area 2C — "Tembok Api Maze" (panjang ~4500px)
- Sistem tembok api (`znapi`) yang menutup-buka berkala
- Player harus baca pattern timing
- Mini puzzle: switch mode di waktu yang tepat
- Hidden chest (5 coin + 1 XP + 1 water_stone bonus)

#### Area 2D — "Boss Api Arena" (panjang ~3000px)
- Arena dengan lantai sebagian lava (Flamy aman, Blop kena)
- **Boss `bos_api`** lebih agresif (chase range 500px, attack cooldown 1.5s)
- Fase 2 saat boss HP ≤ 10: boss summon mini fire orb (dummy projectile, opsional)
- Telur `telurapi` setelah boss mati
- Finish portal `finish2`

**Total panjang Level 2:** ~15.500 pixel
**Estimasi waktu:** 8-12 menit
**Target stone:** 8 (ada 10 di level)
**Target coin:** 500 (ada ~600 di level)

---

### 💧 Level 3 — Dunia Air (Final, Tersulit)

**Tema visual:** Bawah laut, glacier, kristal es, gelembung naik di latar.  
**Mode aktif:** **Blop + Flamy + Foamy** (Foamy unlock saat masuk level)  
**BGM:** `bgmlevel3.ogg`  
**Background:** `bg/bglevel3.png` + `bglevel3_1.png` (multi-layer parallax).

#### Area 3A — "Pengenalan Foamy" (panjang ~3500px)
- Tutorial: "Tekan C untuk Foamy mode"
- Sedikit water zones (znair) untuk practice
- Beberapa zona api juga (ingatkan player pakai Flamy)

#### Area 3B — "Es & Air Bertekanan" (panjang ~5000px)
- **Platform es** (gerak licin — drag dikecilkan)
- Water curtains (znair) yang harus dilewati pakai Foamy
- Ada section dengan air + api bersamaan: player harus switch cepat (Foamy untuk air, Flamy untuk api)
- 1 checkpoint kompleks

#### Area 3C — "Multi-Element Maze" (panjang ~5500px)
- Section paling sulit: kombinasi lava + air + duri + jebakan
- Player butuh **switching tepat dalam waktu cepat**
- Bonus area dengan timing puzzle (~30 detik tantangan)
- 1 hidden ending room dengan 1 batukristal extra + 10 coin

#### Area 3D — "Final Boss Arena" (panjang ~3000px)
- Arena luas dengan zona berubah-ubah (kadang air, kadang api, kadang aman)
- **Boss `bos_es`** paling tangguh: chase 600px, attack cooldown 1s, damage 7
- Fase 2 saat HP ≤ 10: boss bisa freeze player (slow movement 2 detik)
- Telur `telures` setelah boss mati
- Setelah telur pecah → cutscene transformasi → ke `SelesaiScene`

**Total panjang Level 3:** ~17.000 pixel
**Estimasi waktu:** 12-18 menit
**Target stone:** 10 (ada 13 di level)
**Target coin:** 1000 (ada ~1200 di level)

---

## 10. SISTEM BOSS FIGHT

### Boss Class

| Properti | Detail |
|----------|--------|
| **Class TS** | `Boss` (extend `Phaser.Physics.Arcade.Sprite`) |
| **File** | `src/game/entities/Boss.ts` |
| **State** | `hp`, `canAttack: boolean`, `phase: 1 \| 2`, `aiState: 'idle' \| 'chase' \| 'attack' \| 'stunned'` |
| **HP awal** | 20 (Level 1), 25 (Level 2), 30 (Level 3) — meningkat per level |

### AI Behavior

```
update(player) {
  jarak = distance(this, player)

  if (jarak > chaseRange) {
    aiState = 'idle'
    velocity.x = 0
    play('boss_run' tapi diem) atau patroli pelan
  } else if (jarak > stopRange) {
    aiState = 'chase'
    velocity.x = ±chaseSpeed (arahkan ke player)
    play('boss_run')
  } else {
    aiState = 'attack' (kalau canAttack)
    velocity.x = 0
    play('boss_attack')
  }

  if (overlap dengan player + canAttack) {
    player.takeDamage(bossDamage)
    player.knockback(-100)
    canAttack = false
    setTimeout(() => canAttack = true, attackCooldown)
  }

  if (player.isAttacking + overlap) {
    hp -= 1
    knockback(+50)
    play attack animation hit feedback
    player.isAttacking = false (1 attack = 1 hit)
  }

  if (hp <= 0) {
    aiState = 'dead'
    fade out + destroy
    boss_alive = 0 (global state)
    spawn telur unlock
  }
}
```

### HP Bar Boss

- Posisi: top-center HUD scene (bukan di atas boss, biar lebih cinematic)
- Width = 600px, Height = 30px
- Border emas, fill gradient merah-orange
- Label: nama boss ("Boss Batu Penjaga", "Boss Api Berapi", "Boss Es Beku")
- Animasi: shake saat boss kena hit, fade in saat fight mulai

### Knockback

- Saat player kena boss: `player.setVelocityX(-100 * sign)` + invulnerable 500ms
- Saat boss kena player: `boss.setVelocityX(+50 * sign)` + flash merah

---

## 11. SISTEM TELUR TERSEMBUNYI

### Konsep

Telur adalah **objek tersembunyi yang dijaga boss**. Setelah boss dikalahkan, telur muncul di posisi boss (atau lokasi tertentu di arena). Player attack telur sampai pecah untuk dapatkan **kunci kelanjutan cerita**.

### Mekanik

| Aspek | Detail |
|-------|--------|
| **HP Telur** | 5 hit |
| **Kondisi bisa di-attack** | `boss_alive = false` (boss harus mati dulu) |
| **Animasi default** | `telur<jenis>` (1 frame, utuh) |
| **Animasi saat hit** | `telur<jenis>pecah` (frame berubah tiap hit) |

### Progres Pecah

| Hit | Telur HP | Animasi yang ditampilkan | Frame |
|-----|:--------:|--------------------------|:-----:|
| 0 (awal) | 0 | `telur<jenis>` | 0 |
| Hit 1 | 1 | `telur<jenis>pecah` | 0 |
| Hit 2 | 2 | `telur<jenis>pecah` | 1 |
| Hit 3 | 3 | `telur<jenis>pecah` | 2 |
| Hit 4 | 4 | `telur<jenis>pecah` | 3 |
| Hit 5 | 5 | `telur<jenis>pecah` | 4 → fade & destroy |

### Variasi Per Level

| Level | Animasi telur utuh | Animasi pecah |
|-------|-------------------|---------------|
| Level 1 | `telurbatu` | `telurbatupecah` |
| Level 2 | `telurapi` | `telurapipecah` |
| Level 3 | `telures` | `telurespecah` |

### Setelah Telur Pecah

1. Spawn **finish portal** (`finish1` / `finish2` / `finish3`) di posisi tertentu
2. Particle burst sesuai elemen (kuning batu, merah api, biru es)
3. SFX `sfx_victory` part 1
4. Tween fade ke level success state

---

## 12. SISTEM HP, XP, COIN, STONE

### HP / XP

| Aspek | Detail |
|-------|--------|
| **HP awal level** | 100 |
| **HP max** | 200 |
| **Cara dapat HP** | Pickup `XP` (`items/hp.png`) → +50 HP per item (cap di 200) |
| **HUD display** | Bar HP horizontal di kiri atas, numeric "HP: X / 200" |
| **Damage source** | Boss attack (-5 sampai -7), beberapa trap berat |
| **HP habis** | Restart full level (semua state direset) |

### Coin

| Aspek | Detail |
|-------|--------|
| **Per coin** | +5 ke `skor_koin` (state level) |
| **HUD display** | Icon coin + numeric "X" di top-right |
| **Animasi pickup** | Coin diserap ke HUD (tween ke posisi counter), counter blink |
| **SFX** | `sfx_coin` |
| **Target Level** | 200 (L1), 500 (L2), 1000 (L3) untuk star coin |

### Stone (Collectible Utama)

| Aspek | Detail |
|-------|--------|
| **Per stone** | +1 ke `batu_terkumpul` |
| **Tipe per level** | `firestone` (L1), `waterstone` (L2), `batukristal` (L3) |
| **HUD display** | Icon stone + "X / target" di top-right (dibawah coin) |
| **SFX** | `sfx_coin` (sama dengan coin, atau bisa dibedakan) |
| **Disimpan ke save** | `level1_stones_collected`, `level2_stones_collected`, `level3_stones_collected` |
| **Target** | 5 (L1), 8 (L2), 10 (L3) |

---

## 13. SISTEM BINTANG & HASIL LEVEL

### Setelah Selesai Level

1. Player sentuh `finish` portal
2. Pause game logic, calculate stars:
   ```ts
   bintang_finish = 1; // selalu dapat
   bintang_coin = (skor_koin >= target_coin) ? 1 : 0;
   bintang_batu = (batu_terkumpul >= target_batu) ? 1 : 0;
   total_bintang = bintang_finish + bintang_coin + bintang_batu;
   ```
3. Save ke localStorage (best score per level)
4. Transition ke `HasilScene`

### HasilScene UI

```
+----------------------------------+
|     LEVEL X SELESAI! 🎉           |
|                                  |
|       ⭐  ⭐  ⭐                   |
|     (animasi pop satu-satu)      |
|                                  |
|  Coin: 235 / 200    ✓            |
|  Stone: 5 / 5       ✓            |
|  Time: 6:42                      |
|  Best: ⭐⭐⭐                       |
|                                  |
|  [Replay]  [Next →]  [Menu]      |
+----------------------------------+
```

### Tombol HasilScene

| Tombol | Aksi |
|--------|------|
| **Replay** | Restart level yang sama |
| **Next** | Kalau Level 1 → Level 2; Level 2 → Level 3; Level 3 → SelesaiScene |
| **Menu** | Kembali ke HomeScene |

---

## 14. SISTEM AUDIO & MUSIK

### Background Music

| File | Layout/Scene | Volume | Loop |
|------|--------------|:------:|:----:|
| `bgmhome.ogg` | HomeScene, LevelSelectScene, SettingScene, AboutScene | 0.5 | ✓ |
| `bgmlevel1.ogg` | Level1Scene + IntroLevelScene(1) | 0.4 | ✓ |
| `bgmlevel2.ogg` | Level2Scene + IntroLevelScene(2) | 0.4 | ✓ |
| `bgmlevel3.ogg` | Level3Scene + IntroLevelScene(3) | 0.4 | ✓ |

Implementasi pakai **Phaser Sound Manager**, tag `bgmusic` agar bisa di-stop/replace dengan satu call:

```ts
this.sound.stopByKey('bgmhome');
this.sound.play('bgmlevel1', { loop: true, volume: 0.4 });
```

### Sound Effects

| File | Trigger | Volume |
|------|---------|:------:|
| `sfx_jump.ogg` | Player lompat | 0.6 |
| `sfx_coin.ogg` | Pickup coin/stone/XP | 0.7 |
| `sfx_death.ogg` | Player kena trap atau respawn | 0.7 |
| `sfx_victory.ogg` | Boss mati / level finish | 0.8 |

### Toggle Musik

Ada di HomeScene, SettingScene, dan HUDScene level. Toggle ON/OFF disimpan di localStorage `flamy-foamy-settings` → `musicEnabled: boolean`.

### End Screen

`SelesaiScene` putar `selesai.webm` via HTML `<video>` element (overlay di atas canvas), bukan Phaser video texture (lebih reliable untuk webm di Android WebView).

---

## 15. KONTROL GAME

### Keyboard (Desktop)

Sudah dibahas di [section 8](#8-mekanik-gameplay). Ringkas:

| Key | Aksi |
|-----|------|
| `←` `→` | Movement horizontal |
| `↑` / `Space` | Jump |
| `Z` `X` `C` | Mode Blop / Fire / Water |
| `A` / `J` | Attack |
| `Esc` / `P` | Pause |

### Touch (Mobile, default di Android)

Auto-detect: kalau `Phaser.Input.Pointer.touchscreen === true`, render touch controls.

#### Layout HUD Mobile (1280×720)

```
+--------------------------------------------------+
| HP[████░] 150/200    💰 235     💎 5/5    ⏸ pause|
|                                                  |
|                                                  |
|         [game area]                              |
|                                                  |
|                                                  |
| [<-]  [->]                            [J] [A]    |
| [batu][api][air]                                 |
+--------------------------------------------------+
```

| Tombol | Posisi | Aksi |
|--------|--------|------|
| `btn_left` | Kiri bawah, 100px dari edge | Hold to move left |
| `btn_right` | Kanan dari btn_left, 90px gap | Hold to move right |
| `btn_jump` | Kanan bawah, kanan dari attack | Tap to jump |
| `btnattack` | Kanan bawah, paling kanan | Tap to attack |
| `btnswitchbatu/api/air` | Kiri bawah row 2, baris di atas left/right | Switch mode |
| `btnlogosetting` (pause) | Kanan atas | Open pause menu |
| `btnonmusic` | Top-right corner | Toggle music |

Per-mode visual: tombol left/right/jump/attack berubah animasi sesuai `player.mode`. Ada folder `btnleftblop`, `btnleftflamy`, `btnleftfoamy` dst.

---

## 16. DAFTAR ASSET & MAPPING KE CODE

### Konvensi Loading Asset di Phaser

Semua asset di-load di `PreloadScene.ts`. Pakai naming convention:

- **Sprite single**: `key = '<kategori>_<nama>'` → `this.load.image('coin', 'assets/items/coin.png')`
- **Sprite multi-frame**: `this.load.image()` per frame, lalu `this.anims.create({ frames: [...] })`
- **Audio**: `key = '<jenis>_<nama>'` → `this.load.audio('bgm_home', 'assets/audio/bgmhome.ogg')`

### Mapping Lengkap

#### Player (12 animasi)

| Phaser key | Source folder | Frame count | Notes |
|------------|---------------|:-----------:|-------|
| `player_blop_idle` | `player/blop_idle/` | 3 | loop |
| `player_blop_run` | `player/blop_run/` | 5 | loop |
| `player_blop_jump` | `player/blop_jump/` | 3 | no-loop |
| `player_blop_attack` | `player/blop_attack/` | 6 | no-loop |
| `player_fire_idle` | `player/fire_idle/` | 6 | loop |
| `player_fire_run` | `player/fire_run/` | 6 | loop |
| `player_fire_jump` | `player/fire_jump/` | 4 | no-loop |
| `player_fire_attack` | `player/fire_attack/` | 6 | no-loop |
| `player_water_idle` | `player/water_idle/` | 6 | loop |
| `player_water_run` | `player/water_run/` | 6 | loop |
| `player_water_jump` | `player/water_jump/` | 6 | no-loop |
| `player_water_attack` | `player/water_attack/` | 6 | no-loop |

#### Boss (6 animasi)

| Phaser key | Source folder | Frame count |
|------------|---------------|:-----------:|
| `boss_batu_run` | `bos/bos_batu/ebatu_run/` | 6 |
| `boss_batu_attack` | `bos/bos_batu/ebatu_attack/` | 6 |
| `boss_api_run` | `bos/bos_api/eapi_run/` | 7 |
| `boss_api_attack` | `bos/bos_api/eapi_attack/` | 6 |
| `boss_es_run` | `bos/bos_es/eair_run/` | 6 |
| `boss_es_attack` | `bos/bos_es/eair_attack/` | 6 |

#### Telur (6 animasi)

| Phaser key | Source folder | Frame count |
|------------|---------------|:-----------:|
| `egg_batu_idle` | `items/telur/telurbatu/` | 1 |
| `egg_batu_crack` | `items/telur/telurbatupecah/` | 6 |
| `egg_api_idle` | `items/telur/telurapi/` | 1 |
| `egg_api_crack` | `items/telur/telurapipecah/` | 6 |
| `egg_es_idle` | `items/telur/telures/` | 1 |
| `egg_es_crack` | `items/telur/telurespecah/` | 5 |

#### Items / Collectibles

| Phaser key | Source file |
|------------|-------------|
| `item_coin` | `items/coin.png` |
| `item_firestone` | `items/firestone.png` |
| `item_waterstone` | `items/waterstone.png` |
| `item_batukristal` | `items/batukristal.png` |
| `item_xp` | `items/hp.png` |

#### Trap (Jebakan)

| Phaser key | Source folder | Frame count |
|------------|---------------|:-----------:|
| `trap_jeb1_off` | `jebakan/jebakan1/off/` | 1 |
| `trap_jeb1_on` | `jebakan/jebakan1/on/` | 5 |
| `trap_jeb2_off` | `jebakan/jebakan2/off/` | 1 |
| `trap_jeb2_on` | `jebakan/jebakan2/on/` | 5 |
| `trap_jeb3_off` | `jebakan/jebakan3/off/` | 1 |
| `trap_jeb3_on` | `jebakan/jebakan3/on/` | 5 |

#### Background

| Phaser key | Source file |
|------------|-------------|
| `bg_home` | `bg/bghome.png` |
| `bg_level1` | `bg/bglevel1.png` |
| `bg_level2` | `bg/bglevel2.png` |
| `bg_level3` | `bg/bglevel3.png` |
| `bg_hlmlevel` | `bg/bghlmlevel.png` |
| `bg_alurcerita` | `bg/alurcerita.png` |
| `bg_alurgame` | `bg/alurgame.png` |
| `bg_partikel` | `bg/bgpartikel.png` |
| `bg_tentanggame` | `bg/tentanggame.png` |

#### UI / Buttons

| Phaser key | Source file |
|------------|-------------|
| `logo_game` | `ui/logogame.png` |
| `header_musik` | `ui/header_musik.png` (header dekoratif untuk SettingScene)|
| `btn_mulai` | `btnmobile/btnmulaibermain.png` |
| `btn_next` | `btnmobile/btnnext.png` |
| `btn_reset` | `btnmobile/btnreset.png` |
| `btn_nav_home` | `btnmobile/navbar/btnhome.png` |
| `btn_nav_about` | `btnmobile/navbar/btnabout.png` |
| `btn_nav_level` | `btnmobile/navbar/btnlevel.png` |
| `btn_nav_setting` | `btnmobile/navbar/btnsetting.png` |
| `btn_ig_home` | `btnmobile/btningame/btnlogohome.png` |
| `btn_ig_restart` | `btnmobile/btningame/btnlogorestart.png` |
| `btn_ig_setting` | `btnmobile/btningame/btnlogosetting.png` |
| `btn_ig_X` | `btnmobile/btningame/btnlogoX.png` |
| `btn_ig_menu` | `btnmobile/btningame/btnmenu.png` |
| `btn_ig_resume` | `btnmobile/btningame/btnresume.png` |
| `btn_music_on` | `btnmobile/btnonmusic/on/000.png` |
| `btn_music_off` | `btnmobile/btnonmusic/off/000.png` |
| `btn_switch_batu` | `btnmobile/btnswitch/btnswitchbatu.png` |
| `btn_switch_api` | `btnmobile/btnswitch/btnswitchapi.png` |
| `btn_switch_air` | `btnmobile/btnswitch/btnswitchair.png` |
| `btn_left_blop` | `btnmobile/btn_left/btnleftblop/000.png` |
| `btn_left_flamy` | `btnmobile/btn_left/btnleftflamy/000.png` |
| `btn_left_foamy` | `btnmobile/btn_left/btnleftfoamy/000.png` |
| (analog: btn_right_*, btn_jump_*, btn_attack_*) | | |
| `cp_off` | `cp/off/000.png` |
| `cp_on` | `cp/on/000.png` |
| `level1_icon` | `iconlevel/iconlevel1.png` |
| `level2_kebuka` | `iconlevel/level2kebuka.png` |
| `level2_kekunci` | `iconlevel/level2kekunci.png` |
| `level3_kebuka` | `iconlevel/level3kebuka.png` |
| `level3_kekunci` | `iconlevel/level3kekunci.png` |

#### Audio

| Phaser key | Source file |
|------------|-------------|
| `bgm_home` | `audio/bgmhome.ogg` |
| `bgm_level1` | `audio/bgmlevel1.ogg` |
| `bgm_level2` | `audio/bgmlevel2.ogg` |
| `bgm_level3` | `audio/bgmlevel3.ogg` |
| `sfx_jump` | `audio/sfx_jump.ogg` |
| `sfx_coin` | `audio/sfx_coin.ogg` |
| `sfx_death` | `audio/sfx_death.ogg` |
| `sfx_victory` | `audio/sfx_victory.ogg` |

### Asset Yang DIBUAT VIA CODE (no PNG)

Untuk menjaga performance & estetika konsisten, beberapa asset di-render via Phaser `Graphics`:

| Asset | Cara render |
|-------|-------------|
| **HUD frame** | Rectangle dengan border emas + gradient via Graphics |
| **HP bar player** | Rectangle gradient dynamic width |
| **Boss HP bar** | Rectangle gradient + animasi shake saat hit |
| **Star rating** | SVG-style polygon via Graphics + tween scale |
| **Particle effects** | Phaser ParticleEmitter (built-in) |
| **Trap "garis"** | Invisible Zone (collider only) |
| **Tile platform default** | Procedural Graphics dengan pattern |
| **Lava effect** | Animated gradient + ParticleEmitter (bubble) |
| **Zona api/air overlay** | Rectangle dengan tint + shader-like fade |
| **Notif popup** | Rectangle + text dengan tween |
| **Loading bar** | Rectangle progress |

---

## 17. VARIABEL GLOBAL & STATE

### Game State (in-memory, lokasi: `src/game/state/GameState.ts`)

```ts
export interface GameState {
  // Progress
  level1_complete: boolean;
  level2_complete: boolean;
  level3_complete: boolean;
  level1_stones_collected: number;
  level2_stones_collected: number;
  level3_stones_collected: number;
  level1_best_stars: number; // 0-3
  level2_best_stars: number;
  level3_best_stars: number;
  level1_best_coin: number;
  level2_best_coin: number;
  level3_best_coin: number;

  // Unlocks
  fire_unlocked: boolean;
  water_unlocked: boolean;

  // Settings
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number; // 0-1
  sfxVolume: number; // 0-1

  // Current level (transient, reset tiap level)
  currentLevelId: 1 | 2 | 3 | null;
  player_hp: number;
  skor_koin: number;
  batu_terkumpul: number;
  checkpoint_x: number;
  checkpoint_y: number;
  batu_di_checkpoint: number;
  koin_di_checkpoint: number;
  hp_di_checkpoint: number;
  boss_hp: number;
  boss_alive: boolean;
  telur_hp: number;
  is_attacking: boolean;
  bintang_finish: number;
  bintang_coin: number;
  bintang_batu: number;
}
```

### Default State (initial values)

```ts
export const DEFAULT_STATE: GameState = {
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
  musicEnabled: true,
  sfxEnabled: true,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  currentLevelId: null,
  player_hp: 100,
  skor_koin: 0,
  batu_terkumpul: 0,
  checkpoint_x: 100,
  checkpoint_y: 500,
  batu_di_checkpoint: 0,
  koin_di_checkpoint: 0,
  hp_di_checkpoint: 100,
  boss_hp: 0,
  boss_alive: true,
  telur_hp: 0,
  is_attacking: false,
  bintang_finish: 0,
  bintang_coin: 0,
  bintang_batu: 0,
};
```

### Yang dipersistensi ke localStorage

Hanya field "Progress" + "Unlocks" + "Settings" yang disave ke localStorage. Field "Current level (transient)" tidak persist (hilang saat tutup game adalah expected).

---

## 18. SAVE SYSTEM (LOCALSTORAGE)

### Key

`flamy-foamy-save-v1` (versioning di key supaya kalau ubah schema, gak crash karena old save)

### Implementasi

File `src/game/state/SaveManager.ts`:

```ts
const SAVE_KEY = 'flamy-foamy-save-v1';

export function saveProgress(state: Partial<GameState>): void {
  const persistFields: (keyof GameState)[] = [
    'level1_complete', 'level2_complete', 'level3_complete',
    'level1_stones_collected', 'level2_stones_collected', 'level3_stones_collected',
    'level1_best_stars', 'level2_best_stars', 'level3_best_stars',
    'level1_best_coin', 'level2_best_coin', 'level3_best_coin',
    'fire_unlocked', 'water_unlocked',
    'musicEnabled', 'sfxEnabled', 'musicVolume', 'sfxVolume',
  ];

  const existing = loadProgress();
  const merged = { ...existing, ...state };
  const subset: Record<string, unknown> = {};
  for (const k of persistFields) {
    if (k in merged) subset[k] = (merged as Record<string, unknown>)[k];
  }

  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(subset));
  } catch (err) {
    console.warn('Save failed:', err);
  }
}

export function loadProgress(): Partial<GameState> {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function resetProgress(): void {
  localStorage.removeItem(SAVE_KEY);
}
```

### Trigger Save

| Event | Field yang di-save |
|-------|-------------------|
| Player selesaikan level | level<N>_complete, level<N>_stones, level<N>_best_stars, level<N>_best_coin, fire_unlocked / water_unlocked |
| Player ubah setting musik/sfx | musicEnabled, sfxEnabled, musicVolume, sfxVolume |
| Tombol "Reset Progress" di setting | resetProgress() |

Save otomatis di-load saat `BootScene.create()` → state engine init dengan merge default + load.

---

## 19. BUILD & DEPLOY KE ANDROID (APK)

### Pre-requisite di mesin developer

1. **Java JDK 17** atau lebih baru (download: https://adoptium.net/)
2. **Android Studio** (download: https://developer.android.com/studio)
3. Set environment variable `JAVA_HOME` ke folder JDK
4. Buka Android Studio → SDK Manager → install:
   - Android SDK Platform 34 (Android 14)
   - Android SDK Build-Tools (latest)
   - Android Emulator (kalau mau test di emulator)

### Step Capacitor Setup (sekali doang)

```powershell
cd e:\kuliah\game\flamy-foamy

# Install Capacitor packages
npm install @capacitor/core @capacitor/cli @capacitor/android

# Init Capacitor (sekali, generate capacitor.config.ts)
npx cap init "Flamy & Foamy" "com.tugas.flamyfoamy" --web-dir=dist

# Build production
npm run build

# Add Android platform
npx cap add android

# Sync (copy dist/ ke android/app/src/main/assets/public)
npx cap sync android
```

### Workflow Update Code → APK

Setiap kali code diubah:

```powershell
npm run build         # bundle ulang ke dist/
npx cap sync android  # sync dist ke android project
```

### Build APK Final

**Cara 1 — Lewat Android Studio (visual, untuk debug + release):**
```powershell
npx cap open android
```
Akan buka Android Studio. Di sana:
- Build → Build Bundle(s) / APK(s) → Build APK(s)
- File output di `android/app/build/outputs/apk/debug/app-debug.apk`

**Cara 2 — Lewat command line (gradle):**
```powershell
cd android
.\gradlew assembleDebug   # build debug APK
.\gradlew assembleRelease # build release APK (perlu signing)
```

### Settings yang harus diatur di `android/app/src/main/AndroidManifest.xml`

- Orientation: `android:screenOrientation="sensorLandscape"`
- Theme: dark / fullscreen tanpa status bar (immersive)
- App icon: replace `android/app/src/main/res/mipmap-*/ic_launcher.png` dengan icon dari `sound dan music/icon-*.png`

### Tips & Catatan

- **Asset audio `.ogg`** umumnya works di Android WebView. Kalau `.webm` (selesai.webm) ada masalah, fallback ke `.mp4`.
- **localStorage** persistent di Android WebView (Capacitor menyimpan ke internal storage).
- Untuk **performance optimal**: di Phaser config set `pixelArt: false`, `antialias: true` (sprite hand-drawn lebih bagus).
- Untuk **APK size optimal**: jalankan `npm run build` dengan `--minify`. Asset PNG bisa di-compress pake `tinypng` (manual, sebelum copy ke `public/assets/`).

---

## 20. ROADMAP PENGERJAAN (STEP-BY-STEP)

> Workflow waterfall: satu step selesai dan ke-test, baru lanjut step berikutnya.

| # | Step | Status | Deliverable |
|---|------|:------:|-------------|
| 1 | Scaffold Vite + React + TypeScript + Phaser | ✅ DONE | `flamy-foamy/` ter-bootstrap |
| 2 | npm install | ✅ DONE | `node_modules/` lengkap |
| 3 | Copy asset ke `public/assets/` | ⏳ | Script `copy-assets.mjs` + folder `public/assets` |
| 4 | BootScene + PreloadScene + loading bar | ⏳ | Loading screen dengan progress bar |
| 5 | HomeScene (menu utama) | ⏳ | Layout menu + bgm home + tombol nav |
| 6 | LevelSelectScene | ⏳ | Pilih level dengan icon kebuka/kekunci |
| 7 | SettingScene + AboutScene + CaraBermainScene | ⏳ | Halaman support |
| 8 | Player class + animasi + kontrol keyboard | ⏳ | Player gerak + animasi 12 ke-trigger |
| 9 | HUDScene | ⏳ | HP bar, coin counter, stone counter, mode switcher |
| 10 | Touch controls (mobile) | ⏳ | Tombol mobile per mode aktif di touch device |
| 11 | Level1Scene — Area 1A (tutorial) | ⏳ | Player walk → coin → stone → checkpoint |
| 12 | Trap system (duri + jebakan + garis) | ⏳ | Death + respawn ke checkpoint |
| 13 | Level1Scene — Area 1B, 1C, 1D | ⏳ | Full level 1 panjang |
| 14 | Boss class + Boss Batu fight | ⏳ | Boss AI + HP bar + damage system |
| 15 | Telur system | ⏳ | Telur muncul setelah boss mati, attack 5x → pecah |
| 16 | Finish portal + HasilScene | ⏳ | Bintang rating + next/replay/menu |
| 17 | SaveManager + load progress | ⏳ | Progress persist di localStorage |
| 18 | Pause system + PauseScene | ⏳ | Pause game + resume + restart |
| 19 | Audio system (BGM + SFX + toggle) | ⏳ | Musik per scene + SFX trigger |
| 20 | Level2Scene (full, dengan Flamy mode) | ⏳ | Level 2 + boss api + telur api |
| 21 | Level3Scene (full, dengan Foamy mode) | ⏳ | Level 3 + boss es + telur es |
| 22 | SelesaiScene + cutscene end | ⏳ | Video selesai.webm + kredit |
| 23 | Polish: particle, screen shake, juicing | ⏳ | Game lebih cinematic |
| 24 | Setup Capacitor + add Android platform | ⏳ | `android/` folder ada |
| 25 | Build APK debug + test di emulator/HP | ⏳ | APK installable |
| 26 | App icon, splash, signing release APK | ⏳ | APK release siap submit |

---

## 21. STATUS PENGERJAAN SAAT INI

**Per terakhir update:** Step 1-2 (scaffold + install) **DONE**.

**Verifikasi:**
- ✅ `flamy-foamy/package.json` ada dengan dependencies sesuai
- ✅ `node_modules/phaser/dist/phaser.min.js` ada (sekitar 1.4 MB)
- ✅ `node_modules/.package-lock.json` ada (marker install komplit)
- ✅ `flamy-foamy/src/main.tsx`, `App.tsx`, `game/index.ts`, `game/config.ts`, `game/scenes/BootScene.ts` ada (skeleton awal)
- ✅ `flamy-foamy/index.html`, `vite.config.ts`, `tsconfig.json` ada

**Berikutnya:** Step 3 — copy asset ke `public/assets/`.

---

## 22. KONVENSI CODE & BEST PRACTICE

### File Naming

- React component: `PascalCase.tsx` (`App.tsx`)
- Phaser scene: `PascalCase.ts` (`HomeScene.ts`)
- Util: `camelCase.ts` (`loadAssets.ts`)
- CSS: `kebab-case.css` (`global.css`, `hud.css`)
- Asset folder: lowercase (sesuai existing)

### Phaser Class Naming

- Scene: `<Name>Scene` (`HomeScene`, `Level1Scene`)
- Entity / sprite: `<Name>` (`Player`, `Boss`, `Coin`, `Egg`)
- Utility / system: `<Name>System` atau `<Name>Manager` (`AudioManager`, `SaveManager`)

### Scene Pattern Standard

```ts
import Phaser from 'phaser';

export class MyScene extends Phaser.Scene {
  // declared properties
  private player!: Player;

  constructor() {
    super({ key: 'MyScene' });
  }

  init(data: { from: string }) {
    // optional - data dari scene sebelumnya
  }

  preload() {
    // skip kalau asset di-load di PreloadScene
  }

  create() {
    // setup objects, fisika, input
  }

  update(_time: number, _delta: number) {
    // game loop, jaga ringan
  }
}
```

### TypeScript Strict

`tsconfig.json` aktifkan `strict: true`. Hindari `any`. Pakai interface yang jelas, terutama untuk save state, level data, animation config.

### Single-Responsibility per File

- 1 file = 1 class atau 1 responsibility
- Pisah `Player.ts`, `PlayerController.ts`, `PlayerAnimator.ts` kalau Player file >300 LOC

### Asset Reference

- Gunakan **konstanta key** dari `src/game/config.ts` daripada hardcoded string
- Contoh: `this.add.sprite(0, 0, KEYS.PLAYER_BLOP_IDLE)` daripada `this.add.sprite(0, 0, 'player_blop_idle')`

### Performance

- Pakai `setActive(false).setVisible(false)` untuk objek off-screen, jangan `destroy()` kalau bakal dipakai lagi
- Jangan create animation di `create()` per scene — bikin sekali di `PreloadScene` doang
- Limit physics object aktif (object pool kalau perlu)

### Git (kalau ada repo)

- `.gitignore` udah include `node_modules`, `dist`, `android/.gradle`, `android/app/build`
- Commit per step roadmap (commit message: `feat: [step-N] <description>`)

---

## 23. TROUBLESHOOTING & FAQ

### Q: npm install lama banget / nyangkut

**A:** Network ke npm registry mungkin lambat. Solusi:
1. Coba pakai mirror npm (registry.npmmirror.com) sementara
2. Atau pakai `pnpm` / `yarn`
3. Pastikan tidak ada antivirus yang lock folder `node_modules`

### Q: TypeScript error "Cannot find module 'phaser'"

**A:** Install phaser belum komplit. Verify dengan:
```powershell
Test-Path node_modules\phaser\dist\phaser.min.js
```
Kalau `False`, jalankan `npm install phaser --save` ulang.

### Q: Phaser canvas blank / hitam

**A:** Cek browser console:
- 404 error? → asset gak ke-load (check `public/assets/`)
- "this.scale undefined"? → scene belum di-add ke game config
- Resolution problem? → pastikan `Phaser.Scale.FIT` di config

### Q: Animation player gak jalan

**A:** Kemungkinan:
1. Frame PNG tidak ke-load di PreloadScene
2. Animation key beda dengan yang dipanggil di `play()`
3. `frames` array di `anims.create` salah index

### Q: Touch button tidak respond di mobile

**A:**
- Pakai `pointerdown` / `pointerup` event, bukan `pointerover`
- Set `setInteractive({ useHandCursor: true })`
- Cek tidak ada CSS `pointer-events: none` di parent

### Q: localStorage tidak save di Android WebView

**A:**
- Capacitor by default sudah aktifkan localStorage
- Kalau gak persist: cek `android/app/src/main/AndroidManifest.xml` ada `android:dataExtractionRules` dan permission storage

### Q: APK install di HP tapi crash saat buka

**A:**
- Cek `chrome://inspect` (Chrome DevTools dengan HP USB-debug) untuk error JS
- Pastikan semua asset path pakai relatif (`./assets/...`), bukan absolute (`/assets/...`)
- `vite.config.ts` set `base: './'` (sudah ada)

### Q: Cara test mobile tanpa HP fisik?

**A:** Pakai Chrome DevTools Mobile Emulation (F12 → toggle device toolbar → pilih iPhone/Android), atau Android Studio AVD emulator.

### Q: Game lag di HP low-end

**A:**
- Reduce resolusi internal: ubah `GAME_WIDTH=960`, `GAME_HEIGHT=540`
- Disable parallax background di setting
- Limit max particle count

---

## 📞 KONTAK & MAINTENANCE

**Project:** Flamy & Foamy  
**Stack:** React + Phaser 3 + TypeScript + Vite + Capacitor  
**Repository:** `https://github.com/zeen-lien/flamy-foamy`  
**Project root:** `C:\laragon\www\flamy-foamy\`

### Workflow Edit Project

1. **User (lo):**
   - Tambah/edit asset PNG di folder workspace (`bg/`, `bos/`, `player/`, dll.)
   - Jalanin `npm run copy-assets` (atau gw bikin watcher otomatis nanti)
   - Test di browser dengan `npm run dev`

2. **AI Agent (Kiro / Antigravity / etc.):**
   - Implementasi scene, entity, system sesuai roadmap
   - Tambah event listener, animation, fisika
   - Testing build + APK

3. **Test cycle:**
   - Edit code → save → Vite hot-reload → cek di browser
   - Kalau OK → commit → next step roadmap

---

## 🎯 KESIMPULAN

Project **Flamy & Foamy** adalah game platformer 2D yang dibangun ulang dari nol menggunakan asset yang sudah ada, dengan tech stack modern (React + Phaser 3 + TypeScript + Capacitor) yang memungkinkan deploy ke web maupun Android APK.

**Karakteristik game:**
- ✨ 3 level dengan tema elemen berbeda (Batu, Api, Air)
- ✨ Mode switching mechanic (Blop/Flamy/Foamy) dengan kemampuan unik
- ✨ Boss fight dengan AI chase + attack pattern + 2-fase saat HP rendah
- ✨ Telur tersembunyi dengan progressi animasi pecah
- ✨ Sistem checkpoint, HP/XP, coin, stone, bintang rating
- ✨ Save progress ke localStorage
- ✨ Touch controls untuk mobile + keyboard untuk desktop
- ✨ Audio system lengkap (4 BGM + 4 SFX + end video)
- ✨ Level desain panjang & menantang sesuai requirement dosen

Project siap dilanjutkan dari **Step 3 (copy asset ke `public/assets/`)** sesuai roadmap di [section 20](#20-roadmap-pengerjaan-step-by-step).

---

**Tanggal Update Laporan:** 30 Mei 2026  
**Versi Dokumen:** 2.2.0 (project flatten + relocated to C:\laragon\www\)  
**Status Project:** 🟡 Step 1-2 Selesai · Step 3-26 Pending  
