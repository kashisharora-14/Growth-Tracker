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
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useRecovery } from "@/context/RecoveryContext";

type Step = "trigger" | "motivation" | "breathe" | "timer" | "activities" | "reach_out";

const STEPS: Step[] = ["trigger", "motivation", "breathe", "timer", "activities", "reach_out"];
const STEP_LABELS = ["Your Why", "Motivation", "Breathe", "Timer", "Activities", "Reach Out"];

const QUOTES = [
  { text: "You are stronger than your strongest craving.", author: "Recovery Wisdom" },
  { text: "Every moment of resistance is a victory. Every second counts.", author: "Anonymous" },
  { text: "Cravings are like waves — they rise, they peak, and they pass. Surf this one.", author: "Recovery Coach" },
  { text: "The pain of discipline is nothing compared to the pain of regret.", author: "Unknown" },
  { text: "You didn't come this far to only come this far. Keep going.", author: "Anonymous" },
];

const ACTIVITIES = [
  { icon: "wind" as const,      label: "5-min Walk",   desc: "Step outside, breathe fresh air, reset your mind", color: "#5B8DEF" },
  { icon: "droplet" as const,   label: "Drink Water",  desc: "Cold water can significantly reduce craving intensity", color: "#4CAF82" },
  { icon: "book-open" as const, label: "Journal",      desc: "Write exactly what you're feeling right now", color: "#E8A634" },
  { icon: "headphones" as const, label: "Music",       desc: "Play a calming or energizing playlist", color: "#C47AC0" },
  { icon: "coffee" as const,    label: "Warm Drink",   desc: "Make tea or coffee slowly and mindfully", color: "#8B5E3C" },
  { icon: "activity" as const,  label: "Stretch",      desc: "5 minutes of gentle movement helps most", color: "#E07A3A" },
];

const TRIGGER_MAP: Record<string, { icon: React.ComponentProps<typeof Feather>["name"]; text: string; color: string }> = {
  family:    { icon: "home",       text: "Your family loves you and needs you. They are rooting for you right now.", color: "#E07A3A" },
  children:  { icon: "heart",      text: "Your children look up to you. Every sober day is a gift to them.", color: "#C47AC0" },
  health:    { icon: "activity",   text: "Your body is healing with every passing hour. This moment matters.", color: "#4CAF82" },
  freedom:   { icon: "unlock",     text: "You chose freedom. Don't let a craving take that back from you.", color: "#5B8DEF" },
  finances:  { icon: "dollar-sign", text: "Think of everything you're saving — in money, in time, in life.", color: "#E8A634" },
  career:    { icon: "briefcase",  text: "Your goals and dreams are within reach. Stay on the path.", color: "#6B8CBA" },
  self:      { icon: "user",       text: "You deserve a life you're proud of. Protect that future self.", color: Colors.light.tint },
};

function BreathButton({ onComplete }: { onComplete: () => void }) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    const countdown = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(countdown);
          setTimeout(onComplete, 500);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    const breath = setInterval(() => {
      setPhase((p) => {
        if (p === "inhale") return "hold";
        if (p === "hold") return "exhale";
        return "inhale";
      });
    }, 4000);

    return () => {
      clearInterval(countdown);
      clearInterval(breath);
    };
  }, []);

  useEffect(() => {
    let anim: Animated.CompositeAnimation;
    if (phase === "inhale") {
      anim = Animated.timing(scale, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: false });
    } else if (phase === "hold") {
      anim = Animated.timing(scale, { toValue: 1, duration: 4000, useNativeDriver: false });
    } else {
      anim = Animated.timing(scale, { toValue: 0.6, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: false });
    }
    anim.start();
    return () => anim.stop();
  }, [phase]);

  const phaseInstruction =
    phase === "inhale" ? "Breathe in slowly through your nose..."
    : phase === "hold" ? "Hold gently..."
    : "Breathe out slowly through your mouth...";

  const phaseLabel = phase === "inhale" ? "Inhale" : phase === "hold" ? "Hold" : "Exhale";

  return (
    <View style={{ alignItems: "center", gap: 20 }}>
      <Text style={styles.breathCountdown}>{seconds}s</Text>
      <Animated.View style={[styles.breathCircle, { transform: [{ scale }] }]}>
        <View style={styles.breathInner}>
          <Text style={styles.breathPhaseText}>{phaseLabel}</Text>
        </View>
      </Animated.View>
      <Text style={styles.breathInstruction}>{phaseInstruction}</Text>
    </View>
  );
}

