import type { WeaponCategory } from '@/types';
export type { WeaponCategory };
export interface Weapon {
  file:     string;
  name:     string;
  owner:    string | null;
  category: WeaponCategory;
}

export const SIG_WEAPONS: Weapon[] = [
  { file: 'T_IconWeapon21010016_UI', name: 'Verdant Summit',        category: 'Broadblade',        owner: 'Jiyan'         },
  { file: 'T_IconWeapon21010026_UI', name: 'Ages of Harvest',       category: 'Broadblade',       owner: 'Jinhsi'        },
  { file: 'T_IconWeapon21010036_UI', name: 'Wildfire Mark',         category: 'Broadblade',         owner: 'Lupa'          },
  { file: 'T_IconWeapon21010046_UI', name: 'Thunderflare Dominion', category: 'Broadblade', owner: 'Augusta'       },
  { file: 'T_IconWeapon21010056_UI', name: 'Kumokiri',              category: 'Broadblade',              owner: 'Chisa'         },
  { file: 'T_IconWeapon21010066_UI', name: 'Starfield Calibrator',  category: 'Broadblade',  owner: 'Mornye'        },
  { file: 'T_IconWeapon21020016_UI', name: 'Blazing Brilliance',    category: 'Sword',    owner: 'Changli'       },
  { file: 'T_IconWeapon21020017_UI', name: 'Red Spring',            category: 'Sword',            owner: 'Camellya'      },
  { file: 'T_IconWeapon21020025_UI', name: 'Unflickering Valor',    category: 'Sword',    owner: 'Brant'         },
  { file: 'T_IconWeapon21020026_UI', name: "Bloodpact's Pledge",    category: 'Sword',    owner: 'Rover (Aero)'  },
  { file: 'T_IconWeapon21020056_UI', name: "Defier's Thorn",        category: 'Sword',        owner: 'Cartethyia'    },
  { file: 'T_IconWeapon21020066_UI', name: 'Emerald Sentence',      category: 'Sword',      owner: 'Qiuyuan'       },
  { file: 'T_IconWeapon21020076_UI', name: 'Everbright Polestar',   category: 'Sword',   owner: 'Aemeath'       },
  { file: 'T_IconWeapon21030017_UI', name: 'The Last Dance',        category: 'Pistol',        owner: 'Carlotta'      },
  { file: 'T_IconWeapon21030026_UI', name: 'Woodland Aria',         category: 'Pistol',         owner: 'Ciaccona'      },
  { file: 'T_IconWeapon21030036_UI', name: 'Lux & Umbra',          category: 'Pistol',          owner: 'Galbrena'      },
  { file: 'T_IconWeapon21030046_UI', name: 'Spectrum Blaster',      category: 'Pistol',      owner: 'Lynae'         },
  { file: 'T_IconWeapon21040016_UI', name: "Verity's Handle",       category: 'Gauntlet',       owner: 'Xiangli_Yao'   },
  { file: 'T_IconWeapon21040018_UI', name: 'Tragicomedy',           category: 'Gauntlet',           owner: 'Roccia'        },
  { file: 'T_IconWeapon21040019_UI', name: 'Blazing Justice',       category: 'Gauntlet',       owner: 'Zani'          },
  { file: 'T_IconWeapon21040046_UI', name: "Moongazer's Sigil",     category: 'Gauntlet',     owner: 'Iuno'          },
  { file: 'T_IconWeapon_21040056_UI', name: "Daybreaker's Spine",   category: 'Gauntlet',   owner: 'Luuk_Herssen'  },
  { file: 'T_IconWeapon21050016_UI', name: 'Stringmaster',          category: 'Rectifier',          owner: 'Yinlin'        },
  { file: 'T_IconWeapon21050026_UI', name: 'Rime-Draped Sprouts',   category: 'Rectifier',   owner: 'Zhezhi'        },
  { file: 'T_IconWeapon21050027_UI', name: 'Stellar Symphony',      category: 'Rectifier',      owner: 'Shorekeeper'   },
  { file: 'T_IconWeapon21050029_UI', name: 'Luminous Hymn',         category: 'Rectifier',         owner: 'Phoebe'        },
  { file: 'T_IconWeapon21050030_UI', name: 'Whispers of Sirens',    category: 'Rectifier',    owner: 'Cantarella'    },
  { file: 'T_IconWeapon21050066_UI', name: 'Lethean Elegy',         category: 'Rectifier',         owner: 'Phrolova'      },
];

export const STD_WEAPONS: Weapon[] = [
  { file: 'T_IconWeapon21010015_UI',  name: 'Lustrous Razor',     category: 'Broadblade',     owner: null },
  { file: 'T_IconWeapon_21010045_UI', name: 'Radiance Cleaver',   category: 'Broadblade',   owner: null },
  { file: 'T_IconWeapon21020015_UI',  name: 'Emerald of Genesis', category: 'Sword', owner: null },
  { file: 'T_IconWeapon_21020045_UI', name: 'Laser Shearer',       category: 'Sword',      owner: null },
  { file: 'T_IconWeapon21030015_UI',  name: 'Static Mist',         category: 'Pistol',        owner: null },
  { file: 'T_IconWeapon_21030045_UI', name: 'Phasic Homogenizer',  category: 'Pistol', owner: null },
  { file: 'T_IconWeapon21040015_UI',  name: 'Abyss Surges',        category: 'Gauntlet',       owner: null },
  { file: 'T_IconWeapon_21040045_UI', name: 'Pulsation Bracer',    category: 'Gauntlet',   owner: null },
  { file: 'T_IconWeapon21050015_UI',  name: 'Cosmic Ripples',      category: 'Rectifier',     owner: null },
  { file: 'T_IconWeapon_21050045_UI', name: 'Boson Astrolabe',     category: 'Rectifier',    owner: null },
];
