import type { TBulletType } from '@/core';

export type Character = {
  id: string;
  alias: 'newbie' | 'master' | 'expert';
  texture: string;
  positionOnPlatform: { x: number; y: number };
  spineOffset: { x: number; y: number };
  label: {
    name: string;
    values: string;
  };
  bullet: TBulletType;
};
export type CharacterCarouselConfig = {
  onSelect?: (character: Character) => void;
};
