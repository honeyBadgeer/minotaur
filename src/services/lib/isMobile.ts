import type { Game } from 'phaser';

function isMobile(game: Game): boolean {
  const { os } = game.device;
  return os.android || os.iOS || os.iPad;
}

export { isMobile };
