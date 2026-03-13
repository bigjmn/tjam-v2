import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

type ThemeStyle = "light" | "dark";
interface ThemeContextProps {
	theme: ThemeStyle;
	toggleTheme: () => void;
	sfxOn: boolean;
	toggleSfx: () => void;
	turnOnSound: () => void;
	turnOffSound: () => void;
}
export const ThemeContext = createContext<ThemeContextProps>({
	theme: "light",
	toggleTheme: () => {},
	sfxOn: true,
	toggleSfx: () => {},
	turnOnSound: () => {},
	turnOffSound: () => {},
});

const THEME_STORAGE_KEY = "@app_theme";
const SFX_STORAGE_KEY = "@app_sfx";
export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const systemColorScheme = useColorScheme();
	const [theme, setTheme] = useState<ThemeStyle>("light");
	const [sfxOn, setSfxOn] = useState<boolean>(true);

	useEffect(() => {
		loadSavedTheme();
		loadSavedSfx();
	}, []);

	const turnOnSound = async () => {
		console.log("turning sound ON");

		setSfxOn(true);
		await AsyncStorage.setItem(SFX_STORAGE_KEY, "on");
	};
	const turnOffSound = async () => {
		console.log("turning sound OFF");
		setSfxOn(false);
		await AsyncStorage.setItem(SFX_STORAGE_KEY, "off");
	};

	const loadSavedTheme = async () => {
		try {
			const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
			if (
				savedTheme &&
				(savedTheme === "light" || savedTheme === "dark")
			) {
				setTheme(savedTheme);
			} else {
				// Use system theme as default if no saved theme
				setTheme(systemColorScheme || "dark");
			}
		} catch (error) {
			console.error("Failed to load theme:", error);
		}
	};
	const loadSavedSfx = async () => {
		try {
			const savedSfx = await AsyncStorage.getItem(SFX_STORAGE_KEY);
			if (savedSfx === "off") {
				turnOffSound();
			} else {
				turnOnSound();
			}
			console.log("saved sound: ", savedSfx);
		} catch (error) {
			console.log("failed to load sfx: ", error);
		}
	};

	const toggleTheme = async () => {
		const newTheme = theme === "light" ? "dark" : "light";
		setTheme(newTheme);
		try {
			await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
		} catch (error) {
			console.error("Failed to save theme:", error);
		}
	};

	const toggleSfx = async () => {
		const newSfx = !setSfxOn;
		setSfxOn(newSfx);
		const sfxname = newSfx ? "on" : "off";
		try {
			await AsyncStorage.setItem(SFX_STORAGE_KEY, sfxname);
		} catch (error) {
			console.error("failed to save theme: ", error);
		}
	};

	return (
		<ThemeContext.Provider
			value={{
				theme,
				toggleTheme,
				sfxOn,
				toggleSfx,
				turnOnSound,
				turnOffSound,
			}}
		>
			{children}
		</ThemeContext.Provider>
	);
}
