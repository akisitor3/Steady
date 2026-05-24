import { View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Colors, Spacing, Radius, Shadow } from '@/constants/theme';
import { WeekPoint } from '@/lib/pk/engine';

export function BodyLevelChart({ data }: { data: WeekPoint[] }) {
  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📈</Text>
        <Text style={styles.emptyTitle}>Ainda sem dados</Text>
        <Text style={styles.emptyText}>
          Regista a primeira injeção para veres o medicamento a acumular no corpo.
        </Text>
      </View>
    );
  }

  const stacks = data.map((p) => ({
    stacks: [
      { value: p.residual, color: Colors.chartResidual },
      { value: p.fresh, color: Colors.chartFresh },
    ],
    label: `S${p.week}`,
  }));

  const maxTotal = Math.max(...data.map((p) => p.total));

  return (
    <View style={[styles.card, Shadow.sm]}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.title}>Medicamento no corpo</Text>
          <Text style={styles.subtitle}>Pico estimado após cada injeção (mg)</Text>
        </View>
      </View>

      <View style={styles.legend}>
        <LegendDot color={Colors.chartResidual} label="Resíduo anterior" />
        <LegendDot color={Colors.chartFresh} label="Dose nova" />
      </View>

      <BarChart
        stackData={stacks}
        height={160}
        barWidth={20}
        spacing={16}
        noOfSections={4}
        maxValue={Math.ceil(maxTotal * 1.2)}
        yAxisThickness={0}
        xAxisThickness={0.5}
        xAxisColor={Colors.border}
        yAxisTextStyle={{ color: Colors.textTertiary, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: Colors.textSecondary, fontSize: 10, fontWeight: '500' }}
        showFractionalValues
        roundedTop
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
    backgroundColor: Colors.bg, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.border,
    padding: Spacing.md, marginBottom: Spacing.md,
  },
  cardHeader: { marginBottom: 4 },
  title: { fontSize: 15, fontWeight: '600', color: Colors.text },
  subtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, marginBottom: Spacing.md },
  legend: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 2 },
  legendText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  empty: {
    backgroundColor: Colors.bg, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.border,
    padding: Spacing.xl, marginBottom: Spacing.md,
    alignItems: 'center',
  },
  emptyIcon: { fontSize: 32, marginBottom: Spacing.sm },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  emptyText: {
    fontSize: 13, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 19,
  },
});
