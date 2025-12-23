import type { SoundConfig, TCharacterKey } from '@/core';
import type {
  IAtlasData,
  IMultiAtlasData,
  TEnemyOptions,
  TSymbolsConfig,
} from '../types/types';

const bootSpritesMap: Record<string, string> = {
  background: 'assets/sprites/background.jpg',
  gameLogo: 'assets/sprites/game-logo.png',
  logo: 'assets/sprites/logo.png',
  dialogBig: 'assets/sprites/dialog-big.png',
};

const multiAtlasMap: Record<string, IMultiAtlasData> = {};

const soundPaths: Record<string, SoundConfig> = {
  bg: { src: './sounds/bg.mp3' },
  button: { src: './sounds/button.mp3' },
  characterSelectBg: { src: './sounds/character-select-bg.mp3' },
  grenade: { src: './sounds/grenade.mp3' },
  laser: { src: './sounds/laser.mp3' },
  shotExpert: { src: './sounds/shot-expert.mp3' },
  shotMaster: { src: './sounds/shot-master.mp3' },
  shotNewbie: { src: './sounds/shot-newbie.mp3' },
  ufoStart: { src: './sounds/ufo-start.mp3' },
  ufo: { src: './sounds/ufo.mp3' },
  winning: { src: './sounds/winning.mp3' },
  bundleAlarm: { src: './sounds/bundle-alarm.mp3' },
};

const atlasMap: Record<string, IAtlasData> = {
  buttons: {
    jsonUrl: 'assets/atlases/buttons.json',
    imageUrl: 'assets/atlases/buttons.png',
  },
};

const preloadSpritesMap: Record<string, string> = {
  choisingLabel: 'assets/sprites/choising-label.png',
  choisingLabelInactive: 'assets/sprites/choising-label-inactive.png',
  choisingPlatform: 'assets/sprites/choising-platform.png',
  choisingPlatformInactive: 'assets/sprites/choising-platform-inactive.png',
  expertPlayer: 'assets/sprites/expert.png',
  masterPlayer: 'assets/sprites/master.png',
  newbiePlayer: 'assets/sprites/newbie.png',
  light: 'assets/sprites/light.png',
  controlBarBackground: 'assets/sprites/control-bar-background.png',
  statisticBarBackground: 'assets/sprites/statistic-bar-background.png',
  shootingBackground: 'assets/sprites/shooting-background.png',
  pointer: 'assets/sprites/pointer.png',
  newbieSm: 'assets/sprites/newbieSm.png',
  masterSm: 'assets/sprites/masterSm.png',
  expertSm: 'assets/sprites/expertSm.png',
  mainBullet: 'assets/sprites/main-bullet.png',
  secondBullet: 'assets/sprites/second-bullet.png',
  thirdBullet: 'assets/sprites/third-bullet.png',
  animalButtonActive: 'assets/sprites/animal-button-active.png',
  animalButton: 'assets/sprites/animal-button.png',
  closeBg: 'assets/sprites/close-bg.png',
  close: 'assets/sprites/close.png',
  dialogSmall: 'assets/sprites/dialog-small.png',
  dialogVerySmall: 'assets/sprites/dialog-very-small.png',
  slideOne: 'assets/sprites/onboarding/ru/slide-1.png',
  slideTwo: 'assets/sprites/onboarding/ru/slide-2.png',
  slideThree: 'assets/sprites/onboarding/ru/slide-3.png',
  slideOneKz: 'assets/sprites/onboarding/kz/slide-1.png',
  slideTwoKz: 'assets/sprites/onboarding/kz/slide-2.png',
  slideThreeKz: 'assets/sprites/onboarding/kz/slide-3.png',
  onboardingBg: 'assets/sprites/onboarding/bg.png',
  polygon: 'assets/sprites/onboarding/polygon.png',
  polygonActive: 'assets/sprites/onboarding/polygon-active.png',
  bookmark: 'assets/sprites/onboarding/bookmark.svg',
  arm: 'assets/sprites/onboarding/arm.png',
  frontFrame: 'assets/sprites/front_frame.png',
  frame: 'assets/sprites/frame.png',
  rock: 'assets/sprites/rock.png',
};

