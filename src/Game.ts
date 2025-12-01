import { HEIGHT, WIDTH } from '@services/constants';
import { WEBGL } from 'phaser';
import {
  BootScene,
  PreloadScene,
  Shooting,
  StartScene,
  UIScene,
} from './scenes';

import { SpinePlugin } from '@esotericsoftware/spine-phaser-v3';
import { Minos } from './scenes/minos/Minos';

export const scenes = {
  BootScene: BootScene,
  PreloadScene: PreloadScene,
  ShootngScene: Shooting,
  StartScene: StartScene,
  UIScene: UIScene,
  Minos: Minos,
};

export const config: Phaser.Types.Core.GameConfig = {
  type: WEBGL,
  antialiasGL: true,
  antialias: true,
  pixelArt: false,
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: 0x000000,
  parent: 'app',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: WIDTH,
    height: HEIGHT,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        x: 0,
        y: 0,
      },
      // debug: true,
    },
  },
  render: {
    autoMobilePipeline: false,
    defaultPipeline: 'MultiPipeline',
  },
  fps: {
    target: 60,
    forceSetTimeOut: true,
  },
  scene: Object.values(scenes),
  plugins: {
    scene: [
      {
        key: 'spine.SpinePlugin',
        plugin: SpinePlugin,
        mapping: 'spine',
      },
    ],
  },
};
