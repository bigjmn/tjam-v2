import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
	Gesture,
	GestureDetector,
	GestureHandlerRootView,
} from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	withDelay,
	runOnJS,
	Easing,
} from "react-native-reanimated";
import LineSquareLayer from "./LineSquareLayer";
import { useFiveline } from "./usFiveline";
import ThemedView from "../ui/ThemedView";
import { useSfx } from "../../hooks/useSfx";
import ThemedButton from "../ui/ThemedButton";
import { GameHeader } from "../game/GameHeader";
import ExitConfirmModal from "../game/ExitConfirmModal";
import { useUser } from "../../hooks/useUser";
import ThemedText from "../ui/ThemedText";
import { useTheme } from "../../hooks/useTheme";

function Tile({
	id,
	letter,
	startx,
	starty,
	givePos,
	takenSpots,
	canMove,
	partValid,
	claimMovement,
	inMotion,
	isNew,
	isHomeRowExiting,
	shouldFlip,
	shouldPinwheel,
}: TileProps) {
	const isPressed = useSharedValue(false);
	const offsetX = useSharedValue(0);
	const offsetY = useSharedValue(0);
	const homeOffset = starty === 0 ? 70 : 0;
	const targetX = startx * 70 + 3 + homeOffset;
	const targetY = starty * 70 + 3;
	const translateX = useSharedValue(isNew ? targetX + 380 : targetX);
	const translateY = useSharedValue(targetY);
	const sitsOn = useSharedValue(startx.toString() + starty.toString());
	const { popSound } = useSfx();

	const rotateY = useSharedValue(0);
	const pinwheelRotate = useSharedValue(0);
	const pinwheelScale = useSharedValue(1);

	const SLIDE_DURATION = 280;
	const FLIP_DURATION = 800;

	const { colors } = useTheme();

	useEffect(() => {
		
		if (isNew && starty === 0) {
			const delay = 20;
			translateX.value = withDelay(
				delay,
				withTiming(targetX, {
					duration: SLIDE_DURATION,
					easing: Easing.out(Easing.cubic),
				}),
			);
		}
	}, [isNew]);

	useEffect(() => {
		if (isHomeRowExiting) {
			const delay = 50;
			translateX.value = withDelay(
				delay,
				withTiming(translateX.value - 380, {
					duration: SLIDE_DURATION,
					easing: Easing.linear,
				}),
			);
		}
	}, [isHomeRowExiting]);

	useEffect(() => {
		if (shouldFlip) {
			rotateY.value = withTiming(180, {
				duration: FLIP_DURATION,
				easing: Easing.out(Easing.cubic),
			});
		}
	}, [shouldFlip]);

	useEffect(() => {
		if (shouldPinwheel) {
			pinwheelRotate.value = withTiming(540, {
				duration: FLIP_DURATION,
				easing: Easing.out(Easing.cubic),
			});
			pinwheelScale.value = withTiming(0, {
				duration: FLIP_DURATION,
				easing: Easing.out(Easing.cubic),
			});
		}
	}, [shouldPinwheel]);

	const moveTile = useCallback(
		(to: string) => {
			const dest = takenSpots.includes(to)
				? sitsOn.value
				: allSquares().includes(to)
					? to
					: sitsOn.value;
			const { x, y } = toTranslation(dest);
			translateX.value = withTiming(x, { duration: 200 }, () => {
				offsetX.value = translateX.value;
			});
			translateY.value = withTiming(y, { duration: 200 }, () => {
				offsetY.value = translateY.value;
				sitsOn.value = dest;
				isPressed.value = false;
			});
			givePos(id, dest);
		},
		[takenSpots, partValid],
	);

	const animatedStyles = useAnimatedStyle(() => {
		const transforms: any[] = [
			{ translateX: translateX.value },
			{ translateY: translateY.value },
		];

		if (pinwheelScale.value < 1) {
			transforms.push({ rotate: `${pinwheelRotate.value}deg` });
			transforms.push({ scale: pinwheelScale.value });
		}

		return {
			transform: transforms,
			zIndex: isPressed.value ? 100 : 10,
			backgroundColor: canMove
				? "#85F2EB"
				: partValid.includes(sitsOn.value)
					? colors.tileValid
					: colors.tileFrozen,
		};
	});

	const frontFaceStyle = useAnimatedStyle(() => ({
		transform: [{ rotateY: `${rotateY.value}deg` }],
		backfaceVisibility: "hidden",
		position: "absolute",
		width: "100%",
		height: "100%",
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 12,
	}));

	const backFaceStyle = useAnimatedStyle(() => ({
		transform: [{ rotateY: `${rotateY.value + 180}deg` }],
		backfaceVisibility: "hidden",
		position: "absolute",
		width: "100%",
		height: "100%",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: colors.tileFrozen,
		borderRadius: 12,
	}));

	const underlay = useAnimatedStyle(() => {
		const position = toPosition({
			x: translateX.value,
			y: translateY.value,
		});
		const translation = toTranslation(position);
		return {
			transform: [
				{ translateX: translation.x },
				{ translateY: translation.y },
			],
			zIndex: 0,
			backgroundColor: !inMotion
				? "transparent"
				: ["00", "10", "20", "02", "12", "22", "32", "42"].includes(
							position,
					  )
					? "#aaa"
					: "transparent",
		};
	});

	const panGesture = Gesture.Pan()
		.enabled(canMove && (inMotion == null || inMotion == id))
		.onStart(() => {
			offsetX.value = translateX.value;
			offsetY.value = translateY.value;
			isPressed.value = true;
			runOnJS(claimMovement)(id);
		})
		.onUpdate(({ translationX, translationY }) => {
			translateX.value = offsetX.value + translationX;
			translateY.value = offsetY.value + translationY;
		})
		.onEnd(() => {
			isPressed.value = false;
			runOnJS(popSound)();
			runOnJS(moveTile)(
				toPosition({ x: translateX.value, y: translateY.value }),
			);
		});

	return (
		<>
			<Animated.View style={[styles.underlay, underlay]} />
			<GestureDetector gesture={panGesture}>
				<Animated.View style={[styles.baseTile, animatedStyles]}>
					{shouldFlip ? (
						<>
							<Animated.View style={frontFaceStyle}>
								<Text style={styles.baseText}>{letter}</Text>
							</Animated.View>
							<Animated.View style={backFaceStyle}>
								<Text style={styles.baseText}>{letter}</Text>
							</Animated.View>
						</>
					) : (
						<Text style={styles.baseText}>{letter}</Text>
					)}
				</Animated.View>
			</GestureDetector>
		</>
	);
}

