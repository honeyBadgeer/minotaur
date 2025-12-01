import type { SpineGameObject } from '@esotericsoftware/spine-phaser-v3/dist/SpineGameObject';

export type TSightPointerOptions = {
  positionX: number;
  positionY: number;
};

export class SightPointer extends Phaser.GameObjects.Container {
  public spineInstance: SpineGameObject | null = null;

  constructor(scene: Phaser.Scene, options: TSightPointerOptions) {
    super(scene, 0, 0);

    this.spineInstance = this.scene.add.spine(
      0,
      0,
      `sightPointer-json`,
      `sightPointer-atlas`
    );
    scene.add.existing(this);

    this.add(this.spineInstance as SpineGameObject);

    this.spineInstance.setScale(0);
    this.setPosition(options.positionX, options.positionY);
    this.setVisible(false);

    this.handleAnimation('animation');
  }

  public handleVisible(value: boolean, duration: number) {
    if (value) {
      this.handleScaleTween(1, true, duration);
    } else {
      this.handleScaleTween(0, false, duration);
    }
  }

  public handleDestroy() {
    this.destroy();
  }

  public handleAnimation(value: 'animation' | 'shoot') {
    this.spineInstance?.animationState.setAnimation(0, value, true);
  }

  private handleScaleTween(scale: number, visible: boolean, duration: number) {
    this.scene.tweens.add({
      targets: this.spineInstance,
      scale,
      duration,
      ease: 'Elastic.Out',
      onComplete: () => {
        this.setVisible(visible);
      },
    });
  }
}
