import { BetService, EnemyService, ErrorHandleService } from '@/core/services';
import { PurchaseEvents, PurchaseService } from '@/network/PurchaseService';
import {
  WebSocketService,
  WSEvents,
  WSStates,
  type WSData,
} from '@/network/WebSocketService';
import {
  getBetsByCharacter,
  getIsBonusPosition,
  getSearchParams,
} from '@/services/helpers';
import { mdeToNormal } from '@/services/lib/mdeToNormal';
import type { Character } from '@/ui/components/CharacterCarousel/types';
import { Game } from 'phaser';

import {
  BetEvents,
  CoreEvents,
  eventBus,
  GameEvents,
  SceneEvents,
} from '@/core/events';
import { DialogManager, SceneManager, SoundManager } from '@/core/managers';
import { BundleManager } from '@/core/managers/BundleManager/BundleManager';
import { ShootingManager } from '@/core/managers/ShootingManager/ShootingManager';
import { GameStates, Model, type CharacterModel } from '@/core/Model';
import { View } from '@/core/View/View';
import { config } from '@/Game';
import { initI18n } from '@/i18n';
import type { TError } from '@/types/types';
import type { Entry } from '@/ui/components/Entry';
import { isLandscape } from '@/services/lib/isLandscape';

const defaultTaxAmount = 2359200;

class GameController {
  model: Model;
  game: Game;
  ws: WebSocketService;
  dialogManager!: DialogManager;
  enemyService: EnemyService;
  betService: BetService;
  sceneManager: SceneManager;
  purchaseService: PurchaseService;
  errorHandleService: ErrorHandleService;
  shootingManager: ShootingManager;
  bundleManager: BundleManager;
  view: View;
  entry: Entry | null = null;
  prevHeight = window.innerHeight;
  loadStates: {
    resources: boolean;
    ws: boolean;
    sounds: boolean;
  } = { resources: false, ws: false, sounds: false };
  needToRefresh: boolean = false;

  constructor() {
    this.game = new Game(config);
    this.sceneManager = new SceneManager(this.game);
    this.view = new View(this.sceneManager);
    this.model = new Model();
    this.ws = new WebSocketService();
    this.enemyService = new EnemyService();
    this.betService = new BetService(this.model, eventBus, this.ws);
    this.purchaseService = new PurchaseService(this.ws, this.model);
    this.dialogManager = new DialogManager();
    this.errorHandleService = new ErrorHandleService(
      this.dialogManager,
      eventBus,
      this.model
    );
    this.shootingManager = new ShootingManager(
      this.model,
      this.view,
      this.dialogManager,
      this.purchaseService,
      this.betService
    );

    this.bundleManager = new BundleManager(
      this.model,
      this.view,
      this.dialogManager,
      this.enemyService
    );

    this.game.scale.on('resize', this.handleCheck);
  }

