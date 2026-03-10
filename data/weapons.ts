export interface Weapon {
  file:  string;   // avif filename (no extension)
  name:  string;
  owner: string | null;
}

export const SIG_WEAPONS: Weapon[] = [
  { file: 'T_IconWeapon21010016_UI', name: 'Verdant Summit',        owner: 'Jiyan'         },
  { file: 'T_IconWeapon21010026_UI', name: 'Ages of Harvest',       owner: 'Jinhsi'        },
  { file: 'T_IconWeapon21010036_UI', name: 'Wildfire Mark',         owner: 'Lupa'          },
  { file: 'T_IconWeapon21010046_UI', name: 'Thunderflare Dominion', owner: 'Augusta'       },
  { file: 'T_IconWeapon21010056_UI', name: 'Kumokiri',              owner: 'Chisa'         },
  { file: 'T_IconWeapon21010066_UI', name: 'Starfield Calibrator',  owner: 'Mornye'        },
  { file: 'T_IconWeapon21020016_UI', name: 'Blazing Brilliance',    owner: 'Changli'       },
  { file: 'T_IconWeapon21020017_UI', name: 'Red Spring',            owner: 'Camellya'      },
  { file: 'T_IconWeapon21020025_UI', name: 'Unflickering Valor',    owner: 'Brant'         },
  { file: 'T_IconWeapon21020026_UI', name: "Bloodpact's Pledge",    owner: 'Rover (Aero)'  },
  { file: 'T_IconWeapon21020056_UI', name: "Defier's Thorn",        owner: 'Cartethyia'    },
  { file: 'T_IconWeapon21020066_UI', name: 'Emerald Sentence',      owner: 'Qiuyuan'       },
  { file: 'T_IconWeapon21020076_UI', name: 'Everbright Polestar',   owner: 'Aemeath'       },
  { file: 'T_IconWeapon21030017_UI', name: 'The Last Dance',        owner: 'Carlotta'      },
  { file: 'T_IconWeapon21030026_UI', name: 'Woodland Aria',         owner: 'Ciaccona'      },
  { file: 'T_IconWeapon21030036_UI', name: 'Lux & Umbra',          owner: 'Galbrena'      },
  { file: 'T_IconWeapon21030046_UI', name: 'Spectrum Blaster',      owner: 'Lynae'         },
  { file: 'T_IconWeapon21040016_UI', name: "Verity's Handle",       owner: 'Xiangli_Yao'   },
  { file: 'T_IconWeapon21040018_UI', name: 'Tragicomedy',           owner: 'Roccia'        },
  { file: 'T_IconWeapon21040019_UI', name: 'Blazing Justice',       owner: 'Zani'          },
  { file: 'T_IconWeapon21040046_UI', name: "Moongazer's Sigil",     owner: 'Iuno'          },
  { file: 'T_IconWeapon_21040056_UI', name: "Daybreaker's Spine",   owner: 'Luuk_Herssen'  },
  { file: 'T_IconWeapon21050016_UI', name: 'Stringmaster',          owner: 'Yinlin'        },
  { file: 'T_IconWeapon21050026_UI', name: 'Rime-Draped Sprouts',   owner: 'Zhezhi'        },
  { file: 'T_IconWeapon21050027_UI', name: 'Stellar Symphony',      owner: 'Shorekeeper'   },
  { file: 'T_IconWeapon21050029_UI', name: 'Luminous Hymn',         owner: 'Phoebe'        },
  { file: 'T_IconWeapon21050030_UI', name: 'Whispers of Sirens',    owner: 'Cantarella'    },
  { file: 'T_IconWeapon21050066_UI', name: 'Lethean Elegy',         owner: 'Phrolova'      },
];

export const STD_WEAPONS: Weapon[] = [
  { file: 'T_IconWeapon21010015_UI',  name: 'Lustrous Razor',     owner: null },
  { file: 'T_IconWeapon_21010045_UI', name: 'Radiance Cleaver',   owner: null },
  { file: 'T_IconWeapon21020015_UI',  name: 'Emerald of Genesis', owner: null },
  { file: 'T_IconWeapon_21020045_UI', name: 'Laser Shearer',      owner: null },
  { file: 'T_IconWeapon21030015_UI',  name: 'Static Mist',        owner: null },
  { file: 'T_IconWeapon_21030045_UI', name: 'Phasic Homogenizer', owner: null },
  { file: 'T_IconWeapon21040015_UI',  name: 'Abyss Surges',       owner: null },
  { file: 'T_IconWeapon_21040045_UI', name: 'Pulsation Bracer',   owner: null },
  { file: 'T_IconWeapon21050015_UI',  name: 'Cosmic Ripples',     owner: null },
  { file: 'T_IconWeapon_21050045_UI', name: 'Boson Astrolabe',    owner: null },
];