export default function EmergencyScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useRecovery();
  const [step, setStep] = useState<Step>("trigger");
  const [breatheStarted, setBreatheStarted] = useState(false);
  const [breatheDone, setBreatheDone] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(20 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const bottomPad = Platform.OS === "web" ? insets.bottom + 34 : insets.bottom + 24;

  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setTimerSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setTimerDone(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: false }).start();
  }, [step]);

  const stepIndex = STEPS.indexOf(step);

  const goNext = () => {
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next);
  };

  const goPrev = () => {
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev);
    else router.back();
  };

  const personalTriggers = [
    ...(profile?.motivations ?? [])
      .map((m) => TRIGGER_MAP[m])
      .filter(Boolean),
    { icon: "shield" as const, text: "You've made it this far. That took real courage. Keep going.", color: Colors.light.tint },
    { icon: "star" as const,   text: "You are not defined by this craving. You are defined by your choices.", color: "#E8A634" },
  ];

  const timerMin = Math.floor(timerSeconds / 60);
  const timerSec = timerSeconds % 60;
  const timerProgress = 1 - timerSeconds / (20 * 60);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable style={styles.navBtn} onPress={goPrev}>
          <Feather name="arrow-left" size={20} color={Colors.light.textSecondary} />
        </Pressable>
        <View style={styles.stepDots}>
          {STEPS.map((s, i) => (
            <View
              key={s}
              style={[
                styles.dot,
                i < stepIndex && styles.dotDone,
                i === stepIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
        <Pressable style={styles.navBtn} onPress={() => router.back()}>
          <Feather name="x" size={20} color={Colors.light.textSecondary} />
        </Pressable>
      </View>

      <Text style={styles.stepCaption}>Step {stepIndex + 1} of {STEPS.length} · {STEP_LABELS[stepIndex]}</Text>

      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>

        {step === "trigger" && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}>
            <View style={styles.stepBanner}>
              <View style={[styles.bannerIcon, { backgroundColor: "#FFF0F0" }]}>
                <Feather name="alert-circle" size={30} color={Colors.light.danger} />
              </View>
              <Text style={styles.stepTitle}>You've been here before — and made it through</Text>
              <Text style={styles.stepSub}>Remember what truly matters to you right now.</Text>
            </View>

            {personalTriggers.map((t, i) => (
              <View key={i} style={[styles.triggerCard, { borderLeftColor: t.color }]}>
                <View style={[styles.triggerIconWrap, { backgroundColor: t.color + "18" }]}>
                  <Feather name={t.icon} size={22} color={t.color} />
                </View>
                <Text style={styles.triggerText}>{t.text}</Text>
              </View>
            ))}

            <View style={styles.mantraCard}>
              <Text style={styles.mantraText}>"Every second you hold on is a second you've won."</Text>
            </View>

            <Pressable style={styles.nextBtn} onPress={goNext}>
              <Text style={styles.nextBtnText}>I'm ready for motivation</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
          </ScrollView>
        )}

        {step === "motivation" && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}>
            <View style={styles.stepBanner}>
              <View style={[styles.bannerIcon, { backgroundColor: "#FFF8E8" }]}>
                <Feather name="sun" size={30} color="#E8A634" />
              </View>
              <Text style={styles.stepTitle}>You are doing something remarkable</Text>
              <Text style={styles.stepSub}>Let these words carry you through this moment.</Text>
            </View>

            {QUOTES.map((q, i) => (
              <View key={i} style={[styles.quoteCard, i === 0 && styles.quoteCardFeatured]}>
                <Feather
                  name="message-square"
                  size={16}
                  color={i === 0 ? "rgba(255,255,255,0.65)" : Colors.light.tint}
                />
                <Text style={[styles.quoteText, i === 0 && styles.quoteTextFeatured]}>{q.text}</Text>
                <Text style={[styles.quoteAuthor, i === 0 && styles.quoteAuthorFeatured]}>— {q.author}</Text>
              </View>
            ))}

            <Pressable style={styles.nextBtn} onPress={goNext}>
              <Text style={styles.nextBtnText}>Now let's breathe</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
          </ScrollView>
        )}

        {step === "breathe" && (
          <View style={styles.centerContent}>
            <View style={[styles.stepBanner, { marginBottom: 8 }]}>
              <Text style={styles.stepTitle}>Follow the circle</Text>
              <Text style={styles.stepSub}>Breathe with it for 30 seconds to calm your nervous system.</Text>
            </View>

            {!breatheStarted ? (
              <View style={{ alignItems: "center", gap: 20 }}>
                <View style={styles.breathPreview}>
                  <Feather name="wind" size={40} color={Colors.light.calm} />
                  <Text style={styles.breathPreviewText}>4s inhale · 4s hold · 4s exhale</Text>
                </View>
                <Pressable style={styles.startBreatheBtn} onPress={() => setBreatheStarted(true)}>
                  <Feather name="play" size={22} color="#fff" />
                  <Text style={styles.startBreatheBtnText}>Start 30-Second Breathe</Text>
                </Pressable>
                <Pressable style={styles.skipLink} onPress={goNext}>
                  <Text style={styles.skipText}>Skip this step</Text>
                </Pressable>
              </View>
            ) : breatheDone ? (
              <View style={{ alignItems: "center", gap: 16 }}>
                <View style={[styles.bannerIcon, { backgroundColor: "#F0FBF4" }]}>
                  <Feather name="check-circle" size={40} color={Colors.light.tint} />
                </View>
                <Text style={styles.stepTitle}>Well done</Text>
                <Text style={styles.stepSub}>Your nervous system is calmer now.</Text>
                <Pressable style={styles.nextBtn} onPress={goNext}>
                  <Text style={styles.nextBtnText}>Continue to timer</Text>
                  <Feather name="arrow-right" size={18} color="#fff" />
                </Pressable>
              </View>
            ) : (
              <View style={{ gap: 24 }}>
                <BreathButton onComplete={() => setBreatheDone(true)} />
              </View>
            )}
          </View>
        )}

        {step === "timer" && (
          <View style={styles.centerContent}>
            <View style={styles.stepBanner}>
              <View style={[styles.bannerIcon, { backgroundColor: "#EEF5EE" }]}>
                <Feather name="clock" size={30} color={Colors.light.tint} />
              </View>
              <Text style={styles.stepTitle}>Ride the wave</Text>
              <Text style={styles.stepSub}>
                Cravings peak at 10–20 minutes and then fade. Watch the clock and outlast it.
              </Text>
            </View>

            <View style={styles.timerDisplay}>
              <Text style={styles.timerNum}>
                {String(timerMin).padStart(2, "0")}:{String(timerSec).padStart(2, "0")}
              </Text>
              <Text style={styles.timerStatus}>
                {timerDone ? "You outlasted the craving!" : timerActive ? "Hang in there..." : "Start when ready"}
              </Text>
            </View>

            <View style={styles.timerBarTrack}>
              <View style={[styles.timerBarFill, { width: `${timerProgress * 100}%` as any }]} />
            </View>

            {!timerActive && !timerDone && (
              <Pressable style={styles.nextBtn} onPress={() => setTimerActive(true)}>
                <Feather name="play" size={18} color="#fff" />
                <Text style={styles.nextBtnText}>Start Timer</Text>
              </Pressable>
            )}

            {timerDone && (
              <Pressable style={[styles.nextBtn, { backgroundColor: Colors.light.tint }]} onPress={goNext}>
                <Feather name="check" size={18} color="#fff" />
                <Text style={styles.nextBtnText}>I made it — next step</Text>
              </Pressable>
            )}

            <Pressable style={styles.skipLink} onPress={goNext}>
              <Text style={styles.skipText}>Skip to activities →</Text>
            </Pressable>
          </View>
        )}

        {step === "activities" && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}>
            <View style={styles.stepBanner}>
              <View style={[styles.bannerIcon, { backgroundColor: "#F0FBF4" }]}>
                <Feather name="zap" size={30} color={Colors.light.tint} />
              </View>
              <Text style={styles.stepTitle}>Redirect your energy</Text>
              <Text style={styles.stepSub}>Pick one activity and do it right now. Movement helps most.</Text>
            </View>

            {ACTIVITIES.map((a, i) => (
              <View key={i} style={styles.activityCard}>
                <View style={[styles.activityIcon, { backgroundColor: a.color + "18" }]}>
                  <Feather name={a.icon} size={22} color={a.color} />
                </View>
                <View style={styles.activityText}>
                  <Text style={styles.activityLabel}>{a.label}</Text>
                  <Text style={styles.activityDesc}>{a.desc}</Text>
                </View>
                <Feather name="chevron-right" size={18} color={Colors.light.textMuted} />
              </View>
            ))}

            <Pressable style={styles.nextBtn} onPress={goNext}>
              <Text style={styles.nextBtnText}>Now let's connect</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
          </ScrollView>
        )}

        {step === "reach_out" && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}>
            <View style={styles.stepBanner}>
              <View style={[styles.bannerIcon, { backgroundColor: "#F5F0FF" }]}>
                <Feather name="users" size={30} color="#7C4DFF" />
              </View>
              <Text style={styles.stepTitle}>You don't have to do this alone</Text>
              <Text style={styles.stepSub}>Connection is the opposite of addiction. Reach out right now.</Text>
            </View>

            {(profile?.emergencyContacts?.length ?? 0) > 0 && (
              <>
                <Text style={styles.sectionLabel}>Your Contacts</Text>
                {profile!.emergencyContacts.map((c, i) => (
                  <View key={i} style={[styles.reachCard, { borderLeftColor: "#E07A3A" }]}>
                    <View style={[styles.reachIconWrap, { backgroundColor: "#E07A3A18" }]}>
                      <Feather name="phone" size={20} color="#E07A3A" />
                    </View>
                    <View style={styles.reachInfo}>
                      <Text style={styles.reachName}>Call {c.name}</Text>
                      <Text style={styles.reachSub}>{c.phone}</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color={Colors.light.textMuted} />
                  </View>
                ))}
              </>
            )}

            <Text style={styles.sectionLabel}>Other Options</Text>

            <View style={[styles.reachCard, { borderLeftColor: "#5B8DEF" }]}>
              <View style={[styles.reachIconWrap, { backgroundColor: "#5B8DEF18" }]}>
                <Feather name="message-circle" size={20} color="#5B8DEF" />
              </View>
              <View style={styles.reachInfo}>
                <Text style={styles.reachName}>Message a Mentor</Text>
                <Text style={styles.reachSub}>Reach out to someone who's been there</Text>
              </View>
              <Feather name="chevron-right" size={18} color={Colors.light.textMuted} />
            </View>

            <Pressable
              style={[styles.reachCard, { borderLeftColor: Colors.light.tint }]}
              onPress={() => { router.back(); router.push("/(tabs)/community"); }}
            >
              <View style={[styles.reachIconWrap, { backgroundColor: Colors.light.tint + "18" }]}>
                <Feather name="users" size={20} color={Colors.light.tint} />
              </View>
              <View style={styles.reachInfo}>
                <Text style={styles.reachName}>Post to Community</Text>
                <Text style={styles.reachSub}>Share how you're feeling — people care</Text>
              </View>
              <Feather name="chevron-right" size={18} color={Colors.light.textMuted} />
            </Pressable>

            <View style={[styles.reachCard, { borderLeftColor: Colors.light.danger }]}>
              <View style={[styles.reachIconWrap, { backgroundColor: Colors.light.danger + "18" }]}>
                <Feather name="phone-call" size={20} color={Colors.light.danger} />
              </View>
              <View style={styles.reachInfo}>
                <Text style={styles.reachName}>SAMHSA Helpline</Text>
                <Text style={styles.reachSub}>1-800-662-4357 · Free · Confidential · 24/7</Text>
              </View>
            </View>

            <View style={styles.completeBanner}>
              <Feather name="check-circle" size={32} color={Colors.light.tint} />
              <Text style={styles.completeTitle}>You stayed strong.</Text>
              <Text style={styles.completeSub}>
                You reached out instead of giving in. That's exactly what recovery looks like.
              </Text>
              <Pressable style={styles.doneBtn} onPress={() => router.back()}>
                <Feather name="home" size={16} color="#fff" />
                <Text style={styles.doneBtnText}>Back to Journey</Text>
              </Pressable>
            </View>
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
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.border,
  },
  dotDone: {
    backgroundColor: Colors.light.tintLight,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.light.tint,
  },
  stepCaption: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    gap: 14,
  },
  centerContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
    gap: 24,
    alignItems: "stretch",
  },
  stepBanner: {
    alignItems: "center",
    gap: 10,
    paddingBottom: 4,
  },
  bannerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    textAlign: "center",
    lineHeight: 28,
  },
  stepSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 21,
  },
  triggerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderLeftWidth: 4,
  },
  triggerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  triggerText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
    lineHeight: 21,
  },
  mantraCard: {
    backgroundColor: Colors.light.tint,
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
  },
  mantraText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    textAlign: "center",
    lineHeight: 23,
    fontStyle: "italic",
  },
  quoteCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 18,
    padding: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  quoteCardFeatured: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  quoteText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
    lineHeight: 24,
    fontStyle: "italic",
  },
  quoteTextFeatured: {
    color: "#fff",
  },
  quoteAuthor: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  quoteAuthorFeatured: {
    color: "rgba(255,255,255,0.65)",
  },
  breathPreview: {
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
    width: "100%",
  },
  breathPreviewText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  startBreatheBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.light.calm,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    shadowColor: Colors.light.calm,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  startBreatheBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  breathCountdown: {
    fontSize: 52,
    fontFamily: "Inter_700Bold",
    color: Colors.light.calm,
    textAlign: "center",
  },
  breathCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.light.calm,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.calm,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 8,
  },
  breathInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  breathPhaseText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  breathInstruction: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 21,
  },
  timerDisplay: {
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.light.card,
    borderRadius: 24,
    paddingVertical: 32,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  timerNum: {
    fontSize: 56,
    fontFamily: "Inter_700Bold",
    color: Colors.light.tint,
    letterSpacing: 2,
  },
  timerStatus: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  timerBarTrack: {
    height: 8,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 4,
    overflow: "hidden",
  },
  timerBarFill: {
    height: "100%",
    backgroundColor: Colors.light.tint,
    borderRadius: 4,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  activityText: {
    flex: 1,
    gap: 3,
  },
  activityLabel: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  activityDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 4,
    marginBottom: -4,
  },
  reachCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderLeftWidth: 4,
  },
  reachIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  reachInfo: {
    flex: 1,
    gap: 3,
  },
  reachName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  reachSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  completeBanner: {
    backgroundColor: Colors.light.card,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginTop: 8,
  },
  completeTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    textAlign: "center",
  },
  completeSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  doneBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    marginTop: 8,
  },
  doneBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 16,
  },
  nextBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
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
});
