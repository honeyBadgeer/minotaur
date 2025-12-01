import DefaultButton from '@/ui/components/DefaultButton';
import { Preloader } from '@/ui/components/Preloader';
import {
  atlasMap,
  DEFAULT_STYLES_BUTTON,
  multiAtlasMap,
  preloadSpines,
  preloadSpriteSheet,
  preloadSpritesMap,
  preloadSvg,
  soundPaths,
} from '@services/constants';
import { preloadAssets } from '@services/helpers';
import { GameObjects, Scene } from 'phaser';

import { CoreEvents, SceneEvents } from '@/core/events/events';
import { t } from '@/i18n';

import { GameStates, SoundManager } from '@/core';
import { eventBus } from '@/core/events';
import { BackgroundVideo } from '@/ui/components/BackgroundVideo';

export class PreloadScene extends Scene {
  preloader: Preloader | null = null;
  buttons: GameObjects.Container | null = null;
  logo: GameObjects.Image | null = null;
  gameLogo: GameObjects.Image | null = null;

  constructor() {
    super('PreloadScene');
  }

  preload() {
    this.createEvents();
    this.createBackground();
    this.createLogos();
    this.preloader = new Preloader(this, 0, 0, 'bootPreloader');
    preloadAssets(this.load, 'image', preloadSpritesMap);
    preloadAssets(this.load, 'atlas', atlasMap);
    preloadAssets(this.load, 'multiatlas', multiAtlasMap);
    preloadAssets(this.load, 'spine', preloadSpines);
    preloadAssets(this.load, 'svg', preloadSvg);
    preloadAssets(this.load, 'spritesheet', preloadSpriteSheet);
  }

  createEvents() {
    SoundManager.init(soundPaths, 1, eventBus);
    this.load.on('progress', (value: number) => {
      this.preloader?.updateProgress(value);
    });
    this.load.on('complete', () => {
      this.preloader?.destroyProgress();
      eventBus.emit(CoreEvents.Loaded, 'resources');
    });
  }

  public onReady() {
    eventBus.emit(CoreEvents.SetGameState, GameStates.INIT);
    this.animateButton();
  }

  create() {
    this.createButtons();
    this.handleCreatedScene();
  }

  handleCreatedScene() {
    eventBus.emit(SceneEvents.CreatePreloadScene);
  }

  createBackground() {
    this.add.image(0, 0, 'background').setOrigin(0).setDisplaySize(1440, 810);
  }

  createLogos() {
    this.logo = this.add.image(0, 0, 'logo').setOrigin(0.5);
    this.logo.setPosition(this.scale.width / 2, -this.logo.height * 2);
    this.logo.setDepth(1);

    this.gameLogo = this.add.image(0, 0, 'gameLogo').setOrigin(0.5).setScale(0);
    this.gameLogo.setPosition(
      this.scale.width / 2,
      240 + this.gameLogo.height / 2
    );
    this.gameLogo.setDepth(1);

    this.animateLogo();
    this.animateGameLogo();
  }

  createButtons() {
    this.buttons = this.add.container(0, 300);
    const startButton = new DefaultButton(
      this,
      0,
      0,
      {
        text: t('participate'),
        onUp: () => {
          this.startNewScene();
        },
      },
      DEFAULT_STYLES_BUTTON
    );
    startButton
      .setX(this.sys.canvas.width / 2)
      .setY(this.sys.canvas.height - startButton.height + 15);

    this.buttons.add(startButton);
  }

  startNewScene() {
    this.tweens.add({
      targets: this.logo,
      y: -200,
      ease: 'Quad.Out',
      duration: 200,
      delay: 100,
    });
    this.tweens.add({
      targets: this.gameLogo,
      y: -500,
      ease: 'Quad.Out',
      duration: 200,
      delay: 100,
    });
    this.tweens.add({
      targets: this.buttons,
      y: this.scale.height + 200,
      ease: 'Linear',
      duration: 350,
      delay: 100,
      onComplete: () => {
        eventBus.emit(SceneEvents.RunStartScene);
      },
    });
  }

  animateLogo() {
    if (!this.logo) return;

    this.tweens.chain({
      targets: this.logo,
      tweens: [
        {
          y: 83 + this.logo.height / 2,
          ease: 'Quad.easeIn',
          duration: 400,
          delay: 100,
        },
        {
          y: 43 + this.logo.height / 2,
          ease: 'Back.easeOut',
          duration: 400,
        },
      ],
    });
  }

  animateGameLogo() {
    this.tweens.chain({
      targets: this.gameLogo,
      tweens: [
        {
          scale: 1.3,
          ease: 'Quad.easeIn',
          duration: 400,
          delay: 100,
        },
        {
          scale: 1,
          ease: 'Back.easeOut',
          duration: 400,
        },
      ],
    });
  }

  animateButton() {
    this.tweens.add({
      targets: this.buttons,
      y: [300, -30, 0],
      ease: 'Quad.Out',
      duration: 300,
      delay: 200,
    });
  }
}
