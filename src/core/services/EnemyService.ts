import { EnemyFactory, EnemyEntity } from '@/entities';
import { PurchaseEvents } from '@/network/PurchaseService';
import type { WSTicketWinState } from '@/network/WebSocketService';
import type { Shooting } from '@/scenes';
import type { BeastMode, EnemyId, IBundle } from '@/types/types';
import { eventBus } from '../events';
import { SpawnManager } from '../managers/SpawnManager';

const waitAfterHitTime = 2000;

export class EnemyService {
  private enemiesGroup: Phaser.Physics.Arcade.Group | null = null;
  private enemies: EnemyEntity[] = [];
  private winAmount = 0;
  private balance = 0;
  private scene: Shooting | null = null;

  get group() {
    return this.enemiesGroup;
  }

  public onBundleAnimsEnded() {
    eventBus.emit(PurchaseEvents.UPDATE_WIN_SUM, {
      type: 'bundle',
      winSum: this.winAmount,
    });
    eventBus.emit(PurchaseEvents.UPDATE_BALANCE, this.balance);
  }

  private choiseEnemy(enemyId: EnemyId) {
    const enemy = this.enemies.find((e) => e.enemyId === enemyId);
    if (!enemy) return;

    return enemy;
  }

  public onHitEnemy(beastMode: BeastMode, enemyId: EnemyId) {
    const enemy = this.choiseEnemy(enemyId);
    enemy?.onHitStart('bullet');

    eventBus.emit(PurchaseEvents.BUY_TICKET, {
      beastMode,
      enemyId,
    });
  }

  public handleEnemyBundleResponse = (
    wins: WSTicketWinState[],
    key: IBundle,
    winAmount: number,
    balance: number
  ) => {
    this.winAmount = winAmount;
    this.balance = balance;

    const winsMap = new Map(wins.map((win) => [win.beastMode, win]));

    if (key === 'grenade') {
      this.enemies.forEach((enemy) => {
        const win = winsMap.get(enemy.beastMode);

        const isWin = Boolean(win);

        this.handleResolveHitWithDelay(500, enemy, isWin);
      });

      return;
    }

    const sortedEnemies = [...this.enemies].sort((a, b) => b.x - a.x);

    const totalDuration = key === 'ufo' ? 4300 : 3500;
    const step = totalDuration / sortedEnemies.length;

    sortedEnemies.forEach((enemy, index) => {
      const win = winsMap.get(enemy.beastMode);
      const isWin = Boolean(win);

      const delay = index * step;

      if (!this.scene) return;

      this.handleResolveHitWithDelay(delay, enemy, isWin);
    });
  };

  private handleResolveHitWithDelay(
    delay: number,
    enemy: EnemyEntity,
    isWin: boolean
  ) {
    if (!this.scene) return;

    this.scene.time.delayedCall(delay, () => {
      enemy.onHitStart('bundle');

      this.scene?.time.delayedCall(waitAfterHitTime, () => {
        isWin ? enemy.resolveHit('hit') : enemy.resolveHit('miss');
      });
    });
  }

  public handleEnemyResponse = ({
    id,
    action,
    winSum,
  }: {
    id: string;
    action: 'hit' | 'miss';
    winSum: number;
  }) => {
    const enemy = this.choiseEnemy(id);
    enemy?.resolveHit(action, winSum);
  };

  public continueMoving() {
    const enemiesToMove = this.enemies.filter((enemy) => enemy.pending);
    enemiesToMove.forEach((enemy) => {
      enemy.setContinueMoving();
    });
  }

  public init(scene: Shooting) {
    this.enemiesGroup = scene.physics.add.group();
    this.enemiesGroup.name = 'Enemies';
    this.scene = scene;

    new EnemyFactory(this.scene).initPool(this.enemiesGroup);

    this.enemiesGroup?.getChildren().forEach((item) => {
      if (item instanceof EnemyEntity) item.activateSpine();
    });

    this.enemies = this.enemiesGroup.getChildren() as EnemyEntity[];
    this.scene.setEnemies(this.enemies);

    this.scene.createOverlap(this.onHitEnemy.bind(this));
    SpawnManager.updateSpawnEnemies(this.scene, this.enemies);
  }
}
