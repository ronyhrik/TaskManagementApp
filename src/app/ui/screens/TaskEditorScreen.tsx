import React, { useState, useLayoutEffect, useMemo } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import DatePicker from "react-native-date-picker";
import { Task } from "../../store/slices/task.slice";
import { createTask, updateExistingTask } from "../../database/task.repository";
import { AppStackProps } from "../../navigation/AppStack";
import { useAppSelector } from "../../store/hooks";
import { selectThemeMode } from "../../store/slices/theme.slice";
import { getTheme } from "../../config/theme";

export default function TaskEditorScreen({ navigation, route }: AppStackProps<"Editor">) {
  const editingTask = route.params?.task;

  const themeMode = useAppSelector(selectThemeMode);
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  const [title, setTitle] = useState(editingTask?.title || "");
  const [reminderTime, setReminderTime] = useState<Date>(
    editingTask?.reminderTime ? new Date(editingTask.reminderTime) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hasReminder, setHasReminder] = useState(!!editingTask?.reminderTime);
  

  const [pendingDate, setPendingDate] = useState<Date>(
    editingTask?.reminderTime ? new Date(editingTask.reminderTime) : new Date()
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: editingTask ? "Edit Task" : "New Task",
    });
  }, [navigation, editingTask]);

  const onSave = async () => {
    console.log("Saving task...");
    if (!title.trim()) {
      Alert.alert("Error", "Title cannot be empty");
      return;
    }

    try {
      const reminderToSave = hasReminder ? new Date(reminderTime.getTime()) : undefined;
      
      console.log("save with reminder:", {
        hasReminder,
        reminderToSave: reminderToSave?.toLocaleString(),
        milliseconds: reminderToSave?.getTime(),
        currentTime: new Date().toLocaleString(),
        currentMs: Date.now()
      });
      
      if (editingTask) {

        await updateExistingTask(
          { ...editingTask, title: title.trim() },
          reminderToSave
        );
      } else {

        await createTask(title.trim(), reminderToSave);
      }
      
      console.log("Task saved successfully");
      navigation.goBack();
    } catch (error: any) {
      console.error("Save error:", error);
      Alert.alert("Error", error.message || "Failed to save task");
    }
  };

  const handleSetReminder = () => {

    setPendingDate(new Date(reminderTime.getTime()));
    setShowDatePicker(true);
  };

  const handleClearReminder = () => {
    console.log("Clearing reminder");
    setHasReminder(false);
  };

  const handleDateConfirm = (selectedDate: Date) => {
    const confirmedTime = new Date(selectedDate.getTime());
    
    console.log("Reminder set to: " + confirmedTime.toLocaleString());
    
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
      />

      <TouchableOpacity 
        onPress={handleSetReminder} 
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
        <Button
          title="Clear Reminder"
          onPress={handleClearReminder}
          color={theme.error}
        />
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
              <Button
                title="Cancel"
                onPress={() => {
                  setPendingDate(new Date(reminderTime.getTime()));
                  setShowDatePicker(false);
                }}
                color={theme.textSecondary}
              />
              <Button
                title="Confirm"
                onPress={() => handleDateConfirm(pendingDate)}
                color={theme.primary}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Save Button */}
      <View style={styles.saveButtonContainer}>
        <Button
          title="Save Task"
          onPress={onSave}
          color={theme.success}
        />
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