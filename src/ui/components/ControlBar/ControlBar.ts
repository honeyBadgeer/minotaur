import { GameObjects, type Scene, type Tweens } from 'phaser';
import IconButton from '../IconButton';
import {
  buttonsTextActiveStyle,
  buttonsTextStyle,
  nominalTextStyle,
} from './lib/textStyle';
import { MoneyText } from '../MoneyText/MoneyText';
import IconModeButton from '../IconModeButton';
import {
  ADJUSTMENT_BUTTONS_CONFIG,
  BET_BUTTON_BG_STATES,
  BUTTON_BG_STATES,
  CONTROL_BAR_BUTTONS_CONFIG,
  modeButtonStates,
} from './lib/constants';
import type { IControlBarButtons } from '@/types/types';
import { mdeToNormal } from '@/services/lib/mdeToNormal';
import { eventBus, GameEvents } from '@/core';
import { t } from '@/i18n';

export class ControlBar extends GameObjects.Container {
  public modeButtons: Record<IControlBarButtons, IconModeButton | null> = {
    autoMode: null,
    sightMode: null,
    doubleFireMode: null,
    grenade: null,
    ufo: null,
    laser: null,
  };
  public modeButtonsLabels: Record<
    IControlBarButtons,
    { label: GameObjects.Text | null; tween: Tweens.Tween | null }
  > = {
    autoMode: { label: null, tween: null },
    sightMode: { label: null, tween: null },
    doubleFireMode: { label: null, tween: null },
    grenade: { label: null, tween: null },
    ufo: { label: null, tween: null },
    laser: { label: null, tween: null },
  };

  public nominal: GameObjects.Text | null = null;
  public balanceDisplay: MoneyText | null = null;
  public decreaseButton: IconButton | null = null;
  public increaseButton: IconButton | null = null;

  constructor(scene: Scene) {
    super(scene);
    this.scene = scene;

    this.scene.add.existing(this);
    this.name = 'ControlBar';
  }

  createBackground() {
    const controlBarBackground = this.scene.add
      .image(0, 0, 'controlBarBackground')
      .setOrigin(0.5, 0);

    this.setPosition(
      this.scene.sys.canvas.width / 2,
      this.scene.sys.canvas.height + controlBarBackground.height * 2
    );

    this.add(controlBarBackground);

    this.scene.tweens.add({
      targets: this,
      y: {
        from: this.scene.sys.canvas.height + controlBarBackground.height,
        to: this.scene.sys.canvas.height - controlBarBackground.height,
      },
      duration: 500,
      ease: 'Quad.Out',
    });
  }

  createButtons() {
    const buttons = CONTROL_BAR_BUTTONS_CONFIG.map((config, index) => {
      const button = new IconModeButton(
        this.scene,
        config.x,
        config.y,
        {
          onUp: () => eventBus.emit(config.event.name, config.event.value),
        },
        BUTTON_BG_STATES,
        config.key as IControlBarButtons,
        {
          normal: `${config.key}`,
          hover: `${config.key}-hover`,
          pressed: `${config.key}-activated`,
          disabled: `${config.key}-activated`,
        }
      );
      button.scale = 0;

      button.scale = 0;

      if (config.flipY) {
        const target = button.list[0] as Phaser.GameObjects.Sprite;
        if (target && 'setScale' in target) {
          target.setScale(1, -1);
        }
      }
      const label = this.scene.add
        .text(config.x, config.y + 54, t(config.label), buttonsTextStyle)
        .setOrigin(0.5);

      this.modeButtons[config.value as IControlBarButtons] = button;
      this.modeButtonsLabels[config.value as IControlBarButtons].label = label;

      this.add(label);

      this.scene.tweens.add({
        targets: button,
        scale: 1,
        duration: 500,
        ease: 'Quad.Out',
        delay: 300 + 100 * index,
      });

      return button;
    });

    const adjustmentButtons = ADJUSTMENT_BUTTONS_CONFIG.map((config) => {
      const button = new IconButton(
        this.scene,
        config.x,
        config.y,
        {
          onUp: () => eventBus.emit(config.event.name),
          onOver: () =>
            this.scene.events.emit(GameEvents.UPDATE_CURSOR, 'pointer'),
          onOut: () => this.scene.events.emit(GameEvents.UPDATE_CURSOR, 'none'),
        },
        BET_BUTTON_BG_STATES,
        {
          normal: `${config.key}`,
          hover: `${config.key}-hover`,
          pressed: `${config.key}-pressed`,
          disabled: `${config.key}-disabled`,
        }
      );

      if (config.key === 'minus') {
        this.decreaseButton = button;
      } else if (config.key === 'plus') {
        this.increaseButton = button;
      }

      return button;
    });

    this.add([...buttons, ...adjustmentButtons]);
  }

  createNominal() {
    this.nominal = this.scene.add
      .text(0, 40, '50', nominalTextStyle)
      .setOrigin(0.5);

    this.add(this.nominal);
  }

  showBalance() {
    this.balanceDisplay = new MoneyText(this.scene, 0);
    this.add(this.balanceDisplay);
  }

  public updateBalance(value: number) {
    this.balanceDisplay?.updateText(mdeToNormal(value));
  }

  showDemo() {
    const svg = this.scene.add
      .image(0, 76, 'demoBg')
      .setOrigin(0.5, 0)
      .setScale(1.01, 1.03);
    svg.name = 'svg';
    this.add(svg);
    const label = this.scene.add
      .text(0, 92, t('common.demoMode'), {
        ...buttonsTextStyle,
        fontSize: '20px',
        color: '#000000',
        shadow: {},
      })
      .setOrigin(0.5);
    label.name = 'demo';
    this.add(label);
  }

  showControlBar() {
    this.createBackground();
    this.createButtons();
    this.createNominal();
  }

  disableButtons() {
    for (const item of modeButtonStates['']) {
      this.modeButtons[item]?.setDisabled(true);
    }
    this.decreaseButton?.setDisabled(true);
    this.increaseButton?.setDisabled(true);
  }

  toggleActiveButtons(disable: boolean) {
    for (const item of modeButtonStates['']) {
      this.modeButtons[item]?.setInputEnabled(disable);
    }
  }

  activateButtons() {
    for (const item of modeButtonStates['']) {
      this.modeButtons[item]?.setDisabled(false);
    }
  }

  public handleOnLabelAnimation(key: IControlBarButtons) {
    const label = this.modeButtonsLabels[key].label;
    const target = { strokeThickness: 1 };

    this.modeButtonsLabels[key].tween = this.scene.tweens.add({
      targets: target,
      strokeThickness: 3,
      duration: 500,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        label?.setStyle({
          ...buttonsTextActiveStyle,
          strokeThickness: target.strokeThickness,
        });
      },
    });
  }

  public handleOffLabelAnimation(key: IControlBarButtons) {
    if (
      !this.modeButtonsLabels[key].tween ||
      !this.modeButtonsLabels[key].label
    ) {
      return;
    }

    this.modeButtonsLabels[key].tween.destroy();
    this.modeButtonsLabels[key].label.setStyle(buttonsTextStyle);
  }
}
