import type { GameObjects } from 'phaser';

export class BackgroundVideo extends Phaser.GameObjects.Container {
  private spriteInstance: GameObjects.Sprite | null = null;
  private animationKey: string;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.spriteInstance = scene.add.sprite(0, 0, 'backgroundVideo');
    this.spriteInstance.setOrigin(0);

    this.add(this.spriteInstance);

    scene.add.existing(this);

    this.animationKey = `video-backgroundVideo`;

    if (!scene.anims.exists(this.animationKey)) {
      scene.anims.create({
        key: this.animationKey,
        frames: 'backgroundVideo',
        frameRate: 15,
        repeat: -1,
      });
    }

    this.spriteInstance.play(this.animationKey);
  }
}
