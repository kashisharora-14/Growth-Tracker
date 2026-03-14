import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { SlideButton } from "@/components/SlideButton";
import { AddictionType, SubstanceDetails, useRecovery } from "@/context/RecoveryContext";

const TOTAL_STEPS = 8;

// ─── Substance options ───────────────────────────────────────────────────────
const SUBSTANCE_OPTIONS: {
  label: string;
  value: AddictionType;
  icon: React.ComponentProps<typeof Feather>["name"];
  desc: string;
  color: string;
}[] = [
  {
    label: "Alcohol",
    value: "alcohol",
    icon: "droplet",
    desc: "Beer, wine, spirits",
    color: "#5B8DEF",
  },
  {
    label: "Cigarette",
    value: "cigarette",
    icon: "wind",
    desc: "Cigarettes, vaping",
    color: "#E74C3C",
  },
  {
    label: "Tobacco",
    value: "tobacco",
    icon: "minus-circle",
    desc: "Chewing tobacco, cigars",
    color: "#8B5E3C",
  },
  {
    label: "Cocaine",
    value: "cocaine",
    icon: "alert-triangle",
    desc: "Cocaine, crack, stimulants",
    color: "#9B59B6",
  },
  {
    label: "Caffeine",
    value: "caffeine",
    icon: "coffee",
    desc: "Coffee, energy drinks",
    color: "#F5A623",
  },
];

// ─── Substance-specific questions ────────────────────────────────────────────
type SubstanceQuestion = {
  id: string;
  question: string;
  options: string[];
};

const SUBSTANCE_QUESTIONS: Record<AddictionType, SubstanceQuestion[]> = {
  alcohol: [
    {
      id: "alcohol_amount",
      question: "How many drinks do you typically have per day?",
      options: ["1–2 drinks", "3–5 drinks", "6–10 drinks", "More than 10"],
    },
    {
      id: "alcohol_timing",
      question: "When do you usually drink?",
      options: ["Morning", "Afternoon", "Evening", "Throughout the day"],
    },
    {
      id: "alcohol_social",
      question: "Do you drink alone or with others?",
      options: ["Mostly alone", "Mostly socially", "Both equally", "Varies"],
    },
    {
      id: "alcohol_withdrawal",
      question: "Have you experienced withdrawal symptoms before?",
      options: [
        "Yes — shakes, sweats, anxiety",
        "Mild discomfort only",
        "No symptoms yet",
        "Not sure",
      ],
    },
  ],
  cigarette: [
    {
      id: "cig_count",
      question: "How many cigarettes do you smoke per day?",
      options: ["1–5 cigarettes", "6–10 cigarettes", "11–20 cigarettes", "More than a pack"],
    },
    {
      id: "cig_morning",
      question: "Do you smoke within 30 minutes of waking up?",
      options: ["Yes, immediately", "Usually yes", "Sometimes", "No, later in the day"],
    },
    {
      id: "cig_trigger",
      question: "What triggers your smoking most?",
      options: ["Stress or anxiety", "Boredom", "Social situations", "Habit / routine"],
    },
    {
      id: "cig_quit_before",
      question: "Have you tried quitting before?",
      options: [
        "Yes, multiple times",
        "Yes, once or twice",
        "Never seriously tried",
        "This is my first attempt",
      ],
    },
  ],
  tobacco: [
    {
      id: "tobacco_amount",
      question: "How much tobacco do you use daily?",
      options: ["Occasionally", "A few times a day", "Regularly throughout day", "Almost non-stop"],
    },
    {
      id: "tobacco_stress",
      question: "Do you use tobacco to manage stress or boredom?",
      options: ["Yes, mainly stress", "Yes, mainly boredom", "Both", "Not really"],
    },
    {
      id: "tobacco_pain",
      question: "Have you noticed any mouth, throat, or gum discomfort?",
      options: ["Yes, regularly", "Occasionally", "Not yet", "I've had a health scare"],
    },
    {
      id: "tobacco_quit_before",
      question: "Have you tried quitting tobacco before?",
      options: [
        "Yes, multiple times",
        "Yes, once",
        "No, first time",
        "Trying to cut back first",
      ],
    },
  ],
  cocaine: [
    {
      id: "cocaine_frequency",
      question: "How often do you currently use cocaine?",
      options: ["Daily", "Several times a week", "Weekly", "Occasionally / binging"],
    },
    {
      id: "cocaine_social",
      question: "Do you use alone or with others?",
      options: [
        "Mostly alone",
        "Mostly with others",
        "Both situations",
        "Started social, now alone",
      ],
    },
    {
      id: "cocaine_other",
      question: "Do you use other substances alongside cocaine?",
      options: [
        "Alcohol too",
        "Cannabis too",
        "Multiple substances",
        "Cocaine only",
      ],
    },
    {
      id: "cocaine_crash",
      question: "Do you experience crashes, depression, or paranoia after use?",
      options: [
        "Yes — severe crashes",
        "Yes — mood drops",
        "Mild effects",
        "Not noticeably",
      ],
    },
  ],
  caffeine: [
    {
      id: "caffeine_amount",
      question: "How many caffeinated drinks do you have per day?",
      options: ["1–2 drinks", "3–4 drinks", "5–6 drinks", "7 or more"],
    },
    {
      id: "caffeine_headache",
      question: "Do you get headaches or feel off without caffeine?",
      options: [
        "Yes — severe headaches",
        "Yes — mild discomfort",
        "Sometimes",
        "No noticeable effect",
      ],
    },
    {
      id: "caffeine_sleep",
      question: "Has caffeine impacted your sleep quality?",
      options: [
        "Yes — chronic insomnia",
        "Yes — disrupted sleep",
        "Somewhat",
        "Sleep is mostly fine",
      ],
    },
    {
      id: "caffeine_reason",
      question: "Why are you looking to reduce caffeine?",
      options: [
        "Anxiety or heart issues",
        "Better sleep",
        "General health",
        "I feel dependent on it",
      ],
    },
  ],
};

