export enum CoreEvents {
  SetGameState = 'setgameState',
  Loaded = 'loaded',
  ExitGame = 'exitGame',
  AppError = 'appError',
}

export enum SceneEvents {
  RunPreloadScene = 'runPreloadScene',
  CreatePreloadScene = 'createPreloadScene',
  RunStartScene = 'runStartScene',
  CreateShootingScene = 'createShootingScene',
}

export enum GameEvents {
  SHOOT = 'shoot',
  POINTER_DOWN = 'pointerDown',
  POINTER_MOVE = 'pointerMove',
  UPDATE_POINTER_IMAGE = 'updatePointerImage',
  UPDATE_CURSOR = 'updateCursor',
  SetAutoMode = 'setAutoMode',
  SetSightMode = 'setSightMode',
  SetDoubleFireMode = 'setDoubleFireMode',
  SetBundleMode = 'setBundleMode',
  SetCharacter = 'setCharacter',
  AutoModeEnemiesGroup = 'autoModeEnemiesGroup',
  BundleAnimComplete = 'bundleAnimComplete',
  ModeChanged = 'modeChanged',
  BulletsUpdated = 'bulletsUpdated',
  SetOffShoot = 'setOffShoot',
}

export enum DialogEvents {
  ShowOnboarding = 'showOnboarding',
  Opened = 'dialogOpened',
  Closed = 'dialogClosed',
}

export enum BetEvents {
  BetChanged = 'betChanged',
  Increase = 'increaseBet',
  Decrease = 'decreaseBet',
}
