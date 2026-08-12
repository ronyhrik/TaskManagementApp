import React, { memo } from "react";
import { Button, type ButtonProps } from "react-native";
import { useAppSelector } from "../../store/hooks";
import { selectThemeMode } from "../../store/slices/theme.slice";
import { getTheme } from "../../config/theme";

type Props = Omit<ButtonProps, "color"> & {
  variant?: "primary" | "danger" | "success" | "muted";
};

const VARIANT_COLOR_KEY = {
  primary: "primary",
  danger: "error",
  success: "success",
  muted: "textSecondary",
} as const;

const ThemedButton = memo(function ThemedButton({ variant = "primary", ...buttonProps }: Props) {
  const themeMode = useAppSelector(selectThemeMode);
  const theme = getTheme(themeMode);

  return <Button {...buttonProps} color={theme[VARIANT_COLOR_KEY[variant]]} />;
});

export default ThemedButton;
