export type Element =
  | 'Spectro'
  | 'Aero'
  | 'Glacio'
  | 'Fusion'
  | 'Electro'
  | 'Havoc'
  | '';

export type WeaponCategory = 'Broadblade' | 'Sword' | 'Pistol' | 'Gauntlet' | 'Rectifier';
export type WeaponType = WeaponCategory | '';

export interface Resonator {
  id: number;
  ver: string;
  name: string;
  element: Element;
  weaponType?: WeaponType;
}

export interface VersionGroup {
  label: string;
  standard?: boolean;
  entries: Resonator[];
}

export interface ResonatorState {
  res: boolean;
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
  | 'weapon-snapshot'
  | 'edit-upcoming'
  | 'release'
  | null;

export type SidebarTab = 'characters' | 'weapons' | 'priority' | 'leaderboard';
