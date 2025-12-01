import { GameObjects, Scene } from 'phaser';
import type { Character, CharacterCarouselConfig } from './types';
import {
  nameTextStyle,
  tintedNameTextStyle,
  valueTextStyle,
  tintedValueTextStyle,
} from './lib/textStyles';
import { characters } from './lib/characters';
import {
  DRAG_SWIPE_THRESHOLD,
  FAST_SWIPE_DELTA,
  FAST_SWIPE_TIME,
  TINT_INACTIVE,
} from './lib/constants';
import { ArrowButtons, StartButton } from './buttons';
import { BaseCarousel } from '../BaseCarousel';
import type { SpineGameObject } from '@esotericsoftware/spine-phaser-v3';
import { eventBus, GameStates } from '@/core';
import { CoreEvents } from '@/core/events/events';
import { t } from '@/i18n';

export class CharacterCarousel {
  private scene: Scene;
  private container: GameObjects.Container;
  private characters: Character[];
  private characterContainers: GameObjects.Container[] = [];
  private slideWidth = 350;
  private currentIndex = 0;
  private isSelecting = false;

  private initialIndex = 0;

  private spineInstances: SpineGameObject[] = [];
  private onSelect?: (character: Character) => void;
  private onCarouselReady?: () => void;

  private carousel: BaseCarousel | null = null;
  arrowButtons: ArrowButtons | null = null;
  startButton: StartButton | null = null;
  platforms: GameObjects.Image[] = [];
  nameTexts: GameObjects.Text[] = [];
  valueTexts: GameObjects.Text[] = [];
  choisingLabels: GameObjects.Image[] = [];
  lights: GameObjects.Image[] = [];

  constructor(
    scene: Scene,
    x: number,
    y: number,
    config: CharacterCarouselConfig
  ) {
    this.scene = scene;
    this.characters = characters;
    this.onSelect = config.onSelect;

    this.container = this.scene.add.container(x, y);
    this.container.name = 'CharacterCarousel';
  }

  setActiveIndex(value: number, skipAnimation = false) {
    this.carousel?.setActiveIndex(value, skipAnimation);
    this.currentIndex = value;
    this.updateActiveSpineAnimation();
    this.updateInactiveTints();
  }

  createBaseCarousel() {
    this.carousel = new BaseCarousel(this.scene, 0, 0, {
      slideWidth: this.slideWidth,
      dragSwipeThreshold: DRAG_SWIPE_THRESHOLD,
      fastSwipeDelta: FAST_SWIPE_DELTA,
      fastSwipeTime: FAST_SWIPE_TIME,
      tweenDuration: 300,
      tweenEase: 'Quad.Out',
      initialIndex: this.initialIndex,
      transform: ({ offset, isActive }) => {
        const targetX = offset * this.slideWidth;
        const targetScale = isActive ? 1 : 0.77;
        const targetY = isActive ? 120 : 0;
        const targetAlpha = Math.abs(offset) >= 2 ? 0 : 1;
        const bringToTop = isActive;

        return {
          x: targetX,
          y: targetY,
          scale: targetScale,
          alpha: targetAlpha,
          bringToTop,
        };
      },
      onIndexChange: (index) => {
        this.currentIndex = index;
        this.updateActiveSpineAnimation();
        this.updateInactiveTints();
      },
    });

    this.container.add(this.carousel.container);
  }

  create() {
    this.createCharacterSlides();

    this.createButtons();
    this.createArrowButtons();
  }

  setSpineTint(spine: SpineGameObject, color: number) {
    const r = ((color >> 16) & 0xff) / 255;
    const g = ((color >> 8) & 0xff) / 255;
    const b = (color & 0xff) / 255;
    spine.skeleton.color.set(r, g, b, 1);
  }

  setTextTint(text: Phaser.GameObjects.Text) {
    text.setStyle(tintedNameTextStyle);
  }

  clearTextTint(text: Phaser.GameObjects.Text) {
    text.setStyle(nameTextStyle);
  }

  clearSpineTint(spine: SpineGameObject) {
    spine.skeleton.color.set(1, 1, 1, 1);
  }

  setOnReady() {
    this.onCarouselReady = () => {
      this.startButton?.setDisabled(false);
      this.arrowButtons?.setDisabled(false);
    };
  }

