import { router } from 'expo-router';
import { Check, Droplet, Flame } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { Ring } from '@/components/ui/effects';
import { ProgressBar, Txt, fmt, useCountUp } from '@/components/ui/primitives';
import { Footer, Header, Screen } from '@/components/ui/screen';
import { useApp } from '@/store/app-store';
import { colors, palette, radius } from '@/theme/tokens';

/** Frame "overview user's health" in Personalize (5004:11188) — "Your plan is ready". */
export default function PlanReady() {
  const { targetWeight, weight, pace, gender, activity, diet, birthYear, set } = useApp();
  const weeks = Math.max(1, Math.ceil(Math.max(0, weight - targetWeight) / Math.max(0.1, pace)));
  const d = new Date(2026, 10, 7 + weeks * 7);
  const kcal = useCountUp(2102, 1200, 300);
  const water = useCountUp(2000, 1200, 500);
  const age = 2026 - birthYear;
  const genderLabel = gender === 'female' ? 'female' : gender === 'male' ? 'male' : '';

  return (
    <Screen
      bg={palette.leaf100}
      scroll
      header={<Header progress={0.9} />}
      footer={
        <Footer
          floating
          label="Start my plan"
          onPress={() => {
            set({ dailyGoal: 2925 });
            router.replace('/home');
          }}
        />
      }>
      <Animated.View
        entering={FadeInDown.springify().damping(16)}
        style={{ paddingHorizontal: 24, paddingTop: 24, gap: 12 }}>
        <Txt v="textLg" color={palette.gray600} center>
          Your personal plan is ready
        </Txt>
        <Txt v="displayLg" center>
          Reach{' '}
          <Txt v="displayLg" color={palette.leaf500}>
            {targetWeight}kg
          </Txt>{' '}
          by {d.getDate()} {d.toLocaleString('en-US', { month: 'long' })} {d.getFullYear()}
        </Txt>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).springify().damping(16)} style={[styles.card, { marginTop: 32 }]}>
        <Txt v="displaySm">Nutrition recommendations</Txt>
        <View style={styles.big}>
          <Flame size={22} color={palette.tomato500} fill={palette.tomato500} />
          <Txt v="displayMdSemi">{fmt(kcal)}</Txt>
          <Txt v="displayXs" color={palette.gray400}>
            Kcal
          </Txt>
        </View>
        <View style={{ flexDirection: 'row', gap: 3, marginTop: 16 }}>
          <ProgressBar
            value={1}
            from={0}
            delay={300}
            height={12}
            color={palette.amber500}
            track="transparent"
            style={{ flex: 175 }}
          />
          <ProgressBar
            value={1}
            from={0}
            delay={600}
            height={12}
            color={palette.blue500}
            track="transparent"
            style={{ flex: 43 }}
          />
          <ProgressBar
            value={1}
            from={0}
            delay={800}
            height={12}
            color={palette.leaf500}
            track="transparent"
            style={{ flex: 93 }}
          />
        </View>
        <View style={{ flexDirection: 'row', marginTop: 16 }}>
          <Macro dot={palette.amber500} label="Carbs" value={275} />
          <Macro dot={palette.blue500} label="Fats" value={68} />
          <Macro dot={palette.leaf500} label="Proteins" value={112} />
        </View>
        <Txt v="textMd" color={palette.gray600} style={{ marginTop: 16 }}>
          Based on your needs, we calculated your daily calories and macro balance. You can always adjust them in the
          app.
        </Txt>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(350).springify().damping(16)} style={[styles.card, { marginTop: 16 }]}>
        <Txt v="displaySm">Daily hydration</Txt>
        <View style={[styles.big, { marginTop: 28 }]}>
          <Droplet size={22} color={palette.blue500} fill={palette.blue500} />
          <Txt v="displayMdSemi">{Math.round(water)}</Txt>
          <Txt v="displayXs" color={palette.gray400}>
            ml
          </Txt>
        </View>
        <Txt v="textMd" color={palette.gray600} style={{ marginTop: 8 }}>
          Your daily water goal is based on your gender and weight. You can easily adjust it in the app.
        </Txt>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(500).springify().damping(16)} style={[styles.card, { marginTop: 16 }]}>
        <Txt v="displaySm">A plan that suits your needs</Txt>
        <View style={{ gap: 12, marginTop: 24 }}>
          <Bullet done label="Will help you lose weight" />
          <Bullet value={0.35} label={`Customized for ${genderLabel} age ${age}+`.replace('  ', ' ')} />
          <Bullet value={0.2} label={`Tailored  specifically for ${(diet ?? 'balanced').toLowerCase()}`} />
          <Bullet
            value={0.3}
            label={`Adapted to ${activity === 'high' ? 'highly' : activity === 'none' ? 'less' : activity === 'light' ? 'lightly' : 'moderately'} active lifestyle`}
          />
        </View>
        <Txt v="textMd" color={palette.gray600} style={{ marginTop: 32 }}>
          Follow your daily nutrion recommendations and achive your goals stress free with foods you love.
        </Txt>
      </Animated.View>
    </Screen>
  );
}

function Macro({ dot, label, value }: { dot: string; label: string; value: number }) {
  const v = useCountUp(value, 1000, 400);
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dot }} />
        <Txt v="textMdSemi">{label}</Txt>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
        <Txt v="displaySm">{Math.round(v)}</Txt>
        <Txt v="display2xs" color={palette.gray400} style={{ fontFamily: 'Fredoka_600SemiBold' }}>
          g
        </Txt>
      </View>
    </View>
  );
}

function Bullet({ label, done, value = 1 }: { label: string; done?: boolean; value?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
      <View style={{ marginTop: 2 }}>
        {done ? (
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: palette.leaf500,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Check size={13} color="#fff" strokeWidth={3.5} />
          </View>
        ) : (
          <Ring size={20} stroke={3} value={value} color={palette.leaf500} track={palette.gray200} delay={600} />
        )}
      </View>
      <Txt v="textLgMedium" style={{ flex: 1 }}>
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.md,
    padding: 16,
    paddingVertical: 22,
  },
  big: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 14 },
});
