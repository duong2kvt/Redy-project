import { Image } from 'expo-image';
import { Ban, CircleCheck, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolateColor,
  runOnJS,
  SlideInDown,
  SlideInUp,
  SlideOutDown,
  SlideOutUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';

import { Button, PressableScale, Txt, haptic, useInsets } from '@/components/ui/primitives';
import { useApp, type BackgroundId, type HatId } from '@/store/app-store';
import { BACKGROUNDS, HATS } from '@/store/catalog';
import { img } from '@/theme/assets';
import { colors, palette, radius, type } from '@/theme/tokens';

import { HERO_H } from './hero';

/** Lock icon exported from Figma (store item "Lock", 16×16). */
function LockIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.5 5.67071V3.5C4.5 2.39543 5.39543 1.5 6.5 1.5H9.5C10.6046 1.5 11.5 2.39543 11.5 3.5V5.67071C12.6652 6.08254 13.5 7.19378 13.5 8.5V11.5C13.5 13.1569 12.1569 14.5 10.5 14.5H5.5C3.84315 14.5 2.5 13.1569 2.5 11.5V8.5C2.5 7.19378 3.33481 6.08254 4.5 5.67071ZM6.5 2.5H9.5C10.0523 2.5 10.5 2.94772 10.5 3.5V5.5H5.5V3.5C5.5 2.94772 5.94772 2.5 6.5 2.5ZM8.69449 10.4725C8.63408 10.1704 8.74701 9.86806 8.85796 9.57103C8.89122 9.48198 8.92431 9.3934 8.95249 9.30546C8.98334 9.20917 9 9.10653 9 9C9 8.44772 8.55228 8 8 8C7.44772 8 7 8.44772 7 9C7 9.10653 7.01666 9.20917 7.04751 9.30546C7.07569 9.3934 7.10878 9.48197 7.14204 9.57102C7.25298 9.86805 7.36592 10.1704 7.30551 10.4725L7.19612 11.0194C7.09466 11.5267 7.48267 12 8 12C8.51733 12 8.90534 11.5267 8.80388 11.0194L8.69449 10.4725Z"
        fill={color}
      />
    </Svg>
  );
}

const TABS = ['Background', 'Hat', 'Pant', 'Shoe'] as const;
type Tab = (typeof TABS)[number];

type Item = {
  id: string;
  kind: 'bg' | 'hat' | 'locked';
  ref?: HatId | BackgroundId;
  image?: number;
  price?: number;
  name?: string;
};

const ITEMS: Record<Tab, Item[]> = {
  // every background from the catalog; "home" is owned by default, the rest are bought with coins
  Background: BACKGROUNDS.map((b) => ({
    id: `bg-${b.id}`,
    kind: 'bg' as const,
    ref: b.id,
    image: b.image,
    price: b.price,
    name: b.name,
  })),
  // every hat from the catalog; "none" and "antlers" are owned by default, the rest are bought with coins
  Hat: HATS.map((h) => ({
    id: `hat-${h.id}`,
    kind: 'hat' as const,
    ref: h.id,
    image: h.image,
    price: h.price,
    name: h.name,
  })),
  Pant: [],
  Shoe: [],
};

