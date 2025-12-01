import { CoreEvents, eventBus, GameEvents } from '@/core/events';
import type { Model } from '@/core/Model';
import type { View } from '@/core/View/View';
import type { EnemyEntity, Player } from '@/entities';
import type { BulletEntity } from '@/entities/Bullet/BulletEntity';
import { type PurchaseService } from '@/network/PurchaseService';
import type { EnemyType } from '@/types/types';
import type { DialogManager } from '../DialogManager';
import type { BetService } from '@/core/services';

export class ShootingManager {
  model: Model;
  view: View;
  dialogManager: DialogManager;
  purchaseService: PurchaseService;
  betService: BetService;

  constructor(
    model: Model,
    view: View,
    dialogManager: DialogManager,
    purchaseService: PurchaseService,
    betService: BetService
  ) {
    this.model = model;
    this.view = view;
    this.dialogManager = dialogManager;
    this.purchaseService = purchaseService;
    this.betService = betService;
    this.init();
  }

  init() {
    eventBus.on(GameEvents.SetAutoMode, this.toggleAutoMode, this);
    eventBus.on(GameEvents.AutoModeEnemiesGroup, this.setAutoMode, this);
    eventBus.on(GameEvents.SetSightMode, this.setSightMode, this);
    eventBus.on(GameEvents.SHOOT, this.setShoot, this);
    eventBus.on(GameEvents.SetDoubleFireMode, this.setDoubleFireMode, this);
    eventBus.on(GameEvents.SetOffShoot, this.offShoot, this);
  }

  toggleAutoMode() {
    const currentAutoMode = this.model.getAutoMode();
    const { disableIncrease, disableDecrease } = this.betService.getBetsState();

    this.view.renderAutoModeToggle(currentAutoMode);

    if (currentAutoMode) {
      this.model.setAutoMode();
      this.model.setAutoModeEnemiesGroup();
      this.view.renderRestoreUI(disableIncrease, disableDecrease);
    } else {
      this.dialogManager.addToQueue('autoMode', {});
    }
  }

  setAutoMode(keys: EnemyType[]) {
    if (!this.checkIsCanBuy()) return;
    this.model.setAutoModeEnemiesGroup(keys);
    this.model.setAutoMode();

    this.view.renderAutoModeSet(keys);
  }

  setSightMode(isSightMode?: boolean) {
    const sightMode = this.model.setSightMode();
    const { disableIncrease, disableDecrease } = this.betService.getBetsState();

    this.view.renderSightMode(
      sightMode,
      disableIncrease,
      disableDecrease,
      isSightMode
    );
  }

  setShoot(
    bullet: BulletEntity,
    player: Player,
    offsetX: number,
    target?: EnemyEntity
  ) {
    if (!this.checkIsCanBuy()) return;
    this.view.renderShoot(bullet, player, offsetX, target);
  }

  /* Пока так оставлю */
  onShoot() {
    this.view.shootingScene.handleOnPointerDown();
  }

  offShoot() {
    this.view.shootingScene.handleOffPointerDown();
  }

  setDoubleFireMode() {
    const doubleFireMode = this.model.setDoubleFireMode();
    this.view.renderDoubleFireMode(doubleFireMode);
    eventBus.emit(GameEvents.ModeChanged);
  }

  checkIsCanBuy() {
    const check = this.purchaseService.isCanBuyBy();
    if (!check.canBuy) {
      eventBus.emit(CoreEvents.AppError, { type: check.type });
    }

    return check.canBuy;
  }
}
