import { router } from 'expo-router';
import { View } from 'react-native';

import { QuestionScreen } from '@/components/question-screen';
import { ChoiceCard } from '@/components/ui/question';
import { useApp } from '@/store/app-store';

const options = [
  { label: 'Reduce sugar intake', icon: 'boxes' },
  { label: 'Eat less junk food', icon: 'donut' },
  { label: 'Stop binge eating', icon: 'hourglass' },
  { label: 'Eat more green & veggies', icon: 'carrot' },
  { label: 'Stop stress overeating', icon: 'heartTimes' },
  { label: 'Cook at home more often', icon: 'hatChef' },
] as const;

/** Frames "Want to change eating habits?" (5004:11362 → 5004:11379). */
export default function ChangeHabits() {
  const list = useApp((s) => s.habitChanges);
  const toggle = useApp((s) => s.toggleIn);
  return (
    <QuestionScreen
      scroll
      progress={0.9}
      question="What would you like to change in your eating habits?"
      onNext={() => router.push('/plan')}>
      <View style={{ gap: 16 }}>
        {options.map((o, i) => (
          <ChoiceCard
            key={o.label}
            multi
            index={i}
            label={o.label}
            icon={o.icon}
            selected={list.includes(o.label)}
            onPress={() => toggle('habitChanges', o.label)}
          />
        ))}
      </View>
    </QuestionScreen>
  );
}
