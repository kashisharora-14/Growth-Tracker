import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  Path,
  RadialGradient,
  Stop,
  G,
} from "react-native-svg";

export type BrainEmotion =
  | "ecstatic"
  | "happy"
  | "content"
  | "neutral"
  | "worried"
  | "sad"
  | "crying";

export function getBrainEmotion(streak: number): BrainEmotion {
  if (streak === 0) return "sad";
  if (streak < 2) return "worried";
  if (streak < 4) return "neutral";
  if (streak < 8) return "content";
  if (streak < 21) return "happy";
  return "ecstatic";
}

type Props = {
  streak: number;
  size?: number;
};

export function BrainCompanion({ streak, size = 180 }: Props) {
  const emotion = getBrainEmotion(streak);
  const [blinking, setBlinking] = useState(false);

  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isSad = emotion === "sad" || emotion === "crying";
  const isHappy = emotion === "happy" || emotion === "ecstatic";

  useEffect(() => {
    floatAnim.stopAnimation();
    glowAnim.stopAnimation();
    shakeAnim.stopAnimation();
    scaleAnim.stopAnimation();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: isSad ? 2800 : 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: isSad ? 2800 : 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    if (isHappy) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.2,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    if (isSad) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 2,
            duration: 120,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -2,
            duration: 120,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 120,
            useNativeDriver: true,
          }),
          Animated.delay(2500),
        ])
      ).start();
    }
  }, [emotion]);

  useEffect(() => {
    let cancelled = false;
    const scheduleBlink = () => {
      if (cancelled) return;
      const delay = isSad
        ? 1200 + Math.random() * 1200
        : 2800 + Math.random() * 2200;
      const t = setTimeout(() => {
        if (cancelled) return;
        setBlinking(true);
        setTimeout(() => {
          if (!cancelled) {
            setBlinking(false);
            scheduleBlink();
          }
        }, 120);
      }, delay);
      return t;
    };
    const t = scheduleBlink();
    return () => {
      cancelled = true;
      if (t) clearTimeout(t);
    };
  }, [emotion]);

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, isSad ? 5 : -9],
  });

  const shadowOpacity = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [isSad ? 0.55 : 0.6, isSad ? 0.4 : 0.22],
  });

  const s = size;
  const cx = s / 2;
  const bodyR = s * 0.3;
  const bodyY = s * 0.52;

  const brainBase = isSad ? "#D4977A" : "#E8A87C";
  const brainLight = isSad ? "#E8B090" : "#F5C49A";
  const brainDark = isSad ? "#B87050" : "#CC8050";
  const brainHighlight = isSad ? "#F0C8A8" : "#FDDBB8";
  const glowColor = emotion === "ecstatic" ? "#FFD700" : "#FFCC88";

  const eyeY = bodyY - bodyR * 0.1;
  const lx = cx - bodyR * 0.32;
  const rx2 = cx + bodyR * 0.32;
  const eyeRx = bodyR * 0.19;
  const eyeRy = blinking ? bodyR * 0.015 : bodyR * 0.2;
  const pupilR = bodyR * 0.1;

  const mouthPath = (() => {
    const d = bodyR;
    if (emotion === "ecstatic")
      return `M${cx - d * 0.36} ${bodyY + d * 0.3} Q${cx} ${bodyY + d * 0.62} ${cx + d * 0.36} ${bodyY + d * 0.3}`;
    if (emotion === "happy")
      return `M${cx - d * 0.28} ${bodyY + d * 0.26} Q${cx} ${bodyY + d * 0.52} ${cx + d * 0.28} ${bodyY + d * 0.26}`;
    if (emotion === "content")
      return `M${cx - d * 0.22} ${bodyY + d * 0.26} Q${cx} ${bodyY + d * 0.42} ${cx + d * 0.22} ${bodyY + d * 0.26}`;
    if (emotion === "neutral")
      return `M${cx - d * 0.22} ${bodyY + d * 0.3} L${cx + d * 0.22} ${bodyY + d * 0.3}`;
    if (emotion === "worried")
      return `M${cx - d * 0.22} ${bodyY + d * 0.38} Q${cx} ${bodyY + d * 0.22} ${cx + d * 0.22} ${bodyY + d * 0.38}`;
    return `M${cx - d * 0.26} ${bodyY + d * 0.42} Q${cx} ${bodyY + d * 0.22} ${cx + d * 0.26} ${bodyY + d * 0.42}`;
  })();

  const browOffset = isSad ? bodyR * 0.08 : emotion === "worried" ? bodyR * 0.05 : 0;

  const shadowW = s * 0.38;

  return (
    <View style={{ width: s, height: s * 1.1, alignItems: "center" }}>
      {isHappy && (
        <Animated.View
          style={{
            position: "absolute",
            top: bodyY - bodyR * 1.15,
            left: cx - bodyR * 1.15,
            width: bodyR * 2.3,
            height: bodyR * 2.3,
            borderRadius: bodyR * 1.15,
            backgroundColor: glowColor,
            opacity: glowAnim,
            pointerEvents: "none",
          }}
        />
      )}

      <Animated.View
        style={{
          transform: [
            { translateY: floatY },
            { translateX: isSad ? shakeAnim : 0 },
            { scale: isHappy ? scaleAnim : 1 },
          ],
        }}
      >
        <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <Defs>
            <RadialGradient id="bodyGrad" cx="38%" cy="32%" r="70%" fx="38%" fy="32%">
              <Stop offset="0%" stopColor={brainHighlight} />
              <Stop offset="45%" stopColor={brainLight} />
              <Stop offset="100%" stopColor={brainBase} />
            </RadialGradient>
            <RadialGradient id="eyeGrad" cx="30%" cy="28%" r="70%">
              <Stop offset="0%" stopColor="#fff" />
              <Stop offset="100%" stopColor="#F5EEE8" />
            </RadialGradient>
            <RadialGradient id="shadowR" cx="50%" cy="35%" r="60%">
              <Stop offset="0%" stopColor="rgba(0,0,0,0.12)" />
              <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </RadialGradient>
          </Defs>

          {/* Feet */}
          {!isSad ? (
            <G>
              <Ellipse
                cx={cx - bodyR * 0.28}
                cy={bodyY + bodyR * 1.02}
                rx={bodyR * 0.16}
                ry={bodyR * 0.22}
                fill={brainBase}
              />
              <Ellipse
                cx={cx + bodyR * 0.28}
                cy={bodyY + bodyR * 1.02}
                rx={bodyR * 0.16}
                ry={bodyR * 0.22}
                fill={brainBase}
              />
            </G>
          ) : (
            <G>
              <Path
                d={`M${cx - bodyR * 0.22} ${bodyY + bodyR * 0.82} Q${cx - bodyR * 0.35} ${bodyY + bodyR * 1.12} ${cx - bodyR * 0.38} ${bodyY + bodyR * 1.32}`}
                stroke={brainDark}
                strokeWidth={bodyR * 0.14}
                strokeLinecap="round"
                fill="none"
              />
              <Path
                d={`M${cx + bodyR * 0.22} ${bodyY + bodyR * 0.82} Q${cx + bodyR * 0.35} ${bodyY + bodyR * 1.12} ${cx + bodyR * 0.38} ${bodyY + bodyR * 1.32}`}
                stroke={brainDark}
                strokeWidth={bodyR * 0.14}
                strokeLinecap="round"
                fill="none"
              />
            </G>
          )}

          {/* Arms */}
          {emotion === "ecstatic" && (
            <G>
              <Path
                d={`M${cx - bodyR * 0.82} ${bodyY - bodyR * 0.2} Q${cx - bodyR * 1.18} ${bodyY - bodyR * 0.62} ${cx - bodyR * 0.96} ${bodyY - bodyR * 0.88}`}
                stroke={brainDark} strokeWidth={bodyR * 0.12} strokeLinecap="round" fill="none"
              />
              <Path
                d={`M${cx + bodyR * 0.82} ${bodyY - bodyR * 0.2} Q${cx + bodyR * 1.18} ${bodyY - bodyR * 0.62} ${cx + bodyR * 0.96} ${bodyY - bodyR * 0.88}`}
                stroke={brainDark} strokeWidth={bodyR * 0.12} strokeLinecap="round" fill="none"
              />
            </G>
          )}
          {(emotion === "happy" || emotion === "content") && (
            <G>
              <Path
                d={`M${cx - bodyR * 0.82} ${bodyY - bodyR * 0.04} Q${cx - bodyR * 1.1} ${bodyY + bodyR * 0.1} ${cx - bodyR * 1.02} ${bodyY + bodyR * 0.4}`}
                stroke={brainDark} strokeWidth={bodyR * 0.12} strokeLinecap="round" fill="none"
              />
              <Path
                d={`M${cx + bodyR * 0.82} ${bodyY - bodyR * 0.04} Q${cx + bodyR * 1.1} ${bodyY + bodyR * 0.1} ${cx + bodyR * 1.02} ${bodyY + bodyR * 0.4}`}
                stroke={brainDark} strokeWidth={bodyR * 0.12} strokeLinecap="round" fill="none"
              />
            </G>
          )}
          {isSad && (
            <G>
              <Path
                d={`M${cx - bodyR * 0.82} ${bodyY + bodyR * 0.08} Q${cx - bodyR * 1.06} ${bodyY + bodyR * 0.46} ${cx - bodyR * 0.9} ${bodyY + bodyR * 0.66}`}
                stroke={brainDark} strokeWidth={bodyR * 0.12} strokeLinecap="round" fill="none"
              />
              <Path
                d={`M${cx + bodyR * 0.82} ${bodyY + bodyR * 0.08} Q${cx + bodyR * 1.06} ${bodyY + bodyR * 0.46} ${cx + bodyR * 0.9} ${bodyY + bodyR * 0.66}`}
                stroke={brainDark} strokeWidth={bodyR * 0.12} strokeLinecap="round" fill="none"
              />
            </G>
          )}

          {/* Main body - round circle */}
          <Circle cx={cx} cy={bodyY} r={bodyR} fill="url(#bodyGrad)" />

          {/* Depth shadow */}
          <Ellipse
            cx={cx + bodyR * 0.18}
            cy={bodyY + bodyR * 0.18}
            rx={bodyR * 0.72}
            ry={bodyR * 0.72}
            fill="url(#shadowR)"
          />

          {/* Brain bumps on top - kawaii style gyri */}
          {/* Center bump */}
          <Path
            d={`M${cx - bodyR * 0.12} ${bodyY - bodyR * 0.72}
               Q${cx - bodyR * 0.06} ${bodyY - bodyR * 1.08} ${cx + bodyR * 0.06} ${bodyY - bodyR * 0.72}`}
            stroke={brainDark}
            strokeWidth={bodyR * 0.055}
            strokeLinecap="round"
            fill="none"
            opacity={0.5}
          />
          {/* Left top bump */}
          <Path
            d={`M${cx - bodyR * 0.52} ${bodyY - bodyR * 0.6}
               Q${cx - bodyR * 0.44} ${bodyY - bodyR * 0.94} ${cx - bodyR * 0.24} ${bodyY - bodyR * 0.68}`}
            stroke={brainDark}
            strokeWidth={bodyR * 0.05}
            strokeLinecap="round"
            fill="none"
            opacity={0.48}
          />
          {/* Right top bump */}
          <Path
            d={`M${cx + bodyR * 0.24} ${bodyY - bodyR * 0.68}
               Q${cx + bodyR * 0.44} ${bodyY - bodyR * 0.94} ${cx + bodyR * 0.52} ${bodyY - bodyR * 0.6}`}
            stroke={brainDark}
            strokeWidth={bodyR * 0.05}
            strokeLinecap="round"
            fill="none"
            opacity={0.48}
          />
          {/* Far left bump */}
          <Path
            d={`M${cx - bodyR * 0.78} ${bodyY - bodyR * 0.38}
               Q${cx - bodyR * 0.72} ${bodyY - bodyR * 0.64} ${cx - bodyR * 0.54} ${bodyY - bodyR * 0.46}`}
            stroke={brainDark}
            strokeWidth={bodyR * 0.048}
            strokeLinecap="round"
            fill="none"
            opacity={0.42}
          />
          {/* Far right bump */}
          <Path
            d={`M${cx + bodyR * 0.54} ${bodyY - bodyR * 0.46}
               Q${cx + bodyR * 0.72} ${bodyY - bodyR * 0.64} ${cx + bodyR * 0.78} ${bodyY - bodyR * 0.38}`}
            stroke={brainDark}
            strokeWidth={bodyR * 0.048}
            strokeLinecap="round"
            fill="none"
            opacity={0.42}
          />

          {/* Center vertical crease */}
          <Path
            d={`M${cx} ${bodyY - bodyR * 0.88} Q${cx - bodyR * 0.04} ${bodyY - bodyR * 0.32} ${cx} ${bodyY - bodyR * 0.02}`}
            stroke={brainDark}
            strokeWidth={bodyR * 0.058}
            strokeLinecap="round"
            fill="none"
            opacity={0.4}
          />

          {/* 3D highlight shine */}
          <Ellipse
            cx={cx - bodyR * 0.22}
            cy={bodyY - bodyR * 0.38}
            rx={bodyR * 0.16}
            ry={bodyR * 0.09}
            fill="rgba(255,255,255,0.55)"
          />
          <Ellipse
            cx={cx - bodyR * 0.08}
            cy={bodyY - bodyR * 0.58}
            rx={bodyR * 0.065}
            ry={bodyR * 0.04}
            fill="rgba(255,255,255,0.38)"
          />

          {/* Sparkle stars - ecstatic */}
          {emotion === "ecstatic" && (
            <G>
              <Circle cx={cx - bodyR * 1.1} cy={bodyY - bodyR * 0.7} r={bodyR * 0.07} fill="#FFD700" opacity={0.9} />
              <Circle cx={cx + bodyR * 1.08} cy={bodyY - bodyR * 0.65} r={bodyR * 0.09} fill="#FFD700" opacity={0.85} />
              <Circle cx={cx - bodyR * 0.8} cy={bodyY - bodyR * 1.05} r={bodyR * 0.055} fill="#FFEC50" opacity={0.8} />
              <Circle cx={cx + bodyR * 0.72} cy={bodyY - bodyR * 1.08} r={bodyR * 0.065} fill="#FFD700" opacity={0.75} />
              <Circle cx={cx} cy={bodyY - bodyR * 1.18} r={bodyR * 0.07} fill="#FFEC50" opacity={0.85} />
            </G>
          )}

          {/* Eyebrows */}
          <Path
            d={`M${lx - bodyR * 0.14} ${eyeY - bodyR * 0.28 - browOffset} Q${lx} ${eyeY - bodyR * 0.38 + (isSad ? bodyR * 0.16 : 0)} ${lx + bodyR * 0.14} ${eyeY - bodyR * 0.28 - (isSad ? browOffset * 1.5 : 0)}`}
            stroke={brainDark}
            strokeWidth={bodyR * 0.055}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d={`M${rx2 - bodyR * 0.14} ${eyeY - bodyR * 0.28 - (isSad ? browOffset * 1.5 : 0)} Q${rx2} ${eyeY - bodyR * 0.38 + (isSad ? bodyR * 0.16 : 0)} ${rx2 + bodyR * 0.14} ${eyeY - bodyR * 0.28 - browOffset}`}
            stroke={brainDark}
            strokeWidth={bodyR * 0.055}
            strokeLinecap="round"
            fill="none"
          />

          {/* Eyes - big round kawaii style */}
          <Ellipse cx={lx} cy={eyeY} rx={eyeRx} ry={eyeRy} fill="url(#eyeGrad)" />
          {!blinking && (
            <G>
              <Circle cx={lx + pupilR * 0.35} cy={eyeY + (isSad ? pupilR * 0.5 : 0)} r={pupilR} fill="#2A1A10" />
              <Circle cx={lx + pupilR * 0.05} cy={eyeY - pupilR * 0.42} r={pupilR * 0.35} fill="rgba(255,255,255,0.75)" />
            </G>
          )}
          <Ellipse cx={rx2} cy={eyeY} rx={eyeRx} ry={eyeRy} fill="url(#eyeGrad)" />
          {!blinking && (
            <G>
              <Circle cx={rx2 + pupilR * 0.35} cy={eyeY + (isSad ? pupilR * 0.5 : 0)} r={pupilR} fill="#2A1A10" />
              <Circle cx={rx2 + pupilR * 0.05} cy={eyeY - pupilR * 0.42} r={pupilR * 0.35} fill="rgba(255,255,255,0.75)" />
            </G>
          )}

          {/* Rosy cheeks */}
          {(isHappy || emotion === "content") && (
            <G>
              <Ellipse cx={lx - bodyR * 0.06} cy={eyeY + bodyR * 0.3} rx={bodyR * 0.15} ry={bodyR * 0.085} fill="#F4956A" opacity={0.28} />
              <Ellipse cx={rx2 + bodyR * 0.06} cy={eyeY + bodyR * 0.3} rx={bodyR * 0.15} ry={bodyR * 0.085} fill="#F4956A" opacity={0.28} />
            </G>
          )}

          {/* Tears */}
          {isSad && (
            <G>
              <Ellipse cx={lx} cy={eyeY + bodyR * 0.28} rx={bodyR * 0.045} ry={bodyR * 0.09} fill="#A8CAEE" opacity={0.85} />
              <Ellipse cx={rx2} cy={eyeY + bodyR * 0.32} rx={bodyR * 0.04} ry={bodyR * 0.08} fill="#A8CAEE" opacity={0.7} />
            </G>
          )}

          {/* Mouth */}
          <Path
            d={mouthPath}
            stroke="#2A1A10"
            strokeWidth={bodyR * 0.065}
            strokeLinecap="round"
            fill="none"
          />

          {/* Tongue - ecstatic */}
          {emotion === "ecstatic" && (
            <Ellipse cx={cx} cy={bodyY + bodyR * 0.56} rx={bodyR * 0.13} ry={bodyR * 0.09} fill="#E8604A" />
          )}
        </Svg>
      </Animated.View>

      {/* Floor shadow */}
      <Animated.View
        style={{
          width: shadowW,
          height: shadowW * 0.22,
          borderRadius: shadowW,
          backgroundColor: "rgba(0,0,0,0.09)",
          marginTop: -(shadowW * 0.11),
          opacity: shadowOpacity,
        }}
      />
    </View>
  );
}
