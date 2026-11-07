import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronRight, Pencil, UtensilsCrossed, X } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  ZoomIn,
} from 'react-native-reanimated';

import { Gauge } from '@/components/ui/effects';
import { PressableScale, ProgressBar, Txt, useCountUp, useInsets } from '@/components/ui/primitives';
import { Footer } from '@/components/ui/screen';
import { scannedMeal, useApp } from '@/store/app-store';
import { img } from '@/theme/assets';
import { colors, palette, radius } from '@/theme/tokens';

/** Frame "Scan Food / Detail" (5004:12086). Next → logs the meal → reward. */
export default function MealDetail() {
  const insets = useInsets();
  const logMeal = useApp((s) => s.logMeal);
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    y.set(e.contentOffset.y);
  });
  const photo = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(y.value, [-200, 0, 300], [-60, 0, 120]) },
      { scale: interpolate(y.value, [-200, 0], [1.4, 1], 'clamp') },
    ],
  }));
  const kcal = useCountUp(scannedMeal.kcal, 1000, 250);
  const score = useCountUp(scannedMeal.score, 1200, 500);

  const next = () => {
    logMeal({
      id: String(Date.now()),
      name: scannedMeal.name,
      kcal: scannedMeal.kcal,
      carbs: scannedMeal.carbs,
      protein: scannedMeal.protein,
      fat: scannedMeal.fat,
      score: scannedMeal.score,
      time: '7:00',
    });
    router.replace('/reward');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
      <Animated.View style={[styles.photo, photo]}>
        <Image source={img.foodPlate} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" />
        <LinearGradient colors={['rgba(255,255,255,0.75)', 'rgba(255,255,255,0)']} style={{ height: 120 }} />
      </Animated.View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: 320, paddingBottom: 140, gap: 16 }}
        showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.springify().damping(16)} style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Txt v="textLgSemi">Calories</Txt>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Txt v="displayMdSemi">{Math.round(kcal)}</Txt>
                <Txt v="textLgSemi" color={palette.gray400}>
                  kcal
                </Txt>
              </View>
            </View>
            <PressableScale style={styles.edit} accessibilityLabel="Edit">
              <Pencil size={16} color={palette.gray950} />
            </PressableScale>
          </View>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
            {[
              ['Carbs', scannedMeal.carbs, 0.3, palette.amber500],
              ['Proteins', scannedMeal.protein, 0.75, palette.leaf500],
              ['Fats', scannedMeal.fat, 0.18, palette.blue500],
            ].map(([l, v, p, c]) => (
              <View key={l as string} style={{ flex: 1, gap: 8 }}>
                <Txt v="textMd">{l as string}</Txt>
                <ProgressBar value={p as number} from={0} color={c as string} height={8} delay={300} duration={900} />
                <Txt v="textMdSemi">
                  {v as number}{' '}
                  <Txt v="textMd" color={palette.gray400}>
                    g
                  </Txt>
                </Txt>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify().damping(16)} style={styles.card}>
          <Txt v="textLgSemi" style={{ marginBottom: 4 }}>
            Ingridients
          </Txt>
          {scannedMeal.ingredients.map((ing, i) => (
            <PressableScale key={ing.name} style={[styles.ingRow, i > 0 && styles.divider]} scaleTo={0.98}>
              <View style={{ flex: 1 }}>
                <Txt v="textMdMedium">{ing.name}</Txt>
                <Txt v="textMd" color={palette.gray400}>
                  {ing.kcal} kcal
                </Txt>
              </View>
              <ChevronRight size={20} color={palette.gray950} />
            </PressableScale>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify().damping(16)} style={styles.card}>
          <Txt v="textLgSemi">Nutrition score</Txt>
          <View style={{ alignItems: 'center', marginTop: 16 }}>
            <Gauge
              width={216}
              stroke={16}
              value={score / 100}
              color={palette.leaf500}
              track={palette.leaf100}
              delay={300}
              duration={1200}
            />
            <View style={{ position: 'absolute', top: 32, alignItems: 'center' }}>
              <Animated.View entering={ZoomIn.delay(900).springify()}>
                <UtensilsCrossed size={22} color={palette.leaf500} />
              </Animated.View>
              <Txt v="textLgSemi" color={palette.leaf500} style={{ marginTop: 4 }}>
                Excellent
              </Txt>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Txt v="displayLgSemi" style={{ fontSize: 44, lineHeight: 50 }}>
                  {Math.round(score)}
                </Txt>
                <Txt v="textLgSemi" color={palette.gray400}>
                  Point
                </Txt>
              </View>
            </View>
          </View>
        </Animated.View>
      </Animated.ScrollView>

      <View style={[styles.header, { top: insets.top }]}>
        <PressableScale onPress={() => router.replace('/home')} hitSlop={12} accessibilityLabel="Close">
          <X size={24} color={palette.gray950} />
        </PressableScale>
        <Txt v="textLgSemi">{scannedMeal.name}</Txt>
        <View style={{ width: 24 }} />
      </View>
      <Footer floating onPress={next} />
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { position: 'absolute', top: 0, left: 0, right: 0, height: 382 },
  header: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 5,
  },
  card: { marginHorizontal: 16, backgroundColor: colors.bgSurface, borderRadius: radius.md, padding: 16 },
  edit: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.gray950,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.gray200 },
});
