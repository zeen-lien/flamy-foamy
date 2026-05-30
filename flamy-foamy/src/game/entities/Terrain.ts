import Phaser from 'phaser';

/**
 * TerrainBlock — render lantai/platform dengan karakter visual,
 * bukan sekadar rectangle warna. Procedural via Graphics, no PNG asset.
 *
 * Style preset:
 *  - 'rock'        : chunk batu irregular, top edge jagged, ada pebble/crack
 *  - 'mossy'       : sama dengan rock + lumut hijau di atas + bunga kecil
 *  - 'brick'       : pattern bata kuno + cracks + moss spot
 *  - 'crystal'     : batu + kristal kecil sticking up (warna sesuai elemen)
 *  - 'rubble'      : reruntuhan low-rise, banyak chunk overlap
 *
 * Setiap style punya color palette default tapi bisa di-override.
 */

export type TerrainStyle = 'rock' | 'mossy' | 'brick' | 'crystal' | 'rubble';

export interface TerrainBlockOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  width: number;
  height: number;
  style?: TerrainStyle;
  /** Crystal/accent color (hex). Default sesuai elemen level (cokelat batu). */
  accentColor?: number;
  /** Seed deterministik supaya bisa konsisten kalau perlu. */
  seed?: number;
}

const PALETTE = {
  rock: { base: 0x4a4054, dark: 0x2a2435, light: 0x6b6178, edge: 0x3a3344 },
  mossy: { base: 0x4a4054, dark: 0x2a2435, light: 0x6b6178, edge: 0x3a3344, moss: 0x6b8e3a, mossDark: 0x4a6628, flower: 0xfde68a },
  brick: { base: 0x6b5a48, dark: 0x4a3d30, light: 0x8c7558, edge: 0x4a3d30, mortar: 0x2e261d },
  crystal: { base: 0x4a4054, dark: 0x2a2435, light: 0x6b6178, edge: 0x3a3344 },
  rubble: { base: 0x554b5f, dark: 0x33293c, light: 0x7a6e88, edge: 0x3a3344 },
};

