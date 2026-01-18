import { Alert } from "react-native";
import notifee from "@notifee/react-native";

// Track scheduled reminders
const scheduledReminders: Map<string, NodeJS.Timeout> = new Map();


 //Initialize Notifee and request permissions

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
  } catch (error) {
    console.warn("Notifee initialization error:", (error as any)?.message);
  }
};


 //Schedule a task reminder with local notification

export const scheduleTaskNotification = async (
  taskId: string,
  title: string,
  date: Date
) => {
  try {
    // Ensure date is a proper Date object
    const scheduledTime = date instanceof Date ? new Date(date.getTime()) : new Date(date);
    const currentTime = Date.now();
    const scheduledMs = scheduledTime.getTime();
    
    const timeUntilReminder = scheduledMs - currentTime;
    
    // Don't schedule past notifications (allow 1 second buffer)
    if (timeUntilReminder <= 1000) {
      console.warn(`🔔 [NOTIF] ⚠️ Reminder time is in the past or too close, skipping`);
      return;
    }
    
    // Cancel any existing reminder for this task
    if (scheduledReminders.has(taskId)) {
      clearTimeout(scheduledReminders.get(taskId)!);
    }
    
    // Schedule timeout for Notifee trigger
    const timeoutId = setTimeout(() => {
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
        console.warn("Could not display notification:", (error as any)?.message);
      });
      
      scheduledReminders.delete(taskId);
    }, timeUntilReminder);
    
    scheduledReminders.set(taskId, timeoutId);
  } catch (error) {
    console.warn("Could not schedule reminder:", (error as any)?.message);
  }
};

/**
 * Cancel a scheduled notification
 */
export const cancelTaskNotification = (taskId: string) => {
  if (scheduledReminders.has(taskId)) {
    clearTimeout(scheduledReminders.get(taskId)!);
    scheduledReminders.delete(taskId);
  }
};
