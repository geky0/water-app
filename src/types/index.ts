export interface DrinkLog {
  id: string;
  amount: number; // in milliliters
  timestamp: number; // milliseconds
}

export interface ReminderConfig {
  enabled: boolean;
  intervalMinutes: number; // e.g. 60, 90, 120
  startHour: number; // e.g. 8 (8 AM)
  endHour: number; // e.g. 22 (10 PM)
}

export interface UserStats {
  dailyGoal: number; // in ml
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
}
