import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { Ring } from '@/components/ui/effects';
import { Breathe, Float, PopIn, Txt, fmt, useCountUp } from '@/components/ui/primitives';
import { Footer, Header, Screen } from '@/components/ui/screen';
import { img } from '@/theme/assets';
import { colors, palette } from '@/theme/tokens';

const W = 375;

const slides = [
  { key: 'track', title: 'Track calories', sub: 'Know what fuels your body' },
  { key: 'hydrate', title: 'Stay hydrate', sub: 'Small habit, big impact' },
  { key: 'customize', title: 'Customize\nyour pet', sub: 'Grow together, every day' },
] as const;

/** "feature slider" frames (Track calories / Stay hydrate / Customize). */
export default function Walkthrough() {
  const ref = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const x = useSharedValue(0);
  const [page, setPage] = useState(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    x.set(e.contentOffset.x);
  });

  const next = () => {
    if (page < slides.length - 1) {
      ref.current?.scrollTo({ x: (page + 1) * W, animated: true });
      setPage(page + 1);
    } else router.push('/onboarding/meet');
  };
  const back = () => {
    if (page > 0) {
      ref.current?.scrollTo({ x: (page - 1) * W, animated: true });
      setPage(page - 1);
    } else router.back();
  };

  return (
    <Screen header={<Header onBack={back} right={null} />} footer={<Footer onPress={next} />}>
      <Dots x={x} />
      <Animated.ScrollView
        ref={ref as never}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / W))}
        style={{ flex: 1 }}>
        {slides.map((s, i) => (
          <View key={s.key} style={{ width: W, alignItems: 'center' }}>
            <Parallax x={x} index={i}>
              {s.key === 'track' && <TrackCard active={page === 0} />}
              {s.key === 'hydrate' && <HydrateCard active={page === 1} />}
              {s.key === 'customize' && <CustomizeCard active={page === 2} />}
            </Parallax>
            <View style={{ marginTop: s.key === 'customize' ? 18 : 48, gap: 8, paddingHorizontal: 24 }}>
              <Txt v="displayLg" center>
                {s.title}
              </Txt>
              <Txt v="textLg" color={palette.black} center>
                {s.sub}
              </Txt>
            </View>
          </View>
        ))}
      </Animated.ScrollView>
    </Screen>
  );
}

function Dots({ x }: { x: SharedValue<number> }) {
  return (
    <View style={styles.dots} pointerEvents="none">
      {slides.map((s, i) => (
        <Dot key={s.key} x={x} i={i} />
      ))}
    </View>
  );
}

function Dot({ x, i }: { x: SharedValue<number>; i: number }) {
  const a = useAnimatedStyle(() => {
    const d = Math.min(1, Math.abs(x.value / W - i));
    return {
      width: interpolate(d, [0, 1], [8, 8]),
      backgroundColor: d < 0.5 ? palette.gray950 : palette.gray200,
      transform: [{ scale: interpolate(d, [0, 1], [1.1, 1]) }],
    };
  });
  return <Animated.View style={[styles.dot, a]} />;
}

function Parallax({ x, index, children }: { x: SharedValue<number>; index: number; children: React.ReactNode }) {
  const a = useAnimatedStyle(() => {
    const d = x.value / W - index;
    return {
      transform: [{ scale: interpolate(Math.abs(d), [0, 1], [1, 0.9]) }, { rotate: `${d * -4}deg` }],
      opacity: interpolate(Math.abs(d), [0, 1], [1, 0.4]),
    };
  });
  return <Animated.View style={[{ marginTop: 24 }, a]}>{children}</Animated.View>;
}

/* ------------------------------ cards ------------------------------ */

function Macro({
  label,
  value,
  unit,
  color,
  x,
  y,
  delay,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
  x: number;
  y: number;
  delay: number;
}) {
  return (
    <PopIn delay={delay} style={[styles.macro, { left: x, top: y }]}>
      <Txt v="label" style={{ fontFamily: 'Poppins_600SemiBold' }}>
        {label}
      </Txt>
      <Txt v="textMdSemi" color={color} numberOfLines={1} style={{ marginTop: -2 }}>
        {value}{' '}
        <Txt v="textMd" color={color}>
          {unit}
        </Txt>
      </Txt>
    </PopIn>
  );
}

