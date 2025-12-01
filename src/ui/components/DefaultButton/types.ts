export type TDefaultStates = {
  default: 'normal';
  disabled: 'disabled';
  active: 'pressed';
  over: 'hover';
};

export type ValueOf<T> = T[keyof T];
