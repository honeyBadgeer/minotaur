import type { BeastMode } from '@/types/types';

export enum WSStates {
  BROADCAST = 'broadcast',
  OK = 'OK',
  ERROR = 'error',
  TICKET = 'ticket',
}

export interface WSData {
  session: number;
  drawNo: string;
  bet: number;
  maxBet: number;
  demo: boolean;
  nick: string;
  backUrl: string;
  registerUrl: string;
  refullUrl: string;
  lng: string;
  currentBet: number;
  currentBetMDE: number;
  rulesUrl: string;
  betLadder: string;
  betLadderMDE: string;
  taxAmount: number;
  balance: number;
  state: WSStates | '';
  prizeName: string;
  maxPrize: number;
  maxPrizeMDE: number;
}

export enum WSGameType {
  TICKET,
  BUY_BUNDLE,
}

export interface WSTicketWinState {
  ticketNumber: string;
  win_amount: number;
  beastMode: BeastMode;
}

export interface WSTicket {
  state: WSStates.TICKET;
  betID: string;
  balance: number;
  win_amount: number;
  amount_to_accrued: number;
  ticketNumber: string;

  beastMode: BeastMode;
  gameType: WSGameType;
  objectID: string;
  rows?: WSTicketWinState[];
}

export interface WSError {
  msg: string;
  state: WSStates.ERROR;
  balance: number;
}
