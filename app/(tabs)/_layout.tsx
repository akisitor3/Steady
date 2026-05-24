import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Colors } from '@/constants/theme';

// Ícones simples por agora (emoji-free, texto). Trocar por @expo/vector-icons depois.
function TabIcon({ label, color }: { label: string; color: string }) {
  return <Text style={{ color, fontSize: 11, fontWeight: '500' }}>{label}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.bg,
          borderTopColor: Colors.border,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Doses', tabBarIcon: ({ color }) => <TabIcon label="💉" color={color} /> }}
      />
      <Tabs.Screen
        name="weight"
        options={{ title: 'Peso', tabBarIcon: ({ color }) => <TabIcon label="⚖️" color={color} /> }}
      />
      <Tabs.Screen
        name="more"
        options={{ title: 'Mais', tabBarIcon: ({ color }) => <TabIcon label="•••" color={color} /> }}
      />
    </Tabs>
  );
}
