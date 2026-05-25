import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Circle } from 'react-native-svg';
import { useApp } from '@/lib/store/useApp';
import { intraWeekCurve } from '@/lib/pk/engine';
import { MEDICATIONS } from '@/constants/medications';
import { Colors, Font, Spacing, Radius, Shadow } from '@/constants/theme';

const CHART_H = 80;
const PAD_LEFT = 8;
const PAD_RIGHT = 8;
const PAD_TOP = 6;
const PAD_BOTTOM = 16;

export function IntraWeekChart() {
  const { injections, medication } = useApp();
  const med = MEDICATIONS[medication];
  const { width: screenWidth } = useWindowDimensions();
  // card has 16px horizontal margins on screen + 16px internal padding each side
  const svgWidth = screenWidth - 32 - 32;

  if (injections.length === 0) {
    return (
      <View style={[styles.card, Shadow.sm]}>
        <View style={styles.header}>
          <Text style={styles.title}>Curva desta semana</Text>
          <Text style={styles.subtitle}>Nível previsto até à próxima dose</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Regista a primeira injeção para ver a curva</Text>
        </View>
      </View>
    );
  }

  const curve = intraWeekCurve(injections, med.halfLifeDays);

  if (curve.length === 0) {
    return null;
  }

  const maxLevel = Math.max(...curve.map((p) => p.level));
  const plotW = svgWidth - PAD_LEFT - PAD_RIGHT;
  const plotH = CHART_H - PAD_TOP - PAD_BOTTOM;

  const toX = (day: number) => PAD_LEFT + (day / 7) * plotW;
  const toY = (level: number) => {
    if (maxLevel === 0) return PAD_TOP + plotH;
    return PAD_TOP + plotH - (level / maxLevel) * plotH;
  };

  const points = curve.map((p) => ({ x: toX(p.day), y: toY(p.level) }));

  // Build SVG path for line
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  // Area fill path: line + close to bottom
  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x.toFixed(1)} ${(PAD_TOP + plotH).toFixed(1)}` +
    ` L ${points[0].x.toFixed(1)} ${(PAD_TOP + plotH).toFixed(1)} Z`;

  // Efficacy line at 50% of max
  const efficacyY = toY(maxLevel * 0.5);

  // Current position: how many days since last injection
  const sortedInj = [...injections].sort((a, b) => a.date - b.date);
  const lastInj = sortedInj[sortedInj.length - 1];
  const DAY_MS = 24 * 60 * 60 * 1000;
  const daysSinceLast = Math.min(7, (Date.now() - lastInj.date) / DAY_MS);
  const dotX = toX(daysSinceLast);
  const dotLevel = curve.reduce((closest, p) => {
    return Math.abs(p.day - daysSinceLast) < Math.abs(closest.day - daysSinceLast) ? p : closest;
  }, curve[0]);
  const dotY = toY(dotLevel.level);

  return (
    <View style={[styles.card, Shadow.sm]}>
      <View style={styles.header}>
        <Text style={styles.title}>Curva desta semana</Text>
        <Text style={styles.subtitle}>Nível previsto até à próxima dose</Text>
      </View>

      <Svg width={svgWidth} height={CHART_H}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={Colors.primarySoft} stopOpacity="0.8" />
            <Stop offset="1" stopColor={Colors.primarySoft} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Area fill */}
        <Path d={areaPath} fill="url(#areaGrad)" />

        {/* Efficacy threshold line */}
        <Line
          x1={PAD_LEFT}
          y1={efficacyY}
          x2={svgWidth - PAD_RIGHT}
          y2={efficacyY}
          stroke={Colors.border}
          strokeWidth={1}
          strokeDasharray="4,3"
        />

        {/* Decay line */}
        <Path
          d={linePath}
          fill="none"
          stroke={Colors.primary}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current day dot */}
        <Circle cx={dotX} cy={dotY} r={4} fill={Colors.primary} />
        <Circle cx={dotX} cy={dotY} r={2.5} fill="#fff" />
      </Svg>

      <View style={styles.axisLabels}>
        <Text style={styles.axisLabel}>Dia 1</Text>
        <Text style={styles.axisLabel}>Dia 7</Text>
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
  header: { marginBottom: Spacing.sm },
  title: { fontSize: 15, fontFamily: Font.semiBold, color: Colors.text, letterSpacing: -0.2 },
  subtitle: { fontSize: 12, fontFamily: Font.regular, color: Colors.textSecondary, marginTop: 2 },
  empty: { paddingVertical: Spacing.lg, alignItems: 'center' },
  emptyText: { fontSize: 13, fontFamily: Font.regular, color: Colors.textSecondary, textAlign: 'center' },
  axisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: PAD_LEFT,
    marginTop: -PAD_BOTTOM + 2,
  },
  axisLabel: { fontSize: 10, fontFamily: Font.regular, color: Colors.textTertiary },
});
