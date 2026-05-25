import { create } from 'zustand';
import { MEDICATIONS, MedKey } from '@/constants/medications';
import * as db from '@/lib/db';
import { Injection } from '@/lib/pk/engine';
import { requestNotificationPermissions, scheduleInjectionReminder, cancelInjectionReminder } from '@/lib/notifications';

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
    const isFirstLoad = !get().loaded;
    if (isFirstLoad) {
      await requestNotificationPermissions();
    }
    const rows = await db.getInjections();
    set({
      injections: rows.map((r) => ({ id: r.id, date: r.date, doseMg: r.dose_mg })).sort((a, b) => a.date - b.date),
      loaded: true,
    });
    if (isFirstLoad && rows.length > 0) {
      const latest = rows.reduce((a, b) => (a.date > b.date ? a : b));
      const nextDate = latest.date + 7 * 24 * 60 * 60 * 1000;
      scheduleInjectionReminder(nextDate);
    }
  },

  addInjection: async (doseMg, site, date) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const d = date ?? Date.now();
    await db.addInjection({ id, date: d, dose_mg: doseMg, site, notes: null });
    await get().loadInjections();
    const nextDate = d + 7 * 24 * 60 * 60 * 1000;
    scheduleInjectionReminder(nextDate);
  },

  removeInjection: async (id) => {
    await db.deleteInjection(id);
    await get().loadInjections();
    const { injections } = get();
    if (injections.length === 0) {
      cancelInjectionReminder();
    } else {
      const latest = injections[injections.length - 1];
      scheduleInjectionReminder(latest.date + 7 * 24 * 60 * 60 * 1000);
    }
  },
}));

export function currentMed() {
  return MEDICATIONS[useApp.getState().medication];
}
