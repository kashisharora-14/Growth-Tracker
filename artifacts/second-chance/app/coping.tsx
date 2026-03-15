import { Feather } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WebView from "react-native-webview";

import Colors from "@/constants/colors";
import { useRecovery } from "@/context/RecoveryContext";

type RecoveryStage = "early" | "mid" | "recent";
type StepId = 1 | 2 | 3 | 4 | 5 | 6;

const TOTAL_STEPS = 6;

const RECENT_ACTIVITIES = [
  { id: "stress", label: "Work stress", icon: "briefcase" as const },
  { id: "family", label: "Family tension", icon: "users" as const },
  { id: "loneliness", label: "Feeling lonely", icon: "user" as const },
  { id: "boredom", label: "Boredom", icon: "clock" as const },
  { id: "trigger", label: "Saw a trigger", icon: "alert-triangle" as const },
  { id: "social", label: "Social event", icon: "coffee" as const },
  { id: "grief", label: "Loss / grief", icon: "heart" as const },
  { id: "anger", label: "Anger / frustration", icon: "zap" as const },
];

const EMOTIONAL_VIDEOS: Record<string, string> = {
  family: "FQpaj5HEjvI",
  grief: "FQpaj5HEjvI",
  loneliness: "ZToicYcHIOU",
  stress: "O-6f5wQXSu8",
  anger: "O-6f5wQXSu8",
  boredom: "ZToicYcHIOU",
  trigger: "mgmVOuLgFB0",
  social: "mgmVOuLgFB0",
  default: "ZToicYcHIOU",
};

const MOTIVATIONAL_VIDEO = "mgmVOuLgFB0";

const EMOTIONAL_QUOTES = [
  "Your feelings are valid. Pain is temporary — your strength is permanent.",
  "It's okay to not be okay. What matters is that you reached out today.",
  "You are surrounded by people who care more than you know right now.",
  "Every storm runs out of rain. This moment will pass.",
];

const MOTIVATIONAL_QUOTES = [
  "You have survived 100% of your hardest days so far. Today is no different.",
  "The warrior that fights cravings is the same warrior that wins freedom.",
  "Your future self is cheering you on right now. Keep going.",
  "One minute at a time. One breath at a time. That is how champions are made.",
];

const SOLUTIONS: Record<string, string[]> = {
  stress: [
    "Write down exactly what is stressing you — name it to tame it",
    "Step outside for 5 minutes, even if just to your doorstep",
    "Text one person you trust: 'Having a tough moment, can we talk?'",
    "Do 10 slow neck rolls — stress lives in the shoulders",
  ],
  family: [
    "Give yourself permission to step away from the tension for 20 minutes",
    "Write a letter to the family member — you don't have to send it",
    "Remember: their struggle is not your relapse",
    "Call a sponsor or recovery buddy right now",
  ],
  loneliness: [
    "Post something in the community tab — others are awake and listening",
    "Put on a comfort show or podcast at low volume — background company helps",
    "Plan one social activity for this week, even something small",
    "Loneliness peaks then fades — ride this wave for 15 more minutes",
  ],
  boredom: [
    "Pick up a physical task: clean one drawer, fold laundry, water a plant",
    "Do 20 jumping jacks — boredom cravings dissolve with movement",
    "Start a 10-minute journal entry about your proudest sober moment",
    "Search YouTube for a new hobby tutorial and watch the first 5 minutes",
  ],
  trigger: [
    "Leave the triggering environment immediately if safe to do so",
    "Call your crisis contact right now — that's what they're there for",
    "Name the trigger out loud or write it down — awareness breaks its power",
    "Use the 5-4-3-2-1 grounding: 5 things you see, 4 you hear...",
  ],
  social: [
    "It's okay to leave early — your sobriety comes before social obligations",
    "Hold a non-alcoholic drink in your hand — it reduces social pressure",
    "Find one sober ally in the room and stay near them",
    "Plan your exit phrase: 'I have an early morning' is always valid",
  ],
  anger: [
    "Do a wall push-up until your arms shake — anger needs a physical outlet",
    "Write an unsent letter to whoever or whatever made you angry",
    "Count backward from 20 slowly — it activates your prefrontal cortex",
    "Anger is a secondary emotion — ask yourself: 'What am I really feeling?'",
  ],
  grief: [
    "Allow yourself to cry if it comes — grief unexpressed becomes craving",
    "Look at a happy photo or memory of who or what you've lost",
    "Grief doesn't mean something is wrong with you — it means you loved",
    "Light a candle or do one small act in honor of what you've lost",
  ],
  default: [
    "Take 5 deep belly breaths — your nervous system responds in 90 seconds",
    "Drink a full glass of cold water right now",
    "Text 'having a tough moment' to one person in your life",
    "Remember: cravings peak at 10–20 minutes then drop. Outlast it.",
  ],
};

