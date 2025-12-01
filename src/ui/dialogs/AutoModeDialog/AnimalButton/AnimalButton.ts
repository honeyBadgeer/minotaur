import { SoundManager } from '@/core';
import Phaser from 'phaser';

const buttonTargetSize = 70;

export class AnimalButton extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Image;
  private icon: Phaser.GameObjects.Image;
  private animalKey: string;

  constructor(scene: Phaser.Scene, x: number, y: number, animalKey: string) {
    super(scene, x, y);

    this.animalKey = animalKey;

    this.bg = scene.add.image(0, 0, 'animalButton').setOrigin(0.5).setScale(0);

    this.icon = scene.add
      .image(0, 0, 'animalsIcon', animalKey)
      .setOrigin(0.5)
      .setDisplaySize(0, 0);

    this.add([this.bg, this.icon]);

    this.setSize(this.bg.width, this.bg.height);
    this.setInteractive({ useHandCursor: true });

    scene.add.existing(this);
  }

  animate(delay: number) {
    this.scene.add.tween({
      targets: this.bg,
      scale: 1,
      duration: 200,
      ease: 'Back.Out',
      delay,
    });

    this.icon.setDisplaySize(0, 0);

    this.scene.add.tween({
      targets: this.icon,
      displayWidth: buttonTargetSize,
      displayHeight: buttonTargetSize,
      duration: 200,
      ease: 'Back.Out',
      delay,
    });
  }

  getAnimalKey() {
    return this.animalKey;
  }

  setSelected(state: boolean) {
    SoundManager.play('button');
    if (state) {
      this.bg.setTexture('animalButtonActive');
    } else {
      this.bg.setTexture('animalButton');
    }
  }
}
