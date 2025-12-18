import { Symbol } from '@/entities/symbol';
import { getSymbol } from '@/services/helpers';
import { GameObjects, Scene } from 'phaser';

type Columns = 'first' | 'second' | 'third' | 'fourth' | 'fifth';

const offsetX = 280;
const offsetY = 280;

export class Minos extends Scene {
  private symbolsContainer: GameObjects.Container | null = null;
  private frontColumns: Record<Columns, GameObjects.Container | null> = {
    first: null,
    second: null,
    third: null,
    fourth: null,
    fifth: null,
  };
  private hideColumns: Record<Columns, GameObjects.Container | null> = {
    first: null,
    second: null,
    third: null,
    fourth: null,
    fifth: null,
  };
  private maskRect: GameObjects.Rectangle | null = null;
  private mask: Phaser.Display.Masks.GeometryMask | null = null;

  constructor() {
    super('Minos');
  }

  create() {
    this.createFrontFrame();

    this.maskRect = this.add
      .rectangle(162, 84, 1116, 638, 0x000000)
      .setOrigin(0)
      .setVisible(false);

    this.mask = this.maskRect.createGeometryMask();
  }

  initCombination(value: number[][]) {
    this.symbolsContainer = this.add.container(250, 160);
    this.symbolsContainer.name = 'Symbols';

    this.createColumns();

    this.handleCreateCombination(value, this.frontColumns);
  }

  handleAnimate(newCombination: number[][]) {
    this.handleSetMask();

    this.handleAnimateOut();

    this.handleAnimateIn(newCombination);
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
    this.handleCreateCombination(newCombination, this.hideColumns);

    this.tweens.addMultiple([
      {
        targets: this.hideColumns.first,
        y: { from: -600, to: 0 },
        duration: 1000,
        delay: 0,
        ease: 'Back.easeInOut',
        onComplete: () => {
          this.frontColumns.first?.removeAll(true);
          const children = this.hideColumns.first?.list.slice();
          children?.forEach((child) => {
            this.frontColumns.first!.add(child);
          });
          this.hideColumns.first?.removeAll(true);
          this.hideColumns.first?.setY(-600);
          this.frontColumns.first?.setY(0);
        },
      },
      {
        targets: this.hideColumns.second,
        y: { from: -600, to: 0 },
        duration: 1000,
        delay: 100,
        ease: 'Back.easeInOut',
        onComplete: () => {
          this.frontColumns.second?.removeAll(true);
          const children = this.hideColumns.second?.list.slice();
          children?.forEach((child) => {
            this.frontColumns.second!.add(child);
          });
          this.hideColumns.second?.removeAll(true);
          this.hideColumns.second?.setY(-600);
          this.frontColumns.second?.setY(0);
        },
      },
      {
        targets: this.hideColumns.third,
        y: { from: -600, to: 0 },
        duration: 1000,
        delay: 200,
        ease: 'Back.easeInOut',
        onComplete: () => {
          this.frontColumns.third?.removeAll(true);
          const children = this.hideColumns.third?.list.slice();
          children?.forEach((child) => {
            this.frontColumns.third!.add(child);
          });
          this.hideColumns.third?.removeAll(true);
          this.hideColumns.third?.setY(-600);
          this.frontColumns.third?.setY(0);
        },
      },
      {
        targets: this.hideColumns.fourth,
        y: { from: -600, to: 0 },
        duration: 1000,
        delay: 300,
        ease: 'Back.easeInOut',
        onComplete: () => {
          this.frontColumns.fourth?.removeAll(true);

          const children = this.hideColumns.fourth?.list.slice();

          children?.forEach((child) => {
            this.frontColumns.fourth!.add(child);
          });

          this.hideColumns.fourth?.removeAll(true);
          this.hideColumns.fourth?.setY(-600);
          this.frontColumns.fourth?.setY(0);
        },
      },
      {
        targets: this.hideColumns.fifth,
        y: { from: -600, to: 0 },
        duration: 1000,
        delay: 400,
        ease: 'Back.easeInOut',
        onComplete: () => {
          this.frontColumns.fifth?.removeAll(true);

          const children = this.hideColumns.fifth?.list.slice();

          children?.forEach((child) => {
            this.frontColumns.fifth!.add(child);
          });

          this.hideColumns.fifth?.removeAll(true);
          this.hideColumns.fifth?.setY(-600);
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
    if (!this.mask || !this.symbolsContainer) return;
    this.symbolsContainer.setMask(this.mask);
  }

  private createColumns() {
    this.frontColumns.first = this.add.container(0, 0);
    this.frontColumns.first.name = `first front column`;
    this.frontColumns.second = this.add.container(0, 0);
    this.frontColumns.second.name = `second front column`;
    this.frontColumns.third = this.add.container(0, 0);
    this.frontColumns.third.name = `third front column`;
    this.frontColumns.fourth = this.add.container(0, 0);
    this.frontColumns.fourth.name = `fourth front column`;
    this.frontColumns.fifth = this.add.container(0, 0);
    this.frontColumns.fifth.name = `fifth front column`;

    this.hideColumns.first = this.add.container(0, -600);
    this.hideColumns.first.name = `first hide column`;
    this.hideColumns.second = this.add.container(0, -600);
    this.hideColumns.second.name = `second hide column`;
    this.hideColumns.third = this.add.container(0, -600);
    this.hideColumns.third.name = `third hide column`;
    this.hideColumns.fourth = this.add.container(0, -600);
    this.hideColumns.fourth.name = `fourth hide column`;
    this.hideColumns.fifth = this.add.container(0, -600);
    this.hideColumns.fifth.name = `fifth hide column`;

    this.symbolsContainer?.add([
      this.frontColumns.first,
      this.frontColumns.second,
      this.frontColumns.third,
      this.frontColumns.fourth,
      this.frontColumns.fifth,
      this.hideColumns.first,
      this.hideColumns.second,
      this.hideColumns.third,
      this.hideColumns.fourth,
      this.hideColumns.fifth,
    ]);
  }

  private handleSetColumns(
    rowIdx: number,
    symbol: Symbol,
    container: Record<Columns, GameObjects.Container | null>
  ) {
    if (rowIdx === 0) {
      container.first?.add(symbol);
    }
    if (rowIdx === 1) {
      container.second?.add(symbol);
    }
    if (rowIdx === 2) {
      container.third?.add(symbol);
    }
    if (rowIdx === 3) {
      container.fourth?.add(symbol);
    }
    if (rowIdx === 4) {
      container.fifth?.add(symbol);
    }
  }

  handleCreateCombination(
    value: number[][],
    container: Record<Columns, GameObjects.Container | null>
  ) {
    value.map((row, rowIdx) => {
      row.map((symbol, colIdx) => {
        const type = getSymbol(symbol);

        const posX = rowIdx * offsetX;
        const posY = colIdx * offsetY;

        const newSymbol = new Symbol(this, type, posX, posY);

        this.symbolsContainer?.add(newSymbol);

        this.handleSetColumns(rowIdx, newSymbol, container);
      });
    });
  }
}
