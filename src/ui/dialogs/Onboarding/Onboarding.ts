import { GameObjects, Scene } from 'phaser';
import { BaseDialog } from '@/ui/components/BaseDialog';
import { getLang, t } from '@/i18n';
import { GameEvents } from '@/core/events/events';
import IconButton from '@/ui/components/IconButton';

const BUTTON_BACKGROUND_STATES = {
  normal: '',
  hover: '',
  pressed: '',
  disabled: '',
};

interface OnboardingOptions {
  onComplete?: () => void;
  onSkip?: () => void;
}

export class Onboarding extends BaseDialog {
  private currentStep = 0;
  private totalSteps = 3;
  private slideImages: GameObjects.Image[] = [];
  private pageIndicators: GameObjects.Container | null = null;
  private options: OnboardingOptions;
  private rulesUrl: string | undefined;
  private startX = 0;
  private startY = 0;

  constructor(
    scene: Scene,
    rulesUrl: string | undefined,
    options: OnboardingOptions = {}
  ) {
    super(scene, false);
    this.options = options;
    this.rulesUrl = rulesUrl;
    this.createContent();
    this.show();
  }

  private createContent() {
    const content = this.scene.add.container(0, 0);
    const dialogBg = this.scene.add
      .image(0, 0, 'onboardingBg')
      .setOrigin(0.5)
      .setDisplaySize(this.scene.scale.width, this.scene.scale.height);

    const lang = getLang();
    const isKz = lang === 'kz';

    const slideKeys = isKz
      ? ['slideOneKz', 'slideTwoKz', 'slideThreeKz']
      : ['slideOne', 'slideTwo', 'slideThree'];

    this.slideImages = slideKeys.map((key, index) => {
      const image = this.scene.add
        .image(0, 0, key)
        .setOrigin(0.5)
        .setScale(0.8);

      if (index > 0) {
        image.setVisible(false);
      }

      return image;
    });

    const closeBg = this.scene.add.image(0, 0, 'closeBg').setOrigin(0.5);
    const closeIcon = this.scene.add.image(0, 0, 'close').setOrigin(0.5);
    closeIcon.setScale(0.5);

    const closeButton = this.scene.add.container(
      this.scene.scale.width / 2 - 76,
      -this.scene.scale.height / 2 + 76,
      [closeBg, closeIcon]
    );

    closeButton.setSize(closeBg.width, closeBg.height);
    closeButton.setInteractive({ useHandCursor: true });

    closeButton.on('pointerup', () => {
      this.handleClose();
      this.options.onSkip?.();
    });
    closeButton.on('pointerout', () => {
      this.scene.events.emit(GameEvents.UPDATE_CURSOR, 'default');
    });
    closeButton.on('pointerover', () =>
      this.scene.events.emit(GameEvents.UPDATE_CURSOR, 'pointer')
    );

    this.scene.input.on('pointerdown', this.handleSwipePointerDown);
    this.scene.input.on('pointerup', this.handleSwipePointerUp);

    this.pageIndicators = this.createPageIndicators();

    const rulesBottomOffset = 68;

    const rulesContainer = this.scene.add.container(
      0,
      this.scene.scale.height / 2 - rulesBottomOffset
    );

    const rulesText = new IconButton(
      this.scene,
      0,
      0,
      {
        text: t('onboarding.fullRules'),
        textStyle: {
          fontSize: '16px',
          color: '#ffffff',
        },
        onOver: () =>
          this.scene.events.emit(GameEvents.UPDATE_CURSOR, 'pointer'),
        onOut: () =>
          this.scene.events.emit(GameEvents.UPDATE_CURSOR, 'default'),
        onUp: () => this.handleOpenRules(),
      },
      BUTTON_BACKGROUND_STATES
    );

    const underline = this.scene.add
      .line(
        rulesText.width / 2,
        rulesText.height / 2 + 2,
        -rulesText.width / 2,
        0,
        rulesText.width / 2,
        0,
        0xffffff
      )
      .setOrigin(0.5)
      .setLineWidth(1);

    const bookmarkIcon = this.scene.add
      .image(-rulesText.width / 2 - 16, 0, 'bookmark')
      .setOrigin(0.5)
      .setScale(0.8);

    rulesContainer.add([bookmarkIcon, rulesText, underline]);

    content.add([
      dialogBg,
      ...this.slideImages,
      closeButton,
      this.pageIndicators,
      rulesContainer,
    ]);

    this.setContent(content);
  }

  private handleSwipePointerDown = (pointer: Phaser.Input.Pointer) => {
    this.startX = pointer.x;
    this.startY = pointer.y;
  };

  private handleSwipePointerUp = (pointer: Phaser.Input.Pointer) => {
    const deltaX = pointer.x - this.startX;
    const deltaY = pointer.y - this.startY;
    const minSwipeDistance = 50;

    if (
      Math.abs(deltaX) > Math.abs(deltaY) &&
      Math.abs(deltaX) > minSwipeDistance
    ) {
      if (deltaX > 0) {
        if (this.currentStep > 0) {
          this.previousStep();
        }
      } else {
        this.nextStep();
      }
    }
  };

  private createPageIndicators(): GameObjects.Container {
    const container = this.scene.add.container(-8, 0);

    for (let i = 0; i < this.totalSteps; i++) {
      const x = (i - 1) * 40;
      const y = this.scene.scale.height / 2 - 30;
      const indicator = this.createImageIndicator(x, y, i === this.currentStep);
      indicator.on('pointerdown', () => {
        this.goToStep(i);
      });
      container.add(indicator);
    }

    return container;
  }

  private createImageIndicator(
    x: number,
    y: number,
    isActive: boolean
  ): GameObjects.Image {
    const textureKey = isActive ? 'polygonActive' : 'polygon';
    const indicator = this.scene.add
      .image(x, y, textureKey)
      .setOrigin(0.5)
      .setInteractive();

    return indicator;
  }

  private nextStep() {
    if (this.currentStep < this.totalSteps - 1) {
      this.goToStep(this.currentStep + 1);
    } else {
      this.handleClose();
      this.options.onComplete?.();
    }
  }

  private previousStep() {
    if (this.currentStep > 0) {
      this.goToStep(this.currentStep - 1);
    }
  }

  private goToStep(stepIndex: number) {
    if (stepIndex < 0 || stepIndex >= this.totalSteps) return;
    if (stepIndex === this.currentStep) return;
    this.slideImages[this.currentStep].setVisible(false);
    this.currentStep = stepIndex;
    this.slideImages[this.currentStep].setVisible(true);
    this.updatePageIndicators();
  }

  private updatePageIndicators() {
    if (!this.pageIndicators) return;
    this.pageIndicators.list.forEach((indicator, index) => {
      const image = indicator as GameObjects.Image;
      const isActive = index === this.currentStep;
      const textureKey = isActive ? 'polygonActive' : 'polygon';
      image.setTexture(textureKey);
    });
  }

  private handleOpenRules() {
    if (this.rulesUrl && this.rulesUrl.trim() !== '') {
      window.open(this.rulesUrl, '_blank');
    } else {
      this.handleClose();
      this.options.onSkip?.();
    }
  }

  private handleClose() {
    if (!this.isTweening) {
      this.hide();
      this.currentStep = 0;
      this.scene.input.off('pointerdown', this.handleSwipePointerDown);
      this.scene.input.off('pointerup', this.handleSwipePointerUp);
    }
  }
}
