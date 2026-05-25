import React from 'react';
import { useWindowDimensions } from 'react-native';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import { Injection, bodyLevel } from '@/lib/pk/engine';

const SVG_H = 72;
const PAD = { l: 18, r: 18, t: 10, b: 12 };
const DAY_MS = 24 * 60 * 60 * 1000;
const T_NEXT = 7;   // dias até próxima dose (semanal)
const T_END  = T_NEXT + 1.5;

interface Props {
  injections: Injection[];
  halfLifeDays: number;
}

export function HeroPKChart({ injections, halfLifeDays }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const SVG_W = screenWidth - 32 - 4;

  if (injections.length === 0) return <Svg width={SVG_W} height={SVG_H} />;

  const sorted = [...injections].sort((a, b) => a.date - b.date);
  const lastInj = sorted[sorted.length - 1];
  const now     = Date.now();

  const tNow  = Math.max(0, (now - lastInj.date) / DAY_MS);
  const q0    = bodyLevel(sorted, lastInj.date, halfLifeDays);        // pico última dose
  const qHoje = bodyLevel(sorted, now, halfLifeDays);
  const qPre  = bodyLevel(sorted, lastInj.date + T_NEXT * DAY_MS, halfLifeDays);
  const qPost = qPre + lastInj.doseMg;

  // escala Y
  const Q_MIN = Math.max(0, qPre * 0.85);
  const Q_MAX = Math.max(q0, qPost) * 1.08;

  const xOf = (t: number) => PAD.l + (t / T_END) * (SVG_W - PAD.l - PAD.r);
  const yOf = (q: number) => {
    if (Q_MAX === Q_MIN) return PAD.t + (SVG_H - PAD.t - PAD.b) / 2;
    return PAD.t + (1 - (q - Q_MIN) / (Q_MAX - Q_MIN)) * (SVG_H - PAD.t - PAD.b);
  };

  const Ax = xOf(0),      Ay = yOf(q0);
  const Bx = xOf(tNow),   By = yOf(qHoje);
  const Cx = xOf(T_NEXT), CyLo = yOf(qPre), CyHi = yOf(qPost);
  const Dx = xOf(T_END),  Dy   = yOf(qPost * Math.pow(0.5, 1.5 / halfLifeDays));
  const yFloor = SVG_H - 4;

  // curva de decaimento A → C (80 pontos suaves)
  const decayPath = Array.from({ length: 81 }, (_, i) => {
    const t = (T_NEXT / 80) * i;
    const x = xOf(t).toFixed(1);
    const y = yOf(bodyLevel(sorted, lastInj.date + t * DAY_MS, halfLifeDays)).toFixed(1);
    return i === 0 ? `M${x},${y}` : `L${x},${y}`;
  }).join(' ');

  return (
    <Svg width={SVG_W} height={SVG_H}>
      {/* linhas verticais de referência */}
      <Line x1={Ax} y1={Ay} x2={Ax} y2={yFloor}
        stroke="rgba(255,255,255,0.20)" strokeWidth={1} strokeDasharray="2,3" />
      <Line x1={Cx} y1={CyHi} x2={Cx} y2={yFloor}
        stroke="rgba(255,255,255,0.20)" strokeWidth={1} strokeDasharray="2,3" />

      {/* curva decaimento (tracejada) */}
      <Path d={decayPath}
        fill="none" stroke="rgba(255,255,255,0.68)"
        strokeWidth={1.5} strokeDasharray="4.5,4"
        strokeLinecap="round" strokeLinejoin="round" />

      {/* spike vertical na próxima dose */}
      <Line x1={Cx} y1={CyLo} x2={Cx} y2={CyHi}
        stroke="rgba(255,255,255,0.68)" strokeWidth={1.5} strokeLinecap="round" />

      {/* preview decaimento pós-dose */}
      <Path d={`M${Cx.toFixed(1)},${CyHi.toFixed(1)} L${Dx.toFixed(1)},${Dy.toFixed(1)}`}
        fill="none" stroke="rgba(255,255,255,0.45)"
        strokeWidth={1.5} strokeLinecap="round" />

      {/* dot A — última injeção */}
      <Circle cx={Ax} cy={Ay} r={5.5} fill="#fff" />

      {/* dot B — hoje */}
      <Circle cx={Bx} cy={By} r={3.5} fill="#fff" />

      {/* dot C — próxima dose */}
      <Circle cx={Cx} cy={CyHi} r={5.5} fill="#fff" />
    </Svg>
  );
}
