import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../theme/colors';
import { Droplet } from 'lucide-react-native';

interface HydrationRingProps {
  current: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
}

export const HydrationRing: React.FC<HydrationRingProps> = ({
  current,
  goal,
  size = 260,
  strokeWidth = 18,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, Math.round((current / (goal || 1)) * 100)));
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF4D6D" />
            <Stop offset="50%" stopColor="#FF1E44" />
            <Stop offset="100%" stopColor="#9E0B22" />
          </LinearGradient>
        </Defs>

        {/* Background Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.surfaceBorder}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress Arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#redGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Center Information */}
      <View style={styles.centerContent}>
        <View style={styles.iconBadge}>
          <Droplet size={24} color={Colors.primary} fill={Colors.primary} />
        </View>
        <Text style={styles.currentText}>{current.toLocaleString()}</Text>
        <Text style={styles.unitText}>ml</Text>
        <View style={styles.goalRow}>
          <Text style={styles.goalLabel}>Goal: </Text>
          <Text style={styles.goalValue}>{goal.toLocaleString()} ml</Text>
        </View>
        <View style={styles.percentBadge}>
          <Text style={styles.percentText}>{percentage}%</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 20,
  },
  svg: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 30, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 30, 68, 0.3)',
  },
  currentText: {
    fontSize: 44,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: -4,
    marginBottom: 4,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalLabel: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  goalValue: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  percentBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 30, 68, 0.18)',
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent,
  },
});
