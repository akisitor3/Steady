import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Injection, bodyLevel } from '@/lib/pk/engine';
import { Colors, Font, Spacing, Radius, Shadow } from '@/constants/theme';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

const VB_W = 316;
const VB_H = 158;
const PAD  = { l: 36, r: 10, t: 10, b: 38 };
const PLOT_W = VB_W - PAD.l - PAD.r;
const PLOT_H = VB_H - PAD.t - PAD.b;

const Y_MIN = 0;
const Y_MAX = 12;

function yOf(mg: number) {
  return PAD.t + PLOT_H * (1 - (mg - Y_MIN) / (Y_MAX - Y_MIN));
}

interface Props {
  injections: Injection[];
  halfLifeDays: number;
}

export function BodyLevelChart({ injections, halfLifeDays }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const cardW = screenWidth - 32;

  if (injections.length === 0) {
    return (
      <View style={[styles.card, Shadow.sm]}>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📈</Text>
          <Text style={styles.emptyTitle}>Ainda sem dados</Text>
          <Text style={styles.emptyText}>
            Regista a primeira injeção para veres o medicamento a acumular no corpo.
          </Text>
        </View>
      </View>
    );
  }

  const sorted = [...injections].sort((a, b) => a.date - b.date);
  const first  = sorted[0].date;
  const last   = sorted[sorted.length - 1];
  const projDate = last.date + WEEK_MS;
  const now    = Date.now();
  const total  = projDate - first;

  const xOf = (ms: number) => PAD.l + ((ms - first) / total) * PLOT_W;
  const nowX  = xOf(now);
  const yFloor = PAD.t + PLOT_H;

  const peaks = sorted.map((inj) => ({
    x:     xOf(inj.date),
    y:     yOf(bodyLevel(sorted, inj.date, halfLifeDays)),
    value: parseFloat(bodyLevel(sorted, inj.date, halfLifeDays).toFixed(1)),
  }));

  const sampleMs = 6 * 60 * 60 * 1000;
  const allPts: { x: number; y: number; t: number }[] = [];

  for (let t = first; t <= projDate + DAY_MS; t += sampleMs) {
    allPts.push({ x: xOf(t), y: yOf(bodyLevel(sorted, t, halfLifeDays)), t });
  }
  for (const inj of sorted) {
    const tBefore = inj.date - 1000;
    const before  = { x: xOf(tBefore), y: yOf(bodyLevel(sorted, tBefore, halfLifeDays)), t: tBefore };
    const at      = { x: xOf(inj.date), y: yOf(bodyLevel(sorted, inj.date, halfLifeDays)), t: inj.date };
    allPts.push(before, at);
  }
  allPts.sort((a, b) => a.t - b.t);

  const pastPts   = allPts.filter((p) => p.t <= now);
  const futurePts = allPts.filter((p) => p.t >= now);

  const toPath = (pts: typeof allPts) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const pastPath   = toPath(pastPts);
  const futurePath = toPath(futurePts);

  const areaPath =
    pastPath +
    `L${nowX.toFixed(1)},${yFloor}` +
    `L${PAD.l},${yFloor} Z`;

  const areaProj =
    futurePath +
    `L${xOf(projDate).toFixed(1)},${yFloor}` +
    `L${nowX.toFixed(1)},${yFloor} Z`;

  const qHoje = bodyLevel(sorted, now, halfLifeDays);
  const todayY = yOf(qHoje);

  const qProj = bodyLevel(sorted, projDate, halfLifeDays) + last.doseMg;
  const projX  = xOf(projDate);
  const projY  = yOf(qProj);

  const yGrid = [0, 2, 4, 6, 8, 10, 12];

  return (
    <View style={[styles.card, Shadow.sm]}>
      <View style={styles.header}>
        <Text style={styles.title}>Medicamento no corpo</Text>
        <Text style={styles.subtitle}>Curva PK: pico após injeção e decaimento semanal (mg)</Text>
      </View>

      <Svg
        width={cardW}
        height={undefined}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        style={{ width: cardW, aspectRatio: VB_W / VB_H }}
      >
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={Colors.primary} stopOpacity="0.14" />
            <Stop offset="100%" stopColor={Colors.primary} stopOpacity="0.01" />
          </LinearGradient>
          <LinearGradient id="areaGradProj" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={Colors.primary} stopOpacity="0.06" />
            <Stop offset="100%" stopColor={Colors.primary} stopOpacity="0.01" />
          </LinearGradient>
        </Defs>

        {/* Eixo Y */}
        <Line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={yFloor}
          stroke={Colors.border} strokeWidth={0.5} />

        {/* Gridlines Y + labels */}
        {yGrid.map((mg) => {
          const y = yOf(mg);
          const isSS = mg === 8;
          return (
            <React.Fragment key={mg}>
              <Line x1={PAD.l} y1={y} x2={VB_W - PAD.r} y2={y}
                stroke={isSS ? Colors.primary : Colors.border}
                strokeWidth={isSS ? 1 : 0.5}
                strokeDasharray={isSS ? '4,3' : undefined}
                opacity={isSS ? 0.4 : 1} />
              <SvgText x={PAD.l - 4} y={y + 3}
                textAnchor="end" fontSize={8}
                fill={isSS ? Colors.primary : Colors.textTertiary}
                fontFamily={isSS ? Font.semiBold : Font.regular}>
                {mg}
              </SvgText>
              {isSS && (
                <SvgText x={VB_W - PAD.r - 4} y={y - 3}
                  textAnchor="end" fontSize={7.5}
                  fill={Colors.primary} fontFamily={Font.semiBold}
                  opacity={0.7}>
                  SS
                </SvgText>
              )}
            </React.Fragment>
          );
        })}

        {/* Linha do eixo X */}
        <Line x1={PAD.l} y1={yFloor} x2={VB_W - PAD.r} y2={yFloor}
          stroke={Colors.border} strokeWidth={1} />

        {/* Área sólida */}
        <Path d={areaPath} fill="url(#areaGrad)" />

        {/* Área projetada */}
        <Path d={areaProj} fill="url(#areaGradProj)" />

        {/* Curva sólida (passado) */}
        <Path d={pastPath} fill="none"
          stroke={Colors.primary} strokeWidth={2}
          strokeLinecap="round" strokeLinejoin="round" />

        {/* Curva tracejada (projetado) */}
        <Path d={futurePath} fill="none"
          stroke={Colors.primary} strokeWidth={1.5}
          strokeDasharray="4,3" opacity={0.45}
          strokeLinecap="round" />

        {/* Linha vertical "Hoje" */}
        <Line x1={nowX} y1={todayY} x2={nowX} y2={yFloor}
          stroke={Colors.primary} strokeWidth={1}
          strokeDasharray="3,2" opacity={0.35} />

        {/* Picos de cada injeção */}
        {peaks.map((p, i) => {
          const isLast = i === peaks.length - 1;
          return (
            <React.Fragment key={i}>
              <Circle cx={p.x} cy={p.y}
                r={isLast ? 5 : 3.5}
                fill={Colors.primary} stroke="white"
                strokeWidth={isLast ? 2 : 1.5} />
              <SvgText x={p.x} y={p.y - (isLast ? 8 : 6)}
                textAnchor="middle"
                fontSize={isLast ? 9 : 8.5}
                fill={Colors.primary}
                fontFamily={Font.bold}>
                {p.value.toFixed(1)}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Dot "Hoje" */}
        <Circle cx={nowX} cy={todayY} r={4}
          fill="white" stroke={Colors.primary} strokeWidth={2} />
        <SvgText x={nowX} y={todayY - 7}
          textAnchor="middle" fontSize={8}
          fill={Colors.primary} fontFamily={Font.semiBold}>
          {qHoje.toFixed(1)}
        </SvgText>

        {/* Projetado: próxima dose */}
        <Circle cx={projX} cy={projY} r={3.5}
          fill="white" stroke={Colors.primary} strokeWidth={1.5} opacity={0.5} />
        <SvgText x={projX} y={projY - 6}
          textAnchor="middle" fontSize={8.5}
          fill={Colors.textTertiary} fontFamily={Font.semiBold}>
          {qProj.toFixed(1)}
        </SvgText>

        {/* X labels */}
        {peaks.map((p, i) => {
          const isLast = i === peaks.length - 1;
          return (
            <React.Fragment key={i}>
              <Line x1={p.x} y1={yFloor} x2={p.x} y2={yFloor + 4}
                stroke={isLast ? Colors.primary : Colors.border}
                strokeWidth={isLast ? 1.5 : 1} />
              <SvgText x={p.x} y={yFloor + 12}
                textAnchor="middle" fontSize={9}
                fill={isLast ? Colors.primary : Colors.textSecondary}
                fontFamily={isLast ? Font.bold : Font.medium}>
                {`S${i + 1}`}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Label "Hoje" no eixo X */}
        <SvgText x={nowX} y={yFloor + 12}
          textAnchor="middle" fontSize={8}
          fill={Colors.primary} fontFamily={Font.semiBold}>
          Hoje
        </SvgText>

        {/* Label projetado no eixo X */}
        <Line x1={projX} y1={yFloor} x2={projX} y2={yFloor + 4}
          stroke={Colors.border} strokeWidth={1} strokeDasharray="2,1" />
        <SvgText x={projX} y={yFloor + 12}
          textAnchor="middle" fontSize={9}
          fill={Colors.textTertiary} fontFamily={Font.regular}>
          {`S${peaks.length + 1}`}
        </SvgText>

        {/* Legenda */}
        <Circle cx={PAD.l + 6} cy={yFloor + 27} r={3} fill={Colors.primary} />
        <SvgText x={PAD.l + 13} y={yFloor + 30}
          fontSize={8} fill={Colors.textSecondary} fontFamily={Font.regular}>
          Nível pós-injeção
        </SvgText>
        <Circle cx={PAD.l + 96} cy={yFloor + 27} r={3}
          fill="white" stroke={Colors.primary} strokeWidth={1.5} />
        <SvgText x={PAD.l + 103} y={yFloor + 30}
          fontSize={8} fill={Colors.textSecondary} fontFamily={Font.regular}>
          {`Hoje (${qHoje.toFixed(1)} mg)`}
        </SvgText>
        <Line x1={PAD.l + 183} y1={yFloor + 27} x2={PAD.l + 195} y2={yFloor + 27}
          stroke={Colors.primary} strokeWidth={1.5} strokeDasharray="3,2" opacity={0.5} />
        <SvgText x={PAD.l + 198} y={yFloor + 30}
          fontSize={8} fill={Colors.textTertiary} fontFamily={Font.regular}>
          Projetado
        </SvgText>
      </Svg>

      <View style={styles.footer}>
        <Text style={styles.footerMeta}>t½ = {halfLifeDays} dias · Tirzepatida</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  header: { marginBottom: 4 },
  title: { fontSize: 15, fontFamily: Font.semiBold, color: Colors.text, letterSpacing: -0.2 },
  subtitle: { fontSize: 11, fontFamily: Font.regular, color: Colors.textTertiary, marginTop: 2, marginBottom: 8 },
  footer: {
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerMeta: { fontSize: 11, fontFamily: Font.regular, color: Colors.textTertiary },
  empty: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyIcon:  { fontSize: 32, marginBottom: Spacing.sm },
  emptyTitle: { fontSize: 15, fontFamily: Font.semiBold, color: Colors.text, marginBottom: 6 },
  emptyText:  { fontSize: 13, fontFamily: Font.regular, color: Colors.textSecondary, textAlign: 'center', lineHeight: 19 },
});
