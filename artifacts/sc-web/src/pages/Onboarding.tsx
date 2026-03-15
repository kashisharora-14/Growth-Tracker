import React, { useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { AddictionType, SubstanceDetails, useRecovery } from "@/context/RecoveryContext";

const TOTAL_STEPS = 8;

const SUBSTANCE_OPTIONS = [
  { label: "Alcohol",   value: "alcohol"   as AddictionType, icon: "💧", desc: "Beer, wine, spirits",         color: "#5B8DEF" },
  { label: "Cigarette", value: "cigarette" as AddictionType, icon: "💨", desc: "Cigarettes, vaping",          color: "#E74C3C" },
  { label: "Tobacco",   value: "tobacco"   as AddictionType, icon: "🍂", desc: "Chewing tobacco, cigars",     color: "#8B5E3C" },
  { label: "Cocaine",   value: "cocaine"   as AddictionType, icon: "⚡", desc: "Cocaine, crack, stimulants",  color: "#9B59B6" },
  { label: "Caffeine",  value: "caffeine"  as AddictionType, icon: "☕", desc: "Coffee, energy drinks",       color: "#F5A623" },
];

const SUBSTANCE_QUESTIONS: Record<AddictionType, { id: string; question: string; options: { label: string; color: string }[] }[]> = {
  alcohol: [
    { id: "alcohol_amount",     question: "How many drinks per day?",                   options: [{ label: "1–2 drinks", color: "#5B8DEF" }, { label: "3–5 drinks", color: "#F5A623" }, { label: "6–10 drinks", color: "#E67E22" }, { label: "More than 10", color: "#E74C3C" }] },
    { id: "alcohol_timing",     question: "When do you usually drink?",                  options: [{ label: "Morning", color: "#F5A623" }, { label: "Afternoon", color: "#E67E22" }, { label: "Evening", color: "#5B8DEF" }, { label: "Throughout the day", color: "#9B59B6" }] },
    { id: "alcohol_social",     question: "Do you drink alone or with others?",          options: [{ label: "Mostly alone", color: "#95A5A6" }, { label: "Mostly socially", color: "#5B8DEF" }, { label: "Both equally", color: "#2D7A4F" }, { label: "Varies", color: "#9B59B6" }] },
    { id: "alcohol_withdrawal", question: "Have you experienced withdrawal symptoms?",   options: [{ label: "Yes — shakes & sweats", color: "#E74C3C" }, { label: "Mild discomfort", color: "#E67E22" }, { label: "No symptoms yet", color: "#4CAF78" }, { label: "Not sure", color: "#95A5A6" }] },
  ],
  cigarette: [
    { id: "cig_count",       question: "How many cigarettes per day?",              options: [{ label: "1–5", color: "#4CAF78" }, { label: "6–10", color: "#F5A623" }, { label: "11–20", color: "#E67E22" }, { label: "More than a pack", color: "#E74C3C" }] },
    { id: "cig_morning",     question: "Smoke within 30min of waking?",             options: [{ label: "Yes, immediately", color: "#E74C3C" }, { label: "Usually yes", color: "#E67E22" }, { label: "Sometimes", color: "#F5A623" }, { label: "No, later", color: "#4CAF78" }] },
    { id: "cig_trigger",     question: "What triggers smoking most?",               options: [{ label: "Stress/anxiety", color: "#E74C3C" }, { label: "Boredom", color: "#F5A623" }, { label: "Social situations", color: "#5B8DEF" }, { label: "Habit", color: "#9B59B6" }] },
    { id: "cig_quit_before", question: "Have you tried quitting before?",          options: [{ label: "Yes, multiple times", color: "#5B8DEF" }, { label: "Yes, once/twice", color: "#9B59B6" }, { label: "Never seriously", color: "#95A5A6" }, { label: "First attempt", color: "#4CAF78" }] },
  ],
  tobacco: [
    { id: "tobacco_amount",     question: "How much tobacco daily?",              options: [{ label: "Occasionally", color: "#4CAF78" }, { label: "Few times a day", color: "#F5A623" }, { label: "Regularly", color: "#E67E22" }, { label: "Almost non-stop", color: "#E74C3C" }] },
    { id: "tobacco_stress",     question: "Use to manage stress/boredom?",        options: [{ label: "Yes, mainly stress", color: "#E74C3C" }, { label: "Yes, mainly boredom", color: "#F5A623" }, { label: "Both", color: "#9B59B6" }, { label: "Not really", color: "#4CAF78" }] },
    { id: "tobacco_pain",       question: "Mouth/throat/gum discomfort?",         options: [{ label: "Yes, regularly", color: "#E74C3C" }, { label: "Occasionally", color: "#E67E22" }, { label: "Not yet", color: "#4CAF78" }, { label: "Had a health scare", color: "#9B59B6" }] },
    { id: "tobacco_quit_before", question: "Tried quitting before?",              options: [{ label: "Yes, multiple times", color: "#5B8DEF" }, { label: "Yes, once", color: "#9B59B6" }, { label: "No, first time", color: "#4CAF78" }, { label: "Cutting back first", color: "#F5A623" }] },
  ],
  cocaine: [
    { id: "cocaine_frequency", question: "How often do you use cocaine?",          options: [{ label: "Daily", color: "#E74C3C" }, { label: "Several times/week", color: "#E67E22" }, { label: "Weekly", color: "#F5A623" }, { label: "Occasionally/binging", color: "#9B59B6" }] },
    { id: "cocaine_social",    question: "Do you use alone or with others?",       options: [{ label: "Mostly alone", color: "#95A5A6" }, { label: "Mostly with others", color: "#5B8DEF" }, { label: "Both situations", color: "#2D7A4F" }, { label: "Started social, now alone", color: "#E74C3C" }] },
    { id: "cocaine_other",     question: "Other substances alongside cocaine?",    options: [{ label: "Alcohol too", color: "#5B8DEF" }, { label: "Cannabis too", color: "#4CAF78" }, { label: "Multiple substances", color: "#E74C3C" }, { label: "Cocaine only", color: "#9B59B6" }] },
    { id: "cocaine_crash",     question: "Experience crashes after use?",          options: [{ label: "Yes — severe crashes", color: "#E74C3C" }, { label: "Yes — mood drops", color: "#E67E22" }, { label: "Mild effects", color: "#F5A623" }, { label: "Not noticeably", color: "#4CAF78" }] },
  ],
  caffeine: [
    { id: "caffeine_amount",   question: "How many caffeinated drinks/day?",       options: [{ label: "1–2", color: "#4CAF78" }, { label: "3–4", color: "#F5A623" }, { label: "5–6", color: "#E67E22" }, { label: "7 or more", color: "#E74C3C" }] },
    { id: "caffeine_headache", question: "Headaches without caffeine?",            options: [{ label: "Yes — severe", color: "#E74C3C" }, { label: "Yes — mild", color: "#E67E22" }, { label: "Sometimes", color: "#F5A623" }, { label: "No noticeable effect", color: "#4CAF78" }] },
    { id: "caffeine_sleep",    question: "Has caffeine impacted your sleep?",      options: [{ label: "Yes — chronic insomnia", color: "#E74C3C" }, { label: "Yes — disrupted sleep", color: "#E67E22" }, { label: "Somewhat", color: "#F5A623" }, { label: "Sleep is fine", color: "#4CAF78" }] },
    { id: "caffeine_reason",   question: "Why reduce caffeine?",                   options: [{ label: "Anxiety/heart issues", color: "#E74C3C" }, { label: "Better sleep", color: "#5B8DEF" }, { label: "General health", color: "#4CAF78" }, { label: "Feel dependent", color: "#9B59B6" }] },
  ],
};

const MOTIVATIONS = [
  { id: "health",   label: "Reclaim my health",       icon: "❤️" },
  { id: "family",   label: "Be there for my family",  icon: "👨‍👩‍👧" },
  { id: "money",    label: "Save money",               icon: "💰" },
  { id: "career",   label: "Improve my career",       icon: "💼" },
  { id: "self",     label: "Prove it to myself",      icon: "⭐" },
  { id: "mental",   label: "Clear my mind",           icon: "🧠" },
  { id: "freedom",  label: "Feel free again",         icon: "🧭" },
  { id: "future",   label: "Build a better future",   icon: "🌅" },
];

const FEELINGS = [
  { id: "scared",      label: "Scared",      icon: "😨", color: "#F5A623" },
  { id: "hopeful",     label: "Hopeful",     icon: "🌟", color: "#4CAF78" },
  { id: "ashamed",     label: "Ashamed",     icon: "😔", color: "#9B59B6" },
  { id: "determined",  label: "Determined",  icon: "⚡", color: "#E74C3C" },
  { id: "anxious",     label: "Anxious",     icon: "😰", color: "#5B8DEF" },
  { id: "relieved",    label: "Relieved",    icon: "😌", color: "#2D7A4F" },
  { id: "lost",        label: "Lost",        icon: "🗺️", color: "#95A5A6" },
  { id: "ready",       label: "Ready",       icon: "✅", color: "#27AE60" },
];

const FEELING_MESSAGES: Record<string, string> = {
  scared: "Fear means this matters to you. You are not alone.",
  hopeful: "Hope is your superpower. Nurture it.",
  ashamed: "You don't need to carry shame. Every step forward counts.",
  determined: "That fire will carry you far.",
  anxious: "Anxiety is common at the start. We'll breathe through every moment.",
  relieved: "Relief means you've been waiting for this. You made the right call.",
  lost: "It's okay not to have all the answers. One day at a time.",
  ready: "Ready is the best place to start.",
};

const USAGE_YEARS = ["Less than 1 year", "1–3 years", "3–7 years", "7–15 years", "15+ years"];

const DATE_OFFSETS = [
  { label: "Today",       sub: "It starts right now",  offset: 0 },
  { label: "Yesterday",   sub: "I started yesterday",  offset: 1 },
  { label: "1 week ago",  sub: "7 days strong",        offset: 7 },
  { label: "2 weeks ago", sub: "14 days in",           offset: 14 },
  { label: "1 month ago", sub: "30 days going",        offset: 30 },
  { label: "3 months",    sub: "90 days — incredible", offset: 90 },
];

function OptionBtn({ label, color, selected, onClick }: { label: string; color: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      flex: "1 1 calc(50% - 6px)", minWidth: "calc(50% - 6px)",
      padding: "14px 12px", borderRadius: 16, cursor: "pointer",
      border: `2px solid ${selected ? color : "#E8E4E0"}`,
      backgroundColor: selected ? color + "14" : "#fff",
      transition: "all 0.15s",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
    }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: selected ? color : color + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: selected ? "#fff" : color }}>✓</span>
      </div>
      <span style={{ fontSize: 13, fontWeight: selected ? 600 : 400, color: selected ? color : "#2A2A3E", textAlign: "center", lineHeight: 1.3 }}>{label}</span>
      {selected && <Check size={12} color={color} />}
    </button>
  );
}

