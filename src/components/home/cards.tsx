import { Image } from 'expo-image';
import { Flame, Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
  ZoomIn,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, LinearGradient as SvgGrad, Path, Stop } from 'react-native-svg';

import { Gauge, Ring } from '@/components/ui/effects';
import { PressableScale, ProgressBar, Txt, fmt, haptic, useCountUp } from '@/components/ui/primitives';
import { useApp, useTotals } from '@/store/app-store';
import { img } from '@/theme/assets';
import { colors, palette, radius } from '@/theme/tokens';

const GOALS = { carbs: 318, protein: 280, fat: 64 };

function Card({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(17)} style={styles.card}>
      {children}
    </Animated.View>
  );
}

function RoundAdd({ onPress }: { onPress?: () => void }) {
  return (
    <PressableScale onPress={onPress} style={styles.add} hapticStyle="medium" accessibilityLabel="Add">
      <Plus size={20} color="#fff" strokeWidth={2.5} />
    </PressableScale>
  );
}

export function MealCard({ onAdd }: { onAdd: () => void }) {
  const dailyGoal = useApp((s) => s.dailyGoal);
  const meals = useApp((s) => s.meals);
  const t = useTotals();
  const kcal = useCountUp(t.kcal, 1200, 250);
  return (
    <Card delay={60}>
      <View style={styles.titleRow}>
        <View>
          <Txt v="textLgSemi">Meal tracking</Txt>
          <Txt v="textMd" color={palette.gray400}>
            Daily goal: {fmt(dailyGoal)} kcal
          </Txt>
        </View>
        <RoundAdd onPress={onAdd} />
      </View>
      <View style={{ alignItems: 'center', marginTop: 16, height: 140 }}>
        <Gauge
          width={216}
          stroke={16}
          value={t.kcal / dailyGoal}
          color={palette.orange500}
          track="#FFE6D5"
          delay={250}
          duration={1200}
        />
        <View style={styles.gaugeCenter}>
          <Flame size={22} color={palette.tomato500} fill={palette.orange500} />
          <Txt v="textMdMedium" style={{ marginTop: 6 }}>
            Calories eaten
          </Txt>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Txt v="displayLgSemi" style={{ fontSize: 44, lineHeight: 50 }}>
              {fmt(kcal)}
            </Txt>
            <Txt v="textLgSemi" color={palette.gray400}>
              kcal
            </Txt>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
        <MacroBar label="Carbs" value={t.carbs} goal={GOALS.carbs} color={palette.amber500} />
        <MacroBar label="Proteins" value={t.protein} goal={GOALS.protein} color={palette.leaf500} />
        <MacroBar label="Fats" value={t.fat} goal={GOALS.fat} color={palette.blue500} />
      </View>
      {meals.length > 0 && (
        <Animated.View entering={FadeIn.delay(400)} style={{ marginTop: 16 }}>
          <Image source={img.mealAvatars} style={{ width: 140, height: 52 }} />
        </Animated.View>
      )}
    </Card>
  );
}

function MacroBar({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const v = useCountUp(value, 1000, 300);
  return (
    <View style={{ flex: 1, gap: 8 }}>
      <Txt v="textMd">{label}</Txt>
      <ProgressBar
        value={value / goal}
        from={0}
        color={color}
        track={palette.gray200}
        height={8}
        delay={300}
        duration={1000}
      />
      <Txt v="textMdSemi">
        {Math.round(v)}{' '}
        <Txt v="textMd" color={palette.gray400}>
          / {goal}g
        </Txt>
      </Txt>
    </View>
  );
}

export function WaterCard() {
  const glasses = useApp((s) => s.waterGlasses);
  const addWater = useApp((s) => s.addWater);
  const set = useApp((s) => s.set);
  return (
    <Card delay={120}>
      <View style={styles.titleRow}>
        <View>
          <Txt v="textLgSemi">Water tracking</Txt>
          <Txt v="textMdSemi">
            {fmt(glasses * 200)}{' '}
            <Txt v="textMd" color={palette.gray400}>
              / 2,000 ml
            </Txt>
          </Txt>
        </View>
        <RoundAdd onPress={addWater} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <PressableScale
            key={i}
            hapticStyle="light"
            scaleTo={0.85}
            onPress={() => set({ waterGlasses: i < glasses ? i : i + 1 })}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <WaterGlass full={i < glasses} next={i === glasses} />
          </PressableScale>
        ))}
      </View>
    </Card>
  );
}

const AnimPath = Animated.createAnimatedComponent(Path);

function WaterGlass({ full, next }: { full: boolean; next: boolean }) {
  const level = useSharedValue(full ? 1 : 0);
  useEffect(() => {
    level.set(withTiming(full ? 1 : 0, { duration: 500, easing: Easing.out(Easing.cubic) }));
  }, [full, level]);
  const props = useAnimatedProps(() => {
    const top = 36 - 28 * level.value;
    return { d: `M7 ${top} Q15 ${top - 3 * level.value} 22 ${top} T37 ${top} L35 38 Q35 40 33 40 L11 40 Q9 40 9 38 Z` };
  });
  return (
    <View>
      <Svg width={44} height={44} viewBox="0 0 44 44">
        <Path d="M6 6 H38 L35 38 Q35 40 33 40 H11 Q9 40 9 38 Z" fill={palette.blue100} />
        <AnimPath animatedProps={props} fill={palette.blue300} />
      </Svg>
      {next && !full && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={14} color={palette.gray950} />
          </View>
        </View>
      )}
    </View>
  );
}

