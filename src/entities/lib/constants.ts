import type { Sides } from '@/types/types';

const baseEnemyAngles: Record<Sides, number> = {
  leftTop: 15,
  leftDown: -15,
  rightTop: 165,
  rightDown: -165,
  topLeft: 30,
  topRight: 145,
  downLeft: -35,
  downRight: -150,
};

const enemySpawnSides: Sides[] = [
  'leftTop',
  'leftDown',
  'rightTop',
  'rightDown',
  'topLeft',
  'topRight',
  'downLeft',
  'downRight',
];

export { baseEnemyAngles, enemySpawnSides };
