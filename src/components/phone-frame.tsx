import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { useApp } from '@/store/app-store';
import { fonts, palette } from '@/theme/tokens';

import { FrameInsetsContext } from './ui/primitives';

/**
 * On web (desktop) the app is presented inside an iPhone-sized device
 * (375×812, the Figma artboard) with a simulated status bar & home indicator,
 * plus a side panel to jump into each prototype flow.
 * On native — and on phone-sized browsers — it renders full-screen.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const framed = Platform.OS === 'web' && width >= 720 && height >= 700;
  if (!framed) return <>{children}</>;

  const scale = Math.min(1, (height - 48) / 860);
  const panelWidth = Math.min(280, (width - 399 * scale) / 2 - 56);
  const compact = panelWidth < 180;
  return (
    <View style={styles.stage}>
      <View style={[styles.device, { transform: [{ scale }] }]}>
        <View style={styles.screen} testID="device-screen">
          <FrameInsetsContext.Provider value={{ top: 44, bottom: 34 }}>{children}</FrameInsetsContext.Provider>
          <FakeStatusBar />
          <View pointerEvents="none" style={styles.homeIndicator} />
        </View>
      </View>
      <View style={[styles.panelAnchor, { width: compact ? 160 : panelWidth }]}>
        <DemoPanel compact={compact} maxHeight={height - 48} />
      </View>
    </View>
  );
}

function FakeStatusBar() {
  return (
    <View pointerEvents="none" style={styles.status}>
      <Text style={styles.time}>9:41</Text>
      <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
        <Svg width={18} height={12} viewBox="0 0 18 12">
          <Rect x={0} y={8} width={3} height={4} rx={1} fill="#121212" />
          <Rect x={5} y={5.5} width={3} height={6.5} rx={1} fill="#121212" />
          <Rect x={10} y={3} width={3} height={9} rx={1} fill="#121212" />
          <Rect x={15} y={0} width={3} height={12} rx={1} fill="#121212" />
        </Svg>
        <Svg width={16} height={12} viewBox="0 0 16 12">
          <Path
            d="M8 2.5c2.3 0 4.4.9 6 2.4l1.1-1.2A10 10 0 0 0 8 .9 10 10 0 0 0 .9 3.7L2 4.9a8.4 8.4 0 0 1 6-2.4Zm0 3.3c1.4 0 2.6.5 3.6 1.4l1.1-1.2A6.8 6.8 0 0 0 8 4.2 6.8 6.8 0 0 0 3.3 6l1.1 1.2c1-.9 2.2-1.4 3.6-1.4Zm0 3.3c.6 0 1.1.2 1.5.6L8 11.3 6.5 9.7c.4-.4.9-.6 1.5-.6Z"
            fill="#121212"
          />
        </Svg>
        <Svg width={27} height={13} viewBox="0 0 27 13">
          <Rect x={0.5} y={0.5} width={22} height={12} rx={3.5} stroke="#121212" strokeOpacity={0.4} fill="none" />
          <Rect x={2} y={2} width={19} height={9} rx={2} fill="#121212" />
          <Path d="M24 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z" fill="#121212" fillOpacity={0.4} />
        </Svg>
      </View>
    </View>
  );
}

const flows = [
  { label: '1 · Onboarding', sub: 'Walkthrough → goals → habits → plan', href: '/' as const },
  { label: '2 · Log meal + reward', sub: 'Home → + → Log meal → scan → reward', href: '/home' as const },
  { label: '3 · Buy item', sub: 'Home (after log) → store → Viking hat', href: '/home?demo=afterLog' as const },
];

function DemoPanel({ compact, maxHeight }: { compact: boolean; maxHeight: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const reset = useApp((s) => s.reset);
  const set = useApp((s) => s.set);
  return (
    <View>
      {compact && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle prototype flows"
          accessibilityState={{ expanded }}
          onPress={() => setExpanded(!expanded)}
          style={styles.flowToggle}>
          <Text style={styles.flowLabel}>{expanded ? 'Close flows ×' : 'View flows ☰'}</Text>
        </Pressable>
      )}
      {(!compact || expanded) && (
      <ScrollView style={[{ maxHeight: compact ? maxHeight - 54 : maxHeight }, compact && styles.compactPanel]}>
      <View style={styles.panel}>
      <Text style={styles.brand}>Redy</Text>
      <Text style={styles.tagline}>Interactive product demo</Text>
      <Text style={styles.section}>Prototype flows</Text>
      {flows.map((f, i) => (
        <Pressable
          key={f.label}
          onHoverIn={() => setHover(i)}
          onHoverOut={() => setHover(null)}
          onPress={() => {
            setExpanded(false);
            reset();
            if (i === 2) {
              set({
                meals: [
                  {
                    id: 'demo',
                    name: 'Grilled chicken & salad',
                    kcal: 389,
                    carbs: 40,
                    protein: 98,
                    fat: 22,
                    score: 98,
                    time: '7:00',
                  },
                ],
                firstMealRewarded: true,
                streak: 1,
                coins: 182,
                petName: 'vee',
              });
            }
            router.dismissTo?.(f.href);
            router.replace(f.href);
          }}
          style={[styles.flow, hover === i && { backgroundColor: palette.tomato50, borderColor: palette.tomato300 }]}>
          <Text style={styles.flowLabel}>{f.label}</Text>
          <Text style={styles.flowSub}>{f.sub}</Text>
        </Pressable>
      ))}
      <Text style={styles.hint}>
        Tip: everything is tappable — pickers scroll, cards select, the + button opens the quick-log menu and the store
        icon opens the pet shop.
      </Text>
      </View>
      </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, backgroundColor: '#EFE9E6', alignItems: 'center', justifyContent: 'center' },
  panelAnchor: { position: 'absolute', top: 24, left: 24, zIndex: 2 },
  flowToggle: { padding: 12, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: palette.gray200 },
  compactPanel: { position: 'absolute', top: 54, width: 280, backgroundColor: '#EFE9E6', padding: 16, borderRadius: 20 },
  device: {
    width: 375 + 24,
    height: 812 + 24,
    borderRadius: 64,
    backgroundColor: '#111',
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 24 },
  },
  screen: { width: 375, height: 812, borderRadius: 52, overflow: 'hidden', backgroundColor: palette.beige },
  status: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 34,
    paddingRight: 22,
    paddingTop: 4,
  },
  time: { fontFamily: fonts.semibold, fontSize: 15, color: '#121212' },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    width: 134,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#121212',
  },
  panel: { gap: 10, paddingBottom: 8 },
  brand: { fontFamily: fonts.displayBold, fontSize: 44, color: palette.tomato500 },
  tagline: { fontFamily: fonts.regular, fontSize: 13, color: palette.gray600, marginBottom: 12 },
  section: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: palette.gray500,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  flow: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.gray200,
    gap: 2,
  },
  flowLabel: { fontFamily: fonts.semibold, fontSize: 15, color: palette.gray950 },
  flowSub: { fontFamily: fonts.regular, fontSize: 12, color: palette.gray500 },
  hint: { fontFamily: fonts.regular, fontSize: 12, color: palette.gray500, marginTop: 12, lineHeight: 18 },
});
