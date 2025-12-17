import { Symbol } from '@/entities/symbol';
import { getSymbol } from '@/services/helpers';
import { GameObjects, Scene } from 'phaser';

export class Minos extends Scene {
  private winCombination: number[][] = [];
  private symbolContainer: GameObjects.Container | null = null;
  private firstColumn: Symbol[] = [];

  constructor() {
    super('Minos');

    this.winCombination = [
      [1, 1, 9],
      [8, 2, 3],
      [0, 0, 4],
      [0, 5, 7],
      [1, 6, 0],
    ];
  }

  create() {
    this.createFrontFrame();
    this.createSymbols();
  }

  handleAnimate() {
    this.tweens.add({
      targets: this.firstColumn,
      y: this.game.canvas.height + 500,
      duration: 4000,
      ease: 'Back.easeInOut',
    });
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

        if (rowIdx === 0) {
          this.firstColumn.push(newSymbol);
        }

        return newSymbol;
      });
    });
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
