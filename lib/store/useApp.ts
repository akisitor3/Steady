import { create } from 'zustand';
import { MEDICATIONS, MedKey } from '@/constants/medications';
import * as db from '@/lib/db';
import { Injection } from '@/lib/pk/engine';

interface AppState {
  medication: MedKey;
  injections: Injection[];
  loaded: boolean;

  setMedication: (m: MedKey) => void;
  loadInjections: () => Promise<void>;
  addInjection: (doseMg: number, site: string, date?: number) => Promise<void>;
  removeInjection: (id: string) => Promise<void>;
}

export const useApp = create<AppState>((set, get) => ({
  medication: 'tirzepatide',
  injections: [],
  loaded: false,

  setMedication: (m) => set({ medication: m }),

  loadInjections: async () => {
    const rows = await db.getInjections();
    set({
      injections: rows.map((r) => ({ id: r.id, date: r.date, doseMg: r.dose_mg })),
      loaded: true,
    });
  },

  addInjection: async (doseMg, site, date) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const d = date ?? Date.now();
    await db.addInjection({ id, date: d, dose_mg: doseMg, site, notes: null });
    await get().loadInjections();
  },

  removeInjection: async (id) => {
    await db.deleteInjection(id);
    await get().loadInjections();
  },
}));

export function currentMed() {
  return MEDICATIONS[useApp.getState().medication];
}
