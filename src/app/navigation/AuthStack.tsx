import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useMemo, lazy } from "react";
import { Pressable, Text } from "react-native";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectThemeMode, toggleThemeThunk } from "../store/slices/theme.slice";
import { getTheme } from "../config/theme";
import { LazyScreen } from "./lazyScreens";

const LoginScreen = lazy(() => import("../ui/screens/LoginScreen"));
const SignupScreen = lazy(() => import("../ui/screens/SignupScreen"));

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector(selectThemeMode);
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  const handleToggleTheme = () => {
    dispatch(toggleThemeThunk());
  };

  const ThemeToggleButton = () => (
    <Pressable onPress={handleToggleTheme} style={{ padding: 8 }}>
      <Text style={{ fontSize: 20 }}>
        {themeMode === "light" ? "🌙" : "☀️"}
      </Text>
    </Pressable>
  );

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          color: theme.text,
          fontWeight: "600",
        },
        headerRight: () => <ThemeToggleButton />,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LazyScreen(LoginScreen)}
        options={{
          headerShown: true,
          title: "Login",
        }}
      />
      <Stack.Screen
        name="Signup"
        component={LazyScreen(SignupScreen)}
        options={{
          headerShown: true,
          title: "Sign Up",
        }}
      />
    </Stack.Navigator>
  );
}
