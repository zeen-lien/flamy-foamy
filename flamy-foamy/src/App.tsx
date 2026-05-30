import { useEffect, useRef } from 'react';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<import('phaser').Game | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;
    (async () => {
      // Pastikan custom font (Cinzel, Bebas Neue, Inter) udah ke-load
      // sebelum Phaser nge-render canvas. Kalau gak, frame pertama pake
      // fallback font.
      try {
        if ('fonts' in document) {
          await Promise.all([
            document.fonts.load('700 32px "Cinzel"'),
            document.fonts.load('400 32px "Bebas Neue"'),
            document.fonts.load('700 16px "Inter"'),
          ]);
          await document.fonts.ready;
        }
      } catch {
        /* font preload optional, fallback OK */
      }

      const { createGame } = await import('./game');
      if (cancelled || !mountRef.current) return;
      gameRef.current = createGame(mountRef.current);
    })();

    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
      startedRef.current = false;
    };
  }, []);

  return (
    <div className="app">
      <div ref={mountRef} className="game-container" />
    </div>
  );
}
