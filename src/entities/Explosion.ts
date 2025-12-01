import type { GameObjects } from 'phaser';

export type TExplosionOptions = {
  positionX: number;
  positionY: number;
  rotation: number;
  scale: number;
};

export class Explosion extends Phaser.GameObjects.Container {
  public spriteBoom: GameObjects.Sprite | null = null;

  constructor(scene: Phaser.Scene, options: TExplosionOptions) {
    super(scene, 0, 0);

    this.spriteBoom = scene.add.sprite(0, 0, 'boom');
    this.add(this.spriteBoom);

    this.setScale(options.scale);
    this.setRotation(options.rotation);
    this.setPosition(options.positionX, options.positionY);

    scene.add.existing(this);

    const key = `explosion-boom`;

    if (!scene.anims.exists(key)) {
      scene.anims.create({
        key,
        frames: 'boom',
        frameRate: 25,
        repeat: 0,
      });
    }

    this.spriteBoom.play(key);
    this.spriteBoom.once(`animationcomplete-${key}`, () => {
      this.destroy();
    });
  }
}
