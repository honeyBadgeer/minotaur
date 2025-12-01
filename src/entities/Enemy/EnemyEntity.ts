import { GameObjects, Physics, Tweens, type Scene } from 'phaser';
import type { BeastMode, EnemyType, Sides, TEnemyOptions } from '@/types/types';
import { Explosion } from '../Explosion';
import { SpineGameObject } from '@esotericsoftware/spine-phaser-v3';

import { baseEnemyAngles, enemySpawnSides } from '../lib/constants';
import {
  getDirectionWithVariance,
  getEnemySpawnOffset,
  getSpawnPosition,
  getNumberUUID,
} from '../lib/helpers';
import { nameTextStyle } from '@/ui/components/CharacterCarousel/lib/textStyles';
import { SoundManager } from '@/core/managers';
import { eventBus, GameEvents } from '@/core';
import { SightPointer } from '../SightPointer';

const animatedPointerDuration = 400;

export class EnemyEntity extends GameObjects.Container {
  private static innerRect: Phaser.Geom.Rectangle;
  private static outerRect: Phaser.Geom.Rectangle;

  static setZoneRects(
    inner: Phaser.Geom.Rectangle,
    outer: Phaser.Geom.Rectangle
  ) {
    EnemyEntity.innerRect = inner;
    EnemyEntity.outerRect = outer;
  }

  protected moveSpeed: number;
  public explosionScale: number;

  private shakeTween: Tweens.Tween | null = null;
  private spawnSide!: Sides;
  private hitTintUntil = 0;
  private direction = { x: 0, y: 0 };
  private varianceDegrees = 10;
  private explosionDelay = 900; // начинаем показывать анимация взрыва до окончания смерти
  private winText: GameObjects.Text | null = null;
  private bodyWidth = 0;
  private bodyHeight = 0;

  public spineInstance: SpineGameObject | null = null;
  public sightSpineInstance: SightPointer | null = null;
  public enemyType: EnemyType;
  public explosionPositionY: number;
  public bodyScale: number;
  public timeScale: number;
  public pending = false;
  public isDeathAnimation = false;
  public isWaitingToHit = false;

  public readyToInteract = false;
  public markedToDestroy = false;
  public deathTime = 0;

  public enemyId = getNumberUUID();
  public beastMode: BeastMode;

  constructor(scene: Scene, options: TEnemyOptions) {
    super(scene, 0, 0);

    this.scene = scene;
    this.setData('type', 'Enemy');
    this.enemyType = options.type;
    this.explosionPositionY = options.explosionPositionY;
    this.bodyScale = options.bodyScale;
    this.timeScale = options.timeScale;
    this.moveSpeed = options.moveSpeed;
    this.explosionScale = options.explosionScale;
    this.beastMode = options.beastMode;

    this.spineInstance = this.scene.add.spine(
      0,
      0,
      `${this.enemyType}-json`,
      `${this.enemyType}-atlas`
    );
    this.createWinText();

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.setSpawn();
  }

  activateSpine() {
    this.add(this.spineInstance as SpineGameObject);

    // тело самого контейнера
    const body = this.getBody();

    // размеры скелетона спайна
    const spineWidth =
      this.spineInstance?.animationState.data.skeletonData.width ?? 0;
    const spineHeight =
      this.spineInstance?.animationState.data.skeletonData.height ?? 0;

    // мастшатбы спайна после скейла
    const spineScaleX = this.spineInstance?.scaleX ?? 0;
    const spineScaleY = this.spineInstance?.scaleY ?? 0;

    // рили размер
    this.bodyWidth = spineWidth * spineScaleX * this.bodyScale;
    this.bodyHeight = spineHeight * spineScaleY * this.bodyScale;

    body.setSize(this.bodyWidth, this.bodyHeight);
    body.setOffset(-this.bodyWidth / 2, -this.bodyHeight / 2);

    this.handleOnInteractive();
  }

  handleSpineTimeScale(value: number) {
    if (this.spineInstance) this.spineInstance.animationState.timeScale = value;
  }

