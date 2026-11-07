import { Image } from 'expo-image';
import { router } from 'expo-router';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeInLeft, FadeInRight } from 'react-native-reanimated';

import { Breathe, Txt } from '@/components/ui/primitives';
import { Footer, Header, Screen } from '@/components/ui/screen';
import { img } from '@/theme/assets';
import { palette } from '@/theme/tokens';

/** Frame "intro" in section "setup goals" (5004:10690). */
export default function GoalsIntro() {
  return (
    <Screen
      bg={palette.orange50}
      header={<Header />}
      footer={<Footer label="Set up your goal" onPress={() => router.push('/goals/gender')} />}>
      <Animated.View entering={FadeInDown.springify().damping(16)} style={{ paddingHorizontal: 14, paddingTop: 24 }}>
        <Txt v="displayLg" center>
          I’ll help you understand your{' '}
          <Txt v="displayLg" color={palette.tomato500}>
            body
          </Txt>{' '}
          and{' '}
          <Txt v="displayLg" color={palette.tomato500}>
            goals
          </Txt>
        </Txt>
      </Animated.View>
      <View style={{ width: 299, height: 372, alignSelf: 'center', marginTop: 32 }}>
        <Animated.View
          entering={FadeInLeft.delay(150).springify().damping(14)}
          style={{ position: 'absolute', left: 0, top: 0 }}>
          <Image source={img.clipboard} style={{ width: 219, height: 316 }} />
        </Animated.View>
        <Image
          source={img.clipboardShadow}
          style={{ position: 'absolute', left: 4, top: 315, width: 271, height: 40 }}
        />
        <Animated.View
          entering={FadeInRight.delay(350).springify().damping(12)}
          style={{ position: 'absolute', left: 115, top: 135 }}>
          <Breathe>
            <Image source={img.mascotCrossed} style={{ width: 186, height: 237 }} />
          </Breathe>
        </Animated.View>
      </View>
    </Screen>
  );
}