/** Simple seeded PRNG (mulberry32) supaya generation bisa deterministik. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class TerrainBlock extends Phaser.GameObjects.Container {
  private g: Phaser.GameObjects.Graphics;
  private wPx: number;
  private hPx: number;
  private style: TerrainStyle;
  private accent: number;
  private rng: () => number;

  constructor(opts: TerrainBlockOptions) {
    super(opts.scene, opts.x, opts.y);
    opts.scene.add.existing(this);

    this.wPx = opts.width;
    this.hPx = opts.height;
    this.style = opts.style ?? 'rock';
    this.accent = opts.accentColor ?? 0xb8a578;
    this.rng = makeRng(opts.seed ?? Math.floor(Math.random() * 2 ** 31));

    this.g = opts.scene.add.graphics();
    this.add(this.g);

    this.draw();
    // CATATAN: TerrainBlock = pure visual. Collision di-handle scene lewat
    // static zone terpisah (lihat scene buildPlatforms). Ini menghindari
    // masalah static body pada Container tanpa texture.
  }

  /** Re-randomize visual (kalau perlu refresh tampil). */
  reroll(seed?: number): void {
    if (typeof seed === 'number') this.rng = makeRng(seed);
    this.draw();
  }

  // ============================================================
  //                    DRAW DISPATCH
  // ============================================================

  private draw(): void {
    this.g.clear();

    switch (this.style) {
      case 'rock': this.drawRock(false); break;
      case 'mossy': this.drawRock(true); break;
      case 'brick': this.drawBrick(); break;
      case 'crystal': this.drawCrystal(); break;
      case 'rubble': this.drawRubble(); break;
    }
  }

  // Helper: bentuk top edge bergerigi (irregular jagged).
  // Return array titik horizontal dari kiri ke kanan.
  private jaggedTop(amplitude: number, segmentW: number): Array<{ x: number; y: number }> {
    const w = this.wPx;
    const top = -this.hPx / 2;
    const points: Array<{ x: number; y: number }> = [];
    let x = -w / 2;
    while (x <= w / 2) {
      const yOff = (this.rng() - 0.5) * amplitude * 2;
      points.push({ x, y: top + yOff });
      x += segmentW + this.rng() * segmentW * 0.4;
    }
    // Pastikan ujung kanan exact
    if (points[points.length - 1].x < w / 2 - 2) {
      points.push({ x: w / 2, y: top + (this.rng() - 0.5) * amplitude });
    } else {
      points[points.length - 1].x = w / 2;
    }
    return points;
  }

  // ============================================================
  //                    STYLE: ROCK / MOSSY
  // ============================================================

  private drawRock(withMoss: boolean): void {
    const w = this.wPx;
    const h = this.hPx;
    const p = withMoss ? PALETTE.mossy : PALETTE.rock;

    // Top edge bergerigi
    const ampl = Math.min(6, h * 0.15);
    const top = this.jaggedTop(ampl, 18);

    // Base body polygon = top jagged + bottom rectangle corners
    const bodyPts = [
      ...top,
      { x: w / 2, y: h / 2 },
      { x: -w / 2, y: h / 2 },
    ];

    // Drop shadow ringan
    this.g.fillStyle(0x000000, 0.3);
    this.g.fillPoints(bodyPts.map((pt) => ({ x: pt.x + 2, y: pt.y + 4 })), true);

    // Base fill
    this.g.fillStyle(p.base, 1);
    this.g.fillPoints(bodyPts, true);

    // Lapisan dark gradient bawah (illusion of depth)
    this.g.fillStyle(p.dark, 0.45);
    this.g.fillRect(-w / 2, h * 0.05, w, h * 0.45);

    // Cracks (3-5 garis vertikal acak)
    const crackCount = 2 + Math.floor(this.rng() * 3);
    this.g.lineStyle(1, p.dark, 0.7);
    for (let i = 0; i < crackCount; i++) {
      const cx = -w / 2 + this.rng() * w;
      const startY = -h / 2 + 4 + this.rng() * 6;
      let y = startY;
      this.g.beginPath();
      this.g.moveTo(cx, y);
      const steps = 3 + Math.floor(this.rng() * 3);
      for (let s = 0; s < steps; s++) {
        const dx = (this.rng() - 0.5) * 8;
        const dy = 6 + this.rng() * 8;
        this.g.lineTo(cx + dx, y + dy);
        y += dy;
        if (y > h / 2 - 4) break;
      }
      this.g.strokePath();
    }

    // Pebbles kecil (lingkaran terang scattered)
    const pebbleCount = Math.max(3, Math.floor(w / 60));
    for (let i = 0; i < pebbleCount; i++) {
      const px = -w / 2 + this.rng() * w;
      const py = -h / 2 + 8 + this.rng() * (h - 16);
      const r = 1 + this.rng() * 2;
      this.g.fillStyle(p.light, 0.6);
      this.g.fillCircle(px, py, r);
      this.g.fillStyle(p.dark, 0.5);
      this.g.fillCircle(px + 0.5, py + 0.5, r * 0.5);
    }

    // Top edge highlight (garis tipis di atas, ngikutin jagged)
    this.g.lineStyle(2, p.light, 0.7);
    this.g.beginPath();
    this.g.moveTo(top[0].x, top[0].y);
    for (let i = 1; i < top.length; i++) this.g.lineTo(top[i].x, top[i].y);
    this.g.strokePath();

    // Border outline
    this.g.lineStyle(1, p.edge, 0.9);
    this.g.strokePoints(bodyPts, true);

    // Moss layer (kalau mossy)
    if (withMoss) {
      this.drawMossLayer(top, p as typeof PALETTE.mossy);
    }
  }

  private drawMossLayer(top: Array<{ x: number; y: number }>, p: typeof PALETTE.mossy): void {
    // Lumut nempel di top edge — strip hijau dengan tepi bergerigi ke bawah
    const mossDepth = 6 + this.rng() * 4;
    const mossBottom: Array<{ x: number; y: number }> = [];
    for (const pt of top) {
      mossBottom.push({ x: pt.x, y: pt.y + mossDepth + (this.rng() - 0.5) * 3 });
    }
    const mossPts = [...top, ...mossBottom.reverse()];
    this.g.fillStyle(p.moss, 1);
    this.g.fillPoints(mossPts, true);
    // Shadow di bawah moss
    this.g.fillStyle(p.mossDark, 0.6);
    this.g.fillPoints(
      [
        ...mossBottom.slice().reverse().map((pt) => ({ x: pt.x, y: pt.y - 1 })),
        ...mossBottom.map((pt) => ({ x: pt.x, y: pt.y + 1 })),
      ],
      true,
    );

    // Bunga / sparkle kecil di moss (random)
    const flowerCount = Math.max(1, Math.floor(this.wPx / 120));
    for (let i = 0; i < flowerCount; i++) {
      if (this.rng() > 0.6) continue;
      const idx = Math.floor(this.rng() * top.length);
      const pt = top[idx];
      this.g.fillStyle(p.flower, 1);
      this.g.fillCircle(pt.x, pt.y - 2, 1.5);
      this.g.fillStyle(p.flower, 0.4);
      this.g.fillCircle(pt.x, pt.y - 2, 3);
    }
  }

  // ============================================================
  //                    STYLE: BRICK
  // ============================================================

  private drawBrick(): void {
    const w = this.wPx;
    const h = this.hPx;
    const p = PALETTE.brick;

    // Drop shadow
    this.g.fillStyle(0x000000, 0.3);
    this.g.fillRect(-w / 2 + 2, -h / 2 + 4, w, h);

    // Mortar (background gelap)
    this.g.fillStyle(p.mortar, 1);
    this.g.fillRect(-w / 2, -h / 2, w, h);

    // Brick rows
    const brickH = Math.min(18, h / Math.max(2, Math.floor(h / 18)));
    const rows = Math.max(1, Math.floor(h / brickH));
    const brickW = 36 + this.rng() * 16;

    for (let r = 0; r < rows; r++) {
      const y = -h / 2 + r * brickH + brickH / 2;
      const offset = (r % 2 === 0 ? 0 : brickW / 2) + (this.rng() - 0.5) * 4;
      let x = -w / 2 + offset - brickW;
      while (x < w / 2 + brickW) {
        const bw = brickW + (this.rng() - 0.5) * 6;
        const bh = brickH - 2;
        // Skip kalau di luar area
        if (x + bw > -w / 2 && x < w / 2) {
          // Brick body
          this.g.fillStyle(p.base, 1);
          this.g.fillRect(x + 1, y - bh / 2, bw - 2, bh);
          // Top highlight
          this.g.fillStyle(p.light, 0.45);
          this.g.fillRect(x + 1, y - bh / 2, bw - 2, 2);
          // Bottom shade
          this.g.fillStyle(p.dark, 0.45);
          this.g.fillRect(x + 1, y + bh / 2 - 2, bw - 2, 2);
          // Random crack
          if (this.rng() > 0.85) {
            this.g.lineStyle(1, p.dark, 0.7);
            this.g.lineBetween(x + bw * 0.3, y - bh / 2 + 1, x + bw * 0.7, y + bh / 2 - 1);
          }
        }
        x += bw;
      }
    }

    // Moss spots di top corners random
    if (this.rng() > 0.4) {
      const spotCount = 1 + Math.floor(this.rng() * 3);
      for (let i = 0; i < spotCount; i++) {
        const sx = -w / 2 + this.rng() * w;
        const sy = -h / 2 + 1;
        this.g.fillStyle(0x6b8e3a, 0.7);
        this.g.fillEllipse(sx, sy + 2, 16 + this.rng() * 12, 5);
        this.g.fillStyle(0x4a6628, 0.5);
        this.g.fillEllipse(sx, sy + 4, 14 + this.rng() * 10, 3);
      }
    }

    // Top highlight line
    this.g.lineStyle(1, p.light, 0.5);
    this.g.lineBetween(-w / 2, -h / 2, w / 2, -h / 2);

    // Outline
    this.g.lineStyle(1, p.dark, 0.9);
    this.g.strokeRect(-w / 2, -h / 2, w, h);
  }

  // ============================================================
  //                    STYLE: CRYSTAL
  // ============================================================

  private drawCrystal(): void {
    // Render rock dasar dulu, lalu spawn beberapa kristal di top
    this.drawRock(false);

    const w = this.wPx;
    const top = this.jaggedTop(0, 1);  // dummy untuk dapet top y rata-rata
    void top;
    const topY = -this.hPx / 2;

    // Spawn 2-4 kristal di atas
    const crystalCount = 2 + Math.floor(this.rng() * 3);
    for (let i = 0; i < crystalCount; i++) {
      const cx = -w / 2 + 20 + this.rng() * (w - 40);
      const cy = topY - 2;
      this.drawCrystalShard(cx, cy);
    }
  }

  private drawCrystalShard(cx: number, cy: number): void {
    // Bentuk kristal: triangle dengan facet
    const size = 6 + this.rng() * 8;
    const tilt = (this.rng() - 0.5) * 0.4;

    const top = { x: cx + tilt * size, y: cy - size * 1.6 };
    const right = { x: cx + size * 0.6, y: cy };
    const left = { x: cx - size * 0.6, y: cy };
    const mid = { x: cx + tilt * size * 0.4, y: cy - size * 0.7 };

    // Body warna accent
    this.g.fillStyle(this.accent, 0.85);
    this.g.fillPoints([top, right, left], true);

    // Facet kanan (lebih gelap)
    this.g.fillStyle(this.accent, 0.55);
    this.g.fillPoints([top, mid, right], true);

    // Facet kiri (lebih terang)
    this.g.fillStyle(0xffffff, 0.45);
    this.g.fillPoints([top, mid, left], true);

    // Outline
    this.g.lineStyle(1, this.accent, 1);
    this.g.strokePoints([top, right, left], true);
    this.g.lineStyle(0.5, this.accent, 0.7);
    this.g.lineBetween(top.x, top.y, mid.x, mid.y);
    this.g.lineBetween(mid.x, mid.y, right.x, right.y);
    this.g.lineBetween(mid.x, mid.y, left.x, left.y);

    // Glow halo (subtle)
    this.g.fillStyle(this.accent, 0.18);
    this.g.fillCircle(cx, cy - size * 0.5, size * 1.4);
  }

  // ============================================================
  //                    STYLE: RUBBLE
  // ============================================================

  private drawRubble(): void {
    const w = this.wPx;
    const h = this.hPx;
    const p = PALETTE.rubble;

    // Drop shadow
    this.g.fillStyle(0x000000, 0.3);
    this.g.fillRect(-w / 2 + 2, -h / 2 + 4, w, h);

    // Base body
    this.g.fillStyle(p.base, 1);
    this.g.fillRect(-w / 2, -h / 2, w, h);

    // Lapisan dark gradient bawah
    this.g.fillStyle(p.dark, 0.5);
    this.g.fillRect(-w / 2, h * 0.1, w, h * 0.4);

    // Banyak chunk batu di atas — overlapping polygon
    const chunkCount = Math.max(4, Math.floor(w / 40));
    for (let i = 0; i < chunkCount; i++) {
      const cx = -w / 2 + (i + 0.5) * (w / chunkCount) + (this.rng() - 0.5) * 12;
      const cy = -h / 2 + this.rng() * 4;
      const cw = 18 + this.rng() * 22;
      const chHeight = 8 + this.rng() * 12;

      // Chunk polygon irregular
      const pts = [
        { x: cx - cw / 2, y: cy + chHeight * 0.3 },
        { x: cx - cw / 2 + cw * 0.2, y: cy - chHeight * 0.5 },
        { x: cx - cw / 2 + cw * 0.55, y: cy - chHeight + this.rng() * 3 },
        { x: cx + cw / 2 - cw * 0.15, y: cy - chHeight * 0.6 },
        { x: cx + cw / 2, y: cy + chHeight * 0.2 },
        { x: cx + cw / 2 - cw * 0.2, y: cy + chHeight * 0.5 },
      ];
      this.g.fillStyle(p.base, 1);
      this.g.fillPoints(pts, true);
      this.g.fillStyle(p.dark, 0.4);
      // Shading bawah chunk
      this.g.fillPoints(
        [
          pts[3], pts[4], pts[5],
          { x: pts[0].x + 4, y: pts[0].y },
        ],
        true,
      );
      this.g.lineStyle(1, p.edge, 0.85);
      this.g.strokePoints(pts, true);
      // Highlight tipis di atas
      this.g.lineStyle(1, p.light, 0.5);
      this.g.lineBetween(pts[1].x, pts[1].y, pts[2].x, pts[2].y);
    }

    // Pebbles random di antaranya
    const pebbleCount = Math.max(4, Math.floor(w / 50));
    for (let i = 0; i < pebbleCount; i++) {
      const px = -w / 2 + this.rng() * w;
      const py = h * 0.1 + this.rng() * (h * 0.35);
      const r = 1.5 + this.rng() * 2;
      this.g.fillStyle(p.light, 0.5);
      this.g.fillCircle(px, py, r);
    }

    // Cracks di bagian bawah
    this.g.lineStyle(1, p.dark, 0.6);
    const crackCount = 2 + Math.floor(this.rng() * 2);
    for (let i = 0; i < crackCount; i++) {
      const cx = -w / 2 + this.rng() * w;
      const cy = 0;
      this.g.beginPath();
      this.g.moveTo(cx, cy);
      let y = cy;
      const steps = 3;
      for (let s = 0; s < steps; s++) {
        const dx = (this.rng() - 0.5) * 8;
        const dy = 6 + this.rng() * 6;
        this.g.lineTo(cx + dx, y + dy);
        y += dy;
        if (y > h / 2 - 2) break;
      }
      this.g.strokePath();
    }

    // Outline
    this.g.lineStyle(1, p.edge, 0.9);
    this.g.strokeRect(-w / 2, -h / 2, w, h);
  }
}