export function NutritionCard() {
  const meals = useApp((s) => s.meals);
  const has = meals.length > 0;
  return (
    <Card delay={180}>
      <View style={styles.titleRow}>
        <View>
          <Txt v="textLgSemi">Nutrition score</Txt>
          <Txt v="textMd" color={has ? palette.amber500 : palette.gray400}>
            {has ? 'Avarage' : 'No score yet'}
          </Txt>
        </View>
        <Ring size={48} stroke={4} value={has ? 0.75 : 0} color={palette.leaf500} track={palette.gray200} delay={300}>
          <Txt v="textSmSemi">{has ? '75P' : '0P'}</Txt>
        </Ring>
      </View>
      <ScoreChart has={has} />
    </Card>
  );
}

const AnimLinePath = Animated.createAnimatedComponent(Path);

function ScoreChart({ has }: { has: boolean }) {
  const W = 311;
  const H = 158;
  const pts = [
    [10, 128],
    [67, 110],
    [125, 74],
    [182, 66],
    [240, 36],
    [302, 4],
  ];
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
  const len = 340;
  const p = useSharedValue(0);
  const [sel, setSel] = useState(2);
  useEffect(() => {
    p.set(has ? withDelay(300, withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) })) : 0);
  }, [has, p]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: len * (1 - p.value) }));
  const labels = ['5:00', '6:00', '7:00', '8:00', '9:00', '10:00'];
  const scores = [12, 31, 56, 61, 78, 92];
  return (
    <View style={{ marginTop: 20, height: H }}>
      <Svg width={W} height={122}>
        <Defs>
          <SvgGrad id="sel" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={palette.blue500} stopOpacity={0.25} />
            <Stop offset="1" stopColor={palette.blue500} stopOpacity={0} />
          </SvgGrad>
        </Defs>
        {[1, 61, 121].map((y) => (
          <Line key={y} x1={0} x2={W} y1={y} y2={y} stroke={palette.gray200} strokeDasharray="6 6" />
        ))}
        {has && (
          <>
            <AnimLinePath
              d={d}
              stroke={palette.blue500}
              strokeWidth={2}
              fill="none"
              strokeDasharray={`${len} ${len}`}
              animatedProps={props}
            />
            <Circle cx={pts[sel][0]} cy={pts[sel][1]} r={16} fill="url(#sel)" />
            <Circle cx={pts[sel][0]} cy={pts[sel][1]} r={6} fill={palette.blue500} />
          </>
        )}
      </Svg>
      {has && (
        <Animated.View
          key={sel}
          entering={ZoomIn.springify().damping(14)}
          style={[styles.tip, { left: Math.min(W - 100, pts[sel][0] + 30), top: Math.max(0, pts[sel][1] - 28) }]}>
          <View>
            <Txt v="textSm" color="#fff">
              {labels[sel]}
            </Txt>
            <Txt v="textMdSemi" color="#fff">
              {scores[sel]}P
            </Txt>
          </View>
          <View
            style={{
              width: 4,
              height: 34,
              borderRadius: 2,
              backgroundColor: palette.gray600,
              overflow: 'hidden',
              justifyContent: 'flex-end',
            }}>
            <View style={{ height: `${scores[sel]}%`, backgroundColor: '#fff' }} />
          </View>
        </Animated.View>
      )}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
        {labels.map((l, i) => (
          <PressableScale
            key={l}
            hapticStyle="select"
            onPress={() => {
              if (has) {
                setSel(i);
                haptic.select();
              }
            }}>
            <Txt v="label" color={palette.gray400}>
              {l}
            </Txt>
          </PressableScale>
        ))}
      </View>
    </View>
  );
}

export function WeightCard() {
  const { weight, targetWeight } = useApp();
  return (
    <Card delay={240}>
      <View style={styles.titleRow}>
        <View>
          <Txt v="textLgSemi">Weight</Txt>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Txt v="displayMdSemi">{weight}</Txt>
            <Txt v="textLgSemi" color={palette.gray400}>
              kg
            </Txt>
          </View>
        </View>
        <RoundAdd />
      </View>
      <Txt v="textMd" color={palette.gray400} style={{ marginTop: 6 }}>
        {Math.abs(weight - targetWeight)} kg {weight >= targetWeight ? 'above' : 'below'} goal: {targetWeight} kg
      </Txt>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.bgSurface, borderRadius: radius.md, padding: 16, marginHorizontal: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  add: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.gray950,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeCenter: { position: 'absolute', top: 30, alignItems: 'center' },
  tip: {
    position: 'absolute',
    flexDirection: 'row',
    gap: 22,
    alignItems: 'center',
    backgroundColor: palette.gray950,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
