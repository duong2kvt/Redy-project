import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';

const APath = Animated.createAnimatedComponent(Path);

// Eye geometry measured on "Character stand 1" (280×280 artwork).
// rx/ry are slightly larger than the white of the eye so the lid fully covers it.
type Eye = { cx: number; cy: number; rx: number; ry: number };
const EYES: Record<'left' | 'right', Eye> = {
  left: { cx: 116, cy: 114.5, rx: 18, ry: 20.5 },
  right: { cx: 169.5, cy: 114, rx: 17.5, ry: 20.5 },
};
const LID = '#EBC7A5'; // fur ring around the eyes
const LASH = '#2A1410';

/**
 * The lid is drawn as a real eye-shaped path (no rectangle, no clip mask):
 * the top of the eye ellipse down to the lid edge, and the edge itself is a
 * soft downward curve — like an eyelid sliding over the eyeball.
 * 0 = open, 1 = closed.
 */
function Lid({ eye, v }: { eye: Eye; v: SharedValue<number> }) {
  const { cx, cy, rx, ry } = eye;

  const lid = useAnimatedProps(() => {
    const p = Math.min(1, Math.max(0, v.value));
    if (p < 0.01) return { d: 'M0 0', fillOpacity: 0 };
    if (p > 0.97) {
      // fully closed: the whole eye
      return {
        d: `M${cx - rx} ${cy} A${rx} ${ry} 0 1 1 ${cx + rx} ${cy} A${rx} ${ry} 0 1 1 ${cx - rx} ${cy} Z`,
        fillOpacity: 1,
      };
    }
    // lid edge height and the half-width of the ellipse at that height
    const y = cy - ry + 2 * ry * p;
    const t = (y - cy) / ry;
    const w = rx * Math.sqrt(Math.max(0, 1 - t * t));
    const large = y > cy ? 1 : 0;
    // curved lower edge: bulges downward a little, most when half-closed
    const sag = 7 * Math.sin(Math.PI * p);
    return {
      d: `M${cx - w} ${y} A${rx} ${ry} 0 ${large} 1 ${cx + w} ${y} Q${cx} ${y + sag} ${cx - w} ${y} Z`,
      fillOpacity: 1,
    };
  });

  // closed-eye crease, fades in at the end of the blink
  const lash = useAnimatedProps(() => ({ strokeOpacity: v.value > 0.8 ? (v.value - 0.8) * 5 : 0 }));

  return (
    <G>
      <APath fill={LID} animatedProps={lid} />
      <APath
        d={`M${cx - rx + 4} ${cy + 3} Q${cx} ${cy + 11} ${cx + rx - 4} ${cy + 3}`}
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
 * Animated eyelids drawn over the mascot artwork so Redy can blink
 * (0 = open, 1 = closed). Sits inside the mascot's transform so it follows it.
 */
export function Eyelids({ left, right }: { left: SharedValue<number>; right: SharedValue<number> }) {
  return (
    <Svg
      width={280}
      height={280}
      viewBox="0 0 280 280"
      style={{ position: 'absolute', left: 0, top: 0 }}
      pointerEvents="none">
      <Lid eye={EYES.left} v={left} />
      <Lid eye={EYES.right} v={right} />
    </Svg>
  );
}
