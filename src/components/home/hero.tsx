import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
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

import { haptic } from '@/components/ui/primitives';
import { useApp } from '@/store/app-store';
import { img } from '@/theme/assets';

export const HERO_H = 332;

/** Home scene — sky + illustrated objects + Redy (Character stand) + equipped hat. */
export function HomeHero({ hatDrop = 0, jump: jumpSignal = 0 }: { hatDrop?: number; jump?: number }) {
  const hat = useApp((s) => s.hat);
  const background = useApp((s) => s.background);

  // idle breathing
  const b = useSharedValue(0);
  // tap → jump
  const jy = useSharedValue(0);
  const sq = useSharedValue(1);
  // hat drop-in
  const hy = useSharedValue(0);
  const ho = useSharedValue(1);
  // falling leaves
  useEffect(() => {
    b.set(withRepeat(withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) }), -1, true));
  }, [b]);

  useEffect(() => {
    if (!hatDrop) return;
    hy.set(-220);
    ho.set(0);
    ho.set(withTiming(1, { duration: 150 }));
    hy.set(withSpring(0, { damping: 9, stiffness: 140, mass: 0.9 }));
    sq.set(withDelay(330, withSequence(withTiming(0.9, { duration: 90 }), withSpring(1, { damping: 5 }))));
  }, [hatDrop, ho, hy, sq]);

  function jump() {
    haptic.light();
    jy.set(
      withSequence(
        withTiming(-40, { duration: 220, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 220, easing: Easing.in(Easing.quad) }),
        withSpring(0, { damping: 6 }),
      ),
    );
    sq.set(
      withSequence(
        withTiming(1.08, { duration: 200 }),
        withDelay(240, withTiming(0.88, { duration: 80 })),
        withSpring(1, { damping: 5 }),
      ),
    );
  }

  useEffect(() => {
    if (jumpSignal) jump();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpSignal]);

  const body = useAnimatedStyle(() => ({
    transform: [
      { translateY: jy.value },
      { scaleY: (1 + 0.02 * b.value) * sq.value },
      { scaleX: (1 - 0.01 * b.value) * (2 - sq.value) },
    ],
    transformOrigin: 'bottom',
  }));
  const hatStyle = useAnimatedStyle(() => ({
    opacity: ho.value,
    transform: [{ translateY: hy.value + -4 * b.value }],
  }));

  return (
    <View style={styles.hero} pointerEvents="box-none">
      {background === 'home' ? (
        <>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#A1E6DF', height: 263 }]} />
          <Image source={img.homeObjects} style={{ position: 'absolute', top: 0, left: 0, width: 375, height: 1459 }} />
        </>
      ) : (
        <Image
          source={background === 'garden' ? img.thumbGarden : img.thumbBeach}
          style={{ position: 'absolute', top: 0, left: 0, width: 375, height: 375 }}
          contentFit="cover"
        />
      )}
      <Leaves />
      <View pointerEvents="none" style={{ position: 'absolute', left: 47, top: 52, width: 280, height: 280 }}>
        <Animated.View style={body}>
          <Image source={img.mascotStand} style={{ width: 280, height: 280 }} />
          {hat !== 'none' && (
            <Animated.View
              style={[hat === 'viking' ? styles.hatViking : styles.hatAntlers, hatStyle]}
              pointerEvents="none">
              <Image
                source={hat === 'viking' ? img.hatVikingWorn : img.hatAntlers}
                style={hat === 'viking' ? { width: 129, height: 90 } : { width: 128, height: 88 }}
                contentFit="contain"
              />
            </Animated.View>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

/** A few leaves drifting down across the scene. */
function Leaves() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {[
        { x: 60, d: 0, dur: 7000 },
        { x: 210, d: 2400, dur: 8200 },
        { x: 320, d: 4800, dur: 7600 },
      ].map((l, i) => (
        <Leaf key={i} {...l} />
      ))}
    </View>
  );
}

function Leaf({ x, d, dur }: { x: number; d: number; dur: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(d, withRepeat(withTiming(1, { duration: dur, easing: Easing.linear }), -1)));
  }, [d, dur, t]);
  const a = useAnimatedStyle(() => ({
    opacity: t.value < 0.05 ? t.value * 20 : t.value > 0.85 ? (1 - t.value) / 0.15 : 1,
    transform: [
      { translateX: x + Math.sin(t.value * Math.PI * 4) * 18 },
      { translateY: -20 + t.value * 300 },
      { rotate: `${t.value * 540}deg` },
    ],
  }));
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top: 0 }, a]}>
      <View
        style={{
          width: 14,
          height: 9,
          borderRadius: 9,
          borderTopLeftRadius: 0,
          borderBottomRightRadius: 0,
          backgroundColor: '#A9B54A',
        }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hero: { position: 'absolute', top: 0, left: 0, right: 0, height: 1459 },
  hatViking: { position: 'absolute', left: 78, top: -15 },
  hatAntlers: { position: 'absolute', left: 76, top: -22 },
});
