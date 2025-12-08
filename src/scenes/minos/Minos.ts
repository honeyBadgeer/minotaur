import { Symbol } from '@/entities/symbol';
import { Scene } from 'phaser';

export class Minos extends Scene {
  private winCombination: number[][] = [];

  constructor() {
    super('Minos');

    this.winCombination = [
      [7, 7, 2],
      [9, 8, 8],
      [8, 8, 1],
      [1, 1, 1],
      [5, 6, 3],
    ];
  }

  create() {
    this.createBackground();
    this.createSymbols();
  }

  createSymbols() {
    const startX = 150;
    const startY = 150;
    const offsetX = 250;
    const offsetY = 250;

    this.winCombination.map((row, rowIdx) => {
      row.map((symbol, colIdx) => {
        const posX = startX + rowIdx * offsetX;
        const posY = startY + colIdx * offsetY;

        const newSymbol = new Symbol(this, posX, posY);

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
