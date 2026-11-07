import { Image } from 'expo-image';
import { useEffect } from 'react';
import { View } from 'react-native';
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

import { img } from '@/theme/assets';

/**
 * Re-creation of the Kling "jump in grandly" mascot video found on the Draft
 * page (Frame 9253–9255). Motion: drop from above → squash on landing →
 * stretch rebound → settle, ground shadow reacts, sparkle burst, then idle
 * breathing + periodic hop.
 *
 * To use the original MP4 instead, export it from Figma into
 * assets/video/mascot-intro.mp4 and set `MASCOT_VIDEO` in
 * src/components/mascot-video.ts (expo-video is already installed).
 */
export function MascotIntro({ size = 327 }: { size?: number }) {
  const y = useSharedValue(-520);
  const sx = useSharedValue(1);
  const sy = useSharedValue(1);
  const shadow = useSharedValue(0.2);
  const burst = useSharedValue(0);

  useEffect(() => {
    const land = 520;
    y.set(
      withSequence(
        withTiming(-520, { duration: 150 }),
        withTiming(0, { duration: land, easing: Easing.in(Easing.quad) }),
        withSpring(0, { damping: 8 }),
        withDelay(
          1400,
          withRepeat(
            withSequence(
              withTiming(-36, { duration: 260, easing: Easing.out(Easing.quad) }),
              withTiming(0, { duration: 240, easing: Easing.in(Easing.quad) }),
              withTiming(0, { duration: 2200 }),
            ),
            -1,
          ),
        ),
      ),
    );
    // squash & stretch synced to the landings
    const squash = (d: number) =>
      withSequence(
        withTiming(1, { duration: d }),
        withTiming(1.18, { duration: 90 }),
        withSpring(1, { damping: 5, stiffness: 180 }),
      );
    sx.set(squash(670));
    sy.set(
      withSequence(
        withTiming(1.12, { duration: 670 }),
        withTiming(0.8, { duration: 90 }),
        withSpring(1, { damping: 5, stiffness: 180 }),
        withDelay(
          1700,
          withRepeat(
            withSequence(
              withTiming(1.06, { duration: 260 }),
              withTiming(0.88, { duration: 240 }),
              withSpring(1, { damping: 6 }),
              withTiming(1, { duration: 1900 }),
            ),
            -1,
          ),
        ),
      ),
    );
    shadow.set(withSequence(withTiming(1, { duration: 670 }), withSpring(0.85)));
    burst.set(withDelay(650, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) })));
  }, [burst, shadow, sx, sy, y]);

  const body = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { scaleX: sx.value }, { scaleY: sy.value }],
    transformOrigin: 'bottom',
  }));
  const sh = useAnimatedStyle(() => ({
    opacity: shadow.value * 0.18,
    transform: [{ scaleX: shadow.value * (1 - Math.min(0, y.value) / -600) }],
  }));
  const ring = useAnimatedStyle(() => ({
    opacity: 1 - burst.value,
    transform: [{ scale: 0.3 + burst.value * 1.4 }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end' }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: size * 0.07,
            width: size * 0.42,
            height: 18,
            borderRadius: 100,
            backgroundColor: '#5A3A2E',
          },
          sh,
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            bottom: -40,
            width: size,
            height: 100,
            borderRadius: 200,
            borderWidth: 6,
            borderColor: '#FFC220',
          },
          ring,
        ]}
      />
      <Animated.View style={body}>
        <Image source={img.mascotFront} style={{ width: size, height: size }} contentFit="contain" />
      </Animated.View>
    </View>
  );
}
