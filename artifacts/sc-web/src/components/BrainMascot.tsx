import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";

export type MascotEmotion = "calm" | "happy" | "ecstatic" | "sad" | "worried" | "coping";

export function getEmotionFromStreak(streak: number): MascotEmotion {
  if (streak === 0) return "sad";
  if (streak < 2) return "worried";
  if (streak < 5) return "calm";
  if (streak < 14) return "happy";
  return "ecstatic";
}

const EMOTION_CONFIG: Record<MascotEmotion, {
  bodyColor: string; bodyHighlight: string; bodyShade: string;
  cheekOpacity: number; breatheSpeed: number; breatheScale: number;
  floatAmplitude: number; floatSpeed: number;
}> = {
  calm:     { bodyColor: "#F0EAE4", bodyHighlight: "#FFFFFF", bodyShade: "#D4C8BE", cheekOpacity: 0,    breatheSpeed: 3, breatheScale: 0.025, floatAmplitude: 5,  floatSpeed: 3.2 },
  happy:    { bodyColor: "#F5EDE5", bodyHighlight: "#FFFFFF", bodyShade: "#D8C4B4", cheekOpacity: 0.4,  breatheSpeed: 2.4, breatheScale: 0.035, floatAmplitude: 8, floatSpeed: 2.4 },
  ecstatic: { bodyColor: "#FAF0E6", bodyHighlight: "#FFFFFF", bodyShade: "#E2C9B4", cheekOpacity: 0.55, breatheSpeed: 1.8, breatheScale: 0.045, floatAmplitude: 10, floatSpeed: 1.8 },
  sad:      { bodyColor: "#E8E2DC", bodyHighlight: "#F5F0EB", bodyShade: "#C8BEB4", cheekOpacity: 0,    breatheSpeed: 4, breatheScale: 0.015, floatAmplitude: 3,  floatSpeed: 4.2 },
  worried:  { bodyColor: "#EDE5DE", bodyHighlight: "#F8F2EC", bodyShade: "#CDBFB5", cheekOpacity: 0.1,  breatheSpeed: 2, breatheScale: 0.03,  floatAmplitude: 4,  floatSpeed: 2.8 },
  coping:   { bodyColor: "#EAF0F0", bodyHighlight: "#FFFFFF", bodyShade: "#C8D8D8", cheekOpacity: 0.2,  breatheSpeed: 4.5, breatheScale: 0.05, floatAmplitude: 6,  floatSpeed: 4.5 },
};

type Props = { emotion: MascotEmotion; size?: number };

