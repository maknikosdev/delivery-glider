import { StatusBar, Platform } from "react-native";

// Single source of truth for where the gameplay overlays start, so the HUD,
// wanted stars, weather banner and floating banners never overlap each
// other or the Android status bar / camera cutout, whatever the device.
export const TOP_INSET = Math.max(44, (Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0) + 10);
export const HUD_TOP = TOP_INSET;
export const STARS_TOP = TOP_INSET + 64;
export const WEATHER_TOP = TOP_INSET + 106;
export const BANNER_TOP = TOP_INSET + 150;
