import type { PreloadScene, Shooting, StartScene, UIScene } from '@/scenes';
import type { SceneManager } from '../managers';
import type { CharacterModel } from '../Model';
import { mdeToNormal } from '@/services/lib/mdeToNormal';
import type { EnemyType, IBundle } from '@/types/types';
import type { BulletEntity } from '@/entities/Bullet/BulletEntity';
import type { Player } from '@/entities/Player';
import type { EnemyEntity } from '@/entities/Enemy/EnemyEntity';
import type { Minos } from '@/scenes/minos/Minos';

export class View {
  sceneManager: SceneManager;
  uiScene: UIScene;
  shootingScene: Shooting;
  preloadScene: PreloadScene;
  startScene: StartScene;
  minosScene: Minos;

  constructor(sceneManager: SceneManager) {
    this.sceneManager = sceneManager;
    this.uiScene = this.sceneManager.getScene('UIScene');
    this.shootingScene = this.sceneManager.getScene('ShootingScene');
    this.preloadScene = this.sceneManager.getScene('PreloadScene');
    this.startScene = this.sceneManager.getScene('StartScene');
    this.minosScene = this.sceneManager.getScene('Minos');
  }

  renderStartScene() {
    this.sceneManager.stop('PreloadScene');
    this.sceneManager.runUIScene();
    this.uiScene = this.sceneManager.getScene('UIScene');
    this.uiScene.destroyEventlisteners();

    this.sceneManager.runMinosScene();
    this.minosScene = this.sceneManager.getScene('Minos');

    this.minosScene.initCombination([
      [
        Phaser.Math.Between(1, 9),
        Phaser.Math.Between(1, 9),
        Phaser.Math.Between(1, 9),
      ],
      [
        Phaser.Math.Between(1, 9),
        Phaser.Math.Between(1, 9),
        Phaser.Math.Between(1, 9),
      ],
      [
        Phaser.Math.Between(1, 9),
        Phaser.Math.Between(1, 9),
        Phaser.Math.Between(1, 9),
      ],
      [
        Phaser.Math.Between(1, 9),
        Phaser.Math.Between(1, 9),
        Phaser.Math.Between(1, 9),
      ],
      [
        Phaser.Math.Between(1, 9),
        Phaser.Math.Between(1, 9),
        Phaser.Math.Between(1, 9),
      ],
    ]);
  }

  renderCarousel(carouselIndex: number) {
    this.uiScene.createHowToPlayHint();
    this.startScene.createCarousel(carouselIndex);
  }

  renderShootingScene() {
    this.uiScene.createEventlisteners();
    this.uiScene.handlePointerSightDefaultVisible(true);
    this.shootingScene = this.sceneManager.getScene('ShootingScene');

    this.uiScene.activateControlBarSound();
  }

  renderCharacter(character: CharacterModel) {
    this.shootingScene?.createPlayer(character.key);
    this.shootingScene.handleBullets(character.bullet);
    this.shootingScene.handleBulletsImpact(character.bullet);
  }

  renderGameData(data: {
    balance: number;
    demo: boolean;
    maxPrizeMDE: number;
    currentBetMDE: number;
    disableIncrease: boolean;
    disableDecrease: boolean;
  }) {
    this.uiScene.setNominal(mdeToNormal(data.currentBetMDE));

    this.uiScene.showBalance(data.demo);
    this.uiScene.setBalance(mdeToNormal(data.balance));
    this.uiScene.setMainPrize(data.maxPrizeMDE);
    this.uiScene.updateBetButtons(data.disableIncrease, data.disableDecrease);
  }

  renderError() {
    this.shootingScene?.setStateOnError();
    this.uiScene.setModeButton(false, 'autoMode');
    this.uiScene.setModeButton(false, 'sightMode');
    this.uiScene.setModeButton(false, 'doubleFireMode');
    this.uiScene.isSightMode = false;
    this.shootingScene.deactivateShootArea();
  }

  renderUpdatedCharacter(character: CharacterModel) {
    this.uiScene.updateCharacter(character.key);
  }

  renderWeapon(data: {
    disableIncrease: boolean;
    disableDecrease: boolean;
    newBet: number;
    doubleFireMode: boolean;
  }) {
    this.uiScene.setNominal(mdeToNormal(data.newBet));
    this.uiScene.updateBetButtons(data.disableIncrease, data.disableDecrease);

    if (data.doubleFireMode) {
      this.shootingScene.setDoubleFireMode(false);
      this.uiScene.setModeButton(false, 'doubleFireMode');
      this.shootingScene.updateWeapon();
    }
  }

  renderBundle(key: IBundle) {
    this.uiScene.setModeButton(true, key);
    this.uiScene.updateBetButtons(true, true);
    this.shootingScene && this.shootingScene.deactivateShootArea();
  }

  renderRestoreUI(disableIncrease: boolean, disableDecrease: boolean) {
    this.uiScene.enableUI();
    this.uiScene.updateBetButtons(disableIncrease, disableDecrease);
    this.shootingScene && this.shootingScene.activateShootArea();
  }

  renderAutoModeToggle(isAutoMode: boolean) {
    this.shootingScene.clearBullets();

    if (!isAutoMode) return;
    this.shootingScene.clearAutoMode();
    this.uiScene.setModeButton(false, 'autoMode');
  }

  renderAutoModeSet(keys: EnemyType[]) {
    this.shootingScene.setAutoMode(keys);
    this.uiScene.setModeButton(true, 'autoMode');
  }

  renderSightMode(
    sightMode: boolean,
    disableIncrease: boolean,
    disableDecrease: boolean,
    isSightMode?: boolean
  ) {
    const updatedIsSightMode = isSightMode ? isSightMode : sightMode;

    this.shootingScene.setSightMode(updatedIsSightMode);
    this.shootingScene.clearBullets();
    this.uiScene.setModeButton(updatedIsSightMode, 'sightMode');

    if (!updatedIsSightMode) {
      this.uiScene.updateBetButtons(disableIncrease, disableDecrease);
    }
  }

  renderShoot(
    bullet: BulletEntity,
    player: Player,
    offsetX: number,
    target?: EnemyEntity
  ) {
    this.shootingScene.handleShoot(bullet, player, offsetX, target);
  }

  renderDoubleFireMode(doubleFireMode: boolean) {
    this.shootingScene.setDoubleFireMode(doubleFireMode);
    this.uiScene.setModeButton(doubleFireMode, 'doubleFireMode');
  }

  renderBundleClear(currentBundle: IBundle) {
    this.uiScene.setModeButton(false, currentBundle);
  }

  renderBundleActivate(key: IBundle) {
    this.shootingScene.activateBundle(key);
  }
}
