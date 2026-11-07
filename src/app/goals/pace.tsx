import { router } from 'expo-router';
import { CircleCheck } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { QuestionScreen } from '@/components/question-screen';
import { haptic, Txt } from '@/components/ui/primitives';
import { useApp } from '@/store/app-store';
import { palette, radius } from '@/theme/tokens';

const TRACK = 284;
const THUMB = 28;

// piecewise mapping: left half 0.1→0.5 kg, right half 0.5→1.5 kg
const toPace = (p: number) => {
  'worklet';
  const v = p <= 0.5 ? 0.1 + (p / 0.5) * 0.4 : 0.5 + ((p - 0.5) / 0.5) * 1.0;
  return Math.round(v * 10) / 10;
};
const toPos = (v: number) => (v <= 0.5 ? ((v - 0.1) / 0.4) * 0.5 : 0.5 + ((v - 0.5) / 1.0) * 0.5);

/** Frames "taget weight" (pace) 5004:11002 → 5004:11039. */
export default function Pace() {
  const { pace, weight, targetWeight, set } = useApp();
  const [value, setValue] = useState(pace);
  const pos = useSharedValue(toPos(pace) * TRACK);
  const start = useSharedValue(0);
  const last = useSharedValue(pace);

  const update = (v: number) => {
    setValue(v);
    haptic.select();
  };

  const pan = Gesture.Pan()
    .onBegin(() => {
      start.set(pos.value);
    })
    .onUpdate((e) => {
      const nx = Math.max(0, Math.min(TRACK, start.value + e.translationX));
      pos.set(nx);
      const v = toPace(nx / TRACK);
      if (v !== last.value) {
        last.set(v);
        runOnJS(update)(v);
      }
    })
    .onEnd(() => {
      // snap to "Normal" if close
      if (Math.abs(pos.value - TRACK / 2) < 14) {
        pos.set(withSpring(TRACK / 2, { damping: 14 }));
        last.set(0.5);
        runOnJS(update)(0.5);
      }
    });

  const tap = Gesture.Tap().onEnd((e) => {
    const nx = Math.max(0, Math.min(TRACK, e.x - THUMB / 2));
    pos.set(withSpring(nx, { damping: 15 }));
    const v = toPace(nx / TRACK);
    last.set(v);
    runOnJS(update)(v);
  });

  const fill = useAnimatedStyle(() => ({ width: pos.value + THUMB / 2 }));
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: pos.value }] }));

  const lose = Math.max(0, weight - targetWeight);
  const weeks = lose > 0 ? Math.ceil(lose / value) : 0;
  const date = new Date(2026, 10, 7 + weeks * 7);
  const dateLabel = `${date.getDate()} ${date.toLocaleString('en-US', { month: 'long' })}`;
  const recommended = value >= 0.4 && value <= 0.7;

  useEffect(() => {
    set({ pace: value });
  }, [value, set]);

  return (
    <QuestionScreen
      progress={0.9}
      question="How fast you want to achieve your goal?"
      onNext={() => router.push('/habits')}>
      <View style={{ alignItems: 'center', marginTop: 20 }}>
        <Txt v="textLg" color={palette.gray400}>
          Weight loss per week
        </Txt>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Txt v="display2xl" style={{ fontSize: 56 }}>
            {value.toFixed(1)}
          </Txt>
          <Txt v="displayMd" color={palette.gray400}>
            kg
          </Txt>
        </View>
      </View>

      <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
        <View style={styles.sliderArea}>
          <View style={styles.track}>
            <Animated.View style={[styles.fill, fill]} />
          </View>
          <Animated.View style={[styles.thumb, thumb]}>
            {recommended && (
              <Animated.View entering={FadeIn.springify()} exiting={FadeOut} style={styles.badge}>
                <Txt v="label" color="#fff" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                  Recommended
                </Txt>
                <View style={styles.badgeTail} />
              </Animated.View>
            )}
          </Animated.View>
        </View>
      </GestureDetector>
      <View style={styles.labels}>
        <Txt v="textLgSemi" color={value < 0.4 ? palette.gray950 : palette.gray600}>
          Slow
        </Txt>
        <Txt v="textLgSemi" color={recommended ? palette.gray950 : palette.gray600}>
          Normal
        </Txt>
        <Txt v="textLg" color={value > 0.7 ? palette.gray950 : palette.gray600}>
          Fast
        </Txt>
      </View>

      <View style={styles.info}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <CircleCheck size={22} color="#fff" fill={palette.leaf500} />
          <Txt v="textLgSemi">Reach your goal by {dateLabel}</Txt>
        </View>
        <Txt v="textSm" color={palette.gray600} style={{ marginLeft: 30, marginTop: 2 }}>
          {value > 0.7
            ? 'Requires a more structured calorie deficit and consistent activity.'
            : 'A balanced pace that is easy to keep up with every day.'}
        </Txt>
      </View>
      <Txt v="textLg" color={palette.gray600} center style={{ marginTop: 16, textDecorationLine: 'underline' }}>
        Source of recommendations
      </Txt>
    </QuestionScreen>
  );
}

const styles = StyleSheet.create({
  sliderArea: { marginTop: 56, marginHorizontal: 45, height: 40, justifyContent: 'center' },
  track: { height: 10, borderRadius: 10, backgroundColor: palette.gray300, overflow: 'hidden' },
  fill: { height: 10, backgroundColor: palette.leaf500, borderRadius: 10 },
  thumb: {
    position: 'absolute',
    left: 0,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: palette.leaf500,
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: 38,
    width: 106,
    height: 28,
    borderRadius: 6,
    backgroundColor: palette.leaf500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTail: {
    position: 'absolute',
    bottom: -7,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: palette.leaf500,
  },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 42, marginTop: 6 },
  info: {
    marginHorizontal: 24,
    marginTop: 80,
    backgroundColor: '#ECE8E6',
    borderRadius: radius.md,
    padding: 20,
    paddingVertical: 16,
  },
});
