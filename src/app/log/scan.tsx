import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Minus, Pencil, Plus, Sparkles } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  runOnJS,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Button, PressableScale, Txt, haptic, useInsets } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/screen';
import { scannedMeal } from '@/store/app-store';
import { img } from '@/theme/assets';
import { colors, palette, radius } from '@/theme/tokens';

/**
 * Frames "Scanning" ⇄ "Scanning" (AFTER_TIMEOUT 0.8s, SMART_ANIMATE 1s loop)
 * → tap → "Bottom sheet - Ingredients" (5011:15998) → Confirm → detail.
 */
export default function Scan() {
  const insets = useInsets();
  const [sheet, setSheet] = useState(false);
  const [found, setFound] = useState(false);

  const scan = useSharedValue(0);
  const peek = useSharedValue(40);
  useEffect(() => {
    scan.set(withRepeat(withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) }), -1, true));
    peek.set(withDelay(250, withSpring(0, { damping: 9 })));
    const t1 = setTimeout(() => {
      setFound(true);
      haptic.success();
    }, 1800);
    const t2 = setTimeout(() => setSheet(true), 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [peek, scan]);

  const line = useAnimatedStyle(() => ({ transform: [{ translateY: scan.value * 405 }] }));
  const peekStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: peek.value }, { rotate: `${peek.value / 4}deg` }],
  }));

  return (
    <Screen header={<Header close title="Scan meal" onBack={() => router.replace('/home')} />}>
      <Pressable onPress={() => setSheet(true)} style={{ flex: 1 }}>
        <View style={styles.photo}>
          <Image source={img.foodPlate} style={StyleSheet.absoluteFill} contentFit="cover" />
          {!found && (
            <Animated.View pointerEvents="none" style={[styles.scanLine, line]}>
              <LinearGradient
                colors={['rgba(246,87,55,0)', 'rgba(246,87,55,0.25)']}
                style={{ height: 60, marginTop: -60 }}
              />
              <View
                style={{
                  height: 3,
                  backgroundColor: palette.tomato500,
                  shadowColor: palette.tomato500,
                  shadowOpacity: 0.9,
                  shadowRadius: 8,
                }}
              />
            </Animated.View>
          )}
          {found &&
            [
              { x: 30, y: 90, t: 'Corn' },
              { x: 190, y: 70, t: 'Cherry tomatoes' },
              { x: 90, y: 250, t: 'Grilled chicken' },
              { x: 10, y: 170, t: 'Parsley' },
            ].map((b, i) => (
              <Animated.View
                key={b.t}
                entering={FadeIn.delay(i * 120).springify()}
                style={[styles.tag, { left: b.x, top: b.y }]}>
                <Txt v="textSmSemi">{b.t}</Txt>
              </Animated.View>
            ))}
        </View>
        <Animated.View style={[styles.peek, peekStyle]} pointerEvents="none">
          <Image source={img.mascotPeek} style={{ width: 92, height: 98 }} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.ai}>
          <View style={styles.aiIcon}>
            <Sparkles size={20} color={palette.gray600} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt v="textLgMedium">{found ? 'Meal recognised!' : 'Support by AI'}</Txt>
            <Txt v="textMd" color={palette.gray600}>
              {found
                ? 'Tap to review the ingredients we found'
                : 'Our AI instantly recognizes your meal and logs the nutrition'}
            </Txt>
          </View>
        </Animated.View>
      </Pressable>

      {sheet && <IngredientsSheet bottom={insets.bottom} onClose={() => setSheet(false)} />}
    </Screen>
  );
}

function IngredientsSheet({ bottom, onClose }: { bottom: number; onClose: () => void }) {
  const [servings, setServings] = useState(1);
  const y = useSharedValue(0);
  const drag = Gesture.Pan()
    .onUpdate((e) => {
      y.set(Math.max(0, e.translationY));
    })
    .onEnd((e) => {
      if (e.translationY > 120) runOnJS(onClose)();
      else y.set(withSpring(0));
    });
  const a = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View
        entering={SlideInDown.springify().damping(18).stiffness(150)}
        exiting={SlideOutDown.duration(220)}
        style={[styles.sheet, { bottom: bottom + 2 }, a]}>
        <GestureDetector gesture={drag}>
          <View style={{ height: 24, alignItems: 'center', justifyContent: 'center' }}>
            <View style={styles.grabber} />
          </View>
        </GestureDetector>
        <Txt v="displaySm">{scannedMeal.name}</Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <Txt v="textLgMedium">Serving(s)</Txt>
          <View style={styles.stepper}>
            <PressableScale onPress={() => setServings((s) => Math.max(0.5, s - 0.5))} hitSlop={8}>
              <Minus size={14} color={palette.gray600} />
            </PressableScale>
            <Txt v="textMd" style={{ minWidth: 24, textAlign: 'center' }}>
              {servings}
            </Txt>
            <PressableScale onPress={() => setServings((s) => Math.min(5, s + 0.5))} hitSlop={8}>
              <Plus size={14} color={palette.gray600} />
            </PressableScale>
          </View>
        </View>
        <View style={styles.ingredients}>
          <Txt v="displayXs" style={{ marginBottom: 8 }}>
            Ingredients
          </Txt>
          {scannedMeal.ingredients.map((ing, i) => (
            <Animated.View key={ing.name} entering={FadeInDown.delay(200 + i * 70)} style={styles.ingRow}>
              <Pencil size={14} color={palette.gray400} />
              <Txt v="textLg" style={{ flex: 1 }}>
                {ing.name}
              </Txt>
              <View style={styles.qty}>
                <Txt v="textMd">{Math.round(ing.grams * servings)} g</Txt>
              </View>
            </Animated.View>
          ))}
        </View>
        <Button label="Confirm" onPress={() => router.replace('/log/detail')} style={{ marginTop: 16 }} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { marginHorizontal: 24, marginTop: 30, height: 435, borderRadius: 24, overflow: 'hidden' },
  scanLine: { position: 'absolute', left: 0, right: 0, top: 15 },
  tag: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  peek: { position: 'absolute', right: 12, top: -2 },
  ai: {
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.md,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: colors.bgSurface,
    borderRadius: 24,
    padding: 16,
    paddingTop: 4,
  },
  grabber: { width: 60, height: 2, borderRadius: 2, backgroundColor: palette.gray950 },
  stepper: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.gray200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ingredients: { marginTop: 16, backgroundColor: palette.gray100, borderRadius: radius.md, padding: 16, gap: 10 },
  ingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 34 },
  qty: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10, height: 30, justifyContent: 'center' },
});
