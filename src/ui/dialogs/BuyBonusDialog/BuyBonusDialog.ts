import { GameObjects, Scene } from 'phaser';
import { BaseDialog } from '@/ui/components/BaseDialog';
import { Button } from '@/ui/components/Button';
import type { BuyBonusOption } from '@/core/services/BonusGameService';
import { formatNumber } from '@/services/lib/formatNumber';

interface BuyBonusConfig {
  prices: Record<BuyBonusOption, number>;
  onBuy: (option: BuyBonusOption) => void;
  onClose?: () => void;
}

export class BuyBonusDialog extends BaseDialog {
  private config: BuyBonusConfig;
  private buttons: Map<BuyBonusOption, Button> = new Map();
  private contentContainer: GameObjects.Container | null = null;

  constructor(scene: Scene, config: BuyBonusConfig) {
    super(scene, false);
    this.config = config;
    this.create();
  }

  show() {
    super.show(() => {
      this.scene.events.emit('dialogOpened');
    });

    if (this.contentContainer) {
      this.contentContainer.setAlpha(0);
      this.contentContainer.setScale(0.8);

      this.scene.tweens.add({
        targets: this.contentContainer,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Back.easeOut',
      });
    }
  }

  async hide() {
    if (this.isTweening) {
      return Promise.resolve();
    }

    this.config.onClose?.();

    if (this.contentContainer) {
      return new Promise<void>((resolve) => {
        this.scene.tweens.add({
          targets: this.contentContainer,
          alpha: 0,
          scaleX: 0.8,
          scaleY: 0.8,
          duration: 200,
          ease: 'Quad.easeIn',
          onComplete: async () => {
            await super.hide();
            resolve();
          },
        });
      });
    } else {
      return super.hide();
    }
  }

  private create() {
    const { scene } = this;
    const canvasWidth = scene.sys.canvas.width;
    const canvasHeight = scene.sys.canvas.height;

    const bg = scene.add
      .rectangle(0, 0, canvasWidth, canvasHeight, 0x000000, 0.7)
      .setOrigin(0.5)
      .setInteractive();

    bg.on('pointerdown', () => {
      this.config.onClose?.();
      this.hide();
    });

    const title = scene.add
      .text(0, -300, 'BUY BONUS', {
        fontSize: '48px',
        color: '#FFD700',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    const spacing = Math.min(400, canvasWidth / 4);
    const options: Array<{ option: BuyBonusOption; label: string; x: number }> =
      [
        { option: 'reels_1_3', label: 'BONUS ON REEL 1-3', x: -spacing },
        { option: 'reel_4', label: 'BONUS ON REEL 4', x: 0 },
        { option: 'reel_5', label: 'BONUS ON REEL 5', x: spacing },
      ];

    const blockContainers: GameObjects.Container[] = [];

    options.forEach(({ option, label, x }) => {
      const price = this.config.prices[option];

      const blockContainer = scene.add.container(x, 0);

      const blockBg = scene.add
        .rectangle(0, 0, 280, 380, 0x2a2a2a)
        .setOrigin(0.5)
        .setStrokeStyle(4, 0x555555, 1);

      const labelText = scene.add
        .text(0, -120, label, {
          fontSize: '22px',
          color: '#4a90e2',
          fontFamily: 'Arial',
          fontStyle: 'bold',
          align: 'center',
          wordWrap: { width: 240 },
        })
        .setOrigin(0.5)
        .setShadow(0, 0, '#4a90e2', 8, true, true);

      const priceText = scene.add
        .text(0, -50, `${formatNumber(price)} FUN`, {
          fontSize: '36px',
          color: '#FFD700',
          fontFamily: 'Arial',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setShadow(0, 0, '#FFD700', 10, true, true);

      const hexButtonGraphics = scene.add.graphics();
      hexButtonGraphics.fillStyle(0x1a1a1a, 0.9);
      hexButtonGraphics.lineStyle(3, 0xffd700, 1);

      const hexButtonSize = 60;
      const hexPoints = 6;
      const hexAngleStep = (Math.PI * 2) / hexPoints;

      hexButtonGraphics.beginPath();
      for (let i = 0; i <= hexPoints; i++) {
        const angle = i * hexAngleStep - Math.PI / 2;
        const hx = Math.cos(angle) * hexButtonSize;
        const hy = Math.sin(angle) * hexButtonSize;
        if (i === 0) {
          hexButtonGraphics.moveTo(hx, hy);
        } else {
          hexButtonGraphics.lineTo(hx, hy);
        }
      }
      hexButtonGraphics.closePath();
      hexButtonGraphics.fillPath();
      hexButtonGraphics.strokePath();

      const hexButtonTexture = scene.add.renderTexture(
        0,
        0,
        hexButtonSize * 2.5,
        hexButtonSize * 2.5
      );
      hexButtonTexture.draw(
        hexButtonGraphics,
        hexButtonSize * 1.25,
        hexButtonSize * 1.25
      );
      hexButtonTexture.setOrigin(0.5);

      const buyButton = new Button(scene, 0, 100, {
        text: 'BUY',
        textStyle: {
          fontSize: '32px',
          color: '#00FF00',
          fontFamily: 'Arial',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 3,
        },
        padding: 20,
        textureKey: hexButtonTexture.texture.key,
        onUp: () => {
          if (!this.isTweening) {
            this.config.onBuy(option);
            this.hide();
          }
        },
      });

      buyButton.on('pointerover', () => {
        bg.disableInteractive();
      });
      buyButton.on('pointerout', () => {
        bg.setInteractive();
      });

      blockContainer.add([blockBg, labelText, priceText, buyButton]);

      this.buttons.set(option, buyButton);
      blockContainers.push(blockContainer);
    });

    const closeBg = scene.add.image(0, 0, 'closeBg').setOrigin(0.5);
    const closeIcon = scene.add.image(0, 0, 'close').setOrigin(0.5);
    closeIcon.setScale(0.5);

    const closeBtn = scene.add.container(0, 0, [closeBg, closeIcon]);
    closeBtn.setPosition(canvasWidth / 2 - 50, -canvasHeight / 2 + 50);
    closeBtn.setSize(closeBg.width, closeBg.height);
    closeBtn.setInteractive({ useHandCursor: true });

    closeBtn.on('pointerup', () => {
      this.hide();
    });

    this.contentContainer = scene.add.container(0, 0, [
      bg,
      title,
      ...blockContainers,
      closeBtn,
    ]);

    this.setContent(this.contentContainer);
  }
}
