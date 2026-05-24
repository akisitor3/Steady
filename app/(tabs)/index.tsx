import { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Modal, SafeAreaView,
} from 'react-native';
import { useApp } from '@/lib/store/useApp';
import { MEDICATIONS } from '@/constants/medications';
import { Colors, Spacing, Radius, Shadow } from '@/constants/theme';
import { bodyLevel, weeklyAccumulation, steadyState } from '@/lib/pk/engine';
import { BodyLevelChart } from '@/components/BodyLevelChart';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export default function DosesScreen() {
  const { injections, medication, loadInjections, addInjection } = useApp();
  const [modal, setModal] = useState(false);
  const med = MEDICATIONS[medication];
  const now = Date.now();

  useEffect(() => { loadInjections(); }, []);

  const levelNow = useMemo(
    () => bodyLevel(injections, now, med.halfLifeDays),
    [injections, med]
  );
  const weekly = useMemo(
    () => weeklyAccumulation(injections, med.halfLifeDays),
    [injections, med]
  );

  const lastInj = injections.length ? injections[injections.length - 1] : null;
  const lastDose = lastInj?.doseMg ?? 0;
  const ss = lastDose ? steadyState(lastDose, med.accumRatio) : 0;

  const nextDate = lastInj ? lastInj.date + WEEK_MS : null;

  const levelTomorrow = useMemo(
    () => bodyLevel(injections, now + DAY_MS, med.halfLifeDays),
    [injections, med]
  );
  const levelNextDose = useMemo(() => {
    if (!nextDate || !lastDose) return null;
    const residual = bodyLevel(injections, nextDate, med.halfLifeDays);
    return residual + lastDose;
  }, [injections, med, nextDate, lastDose]);
  const daysLeft = nextDate ? Math.max(0, Math.ceil((nextDate - now) / DAY_MS)) : null;
  const weekProgress = lastInj ? Math.min(1, (now - lastInj.date) / WEEK_MS) : 0;

  const nextLabel = () => {
    if (daysLeft === null) return 'Regista a primeira injeção';
    if (daysLeft === 0) return 'Hoje!';
    if (daysLeft === 1) return 'Amanhã';
    return `em ${daysLeft} dias`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View>
            <Text style={styles.h1}>Steady</Text>
            <View style={styles.medBadge}>
              <Text style={styles.medBadgeText}>{med.generic} · {med.brand}</Text>
            </View>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>S</Text>
          </View>
        </View>

        <View style={[styles.hero, Shadow.primary]}>
          <Text style={styles.heroLabel}>PRÓXIMA INJEÇÃO</Text>
          <Text style={styles.heroValue}>{nextLabel()}</Text>
          {lastInj && (
            <Text style={styles.heroSub}>
              Última: {new Date(lastInj.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
              {'  ·  '}{lastInj.doseMg} mg
            </Text>
          )}
          {lastInj && (
            <View style={styles.heroPillRow}>
              <View style={styles.heroPillItem}>
                <Text style={styles.heroPillVal}>{levelNow.toFixed(1)}</Text>
                <Text style={styles.heroPillLbl}>Hoje</Text>
              </View>
              <Text style={styles.heroPillArr}>→</Text>
              <View style={styles.heroPillItem}>
                <Text style={styles.heroPillVal}>{levelTomorrow.toFixed(1)}</Text>
                <Text style={styles.heroPillLbl}>Amanhã</Text>
              </View>
              <Text style={styles.heroPillArr}>→</Text>
              <View style={styles.heroPillItem}>
                <Text style={[styles.heroPillVal, styles.heroPillValDim]}>
                  {levelNextDose ? levelNextDose.toFixed(1) : '—'}
                </Text>
                <Text style={styles.heroPillLbl}>Próx. dose</Text>
              </View>
            </View>
          )}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${weekProgress * 100}%` as any }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>Início semana</Text>
            <Text style={styles.progressLabel}>Dia 7</Text>
          </View>
        </View>

        <View style={styles.cardsRow}>
          <View style={[styles.stat, Shadow.sm]}>
            <Text style={styles.statLabel}>NO CORPO AGORA</Text>
            <Text style={styles.statValue}>
              {levelNow.toFixed(1)}<Text style={styles.statUnit}> mg</Text>
            </Text>
            {ss > 0 && <Text style={styles.statSub}>SS {ss.toFixed(1)} mg</Text>}
          </View>
          <View style={[styles.stat, Shadow.sm]}>
            <Text style={styles.statLabel}>INJEÇÕES</Text>
            <Text style={styles.statValue}>
              {injections.length}<Text style={styles.statUnit}> total</Text>
            </Text>
            <Text style={styles.statSub}>
              {injections.length > 0
                ? `Semana ${injections.length}`
                : 'Sem registos'}
            </Text>
          </View>
        </View>

        <BodyLevelChart data={weekly} />

        {injections.length > 0 && (
          <View style={[styles.historyCard, Shadow.sm]}>
            <Text style={styles.histTitle}>Últimas injeções</Text>
            {[...injections].reverse().slice(0, 5).map((inj, i) => (
              <View key={inj.id} style={[styles.histRow, i === 0 && { borderTopWidth: 0 }]}>
                <View style={styles.histLeft}>
                  <View style={[styles.histDot, i > 0 && styles.histDotOld]} />
                  <Text style={styles.histDose}>{inj.doseMg} mg</Text>
                </View>
                <Text style={styles.histDate}>
                  {new Date(inj.date).toLocaleDateString('pt-PT', {
                    day: 'numeric', month: 'short', year: '2-digit',
                  })}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.disclaimer}>
          Estimativa educativa (t½ ≈ {med.halfLifeDays} dias). Não é aconselhamento médico.
        </Text>
      </ScrollView>

      <Pressable style={[styles.fab, Shadow.primary]} onPress={() => setModal(true)}>
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

function DoseModal({ visible, doses, onClose, onPick }: {
  visible: boolean;
  doses: number[];
  onClose: () => void;
  onPick: (d: number) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Que dose?</Text>
          <Text style={styles.sheetSub}>Selecciona a dose desta semana</Text>
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
  container: { padding: Spacing.md, paddingBottom: 110 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: Spacing.lg,
  },
  h1: { fontSize: 30, fontWeight: '700', color: Colors.primary, letterSpacing: -0.5 },
  medBadge: {
    backgroundColor: Colors.primarySoft, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
    marginTop: 4, alignSelf: 'flex-start',
  },
  medBadgeText: { fontSize: 12, fontWeight: '500', color: Colors.primary },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  hero: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  heroLabel: {
    fontSize: 10, fontWeight: '600',
    color: 'rgba(255,255,255,0.7)', letterSpacing: 0.8, marginBottom: 4,
  },
  heroValue: { fontSize: 32, fontWeight: '700', color: '#fff', letterSpacing: -0.5 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4, marginBottom: Spacing.md },
  heroPillRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 11,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  heroPillItem: { alignItems: 'center' },
  heroPillVal: {
    fontSize: 12, fontWeight: '700', color: '#fff', letterSpacing: -0.2,
  },
  heroPillValDim: { color: 'rgba(255,255,255,0.50)', fontWeight: '600' },
  heroPillLbl: {
    fontSize: 8, color: 'rgba(255,255,255,0.55)', marginTop: 2, fontWeight: '500',
  },
  heroPillArr: {
    fontSize: 9, color: 'rgba(255,255,255,0.35)', marginBottom: 11,
  },

  progressTrack: {
    height: 4, backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: 4, backgroundColor: '#fff', borderRadius: 2 },
  progressLabels: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 6,
  },
  progressLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)' },

  cardsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  stat: {
    flex: 1, backgroundColor: Colors.bg,
    borderRadius: Radius.lg, borderWidth: 0.5,
    borderColor: Colors.border, padding: Spacing.md,
  },
  statLabel: {
    fontSize: 10, fontWeight: '600', color: Colors.textTertiary,
    letterSpacing: 0.5, marginBottom: 6,
  },
  statValue: { fontSize: 24, fontWeight: '700', color: Colors.text, letterSpacing: -0.5 },
  statUnit: { fontSize: 14, fontWeight: '400', color: Colors.textSecondary },
  statSub: { fontSize: 11, color: Colors.success, marginTop: 4, fontWeight: '500' },

  historyCard: {
    backgroundColor: Colors.bg, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.border,
    overflow: 'hidden', marginBottom: Spacing.md,
  },
  histTitle: {
    fontSize: 14, fontWeight: '600', color: Colors.text,
    padding: Spacing.md, paddingBottom: Spacing.sm,
    borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  histRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    borderTopWidth: 0.5, borderTopColor: Colors.border,
  },
  histLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  histDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  histDotOld: { backgroundColor: Colors.textTertiary },
  histDose: { fontSize: 14, fontWeight: '500', color: Colors.text },
  histDate: { fontSize: 13, color: Colors.textSecondary },

  disclaimer: {
    fontSize: 11, color: Colors.textTertiary,
    textAlign: 'center', marginTop: Spacing.sm, lineHeight: 16,
  },

  fab: {
    position: 'absolute', bottom: 88,
    left: Spacing.md, right: Spacing.md,
    backgroundColor: Colors.primary, borderRadius: Radius.lg,
    paddingVertical: 16, alignItems: 'center',
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: 0.1 },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.bg,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing.lg, paddingBottom: Spacing.xl,
  },
  sheetHandle: {
    width: 36, height: 4, backgroundColor: Colors.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.md,
  },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, letterSpacing: -0.3 },
  sheetSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, marginBottom: Spacing.lg },
  doseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  doseBtn: {
    backgroundColor: Colors.primarySoft, borderRadius: Radius.md,
    paddingVertical: 14, paddingHorizontal: 20, minWidth: 90, alignItems: 'center',
  },
  doseBtnText: { fontSize: 16, fontWeight: '600', color: Colors.primary },
});
