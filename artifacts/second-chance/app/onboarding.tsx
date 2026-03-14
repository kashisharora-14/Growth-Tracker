import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
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
import { SlideButton } from "@/components/SlideButton";
import { AddictionType, useRecovery } from "@/context/RecoveryContext";

const TOTAL_STEPS = 7;

const ADDICTION_OPTIONS: {
  label: string;
  value: AddictionType;
  icon: React.ComponentProps<typeof Feather>["name"];
  desc: string;
}[] = [
  { label: "Alcohol", value: "alcohol", icon: "droplet", desc: "Beer, wine, spirits" },
  { label: "Drugs", value: "drugs", icon: "activity", desc: "Prescription or recreational" },
  { label: "Nicotine", value: "nicotine", icon: "wind", desc: "Cigarettes, vape, tobacco" },
  { label: "Other", value: "other", icon: "circle", desc: "Other substances" },
];

const MOTIVATIONS = [
  { id: "health", label: "Reclaim my health", icon: "heart" as const },
  { id: "family", label: "Be there for my family", icon: "users" as const },
  { id: "money", label: "Save money", icon: "dollar-sign" as const },
  { id: "career", label: "Improve my career", icon: "briefcase" as const },
  { id: "self", label: "Prove it to myself", icon: "star" as const },
  { id: "mental", label: "Clear my mind", icon: "cloud" as const },
  { id: "freedom", label: "Feel free again", icon: "compass" as const },
  { id: "future", label: "Build a better future", icon: "sunrise" as const },
];

const FEELINGS = [
  { id: "scared", label: "Scared", icon: "alert-circle" as const, color: "#F5A623" },
  { id: "hopeful", label: "Hopeful", icon: "sun" as const, color: "#4CAF78" },
  { id: "ashamed", label: "Ashamed", icon: "frown" as const, color: "#9B59B6" },
  { id: "determined", label: "Determined", icon: "zap" as const, color: "#E74C3C" },
  { id: "anxious", label: "Anxious", icon: "wind" as const, color: "#5B8DEF" },
  { id: "relieved", label: "Relieved", icon: "smile" as const, color: "#2D7A4F" },
  { id: "lost", label: "Lost", icon: "map" as const, color: "#95A5A6" },
  { id: "ready", label: "Ready", icon: "check-circle" as const, color: "#27AE60" },
];

const USAGE_YEARS = ["Less than 1 year", "1–3 years", "3–7 years", "7–15 years", "15+ years"];

const DATE_OFFSETS = [
  { label: "Today", sub: "It starts right now", offset: 0 },
  { label: "Yesterday", sub: "I started yesterday", offset: 1 },
  { label: "1 week ago", sub: "7 days strong", offset: 7 },
  { label: "2 weeks ago", sub: "14 days in", offset: 14 },
  { label: "1 month ago", sub: "30 days going", offset: 30 },
  { label: "3 months ago", sub: "90 days — incredible", offset: 90 },
];

