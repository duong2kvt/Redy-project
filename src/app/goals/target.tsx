import { PickerScreen } from '@/components/picker-screen';
import { useApp } from '@/store/app-store';

/** Frames "choose target weight" → "Chosssed" (5027:5898 → 5027:5822). */
export default function TargetWeight() {
  const v = useApp((s) => s.targetWeight);
  const set = useApp((s) => s.set);
  return (
    <PickerScreen
      progress={0.88}
      question="What your's target weight ?"
      min={30}
      max={150}
      value={v}
      onChange={(targetWeight) => set({ targetWeight })}
      next="/goals/pace"
      unit="kg"
    />
  );
}
