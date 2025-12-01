import { WebSocketService } from '@/network/WebSocketService';
import { mdeToNormal } from '@/services/lib/mdeToNormal';
import { BetEvents } from '@core/events';
import type { Model } from '@/core/Model';
import type { Events } from 'phaser';

export class BetService {
  private model: Model;
  private eventBus: Events.EventEmitter;
  private ws: WebSocketService;
  constructor(
    model: Model,
    eventBus: Events.EventEmitter,
    ws: WebSocketService
  ) {
    this.model = model;
    this.eventBus = eventBus;
    this.ws = ws;
  }

  private changeBet(value: number) {
    const character = this.model.getCharacter();
    const bets = character?.bets;
    const currentBetMde = this.model.getCurrentBetMde();

    if (!character || !bets || !currentBetMde) {
      throw new Error('Что то не так с моделью');
    }

    const index = bets.indexOf(currentBetMde);

    let newIndex = index + value;

    if (newIndex < 0) newIndex = 0;
    if (newIndex > bets.length - 1) newIndex = bets.length - 1;

    const newBet = bets[newIndex];

    this.model.updateCurrentBetMde(newBet);
    this.ws.send(
      `bet_${mdeToNormal(newBet)}`,
      () => console.log('sent'),
      () => console.error('failed')
    );
    this.ws.send(
      'state',
      () => console.log('sent'),
      () => console.error('failed')
    );

    const { disableIncrease, disableDecrease } = this.getBetsState();

    this.eventBus.emit(BetEvents.BetChanged, {
      newBet,
      disableIncrease,
      disableDecrease,
    });
  }

  initBets() {
    const bets = this.model.getCharacter()?.bets;
    const currentBetMDE = this.model.getCurrentBetMde();

    if (!bets || !currentBetMDE) return;

    if (!bets.includes(currentBetMDE)) {
      this.model.updateCurrentBetMde(bets[0]);
      this.ws.send(`bet_${mdeToNormal(bets[0])}`);
      this.ws.send('state');
    }
  }

  public increase = () => {
    this.changeBet(1);
  };

  public decrease = () => {
    this.changeBet(-1);
  };

  public getBetsState() {
    const character = this.model.getCharacter();
    const currentBet = this.model.getCurrentBetMde();
    if (!character || !currentBet)
      return { disableIncrease: true, disableDecrease: true };

    const currentIndex = character.bets.indexOf(currentBet);
    return {
      disableIncrease: currentIndex === character.bets.length - 1,
      disableDecrease: currentIndex === 0,
    };
  }
}
