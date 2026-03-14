import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
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

type Step = "landing" | "breathing" | "distract" | "coach" | "contact";

const DISTRACTIONS = [
  { icon: "wind" as const, label: "5-min Walk", desc: "Step outside and breathe fresh air" },
  { icon: "book-open" as const, label: "Journal", desc: "Write down what you're feeling right now" },
  { icon: "headphones" as const, label: "Music", desc: "Play your favorite calming playlist" },
  { icon: "grid" as const, label: "Puzzle", desc: "Engage your mind with a quick puzzle" },
  { icon: "coffee" as const, label: "Warm Drink", desc: "Make a cup of tea or coffee" },
  { icon: "phone" as const, label: "Call Someone", desc: "Reach out to a friend or family member" },
];

const AI_RESPONSES = [
  "I understand the craving feels intense right now. That's normal — cravings peak between 10–20 minutes and then pass. You can ride this wave.",
  "What was today like? Sometimes cravings show up when emotions are running high. You don't have to act on this feeling.",
  "You've been strong enough to reach out for help. That itself is progress. Keep breathing, keep going.",
  "Remember why you started this journey. The craving is temporary, your reasons to stay sober are permanent.",
  "Cravings are your body asking for relief. Let's find a different way to get you that relief right now.",
];

function BreathingCircle({ phase }: { phase: "inhale" | "hold" | "exhale" }) {
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    let anim: Animated.CompositeAnimation;
    if (phase === "inhale") {
      anim = Animated.timing(scale, {
        toValue: 1,
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      });
    } else if (phase === "hold") {
      anim = Animated.timing(scale, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: false,
      });
    } else {
      anim = Animated.timing(scale, {
        toValue: 0.6,
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      });
    }
    anim.start();
    return () => anim.stop();
  }, [phase]);

  return (
    <Animated.View
      style={[styles.breathCircle, { transform: [{ scale }] }]}
    >
      <View style={styles.breathInner}>
        <Text style={styles.breathPhaseText}>
          {phase === "inhale"
            ? "Inhale"
            : phase === "hold"
            ? "Hold"
            : "Exhale"}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function CopingScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>("landing");
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [breathCycles, setBreathCycles] = useState(0);
  const [userMessage, setUserMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([
    { role: "ai", text: "I'm here with you. Cravings are real, but they pass. Tell me what's going on." },
  ]);
  const [aiResponseIdx, setAiResponseIdx] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const bottomPad = Platform.OS === "web" ? insets.bottom + 34 : insets.bottom + 24;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [step]);

  useEffect(() => {
    if (step !== "breathing") return;
    const cycle = async () => {
      const phases: Array<"inhale" | "hold" | "exhale"> = [
        "inhale",
        "hold",
        "exhale",
      ];
      let p = 0;
      const interval = setInterval(() => {
        p = (p + 1) % 3;
        setBreathPhase(phases[p]);
        if (p === 0) setBreathCycles((c) => c + 1);
      }, 4000);
      return () => clearInterval(interval);
    };
    const cleanup = cycle();
    return () => {
      cleanup.then((fn) => fn?.());
    };
  }, [step]);

  const sendMessage = () => {
    if (!userMessage.trim()) return;
    const newMsg = { role: "user" as const, text: userMessage.trim() };
    const aiMsg = {
      role: "ai" as const,
      text: AI_RESPONSES[aiResponseIdx % AI_RESPONSES.length],
    };
    setChatMessages((prev) => [...prev, newMsg, aiMsg]);
    setAiResponseIdx((i) => i + 1);
    setUserMessage("");
  };

  const goToStep = (s: Step) => {
    fadeAnim.setValue(0);
    setStep(s);
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <Feather name="x" size={22} color={Colors.light.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Coping Now</Text>
        <View style={{ width: 40 }} />
      </View>

      <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
        {step === "landing" && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
          >
            <View style={styles.emergencyBanner}>
              <Feather name="heart" size={28} color={Colors.light.danger} />
              <Text style={styles.emergencyTitle}>
                Cravings peak for 10–20 minutes and then pass.
              </Text>
              <Text style={styles.emergencyText}>
                Let's handle this together. Choose what feels right.
              </Text>
            </View>

            <View style={styles.optionCards}>
              <Pressable
                style={[styles.optionCard, { backgroundColor: "#E8F4FD" }]}
                onPress={() => goToStep("breathing")}
              >
                <Feather name="wind" size={28} color={Colors.light.calm} />
                <Text style={styles.optionTitle}>Guided Breathing</Text>
                <Text style={styles.optionSub}>3-minute calm exercise</Text>
              </Pressable>
              <Pressable
                style={[styles.optionCard, { backgroundColor: "#FFF5E8" }]}
                onPress={() => goToStep("distract")}
              >
                <Feather name="zap" size={28} color={Colors.light.accent} />
                <Text style={styles.optionTitle}>Quick Distraction</Text>
                <Text style={styles.optionSub}>Switch your focus now</Text>
              </Pressable>
              <Pressable
                style={[styles.optionCard, { backgroundColor: "#F0FBF4" }]}
                onPress={() => goToStep("coach")}
              >
                <Feather name="message-circle" size={28} color={Colors.light.tint} />
                <Text style={styles.optionTitle}>Talk to AI Coach</Text>
                <Text style={styles.optionSub}>Process your emotions</Text>
              </Pressable>
              <Pressable
                style={[styles.optionCard, { backgroundColor: "#FDF0F0" }]}
                onPress={() => goToStep("contact")}
              >
                <Feather name="phone" size={28} color={Colors.light.danger} />
                <Text style={styles.optionTitle}>Contact Support</Text>
                <Text style={styles.optionSub}>Reach out for help</Text>
              </Pressable>
            </View>

            <View style={styles.mantraBox}>
              <Text style={styles.mantraText}>
                "I am stronger than this moment. This craving will pass."
              </Text>
            </View>
          </ScrollView>
        )}

        {step === "breathing" && (
          <View style={styles.breathContainer}>
            <Text style={styles.breathTitle}>Box Breathing</Text>
            <Text style={styles.breathSub}>
              4 seconds each · Cycles: {breathCycles}
            </Text>
            <BreathingCircle phase={breathPhase} />
            <Text style={styles.breathInstruction}>
              {breathPhase === "inhale"
                ? "Breathe in slowly through your nose..."
                : breathPhase === "hold"
                ? "Hold gently..."
                : "Breathe out slowly through your mouth..."}
            </Text>
            {breathCycles >= 3 && (
              <Pressable
                style={styles.nextStepBtn}
                onPress={() => goToStep("distract")}
              >
                <Text style={styles.nextStepBtnText}>
                  I feel calmer · Next Step
                </Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </Pressable>
            )}
            <Pressable
              style={styles.skipLink}
              onPress={() => goToStep("landing")}
            >
              <Text style={styles.skipText}>Back to options</Text>
            </Pressable>
          </View>
        )}

        {step === "distract" && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
          >
            <Text style={styles.distractTitle}>Redirect Your Energy</Text>
            <Text style={styles.distractSub}>
              Pick one activity and do it right now.
            </Text>
            {DISTRACTIONS.map((d, i) => (
              <View key={i} style={styles.distractCard}>
                <View style={styles.distractIcon}>
                  <Feather name={d.icon} size={22} color={Colors.light.tint} />
                </View>
                <View style={styles.distractText}>
                  <Text style={styles.distractLabel}>{d.label}</Text>
                  <Text style={styles.distractDesc}>{d.desc}</Text>
                </View>
                <Feather name="chevron-right" size={18} color={Colors.light.textMuted} />
              </View>
            ))}
            <Pressable
              style={styles.nextStepBtn}
              onPress={() => goToStep("coach")}
            >
              <Text style={styles.nextStepBtnText}>Need more support</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
          </ScrollView>
        )}

        {step === "coach" && (
          <View style={styles.chatContainer}>
            <ScrollView
              style={styles.chatMessages}
              contentContainerStyle={{ paddingBottom: 12 }}
              showsVerticalScrollIndicator={false}
            >
              {chatMessages.map((msg, i) => (
                <View
                  key={i}
                  style={[
                    styles.chatBubble,
                    msg.role === "user" ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  {msg.role === "ai" && (
                    <View style={styles.aiAvatar}>
                      <Feather name="heart" size={14} color="#fff" />
                    </View>
                  )}
                  <View
                    style={[
                      styles.bubbleInner,
                      msg.role === "user"
                        ? styles.userBubbleInner
                        : styles.aiBubbleInner,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleText,
                        msg.role === "user" && styles.userBubbleText,
                      ]}
                    >
                      {msg.text}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={[styles.chatInput, { paddingBottom: bottomPad + 8 }]}>
              <TextInput
                style={styles.chatTextInput}
                placeholder="Tell me what's going on..."
                placeholderTextColor={Colors.light.textMuted}
                value={userMessage}
                onChangeText={setUserMessage}
                multiline
                maxLength={300}
              />
              <Pressable
                style={[
                  styles.sendBtn,
                  !userMessage.trim() && { opacity: 0.4 },
                ]}
                onPress={sendMessage}
                disabled={!userMessage.trim()}
              >
                <Feather name="send" size={18} color="#fff" />
              </Pressable>
            </View>
          </View>
        )}

        {step === "contact" && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
          >
            <Text style={styles.distractTitle}>Reach Out for Help</Text>
            <Text style={styles.distractSub}>
              You don't have to face this alone.
            </Text>

            <View style={styles.contactCard}>
              <Feather name="phone" size={22} color={Colors.light.danger} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>SAMHSA Helpline</Text>
                <Text style={styles.contactNum}>1-800-662-4357</Text>
                <Text style={styles.contactSub}>Free · Confidential · 24/7</Text>
              </View>
            </View>
            <View style={styles.contactCard}>
              <Feather name="message-circle" size={22} color={Colors.light.calm} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>Crisis Text Line</Text>
                <Text style={styles.contactNum}>Text HOME to 741741</Text>
                <Text style={styles.contactSub}>Free · 24/7 Text Support</Text>
              </View>
            </View>
            <View style={styles.contactCard}>
              <Feather name="users" size={22} color={Colors.light.tint} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>Night Craving Room</Text>
                <Text style={styles.contactNum}>Join the live support room</Text>
                <Text style={styles.contactSub}>Real people, right now</Text>
              </View>
              <Pressable
                style={styles.joinBtn}
                onPress={() => {
                  router.back();
                  router.push("/(tabs)/community");
                }}
              >
                <Text style={styles.joinBtnText}>Join</Text>
              </Pressable>
            </View>

            <Pressable
              style={[styles.nextStepBtn, { backgroundColor: Colors.light.tint }]}
              onPress={() => goToStep("coach")}
            >
              <Feather name="message-circle" size={18} color="#fff" />
              <Text style={styles.nextStepBtnText}>Talk to AI Coach</Text>
            </Pressable>
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  stepContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 14,
  },
  emergencyBanner: {
    backgroundColor: "#FFF5F5",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#FFD7D7",
  },
  emergencyTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    textAlign: "center",
    lineHeight: 26,
  },
  emergencyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  optionCards: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionCard: {
    flex: 1,
    minWidth: "44%",
    borderRadius: 18,
    padding: 18,
    gap: 8,
  },
  optionTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  optionSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  mantraBox: {
    backgroundColor: Colors.light.tint,
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
  },
  mantraText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    textAlign: "center",
    lineHeight: 24,
    fontStyle: "italic",
  },
  breathContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 24,
  },
  breathTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  breathSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  breathCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.light.calm,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.calm,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 8,
  },
  breathInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  breathPhaseText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  breathInstruction: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  nextStepBtn: {
    backgroundColor: Colors.light.tint,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  nextStepBtnText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  skipLink: {
    alignItems: "center",
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  distractTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    marginBottom: -4,
  },
  distractSub: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  distractCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  distractIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  distractText: {
    flex: 1,
    gap: 3,
  },
  distractLabel: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  distractDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  chatContainer: {
    flex: 1,
  },
  chatMessages: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  chatBubble: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 12,
  },
  userBubble: {
    flexDirection: "row-reverse",
  },
  aiBubble: {
    flexDirection: "row",
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.tint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  bubbleInner: {
    maxWidth: "75%",
    borderRadius: 18,
    padding: 14,
  },
  aiBubbleInner: {
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  userBubbleInner: {
    backgroundColor: Colors.light.tint,
    borderTopRightRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    lineHeight: 22,
  },
  userBubbleText: {
    color: "#fff",
  },
  chatInput: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 18,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  contactInfo: {
    flex: 1,
    gap: 3,
  },
  contactName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  contactNum: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.tint,
  },
  contactSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  joinBtn: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  joinBtnText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});
