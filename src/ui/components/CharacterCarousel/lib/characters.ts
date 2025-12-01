import type { Character } from '../types';

const characters: Character[] = [
  {
    id: 'newbiePlayer',
    alias: 'newbie',
    texture: 'newbiePlayer',
    positionOnPlatform: { x: -25, y: -170 },
    spineOffset: { x: -58, y: -426 },
    label: {
      name: 'НОВИЧОК',
      values: '1 - 50',
    },
    bullet: 'base',
  },
  {
    id: 'masterPlayer',
    alias: 'master',
    texture: 'masterPlayer',
    positionOnPlatform: { x: 0, y: -170 },
    spineOffset: { x: -50, y: -400 },
    label: {
      name: 'МАСТЕР',
      values: '100 - 500',
    },
    bullet: 'secondary',
  },
  {
    id: 'expertPlayer',
    alias: 'expert',
    texture: 'expertPlayer',
    positionOnPlatform: { x: 0, y: -200 },
    spineOffset: { x: -20, y: -152 },
    label: {
      name: 'ЭКСПЕРТ',
      values: '700 - 3 000',
    },
    bullet: 'third',
  },
];

export { characters };
