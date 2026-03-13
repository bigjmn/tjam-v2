export const purpleOrangeCommon = {
	primary: "#5B5CFF",
	secondary: "#FF6B5E",
	warning: "#FF4D4F",
};

const purpleOrangeConfig = {
	primary: purpleOrangeCommon.primary,
	secondary: purpleOrangeCommon.secondary,
	warning: purpleOrangeCommon.warning,

	light: {
		primary: purpleOrangeCommon.primary,
		secondary: purpleOrangeCommon.secondary,
		warning: purpleOrangeCommon.warning,
		background: "#F7F8FC",
		uiBackground: " #FFFFFF",
		navBackground: "#FFFFFF",

		text: "#1C1E2B",
		title: "#0F1222",

		iconColor: "#8B90A8",
		iconColorFocus: "#5B5CFF",
	},
	dark: {
		primary: purpleOrangeCommon.primary,
		secondary: purpleOrangeCommon.secondary,
		warning: purpleOrangeCommon.warning,
		background: "#0F1222",
		uiBackground: "#181C2F",
		navBackground: "#15182A",

		text: "#E6E8F5",
		title: "#FFFFFF",

		iconColor: "#7C82A8",
		iconColorFocus: "#5B5CFF",
	},
};

export const option1Dark = {
	mode: "dark",

	// Brand
	primary: "#5C6CFF",
	primarySoft: "#E8EBFF",
	secondary: "#FF6B6B",
	accent: "#F6C945",

	// Surfaces
	background: "#0E1324",
	// background: "#333",
	uiBackground: "#181E34",
	navBackground: "#12172B",
	boardBackground: "#141A30",

	// Text
	text: "#E7ECF8",
	title: "#FFFFFF",
	mutedText: "#9AA3C7",

	// Icons
	iconColor: "#7E88B6",
	iconColorFocus: "#5C6CFF",

	// Borders
	borderSubtle: "#242C4A",

	// Semantic
	danger: "#FF4D4F",
	success: "#4CAF50",

	emptyTile: "#141A30",

	// Tiles (UNCHANGED)
	tileMovable: "YOUR_EXISTING_TAN",
	tileFrozen: "YOUR_EXISTING_GRAY",
	tileValid: "YOUR_EXISTING_GREEN",
	tileLetter: "#111111",
};
export const option1Light = {
	mode: "light",

	// Brand
	primary: "#4F5BFF",
	primarySoft: "#E6E9FF",
	secondary: "#E45454",
	accent: "#E6B800",

	// Surfaces
	background: "#F4F6FF",
	uiBackground: "#FFFFFF",
	navBackground: "#FFFFFF",
	boardBackground: "#EDEFFB",

	// Text
	text: "#1B2238",
	title: "#0F1222",
	mutedText: "#6B7398",

	// Icons
	iconColor: "#7A83A8",
	iconColorFocus: "#4F5BFF",

	// Borders
	borderSubtle: "#D6DAF2",

	// Semantic
	danger: "#E54848",
	success: "#3E9E5A",

	emptyTile: "#EDEFFB",

	// Tiles (UNCHANGED)
	tileMovable: "YOUR_EXISTING_TAN",
	tileFrozen: "YOUR_EXISTING_GRAY",
	tileValid: "YOUR_EXISTING_GREEN",
	tileLetter: "#111111",
};