/** Pet shop bottom sheet ("Home affter log" 5011:18353 / 5011:19214). */
export function StoreSheet({ onClose, onBought }: { onClose: () => void; onBought: (kind: 'hat' | 'bg') => void }) {
  const insets = useInsets();
  const [tab, setTab] = useState<Tab>('Background');
  const [buying, setBuying] = useState<Item | null>(null);
  const { hat, ownedHats, ownedBackgrounds, background, set, buyHat, buyBackground, coins } = useApp();

  const y = useSharedValue(0);
  const drag = Gesture.Pan()
    .onUpdate((e) => {
      y.set(Math.max(0, e.translationY));
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 900) runOnJS(onClose)();
      else y.set(withSpring(0, { damping: 18 }));
    });
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  const isSelected = (it: Item) => (it.kind === 'hat' && it.ref === hat) || (it.kind === 'bg' && it.ref === background);
  const isOwned = (it: Item) =>
    (it.kind === 'bg' && ownedBackgrounds.includes(it.ref as BackgroundId)) ||
    (it.kind === 'hat' && ownedHats.includes(it.ref as HatId));

  const onItem = (it: Item) => {
    if (it.kind === 'bg' && isOwned(it)) return set({ background: it.ref as BackgroundId });
    if (it.kind === 'hat' && isOwned(it)) return set({ hat: it.ref as HatId });
    setBuying(it);
  };

  return (
    <>
      <Animated.View
        entering={SlideInDown.springify().damping(20).stiffness(160)}
        exiting={SlideOutDown.duration(250)}
        style={[styles.sheet, sheetStyle]}>
        <GestureDetector gesture={drag}>
          <View style={styles.grabArea}>
            <View style={styles.grabber} />
          </View>
        </GestureDetector>
        <Tabs tab={tab} onTab={setTab} />
        {/* Tab content DISSOLVES (300 ms linear) — old grid fades out while the new one fades in */}
        <View style={{ flex: 1 }}>
          <Animated.View
            key={tab}
            entering={FadeIn.duration(300).easing(Easing.linear)}
            exiting={FadeOut.duration(300).easing(Easing.linear)}
            style={StyleSheet.absoluteFill}>
            <ScrollView
              contentContainerStyle={[styles.grid, { paddingBottom: insets.bottom + 24 }]}
              showsVerticalScrollIndicator={false}>
              {ITEMS[tab].length === 0 && (
                <Txt v="textMd" color={palette.gray400} center style={{ width: '100%', marginTop: 40 }}>
                  New {tab.toLowerCase()}s are coming soon ✨
                </Txt>
              )}
              {ITEMS[tab].map((it, i) => {
                const selected = isSelected(it);
                const locked = !isOwned(it);
                return (
                  <View key={it.id}>
                    <PressableScale onPress={() => onItem(it)} hapticStyle="select" scaleTo={0.94}>
                      <View
                        style={[
                          styles.tile,
                          it.kind === 'hat' && {
                            backgroundColor: locked ? palette.gray300 : '#fff',
                            borderColor: palette.gray200,
                            borderWidth: 2,
                          },
                          it.kind === 'hat' && it.ref === 'none' && { backgroundColor: palette.gray50 },
                          selected && { borderColor: palette.leaf500, borderWidth: 2 },
                          it.kind === 'locked' && { backgroundColor: palette.gray300 },
                        ]}>
                        {it.ref === 'none' ? (
                          <Ban size={48} color={palette.gray950} strokeWidth={2.4} />
                        ) : (
                          <Image
                            source={it.image}
                            style={
                              it.kind === 'bg' || (it.kind === 'locked' && tab === 'Background')
                                ? StyleSheet.absoluteFill
                                : it.ref === 'viking' || it.ref === 'antlers'
                                  ? { width: 79, height: 61 }
                                  : { width: 80, height: 80 }
                            }
                            contentFit={it.kind === 'bg' || tab === 'Background' ? 'cover' : 'contain'}
                          />
                        )}
                        {locked && (
                          <View style={styles.lock}>
                            <LockIcon color={it.kind === 'bg' ? '#FFFFFF' : palette.gray400} />
                          </View>
                        )}
                      </View>
                    </PressableScale>
                  </View>
                );
              })}
            </ScrollView>
          </Animated.View>
        </View>
      </Animated.View>

      {buying && (
        <BuyPopup
          item={buying}
          coins={coins}
          onClose={() => setBuying(null)}
          onBuy={() => {
            const isBg = buying.kind === 'bg';
            const ok = !buying.ref
              ? false
              : isBg
                ? buyBackground(buying.ref as BackgroundId, buying.price ?? 0)
                : buyHat(buying.ref as HatId, buying.price ?? 0);
            if (ok) {
              haptic.success();
              if (!isBg) setTab('Hat');
              onBought(isBg ? 'bg' : 'hat');
            }
            setBuying(null);
          }}
        />
      )}
    </>
  );
}

/**
 * Segmented tab bar. Matches the prototype: the black pill does not slide —
 * the old pill dissolves out while the new one dissolves in (300 ms linear),
 * and the label colours cross-fade with it.
 */
function Tabs({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <View style={styles.tabs}>
      {TABS.map((t) => (
        <TabItem
          key={t}
          label={t}
          active={tab === t}
          onPress={() => {
            if (t === tab) return;
            haptic.select();
            onTab(t);
          }}
        />
      ))}
    </View>
  );
}

