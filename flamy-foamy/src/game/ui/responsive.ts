// Responsive scaling helper.
// Reference resolution: 1280x720 (laptop modern). Setiap UI bisa pakai
// `getUiScale(scene)` buat dapet faktor skala yang disesuaikan ukuran viewport.
//
// Mobile (kecil)    -> faktor 0.55..0.75 (UI mengecil supaya gak penuh layar)
// Tablet           -> faktor 0.85..1.0
// Laptop standar   -> faktor 1.0
// Desktop besar    -> faktor 1.1..1.35 (UI dibesarkan supaya gak terlalu kosong)

import Phaser from 'phaser';

const REF_W = 1280;
const REF_H = 720;
const MIN_SCALE = 0.55;
const MAX_SCALE = 1.35;

export function getUiScale(scene: Phaser.Scene): number {
  const w = scene.scale.gameSize.width;
  const h = scene.scale.gameSize.height;
  // Pakai min biar UI gak overflow saat aspect ratio extreme
  const raw = Math.min(w / REF_W, h / REF_H);
  return Phaser.Math.Clamp(raw, MIN_SCALE, MAX_SCALE);
}

export function isPortrait(scene: Phaser.Scene): boolean {
  return scene.scale.gameSize.height > scene.scale.gameSize.width;
}

export function isMobile(scene: Phaser.Scene): boolean {
  return scene.scale.gameSize.width < 700;
}

/** Multiply a base size by current UI scale. */
export function rs(scene: Phaser.Scene, baseSize: number): number {
  return baseSize * getUiScale(scene);
}

/** Format px string yang sudah di-scale. */
export function rsPx(scene: Phaser.Scene, baseSize: number): string {
  return `${Math.round(baseSize * getUiScale(scene))}px`;
}
