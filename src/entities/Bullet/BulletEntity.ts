import { Physics, type Scene } from 'phaser';
import type { Player } from '../Player';
import type { EnemyEntity } from '../Enemy';
import type { TBulletOptions, TBulletType } from '@/core';
import { BulletShoot } from '../BulletShoot';

export class BulletEntity extends Physics.Arcade.Sprite {
  protected moveSpeed: number;
  public bulletType: TBulletType;
  public target: EnemyEntity | null = null;

  public bulletId: string = '0'; // айдишник для нужной пули уничтожения

  constructor(scene: Scene, options: TBulletOptions) {
    super(scene, 0, 0, options.texture);

    this.scene = scene;

    scene.add.existing(this);

    this.setData('type', 'Bullet');
    this.bulletType = options.bulletType;
    this.moveSpeed = options.moveSpeed;
    this.setScale(options.scale);

    this.setActive(false).setVisible(false);
  }

  shoot(player: Player, offsetX: number, target?: EnemyEntity) {
    this.target = target ?? null;

    const angle = player.rotation - Phaser.Math.DegToRad(90);
    const rotation = angle + Phaser.Math.DegToRad(90);
    const offsetY = 140;

    const newX = Math.cos(angle) * offsetY;
    const newY = Math.sin(angle) * offsetY;

    const rotatedX = Math.cos(rotation) * offsetX;
    const rotatedY = Math.sin(rotation) * offsetX;

    const x = player.x + newX + rotatedX;
    const y = player.y + newY + rotatedY;

    new BulletShoot(this.scene, {
      bulletType: this.bulletType,
      positionX: x,
      positionY: y,
      rotation,
    });

    this.enableBody(true, x, y, true, true);

    this.scene.physics.velocityFromRotation(
      angle,
      this.moveSpeed,
      this.body?.velocity
    );

    this.setRotation(rotation);
  }

  hit() {
    this.target = null;
    this.disableBody(true, true);
  }

  public handleClearTarget() {
    this.target = null;
  }

  addId(id: string) {
    this.bulletId = id;
  }

  clear() {
    this.target = null;
    this.disableBody(true, true);
    this.setActive(false).setVisible(false);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (!this.active || !this.body) return;

    this.setRotation(this.body.velocity.angle() + Phaser.Math.DegToRad(90));
  }
}
