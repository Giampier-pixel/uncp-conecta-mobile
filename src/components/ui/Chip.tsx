import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii, type } from '@/theme/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selected : styles.unselected,
        pressed && { opacity: 0.8 },
      ]}>
      <Text
        style={[
          styles.label,
          { color: selected ? colors.primary : colors.textSecondary },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  selected: {
    backgroundColor: colors.primarySoft,
  },
  unselected: {
    backgroundColor: colors.surfaceElevated,
  },
  label: {
    ...type.bodySm,
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
  },
});
