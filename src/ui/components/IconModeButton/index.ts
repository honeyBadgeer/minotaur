import type { Scene } from 'phaser';
import { Button, type ButtonConfig } from '../Button';
import { ModeButtonStateSprite } from '../ModeButtonStateSprite';
import type { IControlBarButtons } from '@/types/types';
import { GameEvents } from '@/core';

type DefaultStates = {
  normal: string;
  disabled: string;
  pressed: string;
  hover: string;
};
type IconStates = {
  normal: string;
  hover: string;
  pressed: string;
  disabled?: string;
};

class IconModeButton extends Button {
  private isWasHovered: boolean = false;
  private defaultStates: DefaultStates;
  private defaultIconStates: IconStates | undefined;
  private isIconAnimsActive = false;
  private modeKey: IControlBarButtons;
  private sequenceInstance: ModeButtonStateSprite | null = null;
  private tweenAnim: Phaser.Tweens.Tween | null = null;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    options: ButtonConfig,
    buttonStates: DefaultStates,
    modeKey: IControlBarButtons,
    iconStates?: IconStates
  ) {
    super(scene, x, y, {
      ...options,
      atlasKey: 'buttons',
      frameKey: buttonStates.normal,
      iconKey: iconStates?.normal,
    });
    this.createEvents();
    this.defaultStates = buttonStates;
    this.defaultIconStates = iconStates;
    this.modeKey = modeKey;
  }

  createEvents() {
    this.on('pointerover', this.onOver);
    this.on('pointerout', this.onOut);
    this.on('pointerdown', this.onDown);
    this.on('pointerup', this.onUp);
  }

  setOnIconAnims(mode: IControlBarButtons) {
    this.modeKey = mode;
    this.isIconAnimsActive = true;

    if (this.modeKey === 'laser' || this.modeKey === 'sightMode') {
      this.setIconAnim(this.modeKey);
    } else {
      this.setActivateSprite(this.modeKey);
    }
  }

  setOffIconAnims() {
    this.isIconAnimsActive = false;
    this.setDisableSprite();
  }

  setActivateSprite(modeKey: IControlBarButtons) {
    super.clearIcon();
    super.setFrame(this.defaultStates.pressed, this.defaultIconStates?.pressed);

    this.sequenceInstance = ModeButtonStateSprite.generate(this.scene, {
      texture: modeKey,
    });

    this.add(this.sequenceInstance);
  }

  setDisableSprite() {
    super.addIcon();
    super.setFrame(this.defaultStates.normal, this.defaultIconStates?.normal);

    if (this.sequenceInstance) {
      this.remove(this.sequenceInstance);
      this.sequenceInstance.test();
    }
    this.tweenRemove();
  }

  setIconAnim(modeKey: IControlBarButtons) {
    super.setFrame(this.defaultStates.pressed, this.defaultIconStates?.pressed);

    const newIcon = this.getIcon();
    if (modeKey === 'laser') {
      this.tweenLaser(newIcon);
    } else if (modeKey === 'sightMode') {
      this.tweenRotation(newIcon);
    }
  }

  onOver = () => {
    super.onOver();
    if (!this.isIconAnimsActive) {
      super.setFrame(this.defaultStates.hover, this.defaultIconStates?.hover);
      this.isWasHovered = true;
    }

    this.scene.events.emit(GameEvents.UPDATE_CURSOR, 'pointer');
  };
  onOut = () => {
    super.onOut();
    if (!this.isIconAnimsActive) {
      super.setFrame(this.defaultStates.normal, this.defaultIconStates?.normal);
      this.isWasHovered = false;
    }

    this.scene.events.emit(GameEvents.UPDATE_CURSOR, 'none');
  };
  onDown = () => {
    super.onDown();
    if (!this.isIconAnimsActive) {
      super.setFrame(
        this.defaultStates.pressed,
        this.defaultIconStates?.pressed
      );
    }
  };
  onUp = () => {
    super.onUp();
    if (!this.isIconAnimsActive) {
      if (!this.isWasHovered) {
        super.setFrame(
          this.defaultStates.normal,
          this.defaultIconStates?.normal
        );
      } else {
        super.setFrame(this.defaultStates.hover, this.defaultIconStates?.hover);
      }
    }
  };

  private tweenLaser(icon: Phaser.GameObjects.Image | undefined) {
    const target = { scale: 1 };
    this.tweenAnim = this.scene.tweens.add({
      targets: target,
      scale: 1.1,
      duration: 500,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        icon?.setScale(target.scale);
      },
    });
  }
  private tweenRotation(icon: Phaser.GameObjects.Image | undefined) {
    if (icon) {
      this.tweenAnim = this.scene.tweens.add({
        targets: icon,
        duration: 2000,
        repeat: -1,
        ease: 'Linear',
        rotation: icon?.rotation + 2 * Math.PI,
      });
    }
  }
  private tweenRemove() {
    this.tweenAnim?.destroy();
  }
}

export default IconModeButton;
