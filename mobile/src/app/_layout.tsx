import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import { NotoSansTC_400Regular, NotoSansTC_500Medium } from '@expo-google-fonts/noto-sans-tc';
import { NotoSerifTC_700Bold } from '@expo-google-fonts/noto-serif-tc';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
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
      <Head>
        <title>食材圖鑑</title>
        <meta
          name="description"
          content="台灣常見蔬菜、水果、海鮮、肉品的圖鑑型 App，協助你在傳統市場快速了解當季食材與挑選重點。"
        />
      </Head>
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
