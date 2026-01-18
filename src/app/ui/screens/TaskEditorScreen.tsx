import React, { useState, useLayoutEffect } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Task } from "../../store/slices/task.slice";
import { createTask, updateExistingTask } from "../../database/task.repository";
import { AppStackProps } from "../../navigation/AppStack";

export default function TaskEditorScreen({ navigation, route }: AppStackProps<"Editor">) {
  const editingTask = route.params?.task;

  const [title, setTitle] = useState(editingTask?.title || "");
  const [reminderTime, setReminderTime] = useState<Date | undefined>(
    editingTask?.reminderTime ? new Date(editingTask.reminderTime) : undefined
  );
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: editingTask ? "Edit Task" : "New Task",
    });
  }, [navigation, editingTask]);

  const onSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Title cannot be empty");
      return;
    }

    try {
      if (editingTask) {
        await updateExistingTask(
          { ...editingTask, title: title.trim() },
          reminderTime
        );
      } else {
        await createTask(title.trim(), reminderTime);
      }

      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save task");
    }
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    setReminderTime(date);
    hideDatePicker();
  };

  const clearReminder = () => {
    setReminderTime(undefined);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Task title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        autoFocus
      />

      <TouchableOpacity onPress={showDatePicker} style={styles.reminderButton}>
        <Text>
          {reminderTime
            ? `Reminder: ${reminderTime.toLocaleDateString()} at ${reminderTime.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}`
            : "Set Reminder Time"}
        </Text>
      </TouchableOpacity>

      {reminderTime && (
        <Button title="Clear Reminder" onPress={clearReminder} />
      )}

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        minimumDate={new Date()}
        date={reminderTime || new Date()}
      />

      <Button title="Save" onPress={onSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  reminderButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 16,
    alignItems: "center",
  },
});