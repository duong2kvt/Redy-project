import { BlurView } from 'expo-blur';
import { CalendarDays, Plus, Settings, Star, X } from 'lucide-react-native';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
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

/**
 * Floating glass navbar with the quick-log "+" (Navbar / State=Default → Open).
 *
 * Matches the prototype: the quick-log panel DISSOLVES in place (opacity,
 * 300 ms linear — no scale/slide). The panel is one black shape ("Union" in
 * Figma: rounded rect r32 + two concave fillets + a ring around the button)
 * that flows down and wraps the centre button, and the 48px red "+" cross-fades
 * into the 40px red "×" sitting inside that ring.
 */
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
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withTiming(open ? 1 : 0, { duration: 300, easing: Easing.linear }));
  }, [open, t]);
  const fadeIn = useAnimatedStyle(() => ({ opacity: t.value }));
  const fadeOut = useAnimatedStyle(() => ({ opacity: 1 - t.value }));

  const barBottom = insets.bottom + 8;
  const toggle = () => {
    haptic.medium();
    onToggle();
  };

  return (
    <>
      {open && <Pressable style={StyleSheet.absoluteFill} onPress={onToggle} accessibilityLabel="Close menu" />}

      <View style={[styles.wrap, { bottom: barBottom }]} pointerEvents="box-none">
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
              onPress={toggle}
              hapticStyle="none"
              style={styles.plusSlot}
              accessibilityLabel="Quick log"
              disabled={open}>
              <Animated.View style={[styles.plus, fadeOut]}>
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

      {/* Quick-log panel (Union shape) */}
      <Animated.View
        pointerEvents={open ? 'box-none' : 'none'}
        style={[styles.menuWrap, { bottom: barBottom + 16.5 }, fadeIn]}>
        <View style={styles.menu}>
          <Svg width={MENU_W} height={MENU_H} style={StyleSheet.absoluteFill}>
            <Path d={MENU_PATH} fill={palette.gray950} />
          </Svg>
          {(
            [
              ['meal', 'Log meal', 42],
              ['water', 'Log water', 115],
              ['weight', 'Log weight', 188],
            ] as const
          ).map(([k, label, cy], i) => (
            <View key={k}>
              {i > 0 && <View style={[styles.sep, { top: cy - 37 }]} />}
              <Pressable
                onPress={() => onAction(k)}
                accessibilityRole="button"
                style={({ pressed }) => [styles.menuItem, { top: cy - 36 }, pressed && { opacity: 0.6 }]}>
                <Txt v="textLgSemi" color="#fff">
                  {label}
                </Txt>
              </Pressable>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Open-state "×" (40px) inside the panel's ring */}
      <Animated.View
        pointerEvents={open ? 'box-none' : 'none'}
        style={[styles.closeWrap, { bottom: barBottom + 20 }, fadeIn]}>
        <PressableScale onPress={toggle} hapticStyle="none" style={styles.close} accessibilityLabel="Close quick log">
          <X size={20} color="#fff" strokeWidth={2.4} />
        </PressableScale>
      </Animated.View>
    </>
  );
}

// Figma "Union" (247×279): rounded rect r32 (h 223.5) + concave fillets + ring (r≈24.5) around the button.
const MENU_W = 247;
/** x of the ring's centre inside the Union shape (Figma: ellipse at 163.5 + 24 − 71). */
const RING_CX = 116.5;
const MENU_H = 279;
const MENU_PATH = [
  'M32 0 H215 A32 32 0 0 1 247 32 V191.5 A32 32 0 0 1 215 223.5',
  'H184 C156.7 223.5 140.3 239.9 140.3 255.5',
  'A24.2 24 0 0 1 92.7 255.5',
  'C92.7 239.9 76.3 223.5 49 223.5',
  'H32 A32 32 0 0 1 0 191.5 V32 A32 32 0 0 1 32 0 Z',
].join(' ');

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
  plusSlot: { width: 48, height: 48 },
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
  menuWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  // The ring is not in the middle of the Union shape (x=116.5 of 247, like Figma),
  // so shift the panel until the ring sits exactly over the centred button.
  menu: { width: MENU_W, height: MENU_H, transform: [{ translateX: MENU_W / 2 - RING_CX }] },
  menuItem: { position: 'absolute', left: 34, width: 180, height: 72, alignItems: 'center', justifyContent: 'center' },
  sep: { position: 'absolute', left: 34, width: 180, height: 1, backgroundColor: 'rgba(247,247,247,0.1)' },
  closeWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.tomato500,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
