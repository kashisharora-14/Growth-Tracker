import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

export default function RecoveryScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <Feather name="activity" size={32} color={Colors.light.tint} />
          </View>
          <Text style={styles.title}>Recovery</Text>
          <Text style={styles.subtitle}>
            Your recovery tools and resources will live here. More coming soon.
          </Text>
        </View>

        <View style={styles.placeholder}>
          <Feather name="clock" size={40} color={Colors.light.border} />
          <Text style={styles.placeholderText}>Coming soon</Text>
          <Text style={styles.placeholderSub}>
            We're building something great for your recovery journey.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 120,
    gap: 24,
  },
  hero: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E8F5EF",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 60,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  placeholderText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textMuted,
  },
  placeholderSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    textAlign: "center",
    maxWidth: 240,
    lineHeight: 20,
  },
});
