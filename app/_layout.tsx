import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

// 1. นำเข้าฟอนต์ Prompt
import {
  Prompt_400Regular,
  Prompt_500Medium,
  Prompt_700Bold,
  useFonts
} from '@expo-google-fonts/prompt';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // 2. สั่งโหลดฟอนต์ (ใช้ชื่อที่ถูกต้อง)
  const [loaded, error] = useFonts({
    Prompt_400Regular,
    Prompt_500Medium,
    Prompt_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null; // รอจนกว่าฟอนต์จะโหลดเสร็จ
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* 🌟 ปิด Header แบบเหมาเข่งตรงนี้เลยครับ คำว่า index จะหายวับไปแน่นอน! */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="index" />
        {/* ดักเผื่อหน้าสมัครสมาชิกไว้ให้ด้วยเลยครับ */}
        <Stack.Screen name="register" />
        {/* หน้า Modal ถ้าอยากให้มี Header ค่อยมาเปิดเป็นหน้าๆ ไปครับ */}
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}