function TrackCard({ active }: { active: boolean }) {
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['#F4FBF3', '#BDE9C3', '#5CC97B']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Float amplitude={4} duration={1800} style={{ position: 'absolute', left: 44, top: 64 }}>
        <Image source={img.cardTrack} style={{ width: 222, height: 334 }} />
      </Float>
      {active && (
        <>
          <Macro label="Carbs" value={60} unit="gam" color={palette.leaf500} x={12} y={236} delay={250} />
          <Macro label="Protein" value={35} unit="gam" color={palette.red500} x={225} y={258} delay={400} />
          <Macro label="Fats" value={55} unit="gam" color={palette.orange500} x={12} y={325} delay={550} />
          <Macro label="Calories" value={650} unit="kcal" color={palette.blue500} x={215} y={375} delay={700} />
        </>
      )}
    </View>
  );
}

function HydrateCard({ active }: { active: boolean }) {
  const ml = useCountUp(active ? 750 : 0, 1400, 200);
  const [filled, setFilled] = useState(0);
  useEffect(() => {
    const ts = active
      ? [1, 2, 3].map((n) => setTimeout(() => setFilled(n), 250 + n * 350))
      : [setTimeout(() => setFilled(0), 0)];
    return () => ts.forEach(clearTimeout);
  }, [active]);
  return (
    <View style={[styles.card, { backgroundColor: '#7ECBEB' }]}>
      <Image source={img.hydrateBg} style={{ position: 'absolute', left: -32, top: 1, width: 375, height: 419 }} />
      <Breathe style={{ position: 'absolute', left: 65, top: 73 }}>
        <Image source={img.mascotDrink} style={{ width: 189, height: 198 }} />
      </Breathe>
      <View style={styles.waterPanel}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Txt v="textLgMedium" color={palette.gray400}>
              Water
            </Txt>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Txt v="displayMd" style={{ lineHeight: 32 }}>
                {fmt(ml)}
              </Txt>
              <Txt v="displaySm" color={palette.gray400}>
                ml
              </Txt>
            </View>
          </View>
          <Ring
            size={48}
            stroke={4}
            value={active ? 0.5 : 0}
            color={palette.blue500}
            track={palette.gray300}
            delay={200}
            duration={1400}>
            <Txt v="textSmSemi">50%</Txt>
          </Ring>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={{ width: 28, height: 38 }}>
              <Image source={img.glassEmpty} style={StyleSheet.absoluteFill} />
              {i < filled && (
                <Animated.View entering={FadeIn.duration(350)} style={StyleSheet.absoluteFill}>
                  <Image source={img.glassFull} style={StyleSheet.absoluteFill} />
                </Animated.View>
              )}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function CustomizeCard({ active }: { active: boolean }) {
  return (
    <View style={styles.card}>
      <Image source={img.cardCustomize} style={StyleSheet.absoluteFill} />
      {active && (
        <>
          <Sparkle x={240} y={70} size={30} delay={0} />
          <Sparkle x={262} y={110} size={20} delay={500} />
          <Sparkle x={20} y={170} size={26} delay={250} />
          <Sparkle x={36} y={196} size={14} delay={800} />
        </>
      )}
    </View>
  );
}

function Sparkle({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay)} style={{ position: 'absolute', left: x, top: y }}>
      <Float amplitude={3} duration={900} delay={delay} rotate={20}>
        <Txt style={{ fontSize: size, color: palette.amber300, lineHeight: size + 4 }}>✦</Txt>
      </Float>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dots: {
    position: 'absolute',
    top: -30,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  dot: { height: 8, borderRadius: 4 },
  card: {
    width: 310,
    height: 420,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: colors.bgSurface,
  },
  macro: {
    position: 'absolute',
    minWidth: 70,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  waterPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
    backgroundColor: '#DBE8FE',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 37,
    paddingTop: 16,
  },
});
