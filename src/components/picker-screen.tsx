import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { QuestionScreen } from './question-screen';
import { WheelPicker } from './ui/question';

export function PickerScreen({
  progress,
  question,
  min,
  max,
  step = 1,
  value,
  onChange,
  next,
  unit,
  itemH = 76,
  visible = 5,
}: {
  progress: number;
  question: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  next: Href;
  unit?: string;
  itemH?: number;
  visible?: number;
}) {
  const values = useMemo(() => {
    const out: number[] = [];
    for (let v = min; v <= max; v += step) out.push(v);
    return out;
  }, [min, max, step]);
  return (
    <QuestionScreen progress={progress} question={question} onNext={() => router.push(next)} center>
      <View style={{ alignSelf: 'stretch' }}>
        <WheelPicker values={values} value={value} onChange={onChange} unit={unit} itemH={itemH} visible={visible} />
      </View>
    </QuestionScreen>
  );
}
