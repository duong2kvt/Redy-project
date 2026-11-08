import { router } from 'expo-router';
import { Flame, Store } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, ZoomIn } from 'react-native-reanimated';

import { MealCard, NutritionCard, WaterCard, WeightCard } from '@/components/home/cards';
import { HERO_H, HomeHero } from '@/components/home/hero';
import { NavBar } from '@/components/home/navbar';
import { CoinPill, StoreSheet, Toast } from '@/components/home/store-sheet';
import { PressableScale, Txt, haptic } from '@/components/ui/primitives';
import { useApp } from '@/store/app-store';
import { palette, radius } from '@/theme/tokens';

/**
 * Home (5004:11539) / Open navbar (5004:15356) / Home affter log (5004:14861)
 * + Buy item flow (5011:17807 → 18353 → 19214 → 24266 → 25766 → 26691).
 */
export default function Home() {
  const streak = useApp((s) => s.streak);
  const coins = useApp((s) => s.coins);
  const addWater = useApp((s) => s.addWater);
  const [menu, setMenu] = useState(false);
  const [store, setStore] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [hatDrop, setHatDrop] = useState(0);
  const [jump, setJump] = useState(0);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.set(e.contentOffset.y);
  });
  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: scrollY.value > 0 ? -scrollY.value : -scrollY.value * 0.5 },
      { scale: scrollY.value < 0 ? 1 - scrollY.value / 600 : 1 },
    ],
  }));

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const onAction = (a: 'meal' | 'water' | 'weight') => {
    setMenu(false);
    if (a === 'meal') router.push('/log/camera');
    if (a === 'water') {
      addWater();
      setToast('+200 ml water logged');
    }
    if (a === 'weight') setToast('Weight saved');
  };

  return (
    <View style={styles.root}>
      <Animated.View style={[StyleSheet.absoluteFill, heroStyle]} pointerEvents="box-none">
        <HomeHero hatDrop={hatDrop} jump={jump} />
      </Animated.View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        scrollEnabled={!store}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140, gap: 16 }}
        style={StyleSheet.absoluteFill}>
        <View style={{ height: HERO_H - 16 }}>
          <Pressable
            onPress={() => setJump((n) => n + 1)}
            style={{ position: 'absolute', left: 90, top: 60, width: 200, height: 200 }}
            accessibilityLabel="Pet Redy"
          />
        </View>
        <MealCard onAdd={() => router.push('/log/camera')} />
        <WaterCard />
        <NutritionCard />
        <WeightCard />
      </Animated.ScrollView>

      {/* Top-of-scene controls (Group button 5004:15237) */}
      <Animated.View style={[styles.controls, heroStyle]} pointerEvents="box-none">
        {store ? <CoinPill coins={coins} /> : <View />}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Animated.View entering={ZoomIn.delay(200).springify()} style={styles.streak}>
            <Flame size={18} color={palette.tomato500} fill={palette.tomato500} />
            <Txt v="textLgSemi" color={palette.tomato500}>
              {streak}
            </Txt>
          </Animated.View>
          <PressableScale
            onPress={() => {
              haptic.medium();
              setMenu(false);
              setStore((s) => !s);
            }}
            hapticStyle="none"
            style={styles.storeBtn}
            accessibilityLabel="Pet shop">
            <Store size={20} color="#fff" strokeWidth={2.2} />
          </PressableScale>
        </View>
      </Animated.View>

      {!store && <NavBar open={menu} onToggle={() => setMenu((m) => !m)} onAction={onAction} />}

      {store && (
        <StoreSheet
          onClose={() => setStore(false)}
          onBought={(kind) => {
            if (kind === 'hat') setHatDrop((n) => n + 1);
            setTimeout(() => setToast('Purchase success'), 150);
          }}
        />
      )}
      {toast && <Toast text={toast} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#305C73', overflow: 'hidden' },
  controls: {
    position: 'absolute',
    top: 268,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streak: {
    height: 40,
    minWidth: 66,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    backgroundColor: palette.tomato100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  storeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.tomato500,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
