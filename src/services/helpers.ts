import type { Loader, Scene } from 'phaser';
import type {
  EnemyType,
  IAtlasData,
  IBundle,
  IMultiAtlasData,
  SymbolType,
} from '../types/types';
import {
  BUNDLES_CONFIG,
  ENEMY_CHARACTERISTICS,
  SYMBOLS_CONFIG,
  WIDTH,
} from './constants';
import type { TCharacterKey } from '@/core';

interface SpineData {
  json: string;
  atlas: string;
}
interface SpritesheetData {
  path: string;
  frameWidth: number;
  frameHeight: number;
}

const preloadAssets = (
  loader: Loader.LoaderPlugin,
  type:
    | 'image'
    | 'atlas'
    | 'multiatlas'
    | 'audio'
    | 'spineJson'
    | 'spineAtlas'
    | 'spine'
    | 'svg'
    | 'spritesheet'
    | 'font',
  map:
    | Record<string, string>
    | Record<string, IAtlasData>
    | Record<string, IMultiAtlasData>
    | Record<string, SpineData>
    | Record<string, SpritesheetData>
) => {
  Object.entries(map).forEach(([key, data]) => {
    if (type === 'image') loader.image(key, data);
    if (type === 'atlas') loader.atlas(key, data.imageUrl, data.jsonUrl);
    if (type === 'multiatlas') {
      loader.multiatlas(key, data.jsonUrl, data.basePath);
    }
    if (type === 'spine') {
      loader.spineAtlas(`${key}-atlas`, data.atlas, true);
      loader.spineJson(`${key}-json`, data.json, data.atlas);
    }
    if (type === 'svg') loader.svg(key, data);
    if (type === 'spritesheet')
      loader.spritesheet(key, data.path, {
        frameWidth: data.frameWidth,
        frameHeight: data.frameHeight,
      });
    if (type === 'font') loader.font(key, data, 'truetype');
  });
};

const addCenteredImage = (
  scene: Scene,
  key: string,
  y: number
): Phaser.GameObjects.Image => {
  const image = scene.add.image(scene.scale.width / 2, y, key).setOrigin(0, 0);
  image.setX(alignToCenter(image.width));
  return image;
};

const alignToCenter = (width: number): number => {
  return (WIDTH - width) / 2;
};

const getSearchParams = (name: string) =>
  new URL(String(document.location)).searchParams.get(name);

function getCharacteristic(type: EnemyType) {
  return (
    ENEMY_CHARACTERISTICS.find((item) => item.type === type) ??
    ENEMY_CHARACTERISTICS[0]
  );
}
function getSymbol(value: number): SymbolType {
  const symbol =
    SYMBOLS_CONFIG.find((item) => item.value === value) ?? SYMBOLS_CONFIG[0];

  return symbol.key;
}
function getBundleConfig(key: IBundle) {
  const currentBundle =
    BUNDLES_CONFIG.find((item) => item.key === key) ?? BUNDLES_CONFIG[0];

  return currentBundle;
}

function getBetsByCharacter(key: TCharacterKey, betLadderMDE: number[]) {
  const indexMap: Record<TCharacterKey, number> = {
    newbie: 0,
    master: 1,
    expert: 2,
  };

  const currentIndex = indexMap[key];
  return betLadderMDE.slice(currentIndex * 4, currentIndex * 4 + 4);
}

export {
  preloadAssets,
  addCenteredImage,
  alignToCenter,
  getSearchParams,
  getCharacteristic,
  getBundleConfig,
  getBetsByCharacter,
  getSymbol,
};