// ─── Other data ───────────────────────────────────────────────────────────────
const MOTIVATIONS = [
  { id: "health", label: "Reclaim my health", icon: "heart" as const },
  { id: "family", label: "Be there for my family", icon: "users" as const },
  { id: "money", label: "Save money", icon: "dollar-sign" as const },
  { id: "career", label: "Improve my career", icon: "briefcase" as const },
  { id: "self", label: "Prove it to myself", icon: "star" as const },
  { id: "mental", label: "Clear my mind", icon: "cloud" as const },
  { id: "freedom", label: "Feel free again", icon: "compass" as const },
  { id: "future", label: "Build a better future", icon: "sunrise" as const },
];

const FEELINGS = [
  { id: "scared", label: "Scared", icon: "alert-circle" as const, color: "#F5A623" },
  { id: "hopeful", label: "Hopeful", icon: "sun" as const, color: "#4CAF78" },
  { id: "ashamed", label: "Ashamed", icon: "frown" as const, color: "#9B59B6" },
  { id: "determined", label: "Determined", icon: "zap" as const, color: "#E74C3C" },
  { id: "anxious", label: "Anxious", icon: "wind" as const, color: "#5B8DEF" },
  { id: "relieved", label: "Relieved", icon: "smile" as const, color: "#2D7A4F" },
  { id: "lost", label: "Lost", icon: "map" as const, color: "#95A5A6" },
  { id: "ready", label: "Ready", icon: "check-circle" as const, color: "#27AE60" },
];

const FEELING_MESSAGES: Record<string, string> = {
  scared: "That's completely normal. Fear means this matters to you. You are not alone.",
  hopeful: "Hope is your superpower. Nurture it — this journey will give you more.",
  ashamed: "You don't need to carry shame. Every step forward is a step away from yesterday.",
  determined: "That fire will carry you far. Channel it every time you face a challenge.",
  anxious: "Anxiety is common at the start. We'll help you breathe through every moment.",
  relieved: "Relief means you've been waiting for this. You made the right call.",
  lost: "It's okay not to have all the answers. We'll take it one day at a time — together.",
  ready: "Ready is the best place to start. Let's build something that lasts.",
};

const USAGE_YEARS = [
  "Less than 1 year",
  "1–3 years",
  "3–7 years",
  "7–15 years",
  "15+ years",
];

