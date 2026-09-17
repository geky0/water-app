import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Plus, Coffee, GlassWater, Flame } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

interface QuickAddButtonsProps {
  onAdd: (amount: number) => void;
}

const PRESETS = [
  { amount: 200, label: 'Cup', icon: Coffee },
  { amount: 350, label: 'Glass', icon: GlassWater },
  { amount: 500, label: 'Bottle', icon: DropletSmall },
  { amount: 750, label: 'Flask', icon: Flame },
];

function DropletSmall({ color }: { color: string }) {
  return <GlassWater size={18} color={color} />;
}

export const QuickAddButtons: React.FC<QuickAddButtonsProps> = ({ onAdd }) => {
  const { colors, themeId } = useTheme();
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

  const confirmTextColor = themeId === 'monochrome' ? '#000000' : '#FFFFFF';

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>QUICK LOG</Text>

      <View style={styles.buttonRow}>
        {PRESETS.map((item) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={item.amount}
              style={[
                styles.presetButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.surfaceBorder,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => handlePress(item.amount)}
            >
              <View style={[styles.iconWrapper, { backgroundColor: colors.cardBadgeBg }]}>
                <Icon size={18} color={colors.primary} />
              </View>
              <Text style={[styles.amountText, { color: colors.primary }]}>+{item.amount}</Text>
              <Text style={[styles.unitText, { color: colors.textMuted }]}>ml</Text>
              <Text style={[styles.labelText, { color: colors.textSecondary }]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[
            styles.presetButton,
            {
              backgroundColor: colors.surfaceLight,
              borderColor: colors.cardBadgeBorder,
            },
          ]}
          activeOpacity={0.7}
          onPress={() => setCustomVisible(true)}
        >
          <View style={[styles.iconWrapper, { backgroundColor: colors.cardBadgeBg }]}>
            <Plus size={20} color={colors.textPrimary} />
          </View>
          <Text style={[styles.amountText, { color: colors.textPrimary }]}>Custom</Text>
          <Text style={[styles.unitText, { color: colors.textMuted }]}>amount</Text>
          <Text style={[styles.labelText, { color: colors.textSecondary }]}>Special</Text>
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
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.primary }]}>LOG WATER</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Enter intake amount in milliliters
            </Text>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.surfaceBorder,
                },
              ]}
            >
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="300"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={customVal}
                onChangeText={setCustomVal}
                autoFocus
              />
              <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>ml</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: colors.surfaceLight }]}
                onPress={() => setCustomVisible(false)}
              >
                <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
                onPress={handleCustomSubmit}
              >
                <Text style={[styles.confirmText, { color: confirmTextColor }]}>Add Log</Text>
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
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '800',
  },
  unitText: {
    fontSize: 10,
    marginTop: -2,
  },
  labelText: {
    fontSize: 11,
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
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 24,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 24,
    fontWeight: '700',
  },
  inputUnit: {
    fontSize: 16,
    fontWeight: '600',
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
    alignItems: 'center',
  },
  cancelText: {
    fontWeight: '600',
    fontSize: 14,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmText: {
    fontWeight: '800',
    fontSize: 14,
  },
});
