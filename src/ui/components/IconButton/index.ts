import type { Scene } from 'phaser';
import { Button, type ButtonConfig } from '../Button';

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

class IconButton extends Button {
  private isWasHovered: boolean = false;
  private defaultStates: DefaultStates;
  private defaultIconStates: IconStates | undefined;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    options: ButtonConfig,
    buttonStates: DefaultStates,
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
  }

  createEvents() {
    this.on('pointerover', this.onOver);
    this.on('pointerout', this.onOut);
    this.on('pointerdown', this.onDown);
    this.on('pointerup', this.onUp);
  }

  onOver = () => {
    super.onOver();
    super.setFrame(this.defaultStates.hover, this.defaultIconStates?.hover);
    this.isWasHovered = true;
  };
  onOut = () => {
    super.onOut();
    super.setFrame(this.defaultStates.normal, this.defaultIconStates?.normal);
    this.isWasHovered = false;
  };
  onDown = () => {
    super.onDown();
    super.setFrame(this.defaultStates.pressed, this.defaultIconStates?.pressed);
  };
  onUp = () => {
    super.onUp();
    if (!this.isWasHovered) {
      super.setFrame(this.defaultStates.normal, this.defaultIconStates?.normal);
    } else {
      super.setFrame(this.defaultStates.hover, this.defaultIconStates?.hover);
    }
  };
}

export default IconButton;
