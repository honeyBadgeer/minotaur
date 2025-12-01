import type { Scene } from 'phaser';
import { BulletEntity } from './BulletEntity';

export class BaseBullet extends BulletEntity {
  constructor(scene: Scene) {
    super(scene, {
      texture: 'mainBullet',
      moveSpeed: 1500,
      scale: 0.45,
      bulletType: 'base',
    });
  }
}
