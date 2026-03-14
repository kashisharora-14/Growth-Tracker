import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
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
import { AddictionType } from "@/context/RecoveryContext";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ── Stability score calculator ────────────────────────────────────────────────
function computeStability(profile: {
  addictionType: AddictionType;
  yearsUsing: number;
  motivations: string[];
  currentFeeling: string;
  substanceDetails: Record<string, string>;
  cravingLevel?: number;
  commitmentLevel?: number;
}): number {
  let score = 50;

  const substancePenalty: Record<AddictionType, number> = {
    cocaine: 20,
    alcohol: 13,
    cigarette: 8,
    tobacco: 6,
    caffeine: 3,
  };
  score -= substancePenalty[profile.addictionType] ?? 10;

  const yearPenalty = [0, 5, 10, 15, 20];
  score -= yearPenalty[profile.yearsUsing] ?? 0;

  score += Math.min(profile.motivations.length * 3, 18);

  const feelingBonus: Record<string, number> = {
    ready: 12,
    hopeful: 10,
    determined: 10,
    relieved: 7,
    scared: 3,
    anxious: 2,
    lost: -4,
    ashamed: -4,
  };
  score += feelingBonus[profile.currentFeeling] ?? 0;

  const craving = profile.cravingLevel ?? 5;
  score -= Math.round((craving / 10) * 18);

  const commitment = profile.commitmentLevel ?? 5;
  score += Math.round((commitment / 10) * 22);

  const details = Object.values(profile.substanceDetails ?? {});
  const hasWithdrawal = details.some(
    (d) =>
      d.includes("severe") ||
      d.includes("shakes") ||
      d.includes("health scare") ||
      d.includes("crash")
  );
  if (hasWithdrawal) score -= 8;

  return Math.max(5, Math.min(95, Math.round(score)));
}

// ── Feeling config ────────────────────────────────────────────────────────────
const FEELING_CONFIG: Record<
  string,
  { color: string; particles: string[]; title: string; message: string }
> = {
  hopeful: {
    color: "#4CAF78",
    particles: ["✦", "✧", "◦", "·", "★"],
    title: "Hope is your foundation",
    message:
      "You arrived with hope — one of the most powerful forces in recovery. Hold it close on hard days.",
  },
  determined: {
    color: "#E74C3C",
    particles: ["⬆", "▲", "↑", "▴", "⇑"],
    title: "Your fire is ready",
    message:
      "Determination is the engine. You have everything you need to begin — and your plan is ready.",
  },
  scared: {
    color: "#F5A623",
    particles: ["◌", "○", "◎", "⊙", "◯"],
    title: "Fear means it matters",
    message:
      "Being scared shows how much this means to you. That's courage — not weakness.",
  },
  anxious: {
    color: "#5B8DEF",
    particles: ["≈", "~", "∿", "⌇", "⁓"],
    title: "Breathe through this",
    message:
      "Anxiety at the start is normal. Your recovery plan includes tools to calm your nervous system every day.",
  },
  relieved: {
    color: "#2D7A4F",
    particles: ["✓", "◉", "●", "•", "·"],
    title: "Relief is your signal",
    message:
      "Feeling relieved means some part of you has been waiting for this. Trust that instinct.",
  },
  ashamed: {
    color: "#9B59B6",
    particles: ["⬡", "⬢", "◇", "◆", "▪"],
    title: "Shame ends here",
    message:
      "You don't need to carry this anymore. Every person here started somewhere. You're not behind — you're beginning.",
  },
  lost: {
    color: "#95A5A6",
    particles: ["◌", "○", "·", "...", "—"],
    title: "Lost is just the beginning",
    message:
      "Not knowing the way is how every great journey starts. Your plan gives you the first steps.",
  },
  ready: {
    color: "#27AE60",
    particles: ["✦", "★", "✶", "✷", "✸"],
    title: "You are absolutely ready",
    message:
      "Ready is everything. You came prepared, honest, and willing. That's all recovery ever asks.",
  },
};

// ── Personalized plan generator ───────────────────────────────────────────────
const SUBSTANCE_PLANS: Record<
  AddictionType,
  { week: number; title: string; focus: string; tips: string[] }[]
