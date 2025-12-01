import type { EnemyEntity } from '@/entities';
import { GameObjects, Scene } from 'phaser';

export class Debug extends GameObjects.Container {
  private fpsText: GameObjects.Text | null = null;
  private totalEnemiesCountText: GameObjects.Text | null = null;
  private totalEnemiesCountActiveText: GameObjects.Text | null = null;

  constructor(scene: Scene) {
    super(scene);
    this.scene = scene;

    if (import.meta.env.DEV) this.createDebugInfo();
  }

  private createDebugInfo() {
    this.fpsText = this.scene.add
      .text(200, 20, '', {
        fontFamily: 'Tektur',
        fontStyle: '700',
        fontSize: '22px',
        color: '#ffffff',
        align: 'center',
      })
      .setDepth(1000);
    this.totalEnemiesCountText = this.scene.add
      .text(200, 45, '', {
        fontFamily: 'Tektur',
        fontStyle: '700',
        fontSize: '22px',
        color: '#ffffff',
        align: 'center',
      })
      .setDepth(1001);
    this.totalEnemiesCountActiveText = this.scene.add
      .text(200, 70, '', {
        fontFamily: 'Tektur',
        fontStyle: '700',
        fontSize: '22px',
        color: '#ffffff',
        align: 'center',
      })
      .setDepth(1001);
  }

  public handleUpdateDebugInfo(enemies: EnemyEntity[] | null) {
    if (
      import.meta.env.DEV &&
      this.fpsText &&
      this.totalEnemiesCountText &&
      this.totalEnemiesCountActiveText &&
      enemies
    ) {
      this.fpsText.setText(
        `FPS: ${Math.floor(this.scene.sys.game.loop.actualFps)}`
      );
      const active = enemies.filter((item) => {
        return item.active && item.readyToInteract;
      });
      this.totalEnemiesCountText.setText(`total : ${enemies.length}`);
      this.totalEnemiesCountActiveText.setText(`in field : ${active.length}`);
    }
  }
}
