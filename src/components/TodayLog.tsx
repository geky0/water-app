import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Trash2, Clock } from 'lucide-react-native';
import { DrinkLog } from '../types';
import { Colors } from '../theme/colors';

interface TodayLogProps {
  logs: DrinkLog[];
  onDelete: (id: string) => void;
}

export const TodayLog: React.FC<TodayLogProps> = ({ logs, onDelete }) => {
  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  if (logs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.sectionTitle}>TODAY'S ACTIVITY</Text>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No water logged yet today.</Text>
          <Text style={styles.emptySubtext}>Tap a button above to record your intake.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>TODAY'S ACTIVITY</Text>
        <Text style={styles.countBadge}>{logs.length} entries</Text>
      </View>

      <View style={styles.listWrapper}>
        {logs.map((item) => (
          <View key={item.id} style={styles.logCard}>
            <View style={styles.leftInfo}>
              <View style={styles.dotIndicator} />
              <View>
                <Text style={styles.amountText}>+{item.amount} ml</Text>
                <View style={styles.timeRow}>
                  <Clock size={12} color={Colors.textMuted} />
                  <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => onDelete(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Trash2 size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  emptyContainer: {
    marginVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: Colors.textSecondary,
    marginLeft: 4,
    marginBottom: 8,
  },
  countBadge: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  listWrapper: {
    gap: 8,
  },
  logCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 8,
  },
});
