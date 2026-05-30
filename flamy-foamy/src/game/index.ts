import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { HomeScene } from './scenes/HomeScene';
import { LevelSelectScene, SettingScene, AboutScene } from './scenes/StubScene';

export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#05070d',
    pixelArt: false,
    antialias: true,
    scale: {
      // RESIZE = canvas adaptasi ke ukuran viewport (no letterbox, no crop).
      // Setiap scene listen 'resize' event untuk reposition UI.
      mode: Phaser.Scale.RESIZE,
      width: window.innerWidth,
      height: window.innerHeight,
      autoCenter: Phaser.Scale.NO_CENTER,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 1100 },
        debug: false,
      },
    },
    scene: [
      BootScene,
      PreloadScene,
      HomeScene,
      LevelSelectScene,
      SettingScene,
      AboutScene,
    ],
  });
}
