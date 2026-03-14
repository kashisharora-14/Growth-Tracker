import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Ellipse, Path } from "react-native-svg";

export type MascotEmotion =
  | "sleepy"
  | "happy"
  | "strong"
  | "glowing"
  | "encouraging"
  | "breathing"
  | "celebrating"
  | "neutral";

export function getStreakEmotion(streak: number): MascotEmotion {
  if (streak >= 90) return "glowing";
  if (streak >= 30) return "strong";
  if (streak >= 7) return "happy";
  return "sleepy";
}

export function getStreakLabel(emotion: MascotEmotion): string {
  switch (emotion) {
    case "sleepy": return "Sleepy Brain · Day 1";
    case "happy": return "Happy Brain · Week 1+";
    case "strong": return "Strong Brain · Month 1+";
    case "glowing": return "Glowing Brain · 90 Days! ✨";
    default: return "Your Companion";
  }
}

export const MASCOT_PALETTE: Record<MascotEmotion, { body: string; shade: string }> = {
  sleepy:      { body: "#C8B8D0", shade: "#A898B8" },
  happy:       { body: "#F4A8C8", shade: "#D888A8" },
  strong:      { body: "#C860A0", shade: "#A04080" },
  glowing:     { body: "#F8D050", shade: "#D8A820" },
  encouraging: { body: "#E890B8", shade: "#C870A0" },
  breathing:   { body: "#80B8E8", shade: "#5090C8" },
  celebrating: { body: "#FF9050", shade: "#D06830" },
  neutral:     { body: "#D8A8C8", shade: "#B888A8" },
};

const EC = "#3A2540";