> = {
  alcohol: [
    {
      week: 1,
      title: "Detox & Stabilise",
      focus: "Physical safety + hydration",
      tips: [
        "Remove all alcohol from your home today",
        "Drink water every hour — your body is healing",
        "Avoid triggers like bars, old friends who drink",
        "Tell one person you trust about your commitment",
      ],
    },
    {
      week: 2,
      title: "Build New Routines",
      focus: "Replace the habit loop",
      tips: [
        "Identify your 3 highest-risk times of day",
        "Replace drinking time with a walk or activity",
        "Join an online support group or meeting",
        "Track every craving — write it, time it, let it pass",
      ],
    },
    {
      week: 3,
      title: "Emotional Reset",
      focus: "Deal with what alcohol masked",
      tips: [
        "Start a daily journal — 5 minutes is enough",
        "Notice moods that trigger cravings",
        "Try one new social activity sober",
        "Practise the 4-7-8 breathing technique daily",
      ],
    },
    {
      week: 4,
      title: "Lock In the Gains",
      focus: "Celebrate and reinforce",
      tips: [
        "Calculate money saved — reward yourself",
        "Reflect on how you feel vs day 1",
        "Set your 90-day sobriety goal",
        "Share your win with someone who matters",
      ],
    },
  ],
  cigarette: [
    {
      week: 1,
      title: "Break the Reflex",
      focus: "Rewire your smoking triggers",
      tips: [
        "Remove all cigarettes, lighters, and ashtrays",
        "Identify your top 3 smoking triggers",
        "Replace smoking break with 2-min walk",
        "Keep hands busy — carry a pen or stress ball",
      ],
    },
    {
      week: 2,
      title: "Manage Withdrawal",
      focus: "Physical symptoms peak and ease",
      tips: [
        "Drink cold water when cravings hit — they last under 3 minutes",
        "Chew gum or sunflower seeds for oral urges",
        "Get extra sleep — withdrawal is tiring",
        "Exercise to boost natural dopamine",
      ],
    },
    {
      week: 3,
      title: "Strengthen the Habit",
      focus: "Cement new patterns",
      tips: [
        "Map out situations you've gotten through sober",
        "Practice saying 'no thanks, I don't smoke' out loud",
        "Note improvements in breathing or smell",
        "Add a breathing exercise to your morning routine",
      ],
    },
    {
      week: 4,
      title: "The Mindset Shift",
      focus: "From quitter to non-smoker",
      tips: [
        "You are now a non-smoker — think in that identity",
        "Calculate health improvements: heart rate, lung function",
        "Plan how to handle social situations",
        "Celebrate: $${savings} saved this month",
      ],
    },
  ],
  tobacco: [
    {
      week: 1,
      title: "Clean Break",
      focus: "Remove tobacco from your environment",
      tips: [
        "Dispose of all tobacco products today",
        "Replace the oral habit with healthy snacks",
        "Schedule a dental check if needed",
        "Track every urge in a notebook",
      ],
    },
    {
      week: 2,
      title: "Gum & Mouth Recovery",
      focus: "Physical healing begins",
      tips: [
        "Rinse with salt water daily — gums are healing",
        "Keep sugar-free gum or mints on hand",
        "Notice taste and smell improving",
        "Replace the habit at key trigger times",
      ],
    },
    {
      week: 3,
      title: "Urge Surfing",
      focus: "Let cravings pass without acting",
      tips: [
        "Time your cravings — most pass in 90 seconds",
        "Use deep breathing at craving peaks",
        "Avoid dip/chew situations socially for now",
        "Notice how much money you're saving",
      ],
    },
    {
      week: 4,
      title: "Identity Shift",
      focus: "Own your new identity",
      tips: [
        "Write down 5 things tobacco took from you",
        "Write 5 things freedom has given you",
        "Set a 3-month goal",
        "Celebrate every win — you've earned it",
      ],
    },
  ],
  cocaine: [
    {
      week: 1,
      title: "Immediate Safety",
      focus: "Crash support + environment reset",
      tips: [
        "Remove all substances and contact with suppliers",
        "Tell a trusted person your commitment today",
        "Expect low mood and fatigue — it's temporary",
        "Sleep and eat regularly — crashes deplete your body",
      ],
    },
    {
      week: 2,
      title: "Dopamine Recovery",
      focus: "Rebuild natural reward pathways",
      tips: [
        "Exercise daily — even a 20-min walk creates dopamine",
        "Avoid all triggers: people, places, music",
        "Eat mood-boosting foods: protein, omega-3, greens",
        "Get professional support — consider a counsellor",
      ],
    },
    {
      week: 3,
      title: "Emotional Honesty",
      focus: "Address why you used",
      tips: [
        "Journalling or therapy helps surface root causes",
        "Avoid romanticising past use — list what it cost you",
        "Build a strong support network this week",
        "Practise mindfulness daily — 10 minutes minimum",
      ],
    },
    {
      week: 4,
      title: "Long-term Foundations",
      focus: "Systems that outlast willpower",
      tips: [
        "Create a written relapse prevention plan",
        "Join a NA meeting or online recovery community",
        "Set up accountability with a recovery partner",
        "Your brain is healing — celebrate 30 days",
      ],
    },
  ],
  caffeine: [
    {
      week: 1,
      title: "Taper Gradually",
      focus: "Reduce without shock",
      tips: [
        "Cut intake by 25% each day rather than quitting cold",
        "Switch one daily coffee to half-caf",
        "Drink one extra glass of water per coffee you skip",
        "Expect mild headaches — they pass within 3 days",
      ],
    },
    {
      week: 2,
      title: "Sleep Repair",
      focus: "Your sleep is returning",
      tips: [
        "No caffeine after 12pm this week",
        "Establish a consistent sleep/wake time",
        "Replace your afternoon coffee with a short walk",
        "Notice deeper, more restorative sleep beginning",
      ],
    },
    {
      week: 3,
      title: "Natural Energy",
      focus: "Build energy without stimulants",
      tips: [
        "Try herbal teas: green, chamomile, or peppermint",
        "Eat breakfast with protein — stabilises energy",
        "Short 10-min naps beat caffeine for alertness",
        "Notice anxiety and heart rate decreasing",
      ],
    },
    {
      week: 4,
      title: "New Normal",
      focus: "Life without the dependency",
      tips: [
        "Reflect on anxiety, sleep, and mood improvements",
        "Establish your long-term tea/caffeine limit if any",
        "Calculate money saved on coffee",
        "Your energy is now your own — celebrate it",
      ],
    },
  ],
};

