import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, Text } from "react-native";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toggleThemeThunk, selectThemeMode } from "../store/slices/theme.slice";
import { getTheme } from "../config/theme";
import { useMemo, lazy } from "react";
import { LazyScreen } from "./lazyScreens";
import type { Task } from "../types/task";

const TaskListScreen = lazy(() => import("../ui/screens/TaskListScreen"));
const TaskEditorScreen = lazy(() => import("../ui/screens/TaskEditorScreen"));

export type AppStackParamList = {
  Tasks: undefined;
  Editor: { task?: Task };
};

export type AppStackProps<T extends keyof AppStackParamList> = NativeStackScreenProps<AppStackParamList, T>;

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector(selectThemeMode);
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  const handleToggleTheme = () => {
    dispatch(toggleThemeThunk());
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTitleStyle: {
          color: theme.text,
          fontSize: 18,
          fontWeight: "600",
        },
        headerRight: () => (
          <Pressable
            onPress={handleToggleTheme}
            style={{ marginRight: 16, padding: 8 }}
          >
            <Text style={{ fontSize: 20 }}>
              {themeMode === "light" ? "🌙" : "☀️"}
            </Text>
          </Pressable>
        ),
      }}
    >
      <Stack.Screen
        name="Tasks"
        component={LazyScreen(TaskListScreen)}
        options={{ title: "My Tasks" }}
      />
      <Stack.Screen
        name="Editor"
        component={LazyScreen(TaskEditorScreen)}
        options={{ title: "Add Task" }}
      />
    </Stack.Navigator>
  );
}
