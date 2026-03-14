import { Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Colors from "@/constants/colors";

type Props = {
  label: string;
  onComplete: () => void;
  color?: string;
};

const THUMB_SIZE = 56;
const TRACK_PADDING = 4;

export function SlideButton({
  label,
  onComplete,
  color = Colors.light.tint,
}: Props) {
  const [trackWidth, setTrackWidth] = useState(300);
  const [completed, setCompleted] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const maxSlide = trackWidth - THUMB_SIZE - TRACK_PADDING * 2;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        const clamped = Math.max(0, Math.min(gesture.dx, maxSlide));
        translateX.setValue(clamped);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx >= maxSlide * 0.85) {
          Animated.timing(translateX, {
            toValue: maxSlide,
            duration: 150,
            useNativeDriver: false,
          }).start(() => {
            setCompleted(true);
            onComplete();
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false,
            tension: 80,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const bgOpacity = translateX.interpolate({
    inputRange: [0, maxSlide],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const labelOpacity = translateX.interpolate({
    inputRange: [0, maxSlide * 0.4],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const arrowOpacity = translateX.interpolate({
    inputRange: [0, maxSlide * 0.3],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <View
      style={[styles.track, { backgroundColor: `${color}20` }]}
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.trackFill,
          { backgroundColor: color, opacity: bgOpacity },
        ]}
      />

      <Animated.Text style={[styles.label, { opacity: labelOpacity, color }]}>
        {completed ? "Starting your journey..." : label}
      </Animated.Text>

      <Animated.View
        style={[
          styles.thumb,
          {
            backgroundColor: color,
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {completed ? (
          <Feather name="check" size={22} color="#fff" />
        ) : (
          <Animated.View style={{ opacity: arrowOpacity }}>
            <Feather name="chevrons-right" size={22} color="#fff" />
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: THUMB_SIZE + TRACK_PADDING * 2,
    borderRadius: (THUMB_SIZE + TRACK_PADDING * 2) / 2,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    paddingHorizontal: TRACK_PADDING,
  },
  trackFill: {
    borderRadius: (THUMB_SIZE + TRACK_PADDING * 2) / 2,
  },
  label: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    position: "absolute",
    zIndex: 1,
  },
  thumb: {
    position: "absolute",
    left: TRACK_PADDING,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
});
