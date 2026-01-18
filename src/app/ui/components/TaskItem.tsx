import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Button } from "react-native";
import { Task } from "../../store/slices/task.slice";
import { useAppSelector } from "../../store/hooks";
import { selectThemeMode } from "../../store/slices/theme.slice";
import { getTheme } from "../../config/theme";

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
        <Text style={[dynamicStyles.title, task.completed && dynamicStyles.completed]}>
          {task.title}
        </Text>
      </TouchableOpacity>

      <View style={dynamicStyles.buttons}>
        <View style={dynamicStyles.buttonWrapper}>
          <Button title="Edit" onPress={onEdit} color={theme.primary} />
        </View>
        <View style={dynamicStyles.buttonWrapper}>
          <Button title="Delete" color={theme.error} onPress={onDelete} />
        </View>
      </View>
    </View>
  );
});

const createDynamicStyles = (theme: ReturnType<typeof getTheme>) =>
  StyleSheet.create({
    container: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 12,
      marginBottom: 8,
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
