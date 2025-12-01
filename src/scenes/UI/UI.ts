import {
  CoreEvents,
  DialogEvents,
  eventBus,
  GameEvents,
  SoundManager,
  type TCharacterKey,
} from '@/core';
import type { IControlBarButtons } from '@/types/types';
import { ControlBar } from '@/ui/components/ControlBar';
import IconButton from '@/ui/components/IconButton';
import { StatisticBar } from '@/ui/components/StatisticBar';
import { GameObjects, Scene } from 'phaser';
import { formatNumber } from '@/services/lib/formatNumber';
import { t } from '@/i18n';
import { modeButtonStates } from '@/ui/components/ControlBar/lib/constants';
import { SightPointer } from '@/entities/SightPointer';
import { isMobile } from '@/services/lib/isMobile';

const animatedPointerDuration = 300;

const BUTTON_BACKGROUND_STATES = {
  normal: 'sm-normal',
  hover: 'sm-hover',
  pressed: 'sm-pressed',
  disabled: 'sm-pressed',
};

export class UIScene extends Scene {
  exitButton: IconButton | null = null;
  soundButton: GameObjects.Container | null = null;
  rulesButton: IconButton | null = null;
  controlBar: ControlBar | null = null;
  statisticBar: StatisticBar | null = null;
  howToPlay: GameObjects.Container | null = null;
  pointerSightDefault: GameObjects.Image | null = null;
  pointerSightAnimated: SightPointer | null = null;

  public isSightMode = false;

  private activeModes = new Set<IControlBarButtons>();
  private disabledModes = new Set<IControlBarButtons>();

  constructor() {
    super('UIScene');
  }

  create() {
    this.createUI();
    this.createRulesButton();
    this.createExitButton();
    this.createPointerSightDefault();
    this.createPointerSightAnimated();
  }

  createEventlisteners() {
    this.events.on(DialogEvents.Opened, this.onOpenDialog, this);
    this.events.on(DialogEvents.Closed, this.onCloseDialog, this);
    this.events.on(GameEvents.UPDATE_CURSOR, this.updateCursor, this);

    eventBus.on(GameEvents.POINTER_MOVE, this.updatePointerSightPosition, this);
    eventBus.on(GameEvents.UPDATE_POINTER_IMAGE, this.handlePointerSight, this);
  }

  destroyEventlisteners() {
    this.events.off(DialogEvents.Opened, this.onOpenDialog, this);
    this.events.off(DialogEvents.Closed, this.onCloseDialog, this);
    this.events.off(GameEvents.UPDATE_CURSOR, this.updateCursor, this);

    eventBus.off(
      GameEvents.POINTER_MOVE,
      this.updatePointerSightPosition,
      this
    );
    eventBus.off(
      GameEvents.UPDATE_POINTER_IMAGE,
      this.handlePointerSight,
      this
    );
    this.input.setDefaultCursor('default');
  }

  createUI() {
    this.controlBar = new ControlBar(this);
    this.statisticBar = new StatisticBar(this);
  }

  createPointerSightDefault() {
    this.pointerSightDefault = this.add
      .image(0, 0, 'pointer')
      .setOrigin(0.5)
      .setDepth(1002)
      .setScale(0.25)
      .setVisible(false);
  }

  createPointerSightAnimated() {
    this.pointerSightAnimated = new SightPointer(this, {
      positionX: -50,
      positionY: -50,
    });
  }

  public handlePointerSightDefaultVisible(value: boolean) {
    if (!this.pointerSightDefault) return;

    this.pointerSightDefault.setVisible(value);
  }

  public handlePointerSight(isSightMode: boolean) {
    this.isSightMode = isSightMode;

    if (this.pointerSightAnimated && this.pointerSightDefault) {
      if (isSightMode) {
        if (isMobile(this.game)) return;

        this.pointerSightAnimated.handleVisible(true, animatedPointerDuration);
        this.handlePointerSightDefaultVisible(false);
      } else {
        this.pointerSightAnimated.handleVisible(false, animatedPointerDuration);
        this.handlePointerSightDefaultVisible(true);
      }
    }
  }

  private onOpenDialog() {
    this.events.off(GameEvents.UPDATE_CURSOR, this.updateCursor, this);
    eventBus.emit(GameEvents.SetOffShoot);
    this.handlePointerSightDefaultVisible(false);
    this.pointerSightAnimated?.setVisible(false);
    this.input.setDefaultCursor('default');
  }

