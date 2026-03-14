import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Colors from "@/constants/colors";

type Props = {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  leftLabel?: string;
  rightLabel?: string;
  formatValue?: (v: number) => string;
  color?: string;
  showTicks?: boolean;
};

export function CustomSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
  leftLabel,
  rightLabel,
  formatValue,
  color = Colors.light.tint,
  showTicks = false,
}: Props) {
  const [trackWidth, setTrackWidth] = useState(300);
  const thumbAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const thumbPos = ((value - min) / (max - min)) * (trackWidth - 28);

  const snapToStep = useCallback(
    (rawX: number) => {
      const clamped = Math.max(0, Math.min(rawX, trackWidth - 28));
      const ratio = clamped / (trackWidth - 28);
      const rawVal = min + ratio * (max - min);
      const stepped = Math.round(rawVal / step) * step;
      return Math.max(min, Math.min(max, stepped));
    },
    [trackWidth, min, max, step]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        Animated.spring(scaleAnim, {
          toValue: 1.35,
          useNativeDriver: false,
          tension: 200,
          friction: 6,
        }).start();
      },
      onPanResponderMove: (_, gesture) => {
        const ratio = Math.max(
          0,
          Math.min(gesture.moveX - 24 - 14, trackWidth - 28)
        );
        const rawVal = min + (ratio / (trackWidth - 28)) * (max - min);
        const stepped = Math.round(rawVal / step) * step;
        const clamped = Math.max(min, Math.min(max, stepped));
        onChange(clamped);
      },
      onPanResponderRelease: () => {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: false,
          tension: 200,
          friction: 6,
        }).start();
      },
    })
  ).current;

  const fillWidth = trackWidth > 0 ? ((value - min) / (max - min)) * (trackWidth - 28) + 14 : 0;
  const totalTicks = (max - min) / step + 1;

  return (
    <View style={styles.wrapper}>
      <View
        style={styles.track}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        <View style={[styles.trackBg]} />
        <View
          style={[
            styles.trackFill,
            { width: fillWidth, backgroundColor: color },
          ]}
        />

        {showTicks &&
          Array.from({ length: Math.min(totalTicks, 11) }).map((_, i) => {
            const tickVal = min + (i / (Math.min(totalTicks, 11) - 1)) * (max - min);
            const tickX = (i / (Math.min(totalTicks, 11) - 1)) * (trackWidth - 28) + 14;
            const active = value >= tickVal;
            return (
              <View
                key={i}
                style={[
                  styles.tick,
                  { left: tickX - 1 },
                  active && { backgroundColor: "#fff" },
                ]}
              />
            );
          })}

        <Animated.View
          style={[
            styles.thumb,
            {
              left: thumbPos,
              backgroundColor: color,
              transform: [{ scale: scaleAnim }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <Text style={styles.thumbValue}>
            {formatValue ? formatValue(value) : value}
          </Text>
        </Animated.View>
      </View>

      {(leftLabel || rightLabel) && (
        <View style={styles.labels}>
          {leftLabel && <Text style={styles.labelText}>{leftLabel}</Text>}
          {rightLabel && <Text style={styles.labelText}>{rightLabel}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  track: {
    height: 36,
    justifyContent: "center",
    position: "relative",
  },
  trackBg: {
    position: "absolute",
    left: 14,
    right: 14,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.border,
  },
  trackFill: {
    position: "absolute",
    left: 0,
    height: 6,
    borderRadius: 3,
  },
  tick: {
    position: "absolute",
    width: 2,
    height: 8,
    borderRadius: 1,
    backgroundColor: Colors.light.border,
    top: 14,
  },
  thumb: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
    top: 4,
  },
  thumbValue: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  labelText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
});
