import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Ellipse,
  G,
  Path,
  Rect,
} from "react-native-svg";

type TreeStage =
  | "seedling"
  | "sapling"
  | "growing"
  | "flourishing"
  | "majestic"
  | "monsoon"
  | "wilting";

function getTreeStage(streak: number): TreeStage {
  if (streak === 0) return "seedling";
  if (streak < 3) return "sapling";
  if (streak < 7) return "growing";
  if (streak < 21) return "flourishing";
  if (streak < 0) return "wilting";
  if (streak < 0) return "monsoon";
  return "majestic";
}

type TreeProps = {
  streak: number;
  size?: number;
  animate?: boolean;
};

export function StreakTree({ streak, size = 200, animate = true }: TreeProps) {
  const stage = getTreeStage(streak);
  const swayAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: false,
        }),
        Animated.timing(swayAnim, {
          toValue: -1,
          duration: 2500,
          useNativeDriver: false,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [animate]);

  const rotate = swayAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-2deg", "2deg"],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const s = size;
  const cx = s / 2;
  const cy = s / 2;

  return (
    <View style={{ width: s, height: s, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={{
          width: s,
          height: s,
          transform: [{ rotate: stage === "monsoon" ? "0deg" : rotate }],
        }}
      >
        {stage === "seedling" && (
          <Svg width={s} height={s} viewBox="0 0 200 200">
            <Rect x="95" y="130" width="10" height="40" rx="4" fill="#8B5E3C" />
            <Ellipse cx="100" cy="120" rx="18" ry="22" fill="#4CAF78" />
            <Ellipse cx="100" cy="115" rx="10" ry="13" fill="#6DCF96" />
          </Svg>
        )}

        {stage === "sapling" && (
          <Svg width={s} height={s} viewBox="0 0 200 200">
            <Rect x="93" y="120" width="14" height="50" rx="5" fill="#8B5E3C" />
            <Ellipse cx="100" cy="105" rx="28" ry="34" fill="#2D7A4F" />
            <Ellipse cx="100" cy="98" rx="20" ry="24" fill="#4CAF78" />
            <Ellipse cx="100" cy="92" rx="12" ry="14" fill="#6DCF96" />
            <Ellipse cx="80" cy="115" rx="16" ry="18" fill="#2D7A4F" />
            <Ellipse cx="120" cy="112" rx="16" ry="18" fill="#2D7A4F" />
          </Svg>
        )}

        {stage === "growing" && (
          <Svg width={s} height={s} viewBox="0 0 200 200">
            <Rect x="91" y="110" width="18" height="60" rx="6" fill="#6B4423" />
            <Ellipse cx="100" cy="95" rx="40" ry="46" fill="#1A5C37" />
            <Ellipse cx="100" cy="88" rx="32" ry="37" fill="#2D7A4F" />
            <Ellipse cx="100" cy="80" rx="24" ry="28" fill="#4CAF78" />
            <Ellipse cx="100" cy="73" rx="16" ry="18" fill="#6DCF96" />
            <Ellipse cx="72" cy="105" rx="22" ry="25" fill="#2D7A4F" />
            <Ellipse cx="128" cy="102" rx="22" ry="25" fill="#2D7A4F" />
            <Ellipse cx="68" cy="122" rx="14" ry="16" fill="#1A5C37" />
            <Ellipse cx="132" cy="118" rx="14" ry="16" fill="#1A5C37" />
          </Svg>
        )}

        {(stage === "flourishing" || stage === "majestic") && (
          <Svg width={s} height={s} viewBox="0 0 200 200">
            <Path
              d="M95 170 Q97 145 100 130 Q103 145 105 170 Z"
              fill="#4A2F12"
            />
            <Rect x="88" y="100" width="24" height="72" rx="8" fill="#5C3D1E" />
            <Path
              d="M85 110 Q75 108 70 115 Q65 120 72 125 Q78 130 86 120 Z"
              fill="#5C3D1E"
            />
            <Path
              d="M115 107 Q125 105 130 112 Q135 117 128 122 Q122 127 114 117 Z"
              fill="#5C3D1E"
            />
            <Ellipse cx="100" cy="80" rx="55" ry="60" fill="#1A5C37" />
            <Ellipse cx="100" cy="72" rx="46" ry="50" fill="#2D7A4F" />
            <Ellipse cx="100" cy="64" rx="36" ry="40" fill="#4CAF78" />
            <Ellipse cx="100" cy="58" rx="26" ry="30" fill="#5DC98C" />
            <Ellipse cx="100" cy="53" rx="16" ry="18" fill="#6DCF96" />
            <Ellipse cx="58" cy="88" rx="28" ry="32" fill="#2D7A4F" />
            <Ellipse cx="142" cy="85" rx="28" ry="32" fill="#2D7A4F" />
            <Ellipse cx="50" cy="108" rx="20" ry="24" fill="#1A5C37" />
            <Ellipse cx="150" cy="104" rx="20" ry="24" fill="#1A5C37" />
            {stage === "majestic" && (
              <>
                <Circle cx="78" cy="62" r="8" fill="#FFD700" opacity={0.6} />
                <Circle cx="122" cy="58" r="6" fill="#FFD700" opacity={0.5} />
                <Circle cx="100" cy="40" r="7" fill="#FFD700" opacity={0.55} />
                <Circle cx="62" cy="80" r="5" fill="#FFD700" opacity={0.4} />
                <Circle cx="140" cy="76" r="5" fill="#FFD700" opacity={0.4} />
              </>
            )}
          </Svg>
        )}

        {stage === "wilting" && (
          <Svg width={s} height={s} viewBox="0 0 200 200">
            <Rect x="93" y="120" width="14" height="50" rx="5" fill="#8B5E3C" />
            <Ellipse cx="100" cy="105" rx="30" ry="35" fill="#8FB88F" />
            <Ellipse cx="100" cy="98" rx="22" ry="26" fill="#A8C8A0" />
            <Ellipse cx="78" cy="120" rx="18" ry="20" fill="#8FB88F" />
            <Ellipse cx="122" cy="117" rx="18" ry="20" fill="#8FB88F" />
            <Path
              d="M75 105 Q72 115 68 125"
              stroke="#8B5E3C"
              strokeWidth="2"
              fill="none"
            />
            <Ellipse cx="66" cy="127" rx="8" ry="5" fill="#C8D8C0" />
          </Svg>
        )}

        {stage === "monsoon" && (
          <Svg width={s} height={s} viewBox="0 0 200 200">
            <Rect x="93" y="120" width="14" height="50" rx="5" fill="#8B5E3C" />
            <Ellipse cx="100" cy="105" rx="35" ry="40" fill="#6A9E6A" opacity={0.8} />
            <Ellipse cx="100" cy="98" rx="26" ry="30" fill="#7DB87D" opacity={0.8} />
            <Path
              d="M70 90 Q65 95 68 102 Q71 108 74 100 Z"
              fill="#5A9A5A"
              opacity={0.9}
            />
            <Path
              d="M130 88 Q135 93 132 100 Q129 106 126 98 Z"
              fill="#5A9A5A"
              opacity={0.9}
            />
            <Path
              d="M80 80 L78 95"
              stroke="#6688AA"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Path
              d="M100 75 L98 90"
              stroke="#6688AA"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Path
              d="M120 78 L118 93"
              stroke="#6688AA"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Path
              d="M90 85 L88 100"
              stroke="#6688AA"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Path
              d="M110 82 L108 97"
              stroke="#6688AA"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </Svg>
        )}
      </Animated.View>

      {stage === "majestic" && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: s / 2,
              backgroundColor: "#FFD700",
              opacity: glowOpacity,
              transform: [{ scale: 1.05 }],
            },
          ]}
          pointerEvents="none"
        />
      )}
    </View>
  );
}

export { getTreeStage };
export type { TreeStage };
