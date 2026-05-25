import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Modal, SafeAreaView,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Spacing, Radius, Shadow } from '@/constants/theme';
import { useFoodStore } from '@/lib/store/useFoodStore';

type MealSlot = 'breakfast' | 'lunch' | 'snack' | 'dinner';

type Meal = {
  id: string;
  slot: MealSlot;
  name: string;
  desc: string;
  kcal: number;
  prot: number;
  carbs: number;
  fat: number;
  byAi?: boolean;
};

const SLOTS: { key: MealSlot; label: string; emoji: string }[] = [
  { key: 'breakfast', label: 'Pequeno-almoço', emoji: '🥣' },
  { key: 'lunch',     label: 'Almoço',         emoji: '🍱' },
  { key: 'snack',     label: 'Lanche',          emoji: '📷' },
  { key: 'dinner',    label: 'Jantar',          emoji: '🌙' },
];

const PROT_GOAL  = 150;
const CARBS_GOAL = 265;
const FAT_GOAL   = 67;

function RingGauge({ pct }: { pct: number }) {
  const R = 15;
  const CIRC = 2 * Math.PI * R;
  const dash = Math.min(1, pct) * CIRC;
  return (
    <View style={ring.wrap}>
      <Svg width={44} height={44} viewBox="0 0 36 36">
        <Circle cx={18} cy={18} r={R} fill="none" stroke={Colors.border} strokeWidth={3} />
        <Circle
          cx={18} cy={18} r={R} fill="none"
          stroke={Colors.primary} strokeWidth={3}
          strokeDasharray={`${dash} ${CIRC}`}
          strokeDashoffset={CIRC / 4}
          strokeLinecap="round"
        />
      </Svg>
      <Text style={ring.label}>{Math.round(pct * 100)}%</Text>
    </View>
  );
}

