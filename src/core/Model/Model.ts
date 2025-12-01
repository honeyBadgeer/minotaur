import type { WSData, WSError, WSTicket } from '@/network/WebSocketService';
import { WSEvents, WSStates } from '@/network/WebSocketService';
import { eventBus } from '../events/EventBus';

import type { EnemyType, IBundle } from '@/types/types';
import { setLang } from '@/i18n';
import { GameStates, ModelStates, type CharacterModel } from './types';

interface ModelState {
  gameState: GameStates;
  wsState: WSStates;
  wsData: WSData | null;
  balance: number;
  ticket: WSTicket | null;
  error: WSError | null;
  character: CharacterModel | null;
  autoMode: boolean;
  autoModeEnemiesGroup: EnemyType[] | [];
  sightMode: boolean;
  doubleFireMode: boolean;
  grenadeMode: boolean;
  ufoMode: boolean;
  laserMode: boolean;
  betLadderMDE: number[] | null;
  currentbetMde: number | null;
  choisedBundle: IBundle | null;
  demoCount: number;
  demoBundleCount: number;
  doubleTickets: {
    id: string;
    winAmount: number;
  } | null;
}

const initialState: ModelState = {
  gameState: GameStates.NOT_LOADED,
  wsState: WSStates.BROADCAST,
  wsData: null,
  ticket: null,
  error: null,
  character: null,
  autoMode: false,
  autoModeEnemiesGroup: [],
  sightMode: false,
  doubleFireMode: false,
  grenadeMode: false,
  ufoMode: false,
  laserMode: false,
  betLadderMDE: [],
  currentbetMde: 0,
  balance: 0,
  choisedBundle: null,
  demoCount: 0,
  demoBundleCount: 0,
  doubleTickets: null,
};

class Model {
  private _state: ModelState = { ...initialState };
  constructor() {
    this.initEvents();
  }

  initEvents() {
    eventBus.on(WSEvents.MESSAGE, this.onMessage);
    eventBus.on(WSEvents.TICKET, this.onTicket);
    eventBus.on(WSEvents.ERROR, this.onError);
  }
  private getState(): Readonly<ModelState> {
    return this._state;
  }

  private onMessage = (data: WSData) => {
    this.updateState({ wsState: WSStates.OK, wsData: data });

    const betLadderMDE = data.betLadderMDE.split(',').map(Number);
    this.updateState({
      betLadderMDE,
      currentbetMde: data.currentBetMDE,
      balance: data.balance,
    });

    if (data.lng === 'kz-KZ') setLang('kz');
    else if (data.lng === 'ru-RU') setLang('ru');
  };

  private onTicket = (ticket: WSTicket) => {
    this.updateState({ wsState: WSStates.TICKET, ticket });
  };

  private onError = (err: WSError) => {
    this.updateState({
      wsState: WSStates.ERROR,
      error: err,
      balance: err.balance,
    });
  };

  public updateAutoModeEnemiesGroup(value: EnemyType[]) {
    this.updateState({ autoModeEnemiesGroup: value });
  }
  public getAutoModeEnemiesGroup() {
    return this.getState().autoModeEnemiesGroup;
  }

  public getAutoMode() {
    return this.getState().autoMode;
  }

  public getBetLadderMDE() {
    return this.getState().betLadderMDE;
  }
  public getCurrentBetMde() {
    return this.getState().currentbetMde;
  }

  public getWSState() {
    return this.getState().wsData;
  }

  public getWSData() {
    return this.getState().wsData;
  }

  public updateCurrentBetMde(value: number) {
    this.updateState({ currentbetMde: value });
  }

  public updateCharacter(data: CharacterModel) {
    this.updateState({ character: data });
    return data;
  }

  public getBalance() {
    return this.getState().balance;
  }

  public updateBalance(balance: number) {
    this.updateState({ balance });
  }

  public getCharacter() {
    return this.getState().character;
  }

  public setAutoMode() {
    const updatedValue = !this.getState().autoMode;

    this.updateState({
      autoMode: updatedValue,
      sightMode: false,
    });

    return updatedValue;
  }

  public setAutoModeEnemiesGroup(value: EnemyType[] = []) {
    this.updateState({ autoModeEnemiesGroup: value });
  }

  public setSightMode() {
    const updatedValue = !this.getState().sightMode;

    this.updateState({
      sightMode: updatedValue,
      autoMode: false,
    });

    return updatedValue;
  }

  public setDoubleFireMode() {
    const updatedValue = !this.getState().doubleFireMode;
    this.updateState({ doubleFireMode: updatedValue });

    return updatedValue;
  }

  public getDoubleFireMode() {
    return this.getState().doubleFireMode;
  }

  public setBundle(key?: IBundle) {
    if (key) {
      this.updateState({ choisedBundle: key });
      return key;
    }
    this.updateState({ choisedBundle: null });
  }

  public getDemoCount() {
    return this.getState().demoCount;
  }

  public setDemoCount(demoCount: number) {
    this.updateState({ demoCount });
  }

  public increaseDemoCount() {
    const updatedValue = this.getState().demoCount + 1;

    this.updateState({ demoCount: updatedValue });
  }

  public getDemoBundleCount() {
    return this.getState().demoBundleCount;
  }

  public setDemoBundleCount(demoBundleCount: number) {
    this.updateState({ demoBundleCount });
  }

  public increaseDemoBundleCount() {
    const updatedValue = this.getState().demoBundleCount + 1;

    this.updateState({ demoBundleCount: updatedValue });
  }

  public getBundle() {
    return this.getState().choisedBundle;
  }

  private updateState(newState: Partial<ModelState>) {
    this._state = { ...this._state, ...newState };
    eventBus.emit(ModelStates.STATE_CHANGED, this.getState());
  }

  public destroy() {
    eventBus.off(WSEvents.MESSAGE, this.onMessage);
    eventBus.off(WSEvents.TICKET, this.onTicket);
    eventBus.off(WSEvents.ERROR, this.onError);
  }

  public setGameState(value: number) {
    this.updateState({ gameState: value });

    return value;
  }
  public getGameState() {
    return this.getState().gameState;
  }

  public setDefaultStates() {
    this.updateState({
      autoMode: false,
      doubleFireMode: false,
      sightMode: false,
      autoModeEnemiesGroup: [],
      ufoMode: false,
      laserMode: false,
      grenadeMode: false,
      gameState: GameStates.INIT,
    });
  }
  public setStateOnError() {
    this.updateState({
      autoMode: false,
      sightMode: false,
      autoModeEnemiesGroup: [],
      ufoMode: false,
      laserMode: false,
      grenadeMode: false,
    });
  }
}

export { Model };
