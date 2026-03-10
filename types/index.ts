export type Element =
  | 'Spectro'
  | 'Aero'
  | 'Glacio'
  | 'Fusion'
  | 'Electro'
  | 'Havoc'
  | '';

export interface Resonator {
  id: number;
  ver: string;
  name: string;
  element: Element;
}

export interface VersionGroup {
  label: string;
  standard?: boolean;
  entries: Resonator[];
}

export interface ResonatorState {
  res: boolean;
  sig: boolean;
  seq: number; // 0–6
  wep: number; // 0–5
}

export interface UpcomingEntry {
  uid: number;
  name: string;
  element: string;
}

export type SnapView = 'gallery' | 'regions';

export type ModalType =
  | 'export'
  | 'import'
  | 'snapshot'
  | 'edit-upcoming'
  | 'release'
  | null;
