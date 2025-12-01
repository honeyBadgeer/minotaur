import { CoreEvents, eventBus, GameEvents } from '@/core/events';
import { GameStates, type Model } from '@/core/Model';
import type { EnemyService } from '@/core/services';
import type { View } from '@/core/View/View';
import { PurchaseEvents } from '@/network/PurchaseService';
import type { WSTicketWinState } from '@/network/WebSocketService';
import { getBundleConfig } from '@/services/helpers';
import { mdeToNormal } from '@/services/lib/mdeToNormal';
import type { IBundle } from '@/types/types';
import type { DialogManager } from '../DialogManager';
import { SoundManager } from '../SoundManager';

const bundleWinSumShowTime = 1500;

export class BundleManager {
  constructor(
    private model: Model,
    private view: View,
    private dialogManager: DialogManager,
    private enemyService: EnemyService
  ) {}

  init() {
    eventBus.on(GameEvents.SetBundleMode, this.setBundleMode, this);
    eventBus.on(GameEvents.BundleAnimComplete, this.setBundleComplete, this);
    eventBus.on(
      PurchaseEvents.ENEMY_BUNDLE_RESPONSE,
      this.setBundlesResponse,
      this
    );
  }

  unSubscribeEvents() {
    eventBus.off(GameEvents.SetBundleMode, this.setBundleMode, this);
    eventBus.off(GameEvents.BundleAnimComplete, this.setBundleComplete, this);
    eventBus.off(
      PurchaseEvents.ENEMY_BUNDLE_RESPONSE,
      this.setBundlesResponse,
      this
    );
  }

  setBundleMode(bundleType: IBundle) {
    const currentBet = this.model.getCurrentBetMde();
    this.model.setBundle(bundleType);

    const bundle = getBundleConfig(bundleType);
    const amount = mdeToNormal(bundle.count * (currentBet ?? 0));

    const callback = () => {
      eventBus.emit(PurchaseEvents.BUY_BUNDLE, bundle.count, bundleType);
    };

    this.dialogManager.addToQueue('confirm', { amount, onConfirm: callback });
  }

  setBundleComplete() {
    this.view.uiScene.time.delayedCall(bundleWinSumShowTime, () => {
      eventBus.emit(CoreEvents.SetGameState, GameStates.IDLE);
      this.setBundleClear();
      this.enemyService.onBundleAnimsEnded();
      this.model.setBundle();
      SoundManager.updateVolume();
    });
  }

  setBundleClear() {
    const currentBundle = this.model.getBundle();
    if (!currentBundle) return;

    this.view.renderBundleClear(currentBundle);
  }

  setBundlesResponse(
    wins: WSTicketWinState[],
    key: IBundle,
    winAmount: number,
    balance: number
  ) {
    const callback = () => {
      this.view.renderBundleActivate(key);
      this.enemyService.handleEnemyBundleResponse(
        wins,
        key,
        winAmount,
        balance
      );
      eventBus.emit(CoreEvents.SetGameState, GameStates.PLAYING);
    };
    this.dialogManager.addToQueue('warning', {
      warningType: key,
      onClose: callback,
    });
  }
}
