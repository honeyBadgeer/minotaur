import { BetEvents, GameEvents } from '@core/events';

import type {
  IBundle,
  IControlBarButtons,
  TControlBarButtons,
} from '@/types/types';

const CONTROL_BAR_BUTTONS_CONFIG: TControlBarButtons[] = [
  {
    key: 'crosshair',
    value: 'sightMode',
    x: -472,
    y: 33,
    flipY: false,
    label: 'controlBar.sight',
    event: { name: GameEvents.SetSightMode },
  },
  {
    key: 'double',
    value: 'doubleFireMode',
    x: -352,
    y: 33,
    flipY: true,
    label: 'X2',
    event: { name: GameEvents.SetDoubleFireMode },
  },
  {
    key: 'auto',
    value: 'autoMode',
    x: -232,
    y: 33,
    flipY: false,
    label: 'авто',
    event: { name: GameEvents.SetAutoMode },
  },
  {
    key: 'bundle-1',
    value: 'ufo',
    x: 232,
    y: 33,
    flipY: false,
    label: 'X 30',
    event: { name: GameEvents.SetBundleMode, value: 'ufo' as IBundle },
  },
  {
    key: 'bundle-2',
    value: 'grenade',
    x: 352,
    y: 33,
    flipY: true,
    label: 'X 60',
    event: { name: GameEvents.SetBundleMode, value: 'grenade' as IBundle },
  },
  {
    key: 'bundle-3',
    value: 'laser',
    x: 472,
    y: 33,
    flipY: false,
    label: 'X 100',
    event: { name: GameEvents.SetBundleMode, value: 'laser' as IBundle },
  },
];

const ADJUSTMENT_BUTTONS_CONFIG = [
  {
    key: 'minus',
    x: -102,
    y: 35,
    event: { name: BetEvents.Decrease },
  },
  {
    key: 'plus',
    x: 102,
    y: 35,
    event: { name: BetEvents.Increase },
  },
];

const BUTTON_BG_STATES = {
  normal: 'bottom',
  hover: 'bottom-hover',
  disabled: 'bottom-activated',
  pressed: 'bottom-activated',
};
const BET_BUTTON_BG_STATES = {
  normal: 'bet-normal',
  hover: 'bet-hover',
  disabled: 'bet-disabled',
  pressed: 'bet-pressed',
};

const modeButtonStates: Record<IControlBarButtons | '', IControlBarButtons[]> =
  {
    sightMode: ['ufo', 'laser', 'autoMode', 'grenade'],
    doubleFireMode: ['autoMode', 'ufo', 'laser', 'grenade'],
    autoMode: ['ufo', 'laser', 'sightMode', 'grenade', 'doubleFireMode'],
    laser: ['grenade', 'ufo', 'sightMode', 'doubleFireMode', 'autoMode'],
    grenade: ['ufo', 'laser', 'sightMode', 'doubleFireMode', 'autoMode'],
    ufo: ['grenade', 'laser', 'sightMode', 'doubleFireMode', 'autoMode'],
    '': ['grenade', 'laser', 'sightMode', 'doubleFireMode', 'autoMode', 'ufo'],
  };

export {
  ADJUSTMENT_BUTTONS_CONFIG,
  BET_BUTTON_BG_STATES,
  BUTTON_BG_STATES,
  CONTROL_BAR_BUTTONS_CONFIG,
  modeButtonStates,
};
