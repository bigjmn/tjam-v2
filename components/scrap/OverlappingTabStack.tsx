import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  ScrollView,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { FullCarousel } from "../stats/CarouselCard";
type Stat = { label: string; value: string };
export type DeckCard = {
  key: string;
  title: string;
  rightIcon?: React.ReactNode;
  backgroundColor: string;
  headerTextColor?: string;
  bodyTextColor?: string;
  stats: Stat[];
  renderExpanded?: () => React.ReactNode;
};

export function OverlappingTabsDeck({
  cards,
  height,
  peekHeight = 160,
  deckPaddingHorizontal = 16,
  gap = 30,
  fadedOpacity = 0, // ✅ how faded non-active cards get
  style,
}: {
  cards: DeckCard[];
  height: number; // ✅ explicit height from parent
  peekHeight?: number;
  deckPaddingHorizontal?: number;
  gap?: number;
  fadedOpacity?: number;
  style?: ViewStyle;
}) {
  const [activeIndex, setActiveIndex] = useState(-1);

  const collapsedHeight = peekHeight;
  const expandedHeight = Math.min(height, Math.max(320, height * 0.85));

  // no useMemo
  const step = peekHeight - gap;
  const baseYs = cards.map((_, i) => i * step);

  return (
    <View style={[{ width: "100%", height, overflow: "visible" }, style]}>
      {cards.map((card, i) => (
        <DeckStackCard
          key={card.key}
          index={i}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          baseY={baseYs[i]}
          collapsedHeight={collapsedHeight}
          expandedHeight={expandedHeight}
          deckPaddingHorizontal={deckPaddingHorizontal}
          fadedOpacity={fadedOpacity}
          card={card}
        />
      ))}
    </View>
  );
}

function DeckStackCard({
  index,
  activeIndex,
  setActiveIndex,
  baseY,
  collapsedHeight,
  expandedHeight,
  deckPaddingHorizontal,
  fadedOpacity,
  card,
}: {
  index: number;
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  baseY: number;
  collapsedHeight: number;
  expandedHeight: number;
  deckPaddingHorizontal: number;
  fadedOpacity: number;
  card: DeckCard;
}) {
  const isActive = activeIndex === index;
  const anyActive = activeIndex !== -1;

  const animCfg = {
    duration: 1220,
    easing: Easing.bezier(0.2, 0.9, 0.2, 1),
  } as const;

  // When active card moves to top (y=0), we want other cards to live “under” it.
  // Start them right under the expanded card’s visible area, then keep the same stack offsets.
  const underTopBase = Math.max(0, expandedHeight - collapsedHeight);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const targetY = !anyActive
      ? baseY
      : isActive
        ? 0
        : underTopBase + baseY;

    const targetOpacity = !anyActive ? 1 : isActive ? 1 : fadedOpacity;

    return {
      transform: [
        { translateY: withTiming(targetY, animCfg) },
        { scale: withTiming(isActive ? 1.01 : 1, animCfg) },
      ],
      height: withTiming(isActive ? expandedHeight : collapsedHeight, animCfg),
      opacity: withTiming(targetOpacity, {duration:100}),
      shadowOpacity: withTiming(isActive ? 0.22 : 0.12, animCfg),
    };
  }, [
    anyActive,
    isActive,
    baseY,
    underTopBase,
    expandedHeight,
    collapsedHeight,
    fadedOpacity,
  ]);

  const animatedInnerStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isActive ? 1 : 0, animCfg),
      transform: [{ translateY: withTiming(isActive ? 0 : 10, animCfg) }],
    };
  }, [isActive]);

  const onPress = () => setActiveIndex(isActive ? -1 : index);

  return (
    <Animated.View
      style={[
        styles.cardOuter,
        {
          left: deckPaddingHorizontal,
          right: deckPaddingHorizontal,
          backgroundColor: card.backgroundColor,

          // ✅ keep active on top when expanded
          zIndex: anyActive ? (isActive ? 999 : 1) : 100 + index,
        },
        animatedContainerStyle,
      ]}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.cardPressable,
          pressed && { opacity: 0.96 },
        ]}
      >
        <View style={styles.headerRow}>
          <Text
            style={[styles.title, { color: card.headerTextColor ?? "#111" }]}
            numberOfLines={1}
          >
            {card.title}
          </Text>
          <View style={styles.rightIconWrap}>{card.rightIcon}</View>
        </View>

        <View style={styles.statsRow}>
          {card.stats.map((s, idx) => (
            <View key={idx} style={styles.statCell}>
              <Text style={[styles.statValue, { color: card.bodyTextColor ?? "#111" }]}>
                {s.value}
              </Text>
              <Text style={[styles.statLabel, { color: (card.bodyTextColor ?? "#111") + "AA" }]}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        <Animated.View style={[styles.expandedArea, animatedInnerStyle]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 18 }}
          >
            {card.renderExpanded?.() ?? (
              <Text style={[styles.placeholder, { color: card.bodyTextColor ?? "#111" }]}>
                Put your expanded content here…
              </Text>
            )}
          </ScrollView>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    position: "absolute",
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 10,
  },
  cardPressable: {
    flex: 1,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  rightIconWrap: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.9,
  },
  statsRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCell: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 30,
    fontWeight: "700",
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
  },
  expandedArea: {
    flex: 1,
    marginTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.12)",
    paddingTop: 12,
  },
  placeholder: {
    fontSize: 16,
    lineHeight: 22,
    opacity: 0.9,
  },
});

export const testCards = [
    {
      key: "crossword",
      title: "The Crossword",
      backgroundColor: "#6E93D6",
      stats: [
        { value: "878", label: "Puzzles Solved" },
        { value: "47%", label: "Solve Rate" },
        { value: "0", label: "Current Streak" },
        { value: "19", label: "Longest Streak" },
      ],
      renderExpanded: () => (
        <Text style={{ fontSize: 16, lineHeight: 22 }}>
          Expanded details here…
        </Text>
      ),
    },
    {
      key: "bee",
      title: "Spelling Bee",
      backgroundColor: "#F3D21B",
      stats: [
        { value: "10", label: "Puzzles Played" },
        { value: "43", label: "Words" },
        { value: "11", label: "Pangrams" },
        { value: "0", label: "Geniuses" },
      ],
      renderExpanded: () => (
        <FullCarousel />
      )
    },
    {
      key: "wordle",
      title: "Wordle",
      backgroundColor: "#D9DCE1",
      stats: [
        { value: "7", label: "Puzzles Played" },
        { value: "100%", label: "Win Rate" },
        { value: "0", label: "Current Streak" },
        { value: "3", label: "Max Streak" },
      ],
    },
  ]

  export default function TabStackTest(){
    return (
        <View>
            <OverlappingTabsDeck height={520} cards={testCards} />
        </View>
    )
  }