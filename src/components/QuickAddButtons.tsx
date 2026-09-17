import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Plus, Coffee, GlassWater, Flame } from 'lucide-react-native';
import { Colors } from '../theme/colors';

interface QuickAddButtonsProps {
  onAdd: (amount: number) => void;
}

const PRESETS = [
  { amount: 200, label: 'Cup', icon: Coffee },
  { amount: 350, label: 'Glass', icon: GlassWater },
  { amount: 500, label: 'Bottle', icon: DropletSmall },
  { amount: 750, label: 'Flask', icon: Flame },
];

function DropletSmall() {
  return <GlassWater size={18} color={Colors.primary} />;
}

export const QuickAddButtons: React.FC<QuickAddButtonsProps> = ({ onAdd }) => {
  const [customVisible, setCustomVisible] = useState(false);
  const [customVal, setCustomVal] = useState('');

  const handlePress = (amount: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    onAdd(amount);
  };

  const handleCustomSubmit = () => {
    const val = parseInt(customVal, 10);
    if (val > 0) {
      handlePress(val);
      setCustomVal('');
      setCustomVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>QUICK LOG</Text>
      
      <View style={styles.buttonRow}>
        {PRESETS.map((item) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={item.amount}
              style={styles.presetButton}
              activeOpacity={0.7}
              onPress={() => handlePress(item.amount)}
            >
              <View style={styles.iconWrapper}>
                <Icon size={18} color={Colors.primary} />
              </View>
              <Text style={styles.amountText}>+{item.amount}</Text>
              <Text style={styles.unitText}>ml</Text>
              <Text style={styles.labelText}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[styles.presetButton, styles.customButton]}
          activeOpacity={0.7}
          onPress={() => setCustomVisible(true)}
        >
          <View style={[styles.iconWrapper, styles.customIconWrapper]}>
            <Plus size={20} color={Colors.textPrimary} />
          </View>
          <Text style={[styles.amountText, { color: Colors.textPrimary }]}>Custom</Text>
          <Text style={styles.unitText}>amount</Text>
          <Text style={styles.labelText}>Special</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Amount Modal */}
      <Modal
        visible={customVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCustomVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>LOG WATER</Text>
            <Text style={styles.modalSubtitle}>Enter intake amount in milliliters</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="300"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                value={customVal}
                onChangeText={setCustomVal}
                autoFocus
              />
              <Text style={styles.inputUnit}>ml</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setCustomVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleCustomSubmit}
              >
                <Text style={styles.confirmText}>Add Log</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: Colors.textSecondary,
    marginBottom: 12,
    marginLeft: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetButton: {
    flex: 1,
    marginHorizontal: 3,
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  customButton: {
    backgroundColor: Colors.surfaceLight,
    borderColor: '#38161D',
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 30, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  customIconWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  unitText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: -2,
  },
  labelText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    color: Colors.primary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  inputContainer: {
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
  input: {
    flex: 1,
    height: 52,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  inputUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
  },
  cancelText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  confirmText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
