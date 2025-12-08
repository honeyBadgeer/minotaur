import type { SymbolType } from '@/types/types';
import type { SpineGameObject } from '@esotericsoftware/spine-phaser-v3/dist/SpineGameObject';
import { GameObjects, type Scene } from 'phaser';

export class Symbol extends GameObjects.Container {
  public spineInstance: SpineGameObject | null = null;

  private symbolType: SymbolType;

  constructor(scene: Scene, type: SymbolType, x: number, y: number) {
    super(scene, 0, 0);

    this.setScale(0.7);

    this.scene = scene;
    this.symbolType = type;

    this.spineInstance = this.scene.add.spine(
      x,
      y,
      `${this.symbolType}-json`,
      `${this.symbolType}-atlas`
    );

    this.scene.add.existing(this);

    this.add(this.spineInstance as SpineGameObject);

    this.spineInstance.animationState.setAnimation(0, 'win', true);
  }
}
