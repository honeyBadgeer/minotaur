import { eventBus } from '@/core/events/EventBus';
import { BonusGameEvents } from '@/core/events/events';

export type BuyBonusOption = 'reels_1_3' | 'reel_4' | 'reel_5';

export interface BonusGameState {
  isActive: boolean;
  multiplier: number;
  maxMultiplier: number;
  respinCount: number;
  stickyWildColumn: number | null;
}

export class BonusGameService {
  private state: BonusGameState = {
    isActive: false,
    multiplier: 1,
    maxMultiplier: 1024,
    respinCount: 0,
    stickyWildColumn: null,
  };

  private buyBonusPrices: Record<BuyBonusOption, number> = {
    reels_1_3: 192,
    reel_4: 800,
    reel_5: 3200,
  };

  public startBonusGame(wildColumn: number) {
    this.state = {
      isActive: true,
      multiplier: 1,
      maxMultiplier: 1024,
      respinCount: 0,
      stickyWildColumn: wildColumn,
    };

    eventBus.emit(BonusGameEvents.StartBonusGame, {
      wildColumn,
      multiplier: this.state.multiplier,
    });
  }

  public startBonusGameFromBuy(option: BuyBonusOption) {
    let wildColumn: number;

    if (option === 'reels_1_3') {
      wildColumn = Math.floor(Math.random() * 3);
    } else if (option === 'reel_4') {
      wildColumn = 3;
    } else {
      wildColumn = 4;
    }

    this.startBonusGame(wildColumn);
  }

  public getBuyBonusPrice(option: BuyBonusOption): number {
    return this.buyBonusPrices[option];
  }

  public getAllBuyBonusPrices(): Record<BuyBonusOption, number> {
    return { ...this.buyBonusPrices };
  }

  public performRespin(
    hasWin: boolean,
    winAmount: number = 0
  ): {
    shouldContinue: boolean;
    multiplier: number;
    totalWin: number;
  } {
    if (!this.state.isActive) {
      return {
        shouldContinue: false,
        multiplier: 1,
        totalWin: 0,
      };
    }

    this.state.respinCount++;

    if (hasWin) {
      const totalWin = winAmount * this.state.multiplier;
      this.endBonusGame();

      return {
        shouldContinue: false,
        multiplier: this.state.multiplier,
        totalWin,
      };
    } else {
      this.state.multiplier = Math.min(
        this.state.multiplier * 2,
        this.state.maxMultiplier
      );

      eventBus.emit(BonusGameEvents.UpdateMultiplier, {
        multiplier: this.state.multiplier,
        respinCount: this.state.respinCount,
      });

      return {
        shouldContinue: true,
        multiplier: this.state.multiplier,
        totalWin: 0,
      };
    }
  }

  public endBonusGame() {
    this.state.isActive = false;
    eventBus.emit(BonusGameEvents.BonusGameComplete, {
      finalMultiplier: this.state.multiplier,
      respinCount: this.state.respinCount,
    });
  }

  public getState(): BonusGameState {
    return { ...this.state };
  }

  public isActive(): boolean {
    return this.state.isActive;
  }

  public getCurrentMultiplier(): number {
    return this.state.multiplier;
  }

  public getStickyWildColumn(): number | null {
    return this.state.stickyWildColumn;
  }

  public reset() {
    this.state = {
      isActive: false,
      multiplier: 1,
      maxMultiplier: 1024,
      respinCount: 0,
      stickyWildColumn: null,
    };
  }
}
