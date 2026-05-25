import { create } from 'zustand';
import { getWeights, WeightRow } from '@/lib/db';

interface WeightState {
  weights: WeightRow[];
  loaded: boolean;
  loadWeights: () => Promise<void>;
}

export const useWeightStore = create<WeightState>((set, get) => ({
  weights: [],
  loaded: false,

  loadWeights: async () => {
    if (get().loaded) return;
    const rows = await getWeights();
    set({ weights: rows, loaded: true });
  },
}));
