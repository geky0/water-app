import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ReminderConfig } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


export const NotificationService = {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch (error) {
      console.warn('Notifications permissions error:', error);
      return false;
    }
  },

  async scheduleReminders(config: ReminderConfig): Promise<void> {
    try {
      // Cancel previous scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (!config.enabled) {
        return;
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return;
      }

      // Schedule interval notifications or time-based repeating notifications
      const reminders = [
        "Time for a sip! Keep that edge sharp.",
        "Hydration check. Fuel your body with water now.",
        "Stay hydrated! Your daily goal is within reach.",
        "Power up with a glass of pure water.",
      ];

      // Schedule daytime triggers between startHour and endHour
      const intervalSec = Math.max(60, config.intervalMinutes * 60);

      // In Expo SDK 52+, timeInterval trigger accepts seconds and repeats flag
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'HydroDark Reminder 💧',
          body: reminders[Math.floor(Math.random() * reminders.length)],
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: intervalSec,
          repeats: true,
        },
      });
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  },

  async sendTestNotification(): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'HydroDark Test 💧',
        body: 'Hydration reminder active! Stay hydrated and energized.',
        sound: true,
      },
      trigger: null, // immediate
    });
  },
};
