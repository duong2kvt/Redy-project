import { router } from 'expo-router';
import { View } from 'react-native';

import { QuestionScreen } from '@/components/question-screen';
import { ChoiceCard } from '@/components/ui/question';
import { useApp } from '@/store/app-store';

const options = [
  { label: 'Cook at home', icon: 'hatChef' },
  { label: 'Oder delivery', icon: 'foodTray' },
  { label: 'Eat out', icon: 'clipboardMinus' },
] as const;

/** Frames "Eating Context" (5004:11348 → 5004:11396). Multi-select. */
export default function EatingContext() {
  const list = useApp((s) => s.eatingContext);
  const toggle = useApp((s) => s.toggleIn);
  return (
    <QuestionScreen
      progress={0.5}
      question="Where do you usually eat?"
      nextDisabled={list.length === 0}
      onNext={() => router.push('/habits/allergies')}>
      <View style={{ gap: 16 }}>
        {options.map((o, i) => (
          <ChoiceCard
            key={o.label}
            multi
            index={i}
            label={o.label}
            icon={o.icon}
            selected={list.includes(o.label)}
            onPress={() => toggle('eatingContext', o.label)}
          />
        ))}
      </View>
    </QuestionScreen>
  );
}
