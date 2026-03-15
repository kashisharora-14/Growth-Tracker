import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { BrainMascot, getEmotionFromStreak, type MascotEmotion } from "@/components/BrainMascot";
import Colors from "@/constants/colors";
import { useRecovery } from "@/context/RecoveryContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DISTRACTIONS = [
  { icon: "smartphone", label: "Phone Scrolling", time: "1h 12m", color: "#FF6B6B" },
  { icon: "tv",         label: "Streaming",       time: "45m",    color: "#FF9F43" },
  { icon: "coffee",     label: "Caffeine",         time: "30m",    color: "#A29BFE" },
  { icon: "wind",       label: "Stress",           time: "20m",    color: "#74B9FF" },
];

const EMOTION_LABELS: Record<MascotEmotion, { text: string; color: string }> = {
  ecstatic: { text: "Thriving",    color: "#E8954C" },
  happy:    { text: "Strong",      color: "#5BAD80" },
  calm:     { text: "Steady",      color: "#7B9BC8" },
  coping:   { text: "Breathing",   color: "#7EC8C8" },
  worried:  { text: "Holding On",  color: "#D4925A" },
  sad:      { text: "Struggling",  color: "#A0A8B8" },
};

function HealthBar({ progress, color }: { progress: number; color: string }) {
  const animWidth = useSharedValue(0);

  useEffect(() => {
    animWidth.value = withTiming(progress, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${animWidth.value * 100}%` as any,
  }));

  return (
    <View style={styles.healthBarTrack}>
      <Animated.View style={[styles.healthBarFill, { backgroundColor: color }, barStyle]} />
    </View>
  );
}

function StatCard({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: React.ComponentProps<typeof Feather>["name"] }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Feather name={icon} size={15} color="#8E9BB5" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub && <Text style={styles.statSub}>{sub}</Text>}
    </View>
  );
}

function DistractionRow({ icon, label, time, color, index }: { icon: React.ComponentProps<typeof Feather>["name"]; label: string; time: string; color: string; index: number }) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(20);

  useEffect(() => {
    const delay = index * 80;
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 400 });
      translateX.value = withSpring(0, { damping: 14, stiffness: 140 });
    }, delay);
  }, []);

  const rowStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.distractionRow, rowStyle]}>
      <View style={[styles.distractionIcon, { backgroundColor: color + "18" }]}>
        <Feather name={icon} size={16} color={color} />
      </View>
      <Text style={styles.distractionLabel}>{label}</Text>
      <Text style={[styles.distractionTime, { color }]}>{time}</Text>
    </Animated.View>
  );
}

const WELCOME_SLIDES = [
  { icon: "heart" as const, color: "#5BAD80", title: "Welcome to Second Chance", body: "Every day sober is a victory worth celebrating." },
  { icon: "trending-up" as const, color: "#7B9BC8", title: "Track Your Streak", body: "Watch your progress grow one day at a time." },
  { icon: "users" as const, color: "#E8954C", title: "You Are Not Alone", body: "A community is here to support your journey." },
];

export default function JourneyScreen() {
  const insets = useSafeAreaInsets();
  const { profile, streak, longestStreak, isLoading } = useRecovery();
  const [slideIndex, setSlideIndex] = useState(0);

  const fadeAnim = useSharedValue(0);
  const mascotScale = useSharedValue(0.85);

  const emotion = getEmotionFromStreak(streak);
  const emotionInfo = EMOTION_LABELS[emotion];

  const healthProgress = Math.min(streak / 90, 1);
  const recoveryHours = Math.floor(streak * 24);
  const recHoursDisplay = recoveryHours >= 24
    ? `${Math.floor(recoveryHours / 24)}d ${recoveryHours % 24}h`
    : `${recoveryHours}h`;

  useEffect(() => {
    if (!isLoading && !profile?.isOnboarded) {
      router.replace("/onboarding");
    }
  }, [isLoading, profile]);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    mascotScale.value = withSpring(1, { damping: 10, stiffness: 100 });
  }, []);

  const screenStyle = useAnimatedStyle(() => ({ opacity: fadeAnim.value }));
  const mascotStyle = useAnimatedStyle(() => ({ transform: [{ scale: mascotScale.value }] }));

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const bottomPad = Platform.OS === "web" ? insets.bottom + 34 + 84 : insets.bottom + 100;

  if (!profile) {
    return (
      <View style={[styles.onboardContainer, { paddingTop: topPad }]}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            setSlideIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));
          }}
          style={styles.slideScroll}
        >
          {WELCOME_SLIDES.map((slide, i) => (
            <View key={i} style={[styles.slide, { width: SCREEN_WIDTH }]}>
              {i === 0 && (
                <View style={{ marginBottom: 8 }}>
                  <BrainMascot emotion="happy" size={140} />
                </View>
              )}
              <Text style={styles.slideTitle}>{slide.title}</Text>
              <Text style={styles.slideBody}>{slide.body}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.dotsRow}>
          {WELCOME_SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === slideIndex && styles.dotActive]} />
          ))}
        </View>
        <Pressable style={styles.startBtn} onPress={() => router.push("/onboarding")}>
          <Text style={styles.startBtnText}>Begin My Journey</Text>
          <Feather name="arrow-right" size={17} color="#fff" />
        </Pressable>
      </View>
    );
  }

  return (
    <Animated.ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: topPad, paddingBottom: bottomPad }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={screenStyle}>

        {/* Header */}
        <LinearGradient
          colors={["#2D7A4F", "#4CAF78", "#7DD4A8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.appTitle}>
                Hello, <Text style={styles.appTitleName}>{profile.name}</Text>
              </Text>
              <Text style={styles.headerSub}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</Text>
            </View>
            <Pressable style={styles.settingsBtn} onPress={() => router.push("/profile")}>
              <Feather name="settings" size={19} color="rgba(255,255,255,0.8)" />
            </Pressable>
          </View>
        </LinearGradient>

        {/* Mascot Hero Section */}
        <View style={styles.heroCard}>
          <Animated.View style={mascotStyle}>
            <BrainMascot emotion={emotion} size={180} />
          </Animated.View>

          {/* Streak number */}
          <View style={styles.streakBlock}>
            <Text style={styles.streakNumber}>{streak}</Text>
            <View style={styles.streakMeta}>
              <Text style={styles.streakUnit}>days sober</Text>
              <View style={[styles.emotionBadge, { backgroundColor: emotionInfo.color + "18" }]}>
                <View style={[styles.emotionDot, { backgroundColor: emotionInfo.color }]} />
                <Text style={[styles.emotionText, { color: emotionInfo.color }]}>{emotionInfo.text}</Text>
              </View>
            </View>
          </View>

          {/* Health progress bar */}
          <View style={styles.healthSection}>
            <View style={styles.healthLabelRow}>
              <Text style={styles.healthLabel}>Recovery Health</Text>
              <Text style={[styles.healthPct, { color: emotionInfo.color }]}>
                {Math.round(healthProgress * 100)}%
              </Text>
            </View>
            <HealthBar progress={healthProgress} color={emotionInfo.color} />
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard
            label="Recovery Time"
            value={recHoursDisplay}
            icon="clock"
          />
          <View style={styles.statDivider} />
          <StatCard
            label="Best Streak"
            value={`${longestStreak}d`}
            icon="award"
          />
          <View style={styles.statDivider} />
          <StatCard
            label="Sessions"
            value={`${streak + 3}`}
            icon="activity"
          />
        </View>

        {/* Top Distractions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Distractions</Text>
          <View style={styles.distractionsList}>
            {DISTRACTIONS.map((d, i) => (
              <DistractionRow
                key={d.label}
                icon={d.icon as any}
                label={d.label}
                time={d.time}
                color={d.color}
                index={i}
              />
            ))}
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.quickRow}>
          <Pressable style={[styles.quickBtn, { backgroundColor: "#5BAD8015" }]} onPress={() => router.push("/coping")}>
            <Feather name="wind" size={20} color="#5BAD80" />
            <Text style={[styles.quickLabel, { color: "#5BAD80" }]}>Breathe</Text>
          </Pressable>
          <Pressable style={[styles.quickBtn, { backgroundColor: "#7B9BC815" }]} onPress={() => router.push("/progress")}>
            <Feather name="bar-chart-2" size={20} color="#7B9BC8" />
            <Text style={[styles.quickLabel, { color: "#7B9BC8" }]}>Progress</Text>
          </Pressable>
        </View>

        {/* SOS Emergency — highlighted */}
        <Pressable onPress={() => router.push("/coping")} style={styles.sosCard}>
          <LinearGradient
            colors={["#E53935", "#FF6B6B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sosGradient}
          >
            <View style={styles.sosIconWrap}>
              <Feather name="alert-circle" size={26} color="#fff" />
            </View>
            <View style={styles.sosText}>
              <Text style={styles.sosTitle}>Emergency Support</Text>
              <Text style={styles.sosSub}>Tap if you're struggling right now</Text>
            </View>
            <Feather name="chevron-right" size={22} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </Pressable>

      </Animated.View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F6F3",
  },
  content: {
    paddingHorizontal: 20,
    gap: 14,
  },

  /* Header */
  headerGradient: {
    marginHorizontal: -20,
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: -0.4,
  },
  appTitleName: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "rgba(255,255,255,0.9)",
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
    marginTop: 3,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Hero card */
  heroCard: {
    backgroundColor: "#fff",
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  streakBlock: {
    alignItems: "center",
    gap: 6,
  },
  streakNumber: {
    fontSize: 72,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
    lineHeight: 76,
    letterSpacing: -3,
  },
  streakMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  streakUnit: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#8E9BB5",
  },
  emotionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  emotionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  emotionText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  /* Health bar */
  healthSection: {
    width: "100%",
    gap: 8,
  },
  healthLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  healthLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#8E9BB5",
  },
  healthPct: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  healthBarTrack: {
    height: 8,
    borderRadius: 8,
    backgroundColor: "#F0EDE8",
    overflow: "hidden",
  },
  healthBarFill: {
    height: 8,
    borderRadius: 8,
  },

  /* Stats row */
  statsRow: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statIcon: {
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "#8E9BB5",
    textAlign: "center",
  },
  statSub: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "#B0B8C8",
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#F0EDE8",
  },

  /* Distractions */
  section: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#1A1A2E",
    marginBottom: 8,
  },
  distractionsList: {
    gap: 2,
  },
  distractionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F8F6F3",
  },
  distractionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  distractionLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#2A2A3E",
  },
  distractionTime: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },

  /* Quick actions */
  quickRow: {
    flexDirection: "row",
    gap: 10,
  },
  quickBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 18,
    gap: 6,
  },
  quickLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  /* SOS */
  sosCard: {
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#E53935",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  sosGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 14,
  },
  sosIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  sosText: {
    flex: 1,
    gap: 3,
  },
  sosTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  sosSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
  },

  /* Onboard */
  onboardContainer: {
    flex: 1,
    backgroundColor: "#F8F6F3",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 20,
  },
  slideScroll: {
    flexGrow: 0,
  },
  slide: {
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
  },
  slideTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
    textAlign: "center",
  },
  slideBody: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#8E9BB5",
    textAlign: "center",
    lineHeight: 22,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D0CCC8",
  },
  dotActive: {
    width: 20,
    backgroundColor: "#1A1A2E",
  },
  startBtn: {
    backgroundColor: "#1A1A2E",
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  startBtnText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  slideIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  slideHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#B0ABA6",
    letterSpacing: 0.3,
  },
  supportCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 18,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.calm,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  supportLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  supportIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E8F0FE",
    alignItems: "center",
    justifyContent: "center",
  },
  supportText: { flex: 1, gap: 3 },
  supportTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  supportSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  supportArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8F0FE",
    alignItems: "center",
    justifyContent: "center",
  },
  moodSection: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  moodHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  moodLoggedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.tint + "40",
  },
  moodLoggedBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.tint,
  },
  moodScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  moodChip: {
    alignItems: "center",
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 1.5,
    borderColor: "transparent",
    minWidth: 62,
  },
  moodChipSelected: {
    backgroundColor: Colors.light.tint + "18",
    borderColor: Colors.light.tint,
  },
  moodEmoji: { fontSize: 26 },
  moodLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  moodLabelSelected: {
    color: Colors.light.tint,
    fontFamily: "Inter_700Bold",
  },
  logMoodBtn: {
    backgroundColor: Colors.light.tint,
    borderRadius: 13,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  logMoodText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});
