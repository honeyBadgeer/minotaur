import { GameObjects, Geom, type Types } from 'phaser';
import type { ButtonConfig } from './types';
import { SoundManager } from '@core/managers';
import { GameEvents } from '@/core/events/events';

export class Button extends GameObjects.Container {
  static DEFAULT_TEXT_STYLE: Types.GameObjects.Text.TextStyle = {
    fontSize: '20px',
    color: '#ffffff',
    fontFamily: 'Arial',
  };
  private options: ButtonConfig;

  private icon?: GameObjects.Image;
  private button: GameObjects.Image | null = null;
  private label: GameObjects.Text | null = null;

  private originalScaleX: number = 1;
  private originalScaleY: number = 1;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    options: ButtonConfig = {}
  ) {
    super(scene, x, y);
    this.options = options;
    this.init();
    return this;
  }

  init() {
    const textStyle = {
      ...Button.DEFAULT_TEXT_STYLE,
      ...(this.options.textStyle || {}),
    };
    const padding = this.options.padding ?? 0;

    let width = 0;
    let height = 0;

    if (this.options.textureKey && !this.options.atlasKey) {
      this.button = this.scene.add
        .image(0, 0, this.options.textureKey)
        .setOrigin(0.5, 0.5);
      this.add(this.button);
      width = this.button.width;
      height = this.button.height;
    }

    if (this.options.atlasKey && this.options.frameKey) {
      this.button = this.scene.add
        .image(0, 0, this.options.atlasKey, this.options.frameKey)
        .setOrigin(0.5, 0.5);
      this.add(this.button);
      width = this.button.width;
      height = this.button.height;
    }

    if (this.options.iconKey) {
      const frame = this.options.iconKey || '';
      this.icon = this.scene.add.image(0, 0, 'buttons', frame);
      this.icon.setOrigin(0.5);
      this.add(this.icon);
    }

    if (this.options.text) {
      this.label = this.scene.add
        .text(0, 0, this.options.text, textStyle)
        .setOrigin(0.5, 0.5);
      this.add(this.label);
      width = Math.max(width, this.label.width);
      height = Math.max(height, this.label.height);
    }

    width += padding * 2;
    height += padding * 2;

    this.setSize(width, height);
    this.originalScaleX = this.scaleX;
    this.originalScaleY = this.scaleY;
    this.setInteractive(
      new Geom.Rectangle(0, 0, width, height),
      Geom.Rectangle.Contains
    );

    this.on('pointerdown', () => this.animateScale(0.95));
    this.on('pointerup', () => this.animateScale(1));
    this.on('pointerout', () => this.animateScale(1));

    this.scene.add.existing(this);
  }

  private animateScale(scale: number) {
    this.scene.tweens.add({
      targets: this,
      scaleX: this.originalScaleX * scale,
      scaleY: this.originalScaleY * scale,
      duration: 100,
      ease: 'Quad.Out',
    });
  }

  public saveOriginalScale() {
    this.originalScaleX = this.scaleX;
    this.originalScaleY = this.scaleY;
  }

  getIcon() {
    return this.icon;
  }
  clearIcon() {
    if (this.icon) this.icon.setAlpha(0);
  }
  addIcon() {
    if (this.icon) this.icon.setAlpha(1);
  }

  setDisabled(disable: boolean): this {
    if (disable) this.scene.events.emit(GameEvents.UPDATE_CURSOR, 'none');

    this.alpha = disable ? 0.5 : 1;
    this.setInputEnabled(!disable);
    return this;
  }

  setInputEnabled(disable: boolean) {
    if (this.input) this.input.enabled = disable;
  }

  setText(newText: string): this {
    if (this.label) this.label.setText(newText);
    return this;
  }

  setTexture(textureKey: string) {
    if (this.button) {
      this.button.setTexture(textureKey);
      this.setSize(this.button.width, this.button.height);
    }
    return this;
  }

  setFrame(frameKey: string, iconKey?: string) {
    if (this.button && this.button.texture) {
      this.button.setFrame(frameKey);
      if (this.icon && iconKey) {
        this.icon?.setFrame(iconKey);
      }
      this.setSize(this.button.width, this.button.height);
    }
    return this;
  }

  public onOver() {
    this.options?.onOver?.(this);
  }

  public onOut() {
    this.options?.onOut?.(this);
  }

  public onDown() {
    this.options?.onDown?.(this);
  }

  public onUp() {
    SoundManager.play('button');
    this.options?.onUp?.(this);
  }
}
