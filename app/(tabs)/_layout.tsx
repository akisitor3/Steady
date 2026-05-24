import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { Colors } from '@/constants/theme';

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, opacity: color === Colors.primary ? 1 : 0.4 }}>{emoji}</Text>
    </View>
  );
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
          borderTopWidth: 0.5,
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', letterSpacing: 0.1 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Doses',
          tabBarIcon: ({ color }) => <TabIcon emoji="💉" color={color} />,
        }}
      />
      <Tabs.Screen
        name="weight"
        options={{
          title: 'Peso',
          tabBarIcon: ({ color }) => <TabIcon emoji="⚖️" color={color} />,
        }}
      />
      <Tabs.Screen
        name="food"
        options={{
          title: 'Comida',
          tabBarIcon: ({ color }) => <TabIcon emoji="🥗" color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Mais',
          tabBarIcon: ({ color }) => <TabIcon emoji="⚙️" color={color} />,
        }}
      />
    </Tabs>
  );
}
