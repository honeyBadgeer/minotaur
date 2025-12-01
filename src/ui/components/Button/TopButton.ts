import type { Scene } from 'phaser';
import { Button } from './button';

export class TopButton extends Button {
  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y);
  }
}
