import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Bell, Settings, Target, Flame, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors } from './src/theme/colors';
import { DrinkLog, ReminderConfig, UserStats } from './src/types';
import { StorageService } from './src/services/storage';
import { NotificationService } from './src/services/notifications';

import { HydrationRing } from './src/components/HydrationRing';
import { QuickAddButtons } from './src/components/QuickAddButtons';
import { TodayLog } from './src/components/TodayLog';
import { ReminderModal } from './src/components/ReminderModal';

export default function App() {
  const [logs, setLogs] = useState<DrinkLog[]>([]);
  const [stats, setStats] = useState<UserStats>({
    dailyGoal: 2500,
    streakDays: 1,
    lastActiveDate: '',
  });
  const [reminderConfig, setReminderConfig] = useState<ReminderConfig>({
    enabled: true,
    intervalMinutes: 60,
    startHour: 9,
    endHour: 21,
  });

  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [customGoalInput, setCustomGoalInput] = useState('2500');
  const [refreshing, setRefreshing] = useState(false);

  // Load initial data & configure notifications
  const loadData = useCallback(async () => {
    try {
      const [storedLogs, storedStats, storedReminder] = await Promise.all([
        StorageService.getTodayLogs(),
        StorageService.getStats(),
        StorageService.getReminderConfig(),
      ]);
      setLogs(storedLogs);
      setStats(storedStats);
      setCustomGoalInput(storedStats.dailyGoal.toString());
      setReminderConfig(storedReminder);
      await NotificationService.scheduleReminders(storedReminder);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const totalDrankToday = logs.reduce((sum, item) => sum + item.amount, 0);

  const handleAddWater = async (amount: number) => {
    const updated = await StorageService.addLog(amount);
    setLogs(updated);

    // If goal reached for the first time today, trigger haptic celebration
    if (totalDrankToday < stats.dailyGoal && totalDrankToday + amount >= stats.dailyGoal) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }
  };

  const handleDeleteLog = async (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const updated = await StorageService.deleteLog(id);
    setLogs(updated);
  };

  const handleSaveReminderConfig = async (newConfig: ReminderConfig) => {
    setReminderConfig(newConfig);
    await StorageService.saveReminderConfig(newConfig);
    await NotificationService.scheduleReminders(newConfig);
  };

  const handleTestNotification = async () => {
    await NotificationService.sendTestNotification();
    Alert.alert('Notification Dispatched', 'Check your notifications dropdown for the HydroDark alert!');
  };

  const handleSaveGoal = async () => {
    const parsed = parseInt(customGoalInput, 10);
    if (parsed && parsed >= 500 && parsed <= 10000) {
      const newStats = { ...stats, dailyGoal: parsed };
      setStats(newStats);
      await StorageService.saveStats(newStats);
      setGoalModalVisible(false);
    } else {
      Alert.alert('Invalid Goal', 'Please enter an amount between 500 ml and 10,000 ml.');
    }
  };

  const handleResetDay = () => {
    Alert.alert(
      'Reset Today\'s Log',
      'Are you sure you want to clear all water logged today?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            for (const log of logs) {
              await StorageService.deleteLog(log.id);
            }
            setLogs([]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="light" />
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* App Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brandTitle}>
            HYDRO<Text style={styles.brandTitleRed}>DARK</Text>
          </Text>
          <Text style={styles.brandSubtitle}>Precision Hydration</Text>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.circleActionBtn}
            onPress={() => setGoalModalVisible(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Target size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.circleActionBtn,
              reminderConfig.enabled && styles.activeReminderBtn,
            ]}
            onPress={() => setReminderModalVisible(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Bell
              size={18}
              color={reminderConfig.enabled ? Colors.primary : Colors.textSecondary}
            />
            {reminderConfig.enabled && <View style={styles.activeDot} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Streak & Status Banner */}
        <View style={styles.statusRow}>
          <View style={styles.statusCard}>
            <Flame size={18} color={Colors.primary} />
            <Text style={styles.statusLabel}>STREAK</Text>
            <Text style={styles.statusValue}>{stats.streakDays} Day</Text>
          </View>
          <View style={styles.statusCard}>
            <Target size={18} color={Colors.accent} />
            <Text style={styles.statusLabel}>TARGET</Text>
            <Text style={styles.statusValue}>{stats.dailyGoal} ml</Text>
          </View>
          <TouchableOpacity
            style={styles.statusCard}
            onPress={handleResetDay}
            activeOpacity={0.7}
          >
            <RotateCcw size={18} color={Colors.textMuted} />
            <Text style={styles.statusLabel}>ACTION</Text>
            <Text style={[styles.statusValue, { color: Colors.textMuted }]}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Circular Progress Gauge */}
        <HydrationRing current={totalDrankToday} goal={stats.dailyGoal} />

        {/* Quick Add Presets */}
        <QuickAddButtons onAdd={handleAddWater} />

        {/* Logs */}
        <TodayLog logs={logs} onDelete={handleDeleteLog} />
      </ScrollView>

      {/* Reminder Config Modal */}
      <ReminderModal
        visible={reminderModalVisible}
        config={reminderConfig}
        onClose={() => setReminderModalVisible(false)}
        onSave={handleSaveReminderConfig}
        onTestNotification={handleTestNotification}
      />

      {/* Goal Edit Modal */}
      <Modal
        visible={goalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <View style={styles.goalModalOverlay}>
          <View style={styles.goalModalCard}>
            <Text style={styles.goalModalTitle}>DAILY TARGET</Text>
            <Text style={styles.goalModalSubtitle}>Set your daily water consumption goal</Text>

            <View style={styles.goalInputRow}>
              <TextInput
                style={styles.goalInput}
                keyboardType="numeric"
                value={customGoalInput}
                onChangeText={setCustomGoalInput}
                autoFocus
              />
              <Text style={styles.goalUnit}>ml</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setGoalModalVisible(false)}
              >
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveModalBtn}
                onPress={handleSaveGoal}
              >
                <Text style={styles.saveModalText}>Save Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    backgroundColor: Colors.background,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    color: Colors.textPrimary,
  },
  brandTitleRed: {
    color: Colors.primary,
  },
  brandSubtitle: {
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circleActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  activeReminderBtn: {
    borderColor: 'rgba(255, 30, 68, 0.4)',
    backgroundColor: 'rgba(255, 30, 68, 0.08)',
  },
  activeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  statusCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
    marginTop: 4,
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  goalModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  goalModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
  },
  goalModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    color: Colors.primary,
    marginBottom: 4,
  },
  goalModalSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  goalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 24,
  },
  goalInput: {
    flex: 1,
    height: 52,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  goalUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
  },
  cancelModalText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  saveModalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveModalText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

