import type { SpineGameObject } from '@esotericsoftware/spine-phaser-v3';
import { GameObjects, type Scene } from 'phaser';

export type AnimationType =
  | 'animation'
  | 'animation2'
  | 'animation3'
  | 'animation4'
  | 'animation5'
  | 'animation6';

export const anims = {
  newbie1: 'animation',
  newbie2: 'animation2',
  master1: 'animation3',
  master2: 'animation4',
  expert1: 'animation5',
  expert2: 'animation6',
};

const gunOffsetY = 22;

export class Player extends GameObjects.Container {
  moveSpeed = 500;
  public canGunRotate = true;

  private spine: SpineGameObject;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y);

    this.spine = scene.add.spine(0, 0, 'gun-json', 'gun-atlas');
    this.spine.setScale(0.3);
    this.name = 'spine-gun-container';

    this.spine.setPosition(
      0,
      (-this.spine.animationState.data.skeletonData.height / 2) *
        this.spine.scale +
        gunOffsetY
    );

    this.add(this.spine as unknown as GameObjects.GameObject);
    this.scene.add.existing(this);
  }

  gunRotation(pointer: Phaser.Types.Math.Vector2Like) {
    if (!this.canGunRotate) return;
    const angle = Phaser.Math.Angle.BetweenPoints(this, pointer);

    let deg = Phaser.Math.RadToDeg(angle) + 90;
    deg = ((deg + 180) % 360) - 180;
    deg = Phaser.Math.Clamp(deg, -90, 90);

    this.setRotation(Phaser.Math.DegToRad(deg));
  }

  playAnimation(
    anim: keyof typeof anims,
    loop: boolean,
    updateWeapon: boolean
  ) {
    if (updateWeapon) {
      this.scene.tweens.add({
        targets: this,
        rotation: Phaser.Math.DegToRad(0),
        ease: 'Sine.easeInOut',
        duration: 300,
        onComplete: () => {
          const track = this.spine.animationState.setAnimation(
            0,
            anims[anim],
            loop
          );

          if (track) {
            track.listener = {
              complete: () => {
                this.canGunRotate = true;
              },
            };
          }
        },
      });
    } else {
      this.spine.animationState.setAnimation(0, anims[anim], loop);
    }
  }
}
