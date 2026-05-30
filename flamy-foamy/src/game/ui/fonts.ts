// Font stack helpers — sentralisasi typography supaya konsisten lintas scene.
//
// Dipakai di Phaser text style:
//   { fontFamily: FONT.DISPLAY, fontSize: '64px', ... }

export const FONT = {
  /** Title / scene heading — fantasy engraved feel. */
  DISPLAY: '"Cinzel", "Trajan Pro", Georgia, serif',
  /** Subtitle / banner — condensed bold, modern. */
  HEAVY: '"Bebas Neue", Impact, system-ui, sans-serif',
  /** Body / UI label / kecil. */
  BODY: '"Inter", system-ui, -apple-system, sans-serif',
} as const;

/** Helper untuk title/heading dengan stroke + shadow konsisten. */
export interface DisplayStyle {
  fontSize: string;
  color?: string;
  strokeColor?: string;
  strokeThickness?: number;
  letterSpacing?: number;
}

export function displayTextStyle(opts: DisplayStyle): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: FONT.DISPLAY,
    fontSize: opts.fontSize,
    color: opts.color ?? '#f5f1e8',
    fontStyle: '900',
    stroke: opts.strokeColor ?? '#000000',
    strokeThickness: opts.strokeThickness ?? 4,
    shadow: {
      offsetX: 0,
      offsetY: 4,
      color: '#000000',
      blur: 10,
      stroke: false,
      fill: true,
    },
  };
}
