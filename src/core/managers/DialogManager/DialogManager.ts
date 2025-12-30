import { DialogEvents } from '@/core/events/events';
import type {
  IBigWinConfig,
  IBundleConfig,
  IBuyBonusConfig,
  IDialogData,
  IErrorConfig,
  IInsufficientConfig,
  IUnauthorizedConfig,
  IWarningConfig,
  TDialogKey,
} from '@/types/types';
import type { BaseDialog } from '@/ui/components/BaseDialog';
import { AutoModeDialog } from '@ui/dialogs/AutoModeDialog';
import { BigWinDialog } from '@ui/dialogs/BigWinDialog';
import { ConfirmDialog } from '@ui/dialogs/ConfirmDialog';
import { BuyBonusDialog } from '@ui/dialogs/BuyBonusDialog';
import { ErrorDialog } from '@ui/dialogs/ErrorDialog';
import { InsufficientFundsDialog } from '@ui/dialogs/InsufficientFundsDialog';
import { Onboarding } from '@ui/dialogs/Onboarding';
import { UnauthorizedDialog } from '@ui/dialogs/UnauthorizedDialog';
import { WarningDialog } from '@ui/dialogs/WarningDialog';
import Phaser from 'phaser';

export class DialogManager {
  private currentDialog: BaseDialog | null = null;
  private scene!: Phaser.Scene;
  private queueDialogsMap: Array<{ key: TDialogKey; data: IDialogData }> = [];
  private isDialogOpened = false;

  public init(scene: Phaser.Scene) {
    this.scene = scene;

    this.subscribeEvents();
  }

  subscribeEvents() {
    this.scene.events.on(DialogEvents.Closed, this.onCloseDialog, this);
  }

  unSubscribeEvents() {
    this.scene.events.off(DialogEvents.Closed, this.onCloseDialog, this);
  }

  public addToQueue(key: TDialogKey, data: IDialogData) {
    if (this.canIPushToQueue(key, data)) return;

    this.queueDialogsMap.push({ key, data });

    if (!this.isDialogOpened) this.openFromQueue();
  }

  private canIPushToQueue(key: TDialogKey, data: IDialogData): boolean {
    if (key === 'insufficient-funds') {
      return this.queueDialogsMap.some(
        (item) => item.key === 'insufficient-funds'
      );
    }

    if (key === 'error') {
      return this.queueDialogsMap.some((item) => {
        return (
          item.key === 'error' &&
          (item.data as IErrorConfig).message === (data as IErrorConfig).message
        );
      });
    }

    return false;
  }

  async openFromQueue() {
    if (this.queueDialogsMap.length === 0) {
      this.isDialogOpened = false;
      return;
    }

    this.isDialogOpened = true;

    const value = this.queueDialogsMap.shift();
    if (!value) return;
    const dialog = this.handleCreateDialog(value.key, value.data);
    if (!dialog) return;
    await this.showDialog(dialog);
  }

  onCloseDialog() {
    this.clearCurrentDialog();
    this.openFromQueue();
  }

  private async showDialog(dialog: BaseDialog) {
    await this.clearCurrentDialog();
    this.currentDialog = dialog;
    this.scene.add.existing(this.currentDialog);
    this.currentDialog.show();
  }

  private async clearCurrentDialog() {
    if (!this.currentDialog) return;
    this.currentDialog = null;
  }

  public showOnboarding = (rulesUrl: string | undefined) => {
    this.showDialog(new Onboarding(this.scene, rulesUrl));
  };

  handleCreateDialog(key: TDialogKey, data: IDialogData) {
    switch (key) {
      case 'big-win':
        return new BigWinDialog(this.scene, data as IBigWinConfig);
      case 'warning':
        return new WarningDialog(this.scene, data as IWarningConfig);
      case 'confirm':
        return new ConfirmDialog(this.scene, data as IBundleConfig);
      case 'unauthorized':
        return new UnauthorizedDialog(this.scene, data as IUnauthorizedConfig);
      case 'autoMode':
        return new AutoModeDialog(this.scene);
      case 'insufficient-funds':
        return new InsufficientFundsDialog(
          this.scene,
          data as IInsufficientConfig
        );
      case 'error':
        return new ErrorDialog(this.scene, data as IErrorConfig);
      case 'buy-bonus':
        return new BuyBonusDialog(this.scene, data as IBuyBonusConfig);
    }
  }
}
