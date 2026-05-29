# 🤖 CONTINUE HERE — Handoff untuk AI Agent

> **Halo AI agent (Antigravity / Cursor / Copilot / Claude / Kiro / dst). Lo dipanggil buat lanjutin development project ini. JANGAN scaffolding ulang. JANGAN install ulang `node_modules`. JANGAN tanya ulang setup. Baca dokumen ini full + `LAPORAN_GAME_LENGKAP.md`, lalu lanjut dari Step 3 di roadmap.**

---

## ⚡ TL;DR (10 detik)

| Item | Status |
|------|--------|
| **Project** | Flamy & Foamy — game platformer 2D, tugas kuliah |
| **Stack** | React + Phaser 3 + TypeScript + Vite + Capacitor (untuk APK Android) |
| **Lokasi** | `C:\laragon\www\flamy-foamy\` |
| **GitHub** | `https://github.com/zeen-lien/flamy-foamy` |
| **User** | Mahasiswa, komunikasi pakai Bahasa Indonesia casual |
| **Goal** | Dosen minta game seru, panjang, sulit menengah-tinggi, anti-bosen |
| **Step Selesai** | 1-2 (scaffold + npm install) |
| **Step Berikutnya** | 3 (BootScene + PreloadScene proper) |

---

## 📚 BACA DULU (Wajib)

1. **`LAPORAN_GAME_LENGKAP.md`** — single source of truth project (1500+ baris, lengkap)
2. **`README.md`** — overview ringkas
3. File ini (CONTINUE_HERE.md)

Tanpa baca 3 file di atas, jangan tulis code apapun.

---

## 🛠 KONTEKS TEKNIS

### Lokasi & Setup

```
C:\laragon\www\flamy-foamy\
├── LAPORAN_GAME_LENGKAP.md     ← Spec lengkap (read this!)
├── README.md
├── CONTINUE_HERE.md             ← File ini
├── package.json                 ← Phaser 3.80.1, React 18, Vite 5, TS 5.6
├── tsconfig.json                ← strict mode aktif
├── vite.config.ts
├── index.html
├── .gitignore
├── node_modules/                ← Sudah ke-install (jangan reinstall)
├── public/
│   └── assets/                  ← Semua PNG + audio sudah di sini
│       ├── bg/                  ← Background level
│       ├── bos/                 ← Boss sprites (bos_batu, bos_api, bos_es)
│       ├── btnmobile/           ← Tombol mobile (per mode)
│       ├── cp/                  ← Checkpoint
│       ├── iconlevel/           ← Icon level select
│       ├── items/               ← Coin, stone, XP, telur
│       ├── jebakan/             ← Trap (jebakan1/2/3)
│       ├── player/              ← 12 animasi (3 mode × 4 action)
│       ├── audio/               ← BGM + SFX + selesai.webm + app icons
│       └── ui/                  ← logogame.png, header_musik.png
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── styles/global.css
    └── game/
        ├── index.ts             ← createGame()
        ├── config.ts            ← GAME_WIDTH, GAME_HEIGHT, GAMEPLAY constants
        └── scenes/
            └── BootScene.ts     ← Placeholder boot scene (perlu di-improve di Step 3-4)
```

### Cara Run

```powershell
cd C:\laragon\www\flamy-foamy
npm run dev          # development, http://localhost:5173
npm run build        # production build ke dist/
```

### Aturan Coding

- TypeScript **strict mode** — jangan pakai `any`
- Phaser scene class naming: `<Name>Scene`
- File naming: PascalCase untuk class, camelCase untuk util
- Asset path di code: `'/assets/...'` (Vite serve dari `public/`)
- Jangan modifikasi PNG asli — resize via `setDisplaySize()` di Phaser
- Resolusi internal: 1280×720 (FIT scale)
- Save progress: `localStorage` key `flamy-foamy-save-v1`

---

## 🗺️ ROADMAP (26 Step Total)

### ✅ DONE
1. **Step 1** — Scaffold Vite + React + TS + Phaser
2. **Step 2** — npm install (sudah lengkap)

