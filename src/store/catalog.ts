import { img } from '@/theme/assets';

export type BackgroundId =
  'home' | 'halloween' | 'christmas' | 'tet' | 'valentine' | 'music' | 'beach' | 'school' | 'heaven';

export type BackgroundItem = {
  id: BackgroundId;
  name: string;
  price: number;
  image: number;
  /** colour of the stage floor at the bottom of the art — fills the scene below the image */
  floor: string;
};

/**
 * Pet-shop backgrounds (store → Background tab, Figma 5011:18353 / 5375:7594).
 * "home" is the default scene and is owned from the start; every other one is
 * bought with coins, exactly like the hats.
 */
export const BACKGROUNDS: BackgroundItem[] = [
  { id: 'home', name: 'Lantern Garden', price: 0, image: img.thumbHome, floor: '#305C73' },
  { id: 'halloween', name: 'Haloween', price: 82, image: img.bgHalloween, floor: '#352043' },
  { id: 'christmas', name: 'Snowy Christmas', price: 90, image: img.bgChristmas, floor: '#A03F36' },
  { id: 'tet', name: 'Tết Holiday', price: 100, image: img.bgTet, floor: '#9C1F25' },
  { id: 'valentine', name: 'Valentine', price: 70, image: img.bgValentine, floor: '#B2285D' },
  { id: 'music', name: 'Music Festival', price: 85, image: img.bgMusic, floor: '#592B95' },
  { id: 'beach', name: 'Beach Day', price: 60, image: img.bgBeach, floor: '#C45F2B' },
  { id: 'school', name: 'School Yard', price: 50, image: img.bgSchool, floor: '#CC583D' },
  { id: 'heaven', name: 'Heaven Clouds', price: 120, image: img.bgHeaven, floor: '#F8B781' },
];

export const getBackground = (id: BackgroundId) => BACKGROUNDS.find((b) => b.id === id) ?? BACKGROUNDS[0];

export type HatId =
  | 'none'
  | 'antlers'
  | 'viking'
  | 'cap'
  | 'santa'
  | 'grad'
  | 'witch'
  | 'helmet'
  | 'cowboy'
  | 'beach'
  | 'melon'
  | 'nonla'
  | 'crown';

export type HatItem = {
  id: HatId;
  name: string;
  price: number;
  /** shop thumbnail (also the worn image unless `wornImage` is set) */
  image?: number;
  wornImage?: number;
  /** placement on Redy, in the 280×280 "Character stand" artwork */
  worn?: { left: number; top: number; width: number; height: number };
};

/**
 * Pet-shop hats (store → Hat tab, Figma 5011:19214). "none" and "antlers" are
 * owned from the start; the rest are bought with coins and then equipped.
 */
export const HATS: HatItem[] = [
  { id: 'none', name: 'No hat', price: 0 },
  {
    id: 'antlers',
    name: 'Antlers',
    price: 0,
    image: img.hatAntlers,
    worn: { left: 76, top: -22, width: 128, height: 88 },
  },
  {
    id: 'viking',
    name: 'Viking Hat',
    price: 82,
    image: img.hatViking,
    wornImage: img.hatVikingWorn,
    worn: { left: 78, top: -15, width: 129, height: 90 },
  },
  { id: 'cap', name: 'Hip-hop Cap', price: 60, image: img.hatCap, worn: { left: 77, top: -8, width: 136, height: 92 } },
  {
    id: 'santa',
    name: 'Santa Hat',
    price: 75,
    image: img.hatSanta,
    worn: { left: 73, top: -13, width: 138, height: 93 },
  },
  {
    id: 'grad',
    name: 'Graduation Cap',
    price: 90,
    image: img.hatGrad,
    worn: { left: 72, top: -19, width: 140, height: 93 },
  },
  {
    id: 'witch',
    name: 'Witch Hat',
    price: 80,
    image: img.hatWitch,
    worn: { left: 72, top: -27, width: 140, height: 109 },
  },
  {
    id: 'helmet',
    name: 'Helmet',
    price: 70,
    image: img.hatHelmet,
    worn: { left: 78, top: -26, width: 128, height: 114 },
  },
  {
    id: 'cowboy',
    name: 'Cowboy Hat',
    price: 85,
    image: img.hatCowboy,
    worn: { left: 54, top: -15, width: 175, height: 97 },
  },
  {
    id: 'beach',
    name: 'Beach Hat',
    price: 65,
    image: img.hatBeach,
    worn: { left: 60, top: -10, width: 165, height: 94 },
  },
  {
    id: 'melon',
    name: 'Watermelon Hat',
    price: 55,
    image: img.hatMelon,
    worn: { left: 71, top: -15, width: 142, height: 105 },
  },
  {
    id: 'nonla',
    name: 'Nón Lá',
    price: 50,
    image: img.hatNonla,
    worn: { left: 52, top: -40, width: 180, height: 122 },
  },
  {
    id: 'crown',
    name: 'Heaven Crown',
    price: 150,
    image: img.hatCrown,
    worn: { left: 94, top: -1, width: 96, height: 73 },
  },
];

export const getHat = (id: HatId) => HATS.find((h) => h.id === id) ?? HATS[0];
