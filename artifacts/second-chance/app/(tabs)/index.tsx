import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { getTreeStage, StreakTree } from "@/components/StreakTree";
import { useRecovery } from "@/context/RecoveryContext";

const TREE_STAGE_LABELS: Record<string, string> = {
  seedling: "A tiny seedling\u2014your journey begins",
  sapling: "A young sapling reaching for light",
  growing: "Growing strong day by day",
  flourishing: "Flourishing with resilience",
  majestic: "A majestic tree \u2014 you are thriving!",
  wilting: "Resting\u2014every tree survives winter",
  monsoon: "Weathering the storm\u2014roots hold firm",
};

function MoodButton({
  emoji,
  label,
  selected,
  onPress,
}: {
  emoji: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.moodBtn, selected && styles.moodBtnSelected]}
    >
      <Text style={styles.moodEmoji}>{emoji}</Text>
      <Text style={[styles.moodLabel, selected && styles.moodLabelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const MOODS = [
  { emoji: "😔", label: "Low", value: 1 },
  { emoji: "😐", label: "Okay", value: 2 },
  { emoji: "🙂", label: "Good", value: 3 },
  { emoji: "😊", label: "Great", value: 4 },
  { emoji: "🌟", label: "Amazing", value: 5 },
];

export default function JourneyScreen() {
  const insets = useSafeAreaInsets();
  const { profile, streak, longestStreak, addMoodEntry } = useRecovery();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodLogged, setMoodLogged] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const stage = getTreeStage(streak);

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
      <View
        style={[
          styles.onboardContainer,
          { paddingTop: topPad },
        ]}
      >
        <StreakTree streak={0} size={160} />
        <Text style={styles.welcomeTitle}>Welcome to Second Chance</Text>
        <Text style={styles.welcomeSubtitle}>
          Your recovery journey starts with a single step.
        </Text>
        <Pressable
          style={styles.startBtn}
          onPress={() => router.push("/onboarding")}
        >
          <Text style={styles.startBtnText}>Begin My Journey</Text>
        </Pressable>
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
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <StreakTree streak={streak} size={180} />
          </Animated.View>
          <Text style={styles.streakNum}>{streakLabel}</Text>
          <Text style={styles.treeStageLabel}>{TREE_STAGE_LABELS[stage]}</Text>

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

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Pressable
            style={styles.copingBtn}
            onPress={() => router.push("/coping")}
          >
            <View style={styles.copingBtnInner}>
              <Feather name="heart" size={26} color="#fff" />
              <Text style={styles.copingBtnText}>I Need Support Now</Text>
            </View>
            <Text style={styles.copingBtnSub}>
              Breathe · Distract · Connect
            </Text>
          </Pressable>
        </Animated.View>

        <View style={styles.moodSection}>
          <Text style={styles.sectionTitle}>How are you feeling today?</Text>
          <View style={styles.moodRow}>
            {MOODS.map((m) => (
              <MoodButton
                key={m.value}
                emoji={m.emoji}
                label={m.label}
                selected={selectedMood === m.value}
                onPress={() => setSelectedMood(m.value)}
              />
            ))}
          </View>
          {selectedMood !== null && (
            <Pressable style={styles.logMoodBtn} onPress={handleLogMood}>
              <Text style={styles.logMoodText}>Log Mood</Text>
            </Pressable>
          )}
          {moodLogged && (
            <Text style={styles.moodLoggedText}>
              Mood logged — keep going! 🌱
            </Text>
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
    padding: 24,
    alignItems: "center",
    gap: 8,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.light.border,
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
  moodSection: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  moodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  moodBtn: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    flex: 1,
  },
  moodBtnSelected: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 1.5,
    borderColor: Colors.light.tint,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  moodLabelSelected: {
    color: Colors.light.tint,
    fontFamily: "Inter_600SemiBold",
  },
  logMoodBtn: {
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
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
