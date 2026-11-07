import { router } from 'expo-router';
import { View } from 'react-native';

import { QuestionScreen } from '@/components/question-screen';
import { ChoiceCard } from '@/components/ui/question';
import { useApp } from '@/store/app-store';

const options = [
  { label: 'Balanced', icon: 'plateUtensils' },
  { label: 'Vegetarian', icon: 'taco' },
  { label: 'Vegan', icon: 'carrot' },
  { label: 'Paleo', icon: 'steak' },
  { label: 'Ketogenic', icon: 'apple' },
  { label: 'High protein', icon: 'egg' },
  { label: 'Low carb', icon: 'bread' },
] as const;

/** Frames "Type of diet" (5004:11452 → 5004:11473). */
export default function Diet() {
  const diet = useApp((s) => s.diet);
  const set = useApp((s) => s.set);
  return (
    <QuestionScreen
      scroll
      progress={0.1}
      question="What type of diet do you prefer?"
      nextDisabled={!diet}
      onNext={() => router.push('/habits/meals')}>
      <View style={{ gap: 16 }}>
        {options.map((o, i) => (
          <ChoiceCard
            key={o.label}
            index={i}
            label={o.label}
            icon={o.icon}
            selected={diet === o.label}
            onPress={() => set({ diet: o.label })}
          />
        ))}
      </View>
    </QuestionScreen>
  );
}
