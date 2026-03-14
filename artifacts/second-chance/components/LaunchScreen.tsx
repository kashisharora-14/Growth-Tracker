import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Props = {
  onFinish: () => void;
};

export function LaunchScreen({ onFinish }: Props) {
  const [displayPct, setDisplayPct] = useState(0);
  const imageLoaded = useRef(false);
  const barValue = useSharedValue(0);
  const barPhase = useRef<"filling" | "creeping" | "finishing">("filling");

  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const logoY = useSharedValue(20);
  const barOpacity = useSharedValue(0);
  const screenOpacity = useSharedValue(1);

  const doFinish = useCallback(() => {
    screenOpacity.value = withTiming(0, { duration: 350, easing: Easing.in(Easing.cubic) }, (done) => {
      if (done) runOnJS(onFinish)();
    });
  }, []);

  const finishBar = useCallback(() => {
    barPhase.current = "finishing";
    cancelAnimation(barValue);
    barValue.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }, (done) => {
      if (done) {
        runOnJS(setDisplayPct)(100);
        setTimeout(() => runOnJS(doFinish)(), 500);
      }
    });
  }, []);

  const startCreeping = useCallback(() => {
    barPhase.current = "creeping";
    barValue.value = withTiming(0.92, {
      duration: 12000,
      easing: Easing.out(Easing.quad),
    });
  }, []);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    logoScale.value = withSpring(1, { damping: 12, stiffness: 120 });
    logoY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, []);

  useEffect(() => {
    let frame: number;
    const tick = () => {
      const current = barValue.value;
      setDisplayPct(Math.min(Math.floor(current * 100), 99));
      if (barPhase.current !== "finishing") {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleImageLoad = useCallback(() => {
    imageLoaded.current = true;
    barOpacity.value = withTiming(1, { duration: 300 });
    barPhase.current = "filling";
    barValue.value = withTiming(0.75, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    }, (done) => {
      if (done) runOnJS(startCreeping)();
    });
    setTimeout(() => {
      finishBar();
    }, 1000);
  }, [finishBar, startCreeping]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }, { translateY: logoY.value }],
  }));

  const barFillStyle = useAnimatedStyle(() => ({
    width: `${barValue.value * 100}%` as any,
  }));

  const barContainerStyle = useAnimatedStyle(() => ({
    opacity: barOpacity.value,
  }));

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      <View style={styles.inner}>
        <Animated.View style={[styles.logoWrap, logoStyle]}>
          <Image
            source={require("@/assets/images/brainbloom-logo.png")}
            style={styles.logo}
            resizeMode="contain"
            onLoad={handleImageLoad}
          />
        </Animated.View>

        <Animated.View style={[styles.barSection, barContainerStyle]}>
          <View style={styles.barTrack}>
            <Animated.View style={[styles.barFill, barFillStyle]} />
            <Animated.View style={[styles.barGlow, barFillStyle]} />
          </View>
          <View style={styles.barLabelRow}>
            <Text style={styles.barLabel}>Loading your journey</Text>
            <Text style={styles.barPct}>{displayPct}%</Text>
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const BAR_WIDTH = Math.min(SCREEN_WIDTH * 0.72, 300);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  inner: {
    alignItems: "center",
    gap: 0,
  },
  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
  },
  logo: {
    width: 260,
    height: 260,
  },
  barSection: {
    width: BAR_WIDTH,
    gap: 10,
  },
  barTrack: {
    height: 7,
    borderRadius: 8,
    backgroundColor: "#EEF0F2",
    overflow: "hidden",
    position: "relative",
  },
  barFill: {
    height: "100%",
    borderRadius: 8,
    backgroundColor: "#5BAD80",
    position: "absolute",
    left: 0,
    top: 0,
  },
  barGlow: {
    height: "100%",
    borderRadius: 8,
    backgroundColor: "rgba(91,173,128,0.25)",
    position: "absolute",
    left: 0,
    top: 0,
    transform: [{ scaleY: 3 }],
  },
  barLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  barLabel: {
    fontSize: 12,
    color: "#A0AAB8",
    fontFamily: Platform.OS === "web" ? "system-ui" : "Inter_400Regular",
  },
  barPct: {
    fontSize: 12,
    fontFamily: Platform.OS === "web" ? "system-ui" : "Inter_700Bold",
    fontWeight: "700",
    color: "#5BAD80",
  },
});
