import { router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { MascotIntro } from '@/components/mascot-intro';
import { MASCOT_VIDEO } from '@/components/mascot-video';
import { Txt } from '@/components/ui/primitives';
import { Footer, Header, Screen } from '@/components/ui/screen';

/** Frame "Meet pet" (5004:10587). */
export default function MeetPet() {
  return (
    <Screen header={<Header />} footer={<Footer onPress={() => router.push('/onboarding/name')} />}>
      <Animated.View entering={FadeInDown.springify().damping(16)} style={{ paddingHorizontal: 24, paddingTop: 40 }}>
        <Txt v="displayLgSemi" center>
          {'Let’s meet\nyour virtual pet'}
        </Txt>
      </Animated.View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 24 }}>
        {MASCOT_VIDEO ? <MascotVideo source={MASCOT_VIDEO} /> : <MascotIntro size={300} />}
      </View>
    </Screen>
  );
}

function MascotVideo({ source }: { source: number }) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return <VideoView player={player} style={{ width: 327, height: 327 }} nativeControls={false} contentFit="contain" />;
}
