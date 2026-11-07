import { Image } from 'expo-image';
import { Check } from 'lucide-react-native';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import Animated, {
  Extrapolation,
  FadeInDown,
  FadeInLeft,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';

import { duotone, type DuotoneName } from '@/components/icons/duotone';
import { img } from '@/theme/assets';
import { colors, fonts, palette, radius } from '@/theme/tokens';

import { haptic, PressableScale, Txt } from './primitives';

/* ------------------------------------------------------------------ */
/* Redy avatar + speech bubble ("redy text box" component)             */
/* ------------------------------------------------------------------ */

export function RedyBubble({ text }: { text: string }) {
  return (
    <View style={styles.bubbleRow}>
      <Animated.View entering={FadeInLeft.springify().damping(14)} style={styles.avatar}>
        <Image source={img.avatarRedy} style={{ width: 50, height: 50 }} contentFit="contain" />
      </Animated.View>
      <Animated.View entering={FadeInLeft.delay(120).springify().damping(16)} style={styles.bubble}>
        <View style={styles.tail} />
        <Txt v="displaySm" style={{ fontFamily: fonts.displaySemi, lineHeight: 26 }}>
          {text}
        </Txt>
      </Animated.View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Choice card — single (radio-like) or multi (check circle)           */
/* ------------------------------------------------------------------ */

export function ChoiceCard({
  label,
  icon,
  selected,
  onPress,
  multi,
  index = 0,
}: {
  label: string;
  icon?: DuotoneName;
  selected: boolean;
  onPress: () => void;
  multi?: boolean;
  index?: number;
}) {
  const sel = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    sel.set(withTiming(selected ? 1 : 0, { duration: 220 }));
  }, [selected, sel]);
  const a = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(sel.value, [0, 1], [palette.white, palette.leaf100]),
    borderColor: interpolateColor(sel.value, [0, 1], ['rgba(69,180,65,0)', palette.leaf500]),
  }));
  return (
    <Animated.View
      entering={FadeInDown.delay(80 + index * 60)
        .springify()
        .damping(16)}>
      <PressableScale
        onPress={() => {
          haptic.select();
          onPress();
        }}
        hapticStyle="none"
        scaleTo={0.97}
        accessibilityRole={multi ? 'checkbox' : 'radio'}
        accessibilityState={{ checked: selected }}>
        <Animated.View style={[styles.card, a]}>
          {icon && <SvgXml xml={duotone[icon]} width={24} height={24} />}
          <Txt v="textLgMedium" style={{ flex: 1 }}>
            {label}
          </Txt>
          {multi && <CheckCircle on={selected} />}
        </Animated.View>
      </PressableScale>
    </Animated.View>
  );
}

export function CheckCircle({ on, size = 22 }: { on: boolean; size?: number }) {
  const s = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    s.set(on ? withSpring(1, { damping: 9, stiffness: 260 }) : withTiming(0, { duration: 150 }));
  }, [on, s]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }], opacity: s.value }));
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size,
        borderWidth: 1.5,
        borderColor: on ? palette.leaf500 : palette.gray400,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: size, backgroundColor: palette.leaf500, alignItems: 'center', justifyContent: 'center' },
          a,
        ]}>
        <Check size={size * 0.6} color="#fff" strokeWidth={3} />
      </Animated.View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Chip toggle (allergies)                                             */
/* ------------------------------------------------------------------ */

