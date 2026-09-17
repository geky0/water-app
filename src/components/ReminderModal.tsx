import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch } from 'react-native';
import { Bell, BellOff, X, Check, Zap } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { ReminderConfig } from '../types';

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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                <Bell size={20} color={Colors.primary} />
              </View>
              <Text style={styles.title}>HYDRATION REMINDERS</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Master Toggle */}
          <View style={styles.toggleCard}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Smart Reminders</Text>
              <Text style={styles.toggleDesc}>Receive periodic nudges to drink water</Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
              trackColor={{ false: '#262626', true: Colors.primaryDark }}
              thumbColor={enabled ? Colors.primary : '#888'}
            />
          </View>

          {enabled && (
            <View style={styles.intervalSection}>
              <Text style={styles.sectionHeading}>REMINDER FREQUENCY</Text>
              <View style={styles.optionsGrid}>
                {INTERVAL_OPTIONS.map((opt) => {
                  const selected = intervalMinutes === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.optionCard, selected && styles.optionSelected]}
                      onPress={() => setIntervalMinutes(opt.value)}
                    >
                      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                        {opt.label}
                      </Text>
                      {selected && <Check size={16} color={Colors.primary} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Test Notification Button */}
          <TouchableOpacity
            style={styles.testBtn}
            onPress={onTestNotification}
          >
            <Zap size={16} color={Colors.accent} />
            <Text style={styles.testBtnText}>Send Test Notification</Text>
          </TouchableOpacity>

          {/* Save Action */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Preferences</Text>
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
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: Colors.surfaceBorder,
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
    backgroundColor: 'rgba(255, 30, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    color: Colors.textPrimary,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 20,
  },
  toggleInfo: {
    flex: 1,
    paddingRight: 10,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  toggleDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  intervalSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  optionsGrid: {
    gap: 8,
  },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(255, 30, 68, 0.08)',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  optionTextSelected: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 77, 109, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 109, 0.3)',
    marginBottom: 12,
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accent,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 1,
  },
});
