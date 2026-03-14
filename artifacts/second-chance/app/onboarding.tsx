import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { AddictionType, useRecovery } from "@/context/RecoveryContext";

const ADDICTION_OPTIONS: { label: string; value: AddictionType; icon: React.ComponentProps<typeof Feather>["name"] }[] = [
  { label: "Alcohol", value: "alcohol", icon: "droplet" },
  { label: "Drugs", value: "drugs", icon: "activity" },
  { label: "Nicotine", value: "nicotine", icon: "wind" },
  { label: "Other", value: "other", icon: "circle" },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { setProfile } = useRecovery();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [addiction, setAddiction] = useState<AddictionType>("alcohol");
  const [sobrietyDate, setSobrietyDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const topPad =
    Platform.OS === "web" ? insets.top + 67 : insets.top + 24;
  const bottomPad =
    Platform.OS === "web" ? insets.bottom + 34 : insets.bottom + 24;

  const handleFinish = async () => {
    await setProfile({
      name: name.trim() || "Friend",
      addictionType: addiction,
      sobrietyStartDate: new Date(sobrietyDate).toISOString(),
      emergencyContacts: [],
      isOnboarded: true,
    });
    router.replace("/");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad, paddingBottom: bottomPad },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Feather name="x" size={22} color={Colors.light.textSecondary} />
      </Pressable>

      <View style={styles.stepsRow}>
        {[0, 1, 2].map((s) => (
          <View
            key={s}
            style={[styles.stepDot, step >= s && styles.stepDotActive]}
          />
        ))}
      </View>

      {step === 0 && (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>What's your name?</Text>
          <Text style={styles.stepSub}>
            This stays private — we just want to know what to call you.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Your first name or a nickname"
            placeholderTextColor={Colors.light.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="next"
            onSubmitEditing={() => setStep(1)}
          />
          <Pressable
            style={[styles.nextBtn, !name.trim() && { opacity: 0.5 }]}
            onPress={() => name.trim() && setStep(1)}
          >
            <Text style={styles.nextBtnText}>Continue</Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </Pressable>
        </View>
      )}

      {step === 1 && (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>What are you recovering from?</Text>
          <Text style={styles.stepSub}>
            This helps us personalize your experience.
          </Text>
          <View style={styles.addictionGrid}>
            {ADDICTION_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[
                  styles.addictionCard,
                  addiction === opt.value && styles.addictionCardSelected,
                ]}
                onPress={() => setAddiction(opt.value)}
              >
                <View
                  style={[
                    styles.addictionIcon,
                    addiction === opt.value && styles.addictionIconSelected,
                  ]}
                >
                  <Feather
                    name={opt.icon}
                    size={24}
                    color={
                      addiction === opt.value ? "#fff" : Colors.light.tint
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.addictionLabel,
                    addiction === opt.value && styles.addictionLabelSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.btnRow}>
            <Pressable style={styles.backStepBtn} onPress={() => setStep(0)}>
              <Feather name="arrow-left" size={18} color={Colors.light.tint} />
            </Pressable>
            <Pressable style={[styles.nextBtn, { flex: 1 }]} onPress={() => setStep(2)}>
              <Text style={styles.nextBtnText}>Continue</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}

      {step === 2 && (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>When did you start?</Text>
          <Text style={styles.stepSub}>
            When did your sober journey begin? Even if it's today, that
            counts.
          </Text>
          <View style={styles.dateOptions}>
            {[
              { label: "Today", offset: 0 },
              { label: "1 week ago", offset: 7 },
              { label: "2 weeks ago", offset: 14 },
              { label: "1 month ago", offset: 30 },
              { label: "3 months ago", offset: 90 },
            ].map(({ label, offset }) => {
              const d = new Date();
              d.setDate(d.getDate() - offset);
              const iso = d.toISOString().split("T")[0];
              return (
                <Pressable
                  key={label}
                  style={[
                    styles.dateOption,
                    sobrietyDate === iso && styles.dateOptionSelected,
                  ]}
                  onPress={() => setSobrietyDate(iso)}
                >
                  <Text
                    style={[
                      styles.dateOptionText,
                      sobrietyDate === iso && styles.dateOptionTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.btnRow}>
            <Pressable style={styles.backStepBtn} onPress={() => setStep(1)}>
              <Feather name="arrow-left" size={18} color={Colors.light.tint} />
            </Pressable>
            <Pressable
              style={[styles.nextBtn, { flex: 1, backgroundColor: Colors.light.tint }]}
              onPress={handleFinish}
            >
              <Text style={styles.nextBtnText}>Start My Journey</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
          </View>
          <Text style={styles.privacyNote}>
            Your data stays on your device. We never share it.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    paddingHorizontal: 24,
    gap: 24,
    flexGrow: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepsRow: {
    flexDirection: "row",
    gap: 8,
  },
  stepDot: {
    height: 4,
    flex: 1,
    borderRadius: 2,
    backgroundColor: Colors.light.border,
  },
  stepDotActive: {
    backgroundColor: Colors.light.tint,
  },
  stepContent: {
    gap: 20,
    flex: 1,
  },
  stepTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    lineHeight: 36,
  },
  stepSub: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 24,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  nextBtn: {
    backgroundColor: Colors.light.tint,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  nextBtnText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  addictionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  addictionCard: {
    flex: 1,
    minWidth: "44%",
    backgroundColor: Colors.light.card,
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  addictionCardSelected: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  addictionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  addictionIconSelected: {
    backgroundColor: Colors.light.tint,
  },
  addictionLabel: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textSecondary,
  },
  addictionLabelSelected: {
    color: Colors.light.tint,
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
  },
  backStepBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  dateOptions: {
    gap: 10,
  },
  dateOption: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: Colors.light.card,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  dateOptionSelected: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  dateOptionText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  dateOptionTextSelected: {
    color: Colors.light.tint,
    fontFamily: "Inter_600SemiBold",
  },
  privacyNote: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
});
