import type { TBulletType } from '@/core';
import type { SpineGameObject } from '@esotericsoftware/spine-phaser-v3/dist/SpineGameObject';

export type TBulletImpactOptions = {
  type: TBulletType;
};

export class BulletImpact extends Phaser.GameObjects.Container {
  public spineInstance: SpineGameObject | null = null;

  constructor(scene: Phaser.Scene, options: TBulletImpactOptions) {
    super(scene, 0, 0);

    this.spineInstance = this.scene.add.spine(
      0,
      0,
      `${options.type}BulletImpact-json`,
      `${options.type}BulletImpact-atlas`
    );
    scene.add.existing(this);

    this.add(this.spineInstance as SpineGameObject);

    this.setScale(0.07);
  }

  handleStartAnimation(x: number, y: number) {
    this.setActive(true).setVisible(true);
    this.setPosition(x, y);
    this.spineInstance?.animationState.setAnimation(0, 'animation', false);

    this.spineInstance?.animationState.addListener({
      complete: () => {
        this.setActive(false).setVisible(false);
      },
    });
  }
}
