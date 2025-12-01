import { ENEMY_CHARACTERISTICS } from '@/services/constants';
import type { EnemyId, EnemyType, Sides } from '@/types/types';

function getEnemySpawnOffset(enemyType: EnemyType): number {
  for (const { type, spawnOffset } of ENEMY_CHARACTERISTICS) {
    if (type === enemyType) {
      return spawnOffset;
    }
  }
  return 50;
}

// добавление угла для направления
function getDirectionWithVariance(
  baseAngleDeg: number,
  varianceDegrees: number
): Phaser.Math.Vector2 {
  const angleRad = Phaser.Math.DegToRad(
    baseAngleDeg + Phaser.Math.Between(-varianceDegrees, varianceDegrees)
  );

  return new Phaser.Math.Vector2(
    Math.cos(angleRad),
    Math.sin(angleRad)
  ).normalize();
}

function getSpawnPosition(
  spawnSide: Sides,
  offset: number,
  height: number,
  width: number
) {
  let x = 0;
  let y = 0;

  switch (spawnSide) {
    case 'leftTop':
      x = -offset;
      y = Phaser.Math.Between(0, height / 2);
      break;
    case 'leftDown':
      x = -offset;
      y = Phaser.Math.Between(height / 2, height);
      break;
    case 'rightTop':
      x = width + offset;
      y = Phaser.Math.Between(0, height / 2);
      break;
    case 'rightDown':
      x = width + offset;
      y = Phaser.Math.Between(height / 2, height);
      break;
    case 'topLeft':
      x = Phaser.Math.Between(0, width / 2);
      y = -offset;
      break;
    case 'topRight':
      x = Phaser.Math.Between(width / 2, width);
      y = -offset;
      break;
    case 'downLeft':
      x = Phaser.Math.Between(0, width / 2);
      y = height + offset;
      break;
    case 'downRight':
      x = Phaser.Math.Between(width / 2, width);
      y = height + offset;
      break;
  }

  return { x, y };
}

function getNumberUUID(): EnemyId {
  return Phaser.Utils.String.UUID()
    .replace(/-/g, '')
    .replace(/[a-f]/gi, () => Math.floor(Math.random() * 10).toString());
}

export {
  getEnemySpawnOffset,
  getDirectionWithVariance,
  getSpawnPosition,
  getNumberUUID,
};
