import { create } from 'zustand';
import { getWeights, WeightRow } from '@/lib/db';

interface WeightState {
  weights: WeightRow[];
  loaded: boolean;
  loadWeights: () => Promise<void>;
}

export const useWeightStore = create<WeightState>((set) => ({
  weights: [],
  loaded: false,

  loadWeights: async () => {
    const rows = await getWeights();
    set({ weights: rows, loaded: true });
  },
}));
