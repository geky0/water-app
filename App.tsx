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
import { Bell, Target, Flame, RotateCcw, Palette, Sparkles, Download } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { DrinkLog, ReminderConfig, UserStats } from './src/types';
import { StorageService } from './src/services/storage';
import { NotificationService } from './src/services/notifications';
import { UpdateService, UpdateInfo } from './src/services/update';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

import { HydrationRing } from './src/components/HydrationRing';
import { QuickAddButtons } from './src/components/QuickAddButtons';
import { TodayLog } from './src/components/TodayLog';
import { ReminderModal } from './src/components/ReminderModal';
import { ThemeModal } from './src/components/ThemeModal';

function MainScreen() {
  const { colors, themeId } = useTheme();

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
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [customGoalInput, setCustomGoalInput] = useState('2500');
  const [refreshing, setRefreshing] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

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

    // Auto-check for updates on app startup
    (async () => {
      try {
        const info = await UpdateService.checkForUpdate();
        if (info && info.hasUpdate) {
          setUpdateInfo(info);
        }
      } catch (e) {
        console.error('Update check failed:', e);
      }
    })();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    try {
      const info = await UpdateService.checkForUpdate();
      if (info && info.hasUpdate) {
        setUpdateInfo(info);
      }
    } catch {}
    setRefreshing(false);
  };

  const totalDrankToday = logs.reduce((sum, item) => sum + item.amount, 0);

  const handleAddWater = async (amount: number) => {
    const updated = await StorageService.addLog(amount);
    setLogs(updated);

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

  const saveBtnTextColor = themeId === 'monochrome' ? '#000000' : '#FFFFFF';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ExpoStatusBar style="light" />
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* App Header */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.surfaceBorder,
          },
        ]}
      >
        <View>
          <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
            HYDRO
            <Text style={{ color: colors.primary }}>DARK</Text>
          </Text>
          <Text style={[styles.brandSubtitle, { color: colors.textMuted }]}>
            Precision Hydration
          </Text>
        </View>

        <View style={styles.headerButtons}>
          {/* Appearance / Theme Selector */}
          <TouchableOpacity
            style={[
              styles.circleActionBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              },
            ]}
            onPress={() => setThemeModalVisible(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Palette size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Daily Target Goal */}
          <TouchableOpacity
            style={[
              styles.circleActionBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              },
            ]}
            onPress={() => setGoalModalVisible(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Target size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Smart Reminders */}
          <TouchableOpacity
            style={[
              styles.circleActionBtn,
              {
                backgroundColor: colors.surface,
                borderColor: reminderConfig.enabled ? colors.cardBadgeBorder : colors.surfaceBorder,
              },
              reminderConfig.enabled && {
                backgroundColor: colors.cardBadgeBg,
              },
            ]}
            onPress={() => setReminderModalVisible(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Bell
              size={18}
              color={reminderConfig.enabled ? colors.primary : colors.textSecondary}
            />
            {reminderConfig.enabled && (
              <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* In-App Auto Update Banner if new release available */}
      {updateInfo?.hasUpdate && (
        <TouchableOpacity
          style={[
            styles.updateBanner,
            {
              backgroundColor: colors.cardBadgeBg,
              borderColor: colors.primary,
            },
          ]}
          onPress={() => setThemeModalVisible(true)}
          activeOpacity={0.85}
        >
          <View style={styles.updateBannerLeft}>
            <Sparkles size={16} color={colors.primary} />
            <Text style={[styles.updateBannerText, { color: colors.textPrimary }]}>
              New Version Available: v{updateInfo.latestVersion}
            </Text>
          </View>
          <View style={[styles.updateBannerBadge, { backgroundColor: colors.primary }]}>
            <Download size={12} color="#000000" />
            <Text style={styles.updateBannerBadgeText}>UPDATE</Text>
          </View>
        </TouchableOpacity>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Streak & Status Banner */}
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              },
            ]}
          >
            <Flame size={18} color={colors.primary} />
            <Text style={[styles.statusLabel, { color: colors.textMuted }]}>STREAK</Text>
            <Text style={[styles.statusValue, { color: colors.textPrimary }]}>
              {stats.streakDays} Day
            </Text>
          </View>

          <View
            style={[
              styles.statusCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              },
            ]}
          >
            <Target size={18} color={colors.accent} />
            <Text style={[styles.statusLabel, { color: colors.textMuted }]}>TARGET</Text>
            <Text style={[styles.statusValue, { color: colors.textPrimary }]}>
              {stats.dailyGoal} ml
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.statusCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              },
            ]}
            onPress={handleResetDay}
            activeOpacity={0.7}
          >
            <RotateCcw size={18} color={colors.textMuted} />
            <Text style={[styles.statusLabel, { color: colors.textMuted }]}>ACTION</Text>
            <Text style={[styles.statusValue, { color: colors.textMuted }]}>Reset</Text>
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

      {/* Appearance & Themes Modal */}
      <ThemeModal
        visible={themeModalVisible}
        onClose={() => setThemeModalVisible(false)}
      />

      {/* Goal Edit Modal */}
      <Modal
        visible={goalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <View style={styles.goalModalOverlay}>
          <View
            style={[
              styles.goalModalCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              },
            ]}
          >
            <Text style={[styles.goalModalTitle, { color: colors.primary }]}>
              DAILY TARGET
            </Text>
            <Text style={[styles.goalModalSubtitle, { color: colors.textSecondary }]}>
              Set your daily water consumption goal
            </Text>

            <View
              style={[
                styles.goalInputRow,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.surfaceBorder,
                },
              ]}
            >
              <TextInput
                style={[styles.goalInput, { color: colors.textPrimary }]}
                keyboardType="numeric"
                value={customGoalInput}
                onChangeText={setCustomGoalInput}
                autoFocus
              />
              <Text style={[styles.goalUnit, { color: colors.textSecondary }]}>ml</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.cancelModalBtn, { backgroundColor: colors.surfaceLight }]}
                onPress={() => setGoalModalVisible(false)}
              >
                <Text style={[styles.cancelModalText, { color: colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveModalBtn, { backgroundColor: colors.primary }]}
                onPress={handleSaveGoal}
              >
                <Text style={[styles.saveModalText, { color: saveBtnTextColor }]}>
                  Save Goal
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainScreen />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 11,
    letterSpacing: 1.5,
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  activeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  updateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  updateBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  updateBannerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  updateBannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  updateBannerBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
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
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 4,
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '800',
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
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  goalModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  goalModalSubtitle: {
    fontSize: 13,
    marginBottom: 20,
  },
  goalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 24,
  },
  goalInput: {
    flex: 1,
    height: 52,
    fontSize: 24,
    fontWeight: '700',
  },
  goalUnit: {
    fontSize: 16,
    fontWeight: '600',
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
    alignItems: 'center',
  },
  cancelModalText: {
    fontWeight: '600',
    fontSize: 14,
  },
  saveModalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveModalText: {
    fontWeight: '800',
    fontSize: 14,
  },
});
