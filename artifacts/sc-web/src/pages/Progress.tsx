import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Award, Activity } from "lucide-react";
import { useRecovery } from "@/context/RecoveryContext";

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div style={{ height: 6, borderRadius: 6, backgroundColor: "#F0EDE8", overflow: "hidden", flex: 1 }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${(value / max) * 100}%` }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ height: "100%", borderRadius: 6, backgroundColor: color }} />
    </div>
  );
}

export default function Progress() {
  const { profile, streak, longestStreak, moodHistory } = useRecovery();

  if (!profile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 32px", gap: 16 }}>
        <TrendingUp size={48} color="#C0C8D8" />
        <p style={{ color: "#8E9BB5", textAlign: "center" }}>Complete onboarding to track your progress.</p>
      </div>
    );
  }

  const weeklyMood = moodHistory.slice(0, 7);
  const avgMood = weeklyMood.length ? (weeklyMood.reduce((s, m) => s + m.mood, 0) / weeklyMood.length).toFixed(1) : "—";
  const avgCraving = weeklyMood.length ? (weeklyMood.reduce((s, m) => s + m.cravingLevel, 0) / weeklyMood.length).toFixed(1) : "—";
  const moneySaved = (streak * (profile.dailySpend || 0)).toFixed(0);
  const healthPct = Math.min(Math.round((streak / 90) * 100), 100);

  const milestones = [
    { days: 1, label: "Day 1", icon: "🌱", achieved: streak >= 1 },
    { days: 3, label: "3 Days", icon: "🌿", achieved: streak >= 3 },
    { days: 7, label: "1 Week", icon: "🌲", achieved: streak >= 7 },
    { days: 14, label: "2 Weeks", icon: "🏆", achieved: streak >= 14 },
    { days: 30, label: "1 Month", icon: "⭐", achieved: streak >= 30 },
    { days: 90, label: "3 Months", icon: "🎯", achieved: streak >= 90 },
    { days: 180, label: "6 Months", icon: "💎", achieved: streak >= 180 },
    { days: 365, label: "1 Year", icon: "👑", achieved: streak >= 365 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #2D7A4F, #4CAF78, #7DD4A8)", margin: "0 -20px", padding: "20px 24px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Progress</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>Your recovery journey</div>
      </div>

      {/* Stats summary */}
      <div style={{ display: "flex", gap: 10 }}>
        {[
          { label: "Current Streak", value: `${streak}d`, color: "#5BAD80", icon: "🌱" },
          { label: "Best Streak", value: `${longestStreak}d`, color: "#7B9BC8", icon: "🏆" },
          { label: "Money Saved", value: `$${moneySaved}`, color: "#E8954C", icon: "💰" },
        ].map((item) => (
          <div key={item.label} style={{ flex: 1, backgroundColor: "#fff", borderRadius: 18, padding: "16px 14px", textAlign: "center", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 22 }}>{item.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: item.color, marginTop: 4 }}>{item.value}</div>
            <div style={{ fontSize: 10, color: "#8E9BB5", marginTop: 2 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Health bar */}
      <div style={{ backgroundColor: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#1A1A2E" }}>Recovery Health</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#5BAD80" }}>{healthPct}%</span>
        </div>
        <div style={{ height: 12, borderRadius: 12, backgroundColor: "#F0EDE8", overflow: "hidden" }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${healthPct}%` }} transition={{ duration: 1.2, ease: "easeOut" }} style={{ height: "100%", borderRadius: 12, background: "linear-gradient(90deg, #2D7A4F, #7DD4A8)" }} />
        </div>
        <div style={{ fontSize: 12, color: "#8E9BB5", marginTop: 8 }}>Goal: 90 days ({90 - streak > 0 ? `${90 - streak} days to go` : "Achieved! 🎉"})</div>
      </div>

      {/* Mood chart */}
      <div style={{ backgroundColor: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1A2E", marginBottom: 16 }}>Mood This Week</div>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 80 }}>
          {weeklyMood.slice(0, 7).reverse().map((entry, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(entry.mood / 5) * 64}px` }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                style={{ width: "100%", borderRadius: 4, backgroundColor: "#5BAD80", minHeight: 4 }}
              />
              <span style={{ fontSize: 9, color: "#C0C8D8" }}>{new Date(entry.date).toLocaleDateString("en", { weekday: "narrow" })}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
          <div style={{ flex: 1, padding: "10px 14px", backgroundColor: "#F8F6F3", borderRadius: 12 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#5BAD80" }}>{avgMood}<span style={{ fontSize: 12, color: "#8E9BB5" }}>/5</span></div>
            <div style={{ fontSize: 11, color: "#8E9BB5" }}>Avg Mood</div>
          </div>
          <div style={{ flex: 1, padding: "10px 14px", backgroundColor: "#F8F6F3", borderRadius: 12 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#E8954C" }}>{avgCraving}<span style={{ fontSize: 12, color: "#8E9BB5" }}>/5</span></div>
            <div style={{ fontSize: 11, color: "#8E9BB5" }}>Avg Craving</div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div style={{ backgroundColor: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1A2E", marginBottom: 14 }}>Milestones</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {milestones.map((m) => (
            <div key={m.days} style={{
              flex: "1 1 calc(25% - 8px)", minWidth: 72,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              padding: "14px 8px", borderRadius: 16,
              backgroundColor: m.achieved ? "#2D7A4F14" : "#F8F6F3",
              border: `2px solid ${m.achieved ? "#2D7A4F40" : "transparent"}`,
              opacity: m.achieved ? 1 : 0.5,
            }}>
              <span style={{ fontSize: 22 }}>{m.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: m.achieved ? "#2D7A4F" : "#8E9BB5", textAlign: "center" }}>{m.label}</span>
              {m.achieved && <span style={{ fontSize: 10, color: "#5BAD80" }}>✓ Done</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