function CustomSlider({
  value,
  onValueChange,
  min = 1,
  max = 10,
  color = Colors.light.tint,
}: {
  value: number;
  onValueChange: (v: number) => void;
  min?: number;
  max?: number;
  color?: string;
}) {
  const trackWidth = useRef(0);
  const position = useRef(new Animated.Value((value - min) / (max - min))).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const ratio = Math.max(0, Math.min(1, e.nativeEvent.locationX / (trackWidth.current || 1)));
        const newVal = Math.round(min + ratio * (max - min));
        position.setValue(ratio);
        onValueChange(newVal);
      },
      onPanResponderMove: (e) => {
        const ratio = Math.max(0, Math.min(1, e.nativeEvent.locationX / (trackWidth.current || 1)));
        const newVal = Math.round(min + ratio * (max - min));
        position.setValue(ratio);
        onValueChange(newVal);
      },
    })
  ).current;

  const thumbLeft = position.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

  return (
    <View
      style={sliderStyles.track}
      onLayout={(e) => { trackWidth.current = e.nativeEvent.layout.width; }}
      {...panResponder.panHandlers}
    >
      <Animated.View
        style={[sliderStyles.fill, { backgroundColor: color, width: thumbLeft }]}
      />
      <Animated.View style={[sliderStyles.thumb, { backgroundColor: color, left: thumbLeft }]} />
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.backgroundSecondary,
    position: "relative",
    marginVertical: 10,
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 3,
  },
  thumb: {
    position: "absolute",
    top: -9,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.tint,
    marginLeft: -12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
});

