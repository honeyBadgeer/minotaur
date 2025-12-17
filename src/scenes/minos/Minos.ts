import { Symbol } from '@/entities/symbol';
import { getSymbol } from '@/services/helpers';
import { GameObjects, Scene } from 'phaser';

export class Minos extends Scene {
  private combination: number[][] = [];
  private symbolContainer: GameObjects.Container | null = null;
  private firstColumn: Symbol[] = [];

  constructor() {
    super('Minos');
  }

  create() {
    this.createFrontFrame();
  }

  initCombination(value: number[][]) {
    this.combination = value;
  }

  handleAnimate() {
    const maskRect = this.add
      .rectangle(162, 84, 1116, 638, 0x000000)
      .setOrigin(0)
      .setVisible(false);

    const mask = maskRect.createGeometryMask();
    this.symbolContainer?.setMask(mask);

    this.tweens.add({
      targets: this.firstColumn,
      y: this.game.canvas.height + 500,
      duration: 3000,
      ease: 'Back.easeInOut',
      onComplete: () => {
        this.symbolContainer?.clearMask();
      },
    });
  }

  createSymbols() {
    this.symbolContainer = this.add.container(250, 160);

    const offsetX = 280;
    const offsetY = 280;

    this.combination.map((row, rowIdx) => {
      row.map((symbol, colIdx) => {
        const type = getSymbol(symbol);

        const posX = rowIdx * offsetX;
        const posY = colIdx * offsetY;

        const newSymbol = new Symbol(this, type, posX, posY);

        this.symbolContainer?.add(newSymbol);

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
