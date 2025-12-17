import { eventBus, Model } from '@/core';
import { CoreEvents } from '@/core/events/events';
import { GameStates } from '@/core/Model';
import {
  WebSocketService,
  WSEvents,
  WSGameType,
  type WSTicket,
} from '@/network/WebSocketService';
import { MAX_DEMO_BUNDLE_VALUE, MAX_DEMO_VALUE } from '@/services/constants';
import { mdeToNormal } from '@/services/lib/mdeToNormal';
import type { BeastMode, EnemyId, IBundle } from '@/types/types';

export enum PurchaseEvents {
  BUY_TICKET = 'hit',
  BUY_BUNDLE = 'bundle',
  UPDATE_WIN_SUM = 'updateWinSum',
  ENEMY_HIT_RESPONSE = 'enemyHitResponse',
  ENEMY_BUNDLE_RESPONSE = 'enemyBundleResponse',
  UPDATE_BALANCE = 'updateBalance',
}

export interface BuyTicketProps {
  beastMode: BeastMode;
  enemyId: EnemyId;
}

type BundleCount = 30 | 60 | 100;

export class PurchaseService {
  private ws: WebSocketService;
  private bundleKey: IBundle | null = null;
  private model: Model;

  constructor(ws: WebSocketService, model: Model) {
    this.ws = ws;
    this.model = model;
  }

  public subscribe() {
    eventBus.on(PurchaseEvents.BUY_TICKET, this.handleBuyTicket, this);
    eventBus.on(PurchaseEvents.BUY_BUNDLE, this.handleBuyBundle, this);
    eventBus.on(WSEvents.TICKET, this.handleTicket, this);
  }

  unSubscribeEvents() {
    eventBus.off(PurchaseEvents.BUY_TICKET, this.handleBuyTicket, this);
    eventBus.off(PurchaseEvents.BUY_BUNDLE, this.handleBuyBundle, this);
    eventBus.off(WSEvents.TICKET, this.handleTicket, this);
  }

  private handleBuyBundle(count: BundleCount, key: IBundle) {
    this.buyBundle(count);
    this.bundleKey = key;
  }

  private handleBuyTicket() {
    this.ws.send(
      `0`,
      () => console.log('sent'),
      () => console.error('failed')
    );
  }

  handleTicket(data: WSTicket) {
    const gameType = data.gameType;

    if (gameType === WSGameType.TICKET) {
      this.handleDefaultTicket(data);
    } else if (gameType === WSGameType.BUY_BUNDLE) {
      this.handleBundleTicket(data);
    }
  }

  handleDefaultTicket(data: WSTicket) {
    const rows = data.rows?.slice(0, 5);

    const combination = rows?.map((i) => {
      return i.pictures.slice(0, 3);
    });

    eventBus.emit('animateSymbol', combination);
  }

  handleBundleTicket(data: WSTicket) {
    if (this.checkDemoBundleCount()) {
      eventBus.emit(CoreEvents.AppError, { type: 'demo' });
      return;
    }

    const wins = data?.rows?.filter((row) => row.win_amount);
    eventBus.emit(
      PurchaseEvents.ENEMY_BUNDLE_RESPONSE,
      wins,
      this.bundleKey,
      data.win_amount,
      data.balance
    );
  }

  buyTicket(beastMode: BeastMode, enemyId: EnemyId) {
    const isDoubleFireMode = this.model.getDoubleFireMode();

    this.ws.send(
      `0_${beastMode}_${enemyId}_${isDoubleFireMode ? 2 : 1}`,
      () => console.log('sent'),
      () => console.error('failed')
    );
  }

  buyBundle(count: BundleCount) {
    if (this.checkBalance(count)) {
      eventBus.emit(CoreEvents.AppError, { type: 'influence' });
      return;
    }

    eventBus.emit(CoreEvents.SetGameState, GameStates.WAITING);
    this.ws.send(
      `1_${count}`,
      () => console.log('sent'),
      () => console.error('failed')
    );
  }

  checkBalance(count: number = 1) {
    if (this.checkDemo()) return;
    const balance = this.model.getBalance();

    const currentBetMDE = this.model.getCurrentBetMde();

    return currentBetMDE && balance < currentBetMDE * count;
  }

  checkDemo() {
    const demo = this.model.getWSState()?.demo;
    return demo;
  }

  checkDemoCount() {
    if (this.checkDemo()) {
      this.model.increaseDemoCount();
      if (MAX_DEMO_VALUE >= this.model.getDemoCount()) {
        return false;
      }
      return true;
    }
  }

  checkDemoBundleCount() {
    if (this.checkDemo()) {
      this.model.increaseDemoBundleCount();
      if (MAX_DEMO_BUNDLE_VALUE >= this.model.getDemoBundleCount()) {
        return false;
      }
      return true;
    }
  }

  isCanBuy() {
    return (this.checkDemo() && this.checkDemoCount()) || this.checkBalance();
  }

  isCanBuyBy() {
    if (this.checkDemo()) {
      if (this.checkDemoCount()) {
        return {
          type: 'demo',
          canBuy: false,
        };
      }
    }
    if (!this.checkBalance)
      return {
        type: 'influence',
        canBuy: false,
      };
    return {
      canBuy: true,
    };
  }
}
