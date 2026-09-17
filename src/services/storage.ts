import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrinkLog, ReminderConfig, UserStats } from '../types';

const STORAGE_KEYS = {
  LOGS_PREFIX: '@hydro_logs_',
  STATS: '@hydro_stats',
  REMINDERS: '@hydro_reminders',
};

export const getTodayKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const StorageService = {
  async getTodayLogs(): Promise<DrinkLog[]> {
    try {
      const key = `${STORAGE_KEYS.LOGS_PREFIX}${getTodayKey()}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading logs:', error);
      return [];
    }
  },

  async addLog(amount: number): Promise<DrinkLog[]> {
    try {
      const todayLogs = await this.getTodayLogs();
      const newLog: DrinkLog = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
        amount,
        timestamp: Date.now(),
      };
      const updated = [newLog, ...todayLogs];
      const key = `${STORAGE_KEYS.LOGS_PREFIX}${getTodayKey()}`;
      await AsyncStorage.setItem(key, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Error saving log:', error);
      return [];
    }
  },

  async deleteLog(id: string): Promise<DrinkLog[]> {
    try {
      const todayLogs = await this.getTodayLogs();
      const updated = todayLogs.filter((log) => log.id !== id);
      const key = `${STORAGE_KEYS.LOGS_PREFIX}${getTodayKey()}`;
      await AsyncStorage.setItem(key, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Error deleting log:', error);
      return [];
    }
  },

  async getStats(): Promise<UserStats> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.STATS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading stats:', error);
    }
    return {
      dailyGoal: 2500,
      streakDays: 1,
      lastActiveDate: getTodayKey(),
    };
  },

  async saveStats(stats: UserStats): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving stats:', error);
    }
  },

  async getReminderConfig(): Promise<ReminderConfig> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.REMINDERS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading reminder config:', error);
    }
    return {
      enabled: true,
      intervalMinutes: 60,
      startHour: 9,
      endHour: 21,
    };
  },

  async saveReminderConfig(config: ReminderConfig): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(config));
    } catch (error) {
      console.error('Error saving reminder config:', error);
    }
  },
};