### ⏳ NEXT (mulai dari sini)
3. **Step 3** — Bikin proper `BootScene` + `PreloadScene` dengan loading bar
4. **Step 4** — `HomeScene` (menu utama: Mulai, Level Select, Setting, About)
5. **Step 5** — `LevelSelectScene` (pilih level dengan icon kebuka/kekunci)
6. **Step 6** — `SettingScene`, `AboutScene`, `CaraBermainScene`
7. **Step 7** — `Player` class + animasi + kontrol keyboard
8. **Step 8** — `HUDScene` (HP bar, coin, stone, mode switcher)
9. **Step 9** — Touch controls untuk mobile
10. **Step 10** — `Level1Scene` Area 1A (tutorial)
11. **Step 11** — Trap system (duri + jebakan + garis)
12. **Step 12** — `Level1Scene` Area 1B, 1C, 1D (full level)
13. **Step 13** — `Boss` class + Boss Batu fight
14. **Step 14** — Telur system
15. **Step 15** — Finish portal + `HasilScene`
16. **Step 16** — `SaveManager` (localStorage)
17. **Step 17** — Pause system + `PauseScene`
18. **Step 18** — Audio system (BGM + SFX + toggle)
19. **Step 19** — `Level2Scene` (full, dengan Flamy)
20. **Step 20** — `Level3Scene` (full, dengan Foamy)
21. **Step 21** — `SelesaiScene` + cutscene end
22. **Step 22** — Polish: particle, screen shake, juicing
23. **Step 23** — Setup Capacitor + add Android platform
24. **Step 24** — Build APK debug + test
25. **Step 25** — App icon, splash, signing release APK
26. **Step 26** — Final QA + GitHub release

Detail tiap step ada di `LAPORAN_GAME_LENGKAP.md` section 20.

---

## 🎨 DESIGN PRIORITAS DARI USER (DOSEN REQUIREMENT)

1. **Seru** — bikin player mau lanjut main, bukan boring
2. **Panjang** — tiap level ~10-15 menit (3-4 area dengan mekanik beda)
3. **Sulit menengah-tinggi** — bukan game anak kecil, butuh skill
4. **Penasaran** — narasi yang bikin "habis ini ada gebrakan apa lagi"
5. **Anti-bosen** — variasi mekanik per area, jangan repetitif

Lihat detail level design di `LAPORAN_GAME_LENGKAP.md` section 9.

---

## 🌐 GIT STATUS

- Repo GitHub sudah dibuat: `https://github.com/zeen-lien/flamy-foamy`
- Repo masih **kosong** (belum push). User butuh AI bantu push first commit.
- `git init` sudah pernah dilakukan di lokasi lama, tapi belum sukses commit
- Setelah project pindah ke `C:\laragon\www\flamy-foamy\`, perlu `git init` ulang dari sini
- User config:
  - name: `Zaini Leon`
  - email: `zainileon733@gmail.com`

### Command yang perlu dijalankan untuk first push:

```powershell
cd C:\laragon\www\flamy-foamy
git init -b main
git add -A
git commit -m "feat: initial scaffold with React + Phaser + TypeScript"
git remote add origin https://github.com/zeen-lien/flamy-foamy.git
git push -u origin main
```

---

## ⚠️ PITFALLS YANG SUDAH DI-AVOID

1. **Folder spasi** — `sound dan music/` sudah di-rename jadi `audio/`
2. **Asset di luar project** — sudah di-flatten ke `public/assets/` (sebelumnya tersebar di workspace root)
3. **Drive lambat** — sudah pindah dari E: (flashdisk/HDD) ke C: (SSD)
4. **TypeScript missing types** — tsconfig sudah strict + skipLibCheck
5. **Vite asset path** — sudah set `base: './'` (untuk APK relative path)

---

## 💬 GAYA KOMUNIKASI

User prefer:
- Bahasa Indonesia casual ("brok", "lo", "gw", emoticon ringan)
- Step-by-step waterfall, bukan bulk shotgun
- Konfirmasi sebelum eksekusi langkah berisiko
- Penjelasan singkat, langsung ke aksi
- Update real status, jangan over-promise

---

## 🚦 ACTION YANG HARUS LO LAKUKAN SEKARANG

1. Konfirmasi ke user lo udah baca dokumen ini
2. Tanyain: "Mau gw lanjut dari Step 3 (BootScene + PreloadScene proper), atau push ke GitHub dulu?"
3. Tunggu jawaban user, baru eksekusi

**Jangan langsung jalan tanpa konfirmasi user — ini project tugas kuliah, dia mau kontrol penuh.**

---

**Versi handoff:** 1.0  
**Tanggal:** 30 Mei 2026  
**Update terakhir:** Project flatten + relocated ke C:\laragon\www\flamy-foamy\
