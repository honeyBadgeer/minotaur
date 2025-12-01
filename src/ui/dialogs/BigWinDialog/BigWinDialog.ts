import { mdeToNormal } from '@/services/lib/mdeToNormal';
import { BaseDialog } from '@/ui/components/BaseDialog';
import { GameObjects, Scene } from 'phaser';
import { t } from '@/i18n';
import { DialogEvents } from '@/core/events/events';

const textStyle = {
  fontFamily: 'Tektur',
  fontStyle: '600',
  fontSize: '14px',
  color: '#72CCFF',
  align: 'center',
  letterSpacing: 0,
  shadow: {
    blur: 10,
    color: '#37CFFF',
    fill: true,
  },
};

const sumStyle = {
  fontFamily: 'Tektur',
  fontStyle: '600',
  fontSize: '45px',
  color: '#72CCFF',
  align: 'center',
  shadow: {
    blur: 10,
    color: '#37CFFF',
    fill: true,
  },
};

const animsMap = {
  contentAnimsIn: 400,
  contentAnimsStay: 500,
  contentAnimsOut: 400,
  winSumAnimsDuration: 1000,
};

export class BigWinDialog extends BaseDialog {
  private winSum: number;
  private winSumText: GameObjects.Text | null = null;
  private tengeIcon: GameObjects.Image | null = null;

  constructor(scene: Scene, winSum: number) {
    super(scene, false);
    this.scene = scene;

    this.scene.add.existing(this);

    this.winSum = winSum;
    this.createContent();
  }

  private createContent() {
    const image = this.scene.add.image(0, 0, 'dialogVerySmall');

    const title = this.scene.add.text(
      0,
      -image.height / 2 + 19,
      t('common.winLowercase'),
      textStyle
    );
    title.setOrigin(0.5, 0);

    this.winSumText = this.scene.add.text(0, 0, '0', sumStyle);
    this.winSumText.setOrigin(0, 0.5);

    this.tengeIcon = this.scene.add
      .image(0, 0, 'bigTenge')
      .setDisplaySize(46, 50);
    this.tengeIcon.setOrigin(0, 0.5);

    const sumContainer = this.scene.add.container(8, 0, [
      this.winSumText,
      this.tengeIcon,
    ]);

    this.winSumText.x =
      -(this.winSumText.width + this.tengeIcon.displayWidth) / 2;
    this.tengeIcon.x = this.winSumText.x + this.winSumText.width;

    const content = this.scene.add.container(0, 0, [
      image,
      title,
      sumContainer,
    ]);

    content.setScale(0);
    this.animateContent(content);

    this.add(content);
  }

  animateWinSum() {
    const counter = { value: 0 };

    const newWinSum = mdeToNormal(this.winSum);

    this.scene.tweens.add({
      targets: counter,
      value: newWinSum,
      duration: animsMap.winSumAnimsDuration,
      ease: 'Linear',
      onUpdate: () => {
        this.winSumText?.setX(
          -(this.winSumText.width + this.tengeIcon!.displayWidth) / 2
        );
        this.tengeIcon?.setX(this.winSumText!.x + this.winSumText!.width + 10);
        this.winSumText?.setText(`${Math.floor(counter.value)}`);
      },
    });
  }

  private animateContent(content: GameObjects.Container) {
    this.scene.tweens.chain({
      targets: content,
      tweens: [
        {
          scale: 1.7,
          ease: 'Quad.easeIn',
          duration: animsMap.contentAnimsIn,
          delay: 100,
          onStart: () => this.scene.events.emit(DialogEvents.Opened),
        },
        {
          scale: 1.3,
          ease: 'Back.easeOut',
          duration: animsMap.contentAnimsStay,
          onStart: () => this.animateWinSum(),
        },
        {
          delay: 1500,
          scale: 0,
          ease: 'Linear',
          duration: animsMap.contentAnimsOut,
          onComplete: () => this.hide(),
        },
      ],
    });
  }
}
