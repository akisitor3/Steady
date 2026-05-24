import { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Modal, SafeAreaView,
} from 'react-native';
import { useApp } from '@/lib/store/useApp';
import { MEDICATIONS } from '@/constants/medications';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { bodyLevel, weeklyAccumulation, steadyState } from '@/lib/pk/engine';
import { BodyLevelChart } from '@/components/BodyLevelChart';

export default function DosesScreen() {
  const { injections, medication, loaded, loadInjections, addInjection } = useApp();
  const [modal, setModal] = useState(false);
  const med = MEDICATIONS[medication];

  useEffect(() => { loadInjections(); }, []);

  const now = Date.now();
  const levelNow = useMemo(
    () => bodyLevel(injections, now, med.halfLifeDays),
    [injections, med]
  );
  const weekly = useMemo(
    () => weeklyAccumulation(injections, med.halfLifeDays),
    [injections, med]
  );
  const lastDose = injections.length ? injections[injections.length - 1].doseMg : 0;
  const ss = lastDose ? steadyState(lastDose, med.accumRatio) : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.h1}>Steady</Text>
        <Text style={styles.medLabel}>{med.generic} · {med.brand}</Text>

        {/* Cartões de estado */}
        <View style={styles.cardsRow}>
          <StatCard label="No corpo agora" value={`${levelNow.toFixed(1)} mg`} />
          <StatCard label="Steady state" value={ss ? `${ss.toFixed(1)} mg` : '—'} />
        </View>

        {/* G1 */}
        <BodyLevelChart data={weekly} />

        {/* Histórico recente */}
        {injections.length > 0 && (
          <View style={styles.history}>
            <Text style={styles.histTitle}>Últimas injeções</Text>
            {[...injections].reverse().slice(0, 5).map((inj) => (
              <View key={inj.id} style={styles.histRow}>
                <Text style={styles.histDose}>{inj.doseMg} mg</Text>
                <Text style={styles.histDate}>
                  {new Date(inj.date).toLocaleDateString('pt-PT')}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.disclaimer}>
          Estimativa educativa (t½ ≈ {med.halfLifeDays} dias). Não é aconselhamento médico.
        </Text>
      </ScrollView>

      {/* Botão registar */}
      <Pressable style={styles.fab} onPress={() => setModal(true)}>
        <Text style={styles.fabText}>+ Registar injeção</Text>
      </Pressable>

      <DoseModal
        visible={modal}
        doses={med.doses}
        onClose={() => setModal(false)}
        onPick={async (dose) => {
          await addInjection(dose, 'Abdómen');
          setModal(false);
        }}
      />
    </SafeAreaView>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function DoseModal({
  visible, doses, onClose, onPick,
}: {
  visible: boolean;
  doses: number[];
  onClose: () => void;
  onPick: (d: number) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Que dose?</Text>
          <View style={styles.doseGrid}>
            {doses.map((d) => (
              <Pressable key={d} style={styles.doseBtn} onPress={() => onPick(d)}>
                <Text style={styles.doseBtnText}>{d} mg</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgSecondary },
  container: { padding: Spacing.md, paddingBottom: 100 },
  h1: { fontSize: 28, fontWeight: '600', color: Colors.primary },
  medLabel: { fontSize: 14, color: Colors.textSecondary, marginBottom: Spacing.lg },
  cardsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  stat: {
    flex: 1, backgroundColor: Colors.bg, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.border, padding: Spacing.md,
  },
  statLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: '600', color: Colors.text },
  history: {
    backgroundColor: Colors.bg, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.md,
  },
  histTitle: { fontSize: 15, fontWeight: '500', color: Colors.text, marginBottom: Spacing.sm },
  histRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderTopWidth: 0.5, borderTopColor: Colors.border,
  },
  histDose: { fontSize: 14, fontWeight: '500', color: Colors.text },
  histDate: { fontSize: 14, color: Colors.textSecondary },
  disclaimer: { fontSize: 11, color: Colors.textTertiary, textAlign: 'center', marginTop: Spacing.sm },
  fab: {
    position: 'absolute', bottom: 80, left: Spacing.md, right: Spacing.md,
    backgroundColor: Colors.primary, borderRadius: Radius.lg,
    paddingVertical: 16, alignItems: 'center',
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.bg, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing.lg, paddingBottom: Spacing.xl,
  },
  sheetTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginBottom: Spacing.md },
  doseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  doseBtn: {
    backgroundColor: Colors.primarySoft, borderRadius: Radius.md,
    paddingVertical: 14, paddingHorizontal: 20, minWidth: 90, alignItems: 'center',
  },
  doseBtnText: { fontSize: 16, fontWeight: '500', color: Colors.primary },
});