// ── Particle component ────────────────────────────────────────────────────────
function FloatingParticle({
  symbol,
  color,
  delay,
  startX,
}: {
  symbol: string;
  color: string;
  delay: number;
  startX: number;
}) {
  const y = useRef(new Animated.Value(SCREEN_H * 0.4)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const x = useRef(new Animated.Value(startX)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(y, {
            toValue: SCREEN_H * 0.05,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: false,
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.8,
              duration: 600,
              useNativeDriver: false,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 600,
              delay: 1800,
              useNativeDriver: false,
            }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(y, { toValue: SCREEN_H * 0.4, duration: 0, useNativeDriver: false }),
          Animated.timing(opacity, { toValue: 0, duration: 0, useNativeDriver: false }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.Text
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity,
        color,
        fontSize: 14 + Math.random() * 12,
      }}
    >
      {symbol}
    </Animated.Text>
  );
}

// ── Animated score counter ────────────────────────────────────────────────────
function ScoreCounter({ target, color }: { target: number; color: string }) {
  const [displayed, setDisplayed] = useState(0);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const listener = anim.addListener(({ value }) => {
      setDisplayed(Math.round(value));
    });
    Animated.timing(anim, {
      toValue: target,
      duration: 2000,
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(listener);
  }, [target]);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: target / 100,
      duration: 2200,
      useNativeDriver: false,
    }).start();
  }, [target]);

  const scoreLabel =
    target >= 75
      ? "Strong Foundation"
      : target >= 55
      ? "Building Resilience"
      : target >= 35
      ? "Early Recovery"
      : "Needs Extra Care";

  return (
    <View style={sc.wrapper}>
      <View style={[sc.ring, { borderColor: `${color}20` }]}>
        <View style={[sc.ringFill, { borderColor: color, opacity: 0.15 }]} />
        <View style={sc.center}>
          <Text style={[sc.number, { color }]}>{displayed}</Text>
          <Text style={sc.pct}>%</Text>
        </View>
      </View>
      <Text style={[sc.label, { color }]}>{scoreLabel}</Text>
      <View style={sc.barTrack}>
        <Animated.View
          style={[
            sc.barFill,
            {
              backgroundColor: color,
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const sc = StyleSheet.create({
  wrapper: { alignItems: "center", gap: 8 },
  ring: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  ringFill: {
    position: "absolute",
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 10,
  },
  center: { flexDirection: "row", alignItems: "flex-end", gap: 2 },
  number: { fontSize: 44, fontFamily: "Inter_700Bold", lineHeight: 50 },
  pct: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: Colors.light.textSecondary, marginBottom: 6 },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  barTrack: {
    width: 180,
    height: 6,
    backgroundColor: Colors.light.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: { height: 6, borderRadius: 3 },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useRecovery();
  const [showPlan, setShowPlan] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(0);

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const bottomPad = Platform.OS === "web" ? insets.bottom + 34 : insets.bottom + 24;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const bgScale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: false, tension: 60, friction: 10 }),
      Animated.spring(bgScale, { toValue: 1, useNativeDriver: false, tension: 40, friction: 8 }),
    ]).start();

    const timer = setTimeout(() => setShowPlan(true), 2800);
    return () => clearTimeout(timer);
  }, []);

  if (!profile) {
    router.replace("/onboarding");
    return null;
  }

  const feeling = profile.currentFeeling || "hopeful";
  const config = FEELING_CONFIG[feeling] ?? FEELING_CONFIG.hopeful;
  const stability = computeStability(profile as any);
  const plan =
    SUBSTANCE_PLANS[profile.addictionType] ?? SUBSTANCE_PLANS.alcohol;

  const particles = Array.from({ length: 12 }).map((_, i) => ({
    symbol: config.particles[i % config.particles.length],
    x: (SCREEN_W / 12) * i + Math.random() * 30,
    delay: i * 300,
  }));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: topPad, paddingBottom: bottomPad }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Emotional animation */}
      <Animated.View
        style={[
          styles.emotionCard,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={[styles.emotionBg, { backgroundColor: `${config.color}08` }]}>
          {/* Pulsing rings */}
          <PulsingRing color={config.color} delay={0} size={220} />
          <PulsingRing color={config.color} delay={500} size={160} />
          <PulsingRing color={config.color} delay={1000} size={100} />

          {/* Floating particles */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {particles.map((p, i) => (
              <FloatingParticle
                key={i}
                symbol={p.symbol}
                color={config.color}
                delay={p.delay}
                startX={p.x}
              />
            ))}
          </View>

          {/* Center orb */}
          <Animated.View
            style={[
              styles.orb,
              {
                backgroundColor: config.color,
                transform: [{ scale: bgScale }],
              },
            ]}
          >
            <Text style={styles.orbEmoji}>
              {feeling === "hopeful" ? "🌱" :
               feeling === "determined" ? "⚡" :
               feeling === "scared" ? "🕊️" :
               feeling === "anxious" ? "🌊" :
               feeling === "relieved" ? "✨" :
               feeling === "ashamed" ? "💜" :
               feeling === "lost" ? "🧭" : "🌟"}
            </Text>
          </Animated.View>
        </View>

        <View style={styles.emotionText}>
          <Text style={[styles.emotionTitle, { color: config.color }]}>
            {config.title}
          </Text>
          <Text style={styles.emotionMessage}>{config.message}</Text>
        </View>
      </Animated.View>

      {/* Mental stability score */}
      <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.cardTitle}>Your Mental Stability Score</Text>
        <Text style={styles.cardSub}>
          Calculated from your substance history, craving level, motivations, and commitment
        </Text>
        <ScoreCounter target={stability} color={config.color} />
        <View style={styles.scoreFactors}>
          <FactorRow
            icon="shield"
            label="Substance Risk"
            value={
              profile.addictionType === "cocaine"
                ? "High"
                : profile.addictionType === "alcohol"
                ? "Moderate"
                : "Low–Moderate"
            }
            color={
              profile.addictionType === "cocaine"
                ? "#E74C3C"
                : profile.addictionType === "alcohol"
                ? "#F5A623"
                : "#4CAF78"
            }
          />
          <FactorRow
            icon="heart"
            label="Motivation Strength"
            value={`${profile.motivations?.length ?? 0} reasons identified`}
            color={Colors.light.tint}
          />
          <FactorRow
            icon="trending-up"
            label="Commitment Level"
            value={`${((profile as any).commitmentLevel ?? 5) * 10}%`}
            color={config.color}
          />
        </View>
      </Animated.View>

      {/* 4-Week Recovery Plan */}
      {showPlan && (
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <View style={styles.planHeader}>
            <Feather name="map" size={18} color={Colors.light.tint} />
            <Text style={styles.cardTitle}>Your Personalised 4-Week Plan</Text>
          </View>
          <Text style={styles.cardSub}>
            Built around your {profile.addictionType} recovery needs and your goals
          </Text>
          {plan.map((week, i) => (
            <WeekCard
              key={week.week}
              week={week}
              index={i}
              color={config.color}
              expanded={expandedWeek === i}
              onToggle={() => setExpandedWeek(expandedWeek === i ? null : i)}
            />
          ))}
        </Animated.View>
      )}

      {/* What gets tracked */}
      {showPlan && (
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <Text style={styles.cardTitle}>What We'll Track Together</Text>
          <View style={styles.trackList}>
            {[
              { icon: "bar-chart-2", label: "Daily mood & craving levels", color: "#5B8DEF" },
              { icon: "check-circle", label: "Recovery tasks completed each day", color: Colors.light.tint },
              { icon: "dollar-sign", label: "Money saved since you quit", color: "#F5A623" },
              { icon: "wind", label: "Coping exercises used", color: "#4CAF78" },
              { icon: "tree", label: "Your tree growing stronger daily", color: Colors.light.tint },
              { icon: "zap", label: "Streak milestones and badges", color: "#FFB800" },
            ].map((item, i) => (
              <View key={i} style={styles.trackRow}>
                <View style={[styles.trackIcon, { backgroundColor: `${item.color}18` }]}>
                  <Feather name={item.icon as any} size={16} color={item.color} />
                </View>
                <Text style={styles.trackLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {/* CTA */}
      {showPlan && (
        <Animated.View style={{ opacity: fadeAnim, gap: 12 }}>
          <Pressable
            style={[styles.ctaBtn, { backgroundColor: config.color }]}
            onPress={() => router.replace("/")}
          >
            <Feather name="home" size={20} color="#fff" />
            <Text style={styles.ctaBtnText}>Start My Recovery Journey</Text>
          </Pressable>
          <Text style={styles.ctaNote}>
            Your score improves every day you stay committed. Let's grow that tree.
          </Text>
        </Animated.View>
      )}
    </ScrollView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function PulsingRing({ color, delay, size }: { color: string; delay: number; size: number }) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.2, duration: 2000, useNativeDriver: false }),
          Animated.timing(opacity, { toValue: 0, duration: 2000, useNativeDriver: false }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 0.7, duration: 0, useNativeDriver: false }),
          Animated.timing(opacity, { toValue: 0.4, duration: 0, useNativeDriver: false }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: color,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

function FactorRow({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={fr.row}>
      <View style={[fr.icon, { backgroundColor: `${color}18` }]}>
        <Feather name={icon} size={14} color={color} />
      </View>
      <Text style={fr.label}>{label}</Text>
      <Text style={[fr.value, { color }]}>{value}</Text>
    </View>
  );
}

const fr = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  value: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});

function WeekCard({
  week,
  index,
  color,
  expanded,
  onToggle,
}: {
  week: { week: number; title: string; focus: string; tips: string[] };
  index: number;
  color: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const weekColors = [Colors.light.tint, "#5B8DEF", "#F5A623", "#9B59B6"];
  const wColor = weekColors[index] ?? color;
  return (
    <Pressable
      style={[wc.card, { borderLeftColor: wColor }]}
      onPress={onToggle}
    >
      <View style={wc.header}>
        <View style={[wc.badge, { backgroundColor: `${wColor}18` }]}>
          <Text style={[wc.badgeText, { color: wColor }]}>Week {week.week}</Text>
        </View>
        <View style={wc.info}>
          <Text style={wc.title}>{week.title}</Text>
          <Text style={wc.focus}>{week.focus}</Text>
        </View>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={Colors.light.textMuted}
        />
      </View>
      {expanded && (
        <View style={wc.tips}>
          {week.tips.map((tip, i) => (
            <View key={i} style={wc.tipRow}>
              <View style={[wc.tipDot, { backgroundColor: wColor }]} />
              <Text style={wc.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

const wc = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    gap: 0,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },
  badgeText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  info: { flex: 1 },
  title: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  focus: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.light.textMuted },
  tips: { gap: 8, marginTop: 12 },
  tipRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  tipDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7, flexShrink: 0 },
  tipText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, lineHeight: 19 },
});

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { paddingHorizontal: 20, gap: 20 },
  emotionCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  emotionBg: {
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  orb: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  orbEmoji: { fontSize: 36 },
  emotionText: { padding: 20, gap: 8 },
  emotionTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  emotionMessage: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 21,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 24,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.light.text },
  cardSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.textMuted, lineHeight: 19 },
  scoreFactors: { gap: 0 },
  planHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  trackList: { gap: 12 },
  trackRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  trackIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  trackLabel: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.light.text },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 17 },
  ctaNote: {
    textAlign: "center",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
});
