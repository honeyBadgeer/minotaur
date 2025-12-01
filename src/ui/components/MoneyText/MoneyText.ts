import { GameObjects, Scene } from 'phaser';
import { nominalTextStyle } from './lib/textStyle';
import { formatNumber } from '@/services/lib/formatNumber';

export class MoneyText extends GameObjects.Container {
  private text: GameObjects.Text | null = null;
  private tengeSign: GameObjects.Image | null = null;
  value: string | number;

  constructor(scene: Scene, value: number | string) {
    super(scene, 0, 0);
    scene.add.existing(this);

    this.value = value;

    this.createText();
  }

  private center(text: GameObjects.Text, image: GameObjects.Image) {
    image.x = text.width + 2;
    const totalWidth = text.width + image.width + 2;
    this.setPosition(-totalWidth / 2, 85);
  }

  private createText() {
    const displayText =
      typeof this.value === 'number' ? formatNumber(this.value) : this.value;

    this.text = this.scene.add
      .text(0, 0, displayText, nominalTextStyle)
      .setOrigin(0, 0);

    this.tengeSign = this.scene.add.image(0, 0, 'tenge').setOrigin(0, 0);
    this.tengeSign.x = this.text.width + 2;

    const totalWidth = this.text.width + this.tengeSign.width + 2;
    this.setPosition(-totalWidth / 2, 85);

    this.add([this.text, this.tengeSign]);
  }

  public updateText(value: string | number) {
    if (this.text && this.tengeSign) {
      this.text.setText(String(value));
      this.center(this.text, this.tengeSign);
    }
  }
}
