import { eventBus } from '@/core/events/EventBus';
import { CoreEvents } from '@/core/events/events';
import { GameStates } from '@/core/Model/types';
import { MinotaurFull } from '@/entities/MinotaurFull';
import { Symbol } from '@/entities/symbol';
import { getSymbol } from '@/services/helpers';
import type { Columns } from '@/types/types';
import { GameObjects, Scene } from 'phaser';

const offsetX = 225;
const offsetY = 225;
const hideContainePositionY = -800;
const containerFallingAnimDuration = 1000;
const containerWidth = 1116;
const containerHeight = 638;
const containerPosX = 160;
const containerPosY = 84;

const keys = ['first', 'second', 'third', 'fourth', 'fifth'] as const;

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
      .rectangle(
        containerPosX,
        containerPosY,
        containerWidth,
        containerHeight,
        0x000000
      )
      .setOrigin(0)
      .setVisible(false);

    this.mask = this.maskRect.createGeometryMask();
  }

  initCombination(value: number[][]) {
    this.symbolsContainer = this.add.container(containerPosX, containerPosY);
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
    keys.forEach((key, i) => {
      const frontCol = this.frontColumns[key];

      this.tweens.add({
        targets: frontCol,
        y: this.game.canvas.height + 500,
        duration: containerFallingAnimDuration,
        delay: i * 100,
        ease: 'Back.easeInOut',
        onComplete: (tween: Phaser.Tweens.Tween) => {
          this.symbolsContainer?.clearMask();
          tween.remove();
        },
      });
    });
  }

  private handleAnimateIn(newCombination: number[][]) {
    this.handleCreateCombination(newCombination, this.hideColumns);

    keys.forEach((key, i) => {
      const hideCol = this.hideColumns[key];
      const frontCol = this.frontColumns[key];

      this.tweens.add({
        targets: hideCol,
        y: { from: hideContainePositionY, to: 0 },
        duration: containerFallingAnimDuration,
        delay: i * 100,
        ease: 'Back.easeInOut',
        onComplete: (tween: Phaser.Tweens.Tween) => {
          frontCol?.removeAll(true);
          const children = hideCol?.list.slice();
          children?.forEach((child) => {
            frontCol!.add(child);
          });
          hideCol?.removeAll(true);
          hideCol?.setY(hideContainePositionY);
          frontCol?.setY(0);

          if (i === keys.length - 1) {
            const bonusGameColumnIndex = this.getIsBonuscolumn();

            bonusGameColumnIndex === -1
              ? eventBus.emit(CoreEvents.SetGameState, GameStates.IDLE)
              : this.handleCreateMinos(bonusGameColumnIndex);
          }

          tween.remove();
        },
      });
    });
  }

  private handleCreateMinos(bonusGameColumnIndex: number) {
    if (!this.frontColumns) return;

    const test = keys[bonusGameColumnIndex];

    const column = this.frontColumns[test];
    const children = column?.list.slice() as Symbol[];

    const symbol = children.find((item) => item.getType() === 'minotaur');
    if (!symbol) return;

    this.tweens.chain({
      targets: symbol.spineInstance,
      tweens: [
        {
          scale: 1.5,
          ease: 'Linear',
          duration: 800,
        },
        {
          scale: 0.7,
          ease: 'Linear',
          duration: 800,
        },
      ],
      onComplete: () => {
        children
          .filter((item) => item.getType() !== 'minotaur')
          .forEach((item) => item.setVisible(false));

        this.tweens.add({
          targets: symbol,
          y: children[1].y,
          ease: 'Linear',
          duration: 400,
          onComplete: () => {
            const positionX = symbol.x;
            column?.removeAll(true);
            const minos = new MinotaurFull(this);
            column?.add(minos);
            minos.setPosition(positionX, symbol.y);
            eventBus.emit(CoreEvents.SetGameState, GameStates.IDLE);

            const newKeys = keys.filter((key, i) => i !== bonusGameColumnIndex);

            this.handleAddRocks(newKeys);
          },
        });
      },
    });
  }

  private getIsBonuscolumn(): number {
    if (!this.frontColumns) return -1;

    return keys.findIndex((key, i) => {
      const frontCol = this.frontColumns[key];
      if (!frontCol) return;

      const children = frontCol.list.slice();

      const col = children.find((item) => {
        if (item instanceof Symbol) {
          return item.getType() === 'minotaur';
        }
      });

      if (col) return i;
    });
  }

  private handleAddRocks(
    newKeys: ('first' | 'second' | 'third' | 'fourth' | 'fifth')[]
  ) {
    newKeys.forEach((key, i) => {
      const hideCol = this.hideColumns[key];
      const frontCol = this.frontColumns[key];

      const frontColChildren = frontCol?.list.slice() as Symbol[];

      const rock = this.add
        .image(0, -1000, 'rock')
        .setOrigin(0.5)
        .setScale(0.8);
      rock.setX(frontColChildren[0].x);
      hideCol?.add(rock);

      this.tweens.add({
        targets: rock,
        y: 0 + rock.displayHeight / 2,
        duration: containerFallingAnimDuration,
        delay: i * 100,
        ease: 'Linear',
        onComplete: () => {
          frontCol?.removeAll(true);
          const hideColChildren = hideCol?.list.slice();

          hideColChildren?.forEach((child) => {
            frontCol!.add(child);
          });
          hideCol?.removeAll(true);
          hideCol?.setY(hideContainePositionY);
        },
      });
    });
  }

  private createFrontFrame() {
    this.add
      .image(
        this.game.canvas.width * 0.5,
        this.game.canvas.height * 0.5,
        'frame'
      )
      .setOrigin(0.5)
      .setScale(0.8);
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

    this.hideColumns.first = this.add.container(0, hideContainePositionY);
    this.hideColumns.first.name = `first hide column`;
    this.hideColumns.second = this.add.container(0, hideContainePositionY);
    this.hideColumns.second.name = `second hide column`;
    this.hideColumns.third = this.add.container(0, hideContainePositionY);
    this.hideColumns.third.name = `third hide column`;
    this.hideColumns.fourth = this.add.container(0, hideContainePositionY);
    this.hideColumns.fourth.name = `fourth hide column`;
    this.hideColumns.fifth = this.add.container(0, hideContainePositionY);
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

  private handleCreateCombination(
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
