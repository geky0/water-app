import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Droplet, Flame, Zap, GlassWater, Shield } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

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
  const { colors, ringIcon } = useTheme();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, Math.round((current / (goal || 1)) * 100)));
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  const renderCenterIcon = () => {
    const iconProps = { size: 24, color: colors.primary };
    switch (ringIcon) {
      case 'flame':
        return <Flame {...iconProps} fill={colors.primary} />;
      case 'zap':
        return <Zap {...iconProps} fill={colors.primary} />;
      case 'glass':
        return <GlassWater {...iconProps} />;
      case 'shield':
        return <Shield {...iconProps} fill={colors.primary} />;
      case 'droplet':
      default:
        return <Droplet {...iconProps} fill={colors.primary} />;
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="themeRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.ringGradient[0]} />
            <Stop offset="50%" stopColor={colors.ringGradient[1]} />
            <Stop offset="100%" stopColor={colors.ringGradient[2]} />
          </LinearGradient>
        </Defs>

        {/* Background Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.surfaceBorder}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress Arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#themeRingGradient)"
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
        <View
          style={[
            styles.iconBadge,
            {
              backgroundColor: colors.cardBadgeBg,
              borderColor: colors.cardBadgeBorder,
            },
          ]}
        >
          {renderCenterIcon()}
        </View>
        <Text style={[styles.currentText, { color: colors.textPrimary }]}>
          {current.toLocaleString()}
        </Text>
        <Text style={[styles.unitText, { color: colors.textSecondary }]}>ml</Text>
        <View style={styles.goalRow}>
          <Text style={[styles.goalLabel, { color: colors.textMuted }]}>Goal: </Text>
          <Text style={[styles.goalValue, { color: colors.textSecondary }]}>
            {goal.toLocaleString()} ml
          </Text>
        </View>
        <View
          style={[
            styles.percentBadge,
            {
              backgroundColor: colors.cardBadgeBg,
              borderColor: colors.primaryDark,
            },
          ]}
        >
          <Text style={[styles.percentText, { color: colors.accent }]}>{percentage}%</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
  },
  currentText: {
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -1,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
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
  },
  goalValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  percentBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
