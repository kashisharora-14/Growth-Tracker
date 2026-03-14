import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
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
import { StreakTree } from "@/components/StreakTree";
import { useRecovery } from "@/context/RecoveryContext";

const { width } = Dimensions.get("window");

const MOOD_COLORS = ["#E53E3E", "#F5A623", "#F5A623", "#4CAF78", "#2D7A4F"];
const MOOD_LABELS = ["Low", "Fair", "Okay", "Good", "Great"];

const TREE_STAGES = [
  {
    days: 0,
    name: "Seedling",
    desc: "You've planted the seed of change",
    color: "#A8D5A2",
    icon: "circle",
  },
  {
    days: 3,
    name: "Sapling",
    desc: "Tiny shoots reaching for the sun",
    color: "#6DCF96",
    icon: "arrow-up",
  },
  {
    days: 7,
    name: "Young Tree",
    desc: "Roots are forming — you're stable",
    color: "#4CAF78",
    icon: "trending-up",
  },
  {
    days: 21,
    name: "Flourishing",
    desc: "Branches full, spirit bright",
    color: "#2D7A4F",
    icon: "star",
  },
  {
    days: 60,
    name: "Majestic",
    desc: "Golden blooms — you are thriving",
    color: "#FFB800",
    icon: "award",
  },
];

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

const CATEGORY_COLORS: Record<string, string> = {
  body: "#4CAF78",
  mind: "#5B8DEF",
  social: "#F5A623",
  spirit: "#9B59B6",
};

const CATEGORY_LABELS: Record<string, string> = {
  body: "Body",
  mind: "Mind",
  social: "Social",
  spirit: "Spirit",
};

function MoodBar({ value, date }: { value: number; date: string }) {
  const h = (value / 5) * 72;
  const color = MOOD_COLORS[value - 1] ?? Colors.light.tint;
  const d = new Date(date);
  const label = d.toLocaleDateString("en", { weekday: "short" }).slice(0, 2);
  return (
    <View style={styles.barItem}>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { height: h, backgroundColor: color }]} />
      </View>
      <Text style={styles.barLabel}>{label}</Text>
    </View>
  );
}

