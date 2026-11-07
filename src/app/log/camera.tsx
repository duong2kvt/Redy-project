import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ChevronLeft, ImageIcon, RefreshCcw, Zap, ZapOff } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { PressableScale, haptic, useInsets } from '@/components/ui/primitives';
import { img } from '@/theme/assets';

/** Frame "Take photo" (5004:11918). Camera viewfinder (simulated feed). */
export default function Camera() {
  const insets = useInsets();
  const [flash, setFlash] = useState(false);
  const shot = useSharedValue(0);
  const breathe = useSharedValue(0);
  useEffect(() => {
    breathe.set(withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [breathe]);
  const frame = useAnimatedStyle(() => ({ transform: [{ scale: 1 + breathe.value * 0.015 }] }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: shot.value }));

  const capture = () => {
    haptic.medium();
    shot.set(withSequence(withTiming(1, { duration: 90 }), withTiming(0, { duration: 350 })));
    setTimeout(() => router.replace('/log/scan'), 260);
  };

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.root}>
      <Image source={img.foodPlate} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={28} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(80,80,80,0.35)' }]} />

      <View style={[styles.top, { top: insets.top + 16 }]}>
        <PressableScale onPress={() => router.back()} style={styles.round} accessibilityLabel="Back">
          <ChevronLeft size={26} color="#fff" />
        </PressableScale>
        <PressableScale onPress={() => setFlash((f) => !f)} style={styles.round} accessibilityLabel="Flash">
          {flash ? <Zap size={22} color="#FFD64A" fill="#FFD64A" /> : <ZapOff size={22} color="#fff" />}
        </PressableScale>
      </View>

      <Animated.View style={[styles.viewfinder, frame]}>
        <Image source={img.foodPlate} style={StyleSheet.absoluteFill} contentFit="cover" />
        {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
          <View key={c} style={[styles.corner, styles[c]]} />
        ))}
      </Animated.View>

      <View style={[styles.controls, { bottom: insets.bottom + 26 }]}>
        <PressableScale onPress={capture} style={styles.small} accessibilityLabel="Choose from library">
          <ImageIcon size={18} color="#121212" />
        </PressableScale>
        <PressableScale
          onPress={capture}
          hapticStyle="none"
          style={styles.shutterRing}
          scaleTo={0.9}
          accessibilityLabel="Take photo">
          <View style={styles.shutter} />
        </PressableScale>
        <PressableScale style={styles.small} accessibilityLabel="Flip camera">
          <RefreshCcw size={18} color="#121212" />
        </PressableScale>
      </View>

      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#fff' }, flashStyle]} />
    </Animated.View>
  );
}

const C = 26;
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#555' },
  top: { position: 'absolute', left: 24, right: 24, flexDirection: 'row', justifyContent: 'space-between' },
  round: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinder: {
    position: 'absolute',
    left: 45,
    top: 207,
    width: 283,
    height: 378,
    borderRadius: 24,
    overflow: 'hidden',
  },
  corner: { position: 'absolute', width: C * 3.4, height: C * 3.4, borderColor: '#fff' },
  tl: { left: 0, top: 0, borderLeftWidth: 3, borderTopWidth: 3, borderTopLeftRadius: 24 },
  tr: { right: 0, top: 0, borderRightWidth: 3, borderTopWidth: 3, borderTopRightRadius: 24 },
  bl: { left: 0, bottom: 0, borderLeftWidth: 3, borderBottomWidth: 3, borderBottomLeftRadius: 24 },
  br: { right: 0, bottom: 0, borderRightWidth: 3, borderBottomWidth: 3, borderBottomRightRadius: 24 },
  controls: {
    position: 'absolute',
    left: 80,
    right: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  small: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#fff' },
});