const DATE_OFFSETS = [
  { label: "Today", sub: "It starts right now", offset: 0 },
  { label: "Yesterday", sub: "I started yesterday", offset: 1 },
  { label: "1 week ago", sub: "7 days strong", offset: 7 },
  { label: "2 weeks ago", sub: "14 days in", offset: 14 },
  { label: "1 month ago", sub: "30 days going", offset: 30 },
  { label: "3 months ago", sub: "90 days — incredible", offset: 90 },
];

// ─── Step header ──────────────────────────────────────────────────────────────
function StepHeader({
  step,
  total,
  onBack,
}: {
  step: number;
  total: number;
  onBack: () => void;
}) {
  return (
    <View style={styles.stepHeader}>
      <Pressable style={styles.backBtn} onPress={onBack}>
        <Feather
          name={step === 0 ? "x" : "arrow-left"}
          size={20}
          color={Colors.light.textSecondary}
        />
      </Pressable>
      <View style={styles.progressTrackOuter}>
        <View
          style={[
            styles.progressFillBar,
            { width: `${((step + 1) / total) * 100}%` },
          ]}
        />
      </View>
      <Text style={styles.stepCounter}>
        {step + 1}/{total}
      </Text>
    </View>
  );
}

// ─── Single-choice pill row ───────────────────────────────────────────────────
function ChoiceRow({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <View style={styles.listOptions}>
      {options.map((opt) => (
        <Pressable
          key={opt}
          style={[styles.listOption, selected === opt && styles.listOptionSelected]}
          onPress={() => onSelect(opt)}
        >
          <View
            style={[
              styles.listOptionDot,
              selected === opt && styles.listOptionDotSelected,
            ]}
          />
          <Text
            style={[
              styles.listOptionText,
              selected === opt && styles.listOptionTextSelected,
            ]}
          >
            {opt}
          </Text>
          {selected === opt && (
            <Feather name="check" size={15} color={Colors.light.tint} />
          )}
        </Pressable>
      ))}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
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
  const slideUsed = useRef(false);

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const bottomPad = Platform.OS === "web" ? insets.bottom + 34 : insets.bottom + 16;

  const questions = SUBSTANCE_QUESTIONS[addiction];
  const substanceAnswered = questions.every((q) => substanceDetails[q.id]);

  const goBack = () => (step === 0 ? router.back() : setStep((s) => s - 1));
  const goNext = () => setStep((s) => s + 1);

  const toggleMotivation = (id: string) =>
    setMotivations((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );

  const setAnswer = (qId: string, val: string) =>
    setSubstanceDetails((prev) => ({ ...prev, [qId]: val }));

  const spend = parseFloat(dailySpend) || 0;

  const handleFinish = async () => {
    if (slideUsed.current) return;
    slideUsed.current = true;
    const d = new Date();
    d.setDate(d.getDate() - sobrietyOffset);
    await setProfile({
      name: name.trim() || "Friend",
      addictionType: addiction,
      sobrietyStartDate: d.toISOString(),
      emergencyContacts: [],
      isOnboarded: true,
      yearsUsing,
      dailySpend: spend,
      motivations,
      currentFeeling,
      substanceDetails,
    });
    router.replace("/");
  };

  const selectedSubstance = SUBSTANCE_OPTIONS.find((s) => s.value === addiction)!;

  return (
    <KeyboardAvoidingView
      style={styles.kav}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad, paddingBottom: bottomPad },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StepHeader step={step} total={TOTAL_STEPS} onBack={goBack} />

        {/* ── STEP 0: Name ── */}
        {step === 0 && (
          <View style={styles.stepBody}>
            <View style={styles.emojiHeader}>
              <Text style={styles.bigEmoji}>👋</Text>
            </View>
            <Text style={styles.stepTitle}>What should we call you?</Text>
            <Text style={styles.stepSub}>
              This is your safe space. Your name stays on your device — never shared with anyone.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Your first name or a nickname"
              placeholderTextColor={Colors.light.textMuted}
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={() => name.trim() && goNext()}
            />
            <Pressable
              style={[styles.nextBtn, !name.trim() && { opacity: 0.45 }]}
              onPress={() => name.trim() && goNext()}
              disabled={!name.trim()}
            >
              <Text style={styles.nextBtnText}>Continue</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
          </View>
        )}

        {/* ── STEP 1: Substance type ── */}
        {step === 1 && (
          <View style={styles.stepBody}>
            <Text style={styles.stepTitle}>
              Hi {name}, what are you recovering from?
            </Text>
            <Text style={styles.stepSub}>
              Select the substance that's brought you here today. No judgment — only support.
            </Text>
            <View style={styles.substanceGrid}>
              {SUBSTANCE_OPTIONS.map((opt) => {
                const selected = addiction === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.substanceCard,
                      selected && {
                        borderColor: opt.color,
                        backgroundColor: `${opt.color}12`,
                      },
                    ]}
                    onPress={() => {
                      setAddiction(opt.value);
                      setSubstanceDetails({});
                    }}
                  >
                    <View
                      style={[
                        styles.substanceIcon,
                        { backgroundColor: `${opt.color}18` },
                        selected && { backgroundColor: opt.color },
                      ]}
                    >
                      <Feather
                        name={opt.icon}
                        size={22}
                        color={selected ? "#fff" : opt.color}
                      />
                    </View>
                    <Text
                      style={[
                        styles.substanceLabel,
                        selected && { color: opt.color, fontFamily: "Inter_700Bold" },
                      ]}
                    >
                      {opt.label}
                    </Text>
                    <Text style={styles.substanceDesc}>{opt.desc}</Text>
                    {selected && (
                      <View style={[styles.selectedCheck, { backgroundColor: opt.color }]}>
                        <Feather name="check" size={10} color="#fff" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
            <Pressable style={styles.nextBtn} onPress={goNext}>
              <Text style={styles.nextBtnText}>Continue</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
          </View>
        )}

        {/* ── STEP 2: Substance-specific questions ── */}
        {step === 2 && (
          <View style={styles.stepBody}>
            <View style={styles.substanceBanner}>
              <View
                style={[
                  styles.substanceBannerIcon,
                  { backgroundColor: `${selectedSubstance.color}20` },
                ]}
              >
                <Feather
                  name={selectedSubstance.icon}
                  size={20}
                  color={selectedSubstance.color}
                />
              </View>
              <Text style={[styles.substanceBannerText, { color: selectedSubstance.color }]}>
                {selectedSubstance.label} Recovery
              </Text>
            </View>
            <Text style={styles.stepTitle}>
              A few questions about your {selectedSubstance.label.toLowerCase()} use
            </Text>
            <Text style={styles.stepSub}>
              These help us understand your situation and personalise your recovery plan.
            </Text>

            <View style={styles.questionList}>
              {questions.map((q, i) => (
                <View key={q.id} style={styles.questionBlock}>
                  <View style={styles.questionHeader}>
                    <View style={styles.questionNum}>
                      <Text style={styles.questionNumText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.questionText}>{q.question}</Text>
                  </View>
                  <ChoiceRow
                    options={q.options}
                    selected={substanceDetails[q.id] ?? ""}
                    onSelect={(v) => setAnswer(q.id, v)}
                  />
                </View>
              ))}
            </View>

            <Pressable
              style={[styles.nextBtn, !substanceAnswered && { opacity: 0.45 }]}
              onPress={() => substanceAnswered && goNext()}
              disabled={!substanceAnswered}
            >
              <Text style={styles.nextBtnText}>Continue</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
            {!substanceAnswered && (
              <Text style={styles.answerAllNote}>
                Please answer all {questions.length} questions to continue
              </Text>
            )}
          </View>
        )}

        {/* ── STEP 3: How long ── */}
        {step === 3 && (
          <View style={styles.stepBody}>
            <Text style={styles.stepTitle}>
              How long have you been using {selectedSubstance.label.toLowerCase()}?
            </Text>
            <Text style={styles.stepSub}>
              Understanding your history helps us show you the right support at the right time.
            </Text>
            <View style={styles.listOptions}>
              {USAGE_YEARS.map((label, i) => (
                <Pressable
                  key={label}
                  style={[
                    styles.listOption,
                    yearsUsing === i && styles.listOptionSelected,
                  ]}
                  onPress={() => setYearsUsing(i)}
                >
                  <View
                    style={[
                      styles.listOptionDot,
                      yearsUsing === i && styles.listOptionDotSelected,
                    ]}
                  />
                  <Text
                    style={[
                      styles.listOptionText,
                      yearsUsing === i && styles.listOptionTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                  {yearsUsing === i && (
                    <Feather name="check" size={15} color={Colors.light.tint} />
                  )}
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.nextBtn} onPress={goNext}>
              <Text style={styles.nextBtnText}>Continue</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
          </View>
        )}

        {/* ── STEP 4: Motivations ── */}
        {step === 4 && (
          <View style={styles.stepBody}>
            <Text style={styles.stepTitle}>Why do you want to quit?</Text>
            <Text style={styles.stepSub}>
              Pick everything that feels true. Your reasons will keep you going on hard days.
            </Text>
            <View style={styles.motivationGrid}>
              {MOTIVATIONS.map((m) => {
                const selected = motivations.includes(m.id);
                return (
                  <Pressable
                    key={m.id}
                    style={[
                      styles.motivationChip,
                      selected && styles.motivationChipSelected,
                    ]}
                    onPress={() => toggleMotivation(m.id)}
                  >
                    <Feather
                      name={m.icon}
                      size={15}
                      color={selected ? "#fff" : Colors.light.tint}
                    />
                    <Text
                      style={[
                        styles.motivationLabel,
                        selected && styles.motivationLabelSelected,
                      ]}
                    >
                      {m.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {motivations.length > 0 && (
              <View style={styles.motivationNote}>
                <Feather name="bookmark" size={14} color={Colors.light.tint} />
                <Text style={styles.motivationNoteText}>
                  {motivations.length} reason{motivations.length > 1 ? "s" : ""} saved — these are your anchors
                </Text>
              </View>
            )}
            <Pressable
              style={[styles.nextBtn, motivations.length === 0 && { opacity: 0.45 }]}
              onPress={() => motivations.length > 0 && goNext()}
              disabled={motivations.length === 0}
            >
              <Text style={styles.nextBtnText}>Continue</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
          </View>
        )}

        {/* ── STEP 5: Daily spend ── */}
        {step === 5 && (
          <View style={styles.stepBody}>
            <Text style={styles.stepTitle}>
              How much do you spend daily on {selectedSubstance.label.toLowerCase()}?
            </Text>
            <Text style={styles.stepSub}>
              We'll show you exactly how much sobriety puts back in your pocket.
            </Text>
            <View style={styles.spendInputRow}>
              <View style={styles.currencyBox}>
                <Text style={styles.currencySymbol}>$</Text>
              </View>
              <TextInput
                style={styles.spendInput}
                placeholder="0.00"
                placeholderTextColor={Colors.light.textMuted}
                keyboardType="decimal-pad"
                value={dailySpend}
                onChangeText={(v) => setDailySpend(v.replace(/[^0-9.]/g, ""))}
              />
              <Text style={styles.perDay}>/ day</Text>
            </View>

            {spend > 0 && (
              <View style={styles.savingsPreview}>
                <Text style={styles.savingsTitle}>You could save...</Text>
                <View style={styles.savingsRow}>
                  <View style={styles.savingCard}>
                    <Text style={styles.savingAmount}>${Math.round(spend * 7)}</Text>
                    <Text style={styles.savingLabel}>This week</Text>
                  </View>
                  <View style={[styles.savingCard, styles.savingCardHighlight]}>
                    <Text style={[styles.savingAmount, { color: "#fff" }]}>
                      ${Math.round(spend * 30)}
                    </Text>
                    <Text style={[styles.savingLabel, { color: "rgba(255,255,255,0.8)" }]}>
                      This month
                    </Text>
                  </View>
                  <View style={styles.savingCard}>
                    <Text style={styles.savingAmount}>${Math.round(spend * 365)}</Text>
                    <Text style={styles.savingLabel}>This year</Text>
                  </View>
                </View>
                <Text style={styles.savingsInsight}>
                  That's enough to{" "}
                  {spend * 365 > 2000
                    ? "take a vacation, pay off debt,"
                    : "treat yourself,"}{" "}
                  and invest in your future.
                </Text>
              </View>
            )}

            {spend === 0 && (
              <Pressable
                style={styles.skipLink}
                onPress={() => {
                  setDailySpend("0");
                  goNext();
                }}
              >
                <Text style={styles.skipText}>Skip — I prefer not to say</Text>
              </Pressable>
            )}

            <Pressable style={styles.nextBtn} onPress={goNext}>
              <Text style={styles.nextBtnText}>Continue</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
          </View>
        )}

        {/* ── STEP 6: Feelings ── */}
        {step === 6 && (
          <View style={styles.stepBody}>
            <View style={styles.emojiHeader}>
              <Text style={styles.bigEmoji}>💙</Text>
            </View>
            <Text style={styles.stepTitle}>How are you feeling right now?</Text>
            <Text style={styles.stepSub}>
              All feelings are valid here. There's no wrong answer — this moment matters.
            </Text>
            <View style={styles.feelingsGrid}>
              {FEELINGS.map((f) => {
                const selected = currentFeeling === f.id;
                return (
                  <Pressable
                    key={f.id}
                    style={[
                      styles.feelingCard,
                      selected && {
                        borderColor: f.color,
                        backgroundColor: `${f.color}15`,
                      },
                    ]}
                    onPress={() => setCurrentFeeling(f.id)}
                  >
                    <Feather
                      name={f.icon}
                      size={20}
                      color={selected ? f.color : Colors.light.textMuted}
                    />
                    <Text
                      style={[
                        styles.feelingLabel,
                        selected && { color: f.color, fontFamily: "Inter_600SemiBold" },
                      ]}
                    >
                      {f.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {currentFeeling && (
              <View style={styles.feelingResponse}>
                <Text style={styles.feelingResponseText}>
                  {FEELING_MESSAGES[currentFeeling]}
                </Text>
              </View>
            )}
            <Pressable
              style={[styles.nextBtn, !currentFeeling && { opacity: 0.45 }]}
              onPress={() => currentFeeling && goNext()}
              disabled={!currentFeeling}
            >
              <Text style={styles.nextBtnText}>Continue</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
          </View>
        )}

        {/* ── STEP 7: Start date + slide button ── */}
        {step === 7 && (
          <View style={styles.stepBody}>
            <Text style={styles.stepTitle}>
              When did your sober journey begin?
            </Text>
            <Text style={styles.stepSub}>
              Even if it starts today — that's already courageous. Every single day counts.
            </Text>
            <View style={styles.dateGrid}>
              {DATE_OFFSETS.map(({ label, sub, offset }) => (
                <Pressable
                  key={label}
                  style={[
                    styles.dateCard,
                    sobrietyOffset === offset && styles.dateCardSelected,
                  ]}
                  onPress={() => setSobrietyOffset(offset)}
                >
                  <View style={styles.dateCardLeft}>
                    <Text
                      style={[
                        styles.dateCardLabel,
                        sobrietyOffset === offset && styles.dateCardLabelSelected,
                      ]}
                    >
                      {label}
                    </Text>
                    <Text style={styles.dateCardSub}>{sub}</Text>
                  </View>
                  {sobrietyOffset === offset && (
                    <Feather name="check-circle" size={20} color={Colors.light.tint} />
                  )}
                </Pressable>
              ))}
            </View>

            {/* Summary card */}
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Your Recovery Profile</Text>
              <View style={styles.summaryRow}>
                <View
                  style={[
                    styles.summaryIcon,
                    { backgroundColor: `${selectedSubstance.color}18` },
                  ]}
                >
                  <Feather name={selectedSubstance.icon} size={13} color={selectedSubstance.color} />
                </View>
                <Text style={styles.summaryText}>
                  {name} · Recovering from {selectedSubstance.label}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <View style={styles.summaryIcon}>
                  <Feather name="clock" size={13} color={Colors.light.tint} />
                </View>
                <Text style={styles.summaryText}>
                  Using for {USAGE_YEARS[yearsUsing]}
                </Text>
              </View>
              {spend > 0 && (
                <View style={styles.summaryRow}>
                  <View style={styles.summaryIcon}>
                    <Feather name="dollar-sign" size={13} color={Colors.light.tint} />
                  </View>
                  <Text style={styles.summaryText}>
                    Saving ${Math.round(spend * 30)}/month from day one
                  </Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <View style={styles.summaryIcon}>
                  <Feather name="heart" size={13} color={Colors.light.tint} />
                </View>
                <Text style={styles.summaryText}>
                  Feeling {FEELINGS.find((f) => f.id === currentFeeling)?.label ?? "—"} ·{" "}
                  {motivations.length} reason{motivations.length !== 1 ? "s" : ""} to quit
                </Text>
              </View>
              <View style={styles.aiReadyBadge}>
                <Feather name="cpu" size={11} color={Colors.light.tint} />
                <Text style={styles.aiReadyText}>
                  Your profile is ready to personalise your recovery plan
                </Text>
              </View>
            </View>

            <SlideButton
              label="Slide to begin your journey"
              onComplete={handleFinish}
              color={Colors.light.tint}
            />
            <Text style={styles.privacyNote}>
              Your data stays on your device only. Never shared.
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  kav: { flex: 1, backgroundColor: Colors.light.background },
  container: { flex: 1 },
  content: { paddingHorizontal: 24, gap: 20, flexGrow: 1 },

  stepHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrackOuter: {
    flex: 1,
    height: 5,
    backgroundColor: Colors.light.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFillBar: {
    height: 5,
    backgroundColor: Colors.light.tint,
    borderRadius: 3,
  },
  stepCounter: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
    minWidth: 30,
    textAlign: "right",
  },

  stepBody: { gap: 18 },
  emojiHeader: { alignItems: "center", paddingVertical: 8 },
  bigEmoji: { fontSize: 52 },

  stepTitle: {
    fontSize: 25,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    lineHeight: 33,
  },
  stepSub: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 22,
    marginTop: -4,
  },

  input: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 17,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },

  nextBtn: {
    backgroundColor: Colors.light.tint,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  nextBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 },

  // Substance grid
  substanceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  substanceCard: {
    flex: 1,
    minWidth: "28%",
    backgroundColor: Colors.light.card,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    gap: 7,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    position: "relative",
  },
  substanceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  substanceLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    textAlign: "center",
  },
  substanceDesc: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    textAlign: "center",
  },
  selectedCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  // Substance banner
  substanceBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  substanceBannerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  substanceBannerText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },

  // Question block
  questionList: { gap: 20 },
  questionBlock: { gap: 10 },
  questionHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  questionNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.tint,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  questionNumText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#fff" },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    lineHeight: 22,
  },

  answerAllNote: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    marginTop: -8,
  },

  // List options
  listOptions: { gap: 8 },
  listOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.light.card,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  listOptionSelected: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  listOptionDot: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  listOptionDotSelected: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.tint,
  },
  listOptionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  listOptionTextSelected: {
    color: Colors.light.tint,
    fontFamily: "Inter_600SemiBold",
  },

  // Motivations
  motivationGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  motivationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: Colors.light.card,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  motivationChipSelected: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  motivationLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  motivationLabelSelected: { color: "#fff", fontFamily: "Inter_600SemiBold" },
  motivationNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  motivationNoteText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.tint,
  },

  // Daily spend
  spendInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    overflow: "hidden",
  },
  currencyBox: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRightWidth: 1,
    borderRightColor: Colors.light.border,
  },
  currencySymbol: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.light.tint },
  spendInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    paddingVertical: 14,
  },
  perDay: {
    paddingRight: 16,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
  },
  savingsPreview: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  savingsTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  savingsRow: { flexDirection: "row", gap: 10 },
  savingCard: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  savingCardHighlight: { backgroundColor: Colors.light.tint },
  savingAmount: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.light.tint,
  },
  savingLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.light.textMuted },
  savingsInsight: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 19,
  },
  skipLink: { alignItems: "center", paddingVertical: 4 },
  skipText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textMuted },

  // Feelings
  feelingsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  feelingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderRadius: 15,
    backgroundColor: Colors.light.card,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    minWidth: "44%",
    flex: 1,
  },
  feelingLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  feelingResponse: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 16,
    padding: 15,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.tint,
  },
  feelingResponseText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
    lineHeight: 21,
  },

  // Date picker
  dateGrid: { gap: 8 },
  dateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  dateCardSelected: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  dateCardLeft: { flex: 1, gap: 2 },
  dateCardLabel: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textSecondary,
  },
  dateCardLabelSelected: { color: Colors.light.tint },
  dateCardSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },

  // Summary
  summaryBox: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  summaryTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  summaryIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
    flex: 1,
  },
  aiReadyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: `${Colors.light.tint}12`,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 4,
  },
  aiReadyText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.light.tint,
  },

  privacyNote: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
});
