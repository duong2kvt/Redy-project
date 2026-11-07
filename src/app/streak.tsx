import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { Txt, haptic } from '@/components/ui/primitives';
import { Footer } from '@/components/ui/screen';
import { useApp } from '@/store/app-store';
import { img } from '@/theme/assets';
import { palette } from '@/theme/tokens';

const DAYS = ['S', 'M', 'T', 'W', 'Th', 'F', 'S'];

/** Frame "Streak" (5004:12175). */
export default function Streak() {
  const streak = useApp((s) => s.streak);
  const drift = useSharedValue(0);
  const flick = useSharedValue(0);
  useEffect(() => {
    drift.set(withRepeat(withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.sin) }), -1, true));
    flick.set(withRepeat(withTiming(1, { duration: 420, easing: Easing.inOut(Easing.sin) }), -1, true));
    const t = setTimeout(() => haptic.success(), 900);
    return () => clearTimeout(t);
  }, [drift, flick]);
  const clouds = useAnimatedStyle(() => ({ transform: [{ translateX: -20 + drift.value * 40 }] }));
  const flame = useAnimatedStyle(() => ({
    transform: [{ scaleY: 1 + flick.value * 0.03 }, { scaleX: 1 - flick.value * 0.015 }],
    transformOrigin: 'bottom',
  }));

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#FDC983', '#FEE6C2', '#FFFFFF']}
        locations={[0, 0.3, 0.48]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[{ position: 'absolute', top: -2, left: 0 }, clouds]}>
        <Image source={img.clouds} style={{ width: 375, height: 245 }} />
      </Animated.View>

      <View style={{ height: 105 }} />
      <Animated.View entering={ZoomIn.delay(100).springify().damping(9).stiffness(130)} style={{ alignSelf: 'center' }}>
        <Animated.View style={flame}>
          <Image source={img.streakFlameDab} style={{ width: 247, height: 287 }} />
        </Animated.View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(450).springify()} style={{ alignItems: 'center', marginTop: 18 }}>
        <Txt v="display2xl" style={{ fontSize: 64, lineHeight: 66 }}>
          {Math.max(1, streak)}
        </Txt>
        <Txt v="displayMdSemi" color={palette.tomato500} style={{ fontSize: 26 }}>
          Day Streak
        </Txt>
      </Animated.View>

      <View style={styles.week}>
        {DAYS.map((d, i) => (
          <Animated.View key={i} entering={FadeInDown.delay(600 + i * 60)} style={{ alignItems: 'center', gap: 6 }}>
            <Txt
              v="textLg"
              color={i === 0 ? palette.tomato500 : palette.gray400}
              style={i === 0 && { fontFamily: 'Poppins_600SemiBold' }}>
              {d}
            </Txt>
            {i === 0 ? (
              <Animated.View
                entering={ZoomIn.delay(1000).springify().damping(7)}
                style={[styles.day, { backgroundColor: palette.tomato500 }]}>
                <Check size={16} color="#fff" strokeWidth={3.5} />
              </Animated.View>
            ) : (
              <View style={styles.day} />
            )}
          </Animated.View>
        ))}
      </View>
      <Animated.View entering={FadeInDown.delay(1100)}>
        <Txt v="textLg" center style={{ marginTop: 24, paddingHorizontal: 50 }}>
          You’re on fire! Every day matters for hitting your goal
        </Txt>
      </Animated.View>

      <View style={{ flex: 1 }} />
      <Footer onPress={() => router.replace('/home')} />
    </View>
  );
}

const styles = StyleSheet.create({
  week: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 54, marginTop: 30 },
  day: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
