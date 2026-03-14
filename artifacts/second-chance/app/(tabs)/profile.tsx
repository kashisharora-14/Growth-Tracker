import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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

const ADDICTION_LABELS: Record<string, string> = {
  alcohol: "Alcohol",
  drugs: "Drugs",
  nicotine: "Nicotine",
  other: "Other",
};

function SectionRow({
  icon,
  label,
  value,
  onPress,
  danger,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.sectionRow,
        pressed && onPress ? { opacity: 0.7 } : {},
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View
        style={[
          styles.sectionIcon,
          danger && { backgroundColor: "#FFF0F0" },
        ]}
      >
        <Feather
          name={icon}
          size={18}
          color={danger ? Colors.light.danger : Colors.light.tint}
        />
      </View>
      <Text style={[styles.sectionLabel, danger && { color: Colors.light.danger }]}>
        {label}
      </Text>
      {value ? (
        <Text style={styles.sectionValue}>{value}</Text>
      ) : (
        <Feather name="chevron-right" size={16} color={Colors.light.textMuted} />
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, streak, longestStreak, resetStreak } = useRecovery();
  const [showRelapse, setShowRelapse] = useState(false);

  const topPad =
    Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const bottomPad =
    Platform.OS === "web" ? insets.bottom + 34 + 84 : insets.bottom + 100;

  const handleRelapse = () => {
    Alert.alert(
      "Reset Streak",
      "This will reset your streak counter. Remember: relapse is part of many recovery journeys. You are not a failure — every restart is courage.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset & Start Again",
          style: "destructive",
          onPress: async () => {
            await resetStreak();
          },
        },
      ]
    );
  };

  if (!profile) {
    return (
      <View style={[styles.empty, { paddingTop: topPad }]}>
        <Feather name="user" size={48} color={Colors.light.textMuted} />
        <Text style={styles.emptyTitle}>No Profile Yet</Text>
        <Pressable
          style={styles.setupBtn}
          onPress={() => router.push("/onboarding")}
        >
          <Text style={styles.setupBtnText}>Set Up Profile</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad, paddingBottom: bottomPad },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Profile</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>
            {profile.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.profileName}>{profile.name}</Text>
        <Text style={styles.profileSub}>
          Recovering from {ADDICTION_LABELS[profile.addictionType]}
        </Text>
        <View style={styles.profileStats}>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatNum}>{streak}</Text>
            <Text style={styles.profileStatLabel}>Days Now</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStat}>
            <Text style={styles.profileStatNum}>{longestStreak}</Text>
            <Text style={styles.profileStatLabel}>Best Streak</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStat}>
            <Text style={styles.profileStatNum}>
              {new Date(profile.sobrietyStartDate).toLocaleDateString("en", {
                month: "short",
                year: "2-digit",
              })}
            </Text>
            <Text style={styles.profileStatLabel}>Since</Text>
          </View>
        </View>
      </View>

      <View style={styles.treeRow}>
        <StreakTree streak={streak} size={100} animate={false} />
        <View style={styles.treeRowInfo}>
          <Text style={styles.treeRowTitle}>Your Recovery Tree</Text>
          <Text style={styles.treeRowText}>
            {streak === 0
              ? "Plant your first seed today."
              : streak < 7
              ? "A young tree growing strong."
              : streak < 21
              ? "Branches reaching for the sky."
              : "Your tree is flourishing — keep going!"}
          </Text>
          <Text style={styles.treeRowSub}>
            Maintain your streak to see it grow
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recovery Info</Text>
        <SectionRow
          icon="calendar"
          label="Sobriety Start"
          value={new Date(profile.sobrietyStartDate).toLocaleDateString(
            "en",
            { month: "long", day: "numeric", year: "numeric" }
          )}
        />
        <SectionRow
          icon="target"
          label="Addiction Type"
          value={ADDICTION_LABELS[profile.addictionType]}
        />
        <SectionRow
          icon="users"
          label="Emergency Contacts"
          value={`${profile.emergencyContacts.length} saved`}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resources</Text>
        <SectionRow icon="wind" label="Breathing Exercise" onPress={() => router.push("/coping")} />
        <SectionRow icon="book" label="Recovery Journal" onPress={() => router.push("/coping")} />
        <SectionRow icon="phone" label="Crisis Hotline" value="1-800-662-4357" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SectionRow
          icon="edit-2"
          label="Edit Profile"
          onPress={() => router.push("/onboarding")}
        />
        <SectionRow
          icon="refresh-cw"
          label="Reset Streak"
          onPress={handleRelapse}
          danger
        />
      </View>

      <View style={styles.helpCard}>
        <Feather name="phone" size={22} color={Colors.light.calm} />
        <View style={styles.helpText}>
          <Text style={styles.helpTitle}>24/7 Crisis Support</Text>
          <Text style={styles.helpSub}>
            SAMHSA Helpline: 1-800-662-4357{"\n"}Free, confidential, always available
          </Text>
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
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 32,
    backgroundColor: Colors.light.background,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textSecondary,
  },
  setupBtn: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  setupBtnText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  profileCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.tint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  profileName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  profileSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  profileStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "100%",
  },
  profileStat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  profileStatNum: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.light.tint,
  },
  profileStatLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  profileStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.light.border,
  },
  treeRow: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  treeRowInfo: {
    flex: 1,
    gap: 4,
  },
  treeRowTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  treeRowText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 19,
  },
  treeRowSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    marginTop: 4,
  },
  section: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
  sectionValue: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  helpCard: {
    backgroundColor: "#EBF1FD",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    borderWidth: 1,
    borderColor: "#C8D9F5",
  },
  helpText: {
    flex: 1,
    gap: 4,
  },
  helpTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#1A3A6E",
  },
  helpSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#3A5A8E",
    lineHeight: 19,
  },
});
