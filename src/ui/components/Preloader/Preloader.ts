import { GameObjects, Scene } from 'phaser';
import { alignToCenter } from '@services/helpers';

export class Preloader extends GameObjects.Container {
  private progressBox: GameObjects.Graphics | null;
  private progressLine: GameObjects.Graphics | null;
  private WIDTH = 522;
  private HEIGHT = 18;

  constructor(scene: Scene, x: number, y: number, label: string) {
    super(scene, x, y);
    this.setName(label);
    this.progressBox = null;
    this.progressLine = null;
    this.createProgress();
    this.setX(alignToCenter(this.WIDTH));
    this.setY(this.scene.sys.canvas.height - 307);
    return this;
  }

  private createProgress() {
    this.progressBox = this.scene.add.graphics({
      lineStyle: {
        width: 2,
        color: 0x7c7c7c,
        alpha: 1,
      },
      fillStyle: {
        color: 0x450016,
        alpha: 1,
      },
    });
    this.progressBox.fillRoundedRect(1, 1, this.WIDTH - 2, this.HEIGHT - 2, 8);
    this.progressBox.strokeRoundedRect(0, 0, this.WIDTH, this.HEIGHT, 16);
    this.progressLine = this.scene.add.graphics();
    this.add([this.progressBox, this.progressLine]);
    this.scene.add.existing(this);
  }

  public updateProgress(procent: number) {
    this.progressLine?.clear();
    this.progressLine?.fillStyle(0xcc0041, 1);
    this.progressLine?.fillRoundedRect(
      1,
      1,
      (this.WIDTH - 2) * procent,
      this.HEIGHT - 2,
      8
    );
  }

  public destroyProgress() {
    this.destroy();
  }

  public get progressWidth(): number {
    return this.WIDTH;
  }
}
