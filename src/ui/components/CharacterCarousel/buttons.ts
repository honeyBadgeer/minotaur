import { DEFAULT_STYLES_BUTTON } from '@/services/constants';
import { GameObjects, Scene } from 'phaser';
import DefaultButton from '../DefaultButton';
import { ARROW_BUTTON_MARGIN } from './lib/constants';
import IconButton from '../IconButton';
import { t } from '@/i18n';

class StartButton extends DefaultButton {
  constructor(scene: Phaser.Scene, onSelect: () => void) {
    super(
      scene,
      0,
      scene.sys.canvas.height + 100,
      {
        text: t('select'),
        onUp: onSelect,
      },
      DEFAULT_STYLES_BUTTON
    );

    this.setX(scene.sys.canvas.width / 2);
    this.setY(scene.sys.canvas.height + 100);

    scene.tweens.add({
      targets: this,
      y: {
        from: scene.sys.canvas.height + 100,
        to: scene.sys.canvas.height - this.height + 20,
      },
      ease: 'Quad.Out',
      duration: 300,
      delay: 200,
    });
  }
}

class ArrowButtons extends GameObjects.Container {
  constructor(scene: Scene, onLeft: () => void, onRight: () => void) {
    super(scene, 0, 0);
    scene.add.existing(this);

    const directions = ['left', 'right'] as const;

    directions.forEach((dir) => {
      const isLeft = dir === 'left';
      const callback = isLeft ? onLeft : onRight;

      const arrowButton = new IconButton(
        scene,
        0,
        0,
        { onUp: callback },
        {
          normal: 'lg-normal',
          hover: 'lg-hover',
          pressed: 'lg-pressed',
          disabled: 'lg-pressed',
        },
        {
          normal: 'left-default',
          hover: 'left-hover',
          pressed: 'left-pressed',
          disabled: 'left-pressed',
        }
      );

      const buttonX = isLeft
        ? arrowButton.width / 2 + ARROW_BUTTON_MARGIN
        : scene.sys.canvas.width - arrowButton.width / 2 - ARROW_BUTTON_MARGIN;

      arrowButton.setPosition(-50, scene.sys.canvas.height / 2);
      if (!isLeft) arrowButton.setScale(-1, 1);
      arrowButton.saveOriginalScale();

      this.add(arrowButton);

      scene.tweens.add({
        targets: arrowButton,
        x: isLeft
          ? { from: -50, to: buttonX }
          : {
              from: scene.sys.canvas.width,
              to: buttonX,
            },
        ease: 'Quad.Out',
        duration: 300,
      });
    });
  }

  setDisabled(disabled: boolean) {
    const btn = this.list as IconButton[] | null;
    if (!btn) return;

    btn.forEach((item) => {
      if (disabled) {
        item.disableInteractive();
        item.setState('disabled');
      } else {
        item.setInteractive();
        item.setState('normal');
      }
    });
  }
}

export { ArrowButtons, StartButton };