  private onCloseDialog() {
    this.events.on(GameEvents.UPDATE_CURSOR, this.updateCursor, this);
    this.handlePointerSightDefaultVisible(true);
    this.input.setDefaultCursor('none');
  }

  private updateCursor(value: 'pointer' | 'none' | 'default') {
    this.input.setDefaultCursor(value);

    if (value === 'pointer' || value === 'default') {
      this.handlePointerSightDefaultVisible(false);
      this.pointerSightAnimated?.setVisible(false);
    } else if (value === 'none') {
      if (this.isSightMode) {
        if (isMobile(this.game)) return;

        this.pointerSightAnimated?.setVisible(true);
      } else {
        this.handlePointerSightDefaultVisible(true);
      }
    }
  }

  private updatePointerSightPosition(x: number, y: number) {
    if (this.isSightMode) {
      if (isMobile(this.game)) return;

      this.pointerSightAnimated?.setPosition(x, y);
    } else {
      this.pointerSightDefault?.setPosition(x, y);
    }
  }

  createExitButton() {
    this.exitButton = new IconButton(
      this,
      0,
      0,
      {
        onUp: () => eventBus.emit(CoreEvents.ExitGame),
        onOver: () => this.events.emit(GameEvents.UPDATE_CURSOR, 'pointer'),
        onOut: () => this.events.emit(GameEvents.UPDATE_CURSOR, 'none'),
      },
      BUTTON_BACKGROUND_STATES,
      {
        normal: 'back-default',
        hover: 'back-hover',
        pressed: 'back-pressed',
        disabled: 'back-pressed',
      }
    );
    this.exitButton.setPosition(-26, -26);

    this.tweens.add({
      targets: this.exitButton,
      x: { from: -26, to: this.exitButton.width / 2 + 26 },
      y: { from: -26, to: this.exitButton.height / 2 + 26 },
      duration: 300,
      ease: 'Quad.Out',
    });
  }

  createRulesButton() {
    this.rulesButton = new IconButton(
      this,
      0,
      0,
      {
        onUp: () => {
          localStorage.setItem('howToPlayShown', 'true');
          eventBus.emit(DialogEvents.ShowOnboarding);
        },
        onOver: () => this.events.emit(GameEvents.UPDATE_CURSOR, 'pointer'),
        onOut: () => this.events.emit(GameEvents.UPDATE_CURSOR, 'none'),
      },
      BUTTON_BACKGROUND_STATES,
      {
        normal: 'rules-default',
        hover: 'rules-hover',
        pressed: 'rules-pressed',
        disabled: 'rules-pressed',
      }
    );
    const target = this.rulesButton.list[0] as Phaser.GameObjects.Sprite;
    if (target && 'setScale' in target) {
      target.setScale(-1, 1);
    }

    this.rulesButton.setPosition(
      this.sys.canvas.width + 50,
      this.rulesButton.height / 2 + 26
    );

    this.tweens.add({
      targets: this.rulesButton,
      x: {
        from: this.sys.canvas.width + 50,
        to: this.sys.canvas.width - this.rulesButton.width / 2 - 26,
      },
      duration: 300,
      ease: 'Quad.Out',
    });
  }

