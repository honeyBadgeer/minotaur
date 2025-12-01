import type { Events } from 'phaser';
import { CoreEvents } from '../events';
import type { DialogManager } from '../managers';
import { GameStates, type Model } from '../Model';
import { MAX_DEMO_BUNDLE_VALUE, MAX_DEMO_VALUE } from '@/services/constants';
import type { TError } from '@/types/types';

const errorConfig = {
  0: { message: 'Что-то пошло не так' },
  1: { message: 'Недостаточно средств' },
  2: { message: 'Превышена максимальная ставка' },
  3: { message: 'Ставки больше не принимаются' },
  4: { message: 'Загрузка билетов...' },
  5: { message: 'Билеты закончились' },
};

export class ErrorHandleService {
  private dialogManager: DialogManager;
  private eventBus: Events.EventEmitter;
  private model: Model;
  private pendingError: string | null = null;

  constructor(
    dialogManager: DialogManager,
    eventBus: Events.EventEmitter,
    model: Model
  ) {
    this.dialogManager = dialogManager;
    this.eventBus = eventBus;
    this.model = model;
  }

  private parseError(msg: string) {
    const errorMessage = msg;

    const [codePart] = errorMessage.split(';');
    const errorCode = codePart.startsWith('errorCode:')
      ? parseInt(codePart.slice(10), 10)
      : null;

    return { errorCode, errorMessage };
  }

  handleError = (err: TError) => {
    if (this.model.getGameState() === GameStates.ERROR) return;
    this.eventBus.emit(CoreEvents.SetGameState, GameStates.ERROR);

    const { type, data } = err;

    if (type === 'demo') {
      this.handleOnAuth();
    } else if (type === 'influence') {
      this.handleOnInsufficientFunds();
    } else {
      this.handleOnWSError(data);
    }
  };

  handleOnWSError(err: any) {
    if (!err) return;
    const { errorCode, errorMessage } = this.parseError(err.msg);
    const config = errorConfig[errorCode as keyof typeof errorConfig] || {
      message: errorMessage,
    };

    if (errorCode === 1) {
      this.handleOnInsufficientFunds();
    } else {
      this.dialogManager.addToQueue('error', {
        message: config.message,
        onClose: this.handleOnClose,
      });
    }
  }

  handleOnAuth() {
    this.dialogManager.addToQueue('unauthorized', {
      onClose: this.handleOnCloseOnAuth,
      onLogin: this.handleOnLogin,
    });
  }

  handleOnCloseOnAuth = () => {
    this.eventBus.emit(CoreEvents.SetGameState, GameStates.IDLE);

    const demoCount = this.model.getDemoCount();
    const demoBundleCount = this.model.getDemoBundleCount();

    if (demoCount >= MAX_DEMO_VALUE) {
      this.model.setDemoCount(0);
    }

    if (demoBundleCount >= MAX_DEMO_BUNDLE_VALUE) {
      this.model.setDemoBundleCount(0);
    }
  };

  handleOnClose = () => {
    this.eventBus.emit(CoreEvents.SetGameState, GameStates.IDLE);
  };

  handleOnInsufficientFunds() {
    this.dialogManager.addToQueue('insufficient-funds', {
      onClose: this.handleOnClose,
      onClick: this.handleOnCash,
    });
  }

  handleOnCash = () => {
    if (top) {
      top.location.href = this.model.getWSState()?.refullUrl || '';
    }
  };

  handleOnLogin = () => {
    if (top) {
      top.location.href = this.model.getWSState()?.registerUrl || '';
    }
  };

  setPendingError(errorMessage: string | null) {
    this.pendingError = errorMessage;
  }

  showPendingError() {
    if (this.pendingError) {
      this.handleOnWSError({ msg: this.pendingError });
      this.pendingError = null;
    }
  }
}
