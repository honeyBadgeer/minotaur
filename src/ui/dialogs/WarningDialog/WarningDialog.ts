import Phaser, { GameObjects } from 'phaser';
import { BaseDialog } from '../../components/BaseDialog';
import type { IBundle } from '@/types/types';
import { t } from '@/i18n';
import { SoundManager } from '@/core';

const textStyle = {
  fontFamily: 'Tektur',
  fontStyle: '600',
  fontSize: '16px',
  color: '#ffffff',
  align: 'center',
  wordWrap: {}, // TODO: Чекнуть переносы на казахский
  letterSpacing: 0,
};

const warningBackgroundSize = {
  w: 377,
  h: 152,
};

const leftPadding = 50;
const topPadding = 60;
const textGap = 26;

export class WarningDialog extends BaseDialog {
  private warningType: IBundle;
  private onClose?: () => void;

  constructor(
    scene: Phaser.Scene,
    data: {
      warningType: IBundle;
      onClose?: () => void;
    }
  ) {
    super(scene, false);

    this.warningType = data.warningType;
    this.onClose = data.onClose;
    this.create();

    this.handleEnd();
  }

  private create() {
    const { scene } = this;

    SoundManager.updateVolume(0.2);
    SoundManager.play('bundleAlarm', false, 1.0);

    const textureMap: Record<IBundle, string> = {
      grenade: 'warningGrenade',
      laser: 'warningLaser',
      ufo: 'warningUfo',
    };

    const textureKey = textureMap[this.warningType];
    const image = scene.add.image(0, 0, textureKey);
    image.setDisplaySize(warningBackgroundSize.w, warningBackgroundSize.h);

    const offsetX = -image.displayWidth / 2;
    const offsetY = -image.displayHeight / 2;

    const warningTypeText = {
      grenade: t('weapons.grenade'),
      laser: t('weapons.laser'),
      ufo: t('weapons.ufo'),
    };

    const textTitle = scene.add.text(
      offsetX + leftPadding,
      offsetY + topPadding,
      t('weaponActivation'),
      textStyle
    );

    const textDescription = scene.add.text(
      offsetX + leftPadding,
      offsetY + topPadding + textGap,
      warningTypeText[this.warningType],
      textStyle
    );

    const background = this.scene.add.rectangle(
      0,
      0,
      this.scene.scale.width,
      this.scene.scale.height,
      0x000000
    );
    background.setAlpha(0.2);

    const content = scene.add.container(0, 0, [
      background,
      image,
      textTitle,
      textDescription,
    ]);
    content.setAlpha(0);
    this.setContent(content);

    this.scene.tweens.add({
      targets: background,
      alpha: { from: 0.3, to: 0.1 },
      yoyo: true,
      repeat: -1,
      delay: 400,
      duration: 800,
      ease: 'sine.inout',
    });

    this.animateContent(content);
  }

  private handleEnd() {
    this.scene.time.delayedCall(3000, () => {
      if (!this.isTweening) {
        this.hide();
        if (this.onClose && typeof this.onClose === 'function') {
          this.onClose();
        }
      }
    });
  }

  private animateContent(content: GameObjects.Container) {
    this.scene.tweens.add({
      targets: content,
      alpha: 1,
      ease: 'Quad.easeIn',
      duration: 200,
      delay: 50,
    });
  }
}
