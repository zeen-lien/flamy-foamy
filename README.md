# 🎮 Flamy & Foamy

Game platformer 2D bertema petualangan elemen — dibangun dengan **React + Phaser 3 + TypeScript** dan dibungkus jadi **APK Android via Capacitor**.

> Plenger, makhluk lendir adaptif, harus menjelajahi 3 kerajaan elemen (Batu, Api, Air), mengalahkan boss penjaga, dan memecahkan telur misterius untuk mengungkap rahasia Elemental Realm.

## ✨ Fitur

- 🪨 **3 mode karakter**: Blop (batu), Flamy (api), Foamy (air) — masing-masing kebal terhadap zona elemen tertentu
- 🗺️ **3 level** dengan tema visual berbeda, masing-masing punya 3-4 area dengan mekanik bervariasi
- 👹 **3 boss fight** dengan AI chase + attack pattern + 2 fase (rage mode)
- 🥚 **Sistem telur tersembunyi** yang harus dipecahkan setelah boss kalah
- ⭐ **Bintang rating** per level (finish + coin + stone)
- 💾 **Save progress otomatis** ke `localStorage`
- 🎵 **Audio system** lengkap (4 BGM + 4 SFX + end video)
- 📱 **Touch controls** untuk mobile + keyboard untuk desktop
- 🤖 **APK Android** ready via Capacitor

## 🚀 Cara Jalan

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

## 📖 Dokumentasi Lengkap

Semua detail (arsitektur, asset mapping, sistem gameplay, roadmap, build APK) ada di **[`LAPORAN_GAME_LENGKAP.md`](./LAPORAN_GAME_LENGKAP.md)**.

Untuk lanjutkan development di chat AI baru, baca **[`CONTINUE_HERE.md`](./CONTINUE_HERE.md)** dulu.

## 🛠 Tech Stack

- **Phaser 3** — game engine 2D
- **React 18** — UI shell
- **TypeScript** — type safety
- **Vite** — build tool
- **Capacitor** — bridge ke Android APK

## 📁 Struktur

```
flamy-foamy/
├── LAPORAN_GAME_LENGKAP.md     ← Single source of truth (technical doc)
├── README.md                    ← This file
├── CONTINUE_HERE.md             ← Handoff prompt buat AI agent
├── public/assets/               ← Sprite, audio, UI
└── src/game/                    ← Source code Phaser scenes & systems
```

## 📜 Lisensi

Project tugas kuliah, non-komersial.
