import type { GameObjects, Input, Scene } from 'phaser';

export type CarouselTransform = {
  x: number;
  y: number;
  scale?: number;
  alpha?: number;
  bringToTop?: boolean;
};

export type CarouselConfig = {
  slideWidth: number;

  dragSwipeThreshold: number;
  fastSwipeDelta: number;
  fastSwipeTime: number;

  tweenDuration?: number;
  tweenEase?: string;

  initialIndex?: number;

  transform: (args: {
    index: number;
    total: number;
    offset: number;
    isActive: boolean;
    slide: GameObjects.Container;
  }) => CarouselTransform;

  onIndexChange?: (index: number) => void;

  enableDrag?: boolean;
};

export class BaseCarousel {
  private scene: Scene;
  private root: GameObjects.Container;
  private slides: GameObjects.Container[] = [];

  private config: CarouselConfig;

  private currentIndex = 0;
  private isLocked = false;

  private startX = 0;
  private isDragging = false;
  private dragOffset = 0;
  private dragStartTime = 0;

  private initialIndex = 0;

  constructor(scene: Scene, x: number, y: number, config: CarouselConfig) {
    this.scene = scene;
    this.config = {
      tweenDuration: 300,
      tweenEase: 'Quad.Out',
      enableDrag: true,
      ...config,
    };

    if (config.initialIndex) this.initialIndex = config.initialIndex;

    this.root = this.scene.add.container(x, y);
    this.root.name = 'Carousel';

    if (this.config.enableDrag) {
      this.setSwipeHandlers();
    }
  }

  public get container(): GameObjects.Container {
    return this.root;
  }

  public get index(): number {
    return this.currentIndex;
  }

  public lock() {
    this.isLocked = true;
  }

  public unlock() {
    this.isLocked = false;
  }

  public setSlides(
    slides: GameObjects.Container[],
    initialIndex = 0,
    skipAnimation = true
  ) {
    this.slides.forEach((s) => s.destroy());
    this.slides = slides;

    this.slides.forEach((s) => this.root.add(s));
    this.currentIndex = Math.max(
      this.initialIndex,
      Math.min(initialIndex, this.slides.length - 1)
    );

    this.updateLayout(skipAnimation);
    this.config.onIndexChange?.(this.currentIndex);
  }

  public next() {
    if (this.isLocked || this.slides.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.updateLayout(false);
    this.config.onIndexChange?.(this.currentIndex);
  }

  public setActiveIndex(value: number, skipAnimation = false) {
    if (this.isLocked || this.slides.length === 0) return;
    this.currentIndex = value;
    this.updateLayout(skipAnimation);
    this.config.onIndexChange?.(value);
  }

  public previous() {
    if (this.isLocked || this.slides.length === 0) return;
    this.currentIndex =
      (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.updateLayout(false);
    this.config.onIndexChange?.(this.currentIndex);
  }

  private setSwipeHandlers() {
    this.scene.input.on('pointerdown', this.onPointerDown);
    this.scene.input.on('pointermove', this.onPointerMove);
    this.scene.input.on('pointerup', this.onPointerUp);
  }

  private onPointerDown = (pointer: Input.Pointer) => {
    if (this.isLocked) return;

    this.startX = pointer.x;
    this.isDragging = true;
    this.dragOffset = 0;
    this.dragStartTime = performance.now();
  };

  private onPointerMove = (pointer: Input.Pointer) => {
    if (this.isLocked || !this.isDragging) return;

    const deltaX = pointer.x - this.startX;
    this.dragOffset = deltaX;

    if (Math.abs(this.dragOffset) >= this.config.dragSwipeThreshold) {
      this.isDragging = false;
      if (this.dragOffset > 0) this.previous();
      else this.next();
      return;
    }

    const total = this.slides.length;
    this.slides.forEach((slide, i) => {
      let offset = (i - this.currentIndex + total) % total;
      if (offset > total / 2) offset -= total;

      const baseX = offset * this.config.slideWidth;
      slide.x = baseX + deltaX;
    });
  };

  private onPointerUp = (pointer: Input.Pointer) => {
    if (!this.isDragging) return;
    this.isDragging = false;

    const deltaX = pointer.x - this.startX;
    const elapsed = performance.now() - this.dragStartTime;

    const fastSwipe =
      Math.abs(deltaX) > this.config.fastSwipeDelta &&
      elapsed < this.config.fastSwipeTime;

    if (Math.abs(deltaX) > 60 || fastSwipe) {
      if (deltaX > 0) {
        this.currentIndex =
          (this.currentIndex - 1 + this.slides.length) % this.slides.length;
      } else {
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
      }
    }

    this.updateLayout(false);
    this.config.onIndexChange?.(this.currentIndex);
  };

  public updateLayout(skipAnimation: boolean) {
    const total = this.slides.length;
    const { tweenDuration, tweenEase, transform, slideWidth } = this.config;

    this.slides.forEach((slide, i) => {
      let offset = (i - this.currentIndex + total) % total;
      if (offset > total / 2) offset -= total;

      const isActive = offset === 0;
      const t = transform({ index: i, total, offset, isActive, slide });

      const targetX = t.x ?? offset * slideWidth;
      const targetY = t.y ?? 0;
      const targetScale = t.scale ?? 1;
      const targetAlpha = t.alpha ?? 1;

      if (t.bringToTop) slide.setToTop();

      if (skipAnimation) {
        slide.setPosition(targetX, targetY);
        slide.setScale(targetScale);
        slide.setAlpha(targetAlpha);
      } else {
        this.scene.tweens.add({
          targets: slide,
          x: targetX,
          y: targetY,
          alpha: targetAlpha,
          scale: targetScale,
          duration: tweenDuration,
          ease: tweenEase,
        });
      }
    });
  }
}
