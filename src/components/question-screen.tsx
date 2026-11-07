import { type ReactNode } from 'react';
import { View } from 'react-native';

import { RedyBubble } from './ui/question';
import { Footer, Header, Screen } from './ui/screen';

export function QuestionScreen({
  progress,
  question,
  children,
  onNext,
  nextDisabled,
  scroll,
  center,
}: {
  progress: number;
  question: string;
  children: ReactNode;
  onNext: () => void;
  nextDisabled?: boolean;
  scroll?: boolean;
  center?: boolean;
}) {
  return (
    <Screen
      scroll={scroll}
      header={<Header progress={progress} />}
      footer={<Footer onPress={onNext} disabled={nextDisabled} floating={scroll} />}>
      <RedyBubble text={question} />
      <View
        style={[
          { flex: scroll ? undefined : 1, paddingTop: 30 },
          center && { justifyContent: 'center', paddingTop: 0 },
        ]}>
        {children}
      </View>
    </Screen>
  );
}
