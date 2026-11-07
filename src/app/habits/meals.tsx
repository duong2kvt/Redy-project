import { PickerScreen } from '@/components/picker-screen';
import { useApp } from '@/store/app-store';

/** Frames "Meals per day" (5004:11410 → 5004:11431). */
export default function MealsPerDay() {
  const v = useApp((s) => s.mealsPerDay);
  const set = useApp((s) => s.set);
  return (
    <PickerScreen
      progress={0.3}
      question="How many meals per day do you usually have?"
      min={1}
      max={8}
      value={v}
      onChange={(mealsPerDay) => set({ mealsPerDay })}
      next="/habits/context"
      itemH={60}
    />
  );
}
