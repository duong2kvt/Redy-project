import { PickerScreen } from '@/components/picker-screen';
import { useApp } from '@/store/app-store';

/** Frames "choose age" (year of birth) 5004:10786 → 5004:10807. */
export default function BirthYear() {
  const v = useApp((s) => s.birthYear);
  const set = useApp((s) => s.set);
  return (
    <PickerScreen
      progress={0.3}
      question="What your’s year of birth ?"
      min={1950}
      max={2012}
      value={v}
      onChange={(birthYear) => set({ birthYear })}
      next="/goals/height"
      itemH={58}
    />
  );
}
