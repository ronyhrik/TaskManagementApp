import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ThemeMode } from "../config/theme";

const THEME_STORAGE_KEY = "@task_manager/theme_mode";

export const loadStoredThemeMode = async (): Promise<ThemeMode | null> => {
  const value = await AsyncStorage.getItem(THEME_STORAGE_KEY);
  return value === "light" || value === "dark" ? value : null;
};

export const saveThemeMode = (mode: ThemeMode): Promise<void> => AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
