import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable } from 'react-native';

import { haptic } from '@/components/ui/primitives';

import { MASCOT_APPEAR } from './mascot-video';

/**
 * Mascot entrance on the "Meet pet" screen, using the designer's own motion
 * (stand → blink → cross arms → wave → excited cheer with sparkles).
 * Tap the mascot to replay it.
 */
export function MascotIntro({ size = 375 }: { size?: number }) {
  const [run, setRun] = useState(0);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Replay Redy animation"
      onPress={() => {
        haptic.light();
        setRun((r) => r + 1);
      }}>
      <Image
        key={run}
        source={MASCOT_APPEAR}
        autoplay
        style={{ width: size, height: size }}
        contentFit="contain"
        cachePolicy="none"
      />
    </Pressable>
  );
}
