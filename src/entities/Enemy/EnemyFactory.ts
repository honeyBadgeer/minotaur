import type { Physics, Scene } from 'phaser';
import type { EnemyType } from '@/types/types';
import { ENEMY_CHARACTERISTICS } from '@/services/constants';
import { EnemyEntity } from './EnemyEntity';
import { getCharacteristic } from '@/services/helpers';

export class EnemyFactory {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  initPool(enemiesGroup: Physics.Arcade.Group) {
    for (const { type, initCount } of ENEMY_CHARACTERISTICS) {
      for (let i = 0; i < initCount; i++) {
        const item = EnemyFactory.generate(type, this.scene);
        if (item) enemiesGroup.add(item);
      }
    }
  }

  static generate(type: EnemyType, scene: Scene) {
    return new EnemyEntity(scene, getCharacteristic(type));
  }
}
