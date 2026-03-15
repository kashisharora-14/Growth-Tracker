import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LaunchScreen } from "@/components/LaunchScreen";
import { RecoveryProvider } from "@/context/RecoveryContext";
import { RestartProvider } from "@/context/RestartContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen
        name="coping"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [showInitialLaunch, setShowInitialLaunch] = useState(true);
  const isRestartRef = useRef(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <RecoveryProvider>
            <RestartProvider>
              {({ showLaunch, launchKey, onLaunchFinish }) => {
                isRestartRef.current = showLaunch;
                return (
                  <GestureHandlerRootView>
                    <KeyboardProvider>
                      <RootLayoutNav />
                      {showInitialLaunch && (
                        <LaunchScreen
                          key="initial"
                          onFinish={() => setShowInitialLaunch(false)}
                        />
                      )}
                      {showLaunch && (
                        <LaunchScreen
                          key={`restart-${launchKey}`}
                          onFinish={() => {
                            onLaunchFinish();
                            router.replace("/onboarding");
                          }}
                        />
                      )}
                    </KeyboardProvider>
                  </GestureHandlerRootView>
                );
              }}
            </RestartProvider>
          </RecoveryProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
