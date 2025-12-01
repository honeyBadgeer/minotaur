import { GameEvents } from '@/core';
import { eventBus } from '@/core/events/EventBus';
import { DEFAULT_STYLES_BUTTON } from '@/services/constants';
import Phaser, { type GameObjects } from 'phaser';
import { BaseDialog } from '../../components/BaseDialog';
import { titleTextStyle } from '../../components/BaseDialog/lib/textStyle';
import DefaultButton from '../../components/DefaultButton';
import { AnimalButton } from './AnimalButton';
import { t } from '@/i18n';

const animalKeys = [
  'mouse',
  'frog',
  'bunny',
  'squirrel',
  'turtle',
  'deer',
  'snake',
  'monkey',
  'ram',
  'fox',
  'horse',
  'zebra',
  'boar',
  'panther',
  'tiger',
  'lion',
  'bear',
  'elephant',
  'monster',
];

const animalSize = 70;
const animalsGap = 42;
const animalsInRow = 7;

const closeButtonMarginX = 79;
const closeButtonMarginY = 47;

const animalsGridMarginTop = 135;
const contentTitleMarginTop = 50;
const backgroundY = -30;

export class AutoModeDialog extends BaseDialog {
  private onConfirm?: () => void;
  private titleText: string;
  private description: string;
  private buttonName: string;

  private contentBackground: GameObjects.Image | null = null;
  private entries!: GameObjects.Container;
  private animals: AnimalButton[] = [];
  private selectedAnimal: AnimalButton | null = null;

  constructor(scene: Phaser.Scene, onConfirm?: () => void) {
    super(scene);
    this.onConfirm = onConfirm;
    this.titleText = t('autoMode.title');
    this.description = t('autoMode.description');
    this.buttonName = t('autoMode.button');

    this.create();
  }

  show() {
    super.show(() => {
      this.scene.tweens.add({
        targets: this.contentBackground,
        scaleX: 1,
        duration: 150,
        ease: 'Linear',
        onComplete: () => {
          (this.entries.list as any[]).forEach((child) => {
            if (child === this.contentBackground) return;

            this.scene.tweens.add({
              targets: child,
              alpha: 1,
              y: child.y - 10,
              duration: 200,
              ease: 'Quad.easeOut',
              onComplete: () => this.animateAnimals(),
            });
          });
        },
      });
    });
  }

  private animateAnimals() {
    const delay = 50;
    this.animals.forEach((animal, index) => {
      animal.animate(index * delay);
    });
  }

  private create() {
    const { scene } = this;

    this.contentBackground = scene.add
      .image(0, 0, 'dialogBig')
      .setOrigin(0.5)
      .setY(backgroundY)
      .setScale(0, 1);

    const { realWidth: backgroundWidth, realHeight: backgroundHeight } =
      this.contentBackground.frame;

    const halfW = backgroundWidth / 2;
    const halfH = backgroundHeight / 2;

    const mainBtn = new DefaultButton(
      scene,
      0,
      0,
      {
        text: this.buttonName,
        onUp: () => {
          if (this.selectedAnimal) {
            const keys = this.selectedAnimal.getAnimalKey();
            this.onConfirm && this.onConfirm();
            eventBus.emit(GameEvents.AutoModeEnemiesGroup, keys);
            this.clearSelectedAnimal();
            if (!this.isTweening) this.hide();
          }
        },
      },
      DEFAULT_STYLES_BUTTON
    );
    mainBtn.setY(scene.sys.canvas.height / 2 - mainBtn.height / 2 - 35);
    mainBtn.setDisabled(true);

    const title = scene.add
      .text(5, -halfH - 4, this.titleText, titleTextStyle)
      .setOrigin(0.5)
      .setX(5);

    const content = scene.add
      .text(0, -halfH + contentTitleMarginTop, this.description, titleTextStyle)
      .setOrigin(0.5);

    const gridW = (animalsInRow - 1) * (animalSize + animalsGap);
    const startX = -gridW / 2;
    const startY = -halfH + animalsGridMarginTop;

    animalKeys.forEach((key, i) => {
      let col = i % animalsInRow;
      const row = Math.floor(i / animalsInRow);

      if (row === 2) col += 1;

      const x = startX + (animalSize + animalsGap) * col;
      const y = startY + (animalSize + animalsGap) * row;

      const btn = new AnimalButton(scene, x, y, key);

      btn.on('pointerup', () => {
        if (this.selectedAnimal && this.selectedAnimal !== btn) {
          this.selectedAnimal.setSelected(false);
        }
        this.selectedAnimal = btn;

        btn.setSelected(true);

        mainBtn.setDisabled(false);
      });

      this.animals.push(btn);
    });

    const closeBg = scene.add.image(0, 0, 'closeBg').setOrigin(0.5);
    const closeIcon = scene.add.image(0, 0, 'close').setOrigin(0.5);
    closeIcon.setScale(0.5);

    const closeBtn = scene.add.container(
      halfW - closeBg.width / 2 + closeButtonMarginX,
      -halfH + closeBg.height / 2 - closeButtonMarginY,
      [closeBg, closeIcon]
    );

    closeBtn.setSize(closeBg.width, closeBg.height);
    closeBtn.setInteractive({ useHandCursor: true });

    closeBtn.on('pointerup', () => {
      if (!this.isTweening) this.hide();
    });

    title.setAlpha(0);
    title.y += 10;

    content.setAlpha(0);
    content.y += 10;

    closeBtn.setAlpha(0);
    closeBtn.y += 10;

    this.entries = scene.add.container(0, 0, [
      mainBtn,
      this.contentBackground,
      title,
      closeBtn,
      content,
      ...this.animals,
    ]);

    this.setContent(this.entries);
  }

  private clearSelectedAnimal() {
    this.selectedAnimal = null;
  }
}
