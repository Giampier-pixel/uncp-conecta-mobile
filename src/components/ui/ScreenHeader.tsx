import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { colors, radii, space } from '@/theme/theme';

import { AppText } from './AppText';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  right?: React.ReactNode;
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  showBack = true,
  right,
}: ScreenHeaderProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[3],
        minHeight: 48,
        marginTop: space[2],
        marginBottom: space[5],
      }}>
      {showBack ? (
        <Pressable
          onPress={onBack ?? (() => router.back())}
          hitSlop={8}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: radii.pill,
            backgroundColor: colors.surfaceElevated,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.hairline,
            opacity: pressed ? 0.7 : 1,
          })}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
      ) : null}
      <View style={{ flex: 1 }}>
        <AppText variant="h2" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="bodySm" muted numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right ?? null}
    </View>
  );
}
