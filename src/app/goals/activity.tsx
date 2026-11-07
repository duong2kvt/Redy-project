import { router } from 'expo-router';
import { View } from 'react-native';

import { QuestionScreen } from '@/components/question-screen';
import { ChoiceCard } from '@/components/ui/question';
import { useApp, type Activity } from '@/store/app-store';

const options = [
  { id: 'none', label: 'Not active', icon: 'octagonTimes' },
  { id: 'light', label: 'Lightly active', icon: 'shoesRunning' },
  { id: 'moderate', label: 'Moderately active', icon: 'baseball' },
  { id: 'high', label: 'Hightly active', icon: 'dumbbell' },
] as const;

/** Frames "activity level" (5004:10871 → 5004:10856). */
export default function ActivityScreen() {
  const activity = useApp((s) => s.activity);
  const set = useApp((s) => s.set);
  return (
    <QuestionScreen
      progress={0.8}
      question="Choose your activity level"
      nextDisabled={!activity}
      onNext={() => router.push('/goals/bmi')}>
      <View style={{ gap: 16 }}>
        {options.map((o, i) => (
          <ChoiceCard
            key={o.id}
            index={i}
            label={o.label}
            icon={o.icon}
            selected={activity === o.id}
            onPress={() => set({ activity: o.id as Activity })}
          />
        ))}
      </View>
    </QuestionScreen>
  );
}