function StepHeader({
  step,
  total,
  onBack,
}: {
  step: number;
  total: number;
  onBack: () => void;
}) {
  const progress = ((step + 1) / total) * 100;
  return (
    <View style={styles.stepHeader}>
      <Pressable style={styles.backBtn} onPress={onBack}>
        <Feather
          name={step === 0 ? "x" : "arrow-left"}
          size={20}
          color={Colors.light.textSecondary}
        />
      </Pressable>
      <View style={styles.progressTrackOuter}>
        <Animated.View
          style={[styles.progressFillBar, { width: `${progress}%` }]}
        />
      </View>
      <Text style={styles.stepCounter}>
        {step + 1}/{total}
      </Text>
    </View>
  );
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { setProfile } = useRecovery();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [addiction, setAddiction] = useState<AddictionType>("alcohol");
  const [yearsUsing, setYearsUsing] = useState(0);
  const [motivations, setMotivations] = useState<string[]>([]);
  const [dailySpend, setDailySpend] = useState("");
  const [currentFeeling, setCurrentFeeling] = useState("");
  const [sobrietyOffset, setSobrietyOffset] = useState(0);
  const slideRef = useRef(false);

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const bottomPad = Platform.OS === "web" ? insets.bottom + 34 : insets.bottom + 16;

  const goBack = () => {
    if (step === 0) {
      router.back();
    } else {
      setStep((s) => s - 1);
    }
  };

  const goNext = () => setStep((s) => s + 1);

  const toggleMotivation = (id: string) => {
    setMotivations((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    if (slideRef.current) return;
    slideRef.current = true;
    const d = new Date();
    d.setDate(d.getDate() - sobrietyOffset);
    await setProfile({
      name: name.trim() || "Friend",
      addictionType: addiction,
      sobrietyStartDate: d.toISOString(),
      emergencyContacts: [],
      isOnboarded: true,
      yearsUsing,
      dailySpend: parseFloat(dailySpend) || 0,
      motivations,
      currentFeeling,
    });
    router.replace("/");
  };

  const spend = parseFloat(dailySpend) || 0;
  const weekSave = spend * 7;
  const monthSave = spend * 30;
  const yearSave = spend * 365;

  return (
    <KeyboardAvoidingView
      style={styles.kav}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad, paddingBottom: bottomPad },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StepHeader step={step} total={TOTAL_STEPS} onBack={goBack} />

        {/* STEP 0: Name */}
        {step === 0 && (
          <View style={styles.stepBody}>
            <View style={styles.emojiHeader}>
              <Text style={styles.bigEmoji}>👋</Text>
            </View>
            <Text style={styles.stepTitle}>What should we call you?</Text>
            <Text style={styles.stepSub}>
              This is your safe space. Your name stays on your device — never shared with anyone.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Your first name or a nickname"
              placeholderTextColor={Colors.light.textMuted}
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={() => name.trim() && goNext()}
            />
            <Pressable
              style={[styles.nextBtn, !name.trim() && { opacity: 0.45 }]}
              onPress={() => name.trim() && goNext()}
              disabled={!name.trim()}
            >
              <Text style={styles.nextBtnText}>Continue</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
          </View>
        )}

        {/* STEP 1: Addiction type */}
        {step === 1 && (
          <View style={styles.stepBody}>
            <Text style={styles.stepTitle}>
              Hi {name}, what are you recovering from?
            </Text>
            <Text style={styles.stepSub}>
              There's no judgment here — just support built around your needs.
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
                      color={addiction === opt.value ? "#fff" : Colors.light.tint}
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
                  <Text style={styles.addictionDesc}>{opt.desc}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.nextBtn} onPress={goNext}>
              <Text style={styles.nextBtnText}>Continue</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
          </View>
        )}

        {/* STEP 2: How long */}
        {step === 2 && (
          <View style={styles.stepBody}>
            <Text style={styles.stepTitle}>
              How long have you been using {addiction}?
            </Text>
            <Text style={styles.stepSub}>
              Understanding your history helps us show you the right support at the right time.
            </Text>
            <View style={styles.listOptions}>
              {USAGE_YEARS.map((label, i) => (
                <Pressable
                  key={label}
                  style={[
                    styles.listOption,
                    yearsUsing === i && styles.listOptionSelected,
                  ]}
                  onPress={() => setYearsUsing(i)}
                >
                  <View
                    style={[
                      styles.listOptionDot,
                      yearsUsing === i && styles.listOptionDotSelected,
                    ]}
                  />
                  <Text
                    style={[
                      styles.listOptionText,
                      yearsUsing === i && styles.listOptionTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                  {yearsUsing === i && (
                    <Feather name="check" size={16} color={Colors.light.tint} />
                  )}
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.nextBtn} onPress={goNext}>
              <Text style={styles.nextBtnText}>Continue</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
          </View>
        )}

        {/* STEP 3: Motivations */}
        {step === 3 && (
          <View style={styles.stepBody}>
            <Text style={styles.stepTitle}>Why do you want to quit?</Text>
            <Text style={styles.stepSub}>
              Pick everything that feels true. Your reasons will keep you going on hard days.
            </Text>
            <View style={styles.motivationGrid}>
              {MOTIVATIONS.map((m) => {
                const selected = motivations.includes(m.id);
                return (
                  <Pressable
                    key={m.id}
                    style={[
                      styles.motivationChip,
                      selected && styles.motivationChipSelected,
                    ]}
                    onPress={() => toggleMotivation(m.id)}
                  >
                    <Feather
                      name={m.icon}
                      size={16}
                      color={selected ? "#fff" : Colors.light.tint}
                    />
                    <Text
                      style={[
                        styles.motivationLabel,
                        selected && styles.motivationLabelSelected,
                      ]}
                    >
                      {m.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {motivations.length > 0 && (
              <View style={styles.motivationNote}>
                <Feather name="bookmark" size={14} color={Colors.light.tint} />
                <Text style={styles.motivationNoteText}>
                  {motivations.length} reason{motivations.length > 1 ? "s" : ""} saved — these are your anchors
                </Text>
              </View>
            )}
            <Pressable
              style={[styles.nextBtn, motivations.length === 0 && { opacity: 0.45 }]}
              onPress={() => motivations.length > 0 && goNext()}
              disabled={motivations.length === 0}
            >
              <Text style={styles.nextBtnText}>Continue</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
          </View>
        )}

        {/* STEP 4: Daily spend */}
        {step === 4 && (
          <View style={styles.stepBody}>
            <Text style={styles.stepTitle}>How much do you spend daily on {addiction}?</Text>
            <Text style={styles.stepSub}>
              We'll show you exactly how much money sobriety puts back in your pocket — it's more than you think.
            </Text>
            <View style={styles.spendInputRow}>
              <View style={styles.currencyBox}>
                <Text style={styles.currencySymbol}>$</Text>
              </View>
              <TextInput
                style={styles.spendInput}
                placeholder="0.00"
                placeholderTextColor={Colors.light.textMuted}
                keyboardType="decimal-pad"
                value={dailySpend}
                onChangeText={(v) => setDailySpend(v.replace(/[^0-9.]/g, ""))}
              />
              <Text style={styles.perDay}>/ day</Text>
            </View>

            {spend > 0 && (
              <View style={styles.savingsPreview}>
                <Text style={styles.savingsTitle}>You could save...</Text>
                <View style={styles.savingsRow}>
                  <View style={styles.savingCard}>
                    <Text style={styles.savingAmount}>${Math.round(weekSave)}</Text>
                    <Text style={styles.savingLabel}>This week</Text>
                  </View>
                  <View style={[styles.savingCard, styles.savingCardHighlight]}>
                    <Text style={[styles.savingAmount, { color: "#fff" }]}>
                      ${Math.round(monthSave)}
                    </Text>
                    <Text style={[styles.savingLabel, { color: "rgba(255,255,255,0.8)" }]}>
                      This month
                    </Text>
                  </View>
                  <View style={styles.savingCard}>
                    <Text style={styles.savingAmount}>${Math.round(yearSave)}</Text>
                    <Text style={styles.savingLabel}>This year</Text>
                  </View>
                </View>
                <Text style={styles.savingsInsight}>
                  That's enough to {yearSave > 2000 ? "take a vacation, pay off debt," : "treat yourself,"} and invest in your future.
                </Text>
              </View>
            )}
            {spend === 0 && (
              <Pressable
                style={styles.skipLink}
                onPress={() => { setDailySpend("0"); goNext(); }}
              >
                <Text style={styles.skipText}>Skip — I prefer not to say</Text>
              </Pressable>
            )}

            <Pressable style={styles.nextBtn} onPress={goNext}>
              <Text style={styles.nextBtnText}>Continue</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
          </View>
        )}

        {/* STEP 5: Current feelings */}
        {step === 5 && (
          <View style={styles.stepBody}>
            <View style={styles.emojiHeader}>
              <Text style={styles.bigEmoji}>💙</Text>
            </View>
            <Text style={styles.stepTitle}>
              How are you feeling right now?
            </Text>
            <Text style={styles.stepSub}>
              All feelings are valid here. There's no wrong answer — this moment matters.
            </Text>
            <View style={styles.feelingsGrid}>
              {FEELINGS.map((f) => {
                const selected = currentFeeling === f.id;
                return (
                  <Pressable
                    key={f.id}
                    style={[
                      styles.feelingCard,
                      selected && { borderColor: f.color, backgroundColor: `${f.color}15` },
                    ]}
                    onPress={() => setCurrentFeeling(f.id)}
                  >
                    <Feather
                      name={f.icon}
                      size={22}
                      color={selected ? f.color : Colors.light.textMuted}
                    />
                    <Text
                      style={[
                        styles.feelingLabel,
                        selected && { color: f.color, fontFamily: "Inter_600SemiBold" },
                      ]}
                    >
                      {f.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {currentFeeling && (
              <View style={styles.feelingResponse}>
                <Text style={styles.feelingResponseText}>
                  {currentFeeling === "scared" &&
                    "That's completely normal. Fear means this matters to you. You're not alone."}
                  {currentFeeling === "hopeful" &&
                    "Hope is your superpower. Nurture it — this journey will give you more."}
                  {currentFeeling === "ashamed" &&
                    "You don't need to carry shame. Every step forward is a step away from yesterday."}
                  {currentFeeling === "determined" &&
                    "That fire will carry you far. Channel it every time you face a challenge."}
                  {currentFeeling === "anxious" &&
                    "Anxiety is common at the start. We'll help you breathe through every difficult moment."}
                  {currentFeeling === "relieved" &&
                    "Relief means you've been waiting for this. You made the right call."}
                  {currentFeeling === "lost" &&
                    "It's okay not to have all the answers. We'll take it one day at a time — together."}
                  {currentFeeling === "ready" &&
                    "Ready is the best place to start. Let's build something that lasts."}
                </Text>
              </View>
            )}
            <Pressable
              style={[styles.nextBtn, !currentFeeling && { opacity: 0.45 }]}
              onPress={() => currentFeeling && goNext()}
              disabled={!currentFeeling}
            >
              <Text style={styles.nextBtnText}>Continue</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
          </View>
        )}

        {/* STEP 6: Sobriety start + Slide to begin */}
        {step === 6 && (
          <View style={styles.stepBody}>
            <Text style={styles.stepTitle}>
              When did your sober journey begin?
            </Text>
            <Text style={styles.stepSub}>
              Even if it starts today — that's already courageous. Every single day counts.
            </Text>
            <View style={styles.dateGrid}>
              {DATE_OFFSETS.map(({ label, sub, offset }) => (
                <Pressable
                  key={label}
                  style={[
                    styles.dateCard,
                    sobrietyOffset === offset && styles.dateCardSelected,
                  ]}
                  onPress={() => setSobrietyOffset(offset)}
                >
                  <View style={styles.dateCardLeft}>
                    <Text
                      style={[
                        styles.dateCardLabel,
                        sobrietyOffset === offset && styles.dateCardLabelSelected,
                      ]}
                    >
                      {label}
                    </Text>
                    <Text style={styles.dateCardSub}>{sub}</Text>
                  </View>
                  {sobrietyOffset === offset && (
                    <Feather name="check-circle" size={20} color={Colors.light.tint} />
                  )}
                </Pressable>
              ))}
            </View>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Your Recovery Summary</Text>
              <View style={styles.summaryRow}>
                <Feather name="user" size={14} color={Colors.light.tintLight} />
                <Text style={styles.summaryText}>{name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Feather name="target" size={14} color={Colors.light.tintLight} />
                <Text style={styles.summaryText}>
                  Recovering from {addiction} · {USAGE_YEARS[yearsUsing]}
                </Text>
              </View>
              {spend > 0 && (
                <View style={styles.summaryRow}>
                  <Feather name="dollar-sign" size={14} color={Colors.light.tintLight} />
                  <Text style={styles.summaryText}>
                    Saving ${Math.round(monthSave)}/month
                  </Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Feather name="heart" size={14} color={Colors.light.tintLight} />
                <Text style={styles.summaryText}>
                  Feeling {FEELINGS.find((f) => f.id === currentFeeling)?.label ?? "—"}
                </Text>
              </View>
            </View>

            <SlideButton
              label="Slide to begin your journey"
              onComplete={handleFinish}
              color={Colors.light.tint}
            />
            <Text style={styles.privacyNote}>
              Your data stays on your device only. Never shared.
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kav: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    gap: 20,
    flexGrow: 1,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrackOuter: {
    flex: 1,
    height: 5,
    backgroundColor: Colors.light.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFillBar: {
    height: 5,
    backgroundColor: Colors.light.tint,
    borderRadius: 3,
  },
  stepCounter: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
    minWidth: 28,
    textAlign: "right",
  },
  stepBody: {
    gap: 18,
  },
  emojiHeader: {
    alignItems: "center",
    paddingVertical: 8,
  },
  bigEmoji: {
    fontSize: 52,
  },
  stepTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    lineHeight: 34,
  },
  stepSub: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 23,
    marginTop: -4,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 17,
    fontFamily: "Inter_500Medium",
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
    padding: 18,
    alignItems: "center",
    gap: 8,
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
  addictionDesc: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    textAlign: "center",
  },
  listOptions: {
    gap: 8,
  },
  listOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.light.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  listOptionSelected: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  listOptionDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  listOptionDotSelected: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.tint,
  },
  listOptionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  listOptionTextSelected: {
    color: Colors.light.tint,
    fontFamily: "Inter_600SemiBold",
  },
  motivationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  motivationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 24,
    backgroundColor: Colors.light.card,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  motivationChipSelected: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  motivationLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  motivationLabelSelected: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
  },
  motivationNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  motivationNoteText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.tint,
  },
  spendInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    overflow: "hidden",
  },
  currencyBox: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRightWidth: 1,
    borderRightColor: Colors.light.border,
  },
  currencySymbol: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.light.tint,
  },
  spendInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    paddingVertical: 14,
  },
  perDay: {
    paddingRight: 16,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
  },
  savingsPreview: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  savingsTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  savingsRow: {
    flexDirection: "row",
    gap: 10,
  },
  savingCard: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  savingCardHighlight: {
    backgroundColor: Colors.light.tint,
  },
  savingAmount: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.light.tint,
  },
  savingLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  savingsInsight: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 19,
  },
  skipLink: {
    alignItems: "center",
    paddingVertical: 4,
  },
  skipText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  feelingsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  feelingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: Colors.light.card,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    minWidth: "44%",
    flex: 1,
  },
  feelingLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  feelingResponse: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.tint,
  },
  feelingResponseText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
    lineHeight: 21,
  },
  dateGrid: {
    gap: 8,
  },
  dateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  dateCardSelected: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  dateCardLeft: {
    flex: 1,
    gap: 2,
  },
  dateCardLabel: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textSecondary,
  },
  dateCardLabelSelected: {
    color: Colors.light.tint,
  },
  dateCardSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  summaryBox: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  summaryTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  summaryText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
  privacyNote: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
});
