import { create } from 'zustand';
import * as db from '@/lib/db';

type MealSlot = 'breakfast' | 'lunch' | 'snack' | 'dinner';

type Meal = {
  id: string;
  slot: MealSlot;
  name: string;
  desc: string;
  kcal: number;
  prot: number;
  carbs: number;
  fat: number;
  byAi?: boolean;
};

interface FoodState {
  meals: Meal[];
  loaded: boolean;
  loadMeals: () => Promise<void>;
  saveMeal: (meal: Meal) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
}

function getDayStart(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
}

function rowToMeal(row: db.MealRow): Meal {
  return {
    id: row.id,
    slot: row.slot as MealSlot,
    name: row.name,
    desc: row.desc ?? '',
    kcal: row.kcal,
    prot: row.prot,
    carbs: row.carbs,
    fat: row.fat,
    byAi: row.by_ai === 1,
  };
}

export const useFoodStore = create<FoodState>((set) => ({
  meals: [],
  loaded: false,

  loadMeals: async () => {
    const dayStart = getDayStart();
    const rows = await db.getMealsForDay(dayStart);
    set({ meals: rows.map(rowToMeal), loaded: true });
  },

  saveMeal: async (meal: Meal) => {
    const dayStart = getDayStart();
    const row: db.MealRow = {
      id: meal.id,
      date: dayStart,
      slot: meal.slot,
      name: meal.name,
      desc: meal.desc || null,
      kcal: meal.kcal,
      prot: meal.prot,
      carbs: meal.carbs,
      fat: meal.fat,
      by_ai: meal.byAi ? 1 : 0,
    };
    await db.saveMeal(row);
    const rows = await db.getMealsForDay(dayStart);
    set({ meals: rows.map(rowToMeal) });
  },

  deleteMeal: async (id: string) => {
    await db.deleteMeal(id);
    const dayStart = getDayStart();
    const rows = await db.getMealsForDay(dayStart);
    set({ meals: rows.map(rowToMeal) });
  },
}));
