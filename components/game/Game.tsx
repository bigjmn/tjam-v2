import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withTiming,
	withSequence,
	runOnJS,
	Easing,
} from "react-native-reanimated";
import SquareLayer from "./SquareLayer";
import { useGame } from "./useGame";
import ThemedView from "../ui/ThemedView";
import { useSfx } from "../../hooks/useSfx";
import ThemedButton from "../ui/ThemedButton";
import { GameHeader } from "./GameHeader";
// interface TileProps {
//     id: string;
//     letter: string;
//     startx: number;
//     starty: number;
//     givePos: (id:string,dest:string) =>{};
//     takenSpots: string[];
//     canMove: boolean;
//     partValid: string[];
//     claimMovement: (id:string)=>{};
//     inMotion:string|null;

// }
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
}: TileProps) {
	//active is tile is being moved
	const isPressed = useSharedValue(false);
	//tracking changed x, y for given move.
	//decoupled for ease of animation
	const offsetX = useSharedValue(0);
	const offsetY = useSharedValue(0);
	//total offset from 0, 0
	const translateX = useSharedValue(startx * 90 + 3);
	const translateY = useSharedValue(starty * 90 + 3);
	//id of the square the tile is on
	const sitsOn = useSharedValue(startx.toString() + starty.toString());
	const { popSound } = useSfx()
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
		return {
			//set essentially 'left' and 'top' values
			transform: [
				{ translateX: translateX.value },
				{ translateY: translateY.value },
			],
			//make sure active tile is the top layer
			zIndex: isPressed.value ? 100 : 10,
			//moveable tiles always tan. parts of word green, otherwise gray
			backgroundColor: canMove
				? "tan"
				: partValid.includes(sitsOn.value)
					? "rgba(0,255,0,.2)"
					: "#e2e2e2",
		};
	});
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
			backgroundColor: [
				"00",
				"10",
				"20",
				"02",
				"12",
				"22",
				"03",
				"13",
				"23",
				"04",
				"14",
				"24",
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
			runOnJS(popSound)()
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
					<Text style={styles.baseText}>{letter}</Text>
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
	} = useGame();

	useEffect(() => {
		startGame();
	}, []);

	return (
		<GestureHandlerRootView>
			<ThemedView style={styles.outerContainer}>
				<GameHeader />
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
										tile.canMove && tile.id != frozenHome
									}
								/>
							))}
					</ThemedView>
				</ThemedView>
				<View style={styles.scoreAndButton}>
					<ThemedButton
					disabled={!validBoard || !!inMotion}
						style={[
							styles.buttonStyle,
							{ opacity: !validBoard || !!inMotion ? 0.3 : 1 },
						]}
						onPress={nextTurn}
						hitSlop={10}>
							<Text style={[styles.buttonText]}>Commit Move</Text>
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
						<Text style={styles.scoreText}>Points: {wordNum}</Text>
					</View>
				</View>
			</ThemedView>
			</ThemedView>
		</GestureHandlerRootView>
	);
}

const toPosition = ({ x, y }: { x: number; y: number }) => {
	"worklet";

	const row = Math.round(x / 90);
	const col = Math.round(y / 90);

	return row.toString() + col.toString();
};
const toTranslation = (p: string) => {
	"worklet";

	const pos = p.split("");
	const xp = parseInt(pos[0]);
	const yp = parseInt(pos[1]);

	const xpos = xp * 90 + 3;
	const ypos = yp * 90 + 3;
	return { x: xpos, y: ypos };
};

const allSquares = () => {
	let squaresList = [];
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 5; j++) {
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
		padding: 12
	},
	container: {
		flex: 1,
		
		justifyContent: "center",
		alignItems: "center",
	},
	gameWrapper: {
		width: 270,

		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
	},
	mainBoard: {
		position: "relative",
		height: 450,
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
		width: 84,
		height: 84,
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
		width: 80,
		height: 80,
		padding: 8,
		position: "absolute",
	},

	underlay: {
		width: 84,
		height: 84,
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
		borderColor: "blue",

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