function DailyTaskRow({
  task,
  isCompleted,
  onToggle,
}: {
  task: { id: string; label: string; description: string; icon: string; category: string };
  isCompleted: boolean;
  onToggle: () => void;
}) {
  const catColor = CATEGORY_COLORS[task.category] ?? Colors.light.tint;
  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [
        styles.taskRow,
        isCompleted && styles.taskRowDone,
        pressed && { opacity: 0.85 },
      ]}
    >
      <View
        style={[
          styles.taskCheck,
          isCompleted && { backgroundColor: catColor, borderColor: catColor },
        ]}
      >
        {isCompleted && <Feather name="check" size={14} color="#fff" />}
      </View>
      <View style={styles.taskTextWrap}>
        <Text style={[styles.taskLabel, isCompleted && styles.taskLabelDone]}>
          {task.label}
        </Text>
        {!isCompleted && (
          <Text style={styles.taskDesc}>{task.description}</Text>
        )}
      </View>
      <View style={[styles.taskCategoryBadge, { backgroundColor: `${catColor}18` }]}>
        <Text style={[styles.taskCategoryText, { color: catColor }]}>
          {CATEGORY_LABELS[task.category]}
        </Text>
      </View>
    </Pressable>
  );
}

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { streak, longestStreak, moodHistory, profile, dailyTasks, toggleTaskComplete } =
    useRecovery();
  const [showAllTasks, setShowAllTasks] = useState(false);

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const bottomPad = Platform.OS === "web" ? insets.bottom + 34 + 84 : insets.bottom + 100;

  const recentMood = moodHistory.slice(0, 7).reverse();
  const avgMood = recentMood.length
    ? Math.round(recentMood.reduce((a, m) => a + m.mood, 0) / recentMood.length)
    : 0;

  const today = new Date().toISOString().split("T")[0];
  const tasksCompleted = dailyTasks.filter((t) => t.completedDates.includes(today));
  const tasksPending = dailyTasks.filter((t) => !t.completedDates.includes(today));
  const taskProgress = (tasksCompleted.length / dailyTasks.length) * 100;

  const dailySpend = profile?.dailySpend ?? 0;
  const moneySaved = Math.round(streak * dailySpend) || Math.round(streak * 12.5);
  const hoursSaved = streak * 3;

  const nextMilestone = MILESTONES.find((m) => m.days > streak) ?? MILESTONES[MILESTONES.length - 1];
  const progressToNext = nextMilestone
    ? Math.min(100, Math.round((streak / nextMilestone.days) * 100))
    : 100;

  const currentStage =
    [...TREE_STAGES].reverse().find((s) => streak >= s.days) ?? TREE_STAGES[0];

  const visibleTasks = showAllTasks ? tasksPending : tasksPending.slice(0, 4);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: topPad, paddingBottom: bottomPad }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Your Progress</Text>

      {/* Tree + Streak Hero */}
      <View style={styles.treeCard}>
        <StreakTree streak={streak} size={130} animate />
        <View style={styles.treeInfo}>
          <View style={[styles.stageBadge, { backgroundColor: `${currentStage.color}20` }]}>
            <Text style={[styles.stageName, { color: currentStage.color }]}>
              {currentStage.name}
            </Text>
          </View>
          <Text style={styles.streakBig}>{streak}</Text>
          <Text style={styles.streakLabel}>days sober</Text>
          <Text style={styles.streakBest}>Best: {longestStreak} days</Text>
        </View>
      </View>

      {/* Tree growth stages */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tree Growth Journey</Text>
        <Text style={styles.cardSub}>
          {currentStage.desc} — keep going to unlock the next stage
        </Text>
        <View style={styles.stagesRow}>
          {TREE_STAGES.map((stage, i) => {
            const unlocked = streak >= stage.days;
            const isCurrent = currentStage.days === stage.days;
            return (
              <View key={stage.days} style={styles.stageItem}>
                <View
                  style={[
                    styles.stageDot,
                    { borderColor: stage.color },
                    unlocked && { backgroundColor: stage.color },
                    isCurrent && styles.stageItemCurrent,
                  ]}
                >
                  {unlocked ? (
                    <Feather name="check" size={10} color="#fff" />
                  ) : (
                    <Feather name="lock" size={9} color={stage.color} />
                  )}
                </View>
                {i < TREE_STAGES.length - 1 && (
                  <View
                    style={[
                      styles.stageLine,
                      unlocked && streak >= TREE_STAGES[i + 1].days
                        ? { backgroundColor: TREE_STAGES[i + 1].color }
                        : { backgroundColor: Colors.light.border },
                    ]}
                  />
                )}
                <Text
                  style={[
                    styles.stageItemLabel,
                    unlocked && { color: stage.color, fontFamily: "Inter_600SemiBold" },
                  ]}
                >
                  Day {stage.days === 0 ? "1" : stage.days}
                </Text>
                <Text style={styles.stageItemName}>{stage.name}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Daily recovery tasks */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View>
            <Text style={styles.cardTitle}>Today's Recovery Tasks</Text>
            <Text style={styles.cardSub}>
              {tasksCompleted.length}/{dailyTasks.length} done today
            </Text>
          </View>
          <View style={styles.taskProgressCircle}>
            <Text style={styles.taskProgressPct}>
              {Math.round(taskProgress)}%
            </Text>
          </View>
        </View>

        <View style={styles.taskProgressTrack}>
          <View style={[styles.taskProgressFill, { width: `${taskProgress}%` }]} />
        </View>

        {tasksCompleted.length > 0 && (
          <View style={styles.completedSection}>
            <Text style={styles.completedSectionLabel}>Completed</Text>
            {tasksCompleted.map((task) => (
              <DailyTaskRow
                key={task.id}
                task={task}
                isCompleted
                onToggle={() => toggleTaskComplete(task.id)}
              />
            ))}
          </View>
        )}

        {tasksPending.length > 0 && (
          <View>
            <Text style={styles.pendingLabel}>Suggested for today</Text>
            {visibleTasks.map((task) => (
              <DailyTaskRow
                key={task.id}
                task={task}
                isCompleted={false}
                onToggle={() => toggleTaskComplete(task.id)}
              />
            ))}
            {tasksPending.length > 4 && (
              <Pressable
                style={styles.showMoreBtn}
                onPress={() => setShowAllTasks((v) => !v)}
              >
                <Text style={styles.showMoreText}>
                  {showAllTasks
                    ? "Show less"
                    : `Show ${tasksPending.length - 4} more tasks`}
                </Text>
                <Feather
                  name={showAllTasks ? "chevron-up" : "chevron-down"}
                  size={14}
                  color={Colors.light.tint}
                />
              </Pressable>
            )}
          </View>
        )}

        {tasksPending.length === 0 && (
          <View style={styles.allDoneBox}>
            <Feather name="check-circle" size={28} color={Colors.light.tint} />
            <Text style={styles.allDoneTitle}>All done for today!</Text>
            <Text style={styles.allDoneText}>
              Your tree is growing strong. Come back tomorrow.
            </Text>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Feather name="dollar-sign" size={20} color={Colors.light.accent} />
          <Text style={styles.statNum}>${moneySaved}</Text>
          <Text style={styles.statLabel}>
            {profile?.dailySpend ? "Money Saved" : "Est. Saved"}
          </Text>
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
          <Feather name="check-square" size={20} color={Colors.light.tintLight} />
          <Text style={styles.statNum}>{tasksCompleted.length}/{dailyTasks.length}</Text>
          <Text style={styles.statLabel}>Tasks Today</Text>
        </View>
      </View>

      {/* Mood chart */}
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
            <Text style={styles.emptyMoodText}>Log moods from the Journey tab to see your chart</Text>
          </View>
        )}
      </View>

      {/* Next milestone */}
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
              <View style={[styles.progressFill, { width: `${progressToNext}%` }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Milestones grid */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Milestones</Text>
        <View style={styles.milestonesGrid}>
          {MILESTONES.map((m) => {
            const achieved = streak >= m.days;
            return (
              <View
                key={m.days}
                style={[styles.milestoneChip, achieved && styles.milestoneChipAchieved]}
              >
                <Feather
                  name={m.icon}
                  size={16}
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
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { paddingHorizontal: 20, gap: 16 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", color: Colors.light.text },
  treeCard: {
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
  treeInfo: { flex: 1, gap: 4 },
  stageBadge: {
    alignSelf: "flex-start",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 4,
  },
  stageName: { fontSize: 12, fontFamily: "Inter_700Bold" },
  streakBig: {
    fontSize: 48,
    fontFamily: "Inter_700Bold",
    color: Colors.light.tint,
    lineHeight: 52,
  },
  streakLabel: { fontSize: 15, fontFamily: "Inter_500Medium", color: Colors.light.textSecondary },
  streakBest: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.light.textMuted, marginTop: 4 },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  cardTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  cardSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  taskProgressCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  taskProgressPct: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
  taskProgressTrack: {
    height: 6,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 3,
    overflow: "hidden",
  },
  taskProgressFill: {
    height: 6,
    backgroundColor: Colors.light.tint,
    borderRadius: 3,
  },
  completedSection: { gap: 0 },
  completedSectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  pendingLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 4,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  taskRowDone: {
    opacity: 0.65,
  },
  taskCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
  },
  taskTextWrap: { flex: 1, gap: 2 },
  taskLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
  taskLabelDone: {
    textDecorationLine: "line-through",
    color: Colors.light.textMuted,
  },
  taskDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    lineHeight: 17,
  },
  taskCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  taskCategoryText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  showMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: 12,
  },
  showMoreText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.tint,
  },
  allDoneBox: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  allDoneTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.tint,
  },
  allDoneText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
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
  statNum: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.light.text },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.light.textMuted },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    height: 90,
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
    height: 72,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: { borderRadius: 6 },
  barLabel: { fontSize: 10, fontFamily: "Inter_500Medium", color: Colors.light.textMuted },
  emptyMood: { alignItems: "center", paddingVertical: 24, gap: 10 },
  emptyMoodText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    textAlign: "center",
  },
  milestoneRow: { flexDirection: "row", alignItems: "center", gap: 16 },
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
  milestoneInfo: { flex: 1, gap: 4 },
  milestoneName: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
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
  progressFill: { height: 6, backgroundColor: Colors.light.tint, borderRadius: 3 },
  milestonesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  milestoneChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
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
  milestoneChipLabelAchieved: { color: "#fff" },
  stagesRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  stageItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    position: "relative",
  },
  stageDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    zIndex: 2,
  },
  stageItemCurrent: {
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  stageLine: {
    position: "absolute",
    top: 13,
    left: "50%",
    right: "-50%",
    height: 2,
    zIndex: 1,
  },
  stageItemLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
  },
  stageItemName: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    textAlign: "center",
  },
});
