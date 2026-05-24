import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, TextInput,
} from 'react-native';
import * as db from '@/lib/db';
import { Colors, Spacing, Radius } from '@/constants/theme';

export default function WeightScreen() {
  const [weights, setWeights] = useState<db.WeightRow[]>([]);
  const [input, setInput] = useState('');

  async function load() {
    setWeights(await db.getWeights());
  }
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

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.h1}>Peso</Text>

        <View style={styles.cardsRow}>
          <Stat label="Atual" value={latest != null ? `${latest.toFixed(1)} kg` : '—'} />
          <Stat
            label="Variação"
            value={delta != null ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)} kg` : '—'}
          />
        </View>

        <View style={styles.inputCard}>
          <TextInput
            style={styles.input}
            placeholder="Peso em kg"
            keyboardType="decimal-pad"
            value={input}
            onChangeText={setInput}
            placeholderTextColor={Colors.textTertiary}
          />
          <Pressable style={styles.saveBtn} onPress={save}>
            <Text style={styles.saveBtnText}>Guardar</Text>
          </Pressable>
        </View>

        {weights.length > 0 && (
          <View style={styles.history}>
            <Text style={styles.histTitle}>Histórico</Text>
            {[...weights].reverse().slice(0, 10).map((w) => (
              <View key={w.id} style={styles.histRow}>
                <Text style={styles.histVal}>{w.weight_kg.toFixed(1)} kg</Text>
                <Text style={styles.histDate}>{new Date(w.date).toLocaleDateString('pt-PT')}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgSecondary },
  container: { padding: Spacing.md },
  h1: { fontSize: 28, fontWeight: '600', color: Colors.primary, marginBottom: Spacing.lg },
  cardsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  stat: {
    flex: 1, backgroundColor: Colors.bg, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.border, padding: Spacing.md,
  },
  statLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: '600', color: Colors.text },
  inputCard: {
    flexDirection: 'row', gap: Spacing.sm, backgroundColor: Colors.bg,
    borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.border,
    padding: Spacing.md, marginBottom: Spacing.md,
  },
  input: { flex: 1, fontSize: 16, color: Colors.text },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: 10, paddingHorizontal: 18, justifyContent: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '600' },
  history: {
    backgroundColor: Colors.bg, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.border, padding: Spacing.md,
  },
  histTitle: { fontSize: 15, fontWeight: '500', color: Colors.text, marginBottom: Spacing.sm },
  histRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderTopWidth: 0.5, borderTopColor: Colors.border,
  },
  histVal: { fontSize: 14, fontWeight: '500', color: Colors.text },
  histDate: { fontSize: 14, color: Colors.textSecondary },
});
