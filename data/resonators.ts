import type { VersionGroup, Element, WeaponType, WeaponCategory } from '@/types';

export const HARDCODED: VersionGroup[] = [
  {
    label: 'Standard',
    standard: true,
    entries: [
      { id: 101, ver: '—', name: 'Verina',   element: 'Spectro', weaponType: 'Rectifier'  },
      { id: 102, ver: '—', name: 'Lingyang', element: 'Glacio',  weaponType: 'Gauntlet'   },
      { id: 103, ver: '—', name: 'Jianxin',  element: 'Aero',    weaponType: 'Gauntlet'   },
      { id: 104, ver: '—', name: 'Calcharo', element: 'Electro', weaponType: 'Broadblade' },
      { id: 105, ver: '—', name: 'Encore',   element: 'Fusion',  weaponType: 'Rectifier'  },
    ],
  },
  {
    label: 'Huanglong',
    entries: [
      { id: 1,  ver: '1.0', name: 'Jiyan',       element: 'Aero',    weaponType: 'Broadblade' },
      { id: 2,  ver: '1.0', name: 'Yinlin',      element: 'Electro', weaponType: 'Rectifier'  },
      { id: 3,  ver: '1.1', name: 'Jinhsi',      element: 'Spectro', weaponType: 'Broadblade' },
      { id: 4,  ver: '1.1', name: 'Changli',     element: 'Fusion',  weaponType: 'Sword'      },
      { id: 5,  ver: '1.2', name: 'Zhezhi',      element: 'Glacio',  weaponType: 'Rectifier'  },
      { id: 6,  ver: '1.2', name: 'Xiangli Yao', element: 'Electro', weaponType: 'Gauntlet'   },
      { id: 7,  ver: '1.3', name: 'Shorekeeper', element: 'Spectro', weaponType: 'Rectifier'  },
      { id: 8,  ver: '1.4', name: 'Camellya',    element: 'Havoc',   weaponType: 'Sword'      },
    ],
  },
  {
    label: 'Rinascita',
    entries: [
      { id: 9,  ver: '2.0', name: 'Carlotta',   element: 'Glacio',  weaponType: 'Pistol'     },
      { id: 10, ver: '2.0', name: 'Roccia',     element: 'Havoc',   weaponType: 'Gauntlet'   },
      { id: 11, ver: '2.1', name: 'Phoebe',     element: 'Spectro', weaponType: 'Rectifier'  },
      { id: 12, ver: '2.1', name: 'Brant',      element: 'Fusion',  weaponType: 'Sword'      },
      { id: 13, ver: '2.2', name: 'Cantarella', element: 'Havoc',   weaponType: 'Rectifier'  },
      { id: 14, ver: '2.3', name: 'Zani',       element: 'Spectro', weaponType: 'Gauntlet'   },
      { id: 15, ver: '2.3', name: 'Ciaccona',   element: 'Aero',    weaponType: 'Pistol'     },
      { id: 16, ver: '2.4', name: 'Cartethyia', element: 'Aero',    weaponType: 'Sword'      },
      { id: 17, ver: '2.4', name: 'Lupa',       element: 'Fusion',  weaponType: 'Broadblade' },
      { id: 18, ver: '2.5', name: 'Phrolova',   element: 'Havoc',   weaponType: 'Rectifier'  },
      { id: 19, ver: '2.6', name: 'Augusta',    element: 'Electro', weaponType: 'Broadblade' },
      { id: 20, ver: '2.6', name: 'Iuno',       element: 'Aero',    weaponType: 'Gauntlet'   },
      { id: 21, ver: '2.7', name: 'Galbrena',   element: 'Fusion',  weaponType: 'Pistol'     },
      { id: 22, ver: '2.7', name: 'Qiuyuan',    element: 'Aero',    weaponType: 'Sword'      },
      { id: 23, ver: '2.8', name: 'Chisa',      element: 'Havoc',   weaponType: 'Broadblade' },
    ],
  },
  {
    label: 'Lahai-Roi',
    entries: [
      { id: 24, ver: '3.0', name: 'Lynae',        element: 'Spectro', weaponType: 'Pistol'     },
      { id: 25, ver: '3.0', name: 'Mornye',       element: 'Fusion',  weaponType: 'Broadblade' },
      { id: 26, ver: '3.1', name: 'Aemeath',      element: 'Fusion',  weaponType: 'Sword'      },
      { id: 27, ver: '3.1', name: 'Luuk Herssen', element: 'Spectro', weaponType: 'Gauntlet'   },
      { id: 28, ver: '3.1', name: 'Sigrika',      element: 'Aero',    weaponType: 'Sword'      },
    ],
  },
];

export const EL_COLORS: Record<string, string> = {
  Spectro: '#fde68a',
  Aero:    '#5eead4',
  Glacio:  '#67e8f9',
  Fusion:  '#fb923c',
  Electro: '#c084fc',
  Havoc:   '#f472b6',
};

export const EL_ORDER: Element[] = [
  'Spectro', 'Aero', 'Glacio', 'Fusion', 'Electro', 'Havoc',
];

import type { WeaponType, WeaponCategory } from '@/types';

export const WEP_ORDER: WeaponCategory[] = [
  'Broadblade', 'Sword', 'Pistol', 'Gauntlet', 'Rectifier',
];

export const WEP_ICONS: Record<string, string> = {
  Broadblade: 'icons/SP_broadblade.webp',
  Sword:      'icons/SP_sword.webp',
  Pistol:     'icons/SP_pistol.webp',
  Gauntlet:   'icons/SP_gauntlet.webp',
  Rectifier:  'icons/SP_rectifier.webp',
};
