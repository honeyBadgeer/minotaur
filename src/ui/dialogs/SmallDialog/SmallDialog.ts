import Phaser, { type GameObjects } from 'phaser';
import { BaseDialog } from '../../components/BaseDialog';
import DefaultButton from '../../components/DefaultButton';
import { DEFAULT_STYLES_BUTTON } from '@/services/constants';
import {
  titleTextStyle,
  contentTextStyle,
} from '../../components/BaseDialog/lib/textStyle';

interface ContentText {
  text: string;
  style: Phaser.Types.GameObjects.Text.TextStyle;
}

export class SmallDialog extends BaseDialog {
  private titleText: string;
  private contents: string | ContentText[];
  private buttonText: string;
  private onClose?: () => void;
  private onConfirm?: () => void;

  private contentBackground: GameObjects.Image | null = null;
  private entries!: GameObjects.Container;

  constructor(
    scene: Phaser.Scene,
    titleText: string,
    contents: string | ContentText[],
    buttonText: string,
    onConfirm?: () => void,
    onClose?: () => void
  ) {
    super(scene);

    this.titleText = titleText;
    this.contents = contents;
    this.buttonText = buttonText;
    this.onClose = onClose;
    this.onConfirm = onConfirm;

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
            });
          });
        },
      });
    });
  }

  private create() {
    const { scene } = this;

    let mainBtn: DefaultButton | null = null;

    if (this.buttonText) {
      mainBtn = new DefaultButton(
        scene,
        0,
        0,
        {
          text: this.buttonText,
          onUp: () => {
            if (!this.isTweening) {
              this.onConfirm && this.onConfirm();
              this.hide();
            }
          },
        },
        DEFAULT_STYLES_BUTTON
      );
      mainBtn.setY(scene.sys.canvas.height / 2 - mainBtn.height / 2 - 55);
    }

    this.contentBackground = scene.add
      .image(0, 0, 'dialogSmall')
      .setOrigin(0.5)
      .setY(-20)
      .setScale(0, 1);

    const title = scene.add
      .text(0, 0, this.titleText, titleTextStyle)
      .setOrigin(0.5)
      .setY(-180);

    let contentObjects: GameObjects.Text[] = [];
    if (typeof this.contents === 'string') {
      const content = scene.add
        .text(0, -10, this.contents, contentTextStyle)
        .setOrigin(0.5);
      contentObjects.push(content);
    } else {
      let offsetY = -35;
      for (const c of this.contents) {
        const text = scene.add
          .text(0, offsetY, c.text, { ...contentTextStyle, ...c.style })
          .setOrigin(0.5);
        contentObjects.push(text);
        offsetY += 60;
      }
    }

    const closeBg = scene.add.image(0, 0, 'closeBg').setOrigin(0.5);
    const closeIcon = scene.add.image(0, 0, 'close').setOrigin(0.5);
    closeIcon.setScale(0.5);

    const closeBtn = scene.add.container(0, 0, [closeBg, closeIcon]);
    closeBtn.setPosition(274, -191);
    closeBtn.setSize(closeBg.width, closeBg.height);
    closeBtn.setInteractive({ useHandCursor: true });

    closeBtn.on('pointerup', () => {
      this.onClose && this.onClose();
      if (!this.isTweening) this.hide();
    });

    title.setAlpha(0);
    title.y += 10;

    contentObjects.forEach((c) => {
      c.setAlpha(0);
      c.y += 10;
    });

    closeBtn.setAlpha(0);
    closeBtn.y += 10;

    this.entries = scene.add.container(0, 0, [
      ...(mainBtn ? [mainBtn] : []),
      this.contentBackground,
      title,
      ...contentObjects,
      closeBtn,
    ]);

    this.setContent(this.entries);
  }
}
