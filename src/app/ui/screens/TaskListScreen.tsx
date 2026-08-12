import React, { useEffect, useCallback, useMemo, memo } from "react";
import { View, FlatList, StyleSheet, Text, Alert } from "react-native";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import {
  loadTasksThunk,
  toggleTaskThunk,
  deleteTaskThunk,
  clearTasksThunk,
  selectTasks,
} from "../../store/slices/task.slice";
import type { Task } from "../../types/task";
import TaskItem, { TASK_ITEM_HEIGHT, TASK_ITEM_MARGIN_BOTTOM } from "../components/TaskItem";
import ThemedButton from "../components/ThemedButton";
import { AppStackProps } from "../../navigation/AppStack";
import { logoutThunk } from "../../store/slices/auth.slice";
import { selectThemeMode } from "../../store/slices/theme.slice";
import { getTheme } from "../../config/theme";
import { logger } from "../../utils/logger";

const ITEM_SLOT_HEIGHT = TASK_ITEM_HEIGHT + TASK_ITEM_MARGIN_BOTTOM;

const TaskListScreen = memo(function TaskListScreen({ navigation }: AppStackProps<"Tasks">) {
  const tasks = useAppSelector(selectTasks);
  const themeMode = useAppSelector(selectThemeMode);
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadTasksThunk())
      .unwrap()
      .catch((err) => logger.error("Failed to load tasks:", err));
  }, [dispatch]);

  const handleToggleComplete = useCallback(
    async (task: Task) => {
      try {
        await dispatch(toggleTaskThunk(task)).unwrap();
      } catch (error: any) {
        logger.error("Failed to toggle task:", error);
        Alert.alert("Error", error?.message || "Failed to update task");
      }
    },
    [dispatch],
  );

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(deleteTaskThunk(taskId)).unwrap();
            } catch (error: any) {
              logger.error("Failed to delete task:", error);
              Alert.alert("Error", error?.message || "Failed to delete task");
            }
          },
        },
      ]);
    },
    [dispatch],
  );

  const handleLogout = useCallback(() => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            try {
              await dispatch(clearTasksThunk()).unwrap();
            } catch (err) {
              logger.error("Error clearing tasks:", err);
              // Continue even if clearing fails — logout should not be blocked by it.
            }
            await dispatch(logoutThunk()).unwrap();
          } catch (error: any) {
            logger.error("Failed to logout:", error);
            Alert.alert("Error", error?.message || "Failed to logout");
          }
        },
      },
    ]);
  }, [dispatch]);

  const renderItem = useCallback(
    ({ item }: { item: Task }) => (
      <TaskItem
        task={item}
        onToggle={() => handleToggleComplete(item)}
        onEdit={() => navigation.navigate("Editor", { task: item })}
        onDelete={() => handleDeleteTask(item.id)}
      />
    ),
    [handleToggleComplete, navigation, handleDeleteTask],
  );

  const getItemLayout = useCallback(
    (_data: ArrayLike<Task> | null | undefined, index: number) => ({
      length: ITEM_SLOT_HEIGHT,
      offset: ITEM_SLOT_HEIGHT * index,
      index,
    }),
    [],
  );

  const dynamicStyles = useMemo(() => createDynamicStyles(theme), [theme]);

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.listContainer}>
        <FlatList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          getItemLayout={getItemLayout}
          contentContainerStyle={tasks.length === 0 ? dynamicStyles.emptyContainer : undefined}
          ListEmptyComponent={<Text style={dynamicStyles.emptyText}>No tasks available</Text>}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={7}
        />
      </View>

      <View style={dynamicStyles.addButton}>
        <ThemedButton title="Add Task" onPress={() => navigation.navigate("Editor", {})} variant="primary" />
      </View>

      <View style={dynamicStyles.logoutButton}>
        <ThemedButton title="Logout" variant="danger" onPress={handleLogout} />
      </View>
    </View>
  );
});

const createDynamicStyles = (theme: ReturnType<typeof getTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    listContainer: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
    emptyText: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    addButton: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 4,
      backgroundColor: theme.surface,
    },
    logoutButton: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.surface,
    },
  });

export default TaskListScreen;
