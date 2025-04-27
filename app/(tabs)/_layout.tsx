import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Chrome as Home, CirclePlus as PlusCircle, Settings, Download } from 'lucide-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1E40AF',
        tabBarInactiveTintColor: isDark ? '#9CA3AF' : '#6B7280',
        tabBarStyle: {
          backgroundColor: isDark ? '#111827' : '#FFFFFF',
          borderTopColor: isDark ? '#374151' : '#E5E7EB',
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: isDark ? '#111827' : '#FFFFFF',
        },
        headerTitleStyle: {
          fontFamily: 'Inter-Bold',
          fontSize: 18,
        },
        headerTintColor: isDark ? '#F9FAFB' : '#1F2937',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Passwords',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add New',
          tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="export"
        options={{
          title: 'Export',
          tabBarIcon: ({ color, size }) => <Download size={size} color={color} />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          headerShown: true,
        }}
      />
    </Tabs>
  );
}