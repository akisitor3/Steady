import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { useApp } from '@/lib/store/useApp';
import { MEDICATIONS, MedKey } from '@/constants/medications';
import { Colors, Spacing, Radius, Shadow } from '@/constants/theme';

const COMING_SOON = [
  { label: 'Curva intra-semana', desc: 'Gráfico G2 do nível ao longo dos 7 dias' },
  { label: 'Lembretes', desc: 'Notificação no dia da injeção' },
  { label: 'Água', desc: 'Registo diário de hidratação' },
  { label: 'Efeitos secundários', desc: 'Diário de sintomas e tolerância' },
  { label: 'Foto-calorias', desc: 'IA — analisa refeições por fotografia (Premium)' },
];

export default function MoreScreen() {
  const { medication, setMedication } = useApp();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <Text style={styles.h1}>Mais</Text>

        <Text style={styles.sectionLabel}>MEDICAMENTO</Text>
        <View style={[styles.card, Shadow.sm]}>
          {(Object.keys(MEDICATIONS) as MedKey[]).map((key, i, arr) => {
            const m = MEDICATIONS[key];
            const active = key === medication;
            return (
              <Pressable
                key={key}
                style={[
                  styles.medRow,
                  active && styles.medRowActive,
                  i === arr.length - 1 && { borderBottomWidth: 0 },
                ]}
                onPress={() => setMedication(key)}
              >
                <View style={styles.medInfo}>
                  <Text style={styles.medName}>{m.generic}</Text>
                  <Text style={styles.medMeta}>{m.brand} · t½ {m.halfLifeDays}d · ×{m.accumRatio} acumulação</Text>
                </View>
                {active && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>EM BREVE</Text>
        <View style={[styles.card, Shadow.sm]}>
          {COMING_SOON.map((f, i) => (
            <View
              key={f.label}
              style={[styles.soonRow, i === COMING_SOON.length - 1 && { borderBottomWidth: 0 }]}
            >
              <View style={styles.soonDot} />
              <View style={styles.soonInfo}>
                <Text style={styles.soonLabel}>{f.label}</Text>
                <Text style={styles.soonDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>Aviso legal</Text>
          <Text style={styles.disclaimer}>
            Steady é uma ferramenta de bem-estar. Não é dispositivo médico, não diagnostica nem prescreve.
            App independente, não afiliada a qualquer farmacêutica.{'\n'}
            Consulte sempre o seu médico antes de alterar dose ou medicação.
          </Text>
        </View>

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
  sectionLabel: {
    fontSize: 10, fontWeight: '600', color: Colors.textTertiary,
    letterSpacing: 0.8, marginBottom: Spacing.sm, marginTop: Spacing.sm,
  },

  card: {
    backgroundColor: Colors.bg, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.border,
    overflow: 'hidden', marginBottom: Spacing.md,
  },

  medRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.md, borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  medRowActive: { backgroundColor: Colors.primarySoft },
  medInfo: { flex: 1 },
  medName: { fontSize: 16, fontWeight: '600', color: Colors.text },
  medMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  checkBadge: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  checkText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  soonRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    padding: Spacing.md, borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  soonDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.textTertiary, marginTop: 5,
  },
  soonInfo: { flex: 1 },
  soonLabel: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary },
  soonDesc: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },

  disclaimerCard: {
    backgroundColor: Colors.bg, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.border,
    padding: Spacing.md, marginTop: Spacing.sm,
  },
  disclaimerTitle: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  disclaimer: { fontSize: 11, color: Colors.textTertiary, lineHeight: 17 },
});