function BouncingBubble() {
  const bounce = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.75)).current;
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const phaseRef = useRef<"inhale" | "hold" | "exhale">("inhale");

  useEffect(() => {
    let running = true;
    const cycle = () => {
      if (!running) return;
      phaseRef.current = "inhale";
      setPhase("inhale");
      Animated.parallel([
        Animated.timing(scale, { toValue: 1.15, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(bounce, { toValue: -18, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]).start(() => {
        if (!running) return;
        phaseRef.current = "hold";
        setPhase("hold");
        setTimeout(() => {
          if (!running) return;
          phaseRef.current = "exhale";
          setPhase("exhale");
          Animated.parallel([
            Animated.timing(scale, { toValue: 0.75, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(bounce, { toValue: 18, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ]).start(() => {
            Animated.timing(bounce, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
              if (running) cycle();
            });
          });
        }, 3000);
      });
    };
    cycle();
    return () => { running = false; };
  }, []);

  const PHASE_LABELS = { inhale: "Breathe In", hold: "Hold", exhale: "Breathe Out" };
  const PHASE_HINTS = {
    inhale: "Slowly through your nose...",
    hold: "Hold gently...",
    exhale: "Slowly through your mouth...",
  };

  return (
    <View style={bubbleStyles.container}>
      <Animated.View
        style={[
          bubbleStyles.bubble,
          { transform: [{ translateY: bounce }, { scale }] },
        ]}
      >
        <View style={bubbleStyles.inner}>
          <Text style={bubbleStyles.phaseLabel}>{PHASE_LABELS[phase]}</Text>
        </View>
      </Animated.View>
      <Text style={bubbleStyles.hint}>{PHASE_HINTS[phase]}</Text>
    </View>
  );
}

const bubbleStyles = StyleSheet.create({
  container: { alignItems: "center", gap: 32, paddingVertical: 20 },
  bubble: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.light.calm,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.calm,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 40,
    elevation: 10,
  },
  inner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  phaseLabel: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    textAlign: "center",
  },
  hint: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
});

function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  const embedUri = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;

  const source = Platform.OS === "web"
    ? { uri: embedUri }
    : {
        html: `<!DOCTYPE html><html><head>
          <meta name="viewport" content="width=device-width,initial-scale=1">
          <style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000}
          iframe{width:100%;height:100vh;border:none}</style>
        </head><body>
          <iframe src="${embedUri}"
            allow="accelerometer;autoplay;encrypted-media;gyroscope;picture-in-picture"
            allowfullscreen></iframe>
        </body></html>`,
      };

  return (
    <View style={ytStyles.container}>
      <Text style={ytStyles.label}>{title}</Text>
      <View style={ytStyles.player}>
        <WebView
          source={source}
          style={{ flex: 1 }}
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          allowsInlineMediaPlayback
        />
      </View>
    </View>
  );
}

const ytStyles = StyleSheet.create({
  container: { gap: 10 },
  webFallback: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  webFallbackTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  webFallbackSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 19,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    paddingHorizontal: 2,
  },
  player: {
    width: "100%",
    height: 210,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000",
  },
});

function LocalVideoPlayer({ title }: { title: string }) {
  const videoRef = useRef<Video>(null);

  return (
    <View style={localVideoStyles.container}>
      <Text style={localVideoStyles.label}>{title}</Text>
      <View style={localVideoStyles.player}>
        <Video
          ref={videoRef}
          source={require("../assets/emotional-care.mp4")}
          style={{ width: "100%", height: "100%" }}
          resizeMode={ResizeMode.COVER}
          useNativeControls
          shouldPlay={false}
          isLooping={false}
        />
      </View>
    </View>
  );
}

const localVideoStyles = StyleSheet.create({
  container: { gap: 10 },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    paddingHorizontal: 2,
  },
  player: {
    width: "100%",
    height: 210,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000",
  },
});

function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <View style={stepBarStyles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            stepBarStyles.seg,
            i < current ? stepBarStyles.done : i === current - 1 ? stepBarStyles.active : stepBarStyles.idle,
          ]}
        />
      ))}
    </View>
  );
}

const stepBarStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: 5, paddingHorizontal: 20, marginBottom: 4 },
  seg: { flex: 1, height: 4, borderRadius: 2 },
  done: { backgroundColor: Colors.light.tint },
  active: { backgroundColor: Colors.light.tintLight },
  idle: { backgroundColor: Colors.light.border },
});

