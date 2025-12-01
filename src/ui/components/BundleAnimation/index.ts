import { eventBus, GameEvents, SoundManager } from '@/core';

import type { IBundle, TBundlesConfig } from '@/types/types';
import { Animations, GameObjects } from 'phaser';

export class BundleAnmation extends GameObjects.Container {
  private spriteInstance: GameObjects.Sprite | null = null;
  private texture: string;
  private key: IBundle;

  constructor(scene: Phaser.Scene, options: TBundlesConfig) {
    super(scene, 0, 0);

    this.scene = scene;
    this.texture = options.texture;
    this.key = options.key;

    this.spriteInstance = scene.add.sprite(0, 0, options.key);

    this.add(this.spriteInstance);

    scene.add.existing(this);

    this.createEvents();
  }

  createEvents() {
    if (this.key === 'laser') {
      this.animateLaserBundle();
    } else if (this.key === 'grenade') {
      this.animateGrenadeBundle();
    } else if (this.key === 'ufo') {
      this.animateUfoBundle();
    }
  }

  destroyBundle() {
    eventBus.emit(GameEvents.BundleAnimComplete);

    this.destroy();
  }

  private animateLaserBundle() {
    this.spriteInstance?.setOrigin(0.51, 0.85);
    this.spriteInstance?.setScale(1.3);

    const { width, height } = this.scene.scale;
    this.setPosition(width - 150, height * 0.6);

    const prefix = 'Предварительная композиция 5_000';
    const suffix = '.png';

    this.createAnim('anim1', 1, 15, 25, 0, prefix, suffix);
    this.createAnim('anim2', 16, 23, 30, -1, prefix, suffix);
    this.createAnim('anim3', 23, 57, 15, 0, prefix, suffix);

    this.spriteInstance?.play('anim1');
    SoundManager.play('laser', false, 1.0);

    this.spriteInstance?.once(`animationcomplete-anim1`, () => {
      this.spriteInstance?.play('anim2');

      this.scene.tweens.add({
        targets: this,
        x: 200,
        duration: 2300,
        ease: 'Cubic.easeIn',
        onComplete: () => {
          this.spriteInstance?.play('anim3');
        },
      });
    });

    this.spriteInstance?.once(`animationcomplete-anim3`, () => {
      this.destroyBundle();
    });

    this.spriteInstance?.on(
      Animations.Events.ANIMATION_UPDATE,
      (animation: Animations.Animation, frame: Animations.AnimationFrame) => {
        if (animation.key === 'anim1' && frame.index === 10) {
          this.scene.cameras.main.shake(400, 0.015);
          this.scene.cameras.main.flash(800, 250);
        }
        if (animation.key === 'anim2') {
          this.scene.cameras.main.shake(animation.duration, 0.003);
        }
      }
    );
  }

  private createAnim(
    animKey: string,
    animStart: number,
    animend: number,
    animframeRate: number,
    animLoop: number,
    prefix: string,
    suffix: string
  ) {
    if (!this.scene.anims.exists(animKey)) {
      this.scene.anims.create({
        key: animKey,
        frames: this.spriteInstance?.anims.generateFrameNames(this.texture, {
          prefix,
          start: animStart,
          end: animend,
          zeroPad: 2,
          suffix,
        }),
        frameRate: animframeRate,
        repeat: animLoop,
      });
    }
  }

  private animateGrenadeBundle() {
    const { width, height } = this.scene.scale;

    this.scene.cameras.main.shake(400, 0.03);
    this.scene.cameras.main.flash(800, undefined, undefined, 250);

    this.spriteInstance?.setOrigin(0.5);
    this.setPosition(width / 2, height / 3);

    if (!this.scene.anims.exists('grenade')) {
      this.scene.anims.create({
        key: 'grenade',
        frames: 'grenadeBoom',
        frameRate: 10,
        repeat: 0,
      });
    }
    this.spriteInstance?.play('grenade');
    SoundManager.play('grenade', false, 1.0);

    this.spriteInstance?.once(`animationcomplete-grenade`, () => {
      this.destroyBundle();
    });
  }

  private animateUfoBundle() {
    const { width, height } = this.scene.scale;

    this.spriteInstance?.setPosition(width + 200, height - 600);

    if (!this.scene.anims.exists('ufo')) {
      this.scene.anims.create({
        key: 'ufo',
        frames: 'ufoShooting',
        frameRate: 15,
        repeat: -1,
      });
    }

    for (let i = 0; i < 6; i++) {
      const key = `boom-${i}`;
      if (!this.scene.anims.exists(key)) {
        this.scene.anims.create({
          key,
          frames: 'ufoBoom',
          frameRate: 20,
          repeat: 0,
        });
      }
    }

    const booms = [
      { delay: 500, x: width - 300, y: height - 700, anim: 'boom-0' },
      { delay: 1000, x: width - 400, y: height - 550, anim: 'boom-1' },
      { delay: 1500, x: width - 600, y: height - 650, anim: 'boom-2' },
      { delay: 2000, x: width - 800, y: height - 450, anim: 'boom-3' },
      { delay: 3000, x: width - 1000, y: height - 450, anim: 'boom-4' },
      { delay: 3600, x: width - 1200, y: height - 350, anim: 'boom-5' },
    ];

    booms.forEach(({ delay, x, y, anim }) => {
      this.scene.time.delayedCall(delay, () => {
        const boom = this.scene.add.sprite(x, y, 'ufoBoom').setScale(1.2);
        this.add(boom);
        boom.play(anim);
        this.scene.cameras.main.shake(400, 0.006);
      });
    });

    this.spriteInstance?.play('ufo');
    SoundManager.play('ufoStart', false, 1.0);
    SoundManager.play('ufo', false, 1.0);

    this.scene.tweens.add({
      targets: this.spriteInstance,
      x: -500,
      duration: 5000,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        this.destroyBundle();
      },
    });
  }
}
