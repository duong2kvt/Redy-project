import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { RadialGlow } from '@/components/ui/effects';
import { Button, Float, PopIn, Txt, useInsets } from '@/components/ui/primitives';
import { Screen } from '@/components/ui/screen';
import { img } from '@/theme/assets';
import { palette } from '@/theme/tokens';

/** Frame "intro" (5004:10628) — prototype starting point "Onboarding". */
export default function Intro() {
  const insets = useInsets();
  const glow = useSharedValue(0.85);
  const jump = useSharedValue(0);
  useEffect(() => {
    glow.set(withRepeat(withTiming(1.05, { duration: 1800, easing: Easing.inOut(Easing.sin) }), -1, true));
    // little celebratory hop every few seconds
    jump.set(
      withDelay(
        900,
        withRepeat(
          withSequence(
            withTiming(-18, { duration: 220, easing: Easing.out(Easing.quad) }),
            withSpring(0, { damping: 6, stiffness: 220 }),
            withTiming(0, { duration: 2200 }),
          ),
          -1,
        ),
      ),
    );
  }, [glow, jump]);
  const glowStyle = useAnimatedStyle(() => ({ transform: [{ scale: glow.value }], opacity: glow.value - 0.1 }));
  const jumpStyle = useAnimatedStyle(() => ({ transform: [{ translateY: jump.value }] }));

  return (
    <Screen bg={palette.amber50}>
      <Animated.View
        entering={FadeInDown.duration(500).springify().damping(16)}
        style={{ paddingHorizontal: 24, paddingTop: 56 }}>
        <Txt v="display2xl" center>
          Reach your weight goals
        </Txt>
      </Animated.View>

      <View style={styles.stage}>
        <Animated.View style={[styles.glow, glowStyle]}>
          <RadialGlow size={407} color="#FFC220" opacity={0.95} />
        </Animated.View>

        <PopIn delay={150} style={{ position: 'absolute', left: 63, top: 280 }}>
          <Image source={img.sand} style={{ width: 256, height: 68 }} />
        </PopIn>

        <Float delay={0} amplitude={7} style={{ position: 'absolute', left: 133, top: 21 }}>
          <PopIn delay={250}>
            <Image source={img.iconPlate} style={{ width: 107, height: 107 }} />
          </PopIn>
        </Float>
        <Float delay={300} amplitude={6} duration={1900} style={{ position: 'absolute', left: 48, top: 101 }}>
          <PopIn delay={350}>
            <Image source={img.iconWater} style={{ width: 70, height: 70 }} />
          </PopIn>
        </Float>
        <Float delay={600} amplitude={8} duration={2100} style={{ position: 'absolute', left: 248, top: 87 }}>
          <PopIn delay={450}>
            <Image source={img.iconFasting} style={{ width: 92, height: 92 }} />
          </PopIn>
        </Float>
        <Float delay={200} amplitude={5} rotate={8} style={{ position: 'absolute', left: 51, top: 194 }}>
          <PopIn delay={550}>
            <Image source={img.iconMoon} style={{ width: 31, height: 39 }} />
          </PopIn>
        </Float>
        <Float delay={500} amplitude={5} rotate={-10} style={{ position: 'absolute', left: 274, top: 202 }}>
          <PopIn delay={650}>
            <Image source={img.iconHeart} style={{ width: 42, height: 41 }} />
          </PopIn>
        </Float>

        <Animated.View
          entering={FadeInUp.delay(200).springify().damping(10)}
          style={[{ position: 'absolute', left: 105, top: 147 }, jumpStyle]}>
          <Image source={img.mascotWave} style={{ width: 159, height: 187 }} />
        </Animated.View>
        <Float
          delay={0}
          amplitude={0}
          rotate={6}
          duration={700}
          style={{ position: 'absolute', left: 244, top: 285, transformOrigin: 'left bottom' }}>
          <Image source={img.iconFlag} style={{ width: 33, height: 49 }} />
        </Float>
      </View>

      <Animated.View
        entering={FadeInUp.delay(300).duration(400)}
        style={[styles.actions, { paddingBottom: insets.bottom + 6 }]}>
        <Button label="Get started" onPress={() => router.push('/onboarding/walkthrough')} />
        <Button label="I already have an account" variant="ghost" onPress={() => router.push('/home')} />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stage: { width: 375, height: 407, alignSelf: 'center', marginTop: 20 },
  glow: {
    position: 'absolute',
    left: -16,
    top: 0,
    width: 407,
    height: 407,
  },
  actions: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 16, gap: 24, alignItems: 'center' },
});
