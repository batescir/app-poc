import { Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';
import { PTSerif_400Regular, PTSerif_700Bold } from '@expo-google-fonts/pt-serif';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useTheme } from '../theme/useTheme';

export default function RootLayout() {
  const { scheme, colors } = useTheme();
  const [fontsLoaded, fontError] = useFonts({ PTSerif_400Regular, PTSerif_700Bold, Lato_400Regular, Lato_700Bold });
  // Fonts ship in the bundle, so this resolves almost immediately; on failure, render with system fonts.
  if (!fontsLoaded && !fontError) return null;
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Anchorage Daily News' }} />
      </Stack>
    </>
  );
}
