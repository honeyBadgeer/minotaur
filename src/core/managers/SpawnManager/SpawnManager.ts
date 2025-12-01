import type { EnemyEntity } from '@/entities/Enemy/EnemyEntity';
import { baseEnemyAngles, enemySpawnSides } from '@/entities/lib/constants';
import {
  getDirectionWithVariance,
  getEnemySpawnOffset,
  getSpawnPosition,
} from '@/entities/lib/helpers';
import type { Shooting } from '@/scenes/Shooting/Shooting';
import { ENEMY_CHARACTERISTICS } from '@/services/constants';
import type { TEnemyOptions } from '@/types/types';

export class SpawnManager {
  static updateSpawnEnemies(scene: Shooting, enemies: EnemyEntity[]) {
    scene.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (enemies) {
          const time = new Date().getTime();

          for (const item of ENEMY_CHARACTERISTICS) {
            if (item.groupType === 'grouped') {
              this.spawnGrouped(enemies, scene);
            } else {
              this.spawnScattered(enemies, time);
            }
          }
        }
      },
    });
  }

  private static spawnScattered(enemies: EnemyEntity[], time: number) {
    const scatteredEnemies = ENEMY_CHARACTERISTICS.filter((item) => {
      return item.groupType === 'scattered';
    });

    for (const item of scatteredEnemies) {
      const currentEnemyCount = enemies.filter((enemy) => {
        return enemy.enemyType === item.type && enemy.active;
      }).length;

      // сколько нужно добавить от ради максимума врагов на сцене конкретного типа
      const needToAdd = item.maxCount - currentEnemyCount;
      if (needToAdd <= 0) continue;

      let spawned = 0;

      for (let i = 0; i < enemies.length && spawned < needToAdd; i++) {
        const current = enemies[i];

        // если текущее время минус время смерти больше дилея
        const isReadyToSpawn = time - current.deathTime > item.delaySpawnCount;

        if (
          !current.active &&
          current.enemyType === item.type &&
          !current.readyToInteract &&
          isReadyToSpawn
        ) {
          current.setSpawn();
          current.enableFromPool();

          spawned++;
        }
      }
    }
  }

  private static spawnGrouped(enemies: EnemyEntity[], scene: Shooting) {
    const mouse = ENEMY_CHARACTERISTICS.find((item) => item.type === 'mouse');
    const frog = ENEMY_CHARACTERISTICS.find((item) => item.type === 'frog');
    const bunny = ENEMY_CHARACTERISTICS.find((item) => item.type === 'bunny');
    const squirrel = ENEMY_CHARACTERISTICS.find(
      (item) => item.type === 'squirrel'
    );
    const turtle = ENEMY_CHARACTERISTICS.find((item) => item.type === 'turtle');
    const snake = ENEMY_CHARACTERISTICS.find((item) => item.type === 'snake');

    this.handleSpawnBehind(enemies, scene, mouse);
    this.handleSpawnBehind(enemies, scene, turtle);
    this.handleSpawnChaotic(enemies, scene, frog);
    this.handleSpawnChaotic(enemies, scene, bunny);
    this.handleSpawnChaotic(enemies, scene, squirrel);
    this.handleSpawnChaotic(enemies, scene, snake);
  }

  private static handleSpawnBehind(
    enemies: EnemyEntity[],
    scene: Shooting,
    item: TEnemyOptions | undefined
  ) {
    if (!item) return;

    const needed = enemies.filter(
      (e) => !e.active && !e.readyToInteract && e.enemyType === item.type
    );
    if (needed.length <= 2) return;

    const count = Phaser.Math.Between(2, 3);
    const selected = needed.slice(0, count);

    const spawnSide = Phaser.Math.RND.pick(enemySpawnSides);
    const { width, height } = scene.sys.canvas;
    const offset = getEnemySpawnOffset(item.type);
    const position = getSpawnPosition(spawnSide, offset, height, width);

    const baseAngle = baseEnemyAngles[spawnSide];
    const direction = getDirectionWithVariance(baseAngle, 10);

    const leader = selected[0];
    leader.setSpawn({ positions: position, spawnSide, direction });
    leader.enableFromPool();

    const randomValue = Phaser.Math.Between(15, 20);
    const distance = 100;
    selected.slice(1).forEach((enemy, i) => {
      const newPos = {
        x: position.x - direction.x * distance * (i + 1) + randomValue,
        y: position.y - direction.y * distance * (i + 1) - randomValue,
      };

      enemy.setSpawn({
        positions: newPos,
        spawnSide,
        direction: direction,
      });

      enemy.enableFromPool();
    });
  }

  private static handleSpawnChaotic(
    enemies: EnemyEntity[],
    scene: Shooting,
    item: TEnemyOptions | undefined
  ) {
    if (!item) return;

    const needed = enemies.filter(
      (e) => !e.active && !e.readyToInteract && e.enemyType === item.type
    );
    if (needed.length <= 2) return;

    const count = Phaser.Math.Between(2, 3);
    const selected = needed.slice(0, count);

    const spawnSide = Phaser.Math.RND.pick(enemySpawnSides);
    const { width, height } = scene.sys.canvas;
    const offset = getEnemySpawnOffset(item.type);
    const position = getSpawnPosition(spawnSide, offset, height, width);

    const baseAngle = baseEnemyAngles[spawnSide];
    const newDirection = new Phaser.Math.Vector2(
      getDirectionWithVariance(baseAngle, 10)
    ).normalize();
    const perp = new Phaser.Math.Vector2(-newDirection.y, newDirection.x); // вбок от направления

    const backDistance = 80;
    const sideDistance = 60;
    const randomValue = Phaser.Math.Between(7, 11);

    selected[0].setSpawn({
      positions: position,
      spawnSide,
      direction: newDirection,
    });
    selected[0].enableFromPool();

    selected[1];
    const positionOne = {
      x: position.x - newDirection.x * backDistance + perp.x * sideDistance,
      y: position.y - newDirection.y * backDistance + perp.y * sideDistance,
    };
    selected[1].setSpawn({
      positions: positionOne,
      spawnSide,
      direction: newDirection,
    });
    selected[1].enableFromPool();

    if (selected[2]) {
      const positionTwo = {
        x:
          position.x -
          newDirection.x * backDistance * 0.8 -
          perp.x * sideDistance +
          randomValue,
        y:
          position.y -
          newDirection.y * backDistance * 0.8 -
          perp.y * sideDistance -
          randomValue,
      };
      selected[2].setSpawn({
        positions: positionTwo,
        spawnSide,
        direction: newDirection,
      });
      selected[2].enableFromPool();
    }
  }
}
