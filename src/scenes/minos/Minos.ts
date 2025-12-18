import { Symbol } from '@/entities/symbol';
import { getSymbol } from '@/services/helpers';
import { GameObjects, Scene } from 'phaser';

type Columns = 'first' | 'second' | 'third' | 'fourth' | 'fifth';

export class Minos extends Scene {
  private symbolsContainer: GameObjects.Container | null = null;
  private frontColumns: Record<Columns, GameObjects.Container | null> = {
    first: null,
    second: null,
    third: null,
    fourth: null,
    fifth: null,
  };

  constructor() {
    super('Minos');
  }

  create() {
    this.createFrontFrame();
  }

  initCombination(value: number[][]) {
    this.symbolsContainer = this.add.container(250, 160);
    this.symbolsContainer.name = 'Symbols';

    this.createColumns();

    const offsetX = 280;
    const offsetY = 280;

    value.map((row, rowIdx) => {
      row.map((symbol, colIdx) => {
        const type = getSymbol(symbol);

        const posX = rowIdx * offsetX;
        const posY = colIdx * offsetY;

        const newSymbol = new Symbol(this, type, posX, posY);

        this.symbolsContainer?.add(newSymbol);

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
      this.frontColumns.first?.add(symbol);
    }
    if (rowIdx === 1) {
      this.frontColumns.second?.add(symbol);
    }
    if (rowIdx === 2) {
      this.frontColumns.third?.add(symbol);
    }
    if (rowIdx === 3) {
      this.frontColumns.fourth?.add(symbol);
    }
    if (rowIdx === 4) {
      this.frontColumns.fifth?.add(symbol);
    }
  }

  private handleAnimateOut() {
    this.tweens.addMultiple([
      {
        targets: this.frontColumns.first,
        y: this.game.canvas.height + 500,
        duration: 1000,
        delay: 0,
        ease: 'Back.easeInOut',
      },
      {
        targets: this.frontColumns.second,
        y: this.game.canvas.height + 500,
        duration: 1000,
        delay: 100,
        ease: 'Back.easeInOut',
      },
      {
        targets: this.frontColumns.third,
        y: this.game.canvas.height + 500,
        duration: 1000,
        delay: 200,
        ease: 'Back.easeInOut',
      },
      {
        targets: this.frontColumns.fourth,
        y: this.game.canvas.height + 500,
        duration: 1000,
        delay: 300,
        ease: 'Back.easeInOut',
      },
      {
        targets: this.frontColumns.fifth,
        y: this.game.canvas.height + 500,
        duration: 1000,
        delay: 400,
        ease: 'Back.easeInOut',
        onComplete: () => {
          this.symbolsContainer?.clearMask();
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
    this.symbolsContainer?.add([
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

        this.symbolsContainer?.add(newSymbol);

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
          this.frontColumns.first?.removeAll(true);
          const children = newFirstColumn.list.slice();
          children.forEach((child) => {
            this.frontColumns.first!.add(child);
          });
          newFirstColumn.destroy();
          this.frontColumns.first?.setY(0);
        },
      },
      {
        targets: newSecondColumn,
        y: { from: -600, to: 0 },
        duration: 1000,
        delay: 100,
        ease: 'Back.easeInOut',
        onComplete: () => {
          this.frontColumns.second?.removeAll(true);
          const children = newSecondColumn.list.slice();
          children.forEach((child) => {
            this.frontColumns.second!.add(child);
          });
          newSecondColumn.destroy();
          this.frontColumns.second?.setY(0);
        },
      },
      {
        targets: newThirdColumn,
        y: { from: -600, to: 0 },
        duration: 1000,
        delay: 200,
        ease: 'Back.easeInOut',
        onComplete: () => {
          this.frontColumns.third?.removeAll(true);
          const children = newThirdColumn.list.slice();
          children.forEach((child) => {
            this.frontColumns.third!.add(child);
          });
          newThirdColumn.destroy();
          this.frontColumns.third?.setY(0);
        },
      },
      {
        targets: newFourthColumn,
        y: { from: -600, to: 0 },
        duration: 1000,
        delay: 300,
        ease: 'Back.easeInOut',
        onComplete: () => {
          this.frontColumns.fourth?.removeAll(true);

          const children = newFourthColumn.list.slice();

          children.forEach((child) => {
            this.frontColumns.fourth!.add(child);
          });

          newFourthColumn.destroy();
          this.frontColumns.fourth?.setY(0);
        },
      },
      {
        targets: newFifthColumn,
        y: { from: -600, to: 0 },
        duration: 1000,
        delay: 400,
        ease: 'Back.easeInOut',
        onComplete: () => {
          this.frontColumns.fifth?.removeAll(true);

          const children = newFifthColumn.list.slice();

          children.forEach((child) => {
            this.frontColumns.fifth!.add(child);
          });

          newFifthColumn.destroy();
          this.frontColumns.fifth?.setY(0);
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
    this.symbolsContainer?.setMask(mask);
  }

  private createColumns() {
    this.frontColumns.first = this.add.container(0, 0);
    this.frontColumns.first.name = `first column`;
    this.frontColumns.second = this.add.container(0, 0);
    this.frontColumns.second.name = `second column`;
    this.frontColumns.third = this.add.container(0, 0);
    this.frontColumns.third.name = `third column`;
    this.frontColumns.fourth = this.add.container(0, 0);
    this.frontColumns.fourth.name = `fourth column`;
    this.frontColumns.fifth = this.add.container(0, 0);
    this.frontColumns.fifth.name = `fifth column`;

    this.symbolsContainer?.add([
      this.frontColumns.first,
      this.frontColumns.second,
      this.frontColumns.third,
      this.frontColumns.fourth,
      this.frontColumns.fifth,
    ]);
  }
}
