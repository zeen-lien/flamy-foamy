import { useEffect, useRef } from 'react';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  // StrictMode + Vite HMR can mount effects twice. Tahan supaya cuma 1 Phaser
  // game instance yang aktif (kalau gak, canvas dobel & layout hancur).
  const gameRef = useRef<import('phaser').Game | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;
    (async () => {
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
