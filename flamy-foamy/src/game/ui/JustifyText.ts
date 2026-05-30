import Phaser from 'phaser';

/**
 * JustifyText — render multi-paragraph text dengan justified alignment beneran.
 *
 * Phaser.Text gak support `align: 'justify'`. Helper ini:
 *  1. Split input ke paragraf (`\n\n`).
 *  2. Per paragraf: greedy word-wrap berdasarkan width.
 *  3. Per baris (kecuali baris terakhir paragraf): render tiap kata sebagai
 *     Text object terpisah dengan x yang sudah dihitung untuk fill width
 *     (gap antar kata seragam, total = maxWidth).
 *  4. Baris terakhir paragraf: left-aligned biasa.
 *
 * Output: container yang isinya semua kata sebagai Text objects.
 * Tinggi container bisa dibaca via `displayHeight` atau `getHeight()`.
 */

export interface JustifyTextOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  text: string;
  width: number;
  fontFamily: string;
  fontSize: string;
  color?: string;
  lineSpacing?: number;       // pixel extra antar baris
  paragraphSpacing?: number;  // pixel extra antar paragraf
  /** kata yang lebih lebar dari ini gak akan di-justify (avoid weird gaps). */
  maxJustifyWordRatio?: number;
}

export class JustifyText extends Phaser.GameObjects.Container {
  private widthInner: number;
  private contentHeight = 0;

  constructor(opts: JustifyTextOptions) {
    super(opts.scene, opts.x, opts.y);
    opts.scene.add.existing(this);
    this.widthInner = opts.width;
    this.render(opts);
  }

  getHeight(): number {
    return this.contentHeight;
  }

  setText(text: string, opts: Omit<JustifyTextOptions, 'text' | 'scene' | 'x' | 'y'>): void {
    this.removeAll(true);
    this.render({
      scene: this.scene,
      x: this.x,
      y: this.y,
      text,
      ...opts,
    });
  }

  private render(opts: JustifyTextOptions): void {
    const lineSpacing = opts.lineSpacing ?? 4;
    const paragraphSpacing = opts.paragraphSpacing ?? 12;
    const color = opts.color ?? '#ffffff';
    const fontStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: opts.fontFamily,
      fontSize: opts.fontSize,
      color,
    };

    const SPACE_WIDTH = this.measure(' ', fontStyle);
    const lineH = this.measureHeight(opts.fontSize) + lineSpacing;

    let cursorY = 0;
    const paragraphs = opts.text.split(/\n\s*\n/);

    paragraphs.forEach((paragraph, pIdx) => {
      // Single-line linebreak dianggap spasi (alami kayak HTML)
      const flat = paragraph.replace(/\s+/g, ' ').trim();
      if (!flat) {
        cursorY += lineH;
        return;
      }
      const words = flat.split(' ');

      // Greedy line-break: tampung kata sampai lebar > maxWidth
      const lines: string[][] = [];
      let current: string[] = [];
      let currentW = 0;

      for (const w of words) {
        const wWidth = this.measure(w, fontStyle);
        const tentative = currentW + (current.length === 0 ? 0 : SPACE_WIDTH) + wWidth;
        if (tentative <= this.widthInner || current.length === 0) {
          current.push(w);
          currentW = tentative;
        } else {
          lines.push(current);
          current = [w];
          currentW = wWidth;
        }
      }
      if (current.length) lines.push(current);

      // Render tiap baris
      lines.forEach((lineWords, li) => {
        const isLast = li === lines.length - 1;
        if (isLast || lineWords.length === 1) {
          // Left-aligned (gabung pakai spasi normal)
          const text = this.scene.add.text(0, cursorY, lineWords.join(' '), fontStyle).setOrigin(0, 0);
          this.add(text);
        } else {
          // Justify: hitung total lebar kata, sisa space dibagi rata ke gap
          const wordWidths = lineWords.map((w) => this.measure(w, fontStyle));
          const totalWordsW = wordWidths.reduce((a, b) => a + b, 0);
          const gaps = lineWords.length - 1;
          const gapW = (this.widthInner - totalWordsW) / gaps;
          // Cap supaya gap gak kelewat lebar (kasus kata pendek + line panjang)
          const maxGap = SPACE_WIDTH * 4;
          const useGap = Math.min(gapW, maxGap);

          let x = 0;
          lineWords.forEach((word, wi) => {
            const t = this.scene.add.text(x, cursorY, word, fontStyle).setOrigin(0, 0);
            this.add(t);
            x += wordWidths[wi] + useGap;
          });
        }
        cursorY += lineH;
      });

      // Spasi antar paragraf
      if (pIdx < paragraphs.length - 1) {
        cursorY += paragraphSpacing;
      }
    });

    this.contentHeight = cursorY;
  }

  // ---------- helpers ----------

  private static measureCanvas: HTMLCanvasElement | null = null;
  private static measureCtx: CanvasRenderingContext2D | null = null;

  private getMeasureCtx(): CanvasRenderingContext2D {
    if (!JustifyText.measureCtx) {
      JustifyText.measureCanvas = document.createElement('canvas');
      JustifyText.measureCtx = JustifyText.measureCanvas.getContext('2d')!;
    }
    return JustifyText.measureCtx;
  }

  private measure(text: string, style: Phaser.Types.GameObjects.Text.TextStyle): number {
    const ctx = this.getMeasureCtx();
    ctx.font = `${style.fontSize} ${style.fontFamily}`;
    return ctx.measureText(text).width;
  }

  private measureHeight(fontSize: string): number {
    // Fontsize "13px" -> 13
    const n = parseInt(fontSize, 10);
    return isFinite(n) ? n : 14;
  }
}
