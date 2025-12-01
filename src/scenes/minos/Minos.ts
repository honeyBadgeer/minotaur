import { CharacterCarousel } from '@/ui/components/CharacterCarousel';
import { Scene } from 'phaser';

export class Minos extends Scene {
  public characterCarousel: CharacterCarousel | null = null;

  constructor() {
    super('Minos');
  }

  create() {
    this.createBackground();
  }

  createBackground() {
    this.add
      .image(0, 0, 'background')
      .setOrigin(0)
      .setDisplaySize(1440, 810)
      .setDepth(-1);
  }
}
