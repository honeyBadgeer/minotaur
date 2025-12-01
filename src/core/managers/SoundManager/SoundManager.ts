import { CoreEvents } from '@/core/events';
import { Howl } from 'howler';
import type { Events } from 'phaser';

export interface SoundConfig {
  src: string;
  preload?: boolean;
  volume?: number;
  loop?: boolean;
  rate?: number;
  stereo?: number;
}

export interface SoundsConfig {
  [key: string]: SoundConfig;
}

export type SoundKey = string | symbol;

export type SoundEventListener = (key: SoundKey) => void;

export class SoundManager {
  private static sounds: Map<SoundKey, Howl> = new Map();
  private static isMuted: boolean = false;
  private static defaultVolume: number = 1.0;
  private static loadedCount: number = 0;
  private static totalCount: number = 0;
  private static isLoaded: boolean = false;

  static init(
    soundsConfig: Record<SoundKey, SoundConfig>,
    defaultVolume: number = 1.0,
    eventBus: Events.EventEmitter
  ): void {
    this.totalCount = Object.entries(soundsConfig).length;
    this.defaultVolume = defaultVolume;

    const savedMuted = localStorage.getItem('game_sound_muted');
    if (savedMuted !== null) {
      this.isMuted = JSON.parse(savedMuted);
    }

    this.sounds.clear();

    Object.entries(soundsConfig).forEach(([key, config]) => {
      const howl = new Howl({
        ...config,
        preload: true,
        onload: () => {
          SoundManager.loadedCount++;
          if (
            SoundManager.loadedCount === SoundManager.totalCount &&
            !SoundManager.isLoaded
          ) {
            SoundManager.isLoaded = true;
            SoundManager.updateVolume();
            eventBus.emit(CoreEvents.Loaded, 'sounds');
            console.log('%cВсе звуки загружены', 'color: green');
          }
        },
      });
      this.sounds.set(key, howl);
    });
  }

  static play(key: SoundKey, loop?: boolean, volume?: number) {
    const sound = this.sounds.get(key);

    if (!sound) throw new Error(`Звук с ключем ${key.toString()} не найден`);

    if (loop) sound.loop(true);
    else sound.loop(false);

    const mustBeMuted = this.isMuted;
    sound.play();
    if (volume) sound.volume(mustBeMuted ? 0 : volume);
  }

  static stop(key: SoundKey) {
    const sound = this.sounds.get(key);

    if (!sound) throw new Error(`Звук с ключем ${key.toString()} не найден`);

    sound.stop();
  }

  static stopAll() {
    this.sounds.forEach((sound) => sound.stop());
  }

  static setMuted(muted?: boolean) {
    this.isMuted = muted !== undefined ? muted : !this.isMuted;

    localStorage.setItem('game_sound_muted', JSON.stringify(this.isMuted));

    this.updateVolume();

    return this.isMuted;
  }

  static updateVolume(value?: number) {
    const mustBeMuted = this.isMuted;

    const volume = mustBeMuted ? 0 : (value ?? this.defaultVolume);

    this.sounds.forEach((sound) => {
      sound.volume(volume);
    });
  }

  static isSoundMuted(): boolean {
    return this.isMuted;
  }

  static forceMute() {
    this.updateVolume(0);
  }

  static restoreUserSettings() {
    const savedMuted = localStorage.getItem('game_sound_muted');
    if (savedMuted !== null) {
      this.isMuted = JSON.parse(savedMuted);
    }
    this.updateVolume();
  }

  static destroy() {
    this.sounds.forEach((sound) => sound.unload());
    this.sounds.clear();
    this.isMuted = false;
    this.defaultVolume = 1.0;
    this.loadedCount = 0;
    this.totalCount = 0;
    this.isLoaded = false;
  }
}
