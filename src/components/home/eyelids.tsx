import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import Svg, { ClipPath, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

const ARect = Animated.createAnimatedComponent(Rect);
const APath = Animated.createAnimatedComponent(Path);

// Eye geometry measured on "Character stand 1" (280×280 artwork).
type Eye = { cx: number; cy: number; rx: number; ry: number };
const EYES: Record<'left' | 'right', Eye> = {
  left: { cx: 116, cy: 114.5, rx: 16.5, ry: 19 },
  right: { cx: 169.5, cy: 114, rx: 16, ry: 19 },
};
const LID = '#EBC7A5'; // fur ring around the eyes
const LASH = '#2A1410';

function Lid({ eye, v, id }: { eye: Eye; v: SharedValue<number>; id: string }) {
  const top = eye.cy - eye.ry - 2;
  const full = eye.ry * 2 + 4;
  const lid = useAnimatedProps(() => ({ height: full * v.value }));
  const lash = useAnimatedProps(() => ({ strokeOpacity: v.value > 0.8 ? (v.value - 0.8) * 5 : 0 }));
  return (
    <G>
      <Defs>
        <ClipPath id={id}>
          <Ellipse cx={eye.cx} cy={eye.cy} rx={eye.rx + 1.5} ry={eye.ry + 1.5} />
        </ClipPath>
      </Defs>
      <ARect
        x={eye.cx - eye.rx - 2}
        y={top}
        width={eye.rx * 2 + 4}
        fill={LID}
        clipPath={`url(#${id})`}
        animatedProps={lid}
      />
      <APath
        d={`M${eye.cx - eye.rx + 3} ${eye.cy + 3} Q${eye.cx} ${eye.cy + 11} ${eye.cx + eye.rx - 3} ${eye.cy + 3}`}
        stroke={LASH}
        strokeWidth={3.2}
        strokeLinecap="round"
        fill="none"
        animatedProps={lash}
      />
    </G>
  );
}

/**
 * Animated eyelids drawn over the mascot artwork so Redy can blink and wink
 * (0 = open, 1 = closed). Sits inside the mascot's transform so it follows
 * every bob, sway and hop.
 */
export function Eyelids({ left, right }: { left: SharedValue<number>; right: SharedValue<number> }) {
  return (
    <Svg
      width={280}
      height={280}
      viewBox="0 0 280 280"
      style={{ position: 'absolute', left: 0, top: 0 }}
      pointerEvents="none">
      <Lid eye={EYES.left} v={left} id="lidL" />
      <Lid eye={EYES.right} v={right} id="lidR" />
    </Svg>
  );
}
