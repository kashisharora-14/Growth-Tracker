import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WebView from "react-native-webview";

import { BrainMascot } from "@/components/BrainMascot";
import Colors from "@/constants/colors";
import { useRecovery } from "@/context/RecoveryContext";

type Step = "trigger" | "motivation" | "breathe" | "timer" | "activities" | "reach_out";
const STEPS: Step[] = ["trigger", "motivation", "breathe", "timer", "activities", "reach_out"];
const STEP_LABELS = ["Your Why", "Motivation", "Breathe", "Timer", "Activities", "Reach Out"];

const QUOTES = [
  { text: "You are stronger than your strongest craving.", author: "Recovery Wisdom" },
  { text: "Every moment of resistance is a victory. Every second counts.", author: "Anonymous" },
  { text: "Cravings are like waves — they rise, they peak, and they pass.", author: "Recovery Coach" },
  { text: "The pain of discipline is nothing compared to the pain of regret.", author: "Unknown" },
  { text: "You didn't come this far to only come this far. Keep going.", author: "Anonymous" },
];

const ACTIVITIES = [
  { icon: "wind" as const,       label: "5-min Walk",  desc: "Step outside, breathe fresh air, reset your mind", color: "#5B8DEF" },
  { icon: "droplet" as const,    label: "Drink Water", desc: "Cold water can significantly reduce craving intensity", color: "#4CAF82" },
  { icon: "book-open" as const,  label: "Journal",     desc: "Write exactly what you're feeling right now", color: "#E8A634" },
  { icon: "headphones" as const, label: "Music",       desc: "Play a calming or energizing playlist", color: "#C47AC0" },
  { icon: "coffee" as const,     label: "Warm Drink",  desc: "Make tea or coffee slowly and mindfully", color: "#8B5E3C" },
  { icon: "activity" as const,   label: "Stretch",     desc: "5 minutes of gentle movement helps most", color: "#E07A3A" },
];

const TRIGGER_MAP: Record<string, { icon: React.ComponentProps<typeof Feather>["name"]; text: string; color: string }> = {
  family:   { icon: "home",        text: "Your family loves you and needs you. They are rooting for you right now.", color: "#E07A3A" },
  children: { icon: "heart",       text: "Your children look up to you. Every sober day is a gift to them.", color: "#C47AC0" },
  health:   { icon: "activity",    text: "Your body is healing with every passing hour. This moment matters.", color: "#4CAF82" },
  freedom:  { icon: "unlock",      text: "You chose freedom. Don't let a craving take that back from you.", color: "#5B8DEF" },
  finances: { icon: "dollar-sign", text: "Think of everything you're saving — in money, in time, in life.", color: "#E8A634" },
  career:   { icon: "briefcase",   text: "Your goals and dreams are within reach. Stay on the path.", color: "#6B8CBA" },
  self:     { icon: "user",        text: "You deserve a life you're proud of. Protect that future self.", color: Colors.light.tint },
};

const MOTIVATION_VIDEOS = [
  { id: "4q1dgn_C0AU", title: "The Surprising Science of Happiness", channel: "Dan Gilbert · TED", tag: "Mindset", tagColor: "#5B8DEF" },
  { id: "Lp7E973zozc", title: "How to Stop Screwing Yourself Over", channel: "Mel Robbins · TEDx", tag: "Motivation", tagColor: "#5BAD80" },
];

function VideoCard({ id, title, channel, tag, tagColor }: typeof MOTIVATION_VIDEOS[0]) {
  const [playing, setPlaying] = useState(false);
  const thumbUri = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  const embedUri = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

  if (playing) {
    return (
      <View style={s.videoPlayerWrap}>
        <WebView source={{ uri: embedUri }} style={s.videoWebView} allowsInlineMediaPlayback mediaPlaybackRequiresUserAction={false} javaScriptEnabled allowsFullscreenVideo />
        <Pressable style={s.videoCloseBtn} onPress={() => setPlaying(false)}>
          <Feather name="x" size={15} color="#fff" />
        </Pressable>
      </View>
    );
  }
  return (
    <Pressable style={s.videoCard} onPress={() => setPlaying(true)}>
      <View style={s.videoThumb}>
        <Feather name="play-circle" size={36} color="#fff" />
      </View>
      <View style={s.videoInfo}>
        <View style={[s.videoTag, { backgroundColor: tagColor }]}><Text style={s.videoTagText}>{tag}</Text></View>
        <Text style={s.videoTitle} numberOfLines={2}>{title}</Text>
        <Text style={s.videoChannel}>{channel}</Text>
      </View>
    </Pressable>
  );
}

