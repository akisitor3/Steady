// Dados farmacocinéticos de fontes públicas (FDA, StatPearls).
// Educativo — não é aconselhamento médico.

export type MedKey = 'tirzepatide' | 'semaglutide';

export interface Medication {
  key: MedKey;
  brand: string;        // marca mais conhecida
  generic: string;
  halfLifeDays: number; // semivida de eliminação
  accumRatio: number;   // rácio de acumulação ao steady state (FDA)
  doses: number[];      // doses de titulação em mg
}

export const MEDICATIONS: Record<MedKey, Medication> = {
  tirzepatide: {
    key: 'tirzepatide',
    brand: 'Mounjaro',
    generic: 'Tirzepatida',
    halfLifeDays: 5,    // ~5 dias (FDA)
    accumRatio: 1.6,    // dossier FDA
    doses: [2.5, 5, 7.5, 10, 12.5, 15],
  },
  semaglutide: {
    key: 'semaglutide',
    brand: 'Ozempic / Wegovy',
    generic: 'Semaglutida',
    halfLifeDays: 7,    // ~7 dias
    accumRatio: 1.6,
    doses: [0.25, 0.5, 1, 1.7, 2.4],
  },
};

export const INJECTION_SITES = ['Abdómen', 'Coxa', 'Braço'] as const;
export type InjectionSite = (typeof INJECTION_SITES)[number];
