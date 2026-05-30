import Phaser from 'phaser';
import { SCENE, TEX } from '../config/keys';

/**
 * BootScene = entry-point.
 * Tugasnya cuma load aset minimal yang dibutuhin PreloadScene
 * (logo loading + bg partikel). Begitu kelar -> langsung start PreloadScene.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.BOOT });
  }

  preload() {
    this.load.image(TEX.LOADING_LOGO, 'assets/audio/loading-logo.png');
    this.load.image(TEX.BG_PARTIKEL, 'assets/bg/bgpartikel.png');
  }

  create() {
    this.scene.start(SCENE.PRELOAD);
  }
}