  createHowToPlayHint() {
    const hasSeenHint = localStorage.getItem('howToPlayShown');
    if (hasSeenHint) return;

    const armImage = this.add
      .image(this.sys.canvas.width - 170, 70, 'arm')
      .setOrigin(0.5);

    const howToPlayText = this.add
      .text(armImage.x - 45, armImage.y, t('howToPlay'), {
        fontFamily: 'Tektur',
        fontStyle: '600',
        fontSize: '18px',
        color: '#72CCFF',
      })
      .setOrigin(1, 0.5)
      .setShadow(0, 0, '#37CFFF', 9.3);

    this.howToPlay = this.add.container(0, 0, [howToPlayText, armImage]);
    this.howToPlay.name = 'How to play hint';

    this.howToPlay.on('pointerdown', () => {
      this.hideHowToPlayHint();
    });

    this.tweens.add({
      targets: armImage,
      x: this.sys.canvas.width - 180,
      scaleX: 0.9,
      scaleY: 0.9,
      alpha: 0.8,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  createSoundButton() {
    const soundButton = new IconButton(
      this,
      0,
      0,
      {
        onUp: () => {
          SoundManager.setMuted();
        },
        onOver: () => this.events.emit(GameEvents.UPDATE_CURSOR, 'pointer'),
        onOut: () => this.events.emit(GameEvents.UPDATE_CURSOR, 'none'),
      },
      BUTTON_BACKGROUND_STATES,
      {
        normal: 'sound-default',
        hover: 'sound-hover',
        pressed: 'sound-pressed',
        disabled: 'sound-pressed',
      }
    );

    soundButton.setPosition(
      this.sys.canvas.width + 50,
      soundButton.height / 2 + 128
    );

    this.tweens.add({
      targets: soundButton,
      x: {
        from: this.sys.canvas.width + 50,
        to: this.sys.canvas.width - soundButton.width / 2 - 26,
      },
      duration: 300,
      ease: 'Quad.Out',
    });
  }

  updateBetButtons(disableIncrease: boolean, disableDecrease: boolean) {
    this.controlBar?.decreaseButton?.setDisabled(disableDecrease);
    this.controlBar?.increaseButton?.setDisabled(disableIncrease);
  }

  enableUI() {
    this.controlBar?.activateButtons();
    this.exitButton?.setDisabled(false);
    this.rulesButton?.setDisabled(false);
  }

  disableUI() {
    this.controlBar?.disableButtons();
    this.exitButton?.setDisabled(true);
    this.rulesButton?.setDisabled(true);
  }

  activateControlBarSound() {
    this.controlBar?.showControlBar();
    this.statisticBar?.showStatisticBar();
    this.createSoundButton();
  }

  showBalance(demo: boolean) {
    if (demo) this.controlBar?.showDemo();
    else this.controlBar?.showBalance();
  }

  setNominal(currentBet: number) {
    this.controlBar?.nominal?.setText(String(formatNumber(currentBet)));
  }

  setBalance(balance: number) {
    this.controlBar?.balanceDisplay?.updateText(formatNumber(balance));
  }

  setModeButton(isActive: boolean, key: IControlBarButtons) {
    if (isActive) {
      this.handleActiveModeStates(key);
    } else {
      this.handleDefaultModeStates(key);
    }
  }

  private handleActiveModeStates(key: IControlBarButtons) {
    this.controlBar?.modeButtons[key]?.setOnIconAnims(key);
    this.controlBar?.handleOnLabelAnimation(key);

    this.handleButtonsStatesByKey(key, true);
  }

  private handleDefaultModeStates(key: IControlBarButtons) {
    this.controlBar?.modeButtons[key]?.setOffIconAnims();

    this.controlBar?.handleOffLabelAnimation(key);

    this.handleButtonsStatesByKey(key, false);
  }

  private handleButtonsStatesByKey(key: IControlBarButtons, value: boolean) {
    if (!this.controlBar) return;

    const isAutoMode = key === 'autoMode';
    const isSightMode = key === 'sightMode';
    const isBundle = key === 'laser' || key === 'grenade' || key === 'ufo';

    if (isAutoMode || isSightMode) {
      this.rulesButton?.setDisabled(value);

      if (value) {
        this.controlBar.decreaseButton?.setDisabled(true);
        this.controlBar.increaseButton?.setDisabled(true);
      }
    }

    if (isBundle) {
      this.controlBar.toggleActiveButtons(!value);
      this.exitButton?.setDisabled(value);
      this.rulesButton?.setDisabled(value);
    }
    if (value) {
      this.activeModes.add(key);
    } else {
      this.activeModes.delete(key);
    }

    for (const item of this.activeModes) {
      modeButtonStates[item].forEach((mode) => this.disabledModes?.add(mode));
    }

    if (this.activeModes.size === 0) this.disabledModes.clear();
    for (const item in this.controlBar.modeButtons) {
      const updatedItem = item as IControlBarButtons;
      this.controlBar.modeButtons[updatedItem]?.setDisabled(
        this.disabledModes.has(updatedItem)
      );
    }
  }

  updateCharacter(key: TCharacterKey) {
    if (this.statisticBar) {
      this.statisticBar.currentCharacter = key;
      this.statisticBar.updatePlayer();
    }
  }

  public clearHowToPlay() {
    if (this.howToPlay && this.howToPlay.visible)
      this.howToPlay.setVisible(false);
  }

  public clearModes() {
    this.activeModes.clear();
    this.disabledModes.clear();
  }

  private hideHowToPlayHint() {
    if (this.howToPlay) {
      localStorage.setItem('howToPlayShown', 'true');
    }
  }

  public setMainPrize(maxPrize: number) {
    this.statisticBar?.handleSetMainPrize(maxPrize);
  }
}
