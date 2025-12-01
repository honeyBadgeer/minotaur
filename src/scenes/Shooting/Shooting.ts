import { CoreEvents, GameEvents } from '@/core/events/events';
import { anims, EnemyEntity, Player } from '@/entities';
import { BulletFactory } from '@/entities/Bullet';
import { BulletEntity } from '@/entities/Bullet/BulletEntity';
import { getBundleConfig } from '@/services/helpers';
import type { BeastMode, EnemyId, EnemyType, IBundle } from '@/types/types';
import { BundleAnmation } from '@/ui/components/BundleAnimation';
import { GameObjects, Physics, Scene } from 'phaser';
import { eventBus } from '@/core/events';
import { SoundManager, type SoundKey } from '@/core/managers';
import { GameStates, type TBulletType } from '@/core/Model/types';
import { BulletImpact } from '@/entities/BulletImpact';
import { Debug } from '@/ui/components/Debug';

const maxCreatedBullets = 50;
const controlBarWidth = 1300;
const controlBarHeight = 130;
interface ShootArea {
  mainRect: Phaser.Geom.Rectangle;
  bottomRect: Phaser.Geom.Rectangle;
}

export class Shooting extends Scene {
  private player!: Player;
  private debugInfo: Debug | null = null;

  private shootAreaDebug: Phaser.GameObjects.Graphics | null = null;

  private isPointerDown = false;

  private lastPointerX = 0;
  private lastPointerY = 0;
  private lastShotTime = 0;
  private fireRate = 150;

  currentGunAnimation: keyof typeof anims = 'newbie1';
  character: string = 'newbie';

  public autoModeEnemiesGroup: EnemyType[] = [];
  public bulletsGroup: Phaser.Physics.Arcade.Group | null = null;
  public bulletsImpactGroup: GameObjects.Group | null = null;
  public autoMode = false;
  public sightMode = false;
  public selectedEnemy: EnemyEntity | null = null;
  public doubleFireMode = false;

  public enemies!: EnemyEntity[];

  constructor() {
    super('ShootingScene');
  }

  create() {
    this.input.setDefaultCursor('none');
    this.createBackground();
    this.setDefaultStates();
    this.createShootingArea();
    this.activateShootArea();
    this.handlePointer();
    this.addBullets();
    this.addBulletsImpact();
    this.setSceneZone();
    this.handleModeChanged();

    this.debugInfo = new Debug(this);

    eventBus.emit(CoreEvents.SetGameState, GameStates.IDLE);
  }

  createShootingArea() {
    this.shootAreaDebug = this.add.graphics().setDepth(2);
  }

  public handlePointer() {
    this.shootAreaDebug?.on('pointerdown', () => {
      eventBus.emit(GameEvents.POINTER_DOWN);
    });

    this.shootAreaDebug?.on('pointerup', () => {
      this.isPointerDown = false;

      // если при отпускании пойнтера был включен автомод, то отключаем его
      if (this.autoMode) eventBus.emit(GameEvents.SetAutoMode);
    });
  }

  public setDefaultStates() {
    this.doubleFireMode = false;
    this.autoMode = false;
    this.sightMode = false;
    this.isPointerDown = false;
    this.autoModeEnemiesGroup = [];
  }
  public setStateOnError() {
    this.autoMode = false;
    this.sightMode = false;
    this.autoModeEnemiesGroup = [];
    this.isPointerDown = false;
    this.clearBullets();
    this.clearSelectedEnemy();
    this.handleResetStates();
  }

  private handleResetStates() {
    this.enemies.forEach((e) => e.handleOffWaitingToHit());
    this.bulletsGroup?.getChildren().forEach((bullet) => {
      if (bullet instanceof BulletEntity) bullet.handleClearTarget();
    });
  }

  public createOverlap(
    enemyHitCallback: (beastMode: BeastMode, enemyId: EnemyId) => void
  ) {
    if (this.enemies && this.bulletsGroup) {
      this.physics.add.overlap(
        this.enemies,
        this.bulletsGroup,
        (enemy, bullet) => {
          if (
            enemy instanceof GameObjects.Container &&
            bullet instanceof Physics.Arcade.Sprite
          ) {
            this.handleHitEnemyWithBullet(enemy, bullet, enemyHitCallback);
          }
        }
      );
    }
  }

  updateWeapon() {
    this.currentGunAnimation = this.currentGunAnimation.replace(
      /.$/,
      this.doubleFireMode ? '2' : '1'
    ) as typeof this.currentGunAnimation;

    if (!this.autoMode && !this.sightMode) this.player.canGunRotate = false;

    this.player.playAnimation(this.currentGunAnimation, false, true);
  }