export function BrainMascot({ emotion, size = 180 }: Props) {
  const cfg = EMOTION_CONFIG[emotion];
  const [blinking, setBlinking] = useState(false);
  const prevEmotion = useRef(emotion);

  useEffect(() => {
    let cancelled = false;
    const scheduleBlink = () => {
      if (cancelled) return;
      const delay = emotion === "sad" ? 1000 + Math.random() * 1200
        : emotion === "ecstatic" ? 1500 + Math.random() * 1500
        : 2500 + Math.random() * 2500;
      setTimeout(() => {
        if (cancelled) return;
        setBlinking(true);
        setTimeout(() => { if (!cancelled) { setBlinking(false); scheduleBlink(); } }, 100);
      }, delay);
    };
    scheduleBlink();
    return () => { cancelled = true; };
  }, [emotion]);

  const s = size;
  const cx = s / 2;
  const bodyR = s * 0.3;
  const bodyY = s * 0.52;
  const isSad = emotion === "sad" || emotion === "worried";
  const isHappy = emotion === "happy" || emotion === "ecstatic";
  const isCoping = emotion === "coping";

  const eyeY = bodyY - bodyR * 0.08;
  const lx = cx - bodyR * 0.33;
  const rx2 = cx + bodyR * 0.33;
  const eyeRx = bodyR * 0.2;
  const eyeRy = blinking ? bodyR * 0.02 : (isSad ? bodyR * 0.18 : bodyR * 0.21);
  const pupilR = bodyR * 0.1;
  const browOffset = isSad ? bodyR * 0.08 : 0;

  const mouthPath = (() => {
    const d = bodyR;
    if (emotion === "ecstatic") return `M${cx-d*0.34} ${bodyY+d*0.28} Q${cx} ${bodyY+d*0.58} ${cx+d*0.34} ${bodyY+d*0.28}`;
    if (emotion === "happy")    return `M${cx-d*0.26} ${bodyY+d*0.24} Q${cx} ${bodyY+d*0.48} ${cx+d*0.26} ${bodyY+d*0.24}`;
    if (emotion === "coping")   return `M${cx-d*0.2}  ${bodyY+d*0.27} Q${cx} ${bodyY+d*0.4}  ${cx+d*0.2}  ${bodyY+d*0.27}`;
    if (emotion === "calm")     return `M${cx-d*0.2}  ${bodyY+d*0.26} Q${cx} ${bodyY+d*0.38} ${cx+d*0.2}  ${bodyY+d*0.26}`;
    if (emotion === "worried")  return `M${cx-d*0.2}  ${bodyY+d*0.36} Q${cx} ${bodyY+d*0.24} ${cx+d*0.2}  ${bodyY+d*0.36}`;
    return `M${cx-d*0.24} ${bodyY+d*0.4} Q${cx} ${bodyY+d*0.22} ${cx+d*0.24} ${bodyY+d*0.4}`;
  })();

  const floatAnim = {
    y: [0, -cfg.floatAmplitude, 0],
    transition: { duration: cfg.floatSpeed, repeat: Infinity, ease: "easeInOut" as const },
  };
  const breatheAnim = {
    scaleX: [1, 1 + cfg.breatheScale, 1],
    transition: { duration: cfg.breatheSpeed, repeat: Infinity, ease: "easeInOut" as const },
  };
  const shakeAnim = emotion === "sad" ? {
    x: [0, 2.5, -2.5, 0],
    transition: { duration: 0.33, repeat: Infinity, repeatDelay: 3 },
  } : {};

  return (
    <div style={{ width: s, height: s * 1.12, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <motion.div animate={{ ...floatAnim, ...shakeAnim }} style={{ display: "flex" }}>
        <motion.div animate={breatheAnim}>
          <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
            <defs>
              <radialGradient id={`brainGrad-${emotion}`} cx="35%" cy="28%" r="70%" fx="35%" fy="28%">
                <stop offset="0%" stopColor={cfg.bodyHighlight} />
                <stop offset="50%" stopColor={cfg.bodyColor} />
                <stop offset="100%" stopColor={cfg.bodyShade} />
              </radialGradient>
              <radialGradient id="eyeWhiteW" cx="28%" cy="25%" r="72%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#EEE8E0" />
              </radialGradient>
              <radialGradient id="shadowGradW" cx="50%" cy="35%" r="60%">
                <stop offset="0%" stopColor="rgba(0,0,0,0.1)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>
            </defs>

            {/* Feet */}
            {!isSad ? (
              <g>
                <ellipse cx={cx-bodyR*0.28} cy={bodyY+bodyR*1.02} rx={bodyR*0.16} ry={bodyR*0.21} fill={cfg.bodyShade} />
                <ellipse cx={cx+bodyR*0.28} cy={bodyY+bodyR*1.02} rx={bodyR*0.16} ry={bodyR*0.21} fill={cfg.bodyShade} />
              </g>
            ) : (
              <g>
                <path d={`M${cx-bodyR*0.22} ${bodyY+bodyR*0.82} Q${cx-bodyR*0.35} ${bodyY+bodyR*1.1} ${cx-bodyR*0.38} ${bodyY+bodyR*1.28}`} stroke={cfg.bodyShade} strokeWidth={bodyR*0.14} strokeLinecap="round" fill="none" />
                <path d={`M${cx+bodyR*0.22} ${bodyY+bodyR*0.82} Q${cx+bodyR*0.35} ${bodyY+bodyR*1.1} ${cx+bodyR*0.38} ${bodyY+bodyR*1.28}`} stroke={cfg.bodyShade} strokeWidth={bodyR*0.14} strokeLinecap="round" fill="none" />
              </g>
            )}

            {/* Arms */}
            {emotion === "ecstatic" && (
              <g>
                <path d={`M${cx-bodyR*0.82} ${bodyY-bodyR*0.22} Q${cx-bodyR*1.2} ${bodyY-bodyR*0.65} ${cx-bodyR*0.98} ${bodyY-bodyR*0.92}`} stroke={cfg.bodyShade} strokeWidth={bodyR*0.13} strokeLinecap="round" fill="none" />
                <path d={`M${cx+bodyR*0.82} ${bodyY-bodyR*0.22} Q${cx+bodyR*1.2} ${bodyY-bodyR*0.65} ${cx+bodyR*0.98} ${bodyY-bodyR*0.92}`} stroke={cfg.bodyShade} strokeWidth={bodyR*0.13} strokeLinecap="round" fill="none" />
              </g>
            )}
            {(emotion === "happy" || emotion === "coping") && (
              <g>
                <path d={`M${cx-bodyR*0.82} ${bodyY-bodyR*0.04} Q${cx-bodyR*1.1} ${bodyY+bodyR*0.12} ${cx-bodyR*1.02} ${bodyY+bodyR*0.42}`} stroke={cfg.bodyShade} strokeWidth={bodyR*0.12} strokeLinecap="round" fill="none" />
                <path d={`M${cx+bodyR*0.82} ${bodyY-bodyR*0.04} Q${cx+bodyR*1.1} ${bodyY+bodyR*0.12} ${cx+bodyR*1.02} ${bodyY+bodyR*0.42}`} stroke={cfg.bodyShade} strokeWidth={bodyR*0.12} strokeLinecap="round" fill="none" />
              </g>
            )}
            {isSad && (
              <g>
                <path d={`M${cx-bodyR*0.82} ${bodyY+bodyR*0.1} Q${cx-bodyR*1.05} ${bodyY+bodyR*0.48} ${cx-bodyR*0.9} ${bodyY+bodyR*0.68}`} stroke={cfg.bodyShade} strokeWidth={bodyR*0.12} strokeLinecap="round" fill="none" />
                <path d={`M${cx+bodyR*0.82} ${bodyY+bodyR*0.1} Q${cx+bodyR*1.05} ${bodyY+bodyR*0.48} ${cx+bodyR*0.9} ${bodyY+bodyR*0.68}`} stroke={cfg.bodyShade} strokeWidth={bodyR*0.12} strokeLinecap="round" fill="none" />
              </g>
            )}

            {/* Body */}
            <circle cx={cx} cy={bodyY} r={bodyR} fill={`url(#brainGrad-${emotion})`} />
            <ellipse cx={cx+bodyR*0.16} cy={bodyY+bodyR*0.16} rx={bodyR*0.7} ry={bodyR*0.7} fill="url(#shadowGradW)" />

            {/* Brain bumps */}
            <path d={`M${cx-bodyR*0.1} ${bodyY-bodyR*0.72} Q${cx-bodyR*0.04} ${bodyY-bodyR*1.06} ${cx+bodyR*0.04} ${bodyY-bodyR*0.72}`} stroke={cfg.bodyShade} strokeWidth={bodyR*0.055} strokeLinecap="round" fill="none" opacity={0.55} />
            <path d={`M${cx-bodyR*0.5} ${bodyY-bodyR*0.62} Q${cx-bodyR*0.42} ${bodyY-bodyR*0.94} ${cx-bodyR*0.22} ${bodyY-bodyR*0.7}`}  stroke={cfg.bodyShade} strokeWidth={bodyR*0.05}  strokeLinecap="round" fill="none" opacity={0.5} />
            <path d={`M${cx+bodyR*0.22} ${bodyY-bodyR*0.7}  Q${cx+bodyR*0.42} ${bodyY-bodyR*0.94} ${cx+bodyR*0.5}  ${bodyY-bodyR*0.62}`} stroke={cfg.bodyShade} strokeWidth={bodyR*0.05}  strokeLinecap="round" fill="none" opacity={0.5} />
            <path d={`M${cx} ${bodyY-bodyR*0.88} Q${cx-bodyR*0.04} ${bodyY-bodyR*0.32} ${cx} ${bodyY-bodyR*0.02}`} stroke={cfg.bodyShade} strokeWidth={bodyR*0.056} strokeLinecap="round" fill="none" opacity={0.38} />

            {/* Shine */}
            <ellipse cx={cx-bodyR*0.24} cy={bodyY-bodyR*0.4} rx={bodyR*0.17} ry={bodyR*0.1} fill="rgba(255,255,255,0.65)" />
            <ellipse cx={cx-bodyR*0.1}  cy={bodyY-bodyR*0.6} rx={bodyR*0.07} ry={bodyR*0.042} fill="rgba(255,255,255,0.4)" />

            {/* Sparkles ecstatic */}
            {emotion === "ecstatic" && (
              <g>
                <circle cx={cx-bodyR*1.08} cy={bodyY-bodyR*0.72} r={bodyR*0.07} fill="#FFD0A0" opacity={0.9} />
                <circle cx={cx+bodyR*1.06} cy={bodyY-bodyR*0.66} r={bodyR*0.09} fill="#FFD0A0" opacity={0.85} />
                <circle cx={cx-bodyR*0.78} cy={bodyY-bodyR*1.06} r={bodyR*0.055} fill="#FFE8C0" opacity={0.8} />
                <circle cx={cx+bodyR*0.72} cy={bodyY-bodyR*1.08} r={bodyR*0.065} fill="#FFD0A0" opacity={0.75} />
                <circle cx={cx}            cy={bodyY-bodyR*1.2}  r={bodyR*0.065} fill="#FFE8C0" opacity={0.85} />
              </g>
            )}

            {/* Eyebrows */}
            <path d={`M${lx-bodyR*0.14} ${eyeY-bodyR*0.3-browOffset} Q${lx} ${eyeY-bodyR*0.4+(isSad?bodyR*0.18:0)} ${lx+bodyR*0.14} ${eyeY-bodyR*0.3-(isSad?browOffset*1.4:0)}`} stroke={cfg.bodyShade} strokeWidth={bodyR*0.055} strokeLinecap="round" fill="none" />
            <path d={`M${rx2-bodyR*0.14} ${eyeY-bodyR*0.3-(isSad?browOffset*1.4:0)} Q${rx2} ${eyeY-bodyR*0.4+(isSad?bodyR*0.18:0)} ${rx2+bodyR*0.14} ${eyeY-bodyR*0.3-browOffset}`} stroke={cfg.bodyShade} strokeWidth={bodyR*0.055} strokeLinecap="round" fill="none" />

            {/* Eyes */}
            <ellipse cx={lx}  cy={eyeY} rx={eyeRx} ry={eyeRy} fill="url(#eyeWhiteW)" />
            {!blinking && <g>
              <circle cx={lx+pupilR*0.3}  cy={eyeY+(isSad?pupilR*0.5:0)} r={pupilR} fill="#2A1A10" />
              <circle cx={lx+pupilR*0.02} cy={eyeY-pupilR*0.4}            r={pupilR*0.35} fill="rgba(255,255,255,0.8)" />
            </g>}
            <ellipse cx={rx2} cy={eyeY} rx={eyeRx} ry={eyeRy} fill="url(#eyeWhiteW)" />
            {!blinking && <g>
              <circle cx={rx2+pupilR*0.3}  cy={eyeY+(isSad?pupilR*0.5:0)} r={pupilR} fill="#2A1A10" />
              <circle cx={rx2+pupilR*0.02} cy={eyeY-pupilR*0.4}            r={pupilR*0.35} fill="rgba(255,255,255,0.8)" />
            </g>}

            {/* Cheeks */}
            {cfg.cheekOpacity > 0 && <g>
              <ellipse cx={lx-bodyR*0.08}  cy={eyeY+bodyR*0.32} rx={bodyR*0.16} ry={bodyR*0.09} fill="#F4A0A0" opacity={cfg.cheekOpacity} />
              <ellipse cx={rx2+bodyR*0.08} cy={eyeY+bodyR*0.32} rx={bodyR*0.16} ry={bodyR*0.09} fill="#F4A0A0" opacity={cfg.cheekOpacity} />
            </g>}

            {/* Tears */}
            {emotion === "sad" && <g>
              <ellipse cx={lx}  cy={eyeY+bodyR*0.3}  rx={bodyR*0.045} ry={bodyR*0.09} fill="#B8D8F0" opacity={0.8} />
              <ellipse cx={rx2} cy={eyeY+bodyR*0.34} rx={bodyR*0.04}  ry={bodyR*0.08} fill="#B8D8F0" opacity={0.65} />
            </g>}

            {/* Coping breath waves */}
            {isCoping && <g opacity={0.5}>
              <path d={`M${cx+bodyR*0.7} ${bodyY-bodyR*0.6} Q${cx+bodyR*0.88} ${bodyY-bodyR*0.72} ${cx+bodyR*1.0} ${bodyY-bodyR*0.6}`} stroke={cfg.bodyShade} strokeWidth={bodyR*0.04} strokeLinecap="round" fill="none" />
              <path d={`M${cx+bodyR*0.8} ${bodyY-bodyR*0.8} Q${cx+bodyR*1.02} ${bodyY-bodyR*0.96} ${cx+bodyR*1.18} ${bodyY-bodyR*0.8}`} stroke={cfg.bodyShade} strokeWidth={bodyR*0.035} strokeLinecap="round" fill="none" />
            </g>}

            {/* Mouth */}
            <path d={mouthPath} stroke="#3A2A1C" strokeWidth={bodyR*0.065} strokeLinecap="round" fill="none" />

            {/* Tongue ecstatic */}
            {emotion === "ecstatic" && <ellipse cx={cx} cy={bodyY+bodyR*0.54} rx={bodyR*0.13} ry={bodyR*0.085} fill="#E8A0A0" />}
          </svg>
        </motion.div>
      </motion.div>

      {/* Shadow */}
      <div style={{
        width: s * 0.38, height: s * 0.38 * 0.22,
        borderRadius: "50%",
        backgroundColor: "rgba(0,0,0,0.1)",
        marginTop: -(s * 0.38 * 0.11),
        transition: "opacity 0.3s",
      }} />
    </div>
  );
}
