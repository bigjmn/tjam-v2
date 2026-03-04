import { useAudioPlayer } from "expo-audio";
import { useTheme } from "./useTheme";
const popSource = require("../assets/sfx/popeffect.mp3");
const achieveSource = require("../assets/sfx/achieve.wav");
const poofSource = require("../assets/sfx/poof.wav");
const gearload = require("../assets/sfx/gearload.mp3");
const telewoosh = require("../assets/sfx/telewoosh.mp3")
export const useSfx = () => {
	const { sfxOn } = useTheme();
	const popPlayer = useAudioPlayer(popSource);
	const achievePlayer = useAudioPlayer(achieveSource);
	const poofPlayer = useAudioPlayer(poofSource);
    const gearPlayer = useAudioPlayer(gearload)
    const wooshPlayer = useAudioPlayer(telewoosh)

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
    const gearloadSound = () => {
        if (!sfxOn) return;
        gearPlayer.seekTo(.75)
        gearPlayer.play()
    }
    const wooshSound = () => {
        if (!sfxOn) return 
        wooshPlayer.seekTo(.2)
        wooshPlayer.play()
    }

	return { popSound, achieveSound, poofSound, gearloadSound, wooshSound };
};
