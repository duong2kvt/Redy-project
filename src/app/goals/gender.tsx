import { router } from 'expo-router';
import { View } from 'react-native';

import { QuestionScreen } from '@/components/question-screen';
import { ChoiceCard } from '@/components/ui/question';
import { useApp, type Gender } from '@/store/app-store';

const options: { id: Gender; label: string; icon: 'female' | 'male' | 'starHalf' }[] = [
  { id: 'female', label: 'Female', icon: 'female' },
  { id: 'male', label: 'Male', icon: 'male' },
  { id: 'other', label: 'Prefer not to say', icon: 'starHalf' },
];

/** Frames "choose age" (gender) 5004:10828 → 5004:10842. */
export default function GenderScreen() {
  const gender = useApp((s) => s.gender);
  const set = useApp((s) => s.set);
  return (
    <QuestionScreen
      progress={0.1}
      question="Choose your gender"
      nextDisabled={!gender}
      onNext={() => router.push('/goals/birth-year')}>
      <View style={{ gap: 16 }}>
        {options.map((o, i) => (
          <ChoiceCard
            key={o.id}
            index={i}
            label={o.label}
            icon={o.icon}
            selected={gender === o.id}
            onPress={() => set({ gender: o.id })}
          />
        ))}
      </View>
    </QuestionScreen>
  );
}
