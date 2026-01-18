import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import { Task } from "../store/slices/task.slice";
import { Pressable, Text, View } from "react-native";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toggleTheme, selectThemeMode } from "../store/slices/theme.slice";
import { getTheme } from "../config/theme";
import { useMemo } from "react";

// Import screens normally (no lazy loading for React Navigation compatibility)
import TaskListScreen from "../ui/screens/TaskListScreen";
import TaskEditorScreen from "../ui/screens/TaskEditorScreen";

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
    dispatch(toggleTheme());
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
        component={TaskListScreen}
        options={{ title: "My Tasks" }}
      />
      <Stack.Screen
        name="Editor"
        component={TaskEditorScreen}
        options={{ title: "Add Task" }}
      />
    </Stack.Navigator>
  );
}