  createCharacterSlides() {
    const slides: GameObjects.Container[] = [];

    this.characters.forEach((character, index) => {
      const slideContainer = this.scene.add.container(
        index * this.slideWidth,
        120
      );
      slideContainer.visible = false;
      slideContainer.name = `slideContainer ${character.label.name}`;

      const platform = this.scene.add
        .image(0, 0, 'choisingPlatform')
        .setOrigin(0.5);
      this.platforms[index] = platform;
      const light = this.scene.add.image(0, -100, 'light').setOrigin(0.5);
      this.lights[index] = light;
      const label = this.scene.add.image(0, 20, 'choisingLabel').setOrigin(0.5);
      this.choisingLabels[index] = label;

      const playerSpine = this.scene.add.spine(
        character.spineOffset.x,
        character.spineOffset.y,
        `${character.id}-json`,
        `${character.id}-atlas`
      );

      playerSpine.visible = true;
      playerSpine.animationState.setAnimation(0, 'idle', true);
      this.spineInstances[index] = playerSpine;

      const nameText = this.scene.add
        .text(0, 15, t(`characters.${character.alias}.label`), nameTextStyle)
        .setOrigin(0.5);
      this.nameTexts[index] = nameText;
      const valueText = this.scene.add
        .text(0, 48, character.label.values, valueTextStyle)
        .setOrigin(0.5);
      this.valueTexts[index] = valueText;

      slideContainer.add([
        platform,
        playerSpine as unknown as SpineGameObject,
        light,
        label,
        nameText,
        valueText,
      ]);

      slides.push(slideContainer);
      this.characterContainers.push(slideContainer);

      this.scene.tweens.add({
        targets: slideContainer,
        y: { from: 800, to: index === this.initialIndex ? 120 : 0 },
        ease: 'Quad.Out',
        duration: 600,
        delay: index === this.initialIndex ? 0 : 200,
        onStart: () => {
          window.setTimeout(() => {
            slideContainer.visible = true;
          }, 0);
        },
        onComplete: () => {
          if (index === this.characters.length - 1) {
            this.onCarouselReady?.();
          }
        },
      });
    });

    this.carousel?.setSlides(slides, 0, true);

    this.updateActiveSpineAnimation();
    this.updateInactiveTints();
  }

  setInitialIndex(index: number) {
    this.initialIndex = index;
  }

  updateActiveSpineAnimation() {
    const active = this.spineInstances[this.currentIndex];
    if (!active) return;

    const currentAnimation =
      active.animationState.getCurrent(0)?.animation?.name;
    if (currentAnimation !== 'idle') {
      active.animationState.setAnimation(0, 'idle', true);
    }
  }

  updateInactiveTints() {
    const total = this.characters.length;

    for (let i = 0; i < total; i++) {
      let offset = (i - this.currentIndex + total) % total;
      if (offset > total / 2) offset -= total;

      const spine = this.spineInstances[i];
      if (!spine) continue;

      if (offset === 0) {
        this.clearSpineTint(spine);
        this.clearTextTint(this.nameTexts[i]);
        this.valueTexts[i].setStyle(valueTextStyle);
        this.choisingLabels[i].setTexture('choisingLabel');
        this.platforms[i].setTexture('choisingPlatform');
        this.platforms[i].setTint(0xffffff);
        this.lights[i].setVisible(true);
      } else {
        this.setSpineTint(spine, TINT_INACTIVE);
        this.setTextTint(this.nameTexts[i]);
        this.valueTexts[i].setStyle(tintedValueTextStyle);
        this.choisingLabels[i].setTexture('choisingLabelInactive');
        this.platforms[i].setTexture('choisingPlatformInactive');
        this.platforms[i].setTint(TINT_INACTIVE);
        this.lights[i].setVisible(false);
      }
    }
  }

  createButtons() {
    this.startButton = new StartButton(this.scene, () => this.select());
    this.startButton.setDisabled(true);
  }

  createArrowButtons() {
    this.arrowButtons = new ArrowButtons(
      this.scene,
      () => this.previous(),
      () => this.next()
    );
    this.arrowButtons.setDisabled(true);
  }

  select() {
    if (this.isSelecting) return;

    this.isSelecting = true;
    this.carousel?.lock();
    this.arrowButtons?.setDisabled(true);
    this.startButton?.setDisabled(true);

    const selected = this.characters[this.currentIndex];
    const spine = this.spineInstances[this.currentIndex];
    if (!spine) return;

    spine.animationStateData.setMix('idle', 'animation', 0.4);
    const track = spine.animationState.setAnimation(0, 'animation', false);
    this.onSelect?.(selected);

    if (track) {
      track.listener = {
        complete: () => {
          eventBus.emit(CoreEvents.SetGameState, GameStates.PLAYING);
        },
      };
    }
  }

  next() {
    if (this.isSelecting) return;
    this.carousel?.next();
  }

  previous() {
    if (this.isSelecting) return;
    this.carousel?.previous();
  }
}