  async init(entry: Entry) {
    this.entry = entry;

    await initI18n();
    const sessionId = getSearchParams('session');

    if (sessionId) {
      this.ws.connect(sessionId);
    } else {
      console.log('Сессия не указана');
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        SoundManager.forceMute();
      }
    });

    this.initCoreEvents();
    this.initScenesEvents();
    this.initBuyEvents();
  }

  private tryReady(type?: 'resources' | 'ws' | 'sounds') {
    if (type) {
      this.loadStates[type] = true;
    }
    if (
      this.view.preloadScene &&
      this.loadStates.resources &&
      this.loadStates.ws &&
      this.loadStates.sounds
    ) {
      this.view.preloadScene.onReady();
    }
  }

  initCoreEvents() {
    eventBus.on(CoreEvents.SetGameState, this.setGameState, this);
    eventBus.on(CoreEvents.Loaded, this.tryReady, this);
    eventBus.on(CoreEvents.ExitGame, this.handlerOnExit, this);
    eventBus.on(CoreEvents.AppError, this.handleOnError, this);
    eventBus.on(WSEvents.MESSAGE, this.handleChangeState, this);
  }

  initScenesEvents() {
    eventBus.on(GameEvents.SetCharacter, this.handleChoiseCharacter, this);
    eventBus.on(SceneEvents.CreatePreloadScene, this.handlePreloadCreate, this);
    eventBus.on(
      SceneEvents.RunPreloadScene,
      () => {
        if (isLandscape()) {
          if (this.handleCheckResize()) {
            this.sceneManager.runPreloadScene();
          } else {
            this.needToRefresh = true;
            this.game.scale.refresh();
          }
        }
      },
      this
    );
    eventBus.on(SceneEvents.RunStartScene, this.handleOnStart, this);
    eventBus.on(GameEvents.POINTER_DOWN, this.handlePointerDown, this);
  }

  initBuyEvents() {
    eventBus.on(PurchaseEvents.UPDATE_BALANCE, this.handleUpdateBalance, this);
    eventBus.on(PurchaseEvents.UPDATE_WIN_SUM, this.handleOnWinSum, this);
    eventBus.on(PurchaseEvents.ENEMY_HIT_RESPONSE, this.handleOnHitEnemy, this);
    eventBus.on(BetEvents.Increase, this.betService.increase);
    eventBus.on(BetEvents.Decrease, this.betService.decrease);
    eventBus.on(BetEvents.BetChanged, this.handlerBetChanged, this);
    eventBus.on('animateSymbol', this.animateSymbol, this);
  }

  private animateSymbol(value: number[][] | undefined) {
    if (!value) return;

    const bonusGamePosition = getIsBonusPosition(value);

    this.view.minosScene.handleAnimate(value, bonusGamePosition);
  }

  private handleOnError(error: TError) {
    if (this.view.uiScene) {
      this.errorHandleService.handleError(error);
      if (error.data && error.data.balance !== null) {
        this.view.uiScene.setBalance(mdeToNormal(error.data.balance));
      }
    } else {
      this.errorHandleService.setPendingError(error.data.msg);
    }
  }

  private handleOnHitEnemy = (params: {
    id: string;
    action: 'hit' | 'miss';
    winSum: number;
  }) => {
    this.enemyService.handleEnemyResponse(params);
  };

  private setGameState(value: number) {
    const state = this.model.setGameState(value);

    switch (state) {
      case GameStates.ERROR:
        this.model.setStateOnError();
        this.enemyService.continueMoving();
        this.bundleManager.setBundleClear();
        if (!this.view.uiScene || !this.view.shootingScene) return;
        this.view.renderError();
        break;

      case GameStates.WAITING:
        break;

      case GameStates.PLAYING:
        this.view.uiScene.disableUI();
        break;

      case GameStates.IDLE:
        const { disableIncrease, disableDecrease } =
          this.betService.getBetsState();
        this.view.renderRestoreUI(disableIncrease, disableDecrease);
        if (this.model.getDoubleFireMode()) {
          this.view.uiScene.setModeButton(true, 'doubleFireMode');
        }
    }
  }

  private handleChangeState(data: WSData) {
    if (data.state === WSStates.OK && this.view.uiScene)
      this.view.uiScene.setMainPrize(data.maxPrizeMDE);
  }

  private handlePreloadCreate() {
    this.view.preloadScene = this.sceneManager.getScene('PreloadScene');
    this.tryReady();
  }

  private handlerOnExit = () => {
    if (this.sceneManager.isActive('ShootingScene')) {
      this.model.setDefaultStates();
      this.dialogManager.unSubscribeEvents();
      this.view.uiScene.clearModes();
      this.handleOnStart();
    } else {
      if (top) top.location.href = this.model.getWSState()?.backUrl ?? '';
    }
  };

  private handleOnStart() {
    this.view.renderStartScene();

    this.purchaseService.subscribe();
  }

  private handleOnStartShooting(character: CharacterModel) {
    const currentBetMDE = this.model.getCurrentBetMde();

    const balance = this.model.getBalance();
    const demo = this.model.getWSState()?.demo;
    const maxPrizeMDE = this.model.getWSState()?.maxPrizeMDE;
    const { disableIncrease, disableDecrease } = this.betService.getBetsState();
    if (!character || !currentBetMDE) return;

    SoundManager.stopAll();
    SoundManager.play('bg', true);

    this.purchaseService.subscribe();

    this.sceneManager.runShootingScene();
    this.view.renderShootingScene();
    this.enemyService.init(this.view.shootingScene);
    this.view.renderCharacter(character);
    this.view.renderGameData({
      balance,
      demo: demo || false,
      maxPrizeMDE: maxPrizeMDE || 0,
      currentBetMDE,
      disableIncrease,
      disableDecrease,
    });

    this.bundleManager.init();
  }

  private handlePointerDown() {
    this.view.shootingScene.handleOnPointerDown();
  }

  private handleChoiseCharacter(character: Character) {
    const betLadderMDE = this.model.getBetLadderMDE();
    const bets = getBetsByCharacter(character.alias, betLadderMDE ?? []);

    const newCharacter = this.model.updateCharacter({
      label: character.label.name,
      wins: character.label.values,
      maxPrize: '10000000 tenge',
      key: character.alias,
      bullet: character.bullet,
      bets,
    });

    this.view.uiScene.updateCharacter(newCharacter.key);
    this.betService.initBets();
    this.sceneManager.stop('StartScene');
    this.handleOnStartShooting(newCharacter);
  }

  private handlerBetChanged(data: {
    newBet: number;
    disableIncrease: boolean;
    disableDecrease: boolean;
  }) {
    const currentDoubleFireMode = this.model.getDoubleFireMode();

    if (currentDoubleFireMode) this.model.setDoubleFireMode();
    this.view.renderWeapon({ ...data, doubleFireMode: currentDoubleFireMode });
  }

  private handleUpdateBalance = (balance: number) => {
    this.model.updateBalance(balance);
    this.view.uiScene.setBalance(mdeToNormal(balance));
  };

  private handleOnWinSum = (data: {
    type: 'ticket' | 'bundle';
    winSum: number;
  }) => {
    const taxAmount = this.model.getWSState()?.taxAmount ?? defaultTaxAmount;

    if (data.type === 'bundle') {
      this.dialogManager.addToQueue('big-win', data.winSum);
    } else if (data.type === 'ticket') {
      if (data.winSum > taxAmount) {
        this.dialogManager.addToQueue('big-win', data.winSum);
      }
    }
  };

  private handleCheck = () => {
    if (
      this.needToRefresh &&
      isLandscape() &&
      this.sceneManager.isVisible('BootScene')
    ) {
      if (this.handleCheckResize()) {
        this.sceneManager.runPreloadScene();
        this.needToRefresh = false;
      } else {
        window.setTimeout(() => {
          this.game.scale.refresh();
        }, 100);
      }
    }
  };

  private handleCheckResize() {
    const currentWidth = window.innerWidth;
    const displayWidth = this.game.scale.displaySize.width;
    const currentHeight = window.innerHeight;
    const displayHeight = this.game.scale.displaySize.height;
    const minimumHeight = 150;

    return (
      currentHeight > minimumHeight &&
      (Math.round(currentHeight) <= Math.round(displayHeight) ||
        Math.round(currentWidth) <= Math.round(displayWidth))
    );
  }

  public destroy() {
    this.ws.destroy();
    window.removeEventListener('resize', this.handleCheck);
    this.game.destroy(true);
    eventBus.shutdown();
    SoundManager.destroy();
  }
}

export default GameController;
