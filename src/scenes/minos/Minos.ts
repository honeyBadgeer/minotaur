import { eventBus } from '@/core/events/EventBus';
import { CoreEvents } from '@/core/events/events';
import { GameStates } from '@/core/Model/types';
import { MinotaurFull } from '@/entities/MinotaurFull';
import { Symbol } from '@/entities/symbol';
import { COLUMNS_KEYS } from '@/services/constants';
import { getSymbol } from '@/services/helpers';
import type { Columns } from '@/types/types';
import { GameObjects, Scene } from 'phaser';

const offsetX = 225;
const offsetY = 225;
const hideContainePositionY = -800;
const containerFallingAnimDuration = 500;
const containerWidth = 1116;
const containerHeight = 638;
const containerPosX = 160;
const containerPosY = 84;
const waitingTimeToAddColumns = 100;

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
  private fourthColumnTileSprite: Phaser.GameObjects.TileSprite | null = null;

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

    this.fourthColumnTileSprite = this.add.tileSprite(
      0,
      -1034,
      266,
      1034,
      'symbolsAll'
    );
    this.fourthColumnTileSprite.setOrigin(0.5, 0).setTileScale(1, 3);
  }

  initCombination(value: number[][]) {
    this.symbolsContainer = this.add.container(containerPosX, containerPosY);
    this.symbolsContainer.name = 'Symbols';

    this.createColumns();

    this.handleCreateCombination(value, this.frontColumns);
  }

  handleAnimate(newCombination: number[][], bonusGamePosition: number[]) {
    this.handleSetMask();

    this.handleCreateCombination(newCombination, this.hideColumns);

    const firstColumntTimeLine = this.add.timeline({});

    firstColumntTimeLine.add([
      {
        tween: {
          targets: this.frontColumns.first,
          y: this.game.canvas.height + 500,
          duration: containerFallingAnimDuration,
          delay: 0,
          ease: 'Back.easeInOut',
          easeParams: [1.2],
          onComplete: () => {
            this.frontColumns.first?.removeAll(true);
          },
        },
      },
      {
        tween: {
          targets: this.hideColumns.first,
          y: 0,
          duration: containerFallingAnimDuration,
          ease: 'Back.easeInOut',
          easeParams: [1.2],
          onStart: () =>
            this.handleStartSecondColumnAnimation(bonusGamePosition),
          onComplete: () => {
            const hideColSymbols = this.hideColumns.first?.list.slice();
            hideColSymbols?.forEach((child) => {
              this.frontColumns.first!.add(child);
            });
            this.hideColumns.first?.removeAll(true).setY(hideContainePositionY);
            this.frontColumns.first?.setY(0);
          },
        },
      },
    ]);

    firstColumntTimeLine.play();
  }

  private handleStartSecondColumnAnimation(bonusGamePosition: number[]) {
    const secondColumntTimeLine = this.add.timeline([
      {
        tween: {
          targets: this.frontColumns.second,
          y: this.game.canvas.height + 500,
          duration: containerFallingAnimDuration,
          delay: 50,
          ease: 'Back.easeInOut',
          easeParams: [1.2],
          onComplete: () => {
            this.frontColumns.second?.removeAll(true);
          },
        },
      },
      {
        tween: {
          targets: this.hideColumns.second,
          y: 0,
          duration: containerFallingAnimDuration,
          ease: 'Back.easeInOut',
          easeParams: [1.2],
          delay: 50,
          onStart: () =>
            this.handleStartThirdColumnAnimation(bonusGamePosition),
          onComplete: () => {
            const hideColSymbols = this.hideColumns.second?.list.slice();
            hideColSymbols?.forEach((child) => {
              this.frontColumns.second!.add(child);
            });
            this.hideColumns.second
              ?.removeAll(true)
              .setY(hideContainePositionY);
            this.frontColumns.second?.setY(0);
          },
        },
      },
    ]);

    secondColumntTimeLine.play();
  }

  handleStartThirdColumnAnimation(bonusGamePosition: number[]) {
    const thirdColumntTimeLine = this.add.timeline([
      {
        tween: {
          targets: this.frontColumns.third,
          y: this.game.canvas.height + 500,
          duration: containerFallingAnimDuration,
          delay: 100,
          ease: 'Back.easeInOut',
          easeParams: [1.2],
          onComplete: () => {
            this.frontColumns.third?.removeAll(true);
          },
        },
      },
      {
        tween: {
          targets: this.hideColumns.third,
          y: 0,
          duration: containerFallingAnimDuration,
          delay: 100,
          ease: 'Back.easeInOut',
          easeParams: [1.2],
          onStart: () =>
            this.handleStartFourthColumnAnimation(bonusGamePosition),
          onComplete: () => {
            const hideColSymbols = this.hideColumns.third?.list.slice();
            hideColSymbols?.forEach((child) => {
              this.frontColumns.third!.add(child);
            });
            this.hideColumns.third?.removeAll(true).setY(hideContainePositionY);
            this.frontColumns.third?.setY(0);
          },
        },
      },
    ]);

    thirdColumntTimeLine.play();
  }

  private handleStartFourthColumnAnimation(bonusGamePosition: number[]) {
    const fourthColumntTimeLine = this.add.timeline([
      {
        tween: {
          targets: this.frontColumns.fourth,
          y: this.game.canvas.height + 500,
          duration: containerFallingAnimDuration,
          delay: 50,
          ease: 'Back.easeInOut',
          easeParams: [1.2],
          onStart: () => {
            this.time.delayedCall(50, () => {
              this.hideColumns.fourth?.add(this.fourthColumnTileSprite!);

              const timeLine3 = this.add.timeline([
                {
                  tween: {
                    targets: this.fourthColumnTileSprite,
                    y: 404,
                    ease: 'Back.easeInOut',
                    duration: 450,
                  },
                },
                {
                  tween: {
                    targets: this.fourthColumnTileSprite,
                    tilePositionY: -4000,
                    ease: 'Linear',
                    duration: 2500,
                    delay: 350,
                  },
                },
                {
                  tween: {
                    targets: this.fourthColumnTileSprite,
                    y: 1500,
                    ease: 'Linear',
                    duration: 50,
                    delay: 2500,
                  },
                },
                {
                  tween: {
                    targets: this.hideColumns.fourth,
                    y: 0,
                    duration: containerFallingAnimDuration,
                    ease: 'Back.easeOut',
                    delay: 2500,
                    onComplete: () => {
                      this.hideColumns.fourth?.remove(
                        this.fourthColumnTileSprite!
                      );
                      this.fourthColumnTileSprite?.setY(-1034);
                      this.fourthColumnTileSprite!.tilePositionY = 0;
                      const hideColSymbols =
                        this.hideColumns.fourth?.list.slice();
                      hideColSymbols?.forEach((child) => {
                        this.frontColumns.fourth!.add(child);
                      });
                      this.hideColumns.fourth
                        ?.removeAll(true)
                        .setY(hideContainePositionY);
                      this.frontColumns.fourth?.setY(0);
                      this.symbolsContainer?.clearMask();
                      this.handleCheckIsBonus(bonusGamePosition);
                    },
                  },
                },
              ]);

              timeLine3.play();
            });
          },
          onComplete: () => {
            this.frontColumns.fourth?.removeAll(true);
          },
        },
      },
    ]);

    fourthColumntTimeLine.play();
  }

  private handleCheckIsBonus(bonusGamePosition: number[]) {
    bonusGamePosition.length === 0
      ? eventBus.emit(CoreEvents.SetGameState, GameStates.IDLE)
      : this.time.delayedCall(waitingTimeToAddColumns, () => {
          this.handleCreateMinos(bonusGamePosition);
        });
  }

  private handleCreateMinos(bonusGamePosition: number[]) {
    if (!this.frontColumns) return;

    const minosColumn = COLUMNS_KEYS[bonusGamePosition[0]];

    const column = this.frontColumns[minosColumn];
    if (!column) return;

    const children = column.list.slice() as Symbol[];
    const minosSymbol = children[bonusGamePosition[1]];
    if (!minosSymbol) return;

    this.tweens.chain({
      targets: minosSymbol.spineInstance,
      tweens: [
        {
          scale: 1,
          ease: 'Linear',
          duration: 400,
        },
        {
          scale: 0.7,
          ease: 'Linear',
          duration: 400,
        },
      ],
      onComplete: () => {
        this.tweens.add({
          targets: minosSymbol,
          y: children[1].y,
          ease: 'Linear',
          duration: 400,
          onComplete: (twin: Phaser.Tweens.Tween) => {
            column?.removeAll(true);
            const minos = new MinotaurFull(this);
            column?.add(minos);
            minos.setPosition(0, 320);

            const newKeys = COLUMNS_KEYS.filter(
              (key, i) => i !== bonusGamePosition[0]
            );

            this.handleAddRocks(newKeys);
            twin.remove();
          },
        });
      },
    });
  }

  private handleAddRocks(newKeys: Columns[]) {
    newKeys.forEach((key, i) => {
      const frontCol = this.frontColumns[key];

      const frontColChildren = frontCol?.list.slice() as Symbol[];

      const rock = this.add.image(0, -700, 'rock').setOrigin(0.5).setScale(0.8);
      rock.setX(frontColChildren[0].x);

      frontCol!.add(rock);

      this.tweens.add({
        targets: rock,
        y: 0 + rock.displayHeight / 2,
        duration: 500,
        delay: i * 100,
        ease: 'Sine.easeInOut',
        onComplete: (twin: Phaser.Tweens.Tween) => {
          if (i === newKeys.length - 1) {
            eventBus.emit(CoreEvents.SetGameState, GameStates.IDLE);
            twin.remove();
          }
        },
      });
    });
  }

  private createFrontFrame() {
    const frame = this.add
      .image(
        this.game.canvas.width * 0.5,
        this.game.canvas.height * 0.5,
        'frame'
      )
      .setOrigin(0.5)
      .setScale(0.79, 0.8);
    frame.name = 'frame image';

    const frontFrame = this.add
      .image(
        this.game.canvas.width * 0.5,
        this.game.canvas.height * 0.5,
        'frontFrame'
      )
      .setOrigin(0.5)
      .setScale(0.8);
    frontFrame.name = 'front frame';
  }

  private handleSetMask() {
    if (!this.mask || !this.symbolsContainer) return;
    this.symbolsContainer.setMask(this.mask);
  }

  private createColumns() {
    this.frontColumns.first = this.add.container(112, 0);
    this.frontColumns.first.name = `first front column`;
    this.frontColumns.second = this.add.container(337, 0);
    this.frontColumns.second.name = `second front column`;
    this.frontColumns.third = this.add.container(562, 0);
    this.frontColumns.third.name = `third front column`;
    this.frontColumns.fourth = this.add.container(787, 0);
    this.frontColumns.fourth.name = `fourth front column`;
    this.frontColumns.fifth = this.add.container(1012, 0);
    this.frontColumns.fifth.name = `fifth front column`;

    this.hideColumns.first = this.add.container(112, hideContainePositionY);
    this.hideColumns.first.name = `first hide column`;
    this.hideColumns.second = this.add.container(337, hideContainePositionY);
    this.hideColumns.second.name = `second hide column`;
    this.hideColumns.third = this.add.container(562, hideContainePositionY);
    this.hideColumns.third.name = `third hide column`;
    this.hideColumns.fourth = this.add.container(787, hideContainePositionY);
    this.hideColumns.fourth.name = `fourth hide column`;
    this.hideColumns.fifth = this.add.container(1012, hideContainePositionY);
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

        const newSymbol = new Symbol(this, type, 0, posY);

        this.handleSetColumns(rowIdx, newSymbol, container);
      });
    });
  }
}
