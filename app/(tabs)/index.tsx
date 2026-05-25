import { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Modal, SafeAreaView,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useApp } from '@/lib/store/useApp';
import { useWeightStore } from '@/lib/store/useWeightStore';
import { MEDICATIONS } from '@/constants/medications';
import { Colors, Spacing, Radius, Shadow } from '@/constants/theme';
import { bodyLevel, weeklyAccumulation, steadyState } from '@/lib/pk/engine';
import { BodyLevelChart } from '@/components/BodyLevelChart';
import { HeroPKChart } from '@/components/HeroPKChart';
import { IntraWeekChart } from '@/components/IntraWeekChart';
import { BioRespostaCard } from '@/components/BioRespostaCard';
import { VFCGaugeCard } from '@/components/VFCGaugeCard';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export default function DosesScreen() {
  const { injections, medication, loadInjections, addInjection } = useApp();
  const { weights, loadWeights } = useWeightStore();
  const [modal, setModal] = useState(false);
  const med = MEDICATIONS[medication];
  const now = Date.now();

  useEffect(() => {
    loadInjections();
    loadWeights();
  }, []);

  const levelNow = useMemo(
    () => bodyLevel(injections, now, med.halfLifeDays),
    [injections, med]
  );
  const weekly = useMemo(
    () => weeklyAccumulation(injections, med.halfLifeDays),
    [injections, med]
  );

  const latestWeight = weights.length ? weights[weights.length - 1].weight_kg : null;
  const firstWeight = weights.length ? weights[0].weight_kg : null;
  const weightDelta = latestWeight !== null && firstWeight !== null
    ? Math.round((latestWeight - firstWeight) * 10) / 10
    : null;

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
          <HeroPKChart weekly={weekly} ss={ss} />
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
            <Text style={styles.statLabel}>PESO ACTUAL</Text>
            {latestWeight !== null ? (
              <>
                <Text style={styles.statValue}>
                  {latestWeight.toFixed(1)}<Text style={styles.statUnit}> kg</Text>
                </Text>
                <Text style={[
                  styles.statSub,
                  weightDelta !== null && weightDelta < 0
                    ? { color: Colors.success }
                    : weightDelta !== null && weightDelta > 0
                    ? { color: Colors.danger }
                    : { color: Colors.textTertiary },
                ]}>
                  {weightDelta === null
                    ? 'Sem variação'
                    : weightDelta < 0
                    ? `▼ ${Math.abs(weightDelta).toFixed(1)} kg`
                    : weightDelta > 0
                    ? `▲ ${weightDelta.toFixed(1)} kg`
                    : '—'}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.statValue}>—</Text>
                <Text style={[styles.statSub, { color: Colors.textTertiary }]}>Sem registos</Text>
              </>
            )}
          </View>
        </View>

        <BodyLevelChart data={weekly} />

        <IntraWeekChart />

        {/* Food Tracking Card */}
        <View style={[styles.foodCard, Shadow.sm]}>
          <View style={styles.foodHeader}>
            <View style={styles.foodHeaderLeft}>
              <Text style={styles.foodTitle}>Refeições de hoje</Text>
              <Text style={styles.foodSub}>
                {new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })} · 1 240 kcal registadas
              </Text>
            </View>
            <View style={styles.foodRing}>
              <Svg width={44} height={44} viewBox="0 0 36 36" style={{ position: 'absolute' }}>
                <Circle cx={18} cy={18} r={15} fill="none" stroke={Colors.border} strokeWidth={3} />
                <Circle cx={18} cy={18} r={15} fill="none" stroke={Colors.primary} strokeWidth={3}
                  strokeDasharray="62 94" strokeDashoffset={23} strokeLinecap="round" />
              </Svg>
              <Text style={styles.foodRingPct}>66%</Text>
            </View>
          </View>

          <View style={styles.foodDivider} />

          <View style={styles.macroSection}>
            <View style={styles.macroRow}>
              <Text style={styles.macroLabel}>Proteína</Text>
              <View style={styles.macroTrack}>
                <View style={[styles.macroFill, { width: '72%', backgroundColor: Colors.primary }]} />
              </View>
              <Text style={styles.macroVal}>98 g</Text>
            </View>
            <View style={styles.macroRow}>
              <Text style={styles.macroLabel}>Carboidratos</Text>
              <View style={styles.macroTrack}>
                <View style={[styles.macroFill, { width: '58%', backgroundColor: Colors.chartResidual }]} />
              </View>
              <Text style={styles.macroVal}>180 g</Text>
            </View>
            <View style={styles.macroRow}>
              <Text style={styles.macroLabel}>Gordura</Text>
              <View style={styles.macroTrack}>
                <View style={[styles.macroFill, { width: '44%', backgroundColor: Colors.warning }]} />
              </View>
              <Text style={styles.macroVal}>62 g</Text>
            </View>
          </View>

          <View style={styles.foodDivider} />

          {[
            { emoji: '🥣', name: 'Pequeno-almoço', desc: 'Aveia + fruta · manual', kcal: 420 },
            { emoji: '🍱', name: 'Almoço',         desc: 'Frango + arroz · manual', kcal: 580 },
            { emoji: '📷', name: 'Lanche',          desc: '♦ IA identificou · iogurte grego', kcal: 240, ai: true },
          ].map((m) => (
            <View key={m.name} style={styles.mealRow}>
              <Text style={styles.mealIcon}>{m.emoji}</Text>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{m.name}</Text>
                <Text style={[styles.mealDesc, m.ai && { color: Colors.primary }]}>{m.desc}</Text>
              </View>
              <Text style={styles.mealKcal}>{m.kcal} kcal</Text>
            </View>
          ))}

          <View style={styles.foodDivider} />

          <View style={styles.foodActions}>
            <Pressable style={[styles.foodBtnManual]}>
              <Text style={styles.foodBtnManualText}>+ Manual</Text>
              <View style={styles.badgeFree}><Text style={styles.badgeFreeText}>FREE</Text></View>
            </Pressable>
            <Pressable style={[styles.foodBtnAi, Shadow.primary]}>
              <Text style={styles.foodBtnAiText}>📷 Foto IA</Text>
              <View style={styles.badgePro}><Text style={styles.badgeProText}>PRO</Text></View>
            </Pressable>
          </View>
        </View>

        <BioRespostaCard />
        <VFCGaugeCard />

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

  foodCard: {
    backgroundColor: Colors.bg, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.border,
    overflow: 'hidden', marginBottom: Spacing.md,
  },
  foodHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
  },
  foodHeaderLeft: { flex: 1, marginRight: 12 },
  foodTitle: { fontSize: 15, fontWeight: '600', color: Colors.text, letterSpacing: -0.2 },
  foodSub:   { fontSize: 12, color: Colors.textSecondary, marginTop: 3 },
  foodRing: {
    width: 44, height: 44,
    alignItems: 'center', justifyContent: 'center',
  },
  foodRingPct: { fontSize: 9, fontWeight: '700', color: Colors.primary },
  foodDivider: { height: 0.5, backgroundColor: Colors.border },
  macroSection: { paddingHorizontal: Spacing.md, paddingVertical: 12, gap: 8 },
  macroRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  macroLabel: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary, width: 84, flexShrink: 0 },
  macroTrack: { flex: 1, height: 5, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  macroFill:  { height: 5, borderRadius: 3 },
  macroVal:   { fontSize: 14, fontWeight: '600', color: Colors.text, width: 36, textAlign: 'right', flexShrink: 0 },
  mealRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    borderTopWidth: 0.5, borderTopColor: Colors.border,
  },
  mealIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  mealInfo: { flex: 1 },
  mealName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  mealDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  mealKcal: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  foodActions: {
    flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md,
  },
  foodBtnManual: {
    flex: 1, backgroundColor: Colors.bgSecondary,
    borderRadius: Radius.md, paddingVertical: 13,
    borderWidth: 0.5, borderColor: Colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  foodBtnManualText: { fontSize: 14, fontWeight: '600', color: Colors.text },
  foodBtnAi: {
    flex: 1, backgroundColor: Colors.primary,
    borderRadius: Radius.md, paddingVertical: 13,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  foodBtnAiText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  badgeFree: {
    backgroundColor: Colors.border, borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  badgeFreeText: { fontSize: 9, fontWeight: '700', color: Colors.textSecondary },
  badgePro: {
    borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  badgeProText: { fontSize: 9, fontWeight: '700', color: '#fff' },

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
