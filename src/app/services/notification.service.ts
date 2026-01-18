import { Alert } from "react-native";
import notifee from "@notifee/react-native";

// Track scheduled reminders
const scheduledReminders: Map<string, NodeJS.Timeout> = new Map();

/**
 * Initialize Notifee and request permissions
 */
export const initNotifications = async () => {
  try {
    // Request notification permission
    await notifee.requestPermission();
    
    // Create notification channel for Android
    await notifee.createChannel({
      id: "task-reminders",
      name: "Task Reminders",
      importance: 4, // High importance
      sound: "default",
      vibration: true,
      lights: true,
    });
    
    console.log("✅ Notifee initialized successfully");
  } catch (error) {
    console.warn("⚠️ Notifee initialization error:", (error as any)?.message);
  }
};

/**
 * Schedule a task reminder with local notification
 */
export const scheduleTaskNotification = async (
  taskId: string,
  title: string,
  date: Date
) => {
  try {
    console.log(`📅 Scheduling reminder for "${title}" at ${date.toLocaleString()}`);
    
    // Don't schedule past notifications
    if (date.getTime() <= Date.now()) {
      console.warn("⚠️ Reminder time is in the past, skipping");
      return;
    }

    const timeUntilReminder = date.getTime() - Date.now();
    console.log(`⏱️ Reminder will trigger in ${Math.round(timeUntilReminder / 1000)} seconds`);
    
    // Cancel any existing reminder for this task
    if (scheduledReminders.has(taskId)) {
      clearTimeout(scheduledReminders.get(taskId)!);
    }
    
    // Schedule timeout for Notifee trigger
    const timeoutId = setTimeout(() => {
      console.log(`🔔 REMINDER TRIGGERED: ${title}`);
      console.log(`✅ Notification sent at ${new Date().toLocaleString()}`);
      
      // Display local notification with sound
      notifee.displayNotification({
        id: taskId,
        title: "⏰ Task Reminder",
        body: title,
        android: {
          channelId: "task-reminders",
          sound: "default",
          pressAction: {
            id: "default",
          },
        },
        ios: {
          sound: "default",
        },
      }).catch((error) => {
        console.warn("⚠️ Could not display notification:", (error as any)?.message);
      });
      
      scheduledReminders.delete(taskId);
    }, timeUntilReminder);
    
    scheduledReminders.set(taskId, timeoutId);
    
    console.log(`✅ Reminder scheduled successfully for: "${title}"`);
  } catch (error) {
    console.warn("⚠️ Could not schedule reminder:", (error as any)?.message);
  }
};

/**
 * Cancel a scheduled notification
 */
export const cancelTaskNotification = (taskId: string) => {
  if (scheduledReminders.has(taskId)) {
    clearTimeout(scheduledReminders.get(taskId)!);
    scheduledReminders.delete(taskId);
    console.log(`✅ Canceled reminder for task: ${taskId}`);
  }
};
