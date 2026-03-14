import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  Path,
  RadialGradient,
  LinearGradient,
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
    outputRange: [isSad ? 0.6 : 0.65, isSad ? 0.45 : 0.25],
  });

  const s = size;
  const cx = s / 2;
  const cy = s * 0.43;
  const r = s * 0.32;

  const brainFill = isSad ? "#D4A0B0" : "#F4A7BE";
  const brainMid = isSad ? "#E8C0CE" : "#FBCBD8";
  const brainDark = isSad ? "#B07890" : "#E07498";
  const brainHighlight = isSad ? "#E8C8D4" : "#FDE0EC";
  const glowColor = emotion === "ecstatic" ? "#FFD700" : isHappy ? "#FF9EC4" : "transparent";

  const eyeY = cy - r * 0.06;
  const lx = cx - r * 0.31;
  const rx2 = cx + r * 0.31;
  const eyeRx = r * 0.115;
  const eyeRy = blinking ? r * 0.012 : r * 0.12;
  const pupilR = r * 0.058;

  const browOffset = isSad ? r * 0.07 : emotion === "worried" ? r * 0.05 : 0;

  const mouthPath = (() => {
    const d = r;
    if (emotion === "ecstatic")
      return `M${cx - d * 0.38} ${cy + d * 0.44} Q${cx} ${cy + d * 0.78} ${cx + d * 0.38} ${cy + d * 0.44}`;
    if (emotion === "happy")
      return `M${cx - d * 0.3} ${cy + d * 0.4} Q${cx} ${cy + d * 0.66} ${cx + d * 0.3} ${cy + d * 0.4}`;
    if (emotion === "content")
      return `M${cx - d * 0.24} ${cy + d * 0.38} Q${cx} ${cy + d * 0.54} ${cx + d * 0.24} ${cy + d * 0.38}`;
    if (emotion === "neutral")
      return `M${cx - d * 0.24} ${cy + d * 0.4} L${cx + d * 0.24} ${cy + d * 0.4}`;
    if (emotion === "worried")
      return `M${cx - d * 0.24} ${cy + d * 0.44} Q${cx} ${cy + d * 0.3} ${cx + d * 0.24} ${cy + d * 0.44}`;
    return `M${cx - d * 0.28} ${cy + d * 0.5} Q${cx} ${cy + d * 0.28} ${cx + d * 0.28} ${cy + d * 0.5}`;
  })();

  const shadowW = s * 0.34;

  return (
    <View style={{ width: s, height: s * 1.05, alignItems: "center" }}>
      {isHappy && (
        <Animated.View
          style={{
            position: "absolute",
            top: cy - r * 1.1,
            left: cx - r * 1.1,
            width: r * 2.2,
            height: r * 2.2,
            borderRadius: r * 1.1,
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
            <RadialGradient id="bg" cx="38%" cy="30%" r="65%" fx="38%" fy="30%">
              <Stop offset="0%" stopColor={brainHighlight} />
              <Stop offset="42%" stopColor={brainMid} />
              <Stop offset="100%" stopColor={brainDark} />
            </RadialGradient>
            <RadialGradient id="eyeW" cx="35%" cy="28%" r="65%">
              <Stop offset="0%" stopColor="#fff" />
              <Stop offset="100%" stopColor="#F4E8F0" />
            </RadialGradient>
            <RadialGradient id="shadowR" cx="50%" cy="30%" r="55%">
              <Stop offset="0%" stopColor="rgba(0,0,0,0.16)" />
              <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </RadialGradient>
          </Defs>

          {/* Legs */}
          {!isSad ? (
            <G>
              <Ellipse cx={cx - r * 0.26} cy={cy + r + r * 0.46} rx={r * 0.11} ry={r * 0.2} fill={brainDark} />
              <Ellipse cx={cx + r * 0.26} cy={cy + r + r * 0.46} rx={r * 0.11} ry={r * 0.2} fill={brainDark} />
            </G>
          ) : (
            <G>
              <Path
                d={`M${cx - r * 0.2} ${cy + r * 0.84} Q${cx - r * 0.32} ${cy + r * 1.22} ${cx - r * 0.36} ${cy + r * 1.44}`}
                stroke={brainDark} strokeWidth={r * 0.12} strokeLinecap="round" fill="none"
              />
              <Path
                d={`M${cx + r * 0.2} ${cy + r * 0.84} Q${cx + r * 0.32} ${cy + r * 1.22} ${cx + r * 0.36} ${cy + r * 1.44}`}
                stroke={brainDark} strokeWidth={r * 0.12} strokeLinecap="round" fill="none"
              />
            </G>
          )}

          {/* Arms */}
          {emotion === "ecstatic" && (
            <G>
              <Path d={`M${cx - r * 0.76} ${cy - r * 0.08} Q${cx - r * 1.1} ${cy - r * 0.5} ${cx - r * 0.9} ${cy - r * 0.76}`}
                stroke={brainDark} strokeWidth={r * 0.11} strokeLinecap="round" fill="none" />
              <Path d={`M${cx + r * 0.76} ${cy - r * 0.08} Q${cx + r * 1.1} ${cy - r * 0.5} ${cx + r * 0.9} ${cy - r * 0.76}`}
                stroke={brainDark} strokeWidth={r * 0.11} strokeLinecap="round" fill="none" />
            </G>
          )}
          {(emotion === "happy" || emotion === "content") && (
            <G>
              <Path d={`M${cx - r * 0.76} ${cy + r * 0.02} Q${cx - r * 1.06} ${cy + r * 0.14} ${cx - r * 0.98} ${cy + r * 0.42}`}
                stroke={brainDark} strokeWidth={r * 0.11} strokeLinecap="round" fill="none" />
              <Path d={`M${cx + r * 0.76} ${cy + r * 0.02} Q${cx + r * 1.06} ${cy + r * 0.14} ${cx + r * 0.98} ${cy + r * 0.42}`}
                stroke={brainDark} strokeWidth={r * 0.11} strokeLinecap="round" fill="none" />
            </G>
          )}
          {isSad && (
            <G>
              <Path d={`M${cx - r * 0.76} ${cy + r * 0.12} Q${cx - r * 1.02} ${cy + r * 0.44} ${cx - r * 0.88} ${cy + r * 0.64}`}
                stroke={brainDark} strokeWidth={r * 0.11} strokeLinecap="round" fill="none" />
              <Path d={`M${cx + r * 0.76} ${cy + r * 0.12} Q${cx + r * 1.02} ${cy + r * 0.44} ${cx + r * 0.88} ${cy + r * 0.64}`}
                stroke={brainDark} strokeWidth={r * 0.11} strokeLinecap="round" fill="none" />
            </G>
          )}

          {/* Main brain sphere */}
          <Circle cx={cx} cy={cy} r={r} fill="url(#bg)" />

          {/* Depth shadow overlay */}
          <Ellipse cx={cx + r * 0.16} cy={cy + r * 0.16} rx={r * 0.7} ry={r * 0.7} fill="url(#shadowR)" />

          {/* Brain wrinkles - center groove */}
          <Path d={`M${cx} ${cy - r * 0.88} Q${cx - r * 0.08} ${cy - r * 0.2} ${cx} ${cy + r * 0.06}`}
            stroke={brainDark} strokeWidth={r * 0.062} strokeLinecap="round" fill="none" opacity={0.55} />

          {/* Top wrinkles left */}
          <Path d={`M${cx - r * 0.04} ${cy - r * 0.84} Q${cx - r * 0.22} ${cy - r * 0.6} ${cx - r * 0.06} ${cy - r * 0.42}`}
            stroke={brainDark} strokeWidth={r * 0.052} strokeLinecap="round" fill="none" opacity={0.55} />
          <Path d={`M${cx - r * 0.46} ${cy - r * 0.72} Q${cx - r * 0.64} ${cy - r * 0.46} ${cx - r * 0.46} ${cy - r * 0.28}`}
            stroke={brainDark} strokeWidth={r * 0.048} strokeLinecap="round" fill="none" opacity={0.48} />

          {/* Top wrinkles right */}
          <Path d={`M${cx + r * 0.08} ${cy - r * 0.85} Q${cx + r * 0.3} ${cy - r * 0.58} ${cx + r * 0.14} ${cy - r * 0.4}`}
            stroke={brainDark} strokeWidth={r * 0.05} strokeLinecap="round" fill="none" opacity={0.5} />
          <Path d={`M${cx + r * 0.48} ${cy - r * 0.72} Q${cx + r * 0.66} ${cy - r * 0.44} ${cx + r * 0.48} ${cy - r * 0.26}`}
            stroke={brainDark} strokeWidth={r * 0.048} strokeLinecap="round" fill="none" opacity={0.48} />

          {/* Side grooves */}
          <Path d={`M${cx - r * 0.8} ${cy - r * 0.24} Q${cx - r * 0.88} ${cy} ${cx - r * 0.8} ${cy + r * 0.22}`}
            stroke={brainDark} strokeWidth={r * 0.045} strokeLinecap="round" fill="none" opacity={0.42} />
          <Path d={`M${cx + r * 0.8} ${cy - r * 0.24} Q${cx + r * 0.88} ${cy} ${cx + r * 0.8} ${cy + r * 0.22}`}
            stroke={brainDark} strokeWidth={r * 0.045} strokeLinecap="round" fill="none" opacity={0.42} />

          {/* 3D shine */}
          <Ellipse cx={cx - r * 0.24} cy={cy - r * 0.36} rx={r * 0.17} ry={r * 0.1} fill="rgba(255,255,255,0.55)" />
          <Ellipse cx={cx - r * 0.1} cy={cy - r * 0.54} rx={r * 0.07} ry={r * 0.045} fill="rgba(255,255,255,0.38)" />

          {/* Stars - ecstatic */}
          {emotion === "ecstatic" && (
            <G>
              <Circle cx={cx - r * 1.08} cy={cy - r * 0.76} r={r * 0.07} fill="#FFD700" opacity={0.9} />
              <Circle cx={cx + r * 1.06} cy={cy - r * 0.7} r={r * 0.09} fill="#FFD700" opacity={0.85} />
              <Circle cx={cx - r * 0.84} cy={cy - r * 1.06} r={r * 0.055} fill="#FFEC50" opacity={0.8} />
              <Circle cx={cx + r * 0.74} cy={cy - r * 1.1} r={r * 0.065} fill="#FFD700" opacity={0.75} />
              <Circle cx={cx} cy={cy - r * 1.2} r={r * 0.07} fill="#FFEC50" opacity={0.85} />
            </G>
          )}

          {/* Light bulb - content */}
          {emotion === "content" && (
            <G>
              <Circle cx={cx + r * 0.98} cy={cy - r * 0.58} r={r * 0.12} fill="#FFE580" opacity={0.92} />
              <Ellipse cx={cx + r * 0.98} cy={cy - r * 0.43} rx={r * 0.065} ry={r * 0.046} fill="#E8C830" opacity={0.8} />
            </G>
          )}

          {/* Eyebrows */}
          <Path
            d={`M${lx - r * 0.13} ${eyeY - r * 0.2 - browOffset} Q${lx} ${eyeY - r * 0.3 + (isSad ? r * 0.14 : 0)} ${lx + r * 0.13} ${eyeY - r * 0.2 - (isSad ? browOffset * 1.5 : 0)}`}
            stroke={brainDark} strokeWidth={r * 0.052} strokeLinecap="round" fill="none"
          />
          <Path
            d={`M${rx2 - r * 0.13} ${eyeY - r * 0.2 - (isSad ? browOffset * 1.5 : 0)} Q${rx2} ${eyeY - r * 0.3 + (isSad ? r * 0.14 : 0)} ${rx2 + r * 0.13} ${eyeY - r * 0.2 - browOffset}`}
            stroke={brainDark} strokeWidth={r * 0.052} strokeLinecap="round" fill="none"
          />

          {/* Eyes */}
          <Ellipse cx={lx} cy={eyeY} rx={eyeRx} ry={eyeRy} fill="url(#eyeW)" />
          {!blinking && (
            <G>
              <Circle cx={lx + pupilR * 0.4} cy={eyeY + (isSad ? pupilR * 0.5 : 0)} r={pupilR} fill="#3D2035" />
              <Circle cx={lx + pupilR * 0.1} cy={eyeY - pupilR * 0.38} r={pupilR * 0.32} fill="rgba(255,255,255,0.7)" />
            </G>
          )}
          <Ellipse cx={rx2} cy={eyeY} rx={eyeRx} ry={eyeRy} fill="url(#eyeW)" />
          {!blinking && (
            <G>
              <Circle cx={rx2 + pupilR * 0.4} cy={eyeY + (isSad ? pupilR * 0.5 : 0)} r={pupilR} fill="#3D2035" />
              <Circle cx={rx2 + pupilR * 0.1} cy={eyeY - pupilR * 0.38} r={pupilR * 0.32} fill="rgba(255,255,255,0.7)" />
            </G>
          )}

          {/* Rosy cheeks */}
          {(isHappy || emotion === "content") && (
            <G>
              <Ellipse cx={lx - r * 0.06} cy={eyeY + r * 0.22} rx={r * 0.14} ry={r * 0.08} fill="#FF9EC4" opacity={0.35} />
              <Ellipse cx={rx2 + r * 0.06} cy={eyeY + r * 0.22} rx={r * 0.14} ry={r * 0.08} fill="#FF9EC4" opacity={0.35} />
            </G>
          )}

          {/* Tears */}
          {isSad && (
            <G>
              <Ellipse cx={lx} cy={eyeY + r * 0.2} rx={r * 0.04} ry={r * 0.08} fill="#A8CAEE" opacity={0.85} />
              <Ellipse cx={rx2} cy={eyeY + r * 0.24} rx={r * 0.035} ry={r * 0.07} fill="#A8CAEE" opacity={0.7} />
            </G>
          )}

          {/* Mouth */}
          <Path d={mouthPath} stroke="#3D2035" strokeWidth={r * 0.06} strokeLinecap="round" fill="none" />

          {/* Tongue - ecstatic */}
          {emotion === "ecstatic" && (
            <Ellipse cx={cx} cy={cy + r * 0.68} rx={r * 0.13} ry={r * 0.09} fill="#FF6B9E" />
          )}
        </Svg>
      </Animated.View>

      {/* Floor shadow */}
      <Animated.View
        style={{
          width: shadowW,
          height: shadowW * 0.24,
          borderRadius: shadowW,
          backgroundColor: "rgba(0,0,0,0.1)",
          marginTop: -(shadowW * 0.12),
          opacity: shadowOpacity,
        }}
      />
    </View>
  );
}
