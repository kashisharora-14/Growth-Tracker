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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

import Colors from "@/constants/colors";
import { BrainCompanion, getBrainEmotion } from "@/components/BrainCompanion";
import { useRecovery } from "@/context/RecoveryContext";

const BRAIN_EMOTION_LABELS: Record<string, { label: string; message: string; color: string }> = {
  ecstatic: { label: "Overjoyed!", message: "Your brain is absolutely glowing with pride \u2728", color: "#FFB700" },
  happy:    { label: "Happy",     message: "Feeling great\u2014keep this momentum going!", color: "#4CAF82" },
  content:  { label: "Content",   message: "You\u2019re doing well, one step at a time \ud83d\udca1",  color: "#5B8FD4" },
  neutral:  { label: "Steady",    message: "Still going\u2014every sober hour counts",  color: "#8E9BB5" },
  worried:  { label: "Worried",   message: "Hang in there, your brain believes in you", color: "#E8A634" },
  sad:      { label: "Struggling",message: "It\u2019s okay to struggle\u2014let\u2019s start fresh today", color: "#E07A3A" },
  crying:   { label: "Hurting",   message: "Reach out\u2014you don\u2019t have to face this alone", color: "#C0504D" },
};

const WELCOME_SLIDES = [
  {
    icon: "feather" as const,
    color: Colors.light.tint,
    title: "Welcome to Second Chance",
    body: "Every single day sober is a victory worth celebrating. Your tree grows with you.",
  },
  {
    icon: "trending-up" as const,
    color: Colors.light.calm,
    title: "Track Your Streak",
    body: "Watch your recovery tree bloom as you hit milestones. One day at a time.",
  },
  {
    icon: "users" as const,
    color: Colors.light.accent,
    title: "You Are Not Alone",
    body: "A community of people on the same journey is here to cheer you on every step.",
  },
];

function MoodChip({
  icon,
  color,
  label,
  selected,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  color: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.moodChip, selected && { borderColor: color, borderWidth: 2 }]}
    >
      <View style={[styles.moodIconCircle, { backgroundColor: color + "22" }, selected && { backgroundColor: color + "33" }]}>
        <Feather name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.moodLabel, selected && { color, fontFamily: "Inter_600SemiBold" }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const MOODS: { icon: React.ComponentProps<typeof Feather>["name"]; color: string; label: string; value: number }[] = [
  { icon: "cloud-rain", color: "#6B8CBA", label: "Low",     value: 1 },
  { icon: "cloud",      color: "#8E9BB5", label: "Okay",    value: 2 },
  { icon: "sun",        color: "#E8A634", label: "Good",    value: 3 },
  { icon: "star",       color: "#E07A3A", label: "Great",   value: 4 },
  { icon: "zap",        color: "#4CAF82", label: "Amazing", value: 5 },
];

