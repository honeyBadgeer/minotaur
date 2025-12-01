import Phaser from 'phaser';
import { DialogEvents } from '@/core/events/events';

export class BaseDialog extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle | null = null;
  private content?: Phaser.GameObjects.GameObject &
    Phaser.GameObjects.Components.Transform;

  protected isTweening = false;

  constructor(scene: Phaser.Scene, bg = true) {
    super(scene, scene.scale.width / 2, scene.scale.height / 2);
    this.scene = scene;

    this.createBackground(bg);
  }

  createBackground(isVisible: boolean) {
    this.background = this.scene.add
      .rectangle(
        0,
        0,
        this.scene.scale.width,
        this.scene.scale.height,
        0x000000,
        isVisible ? 0.9 : 0
      )
      .setInteractive()
      .setOrigin(0.5);

    this.add(this.background);

    this.scene.add.existing(this);
    this.setDepth(1000);
    this.setVisible(false);
  }

  setContent(
    content: Phaser.GameObjects.GameObject &
      Phaser.GameObjects.Components.Transform
  ) {
    if (this.content) {
      this.remove(this.content, true);
    }
    this.content = content;
    this.add(content);
    content.setPosition(0, 0);
    return this;
  }

  show(onComplete?: () => void) {
    this.setVisible(true);
    this.setAlpha(0);

    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 200,
      onComplete: () => {
        if (onComplete) {
          onComplete();
          this.scene.events.emit(DialogEvents.Opened);
        }
      },
    });
  }

  async hide() {
    return new Promise<void>((res) => {
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: 200,
        onStart: () => (this.isTweening = true),
        onComplete: () => {
          this.scene.events.emit(DialogEvents.Closed);
          res();
          this.isTweening = false;
          this.destroy();
        },
      });
    });
  }
}
