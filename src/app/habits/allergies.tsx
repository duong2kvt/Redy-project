import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import { QuestionScreen } from '@/components/question-screen';
import { Chip } from '@/components/ui/question';
import { useApp } from '@/store/app-store';
import { fonts, palette } from '@/theme/tokens';

const BASE = [
  'All meat',
  'Animal products',
  'Fish',
  'Dairy',
  'Eggs',
  'Seafood',
  'Gluten',
  'Seeds',
  'Soy',
  'Citrus fruits',
  'Shellfish',
];

/** Frames "Food restrictions or allergies" (5004:11494 → 5004:11516). */
export default function Allergies() {
  const list = useApp((s) => s.allergies);
  const toggle = useApp((s) => s.toggleIn);
  const [extra, setExtra] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const all = [...BASE, ...extra];

  const commit = () => {
    const v = draft.trim();
    if (v && !all.includes(v)) {
      setExtra((e) => [...e, v]);
      toggle('allergies', v);
    }
    setDraft('');
    setAdding(false);
  };

  return (
    <QuestionScreen
      progress={0.75}
      question="Do you have any food restrictions or allergies?"
      onNext={() => router.push('/habits/change')}>
      <Animated.View
        layout={LinearTransition.springify()}
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 4,
          paddingHorizontal: 24,
          paddingTop: 40,
        }}>
        {all.map((a, i) => (
          <Chip key={a} index={i} label={a} on={list.includes(a)} onPress={() => toggle('allergies', a)} />
        ))}
        {adding ? (
          <Animated.View
            entering={FadeIn}
            style={{
              height: 56,
              minWidth: 120,
              borderRadius: 16,
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: palette.tomato500,
              justifyContent: 'center',
              paddingHorizontal: 16,
            }}>
            <TextInput
              autoFocus
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={commit}
              onBlur={commit}
              placeholder="Type…"
              placeholderTextColor={palette.gray400}
              style={[
                { fontFamily: fonts.medium, fontSize: 16, color: palette.gray950 },
                { outlineStyle: 'none' } as object,
              ]}
            />
          </Animated.View>
        ) : (
          <Chip
            index={all.length}
            label={<Plus size={22} color={palette.gray950} />}
            on={false}
            onPress={() => setAdding(true)}
          />
        )}
      </Animated.View>
      <View style={{ height: 20 }} />
    </QuestionScreen>
  );
}
