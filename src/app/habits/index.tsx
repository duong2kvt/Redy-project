import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { Txt } from '@/components/ui/primitives';
import { Footer, Header, Screen } from '@/components/ui/screen';
import { useApp } from '@/store/app-store';
import { img } from '@/theme/assets';
import { palette } from '@/theme/tokens';

/** Frame "Eating Habits" (5004:11261). */
export default function HabitsIntro() {
  const { weight, targetWeight, pace } = useApp();
  const kg = Math.max(1, Math.round(weight - targetWeight));
  const weeks = Math.max(1, Math.ceil(kg / Math.max(0.1, pace)));

  const spin = useSharedValue(0);
  const run = useSharedValue(0);
  useEffect(() => {
    spin.set(withRepeat(withTiming(1, { duration: 12000, easing: Easing.linear }), -1));
    run.set(
      withRepeat(
        withSequence(
          withTiming(-14, { duration: 260, easing: Easing.out(Easing.quad) }),
          withSpring(0, { damping: 7, stiffness: 240 }),
          withTiming(0, { duration: 400 }),
        ),
        -1,
      ),
    );
  }, [run, spin]);
  const glow = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }, { scale: 1 + 0.04 * Math.sin(spin.value * Math.PI * 8) }],
  }));
  const hop = useAnimatedStyle(() => ({
    transform: [{ translateY: run.value }, { rotate: `${run.value * 0.15}deg` }],
  }));

  return (
    <Screen bg={palette.gray50} header={<Header />} footer={<Footer onPress={() => router.push('/habits/diet')} />}>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            left: -134,
            top: 116,
            width: 643,
            height: 624,
            alignItems: 'center',
            justifyContent: 'center',
          },
          glow,
        ]}>
        <Image source={img.starGlow} style={{ width: 375 * 1.4, height: 606 * 1.03 }} contentFit="contain" />
      </Animated.View>
      <Animated.View
        entering={FadeInDown.springify().damping(16)}
        style={{ paddingHorizontal: 24, paddingTop: 24, gap: 16 }}>
        <Txt v="displayLg" center>
          <Txt v="displayLg" color={palette.tomato500}>
            {kg}kg
          </Txt>{' '}
          in{' '}
          <Txt v="displayLg" color={palette.tomato500}>
            {weeks} weeks
          </Txt>{' '}
          starts with your eating habits
        </Txt>
        <Txt v="textLg" center>
          Small changes in daily meals can make this doable.
        </Txt>
      </Animated.View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View entering={ZoomIn.delay(200).springify().damping(10)}>
          <Animated.View style={hop}>
            <Image source={img.mascotRun} style={{ width: 332, height: 277 }} />
          </Animated.View>
        </Animated.View>
      </View>
    </Screen>
  );
}
