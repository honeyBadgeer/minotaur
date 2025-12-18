import { Symbol } from '@/entities/symbol';
import { getSymbol } from '@/services/helpers';
import { GameObjects, Scene } from 'phaser';

export class Minos extends Scene {
  private symbolContainer: GameObjects.Container | null = null;
  private firstColumn: GameObjects.Container | null = null;
  private secondColumn: GameObjects.Container | null = null;
  private thirdColumn: GameObjects.Container | null = null;
  private fourthColumn: GameObjects.Container | null = null;
  private fifthColumn: GameObjects.Container | null = null;

  constructor() {
    super('Minos');
  }

  create() {
    this.createFrontFrame();
  }

  initCombination(value: number[][]) {
    this.symbolContainer = this.add.container(250, 160);

    this.fifthColumn = this.add.container(0, 0);
    this.fifthColumn.name = 'fifthColumn';
    this.fourthColumn = this.add.container(0, 0);
    this.fourthColumn.name = 'fourthColumn';
    this.thirdColumn = this.add.container(0, 0);
    this.thirdColumn.name = 'thirdColumn';
    this.secondColumn = this.add.container(0, 0);
    this.secondColumn.name = 'secondColumn';
    this.firstColumn = this.add.container(0, 0);
    this.firstColumn.name = 'firstColumn';

    this.symbolContainer?.add([
      this.firstColumn,
      this.secondColumn,
      this.thirdColumn,
      this.fourthColumn,
      this.fifthColumn,
    ]);

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
      this.firstColumn?.add(symbol);
    }
    if (rowIdx === 1) {
      this.secondColumn?.add(symbol);
    }
    if (rowIdx === 2) {
      this.thirdColumn?.add(symbol);
    }
    if (rowIdx === 3) {
      this.fourthColumn?.add(symbol);
    }
    if (rowIdx === 4) {
      this.fifthColumn?.add(symbol);
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
    const newFirstColumn = this.add.container(0, -600);
    const newSecondColumn = this.add.container(0, -600);
    const newThirdColumn = this.add.container(0, -600);
    const newFourthColumn = this.add.container(0, -600);
    const newFifthColumn = this.add.container(0, -600);
    this.symbolContainer?.add([
      newFifthColumn,
      newFourthColumn,
      newThirdColumn,
      newSecondColumn,
      newFirstColumn,
    ]);

    newCombination.map((row, rowIdx) => {
      row.map((symbol, colIdx) => {
        const type = getSymbol(symbol);

        const posX = rowIdx * offsetX;
        const posY = colIdx * offsetY;

        const newSymbol = new Symbol(this, type, posX, posY);

        this.symbolContainer?.add(newSymbol);

        if (rowIdx === 0) {
          newFirstColumn.add(newSymbol);
        }
        if (rowIdx === 1) {
          newSecondColumn.add(newSymbol);
        }
        if (rowIdx === 2) {
          newThirdColumn.add(newSymbol);
        }
        if (rowIdx === 3) {
          newFourthColumn.add(newSymbol);
        }
        if (rowIdx === 4) {
          newFifthColumn.add(newSymbol);
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
          this.firstColumn?.removeAll(true);
          const children = newFirstColumn.list.slice();
          children.forEach((child) => {
            this.firstColumn!.add(child);
          });
          newFirstColumn.destroy();
          this.firstColumn?.setY(0);
        },
      },
      {
        targets: newSecondColumn,
        y: { from: -600, to: 0 },
        duration: 1000,
        delay: 100,
        ease: 'Back.easeInOut',
        onComplete: () => {
          this.secondColumn?.removeAll(true);
          const children = newSecondColumn.list.slice();
          children.forEach((child) => {
            this.secondColumn!.add(child);
          });
          newSecondColumn.destroy();
          this.secondColumn?.setY(0);
        },
      },
      {
        targets: newThirdColumn,
        y: { from: -600, to: 0 },
        duration: 1000,
        delay: 200,
        ease: 'Back.easeInOut',
        onComplete: () => {
          this.thirdColumn?.removeAll(true);
          const children = newThirdColumn.list.slice();
          children.forEach((child) => {
            this.thirdColumn!.add(child);
          });
          newThirdColumn.destroy();
          this.thirdColumn?.setY(0);
        },
      },
      {
        targets: newFourthColumn,
        y: { from: -600, to: 0 },
        duration: 1000,
        delay: 300,
        ease: 'Back.easeInOut',
        onComplete: () => {
          this.fourthColumn?.removeAll(true);

          const children = newFourthColumn.list.slice();

          children.forEach((child) => {
            this.fourthColumn!.add(child);
          });

          newFourthColumn.destroy();
          this.fourthColumn?.setY(0);
        },
      },
      {
        targets: newFifthColumn,
        y: { from: -600, to: 0 },
        duration: 1000,
        delay: 400,
        ease: 'Back.easeInOut',
        onComplete: () => {
          this.fifthColumn?.removeAll(true);

          const children = newFifthColumn.list.slice();

          children.forEach((child) => {
            this.fifthColumn!.add(child);
          });

          newFifthColumn.destroy();
          this.fifthColumn?.setY(0);
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