export default function JourneyScreen() {
  const insets = useSafeAreaInsets();
  const { profile, streak, longestStreak, addMoodEntry, isLoading } = useRecovery();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodLogged, setMoodLogged] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const emotion = getBrainEmotion(streak);
  const emotionInfo = BRAIN_EMOTION_LABELS[emotion];

  useEffect(() => {
    if (!isLoading && !profile?.isOnboarded) {
      router.replace("/onboarding");
    }
  }, [isLoading, profile]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: false,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const topPad =
    Platform.OS === "web"
      ? insets.top + 67
      : insets.top + 16;

  const handleLogMood = () => {
    if (selectedMood === null) return;
    addMoodEntry({ mood: selectedMood, cravingLevel: 1 });
    setMoodLogged(true);
    setSelectedMood(null);
  };

  if (!profile) {
    return (
      <View style={[styles.onboardContainer, { paddingTop: topPad }]}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setSlideIndex(idx);
          }}
          style={styles.slideScroll}
        >
          {WELCOME_SLIDES.map((slide, i) => (
            <View key={i} style={[styles.slide, { width: SCREEN_WIDTH }]}>
              <View style={[styles.slideIconWrap, { backgroundColor: slide.color + "20" }]}>
                <Feather name={slide.icon} size={44} color={slide.color} />
              </View>
              {i === 0 && <BrainCompanion streak={0} size={130} />}
              <Text style={styles.slideTitle}>{slide.title}</Text>
              <Text style={styles.slideBody}>{slide.body}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.dotsRow}>
          {WELCOME_SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === slideIndex && styles.dotActive]}
            />
          ))}
        </View>

        <Pressable
          style={styles.startBtn}
          onPress={() => router.push("/onboarding")}
        >
          <Feather name="arrow-right" size={18} color="#fff" />
          <Text style={styles.startBtnText}>Begin My Journey</Text>
        </Pressable>
        <Text style={styles.slideHint}>Swipe to explore</Text>
      </View>
    );
  }

  const streakLabel =
    streak === 0
      ? "Start your streak today"
      : streak === 1
      ? "1 day sober"
      : `${streak} days sober`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topPad,
          paddingBottom: Platform.OS === "web" ? insets.bottom + 34 + 84 : insets.bottom + 100,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Good{" "}
              {new Date().getHours() < 12
                ? "morning"
                : new Date().getHours() < 17
                ? "afternoon"
                : "evening"}
              ,
            </Text>
            <Text style={styles.name}>{profile.name}</Text>
          </View>
          <Pressable
            style={styles.notifBtn}
            onPress={() => router.push("/coping")}
          >
            <Feather name="bell" size={20} color={Colors.light.tint} />
          </Pressable>
        </View>

        <View style={styles.treeCard}>
          <View style={styles.brainCenter}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <BrainCompanion streak={streak} size={160} />
            </Animated.View>
            <View style={[styles.emotionBadge, { backgroundColor: emotionInfo.color + "20", borderColor: emotionInfo.color + "60" }]}>
              <View style={[styles.emotionDot, { backgroundColor: emotionInfo.color }]} />
              <Text style={[styles.emotionBadgeText, { color: emotionInfo.color }]}>{emotionInfo.label}</Text>
            </View>
          </View>

          <Text style={styles.streakNum}>{streakLabel}</Text>

          <View style={[styles.brainMessageBox, { borderLeftColor: emotionInfo.color }]}>
            <Text style={styles.brainMessage}>{emotionInfo.message}</Text>
          </View>

          <View style={styles.streakRow}>
            <View style={styles.streakStat}>
              <Text style={styles.streakStatNum}>{streak}</Text>
              <Text style={styles.streakStatLabel}>Current</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakStat}>
              <Text style={styles.streakStatNum}>{longestStreak}</Text>
              <Text style={styles.streakStatLabel}>Best</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakStat}>
              <Text style={styles.streakStatNum}>
                {Math.round(streak * 0.92 * 10) / 10}%
              </Text>
              <Text style={styles.streakStatLabel}>Success</Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.emergencyBtn} onPress={() => router.push("/emergency")}>
          <View style={styles.emergencyBtnLeft}>
            <View style={styles.emergencyBtnIcon}>
              <Feather name="alert-circle" size={22} color="#fff" />
            </View>
            <View style={styles.emergencyBtnText}>
              <Text style={styles.emergencyBtnTitle}>Emergency Support</Text>
              <Text style={styles.emergencyBtnSub}>Tap if you're struggling right now</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.7)" />
        </Pressable>

        <View style={styles.supportCard}>
          <View style={styles.supportHeader}>
            <View style={styles.supportIconWrap}>
              <Feather name="heart" size={18} color={Colors.light.calm} />
            </View>
            <Text style={styles.supportTitle}>Need support right now?</Text>
          </View>
          <View style={styles.supportTiles}>
            {[
              { icon: "wind" as const,   label: "Breathing",  color: "#5B8FD4" },
              { icon: "anchor" as const, label: "Grounding",  color: "#6AAF7A" },
              { icon: "users" as const,  label: "Connect",    color: "#C47AC0" },
            ].map((item) => (
              <Pressable
                key={item.label}
                style={styles.supportTile}
                onPress={() => router.push("/coping")}
              >
                <View style={[styles.supportTileIcon, { backgroundColor: item.color + "18" }]}>
                  <Feather name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={[styles.supportTileLabel, { color: item.color }]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.moodSection}>
          <View style={styles.moodHeader}>
            <Text style={styles.sectionTitle}>How are you feeling?</Text>
            {moodLogged && (
              <View style={styles.moodLoggedBadge}>
                <Feather name="check" size={12} color={Colors.light.tint} />
                <Text style={styles.moodLoggedBadgeText}>Logged</Text>
              </View>
            )}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moodScroll}
          >
            {MOODS.map((m) => (
              <MoodChip
                key={m.value}
                icon={m.icon}
                color={m.color}
                label={m.label}
                selected={selectedMood === m.value}
                onPress={() => setSelectedMood(m.value)}
              />
            ))}
          </ScrollView>
          {selectedMood !== null && (
            <Pressable style={styles.logMoodBtn} onPress={handleLogMood}>
              <Feather name="check-circle" size={16} color="#fff" />
              <Text style={styles.logMoodText}>Save Mood</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Today's Insight</Text>
          <Text style={styles.tipsText}>
            "Cravings are like ocean waves — they rise, peak, and pass. You
            don't have to fight them, just surf them."
          </Text>
        </View>

        <View style={styles.quickActions}>
          <Pressable
            style={styles.quickAction}
            onPress={() => router.push("/community")}
          >
            <Feather name="users" size={22} color={Colors.light.tint} />
            <Text style={styles.quickActionLabel}>Community</Text>
          </Pressable>
          <Pressable
            style={styles.quickAction}
            onPress={() => router.push("/progress")}
          >
            <Feather name="trending-up" size={22} color={Colors.light.tint} />
            <Text style={styles.quickActionLabel}>Progress</Text>
          </Pressable>
          <Pressable
            style={styles.quickAction}
            onPress={() => router.push("/coping")}
          >
            <Feather name="wind" size={22} color={Colors.light.tint} />
            <Text style={styles.quickActionLabel}>Breathe</Text>
          </Pressable>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  onboardContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 20,
  },
  welcomeTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  startBtn: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 14,
  },
  startBtnText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  name: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  treeCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    gap: 10,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  brainCenter: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
  },
  emotionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  emotionDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  emotionBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  brainMessageBox: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderLeftWidth: 3,
    width: "100%",
  },
  brainMessage: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  streakNum: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    marginTop: 4,
  },
  treeStageLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 0,
    width: "100%",
  },
  streakStat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  streakStatNum: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.light.tint,
  },
  streakStatLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  streakDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.light.border,
  },
  copingBtn: {
    backgroundColor: Colors.light.danger,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 4,
    shadowColor: Colors.light.danger,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  copingBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  copingBtnText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  copingBtnSub: {
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  emergencyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.danger,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: Colors.light.danger,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  emergencyBtnLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  emergencyBtnIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  emergencyBtnText: {
    gap: 3,
    flex: 1,
  },
  emergencyBtnTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  emergencyBtnSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
  },
  supportCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  supportHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  supportIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.light.calm + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  supportTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  supportTiles: {
    flexDirection: "row",
    gap: 10,
  },
  supportTile: {
    flex: 1,
    alignItems: "center",
    gap: 10,
    paddingVertical: 16,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  supportTileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  supportTileLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  moodSection: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 20,
    gap: 12,
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
    backgroundColor: Colors.light.tint + "15",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  moodLoggedBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.tint,
  },
  moodScroll: {
    flexDirection: "row",
    gap: 10,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  moodChip: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: Colors.light.backgroundSecondary,
    minWidth: 64,
  },
  moodIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  moodLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  logMoodBtn: {
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
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
  moodLoggedText: {
    textAlign: "center",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.tint,
  },
  tipsCard: {
    backgroundColor: Colors.light.tint,
    borderRadius: 20,
    padding: 20,
    gap: 8,
  },
  tipsTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.8)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  tipsText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    lineHeight: 22,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  quickAction: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  quickActionLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
});
