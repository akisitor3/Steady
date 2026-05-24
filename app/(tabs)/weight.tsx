import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, TextInput,
} from 'react-native';
import * as db from '@/lib/db';
import { Colors, Spacing, Radius, Shadow } from '@/constants/theme';

export default function WeightScreen() {
  const [weights, setWeights] = useState<db.WeightRow[]>([]);
  const [input, setInput] = useState('');

  async function load() { setWeights(await db.getWeights()); }
  useEffect(() => { load(); }, []);

  async function save() {
    const kg = parseFloat(input.replace(',', '.'));
    if (!kg || kg <= 0) return;
    await db.addWeight({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: Date.now(),
      weight_kg: kg,
    });
    setInput('');
    load();
  }

  const latest = weights.length ? weights[weights.length - 1].weight_kg : null;
  const first = weights.length ? weights[0].weight_kg : null;
  const delta = latest != null && first != null ? latest - first : null;
  const deltaPositive = delta != null && delta > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <Text style={styles.h1}>Peso</Text>

        <View style={styles.cardsRow}>
          <View style={[styles.stat, Shadow.sm]}>
            <Text style={styles.statLabel}>ATUAL</Text>
            <Text style={styles.statValue}>
              {latest != null ? latest.toFixed(1) : '—'}
              <Text style={styles.statUnit}>{latest != null ? ' kg' : ''}</Text>
            </Text>
          </View>
          <View style={[styles.stat, Shadow.sm]}>
            <Text style={styles.statLabel}>VARIAÇÃO TOTAL</Text>
            <Text style={[styles.statValue, delta != null && {
              color: deltaPositive ? Colors.danger : Colors.success,
            }]}>
              {delta != null
                ? `${deltaPositive ? '+' : ''}${delta.toFixed(1)}`
                : '—'}
              <Text style={styles.statUnit}>{delta != null ? ' kg' : ''}</Text>
            </Text>
          </View>
        </View>

        <View style={[styles.inputCard, Shadow.sm]}>
          <TextInput
            style={styles.input}
            placeholder="Novo peso em kg"
            keyboardType="decimal-pad"
            value={input}
            onChangeText={setInput}
            placeholderTextColor={Colors.textTertiary}
            returnKeyType="done"
            onSubmitEditing={save}
          />
          <Pressable style={styles.saveBtn} onPress={save}>
            <Text style={styles.saveBtnText}>Guardar</Text>
          </Pressable>
        </View>

        {weights.length > 0 && (
          <View style={[styles.historyCard, Shadow.sm]}>
            <Text style={styles.histTitle}>Histórico</Text>
            {[...weights].reverse().slice(0, 10).map((w, i) => {
              const prev = [...weights].reverse()[i + 1];
              const d = prev ? w.weight_kg - prev.weight_kg : null;
              return (
                <View key={w.id} style={[styles.histRow, i === 0 && { borderTopWidth: 0 }]}>
                  <View style={styles.histLeft}>
                    <View style={[styles.histDot, i > 0 && { backgroundColor: Colors.textTertiary }]} />
                    <Text style={styles.histVal}>{w.weight_kg.toFixed(1)} kg</Text>
                  </View>
                  <View style={styles.histRight}>
                    {d != null && (
                      <Text style={[styles.histDelta, { color: d > 0 ? Colors.danger : Colors.success }]}>
                        {d > 0 ? '+' : ''}{d.toFixed(1)}
                      </Text>
                    )}
                    <Text style={styles.histDate}>
                      {new Date(w.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgSecondary },
  container: { padding: Spacing.md, paddingBottom: 40 },

  h1: {
    fontSize: 30, fontWeight: '700', color: Colors.primary,
    letterSpacing: -0.5, marginBottom: Spacing.lg,
  },

  cardsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  stat: {
    flex: 1, backgroundColor: Colors.bg, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.border, padding: Spacing.md,
  },
  statLabel: {
    fontSize: 10, fontWeight: '600', color: Colors.textTertiary,
    letterSpacing: 0.5, marginBottom: 6,
  },
  statValue: { fontSize: 24, fontWeight: '700', color: Colors.text, letterSpacing: -0.5 },
  statUnit: { fontSize: 14, fontWeight: '400', color: Colors.textSecondary },

  inputCard: {
    flexDirection: 'row', gap: Spacing.sm, backgroundColor: Colors.bg,
    borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.border,
    padding: Spacing.md, marginBottom: Spacing.md, alignItems: 'center',
  },
  input: { flex: 1, fontSize: 16, color: Colors.text },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: 10, paddingHorizontal: 18, justifyContent: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  historyCard: {
    backgroundColor: Colors.bg, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.border, overflow: 'hidden',
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
  histVal: { fontSize: 14, fontWeight: '500', color: Colors.text },
  histRight: { alignItems: 'flex-end', gap: 2 },
  histDelta: { fontSize: 12, fontWeight: '600' },
  histDate: { fontSize: 13, color: Colors.textSecondary },
});
