import { create } from 'zustand';

export type Gender = 'female' | 'male' | 'other';
export type Activity = 'none' | 'light' | 'moderate' | 'high';

export type Meal = {
  id: string;
  name: string;
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
  score: number;
  time: string;
};

export type HatId = 'none' | 'antlers' | 'viking';
export type BackgroundId = 'home' | 'garden' | 'beach';

type State = {
  // profile
  petName: string;
  gender: Gender | null;
  birthYear: number;
  height: number;
  weight: number;
  activity: Activity | null;
  targetWeight: number;
  pace: number; // kg / week
  diet: string | null;
  mealsPerDay: number;
  eatingContext: string[];
  allergies: string[];
  habitChanges: string[];

  // daily tracking
  dailyGoal: number;
  meals: Meal[];
  waterGlasses: number;
  streak: number;
  coins: number;
  firstMealRewarded: boolean;

  // pet customisation
  ownedHats: HatId[];
  hat: HatId;
  background: BackgroundId;

  set: (patch: Partial<State>) => void;
  toggleIn: (key: 'eatingContext' | 'allergies' | 'habitChanges', value: string) => void;
  logMeal: (meal: Meal) => void;
  addWater: () => void;
  completeFirstMealReward: () => void;
  buyHat: (hat: HatId, price: number) => boolean;
  reset: () => void;
};

const initial = {
  petName: '',
  gender: null,
  birthYear: 1998,
  height: 160,
  weight: 52,
  activity: null,
  targetWeight: 48,
  pace: 0.5,
  diet: null,
  mealsPerDay: 3,
  // multi-select answers start empty — nothing is pre-selected
  eatingContext: [] as string[],
  allergies: [] as string[],
  habitChanges: [] as string[],
  dailyGoal: 2925,
  meals: [] as Meal[],
  waterGlasses: 0,
  streak: 0,
  coins: 179,
  firstMealRewarded: false,
  ownedHats: ['none', 'antlers'] as HatId[],
  hat: 'none' as HatId,
  background: 'home' as BackgroundId,
} satisfies Partial<State>;

export const useApp = create<State>((set, get) => ({
  ...initial,
  set: (patch) => set(patch),
  toggleIn: (key, value) => {
    const list = get()[key];
    set({ [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] } as Partial<State>);
  },
  logMeal: (meal) => set((s) => ({ meals: [...s.meals, meal] })),
  addWater: () => set((s) => ({ waterGlasses: Math.min(10, s.waterGlasses + 1) })),
  completeFirstMealReward: () =>
    set((s) => (s.firstMealRewarded ? {} : { firstMealRewarded: true, coins: s.coins + 3, streak: s.streak + 1 })),
  buyHat: (hat, price) => {
    const s = get();
    if (s.coins < price) return false;
    set({ coins: s.coins - price, ownedHats: [...s.ownedHats, hat], hat });
    return true;
  },
  reset: () => set({ ...initial }),
}));

/** Demo meal recognised by the "AI scan" — matches the Figma content. */
export const scannedMeal = {
  name: 'Grilled chicken & salad',
  ingredients: [
    { name: 'Grilled chicken breast', grams: 200, kcal: 222 },
    { name: 'Corn', grams: 100, kcal: 144 },
    { name: 'Cherry tomatoes', grams: 100, kcal: 18 },
    { name: 'Parsley', grams: 10, kcal: 5 },
  ],
  kcal: 389,
  carbs: 40,
  protein: 98,
  fat: 22,
  score: 98,
};

/** Totals shown on "Home after log" in Figma (includes earlier meals today). */
export const BASE_DAY = { kcal: 1350, carbs: 160, protein: 150, fat: -10 };

export function useTotals() {
  const meals = useApp((s) => s.meals);
  if (meals.length === 0) return { kcal: 0, carbs: 0, protein: 0, fat: 0 };
  const sum = meals.reduce(
    (a, m) => ({ kcal: a.kcal + m.kcal, carbs: a.carbs + m.carbs, protein: a.protein + m.protein, fat: a.fat + m.fat }),
    { kcal: 0, carbs: 0, protein: 0, fat: 0 },
  );
  return {
    kcal: sum.kcal + BASE_DAY.kcal,
    carbs: sum.carbs + BASE_DAY.carbs,
    protein: sum.protein + BASE_DAY.protein,
    fat: Math.max(0, sum.fat + BASE_DAY.fat),
  };
}
