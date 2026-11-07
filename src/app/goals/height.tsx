import { PickerScreen } from '@/components/picker-screen';
import { useApp } from '@/store/app-store';

/** Frame "choose hight" (5004:10970). */
export default function Height() {
  const v = useApp((s) => s.height);
  const set = useApp((s) => s.set);
  return (
    <PickerScreen
      progress={0.6}
      question="How tall are you?"
      min={120}
      max={220}
      value={v}
      onChange={(height) => set({ height })}
      next="/goals/weight"
      unit="cm"
    />
  );
}
