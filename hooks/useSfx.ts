import { useAudioPlayer } from "expo-audio";
import { useTheme } from "./useTheme";
import { useRef } from "react";

const popSource = require("../assets/sfx/popeffect.mp3");
const achieveSource = require("../assets/sfx/achieve.wav");
const poofSource = require("../assets/sfx/poof.wav");
const gearload = require("../assets/sfx/gearload.mp3");
const telewoosh = require("../assets/sfx/telewoosh.mp3");
const achieveSuccess = require("../assets/sfx/achievesuccess.wav")
export const useSfx = () => {
	const { sfxOn } = useTheme();
	const popPlayer = useAudioPlayer(popSource);
	const achievePlayer = useAudioPlayer(achieveSource);
	const poofPlayer = useAudioPlayer(poofSource);
	const gearPlayer = useAudioPlayer(gearload);
	const wooshPlayer = useAudioPlayer(telewoosh);
	const toastPlayer = useAudioPlayer(achieveSuccess)

	// Safe play helper
	const safePlay = (player: any, seekPosition: number = 0) => {
		try {
			if (!sfxOn || !player) return;
			player.seekTo(seekPosition);
			player.play();
		} catch (error) {
			console.warn("Audio playback failed:", error);
		}
	};

	const popSound = () => {
		safePlay(popPlayer, 0);
	};

	const achieveSound = () => {
		safePlay(achievePlayer, 0);
	};

	const poofSound = () => {
		safePlay(poofPlayer, 0);
	};
	const achieveToast = () => {
		safePlay(toastPlayer,0)
	}

	const gearloadSound = () => {
		safePlay(gearPlayer, 0.75);
	};

	const wooshSound = () => {
		safePlay(wooshPlayer, 0.2);
	};

	return { popSound, achieveSound, poofSound, gearloadSound, wooshSound, achieveToast };
};
