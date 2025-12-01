import type { TBulletType } from '@/core';
import type { GameObjects } from 'phaser';

const bulletMap: Record<TBulletType, { orignX: number; originY: number }> = {
  base: { orignX: 0.49, originY: 0.57 },
  secondary: { orignX: 0.47, originY: 0.72 },
  third: { orignX: 0.5, originY: 0.67 },
};

export type TBulletShootOptions = {
  bulletType: TBulletType;
  positionX: number;
  positionY: number;
  rotation: number;
};

export class BulletShoot extends Phaser.GameObjects.Container {
  public spriteShoot: GameObjects.Sprite | null = null;

  constructor(scene: Phaser.Scene, options: TBulletShootOptions) {
    super(scene, 0, 0);

    this.spriteShoot = scene.add.sprite(
      0,
      0,
      `${options.bulletType}BulletShoot`
    );
    this.add(this.spriteShoot);

    this.spriteShoot.setOrigin(
      bulletMap[options.bulletType].orignX,
      bulletMap[options.bulletType].originY
    );
    this.setScale(0.3);
    this.setRotation(options.rotation);
    this.setPosition(options.positionX, options.positionY);

    scene.add.existing(this);

    const key = `${options.bulletType}-bullet-shoot`;

    if (!scene.anims.exists(key)) {
      scene.anims.create({
        key,
        frames: `${options.bulletType}BulletShoot`,
        frameRate: 50,
        repeat: 0,
      });
    }

    this.spriteShoot.play(key);
    this.spriteShoot.once(`animationcomplete-${key}`, () => {
      this.destroy();
    });
  }
}