  handleModeChanged() {
    eventBus.on(GameEvents.ModeChanged, () => {
      this.updateWeapon();
    });
  }

  public handleGameObjectDown?: (
    pointer: Phaser.Input.Pointer,
    item: Phaser.GameObjects.Container
  ) => void;

  public setSelectedEnemy(
    _: Phaser.Input.Pointer,
    item: Phaser.GameObjects.Container
  ) {
    if (item instanceof EnemyEntity) {
      if (this.selectedEnemy === item) return;

      if (this.selectedEnemy !== item) {
        this.selectedEnemy?.handleOffMarkToDestroy();
        this.selectedEnemy?.handleRemoveSightSpine();
        this.clearBullets();
      }

      item.handleOnMarkToDestroy();
      this.selectedEnemy?.handleOffWaitingToHit();
      this.selectedEnemy = item;

      this.selectedEnemy.handleAddSightSpine();
    }
  }

  clearSelectedEnemy = () => {
    this.selectedEnemy?.handleOffMarkToDestroy();
    this.selectedEnemy?.handleRemoveSightSpine();
    this.selectedEnemy = null;
  };

  setSightMode(isSightMode: boolean) {
    this.autoMode = false;
    this.sightMode = isSightMode;

    eventBus.emit(GameEvents.UPDATE_POINTER_IMAGE, isSightMode);

    if (isSightMode) {
      this.deactivateShootArea();
      this.handleGameObjectDown = (pointer, item) => {
        this.setSelectedEnemy(pointer, item);
      };

      this.input.on('gameobjectdown', this.handleGameObjectDown);
    } else {
      this.activateShootArea();
      this.input.off('gameobjectdown', this.handleGameObjectDown);
      this.handleGameObjectDown = undefined;
      this.clearSelectedEnemy();
      this.clearBullets();
    }
  }

  private handleSightFiring() {
    const target =
      this.selectedEnemy &&
      !this.selectedEnemy.isWaitingToHit &&
      this.selectedEnemy.readyToSightAutomaticShoot();

    if (target && this.selectedEnemy) {
      this.handleGunRotation(this.selectedEnemy.x, this.selectedEnemy.y);

      if (this.doubleFireMode) {
        this.handleTwoTimeShoot(this.player, this.selectedEnemy);
      } else {
        this.handleOneTimeShoot(this.player, this.selectedEnemy);
      }
    }
  }

  activateBundle(key: IBundle) {
    if (this.enemies) {
      const bundle = getBundleConfig(key);

      new BundleAnmation(this, bundle);
    }
  }

  public createBackground() {
    this.add.image(0, 0, 'shootingBackground').setOrigin(0).setScale(0.5);
  }

  public createPlayer(character: string) {
    this.player = new Player(this, 0, 0);

    const offsetY = 90;
    const targetY = this.game.canvas.height - offsetY;

    this.player.setPosition(
      this.game.canvas.width / 2,
      this.game.canvas.height + offsetY
    );

    const startMap: Record<string, keyof typeof anims> = {
      newbie: 'newbie1',
      master: 'master1',
      expert: 'expert1',
    };

    this.currentGunAnimation = startMap[character] ?? 'newbie1';
    this.character = character;

    this.player.playAnimation(this.currentGunAnimation, false, false);

    this.tweens.add({
      targets: this.player,
      y: { from: this.game.canvas.height + offsetY, to: targetY },
      ease: 'Quad.Out',
      duration: 500,
      delay: 200,
    });
  }

  public activateShootArea() {
    const w = this.sys.canvas.width;
    const h = this.sys.canvas.height;

    const mainRect = new Phaser.Geom.Rectangle(0, 0, w, h);
    const bottomRect = new Phaser.Geom.Rectangle(
      w / 2 - controlBarWidth / 2,
      h - controlBarHeight,
      controlBarWidth,
      controlBarHeight
    );

    this.shootAreaDebug?.setInteractive({
      hitArea: { mainRect, bottomRect },
      hitAreaDebug: { mainRect, bottomRect },

      hitAreaCallback: (hitArea: ShootArea, x: number, y: number) => {
        return (
          Phaser.Geom.Rectangle.Contains(hitArea.mainRect, x, y) &&
          !Phaser.Geom.Rectangle.Contains(hitArea.bottomRect, x, y)
        );
      },
    });
  }

  public deactivateShootArea() {
    this.isPointerDown = false;
    if (this.shootAreaDebug) this.shootAreaDebug.disableInteractive();
  }

  handleOnPointerDown() {
    this.isPointerDown = true;
  }

  public handleOffPointerDown() {
    this.isPointerDown = false;
  }

