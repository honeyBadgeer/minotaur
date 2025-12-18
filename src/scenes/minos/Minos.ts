import { Symbol } from '@/entities/symbol';
import { getSymbol } from '@/services/helpers';
import { GameObjects, Scene } from 'phaser';

export class Minos extends Scene {
  private symbolContainer: GameObjects.Container | null = null;
  private firstColumn: Symbol[] = [];
  private secondColumn: Symbol[] = [];
  private thirdColumn: Symbol[] = [];
  private fourthColumn: Symbol[] = [];
  private fifthColumn: Symbol[] = [];

  constructor() {
    super('Minos');
  }

  create() {
    this.createFrontFrame();
  }

  initCombination(value: number[][]) {
    this.symbolContainer = this.add.container(250, 160);

    const offsetX = 280;
    const offsetY = 280;

    value.map((row, rowIdx) => {
      row.map((symbol, colIdx) => {
        const type = getSymbol(symbol);

        const posX = rowIdx * offsetX;
        const posY = colIdx * offsetY;

        const newSymbol = new Symbol(this, type, posX, posY);

        this.symbolContainer?.add(newSymbol);

        this.handleSetColumns(rowIdx, newSymbol);
      });
    });
  }

  handleAnimate(newCombination: number[][]) {
    this.handleSetMask();

    this.handleAnimateOut();

    this.handleAnimateIn(newCombination);
  }

  private handleSetColumns(rowIdx: number, symbol: Symbol) {
    if (rowIdx === 0) {
      this.firstColumn.push(symbol);
    }
    if (rowIdx === 1) {
      this.secondColumn.push(symbol);
    }
    if (rowIdx === 2) {
      this.thirdColumn.push(symbol);
    }
    if (rowIdx === 3) {
      this.fourthColumn.push(symbol);
    }
    if (rowIdx === 4) {
      this.fifthColumn.push(symbol);
    }
  }

  private handleAnimateOut() {
    this.tweens.addMultiple([
      {
        targets: this.firstColumn,
        y: this.game.canvas.height + 500,
        duration: 1000,
        delay: 0,
        ease: 'Back.easeInOut',
      },
      {
        targets: this.secondColumn,
        y: this.game.canvas.height + 500,
        duration: 1000,
        delay: 100,
        ease: 'Back.easeInOut',
      },
      {
        targets: this.thirdColumn,
        y: this.game.canvas.height + 500,
        duration: 1000,
        delay: 200,
        ease: 'Back.easeInOut',
      },
      {
        targets: this.fourthColumn,
        y: this.game.canvas.height + 500,
        duration: 1000,
        delay: 300,
        ease: 'Back.easeInOut',
      },
      {
        targets: this.fifthColumn,
        y: this.game.canvas.height + 500,
        duration: 1000,
        delay: 400,
        ease: 'Back.easeInOut',
        onComplete: () => {
          this.symbolContainer?.clearMask();
        },
      },
    ]);
  }

  private handleAnimateIn(newCombination: number[][]) {
    const offsetX = 280;
    const offsetY = 280;
    const newFirstColumn: Symbol[] = [];
    const newSecondColumn: Symbol[] = [];
    const newThirdColumn: Symbol[] = [];
    const newFourthColumn: Symbol[] = [];
    const newFifthColumn: Symbol[] = [];

    newCombination.map((row, rowIdx) => {
      row.map((symbol, colIdx) => {
        const type = getSymbol(symbol);

        const posX = rowIdx * offsetX;
        const posY = colIdx * offsetY;

        const newSymbol = new Symbol(this, type, posX, posY);

        this.symbolContainer?.add(newSymbol);

        if (rowIdx === 0) {
          newFirstColumn.push(newSymbol);
        }
        if (rowIdx === 1) {
          newSecondColumn.push(newSymbol);
        }
        if (rowIdx === 2) {
          newThirdColumn.push(newSymbol);
        }
        if (rowIdx === 3) {
          newFourthColumn.push(newSymbol);
        }
        if (rowIdx === 4) {
          newFifthColumn.push(newSymbol);
        }
      });
    });

    this.tweens.addMultiple([
      {
        targets: newFirstColumn,
        y: { from: -600, to: 0 },
        duration: 1000,
        delay: 0,
        ease: 'Back.easeInOut',
        onComplete: () => {
          this.firstColumn.forEach((i) => i.destroy());
          this.firstColumn = [];
          this.firstColumn = newFirstColumn;
        },
      },
      {
        targets: newSecondColumn,
        y: { from: -600, to: 0 },
        duration: 1000,
        ease: 'Back.easeInOut',
        onComplete: () => {
          this.secondColumn.forEach((i) => i.destroy());
          this.secondColumn = [];
          this.secondColumn = newSecondColumn;
        },
        delay: 100,
      },
      {
        targets: newThirdColumn,
        y: { from: -600, to: 0 },
        duration: 1000,
        delay: 200,
        ease: 'Back.easeInOut',
        onComplete: () => {
          this.thirdColumn.forEach((i) => i.destroy());
          this.thirdColumn = [];
          this.thirdColumn = newThirdColumn;
        },
      },
      {
        targets: newFourthColumn,
        y: { from: -600, to: 0 },
        duration: 1000,
        delay: 300,
        ease: 'Back.easeInOut',
        onComplete: () => {
          this.fourthColumn.forEach((i) => i.destroy());
          this.fourthColumn = [];
          this.fourthColumn = newFourthColumn;
        },
      },
      {
        targets: newFifthColumn,
        y: { from: -600, to: 0 },
        duration: 1000,
        delay: 400,
        ease: 'Back.easeInOut',
        onComplete: () => {
          this.fifthColumn.forEach((i) => i.destroy());
          this.fifthColumn = [];
          this.fifthColumn = newFifthColumn;
        },
      },
    ]);
  }

  private createFrontFrame() {
    this.add
      .image(
        this.game.canvas.width * 0.5,
        this.game.canvas.height * 0.5,
        'frontFrame'
      )
      .setOrigin(0.5)
      .setScale(0.8);
  }

  private handleSetMask() {
    const maskRect = this.add
      .rectangle(162, 84, 1116, 638, 0x000000)
      .setOrigin(0)
      .setVisible(false);

    const mask = maskRect.createGeometryMask();
    this.symbolContainer?.setMask(mask);
  }
}