export default function Onboarding() {
  const [, navigate] = useLocation();
  const { setProfile } = useRecovery();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [addiction, setAddiction] = useState<AddictionType>("alcohol");
  const [substanceDetails, setSubstanceDetails] = useState<SubstanceDetails>({});
  const [yearsUsing, setYearsUsing] = useState(0);
  const [motivations, setMotivations] = useState<string[]>([]);
  const [dailySpend, setDailySpend] = useState("");
  const [currentFeeling, setCurrentFeeling] = useState("");
  const [sobrietyOffset, setSobrietyOffset] = useState(0);
  const [cravingLevel, setCravingLevel] = useState(5);
  const submitted = useRef(false);

  const questions = SUBSTANCE_QUESTIONS[addiction];
  const substanceAnswered = questions.every((q) => substanceDetails[q.id]);
  const goBack = () => step === 0 ? navigate("/") : setStep((s) => s - 1);
  const goNext = () => setStep((s) => s + 1);
  const toggleMotivation = (id: string) =>
    setMotivations((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);

  const handleFinish = async () => {
    if (submitted.current) return;
    submitted.current = true;
    const d = new Date();
    d.setDate(d.getDate() - sobrietyOffset);
    await setProfile({
      name: name.trim() || "Friend",
      addictionType: addiction,
      sobrietyStartDate: d.toISOString(),
      emergencyContacts: [],
      isOnboarded: true,
      yearsUsing,
      dailySpend: parseFloat(dailySpend) || 0,
      motivations,
      currentFeeling,
      substanceDetails,
      cravingLevel,
      commitmentLevel: 7,
    });
    navigate("/");
  };

  const pct = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={goBack} style={{ width: 38, height: 38, borderRadius: 19, border: "1px solid #E8E4E0", backgroundColor: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {step === 0 ? <X size={18} color="#8E9BB5" /> : <ArrowLeft size={18} color="#8E9BB5" />}
        </button>
        <div style={{ flex: 1, height: 6, borderRadius: 6, backgroundColor: "#F0EDE8", overflow: "hidden" }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.3 }} style={{ height: "100%", borderRadius: 6, background: "linear-gradient(90deg, #2D7A4F, #4CAF78)" }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#8E9BB5", whiteSpace: "nowrap" }}>{step + 1}/{TOTAL_STEPS}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>

          {/* STEP 0: Name */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ fontSize: 40, textAlign: "center" }}>👋</div>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: "#1A1A2E", margin: 0 }}>What should we call you?</h2>
              <p style={{ fontSize: 15, color: "#8E9BB5", margin: 0, lineHeight: 1.6 }}>Your name stays on your device — never shared with anyone.</p>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && name.trim() && goNext()}
                placeholder="Your first name or a nickname"
                style={{ padding: "16px 18px", borderRadius: 16, border: "2px solid #E8E4E0", fontSize: 16, outline: "none", fontFamily: "Inter, sans-serif" }}
              />
              <button onClick={() => name.trim() && goNext()} disabled={!name.trim()} style={{ backgroundColor: "#1A1A2E", color: "#fff", border: "none", borderRadius: 16, padding: "16px 0", fontSize: 16, fontWeight: 700, cursor: name.trim() ? "pointer" : "not-allowed", opacity: name.trim() ? 1 : 0.45, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                Continue <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 1: Substance */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: "#1A1A2E", margin: 0 }}>Hi {name}, what are you recovering from?</h2>
              <p style={{ fontSize: 15, color: "#8E9BB5", margin: 0, lineHeight: 1.6 }}>No judgment — only support.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {SUBSTANCE_OPTIONS.map((opt) => {
                  const sel = addiction === opt.value;
                  return (
                    <button key={opt.value} onClick={() => { setAddiction(opt.value); setSubstanceDetails({}); }} style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "16px 18px",
                      borderRadius: 18, border: `2px solid ${sel ? opt.color : "#E8E4E0"}`,
                      backgroundColor: sel ? opt.color + "12" : "#fff", cursor: "pointer",
                    }}>
                      <span style={{ fontSize: 22 }}>{opt.icon}</span>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 600, color: sel ? opt.color : "#1A1A2E" }}>{opt.label}</div>
                        <div style={{ fontSize: 12, color: "#8E9BB5" }}>{opt.desc}</div>
                      </div>
                      {sel && <Check size={18} color={opt.color} style={{ marginLeft: "auto" }} />}
                    </button>
                  );
                })}
              </div>
              <button onClick={goNext} style={{ backgroundColor: "#1A1A2E", color: "#fff", border: "none", borderRadius: 16, padding: "16px 0", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                Continue <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 2: Substance questions */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1A1A2E", margin: 0 }}>A few more questions about your use</h2>
              {questions.map((q) => (
                <div key={q.id} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#2A2A3E", margin: 0 }}>{q.question}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {q.options.map((opt) => {
                      const sel = substanceDetails[q.id] === opt.label;
                      return (
                        <button key={opt.label} onClick={() => setSubstanceDetails((prev) => ({ ...prev, [q.id]: opt.label }))} style={{
                          flex: "1 1 calc(50% - 4px)", padding: "12px 8px",
                          borderRadius: 14, border: `2px solid ${sel ? opt.color : "#E8E4E0"}`,
                          backgroundColor: sel ? opt.color + "14" : "#fff", cursor: "pointer",
                          fontSize: 13, fontWeight: sel ? 600 : 400,
                          color: sel ? opt.color : "#2A2A3E",
                        }}>{opt.label}</button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <button onClick={goNext} disabled={!substanceAnswered} style={{ backgroundColor: "#1A1A2E", color: "#fff", border: "none", borderRadius: 16, padding: "16px 0", fontSize: 16, fontWeight: 700, cursor: substanceAnswered ? "pointer" : "not-allowed", opacity: substanceAnswered ? 1 : 0.45, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                Continue <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 3: Years */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1A1A2E", margin: 0 }}>How long have you been using?</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {USAGE_YEARS.map((label, i) => (
                  <button key={label} onClick={() => setYearsUsing(i)} style={{
                    padding: "14px 18px", borderRadius: 16, cursor: "pointer",
                    border: `2px solid ${yearsUsing === i ? "#2D7A4F" : "#E8E4E0"}`,
                    backgroundColor: yearsUsing === i ? "#2D7A4F14" : "#fff",
                    textAlign: "left", fontWeight: yearsUsing === i ? 600 : 400,
                    color: yearsUsing === i ? "#2D7A4F" : "#2A2A3E",
                  }}>{label}</button>
                ))}
              </div>
              <button onClick={goNext} style={{ backgroundColor: "#1A1A2E", color: "#fff", border: "none", borderRadius: 16, padding: "16px 0", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                Continue <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 4: Motivations */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1A1A2E", margin: 0 }}>Why do you want to quit?</h2>
              <p style={{ fontSize: 14, color: "#8E9BB5", margin: 0 }}>Select all that apply</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {MOTIVATIONS.map((m) => {
                  const sel = motivations.includes(m.id);
                  return (
                    <button key={m.id} onClick={() => toggleMotivation(m.id)} style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "12px 16px",
                      borderRadius: 14, border: `2px solid ${sel ? "#2D7A4F" : "#E8E4E0"}`,
                      backgroundColor: sel ? "#2D7A4F14" : "#fff", cursor: "pointer",
                      color: sel ? "#2D7A4F" : "#2A2A3E", fontWeight: sel ? 600 : 400,
                    }}>
                      <span>{m.icon}</span> {m.label}
                    </button>
                  );
                })}
              </div>
              <button onClick={goNext} disabled={motivations.length === 0} style={{ backgroundColor: "#1A1A2E", color: "#fff", border: "none", borderRadius: 16, padding: "16px 0", fontSize: 16, fontWeight: 700, cursor: motivations.length > 0 ? "pointer" : "not-allowed", opacity: motivations.length > 0 ? 1 : 0.45, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                Continue <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 5: Daily spend */}
          {step === 5 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1A1A2E", margin: 0 }}>How much do you spend daily on this?</h2>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "#8E9BB5" }}>$</span>
                <input
                  type="number"
                  min="0"
                  value={dailySpend}
                  onChange={(e) => setDailySpend(e.target.value)}
                  placeholder="0.00"
                  style={{ width: "100%", padding: "16px 18px 16px 40px", borderRadius: 16, border: "2px solid #E8E4E0", fontSize: 18, outline: "none", boxSizing: "border-box", fontFamily: "Inter, sans-serif" }}
                />
              </div>
              {parseFloat(dailySpend) > 0 && (
                <div style={{ padding: "14px 18px", borderRadius: 14, backgroundColor: "#2D7A4F14", color: "#2D7A4F", fontSize: 14, fontWeight: 600 }}>
                  That's ${(parseFloat(dailySpend) * 30).toFixed(0)}/month — ${(parseFloat(dailySpend) * 365).toFixed(0)}/year you could save!
                </div>
              )}
              <button onClick={goNext} style={{ backgroundColor: "#1A1A2E", color: "#fff", border: "none", borderRadius: 16, padding: "16px 0", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                Continue <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 6: Current feeling */}
          {step === 6 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1A1A2E", margin: 0 }}>How are you feeling right now?</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {FEELINGS.map((f) => {
                  const sel = currentFeeling === f.id;
                  return (
                    <button key={f.id} onClick={() => setCurrentFeeling(f.id)} style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "12px 16px",
                      borderRadius: 14, border: `2px solid ${sel ? f.color : "#E8E4E0"}`,
                      backgroundColor: sel ? f.color + "14" : "#fff", cursor: "pointer",
                      color: sel ? f.color : "#2A2A3E", fontWeight: sel ? 600 : 400,
                    }}>
                      <span>{f.icon}</span> {f.label}
                    </button>
                  );
                })}
              </div>
              {currentFeeling && FEELING_MESSAGES[currentFeeling] && (
                <div style={{ padding: "14px 18px", borderRadius: 14, backgroundColor: "#F8F6F3", color: "#5A6080", fontSize: 14, lineHeight: 1.5, fontStyle: "italic" }}>
                  "{FEELING_MESSAGES[currentFeeling]}"
                </div>
              )}
              <button onClick={goNext} disabled={!currentFeeling} style={{ backgroundColor: "#1A1A2E", color: "#fff", border: "none", borderRadius: 16, padding: "16px 0", fontSize: 16, fontWeight: 700, cursor: currentFeeling ? "pointer" : "not-allowed", opacity: currentFeeling ? 1 : 0.45, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                Continue <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 7: Sobriety start date */}
          {step === 7 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1A1A2E", margin: 0 }}>When did your sobriety start?</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {DATE_OFFSETS.map((d) => (
                  <button key={d.label} onClick={() => setSobrietyOffset(d.offset)} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "16px 18px", borderRadius: 16, cursor: "pointer",
                    border: `2px solid ${sobrietyOffset === d.offset ? "#2D7A4F" : "#E8E4E0"}`,
                    backgroundColor: sobrietyOffset === d.offset ? "#2D7A4F14" : "#fff",
                  }}>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: sobrietyOffset === d.offset ? 700 : 500, color: sobrietyOffset === d.offset ? "#2D7A4F" : "#1A1A2E" }}>{d.label}</div>
                      <div style={{ fontSize: 12, color: "#8E9BB5" }}>{d.sub}</div>
                    </div>
                    {sobrietyOffset === d.offset && <Check size={18} color="#2D7A4F" />}
                  </button>
                ))}
              </div>
              <button onClick={handleFinish} style={{
                background: "linear-gradient(135deg, #2D7A4F, #4CAF78)",
                color: "#fff", border: "none", borderRadius: 16, padding: "18px 0",
                fontSize: 17, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                Begin My Journey 🌱
              </button>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