const preloadSvg: Record<string, string> = {
  demoBg: 'assets/svg/demo-bg.svg',
  tenge: 'assets/svg/tenge.svg',
  bigTenge: 'assets/svg/big-tenge.svg',
  warningGrenade: 'assets/svg/grenade-warning.svg',
  warningLaser: 'assets/svg/laser-warning.svg',
  warningUfo: 'assets/svg/ufo-warning.svg',
};

const preloadFont: Record<string, string> = {
  BatmanForeverAlternate: 'assets/fonts/BatmanForeverAlternate.ttf',
  Tektur: 'assets/fonts/Tektur.ttf',
};

const preloadSpriteSheet: Record<
  string,
  { path: string; frameWidth: number; frameHeight: number }
> = {};

const preloadSpines: Record<string, { json: string; atlas: string }> = {
  monster: {
    json: 'assets/spines/monster/skeleton.json',
    atlas: 'assets/spines/monster/skeleton.atlas',
  },
  mouse: {
    json: 'assets/spines/mouse/skeleton.json',
    atlas: 'assets/spines/mouse/skeleton.atlas',
  },
  panther: {
    json: 'assets/spines/panther/skeleton.json',
    atlas: 'assets/spines/panther/skeleton.atlas',
  },
  ram: {
    json: 'assets/spines/ram/skeleton.json',
    atlas: 'assets/spines/ram/skeleton.atlas',
  },
  snake: {
    json: 'assets/spines/snake/skeleton.json',
    atlas: 'assets/spines/snake/skeleton.atlas',
  },
  squirrel: {
    json: 'assets/spines/squirrel/skeleton.json',
    atlas: 'assets/spines/squirrel/skeleton.atlas',
  },
  tiger: {
    json: 'assets/spines/tiger/skeleton.json',
    atlas: 'assets/spines/tiger/skeleton.atlas',
  },
  turtle: {
    json: 'assets/spines/turtle/skeleton.json',
    atlas: 'assets/spines/turtle/skeleton.atlas',
  },
  zebra: {
    json: 'assets/spines/zebra/skeleton.json',
    atlas: 'assets/spines/zebra/skeleton.atlas',
  },
  minotaur: {
    json: 'assets/spines/minotaur/skeleton.json',
    atlas: 'assets/spines/minotaur/skeleton.atlas',
  },
  minotaurFull: {
    json: 'assets/spines/minotaur-full/skeleton.json',
    atlas: 'assets/spines/minotaur-full/skeleton.atlas',
  },
};

const SYMBOLS_CONFIG: TSymbolsConfig[] = [
  {
    key: 'monster',
    value: 0,
  },
  {
    key: 'mouse',
    value: 1,
  },
  {
    key: 'panther',
    value: 2,
  },
  {
    key: 'ram',
    value: 3,
  },
  {
    key: 'snake',
    value: 4,
  },
  {
    key: 'squirrel',
    value: 5,
  },
  {
    key: 'tiger',
    value: 6,
  },
  {
    key: 'zebra',
    value: 7,
  },
  {
    key: 'turtle',
    value: 8,
  },
  {
    key: 'minotaur',
    value: 10,
  },
];

const WIDTH = 1440;
const HEIGHT = 810;

const MAX_DEMO_VALUE = 5;
const MAX_DEMO_BUNDLE_VALUE = 1;

const DEFAULT_STYLES_BUTTON = {
  normal: 'normal',
  disabled: 'disabled',
  pressed: 'pressed',
  hover: 'hover',
};

interface CharacterConfig {
  img: string;
  possibleBets: string;
}

