import React from "react";
import { useLocation } from "wouter";
import { Award, Calendar, Edit2, Phone, RefreshCw, Target, Trash2, User, Wind } from "lucide-react";
import { useRecovery } from "@/context/RecoveryContext";
import { useRestart } from "@/context/RestartContext";

const ADDICTION_LABELS: Record<string, string> = {
  alcohol: "Alcohol", cigarette: "Cigarette", tobacco: "Tobacco",
  cocaine: "Cocaine", caffeine: "Caffeine",
};

function SectionRow({ icon: Icon, label, value, onPress, danger }: {
  icon: React.ElementType; label: string; value?: string;
  onPress?: () => void; danger?: boolean;
}) {
  return (
    <div
      onClick={onPress}
      style={{
        display: "flex", alignItems: "center", gap: 14, padding: "15px 0",
        borderBottom: "1px solid #F0EDE8", cursor: onPress ? "pointer" : "default",
      }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: danger ? "#FF6B6B18" : "#F5F3F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={17} color={danger ? "#E53935" : "#8E9BB5"} />
      </div>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: danger ? "#E53935" : "#2A2A3E" }}>{label}</span>
      {value && <span style={{ fontSize: 13, color: "#8E9BB5" }}>{value}</span>}
      {onPress && <span style={{ color: "#C0C8D8", fontSize: 18 }}>›</span>}
    </div>
  );
}

export default function Profile() {
  const [, navigate] = useLocation();
  const { profile, streak, longestStreak, resetStreak, clearAllData } = useRecovery();
  const { triggerRestart } = useRestart();

  const handleStartFresh = () => {
    if (window.confirm("This will clear all your data and take you back to the setup questions. Are you sure?")) {
      clearAllData().then(() => triggerRestart());
    }
  };

  const handleRelapse = () => {
    if (window.confirm("This will reset your streak counter. Remember: every restart is courage. Are you sure?")) {
      resetStreak();
    }
  };

  if (!profile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 16, padding: "60px 32px" }}>
        <User size={48} color="#C0C8D8" />
        <h3 style={{ color: "#8E9BB5", margin: 0 }}>No Profile Yet</h3>
        <button onClick={() => navigate("/onboarding")} style={{ backgroundColor: "#2D7A4F", color: "#fff", border: "none", borderRadius: 14, padding: "14px 28px", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
          Set Up Profile
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #2D7A4F, #4CAF78, #7DD4A8)", margin: "0 -20px", padding: "20px 24px 20px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Profile</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{profile.name}</div>
      </div>

      {/* Avatar card */}
      <div style={{ backgroundColor: "#fff", borderRadius: 24, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ width: 72, height: 72, borderRadius: 36, background: "linear-gradient(135deg, #2D7A4F, #4CAF78)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 30, fontWeight: 700, color: "#fff" }}>{profile.name.charAt(0).toUpperCase()}</span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#1A1A2E" }}>{profile.name}</div>
        <div style={{ fontSize: 13, color: "#8E9BB5" }}>Recovering from {ADDICTION_LABELS[profile.addictionType]}</div>
        <div style={{ display: "flex", gap: 0, width: "100%", backgroundColor: "#F8F6F3", borderRadius: 16, padding: "14px 0", marginTop: 4 }}>
          {[
            { num: streak, label: "Days Now" },
            { num: longestStreak, label: "Best Streak" },
            { num: new Date(profile.sobrietyStartDate).toLocaleDateString("en", { month: "short", year: "2-digit" }), label: "Since" },
          ].map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div style={{ width: 1, backgroundColor: "#E8E4E0" }} />}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: "#1A1A2E" }}>{item.num}</span>
                <span style={{ fontSize: 11, color: "#8E9BB5" }}>{item.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Recovery Info */}
      <div style={{ backgroundColor: "#fff", borderRadius: 20, padding: "4px 20px", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#8E9BB5", textTransform: "uppercase", letterSpacing: 0.5, padding: "14px 0 4px" }}>Recovery Info</div>
        <SectionRow icon={Calendar} label="Sobriety Start" value={new Date(profile.sobrietyStartDate).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })} />
        <SectionRow icon={Target} label="Addiction Type" value={ADDICTION_LABELS[profile.addictionType]} />
        <SectionRow icon={User} label="Emergency Contacts" value={`${profile.emergencyContacts.length} saved`} />
      </div>

      {/* Resources */}
      <div style={{ backgroundColor: "#fff", borderRadius: 20, padding: "4px 20px", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#8E9BB5", textTransform: "uppercase", letterSpacing: 0.5, padding: "14px 0 4px" }}>Resources</div>
        <SectionRow icon={Wind} label="Breathing Exercise" onPress={() => navigate("/coping")} />
        <SectionRow icon={Phone} label="Crisis Hotline" value="1-800-662-4357" />
      </div>

      {/* Account */}
      <div style={{ backgroundColor: "#fff", borderRadius: 20, padding: "4px 20px", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#8E9BB5", textTransform: "uppercase", letterSpacing: 0.5, padding: "14px 0 4px" }}>Account</div>
        <SectionRow icon={Edit2} label="Edit Profile" onPress={() => navigate("/onboarding")} />
        <SectionRow icon={RefreshCw} label="Reset Streak" onPress={handleRelapse} danger />
        <SectionRow icon={Trash2} label="Start Fresh" onPress={handleStartFresh} danger />
      </div>

      {/* Crisis card */}
      <div style={{ backgroundColor: "#EEF4FF", borderRadius: 20, padding: "16px 20px", display: "flex", gap: 14, alignItems: "center" }}>
        <Phone size={22} color="#5B8DEF" />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1A2E" }}>24/7 Crisis Support</div>
          <div style={{ fontSize: 12, color: "#5A6080", marginTop: 2, lineHeight: 1.5 }}>SAMHSA Helpline: 1-800-662-4357{"\n"}Free, confidential, always available</div>
        </div>
      </div>
    </div>
  );
}
