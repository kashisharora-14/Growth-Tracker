import React, { useEffect, useState } from "react";
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
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Props = {
  onFinish: () => void;
};

export function LaunchScreen({ onFinish }: Props) {
  const [displayPct, setDisplayPct] = useState(0);

  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const logoY = useSharedValue(20);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(14);
  const barWidth = useSharedValue(0);
  const barOpacity = useSharedValue(0);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    logoOpacity.value = withDelay(150, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    logoScale.value = withDelay(150, withSpring(1, { damping: 12, stiffness: 120 }));
    logoY.value = withDelay(150, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));

    titleOpacity.value = withDelay(600, withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) }));
    titleY.value = withDelay(600, withTiming(0, { duration: 450, easing: Easing.out(Easing.cubic) }));

    barOpacity.value = withDelay(900, withTiming(1, { duration: 300 }));

    barWidth.value = withDelay(
      950,
      withTiming(1, {
        duration: 2600,
        easing: Easing.bezier(0.2, 0.0, 0.4, 1.0),
      })
    );

    screenOpacity.value = withDelay(
      3800,
      withTiming(0, { duration: 350, easing: Easing.in(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(onFinish)();
      })
    );
  }, []);

  useEffect(() => {
    let start: number | null = null;
    let frame: number;
    const duration = 2600;
    const delay = 950;
    let started = false;

    const tick = (ts: number) => {
      if (!started) {
        if (!start) start = ts;
        if (ts - start < delay) {
          frame = requestAnimationFrame(tick);
          return;
        }
        started = true;
        start = ts;
      }
      const elapsed = ts - start!;
      const rawPct = Math.min(elapsed / duration, 1);
      const eased = rawPct < 0.5
        ? 2 * rawPct * rawPct
        : 1 - Math.pow(-2 * rawPct + 2, 2) / 2;
      setDisplayPct(Math.floor(eased * 100));
      if (rawPct < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setDisplayPct(100);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }, { translateY: logoY.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const barFillStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value * 100}%` as any,
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
          />
        </Animated.View>

        <Animated.View style={[styles.titleRow, titleStyle]}>
          <Text style={styles.titleBrain}>Brain</Text>
          <Text style={styles.titleBloom}>Bloom</Text>
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
    marginBottom: 2,
  },
  logo: {
    width: 200,
    height: 200,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 48,
  },
  titleBrain: {
    fontSize: 38,
    fontFamily: Platform.OS === "web" ? "system-ui" : "Inter_700Bold",
    fontWeight: "700",
    color: "#78C8F0",
    letterSpacing: -0.5,
  },
  titleBloom: {
    fontSize: 38,
    fontFamily: Platform.OS === "web" ? "system-ui" : "Inter_700Bold",
    fontWeight: "700",
    color: "#78C850",
    letterSpacing: -0.5,
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
