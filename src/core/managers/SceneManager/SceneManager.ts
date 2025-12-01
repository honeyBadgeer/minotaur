import type { PreloadScene, Shooting, StartScene, UIScene } from '@/scenes';
import type { Game } from 'phaser';
import type { ISceneMap, TSceneKey } from './types';
import type { Minos } from '@/scenes/minos/Minos';

export class SceneManager {
  game: Game;
  scenes: Record<string, ISceneMap[TSceneKey]>;
  constructor(game: Game) {
    this.game = game;
    this.scenes = {
      preloadScene: this.getScene('PreloadScene') as PreloadScene,
      shootingScene: this.getScene('ShootingScene') as Shooting,
      startScene: this.getScene('StartScene') as StartScene,
      uiScene: this.getScene('UIScene') as UIScene,
      minos: this.getScene('Minos') as Minos,
    };
  }

  getScene<K extends keyof ISceneMap>(key: K): ISceneMap[K] {
    return this.game.scene.getScene(key) as ISceneMap[K];
  }

  start<K extends TSceneKey>(key: K) {
    this.game.scene.start(key);
    this.scenes[key] = this.getScene(key);
  }

  stop(key: TSceneKey) {
    this.game.scene.stop(key);
  }

  stopByScene(key: TSceneKey) {
    const scene = this.getScene(key);
    scene.scene.stop(key);
  }

  stopAll() {
    this.game.scene
      .getScenes(true)
      .forEach((scene) => this.game.scene.stop(scene.scene.key));
  }

  runPreloadScene = () => {
    this.stopByScene('BootScene');
    this.start('PreloadScene');
  };

  runStartScene() {
    this.start('StartScene');
  }

  runUIScene() {
    this.start('UIScene');
  }

  runShootingScene() {
    this.start('ShootingScene');
  }

  runMinosScene() {
    this.start('Minos');
  }

  isActive(key: TSceneKey) {
    const scene = this.getScene(key);
    return scene.scene.isActive();
  }

  isVisible(key: TSceneKey) {
    const scene = this.getScene(key);
    const isVisible = scene ? scene.scene.isVisible() : false;
    return isVisible;
  }
}
