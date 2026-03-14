import React, { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

export type MascotEmotion = "calm" | "happy" | "ecstatic" | "sad" | "worried" | "coping";

export function getEmotionFromStreak(streak: number): MascotEmotion {
  if (streak === 0) return "sad";
  if (streak < 2) return "worried";
  if (streak < 5) return "calm";
  if (streak < 14) return "happy";
  return "ecstatic";
}

type Props = {
  emotion: MascotEmotion;
  size?: number;
};

const EMOTION_CONFIG: Record<MascotEmotion, {
  bodyColor: string;
  bodyHighlight: string;
  bodyShade: string;
  cheekOpacity: number;
  breatheSpeed: number;
  breatheScale: number;
  floatAmplitude: number;
  floatSpeed: number;
}> = {
  calm: {
    bodyColor: "#F0EAE4",
    bodyHighlight: "#FFFFFF",
    bodyShade: "#D4C8BE",
    cheekOpacity: 0,
    breatheSpeed: 3000,
    breatheScale: 0.025,
    floatAmplitude: 5,
    floatSpeed: 3200,
  },
  happy: {
    bodyColor: "#F5EDE5",
    bodyHighlight: "#FFFFFF",
    bodyShade: "#D8C4B4",
    cheekOpacity: 0.4,
    breatheSpeed: 2400,
    breatheScale: 0.035,
    floatAmplitude: 8,
    floatSpeed: 2400,
  },
  ecstatic: {
    bodyColor: "#FAF0E6",
    bodyHighlight: "#FFFFFF",
    bodyShade: "#E2C9B4",
    cheekOpacity: 0.55,
    breatheSpeed: 1800,
    breatheScale: 0.045,
    floatAmplitude: 10,
    floatSpeed: 1800,
  },
  sad: {
    bodyColor: "#E8E2DC",
    bodyHighlight: "#F5F0EB",
    bodyShade: "#C8BEB4",
    cheekOpacity: 0,
    breatheSpeed: 4000,
    breatheScale: 0.015,
    floatAmplitude: 3,
    floatSpeed: 4200,
  },
  worried: {
    bodyColor: "#EDE5DE",
    bodyHighlight: "#F8F2EC",
    bodyShade: "#CDBFB5",
    cheekOpacity: 0.1,
    breatheSpeed: 2000,
    breatheScale: 0.03,
    floatAmplitude: 4,
    floatSpeed: 2800,
  },
  coping: {
    bodyColor: "#EAF0F0",
    bodyHighlight: "#FFFFFF",
    bodyShade: "#C8D8D8",
    cheekOpacity: 0.2,
    breatheSpeed: 4500,
    breatheScale: 0.05,
    floatAmplitude: 6,
    floatSpeed: 4500,
  },
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function BrainMascot({ emotion, size = 180 }: Props) {
  const cfg = EMOTION_CONFIG[emotion];
  const [blinking, setBlinking] = useState(false);

  const breatheAnim = useSharedValue(0);
  const floatAnim = useSharedValue(0);
  const shakeAnim = useSharedValue(0);
  const squishAnim = useSharedValue(1);
  const bounceAnim = useSharedValue(0);

  const prevEmotion = useRef<MascotEmotion>(emotion);

  useEffect(() => {
    const emotionChanged = prevEmotion.current !== emotion;
    prevEmotion.current = emotion;

    cancelAnimation(breatheAnim);
    cancelAnimation(floatAnim);
    cancelAnimation(shakeAnim);
    cancelAnimation(bounceAnim);

    if (emotionChanged && (emotion === "happy" || emotion === "ecstatic")) {
      squishAnim.value = withSequence(
        withSpring(1.15, { damping: 4, stiffness: 200 }),
        withSpring(0.92, { damping: 6, stiffness: 250 }),
        withSpring(1.0, { damping: 8, stiffness: 300 })
      );
    }

    breatheAnim.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: cfg.breatheSpeed,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(0, {
          duration: cfg.breatheSpeed,
          easing: Easing.inOut(Easing.sin),
        })
      ),
      -1,
      false
    );

    floatAnim.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: cfg.floatSpeed,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(0, {
          duration: cfg.floatSpeed,
          easing: Easing.inOut(Easing.sin),
        })
      ),
      -1,
      false
    );

    if (emotion === "sad") {
      shakeAnim.value = withRepeat(
        withSequence(
          withTiming(2.5, { duration: 110 }),
          withTiming(-2.5, { duration: 110 }),
          withTiming(0, { duration: 110 }),
          withDelay(3000, withTiming(0, { duration: 0 }))
        ),
        -1,
        false
      );
    }

    if (emotion === "ecstatic") {
      bounceAnim.value = withRepeat(
        withSequence(
          withSpring(1, { damping: 3, stiffness: 220 }),
          withSpring(0, { damping: 5, stiffness: 180 })
        ),
        -1,
        false
      );
    }
  }, [emotion]);

  useEffect(() => {
    let cancelled = false;
    const scheduleBlink = () => {
      if (cancelled) return;
      const delay = emotion === "sad"
        ? 1000 + Math.random() * 1200
        : emotion === "ecstatic"
        ? 1500 + Math.random() * 1500
        : 2500 + Math.random() * 2500;

      setTimeout(() => {
        if (cancelled) return;
        setBlinking(true);
        setTimeout(() => {
          if (!cancelled) {
            setBlinking(false);
            scheduleBlink();
          }
        }, 100);
      }, delay);
    };
    scheduleBlink();
    return () => { cancelled = true; };
  }, [emotion]);

  const mascotStyle = useAnimatedStyle(() => {
    const breatheScale = 1 + interpolate(breatheAnim.value, [0, 1], [-cfg.breatheScale, cfg.breatheScale]);
    const floatY = interpolate(floatAnim.value, [0, 1], [0, -cfg.floatAmplitude]);
    const bounceY = interpolate(bounceAnim.value, [0, 1], [0, -6]);
    return {
      transform: [
        { translateY: floatY + bounceY },
        { translateX: shakeAnim.value },
        { scaleX: breatheScale },
        { scaleY: squishAnim.value },
      ],
    };
  });

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

  const mouthPath = (() => {
    const d = bodyR;
    if (emotion === "ecstatic")
      return `M${cx - d * 0.34} ${bodyY + d * 0.28} Q${cx} ${bodyY + d * 0.58} ${cx + d * 0.34} ${bodyY + d * 0.28}`;
    if (emotion === "happy")
      return `M${cx - d * 0.26} ${bodyY + d * 0.24} Q${cx} ${bodyY + d * 0.48} ${cx + d * 0.26} ${bodyY + d * 0.24}`;
    if (emotion === "coping")
      return `M${cx - d * 0.2} ${bodyY + d * 0.27} Q${cx} ${bodyY + d * 0.4} ${cx + d * 0.2} ${bodyY + d * 0.27}`;
    if (emotion === "calm")
      return `M${cx - d * 0.2} ${bodyY + d * 0.26} Q${cx} ${bodyY + d * 0.38} ${cx + d * 0.2} ${bodyY + d * 0.26}`;
    if (emotion === "worried")
      return `M${cx - d * 0.2} ${bodyY + d * 0.36} Q${cx} ${bodyY + d * 0.24} ${cx + d * 0.2} ${bodyY + d * 0.36}`;
    return `M${cx - d * 0.24} ${bodyY + d * 0.4} Q${cx} ${bodyY + d * 0.22} ${cx + d * 0.24} ${bodyY + d * 0.4}`;
  })();

  const browOffset = isSad ? bodyR * 0.08 : 0;
  const shadowW = s * 0.38;

  const shadowStyle = useAnimatedStyle(() => {
    const shadowScale = interpolate(floatAnim.value, [0, 1], [1, 0.78]);
    const shadowOpacity = interpolate(floatAnim.value, [0, 1], [0.12, 0.05]);
    return {
      transform: [{ scaleX: shadowScale }],
      opacity: shadowOpacity,
    };
  });

  return (
    <View style={{ width: s, height: s * 1.12, alignItems: "center" }}>
      <Animated.View style={mascotStyle}>
        <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <Defs>
            <RadialGradient id="brainGrad" cx="35%" cy="28%" r="70%" fx="35%" fy="28%">
              <Stop offset="0%" stopColor={cfg.bodyHighlight} />
              <Stop offset="50%" stopColor={cfg.bodyColor} />
              <Stop offset="100%" stopColor={cfg.bodyShade} />
            </RadialGradient>
            <RadialGradient id="eyeWhite" cx="28%" cy="25%" r="72%">
              <Stop offset="0%" stopColor="#FFFFFF" />
              <Stop offset="100%" stopColor="#EEE8E0" />
            </RadialGradient>
            <RadialGradient id="shadowGrad" cx="50%" cy="35%" r="60%">
              <Stop offset="0%" stopColor="rgba(0,0,0,0.1)" />
              <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </RadialGradient>
          </Defs>

          {/* Feet */}
          {!isSad ? (
            <G>
              <Ellipse cx={cx - bodyR * 0.28} cy={bodyY + bodyR * 1.02} rx={bodyR * 0.16} ry={bodyR * 0.21} fill={cfg.bodyShade} />
              <Ellipse cx={cx + bodyR * 0.28} cy={bodyY + bodyR * 1.02} rx={bodyR * 0.16} ry={bodyR * 0.21} fill={cfg.bodyShade} />
            </G>
          ) : (
            <G>
              <Path d={`M${cx - bodyR * 0.22} ${bodyY + bodyR * 0.82} Q${cx - bodyR * 0.35} ${bodyY + bodyR * 1.1} ${cx - bodyR * 0.38} ${bodyY + bodyR * 1.28}`} stroke={cfg.bodyShade} strokeWidth={bodyR * 0.14} strokeLinecap="round" fill="none" />
              <Path d={`M${cx + bodyR * 0.22} ${bodyY + bodyR * 0.82} Q${cx + bodyR * 0.35} ${bodyY + bodyR * 1.1} ${cx + bodyR * 0.38} ${bodyY + bodyR * 1.28}`} stroke={cfg.bodyShade} strokeWidth={bodyR * 0.14} strokeLinecap="round" fill="none" />
            </G>
          )}

          {/* Arms */}
          {emotion === "ecstatic" && (
            <G>
              <Path d={`M${cx - bodyR * 0.82} ${bodyY - bodyR * 0.22} Q${cx - bodyR * 1.2} ${bodyY - bodyR * 0.65} ${cx - bodyR * 0.98} ${bodyY - bodyR * 0.92}`} stroke={cfg.bodyShade} strokeWidth={bodyR * 0.13} strokeLinecap="round" fill="none" />
              <Path d={`M${cx + bodyR * 0.82} ${bodyY - bodyR * 0.22} Q${cx + bodyR * 1.2} ${bodyY - bodyR * 0.65} ${cx + bodyR * 0.98} ${bodyY - bodyR * 0.92}`} stroke={cfg.bodyShade} strokeWidth={bodyR * 0.13} strokeLinecap="round" fill="none" />
            </G>
          )}
          {(emotion === "happy" || emotion === "coping") && (
            <G>
              <Path d={`M${cx - bodyR * 0.82} ${bodyY - bodyR * 0.04} Q${cx - bodyR * 1.1} ${bodyY + bodyR * 0.12} ${cx - bodyR * 1.02} ${bodyY + bodyR * 0.42}`} stroke={cfg.bodyShade} strokeWidth={bodyR * 0.12} strokeLinecap="round" fill="none" />
              <Path d={`M${cx + bodyR * 0.82} ${bodyY - bodyR * 0.04} Q${cx + bodyR * 1.1} ${bodyY + bodyR * 0.12} ${cx + bodyR * 1.02} ${bodyY + bodyR * 0.42}`} stroke={cfg.bodyShade} strokeWidth={bodyR * 0.12} strokeLinecap="round" fill="none" />
            </G>
          )}
          {isSad && (
            <G>
              <Path d={`M${cx - bodyR * 0.82} ${bodyY + bodyR * 0.1} Q${cx - bodyR * 1.05} ${bodyY + bodyR * 0.48} ${cx - bodyR * 0.9} ${bodyY + bodyR * 0.68}`} stroke={cfg.bodyShade} strokeWidth={bodyR * 0.12} strokeLinecap="round" fill="none" />
              <Path d={`M${cx + bodyR * 0.82} ${bodyY + bodyR * 0.1} Q${cx + bodyR * 1.05} ${bodyY + bodyR * 0.48} ${cx + bodyR * 0.9} ${bodyY + bodyR * 0.68}`} stroke={cfg.bodyShade} strokeWidth={bodyR * 0.12} strokeLinecap="round" fill="none" />
            </G>
          )}

          {/* Main body */}
          <Circle cx={cx} cy={bodyY} r={bodyR} fill="url(#brainGrad)" />

          {/* Depth shadow */}
          <Ellipse cx={cx + bodyR * 0.16} cy={bodyY + bodyR * 0.16} rx={bodyR * 0.7} ry={bodyR * 0.7} fill="url(#shadowGrad)" />

          {/* Brain bumps / gyri */}
          <Path d={`M${cx - bodyR * 0.1} ${bodyY - bodyR * 0.72} Q${cx - bodyR * 0.04} ${bodyY - bodyR * 1.06} ${cx + bodyR * 0.04} ${bodyY - bodyR * 0.72}`} stroke={cfg.bodyShade} strokeWidth={bodyR * 0.055} strokeLinecap="round" fill="none" opacity={0.55} />
          <Path d={`M${cx - bodyR * 0.5} ${bodyY - bodyR * 0.62} Q${cx - bodyR * 0.42} ${bodyY - bodyR * 0.94} ${cx - bodyR * 0.22} ${bodyY - bodyR * 0.7}`} stroke={cfg.bodyShade} strokeWidth={bodyR * 0.05} strokeLinecap="round" fill="none" opacity={0.5} />
          <Path d={`M${cx + bodyR * 0.22} ${bodyY - bodyR * 0.7} Q${cx + bodyR * 0.42} ${bodyY - bodyR * 0.94} ${cx + bodyR * 0.5} ${bodyY - bodyR * 0.62}`} stroke={cfg.bodyShade} strokeWidth={bodyR * 0.05} strokeLinecap="round" fill="none" opacity={0.5} />
          <Path d={`M${cx - bodyR * 0.76} ${bodyY - bodyR * 0.4} Q${cx - bodyR * 0.7} ${bodyY - bodyR * 0.65} ${cx - bodyR * 0.52} ${bodyY - bodyR * 0.48}`} stroke={cfg.bodyShade} strokeWidth={bodyR * 0.048} strokeLinecap="round" fill="none" opacity={0.44} />
          <Path d={`M${cx + bodyR * 0.52} ${bodyY - bodyR * 0.48} Q${cx + bodyR * 0.7} ${bodyY - bodyR * 0.65} ${cx + bodyR * 0.76} ${bodyY - bodyR * 0.4}`} stroke={cfg.bodyShade} strokeWidth={bodyR * 0.048} strokeLinecap="round" fill="none" opacity={0.44} />
          <Path d={`M${cx} ${bodyY - bodyR * 0.88} Q${cx - bodyR * 0.04} ${bodyY - bodyR * 0.32} ${cx} ${bodyY - bodyR * 0.02}`} stroke={cfg.bodyShade} strokeWidth={bodyR * 0.056} strokeLinecap="round" fill="none" opacity={0.38} />

          {/* Shine highlight */}
          <Ellipse cx={cx - bodyR * 0.24} cy={bodyY - bodyR * 0.4} rx={bodyR * 0.17} ry={bodyR * 0.1} fill="rgba(255,255,255,0.65)" />
          <Ellipse cx={cx - bodyR * 0.1} cy={bodyY - bodyR * 0.6} rx={bodyR * 0.07} ry={bodyR * 0.042} fill="rgba(255,255,255,0.4)" />

          {/* Sparkles - ecstatic */}
          {emotion === "ecstatic" && (
            <G>
              <Circle cx={cx - bodyR * 1.08} cy={bodyY - bodyR * 0.72} r={bodyR * 0.07} fill="#FFD0A0" opacity={0.9} />
              <Circle cx={cx + bodyR * 1.06} cy={bodyY - bodyR * 0.66} r={bodyR * 0.09} fill="#FFD0A0" opacity={0.85} />
              <Circle cx={cx - bodyR * 0.78} cy={bodyY - bodyR * 1.06} r={bodyR * 0.055} fill="#FFE8C0" opacity={0.8} />
              <Circle cx={cx + bodyR * 0.72} cy={bodyY - bodyR * 1.08} r={bodyR * 0.065} fill="#FFD0A0" opacity={0.75} />
              <Circle cx={cx} cy={bodyY - bodyR * 1.2} r={bodyR * 0.065} fill="#FFE8C0" opacity={0.85} />
            </G>
          )}

          {/* Eyebrows */}
          <Path
            d={`M${lx - bodyR * 0.14} ${eyeY - bodyR * 0.3 - browOffset} Q${lx} ${eyeY - bodyR * 0.4 + (isSad ? bodyR * 0.18 : 0)} ${lx + bodyR * 0.14} ${eyeY - bodyR * 0.3 - (isSad ? browOffset * 1.4 : 0)}`}
            stroke={cfg.bodyShade}
            strokeWidth={bodyR * 0.055}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d={`M${rx2 - bodyR * 0.14} ${eyeY - bodyR * 0.3 - (isSad ? browOffset * 1.4 : 0)} Q${rx2} ${eyeY - bodyR * 0.4 + (isSad ? bodyR * 0.18 : 0)} ${rx2 + bodyR * 0.14} ${eyeY - bodyR * 0.3 - browOffset}`}
            stroke={cfg.bodyShade}
            strokeWidth={bodyR * 0.055}
            strokeLinecap="round"
            fill="none"
          />

          {/* Eyes */}
          <Ellipse cx={lx} cy={eyeY} rx={eyeRx} ry={eyeRy} fill="url(#eyeWhite)" />
          {!blinking && (
            <G>
              <Circle cx={lx + pupilR * 0.3} cy={eyeY + (isSad ? pupilR * 0.5 : 0)} r={pupilR} fill="#2A1A10" />
              <Circle cx={lx + pupilR * 0.02} cy={eyeY - pupilR * 0.4} r={pupilR * 0.35} fill="rgba(255,255,255,0.8)" />
            </G>
          )}
          <Ellipse cx={rx2} cy={eyeY} rx={eyeRx} ry={eyeRy} fill="url(#eyeWhite)" />
          {!blinking && (
            <G>
              <Circle cx={rx2 + pupilR * 0.3} cy={eyeY + (isSad ? pupilR * 0.5 : 0)} r={pupilR} fill="#2A1A10" />
              <Circle cx={rx2 + pupilR * 0.02} cy={eyeY - pupilR * 0.4} r={pupilR * 0.35} fill="rgba(255,255,255,0.8)" />
            </G>
          )}

          {/* Rosy cheeks */}
          {cfg.cheekOpacity > 0 && (
            <G>
              <Ellipse cx={lx - bodyR * 0.08} cy={eyeY + bodyR * 0.32} rx={bodyR * 0.16} ry={bodyR * 0.09} fill="#F4A0A0" opacity={cfg.cheekOpacity} />
              <Ellipse cx={rx2 + bodyR * 0.08} cy={eyeY + bodyR * 0.32} rx={bodyR * 0.16} ry={bodyR * 0.09} fill="#F4A0A0" opacity={cfg.cheekOpacity} />
            </G>
          )}

          {/* Tears */}
          {emotion === "sad" && (
            <G>
              <Ellipse cx={lx} cy={eyeY + bodyR * 0.3} rx={bodyR * 0.045} ry={bodyR * 0.09} fill="#B8D8F0" opacity={0.8} />
              <Ellipse cx={rx2} cy={eyeY + bodyR * 0.34} rx={bodyR * 0.04} ry={bodyR * 0.08} fill="#B8D8F0" opacity={0.65} />
            </G>
          )}

          {/* Coping mode: small zzz or breath waves */}
          {isCoping && (
            <G opacity={0.5}>
              <Path d={`M${cx + bodyR * 0.7} ${bodyY - bodyR * 0.6} Q${cx + bodyR * 0.88} ${bodyY - bodyR * 0.72} ${cx + bodyR * 1.0} ${bodyY - bodyR * 0.6}`} stroke={cfg.bodyShade} strokeWidth={bodyR * 0.04} strokeLinecap="round" fill="none" />
              <Path d={`M${cx + bodyR * 0.8} ${bodyY - bodyR * 0.8} Q${cx + bodyR * 1.02} ${bodyY - bodyR * 0.96} ${cx + bodyR * 1.18} ${bodyY - bodyR * 0.8}`} stroke={cfg.bodyShade} strokeWidth={bodyR * 0.035} strokeLinecap="round" fill="none" />
            </G>
          )}

          {/* Mouth */}
          <Path d={mouthPath} stroke="#3A2A1C" strokeWidth={bodyR * 0.065} strokeLinecap="round" fill="none" />

          {/* Tongue - ecstatic */}
          {emotion === "ecstatic" && (
            <Ellipse cx={cx} cy={bodyY + bodyR * 0.54} rx={bodyR * 0.13} ry={bodyR * 0.085} fill="#E8A0A0" />
          )}
        </Svg>
      </Animated.View>

      {/* Floor shadow */}
      <Animated.View
        style={[
          {
            width: shadowW,
            height: shadowW * 0.22,
            borderRadius: shadowW,
            backgroundColor: "rgba(0,0,0,0.1)",
            marginTop: -(shadowW * 0.11),
          },
          shadowStyle,
        ]}
      />
    </View>
  );
}