  public addBullets() {
    this.bulletsGroup = this.physics.add.group({
      maxSize: maxCreatedBullets,
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true,
      runChildUpdate: true,
    });
    this.bulletsGroup.name = 'Bullets';
  }

  public handleBullets(value: TBulletType) {
    if (!this.bulletsGroup) return;

    this.bulletsGroup.clear(false, true);

    for (let i = 0; i < maxCreatedBullets; i++) {
      const bullet = BulletFactory.generate(value, this);
      bullet.setActive(false).setVisible(false);
      this.bulletsGroup.add(bullet);
    }
  }

  public addBulletsImpact() {
    this.bulletsImpactGroup = this.add.group({
      maxSize: 34,
    });
    this.bulletsImpactGroup.name = 'Bullets Impact';
  }

  public handleBulletsImpact(value: TBulletType) {
    if (!this.bulletsImpactGroup) return;

    this.bulletsImpactGroup.clear(false, true);

    for (let i = 0; i < 34; i++) {
      const bulletImpact = new BulletImpact(this, {
        type: value,
      });
      bulletImpact.setActive(false).setVisible(false);
      this.bulletsImpactGroup.add(bulletImpact);
    }
  }

  public clearBullets() {
    if (this.bulletsGroup) {
      this.bulletsGroup
        .getChildren()
        .forEach((bullet) => (bullet as BulletEntity).clear());
    }
  }

  // устанавливаем группу для сцены стрельбы
  public setEnemies(group: EnemyEntity[]) {
    this.enemies = group;
  }

  // попадание пули по врагам
  private handleHitEnemyWithBullet(
    enemy: GameObjects.Container,
    bullet: Phaser.Physics.Arcade.Sprite,
    enemyHitCallback: (beastMode: BeastMode, enemyId: EnemyId) => void
  ): void {
    if (enemy instanceof EnemyEntity && bullet instanceof BulletEntity) {
      const isBulletActive = bullet.active;
      const isEnemyActive = enemy.readyToHit();

      const isSelectedEnemy = isEnemyActive && enemy.markedToDestroy;
      const isAutoModeEnemy =
        bullet &&
        isEnemyActive &&
        this.autoModeEnemiesGroup.includes(enemy.enemyType) &&
        enemy.enemyId === bullet.target?.enemyId;

      // если режимы автоигра или прицел, то при стрельбе игнорируем не выбранные типы врагов
      const targetingEnemy =
        (this.sightMode && isSelectedEnemy) ||
        (this.autoMode && isAutoModeEnemy) ||
        (!this.sightMode && !this.autoMode && isEnemyActive);

      if (isBulletActive && targetingEnemy) {
        const bullets = this.bulletsGroup?.getMatching(
          'bulletId',
          bullet.bulletId
        ) as BulletEntity[];
        bullets.forEach((b) => {
          b.hit();
          const impact =
            this.bulletsImpactGroup?.getFirstDead() as BulletImpact;

          const bulletX = b.x;
          const bulletY = b.y;
          const enemyX = enemy.x;
          const enemyY = enemy.y;

          // умножитель, чем меньше значение, тем ближе к центру врвга
          const t = 0.4;

          const impactX = bulletX + (enemyX - bulletX) * t;
          const impactY = bulletY + (enemyY - bulletY) * t;

          if (impact) impact.handleStartAnimation(impactX, impactY);
        });
        enemyHitCallback(enemy.beastMode, enemy.enemyId);
      }
    }
  }

  public handleShoot(
    bullet: BulletEntity,
    player: Player,
    offsetX: number,
    target: EnemyEntity | undefined
  ) {
    if (target) {
      bullet.shoot(player, offsetX, target);
      target.handleOnWaitingToHit();
    } else {
      bullet.shoot(player, offsetX, undefined);
    }

    const shotSound: Record<string, SoundKey> = {
      newbie: 'shotNewbie',
      master: 'shotMaster',
      expert: 'shotExpert',
    };
    SoundManager.play(shotSound[this.character]);

    if (player.canGunRotate)
      this.player.playAnimation(this.currentGunAnimation, false, false);
  }

  private handleOneTimeShoot(player: Player, target?: EnemyEntity) {
    const id = `${Date.now()}`;
    const bullet = this.bulletsGroup?.getFirstDead() as BulletEntity;
    bullet.addId(id);
    eventBus.emit(GameEvents.SHOOT, bullet, player, 0, target);
  }

