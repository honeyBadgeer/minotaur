import { Symbol } from '@/entities/symbol';
import { getSymbol } from '@/services/helpers';
import { GameObjects, Scene } from 'phaser';

export class Minos extends Scene {
  private winCombination: number[][] = [];
  private symbolContainer: GameObjects.Container | null = null;

  constructor() {
    super('Minos');

    this.winCombination = [
      [0, 1, 9],
      [8, 2, 3],
      [0, 0, 4],
      [0, 5, 7],
      [1, 6, 0],
    ];
  }

  create() {
    this.createBackground();
    this.createFrontFrame();
    this.createSymbols();
  }

  createSymbols() {
    this.symbolContainer = this.add.container(350, 220);

    const startX = this.symbolContainer.x;
    const startY = this.symbolContainer.y;
    const offsetX = 280;
    const offsetY = 280;

    this.winCombination.map((row, rowIdx) => {
      row.map((symbol, colIdx) => {
        const type = getSymbol(symbol);

        const posX = startX + rowIdx * offsetX;
        const posY = startY + colIdx * offsetY;

        const newSymbol = new Symbol(this, type, posX, posY);

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

  createFrontFrame() {
    this.add
      .image(
        this.game.canvas.width * 0.5,
        this.game.canvas.height * 0.5,
        'frontFrame'
      )
      .setOrigin(0.5)
      .setScale(0.8);
  }
}
