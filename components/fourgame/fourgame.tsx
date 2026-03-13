import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import {
	Gesture,
	GestureDetector,
	GestureHandlerRootView,
} from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withTiming,
	withSequence,
	withDelay,
	runOnJS,
	Easing,
} from "react-native-reanimated";
import SquareLayer from "./FourSquareLayer";
import { useFourgame } from "./useFourgame";
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
	//active is tile is being moved
	const isPressed = useSharedValue(false);
	//tracking changed x, y for given move.
	//decoupled for ease of animation
	const offsetX = useSharedValue(0);
	const offsetY = useSharedValue(0);
	//total offset from 0, 0
	const targetX = startx * 70 + 3;
	const targetY = starty * 70 + 3;
	const translateX = useSharedValue(isNew ? targetX + 380 : targetX);
	const translateY = useSharedValue(targetY);
	// const opacity = useSharedValue(isNew ? 0 : 1);
	//id of the square the tile is on
	const sitsOn = useSharedValue(startx.toString() + starty.toString());
	const { popSound } = useSfx();

	// Animation values for flip and pinwheel
	const rotateY = useSharedValue(0);
	const pinwheelRotate = useSharedValue(0);
	const pinwheelScale = useSharedValue(1);

	const SLIDE_DURATION = 520;
	// const STAGGER = 60; // ms delay per column index
	const FLIP_DURATION = 800;

	const { colors } = useTheme()


	// Entrance animation for new home row tiles
	useEffect(() => {
		
		if (isNew && starty === 0) {
			const delay = 400
			// const delay = startx * STAGGER;
			translateX.value = withDelay(
				delay,
				withTiming(targetX, {
					duration: SLIDE_DURATION,
					// easing: Easing.out(Easing.cubic),
					easing: Easing.linear
				}),
			);
			// opacity.value = withDelay(delay, withTiming(1, { duration: 80 }));
		}
	}, [isNew]);

	// Exit animation for home row tiles
	useEffect(() => {
		if (isHomeRowExiting) {
			// gearloadSound()
			const delay = 50
			// const delay = startx * STAGGER;
			translateX.value = withDelay(
				delay,
				withTiming(translateX.value - 380, {
					duration: SLIDE_DURATION,
					easing: Easing.linear
					// easing: Easing.in(Easing.cubic),
				}),
			);
			// opacity.value = withDelay(
			// 	delay,
			// 	withTiming(0, { duration: SLIDE_DURATION - 40 }),
			// );
		}
	}, [isHomeRowExiting]);

	// Flip animation for tan tiles becoming gray
	useEffect(() => {
		if (shouldFlip) {
			rotateY.value = withTiming(180, {
				duration: FLIP_DURATION,
				easing: Easing.out(Easing.cubic),
			});
		}
	}, [shouldFlip]);

	// Pinwheel animation for green tiles
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

	//moving tile when touch ends.
	const moveTile = useCallback(
		(to: string) => {
			//id of "wanted" square. if the spot is taken, move back to orig. if not taken, move there.
			//if not valid, move back to orig.
			const dest = takenSpots.includes(to)
				? sitsOn.value
				: allSquares().includes(to)
					? to
					: sitsOn.value;
			//get the x and y coordinates of the destination square id
			const { x, y } = toTranslation(dest);
			//animating x to destination
			translateX.value = withTiming(x, { duration: 200 }, () => {
				offsetX.value = translateX.value;
			});
			//animating y, plus the callback of setting the new square id
			translateY.value = withTiming(y, { duration: 200 }, () => {
				offsetY.value = translateY.value;
				sitsOn.value = dest;

				isPressed.value = false;
			});
			//tell board to update tile's position
			givePos(id, dest);
		},
		[
			isPressed,
			offsetX,
			offsetY,
			translateX,
			translateY,
			sitsOn,
			takenSpots,
			partValid,
		],
	);

	//prevent moving multiple tiles at a time
	//dynamic styles
	const animatedStyles = useAnimatedStyle(() => {
		const transforms: any[] = [
			{ translateX: translateX.value },
			{ translateY: translateY.value },
		];

		// Add pinwheel transforms if pinwheeling
		if (pinwheelScale.value < 1) {
			transforms.push({ rotate: `${pinwheelRotate.value}deg` });
			transforms.push({ scale: pinwheelScale.value });
		}

		return {
			transform: transforms,
			//make sure active tile is the top layer
			zIndex: isPressed.value ? 100 : 10,
			//moveable tiles always tan. parts of word green, otherwise gray
			backgroundColor: canMove
				? colors.tileMovable
				: partValid.includes(sitsOn.value)
					? colors.tileValid
					: colors.tileFrozen,
			// opacity: opacity.value,
		};
	});

	// Front face style for flip animation
	const frontFaceStyle = useAnimatedStyle(() => ({
		transform: [{ rotateY: `${rotateY.value}deg` }],
		backfaceVisibility: 'hidden',
		position: 'absolute',
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius:12
	}));

	// Back face style for flip animation (pre-rotated 180deg)
	const backFaceStyle = useAnimatedStyle(() => ({
		transform: [{ rotateY: `${rotateY.value + 180}deg` }],
		backfaceVisibility: 'hidden',
		position: 'absolute',
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.tileFrozen,
		borderRadius:12
	}));
	//style of 'shadow' on square currently dragged over
	const underlay = useAnimatedStyle(() => {
		//real offset -> square position -> position of square.
		//not most efficient but uses pre-defined helper functions. not sure
		//if it's worth it to tighten this up.
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
			backgroundColor: !inMotion ? "transparent" : [
				"00",
				"10",
				"20",
				"02",
                "30",
				"12",
				"22",
                "32",
				"03",
				"13",
				"23",
                "33",
				"04",
				"14",
				"24",
                "34"
			].includes(position)
				? "#aaa"
				: "transparent",
		};
	});
	// new tile dragging event
	const panGesture = Gesture.Pan()
		.enabled(canMove && (inMotion == null || inMotion == id))
		.onStart(() => {
			offsetX.value = translateX.value;
			offsetY.value = translateY.value;
			isPressed.value = true;
			runOnJS(claimMovement)(id);
		})
		.onUpdate(({ translationX, translationY }) => {
			//set new translation values based on total movement from "original"
			translateX.value = offsetX.value + translationX;
			translateY.value = offsetY.value + translationY;
		})
		.onEnd(() => {
			isPressed.value = false;
			runOnJS(popSound)();
			//callback run on js thread
			runOnJS(moveTile)(
				toPosition({ x: translateX.value, y: translateY.value }),
			);
		});
	//tile dragging event
	//   const onGestureEvent = useAnimatedGestureHandler({
	//     onStart: () => {

	//       //tile starts out centered, so offset and translation are aligned.
	//       offsetX.value = translateX.value;
	//       offsetY.value = translateY.value;
	//       isPressed.value = true;
	//       runOnJS(claimMovement)(id)
	//     },
	//     onActive: ({ translationX, translationY }) => {

	//       //set new translation values based on total movement from "original"
	//       translateX.value = offsetX.value + translationX;
	//       translateY.value = offsetY.value + translationY;
	//     },
	//     onFail: () => {
	//       runOnJS(claimMovement)(null)
	//       isPressed.value = false
	//     },
	//     onEnd: () => {
	//       isPressed.value = false
	//       //callback run on js thread
	//       runOnJS(moveTile)(
	//         toPosition({ x: translateX.value, y: translateY.value })
	//       );
	//     }
	//   });

	return (
		<>
			<Animated.View style={[styles.underlay, underlay]} />

			<GestureDetector gesture={panGesture}>
				<Animated.View style={[styles.baseTile, animatedStyles]}>
					{shouldFlip ? (
						// Render front and back faces for flip animation
						<>
							<Animated.View style={frontFaceStyle}>
								<Text style={styles.baseText}>{letter}</Text>
							</Animated.View>
							<Animated.View style={backFaceStyle}>
								<Text style={styles.baseText}>{letter}</Text>
							</Animated.View>
						</>
					) : (
						// Normal rendering
						<Text style={styles.baseText}>{letter}</Text>
					)}
				</Animated.View>
			</GestureDetector>
		</>
	);
}

