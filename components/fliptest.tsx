import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Animated, {
  Easing,
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

type TileId = `${number}-${number}`;

const TAN = "#D2B48C";
const GRAY = "#8C8C8C";

function DiagonalPeelTile({
  id,
  peelToken,
  peelTargets,
  size = 80,
  duration = 2260,
}: {
  id: TileId;
  peelToken: number;
  peelTargets: Set<TileId>;
  size?: number;
  duration?: number;
}) {
  // 0 = fully tan (covered), 1 = fully gray (revealed)
  const p = useSharedValue(0);

  React.useEffect(() => {
    if (!peelTargets.has(id)) return;

    // Reveal (no toggle). If you want toggle, see note below.
    p.value = withTiming(1, { duration, easing: Easing.out(Easing.cubic) });
  }, [peelToken, peelTargets, id, duration, p]);

  const big = size * 4;
    const travel = size * 3.8;

  const filmStyle = useAnimatedStyle(() => {
    // IMPORTANT: p=0 should cover, p=1 should be off.
    // If yours is reversed, swap travel signs.
    const tx = interpolate(p.value, [0, 1], [travel, -travel], Extrapolate.CLAMP);

    return {
      position: "absolute",
      width: big,
      height: big,
      left: (size - big) / 2,
      top: (size - big) / 2,
      backgroundColor: TAN,
      transform: [{ rotateZ: "45deg" }, { translateX: tx }],
    };
  });

  const lipStyle = useAnimatedStyle(() => {
    const tx = interpolate(p.value, [0, 1], [travel, -travel], Extrapolate.CLAMP);
    return {
      opacity: interpolate(p.value, [0, 0.15, 0.9, 1], [0, 0.25, 0.25, 0], Extrapolate.CLAMP),
      transform: [{ rotateZ: "45deg" }, { translateX: tx }],
    };
  });

  return (
    <View style={[styles.tile, { width: size, height: size }]}>
      {/* Underlayer */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: GRAY }]} />

      {/* Tan film (starts fully covering) */}
      <Animated.View style={filmStyle} />

      {/* Peel boundary lip */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            width: big,
            height: 10,
            left: (size - big) / 2,
            top: (size - 10) / 2,
            backgroundColor: "rgba(0,0,0,0.25)",
          },
          lipStyle,
        ]}
      />
    </View>
  );
}

export function Grid3x3() {
  const rows = 3;
  const cols = 3;

  const [peelToken, setPeelToken] = React.useState(0);
  const [peelTargets, setPeelTargets] = React.useState<Set<TileId>>(new Set());

  const peelInUnison = (targets: TileId[]) => {
    setPeelTargets(new Set(targets));
    setPeelToken((t) => t + 1);
  };

  const tileSize = 80;
  const gap = 10;
  const gridWidth = cols * tileSize + (cols - 1) * gap;

  return (
    <View style={{ padding: 16 }}>
      <Pressable
        onPress={() => peelInUnison(["0-0", "1-2"])}
        style={{ height: 36, borderRadius: 10, backgroundColor: "#ddd", marginBottom: 16 }}
      />

      <View style={{ width: gridWidth, flexDirection: "row", flexWrap: "wrap", gap }}>
        {Array.from({ length: rows * cols }).map((_, i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const id = `${r}-${c}` as TileId;

          return (
            <DiagonalPeelTile
              key={id}
              id={id}
              peelToken={peelToken}
              peelTargets={peelTargets}
              size={tileSize}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: 12,
    overflow: "hidden",
    margin: 5,
  },
});