  handleOnInteractive() {
    this.setInteractive(
      new Phaser.Geom.Rectangle(
        -this.bodyWidth / 2,
        -this.bodyHeight / 2,
        this.bodyWidth,
        this.bodyHeight
      ),
      Phaser.Geom.Rectangle.Contains
    );
  }
  handleOffInteractive() {
    this.disableInteractive();
  }
  handleOnMarkToDestroy() {
    this.markedToDestroy = true;
  }
  handleOffMarkToDestroy() {
    this.handleOffWaitingToHit();
    this.markedToDestroy = false;
  }

  handleOnReadyToInteract() {
    this.readyToInteract = true;
  }
  handleOffReadyToInteract() {
    this.readyToInteract = false;
  }

  handleOnWaitingToHit() {
    this.isWaitingToHit = true;
  }
  handleOffWaitingToHit() {
    this.isWaitingToHit = false;
  }

  setSpawn(grouped?: {
    positions: { x: number; y: number };
    spawnSide: Sides;
    direction: Phaser.Math.Vector2;
  }) {
    this.deathTime = new Date().getTime();
    this.handleResetState();

    const { width, height } = this.scene.sys.canvas;
    const offset = getEnemySpawnOffset(this.enemyType);

    if (grouped) {
      this.spawnSide = grouped.spawnSide;

      this.setPosition(grouped.positions.x, grouped.positions.y);

      this.direction = grouped.direction;
    } else {
      const spawnSide = Phaser.Math.RND.pick(enemySpawnSides);
      this.spawnSide = spawnSide;

      const { x, y } = getSpawnPosition(spawnSide, offset, height, width);
      this.setPosition(x, y);

      const baseAngle = baseEnemyAngles[this.spawnSide];
      const direction = getDirectionWithVariance(
        baseAngle,
        this.varianceDegrees
      );
      this.direction = direction;
    }
  }

