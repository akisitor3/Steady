import { View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { WeekPoint } from '@/lib/pk/engine';

// G1 — barras empilhadas: resíduo da semana anterior + dose nova.
export function BodyLevelChart({ data }: { data: WeekPoint[] }) {
  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          Regista a tua primeira injeção para veres o medicamento a acumular no corpo.
        </Text>
      </View>
    );
  }

  // gifted-charts: cada barra empilhada é um array de segmentos.
  const stacks = data.map((p) => ({
    stacks: [
      { value: p.residual, color: Colors.chartResidual },
      { value: p.fresh, color: Colors.chartFresh },
    ],
    label: `S${p.week}`,
  }));

  const maxTotal = Math.max(...data.map((p) => p.total));

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Medicamento no corpo</Text>
      <Text style={styles.subtitle}>Pico estimado a cada injeção (mg)</Text>

      <View style={styles.legend}>
        <LegendDot color={Colors.chartResidual} label="Resíduo anterior" />
        <LegendDot color={Colors.chartFresh} label="Dose nova" />
      </View>

      <BarChart
        stackData={stacks}
        height={180}
        barWidth={22}
        spacing={14}
        noOfSections={4}
        maxValue={Math.ceil(maxTotal * 1.15)}
        yAxisThickness={0}
        xAxisThickness={0}
        yAxisTextStyle={{ color: Colors.textTertiary, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: Colors.textSecondary, fontSize: 10 }}
      />
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
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
  title: { fontSize: 16, fontWeight: '500', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: Spacing.md },
  legend: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 3 },
  legendText: { fontSize: 12, color: Colors.textSecondary },
  empty: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
