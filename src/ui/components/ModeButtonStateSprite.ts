import type { IControlBarButtons } from '@/types/types';
import type { GameObjects } from 'phaser';

type TSpriteOptions = {
  texture: IControlBarButtons;
};

const data: Record<
  IControlBarButtons,
  { posX: number; posY: number; texture: string }
> = {
  ufo: {
    posX: 2,
    posY: 0,
    texture: 'ufoIcon',
  },
  autoMode: {
    posX: 0,
    posY: 1,
    texture: 'autoModeIcon',
  },
  grenade: {
    posX: 0,
    posY: 4,
    texture: 'grenadeIcon',
  },
  sightMode: {
    posX: 1,
    posY: -3,
    texture: '',
  },
  doubleFireMode: {
    posX: 1,
    posY: 0,
    texture: 'doubleFireModeIcon',
  },
  laser: {
    posX: 0,
    posY: 0,
    texture: '',
  },
};

export class ModeButtonStateSprite extends Phaser.GameObjects.Container {
  private spriteInstance: GameObjects.Sprite | null = null;
  private animationKey: string;

  constructor(scene: Phaser.Scene, options: TSpriteOptions) {
    super(scene, 0, 0);

    this.spriteInstance = scene.add.sprite(0, 0, options.texture);

    this.add(this.spriteInstance);

    this.setPosition(data[options.texture].posX, data[options.texture].posY);

    scene.add.existing(this);

    this.animationKey = `mode-${options.texture}`;

    if (!scene.anims.exists(this.animationKey)) {
      scene.anims.create({
        key: this.animationKey,
        frames: data[options.texture].texture,
        frameRate: 80,
        repeat: 0,
      });
    }

    this.spriteInstance.play(this.animationKey);
  }

  static generate(scene: Phaser.Scene, options: TSpriteOptions) {
    return new ModeButtonStateSprite(scene, options);
  }

  test() {
    this.destroy();
  }
}