  public onHitStart(origin: 'bullet' | 'bundle') {
    this.handleOffWaitingToHit();
    if (this.isDeathAnimation || this.pending) return;

    this.pending = true;

    const body = this.getBody();
    body.setEnable(false).setVelocity(0);

    this.handleSpineTimeScale(0);

    this.shakeTween = this.scene.tweens.add({
      targets: this.spineInstance,
      x: this.spineInstance!.x + 2,
      y: this.spineInstance!.y + 2,
      duration: 50,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    if (origin === 'bundle') {
      this.setTint();
      this.hitTintUntil = this.scene.time.now + 1500;
    }
  }

  public resolveHit(action: 'hit' | 'miss', winSum?: number) {
    this.winText?.setText(winSum ? String(winSum) : '');

    if (action === 'hit') {
      this.setDeathAnmaton();
    } else {
      this.setContinueMoving();
    }
  }

  clearPending() {
    this.pending = false;
    this.shakeTween?.stop();
    this.spineInstance?.setPosition(0);
  }

  enableFromPool() {
    this.setActive(true);
    this.setVisible(true);
    this.scene.physics.world.enable(this);
    this.activateMotion();
  }

  activateMotion() {
    const body = this.getBody();
    body.setVelocity(
      this.direction.x * this.moveSpeed,
      this.direction.y * this.moveSpeed
    );

    if (body && this.spineInstance) {
      // анимация ходьбы

      this.spineInstance.animationState.setAnimation(0, 'moving', true);

      // поворачиваем контейнер в зависимости от стороны
      this.setRotation(Math.atan2(body.velocity.y, body.velocity.x));

      this.spineInstance.scaleY = Math.abs(this.spineInstance.scaleY);
      // если выходят с правой стороны, то еще и флипаем
      const flipSides = ['rightTop', 'rightDown', 'topRight', 'downRight'];
      if (flipSides.includes(this.spawnSide)) {
        this.spineInstance.scaleY = -Math.abs(this.spineInstance.scaleY);
      }
    }
  }

  createWinText() {
    this.winText = this.scene.add
      .text(0, 0, '', nameTextStyle)
      .setOrigin(0.5, 0.5);
    this.winText.setDepth(1000);
  }

  resetWinText() {
    this.winText
      ?.setVisible(false)
      .setActive(false)
      .setX(this.x)
      .setY(this.y)
      .setAlpha(1);
  }

  showWinText() {
    SoundManager.play('winning');
    this.winText?.setX(this.x).setY(this.y).setActive(true).setVisible(true);
    this.scene.tweens.add({
      targets: this.winText,
      y: this.winText!.y - 50,
      duration: 400,
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.winText,
          alpha: { from: 1, to: 0 },
          duration: 3000,
          onComplete: () => {
            this.resetWinText();
          },
        });
      },
    });
  }

  returnToPool() {
    this.deathTime = new Date().getTime();

    const body = this.body as Physics.Arcade.Body;
    body.setVelocity(0);
    this.scene.physics.world.disable(this);
    this.spineInstance?.animationState.setEmptyAnimation(0);
    this.isDeathAnimation = false;
    if (this.markedToDestroy) {
      this.handleOffMarkToDestroy();
      eventBus.emit(GameEvents.SetSightMode, false);
    }
    this.handleOnInteractive();
    this.handleResetState();
  }

  private handleResetState() {
    this.handleOffWaitingToHit();
    this.handleSpineTimeScale(this.timeScale);
    this.setVisible(false);
    this.setActive(false);
    this.handleOffReadyToInteract();
  }

  setDeathAnmaton() {
    this.clearPending();
    this.isDeathAnimation = true;

    this.handleSpineTimeScale(1);
    const deathAnim = this.spineInstance?.animationState.setAnimation(
      0,
      'Death',
      false
    );

    const body = this.getBody();

    if (deathAnim) {
      this.resetWinText();
      this.scene.time.delayedCall(this.explosionDelay, () => {
        this.showWinText();
        new Explosion(this.scene, {
          positionX: this.x,
          positionY: this.y - this.explosionPositionY,
          rotation: Math.atan2(body.velocity.y, body.velocity.x),
          scale: this.explosionScale,
        });
        this.returnToPool();
      });
    }
  }

  public setContinueMoving() {
    this.clearPending();
    const body = this.getBody();

    body.setEnable(true);
    this.handleSpineTimeScale(1);
    body.setVelocity(
      this.direction.x * this.moveSpeed,
      this.direction.y * this.moveSpeed
    );
    this.handleOnInteractive();
  }

  setTint() {
    this.spineInstance?.skeleton.slots.forEach((slot) => {
      slot.color.set(1, 0, 0, 1);
    });
  }
  clearTint() {
    this.spineInstance?.skeleton.slots.forEach((slot) => {
      slot.color.set(1, 1, 1, 1);
    });
  }

  private getBody(): Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  public handleAddSightSpine() {
    this.sightSpineInstance = new SightPointer(this.scene, {
      positionX: this.spineInstance?.x ?? 0,
      positionY: this.spineInstance?.y ?? 0,
    });
    this.sightSpineInstance.handleAnimation('shoot');
    this.sightSpineInstance.handleVisible(true, animatedPointerDuration);
    this.add(this.sightSpineInstance);
  }

  public handleRemoveSightSpine() {
    if (this.sightSpineInstance) this.sightSpineInstance.handleDestroy();
  }

  preUpdate(time: number): void {
    // если больше нуля, значит тинт щас происходит и если время больше длительности то очищаем
    if (this.hitTintUntil > 0 && time >= this.hitTintUntil) {
      this.clearTint();
      this.hitTintUntil = 0;
    }

    // обновеление состояния входа и выхода из зоны
    if (!this.active) return;
    if (!EnemyEntity.innerRect || !EnemyEntity.outerRect) return;

    const body = this.getBody();
    const bounds = new Phaser.Geom.Rectangle(
      body.x,
      body.y,
      body.width,
      body.height
    );

    const isFullyInside = Phaser.Geom.Rectangle.ContainsRect(
      EnemyEntity.innerRect,
      bounds
    );
    const isFullyOutside = !Phaser.Geom.Rectangle.Overlaps(
      EnemyEntity.outerRect,
      bounds
    );

    if (isFullyInside && !this.readyToInteract) {
      this.handleOnReadyToInteract();
    }

    if (this.readyToInteract && isFullyOutside) {
      this.returnToPool();
    }
  }

  public readyToHit(): boolean {
    return this.readyToInteract && !this.pending && !this.isDeathAnimation;
  }
  public readyToSightAutomaticShoot(): boolean {
    return this.readyToHit() && this.markedToDestroy && !this.isWaitingToHit;
  }

  public returnMoveSpeed() {
    const body = this.getBody();
    body.setVelocity(
      this.direction.x * this.moveSpeed,
      this.direction.y * this.moveSpeed
    );
  }
}
