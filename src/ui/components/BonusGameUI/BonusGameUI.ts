import { eventBus } from '@/core/events/EventBus';
import { BonusGameEvents } from '@/core/events/events';
import { GameObjects, Scene } from 'phaser';
import { Button } from '../Button';
import { formatNumber } from '@/services/lib/formatNumber';

export class BonusGameUI extends GameObjects.Container {
  private multiplierText: GameObjects.Text | null = null;
  private maxMultiplierText: GameObjects.Text | null = null;
  private respinButton: Button | null = null;
  private progressBar: GameObjects.Rectangle | null = null;
  private progressBarBg: GameObjects.Rectangle | null = null;
  private progressBarGlow: GameObjects.Rectangle | null = null;
  private clickToStartText: GameObjects.Text | null = null;
  private buttonGlow: GameObjects.Image | null = null;
  private backgroundOverlay: GameObjects.Rectangle | null = null;
  private greekPatternLeft: GameObjects.Graphics | null = null;
  private greekPatternRight: GameObjects.Graphics | null = null;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y);
    this.create();
    this.setVisible(false);
    this.scene.add.existing(this);
    this.initEvents();
  }

  private initEvents() {
    eventBus.on(BonusGameEvents.StartBonusGame, this.onStartBonusGame, this);
    eventBus.on(
      BonusGameEvents.UpdateMultiplier,
      this.onUpdateMultiplier,
      this
    );
    eventBus.on(
      BonusGameEvents.BonusGameComplete,
      this.onBonusGameComplete,
      this
    );
  }

  private create() {
    const { scene } = this;
    const centerX = scene.sys.canvas.width / 2;
    const topY = 50;

    this.backgroundOverlay = scene.add
      .rectangle(
        centerX,
        scene.sys.canvas.height / 2,
        scene.sys.canvas.width,
        scene.sys.canvas.height,
        0x000000,
        0.6
      )
      .setOrigin(0.5)
      .setDepth(-1);

    this.createGreekPattern(scene, 50, scene.sys.canvas.height / 2, true); // Left
    this.createGreekPattern(
      scene,
      scene.sys.canvas.width - 50,
      scene.sys.canvas.height / 2,
      false
    );

    const topBarBg = scene.add
      .rectangle(centerX, topY, scene.sys.canvas.width - 100, 60, 0x1a1a1a, 0.9)
      .setOrigin(0.5)
      .setStrokeStyle(3, 0xffd700, 1);

    this.progressBarBg = scene.add
      .rectangle(centerX - 250, topY, 200, 25, 0x333333)
      .setOrigin(0, 0.5)
      .setAlpha(0.8)
      .setStrokeStyle(2, 0x4a90e2, 1);

    this.progressBar = scene.add
      .rectangle(centerX - 250, topY, 0, 25, 0x4a90e2)
      .setOrigin(0, 0.5);

    this.progressBarGlow = scene.add
      .rectangle(centerX - 250, topY, 0, 25, 0x4a90e2, 0.5)
      .setOrigin(0, 0.5)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.multiplierText = scene.add
      .text(centerX, topY, 'x1', {
        fontSize: '56px',
        color: '#FFD700',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setShadow(0, 0, '#FFD700', 10, true, true);

    this.maxMultiplierText = scene.add
      .text(centerX + 250, topY, 'x1024', {
        fontSize: '28px',
        color: '#FFD700',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    const hexagonGraphics = scene.add.graphics();
    hexagonGraphics.fillStyle(0x1a1a1a, 0.95);
    hexagonGraphics.lineStyle(5, 0xffd700, 1);

    const hexSize = 100;
    const points = 6;
    const angleStep = (Math.PI * 2) / points;

    hexagonGraphics.beginPath();
    for (let i = 0; i <= points; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = Math.cos(angle) * hexSize;
      const y = Math.sin(angle) * hexSize;
      if (i === 0) {
        hexagonGraphics.moveTo(x, y);
      } else {
        hexagonGraphics.lineTo(x, y);
      }
    }
    hexagonGraphics.closePath();
    hexagonGraphics.fillPath();
    hexagonGraphics.strokePath();

    const hexTexture = scene.add.renderTexture(
      0,
      0,
      hexSize * 2.5,
      hexSize * 2.5
    );
    hexTexture.draw(hexagonGraphics, hexSize * 1.25, hexSize * 1.25);
    hexTexture.setOrigin(0.5);

    this.respinButton = new Button(
      scene,
      centerX,
      scene.sys.canvas.height / 2 + 200,
      {
        text: 'RESPIN',
        textStyle: {
          fontSize: '42px',
          color: '#FFD700',
          fontFamily: 'Arial',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 4,
        },
        padding: 25,
        textureKey: hexTexture.texture.key,
        onUp: () => {
          eventBus.emit(BonusGameEvents.Respin);
        },
      }
    );

    this.buttonGlow = scene.add
      .image(centerX, scene.sys.canvas.height / 2 + 200, hexTexture.texture.key)
      .setTint(0xffd700)
      .setAlpha(0.3)
      .setScale(1.2)
      .setBlendMode(Phaser.BlendModes.ADD);

    scene.tweens.add({
      targets: this.buttonGlow,
      alpha: { from: 0.2, to: 0.5 },
      scale: { from: 1.1, to: 1.3 },
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    this.clickToStartText = scene.add
      .text(centerX, scene.sys.canvas.height / 2 + 280, 'CLICK TO START', {
        fontSize: '24px',
        color: '#FFFFFF',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0.8);

    const elements: GameObjects.GameObject[] = [
      this.backgroundOverlay,
      topBarBg,
      this.progressBarBg,
      this.progressBar,
      this.progressBarGlow,
      this.multiplierText,
      this.maxMultiplierText,
      this.buttonGlow,
      this.respinButton,
      this.clickToStartText,
    ].filter(Boolean) as GameObjects.GameObject[];

    if (this.greekPatternLeft) elements.push(this.greekPatternLeft);
    if (this.greekPatternRight) elements.push(this.greekPatternRight);

    this.add(elements);
  }

  private createGreekPattern(
    scene: Scene,
    x: number,
    centerY: number,
    isLeft: boolean
  ) {
    const pattern = scene.add.graphics();
    pattern.lineStyle(4, 0xffd700, 1);

    const segmentSize = 20;
    const patternHeight = scene.sys.canvas.height - 100;
    const startY = centerY - patternHeight / 2;
    const segments = Math.floor(patternHeight / (segmentSize * 2));

    for (let i = 0; i < segments; i++) {
      const y = startY + i * segmentSize * 2;
      const offset = isLeft ? -segmentSize : segmentSize;

      pattern.beginPath();
      pattern.moveTo(x, y);
      pattern.lineTo(x, y + segmentSize);
      pattern.lineTo(x + offset, y + segmentSize);
      pattern.lineTo(x + offset, y + segmentSize * 2);
      pattern.lineTo(x, y + segmentSize * 2);
      pattern.strokePath();
    }

    if (isLeft) {
      this.greekPatternLeft = pattern;
    } else {
      this.greekPatternRight = pattern;
    }
  }

  private onStartBonusGame = (data: {
    wildColumn: number;
    multiplier: number;
  }) => {
    this.setVisible(true);
    this.setAlpha(0);

    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 500,
      ease: 'Power2',
    });

    this.updateMultiplier(data.multiplier);
    if (this.clickToStartText) {
      this.clickToStartText.setVisible(true);
      this.scene.tweens.add({
        targets: this.clickToStartText,
        alpha: { from: 0.5, to: 1 },
        duration: 800,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });
    }
    if (this.respinButton) {
      this.respinButton.setDisabled(false);
    }
  };

  private onUpdateMultiplier = (data: {
    multiplier: number;
    respinCount: number;
  }) => {
    this.updateMultiplier(data.multiplier);
    if (this.clickToStartText) {
      this.clickToStartText.setVisible(false);
    }
  };

  private onBonusGameComplete = () => {
    this.scene.time.delayedCall(2000, () => {
      this.setVisible(false);
    });
  };

  private updateMultiplier(multiplier: number) {
    if (this.multiplierText) {
      this.multiplierText.setText(`x${formatNumber(multiplier)}`);

      this.scene.tweens.add({
        targets: this.multiplierText,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 200,
        yoyo: true,
        ease: 'Power2',
      });
    }

    if (this.progressBar && this.progressBarBg) {
      const progress = Math.min(multiplier / 1024, 1);
      const barWidth = 200 * progress;

      this.scene.tweens.add({
        targets: this.progressBar,
        width: barWidth,
        duration: 300,
        ease: 'Power2',
      });

      if (this.progressBarGlow) {
        this.scene.tweens.add({
          targets: this.progressBarGlow,
          width: barWidth,
          duration: 300,
          ease: 'Power2',
        });
      }
    }
  }

  public destroy() {
    eventBus.off(BonusGameEvents.StartBonusGame, this.onStartBonusGame, this);
    eventBus.off(
      BonusGameEvents.UpdateMultiplier,
      this.onUpdateMultiplier,
      this
    );
    eventBus.off(
      BonusGameEvents.BonusGameComplete,
      this.onBonusGameComplete,
      this
    );
    super.destroy();
  }
}
