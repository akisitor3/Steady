import { create } from 'zustand';

export interface HealthData {
  sleepHours: number;
  sleepMinutes: number;
  steps: number;
  calories: number;
  hrvValue: number;
  hrvStatus: 'ÓPTIMO' | 'BOM' | 'NORMAL' | 'BAIXO';
  bioScore: number;
  bioLabel: 'BOM' | 'ÓPT.' | 'REGULAR' | 'MAU';
  bioRingFill: number;
  lastUpdated: string;
  source: 'mock';
}

const MOCK_DATA: HealthData = {
  sleepHours: 7,
  sleepMinutes: 32,
  steps: 8420,
  calories: 1240,
  hrvValue: 42.5,
  hrvStatus: 'BAIXO',
  bioScore: 72,
  bioLabel: 'BOM',
  bioRingFill: 0.72,
  lastUpdated: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
  source: 'mock',
};

/*
 * WHOOP OAuth 2.0 — implementar quando backend disponível:
 * 1. Redirect para https://api.prod.whoop.com/oauth/oauth2/auth
 * 2. Exchange code em /oauth/oauth2/token
 * 3. GET https://api.prod.whoop.com/developer/v1/activity/sleep
 * 4. GET https://api.prod.whoop.com/developer/v1/metrics/heart_rate
 */
export async function getHealthData(): Promise<HealthData> {
  return MOCK_DATA;
}

interface HealthStore {
  data: HealthData | null;
  loaded: boolean;
  load: () => Promise<void>;
}

export const useHealthStore = create<HealthStore>((set) => ({
  data: null,
  loaded: false,

  load: async () => {
    const data = await getHealthData();
    set({ data, loaded: true });
  },
}));
