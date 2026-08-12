import notifee, { AndroidImportance, TriggerType, type TimestampTrigger } from "@notifee/react-native";
import { logger } from "../utils/logger";

const REMINDER_CHANNEL_ID = "task-reminders";

export const initNotifications = async () => {
  try {
    await notifee.requestPermission();

    await notifee.createChannel({
      id: REMINDER_CHANNEL_ID,
      name: "Task Reminders",
      importance: AndroidImportance.HIGH,
      sound: "default",
      vibration: true,
      lights: true,
    });
  } catch (error) {
    logger.warn("Notifee initialization error:", (error as Error)?.message);
  }
};

// Real OS-level scheduling (AlarmManager / UNCalendarNotificationTrigger) — survives app kill,
// unlike a JS setTimeout which only fires while the JS engine is alive.
export const scheduleTaskNotification = async (taskId: string, title: string, date: Date) => {
  try {
    const timestamp = date.getTime();

    if (timestamp - Date.now() <= 1000) {
      logger.warn("Reminder time is in the past or too close, skipping");
      return;
    }

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp,
    };

    await notifee.createTriggerNotification(
      {
        id: taskId,
        title: "⏰ Task Reminder",
        body: title,
        android: {
          channelId: REMINDER_CHANNEL_ID,
          sound: "default",
          pressAction: { id: "default" },
        },
        ios: {
          sound: "default",
        },
      },
      trigger,
    );
  } catch (error) {
    logger.warn("Could not schedule reminder:", (error as Error)?.message);
  }
};

export const cancelTaskNotification = async (taskId: string) => {
  try {
    await notifee.cancelTriggerNotification(taskId);
  } catch (error) {
    logger.warn("Could not cancel reminder:", (error as Error)?.message);
  }
};
