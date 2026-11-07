import { PickerScreen } from '@/components/picker-screen';
import { useApp } from '@/store/app-store';

/** Frames "choose weight" (5004:11077 → 5004:11093). */
export default function Weight() {
  const v = useApp((s) => s.weight);
  const set = useApp((s) => s.set);
  return (
    <PickerScreen
      progress={0.75}
      question="What your's current weight ?"
      min={30}
      max={150}
      value={v}
      onChange={(weight) => set({ weight })}
      next="/goals/activity"
      unit="kg"
    />
  );
}
