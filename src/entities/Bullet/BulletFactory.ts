import type { TBulletType } from '@/core';
import { BaseBullet } from './BaseBullet';
import { SecondBullet } from './SecondBullet';
import { ThirdBullet } from './ThirdBullet';

export class BulletFactory {
  static generate(type: TBulletType, scene: Phaser.Scene) {
    switch (type) {
      case 'base':
        return new BaseBullet(scene);
      case 'secondary':
        return new SecondBullet(scene);
      case 'third':
        return new ThirdBullet(scene);
      default:
        return new BaseBullet(scene);
    }
  }
}
