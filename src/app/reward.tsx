import { Image } from 'expo-image';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { Button, PressableScale, ProgressBar, Txt, haptic, useInsets } from '@/components/ui/primitives';
import { useApp } from '@/store/app-store';
import { img } from '@/theme/assets';
import { colors, palette } from '@/theme/tokens';

/**
 * Reward sequence from the prototype:
 * "Reeward" —0.8s→ "reward ->" (bar fills, 600ms) —0.6s→ "reward +" (+3 coins, 400ms)
 * —0.8s→ "reward +" with Next (300ms).
 */
export default function Reward() {
  const insets = useInsets();
  const complete = useApp((s) => s.completeFirstMealReward);
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 800);
    const t2 = setTimeout(
      () => {
        setStage(2);
        haptic.success();
        complete();
      },
      800 + 600 + 600,
    );
    const t3 = setTimeout(() => setStage(3), 800 + 600 + 600 + 400 + 800);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [complete]);

  const spin = useSharedValue(0);
  const shine = useSharedValue(0);
  useEffect(() => {
    spin.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 0 }),
          withDelay(1200, withTiming(0, { duration: 0 })),
        ),
        -1,
      ),
    );
    shine.set(
      withRepeat(withSequence(withTiming(1, { duration: 1200 }), withDelay(800, withTiming(0, { duration: 0 }))), -1),
    );
  }, [shine, spin]);
  const coin = useAnimatedStyle(() => ({ transform: [{ perspective: 400 }, { rotateY: `${spin.value * 360}deg` }] }));
  const badge = useAnimatedStyle(() => ({
    transform: [{ rotate: `${Math.sin(shine.value * Math.PI * 4) * 4 * (1 - shine.value)}deg` }],
  }));

  return (
    <Animated.View entering={FadeIn.duration(300)} style={[styles.root, { paddingTop: insets.top }]}>
      <View style={{ height: 58, justifyContent: 'center', paddingHorizontal: 18 }}>
        <PressableScale onPress={() => router.replace('/home')} hitSlop={12} accessibilityLabel="Close">
          <X size={24} color={palette.gray950} />
        </PressableScale>
      </View>

      <View style={{ height: 200, alignItems: 'center', justifyContent: 'center' }}>
        {stage === 2 && (
          <Animated.View
            entering={ZoomIn.springify().damping(8).stiffness(160)}
            exiting={FadeOut.duration(250)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            <Txt v="display2xl" style={{ fontSize: 64, lineHeight: 70 }}>
              +3
            </Txt>
            <Animated.View style={coin}>
              <Image source={img.coinBig} style={{ width: 80, height: 80 }} />
            </Animated.View>
          </Animated.View>
        )}
      </View>

      <Animated.View entering={ZoomIn.delay(100).springify().damping(14)} style={styles.card}>
        <Animated.View style={badge}>
          <Image source={img.badge} style={{ width: 96, height: 96 }} />
        </Animated.View>
        <Txt v="textLgSemi" style={{ marginTop: 16 }}>
          First start
        </Txt>
        <Txt v="textLg" color={palette.gray400}>
          Log your first meal
        </Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, alignSelf: 'stretch' }}>
          <ProgressBar
            value={stage >= 1 ? 1 : 0.1}
            from={0.1}
            color={palette.blue500}
            height={8}
            duration={600}
            style={{ flex: 1 }}
          />
          <Txt v="textLg">1/1</Txt>
        </View>
      </Animated.View>

      {stage === 3 && (
        <Animated.View
          entering={SlideInDown.springify().damping(16)}
          style={{ position: 'absolute', left: 24, right: 24, bottom: insets.bottom + 16 }}>
          <Button label="Next" onPress={() => router.replace('/streak')} />
        </Animated.View>
      )}
      {stage === 3 && (
        <Animated.View entering={FadeInDown} style={{ alignItems: 'center', marginTop: 24 }}>
          <Txt v="textMd" color={palette.gray600}>
            +3 coins added to your wallet
          </Txt>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.amber100 },
  card: {
    marginHorizontal: 24,
    marginTop: 0,
    height: 270,
    borderRadius: 24,
    backgroundColor: colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
});
