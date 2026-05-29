import { useEffect, useRef } from 'react';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let game: import('phaser').Game | null = null;
    (async () => {
      const { createGame } = await import('./game');
      if (mountRef.current) {
        game = createGame(mountRef.current);
      }
    })();
    return () => {
      game?.destroy(true);
    };
  }, []);

  return (
    <div className="app">
      <div ref={mountRef} className="game-container" />
    </div>
  );
}
