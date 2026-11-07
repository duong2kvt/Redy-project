import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pencil } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Button, Txt } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/screen';
import { useApp } from '@/store/app-store';
import { img } from '@/theme/assets';
import { colors, fonts, palette } from '@/theme/tokens';

/**
 * Frames "Type name" (5004:10612 → 5004:14543).
 * The peeking mascot is the "Hoping anim" component: Sneaky=Default ⇄
 * Sneaky=Move, AFTER_TIMEOUT 1s, SMART_ANIMATE 600ms ease-out.
 */
export default function TypeName() {
  const stored = useApp((s) => s.petName);
  const set = useApp((s) => s.set);
  const [name, setName] = useState(stored);
  const [focused, setFocused] = useState(false);
  const input = useRef<React.ComponentRef<typeof TextInput>>(null);

  const t = useSharedValue(0);
  useEffect(() => {
    t.set(
      withRepeat(
        withSequence(
          withDelay(1000, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })),
          withDelay(1000, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) })),
        ),
        -1,
      ),
    );
  }, [t]);
  const moveStyle = useAnimatedStyle(() => ({ opacity: t.value }));
  const peekStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -6 * t.value }] }));

  const filled = name.trim().length > 0;
  const submit = () => {
    set({ petName: name.trim() });
    router.push('/goals');
  };

  return (
    <Screen header={<Header />}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Animated.View entering={FadeInDown.springify().damping(16)} style={{ paddingTop: 40, alignItems: 'center' }}>
          <Txt v="textLgSemi" color={palette.gray600}>
            Let introduce you to Kiki
          </Txt>
          <View
            style={[
              styles.inputRow,
              (!filled || focused) && styles.underline,
              filled && !focused && { borderColor: 'transparent' },
            ]}>
            <TextInput
              ref={input}
              value={name}
              onChangeText={setName}
              placeholder="your name"
              placeholderTextColor={palette.gray300}
              autoFocus
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              returnKeyType="go"
              onSubmitEditing={filled ? submit : undefined}
              selectionColor={palette.gray950}
              style={[styles.input, webNoOutline, filled && !focused && { textAlign: 'center' }]}
              maxLength={16}
              autoCapitalize="none"
            />
            {filled && !focused && (
              <Animated.View entering={FadeIn} style={{ position: 'absolute', right: 52 }}>
                <Pencil size={22} color={palette.gray400} onPress={() => input.current?.focus()} />
              </Animated.View>
            )}
          </View>
        </Animated.View>

        <View style={styles.holeWrap}>
          <Animated.View style={peekStyle}>
            <Image source={img.holeDefault} style={styles.hole} />
            <Animated.View style={[StyleSheet.absoluteFill, moveStyle]}>
              <Image source={img.holeMove} style={styles.hole} />
            </Animated.View>
          </Animated.View>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 }}>
          <Button label="Next" onPress={submit} disabled={!filled} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const webNoOutline = { outlineStyle: 'none' } as object;

const styles = StyleSheet.create({
  inputRow: {
    marginTop: 16,
    width: 327,
    height: 44,
    justifyContent: 'center',
    borderBottomWidth: 1.5,
    borderColor: 'transparent',
  },
  underline: { borderColor: colors.contentStrong },
  input: {
    fontFamily: fonts.displaySemi,
    fontSize: 28,
    color: palette.gray950,
    paddingHorizontal: 88,
    paddingVertical: 0,
    height: 40,
  },
  holeWrap: { alignItems: 'center', marginTop: 50 },
  hole: { width: 273, height: 138 },
});
