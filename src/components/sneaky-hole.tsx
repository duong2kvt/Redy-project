import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { ClipPath, Defs, Ellipse, Image as SvgImage } from 'react-native-svg';

const AnimatedSvgImage = Animated.createAnimatedComponent(SvgImage);

const W = 273;
const H = 138;
// Positions of "Sneaky 1" inside the elliptical mask, from the Figma variants.
const Y_DEFAULT = -13; // Sneaky=Default — head peeks out
const Y_MOVE = -47; // Sneaky=Move — pops up, paws on the rim
// Figma "Ease out" curve.
const EASE_OUT = Easing.bezier(0, 0, 0.58, 1);

/**
 * "Hoping anim" component (5057:6330): Redy pops in and out of a hole.
 * Same mechanics as Figma — one mascot image sliding vertically inside an
 * elliptical mask (no cross-fade), AFTER_TIMEOUT 1s → SMART_ANIMATE 600ms
 * ease-out, looping Default ⇄ Move.
 */
export function SneakyHole({ source }: { source: number }) {
  const y = useSharedValue(Y_DEFAULT);
  useEffect(() => {
    y.set(
      withRepeat(
        withSequence(
          withDelay(1000, withTiming(Y_MOVE, { duration: 600, easing: EASE_OUT })),
          withDelay(1000, withTiming(Y_DEFAULT, { duration: 600, easing: EASE_OUT })),
        ),
        -1,
      ),
    );
  }, [y]);
  const props = useAnimatedProps(() => ({ y: y.value }));

  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Defs>
        <ClipPath id="hole">
          <Ellipse cx={W / 2} cy={H / 2} rx={W / 2} ry={H / 2} />
        </ClipPath>
      </Defs>
      <Ellipse cx={W / 2} cy={H / 2} rx={W / 2} ry={H / 2} fill="#292323" />
      <AnimatedSvgImage
        href={source}
        x={15}
        width={261}
        height={220}
        clipPath="url(#hole)"
        preserveAspectRatio="xMidYMid meet"
        animatedProps={props}
      />
    </Svg>
  );
}
