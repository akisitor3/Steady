import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { useApp } from '@/lib/store/useApp';
import { MEDICATIONS, MedKey } from '@/constants/medications';
import { Colors, Spacing, Radius } from '@/constants/theme';

export default function MoreScreen() {
  const { medication, setMedication } = useApp();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.h1}>Mais</Text>

        <Text style={styles.section}>Medicamento</Text>
        <View style={styles.card}>
          {(Object.keys(MEDICATIONS) as MedKey[]).map((key) => {
            const m = MEDICATIONS[key];
            const active = key === medication;
            return (
              <Pressable
                key={key}
                style={[styles.medRow, active && styles.medRowActive]}
                onPress={() => setMedication(key)}
              >
                <View>
                  <Text style={styles.medName}>{m.generic}</Text>
                  <Text style={styles.medBrand}>{m.brand} · t½ {m.halfLifeDays}d</Text>
                </View>
                {active && <Text style={styles.check}>✓</Text>}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.section}>Em breve</Text>
        <View style={styles.card}>
          {['Água', 'Efeitos secundários', 'Curva intra-semana', 'Foto-calorias (premium)'].map((f) => (
            <View key={f} style={styles.soonRow}>
              <Text style={styles.soonText}>{f}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.disclaimer}>
          Steady é uma ferramenta de bem-estar. Não é dispositivo médico, não diagnostica nem prescreve.
          App independente, não afiliado a qualquer farmacêutica. Consulte sempre o seu médico.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgSecondary },
  container: { padding: Spacing.md },
  h1: { fontSize: 28, fontWeight: '600', color: Colors.primary, marginBottom: Spacing.lg },
  section: { fontSize: 13, color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  card: {
    backgroundColor: Colors.bg, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.border, marginBottom: Spacing.md, overflow: 'hidden',
  },
  medRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.md, borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  medRowActive: { backgroundColor: Colors.primarySoft },
  medName: { fontSize: 16, fontWeight: '500', color: Colors.text },
  medBrand: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  check: { fontSize: 18, color: Colors.primary, fontWeight: '600' },
  soonRow: { padding: Spacing.md, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  soonText: { fontSize: 15, color: Colors.textTertiary },
  disclaimer: { fontSize: 11, color: Colors.textTertiary, lineHeight: 16, marginTop: Spacing.sm },
});
