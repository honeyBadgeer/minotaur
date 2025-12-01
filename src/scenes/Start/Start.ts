import { eventBus } from '@/core';
import { GameEvents } from '@/core/events/events';
import { BackgroundVideo } from '@/ui/components/BackgroundVideo';
import { CharacterCarousel } from '@/ui/components/CharacterCarousel';
import { Scene } from 'phaser';

export class StartScene extends Scene {
  public characterCarousel: CharacterCarousel | null = null;

  constructor() {
    super('StartScene');
  }

  create() {
    this.createBackground();
    this.createVideoBackground();
  }

  createCarousel(initialIndex?: number) {
    this.characterCarousel = new CharacterCarousel(
      this,
      this.sys.canvas.width / 2,
      this.sys.canvas.height / 2,
      {
        onSelect: (character) => {
          eventBus.emit(GameEvents.SetCharacter, character);
        },
      }
    );

    if (initialIndex) {
      const characterIndex = Math.floor(initialIndex / 4);
      this.characterCarousel.setInitialIndex(characterIndex);
    }

    this.characterCarousel.createBaseCarousel();
    this.characterCarousel.create();
    this.characterCarousel.setOnReady();
  }

  createBackground() {
    this.add
      .image(0, 0, 'background')
      .setOrigin(0)
      .setDisplaySize(1440, 810)
      .setDepth(-1);
  }

  createVideoBackground() {
    new BackgroundVideo(this);
  }
}
