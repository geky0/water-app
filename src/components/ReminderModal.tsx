import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch } from 'react-native';
import { Bell, X, Check, Zap } from 'lucide-react-native';
import { ReminderConfig } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface ReminderModalProps {
  visible: boolean;
  config: ReminderConfig;
  onClose: () => void;
  onSave: (config: ReminderConfig) => void;
  onTestNotification: () => void;
}

const INTERVAL_OPTIONS = [
  { label: 'Every 30 min', value: 30 },
  { label: 'Every 45 min', value: 45 },
  { label: 'Every 1 hour', value: 60 },
  { label: 'Every 1.5 hours', value: 90 },
  { label: 'Every 2 hours', value: 120 },
  { label: 'Every 3 hours', value: 180 },
];

export const ReminderModal: React.FC<ReminderModalProps> = ({
  visible,
  config,
  onClose,
  onSave,
  onTestNotification,
}) => {
  const { colors, themeId } = useTheme();
  const [enabled, setEnabled] = useState(config.enabled);
  const [intervalMinutes, setIntervalMinutes] = useState(config.intervalMinutes);

  const handleSave = () => {
    onSave({
      ...config,
      enabled,
      intervalMinutes,
    });
    onClose();
  };

  const saveBtnTextColor = themeId === 'monochrome' ? '#000000' : '#FFFFFF';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={[styles.iconCircle, { backgroundColor: colors.cardBadgeBg }]}>
                <Bell size={20} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                HYDRATION REMINDERS
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Master Toggle */}
          <View
            style={[
              styles.toggleCard,
              {
                backgroundColor: colors.background,
                borderColor: colors.surfaceBorder,
              },
            ]}
          >
            <View style={styles.toggleInfo}>
              <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>
                Smart Reminders
              </Text>
              <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
                Receive periodic nudges to drink water
              </Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
              trackColor={{ false: '#262626', true: colors.primaryDark }}
              thumbColor={enabled ? colors.primary : '#888'}
            />
          </View>

          {enabled && (
            <View style={styles.intervalSection}>
              <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                REMINDER FREQUENCY
              </Text>
              <View style={styles.optionsGrid}>
                {INTERVAL_OPTIONS.map((opt) => {
                  const selected = intervalMinutes === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.optionCard,
                        {
                          backgroundColor: selected ? colors.cardBadgeBg : colors.background,
                          borderColor: selected ? colors.primary : colors.surfaceBorder,
                        },
                      ]}
                      onPress={() => setIntervalMinutes(opt.value)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          {
                            color: selected ? colors.textPrimary : colors.textSecondary,
                            fontWeight: selected ? '700' : '600',
                          },
                        ]}
                      >
                        {opt.label}
                      </Text>
                      {selected && <Check size={16} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Test Notification Button */}
          <TouchableOpacity
            style={[
              styles.testBtn,
              {
                backgroundColor: colors.cardBadgeBg,
                borderColor: colors.cardBadgeBorder,
              },
            ]}
            onPress={onTestNotification}
          >
            <Zap size={16} color={colors.accent} />
            <Text style={[styles.testBtnText, { color: colors.accent }]}>
              Send Test Notification
            </Text>
          </TouchableOpacity>

          {/* Save Action */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <Text style={[styles.saveBtnText, { color: saveBtnTextColor }]}>
              Save Preferences
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  toggleInfo: {
    flex: 1,
    paddingRight: 10,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  toggleDesc: {
    fontSize: 12,
  },
  intervalSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  optionsGrid: {
    gap: 8,
  },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
