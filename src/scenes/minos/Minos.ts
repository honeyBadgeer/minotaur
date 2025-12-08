import { Symbol } from '@/entities/symbol';
import { getSymbol } from '@/services/helpers';
import { Scene } from 'phaser';

export class Minos extends Scene {
  private winCombination: number[][] = [];

  constructor() {
    super('Minos');

    this.winCombination = [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      [0, 1, 0],
      [1, 0, 0],
    ];
  }

  create() {
    this.createBackground();
    this.createSymbols();
  }

  createSymbols() {
    const startX = 250;
    const startY = 250;
    const offsetX = 280;
    const offsetY = 280;

    this.winCombination.map((row, rowIdx) => {
      row.map((symbol, colIdx) => {
        const test = getSymbol(symbol);

        const posX = startX + rowIdx * offsetX;
        const posY = startY + colIdx * offsetY;

        const newSymbol = new Symbol(this, test, posX, posY);

        return newSymbol;
      });
    });
  }

  createBackground() {
    this.add
      .image(0, 0, 'background')
      .setOrigin(0)
      .setDisplaySize(1440, 810)
      .setDepth(-1);
  }
}
