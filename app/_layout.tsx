import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/context/AuthContext';
import { PasswordProvider } from '@/context/PasswordContext';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <PasswordProvider>
        <Stack screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: '#F5F7FA' },
          headerStyle: { backgroundColor: '#6366F1' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontFamily: 'Inter-Bold' },
          animation: 'slide_from_right' 
        }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="password/[id]" options={{ 
            headerShown: true,
            title: 'Password Details',
          }} />
          <Stack.Screen name="settings" options={{ 
            headerShown: true,
            title: 'Settings',
          }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ 
            title: 'Not Found',
            headerShown: true
          }} />
        </Stack>
        <StatusBar style="light" />
      </PasswordProvider>
    </AuthProvider>
  );
}