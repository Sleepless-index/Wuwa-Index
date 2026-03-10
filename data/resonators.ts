import type { VersionGroup, Element } from '@/types';

export const HARDCODED: VersionGroup[] = [
  {
    label: 'Standard',
    standard: true,
    entries: [
      { id: 101, ver: '—', name: 'Verina',   element: 'Spectro' },
      { id: 102, ver: '—', name: 'Lingyang', element: 'Glacio'  },
      { id: 103, ver: '—', name: 'Jianxin',  element: 'Aero'    },
      { id: 104, ver: '—', name: 'Calcharo', element: 'Electro' },
      { id: 105, ver: '—', name: 'Encore',   element: 'Fusion'  },
    ],
  },
  {
    label: 'Huanglong',
    entries: [
      { id: 1,  ver: '1.0', name: 'Jiyan',       element: 'Aero'    },
      { id: 2,  ver: '1.0', name: 'Yinlin',      element: 'Electro' },
      { id: 3,  ver: '1.1', name: 'Jinhsi',      element: 'Spectro' },
      { id: 4,  ver: '1.1', name: 'Changli',     element: 'Fusion'  },
      { id: 5,  ver: '1.2', name: 'Zhezhi',      element: 'Glacio'  },
      { id: 6,  ver: '1.2', name: 'Xiangli Yao', element: 'Electro' },
      { id: 7,  ver: '1.3', name: 'Shorekeeper', element: 'Spectro' },
      { id: 8,  ver: '1.4', name: 'Camellya',    element: 'Havoc'   },
    ],
  },
  {
    label: 'Rinascita',
    entries: [
      { id: 9,  ver: '2.0', name: 'Carlotta',   element: 'Glacio'  },
      { id: 10, ver: '2.0', name: 'Roccia',     element: 'Havoc'   },
      { id: 11, ver: '2.1', name: 'Phoebe',     element: 'Spectro' },
      { id: 12, ver: '2.1', name: 'Brant',      element: 'Fusion'  },
      { id: 13, ver: '2.2', name: 'Cantarella', element: 'Havoc'   },
      { id: 14, ver: '2.3', name: 'Zani',       element: 'Spectro' },
      { id: 15, ver: '2.3', name: 'Ciaccona',   element: 'Aero'    },
      { id: 16, ver: '2.4', name: 'Cartethyia', element: 'Aero'    },
      { id: 17, ver: '2.4', name: 'Lupa',       element: 'Fusion'  },
      { id: 18, ver: '2.5', name: 'Phrolova',   element: 'Havoc'   },
      { id: 19, ver: '2.6', name: 'Augusta',    element: 'Electro' },
      { id: 20, ver: '2.6', name: 'Iuno',       element: 'Aero'    },
      { id: 21, ver: '2.7', name: 'Galbrena',   element: 'Fusion'  },
      { id: 22, ver: '2.7', name: 'Qiuyuan',    element: 'Aero'    },
      { id: 23, ver: '2.8', name: 'Chisa',      element: 'Havoc'   },
    ],
  },
  {
    label: 'Lahai-Roi',
    entries: [
      { id: 24, ver: '3.0', name: 'Lynae',        element: 'Spectro' },
      { id: 25, ver: '3.0', name: 'Mornye',       element: 'Fusion'  },
      { id: 26, ver: '3.1', name: 'Aemeath',      element: 'Fusion'  },
      { id: 27, ver: '3.1', name: 'Luuk Herssen', element: 'Spectro' },
      { id: 28, ver: '3.1', name: 'Sigrika',      element: 'Aero'    },
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
