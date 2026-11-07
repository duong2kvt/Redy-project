import * as Haptics from 'expo-haptics';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, type as typeScale } from '@/theme/tokens';

/* ------------------------------------------------------------------ */
/* Insets: real device insets on native, simulated iPhone on web frame */
/* ------------------------------------------------------------------ */

export const FrameInsetsContext = createContext<{ top: number; bottom: number } | null>(null);

export function useInsets() {
  const frame = useContext(FrameInsetsContext);
  const real = useSafeAreaInsets();
  return frame ?? { top: Math.max(real.top, 20), bottom: Math.max(real.bottom, 12) };
}

/* ------------------------------------------------------------------ */
/* Typography                                                          */
/* ------------------------------------------------------------------ */

export type TxtVariant = keyof typeof typeScale;

export function Txt({
  v = 'textLg',
  color = colors.contentStrong,
  center,
  style,
  ...rest
}: TextProps & { v?: TxtVariant; color?: string; center?: boolean; style?: StyleProp<TextStyle> }) {
  return (
    <Text
      allowFontScaling={false}
      {...rest}
      style={[typeScale[v], { color }, center && { textAlign: 'center' }, style]}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Haptics                                                             */
/* ------------------------------------------------------------------ */

export const haptic = {
  light: () => Platform.OS !== 'web' && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Platform.OS !== 'web' && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  select: () => Platform.OS !== 'web' && Haptics.selectionAsync(),
  success: () => Platform.OS !== 'web' && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
};

/* ------------------------------------------------------------------ */
/* PressableScale — springy press feedback used everywhere             */
/* ------------------------------------------------------------------ */

const APressable = Animated.createAnimatedComponent(Pressable);

export function PressableScale({
  children,
  style,
  scaleTo = 0.96,
  onPress,
  hapticStyle = 'light',
  disabled,
  ...rest
}: PressableProps & {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  hapticStyle?: 'light' | 'medium' | 'select' | 'none';
  children?: ReactNode;
}) {
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <APressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        s.set(withSpring(scaleTo, { damping: 20, stiffness: 400 }));
        rest.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        s.set(withSpring(1, { damping: 12, stiffness: 300 }));
        rest.onPressOut?.(e);
      }}
      onPress={(e) => {
        if (hapticStyle !== 'none') haptic[hapticStyle]();
        onPress?.(e);
      }}
      style={[style, a]}>
      {children}
    </APressable>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  style,
  height = 56,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost' | 'dark';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  height?: number;
}) {
  const bg = variant === 'primary' ? colors.bgPrimary : variant === 'dark' ? colors.bgInk : 'transparent';
  const fg = variant === 'ghost' ? colors.contentStrong : colors.contentInverse;
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      hapticStyle="medium"
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.btn,
        { backgroundColor: bg, height, opacity: disabled ? 0.45 : 1 },
        variant === 'ghost' && { height: 24 },
        style,
      ]}>
      <Txt v="buttonMd" color={fg}>
        {label}
      </Txt>
    </PressableScale>
  );
}

/* ------------------------------------------------------------------ */
/* Animated progress bar                                               */
/* ------------------------------------------------------------------ */

export function ProgressBar({
  value,
  color = colors.contentPositive,
  track = colors.borderLight,
  height = 4,
  width,
  duration = 500,
  delay = 0,
  from,
  style,
}: {
  value: number; // 0..1
  color?: string;
  track?: string;
  height?: number;
  width?: number;
  duration?: number;
  delay?: number;
  from?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const p = useSharedValue(from ?? value);
  useEffect(() => {
    p.set(withDelay(delay, withTiming(value, { duration, easing: Easing.out(Easing.cubic) })));
  }, [value, delay, duration, p]);
  const a = useAnimatedStyle(() => ({ width: `${Math.max(0, Math.min(1, p.value)) * 100}%` }));
  return (
    <View style={[{ height, borderRadius: height, backgroundColor: track, overflow: 'hidden', width }, style]}>
      <Animated.View style={[{ height, borderRadius: height, backgroundColor: color }, a]} />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Motion helpers                                                      */
/* ------------------------------------------------------------------ */

/** Gentle infinite bob — used for floating icons and idle mascots. */
export function Float({
  children,
  amplitude = 6,
  duration = 1600,
  delay = 0,
  rotate = 0,
  style,
}: {
  children: ReactNode;
  amplitude?: number;
  duration?: number;
  delay?: number;
  rotate?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(delay, withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true)));
  }, [delay, duration, t]);
  const a = useAnimatedStyle(() => ({
    transform: [{ translateY: -amplitude * t.value }, { rotate: `${rotate * (t.value - 0.5) * 2}deg` }],
  }));
  return <Animated.View style={[style, a]}>{children}</Animated.View>;
}

/** Idle "breathing" squash & stretch for mascots. */
export function Breathe({
  children,
  style,
  intensity = 0.025,
  duration = 1400,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  duration?: number;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }), -1, true));
  }, [duration, t]);
  const a = useAnimatedStyle(() => ({
    transform: [{ translateY: 0 }, { scaleY: 1 + intensity * t.value }, { scaleX: 1 - intensity * 0.5 * t.value }],
    transformOrigin: 'bottom',
  }));
  return <Animated.View style={[style, a]}>{children}</Animated.View>;
}

/** Pop-in with overshoot. */
export function PopIn({
  children,
  delay = 0,
  style,
  from = 0.4,
}: {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
  from?: number;
}) {
  const s = useSharedValue(from);
  const o = useSharedValue(0);
  useEffect(() => {
    s.set(withDelay(delay, withSpring(1, { damping: 10, stiffness: 160 })));
    o.set(withDelay(delay, withTiming(1, { duration: 200 })));
  }, [delay, o, s]);
  const a = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ scale: s.value }] }));
  return <Animated.View style={[style, a]}>{children}</Animated.View>;
}

/** Wiggle / wave loop (e.g. a waving paw or a ringing badge). */
export function Wiggle({
  children,
  deg = 6,
  style,
  every = 2400,
}: {
  children: ReactNode;
  deg?: number;
  style?: StyleProp<ViewStyle>;
  every?: number;
}) {
  const r = useSharedValue(0);
  useEffect(() => {
    r.set(
      withRepeat(
        withSequence(
          withTiming(deg, { duration: 120 }),
          withTiming(-deg, { duration: 160 }),
          withTiming(deg * 0.6, { duration: 140 }),
          withTiming(0, { duration: 140 }),
          withTiming(0, { duration: every }),
        ),
        -1,
      ),
    );
  }, [deg, every, r]);
  const a = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }));
  return <Animated.View style={[style, a]}>{children}</Animated.View>;
}

/** Count-up number (JS-driven so it works for any text formatting). */
export function useCountUp(target: number, duration = 900, delay = 0) {
  const [v, setV] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    let start: number | null = null;
    const from = 0;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, Math.max(0, (t - start - delay) / duration));
      const eased = 1 - Math.pow(1 - p, 3);
      setV(from + (target - from) * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration, delay]);
  return v;
}

export const fmt = (n: number, decimals = 0) =>
  n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
});
