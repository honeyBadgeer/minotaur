import type { Types } from 'phaser';
import type { Button } from './button';

export type ButtonConfig = {
  textureKey?: string;
  atlasKey?: string;
  frameKey?: string;
  iconKey?: string;
  text?: string;
  textStyle?: Types.GameObjects.Text.TextStyle;
  padding?: number;
  onOver?: (btn: Button) => void;
  onOut?: (btn: Button) => void;
  onDown?: (btn: Button) => void;
  onUp?: (btn: Button) => void;
};
