import type { Scene } from 'phaser';
import { BulletEntity } from './BulletEntity';

export class ThirdBullet extends BulletEntity {
  constructor(scene: Scene) {
    super(scene, {
      texture: 'thirdBullet',
      moveSpeed: 3000,
      scale: 0.3,
      bulletType: 'third',
    });
  }
}
