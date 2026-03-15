import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { AlertCircle, Activity, Award, BarChart2, ChevronRight, Clock, Settings, Wind } from "lucide-react";
import { BrainMascot, getEmotionFromStreak, type MascotEmotion } from "@/components/BrainMascot";
import { useRecovery } from "@/context/RecoveryContext";

const DISTRACTIONS = [
  { icon: "📱", label: "Phone Scrolling", time: "1h 12m", color: "#FF6B6B" },
  { icon: "📺", label: "Streaming",       time: "45m",    color: "#FF9F43" },
  { icon: "☕", label: "Caffeine",         time: "30m",    color: "#A29BFE" },
  { icon: "💨", label: "Stress",           time: "20m",    color: "#74B9FF" },
];

const EMOTION_LABELS: Record<MascotEmotion, { text: string; color: string }> = {
  ecstatic: { text: "Thriving",   color: "#E8954C" },
  happy:    { text: "Strong",     color: "#5BAD80" },
  calm:     { text: "Steady",     color: "#7B9BC8" },
  coping:   { text: "Breathing",  color: "#7EC8C8" },
  worried:  { text: "Holding On", color: "#D4925A" },
  sad:      { text: "Struggling", color: "#A0A8B8" },
};

function HealthBar({ progress, color }: { progress: number; color: string }) {
  return (
    <div style={{ height: 8, borderRadius: 8, backgroundColor: "#F0EDE8", overflow: "hidden" }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress * 100}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ height: "100%", borderRadius: 8, backgroundColor: color }}
      />
    </div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const { profile, streak, longestStreak, isLoading } = useRecovery();
  const [slideIndex, setSlideIndex] = useState(0);

  const emotion = getEmotionFromStreak(streak);
  const emotionInfo = EMOTION_LABELS[emotion];
  const healthProgress = Math.min(streak / 90, 1);
  const recoveryHours = Math.floor(streak * 24);
  const recHoursDisplay = recoveryHours >= 24
    ? `${Math.floor(recoveryHours / 24)}d ${recoveryHours % 24}h`
    : `${recoveryHours}h`;

  useEffect(() => {
    if (!isLoading && !profile?.isOnboarded) {
      navigate("/onboarding");
    }
  }, [isLoading, profile]);

  if (!profile) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "0 32px" }}>
        <BrainMascot emotion="happy" size={120} />
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1A1A2E", textAlign: "center" }}>Welcome to Second Chance</h2>
        <p style={{ fontSize: 15, color: "#8E9BB5", textAlign: "center", lineHeight: 1.5 }}>Every day sober is a victory worth celebrating.</p>
        <button
          onClick={() => navigate("/onboarding")}
          style={{ backgroundColor: "#1A1A2E", color: "#fff", border: "none", borderRadius: 18, padding: "14px 36px", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
        >
          Begin My Journey →
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
    >
      {/* Header */}
      <div style={{
        margin: "0 -20px",
        padding: "18px 24px",
        background: "linear-gradient(135deg, #2D7A4F, #4CAF78, #7DD4A8)",
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>
              Hello, <span style={{ color: "rgba(255,255,255,0.9)" }}>{profile.name}</span>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 3 }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </div>
          </div>
          <button
            onClick={() => navigate("/profile")}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Settings size={19} color="rgba(255,255,255,0.8)" />
          </button>
        </div>
      </div>

      {/* Hero card */}
      <div style={{ backgroundColor: "#fff", borderRadius: 28, padding: "28px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 10, stiffness: 100 }}>
          <BrainMascot emotion={emotion} size={160} />
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ fontSize: 72, fontWeight: 700, color: "#1A1A2E", lineHeight: 1, letterSpacing: -3 }}>{streak}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 15, color: "#8E9BB5" }}>days sober</span>
            <span style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "3px 9px", borderRadius: 20,
              backgroundColor: emotionInfo.color + "18",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: emotionInfo.color, display: "inline-block" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: emotionInfo.color }}>{emotionInfo.text}</span>
            </span>
          </div>
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "#8E9BB5", fontWeight: 500 }}>Recovery Health</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: emotionInfo.color }}>{Math.round(healthProgress * 100)}%</span>
          </div>
          <HealthBar progress={healthProgress} color={emotionInfo.color} />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ backgroundColor: "#fff", borderRadius: 20, padding: "18px 20px", display: "flex", alignItems: "center", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
        {[
          { label: "Recovery Time", value: recHoursDisplay, Icon: Clock },
          null,
          { label: "Best Streak", value: `${longestStreak}d`, Icon: Award },
          null,
          { label: "Sessions", value: `${streak + 3}`, Icon: Activity },
        ].map((item, i) =>
          item === null ? (
            <div key={i} style={{ width: 1, height: 36, backgroundColor: "#F0EDE8", flexShrink: 0 }} />
          ) : (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <item.Icon size={15} color="#8E9BB5" />
              <span style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E", letterSpacing: -0.5 }}>{item.value}</span>
              <span style={{ fontSize: 10, color: "#8E9BB5", textAlign: "center" }}>{item.label}</span>
            </div>
          )
        )}
      </div>

      {/* Distractions */}
      <div style={{ backgroundColor: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1A2E", marginBottom: 12 }}>Top Distractions</div>
        {DISTRACTIONS.map((d, i) => (
          <motion.div
            key={d.label}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < DISTRACTIONS.length - 1 ? "1px solid #F8F6F3" : "none" }}
          >
            <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: d.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
              {d.icon}
            </div>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "#2A2A3E" }}>{d.label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: d.color }}>{d.time}</span>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => navigate("/coping")} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 0", borderRadius: 18, backgroundColor: "#5BAD8015", border: "none", cursor: "pointer", gap: 6 }}>
          <Wind size={20} color="#5BAD80" />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#5BAD80" }}>Breathe</span>
        </button>
        <button onClick={() => navigate("/progress")} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 0", borderRadius: 18, backgroundColor: "#7B9BC815", border: "none", cursor: "pointer", gap: 6 }}>
          <BarChart2 size={20} color="#7B9BC8" />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#7B9BC8" }}>Progress</span>
        </button>
      </div>

      {/* SOS */}
      <button
        onClick={() => navigate("/emergency")}
        style={{
          border: "none", borderRadius: 22, overflow: "hidden", cursor: "pointer", padding: 0,
          boxShadow: "0 6px 16px rgba(229,57,53,0.35)",
          background: "linear-gradient(135deg, #E53935, #FF6B6B)",
          display: "flex", alignItems: "center", padding: "20px 20px",
          gap: 14, width: "100%",
        }}
      >
        <div style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AlertCircle size={26} color="#fff" />
        </div>
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Emergency Support</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>Tap if you're struggling right now</div>
        </div>
        <ChevronRight size={22} color="rgba(255,255,255,0.7)" />
      </button>
    </motion.div>
  );
}