export default function Game() {
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
		nextTurn,
		startGame,
		handleAbandonGame,
		gameTurns,
		handleCommitMove,
		isAnimating,
		flippingTileIds,
		pinwheelingTileIds,
	} = useFourgame();

	const { playerStats, updatePlayerStats } = useUser();
	const [showExitModal, setShowExitModal] = useState(false);

	useFocusEffect(
		useCallback(() => {
			startGame();
		}, [])
	);

	const openExitModal = () => {
		setShowExitModal(true);
	};

	const closeExitModal = () => {
		setShowExitModal(false);
	};

	const confirmExit = async () => {
		setShowExitModal(false);
		// Variant games don't add to gameHist
		handleAbandonGame();
	};

	return (
		<GestureHandlerRootView>
			<ThemedView style={styles.outerContainer}>
				<GameHeader onExitPress={openExitModal} headerName="Quatro Jam" />
				<ExitConfirmModal
					visible={showExitModal}
					onCancel={closeExitModal}
					onConfirm={confirmExit}
				/>
				<ThemedView style={styles.gameWrapper}>
					<ThemedView style={styles.mainBoard}>
						<ThemedView style={styles.layerWrapper}>
							<SquareLayer />
						</ThemedView>
						<ThemedView style={styles.layerWrapper}>
							{tiles &&
								tiles.map((tile) => (
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
											tile.canMove &&
											tile.id != frozenHome
										}
										isNew={tile.isNew}
										isHomeRowExiting={tile.isHomeRowExiting}
										shouldFlip={flippingTileIds.has(tile.id)}
										shouldPinwheel={pinwheelingTileIds.has(tile.id)}
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
										!validBoard || !!inMotion || isAnimating ? 0.3 : 1,
								},
							]}
							onPress={handleCommitMove}
							hitSlop={10}
						>
							<ThemedText variant="strong">Commit Move</ThemedText>
						</ThemedButton>
						{/* <Pressable
						disabled={!validBoard || !!inMotion}
						style={[
							styles.buttonStyle,
							{ opacity: !validBoard || !!inMotion ? 0.3 : 1 },
						]}
						onPress={nextTurn}
						hitSlop={10}
					>
						<Text style={[styles.buttonText]}>Commit Move</Text>
					</Pressable> */}
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

	const row = Math.round(x / 70);
	const col = Math.round(y / 70);

	return row.toString() + col.toString();
};
const toTranslation = (p: string) => {
	"worklet";

	const pos = p.split("");
	const xp = parseInt(pos[0]);
	const yp = parseInt(pos[1]);

	const xpos = xp * 70 + 3;
	const ypos = yp * 70 + 3;
	return { x: xpos, y: ypos };
};

const allSquares = () => {
	let squaresList = [];
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 6; j++) {
			if (j == 1) {
				continue;
			}
			let squareId = i.toString() + j.toString();
			squaresList.push(squareId);
		}
	}
	return squaresList;
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
	container: {
		flex: 1,

		justifyContent: "center",
		alignItems: "center",
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
		height: 500,
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

	disabledStyle: {
		height: 50,
		width: 150,
		backgroundColor: "pink",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
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
	tileWrapper: {
		width: 60,
		height: 60,
		padding: 8,
		position: "absolute",
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
	buttonText: {
		fontSize: 22,

		color: "blue",
	},
	modalStyle: {
		height: 200,
		padding: 5,
		backgroundColor: "green",
	},
});