const ring = StyleSheet.create({
  wrap:  { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  label: { position: 'absolute', fontSize: 9, fontWeight: '700', color: Colors.primary },
});

function MacroBar({ label, value, goal, color }: {
  label: string; value: number; goal: number; color: string;
}) {
  const pct = Math.min(1, value / goal);
  return (
    <View style={bar.row}>
      <Text style={bar.label}>{label}</Text>
      <View style={bar.track}>
        <View style={[bar.fill, { width: `${pct * 100}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={bar.val}>{value} g</Text>
    </View>
  );
}

const bar = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary, width: 90, flexShrink: 0 },
  track: { flex: 1, height: 5, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  fill:  { height: 5, borderRadius: 3 },
  val:   { fontSize: 14, fontWeight: '700', color: Colors.text, width: 36, textAlign: 'right', flexShrink: 0 },
});

export default function FoodScreen() {
  const { meals, loadMeals, saveMeal: storeSaveMeal, deleteMeal } = useFoodStore();
  const [activeSlot, setActiveSlot] = useState<typeof SLOTS[number] | null>(null);
  const [form, setForm] = useState({ name: '', desc: '', kcal: '', prot: '', carbs: '', fat: '' });

  useEffect(() => { loadMeals(); }, []);

  const totalKcal  = meals.reduce((s, m) => s + m.kcal, 0);
  const totalProt  = meals.reduce((s, m) => s + m.prot, 0);
  const totalCarbs = meals.reduce((s, m) => s + m.carbs, 0);
  const totalFat   = meals.reduce((s, m) => s + m.fat, 0);

  const overallPct = (totalProt / PROT_GOAL + totalCarbs / CARBS_GOAL + totalFat / FAT_GOAL) / 3;

  const todayLabel = new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });

  function openSlot(slot: typeof SLOTS[number]) {
    const existing = meals.find((m) => m.slot === slot.key);
    setForm(existing
      ? { name: existing.name, desc: existing.desc, kcal: String(existing.kcal), prot: String(existing.prot), carbs: String(existing.carbs), fat: String(existing.fat) }
      : { name: slot.label, desc: '', kcal: '', prot: '', carbs: '', fat: '' }
    );
    setActiveSlot(slot);
  }

  function saveMeal() {
    if (!activeSlot || !form.kcal) return;
    const meal: Meal = {
      id: Date.now().toString(),
      slot: activeSlot.key,
      name: form.name || activeSlot.label,
      desc: form.desc,
      kcal: Number(form.kcal),
      prot: Number(form.prot) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
    };
    storeSaveMeal(meal);
    setActiveSlot(null);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <Text style={styles.h1}>Comida</Text>

        {/* ── Card único ── */}
        <View style={[styles.card, Shadow.sm]}>

          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.cardTitle}>Refeições de hoje</Text>
              <Text style={styles.cardSub}>
                {todayLabel} · {totalKcal.toLocaleString('pt-PT')} kcal registadas
              </Text>
            </View>
            <RingGauge pct={overallPct} />
          </View>

          <View style={styles.divider} />

          {/* Macros */}
          <View style={styles.macroSection}>
            <MacroBar label="Proteína"     value={totalProt}  goal={PROT_GOAL}  color={Colors.primary} />
            <MacroBar label="Carboidratos" value={totalCarbs} goal={CARBS_GOAL} color="#85B7EB" />
            <MacroBar label="Gordura"      value={totalFat}   goal={FAT_GOAL}   color="#D97706" />
          </View>

          <View style={styles.divider} />

          {/* Refeições */}
          {SLOTS.filter((s) => s.key !== 'dinner').map((slot) => {
            const meal = meals.find((m) => m.slot === slot.key);
            return (
              <Pressable key={slot.key} style={styles.mealRow} onPress={() => openSlot(slot)}>
                <Text style={styles.mealIcon}>{slot.emoji}</Text>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName}>{meal?.name ?? slot.label}</Text>
                  {meal?.byAi ? (
                    <Text style={styles.mealDescAi}>
                      <Text style={styles.aiDot}>♦ IA identificou · </Text>
                      {meal.desc}
                    </Text>
                  ) : (
                    <Text style={meal ? styles.mealDesc : styles.mealDescEmpty}>
                      {meal?.desc ?? 'Não registado'}
                    </Text>
                  )}
                </View>
                {meal
                  ? <Text style={styles.mealKcal}>{meal.kcal} kcal</Text>
                  : <View style={styles.addBtn}><Text style={styles.addBtnText}>+</Text></View>
                }
              </Pressable>
            );
          })}

          {/* Jantar — slot vazio */}
          {(() => {
            const meal = meals.find((m) => m.slot === 'dinner');
            const slot = SLOTS[3];
            return (
              <Pressable style={styles.mealRow} onPress={() => openSlot(slot)}>
                <Text style={styles.mealIcon}>{slot.emoji}</Text>
                <View style={styles.mealInfo}>
                  <Text style={[styles.mealName, !meal && styles.mealNameEmpty]}>{meal?.name ?? slot.label}</Text>
                  <Text style={meal ? styles.mealDesc : styles.mealDescEmpty}>
                    {meal?.desc ?? 'Não registado'}
                  </Text>
                </View>
                {meal
                  ? <Text style={styles.mealKcal}>{meal.kcal} kcal</Text>
                  : <View style={styles.addBtn}><Text style={styles.addBtnText}>+</Text></View>
                }
              </Pressable>
            );
          })()}

          <View style={styles.divider} />

          {/* Botões */}
          <View style={styles.cardActions}>
            <Pressable style={styles.btnManual} onPress={() => openSlot(SLOTS[0])}>
              <Text style={styles.btnManualText}>+ Manual</Text>
              <View style={styles.badgeFree}><Text style={styles.badgeFreeText}>FREE</Text></View>
            </Pressable>
            <Pressable style={[styles.btnAi, Shadow.primary]}>
              <Text style={styles.btnAiText}>📷 Foto IA</Text>
              <View style={styles.badgePro}><Text style={styles.badgeProText}>PRO</Text></View>
            </Pressable>
          </View>

        </View>

      </ScrollView>

      {/* ── Modal manual ── */}
      <Modal
        visible={!!activeSlot}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveSlot(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.backdrop}
        >
          <Pressable style={{ flex: 1 }} onPress={() => setActiveSlot(null)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{activeSlot?.label ?? 'Refeição'}</Text>
            <Text style={styles.sheetSub}>Registo manual</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome (ex: Frango grelhado)"
              placeholderTextColor={Colors.textTertiary}
              value={form.name}
              onChangeText={(t) => setForm((f) => ({ ...f, name: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Descrição (opcional)"
              placeholderTextColor={Colors.textTertiary}
              value={form.desc}
              onChangeText={(t) => setForm((f) => ({ ...f, desc: t }))}
            />
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="kcal *"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="numeric"
                value={form.kcal}
                onChangeText={(t) => setForm((f) => ({ ...f, kcal: t }))}
              />
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="Proteína (g)"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="numeric"
                value={form.prot}
                onChangeText={(t) => setForm((f) => ({ ...f, prot: t }))}
              />
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="Carbs (g)"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="numeric"
                value={form.carbs}
                onChangeText={(t) => setForm((f) => ({ ...f, carbs: t }))}
              />
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="Gordura (g)"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="numeric"
                value={form.fat}
                onChangeText={(t) => setForm((f) => ({ ...f, fat: t }))}
              />
            </View>

            <Pressable
              style={[styles.saveBtn, !form.kcal && styles.saveBtnDisabled]}
              onPress={saveMeal}
              disabled={!form.kcal}
            >
              <Text style={styles.saveBtnText}>Guardar refeição</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: Colors.bgSecondary },
  container: { padding: Spacing.md, paddingBottom: 40 },

  h1: { fontSize: 30, fontWeight: '700', color: Colors.primary, letterSpacing: -0.5, marginBottom: Spacing.md },

  card: {
    backgroundColor: Colors.bg,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: 'hidden',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  cardHeaderLeft: { flex: 1, marginRight: 12 },
  cardTitle:      { fontSize: 15, fontWeight: '600', color: Colors.text, letterSpacing: -0.2 },
  cardSub:        { fontSize: 12, color: Colors.textSecondary, marginTop: 3 },

  divider: { height: 0.5, backgroundColor: Colors.border },

  macroSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    gap: 12,
  },

  mealRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: Spacing.md, paddingVertical: 13,
    borderTopWidth: 0.5, borderTopColor: Colors.border,
  },
  mealIcon:      { fontSize: 20, width: 30, textAlign: 'center' },
  mealInfo:      { flex: 1 },
  mealName:      { fontSize: 14, fontWeight: '600', color: Colors.text },
  mealNameEmpty: { color: Colors.textTertiary },
  mealDesc:      { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  mealDescEmpty: { fontSize: 12, color: Colors.textTertiary, marginTop: 1 },
  mealDescAi:    { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  aiDot:         { color: Colors.primary, fontWeight: '600' },
  mealKcal:      { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  addBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { fontSize: 18, lineHeight: 22, color: Colors.primary, fontWeight: '400' },

  cardActions: {
    flexDirection: 'row', gap: Spacing.sm,
    padding: Spacing.md,
  },
  btnManual: {
    flex: 1, backgroundColor: Colors.bgSecondary,
    borderRadius: Radius.md, paddingVertical: 13,
    borderWidth: 0.5, borderColor: Colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  btnManualText: { fontSize: 14, fontWeight: '600', color: Colors.text },
  btnAi: {
    flex: 1, backgroundColor: Colors.primary,
    borderRadius: Radius.md, paddingVertical: 13,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  btnAiText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  badgeFree: {
    backgroundColor: Colors.border, borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  badgeFreeText: { fontSize: 9, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.3 },
  badgePro: {
    borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  badgeProText: { fontSize: 9, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.bg,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing.lg, paddingBottom: 40,
  },
  sheetHandle: {
    width: 36, height: 4, backgroundColor: Colors.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.md,
  },
  sheetTitle:  { fontSize: 20, fontWeight: '700', color: Colors.text, letterSpacing: -0.3 },
  sheetSub:    { fontSize: 13, color: Colors.textSecondary, marginTop: 4, marginBottom: Spacing.lg },

  input: {
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.md,
    borderWidth: 0.5, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: Colors.text,
    marginBottom: Spacing.sm,
  },
  inputRow:  { flexDirection: 'row', gap: Spacing.sm },
  inputHalf: { flex: 1 },

  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: 16, alignItems: 'center', marginTop: 4,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
