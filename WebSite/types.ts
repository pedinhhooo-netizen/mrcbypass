export interface State {
  aimHead: boolean;
  aimLegit: boolean;
  aimScope: boolean;
  precision: boolean;
  pixelEstendido: boolean;
  noRecoil: boolean;
  chams: boolean;
  loaded: boolean;
}

export interface StatusResponse {
  success: boolean;
  state: State;
}

export interface CommandResponse {
  success: boolean;
  command: string;
}

export interface ToggleResponse {
  success: boolean;
  feature: keyof State;
  state: boolean;
}

export type Feature = keyof Omit<State, "loaded">;

export interface FeatureConfig {
  id: Feature;
  label: string;
  icon: React.ReactNode;
}
