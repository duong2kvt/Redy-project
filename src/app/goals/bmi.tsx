import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { CircleCheck } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';

import { duotone, type DuotoneName } from '@/components/icons/duotone';
import { PopIn, Txt, Wiggle, useCountUp } from '@/components/ui/primitives';
import { Footer, Header, Screen } from '@/components/ui/screen';
import { useApp } from '@/store/app-store';
import { img } from '@/theme/assets';
import { colors, palette, radius } from '@/theme/tokens';

const BAR_W = 311;
const TICKS = [15, 18.5, 25, 30, 40];
// Tick positions measured from the Figma bar (x of each label within 311px).
const TICK_X = [0, 71, 150, 224, 298];

function bmiToX(bmi: number) {
  for (let i = 0; i < TICKS.length - 1; i++) {
    if (bmi <= TICKS[i + 1]) {
      const t = (bmi - TICKS[i]) / (TICKS[i + 1] - TICKS[i]);
      return TICK_X[i] + t * (TICK_X[i + 1] - TICK_X[i]);
    }
  }
  return BAR_W - 8;
}

const ACTIVITY_LABEL = {
  none: 'Not active',
  light: 'Lightly active',
  moderate: 'Moderately active',
  high: 'Hightly active',
};

/** Frame "overview user's health" (5004:10886). */
export default function Bmi() {
  const { height, weight, activity, diet } = useApp();
  const bmi = weight / Math.pow(height / 100, 2);
  const shown = useCountUp(bmi, 1100, 500);
  const status =
    bmi < 18.5
      ? {
          title: 'Underweight',
          body: 'Let’s build healthy energy step by step with balanced, nourishing meals.',
          ok: false,
        }
      : bmi < 25
        ? {
            title: 'Healthy BMI',
            body: "You’re right where you need to be! It's a perfect base to tone your body and bild sustainable habits.",
            ok: true,
          }
        : {
            title: bmi < 30 ? 'Overweight' : 'Obese',
            body: 'Small, steady changes will move you toward a healthier range.',
            ok: false,
          };

  const x = useSharedValue(0);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    x.set(withDelay(500, withTiming(bmiToX(bmi), { duration: 1100, easing: Easing.out(Easing.back(1.2)) })));
    const t = setTimeout(() => setReady(true), 1500);
    return () => clearTimeout(t);
  }, [bmi, x]);
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <Screen
      bg={palette.leaf100}
      scroll
      header={<Header progress={0.85} />}
      footer={<Footer floating onPress={() => router.push('/goals/target')} />}>
      <Animated.View entering={FadeInDown.springify().damping(15)} style={styles.speech}>
        <Txt v="display2xs">“Based on what you shared, here’s what I see</Txt>
        <View style={styles.speechTail} />
      </Animated.View>

      <View style={{ height: 135, zIndex: 2 }}>
        <Animated.View
          entering={FadeInUp.delay(200).springify().damping(11)}
          style={{ position: 'absolute', left: 70, top: 23 }}>
          <Wiggle deg={3} every={1600} style={{ transformOrigin: 'bottom' }}>
            <Image source={img.mascotBmi} style={{ width: 217, height: 143 }} />
          </Wiggle>
        </Animated.View>
      </View>

      <View style={styles.card}>
        <Txt v="textLgMedium" color={palette.gray400}>
          Body mass index (BMI)
        </Txt>
        <View style={{ height: 58, marginTop: 58 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {TICKS.map((t) => (
              <Txt key={t} v="label" color={palette.gray400}>
                {t}
              </Txt>
            ))}
          </View>
          <View style={{ marginTop: 8, height: 12, justifyContent: 'center' }}>
            <LinearGradient
              colors={['#3B82F6', '#45B441', '#45B441', '#F4D80B', '#F98315']}
              locations={[0, 0.3, 0.5, 0.75, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: 8, borderRadius: 8 }}
            />
            <Animated.View style={[styles.thumb, thumb]}>
              <View style={styles.thumbInner} />
              <Animated.View entering={FadeIn.delay(600)} style={styles.tooltip}>
                <Txt v="displayXs" color="#fff" style={{ fontSize: 18 }}>
                  You: {shown.toFixed(2)}
                </Txt>
                <View style={styles.tooltipTail} />
              </Animated.View>
            </Animated.View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            {['Undeweight', 'Normal', 'Overweight', 'Obese'].map((t) => (
              <Txt key={t} v="label" color={palette.gray400}>
                {t}
              </Txt>
            ))}
          </View>
        </View>

        {ready && (
          <PopIn from={0.85} style={[styles.callout, !status.ok && { backgroundColor: palette.amber100 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <CircleCheck size={24} color="#fff" fill={status.ok ? palette.leaf500 : palette.amber500} />
              <Txt v="textLgMedium">{status.title}</Txt>
            </View>
            <Txt v="textMd" color={palette.gray600} style={{ marginTop: 8 }}>
              {status.body}
            </Txt>
          </PopIn>
        )}

        <View style={{ gap: 20, marginTop: 28 }}>
          <Summary
            icon="shoesRunning"
            tint={palette.blue500}
            label="Activity level"
            value={activity ? ACTIVITY_LABEL[activity] : 'Lightly active'}
            delay={700}
          />
          <Summary
            icon="plateUtensils"
            tint={palette.violet500}
            label="Diet type"
            value={diet ?? 'Balanced'}
            delay={850}
          />
          <Summary
            icon="dumbbell"
            tint={palette.amber500}
            label="Metabolism"
            value="Balanced: Needs steady habits to see change"
            delay={1000}
          />
        </View>
      </View>
    </Screen>
  );
}

function Summary({
  icon,
  label,
  value,
  delay,
}: {
  icon: DuotoneName;
  tint: string;
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify().damping(16)}
      style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
      <View style={styles.summaryIcon}>
        <SvgXml xml={duotone[icon]} width={32} height={32} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt v="textLg" color={palette.gray400}>
          {label}
        </Txt>
        <Txt v="textLgMedium" style={{ fontSize: 17 }}>
          {value}
        </Txt>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  speech: {
    marginHorizontal: 38,
    marginTop: 0,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  speechTail: {
    position: 'absolute',
    bottom: -10,
    left: 18,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.bgSurface,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 0,
    zIndex: 1,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.md,
    padding: 16,
    paddingTop: 22,
    paddingBottom: 28,
  },
  thumb: {
    position: 'absolute',
    left: -8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: palette.leaf500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.leaf500 },
  tooltip: {
    position: 'absolute',
    bottom: 30,
    width: 112,
    marginLeft: -2,
    backgroundColor: palette.gray950,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tooltipTail: {
    position: 'absolute',
    bottom: -7,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: palette.gray950,
  },
  callout: {
    marginTop: 28,
    backgroundColor: palette.leaf100,
    borderRadius: radius.md,
    padding: 24,
    paddingVertical: 16,
  },
  summaryIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