export const option1LightBeta = {
	mode: "light",

	primary: "#4F5BFF",
	secondary: "#7C8CFF",
	accent: "#E6B800",
	primarySoft: "#E6E9FF",

	background: "#F3F4F6",
	uiBackground: "#FFFFFF",
	navBackground: "#FFFFFF",
	emptyTile: "#E8EAF3",

	elevatedCard: "#FFFFFF",

	text: "#111827",
	title: "#000000",
	mutedText: "#6B7280",

	iconColor: "#9CA3AF",
	iconColorFocus: "#4F5BFF",

	borderSubtle: "#E5E7EB",

	danger: "#DC2626",
	success: "#16A34A",

	tileMovable: "tan",
	tileFrozen: "#e2e2e2",
	tileValid: "#7FAA7A",
	tileLetter: "#111111",
};
export const option1DarkBeta = {
	mode: "dark",
	primarySoft: "#E8EBFF",

	// Brand
	primary: "#5C6CFF",
	secondary: "#8FA1FF", // cooler secondary (no salmon)
	accent: "#F6C945",

	// Surfaces (NYT-inspired layering)
	background: "#141414", // charcoal instead of navy
	uiBackground: "#1F1F23", // card surface
	navBackground: "#18181C",
	emptyTile: "#1B1D2A",

	elevatedCard: "#262833", // extra pop surface

	// Text
	text: "#EDEDED",
	title: "#FFFFFF",
	mutedText: "#A1A1AA",

	iconColor: "#8B8BA3",
	iconColorFocus: "#5C6CFF",

	borderSubtle: "#2C2F3A",

	danger: "#E5484D",
	success: "#4CAF50",

	// Tiles unchanged
	tileMovable: "tan",
	tileFrozen: "#e2e2e2",
	tileValid: "#7FAA7A",
	tileLetter: "#111111",
};
export const option2Dark = {
	mode: "dark",

	// Brand
	primary: "#7B5CFA",
	primarySoft: "#EEE9FF",
	secondary: "#FF7A59",
	accent: "#FFD166",

	// Surfaces
	background: "#0C1020",
	uiBackground: "#1A2038",
	navBackground: "#131830",
	emptyTile: "#151B32",

	// Text
	text: "#EDEFF7",
	title: "#FFFFFF",
	mutedText: "#98A2C9",

	// Icons
	iconColor: "#7F8AC2",
	iconColorFocus: "#7B5CFA",

	// Borders
	borderSubtle: "#262E52",

	// Semantic
	danger: "#FF5C5C",
	success: "#3FBF7F",

	// Tiles (NEW)
	tileMovable: "#D7B98E", // parchment
	tileFrozen: "#C9CED6", // cool stone
	tileValid: "#7FBF8E", // soft sage
	tileLetter: "#1A1A1A",
};

export const option2Light = {
	mode: "light",

	// Brand
	primary: "#6A4DF4",
	primarySoft: "#EFEAFF",
	secondary: "#F26A4B",
	accent: "#E6B94D",

	// Surfaces
	background: "#F6F4FF",
	uiBackground: "#FFFFFF",
	navBackground: "#FFFFFF",
	boardBackground: "#ECE9FF",

	// Text
	text: "#1C1E2D",
	title: "#10121F",
	mutedText: "#6F769B",

	// Icons
	iconColor: "#7D85B3",
	iconColorFocus: "#6A4DF4",

	// Borders
	borderSubtle: "#DDD8FF",

	// Semantic
	danger: "#E14C4C",
	success: "#3AA66A",

	// Tiles (NEW – SAME AS DARK)
	tileMovable: "#D7B98E",
	tileFrozen: "#C9CED6",
	tileValid: "#7FBF8E",
	tileLetter: "#1A1A1A",
};

export const option2DarkBeta = {
	mode: "dark",

	primary: "#7B5CFA",
	secondary: "#4CC9F0", // cool cyan instead of salmon
	accent: "#FFD166",
	primarySoft: "#EEE9FF",

	background: "#101012", // deep neutral charcoal
	uiBackground: "#1C1C20",
	navBackground: "#16161A",
	emptyTile: "#1E2030",

	elevatedCard: "#242636",

	text: "#F4F4F5",
	title: "#FFFFFF",
	mutedText: "#A1A1AA",

	iconColor: "#8B8BA3",
	iconColorFocus: "#7B5CFA",

	borderSubtle: "#2A2D3A",

	danger: "#F87171",
	success: "#34D399",

	// New unified tiles
	tileMovable: "#D7B98E",
	tileFrozen: "#C9CED6",
	tileValid: "#7FBF8E",
	tileLetter: "#1A1A1A",
};

export const option2LightBeta = {
	mode: "light",

	primary: "#6A4DF4",
	secondary: "#0EA5E9",
	accent: "#E6B94D",
	primarySoft: "#EFEAFF",

	background: "#F5F6FA",
	uiBackground: "#FFFFFF",
	navBackground: "#FFFFFF",
	emptyTile: "#cbcbcb",

	elevatedCard: "#FFFFFF",

	text: "#111827",
	title: "#000000",
	mutedText: "#6B7280",

	iconColor: "#9CA3AF",
	iconColorFocus: "#6A4DF4",

	borderSubtle: "#E5E7EB",

	danger: "#DC2626",
	success: "#16A34A",

	tileMovable: "#D7B98E",
	tileFrozen: "#C9CED6",
	tileValid: "#7FBF8E",
	tileLetter: "#1A1A1A",
};

const themeOne = {
	light: option1Light,
	dark: option1Dark,
};

const themeTwo = {
	light: option2Light,
	dark: option2Dark,
};

const themeOneBeta = {
	light: option1LightBeta,
	dark: option1DarkBeta,
};

const themeTwoBeta = {
	light: option2LightBeta,
	dark: option2DarkBeta,
};

export const Colors = themeTwoBeta;
