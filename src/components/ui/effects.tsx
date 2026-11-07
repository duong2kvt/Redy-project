import { useEffect } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { palette } from '@/theme/tokens';

/** Soft radial glow (Figma "Ellipse 58-64" stacks). */
export function RadialGlow({
  size,
  color = '#FFC220',
  opacity = 0.9,
  style,
}: {
  size: number;
  color?: string;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View pointerEvents="none" style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="g" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={opacity} />
            <Stop offset="0.45" stopColor={color} stopOpacity={opacity * 0.45} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#g)" />
      </Svg>
    </View>
  );
}

const ACircle = Animated.createAnimatedComponent(Circle);
const APath = Animated.createAnimatedComponent(Path);

/** Circular progress ring with animated sweep. */
export function Ring({
  size,
  stroke,
  value,
  color = palette.leaf500,
  track = palette.gray200,
  duration = 900,
  delay = 0,
  children,
}: {
  size: number;
  stroke: number;
  value: number;
  color?: string;
  track?: string;
  duration?: number;
  delay?: number;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = useSharedValue(0);
  useEffect(() => {
    p.set(withDelay(delay, withTiming(value, { duration, easing: Easing.out(Easing.cubic) })));
  }, [value, delay, duration, p]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: c * (1 - p.value) }));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <ACircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          animatedProps={props}
        />
      </Svg>
      {children}
    </View>
  );
}

/** Semi-circular gauge (Meal tracking / Nutrition score). 0..1 */
export function Gauge({
  width,
  stroke,
  value,
  color,
  track,
  duration = 1100,
  delay = 0,
}: {
  width: number;
  stroke: number;
  value: number;
  color: string;
  track: string;
  duration?: number;
  delay?: number;
}) {
  const r = (width - stroke) / 2;
  const h = r + stroke / 2 + 4;
  // arc spanning ~200° like the design (slightly past the horizontal)
  const start = Math.PI * 1.08;
  const end = Math.PI * -0.08;
  const cx = width / 2;
  const cy = r + stroke / 2;
  const pt = (a: number) => `${cx + r * Math.cos(a)} ${cy - r * Math.sin(a)}`;
  const d = `M ${pt(start)} A ${r} ${r} 0 1 1 ${pt(end)}`;
  const len = r * (start - end);
  const p = useSharedValue(0);
  useEffect(() => {
    p.set(withDelay(delay, withTiming(value, { duration, easing: Easing.out(Easing.cubic) })));
  }, [value, delay, duration, p]);
  const props = useAnimatedProps(() => ({
    strokeDashoffset: len * (1 - Math.max(0.0001, p.value)),
    strokeOpacity: p.value < 0.003 ? 0 : 1,
  }));
  return (
    <Svg width={width} height={h + stroke}>
      <Path d={d} stroke={track} strokeWidth={stroke} fill="none" strokeLinecap="round" />
      <APath
        d={d}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${len} ${len}`}
        animatedProps={props}
      />
    </Svg>
  );
}
