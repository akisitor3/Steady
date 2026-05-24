// ============================================================
// Motor farmacocinético (PK) — núcleo lógico do diferenciador.
// Calcula quanto medicamento está ativo no corpo ao longo do tempo.
//
// Modelo: decaimento exponencial de primeira ordem.
//   fração restante após t dias = 0.5 ^ (t / t½)
// Cada injeção contribui com a sua dose * decaimento desde a sua data.
// O nível total é a soma de todas as contribuições.
//
// Validação (tirzepatida, t½=5d, dose 5mg semanal):
//   resíduo semanal = 0.5^(7/5) ≈ 0.379  → sobra ~37.9%
//   steady state ≈ 1.6 × dose  (≈ 8 mg)  após ~4 semanas
// ============================================================

export interface Injection {
  id: string;
  date: number;   // timestamp ms
  doseMg: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Fração da dose ainda presente após `days` dias, dada a semivida. */
export function decay(days: number, halfLifeDays: number): number {
  if (days < 0) return 0;
  return Math.pow(0.5, days / halfLifeDays);
}

/** Nível total no corpo (mg) num dado instante. */
export function bodyLevel(
  injections: Injection[],
  atMs: number,
  halfLifeDays: number
): number {
  return injections.reduce((total, inj) => {
    const days = (atMs - inj.date) / DAY_MS;
    return total + inj.doseMg * decay(days, halfLifeDays);
  }, 0);
}

/** Série semanal: pico no corpo logo após cada injeção (para G1). */
export interface WeekPoint {
  week: number;
  residual: number; // o que sobrou da(s) dose(s) anterior(es)
  fresh: number;    // a dose nova dessa semana
  total: number;
}

export function weeklyAccumulation(
  injections: Injection[],
  halfLifeDays: number
): WeekPoint[] {
  if (injections.length === 0) return [];
  const sorted = [...injections].sort((a, b) => a.date - b.date);
  const out: WeekPoint[] = [];

  sorted.forEach((inj, i) => {
    // nível imediatamente ANTES desta injeção = resíduo
    const residual = i === 0 ? 0 : bodyLevel(sorted.slice(0, i), inj.date, halfLifeDays);
    const total = residual + inj.doseMg;
    out.push({
      week: i + 1,
      residual: round1(residual),
      fresh: round1(inj.doseMg),
      total: round1(total),
    });
  });
  return out;
}

/** Curva intra-semana entre a última injeção e a próxima (para G2). */
export function intraWeekCurve(
  injections: Injection[],
  halfLifeDays: number,
  pointsPerDay = 2
): { day: number; level: number }[] {
  if (injections.length === 0) return [];
  const last = [...injections].sort((a, b) => a.date - b.date).slice(-1)[0];
  const out: { day: number; level: number }[] = [];
  const steps = 7 * pointsPerDay;
  for (let s = 0; s <= steps; s++) {
    const days = s / pointsPerDay;
    const at = last.date + days * DAY_MS;
    out.push({ day: round1(days), level: round1(bodyLevel(injections, at, halfLifeDays)) });
  }
  return out;
}

/** Steady state estimado para uma dose fixa. */
export function steadyState(doseMg: number, accumRatio: number): number {
  return round1(doseMg * accumRatio);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
