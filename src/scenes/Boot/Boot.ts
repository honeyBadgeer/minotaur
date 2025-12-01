import { eventBus } from '@/core/events';
import { SceneEvents } from '@/core/events/events';
import { bootSpritesMap, preloadFont } from '@/services/constants';
import { preloadAssets } from '@/services/helpers';
import { Preloader } from '@/ui/components/Preloader';
import { Scene } from 'phaser';

export class BootScene extends Scene {
  preloader: Preloader | null;
  eventBus: Phaser.Events.EventEmitter = eventBus;

  constructor() {
    super('BootScene');
    this.preloader = null;
  }

  preload() {
    this.preloader = new Preloader(this, 0, 0, 'bootPreloader');
    this.createEvents();
    preloadAssets(this.load, 'image', bootSpritesMap);
    preloadAssets(this.load, 'font', preloadFont);
  }

  createEvents() {
    this.load.on('progress', (value: number) => {
      this.preloader?.updateProgress(value);
    });
    this.load.on('complete', () => {
      this.preloader?.destroyProgress();
    });
  }

  createBackground() {
    this.add.image(0, 0, 'background').setOrigin(0);
  }

  create() {
    this.createBackground();
    this.eventBus.emit(SceneEvents.RunPreloadScene);
  }
}
