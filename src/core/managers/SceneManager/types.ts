import type {
  BootScene,
  PreloadScene,
  Shooting,
  StartScene,
  UIScene,
} from '@/scenes';
import type { Minos } from '@/scenes/minos/Minos';

export type TSceneKey =
  | 'PreloadScene'
  | 'StartScene'
  | 'UIScene'
  | 'ShootingScene'
  | 'BootScene'
  | 'Minos';

export interface ISceneMap {
  PreloadScene: PreloadScene;
  StartScene: StartScene;
  UIScene: UIScene;
  ShootingScene: Shooting;
  BootScene: BootScene;
  Minos: Minos;
}
