import { eventBus } from '@/core/events/EventBus';
import { CoreEvents, BonusGameEvents } from '@/core/events/events';
import { GameStates } from '@/core/Model/types';
import { MinotaurFull } from '@/entities/MinotaurFull';
import { Symbol } from '@/entities/symbol';
import { COLUMNS_KEYS } from '@/services/constants';
import type { Columns } from '@/types/types';
import { GameObjects, Scene } from 'phaser';
import { BonusGameService } from '@/core/services/BonusGameService';
import { BonusGameUI } from '@/ui/components/BonusGameUI';
import { PurchaseEvents } from '@/network/PurchaseService/PurchaseService';
import { BuyBonusDialog } from '@/ui/dialogs/BuyBonusDialog';
import type { BuyBonusOption } from '@/core/services/BonusGameService';

export class BonusGameHandler {
  private scene: Scene;
  private bonusGameService: BonusGameService;
  private bonusGameUI: BonusGameUI | null = null;
  private stickyWildColumn: number | null = null;
  private buyBonusDialog: BuyBonusDialog | null = null;
  private frontColumns: Record<Columns, GameObjects.Container | null>;
  private symbolsContainer: GameObjects.Container | null;
  private onAnimate: (
    combination: number[][],
    bonusGamePosition: number[]
  ) => void;
  private onInitCombination: (combination: number[][]) => void;

  constructor(
    scene: Scene,
    frontColumns: Record<Columns, GameObjects.Container | null>,
    symbolsContainer: GameObjects.Container | null,
    onAnimate: (combination: number[][], bonusGamePosition: number[]) => void,
    onInitCombination: (combination: number[][]) => void
  ) {
    this.scene = scene;
    this.frontColumns = frontColumns;
    this.symbolsContainer = symbolsContainer;
    this.onAnimate = onAnimate;
    this.onInitCombination = onInitCombination;
    this.bonusGameService = new BonusGameService();
    this.init();
  }

  private init() {
    this.bonusGameUI = new BonusGameUI(this.scene, 0, 0);
    this.bonusGameUI.setDepth(2000);

    eventBus.on(BonusGameEvents.Respin, this.handleRespin, this);
    eventBus.on(BonusGameEvents.BuyBonus, this.handleBuyBonus, this);
    eventBus.on(
      BonusGameEvents.ShowBuyBonusDialog,
      this.showBuyBonusDialog,
      this
    );
  }

  public isActive(): boolean {
    return this.bonusGameService.isActive();
  }

  public getStickyWildColumn(): number | null {
    return this.stickyWildColumn;
  }

  public checkBonusGameWin(combination: number[][]) {
    let hasWin = false;
    let winAmount = 0;

    for (let row = 0; row < 3; row++) {
      const symbols: number[] = [];
      for (let col = 0; col < 5; col++) {
        symbols.push(combination[col][row]);
      }

      const firstSymbol = symbols[0];
      let matchCount = 1;

      for (let i = 1; i < symbols.length; i++) {
        if (
          symbols[i] === firstSymbol ||
          symbols[i] === 10 ||
          firstSymbol === 10
        ) {
          matchCount++;
        } else {
          break;
        }
      }

      if (matchCount >= 3) {
        hasWin = true;
        winAmount = matchCount * 10;
        break;
      }
    }

    const result = this.bonusGameService.performRespin(hasWin, winAmount);

    if (!result.shouldContinue) {
      this.stickyWildColumn = null;
      eventBus.emit(CoreEvents.SetGameState, GameStates.IDLE);

      if (result.totalWin > 0) {
        eventBus.emit(PurchaseEvents.UPDATE_WIN_SUM, result.totalWin);
      }
    }
  }

