import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PhoneFrame } from '@/components/phone-frame';
import { colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded] = useFonts({
    'SKSeren-Medium': require('@/assets/fonts/SKSeren-Medium.ttf'),
    'SKSeren-SemiBold': require('@/assets/fonts/SKSeren-SemiBold.ttf'),
    'SKSeren-Bold': require('@/assets/fonts/SKSeren-Bold.ttf'),
    'SKSeren-ExtraBold': require('@/assets/fonts/SKSeren-ExtraBold.ttf'),
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <PhoneFrame>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              animationDuration: 300,
              contentStyle: { backgroundColor: colors.bgMain },
            }}>
            <Stack.Screen name="home" options={{ animation: 'fade', gestureEnabled: false }} />
            <Stack.Screen name="log/camera" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="reward" options={{ gestureEnabled: false }} />
            <Stack.Screen name="streak" options={{ gestureEnabled: false }} />
          </Stack>
        </PhoneFrame>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
