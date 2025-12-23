import type { SpineGameObject } from '@esotericsoftware/spine-phaser-v3/dist/SpineGameObject';

export class MinotaurFull extends Phaser.GameObjects.Container {
  public spineInstance: SpineGameObject | null = null;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.spineInstance = this.scene.add.spine(
      0,
      0,
      `minotaurFull-json`,
      `minotaurFull-atlas`
    );
    scene.add.existing(this);

    this.add(this.spineInstance as SpineGameObject);

    this.spineInstance.setOrigin(0.5);
    this.spineInstance.setScale(0.7, 0.8).setDepth(100);
    this.spineInstance?.animationState.setAnimation(0, '1_idle', true);
  }

  handleStartAnimation(x: number, y: number) {}
}
