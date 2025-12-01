import type { Scene } from 'phaser';
import { BulletEntity } from './BulletEntity';

export class SecondBullet extends BulletEntity {
  constructor(scene: Scene) {
    super(scene, {
      texture: 'secondBullet',
      moveSpeed: 2500,
      scale: 0.3,
      bulletType: 'secondary',
    });
  }
}
