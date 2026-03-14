import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { StreakTree } from "@/components/StreakTree";
import { useRecovery } from "@/context/RecoveryContext";

const { width } = Dimensions.get("window");
const BAR_W = (width - 72) / 7;

const MOOD_COLORS = ["#E53E3E", "#F5A623", "#F5A623", "#4CAF78", "#2D7A4F"];
const MOOD_LABELS = ["Low", "Fair", "Okay", "Good", "Great"];

function MoodBar({ value, date }: { value: number; date: string }) {
  const h = (value / 5) * 80;
  const color = MOOD_COLORS[value - 1] ?? Colors.light.tint;
  const d = new Date(date);
  const label = d.toLocaleDateString("en", { weekday: "short" }).slice(0, 2);
  return (
    <View style={styles.barItem}>
      <View style={styles.barTrack}>
        <View
          style={[styles.barFill, { height: h, backgroundColor: color }]}
        />
      </View>
      <Text style={styles.barLabel}>{label}</Text>
    </View>
  );
}

const MILESTONES = [
  { days: 1, label: "First Day", icon: "sunrise" as const },
  { days: 3, label: "3-Day Warrior", icon: "shield" as const },
  { days: 7, label: "One Week", icon: "star" as const },
  { days: 14, label: "Two Weeks", icon: "award" as const },
  { days: 30, label: "One Month", icon: "zap" as const },
  { days: 60, label: "Two Months", icon: "target" as const },
  { days: 90, label: "Three Months", icon: "triangle" as const },
  { days: 180, label: "Six Months", icon: "anchor" as const },
  { days: 365, label: "One Year!", icon: "gift" as const },
];

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { streak, longestStreak, moodHistory, profile } = useRecovery();

  const topPad =
    Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const bottomPad =
    Platform.OS === "web" ? insets.bottom + 34 + 84 : insets.bottom + 100;

  const recentMood = moodHistory.slice(0, 7).reverse();
  const avgMood = recentMood.length
    ? Math.round(recentMood.reduce((a, m) => a + m.mood, 0) / recentMood.length)
    : 0;

  const moneySaved = Math.round(streak * 12.5);
  const hoursSaved = streak * 3;
  const nextMilestone = MILESTONES.find((m) => m.days > streak) ?? MILESTONES[MILESTONES.length - 1];
  const progressToNext = nextMilestone
    ? Math.min(100, Math.round((streak / nextMilestone.days) * 100))
    : 100;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad, paddingBottom: bottomPad },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Your Progress</Text>

      <View style={styles.treeSection}>
        <StreakTree streak={streak} size={140} />
        <View style={styles.treeInfo}>
          <Text style={styles.streakBig}>{streak}</Text>
          <Text style={styles.streakDaysLabel}>days sober</Text>
          <Text style={styles.streakBest}>Best: {longestStreak} days</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Feather name="dollar-sign" size={20} color={Colors.light.accent} />
          <Text style={styles.statNum}>${moneySaved}</Text>
          <Text style={styles.statLabel}>Money Saved</Text>
        </View>
        <View style={styles.statCard}>
          <Feather name="clock" size={20} color={Colors.light.calm} />
          <Text style={styles.statNum}>{hoursSaved}h</Text>
          <Text style={styles.statLabel}>Time Reclaimed</Text>
        </View>
        <View style={styles.statCard}>
          <Feather name="smile" size={20} color={Colors.light.tint} />
          <Text style={styles.statNum}>
            {avgMood > 0 ? MOOD_LABELS[avgMood - 1] : "—"}
          </Text>
          <Text style={styles.statLabel}>Avg Mood</Text>
        </View>
        <View style={styles.statCard}>
          <Feather name="calendar" size={20} color={Colors.light.tintLight} />
          <Text style={styles.statNum}>
            {profile
              ? new Date(profile.sobrietyStartDate).toLocaleDateString("en", {
                  month: "short",
                  day: "numeric",
                })
              : "—"}
          </Text>
          <Text style={styles.statLabel}>Start Date</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mood This Week</Text>
        {recentMood.length > 0 ? (
          <View style={styles.barsRow}>
            {recentMood.map((m, i) => (
              <MoodBar key={i} value={m.mood} date={m.date} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyMood}>
            <Feather name="bar-chart-2" size={32} color={Colors.light.textMuted} />
            <Text style={styles.emptyMoodText}>Log moods to see your chart</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Next Milestone</Text>
        <View style={styles.milestoneRow}>
          <View style={styles.milestoneBadge}>
            <Feather name={nextMilestone.icon} size={26} color={Colors.light.tint} />
          </View>
          <View style={styles.milestoneInfo}>
            <Text style={styles.milestoneName}>{nextMilestone.label}</Text>
            <Text style={styles.milestoneDays}>
              {nextMilestone.days - streak > 0
                ? `${nextMilestone.days - streak} days to go`
                : "Achieved!"}
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressToNext}%` },
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Milestones</Text>
        <View style={styles.milestonesGrid}>
          {MILESTONES.map((m) => {
            const achieved = streak >= m.days;
            return (
              <View
                key={m.days}
                style={[
                  styles.milestoneChip,
                  achieved && styles.milestoneChipAchieved,
                ]}
              >
                <Feather
                  name={m.icon}
                  size={18}
                  color={achieved ? "#fff" : Colors.light.textMuted}
                />
                <Text
                  style={[
                    styles.milestoneChipLabel,
                    achieved && styles.milestoneChipLabelAchieved,
                  ]}
                >
                  {m.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
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
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  treeSection: {
    backgroundColor: Colors.light.card,
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  treeInfo: {
    flex: 1,
    gap: 4,
  },
  streakBig: {
    fontSize: 52,
    fontFamily: "Inter_700Bold",
    color: Colors.light.tint,
    lineHeight: 56,
  },
  streakDaysLabel: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  streakBest: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "44%",
    backgroundColor: Colors.light.card,
    borderRadius: 18,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statNum: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    height: 100,
  },
  barItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    height: "100%",
    justifyContent: "flex-end",
  },
  barTrack: {
    width: "70%",
    height: 80,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
  },
  emptyMood: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 10,
  },
  emptyMoodText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  milestoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  milestoneBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.light.tint,
  },
  milestoneInfo: {
    flex: 1,
    gap: 4,
  },
  milestoneName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  milestoneDays: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 3,
    marginTop: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    backgroundColor: Colors.light.tint,
    borderRadius: 3,
  },
  milestonesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  milestoneChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  milestoneChipAchieved: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  milestoneChipLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
  },
  milestoneChipLabelAchieved: {
    color: "#fff",
  },
});
