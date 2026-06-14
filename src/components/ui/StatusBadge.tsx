import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, statusStyle, type } from '@/theme/theme';
import type { RequestStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: RequestStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyle[status];

  return (
    <View style={[styles.badge, { backgroundColor: style.soft }]}>
      <View style={[styles.dot, { backgroundColor: style.color }]} />
      <Text style={[styles.label, { color: style.color }]}>{style.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    ...type.caption,
    fontFamily: 'Manrope_600SemiBold',
  },
});