function TabItem({ label, active, onPress }: { label: Tab; active: boolean; onPress: () => void }) {
  const p = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    p.set(withTiming(active ? 1 : 0, { duration: 300, easing: Easing.linear }));
  }, [active, p]);
  const pill = useAnimatedStyle(() => ({ opacity: p.value }));
  const text = useAnimatedStyle(() => ({ color: interpolateColor(p.value, [0, 1], [palette.gray400, '#ffffff']) }));
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={[styles.tab, label === 'Background' && { paddingHorizontal: 16 }]}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.pill, pill]} />
      <Animated.Text allowFontScaling={false} style={[type.textLgSemi, text]}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}

function BuyPopup({
  item,
  coins,
  onClose,
  onBuy,
}: {
  item: Item;
  coins: number;
  onClose: () => void;
  onBuy: () => void;
}) {
  const enough = coins >= (item.price ?? 0);
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View
        entering={ZoomIn.springify().damping(15).stiffness(200)}
        exiting={ZoomOut.duration(180)}
        style={styles.popup}>
        <PressableScale onPress={onClose} style={styles.close} accessibilityLabel="Close">
          <X size={22} color="#fff" strokeWidth={2.5} />
        </PressableScale>
        <Txt v="displayMdSemi" center>
          {item.name}
        </Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', marginTop: 8 }}>
          <Image source={img.coinBig} style={{ width: 36, height: 36 }} />
          <Txt v="displayMdSemi">{item.price}</Txt>
        </View>
        {item.kind === 'bg' ? (
          <Image source={item.image} style={styles.previewBg} contentFit="cover" />
        ) : (
          <View style={styles.preview}>
            <Image source={item.image} style={{ width: 120, height: 93 }} contentFit="contain" />
          </View>
        )}
        <Button label={enough ? 'Buy now' : 'Not enough coins'} onPress={onBuy} disabled={!enough} />
      </Animated.View>
    </View>
  );
}

export function CoinPill({ coins }: { coins: number }) {
  const s = useSharedValue(1);
  const [shown, setShown] = useState(coins);
  useEffect(() => {
    if (coins === shown) return;
    s.set(
      withSpring(1.15, { damping: 6 }, () => {
        s.value = withTiming(1, { duration: 200 });
      }),
    );
    // tick the number down/up
    const from = shown;
    const steps = 12;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(Math.round(from + ((coins - from) * i) / steps));
      if (i >= steps) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coins]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Animated.View entering={ZoomIn.springify()} style={[styles.coinPill, a]}>
      <Image source={img.coinSmall} style={{ width: 22, height: 22 }} />
      <Txt v="textLgSemi">{shown}</Txt>
    </Animated.View>
  );
}

export function Toast({ text }: { text: string }) {
  const insets = useInsets();
  return (
    <Animated.View
      entering={SlideInUp.springify().damping(16)}
      exiting={SlideOutUp.duration(300)}
      style={[styles.toast, { top: insets.top - 4 }]}>
      <CircleCheck size={22} color="#fff" fill={palette.leaf500} />
      <Txt v="textLgSemi" color={palette.leaf600}>
        {text}
      </Txt>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    top: HERO_H,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bgSurface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  grabArea: { height: 30, alignItems: 'center', justifyContent: 'center' },
  grabber: { width: 60, height: 2, borderRadius: 2, backgroundColor: palette.gray950 },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: palette.gray50,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  pill: { borderRadius: radius.full, backgroundColor: palette.gray950 },
  tab: { height: 36, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingTop: 16 },
  tile: {
    width: 109,
    height: 109,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.gray100,
  },
  // Figma "Lock" icon: 16×16 at (88.5, 4) inside the 109px tile
  lock: { position: 'absolute', top: 4, right: 4.5 },
  popup: {
    position: 'absolute',
    top: 188,
    left: 24,
    right: 24,
    backgroundColor: colors.bgSurface,
    borderRadius: 32,
    padding: 20,
    paddingTop: 28,
  },
  close: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.gray950,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  previewBg: { alignSelf: 'center', width: 200, height: 200, borderRadius: 16, marginVertical: 24 },
  preview: {
    alignSelf: 'center',
    width: 200,
    height: 200,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: palette.gray200,
    marginVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinPill: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    backgroundColor: palette.amber100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: palette.leaf100,
    zIndex: 50,
  },
});
