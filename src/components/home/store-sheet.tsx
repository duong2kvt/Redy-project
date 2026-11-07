import { Image } from 'expo-image';
import { Ban, CircleCheck, Lock, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
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
import { img } from '@/theme/assets';
import { colors, palette, radius } from '@/theme/tokens';

import { HERO_H } from './hero';

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
  Background: [
    { id: 'bg-home', kind: 'bg', ref: 'home', image: img.thumbHome },
    { id: 'bg-garden', kind: 'bg', ref: 'garden', image: img.thumbGarden },
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `bg-l${i}`,
      kind: 'locked' as const,
      image: img.thumbBeach,
      price: 120,
      name: 'Beach day',
    })),
  ],
  Hat: [
    { id: 'hat-none', kind: 'hat', ref: 'none' },
    { id: 'hat-antlers', kind: 'hat', ref: 'antlers', image: img.hatAntlers },
    { id: 'hat-viking', kind: 'hat', ref: 'viking', image: img.hatViking, price: 82, name: 'Viking Hat' },
    ...Array.from({ length: 9 }, (_, i) => ({
      id: `hat-l${i}`,
      kind: 'locked' as const,
      image: img.hatViking,
      price: 82,
      name: 'Viking Hat',
    })),
  ],
  Pant: [],
  Shoe: [],
};

/** Pet shop bottom sheet ("Home affter log" 5011:18353 / 5011:19214). */
export function StoreSheet({ onClose, onBought }: { onClose: () => void; onBought: () => void }) {
  const insets = useInsets();
  const [tab, setTab] = useState<Tab>('Background');
  const [buying, setBuying] = useState<Item | null>(null);
  const { hat, ownedHats, background, set, buyHat, coins } = useApp();

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
  const isOwned = (it: Item) => it.kind === 'bg' || (it.kind === 'hat' && ownedHats.includes(it.ref as HatId));

  const onItem = (it: Item) => {
    if (it.kind === 'bg') return set({ background: it.ref as BackgroundId });
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
              <Animated.View
                key={it.id}
                entering={FadeInDown.delay(i * 30)
                  .springify()
                  .damping(16)}>
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
                            : { width: 79, height: 61 }
                        }
                        contentFit={it.kind === 'bg' || tab === 'Background' ? 'cover' : 'contain'}
                      />
                    )}
                    {locked && (
                      <View style={styles.lock}>
                        <Lock size={11} color={palette.gray500} strokeWidth={2.5} />
                      </View>
                    )}
                  </View>
                </PressableScale>
              </Animated.View>
            );
          })}
        </ScrollView>
      </Animated.View>

      {buying && (
        <BuyPopup
          item={buying}
          coins={coins}
          onClose={() => setBuying(null)}
          onBuy={() => {
            const ok = buying.ref ? buyHat(buying.ref as HatId, buying.price ?? 0) : false;
            if (ok) {
              haptic.success();
              setTab('Hat');
              onBought();
            }
            setBuying(null);
          }}
        />
      )}
    </>
  );
}

function Tabs({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  const [layouts, setLayouts] = useState<Record<string, { x: number; w: number }>>({});
  const x = useSharedValue(0);
  const w = useSharedValue(0);
  useEffect(() => {
    const l = layouts[tab];
    if (!l) return;
    if (w.value === 0) {
      x.set(l.x);
      w.set(l.w);
    } else {
      x.set(withSpring(l.x, { damping: 18, stiffness: 220 }));
      w.set(withSpring(l.w, { damping: 18, stiffness: 220 }));
    }
  }, [tab, layouts, w, x]);
  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }], width: w.value }));
  return (
    <View style={styles.tabs}>
      <Animated.View style={[styles.pill, pill]} />
      {TABS.map((t) => (
        <Pressable
          key={t}
          onLayout={(e: LayoutChangeEvent) => {
            const { x: lx, width } = e.nativeEvent.layout;
            setLayouts((p) => ({ ...p, [t]: { x: lx, w: width } }));
          }}
          onPress={() => {
            haptic.select();
            onTab(t);
          }}
          style={[styles.tab, t === 'Background' && { paddingHorizontal: 16 }]}>
          <Txt v="textLgSemi" color={tab === t ? '#fff' : palette.gray400}>
            {t}
          </Txt>
        </Pressable>
      ))}
    </View>
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
        <View style={styles.preview}>
          <Image source={item.image} style={{ width: 120, height: 93 }} contentFit="contain" />
        </View>
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
  pill: { position: 'absolute', top: 4, height: 36, borderRadius: radius.full, backgroundColor: palette.gray950 },
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
  lock: { position: 'absolute', top: 6, right: 6 },
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
