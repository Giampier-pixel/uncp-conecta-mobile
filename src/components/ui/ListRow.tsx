import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radii, space } from '@/theme/theme';

import { AppText } from './AppText';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface ListRowProps {
  icon?: IoniconName;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}

export function ListRow({ icon, title, subtitle, right, onPress }: ListRowProps) {
  const content = (
    <View style={styles.row}>
      {icon ? (
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
      ) : null}
      <View style={styles.textContainer}>
        <AppText variant="titleLg" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="bodySm" muted numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <View style={styles.rightContainer}>
        {right ?? (
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
        {content}
        <View style={styles.divider} />
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      {content}
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 64,
  },
  pressed: {
    backgroundColor: colors.surfaceHover,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: 64,
    paddingVertical: space[2],
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  rightContainer: {
    flexShrink: 0,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
    marginLeft: 52,
  },
});
