

export type ThemeMode = "light" | "dark";

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  error: string;
  warning: string;
  info: string;
}

export const THEMES: Record<ThemeMode, ThemeColors> = {
  light: {
    primary: "#007AFF",
    secondary: "#5AC8FA",
    background: "#F5F5F5",
    surface: "#FFFFFF",
    text: "#000000",
    textSecondary: "#666666",
    border: "#CCCCCC",
    success: "#34C759",
    error: "#FF3B30",
    warning: "#FF9500",
    info: "#5AC8FA",
  },
  dark: {
    primary: "#0A84FF",
    secondary: "#30B0C0",
    background: "#1C1C1E",
    surface: "#2C2C2E",
    text: "#FFFFFF",
    textSecondary: "#A0A0A0",
    border: "#424245",
    success: "#30B0C0",
    error: "#FF453A",
    warning: "#FF9500",
    info: "#30B0C0",
  },
};

export const getTheme = (mode: ThemeMode): ThemeColors => {
  return THEMES[mode];
};
