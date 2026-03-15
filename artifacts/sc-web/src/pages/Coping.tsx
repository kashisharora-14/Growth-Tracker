import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainMascot } from "@/components/BrainMascot";

const EXERCISES = [
  { id: "box", name: "Box Breathing", desc: "4-4-4-4 breathing to calm the nervous system", color: "#5BAD80" },
  { id: "478", name: "4-7-8 Technique", desc: "Deep relaxation breathing pattern", color: "#7B9BC8" },
  { id: "grounding", name: "5-4-3-2-1 Grounding", desc: "Anchor yourself in the present moment", color: "#E8954C" },
];

type Phase = "inhale" | "hold1" | "exhale" | "hold2";

const BOX_PHASES: { phase: Phase; label: string; duration: number }[] = [
  { phase: "inhale", label: "Inhale", duration: 4 },
  { phase: "hold1",  label: "Hold",   duration: 4 },
  { phase: "exhale", label: "Exhale", duration: 4 },
  { phase: "hold2",  label: "Hold",   duration: 4 },
];

const FOURSEVENEIGHT_PHASES: { phase: Phase; label: string; duration: number }[] = [
  { phase: "inhale", label: "Inhale", duration: 4 },
  { phase: "hold1",  label: "Hold",   duration: 7 },
  { phase: "exhale", label: "Exhale", duration: 8 },
];

const GROUNDING = [
  { count: 5, sense: "See",   prompt: "Name 5 things you can SEE around you." },
  { count: 4, sense: "Touch", prompt: "Feel 4 things you can TOUCH right now." },
  { count: 3, sense: "Hear",  prompt: "Listen for 3 sounds you can HEAR." },
  { count: 2, sense: "Smell", prompt: "Identify 2 things you can SMELL." },
  { count: 1, sense: "Taste", prompt: "Notice 1 thing you can TASTE." },
];

function BreathingExercise({ phases, color }: { phases: { phase: Phase; label: string; duration: number }[]; color: string }) {
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [countdown, setCountdown] = useState(phases[0].duration);
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentPhase = phases[phaseIdx];

  const start = () => {
    setRunning(true);
    setPhaseIdx(0);
    setCountdown(phases[0].duration);
  };

  const stop = () => {
    setRunning(false);
    clearInterval(timerRef.current!);
    setPhaseIdx(0);
    setCountdown(phases[0].duration);
    setCycles(0);
  };

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c > 1) return c - 1;
        const next = (phaseIdx + 1) % phases.length;
        if (next === 0) setCycles((cy) => cy + 1);
        setPhaseIdx(next);
        return phases[next].duration;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [running, phaseIdx]);

  const circleScale = currentPhase.phase === "inhale" ? 1.3 : currentPhase.phase === "exhale" ? 0.8 : 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <motion.div
        animate={{ scale: running ? circleScale : 1 }}
        transition={{ duration: currentPhase.duration * 0.9, ease: "easeInOut" }}
        style={{
          width: 160, height: 160, borderRadius: "50%",
          backgroundColor: color + "20",
          border: `4px solid ${color}`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 4,
        }}
      >
        <span style={{ fontSize: 32, fontWeight: 700, color }}>{countdown}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color }}>{running ? currentPhase.label : "Ready"}</span>
      </motion.div>

      {running && (
        <div style={{ fontSize: 13, color: "#8E9BB5" }}>Cycles: {cycles}</div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        {!running ? (
          <button onClick={start} style={{ backgroundColor: color, color: "#fff", border: "none", borderRadius: 14, padding: "13px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            Start
          </button>
        ) : (
          <button onClick={stop} style={{ backgroundColor: "#F8F6F3", color: "#8E9BB5", border: "2px solid #E8E4E0", borderRadius: 14, padding: "13px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            Stop
          </button>
        )}
      </div>
    </div>
  );
}

function GroundingExercise() {
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);
  const item = GROUNDING[step];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center" }}>
      {!started ? (
        <>
          <p style={{ color: "#5A6080", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            This exercise anchors you to the present moment and breaks the cycle of anxiety or craving.
          </p>
          <button onClick={() => setStarted(true)} style={{ backgroundColor: "#E8954C", color: "#fff", border: "none", borderRadius: 14, padding: "13px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            Begin
          </button>
        </>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#E8954C20", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: "#E8954C" }}>{item.count}</span>
            </div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1A1A2E" }}>{item.sense}</h3>
            <p style={{ color: "#5A6080", fontSize: 15, margin: 0, lineHeight: 1.5 }}>{item.prompt}</p>
            <div style={{ display: "flex", gap: 10 }}>
              {step > 0 && (
                <button onClick={() => setStep((s) => s - 1)} style={{ backgroundColor: "#F8F6F3", color: "#8E9BB5", border: "none", borderRadius: 14, padding: "12px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>← Back</button>
              )}
              {step < GROUNDING.length - 1 ? (
                <button onClick={() => setStep((s) => s + 1)} style={{ backgroundColor: "#E8954C", color: "#fff", border: "none", borderRadius: 14, padding: "12px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Next →</button>
              ) : (
                <button onClick={() => { setStep(0); setStarted(false); }} style={{ backgroundColor: "#2D7A4F", color: "#fff", border: "none", borderRadius: 14, padding: "12px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Done ✓</button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export default function Coping() {
  const [activeEx, setActiveEx] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #2D7A4F, #4CAF78, #7DD4A8)", margin: "0 -20px", padding: "20px 24px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Coping Tools</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>Breathe through every moment</div>
      </div>

      {/* Mascot */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
        <BrainMascot emotion="coping" size={120} />
      </div>

      {/* Exercise cards */}
      {EXERCISES.map((ex) => (
        <div key={ex.id} style={{ backgroundColor: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
          <button
            onClick={() => setActiveEx(activeEx === ex.id ? null : ex.id)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 14,
              padding: "18px 20px", background: "none", border: "none", cursor: "pointer",
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: ex.color + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 20 }}>💨</span>
            </div>
            <div style={{ textAlign: "left", flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1A2E" }}>{ex.name}</div>
              <div style={{ fontSize: 12, color: "#8E9BB5", marginTop: 2 }}>{ex.desc}</div>
            </div>
            <span style={{ color: ex.color, fontSize: 20, transform: activeEx === ex.id ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>›</span>
          </button>

          <AnimatePresence>
            {activeEx === ex.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                <div style={{ padding: "0 20px 24px", borderTop: "1px solid #F0EDE8" }}>
                  <div style={{ height: 16 }} />
                  {ex.id === "box" && <BreathingExercise phases={BOX_PHASES} color={ex.color} />}
                  {ex.id === "478" && <BreathingExercise phases={FOURSEVENEIGHT_PHASES} color={ex.color} />}
                  {ex.id === "grounding" && <GroundingExercise />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      <div style={{ padding: "14px 18px", backgroundColor: "#EEF4FF", borderRadius: 18, fontSize: 13, color: "#5B8DEF", lineHeight: 1.6 }}>
        💡 Tip: The 4-7-8 technique activates your parasympathetic nervous system, reducing anxiety in as little as 2 cycles.
      </div>
    </div>
  );
}