function BreathButton({ onComplete }: { onComplete: () => void }) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    const countdown = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) { clearInterval(countdown); setTimeout(onComplete, 500); return 0; }
        return s - 1;
      });
    }, 1000);
    const breath = setInterval(() => {
      setPhase((p) => p === "inhale" ? "hold" : p === "hold" ? "exhale" : "inhale");
    }, 4000);
    return () => { clearInterval(countdown); clearInterval(breath); };
  }, []);

  useEffect(() => {
    const toValue = phase === "exhale" ? 0.6 : 1;
    const anim = Animated.timing(scale, { toValue, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: false });
    anim.start();
    return () => anim.stop();
  }, [phase]);

  const labels = { inhale: "Inhale", hold: "Hold", exhale: "Exhale" };
  const hints = { inhale: "Slowly through your nose...", hold: "Hold gently...", exhale: "Slowly through your mouth..." };

  return (
    <View style={{ alignItems: "center", gap: 20 }}>
      <Text style={s.breathCountdown}>{seconds}s</Text>
      <Animated.View style={[s.breathCircle, { transform: [{ scale }] }]}>
        <View style={s.breathInner}><Text style={s.breathPhaseText}>{labels[phase]}</Text></View>
      </Animated.View>
      <Text style={s.breathInstruction}>{hints[phase]}</Text>
    </View>
  );
}

function PulsingRing() {
  const pulse = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulse, { toValue: 1.3, duration: 1000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulse, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[s.pulseRing, { transform: [{ scale: pulse }], opacity }]} />
  );
}