  public handleCreateMinos(bonusGamePosition: number[]) {
    if (!this.frontColumns) return;

    const bonusGameColumnIndex = bonusGamePosition[0];
    const minosColumn = COLUMNS_KEYS[bonusGameColumnIndex];

    const column = this.frontColumns[minosColumn];
    if (!column) return;

    if (
      this.bonusGameService.isActive() &&
      this.stickyWildColumn === bonusGameColumnIndex
    ) {
      const positionX = column.x || 0;
      column.removeAll(true);
      const minos = new MinotaurFull(this.scene);
      column.add(minos);
      minos.setPosition(positionX - 200, -150);

      eventBus.emit(CoreEvents.SetGameState, GameStates.BONUS_GAME);
      return;
    }

    const children = column.list.slice() as Symbol[];
    const minosSymbol = children[bonusGamePosition[1] ?? 0];
    if (!minosSymbol) return;

    this.stickyWildColumn = bonusGameColumnIndex;

    this.scene.tweens.chain({
      targets: minosSymbol.spineInstance,
      tweens: [
        {
          scale: 1,
          ease: 'Linear',
          duration: 400,
        },
        {
          scale: 0.7,
          ease: 'Linear',
          duration: 400,
        },
      ],
      onComplete: () => {
        this.scene.tweens.add({
          targets: minosSymbol,
          y: children[1].y,
          ease: 'Linear',
          duration: 400,
          onComplete: (twin: Phaser.Tweens.Tween) => {
            const positionX = minosSymbol.x;
            column?.removeAll(true);
            const minos = new MinotaurFull(this.scene);
            column?.add(minos);
            minos.setPosition(positionX - 70, 0 + 320);

            const newKeys = COLUMNS_KEYS.filter(
              (_, i) => i !== bonusGamePosition[0]
            );

            if (!this.bonusGameService.isActive()) {
              this.bonusGameService.startBonusGame(bonusGamePosition[0]);
            }
            eventBus.emit(CoreEvents.SetGameState, GameStates.BONUS_GAME);

            this.handleAddRocks(newKeys);
            twin.remove();
          },
        });
      },
    });
  }

  public handleAddRocks(newKeys: Columns[]) {
    newKeys.forEach((key, i) => {
      const frontCol = this.frontColumns[key];

      const frontColChildren = frontCol?.list.slice() as Symbol[];

      const rock = this.scene.add
        .image(0, -700, 'rock')
        .setOrigin(0.5)
        .setScale(0.8);
      rock.setX(frontColChildren[0].x);

      frontCol!.add(rock);

      this.scene.tweens.add({
        targets: rock,
        y: 0 + rock.displayHeight / 2,
        duration: 500,
        delay: i * 100,
        ease: 'Sine.easeInOut',
        onComplete: (twin: Phaser.Tweens.Tween) => {
          if (i === newKeys.length - 1) {
            eventBus.emit(CoreEvents.SetGameState, GameStates.IDLE);
            twin.remove();
          }
        },
      });
    });
  }

  public handleRespin = () => {
    if (!this.bonusGameService.isActive()) return;

    const newCombination: number[][] = [];
    for (let i = 0; i < 5; i++) {
      const column: number[] = [];
      for (let j = 0; j < 3; j++) {
        if (this.stickyWildColumn === i) {
          column.push(10);
        } else {
          column.push(Phaser.Math.Between(1, 9));
        }
      }
      newCombination.push(column);
    }

    this.onAnimate(newCombination, []);
  };

  public showBuyBonusDialog = () => {
    if (this.buyBonusDialog && this.buyBonusDialog.visible) {
      return;
    }

    const prices = this.bonusGameService.getAllBuyBonusPrices();
    this.buyBonusDialog = new BuyBonusDialog(this.scene, {
      prices,
      onBuy: (option) => {
        this.handleBuyBonus(option);
      },
      onClose: () => {
        this.buyBonusDialog = null;
      },
    });
    this.buyBonusDialog.show();
  };

  public handleBuyBonus = (option: BuyBonusOption) => {
    if (this.bonusGameService.isActive()) {
      return;
    }

    let wildColumn: number;
    if (option === 'reels_1_3') {
      wildColumn = Math.floor(Math.random() * 3);
    } else if (option === 'reel_4') {
      wildColumn = 3;
    } else {
      wildColumn = 4;
    }

    this.stickyWildColumn = wildColumn;

    this.bonusGameService.startBonusGame(wildColumn);

    const newCombination: number[][] = [];
    for (let i = 0; i < 5; i++) {
      const column: number[] = [];
      for (let j = 0; j < 3; j++) {
        if (i === wildColumn) {
          column.push(10);
        } else {
          column.push(Phaser.Math.Between(1, 9));
        }
      }
      newCombination.push(column);
    }

    if (!this.symbolsContainer) {
      this.onInitCombination(newCombination);
      this.scene.time.delayedCall(300, () => {
        this.handleCreateMinos([wildColumn, 0]);
      });
    } else {
      this.onAnimate(newCombination, [wildColumn, 0]);
    }
  };

  public updateStickyWildColumn(column: number | null) {
    this.stickyWildColumn = column;
  }

  public getBonusGameService(): BonusGameService {
    return this.bonusGameService;
  }

  public destroy() {
    eventBus.off(BonusGameEvents.Respin, this.handleRespin, this);
    eventBus.off(BonusGameEvents.BuyBonus, this.handleBuyBonus, this);
    eventBus.off(
      BonusGameEvents.ShowBuyBonusDialog,
      this.showBuyBonusDialog,
      this
    );
    this.bonusGameUI?.destroy();
  }
}