export default function CopingScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useRecovery();

  const [step, setStep] = useState<StepId>(1);

  const [cravingLevel, setCravingLevel] = useState(5);
  const [moodLevel, setMoodLevel] = useState(5);
  const [recoveryStage, setRecoveryStage] = useState<RecoveryStage | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [otherNotes, setOtherNotes] = useState("");

  const [stepRatings, setStepRatings] = useState<Record<number, number>>({});
  const [overallRating, setOverallRating] = useState(5);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const bottomPad = Platform.OS === "web" ? insets.bottom + 34 : insets.bottom + 24;

  const goToStep = useCallback((s: StepId) => {
    fadeAnim.setValue(0);
    setStep(s);
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const toggleActivity = (id: string) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const primaryActivity = selectedActivities[0] ?? "default";
  const emotionalVideoId = EMOTIONAL_VIDEOS[primaryActivity] ?? EMOTIONAL_VIDEOS.default;
  const solutions = SOLUTIONS[primaryActivity] ?? SOLUTIONS.default;

  const STEP_TITLES = ["Check In", "Emotional Care", "Willpower Boost", "Breathing", "Solutions", "Wrap Up"];

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <Feather name="x" size={22} color={Colors.light.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>{STEP_TITLES[step - 1]}</Text>
        <Text style={styles.stepCount}>{step}/{TOTAL_STEPS}</Text>
      </View>

      <StepBar current={step} total={TOTAL_STEPS} />

      <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>

        {step === 1 && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 80 }]}
          >
            <View style={styles.stepHero}>
              <View style={[styles.stepIconCircle, { backgroundColor: "#E8F4FD" }]}>
                <Feather name="clipboard" size={28} color={Colors.light.calm} />
              </View>
              <Text style={styles.stepTitle}>Let's check in</Text>
              <Text style={styles.stepSub}>
                Tell us how you're feeling right now so we can guide this session for you.
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>Craving Level</Text>
                <Text style={[styles.sliderValue, { color: cravingLevel >= 7 ? Colors.light.danger : Colors.light.tint }]}>
                  {cravingLevel}/10
                </Text>
              </View>
              <CustomSlider
                value={cravingLevel}
                onValueChange={setCravingLevel}
                color={cravingLevel >= 7 ? Colors.light.danger : Colors.light.calm}
              />
              <View style={styles.sliderEnds}>
                <Text style={styles.sliderEnd}>Mild</Text>
                <Text style={styles.sliderEnd}>Intense</Text>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>Mood Right Now</Text>
                <Text style={[styles.sliderValue, { color: Colors.light.tint }]}>{moodLevel}/10</Text>
              </View>
              <CustomSlider
                value={moodLevel}
                onValueChange={setMoodLevel}
                color={Colors.light.tint}
              />
              <View style={styles.sliderEnds}>
                <Text style={styles.sliderEnd}>Very Low</Text>
                <Text style={styles.sliderEnd}>Great</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sliderLabel}>Recovery Stage</Text>
              <View style={styles.stageRow}>
                {(["early", "mid", "recent"] as RecoveryStage[]).map((s) => (
                  <Pressable
                    key={s}
                    style={[styles.stageChip, recoveryStage === s && styles.stageChipActive]}
                    onPress={() => setRecoveryStage(s)}
                  >
                    <Text style={[styles.stageChipText, recoveryStage === s && styles.stageChipTextActive]}>
                      {s === "early" ? "Early (0–90d)" : s === "mid" ? "Mid (3–12m)" : "Recent (1yr+)"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sliderLabel}>What's going on? (pick all that apply)</Text>
              <View style={styles.activityGrid}>
                {RECENT_ACTIVITIES.map((a) => {
                  const sel = selectedActivities.includes(a.id);
                  return (
                    <Pressable
                      key={a.id}
                      style={[styles.activityChip, sel && styles.activityChipSel]}
                      onPress={() => toggleActivity(a.id)}
                    >
                      <Feather name={a.icon} size={14} color={sel ? Colors.light.tint : Colors.light.textMuted} />
                      <Text style={[styles.activityLabel, sel && styles.activityLabelSel]}>{a.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sliderLabel}>Anything else? (optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Type how you're feeling..."
                placeholderTextColor={Colors.light.textMuted}
                value={otherNotes}
                onChangeText={setOtherNotes}
                multiline
                maxLength={300}
              />
            </View>
          </ScrollView>
        )}

        {step === 2 && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 80 }]}
          >
            <View style={styles.stepHero}>
              <View style={[styles.stepIconCircle, { backgroundColor: "#FDF0FF" }]}>
                <Feather name="heart" size={28} color="#B06CE7" />
              </View>
              <Text style={styles.stepTitle}>You are seen</Text>
              <Text style={styles.stepSub}>
                This step is about warmth and connection. You don't have to fight alone.
              </Text>
            </View>

            <LocalVideoPlayer title="A moment of connection" />

            <View style={styles.quotesSection}>
              <Text style={styles.quotesLabel}>Words for this moment</Text>
              {EMOTIONAL_QUOTES.slice(0, 3).map((q, i) => (
                <View key={i} style={styles.quoteCard}>
                  <Text style={styles.quoteText}>"{q}"</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {step === 3 && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 80 }]}
          >
            <View style={styles.stepHero}>
              <View style={[styles.stepIconCircle, { backgroundColor: "#FFF5E8" }]}>
                <Feather name="zap" size={28} color={Colors.light.accent} />
              </View>
              <Text style={styles.stepTitle}>Light your fire</Text>
              <Text style={styles.stepSub}>
                Watch this and remember who you are. You have beaten harder things than this.
              </Text>
            </View>

            <YouTubeEmbed
              videoId={MOTIVATIONAL_VIDEO}
              title="Willpower fuel"
            />

            <View style={styles.quotesSection}>
              <Text style={styles.quotesLabel}>Fuel for your willpower</Text>
              {MOTIVATIONAL_QUOTES.map((q, i) => (
                <View key={i} style={[styles.quoteCard, { borderLeftColor: Colors.light.accent }]}>
                  <Text style={styles.quoteText}>"{q}"</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {step === 4 && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 80 }]}
          >
            <View style={styles.stepHero}>
              <View style={[styles.stepIconCircle, { backgroundColor: "#E8F4FD" }]}>
                <Feather name="wind" size={28} color={Colors.light.calm} />
              </View>
              <Text style={styles.stepTitle}>Breathe with me</Text>
              <Text style={styles.stepSub}>
                Box breathing calms your nervous system in under 3 minutes. Follow the bubble.
              </Text>
            </View>

            <BouncingBubble />

            <View style={styles.breathTipCard}>
              <Feather name="info" size={15} color={Colors.light.calm} />
              <Text style={styles.breathTip}>
                Belly breathe: let your stomach rise on inhale, fall on exhale. Your heart rate will drop within 60 seconds.
              </Text>
            </View>

            <View style={styles.breathSteps}>
              {["Breathe in — 4 counts", "Hold — 4 counts", "Breathe out — 4 counts", "Repeat 3–5 times"].map((t, i) => (
                <View key={i} style={styles.breathStep}>
                  <View style={styles.breathStepNum}>
                    <Text style={styles.breathStepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.breathStepText}>{t}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {step === 5 && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 80 }]}
          >
            <View style={styles.stepHero}>
              <View style={[styles.stepIconCircle, { backgroundColor: "#F0FBF4" }]}>
                <Feather name="list" size={28} color={Colors.light.tint} />
              </View>
              <Text style={styles.stepTitle}>Your action plan</Text>
              <Text style={styles.stepSub}>
                Based on what you shared, here are the best things you can do right now.
              </Text>
            </View>

            <View style={styles.solutionList}>
              {solutions.map((s, i) => (
                <View key={i} style={styles.solutionCard}>
                  <View style={styles.solutionNum}>
                    <Text style={styles.solutionNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.solutionText}>{s}</Text>
                </View>
              ))}
            </View>

            {cravingLevel >= 7 && (
              <View style={styles.crisisBox}>
                <Feather name="phone" size={18} color={Colors.light.danger} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.crisisTitle}>Craving is high — reach out now</Text>
                  <Text style={styles.crisisSub}>SAMHSA: 1-800-662-4357 · Available 24/7</Text>
                </View>
              </View>
            )}

            <View style={styles.visualizeCard}>
              <Text style={styles.visualizeTitle}>Visualize This</Text>
              <Text style={styles.visualizeText}>
                Close your eyes. Picture yourself 24 hours from now — sober, proud, relieved. That version of you exists. You are building them right now.
              </Text>
            </View>
          </ScrollView>
        )}

        {step === 6 && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 80 }]}
          >
            <View style={styles.stepHero}>
              <View style={[styles.stepIconCircle, { backgroundColor: "#F0FBF4" }]}>
                <Feather name="star" size={28} color={Colors.light.streakGold ?? "#FFB800"} />
              </View>
              <Text style={styles.stepTitle}>Well done, {profile?.name ?? "warrior"}</Text>
              <Text style={styles.stepSub}>
                You completed this session. That alone is an act of courage. Tell us how it went.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sliderLabel}>Overall session rating</Text>
              <CustomSlider
                value={overallRating}
                onValueChange={setOverallRating}
                min={1}
                max={10}
                color={Colors.light.accent}
              />
              <View style={styles.sliderEnds}>
                <Text style={styles.sliderEnd}>Not helpful</Text>
                <Text style={styles.sliderEnd}>Very helpful  {overallRating}/10</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sliderLabel}>Rate each step</Text>
              {["Check In", "Emotional Care", "Willpower", "Breathing", "Solutions"].map((label, i) => {
                const stepNum = i + 1;
                const rating = stepRatings[stepNum] ?? 5;
                return (
                  <View key={i} style={styles.stepRatingRow}>
                    <Text style={styles.stepRatingLabel}>{stepNum}. {label}</Text>
                    <View style={styles.stepRatingStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Pressable key={star} onPress={() => setStepRatings((r) => ({ ...r, [stepNum]: star }))}>
                          <Feather
                            name="star"
                            size={22}
                            color={star <= rating ? Colors.light.accent : Colors.light.border}
                          />
                        </Pressable>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.finishCard}>
              <Text style={styles.finishMessage}>
                "You chose yourself today. That is the bravest thing a person can do."
              </Text>
            </View>

            <Pressable
              style={styles.finishBtn}
              onPress={() => router.back()}
            >
              <Feather name="check-circle" size={20} color="#fff" />
              <Text style={styles.finishBtnText}>Finish Session</Text>
            </Pressable>
          </ScrollView>
        )}
      </Animated.View>

      <View style={[styles.navBar, { paddingBottom: bottomPad }]}>
        {step > 1 && (
          <Pressable style={styles.backBtn} onPress={() => goToStep((step - 1) as StepId)}>
            <Feather name="chevron-left" size={20} color={Colors.light.textSecondary} />
            <Text style={styles.backBtnText}>Back</Text>
          </Pressable>
        )}
        <View style={{ flex: 1 }} />
        {step < TOTAL_STEPS && (
          <Pressable
            style={[
              styles.nextBtn,
              step === 1 && !recoveryStage && styles.nextBtnDisabled,
            ]}
            onPress={() => {
              if (step === 1 && !recoveryStage) return;
              goToStep((step + 1) as StepId);
            }}
          >
            <Text style={styles.nextBtnText}>
              {step === 1 ? "Start Session" : "Next Step"}
            </Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
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
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  stepCount: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
    minWidth: 40,
    textAlign: "right",
  },
  stepContainer: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 16,
  },
  stepHero: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  stepIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    textAlign: "center",
  },
  stepSub: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sliderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sliderLabel: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  sliderValue: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  sliderEnds: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderEnd: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  stageRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  stageChip: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  stageChipActive: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  stageChipText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  stageChipTextActive: {
    color: Colors.light.tint,
    fontFamily: "Inter_700Bold",
  },
  activityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  activityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  activityChipSel: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.tint + "15",
  },
  activityLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  activityLabelSel: {
    color: Colors.light.tint,
    fontFamily: "Inter_600SemiBold",
  },
  notesInput: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    minHeight: 80,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  quotesSection: { gap: 10 },
  quotesLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  quoteCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.calm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  quoteText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    lineHeight: 22,
    fontStyle: "italic",
  },
  breathTipCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#E8F4FD",
    borderRadius: 14,
    padding: 14,
    alignItems: "flex-start",
  },
  breathTip: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  breathSteps: {
    gap: 10,
  },
  breathStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.light.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  breathStepNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.calm,
    alignItems: "center",
    justifyContent: "center",
  },
  breathStepNumText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  breathStepText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
  solutionList: { gap: 12 },
  solutionCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  solutionNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.tint,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  solutionNumText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  solutionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    lineHeight: 22,
  },
  crisisBox: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#FFF5F5",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFD7D7",
  },
  crisisTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.light.danger,
  },
  crisisSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  visualizeCard: {
    backgroundColor: Colors.light.tint,
    borderRadius: 20,
    padding: 20,
    gap: 8,
  },
  visualizeTitle: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "rgba(255,255,255,0.75)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  visualizeText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    lineHeight: 23,
  },
  stepRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  stepRatingLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
  stepRatingStars: {
    flexDirection: "row",
    gap: 4,
  },
  finishCard: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  finishMessage: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
    lineHeight: 24,
    fontStyle: "italic",
    textAlign: "center",
  },
  finishBtn: {
    backgroundColor: Colors.light.tint,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  finishBtnText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 17,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    gap: 12,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  backBtnText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
  nextBtnDisabled: {
    opacity: 0.45,
  },
  nextBtnText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});