const characters: Record<TCharacterKey, CharacterConfig> = {
  newbie: {
    img: 'newbieSm',
    possibleBets: '1 - 50',
  },
  master: {
    img: 'masterSm',
    possibleBets: '100 - 500',
  },
  expert: {
    img: 'expertSm',
    possibleBets: '700 - 3 000',
  },
};

const ENEMY_CHARACTERISTICS: TEnemyOptions[] = [
  {
    type: 'mouse',
    groupType: 'grouped',
    moveSpeed: 30,
    bodyScale: 0.8,
    timeScale: 1,
    explosionPositionY: 13.01,
    explosionScale: 0.651,
    maxCount: 3,
    initCount: 3,
    delaySpawnCount: 0,
    spawnOffset: 70,
    beastMode: 0,
  },
  {
    type: 'frog',
    groupType: 'grouped',
    moveSpeed: 30,
    bodyScale: 0.6,
    timeScale: 1,
    explosionPositionY: 16.26,
    explosionScale: 0.814,
    maxCount: 3,
    initCount: 3,
    delaySpawnCount: 200,
    spawnOffset: 70,
    beastMode: 1,
  },
  {
    type: 'bunny',
    groupType: 'grouped',
    moveSpeed: 40,
    bodyScale: 0.6,
    timeScale: 1,
    explosionPositionY: 14.59,
    explosionScale: 0.729,
    maxCount: 3,
    initCount: 3,
    delaySpawnCount: 350,
    spawnOffset: 70,
    beastMode: 2,
  },
  {
    type: 'squirrel',
    groupType: 'grouped',
    moveSpeed: 30,
    bodyScale: 0.7,
    timeScale: 1,
    explosionPositionY: 16.41,
    explosionScale: 0.821,
    maxCount: 3,
    initCount: 3,
    delaySpawnCount: 500,
    spawnOffset: 70,
    beastMode: 3,
  },
  {
    type: 'turtle',
    groupType: 'grouped',
    moveSpeed: 25,
    bodyScale: 0.6,
    timeScale: 1,
    explosionPositionY: 10.84,
    explosionScale: 0.543,
    maxCount: 3,
    initCount: 3,
    delaySpawnCount: 650,
    spawnOffset: 70,
    beastMode: 4,
  },
  {
    type: 'snake',
    groupType: 'grouped',
    moveSpeed: 28,
    bodyScale: 0.25,
    timeScale: 1,
    explosionPositionY: 14.33,
    explosionScale: 0.717,
    maxCount: 3,
    initCount: 3,
    delaySpawnCount: 800,
    spawnOffset: 70,
    beastMode: 6,
  },
  {
    type: 'deer',
    groupType: 'scattered',
    moveSpeed: 30,
    bodyScale: 0.8,
    timeScale: 1,
    explosionPositionY: 23.85,
    explosionScale: 1.193,
    maxCount: 2,
    initCount: 2,
    delaySpawnCount: 0,
    spawnOffset: 90,
    beastMode: 5,
  },

  {
    type: 'monkey',
    groupType: 'scattered',
    moveSpeed: 40,
    bodyScale: 0.8,
    timeScale: 0.8,
    explosionPositionY: 14.46,
    explosionScale: 0.724,
    maxCount: 2,
    initCount: 2,
    delaySpawnCount: 0,
    spawnOffset: 60,
    beastMode: 7,
  },
  {
    type: 'ram',
    groupType: 'scattered',
    moveSpeed: 30,
    bodyScale: 0.6,
    timeScale: 1,
    explosionPositionY: 21.68,
    explosionScale: 1.085,
    maxCount: 1,
    initCount: 1,
    delaySpawnCount: 0,
    spawnOffset: 90,
    beastMode: 8,
  },
  {
    type: 'fox',
    groupType: 'scattered',
    moveSpeed: 35,
    bodyScale: 0.8,
    timeScale: 1,
    explosionPositionY: 17.35,
    explosionScale: 0.868,
    maxCount: 2,
    initCount: 2,
    delaySpawnCount: 0,
    spawnOffset: 60,
    beastMode: 9,
  },
  {
    type: 'horse',
    groupType: 'scattered',
    moveSpeed: 60,
    bodyScale: 0.8,
    timeScale: 1,
    explosionPositionY: 28.23,
    explosionScale: 1.412,
    maxCount: 1,
    initCount: 1,
    delaySpawnCount: 0,
    spawnOffset: 90,
    beastMode: 10,
  },
  {
    type: 'zebra',
    groupType: 'scattered',
    moveSpeed: 60,
    bodyScale: 0.8,
    timeScale: 1,
    explosionPositionY: 24.67,
    explosionScale: 1.235,
    maxCount: 1,
    initCount: 1,
    delaySpawnCount: 0,
    spawnOffset: 90,
    beastMode: 11,
  },
  {
    type: 'boar',
    groupType: 'scattered',
    moveSpeed: 30,
    bodyScale: 0.8,
    timeScale: 1,
    explosionPositionY: 18.97,
    explosionScale: 0.95,
    maxCount: 1,
    initCount: 1,
    delaySpawnCount: 0,
    spawnOffset: 70,
    beastMode: 12,
  },
  {
    type: 'panther',
    groupType: 'scattered',
    moveSpeed: 50,
    bodyScale: 0.8,
    timeScale: 1.2,
    explosionPositionY: 18.8,
    explosionScale: 0.941,
    maxCount: 1,
    initCount: 1,
    delaySpawnCount: 0,
    spawnOffset: 70,
    beastMode: 13,
  },

  {
    type: 'tiger',
    groupType: 'scattered',
    moveSpeed: 40,
    bodyScale: 0.8,
    timeScale: 1.2,
    explosionPositionY: 21.68,
    explosionScale: 1.085,
    maxCount: 1,
    initCount: 1,
    delaySpawnCount: 0,
    spawnOffset: 90,
    beastMode: 14,
  },

  {
    type: 'lion',
    groupType: 'scattered',
    moveSpeed: 40,
    bodyScale: 0.8,
    timeScale: 1.2,
    explosionPositionY: 21.68,
    explosionScale: 1.085,
    maxCount: 1,
    initCount: 1,
    delaySpawnCount: 5000,
    spawnOffset: 80,
    beastMode: 15,
  },
  {
    type: 'bear',
    groupType: 'scattered',
    moveSpeed: 25,
    bodyScale: 0.8,
    timeScale: 1,
    explosionPositionY: 26.02,
    explosionScale: 1.302,
    maxCount: 1,
    initCount: 1,
    delaySpawnCount: 7000,
    spawnOffset: 90,
    beastMode: 16,
  },

  {
    type: 'elephant',
    groupType: 'scattered',
    moveSpeed: 25,
    bodyScale: 0.6,
    timeScale: 1,
    explosionPositionY: 30,
    explosionScale: 1.5,
    maxCount: 1,
    initCount: 1,
    delaySpawnCount: 10000,
    spawnOffset: 130,
    beastMode: 17,
  },

  {
    type: 'monster',
    groupType: 'scattered',
    moveSpeed: 20,
    bodyScale: 0.6,
    timeScale: 0.8,
    explosionPositionY: 28.63,
    explosionScale: 1.432,
    maxCount: 1,
    initCount: 1,
    delaySpawnCount: 15000,
    spawnOffset: 130,
    beastMode: 18,
  },
];

export {
  bootSpritesMap,
  atlasMap,
  preloadSpritesMap,
  preloadSvg,
  preloadSpriteSheet,
  ENEMY_CHARACTERISTICS,
  preloadSpines,
  WIDTH,
  HEIGHT,
  DEFAULT_STYLES_BUTTON,
  multiAtlasMap,
  soundPaths,
  preloadFont,
  characters,
  MAX_DEMO_VALUE,
  MAX_DEMO_BUNDLE_VALUE,
  SYMBOLS_CONFIG,
};