export function Chip({
  label,
  on,
  onPress,
  index = 0,
}: {
  label: string | ReactNode;
  on: boolean;
  onPress: () => void;
  index?: number;
}) {
  const sel = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    sel.set(withTiming(on ? 1 : 0, { duration: 200 }));
  }, [on, sel]);
  const a = useAnimatedStyle(() => ({
    borderColor: interpolateColor(sel.value, [0, 1], ['rgba(246,87,55,0)', palette.tomato500]),
  }));
  return (
    <Animated.View
      entering={FadeInDown.delay(60 + index * 35)
        .springify()
        .damping(15)}>
      <PressableScale onPress={onPress} hapticStyle="select" scaleTo={0.92}>
        <Animated.View style={[styles.chip, a]}>
          {typeof label === 'string' ? <Txt v="textLgMedium">{label}</Txt> : label}
        </Animated.View>
      </PressableScale>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/* Wheel picker — snapping list, centre item grows (iOS-picker feel)   */
/* ------------------------------------------------------------------ */

function WheelItem({
  label,
  index,
  y,
  itemH,
  big,
  small,
}: {
  label: string;
  index: number;
  y: SharedValue<number>;
  itemH: number;
  big: number;
  small: number;
}) {
  const a = useAnimatedStyle(() => {
    const d = Math.abs(y.value / itemH - index);
    return {
      opacity: interpolate(d, [0, 1, 2.6], [1, 0.9, 0.25], Extrapolation.CLAMP),
      transform: [{ scale: interpolate(d, [0, 1], [1, small / big], Extrapolation.CLAMP) }],
    };
  });
  const color = useDerivedValue(() => (Math.abs(y.value / itemH - index) < 0.5 ? 1 : 0));
  const c = useAnimatedStyle(() => ({ color: color.value ? palette.gray950 : palette.gray400 }));
  return (
    <Animated.View style={[{ height: itemH, alignItems: 'center', justifyContent: 'center' }, a]}>
      <Animated.Text
        selectable={false}
        allowFontScaling={false}
        style={[{ fontFamily: fonts.displayBold, fontSize: big, lineHeight: big * 1.1 }, c]}>
        {label}
      </Animated.Text>
    </Animated.View>
  );
}

export function WheelPicker({
  values,
  value,
  onChange,
  itemH = 64,
  visible = 5,
  big = 56,
  small = 32,
  format = (n: number) => String(n),
  unit,
}: {
  values: number[];
  value: number;
  onChange: (v: number) => void;
  itemH?: number;
  visible?: number;
  big?: number;
  small?: number;
  format?: (n: number) => string;
  unit?: string;
}) {
  const ref = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const startIndex = Math.max(0, values.indexOf(value));
  const y = useSharedValue(startIndex * itemH);
  const last = useRef(startIndex);
  const pad = ((visible - 1) / 2) * itemH;

  const onScroll = useAnimatedScrollHandler((e) => {
    y.set(e.contentOffset.y);
  });

  useEffect(() => {
    const t = setTimeout(() => ref.current?.scrollTo({ y: startIndex * itemH, animated: false }), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.max(0, Math.min(values.length - 1, Math.round(e.nativeEvent.contentOffset.y / itemH)));
    if (i !== last.current) {
      last.current = i;
      haptic.select();
      onChange(values[i]);
    }
  };

  const items = useMemo(() => values.map(format), [values, format]);

  return (
    <View
      style={[{ height: itemH * visible, flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' }, noSelect]}>
      <Animated.ScrollView
        ref={ref as never}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemH}
        decelerationRate="fast"
        onMomentumScrollEnd={settle}
        onScrollEndDrag={settle}
        style={{ height: itemH * visible, flex: 1 }}
        contentContainerStyle={{ paddingVertical: pad }}>
        {items.map((label, i) => (
          <PressableScale
            key={label + i}
            hapticStyle="none"
            scaleTo={1}
            onPress={() => {
              ref.current?.scrollTo({ y: i * itemH, animated: true });
              last.current = i;
              haptic.select();
              onChange(values[i]);
            }}>
            <WheelItem label={label} index={i} y={y} itemH={itemH} big={big} small={small} />
          </PressableScale>
        ))}
      </Animated.ScrollView>
      {unit && (
        <View pointerEvents="none" style={{ position: 'absolute', right: 34 }}>
          <Txt v="displayMd">{unit}</Txt>
        </View>
      )}
    </View>
  );
}

const noSelect = { userSelect: 'none' } as object;

const styles = StyleSheet.create({
  bubbleRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 18, gap: 8, minHeight: 112 },
  avatar: { width: 50, height: 50 },
  bubble: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginLeft: 13,
  },
  tail: {
    position: 'absolute',
    left: -9,
    top: '50%',
    marginTop: -10,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 12,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: colors.bgSurface,
  },
  card: {
    height: 70,
    marginHorizontal: 24,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  chip: {
    height: 56,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