function renderFace(emotion: MascotEmotion) {
  switch (emotion) {
    case "sleepy":
      return (
        <>
          <Path d="M31,58 Q37,53 43,58" stroke={EC} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Path d="M57,58 Q63,53 69,58" stroke={EC} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Path d="M72,23 L76,23 L72,28 L76,28" stroke={EC} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M42,70 Q50,71 58,70" stroke={EC} strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      );
    case "breathing":
      return (
        <>
          <Path d="M31,57 Q37,63 43,57" stroke={EC} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Path d="M57,57 Q63,63 69,57" stroke={EC} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Path d="M42,70 Q50,75 58,70" stroke={EC} strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      );
    case "glowing":
      return (
        <>
          <Path d="M37,52 L38.3,56 L42,56 L39.1,58.2 L40.2,62 L37,60 L33.8,62 L34.9,58.2 L32,56 L35.7,56 Z" fill={EC} />
          <Path d="M63,52 L64.3,56 L68,56 L65.1,58.2 L66.2,62 L63,60 L59.8,62 L60.9,58.2 L58,56 L61.7,56 Z" fill={EC} />
          <Path d="M36,68 Q50,82 64,68" stroke={EC} strokeWidth="2" fill="rgba(255,255,255,0.5)" />
          <Ellipse cx="27" cy="66" rx="6" ry="4" fill="rgba(255,160,80,0.4)" />
          <Ellipse cx="73" cy="66" rx="6" ry="4" fill="rgba(255,160,80,0.4)" />
        </>
      );
    case "celebrating":
      return (
        <>
          <Path d="M31,59 Q37,52 43,59" stroke={EC} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Path d="M57,59 Q63,52 69,59" stroke={EC} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Path d="M37,67 Q50,81 63,67" stroke={EC} strokeWidth="2" fill="rgba(255,255,255,0.4)" />
          <Ellipse cx="27" cy="65" rx="6" ry="4" fill="rgba(255,120,80,0.4)" />
          <Ellipse cx="73" cy="65" rx="6" ry="4" fill="rgba(255,120,80,0.4)" />
        </>
      );
    case "strong":
      return (
        <>
          <Circle cx="37" cy="57" r="5" fill="white" />
          <Circle cx="63" cy="57" r="5" fill="white" />
          <Circle cx="37" cy="56" r="2.5" fill={EC} />
          <Circle cx="63" cy="56" r="2.5" fill={EC} />
          <Circle cx="38.5" cy="54.5" r="1" fill="white" />
          <Circle cx="64.5" cy="54.5" r="1" fill="white" />
          <Path d="M31,51 L43,54" stroke={EC} strokeWidth="2" strokeLinecap="round" />
          <Path d="M57,54 L69,51" stroke={EC} strokeWidth="2" strokeLinecap="round" />
          <Path d="M39,68 Q50,78 61,68" stroke={EC} strokeWidth="2" fill="rgba(255,255,255,0.4)" />
        </>
      );
    case "encouraging":
      return (
        <>
          <Circle cx="37" cy="57" r="6" fill="white" />
          <Circle cx="63" cy="57" r="6" fill="white" />
          <Circle cx="37.5" cy="56" r="3" fill={EC} />
          <Circle cx="63.5" cy="56" r="3" fill={EC} />
          <Circle cx="39" cy="54.5" r="1.2" fill="white" />
          <Circle cx="65" cy="54.5" r="1.2" fill="white" />
          <Path d="M40,68 Q50,76 60,68" stroke={EC} strokeWidth="2" fill="rgba(255,255,255,0.4)" />
          <Ellipse cx="27" cy="65" rx="6" ry="4" fill="rgba(255,140,150,0.35)" />
          <Ellipse cx="73" cy="65" rx="6" ry="4" fill="rgba(255,140,150,0.35)" />
        </>
      );
    case "neutral":
      return (
        <>
          <Circle cx="37" cy="57" r="5.5" fill="white" />
          <Circle cx="63" cy="57" r="5.5" fill="white" />
          <Circle cx="37.5" cy="56" r="2.8" fill={EC} />
          <Circle cx="63.5" cy="56" r="2.8" fill={EC} />
          <Circle cx="39" cy="54.5" r="1.1" fill="white" />
          <Circle cx="65" cy="54.5" r="1.1" fill="white" />
          <Path d="M41,70 Q50,72 59,70" stroke={EC} strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      );
    case "happy":
    default:
      return (
        <>
          <Circle cx="37" cy="57" r="5.5" fill="white" />
          <Circle cx="63" cy="57" r="5.5" fill="white" />
          <Circle cx="37.5" cy="56" r="2.8" fill={EC} />
          <Circle cx="63.5" cy="56" r="2.8" fill={EC} />
          <Circle cx="39" cy="54.5" r="1.1" fill="white" />
          <Circle cx="65" cy="54.5" r="1.1" fill="white" />
          <Path d="M40,68 Q50,76 60,68" stroke={EC} strokeWidth="2" fill="rgba(255,255,255,0.4)" />
          <Ellipse cx="27" cy="65" rx="5.5" ry="3.5" fill="rgba(255,140,150,0.3)" />
          <Ellipse cx="73" cy="65" rx="5.5" ry="3.5" fill="rgba(255,140,150,0.3)" />
        </>
      );
  }
}

interface MascotProps {
  emotion?: MascotEmotion;
  size?: number;
  message?: string;
  animate?: boolean;
}

export default function Mascot({
  emotion = "neutral",
  size = 100,
  message,
  animate = true,
}: MascotProps) {
  const { body, shade } = MASCOT_PALETTE[emotion];
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    translateY.setValue(0);
    scale.setValue(1);

    if (!animate) return;

    let anim: Animated.CompositeAnimation;

    if (emotion === "breathing") {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.13, duration: 4000, useNativeDriver: false }),
          Animated.timing(scale, { toValue: 0.95, duration: 4000, useNativeDriver: false }),
        ])
      );
    } else if (emotion === "celebrating") {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, { toValue: -10, duration: 280, useNativeDriver: false }),
          Animated.timing(translateY, { toValue: 0, duration: 280, useNativeDriver: false }),
          Animated.delay(500),
        ])
      );
    } else {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, { toValue: -5, duration: 1800, useNativeDriver: false }),
          Animated.timing(translateY, { toValue: 0, duration: 1800, useNativeDriver: false }),
        ])
      );
    }

    anim.start();
    return () => anim.stop();
  }, [emotion, animate]);

  return (
    <View style={{ alignItems: "center", gap: 6 }}>
      {message ? (
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{message}</Text>
        </View>
      ) : null}
      <Animated.View style={{ transform: [{ translateY }, { scale }] }}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {emotion === "glowing" && (
            <Ellipse cx="50" cy="50" rx="46" ry="40" fill="rgba(248,208,80,0.18)" />
          )}
          <Ellipse cx="32" cy="37" rx="20" ry="16" fill={body} />
          <Ellipse cx="68" cy="37" rx="20" ry="16" fill={body} />
          <Ellipse cx="50" cy="62" rx="32" ry="22" fill={body} />
          <Path d="M50,22 Q47,37 50,52" stroke={shade} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <Path d="M20,31 Q18,40 20,49" stroke={shade} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <Path d="M80,31 Q82,40 80,49" stroke={shade} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {renderFace(emotion)}
          <Ellipse cx="50" cy="85" rx="20" ry="4" fill="rgba(0,0,0,0.07)" />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    backgroundColor: "white",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: "#ECD8F0",
    maxWidth: 220,
    shadowColor: "rgba(0,0,0,0.08)",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  bubbleText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#3A2540",
    textAlign: "center",
    lineHeight: 19,
  },
});
