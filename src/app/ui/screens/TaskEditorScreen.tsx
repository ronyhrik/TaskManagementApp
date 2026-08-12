import React, { useState, useLayoutEffect, useMemo } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import DatePicker from "react-native-date-picker";
import { createTaskThunk, updateTaskThunk } from "../../store/slices/task.slice";
import { AppStackProps } from "../../navigation/AppStack";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectThemeMode } from "../../store/slices/theme.slice";
import { getTheme } from "../../config/theme";
import { logger } from "../../utils/logger";
import ThemedButton from "../components/ThemedButton";

export default function TaskEditorScreen({ navigation, route }: AppStackProps<"Editor">) {
  const editingTask = route.params?.task;

  const dispatch = useAppDispatch();
  const themeMode = useAppSelector(selectThemeMode);
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  const [title, setTitle] = useState(editingTask?.title || "");
  const [reminderTime, setReminderTime] = useState<Date>(
    editingTask?.reminderTime ? new Date(editingTask.reminderTime) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hasReminder, setHasReminder] = useState(!!editingTask?.reminderTime);
  const [saving, setSaving] = useState(false);

  const [pendingDate, setPendingDate] = useState<Date>(
    editingTask?.reminderTime ? new Date(editingTask.reminderTime) : new Date()
  );

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
      setSaving(true);
      const reminderToSave = hasReminder ? new Date(reminderTime.getTime()) : undefined;

      if (editingTask) {
        await dispatch(
          updateTaskThunk({ task: { ...editingTask, title: title.trim() }, reminderTime: reminderToSave })
        ).unwrap();
      } else {
        await dispatch(createTaskThunk({ title: title.trim(), reminderTime: reminderToSave })).unwrap();
      }

      navigation.goBack();
    } catch (error: any) {
      logger.error("Save error:", error);
      Alert.alert("Error", error?.message || "Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  const handleSetReminder = () => {
    setPendingDate(new Date(reminderTime.getTime()));
    setShowDatePicker(true);
  };

  const handleClearReminder = () => {
    setHasReminder(false);
  };

  const handleDateConfirm = (selectedDate: Date) => {
    const confirmedTime = new Date(selectedDate.getTime());
    setReminderTime(confirmedTime);
    setHasReminder(true);
    setShowDatePicker(false);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <TextInput
        placeholder="Task title"
        value={title}
        onChangeText={setTitle}
        style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
        autoFocus
        placeholderTextColor={theme.textSecondary}
        editable={!saving}
      />

      <TouchableOpacity
        onPress={handleSetReminder}
        disabled={saving}
        style={[
          styles.reminderButton,
          { backgroundColor: theme.surface, borderColor: theme.border },
          hasReminder && { borderColor: theme.success, backgroundColor: themeMode === "dark" ? "#1a3a1a" : "#f0f8f0" }
        ]}
      >
        <Text style={[styles.reminderButtonText, { color: theme.text }]}>
          {hasReminder
            ? `Reminder: ${reminderTime.toLocaleDateString()} at ${reminderTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}`
            : "Set Reminder Time"}
        </Text>
      </TouchableOpacity>

      {hasReminder && (
        <ThemedButton title="Clear Reminder" onPress={handleClearReminder} variant="danger" disabled={saving} />
      )}

      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={[styles.datePickerContainer, { backgroundColor: themeMode === "dark" ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)" }]}>
          <View style={[styles.datePickerContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.datePickerTitle, { color: theme.text }]}>Select Date & Time</Text>

            <DatePicker
              date={pendingDate}
              onDateChange={setPendingDate}
              mode="datetime"
              minimumDate={new Date()}
            />

            <View style={styles.datePickerButtons}>
              <ThemedButton
                title="Cancel"
                onPress={() => {
                  setPendingDate(new Date(reminderTime.getTime()));
                  setShowDatePicker(false);
                }}
                variant="muted"
              />
              <ThemedButton title="Confirm" onPress={() => handleDateConfirm(pendingDate)} variant="primary" />
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.saveButtonContainer}>
        <ThemedButton title={saving ? "Saving..." : "Save Task"} onPress={onSave} variant="success" disabled={saving} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reminderButton: {
    padding: 14,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reminderButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  datePickerContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  datePickerContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    paddingTop: 16,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  datePickerButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  saveButtonContainer: {
    marginTop: 24,
    marginBottom: 24,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
