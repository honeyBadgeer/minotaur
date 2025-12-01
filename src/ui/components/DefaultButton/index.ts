import type { Scene } from 'phaser';
import { Button, type ButtonConfig } from '../Button';

type DefaultStates = {
  normal: string;
  disabled: string;
  pressed: string;
  hover: string;
};

class DefaultButton extends Button {
  private isWasHovered: boolean = false;
  private defaultStates: DefaultStates;
  constructor(
    scene: Scene,
    x: number,
    y: number,
    options: ButtonConfig,
    buttonStates: DefaultStates
  ) {
    super(scene, x, y, {
      ...options,
      atlasKey: 'buttons',
      frameKey: buttonStates.normal,
      textStyle: {
        fontSize: '23px',
        fontFamily: 'Tektur, Arial',
        fontStyle: '600',
      },
    });
    this.createEvents();
    this.defaultStates = buttonStates;
  }

  createEvents() {
    this.on('pointerover', this.onOver);
    this.on('pointerout', this.onOut);
    this.on('pointerdown', this.onDown);
    this.on('pointerup', this.onUp);
  }

  setDisabled(disable: boolean): this {
    super.setDisabled(disable);
    if (disable) super.setFrame(this.defaultStates.disabled);
    else super.setFrame(this.defaultStates.normal);

    return this;
  }

  onOver = () => {
    super.onOver();
    super.setFrame(this.defaultStates.hover);
    this.isWasHovered = true;
  };
  onOut = () => {
    super.onOut();
    super.setFrame(this.defaultStates.normal);
    this.isWasHovered = false;
  };
  onDown = () => {
    super.onDown();
    super.setFrame(this.defaultStates.pressed);
  };
  onUp = () => {
    super.onUp();
    if (!this.isWasHovered) {
      super.setFrame(this.defaultStates.normal);
    } else {
      super.setFrame(this.defaultStates.hover);
    }
  };
}

export default DefaultButton;
