import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { Breathe, Txt } from '@/components/ui/primitives';
import { Footer, Header, Screen } from '@/components/ui/screen';
import { img } from '@/theme/assets';
import { palette } from '@/theme/tokens';

/** Frame "Plan" (5004:11110). */
export default function PlanIntro() {
  return (
    <Screen
      bg="#fff"
      background={
        <LinearGradient
          colors={['#FFE1DA', '#FFF7F5', '#FFFFFF']}
          locations={[0, 0.35, 0.5]}
          style={StyleSheet.absoluteFill}
        />
      }
      header={<Header />}
      footer={<Footer onPress={() => router.push('/plan/personalizing')} />}>
      <Animated.View
        entering={FadeInDown.springify().damping(16)}
        style={{ paddingHorizontal: 24, paddingTop: 24, gap: 16 }}>
        <Txt v="displayLg" center>
          Every habit counts. Even{' '}
          <Txt v="displayLg" color={palette.tomato500}>
            small change
          </Txt>
        </Txt>
        <Txt v="textLg" center>
          Small changes in daily meals can make this doable.
        </Txt>
      </Animated.View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 8 }}>
        <View
          style={{
            position: 'absolute',
            bottom: 12,
            width: 111,
            height: 35,
            borderRadius: 60,
            backgroundColor: palette.tomato100,
          }}
        />
        <Animated.View entering={ZoomIn.delay(150).springify().damping(9)}>
          <Breathe intensity={0.035} duration={900}>
            <Image source={img.mascotLove} style={{ width: 283, height: 277 }} />
          </Breathe>
        </Animated.View>
      </View>
    </Screen>
  );
}
