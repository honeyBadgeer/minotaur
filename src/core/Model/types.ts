export enum GameStates {
  NOT_LOADED,
  INIT,
  IDLE,
  WAITING,
  PLAYING,
  ERROR,
  BONUS_GAME,
}

export enum ModelStates {
  STATE_CHANGED = 'model::changed',
}

export type TCharacterKey = 'newbie' | 'master' | 'expert';

export interface CharacterModel {
  label: string;
  wins: string;
  maxPrize: string;
  key: TCharacterKey;
  bullet: TBulletType;
  bets: number[];
}
export type TBulletType = 'base' | 'secondary' | 'third';

export type TBulletOptions = {
  texture: string;
  moveSpeed: number;
  scale: number;
  bulletType: TBulletType;
};
