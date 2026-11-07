import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import { Ring } from '@/components/ui/effects';
import { Float, PopIn, Txt, haptic, useCountUp } from '@/components/ui/primitives';
import { Footer, Header, Screen } from '@/components/ui/screen';
import { img } from '@/theme/assets';
import { palette } from '@/theme/tokens';

const STEPS = [
  'Analyzing your answers',
  'Defining nutrient requirements',
  'Estimating weight progress',
  'Adjusting nutrition tips',
];
const DURATION = 4200;

/** Frame "Personalizing plan" (5004:11134) — animated loader. */
export default function Personalizing() {
  const pct = useCountUp(100, DURATION, 200);
  const [done, setDone] = useState(0);
  useEffect(() => {
    const ts = STEPS.map((_, i) =>
      setTimeout(
        () => {
          setDone(i + 1);
          haptic.light();
        },
        200 + ((i + 1) * DURATION) / STEPS.length,
      ),
    );
    return () => ts.forEach(clearTimeout);
  }, []);
  const finished = done >= STEPS.length;
  useEffect(() => {
    if (finished) haptic.success();
  }, [finished]);

  return (
    <Screen
      background={<LinearGradient colors={['#E2F7E1', '#F6FCF5', '#FFFFFF']} style={StyleSheet.absoluteFill} />}
      header={<Header progress={0.5} />}
      footer={<Footer onPress={() => router.push('/plan/ready')} disabled={!finished} />}>
      <View style={{ width: 317, height: 294, alignSelf: 'center' }}>
        <View style={{ position: 'absolute', left: 46, top: 42 }}>
          <Ring
            size={214}
            stroke={22}
            value={1}
            color={palette.leaf500}
            track="#D3E5D2"
            duration={DURATION}
            delay={200}>
            <Txt style={{ fontFamily: 'Poppins_500Medium', fontSize: 53, lineHeight: 64 }}>{Math.round(pct)}%</Txt>
          </Ring>
        </View>
        <Float amplitude={6} style={{ position: 'absolute', left: 0, top: 0 }}>
          <PopIn delay={200}>
            <Image source={img.iconPlate} style={{ width: 62, height: 62 }} />
          </PopIn>
        </Float>
        <Float amplitude={5} delay={300} style={{ position: 'absolute', left: 2, top: 230 }}>
          <PopIn delay={350}>
            <Image source={img.iconWater} style={{ width: 46, height: 46 }} />
          </PopIn>
        </Float>
        <Float amplitude={4} delay={500} rotate={8} style={{ position: 'absolute', left: 267, top: 40 }}>
          <PopIn delay={450}>
            <Image source={img.iconMoon} style={{ width: 29, height: 36 }} />
          </PopIn>
        </Float>
        <Float amplitude={6} delay={150} style={{ position: 'absolute', left: 245, top: 210 }}>
          <PopIn delay={550}>
            <Image source={img.iconFasting} style={{ width: 56, height: 56 }} />
          </PopIn>
        </Float>
        <Float amplitude={4} delay={650} rotate={-8} style={{ position: 'absolute', left: 195, top: 258 }}>
          <PopIn delay={650}>
            <Image source={img.iconHeart} style={{ width: 32, height: 31 }} />
          </PopIn>
        </Float>
      </View>

      <View style={{ paddingHorizontal: 24, marginTop: 64, gap: 16 }}>
        <Animated.View entering={FadeInDown.delay(150)}>
          <Txt v="displayMdSemi" center>
            {finished ? 'Your plan is ready!' : 'Personalizing plan'}
          </Txt>
        </Animated.View>
        <View style={{ gap: 9 }}>
          {STEPS.map((s, i) => (
            <Animated.View
              key={s}
              entering={FadeInDown.delay(250 + i * 90)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <StepDot state={i < done ? 'done' : i === done ? 'active' : 'idle'} />
              <Txt v="textLg" color={i <= done ? palette.gray950 : palette.gray400}>
                {s}
              </Txt>
            </Animated.View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

function StepDot({ state }: { state: 'done' | 'active' | 'idle' }) {
  if (state === 'done')
    return (
      <Animated.View
        entering={ZoomIn.springify().damping(8)}
        style={[styles.dot, { backgroundColor: palette.leaf500, borderColor: palette.leaf500 }]}>
        <Check size={13} color="#fff" strokeWidth={3.5} />
      </Animated.View>
    );
  return (
    <View style={styles.dot}>
      {state === 'active' && (
        <Animated.View entering={FadeIn} style={StyleSheet.absoluteFill}>
          <Ring size={20} stroke={3} value={0.7} color={palette.leaf500} track={palette.gray200} duration={900} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: palette.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