export default function EmergencyTab() {
  const insets = useSafeAreaInsets();
  const { profile } = useRecovery();
  const [active, setActive] = useState(false);
  const [step, setStep] = useState<Step>("trigger");
  const [breatheStarted, setBreatheStarted] = useState(false);
  const [breatheDone, setBreatheDone] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(20 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const enterAnim = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const bottomPad = Platform.OS === "web" ? insets.bottom + 34 : insets.bottom + 24;

  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setTimerSeconds((sec) => {
        if (sec <= 1) { clearInterval(interval); setTimerDone(true); return 0; }
        return sec - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  useEffect(() => {
    if (!active) return;
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: false }).start();
  }, [step]);

  const startFlow = () => {
    enterAnim.setValue(0);
    setActive(true);
    setStep("trigger");
    Animated.timing(enterAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  };

  const resetAll = () => {
    setActive(false);
    setStep("trigger");
    setBreatheStarted(false);
    setBreatheDone(false);
    setTimerSeconds(20 * 60);
    setTimerActive(false);
    setTimerDone(false);
  };

  const stepIndex = STEPS.indexOf(step);
  const goNext = () => { const next = STEPS[stepIndex + 1]; if (next) setStep(next); };
  const goPrev = () => { const prev = STEPS[stepIndex - 1]; if (prev) setStep(prev); else resetAll(); };

  const personalTriggers = [
    ...(profile?.motivations ?? []).map((m) => TRIGGER_MAP[m]).filter(Boolean),
    { icon: "shield" as const, text: "You've made it this far. That took real courage. Keep going.", color: Colors.light.tint },
    { icon: "star" as const,   text: "You are not defined by this craving. You are defined by your choices.", color: "#E8A634" },
  ];

  const timerMin = Math.floor(timerSeconds / 60);
  const timerSec = timerSeconds % 60;
  const timerProgress = 1 - timerSeconds / (20 * 60);

  if (!active) {
    return (
      <View style={[s.landingContainer, { paddingTop: topPad }]}>
        <View style={s.landingContent}>
          <BrainMascot emotion="worried" size={90} />
          <Text style={s.landingTitle}>Emergency Support</Text>
          <Text style={s.landingSub}>
            If you're struggling right now, we'll walk you through it — step by step.
          </Text>

          <View style={s.sosWrap}>
            <PulsingRing />
            <Pressable onPress={startFlow} style={s.sosBtn}>
              <LinearGradient
                colors={["#E53935", "#FF6B6B"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.sosGradient}
              >
                <Feather name="alert-circle" size={28} color="#fff" />
                <Text style={s.sosBtnTitle}>I'm struggling right now</Text>
                <Text style={s.sosBtnSub}>Tap to start emergency support</Text>
              </LinearGradient>
            </Pressable>
          </View>

          <Text style={s.landingNote}>
            You're not alone. This will take about 10 minutes and will help.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[s.flowContainer, { paddingTop: topPad, opacity: enterAnim }]}>
      <View style={s.flowHeader}>
        <Pressable style={s.navBtn} onPress={goPrev}>
          <Feather name="arrow-left" size={20} color={Colors.light.textSecondary} />
        </Pressable>
        <View style={s.stepDots}>
          {STEPS.map((st, i) => (
            <View key={st} style={[s.dot, i < stepIndex && s.dotDone, i === stepIndex && s.dotActive]} />
          ))}
        </View>
        <Pressable style={s.navBtn} onPress={resetAll}>
          <Feather name="x" size={20} color={Colors.light.textSecondary} />
        </Pressable>
      </View>

      <Text style={s.stepCaption}>Step {stepIndex + 1} of {STEPS.length} · {STEP_LABELS[stepIndex]}</Text>

      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>

        {step === "trigger" && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.scroll, { paddingBottom: bottomPad }]}>
            <View style={s.stepBanner}>
              <BrainMascot emotion="worried" size={80} />
              <Text style={s.stepTitle}>You've been here before — and made it through</Text>
              <Text style={s.stepSub}>Remember what truly matters to you right now.</Text>
            </View>
            {personalTriggers.map((t, i) => (
              <View key={i} style={[s.triggerCard, { borderLeftColor: t.color }]}>
                <View style={[s.triggerIconWrap, { backgroundColor: t.color + "18" }]}>
                  <Feather name={t.icon} size={22} color={t.color} />
                </View>
                <Text style={s.triggerText}>{t.text}</Text>
              </View>
            ))}
            <View style={s.mantraCard}>
              <Text style={s.mantraText}>"Every second you hold on is a second you've won."</Text>
            </View>
            <Pressable style={s.nextBtn} onPress={goNext}>
              <Text style={s.nextBtnText}>I'm ready for motivation</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
          </ScrollView>
        )}

        {step === "motivation" && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.scroll, { paddingBottom: bottomPad }]}>
            <View style={s.stepBanner}>
              <BrainMascot emotion="happy" size={80} />
              <Text style={s.stepTitle}>You are doing something remarkable</Text>
              <Text style={s.stepSub}>Watch a short video or read words that carry you through.</Text>
            </View>
            {MOTIVATION_VIDEOS.map((v) => <VideoCard key={v.id} {...v} />)}
            <View style={s.quotesDivider}>
              <View style={s.quotesDividerLine} />
              <Text style={s.quotesDividerText}>or read these</Text>
              <View style={s.quotesDividerLine} />
            </View>
            {QUOTES.map((q, i) => (
              <View key={i} style={[s.quoteCard, i === 0 && s.quoteCardFeatured]}>
                <Feather name="message-square" size={16} color={i === 0 ? "rgba(255,255,255,0.65)" : Colors.light.tint} />
                <Text style={[s.quoteText, i === 0 && s.quoteTextFeatured]}>{q.text}</Text>
                <Text style={[s.quoteAuthor, i === 0 && s.quoteAuthorFeatured]}>— {q.author}</Text>
              </View>
            ))}
            <Pressable style={s.nextBtn} onPress={goNext}>
              <Text style={s.nextBtnText}>Now let's breathe</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
          </ScrollView>
        )}

        {step === "breathe" && (
          <View style={s.centerContent}>
            <View style={[s.stepBanner, { marginBottom: 8 }]}>
              <BrainMascot emotion="coping" size={80} />
              <Text style={s.stepTitle}>Follow the circle</Text>
              <Text style={s.stepSub}>Breathe with it for 30 seconds to calm your nervous system.</Text>
            </View>
            {!breatheStarted ? (
              <View style={{ alignItems: "center", gap: 20 }}>
                <View style={s.breathPreview}>
                  <Feather name="wind" size={40} color={Colors.light.calm} />
                  <Text style={s.breathPreviewText}>4s inhale · 4s hold · 4s exhale</Text>
                </View>
                <Pressable style={s.startBreatheBtn} onPress={() => setBreatheStarted(true)}>
                  <Feather name="play" size={22} color="#fff" />
                  <Text style={s.startBreatheBtnText}>Start 30-Second Breathe</Text>
                </Pressable>
                <Pressable style={s.skipLink} onPress={goNext}>
                  <Text style={s.skipText}>Skip this step</Text>
                </Pressable>
              </View>
            ) : breatheDone ? (
              <View style={{ alignItems: "center", gap: 16 }}>
                <BrainMascot emotion="ecstatic" size={80} />
                <Text style={s.stepTitle}>Well done</Text>
                <Text style={s.stepSub}>Your nervous system is calmer now.</Text>
                <Pressable style={s.nextBtn} onPress={goNext}>
                  <Text style={s.nextBtnText}>Continue to timer</Text>
                  <Feather name="arrow-right" size={18} color="#fff" />
                </Pressable>
              </View>
            ) : (
              <BreathButton onComplete={() => setBreatheDone(true)} />
            )}
          </View>
        )}

        {step === "timer" && (
          <View style={s.centerContent}>
            <View style={s.stepBanner}>
              <BrainMascot emotion="calm" size={80} />
              <Text style={s.stepTitle}>Ride the wave</Text>
              <Text style={s.stepSub}>Cravings peak at 10–20 minutes then fade. Outlast it.</Text>
            </View>
            <View style={s.timerDisplay}>
              <Text style={s.timerNum}>{String(timerMin).padStart(2, "0")}:{String(timerSec).padStart(2, "0")}</Text>
              <Text style={s.timerStatus}>{timerDone ? "You outlasted the craving!" : timerActive ? "Hang in there..." : "Start when ready"}</Text>
            </View>
            <View style={s.timerBarTrack}>
              <View style={[s.timerBarFill, { width: `${timerProgress * 100}%` as any }]} />
            </View>
            {!timerActive && !timerDone && (
              <Pressable style={s.nextBtn} onPress={() => setTimerActive(true)}>
                <Feather name="play" size={18} color="#fff" />
                <Text style={s.nextBtnText}>Start Timer</Text>
              </Pressable>
            )}
            {timerDone && (
              <Pressable style={[s.nextBtn, { backgroundColor: Colors.light.tint }]} onPress={goNext}>
                <Feather name="check" size={18} color="#fff" />
                <Text style={s.nextBtnText}>I made it — next step</Text>
              </Pressable>
            )}
            <Pressable style={s.skipLink} onPress={goNext}>
              <Text style={s.skipText}>Skip to activities →</Text>
            </Pressable>
          </View>
        )}

        {step === "activities" && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.scroll, { paddingBottom: bottomPad }]}>
            <View style={s.stepBanner}>
              <BrainMascot emotion="happy" size={80} />
              <Text style={s.stepTitle}>Redirect your energy</Text>
              <Text style={s.stepSub}>Pick one activity and do it right now.</Text>
            </View>
            {ACTIVITIES.map((a, i) => (
              <View key={i} style={s.activityCard}>
                <View style={[s.activityIcon, { backgroundColor: a.color + "18" }]}>
                  <Feather name={a.icon} size={22} color={a.color} />
                </View>
                <View style={s.activityText}>
                  <Text style={s.activityLabel}>{a.label}</Text>
                  <Text style={s.activityDesc}>{a.desc}</Text>
                </View>
                <Feather name="chevron-right" size={18} color={Colors.light.textMuted} />
              </View>
            ))}
            <Pressable style={s.nextBtn} onPress={goNext}>
              <Text style={s.nextBtnText}>Now let's connect</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
          </ScrollView>
        )}

        {step === "reach_out" && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.scroll, { paddingBottom: bottomPad }]}>
            <View style={s.stepBanner}>
              <BrainMascot emotion="ecstatic" size={80} />
              <Text style={s.stepTitle}>You don't have to do this alone</Text>
              <Text style={s.stepSub}>Connection is the opposite of addiction. Reach out right now.</Text>
            </View>
            {(profile?.emergencyContacts?.length ?? 0) > 0 && (
              <>
                <Text style={s.sectionLabel}>Your Contacts</Text>
                {profile!.emergencyContacts.map((c, i) => (
                  <Pressable key={i} style={[s.reachCard, { borderLeftColor: "#E07A3A" }]} onPress={() => Linking.openURL(`tel:${c.phone}`)}>
                    <View style={[s.reachIconWrap, { backgroundColor: "#E07A3A18" }]}>
                      <Feather name="phone" size={20} color="#E07A3A" />
                    </View>
                    <View style={s.reachInfo}>
                      <Text style={s.reachName}>Call {c.name}</Text>
                      <Text style={s.reachSub}>{c.phone}</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color={Colors.light.textMuted} />
                  </Pressable>
                ))}
              </>
            )}
            <Text style={s.sectionLabel}>Other Options</Text>
            <Pressable style={[s.reachCard, { borderLeftColor: Colors.light.tint }]} onPress={() => router.push("/(tabs)/community")}>
              <View style={[s.reachIconWrap, { backgroundColor: Colors.light.tint + "18" }]}>
                <Feather name="users" size={20} color={Colors.light.tint} />
              </View>
              <View style={s.reachInfo}>
                <Text style={s.reachName}>Post to Community</Text>
                <Text style={s.reachSub}>Share how you're feeling — people care</Text>
              </View>
              <Feather name="chevron-right" size={18} color={Colors.light.textMuted} />
            </Pressable>
            <Pressable style={[s.reachCard, { borderLeftColor: Colors.light.danger }]} onPress={() => Linking.openURL("tel:18006624357")}>
              <View style={[s.reachIconWrap, { backgroundColor: Colors.light.danger + "18" }]}>
                <Feather name="phone-call" size={20} color={Colors.light.danger} />
              </View>
              <View style={s.reachInfo}>
                <Text style={s.reachName}>SAMHSA Helpline</Text>
                <Text style={s.reachSub}>1-800-662-4357 · Free · Confidential · 24/7</Text>
              </View>
            </Pressable>
            <View style={s.completeBanner}>
              <Feather name="check-circle" size={32} color={Colors.light.tint} />
              <Text style={s.completeTitle}>You stayed strong.</Text>
              <Text style={s.completeSub}>You reached out instead of giving in. That's exactly what recovery looks like.</Text>
              <Pressable style={s.doneBtn} onPress={resetAll}>
                <Feather name="home" size={16} color="#fff" />
                <Text style={s.doneBtnText}>Done</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}

      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  landingContainer: { flex: 1, backgroundColor: Colors.light.background },
  landingContent: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, gap: 16 },
  landingTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: Colors.light.text, textAlign: "center" },
  landingSub: { fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, textAlign: "center", lineHeight: 22, maxWidth: 280 },
  landingNote: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.textMuted, textAlign: "center", marginTop: 8 },

  sosWrap: { alignItems: "center", justifyContent: "center", marginVertical: 8 },
  pulseRing: {
    position: "absolute",
    width: "100%",
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#E53935",
  },
  sosBtn: { width: "100%", borderRadius: 22, overflow: "hidden", shadowColor: "#E53935", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 18, elevation: 10 },
  sosGradient: { alignItems: "center", justifyContent: "center", paddingVertical: 28, paddingHorizontal: 24, gap: 8 },
  sosBtnTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff", textAlign: "center" },
  sosBtnSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", textAlign: "center" },

  flowContainer: { flex: 1, backgroundColor: Colors.light.background },
  flowHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 8 },
  navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.light.backgroundSecondary, alignItems: "center", justifyContent: "center" },
  stepDots: { flexDirection: "row", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.light.border },
  dotDone: { backgroundColor: Colors.light.tintLight },
  dotActive: { width: 20, backgroundColor: Colors.light.tint },
  stepCaption: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.light.textMuted, textAlign: "center", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 },

  scroll: { padding: 20, gap: 14 },
  centerContent: { flex: 1, paddingHorizontal: 20, gap: 24, alignItems: "center", justifyContent: "center" },

  stepBanner: { alignItems: "center", gap: 10, paddingVertical: 8 },
  stepTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.light.text, textAlign: "center", lineHeight: 30 },
  stepSub: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, textAlign: "center", lineHeight: 20, maxWidth: 280 },

  triggerCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 14, gap: 12, borderLeftWidth: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  triggerIconWrap: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  triggerText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.text, lineHeight: 20 },
  mantraCard: { backgroundColor: Colors.light.tint, borderRadius: 16, padding: 18, alignItems: "center" },
  mantraText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff", textAlign: "center", lineHeight: 22, fontStyle: "italic" },

  videoCard: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 14, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 2, gap: 12, padding: 10 },
  videoThumb: { width: 80, height: 60, borderRadius: 10, backgroundColor: "#222", alignItems: "center", justifyContent: "center" },
  videoInfo: { flex: 1, gap: 4, justifyContent: "center" },
  videoTag: { alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  videoTagText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff", textTransform: "uppercase" },
  videoTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.light.text, lineHeight: 18 },
  videoChannel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.light.textMuted },
  videoPlayerWrap: { width: "100%", height: 200, borderRadius: 14, overflow: "hidden", position: "relative" },
  videoWebView: { flex: 1 },
  videoCloseBtn: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 14, padding: 5 },

  quotesDivider: { flexDirection: "row", alignItems: "center", gap: 10 },
  quotesDividerLine: { flex: 1, height: 1, backgroundColor: Colors.light.border },
  quotesDividerText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.light.textMuted },
  quoteCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, gap: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  quoteCardFeatured: { backgroundColor: Colors.light.tint },
  quoteText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.text, lineHeight: 20, fontStyle: "italic" },
  quoteTextFeatured: { color: "#fff" },
  quoteAuthor: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.light.textMuted },
  quoteAuthorFeatured: { color: "rgba(255,255,255,0.7)" },

  breathCountdown: { fontSize: 28, fontFamily: "Inter_700Bold", color: Colors.light.text },
  breathCircle: { width: 180, height: 180, borderRadius: 90, backgroundColor: Colors.light.calm, alignItems: "center", justifyContent: "center", shadowColor: Colors.light.calm, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 30, elevation: 8 },
  breathInner: { width: 110, height: 110, borderRadius: 55, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  breathPhaseText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  breathInstruction: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, textAlign: "center" },
  breathPreview: { alignItems: "center", gap: 10 },
  breathPreviewText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  startBreatheBtn: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: Colors.light.calm, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 24 },
  startBreatheBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  skipLink: { paddingVertical: 10 },
  skipText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.textMuted, textDecorationLine: "underline" },

  timerDisplay: { alignItems: "center", gap: 8 },
  timerNum: { fontSize: 64, fontFamily: "Inter_700Bold", color: Colors.light.text, letterSpacing: -2 },
  timerStatus: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  timerBarTrack: { width: "100%", height: 8, borderRadius: 4, backgroundColor: Colors.light.backgroundSecondary },
  timerBarFill: { height: "100%", borderRadius: 4, backgroundColor: Colors.light.tint },

  activityCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 14, gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  activityIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  activityText: { flex: 1 },
  activityLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  activityDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, lineHeight: 17, marginTop: 2 },

  sectionLabel: { fontSize: 12, fontFamily: "Inter_700Bold", color: Colors.light.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 4 },
  reachCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 14, gap: 12, borderLeftWidth: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  reachIconWrap: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  reachInfo: { flex: 1 },
  reachName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  reachSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, marginTop: 2 },

  completeBanner: { backgroundColor: "#E8F5EF", borderRadius: 20, padding: 24, alignItems: "center", gap: 10, marginTop: 8 },
  completeTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.light.text },
  completeSub: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, textAlign: "center", lineHeight: 20 },
  doneBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: Colors.light.tint, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24, marginTop: 4 },
  doneBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },

  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#E53935", borderRadius: 16, paddingVertical: 16, paddingHorizontal: 24, shadowColor: "#E53935", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  nextBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
