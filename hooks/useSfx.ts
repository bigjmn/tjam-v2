import { useAudioPlayer } from "expo-audio";
import { useTheme } from "./useTheme";
const popSource = require("../assets/sfx/popeffect.mp3");
const achieveSource = require("../assets/sfx/achieve.wav");
const poofSource = require("../assets/sfx/poof.wav");
export const useSfx = () => {
	const { sfxOn } = useTheme();
	const popPlayer = useAudioPlayer(popSource);
	const achievePlayer = useAudioPlayer(achieveSource);
	const poofPlayer = useAudioPlayer(poofSource);

	const popSound = () => {
		if (!sfxOn) return;
		popPlayer.seekTo(0);
		popPlayer.play();
	};
	const achieveSound = () => {
		if (!sfxOn) return;
		achievePlayer.seekTo(0);
		achievePlayer.play();
	};
	const poofSound = () => {
		if (!sfxOn) return;
		poofPlayer.seekTo(0);
		poofPlayer.play();
	};

	return { popSound, achieveSound, poofSound };
};