export default function FivelineGame() {
	const {
		tiles,
		inMotion,
		validRows,
		validBoard,
		takenSpots,
		givePos,
		claimMovement,
		wordNum,
		frozenHome,
		startGame,
		handleAbandonGame,
		handleCommitMove,
		isAnimating,
		flippingTileIds,
		pinwheelingTileIds,
	} = useFiveline();

	const { playerStats, updatePlayerStats } = useUser();
	const [showExitModal, setShowExitModal] = useState(false);

	useFocusEffect(
		useCallback(() => {
			startGame();
		}, []),
	);

	const confirmExit = async () => {
		setShowExitModal(false);
		// Variant games don't add to gameHist
		handleAbandonGame();
	};

	return (
		<GestureHandlerRootView>
			<ThemedView style={styles.outerContainer}>
				<GameHeader
					onExitPress={() => setShowExitModal(true)}
					headerName="1D-o Jam"
				/>
				<ExitConfirmModal
					visible={showExitModal}
					onCancel={() => setShowExitModal(false)}
					onConfirm={confirmExit}
				/>
				<ThemedView style={styles.gameWrapper}>
					<ThemedView style={styles.mainBoard}>
						<ThemedView style={styles.layerWrapper}>
							<LineSquareLayer />
						</ThemedView>
						<ThemedView style={styles.layerWrapper}>
							{tiles?.map((tile) => (
								<Tile
									key={tile.id}
									id={tile.id}
									partValid={validRows}
									letter={tile.letter}
									startx={tile.x}
									starty={tile.y}
									givePos={givePos}
									claimMovement={claimMovement}
									inMotion={inMotion}
									takenSpots={takenSpots}
									canMove={
										tile.canMove && tile.id != frozenHome
									}
									isNew={tile.isNew}
									isHomeRowExiting={tile.isHomeRowExiting}
									shouldFlip={flippingTileIds.has(tile.id)}
									shouldPinwheel={pinwheelingTileIds.has(
										tile.id,
									)}
								/>
							))}
						</ThemedView>
					</ThemedView>
					<View style={styles.scoreAndButton}>
						<ThemedButton
							disabled={!validBoard || !!inMotion || isAnimating}
							style={[
								styles.buttonStyle,
								{
									opacity:
										!validBoard || !!inMotion || isAnimating
											? 0.3
											: 1,
								},
							]}
							onPress={handleCommitMove}
							hitSlop={10}
						>
							<ThemedText variant="strong">
								Commit Move
							</ThemedText>
						</ThemedButton>
						<View style={styles.scoreHolder}>
							<ThemedText style={styles.scoreText}>
								Points: {wordNum}
							</ThemedText>
						</View>
					</View>
				</ThemedView>
			</ThemedView>
		</GestureHandlerRootView>
	);
}

const toPosition = ({ x, y }: { x: number; y: number }) => {
	"worklet";
	const col = Math.round(y / 70);
	const effectiveX = col === 0 ? x - 70 : x;
	const row = Math.round(effectiveX / 70);
	return row.toString() + col.toString();
};

const toTranslation = (p: string) => {
	"worklet";
	const pos = p.split("");
	const xp = parseInt(pos[0]);
	const yp = parseInt(pos[1]);
	return { x: xp * 70 + 3 + (yp === 0 ? 70 : 0), y: yp * 70 + 3 };
};

const allSquares = () => {
	const home = ["00", "10", "20"];
	const main = ["02", "12", "22", "32", "42"];
	return [...home, ...main];
};

const styles = StyleSheet.create({
	outerContainer: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		padding: 12,
	},
	gameWrapper: {
		width: 300,
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
	},
	mainBoard: {
		position: "relative",
		height: 270,
		width: "100%",
	},
	layerWrapper: {
		flex: 1,
		position: "absolute",
	},
	scoreAndButton: {
		height: 100,
		margin: 10,
		width: "100%",
		display: "flex",
		flexDirection: "column",
		justifyContent: "flex-end",
		alignItems: "center",
		zIndex: 2,
	},
	scoreHolder: {
		height: 40,
		width: 150,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
	scoreText: {
		fontSize: 22,
	},
	baseTile: {
		width: 64,
		height: 64,
		borderRadius: 12,
		position: "absolute",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "black",
	},
	underlay: {
		width: 64,
		height: 64,
		borderRadius: 12,
		position: "absolute",
	},
	baseText: {
		fontSize: 40,
	},
	buttonStyle: {
		height: 50,
		width: 180,
		borderStyle: "solid",
		borderRadius: 10,
		borderWidth: 2,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
});
