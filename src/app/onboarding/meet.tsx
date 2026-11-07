import { router } from 'expo-router';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { MascotIntro } from '@/components/mascot-intro';
import { Txt } from '@/components/ui/primitives';
import { Footer, Header, Screen } from '@/components/ui/screen';

/** Frame "Meet pet" (5004:10587) — mascot plays the "Motion appear" animation. */
export default function MeetPet() {
  return (
    <Screen header={<Header />} footer={<Footer onPress={() => router.push('/onboarding/name')} />}>
      <Animated.View entering={FadeInDown.springify().damping(16)} style={{ paddingHorizontal: 24, paddingTop: 40 }}>
        <Txt v="displayLgSemi" center>
          {'Let’s meet\nyour virtual pet'}
        </Txt>
      </Animated.View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 8 }}>
        <MascotIntro size={375} />
      </View>
    </Screen>
  );
}
