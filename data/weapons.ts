export interface Weapon {
  slug:    string;
  name:    string;
  owner:   string | null; // resonator name (null = standard)
}

export const SIG_WEAPONS: Weapon[] = [
  { slug: 'Verdant_Summit',          name: 'Verdant Summit',          owner: 'Jiyan'          },
  { slug: 'Ages_of_Harvest',         name: 'Ages of Harvest',         owner: 'Jinhsi'         },
  { slug: 'Wildfire_Mark',           name: 'Wildfire Mark',           owner: 'Lupa'           },
  { slug: 'Thunderflare_Dominion',   name: 'Thunderflare Dominion',   owner: 'Augusta'        },
  { slug: 'Kumokiri',                name: 'Kumokiri',                owner: 'Chisa'          },
  { slug: 'Starfield_Calibrator',    name: 'Starfield Calibrator',    owner: 'Mornye'         },
  { slug: 'Blazing_Brilliance',      name: 'Blazing Brilliance',      owner: 'Changli'        },
  { slug: 'Red_Spring',              name: 'Red Spring',              owner: 'Camellya'       },
  { slug: 'Unflickering_Valor',      name: 'Unflickering Valor',      owner: 'Brant'          },
  { slug: "Bloodpact's_Pledge",      name: "Bloodpact's Pledge",      owner: 'Rover (Aero)'   },
  { slug: "Defier's_Thorn",          name: "Defier's Thorn",          owner: 'Cartethyia'     },
  { slug: 'Emerald_Sentence',        name: 'Emerald Sentence',        owner: 'Qiuyuan'        },
  { slug: 'Everbright_Polestar',     name: 'Everbright Polestar',     owner: 'Aemeath'        },
  { slug: 'The_Last_Dance',          name: 'The Last Dance',          owner: 'Carlotta'       },
  { slug: 'Woodland_Aria',           name: 'Woodland Aria',           owner: 'Ciaccona'       },
  { slug: 'Lux_&_Umbra',            name: 'Lux & Umbra',            owner: 'Galbrena'       },
  { slug: 'Spectrum_Blaster',        name: 'Spectrum Blaster',        owner: 'Lynae'          },
  { slug: "Verity's_Handle",         name: "Verity's Handle",         owner: 'Xiangli_Yao'    },
  { slug: 'Tragicomedy',             name: 'Tragicomedy',             owner: 'Roccia'         },
  { slug: 'Blazing_Justice',         name: 'Blazing Justice',         owner: 'Zani'           },
  { slug: "Moongazer's_Sigil",       name: "Moongazer's Sigil",       owner: 'Iuno'           },
  { slug: "Daybreaker's_Spine",      name: "Daybreaker's Spine",      owner: 'Luuk_Herssen'   },
  { slug: 'Stringmaster',            name: 'Stringmaster',            owner: 'Yinlin'         },
  { slug: 'Rime-Draped_Sprouts',     name: 'Rime-Draped Sprouts',     owner: 'Zhezhi'         },
  { slug: 'Stellar_Symphony',        name: 'Stellar Symphony',        owner: 'Shorekeeper'    },
  { slug: 'Luminous_Hymn',           name: 'Luminous Hymn',           owner: 'Phoebe'         },
  { slug: 'Whispers_of_Sirens',      name: 'Whispers of Sirens',      owner: 'Cantarella'     },
  { slug: 'Lethean_Elegy',           name: 'Lethean Elegy',           owner: 'Phrolova'       },
];

export const STD_WEAPONS: Weapon[] = [
  { slug: 'Lustrous_Razor',      name: 'Lustrous Razor',      owner: null },
  { slug: 'Radiance_Cleaver',    name: 'Radiance Cleaver',    owner: null },
  { slug: 'Emerald_of_Genesis',  name: 'Emerald of Genesis',  owner: null },
  { slug: 'Laser_Shearer',       name: 'Laser Shearer',       owner: null },
  { slug: 'Static_Mist',         name: 'Static Mist',         owner: null },
  { slug: 'Phasic_Homogenizer',  name: 'Phasic Homogenizer',  owner: null },
  { slug: 'Abyss_Surges',        name: 'Abyss Surges',        owner: null },
  { slug: 'Pulsation_Bracer',    name: 'Pulsation Bracer',    owner: null },
  { slug: 'Cosmic_Ripples',      name: 'Cosmic Ripples',      owner: null },
  { slug: 'Boson_Astrolabe',     name: 'Boson Astrolabe',     owner: null },
];