  private handleTwoTimeShoot(player: Player, target?: EnemyEntity) {
    const offsets: Partial<Record<keyof typeof anims, number>> = {
      newbie2: 20,
      master2: 15,
      expert2: 15,
    };
    const offsetX = offsets[this.currentGunAnimation] ?? 0;
    // находим все неактивные пули
    const deadBullets = this.bulletsGroup?.getMatching(
      'active',
      false
    ) as BulletEntity[];

    const id = `${Date.now()}`;

    const bullet1 = deadBullets[0];
    const bullet2 = deadBullets[1];

    if (deadBullets?.length >= 2) {
      bullet1.addId(id);
      bullet2.addId(id);
      eventBus.emit(GameEvents.SHOOT, bullet1, player, -offsetX, target);
      eventBus.emit(GameEvents.SHOOT, bullet2, player, offsetX, target);
    }
  }

  private handleAutomaticFireOneBullet(
    player: Player,
    time: number,
    target?: EnemyEntity
  ) {
    this.handleOneTimeShoot(player, target);

    this.lastShotTime = time;
  }

  private handleAutomaticFireTwoBullets(
    player: Player,
    time: number,
    target?: EnemyEntity
  ) {
    this.handleTwoTimeShoot(player, target);
    this.lastShotTime = time;
  }

  // своя стрельба
  private handlePlayerFiring(time: number) {
    if (this.isPointerDown && time - this.lastShotTime > this.fireRate) {
      // если X2
      if (this.doubleFireMode) {
        this.currentGunAnimation = this.currentGunAnimation.replace(
          /.$/,
          '2'
        ) as typeof this.currentGunAnimation;

        this.handleAutomaticFireTwoBullets(this.player, time);
      } else {
        // если одиночные выстрелы
        this.currentGunAnimation = this.currentGunAnimation.replace(
          /.$/,
          '1'
        ) as typeof this.currentGunAnimation;

        this.handleAutomaticFireOneBullet(this.player, time);
      }
    }
  }

  // стрельба при автогейме
  private handleAutoFiring() {
    if (this.enemies && this.autoModeEnemiesGroup) {
      const aliveEnemy = this.enemies.find(
        (e) =>
          e.readyToHit() &&
          !e.isWaitingToHit &&
          this.autoModeEnemiesGroup.includes(e.enemyType)
      );

      if (aliveEnemy) {
        this.handleGunRotation(aliveEnemy.x, aliveEnemy.y);

        if (this.doubleFireMode) {
          this.handleTwoTimeShoot(this.player, aliveEnemy);
        } else {
          this.handleOneTimeShoot(this.player, aliveEnemy);
        }
      }
    }
  }

  setSceneZone() {
    const w = this.sys.canvas.width;
    const h = this.sys.canvas.height;

    const baseRect = new Phaser.Geom.Rectangle(0, 0, w, h);
    const innerRect = Phaser.Geom.Rectangle.Clone(baseRect);
    Phaser.Geom.Rectangle.Inflate(innerRect, -10, -10); // чтобы не мелькало

    const outerRect = Phaser.Geom.Rectangle.Clone(baseRect);
    Phaser.Geom.Rectangle.Inflate(outerRect, 10, 10); // чтобы не мелькало

    EnemyEntity.setZoneRects(innerRect, outerRect);
  }

  clearAutoMode() {
    this.autoMode = false;
    this.autoModeEnemiesGroup = [];

    this.handleResetStates();
  }

  setAutoMode(keys: EnemyType[]) {
    this.autoModeEnemiesGroup = keys;
    this.sightMode = false;
    this.autoMode = true;
  }

  setDoubleFireMode(isDoubleFireMode: boolean) {
    this.doubleFireMode = isDoubleFireMode;
  }

  handleGunRotation(pointerX: number, pointerY: number) {
    if (this.player) {
      this.player.gunRotation({ x: pointerX, y: pointerY });
    }
  }

  handleSetPointerPosition(x: number, y: number) {
    if (x !== this.lastPointerX || y !== this.lastPointerY) {
      this.lastPointerX = x;
      this.lastPointerY = y;

      eventBus.emit(
        GameEvents.POINTER_MOVE,
        this.lastPointerX,
        this.lastPointerY,
        this
      );
    }
  }

  update(time: number): void {
    this.debugInfo?.handleUpdateDebugInfo(this.enemies);

    const pointer = this.input.activePointer;

    this.handleSetPointerPosition(pointer.worldX, pointer.worldY);

    // стрельба
    if (this.autoMode) {
      this.handleAutoFiring();
    } else if (
      this.sightMode &&
      this.selectedEnemy?.readyToSightAutomaticShoot()
    ) {
      this.handleSightFiring();
    } else if (!this.sightMode && !this.autoMode) {
      this.handleGunRotation(pointer.worldX, pointer.worldY);
      this.handlePlayerFiring(time);
    }
  }
}
