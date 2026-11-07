import { BlurView } from 'expo-blur';
import { CalendarDays, Plus, Settings, Star } from 'lucide-react-native';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { PressableScale, Txt, haptic, useInsets } from '@/components/ui/primitives';
import { palette } from '@/theme/tokens';

function HomeIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28">
      <Path d="M3 13.2C3 7 8 3 14 3s11 4 11 10.2V23a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9.8Z" fill={palette.gray950} />
      <Path d="M9.5 17.5h9" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

/** Floating glass navbar with the quick-log "+" (Navbar/State=Default → Open). */
export function NavBar({
  open,
  onToggle,
  onAction,
}: {
  open: boolean;
  onToggle: () => void;
  onAction: (a: 'meal' | 'water' | 'weight') => void;
}) {
  const insets = useInsets();
  const rot = useSharedValue(0);
  useEffect(() => {
    rot.set(withSpring(open ? 1 : 0, { damping: 12, stiffness: 200 }));
  }, [open, rot]);
  const plus = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value * 45}deg` }, { scale: 1 + rot.value * 0.02 }],
  }));

  return (
    <>
      {open && (
        <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(150)} style={StyleSheet.absoluteFill}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onToggle} accessibilityLabel="Close menu" />
        </Animated.View>
      )}
      {open && (
        <Animated.View
          entering={ZoomIn.springify().damping(15).stiffness(220)}
          exiting={ZoomOut.duration(160)}
          style={[styles.menu, { bottom: insets.bottom + 72 }]}>
          {(
            [
              ['meal', 'Log meal'],
              ['water', 'Log water'],
              ['weight', 'Log weight'],
            ] as const
          ).map(([k, label], i) => (
            <View key={k}>
              {i > 0 && <View style={styles.sep} />}
              <PressableScale onPress={() => onAction(k)} style={styles.menuItem} hapticStyle="medium">
                <Txt v="textLgSemi" color="#fff">
                  {label}
                </Txt>
              </PressableScale>
            </View>
          ))}
        </Animated.View>
      )}

      <View style={[styles.wrap, { bottom: insets.bottom + 8 }]} pointerEvents="box-none">
        <View style={styles.bar}>
          {Platform.OS === 'web' ? (
            <View style={[StyleSheet.absoluteFill, styles.webGlass]} />
          ) : (
            <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
          )}
          <View style={styles.items}>
            <NavItem active>
              <HomeIcon />
            </NavItem>
            <NavItem>
              <Star size={26} color={palette.gray950} strokeWidth={1.6} />
            </NavItem>
            <PressableScale
              onPress={() => {
                haptic.medium();
                onToggle();
              }}
              hapticStyle="none"
              style={styles.plus}
              accessibilityLabel={open ? 'Close quick log' : 'Quick log'}>
              <Animated.View style={plus}>
                <Plus size={26} color="#fff" strokeWidth={2} />
              </Animated.View>
            </PressableScale>
            <NavItem>
              <CalendarDays size={26} color={palette.gray950} strokeWidth={1.6} />
            </NavItem>
            <NavItem>
              <Settings size={26} color={palette.gray950} strokeWidth={1.6} />
            </NavItem>
          </View>
        </View>
      </View>
    </>
  );
}

function NavItem({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <PressableScale
      hapticStyle="select"
      style={{ width: 32, height: 40, alignItems: 'center', justifyContent: 'center' }}>
      {children}
      {active && <View style={styles.activeDot} />}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 24, right: 24, alignItems: 'center' },
  bar: { width: 327, height: 80, borderRadius: 40, overflow: 'hidden' },
  webGlass: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    // @ts-expect-error web-only CSS
    backdropFilter: 'blur(18px) saturate(1.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    borderRadius: 40,
  },
  items: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 20 },
  plus: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.tomato500,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.tomato500,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  activeDot: {
    position: 'absolute',
    bottom: -2,
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: palette.tomato500,
  },
  menu: {
    position: 'absolute',
    alignSelf: 'center',
    left: 71,
    width: 247,
    backgroundColor: palette.gray950,
    borderRadius: 24,
    paddingHorizontal: 34,
    paddingVertical: 4,
    transformOrigin: 'bottom',
  },
  menuItem: { height: 70, alignItems: 'center', justifyContent: 'center' },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: palette.gray700 },
});
