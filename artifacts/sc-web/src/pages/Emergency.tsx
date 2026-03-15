import React from "react";
import { Phone, Heart, MessageCircle, MapPin, AlertCircle } from "lucide-react";

const HOTLINES = [
  { name: "SAMHSA Helpline",        number: "1-800-662-4357", desc: "Free, confidential, 24/7",              color: "#E53935" },
  { name: "Crisis Text Line",        number: "Text HOME to 741741", desc: "Text-based crisis support",        color: "#5B8DEF" },
  { name: "National Suicide Line",   number: "988",             desc: "Call or text, always available",       color: "#9B59B6" },
  { name: "AA Meeting Finder",       number: "1-800-923-8722", desc: "Find a meeting near you",               color: "#2D7A4F" },
];

const STEPS = [
  { icon: "🧘", text: "Stop and take 3 slow, deep breaths" },
  { icon: "🌊", text: "Acknowledge the craving — it will pass" },
  { icon: "📞", text: "Call someone you trust right now" },
  { icon: "🚶", text: "Change your location — go outside" },
  { icon: "💧", text: "Drink a glass of water slowly" },
  { icon: "📱", text: "Use the coping tools in this app" },
];

export default function Emergency() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #E53935, #FF6B6B)", margin: "0 -20px", padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AlertCircle size={26} color="#fff" />
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Emergency Support</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>You are not alone. Help is here.</div>
          </div>
        </div>
      </div>

      {/* Affirmation */}
      <div style={{ backgroundColor: "#fff5f5", borderRadius: 18, padding: 18, border: "2px solid #FFCDD2" }}>
        <p style={{ fontSize: 15, color: "#C62828", fontWeight: 600, margin: 0, lineHeight: 1.6, textAlign: "center" }}>
          This moment is temporary. Cravings peak in 15–30 minutes and then pass. You have survived every difficult moment so far.
        </p>
      </div>

      {/* Immediate steps */}
      <div style={{ backgroundColor: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1A2E", marginBottom: 14 }}>Do this right now:</div>
        {STEPS.map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: i < STEPS.length - 1 ? "1px solid #F8F6F3" : "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "#FFF3F3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 16 }}>{step.icon}</span>
            </div>
            <span style={{ fontSize: 14, color: "#2A2A3E", lineHeight: 1.5, paddingTop: 6 }}>{step.text}</span>
          </div>
        ))}
      </div>

      {/* Hotlines */}
      <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1A2E" }}>Crisis Hotlines</div>
      {HOTLINES.map((h) => (
        <a key={h.name} href={`tel:${h.number.replace(/\D/g, "")}`} style={{ textDecoration: "none" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: 18, padding: 18, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 8px rgba(0,0,0,0.04)", border: `2px solid ${h.color}20` }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: h.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Phone size={20} color={h.color} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>{h.name}</div>
              <div style={{ fontSize: 13, color: h.color, fontWeight: 700, marginTop: 2 }}>{h.number}</div>
              <div style={{ fontSize: 11, color: "#8E9BB5" }}>{h.desc}</div>
            </div>
          </div>
        </a>
      ))}

      <div style={{ padding: "14px 18px", backgroundColor: "#F0FAF4", borderRadius: 18, fontSize: 13, color: "#2D7A4F", lineHeight: 1.6 }}>
        ❤️ Remember: seeking help is a sign of strength, not weakness. Every moment you hold on is a victory.
      </div>
    </div>
  );
}
