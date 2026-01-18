import React, { useEffect, useCallback, useMemo, memo } from "react";
import { View, FlatList, StyleSheet, Text, Button, Alert } from "react-native";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { loadTasksFromDB, toggleTaskCompleted, deleteTask } from "../../database/task.repository";
import { Task } from "../../store/slices/task.slice";
import TaskItem from "../components/TaskItem";
import { AppStackProps } from "../../navigation/AppStack";
import { logout } from "../../services/auth.service";
import { setUser } from "../../store/slices/auth.slice";
import { selectThemeMode } from "../../store/slices/theme.slice";
import { getTheme } from "../../config/theme";

const TaskListScreen = memo(function TaskListScreen({ navigation }: AppStackProps<"Tasks">) {
  const tasks = useAppSelector((state) => state.tasks);
  const themeMode = useAppSelector(selectThemeMode);
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    loadTasksFromDB().catch((err) => console.error("Failed to load tasks:", err));
  }, []);

  const handleToggleComplete = useCallback(async (task: Task) => {
    try {
      await toggleTaskCompleted(task);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update task");
    }
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTask(taskId);
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to delete task");
          }
        },
      },
    ]);
  }, []);

  const handleLogout = useCallback(() => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            dispatch(setUser(null));
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to logout");
          }
        },
      },
    ]);
  }, [dispatch]);

  const renderItem = useCallback(({ item }: { item: Task }) => (
    <TaskItem
      task={item}
      onToggle={() => handleToggleComplete(item)}
      onEdit={() => navigation.navigate("Editor", { task: item })}
      onDelete={() => handleDeleteTask(item.id)}
    />
  ), [handleToggleComplete, navigation, handleDeleteTask]);

  const dynamicStyles = useMemo(() => createDynamicStyles(theme), [theme]);

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.listContainer}>
        <FlatList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={tasks.length === 0 ? dynamicStyles.emptyContainer : undefined}
          ListEmptyComponent={<Text style={dynamicStyles.emptyText}>No tasks available</Text>}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
        />
      </View>

      <View style={dynamicStyles.addButton}>
        <Button
          title="Add Task"
          onPress={() => navigation.navigate("Editor", {})}
          color={theme.primary}
        />
      </View>

      <View style={dynamicStyles.logoutButton}>
        <Button
          title="Logout"
          color={theme.error}
          onPress={handleLogout}
        />
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
