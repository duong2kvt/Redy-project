import { router } from 'expo-router';
import { ChevronLeft, X } from 'lucide-react-native';
import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { colors, motion } from '@/theme/tokens';

import { Button, PressableScale, ProgressBar, Txt, useInsets } from './primitives';

/**
 * Standard 375×812 screen scaffold from the design:
 * status bar (44) → header (42) → body → bottom action (100) → home indicator (34).
 * Every screen fades in (prototype uses DISSOLVE 300ms between frames).
 */
export function Screen({
  children,
  bg = colors.bgMain,
  background,
  header,
  footer,
  scroll,
  contentStyle,
  fade = true,
}: {
  children: ReactNode;
  bg?: string;
  background?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  fade?: boolean;
}) {
  const insets = useInsets();
  const Body = scroll ? ScrollView : View;
  return (
    <Animated.View
      entering={fade ? FadeIn.duration(motion.dissolve) : undefined}
      style={[styles.fill, { backgroundColor: bg }]}>
      {background}
      <View style={{ height: insets.top }} />
      {header}
      <Body
        style={styles.fill}
        {...(scroll
          ? {
              contentContainerStyle: [{ paddingBottom: 140 }, contentStyle],
              showsVerticalScrollIndicator: false,
            }
          : { style: [styles.fill, contentStyle] })}>
        {children}
      </Body>
      {footer}
    </Animated.View>
  );
}

/** Bottom action area with the primary CTA. Floats over content like in Figma. */
export function Footer({
  label = 'Next',
  onPress,
  disabled,
  children,
  floating,
}: {
  label?: string;
  onPress?: () => void;
  disabled?: boolean;
  children?: ReactNode;
  floating?: boolean;
}) {
  const insets = useInsets();
  return (
    <View
      style={[
        styles.footer,
        { paddingBottom: insets.bottom + 16 },
        floating && { position: 'absolute', left: 0, right: 0, bottom: 0 },
      ]}
      pointerEvents="box-none">
      <Button label={label} onPress={onPress} disabled={disabled} />
      {children}
    </View>
  );
}

/** Navbar: back chevron + optional progress bar / title / close. */
export function Header({
  progress,
  title,
  close,
  back = true,
  onBack,
  right,
  tint = colors.contentStrong,
}: {
  progress?: number;
  title?: string;
  close?: boolean;
  back?: boolean;
  onBack?: () => void;
  right?: ReactNode;
  tint?: string;
}) {
  const goBack = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));
  return (
    <View style={styles.header}>
      <View style={styles.headerSide}>
        {back && (
          <PressableScale onPress={goBack} hitSlop={12} accessibilityLabel={close ? 'Close' : 'Back'}>
            {close ? (
              <X size={24} color={tint} strokeWidth={2} />
            ) : (
              <ChevronLeft size={28} color={tint} strokeWidth={1.75} />
            )}
          </PressableScale>
        )}
      </View>
      <View style={styles.headerCenter}>
        {progress !== undefined && <ProgressBar value={progress} width={200} />}
        {title && (
          <Txt v="textLgSemi" color={tint}>
            {title}
          </Txt>
        )}
      </View>
      <View style={[styles.headerSide, { alignItems: 'flex-end' }]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 5,
  },
  headerSide: { width: 48, justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  footer: { paddingHorizontal: 24, paddingTop: 28, gap: 16, alignItems: 'center' },
});
