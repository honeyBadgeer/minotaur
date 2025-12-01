import type { GameObjects } from 'phaser';

export interface IAtlasData {
  jsonUrl: string;
  imageUrl: string;
}

export interface IMultiAtlasData {
  jsonUrl: string;
  basePath: string;
}

export type IAlignObject =
  | GameObjects.Image
  | GameObjects.Sprite
  | GameObjects.Text
  | GameObjects.Container;

export type IBundle = 'laser' | 'grenade' | 'ufo';
export type IMode = 'sightMode' | 'doubleFireMode' | 'autoMode';
export type IControlBarButtons = IBundle | IMode;

export type TControlBarButtons = {
  key: string;
  value: IControlBarButtons;
  x: number;
  y: number;
  flipY: boolean;
  label: string;
  event: {
    name: string;
    value?: any;
  };
};

export type TBundleBoomTexture = 'ufoBoom' | 'grenadeBoom' | 'laserBoom';

export type TBundlesConfig = {
  key: IBundle;
  texture: TBundleBoomTexture;
  frameRate: number;
  pointerX: number;
  pointerY: number;
  bodyActivateIndex: number;
  bodyDisableIndex: number;
  count: number;
};

export type Sides =
  | 'leftTop'
  | 'leftDown'
  | 'rightTop'
  | 'rightDown'
  | 'topLeft'
  | 'topRight'
  | 'downLeft'
  | 'downRight';

export type EnemyType =
  | 'mouse'
  | 'frog'
  | 'hare'
  | 'squirrel'
  | 'turtle'
  | 'deer'
  | 'boaConstrictor'
  | 'monkey'
  | 'ram'
  | 'fox'
  | 'horse'
  | 'zebra'
  | 'boar'
  | 'panther'
  | 'tiger'
  | 'lion'
  | 'bear'
  | 'elephant'
  | 'monster'
  | 'snake'
  | 'bunny';

export type BeastMode = number;
export type EnemyId = string;

export type TEnemyOptions = {
  type: EnemyType;
  groupType: 'scattered' | 'grouped';
  moveSpeed: number;
  explosionPositionY: number;
  bodyScale: number;
  timeScale: number;
  explosionScale: number;
  maxCount: number;
  initCount: number;
  delaySpawnCount: number;
  spawnOffset: number;
  beastMode: BeastMode;
};

export type TSceneKey =
  | 'PreloadScene'
  | 'StartScene'
  | 'UIScene'
  | 'ShootingScene';

export type TDialogKey =
  | 'autoMode'
  | 'big-win'
  | 'confirm'
  | 'error'
  | 'insufficient-funds'
  | 'unauthorized'
  | 'warning';

export interface IErrorConfig {
  message: string;
  onClose?: () => void;
  onRetry?: () => void;
}
export interface IInsufficientConfig {
  onClose?: () => void;
  onClick?: () => void;
}
export interface IUnauthorizedConfig {
  onClose?: () => void;
  onLogin?: () => void;
}
export interface IBundleConfig {
  amount: number;
  onConfirm: () => void;
  onClose?: () => void;
}
export interface IWarningConfig {
  warningType: IBundle;
  onClose: () => void;
}
export type IBigWinConfig = number;

export type IDialogData =
  | IErrorConfig
  | IInsufficientConfig
  | IUnauthorizedConfig
  | IBigWinConfig
  | IBundleConfig
  | IWarningConfig;

export type TError = {
  type: 'error' | 'demo' | 'influence' | 'login';
  data?: any;
};
