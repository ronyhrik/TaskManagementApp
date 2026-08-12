import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import type { Task } from "../../types/task";
import { useAppSelector } from "../../store/hooks";
import { selectThemeMode } from "../../store/slices/theme.slice";
import { getTheme } from "../../config/theme";
import ThemedButton from "./ThemedButton";

// Fixed row height (content box) + the gap below it — kept in sync with FlatList's
// getItemLayout in TaskListScreen so list virtualization can measure rows without rendering them.
export const TASK_ITEM_HEIGHT = 60;
export const TASK_ITEM_MARGIN_BOTTOM = 8;

type Props = {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

const TaskItem = memo(function TaskItem({ task, onToggle, onEdit, onDelete }: Props) {
  const themeMode = useAppSelector(selectThemeMode);
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);
  const dynamicStyles = useMemo(() => createDynamicStyles(theme), [theme]);

  return (
    <View style={dynamicStyles.container}>
      <TouchableOpacity onPress={onToggle} style={dynamicStyles.titleContainer}>
        <Text numberOfLines={1} style={[dynamicStyles.title, task.completed && dynamicStyles.completed]}>
          {task.title}
        </Text>
      </TouchableOpacity>

      <View style={dynamicStyles.buttons}>
        <View style={dynamicStyles.buttonWrapper}>
          <ThemedButton title="Edit" onPress={onEdit} variant="primary" />
        </View>
        <View style={dynamicStyles.buttonWrapper}>
          <ThemedButton title="Delete" variant="danger" onPress={onDelete} />
        </View>
      </View>
    </View>
  );
});

const createDynamicStyles = (theme: ReturnType<typeof getTheme>) =>
  StyleSheet.create({
    container: {
      height: TASK_ITEM_HEIGHT,
      marginBottom: TASK_ITEM_MARGIN_BOTTOM,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.surface,
    },
    titleContainer: { flex: 1 },
    title: { fontSize: 16, color: theme.text, fontWeight: "500" },
    completed: { textDecorationLine: "line-through", color: theme.textSecondary },
    buttons: { flexDirection: "row" },
    buttonWrapper: { marginRight: 8 },
  });

export default TaskItem;
