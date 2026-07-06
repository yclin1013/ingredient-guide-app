import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import { NotoSansTC_400Regular, NotoSansTC_500Medium } from '@expo-google-fonts/noto-sans-tc';
import { NotoSerifTC_700Bold } from '@expo-google-fonts/noto-serif-tc';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { PAPER } from '../theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    NotoSerifTC_700Bold,
    NotoSansTC_400Regular,
    NotoSansTC_500Medium,
    JetBrainsMono_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: PAPER },
        }}
      />
    </>
  );
}
